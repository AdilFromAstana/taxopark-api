const Router = require("express");
const router = new Router();
const cityController = require("../controllers/cityController");

router.post("/", cityController.createCity);
router.put("/update/:id", cityController.updateCity);
router.get("/:id", cityController.getCityById);
router.get("/", cityController.getAllCities);
router.put("/:id", cityController.updateCity);

module.exports = router;
