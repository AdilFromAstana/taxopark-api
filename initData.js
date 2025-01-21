const Form = require("./models/Form");
const City = require("./models/City");
const Park = require("./models/Park");

async function seedDatabase() {
  try {
    const cities = [
      { id: "17a5888d-3586-43b4-9267-6e25a7d937ed", title: "Алматы" },
      { id: "601148ba-80f3-495b-bfd8-59df837e62f3", title: "Шымкент" },
      { id: "708fd4f0-de0a-4abe-bcbe-44bb63b02596", title: "Тараз" },
      { id: "b82d6122-5999-4c44-b13f-6188f00a78d1", title: "Актобе" },
      { id: "c8c43c86-101e-4e17-bd90-bd61cc1ddcf8", title: "Караганда" },
      { id: "f296c37c-ef7b-4eaa-ae60-ecaca7442811", title: "Астана" },
    ];

    // 2. Создание таксопарков
    const parksData = {
      Алматы: [
        { title: "Таксопарк Пайда", parkCommission: 10, rating: 4.5 },
        { title: "Табыс", parkCommission: 12, rating: 4.7 },
        { title: "Городской Таксопарк Алматы", parkCommission: 8, rating: 4.9 },
        { title: "Таксопарк Верный", parkCommission: 7, rating: 3.8 },
        { title: "Первый Таксопарк", parkCommission: 5, rating: 5 },
      ],
      Астана: [
        { title: "Астана Экспресс", parkCommission: 11, rating: 4.3 },
        { title: "Байтерек Такси", parkCommission: 9, rating: 4.6 },
        { title: "Столица Парк", parkCommission: 8, rating: 4.8 },
        { title: "Таксопарк Ару", parkCommission: 7, rating: 3.9 },
        { title: "Rich", parkCommission: 13, rating: 5 },
      ],
      Шымкент: [
        { title: "Шымкент Люкс", parkCommission: 10, rating: 4.8 },
        { title: "Южный Таксопарк", parkCommission: 12, rating: 4.5 },
        { title: "Шым-Сити", parkCommission: 11, rating: 4.9 },
        { title: "Best City", parkCommission: 8, rating: 3.9 },
      ],
      Караганда: [
        { title: "Таксопарк Шахтерский", parkCommission: 14, rating: 4.6 },
        { title: "Таксопарк Караганда", parkCommission: 14, rating: 4.6 },
        { title: "ЦентрТакси Караганда", parkCommission: 10, rating: 4.4 },
      ],
      Актобе: [
        { title: "Актобе Экспресс", parkCommission: 8, rating: 4.7 },
        { title: "Городской парк Актобе", parkCommission: 11, rating: 4.5 },
        { title: "Актобе Люкс", parkCommission: 10, rating: 5.0 },
      ],
      Тараз: [
        { title: "Тараз Экспресс", parkCommission: 6, rating: 4.9 },
        { title: "Тараз Таксопарк", parkCommission: 9, rating: 4.6 },
        { title: "Центральный Парк Тараз", parkCommission: 13, rating: 4.8 },
      ],
    };

    for (const [cityTitle, parks] of Object.entries(parksData)) {
      const city = cities.find((c) => c.title === cityTitle);
      for (const park of parks) {
        await Park.create({
          ...park,
          cityId: city.id,
          yandexGasStation: Math.random() > 0.5,
          supportWorkTime: "24/7",
          parkPromotions: [1, 2, 3],
        });
      }
    }

    // 3. Создание форм
    const maleNames = [
      "Азамат",
      "Серик",
      "Марат",
      "Кайрат",
      "Бауыржан",
      "Али",
      "Айбек",
      "Айдос",
    ];
    const femaleNames = ["Аружан", "Мадина", "Динара", "Айгерим", "Жанна"];
    const surnames = [
      "Ахметов",
      "Омаров",
      "Серик",
      "Оспанов",
      "Алиев",
      "Байжанов",
      "Кутпанов",
      "Аманжол",
    ];

    const parks = await Park.findAll();

    // Формы для таксопарков (50 форм)
    for (let i = 0; i < 50; i++) {
      const isMale = Math.random() > 0.5;
      const name = isMale
        ? maleNames[Math.floor(Math.random() * maleNames.length)]
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const randomPark = parks[Math.floor(Math.random() * parks.length)];
      await Form.create({
        name: `${name} ${surname}`,
        phoneNumber: `+7701${Math.floor(1000000 + Math.random() * 9000000)}`,
        parkId: randomPark.id,
        formType: "taxiPark",
      });
    }

    // Формы для консультаций (20 форм)
    for (let i = 0; i < 20; i++) {
      const isMale = Math.random() > 0.5;
      const name = isMale
        ? maleNames[Math.floor(Math.random() * maleNames.length)]
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      await Form.create({
        name: `${name} ${surname}`,
        surname,
        phoneNumber: `+7705${Math.floor(1000000 + Math.random() * 9000000)}`,
        formType: "consultation",
      });
    }

    console.log("База данных успешно заполнена.");
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
  }
}

module.exports = seedDatabase;
