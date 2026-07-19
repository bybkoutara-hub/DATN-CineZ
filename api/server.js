"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const movieRoutes_1 = __importDefault(require("./routes/movieRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cinemaRoutes_1 = __importDefault(require("./routes/cinemaRoutes"));
const showtimeRoutes_1 = __importDefault(require("./routes/showtimeRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const comboRoutes_1 = __importDefault(require("./routes/comboRoutes"));
const promotionRoutes_1 = __importDefault(require("./routes/promotionRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const mobileRoutes_1 = __importDefault(require("./routes/mobileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
mongoose_1.default
    .connect(MONGODB_URI)
    .then((conn) => console.log(`[MongoDB]: Kết nối thành công tại: ${conn.connection.host}`))
    .catch((err) => console.error(`[Error]: Lỗi kết nối DB: ${err}`));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/movies", movieRoutes_1.default);
app.use("/api/cinemas", cinemaRoutes_1.default);
app.use("/api/showtimes", showtimeRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/combos", comboRoutes_1.default);
app.use("/api/promotions", promotionRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/mobile", mobileRoutes_1.default);
app.get("/", (_req, res) => {
    res.send("Hệ thống CineZ Movie Booking API đang chạy! 🎬");
});
app.listen(PORT, () => {
    console.log(`[Server]: API đang hoạt động tại port ${PORT}`);
});
//# sourceMappingURL=server.js.map