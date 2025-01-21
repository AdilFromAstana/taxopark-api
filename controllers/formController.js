const formService = require("../services/formService");

class FormController {
  async createForm(req, res) {
    try {
      const { name, parkId, formType, phoneNumber } = req.body;

      if (!name || !parkId || !formType || !phoneNumber) {
        return res.status(400).json({
          message:
            "Все поля (name, parkId, formType, phoneNumber) обязательны.",
        });
      }

      const form = await formService.createForm({
        name,
        parkId,
        formType,
        phoneNumber,
      });
      return res.status(201).json(form);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getFormById(req, res) {
    try {
      const { id } = req.params;
      const form = await formService.getFormById(id);
      return res.status(200).json(form);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllForms(req, res) {
    try {
      const forms = await formService.getAllForms();
      return res.status(200).json(forms);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateForm(req, res) {
    try {
      const { id } = req.params;
      const { name, parkId, formType, phoneNumber } = req.body;

      const form = await formService.updateForm(id, {
        name,
        parkId,
        formType,
        phoneNumber,
      });

      return res.status(200).json(form);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new FormController();
