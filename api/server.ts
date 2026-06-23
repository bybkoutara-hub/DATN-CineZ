import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import movieRoutes from "./routes/movieRoutes";
import authRoutes from "./routes/authRoutes";
import cinemaRoutes from "./routes/cinemaRoutes";
import showtimeRoutes from "./routes/showtimeRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import comboRoutes from "./routes/comboRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
mongoose
  .connect(MONGODB_URI)
  .then((conn) => console.log(`[MongoDB]: Kết nối thành công tại: ${conn.connection.host}`))
  .catch((err) => console.error(`[Error]: Lỗi kết nối DB: ${err}`));

// Routes API (CineZ clone)
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (_req, res) => {
  res.send("Hệ thống CineZ Movie Booking API đang chạy! 🎬");
});

app.listen(PORT, () => {
  console.log(`[Server]: API đang hoạt động tại port ${PORT}`);
});
