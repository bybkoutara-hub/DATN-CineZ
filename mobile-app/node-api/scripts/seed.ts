import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";
import { Combo } from "../models/comboModel.js";
import { User } from "../models/userModel.js";
import Booking from "../models/bookingModel.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';

const cinemaSchema = new mongoose.Schema({ name: String, address: String });
const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", cinemaSchema);

async function seedDatabase() {
  try {
    console.log("⏳ Đang kết nối tới database...");
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 Kết nối MongoDB thành công.");

    // === XÓA DỮ LIỆU CŨ ===
    await Promise.all([
      Movie.deleteMany({}),
      Showtime.deleteMany({}),
      Cinema.deleteMany({}),
      Combo.deleteMany({}),
      User.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    await mongoose.connection.collection("users").dropIndexes().catch(() => {});
    console.log("🧹 Đã làm sạch toàn bộ dữ liệu cũ.");

    // === RẠP CHIẾU ===
    const cinemas = await Cinema.insertMany([
      { name: "MBooking Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM" },
      { name: "MBooking Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM" },
      { name: "MBooking Vincom Thảo Điền", address: "Nguyễn Văn Hưởng, Thảo Điền, TP.Thủ Đức" },
    ]);
    console.log(`🏢 Đã thêm ${cinemas.length} rạp chiếu.`);

    // === COMBO BẮP NƯỚC ===
    const combos = await Combo.insertMany([
      { name: "Combo Solo", price: 65000, description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn", image_url: "", isAvailable: true },
      { name: "Combo Couple", price: 95000, description: "1 Bắp lớn + 2 Nước ngọt ly lớn", image_url: "", isAvailable: true },
      { name: "Combo Family", price: 149000, description: "2 Bắp lớn + 4 Nước ngọt ly lớn", image_url: "", isAvailable: true },
      { name: "Combo Student", price: 45000, description: "1 Bắp vừa + 1 Nước ngọt vừa", image_url: "", isAvailable: true },
      { name: "Combo VIP", price: 199000, description: "1 Bắp caramel + 2 Nước nhập khẩu + Bỏng gà phô mai", image_url: "", isAvailable: true },
    ]);
    console.log(`🍿 Đã thêm ${combos.length} combo bắp nước.`);

    // === NGƯỜI DÙNG MẪU ===
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);
    const users = await User.insertMany([
      { name: "Nguyễn Văn A", email: "user1@test.com", password: hashedPassword, phone: "0901111111", role: "user" },
      { name: "Trần Thị B", email: "user2@test.com", password: hashedPassword, phone: "0902222222", role: "user" },
      { name: "Lê Văn C", email: "user3@test.com", password: hashedPassword, phone: "0903333333", role: "user" },
      { name: "Admin", email: "admin@test.com", password: hashedPassword, phone: "0909999999", role: "admin" },
    ]);
    console.log(`👤 Đã thêm ${users.length} người dùng (mật khẩu: 123456).`);

    // === PHIM ===
    const TMDB = "https://image.tmdb.org/t/p/w500";
    const movieList = [
      // ===== PHIM ĐANG CHIẾU =====
      {
        title: "Spider-Man: No Way Home",
        poster_url: `${TMDB}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg`,
        duration: 148, genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        status: "now_playing", release_date: new Date("2025-12-17"),
        rating: 4.8, total_reviews: 3120,
        description: "Danh tính Người Nhện bị lộ, Peter nhờ Doctor Strange giúp đỡ, vô tình mở ra đa vũ trụ đầy hiểm nguy.",
        director: "Jon Watts", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Tom Holland, Zendaya, Benedict Cumberbatch',
      },
      {
        title: "Avatar: The Way of Water",
        poster_url: `${TMDB}/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg`,
        duration: 192, genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2025-12-19"),
        rating: 4.7, total_reviews: 1820,
        description: "Jake Sully và Neytiri cùng các con rời rừng già, tìm đến bộ tộc người Na'vi vùng biển để lánh nạn và bảo vệ gia đình.",
        director: "James Cameron", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Sam Worthington, Zoe Saldaña, Sigourney Weaver'
      },
      {
        title: "Avengers: Endgame",
        poster_url: `${TMDB}/or06FN3Dka5tukK1e9sl16pB3iy.jpg`,
        duration: 181, genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-02-01"),
        rating: 4.9, total_reviews: 5400,
        description: "Sau cú búng tay của Thanos, các Avengers còn sót lại tập hợp lần cuối để đảo ngược tất cả.",
        director: "Anthony & Joe Russo", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Robert Downey Jr., Chris Evans, Mark Ruffalo'
      },
      {
        title: "John Wick: Chapter 4",
        poster_url: `${TMDB}/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg`,
        duration: 169, genres: ["Hành động", "Tội phạm", "Kịch tính"],
        status: "now_playing", release_date: new Date("2026-03-04"),
        rating: 4.6, total_reviews: 2410,
        description: "John Wick tìm cách thoát khỏi Hội Đồng Tối Cao, đối đầu những sát thủ nguy hiểm nhất khắp thế giới.",
        director: "Chad Stahelski", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Keanu Reeves, Donnie Yen, Bill Skarsgård',
      },
      {
        title: "Inception",
        poster_url: `${TMDB}/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`,
        duration: 148, genres: ["Khoa học viễn tưởng", "Hành động", "Kịch tính"],
        status: "now_playing", release_date: new Date("2026-02-20"),
        rating: 4.8, total_reviews: 4200,
        description: "Một tên trộm chuyên đánh cắp bí mật từ giấc mơ nhận nhiệm vụ gieo một ý tưởng vào tiềm thức mục tiêu.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page'
      },
      {
        title: "Dune: Part Two",
        poster_url: `${TMDB}/d5NXSklXo0qyIYkgV94XAgMIckC.jpg`,
        duration: 166, genres: ["Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-03-01"),
        rating: 4.7, total_reviews: 1980,
        description: "Paul Atreides liên minh cùng người Fremen, dấn thân vào hành trình báo thù và định mệnh của cả vũ trụ.",
        director: "Denis Villeneuve", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Timothée Chalamet, Rebecca Ferguson, Zendaya'
      },
      {
        title: "Wonder Woman 1984",
        poster_url: `${TMDB}/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg`,
        duration: 151, genres: ["Hành động", "Giả tưởng", "Phiêu lưu"],
        status: "now_playing", release_date: new Date("2026-01-15"),
        rating: 4.1, total_reviews: 1340,
        description: "Diana Prince đối đầu hai kẻ thù mới là Cheetah và Maxwell Lord giữa thập niên 1980 rực rỡ.",
        director: "Patty Jenkins", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Gal Gadot, Chris Pine, Kristen Wiig'
      },
      {
        title: "The Dark Knight",
        poster_url: `${TMDB}/qJ2tW6WMUDux911BytUrC7vJ7K2.jpg`,
        duration: 152, genres: ["Hành động", "Tội phạm", "Chính kịch"],
        status: "now_playing", release_date: new Date("2026-04-10"),
        rating: 4.9, total_reviews: 6800,
        description: "Batman đối đầu với Joker, tên tội phạm hỗn loạn đẩy Gotham vào cuộc khủng hoảng sinh tử.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Christian Bale, Heath Ledger, Aaron Eckhart'
      },
      // ===== PHIM SẮP CHIẾU =====
      {
        title: "Oppenheimer",
        poster_url: `${TMDB}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
        duration: 180, genres: ["Chính kịch", "Lịch sử"],
        status: "coming_soon", release_date: new Date("2026-10-05"),
        rating: 4.8, total_reviews: 1120,
        description: "Câu chuyện về J. Robert Oppenheimer, cha đẻ của bom nguyên tử và những day dứt đạo đức của ông.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Cillian Murphy, Emily Blunt, Matt Damon'
      },
      {
        title: "Barbie",
        poster_url: `${TMDB}/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg`,
        duration: 114, genres: ["Hài", "Phiêu lưu", "Giả tưởng"],
        status: "coming_soon", release_date: new Date("2026-08-25"),
        rating: 4.2, total_reviews: 760,
        description: "Barbie rời khỏi thế giới hoàn hảo Barbie Land để khám phá thế giới loài người đầy bất ngờ.",
        director: "Greta Gerwig", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Margot Robbie, Ryan Gosling, America Ferrera'
      },
      {
        title: "Interstellar",
        poster_url: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
        duration: 169, genres: ["Khoa học viễn tưởng", "Chính kịch", "Phiêu lưu"],
        status: "coming_soon", release_date: new Date("2026-09-30"),
        rating: 4.9, total_reviews: 3300,
        description: "Nhóm phi hành gia du hành qua hố sâu không-thời gian để tìm ngôi nhà mới cho nhân loại.",
        director: "Christopher Nolan", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain'
      },
      {
        title: "Parasite",
        poster_url: `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
        duration: 132, genres: ["Chính kịch", "Hài", "Kịch tính"],
        status: "coming_soon", release_date: new Date("2026-11-12"),
        rating: 4.6, total_reviews: 1450,
        description: "Gia đình nghèo họ Kim từng bước thâm nhập vào cuộc sống của một gia đình giàu có, dẫn đến bi kịch khó lường.",
        director: "Bong Joon-ho", language: "Tiếng Hàn (phụ đề Việt)",
        cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong'
      },
      {
        title: "Fight Club",
        poster_url: `${TMDB}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`,
        duration: 139, genres: ["Chính kịch", "Kịch tính"],
        status: "coming_soon", release_date: new Date("2026-12-20"),
        rating: 4.7, total_reviews: 2890,
        description: "Một nhân viên văn phòng mất ngủ cùng gã bán xà phòng lập nên câu lạc bộ đánh nhau bí mật, dẫn tới hệ quả khôn lường.",
        director: "David Fincher", language: "Tiếng Anh (phụ đề Việt)",
        cast: 'Edward Norton, Brad Pitt, Helena Bonham Carter'
      },
    ];
    const createdMovies: any[] = await Movie.insertMany(movieList);
    console.log(`🎬 Đã thêm ${createdMovies.length} phim.`);

    // === SUẤT CHIẾU ===
    const generateDefaultSeats = (): string[] => {
      const seats: string[] = [];
      for (const row of ["A", "B", "C", "D", "E", "F", "G", "H"]) {
        for (let i = 1; i <= 12; i++) {
          seats.push(`${row}${i}`);
        }
      }
      return seats;
    };

    const rooms = [
      { name: "Phòng Chiếu 01 (IMAX)", price: 120000 },
      { name: "Phòng Chiếu 02 (3D)", price: 100000 },
      { name: "Phòng Chiếu 03 (2D Standard)", price: 75000 },
    ];

    const timeSlots = [
      { hour: 9, minute: 0 },
      { hour: 11, minute: 30 },
      { hour: 14, minute: 0 },
      { hour: 16, minute: 30 },
      { hour: 19, minute: 0 },
      { hour: 21, minute: 30 },
    ];

    const sampleShowtimes: any[] = [];
    const nowPlayingMovies: any[] = createdMovies.filter((m: any) => m.status === "now_playing");
    const baseDate = new Date("2026-08-20T00:00:00.000Z");

    for (let day = 0; day < 7; day++) {
      nowPlayingMovies.forEach((movie: any, movieIdx: number) => {
        rooms.forEach((room) => {
          if (movieIdx === 0 && room.name.includes("IMAX") && day >= 5) return;
          if (movieIdx > 6 && room.name.includes("IMAX")) return;
          const slotsPerDay = movieIdx < 4 ? timeSlots : timeSlots.filter((_, i) => i % 2 === 0);
          slotsPerDay.forEach((slot) => {
            const start = new Date(baseDate);
            start.setDate(start.getDate() + day);
            start.setHours(slot.hour, slot.minute, 0, 0);
            sampleShowtimes.push({
              movieId: movie._id,
              roomName: room.name,
              startTime: start,
              price: room.price,
              availableSeats: generateDefaultSeats(),
            });
          });
        });
      });
    }

    const createdShowtimes: any[] = await Showtime.insertMany(sampleShowtimes);
    console.log(`🕐 Đã tạo ${createdShowtimes.length} suất chiếu (7 ngày, nhiều khung giờ).`);

    // === ĐƠN ĐẶT VÉ MẪU ===
    const bookingSeatsPool = [
      ["A1", "A2", "A3"],
      ["B5", "B6"],
      ["C10", "C11", "C12", "D1"],
      ["E3", "E4"],
      ["F7", "F8", "F9"],
      ["G2"],
      ["H5", "H6", "H7"],
      ["A10", "A11"],
    ];

    const bookingData = createdShowtimes.slice(0, 8).map((showtime, idx) => {
      const user = users[idx % users.length];
      const seats = bookingSeatsPool[idx]!;
      return {
        userId: user._id,
        showtimeId: showtime._id,
        seats,
        combos: [
          { name: combos[idx % combos.length].name, quantity: 1, price: combos[idx % combos.length].price },
        ],
        totalPrice: showtime.price * seats.length + combos[idx % combos.length].price,
        status: idx < 6 ? "completed" : "cancelled",
        paymentMethod: idx < 4 ? "Tiền mặt tại quầy" : "VNPay",
      };
    });

    await Booking.insertMany(bookingData);
    console.log(`🎫 Đã tạo ${bookingData.length} đơn đặt vé mẫu.`);

    // === CẬP NHẬT GHẾ ĐÃ ĐẶT ===
    for (const booking of bookingData) {
      if (booking.status === "completed") {
        await Showtime.updateOne(
          { _id: booking.showtimeId },
          { $pull: { availableSeats: { $in: booking.seats } } }
        );
      }
    }
    console.log("💺 Đã cập nhật ghế đã đặt cho các suất chiếu.");

    console.log("\n✅ SEED THÀNH CÔNG!");
    console.log(`   📍 Database: ${MONGODB_URI}`);
    console.log(`   🎬 Phim: ${createdMovies.length}`);
    console.log(`   🕐 Suất chiếu: ${createdShowtimes.length}`);
    console.log(`   👤 Người dùng: ${users.length} (mật khẩu: 123456)`);
    console.log(`   🍿 Combo: ${combos.length}`);
    console.log(`   🎫 Đơn đặt vé mẫu: ${bookingData.length}`);
    console.log(`   🏢 Rạp: ${cinemas.length}`);
    console.log(`\n📧 Email test: user1@test.com, user2@test.com, user3@test.com, admin@test.com`);
    console.log(`🔑 Mật khẩu: 123456\n`);

  } catch (error) {
    console.error("🔴 SEED THẤT BẠI:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối database.");
  }
}

seedDatabase();
