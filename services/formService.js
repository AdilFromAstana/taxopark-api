const { Op } = require("sequelize");
const {
  Park,
  Form,
  FormStatus,
  FormStatusHistory,
  sequelize,
} = require("../models/index");
const smsCodeService = require("./smsCodeService");
const FormStatusTransition = require("../models/FormStatusTransition");

class FormService {
  async createForm({ name, parkId, formType, phoneNumber }) {
    if (formType === "taxiPark" && !parkId) {
      throw new Error("Поле parkId обязательно для типа формы 'taxiPark'");
    }

    try {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      const whereCondition = {
        phoneNumber,
        formType,
        createdAt: {
          [Op.gte]: twelveHoursAgo,
        },
      };

      if (formType === "taxiPark") {
        whereCondition.parkId = parkId;
      }

      const existingForm = await Form.findOne({
        where: whereCondition,
      });

      if (existingForm) {
        throw new Error("Дождитесь ответа менеджера");
      }

      const form = await Form.create({
        name,
        parkId,
        formType,
        phoneNumber,
        statusCode: "application_received",
      });

      await FormStatusHistory.create({
        formId: form.id,
        newStatusCode: "application_received",
      });

      const sms = await smsCodeService.sendOtp(form.id, phoneNumber);
      console.log(sms);
      return { ...form.dataValues, smsCodeId: sms.smsCodeId };
    } catch (error) {
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
      const forms = await FormStatusHistory.findAll({
        where: { formId: id },
        include: [
          {
            model: FormStatus,
            as: "statusDetail",
            attributes: ["code", "title"],
          },
        ],
      });
      if (!forms) {
        throw new Error("Форма не найдена.");
      }
      return forms;
    } catch (error) {
      throw new Error(`Ошибка при получении формы: ${error.message}`);
    }
  }

  async getAvailableStatusesById(formId) {
    const form = await Form.findByPk(formId);
    if (!form) {
      throw new Error("Форма не найдена");
    }
    return await FormStatusTransition.findAll({
      where: {
        [Op.or]: [
          { formType: form.formType },
          { formType: null },
          { isCommon: { [Op.is]: true } },
        ],
        fromStatus: form.statusCode,
      },
      include: [
        {
          model: FormStatus,
          as: "toStatusDetail",
          attributes: ["code", "title"],
        },
      ],
      attributes: ["toStatus", "requires_reason"],
    });
  }

  async getAllStatuses() {
    const formStatuses = await FormStatus.findAll();
    if (!formStatuses) {
      throw new Error("Статусы не найдена");
    }
    return formStatuses;
  }

  async getAllForms({
    page = 1,
    limit = 10,
    sortField = null,
    sortOrder = null,
    filterName = "",
    phoneNumber = "",
    parkId = "",
    filterStartDate = "",
    filterEndDate = "",
    formType = "",
    statusCode = null,
  }) {
    try {
      const offset = (page - 1) * limit;
      const validSortOrder = ["asc", "desc"].includes(sortOrder)
        ? sortOrder
        : null;
      let order = [];
      if (sortField && validSortOrder) {
        if (sortField === "parkId") {
          order.push([{ model: Park, as: "Park" }, "title", validSortOrder]);
        } else {
          order.push([sortField, validSortOrder]);
        }
      }
      const where = {};
      if (parkId) {
        where.parkId = parkId;
      }
      if (filterName) {
        where.name = {
          [Op.iLike]: `%${filterName}%`,
        };
      }
      if (formType) {
        where.formType = formType;
      }
      if (statusCode) {
        where.statusCode = statusCode;
      }
      if (phoneNumber) {
        where.phoneNumber = {
          [Op.iLike]: `%${phoneNumber}%`,
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
        include: [
          { model: Park, as: "Park", attributes: ["title", "id"] },
          {
            model: FormStatus,
            attributes: ["code", "title"],
            as: "status",
          },
        ],
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
