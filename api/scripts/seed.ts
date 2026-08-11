import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";
import User from "../models/userModel.js";
import Cinema from "../models/cinemaModel.js";
import Combo from "../models/comboModel.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';

async function seedDatabase() {
  try {
    console.log("⏳ [Seed]: Đang kết nối tới database...");
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 [Seed]: Kết nối MongoDB thành công.");

    // 1. Làm sạch dữ liệu cũ để nạp mới hoàn toàn
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await Cinema.deleteMany({});
    await Combo.deleteMany({});
    // Chỉ xóa tài khoản demo (username seed). KHÔNG xóa user đăng ký thật từ app
    // để tránh mất tài khoản/booking reference.
    await User.deleteMany({
      $or: [
        { username: { $in: ["admin", "staff01", "staff02", "user01", "user02", "user03", "user04", "user05"] } },
        { role: { $in: ["admin", "staff"] } },
      ],
    });
    console.log("🧹 [Seed]: Đã làm sạch toàn bộ dữ liệu cũ.");

    // 2. Tạo tài khoản Admin mặc định
    const adminPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      username: "admin",
      password: adminPassword,
      fullName: "Quản trị viên",
      email: "admin@cinez.com",
      role: "admin",
    });
    console.log("👤 [Seed]: Đã tạo tài khoản Admin (admin / admin123).");

    // 3. Thêm Rạp phim & Combo bắp nước mẫu
    await Cinema.insertMany([
      { name: "CineZ Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM", city: "Hồ Chí Minh" },
      { name: "CineZ Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM", city: "Hồ Chí Minh" }
    ]);
    await Combo.insertMany([
      { name: "Combo Solo", price: 65000, description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn" },
      { name: "Combo Couple", price: 95000, description: "1 Bắp lớn + 2 Nước ngọt ly lớn" }
    ]);

    // 4. Nạp dữ liệu PHIM SIÊU CHI TIẾT (Đầy đủ các trường để lên giao diện Mobile đẹp mắt)
    const createdMovies = await Movie.insertMany([
      {
        title: "Lật Mặt 7: Một Điều Ước",
        poster_url: "https://image.tmdb.org/t/p/w500/2mg6ktvWxsOG9iMBP4P1pwOYltk.jpg",
        duration: 138,
        genres: ["Gia đình", "Tình cảm", "Kịch tính"],
        status: "now_playing",
        release_date: new Date("2026-04-30"),
        rating: 4.9,
        total_reviews: 2450,

        description: "Câu chuyện xoay quanh bà Hai, một người mẹ tảo tần nuôi dạy 5 người con khôn lớn. Khi bà gặp tai nạn, những góc khuất và xung đột trong gia đình bắt đầu lộ diện, đặt ra câu hỏi nhức nhối về trách nhiệm phụng dưỡng cha mẹ ở xã hội hiện đại.",
        director: "Lý Hải",
        cast: ["Thanh Hiền", "Trương Minh Cường", "Đinh Y Nhung", "Quách Ngọc Tuyên"],
        language: "Tiếng Việt (Có phụ đề tiếng Anh)",
      },
      {
        title: "Avatar: Fire and Ash",
        poster_url: "https://image.tmdb.org/t/p/w500/w6DBmG260sCHBQdGzkBIVn9gAQZ.jpg",
        duration: 160,
        genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing",
        release_date: new Date("2025-12-19"),
        rating: 4.7,
        total_reviews: 1820,

        description: "Hành trình trở lại hành tinh Pandora đầy trắc trở. Lần này, Jake Sully và Neytiri phải đối mặt với một bộ tộc người Na'vi mới hung hãn đại diện cho nguyên tố Lửa và Tro tàn, đe dọa sự sống còn của toàn bộ gia tộc.",
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Oona Chaplin"],
        language: "Tiếng Anh (Phụ đề tiếng Việt)",
      }
    ]);
    console.log("🎬 [Seed]: Đã nạp xong 2 phim siêu chi tiết.");

    // 5. Hàm tạo 20 ghế mặc định tự động từ A1 -> B10
    const generateDefaultSeats = (): string[] => {
      const seats: string[] = [];
      for (const row of ["A", "B"]) {
        for (let i = 1; i <= 10; i++) {
          seats.push(`${row}${i}`);
        }
      }
      return seats;
    };

    // 6. Lấy các bộ phim vừa tạo ra để map ID
    const latMatPhim = createdMovies[0];
    const avatarPhim = createdMovies[1];

    // FIX LỖI: Thêm đoạn kiểm tra này để TypeScript biết chắc chắn dữ liệu tồn tại
    if (!latMatPhim || !avatarPhim) {
      console.log("🔴 [Seed] Thất bại: Không khởi tạo đủ dữ liệu phim mẫu.");
      return;
    }

    // 7. Tạo suất chiếu với ngày động (now + 2~7 ngày) để luôn còn hiệu lực
    const makeDate = (daysFromNow: number, hours: number, minutes: number): Date => {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };
    const sampleShowtimes = [
      {
        movie: latMatPhim._id,
        roomName: "Phòng Chiếu 01 (IMAX)",
        startTime: makeDate(2, 18, 30),
        price: 90000,
        availableSeats: generateDefaultSeats()
      },
      {
        movie: latMatPhim._id,
        roomName: "Phòng Chiếu 03 (2D Standard)",
        startTime: makeDate(3, 21, 0),
        price: 75000,
        availableSeats: generateDefaultSeats()
      },
      {
        movie: avatarPhim._id,
        roomName: "Phòng Chiếu 02 (3D VIP)",
        startTime: makeDate(4, 19, 45),
        price: 120000,
        availableSeats: generateDefaultSeats()
      }
    ];

    await Showtime.insertMany(sampleShowtimes);
    console.log(`🟢 [Seed]: Đã tạo các suất chiếu mẫu cho phim "${latMatPhim.title}" và "${avatarPhim.title}" thành công!`);

  } catch (error) {
    console.error("🔴 [Seed] Thất bại:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 [Seed]: Đã ngắt kết nối an toàn.");
  }
}

seedDatabase();