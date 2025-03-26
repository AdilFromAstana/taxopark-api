const nodemailer = require("nodemailer");
const { FormStatusHistory, Form } = require("../models");
require("dotenv").config(); // Подключаем переменные окружения

// Конфигурация транспорта для отправки через Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // Email-аккаунт
    pass: process.env.SMTP_PASSWORD, // Пароль приложения
  },
});

function getEmailTemplate({
  name,
  site,
  phoneNumber,
  createdAt,
  additionalInfo,
}) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Новая заявка</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            background: #ffffff;
            padding: 20px;
            margin: 20px auto;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333;
          }
          .info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
          }
          .info p {
            margin: 5px 0;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Новая заявка с сайта ${site}</h2>
          <div class="info">
            <p><strong>ФИО:</strong> ${name}</p>
            <p><strong>Телефон:</strong> ${phoneNumber}</p>
            <p><strong>Заявка создана:</strong> ${createdAt}</p>
            ${
              additionalInfo
                ? `<p><strong>Доп. информация:</strong> ${additionalInfo}</p>`
                : ""
            }
          </div>
          <div class="footer">
            <p>Это автоматическое письмо, не отвечайте на него.</p>
          </div>
        </div>
      </body>
      </html>
      `;
}

async function sendEmail({
  formId,
  to,
  name,
  site,
  phoneNumber,
  createdAt,
  additionalInfo,
}) {
  try {
    const htmlContent = getEmailTemplate({
      name,
      site,
      phoneNumber,
      createdAt,
      additionalInfo,
    });

    const mailOptions = {
      from: `"Моя Компания" <${process.env.SMTP_USER}>`,
      to,
      subject: `Новая заявка с сайта ${site}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    await FormStatusHistory.create({
      formId: formId,
      newStatusCode: "partner_notified",
    });
    const form = await Form.findByPk(formId);
    form.statusCode = "partner_notified";
    await form.save();

    return { success: true, message: "Email отправлен!" };
  } catch (error) {
    console.error("Ошибка при отправке Email:", error);
    throw new Error("Ошибка отправки Email");
  }
}

module.exports = { sendEmail };
