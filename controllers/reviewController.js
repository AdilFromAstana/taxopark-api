const reviewService = require("../services/reviewService");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { Review } = require("../models");

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

class ReviewController {
  async createReview(req, res) {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res
          .status(400)
          .json({ message: "Все обязательные поля должны быть заполнены." });
      }

      const review = await reviewService.createReview({
        name,
        description,
      });
      return res.status(201).json(review);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);
      return res.status(200).json(review);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllReviews(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;
      const reviewId = req.query.reviewId;
      const name = req.query.name;

      const reviews = await reviewService.getAllReviews({
        limit,
        page,
        sortOrder,
        sortField,
        reviewId,
        name,
      });
      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const review = await reviewService.updateReview(id, data);
      return res.status(200).json(review);
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

        const review = await Review.findByPk(req.params.id);
        if (!review) {
          return res.status(404).json({ message: "Парк не найден." });
        }

        review.imageUrl = uniqueFilename;
        await review.save();

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
      const park = await reviewService.deleteImage(req.params.id);

      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      await reviewService.deleteReview(id);
      return res.status(200).json({ message: "Объявление успешно удалена." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReviewController();
