"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCinema = exports.getCinemaById = exports.getCinemas = void 0;
const cinemaModel_1 = __importDefault(require("../models/cinemaModel"));
// Lấy danh sách cụm rạp (lọc theo thành phố nếu có ?city=)
const getCinemas = async (req, res) => {
    try {
        const { city } = req.query;
        const filter = city ? { city: String(city) } : {};
        const cinemas = await cinemaModel_1.default.find(filter);
        res.status(200).json({ success: true, data: cinemas });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCinemas = getCinemas;
const getCinemaById = async (req, res) => {
    try {
        const cinema = await cinemaModel_1.default.findById(req.params.id);
        if (!cinema) {
            res.status(404).json({ success: false, message: "Không tìm thấy rạp" });
            return;
        }
        res.status(200).json({ success: true, data: cinema });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCinemaById = getCinemaById;
// Admin: thêm cụm rạp
const addCinema = async (req, res) => {
    try {
        const cinema = await cinemaModel_1.default.create(req.body);
        res.status(201).json({ success: true, data: cinema });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCinema = addCinema;
//# sourceMappingURL=cinemaController.js.map