const { Park, Form } = require("../models/index");

class FormService {
  async createForm({ name, parkId, formType, phoneNumber }) {
    try {
      const form = await Form.create({ name, parkId, formType, phoneNumber });
      return form;
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

  async getAllForms() {
    try {
      const forms = await Form.findAll({
        include: [{ model: Park, attributes: ["title", "id"] }],
      });
      return forms;
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