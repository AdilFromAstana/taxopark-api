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
}

module.exports = new BannerService();
