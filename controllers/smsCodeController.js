const smsCodeService = require("../services/smsCodeService");

exports.sendOtp = async (req, res) => {
  try {
    const { formId } = req.body;
    const response = await smsCodeService.sendOtp(formId);
    res.json(response);
  } catch (error) {
    console.error("Ошибка при отправке OTP:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { formId, otpCode } = req.body;
    const response = await smsCodeService.verifyOtp(formId, otpCode);
    res.json(response);
  } catch (error) {
    console.error("Ошибка при подтверждении OTP:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { smsCodeId } = req.body;
    const response = await smsCodeService.resendOtp(smsCodeId);
    res.json(response);
  } catch (error) {
    console.error("Ошибка при переотправки OTP:", error);
    res.status(400).json({ message: error.message });
  }
};
