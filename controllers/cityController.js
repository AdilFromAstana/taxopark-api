const cityService = require("../services/cityService");

class CityController {
  // Создание города
  async createCity(req, res) {
    try {
      const { title } = req.body;
      if (!title) {
        return res
          .status(400)
          .json({ message: "Название города обязательно." });
      }
      const city = await cityService.createCity(title);
      return res.status(201).json(city);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Получение города по ID
  async getCityById(req, res) {
    try {
      const { id } = req.params;
      const city = await cityService.getCityById(id);
      return res.status(200).json(city);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  // Получение всех городов
  async getAllCities(req, res) {
    try {
      const cities = await cityService.getAllCities();
      return res.status(200).json(cities);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Обновление города
  async updateCity(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      if (!title) {
        return res
          .status(400)
          .json({ message: "Название города обязательно." });
      }
      const city = await cityService.updateCity(id, title);
      return res.status(200).json(city);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CityController();
