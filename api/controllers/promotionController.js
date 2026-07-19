"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPromo = exports.getPromotions = void 0;
const promotionModel_1 = __importDefault(require("../models/promotionModel"));
const getPromotions = async (_req, res) => {
    try {
        const now = new Date();
        const promos = await promotionModel_1.default.find({ expiryDate: { $gte: now } });
        res.status(200).json({ success: true, data: promos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPromotions = getPromotions;
const applyPromo = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        const promo = await promotionModel_1.default.findOne({ code });
        if (!promo) {
            res.status(404).json({ success: false, message: "Mã không hợp lệ" });
            return;
        }
        const now = new Date();
        if (now > promo.expiryDate) {
            res.status(400).json({ success: false, message: "Mã đã hết hạn" });
            return;
        }
        const discount = promo.discountValue;
        res.status(200).json({ success: true, data: { discount, finalTotal: Math.max(0, orderTotal - discount) } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.applyPromo = applyPromo;
//# sourceMappingURL=promotionController.js.map