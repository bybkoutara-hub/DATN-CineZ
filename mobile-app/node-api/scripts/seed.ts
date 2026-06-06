import mongoose from "mongoose";
import Movie from "../models/movieModel";
import Showtime from "../models/showtimeModel";

const MONGO_URI = "mongodb://localhost:27017/mbooking"; 

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Đã kết nối MongoDB thành công...");

    // Xóa sạch dữ liệu cũ
    await Movie.deleteMany({});
    await Showtime.deleteMany({});

    // 1. Tạo phim ĐANG CHIẾU (Thử cả 2 kiểu chữ thường và chữ hoa để chắc chắn Backend bốc được)
    const nowPlayingMovie = {
      title: "Avengers: Infinity War",
      poster_url: "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/e8vWyY2gJZQ8Uo171D7u0mG6.png", 
      duration: 149,
      genres: ["Action", "Sci-Fi"],
      status: "now_playing", // Cấp chữ thường theo chuẩn thông thường
      release_date: new Date("2018-04-27")
    };

    // 2. Tạo thêm một phim SẮP CHIẾU để hiển thị ở mục Coming Soon
    const comingSoonMovie = {
      title: "Avatar: Fire and Ash",
      poster_url: "https://via.placeholder.com/300x450", 
      duration: 160,
      genres: ["Sci-Fi", "Adventure"],
      status: "coming_soon", // Trạng thái phim sắp chiếu
      release_date: new Date("2025-12-19")
    };

    // Thêm phim vào DB (Bypass validation để an toàn)
    const resNowPlaying = await Movie.collection.insertOne(nowPlayingMovie);
    await Movie.collection.insertOne(comingSoonMovie);
    
    console.log(" Thêm danh sách phim thành công!");

    // 3. Tạo suất chiếu mẫu kết nối với phim Đang Chiếu
    const showtimeData = {
      movieId: resNowPlaying.insertedId,
      roomName: "IMAX Room 1",
      startTime: new Date("2026-06-10T14:15:00"),
      price: 70000
    };

    const showtimeResult = await Showtime.collection.insertOne(showtimeData);
    console.log(" Thêm suất chiếu mẫu thành công! ID:", showtimeResult.insertedId);

    console.log("\n=== HOÀN TẤT CẤP DỮ LIỆU ===");
    process.exit();
  } catch (error) {
    console.error("Lỗi seeding:", error);
    process.exit(1);
  }
}

seedData();