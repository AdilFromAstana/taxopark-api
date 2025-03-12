const express = require("express");
const authController = require("../controllers/authContoller");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authController.getProfile);
router.get("/getUsers", authController.getAllUsers);
router.put("/update/:id", authController.updateUser);
router.post("/reset-password/:id", authController.resetPassword);

module.exports = router;
