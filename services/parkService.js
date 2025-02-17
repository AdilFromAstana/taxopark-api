const { Op } = require("sequelize");
const { Park, City } = require("../models/index");

class ParkService {
  async createPark(data) {
    const supportStartWorkTime = data?.supportWorkTime[0];
    const supportEndWorkTime = data?.supportWorkTime[1];
    try {
      const park = await Park.create({ ...data, supportEndWorkTime, supportStartWorkTime });
      const createdData = { ...park, supportWorkTime: [supportStartWorkTime, supportEndWorkTime] }
      return createdData;
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

  async getAllParks({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    cityId = null,
    parkPromotions = [],
    title = "",
    filteredCity = null,
    filteredYandexGasStation = null,
  }) {
    try {
      const offset = (page - 1) * limit;

      const validSortOrder = ["asc", "desc"].includes(sortOrder)
        ? sortOrder
        : null;

      let order = [];
      if (sortField && validSortOrder) {
        if (sortField === "City") {
          order.push([{ model: City, as: "City" }, "title", validSortOrder]);
        } else {
          order.push([sortField, validSortOrder]);
        }
      }

      const where = {};

      if (cityId && cityId !== "null") {
        where.cityId = cityId;
      }

      if (Array.isArray(parkPromotions) && parkPromotions.length > 0) {
        where.parkPromotions = {
          [Op.contains]: parkPromotions,
        };
      }
      if (title) {
        where.title = {
          [Op.iLike]: `%${title}%`,
        };
      }
      if (filteredCity) {
        where.cityId = filteredCity;
      }
      if (filteredYandexGasStation && filteredYandexGasStation !== "null") {
        where.yandexGasStation = filteredYandexGasStation;
      }

      const { rows: data, count: total } = await Park.findAndCountAll({
        include: [
          {
            model: City,
            as: "City",
            attributes: ["title", "id"],
          },
        ],
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

  async getByName(title) {
    try {
      const parks = await Park.findAll({
        where: {
          title: {
            [Op.iLike]: `%${title}%`,
          },
        },
        limit: 10,
      });

      return parks;
    } catch (error) {
      throw new Error(`Ошибка при поиске парка по названию: ${error.message}`);
    }
  }

}

module.exports = new ParkService();
