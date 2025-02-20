const SmsCode = require("../models/SmsCode");
const Form = require("../models/Form");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { FormStatusHistory } = require("../models");
const { sendEmail } = require("./emailService");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
const SMS_API_URL = "http://kazinfoteh.org:9507/api?action=sendmessage";
const SMS_USERNAME = "vsetaxi12"; // vsetaxi1
const SMS_PASSWORD = "outO9JHNE1"; //outO9JHNE
const SMS_ORIGINATOR = "KiT_Notify";
const REPORT_URL = "https://vashserver.kz/sms";

class SmsService {
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.length !== 11 || cleaned[0] !== "7") {
      throw new Error(
        "Некорректный номер телефона. Убедитесь, что номер начинается с +7 и состоит из 11 цифр."
      );
    }

    const formatted = `+7-(${cleaned.slice(1, 4)})-${cleaned.slice(
      4,
      7
    )}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    return formatted;
  }

  async sendOtp(formId, phoneNumber) {
    const form = await Form.findByPk(formId);
    if (!form) {
      throw new Error("Заявка не найдена");
    }

    const otpCode = generateOTP();
    const smsUrl =
      `${SMS_API_URL}&username=${SMS_USERNAME}&password=${SMS_PASSWORD}` +
      `&recipient=${phoneNumber}` +
      `&messagetype=SMS:TEXT` +
      `&originator=${SMS_ORIGINATOR}` +
      `&messagedata=Ваш код: ${otpCode}` +
      `&reporturl=${REPORT_URL}?formId=${formId}&phone=${phoneNumber}`;

    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      // const response = await fetch(smsUrl, requestOptions);
      // const result = await response.text();
      const result = "<statuscode>0</statuscode>";

      console.log("SMS API Response:", result);

      // Проверяем, есть ли <statuscode>0</statuscode> в ответе (успех)
      if (result.includes("<statuscode>0</statuscode>")) {
        const expiresAt = moment().add(1, "minute").toDate();

        // Создаем запись в базе только после успешной отправки
        const sms = await SmsCode.create({
          id: uuidv4(),
          formId,
          otpCode,
          expiresAt,
        });

        await FormStatusHistory.create({
          formId: formId,
          newStatusCode: "sms_sent",
        });

        return { success: true, message: "OTP отправлен", otpCode };
      } else {
        await FormStatusHistory.create({
          formId: formId,
          newStatusCode: "sms_error",
        });

        throw new Error("Ошибка отправки SMS: некорректный ответ API");
      }
    } catch (error) {
      console.error("Ошибка при отправке SMS:", error);
      throw new Error("Ошибка отправки SMS");
    }
  }

  async verifyOtp(formId, otpCode) {
    const smsCode = await SmsCode.findOne({
      where: {
        formId,
        otpCode,
        isVerified: false,
      },
    });

    if (!smsCode) {
      throw new Error("Неверный или просроченный код");
    }

    const form = await Form.findByPk(formId);
    form.statusCode = "sms_confirmed";
    await form.save();
    await smsCode.update({ isVerified: true });
    await FormStatusHistory.create({
      formId: formId,
      newStatusCode: "sms_confirmed",
    });
    await sendEmail({
      formId: formId,
      to: form.email || "adilfirstus@gmail.com",
      name: form.name,
      site: process.env.CLIENT_URL,
      createdAt: moment(form.createdAt).format("DD.MM.YYYY HH:mm"),
      phoneNumber: this.formatPhoneNumber(form.phoneNumber),
      additionalInfo: "",
    });
    return { message: "Заявка подтверждена!" };
  }
}

module.exports = new SmsService();
