const Router = require("express");
const router = new Router();
const formController = require("../controllers/formController");

router.post("/", formController.createForm);
router.get("/:id", formController.getFormById);
router.get("/:id/statusHistory", formController.getStatusHistoryById);
router.get("/:id/getAvailableStatusesById", formController.getAvailableStatusesById);
router.get("/", formController.getAllForms);
router.put("/update/:id", formController.updateForm);
router.put("/update/:id/status", formController.updateFormStatus);

module.exports = router;
