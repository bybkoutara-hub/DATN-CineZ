"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movieModel_1 = __importDefault(require("../models/movieModel"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const showtimeModel_1 = __importDefault(require("../models/showtimeModel"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/movies", async (req, res) => {
    try {
        const status = req.query.status;
        const filter = status ? { status } : {};
        const movies = await movieModel_1.default.find(filter).sort({ release_date: -1 });
        res.status(200).json({ success: true, data: movies });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy phim mobile", error: error.message });
    }
});
router.post("/bookings", auth_middleware_1.protect, async (req, res) => {
    try {
        const { showtime, seats, combo, totalPrice } = req.body;
        const st = await showtimeModel_1.default.findById(showtime);
        if (!st) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        const booking = await bookingModel_1.default.create({
            user: req.user?.id,
            showtime,
            seats,
            combo,
            totalPrice,
            status: "paid",
        });
        res.status(201).json({ success: true, message: "Đặt vé xem phim thành công!", data: booking });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xử lý đặt vé", error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=mobileRoutes.js.map