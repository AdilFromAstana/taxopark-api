const parkService = require("../services/parkService");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Park } = require("../models");
const fs = require("fs");

const allowedMimeTypes = ["image/png", "image/jpeg", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // Ограничение размера файла: 8 MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Разрешённый файл
    } else {
      cb(
        new Error(
          "Недопустимый формат файла. Разрешены только PNG, JPEG, GIF."
        ),
        false
      );
    }
  },
});

class ParkController {
  async createPark(req, res) {
    try {
      const data = req.body;
      if (!data.title || !data.cityId) {
        return res
          .status(400)
          .json({ message: "Название и идентификатор города обязательны." });
      }
      const park = await parkService.createPark(data);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getParkById(req, res) {
    try {
      const { id } = req.params;
      const park = await parkService.getParkById(id);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllParks(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;
      const cityId = req.query.cityId;
      const title = req.query.title;
      const active = req.query.active;
      const filteredCity = req.query.filteredCity;
      const supportAlwaysAvailable = req.query.supportAlwaysAvailable;
      const filteredYandexGasStation = req.query.filteredYandexGasStation;
      const parkPromotions = req.query.parkPromotions
        ? req.query.parkPromotions.split(",").map(Number)
        : [];

      const parks = await parkService.getAllParks({
        limit,
        page,
        sortField,
        sortOrder,
        cityId,
        parkPromotions,
        title,
        filteredCity,
        filteredYandexGasStation,
        supportAlwaysAvailable,
        active,
      });
      return res.status(200).json(parks);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async uploadImage(req, res) {
    try {
      upload.single("file")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
          return res.status(400).json({ message: "Файл не загружен." });
        }

        const uniqueFilename = req.file.filename; // Берем название файла из Multer
        if (!req.params.id) {
          return res.status(400).json({ message: "ID парка не передан." });
        }

        const park = await Park.findByPk(req.params.id);
        if (!park) {
          return res.status(404).json({ message: "Парк не найден." });
        }

        park.imageUrl = uniqueFilename;
        await park.save();

        return res.status(200).json(uniqueFilename);
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: "Файл не найден." });
      }
      const park = await parkService.deleteImage(req.params.id);

      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updatePark(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const park = await parkService.updatePark(id, data);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getByName(req, res) {
    try {
      const { title } = req.query; // Используем query-параметр вместо req.params
      console.log("title: ", title);

      if (!title) {
        return res.status(400).json({ message: "Название парка не указано." });
      }

      const parks = await parkService.getByName(title);

      return res.status(200).json(parks);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ParkController();
