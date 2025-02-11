const { Op } = require("sequelize");
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

  async getAllParks({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    cityId = null,
    parkPromotions = [],
    filteredTitle = "",
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
      if (filteredTitle) {
        where.title = {
          [Op.iLike]: `%${filteredTitle}%`,
        };
      }
      if (filteredCity) {
        where.cityId = filteredCity;
      }
      console.log("filteredYandexGasStation: ", filteredYandexGasStation);
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
}

module.exports = new ParkService();
