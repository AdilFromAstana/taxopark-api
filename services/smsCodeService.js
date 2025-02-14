const SmsCode = require("../models/SmsCode");
const Form = require("../models/Form");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { Op } = require("sequelize");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

class SmsService {
  // 📌 Отправка OTP
  async sendOtp(formId) {
    const form = await Form.findByPk(formId);
    if (!form) {
      throw new Error("Заявка не найдена");
    }

    const otpCode = generateOTP();
    const expiresAt = moment().add(1, "minute").toDate();

    const sms = await SmsCode.create({
      id: uuidv4(),
      formId,
      otpCode,
      expiresAt,
    });

    return sms;
  }

  // 📌 Подтверждение OTP
  async verifyOtp(formId, otpCode) {
    const smsCode = await SmsCode.findOne({
      where: {
        formId,
        otpCode,
        isVerified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!smsCode) {
      throw new Error("Неверный или просроченный код");
    }

    await smsCode.update({ isVerified: true });
    await Form.update({ statusCode: "confirmed" }, { where: { id: formId } });

    return { message: "Заявка подтверждена!" };
  }
}

module.exports = new SmsService();
