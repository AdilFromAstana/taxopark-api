const Router = require("express");
const reviewController = require("../controllers/reviewController");
const router = new Router();

router.post("/", reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/update/:id", reviewController.updateReview);
router.post("/uploadImage/:id", reviewController.uploadImage);
router.delete("/deleteImage/:id", reviewController.deleteImage);
router.delete("/:id", reviewController.deleteReview);
router.put("/updatePriorities", reviewController.updatePriorities);

module.exports = router;
