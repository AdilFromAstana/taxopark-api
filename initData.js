const City = require("./models/City");

async function seedDatabase() {
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
}

module.exports = seedDatabase;
