const bannerService = require("../services/bannerService");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Banner } = require("../models");
const fs = require("fs");

const allowedMimeTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];

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

class BannerController {
  async getAllBanners(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;

      const banners = await bannerService.getAllBanners({
        limit,
        page,
      });
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createBanner(req, res) {
    try {
      upload.single("file")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
          return res
            .status(400)
            .json({ message: "Файл изображения не загружен." });
        }

        const newBanner = await Banner.create({
          bannerUrl: req.file.filename, // Сохраняем имя файла
        });

        return res.status(201).json(newBanner);
      });
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

        const banner = await Banner.findByPk(req.params.id);
        if (!banner) {
          return res.status(404).json({ message: "Парк не найден." });
        }

        banner.bannerUrl = uniqueFilename;
        await banner.save();

        return res.status(200).json(uniqueFilename);
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateBannerStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body; // Ожидаем `true` или `false`

      if (isActive === undefined) {
        return res
          .status(400)
          .json({ message: "Статус (isActive) обязателен." });
      }

      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ message: "Баннер не найден." });
      }

      banner.isActive = isActive; // Обновляем статус
      await banner.save();

      return res
        .status(200)
        .json({ message: "Статус баннера обновлен.", banner });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: "Файл не найден." });
      }
      console.log("req.params: ", req.params);
      const banner = await bannerService.deleteBanner(req.params.id);

      return res.status(200).json(banner);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BannerController();
