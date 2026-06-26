import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';

const cinemaSchema = new mongoose.Schema({ name: String, address: String });
const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", cinemaSchema);

const comboSchema = new mongoose.Schema({ name: String, price: Number, description: String });
const Combo = mongoose.models.Combo || mongoose.model("Combo", comboSchema);

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
    console.log("🧹 [Seed]: Đã làm sạch toàn bộ dữ liệu cũ.");

    // 2. Thêm Rạp phim & Combo bắp nước mẫu
    await Cinema.insertMany([
      { name: "MBooking Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM" },
      { name: "MBooking Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM" }
    ]);
    await Combo.insertMany([
      { name: "Combo Solo", price: 65000, description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn" },
      { name: "Combo Couple", price: 95000, description: "1 Bắp lớn + 2 Nước ngọt ly lớn" }
    ]);

    // 3. Nạp 12 phim — poster TMDB đã được kiểm tra khớp ĐÚNG với tên phim
    const TMDB = "https://image.tmdb.org/t/p/w500";
    const movieList = [
      // ===== 7 phim ĐANG CHIẾU =====
      {
        title: "Spider-Man: No Way Home",
        poster_url: `${TMDB}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg`,
        duration: 148, genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        status: "now_playing", release_date: new Date("2025-12-17"),
        rating: 4.8, total_reviews: 3120,
        description: "Danh tính Người Nhện bị lộ, Peter nhờ Doctor Strange giúp đỡ, vô tình mở ra đa vũ trụ đầy hiểm nguy.",
        director: "Jon Watts", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Avatar: The Way of Water",
        poster_url: `${TMDB}/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg`,
        duration: 192, genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2025-12-19"),
        rating: 4.7, total_reviews: 1820,
        description: "Jake Sully và Neytiri cùng các con rời rừng già, tìm đến bộ tộc người Na'vi vùng biển để lánh nạn và bảo vệ gia đình.",
        director: "James Cameron", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Avengers: Endgame",
        poster_url: `${TMDB}/or06FN3Dka5tukK1e9sl16pB3iy.jpg`,
        duration: 181, genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-02-01"),
        rating: 4.9, total_reviews: 5400,
        description: "Sau cú búng tay của Thanos, các Avengers còn sót lại tập hợp lần cuối để đảo ngược tất cả.",
        director: "Anthony & Joe Russo", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "John Wick: Chapter 4",
        poster_url: `${TMDB}/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg`,
        duration: 169, genres: ["Hành động", "Tội phạm", "Kịch tính"],
        status: "now_playing", release_date: new Date("2026-03-04"),
        rating: 4.6, total_reviews: 2410,
        description: "John Wick tìm cách thoát khỏi Hội Đồng Tối Cao, đối đầu những sát thủ nguy hiểm nhất khắp thế giới.",
        director: "Chad Stahelski", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Inception",
        poster_url: `${TMDB}/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`,
        duration: 148, genres: ["Khoa học viễn tưởng", "Hành động", "Kịch tính"],
        status: "now_playing", release_date: new Date("2026-02-20"),
        rating: 4.8, total_reviews: 4200,
        description: "Một tên trộm chuyên đánh cắp bí mật từ giấc mơ nhận nhiệm vụ gieo một ý tưởng vào tiềm thức mục tiêu.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Dune: Part Two",
        poster_url: `${TMDB}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg`,
        duration: 166, genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-03-01"),
        rating: 4.7, total_reviews: 1980,
        description: "Paul Atreides liên minh cùng người Fremen, dấn thân vào hành trình báo thù và định mệnh của cả vũ trụ.",
        director: "Denis Villeneuve", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Wonder Woman 1984",
        poster_url: `${TMDB}/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg`,
        duration: 151, genres: ["Hành động", "Giả tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-01-15"),
        rating: 4.1, total_reviews: 1340,
        description: "Diana Prince đối đầu hai kẻ thù mới là Cheetah và Maxwell Lord giữa thập niên 1980 rực rỡ.",
        director: "Patty Jenkins", language: "Tiếng Anh (phụ đề Việt)",
      },
      // ===== 5 phim SẮP CHIẾU =====
      {
        title: "Oppenheimer",
        poster_url: `${TMDB}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
        duration: 180, genres: ["Chính kịch", "Lịch sử"],
        status: "coming_soon", release_date: new Date("2026-10-05"),
        rating: 4.8, total_reviews: 1120,
        description: "Câu chuyện về J. Robert Oppenheimer, cha đẻ của bom nguyên tử và những day dứt đạo đức của ông.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Barbie",
        poster_url: `${TMDB}/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg`,
        duration: 114, genres: ["Hài", "Phiêu lưu", "Giả tưởng"],
        status: "coming_soon", release_date: new Date("2026-08-25"),
        rating: 4.2, total_reviews: 760,
        description: "Barbie rời khỏi thế giới hoàn hảo Barbie Land để khám phá thế giới loài người đầy bất ngờ.",
        director: "Greta Gerwig", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Interstellar",
        poster_url: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
        duration: 169, genres: ["Khoa học viễn tưởng", "Chính kịch", "Phiêu lưu"],
        status: "coming_soon", release_date: new Date("2026-09-30"),
        rating: 4.9, total_reviews: 3300,
        description: "Nhóm phi hành gia du hành qua hố sâu không-thời gian để tìm ngôi nhà mới cho nhân loại.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
      },
      {
        title: "Parasite",
        poster_url: `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
        duration: 132, genres: ["Chính kịch", "Hài", "Kịch tính"],
        status: "coming_soon", release_date: new Date("2026-11-12"),
        rating: 4.6, total_reviews: 1450,
        description: "Gia đình nghèo họ Kim từng bước thâm nhập vào cuộc sống của một gia đình giàu có, dẫn đến bi kịch khó lường.",
        director: "Bong Joon-ho", language: "Tiếng Hàn (phụ đề Việt)",
      },
      {
        title: "Fight Club",
        poster_url: `${TMDB}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`,
        duration: 139, genres: ["Chính kịch", "Kịch tính"],
        status: "coming_soon", release_date: new Date("2026-12-20"),
        rating: 4.7, total_reviews: 2890,
        description: "Một nhân viên văn phòng mất ngủ cùng gã bán xà phòng lập nên câu lạc bộ đánh nhau bí mật, dẫn tới hệ quả khôn lường.",
        director: "David Fincher", language: "Tiếng Anh (phụ đề Việt)",
      },
    ];
    const createdMovies = await Movie.insertMany(movieList);
    console.log(`🎬 [Seed]: Đã nạp xong ${createdMovies.length} phim (poster khớp tên).`);

    // 4. Hàm tạo 20 ghế mặc định tự động từ A1 -> B10
    const generateDefaultSeats = (): string[] => {
      const seats: string[] = [];
      for (const row of ["A", "B"]) {
        for (let i = 1; i <= 10; i++) {
          seats.push(`${row}${i}`);
        }
      }
      return seats;
    };

    // 5. Tạo suất chiếu tự động cho TẤT CẢ phim đang chiếu (mỗi phim 2 suất)
    const rooms = [
      { name: "Phòng Chiếu 01 (IMAX)", price: 120000, hour: 18, minute: 30 },
      { name: "Phòng Chiếu 03 (2D Standard)", price: 75000, hour: 21, minute: 0 },
    ];
    const sampleShowtimes: any[] = [];
    createdMovies
      .filter((m: any) => m.status === "now_playing")
      .forEach((movie: any, idx: number) => {
        rooms.forEach((room) => {
          const start = new Date("2026-08-20T00:00:00.000Z");
          start.setDate(start.getDate() + idx); // mỗi phim một ngày chiếu khác nhau
          start.setHours(room.hour, room.minute, 0, 0);
          sampleShowtimes.push({
            movieId: movie._id,
            roomName: room.name,
            startTime: start,
            price: room.price,
            availableSeats: generateDefaultSeats(),
          });
        });
      });

    await Showtime.insertMany(sampleShowtimes);
    console.log(`🟢 [Seed]: Đã tạo ${sampleShowtimes.length} suất chiếu cho các phim đang chiếu.`);

  } catch (error) {
    console.error("🔴 [Seed] Thất bại:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 [Seed]: Đã ngắt kết nối an toàn.");
  }
}

seedDatabase();
