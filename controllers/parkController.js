const parkService = require("../services/parkService");

class ParkController {
  async createPark(req, res) {
    try {
      const data = req.body;
      if (!data.title || !data.cityId) {
        return res
          .status(400)
          .json({ message: "Название и идентификатор города обязательны." });
      }
      const park = await parkService.createPark(data);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getParkById(req, res) {
    try {
      const { id } = req.params;
      const park = await parkService.getParkById(id);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async getAllParks(req, res) {
    try {
      const limit = req.query.limit;
      const page = req.query.page;
      const sortOrder = req.query.sortOrder;
      const sortField = req.query.sortField;
      const parks = await parkService.getAllParks({
        limit,
        page,
        sortField,
        sortOrder,
      });
      return res.status(200).json(parks);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updatePark(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const park = await parkService.updatePark(id, data);
      return res.status(200).json(park);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ParkController();
