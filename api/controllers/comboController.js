"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCombo = exports.getCombos = void 0;
const comboModel_1 = __importDefault(require("../models/comboModel"));
// Danh sách bắp nước / combo
const getCombos = async (_req, res) => {
    try {
        const combos = await comboModel_1.default.find();
        res.status(200).json({ success: true, data: combos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCombos = getCombos;
const addCombo = async (req, res) => {
    try {
        const combo = await comboModel_1.default.create(req.body);
        res.status(201).json({ success: true, data: combo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCombo = addCombo;
//# sourceMappingURL=comboController.js.map