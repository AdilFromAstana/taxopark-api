const { Commission } = require("../models/index");

class CommissionService {
  async createCommission(data) {
    try {
      const existingCommission = await Commission.findOne({
        where: { code: data.code },
      });
      if (existingCommission) {
        throw new Error("Комиссия с таким кодом уже существует.");
      }
      const commission = await Commission.create(data);
      return commission;
    } catch (error) {
      throw new Error(`Ошибка при создании комиссии: ${error.message}`);
    }
  }

  async getCommissionById(id) {
    try {
      const commission = await Commission.findOne({ code: id });
      if (!commission) {
        throw new Error("Комиссия не найдена.");
      }
      return commission;
    } catch (error) {
      throw new Error(`Ошибка при получении комиссии: ${error.message}`);
    }
  }

  async getAllCommissions({
    page = 1,
    limit = 10,
    title = "",
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
        ...(title && { title: { [Op.iLike]: `%${title}%` } }),
      };
      const { rows: data, count: total } = await Commission.findAndCountAll({
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
      throw new Error(`Ошибка при получении списка комиссий: ${error.message}`);
    }
  }

  async updateCommission(id, data) {
    try {
      const commission = await Commission.findByPk(id);

      if (!commission) {
        throw new Error("Комиссия не найдена.");
      }

      if (!data) {
        throw new Error("Передан некорректный объект данных");
      }

      await commission.update(data);
      return commission;
    } catch (error) {
      throw new Error(`Ошибка при обновлении комиссии: ${error.message}`);
    }
  }
}

module.exports = new CommissionService();
