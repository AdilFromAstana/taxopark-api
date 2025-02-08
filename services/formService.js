const { Op, Sequelize } = require("sequelize");
const { Park, Form, FormStatus, FormStatusHistory } = require("../models/index");

class FormService {
  async createForm({ name, parkId, formType, phoneNumber }) {
    const transaction = await Sequelize.transaction();
    try {
      const form = await Form.create({ name, parkId, formType, phoneNumber }, { transaction });

      if (formType === "consultation") {
        const initialStatus = await FormStatus.findOne({ where: { code: "registered" } });
        if (!initialStatus) {
          throw new Error("Initial status 'registered' not found");
        }
        await FormStatusHistory.create({
          formId: form.id,
          newStatusId: initialStatus.id,
        }, { transaction });
      }

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

  async getAllForms({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    filterName = '',
    selectedParks = [],
    filterStartDate = '',
    filterEndDate = ''
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
            return Sequelize.cast(id, "uuid")
          }), // Приведение типов
        }
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

      const { rows: forms, count: total } = await Form.findAndCountAll({
        include: [{ model: Park, as: "Park", attributes: ["title", "id"] }],
        limit,
        offset,
        order,
        where
      });
      return {
        forms,
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
}

module.exports = new FormService();
