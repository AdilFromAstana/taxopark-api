const { Op } = require("sequelize");
const {
  Park,
  Form,
  FormStatus,
  FormStatusHistory,
  sequelize,
} = require("../models/index");

class FormService {
  async createForm({ name, parkId, formType, phoneNumber }) {
    if (formType === "taxiPark" && !parkId) {
      throw new Error("Поле parkId обязательно для типа формы 'taxiPark'");
    }
    console.log("parkId: ", parkId)
    const transaction = await sequelize.transaction();
    try {
      const form = await Form.create(
        {
          name,
          parkId,
          formType,
          phoneNumber,
          statusCode: "registered",
        },
        { transaction }
      );

      await FormStatusHistory.create(
        {
          formId: form.id,
          newStatusCode: "registered",
        },
        { transaction }
      );

      await transaction.commit();
      return form;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Ошибка при создании формы: ${error.message}`);
    }
  }

  async getFormById(id) {
    try {
      const form = await Form.findByPk(id);
      if (!form) {
        throw new Error("Форма не найдена.");
      }
      return form;
    } catch (error) {
      throw new Error(`Ошибка при получении формы: ${error.message}`);
    }
  }

  async getStatusHistoryById(id) {
    try {
      const forms = await FormStatusHistory.findAll({ where: { formId: id } });
      if (!forms) {
        throw new Error("Форма не найдена.");
      }
      return forms;
    } catch (error) {
      throw new Error(`Ошибка при получении формы: ${error.message}`);
    }
  }

  async getAllForms({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    filterName = "",
    selectedParks = [],
    filterStartDate = "",
    filterEndDate = "",
  }) {
    try {
      const offset = (page - 1) * limit;
      const validSortOrder = ["asc", "desc"].includes(sortOrder)
        ? sortOrder
        : null;
      let order = [];
      if (sortField && validSortOrder) {
        if (sortField === "Park") {
          order.push([{ model: Park, as: "Park" }, "title", validSortOrder]);
        } else {
          order.push([sortField, validSortOrder]);
        }
      }
      const where = {};
      if (Array.isArray(selectedParks) && selectedParks.length > 0) {
        where.parkId = {
          [Op.in]: selectedParks.map((id) => {
            return sequelize.cast(id, "uuid");
          }), // Приведение типов
        };
      }
      if (filterName) {
        where.name = {
          [Op.iLike]: `%${filterName}%`, // Регистронезависимый поиск с шаблоном
        };
      }
      if (filterStartDate || filterEndDate) {
        where.createdAt = {};
        if (filterStartDate) {
          where.createdAt[Op.gte] = new Date(filterStartDate); // Больше или равно начальной дате
        }
        if (filterEndDate) {
          where.createdAt[Op.lte] = new Date(filterEndDate); // Меньше или равно конечной дате
        }
      }

      const { rows: data, count: total } = await Form.findAndCountAll({
        include: [{ model: Park, as: "Park", attributes: ["title", "id"] }],
        limit,
        offset,
        order,
        where,
      });
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Ошибка при получении списка форм: ${error.message}`);
    }
  }

  async updateForm(id, { name, parkId, formType, phoneNumber }) {
    try {
      const form = await Form.findByPk(id);
      if (!form) {
        throw new Error("Форма не найдена.");
      }

      form.name = name || form.name;
      form.parkId = parkId || form.parkId;
      form.formType = formType || form.formType;
      form.phoneNumber = phoneNumber || form.phoneNumber;

      await form.save();
      return form;
    } catch (error) {
      throw new Error(`Ошибка при обновлении формы: ${error.message}`);
    }
  }

  async updateFormStatus(formId, newStatusCode, reason = null) {
    const transaction = await sequelize.transaction();
    try {
      const form = await Form.findByPk(formId, { transaction });
      if (!form) {
        throw new Error("Форма не найдена.");
      }
      if (form.newStatusCode === newStatusCode) {
        throw new Error("Нельзя изменить статус на текущий!");
      }

      await FormStatusHistory.create(
        {
          formId,
          newStatusCode,
          reason,
        },
        { transaction }
      );

      form.statusCode = newStatusCode;
      await form.save({ transaction });

      await transaction.commit();
      return form;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Ошибка при обновлении статуса формы: ${error.message}`);
    }
  }
}

module.exports = new FormService();
