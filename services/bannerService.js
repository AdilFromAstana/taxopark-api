const { Banner } = require("../models/index");

class BannerService {
  async getAllBanners({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      const { rows: data, count: total } = await Banner.findAndCountAll({
        limit,
        offset,
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

  async saveBanner(bannerId, bannerUrl) {
    const banner = await Banner.findByPk(bannerId);
    if (!banner) {
      throw new Error("Парк не найден.");
    }
    banner.bannerUrl = bannerUrl;
    await banner.save();
    return banner;
  }

  async deleteBanner(bannerId) {
    try {
      console.log("bannerId: ", bannerId);
      const banner = await Banner.findOne({ where: { bannerUrl: bannerId } });
      console.log("banner: ", banner);
      if (!banner || !banner.bannerUrl) {
        throw new Error(`Изображение не найдено`);
      }

      await banner.destroy();

      return banner;
    } catch (error) {
      console.error("Ошибка при удалении баннера:", error);
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }

  async updatePriorities(priorityData) {
    if (!Array.isArray(priorityData)) {
      throw new Error("Передан некорректный массив данных");
    }

    try {
      const transaction = await Banner.sequelize.transaction();

      try {
        const existingRecords = await Banner.findAll({ transaction });
        const existingIds = new Set(existingRecords.map((record) => record.id));
        const newIds = new Set(priorityData.map(({ id }) => id));

        const idsToDelete = [...existingIds].filter((id) => !newIds.has(id));

        for (const { id, priority } of priorityData) {
          await Banner.update(
            { priority },
            {
              where: { id },
              transaction,
            }
          );
        }

        if (idsToDelete.length > 0) {
          await Banner.update(
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

module.exports = new BannerService();
