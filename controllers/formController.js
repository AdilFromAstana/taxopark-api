const formService = require("../services/formService");

class FormController {
  async createForm(req, res) {
    try {
      const { name, parkId, formType, phoneNumber, selectedParks } = req.body;

      if (!name || !formType || !phoneNumber) {
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
        selectedParks
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

  async getStatusHistoryById(req, res) {
    try {
      const { id } = req.params;
      const form = await formService.getStatusHistoryById(id);
      return res.status(200).json(form);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllForms(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;
      const filterName = req.query.filterName;
      const filterStartDate = req.query.filterStartDate;
      const filterEndDate = req.query.filterEndDate;
      const selectedParks = req.query.selectedParks
        ? req.query.selectedParks.split(",").map((id) => id.trim())
        : [];

      const forms = await formService.getAllForms({
        limit,
        page,
        sortField,
        sortOrder,
        selectedParks,
        filterName,
        filterStartDate,
        filterEndDate
      });
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

  async updateFormStatus(req, res) {
    try {
      const { id } = req.params;
      const { newStatusCode, reason } = req.body;

      if (!newStatusCode) {
        return res.status(400).json({ message: "Необходимо указать новый статус." });
      }

      const updatedForm = await formService.updateFormStatus(id, newStatusCode, reason);
      return res.status(200).json(updatedForm);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new FormController();
