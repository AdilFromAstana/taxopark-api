const { Op } = require("sequelize");
const { Promotion, Park } = require("../models/index");

class PromotionService {
  async createPromotion(data) {
    try {
      const { title, description, expires, parkId } = data;

      const existingPromotion = await Promotion.findOne({
        where: { title, parkId },
      });
      if (existingPromotion) {
        throw new Error("Акция с таким названием уже существует.");
      }

      const promotion = await Promotion.create({
        title,
        description,
        expires,
        parkId,
      });

      return promotion;
    } catch (error) {
      throw new Error(`Ошибка при создании акции: ${error.message}`);
    }
  }

  async getPromotionById(id) {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new Error("Акция не найдена.");
      }
      return promotion;
    } catch (error) {
      throw new Error(`Ошибка при получении акции: ${error.message}`);
    }
  }

  async getAllPromotions({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    parkId = null,
    title = "",
  }) {
    try {
      const offset = (page - 1) * limit;

      const validSortOrder = ["asc", "desc"].includes(sortOrder)
        ? sortOrder
        : null;

      let order = [];
      if (sortField && validSortOrder) {
        if (sortField === "park") {
          order.push([{ model: Park, as: "park" }, "title", validSortOrder]);
        } else {
          order.push([sortField, validSortOrder]);
        }
      }

      const where = {};
      if (parkId && parkId !== "null") {
        where.parkId = parkId;
      }
      if (title) {
        where.title = {
          [Op.iLike]: `%${title}%`,
        };
      }

      const { rows: data, count: total } = await Promotion.findAndCountAll({
        include: [
          {
            model: Park,
            attributes: ["title", "id"], // Загружаем только нужные поля парка
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
      throw new Error(`Ошибка при получении списка акций: ${error.message}`);
    }
  }

  async updatePromotion(id, data) {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new Error("Акция не найдена.");
      }

      // Обновляем поля акции
      await promotion.update(data);
      return promotion;
    } catch (error) {
      throw new Error(`Ошибка при обновлении акции: ${error.message}`);
    }
  }

  async deletePromotion(id) {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new Error("Акция не найдена.");
      }

      await promotion.destroy();
      return { message: "Акция успешно удалена." };
    } catch (error) {
      throw new Error(`Ошибка при удалении акции: ${error.message}`);
    }
  }
}

module.exports = new PromotionService();
