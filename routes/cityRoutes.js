const Router = require("express");
const router = new Router();
const cityController = require("../controllers/cityController");

router.post("/", cityController.createCity);
router.get("/:id", cityController.getCityById);
router.get("/", cityController.getAllCities);
router.put("/update/:id", cityController.updateCity);

module.exports = router;
