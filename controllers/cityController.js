const { City } = require("../models");
const cityService = require("../services/cityService");

class CityController {
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

  async getCityById(req, res) {
    try {
      const { id } = req.params;
      const city = await cityService.getCityById(id);
      return res.status(200).json(city);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllCities(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const title = req.query.title;
      const active = req.query.active;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;

      const cities = await cityService.getAllCities({
        limit,
        page,
        active,
        title,
        sortField,
        sortOrder,
      });
      return res.status(200).json(cities);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateCity(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const city = await cityService.updateCity(id, data);
      return res.status(200).json(city);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CityController();
