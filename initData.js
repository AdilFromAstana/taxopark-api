const {
  Park,
  User,
  Commission,
  FormStatus,
  FormStatusTransition,
} = require("./models");
const crypto = require("crypto");

const SECRET_KEY = "12345678901234567890123456789012"; // 32 байта (AES-256)
const IV = "1234567890123456"; // 16 байт (AES требует 16-байтовый IV)

function encryptPassword(password) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "utf-8"),
    Buffer.from(IV, "utf-8")
  );
  let encrypted = cipher.update(password, "utf8", "base64"); // base64, чтобы передавать по сети
  encrypted += cipher.final("base64");
  return encrypted;
}

async function yandexCommission() {
  const existing = await Commission.findOne({ where: { code: "yandex" } });
  if (!existing) {
    return await Commission.create({
      code: "yandex",
      title: "Яндекс.Такси",
      sum: 2000
    });
  }
  return existing;
}

async function seedStatuses() {
  const statuses = [
    { code: "application_received", title: "Заявка поступила", isCommon: true },
    {
      code: "sms_sent",
      title: "Отправлен SMS для верификации",
      isCommon: true,
    },
    { code: "sms_error", title: "Ошибка при отправлении SMS", isCommon: true },
    { code: "sms_confirmed", title: "Подтверждение SMS", isCommon: true },

    {
      code: "partner_notified",
      title: "Партнер уведомлен",
      formType: "taxiPark",
    },
    { code: "approved", title: "Подключен", formType: "consultation" },
    {
      code: "no_answer",
      title: "Клиент не отвечает",
      formType: "consultation",
    },
    {
      code: "sent_to_other_park",
      title: "Отправлен в другой парк",
      formType: "consultation",
    },
    { code: "thinking", title: "Клиент думает", formType: "consultation" },
    {
      code: "incorrect_data",
      title: "Неверные данные",
      formType: "consultation",
    },
  ];

  for (const status of statuses) {
    await FormStatus.findOrCreate({
      where: { code: status.code },
      defaults: status,
    });
  }
}

async function seedStatusTransitions() {
  const transitions = [];

  // 1. Переходы из `application_received`
  const initialTransitions = [
    "sms_sent",
    "sms_error",
    "sms_confirmed",
    "partner_notified",
    "approved",
    "no_answer",
    "sent_to_other_park",
    "thinking",
    "incorrect_data",
  ];
  initialTransitions.forEach((toStatus) => {
    transitions.push({
      fromStatus: "application_received",
      toStatus,
      formType: null, // Доступно всем
      requires_reason: false,
    });
  });

  // 2. Переходы из `sms_sent`, `sms_error`, `sms_confirmed`, `partner_notified`
  const allowedFromStatuses = [
    "sms_sent",
    "sms_error",
    "sms_confirmed",
    "partner_notified",
  ];

  // Все статусы, куда можно перейти
  const consultationStatuses = [
    "approved",
    "no_answer",
    "sent_to_other_park",
    "thinking",
    "incorrect_data",
  ];
  const taxiParkStatuses = ["partner_notified", "approved"];

  allowedFromStatuses.forEach((fromStatus) => {
    consultationStatuses.forEach((toStatus) => {
      transitions.push({
        fromStatus,
        toStatus,
        formType: "consultation",
        requires_reason: false,
      });
    });

    taxiParkStatuses.forEach((toStatus) => {
      transitions.push({
        fromStatus,
        toStatus,
        formType: "taxiPark",
        requires_reason: false,
      });
    });
  });

  // Записываем переходы в базу
  for (const transition of transitions) {
    await FormStatusTransition.findOrCreate({
      where: {
        fromStatus: transition.fromStatus,
        toStatus: transition.toStatus,
      },
      defaults: transition,
    });
  }
}

async function updateAverageCheckForAllParks() {
  try {
    const parks = await Park.findAll({
      attributes: ["id", "cityIds", "averageCheckPerCity"],
    });

    for (const park of parks) {
      const { id, cityIds, averageCheckPerCity } = park;

      // Проверяем, что cityIds - массив и не пустой, а также averageCheckPerCity пустой
      if (
        Array.isArray(cityIds) &&
        cityIds.length > 0 &&
        (!averageCheckPerCity || averageCheckPerCity.length === 0)
      ) {
        const averageCheckArray = cityIds.map((cityId) => ({
          cityId,
          averageCheck: 1000,
        }));

        await Park.update(
          { averageCheckPerCity: averageCheckArray },
          { where: { id } }
        );
      }
    }

    console.log("Все записи успешно обновлены!");
  } catch (error) {
    console.error("Ошибка при массовом обновлении averageCheckPerCity:", error);
  }
}

async function createAdmin() {
  try {
    const encryptedPassword = encryptPassword("adiladil"); // Шифруем пароль перед сохранением

    await User.create({
      userName: "super_admin",
      name: "Adil",
      roles: ["admin", "manager"],
      password: encryptedPassword, // Сохраняем зашифрованный пароль
    });

    console.log("✅ Админ создан с зашифрованным паролем:", encryptedPassword);
  } catch (error) {
    console.error("❌ Ошибка при создании админа:", error);
  }
}

async function seedDatabase() {
  await updateAverageCheckForAllParks();
  await seedStatuses();
  await seedStatusTransitions();
  await yandexCommission();
  // await createAdmin();
}

module.exports = seedDatabase;
