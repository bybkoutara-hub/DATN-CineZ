"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.cancelBooking = exports.getMyBookingHistory = exports.getMyBookings = exports.createBooking = void 0;
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const showtimeModel_1 = __importDefault(require("../models/showtimeModel"));
const comboModel_1 = __importDefault(require("../models/comboModel"));
// Tạo đơn đặt vé (chọn ghế + combo)
const createBooking = async (req, res) => {
    try {
        const { showtimeId, showtime: showtimeAlt, seats, combos, combo, totalPrice, paymentMethod } = req.body;
        const showtimeIdStr = showtimeId || showtimeAlt;
        if (!showtimeIdStr) {
            res.status(400).json({ success: false, message: "Thiếu thông tin suất chiếu" });
            return;
        }
        const st = await showtimeModel_1.default.findById(showtimeIdStr);
        if (!st) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        // Calculate price
        const seatPrice = st.price * (seats?.length ?? 0);
        let comboId = combo;
        let comboPrice = 0;
        if (combos && Array.isArray(combos) && combos.length > 0) {
            comboPrice = combos.reduce((sum, c) => sum + (c.price || 0) * (c.quantity || 1), 0);
        }
        else if (combo) {
            const found = await comboModel_1.default.findById(combo);
            if (found)
                comboPrice = found.price;
        }
        // Remove booked seats from showtime.availableSeats
        if (seats && Array.isArray(seats)) {
            st.availableSeats = st.availableSeats.filter((s) => !seats.includes(s));
            await st.save();
        }
        const booking = await bookingModel_1.default.create({
            user: req.user?.id,
            userId: req.user?.id,
            showtime: showtimeIdStr,
            showtimeId: showtimeIdStr,
            seats,
            combo: comboId,
            comboQuantity: combos?.length || 0,
            totalPrice: totalPrice || seatPrice + comboPrice,
            totalAmount: totalPrice || seatPrice + comboPrice,
            status: paymentMethod === "cash" ? "paid" : "pending",
            paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
            paymentMethod: paymentMethod || "cash",
            combos: combos || [],
        });
        res.status(201).json({ success: true, data: booking });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBooking = createBooking;
// Lịch sử vé của người dùng đang đăng nhập
const getMyBookings = async (req, res) => {
    try {
        const bookings = await bookingModel_1.default.find({ user: req.user?.id })
            .populate("showtime")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyBookings = getMyBookings;
// Lịch sử vé (mobile app gọi /my-history)
const getMyBookingHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const history = await bookingModel_1.default.find({ user: userId })
            .populate({
            path: "showtimeId",
            populate: { path: "movieId", select: "title poster_url duration" },
        })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: history.length, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message, error: error.message });
    }
};
exports.getMyBookingHistory = getMyBookingHistory;
// Hủy đơn đang chờ thanh toán (pending) và hoàn ghế
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const booking = await bookingModel_1.default.findById(id);
        if (!booking) {
            res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
            return;
        }
        if (String(booking.user) !== String(userId)) {
            res.status(403).json({ success: false, message: "Bạn không có quyền hủy đơn này." });
            return;
        }
        if (booking.status !== "pending") {
            res.status(400).json({ success: false, message: "Đơn này không ở trạng thái có thể hủy." });
            return;
        }
        // Hoàn ghế
        if (booking.seats && booking.seats.length > 0) {
            await showtimeModel_1.default.findByIdAndUpdate(booking.showtimeId, {
                $addToSet: { availableSeats: { $each: booking.seats } },
            });
        }
        booking.status = "cancelled";
        booking.paymentStatus = "cancelled";
        await booking.save();
        res.status(200).json({ success: true, message: "Đã hủy đơn và hoàn ghế." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy đơn", error: error.message });
    }
};
exports.cancelBooking = cancelBooking;
const getBookingById = async (req, res) => {
    try {
        const booking = await bookingModel_1.default.findById(req.params.id).populate("showtime").populate("combo");
        if (!booking) {
            res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
            return;
        }
        res.status(200).json({ success: true, data: booking });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBookingById = getBookingById;
//# sourceMappingURL=bookingController.js.map