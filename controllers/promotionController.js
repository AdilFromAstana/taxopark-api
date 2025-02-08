const promotionService = require("../services/promotionService");

class PromotionController {
    async createPromotion(req, res) {
        try {
            const { title, description, startDate, expires, parkId } = req.body;
            if (!title || !description || !startDate || !parkId) {
                return res.status(400).json({ message: "Все обязательные поля должны быть заполнены." });
            }

            const promotion = await promotionService.createPromotion({ title, description, startDate, expires, parkId });
            return res.status(201).json(promotion);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getPromotionById(req, res) {
        try {
            const { id } = req.params;
            const promotion = await promotionService.getPromotionById(id);
            return res.status(200).json(promotion);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    }

    async getAllPromotions(req, res) {
        try {
            const limit = req.query.limit;
            const page = req.query.page;
            const sortOrder = req.query.sortOrder;
            const sortField = req.query.sortField;
            const parkId = req.query.parkId;

            const promotions = await promotionService.getAllPromotions({
                limit,
                page,
                sortOrder,
                sortField,
                parkId,
            });
            return res.status(200).json(promotions);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async updatePromotion(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const promotion = await promotionService.updatePromotion(id, data);
            return res.status(200).json(promotion);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    // Удаление акции
    async deletePromotion(req, res) {
        try {
            const { id } = req.params;
            await promotionService.deletePromotion(id);
            return res.status(200).json({ message: "Акция успешно удалена." });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new PromotionController();
