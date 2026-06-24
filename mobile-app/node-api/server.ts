// mobile-app/node-api/server.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"; // Đã gắn tuyến đường đặt vé mới vào hệ thống
import movieRoutes from './routes/movieRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js"; // Tuyến đường thanh toán VNPay

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================\n// 1. CẤU HÌNH MIDDLEWARES TOÀN CỤC\n// ==========================================
app.use(cors());
app.use(express.json());

// TỐI ƯU: Đưa dòng log này lên trước các Router. 
// Nhờ vậy, khi Mobile gửi request (kể cả bị lỗi 404), Terminal của bạn vẫn in ra log rõ ràng.
app.use((req, res, next) => {
  console.log(`📡 [Incoming Request]: ${req.method} ${req.url}`);
  next();
});

// ==========================================\n// 2. KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB\n// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';
mongoose.connect(MONGODB_URI)
  .then((conn) => console.log(`🟢 [MongoDB]: Kết nối thành công tại: ${conn.connection.host}`))
  .catch((err) => console.error(`🔴 [Error]: Lỗi kết nối DB: ${err}`));

// ==========================================\n// 3. CẤU HÌNH CÁC TUYẾN ĐƯỜNG API (ROUTES)\n// ==========================================
app.use('/api/movies', movieRoutes);     // Quản lý danh sách phim & lịch chiếu
app.use("/api/auth", authRoutes);       // Quản lý đăng ký, đăng nhập & profile
app.use("/api/bookings", bookingRoutes); // Quản lý đặt vé & xem lịch sử mua vé
app.use("/api/payment", paymentRoutes);  // Thanh toán online qua VNPay

// Endpoint kiểm tra trạng thái nhanh khi gõ trực tiếp IP/Ngrok lên trình duyệt
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Hệ thống Movie Booking API (TypeScript) đang hoạt động mượt mà!');
});

// ==========================================\n// 4. KHỞI CHẠY SERVER\n// ==========================================
app.listen(PORT, () => {
  console.log(`📡 [Server]: API đang chạy trên cổng mạng: http://localhost:${PORT}`);
});