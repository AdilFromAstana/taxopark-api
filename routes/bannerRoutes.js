const express = require("express");
const bannerController = require("../controllers/bannerController");

const router = express.Router();

router.post("/uploadImage/:id", bannerController.uploadImage);
router.get("/", bannerController.getAllBanners);
router.post("/", bannerController.createBanner);
router.put("/update/:id", bannerController.updateBanner);
router.put("/:id/status", bannerController.updateBannerStatus);
router.delete("/:id", bannerController.deleteImage);
router.put("/updatePriorities", bannerController.updatePriorities);

module.exports = router;
