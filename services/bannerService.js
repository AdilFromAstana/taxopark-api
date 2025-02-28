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
      const banner = await Banner.findByPk(bannerId);
      if (!banner || !banner.bannerUrl) {
        return res.status(404).json({ message: "Изображение не найдено" });
      }

      banner.bannerUrl = null;
      await banner.save();

      return banner;
    } catch (error) {
      console.error("Ошибка при удалении баннера:", error);
      throw new Error(`Ошибка при обновлении парка: ${error.message}`);
    }
  }
}

module.exports = new BannerService();
