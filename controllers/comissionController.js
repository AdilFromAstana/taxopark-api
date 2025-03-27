const commissionService = require("../services/commissionService");

class CommissionController {
  async createCommission(req, res) {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ message: "Параметры не переданы." });
      }
      const commission = await commissionService.createCommission(data);
      return res.status(201).json(commission);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getCommissionById(req, res) {
    try {
      const { code } = req.params;
      const commission = await commissionService.getCommissionById(code);
      return res.status(200).json(commission);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllCommissions(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const title = req.query.title;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;

      const cities = await commissionService.getAllCommissions({
        limit,
        page,
        title,
        sortField,
        sortOrder,
      });
      return res.status(200).json(cities);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateCommission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const commission = await commissionService.updateCommission(id, data);
      return res.status(200).json(commission);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CommissionController();
