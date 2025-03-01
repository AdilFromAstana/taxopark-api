const { City } = require("../models/index");

class CityService {
  // Создание города
  async createCity(title) {
    try {
      const existingCity = await City.findOne({ where: { title } });
      if (existingCity) {
        throw new Error("Город с таким названием уже существует.");
      }
      const city = await City.create({ title });
      return city;
    } catch (error) {
      throw new Error(`Ошибка при создании города: ${error.message}`);
    }
  }

  // Получение города по ID
  async getCityById(id) {
    try {
      const city = await City.findByPk(id);
      if (!city) {
        throw new Error("Город не найден.");
      }
      return city;
    } catch (error) {
      throw new Error(`Ошибка при получении города: ${error.message}`);
    }
  }

  // Получение всех городов
  async getAllCities() {
    try {
      const cities = await City.findAll({
        order: [["title", "ASC"]],
      });
      return cities;
    } catch (error) {
      throw new Error(`Ошибка при получении списка городов: ${error.message}`);
    }
  }

  // Обновление города
  async updateCity(id, title) {
    try {
      const city = await City.findByPk(id);
      if (!city) {
        throw new Error("Город не найден.");
      }
      city.title = title;
      await city.save();
      return city;
    } catch (error) {
      throw new Error(`Ошибка при обновлении города: ${error.message}`);
    }
  }
}

module.exports = new CityService();
