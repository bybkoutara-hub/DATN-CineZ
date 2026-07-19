"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShowtimeById = exports.getShowtimes = void 0;
const showtimeModel_1 = __importDefault(require("../models/showtimeModel"));
// Lấy suất chiếu theo phim ?movieId=...
const getShowtimes = async (req, res) => {
    try {
        const { movieId } = req.query;
        const filter = {};
        if (movieId)
            filter.movieId = movieId;
        filter.startTime = { $gte: new Date() }; // chỉ lấy suất sắp chiếu
        const showtimes = await showtimeModel_1.default.find(filter).sort({ startTime: 1 });
        res.status(200).json({ success: true, data: showtimes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getShowtimes = getShowtimes;
const getShowtimeById = async (req, res) => {
    try {
        const showtime = await showtimeModel_1.default.findById(req.params.id);
        if (!showtime) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        res.status(200).json({ success: true, data: showtime });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getShowtimeById = getShowtimeById;
//# sourceMappingURL=showtimeController.js.map