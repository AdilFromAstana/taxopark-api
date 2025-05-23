const { Op } = require("sequelize");
const { Park } = require("../models/index");

class ParkService {
  async createPark(data) {
    if (!data) {
      throw new Error("Передан некорректный объект данных");
    }

    const supportStartWorkTime =
      Array.isArray(data.supportWorkTime) && data.supportWorkTime.length > 0
        ? data.supportWorkTime[0]
        : null;

    const supportEndWorkTime =
      Array.isArray(data.supportWorkTime) && data.supportWorkTime.length > 1
        ? data.supportWorkTime[1]
        : null;

    if (data.supportAlwaysAvailable === false) {
      if (!supportStartWorkTime || !supportEndWorkTime) {
        throw new Error(
          "Для парков без круглосуточной поддержки необходимо указать рабочее время (начало и конец)."
        );
      }
    }

    try {
      const park = await Park.create({
        ...data,
        supportEndWorkTime,
        supportStartWorkTime,
      });
      const createdData = {
        ...park,
        supportWorkTime: [supportStartWorkTime, supportEndWorkTime],
      };
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
    cityIds = [],
    parkPromotions = [],
    title = "",
    filteredYandexGasStation = null,
    supportAlwaysAvailable = null,
    active = null,
  }) {
    try {
      if (!Array.isArray(cityIds) && cityIds !== "") {
        cityIds = [cityIds];
      }

      const offset = (page - 1) * limit;
      const order =
        sortField && ["asc", "desc"].includes(sortOrder)
          ? [[sortField, sortOrder]]
          : [];

      const where = {
        ...(active !== null && { active }),
        ...(parkPromotions.length > 0 && {
          parkPromotions: { [Op.contains]: parkPromotions },
        }),
        ...(title && { title: { [Op.iLike]: `%${title}%` } }),
        ...(filteredYandexGasStation !== null && {
          yandexGasStation: filteredYandexGasStation,
        }),
        ...(supportAlwaysAvailable !== null && { supportAlwaysAvailable }),
      };

      if (cityIds.length > 0) {
        where.averageCheckPerCity = {
          [Op.or]: cityIds.map((cityId) => ({
            [Op.contains]: [{ cityId }],
          })),
        };
      }

      const { rows: data, count: total } = await Park.findAndCountAll({
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

      if (!data) {
        throw new Error("Передан некорректный объект данных");
      }

      const supportStartWorkTime =
        Array.isArray(data.supportWorkTime) && data.supportWorkTime.length > 0
          ? data.supportWorkTime[0]
          : null;

      const supportEndWorkTime =
        Array.isArray(data.supportWorkTime) && data.supportWorkTime.length > 1
          ? data.supportWorkTime[1]
          : null;

      if (data.supportAlwaysAvailable === false) {
        if (!supportStartWorkTime || !supportEndWorkTime) {
          throw new Error(
            "Для парков без круглосуточной поддержки необходимо указать рабочее время (начало и конец)."
          );
        }
      }

      if (data.cityIds) {
        if (!Array.isArray(data.cityIds)) {
          throw new Error("cityIds должен быть массивом UUID.");
        }
        park.cityIds = [...new Set(data.cityIds)]; // Убираем дубликаты
      }

      Object.assign(park, {
        ...data,
        supportStartWorkTime,
        supportEndWorkTime,
      });

      await park.save();
      return park;
    } catch (error) {
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }

  async saveParkImage(parkId, imageUrl) {
    const park = await Park.findByPk(parkId);
    if (!park) {
      throw new Error("Парк не найден.");
    }
    park.imageUrl = imageUrl;
    await park.save();
    return park;
  }

  async deleteImage(parkId) {
    try {
      const park = await Park.findByPk(parkId);
      if (!park || !park.imageUrl) {
        return res.status(404).json({ message: "Изображение не найдено" });
      }

      park.imageUrl = null;
      await park.save();

      return park;
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
      const transaction = await Park.sequelize.transaction();

      try {
        const existingRecords = await Park.findAll({ transaction });
        const existingIds = new Set(existingRecords.map((record) => record.id));
        const newIds = new Set(priorityData.map(({ id }) => id));

        const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));

        for (const { id, priority } of priorityData) {
          await Park.update(
            { priority },
            {
              where: { id },
              transaction,
            }
          );
        }

        if (idsToDelete.length > 0) {
          await Park.update(
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

module.exports = new ParkService();
