const express = require("express");
const { sendOtp, verifyOtp, resendOtp } = require("../controllers/smsCodeController");

const router = express.Router();

router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/resendOtp", resendOtp);

module.exports = router;
