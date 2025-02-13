const Router = require("express");
const promotionController = require("../controllers/promotionController");
const router = new Router();

router.post("/", promotionController.createPromotion);
router.get("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.getPromotionById);
router.put("/:id", promotionController.updatePromotion);
router.delete("/:id", promotionController.deletePromotion);

module.exports = router;
