import mongoose from "mongoose";
import Movie from "../models/movieModel";
import Showtime from "../models/showtimeModel";

// Sử dụng 127.0.0.1 thay vì localhost để tránh lỗi phân giải tên miền chậm trên một số máy
const MONGO_URI = "mongodb://127.0.0.1:27017/mbooking"; 

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Đã kết nối MongoDB thành công...");

    // Xóa sạch dữ liệu cũ trong collection để làm mới dữ liệu test
    await Movie.collection.deleteMany({});
    await Showtime.collection.deleteMany({});
    console.log(" Đã làm sạch các bộ sưu tập dữ liệu cũ.");

    // 1. Tạo phim ĐANG CHIẾU (Hiển thị tại mục Now Playing ngoài App)
    const nowPlayingMovie = {
      title: "Avengers: Infinity War",
      poster_url: "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/e8vWyY2gJZQ8Uo171D7u0mG6.png", 
      duration: 149,
      genres: ["Action", "Sci-Fi"],
      status: "now_playing", 
      release_date: new Date("2018-04-27"),
      rating: 4.8,
      total_reviews: 1250
    };

    // 2. Tạo phim SẮP CHIẾU (Hiển thị tại mục Coming Soon ngoài App)
    const comingSoonMovie = {
      title: "Avatar: Fire and Ash",
      poster_url: "https://via.placeholder.com/300x450", 
      duration: 160,
      genres: ["Sci-Fi", "Adventure"],
      status: "coming_soon", 
      release_date: new Date("2025-12-19"),
      rating: 4.5,
      total_reviews: 0
    };

    // Thêm trực tiếp vào Collection để tránh bị nghẽn bởi Mongoose Schema Validation
    const resNowPlaying = await Movie.collection.insertOne(nowPlayingMovie);
    await Movie.collection.insertOne(comingSoonMovie);
    
    console.log(" Thêm danh sách phim mẫu thành công!");

    // 3. Tạo suất chiếu mẫu liên kết đến phim Đang Chiếu bằng insertedId
    const showtimeData = {
      movie_id: resNowPlaying.insertedId, // Đổi thành movie_id để đồng bộ với tầng service backend
      roomName: "IMAX Room 1",
      startTime: new Date("2026-06-10T14:15:00"),
      price: 70000
    };

    const showtimeResult = await Showtime.collection.insertOne(showtimeData);
    console.log(" Thêm suất chiếu mẫu thành công! ID Suất chiếu:", showtimeResult.insertedId);

    console.log("\n=== HOÀN TẤT NẠP DỮ LIỆU ĐỒ ÁN ===");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi trong quá trình chạy seed dữ liệu:", error);
    process.exit(1);
  }
}

seedData();