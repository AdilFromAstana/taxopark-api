const Router = require("express");
const router = new Router();
const formController = require("../controllers/formController");

router.post("/", formController.createForm);
router.get("/:id", formController.getFormById);
router.get("/", formController.getAllForms);
router.put("/:id", formController.updateForm);

module.exports = router;
