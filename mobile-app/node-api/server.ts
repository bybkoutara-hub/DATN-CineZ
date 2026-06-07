// mobile-app/node-api/server.ts
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import movieRoutes from './routes/movieRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối trực tiếp MongoDB 
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';
mongoose.connect(MONGODB_URI)
  .then((conn) => console.log(`[MongoDB]: Kết nối thành công tại: ${conn.connection.host}`))
  .catch((err) => console.error(`[Error]: Lỗi kết nối DB: ${err}`));

// Routes API
app.use('/api/movies', movieRoutes);

app.get('/', (req, res) => {
  res.send('Hệ thống Movie Booking API đang chạy!');
});

app.listen(PORT, () => {
  console.log(`[Server]: API đang hoạt động tại port ${PORT}`);
});