const promotionService = require("../services/promotionService");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { Promotion } = require("../models");

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

class PromotionController {
  async createPromotion(req, res) {
    try {
      const { title, description, expires, parkId } = req.body;
      if (!title || !description || !parkId) {
        return res
          .status(400)
          .json({ message: "Все обязательные поля должны быть заполнены." });
      }

      const promotion = await promotionService.createPromotion({
        title,
        description,
        expires,
        parkId,
      });
      return res.status(201).json(promotion);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getPromotionById(req, res) {
    try {
      const { id } = req.params;
      const promotion = await promotionService.getPromotionById(id);
      return res.status(200).json(promotion);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllPromotions(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;
      const parkId = req.query.parkId;
      const title = req.query.title;
      const active = req.query.active;

      const promotions = await promotionService.getAllPromotions({
        limit,
        page,
        sortOrder,
        sortField,
        parkId,
        title,
        active
      });
      return res.status(200).json(promotions);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const promotion = await promotionService.updatePromotion(id, data);
      return res.status(200).json(promotion);
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

        const promotion = await Promotion.findByPk(req.params.id);
        if (!promotion) {
          return res.status(404).json({ message: "Парк не найден." });
        }

        promotion.imageUrl = uniqueFilename;
        await promotion.save();

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
      const park = await promotionService.deleteImage(req.params.id);

      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      await promotionService.deletePromotion(id);
      return res.status(200).json({ message: "Акция успешно удалена." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PromotionController();
