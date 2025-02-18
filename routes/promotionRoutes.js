const Router = require("express");
const promotionController = require("../controllers/promotionController");
const router = new Router();

router.post("/", promotionController.createPromotion);
router.get("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/update/:id", promotionController.updatePromotion);
router.post("/uploadImage/:id", promotionController.uploadImage);
router.delete("/deleteImage/:id", promotionController.deleteImage);
router.delete("/:id", promotionController.deletePromotion);

module.exports = router;
