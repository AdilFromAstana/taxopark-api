const Router = require("express");
const router = new Router();
const commissionController = require("../controllers/comissionController");

router.post("/", commissionController.createCommission);
router.get("/:id", commissionController.getCommissionById);
router.get("/", commissionController.getAllCommissions);
router.put("/update/:id", commissionController.updateCommission);

module.exports = router;
