const Router = require("express");
const router = new Router();
const parkController = require("../controllers/parkController");

router.post("/create", parkController.createPark);
router.get("/getById/:id", parkController.getParkById);
router.get("/", parkController.getAllParks);
router.put("/update/:id", parkController.updatePark);
router.post("/uploadImage/:id", parkController.uploadImage);
router.delete("/deleteImage/:id", parkController.deleteImage);

module.exports = router;
