const Router = require("express");
const router = new Router();
const PromotionController = require("../controllers/PromotionController");

router.post("/", PromotionController.createPromotion);
router.get("/", PromotionController.getAllPromotions);
router.get("/:id", PromotionController.getPromotionById);
router.put("/:id", PromotionController.updatePromotion);
router.delete("/:id", PromotionController.deletePromotion);

module.exports = router;
