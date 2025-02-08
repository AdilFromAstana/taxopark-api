const Form = require("./models/Form");
const City = require("./models/City");
const Park = require("./models/Park");
const FormStatus = require("./models/FormStatus");

async function seedDatabase() {
  try {
    console.log("🚀 Запуск заполнения базы данных...");

    console.log("📌 Создаём статусы форм...");
    const formStatuses = [
      { code: "registered", name: "Registered" },
      { code: "sent_to_another_park", name: "Sent to Another Park" },
      { code: "thinking", name: "Thinking" },
      { code: "no_answer", name: "No Answer" },
      { code: "incorrect_data", name: "Incorrect Data" },
    ];

    for (const status of formStatuses) {
      await FormStatus.findOrCreate({
        where: { code: status.code },
        defaults: status,
      });
    }
    console.log("✅ Статусы форм успешно добавлены!");

    console.log("📌 Создаём города...");
    const cityData = [
      { id: "17a5888d-3586-43b4-9267-6e25a7d937ed", title: "Алматы" },
      { id: "601148ba-80f3-495b-bfd8-59df837e62f3", title: "Шымкент" },
      { id: "708fd4f0-de0a-4abe-bcbe-44bb63b02596", title: "Тараз" },
      { id: "b82d6122-5999-4c44-b13f-6188f00a78d1", title: "Актобе" },
      { id: "c8c43c86-101e-4e17-bd90-bd61cc1ddcf8", title: "Караганда" },
      { id: "f296c37c-ef7b-4eaa-ae60-ecaca7442811", title: "Астана" },
    ];

    for (const city of cityData) {
      await City.findOrCreate({
        where: { title: city.title },
        defaults: city,
      });
    }
    console.log("✅ Города успешно добавлены!");

    console.log("📌 Создаём таксопарки...");
    const parksData = [
      {
        title: "Таксопарк Пайда",
        cityId: "17a5888d-3586-43b4-9267-6e25a7d937ed",
        parkCommission: 10,
        rating: 4.5,
      },
      {
        title: "Табыс",
        cityId: "17a5888d-3586-43b4-9267-6e25a7d937ed",
        parkCommission: 12,
        rating: 4.7,
      },
      {
        title: "Городской Таксопарк Алматы",
        cityId: "17a5888d-3586-43b4-9267-6e25a7d937ed",
        parkCommission: 8,
        rating: 4.9,
      },
      {
        title: "Астана Экспресс",
        cityId: "f296c37c-ef7b-4eaa-ae60-ecaca7442811",
        parkCommission: 11,
        rating: 4.3,
      },
      {
        title: "Байтерек Такси",
        cityId: "f296c37c-ef7b-4eaa-ae60-ecaca7442811",
        parkCommission: 9,
        rating: 4.6,
      },
      {
        title: "Шымкент Люкс",
        cityId: "601148ba-80f3-495b-bfd8-59df837e62f3",
        parkCommission: 10,
        rating: 4.8,
      },
    ];

    for (const park of parksData) {
      await Park.findOrCreate({
        where: { title: park.title },
        defaults: park,
      });
    }
    console.log("✅ Таксопарки успешно добавлены!");

    console.log("📌 Создаём формы таксопарков...");
    const formsData = [
      {
        name: "Азамат Ахметов",
        phoneNumber: "+77011234567",
        parkId: parksData[0].id,
        formType: "taxiPark",
      },
      {
        name: "Серик Омаров",
        phoneNumber: "+77019876543",
        parkId: parksData[1].id,
        formType: "taxiPark",
      },
      {
        name: "Марат Серик",
        phoneNumber: "+77019875432",
        parkId: parksData[2].id,
        formType: "taxiPark",
      },
    ];

    for (const form of formsData) {
      await Form.findOrCreate({
        where: { phoneNumber: form.phoneNumber },
        defaults: form,
      });
    }
    console.log("✅ Формы таксопарков успешно созданы!");

    console.log("📌 Создаём формы для консультаций...");
    const consultationForms = [
      {
        name: "Айгерим Аманова",
        phoneNumber: "+77059873210",
        formType: "consultation",
      },
      {
        name: "Жанна Кутпанова",
        phoneNumber: "+77051122334",
        formType: "consultation",
      },
    ];

    for (const form of consultationForms) {
      await Form.findOrCreate({
        where: { phoneNumber: form.phoneNumber },
        defaults: form,
      });
    }
    console.log("🎉 База данных полностью заполнена статичными данными!");
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
  }
}

module.exports = seedDatabase;
