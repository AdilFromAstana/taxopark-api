const { City } = require("../models/index");

class CityService {
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

  async getAllCities({
    page = 1,
    limit = 10,
    title = "",
    active = null,
    sortField = "title",
    sortOrder = "asc",
  }) {
    try {
      const offset = (page - 1) * limit;
      const order =
        sortField && ["asc", "desc"].includes(sortOrder)
          ? [[sortField, sortOrder]]
          : [];

      const where = {
        ...(active !== null && { active }),
        ...(title && { title: { [Op.iLike]: `%${title}%` } }),
      };
      const { rows: data, count: total } = await City.findAndCountAll({
        where,
        limit,
        offset,
        order,
      });
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Ошибка при получении списка городов: ${error.message}`);
    }
  }

  async updateCity(id, data) {
    try {
      const city = await City.findByPk(id);

      if (!city) {
        throw new Error("Город не найден.");
      }

      if (!data) {
        throw new Error("Передан некорректный объект данных");
      }

      await city.update(data);
      return city;
    } catch (error) {
      throw new Error(`Ошибка при обновлении города: ${error.message}`);
    }
  }
}

module.exports = new CityService();
