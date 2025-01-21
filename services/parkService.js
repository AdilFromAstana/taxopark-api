const { Park, City } = require("../models/index");

class ParkService {
  async createPark(data) {
    try {
      const park = await Park.create(data);
      return park;
    } catch (error) {
      throw new Error(`Ошибка при создании парка: ${error.message}`);
    }
  }

  async getParkById(id) {
    try {
      const park = await Park.findByPk(id);
      if (!park) {
        throw new Error("Парк не найден.");
      }
      return park;
    } catch (error) {
      throw new Error(`Ошибка при получении парка: ${error.message}`);
    }
  }

  async getAllParks({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;

      const { rows: parks, count: total } = await Park.findAndCountAll({
        include: [{ model: City, attributes: ["title", "id"] }],
        limit,
        offset,
      });
      return {
        parks,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Ошибка при получении списка парков: ${error.message}`);
    }
  }

  async updatePark(id, data) {
    try {
      const park = await Park.findByPk(id);
      if (!park) {
        throw new Error("Парк не найден.");
      }
      Object.assign(park, data);
      await park.save();
      return park;
    } catch (error) {
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }
}

module.exports = new ParkService();
