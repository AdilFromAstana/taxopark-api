const { Op } = require("sequelize");
const { Review } = require("../models/index");

class ReviewService {
  async createReview(data) {
    if (!data) {
      throw new Error("Передан некорректный объект данных");
    }

    try {
      const review = await Review.create(data);
      return review;
    } catch (error) {
      throw new Error(`Ошибка при создании парка: ${error.message}`);
    }
  }

  async getReviewById(id) {
    try {
      const review = await Review.findByPk(id);
      if (!review) {
        throw new Error("Парк не найден.");
      }
      return review;
    } catch (error) {
      throw new Error(`Ошибка при получении парка: ${error.message}`);
    }
  }

  async getAllReviews({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    name = "",
    active = null,
  }) {
    try {
      const offset = (page - 1) * limit;
      const order =
        sortField && ["asc", "desc"].includes(sortOrder)
          ? [[sortField, sortOrder]]
          : [];

      const where = {
        ...(name && { title: { [Op.iLike]: `%${title}%` } }),
        ...(active && { active }),
      };

      const { rows: data, count: total } = await Review.findAndCountAll({
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

  async updateReview(id, data) {
    try {
      const review = await Review.findByPk(id);

      if (!review) {
        throw new Error("Парк не найден.");
      }

      if (!data) {
        throw new Error("Передан некорректный объект данных");
      }

      await review.update(data);
      return review;
    } catch (error) {
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }

  async saveReviewImage(reviewId, imageUrl) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error("Парк не найден.");
    }
    review.imageUrl = imageUrl;
    await review.save();
    return review;
  }

  async deleteImage(reviewId) {
    try {
      const review = await Review.findByPk(reviewId);
      if (!review || !review.imageUrl) {
        return res.status(404).json({ message: "Изображение не найдено" });
      }

      review.imageUrl = null;
      await review.save();

      return review;
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
      const transaction = await Review.sequelize.transaction();

      try {
        const existingRecords = await Review.findAll({ transaction });
        const existingIds = new Set(existingRecords.map((record) => record.id));
        const newIds = new Set(priorityData.map(({ id }) => id));

        const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));

        for (const { id, priority } of priorityData) {
          await Review.update(
            { priority },
            {
              where: { id },
              transaction,
            }
          );
        }

        if (idsToDelete.length > 0) {
          await Review.update(
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

module.exports = new ReviewService();
