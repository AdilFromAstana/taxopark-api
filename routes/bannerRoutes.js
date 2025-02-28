const express = require("express");
const bannerController = require("../controllers/bannerController");

const router = express.Router();

router.post("/uploadImage/:id", bannerController.uploadImage); // Загрузка изображения
router.get("/", bannerController.getAllBanners); // Создание нового баннера
router.post("/", bannerController.createBanner); // Создание нового баннера
router.put("/:id/status", bannerController.updateBannerStatus); // Архивирование/Активация баннера
router.delete("/:id", bannerController.deleteImage); // Удаление баннера

module.exports = router;
