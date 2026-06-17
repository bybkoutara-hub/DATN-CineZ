// mobile-app/node-api/server.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import movieRoutes from './routes/movieRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware chống chặn CORS
app.use(cors());
app.use(express.json());

// Kết nối trực tiếp cơ sở dữ liệu MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';
mongoose.connect(MONGODB_URI)
  .then((conn) => console.log(`🟢 [MongoDB]: Kết nối thành công tại: ${conn.connection.host}`))
  .catch((err) => console.error(`🔴 [Error]: Lỗi kết nối DB: ${err}`));

// Cấu hình Tuyến đường API
app.use('/api/movies', movieRoutes);
app.use((req, res, next) => {
  console.log(`📡 [Incoming Request]: ${req.method} ${req.url}`);
  next();
});

// Endpoint kiểm tra trạng thái nhanh
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Hệ thống Movie Booking API (TypeScript) đang hoạt động mượt mà!');
});

app.listen(PORT, () => {
  console.log(`📡 [Server]: API đang chạy trên cổng mạng: http://localhost:${PORT}`);
});