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
    active = null,
    highPriority = null,
  }) {
    try {
      const now = new Date();
      await Promotion.update(
        { active: false },
        { where: { expires: { [Op.lt]: now }, active: true } }
      );

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
      if (active) {
        where.active = active;
      }
      if (parkId && parkId !== "null") {
        where.parkId = parkId;
      }
      if (highPriority && highPriority !== "null") {
        where.highPriority = highPriority;
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
      throw new Error(`Ошибка при получении списка акций: ${error.message}`);
    }
  }

  async updatePromotion(id, data) {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new Error("Акция не найдена.");
      }

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

  async saveParkImage(promotionId, imageUrl) {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
      throw new Error("Парк не найден.");
    }
    promotion.imageUrl = imageUrl;
    await promotion.save();
    return promotion;
  }

  async deleteImage(promotionId) {
    try {
      const promotion = await Promotion.findByPk(promotionId);
      if (!promotion || !promotion.imageUrl) {
        throw new Error(`Изображение не найдено`);
      }

      promotion.imageUrl = null;
      await promotion.save();

      return promotion;
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }

  async updatePriorities(priorityData) {
    if (!Array.isArray(priorityData)) {
      throw new Error("Передан некорректный массив данных");
    }

    try {
      const transaction = await Promotion.sequelize.transaction();

      try {
        const existingRecords = await Promotion.findAll({ transaction });
        const existingIds = new Set(existingRecords.map((record) => record.id));
        const newIds = new Set(priorityData.map(({ id }) => id));

        const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));

        for (const { id, priority } of priorityData) {
          await Promotion.update(
            { priority },
            {
              where: { id },
              transaction,
            }
          );
        }

        if (idsToDelete.length > 0) {
          await Promotion.update(
            { priority: null },
            {
              where: { id: idsToDelete },
              transaction,
            }
          );
        }

        await transaction.commit();
        return { message: "Приоритеты успешно обновлены" };
      } catch (error) {
        await transaction.rollback();
        throw new Error(`Ошибка при обновлении приоритетов: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Ошибка при обновлении парков: ${error.message}`);
    }
  }
}

module.exports = new PromotionService();
