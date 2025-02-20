const FormStatus = require("./models/FormStatus");
const FormStatusTransition = require("./models/FormStatusTransition");

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

async function seedDatabase() {
  await seedStatuses();
  await seedStatusTransitions();
}

module.exports = seedDatabase;
