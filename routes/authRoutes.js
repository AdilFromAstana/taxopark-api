const express = require("express");
const authController = require("../controllers/authContoller");

const router = express.Router();

router.get("/loginInstagram", authController.loginInstagram);
router.get("/callback", authController.callback);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/registration", authController.registration);
router.post("/update-instagram-token", authController.updateInstagramToken);

module.exports = router;
