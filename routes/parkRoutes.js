const Router = require("express");
const router = new Router();
const parkController = require("../controllers/parkController");

router.post("/", parkController.createPark);
router.get("/:id", parkController.getParkById);
router.get("/", parkController.getAllParks);
router.put("/:id", parkController.updatePark);

module.exports = router;
