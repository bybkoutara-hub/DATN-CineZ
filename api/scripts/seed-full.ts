import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "../models/movieModel.js";
import Showtime from "../models/showtimeModel.js";
import User from "../models/userModel.js";
import Genre from "../models/genreModel.js";
import Room from "../models/roomModel.js";
import Seat from "../models/seatModel.js";
import Combo from "../models/comboModel.js";
import Promotion from "../models/promotionModel.js";
import Slider from "../models/sliderModel.js";
import Cinema from "../models/cinemaModel.js";
import Booking from "../models/bookingModel.js";
import Invoice from "../models/invoiceModel.js";
import Review from "../models/reviewModel.js";
import Actor from "../models/actorModel.js";
import Director from "../models/directorModel.js";
import {
  DEFAULT_LAYOUT,
  buildDefaultLayout,
  getLayout,
  getRowSeatNumbers,
  getSeatLabels,
  getSeatPrice,
} from "../utils/seatLayout.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";

async function seedDatabase() {
  try {
    console.log("⏳ [Seed]: Đang kết nối tới database...");
    await mongoose.connect(MONGODB_URI);
    console.log("🟢 [Seed]: Kết nối MongoDB thành công.");

    // ===================== XÓA DỮ LIỆU CŨ =====================
    // Chỉ xóa tài khoản demo (username seed). KHÔNG xóa user đăng ký thật từ app
    // (username = null, role = user) để tránh mất tài khoản/booking reference.
    const DEMO_USERNAMES = ["admin", "staff01", "staff02", "user01", "user02", "user03", "user04", "user05"];
    await Promise.all([
      Movie.deleteMany({}),
      Showtime.deleteMany({}),
      User.deleteMany({ $or: [{ username: { $in: DEMO_USERNAMES } }, { role: { $in: ["admin", "staff"] } }] }),
      Genre.deleteMany({}),
      Room.deleteMany({}),
      Seat.deleteMany({}),
      Combo.deleteMany({}),
      Promotion.deleteMany({}),
      Slider.deleteMany({}),
      Cinema.deleteMany({}),
      Booking.deleteMany({}),
      Invoice.deleteMany({}),
      Review.deleteMany({}),
      Actor.deleteMany({}),
      Director.deleteMany({}),
    ]);
    console.log("🧹 [Seed]: Đã làm sạch toàn bộ dữ liệu cũ.");

    // ===================== TẠO GENRES =====================
    const genres = await Genre.insertMany([
      { name: "Hành động", description: "Phim hành động kịch tính" },
      { name: "Tình cảm", description: "Phim tình cảm lãng mạn" },
      { name: "Hài hước", description: "Phim hài hước giải trí" },
      { name: "Kinh dị", description: "Phim kinh dị rùng rợn" },
      { name: "Khoa học viễn tưởng", description: "Phim khoa học viễn tưởng" },
      { name: "Hoạt hình", description: "Phim hoạt hình" },
      { name: "Phiêu lưu", description: "Phim phiêu lưu mạo hiểm" },
      { name: "Tâm lý", description: "Phim tâm lý xã hội" },
      { name: "Gia đình", description: "Phim gia đình ấm áp" },
      { name: "Chiến tranh", description: "Phim chiến tranh lịch sử" },
      { name: "Kịch tính", description: "Phim gay cấn hồi hộp" },
      { name: "Tội phạm", description: "Phim tội phạm hình sự" },
    ]);
    console.log(`🎭 [Seed]: Đã tạo ${genres.length} thể loại.`);

    // ===================== TẠO ACTORS =====================
    const actors = await Actor.insertMany([
      { name: "Ryan Reynolds", bio: "Diễn viên hài người Canada, nổi tiếng với vai Deadpool", avatar: "https://image.tmdb.org/t/p/w200/4SYd5b0YjO2B2h0RjX7Z2PwLq0.jpg", nationality: "Canada" },
      { name: "Hugh Jackman", bio: "Nam diễn viên người Úc, nổi tiếng với vai Wolverine", avatar: "https://image.tmdb.org/t/p/w200/4iXiJ4R7yYqB0lQuvFczu5YbB.jpg", nationality: "Úc" },
      { name: "Sam Worthington", bio: "Diễn viên người Anh-Úc, nổi tiếng với vai Jake Sully", avatar: "https://image.tmdb.org/t/p/w200/mFyRvyzYUB0G0b6T1Dg6n8PAhB.jpg", nationality: "Anh/Úc" },
      { name: "Zoe Saldana", bio: "Nữ diễn viên người Mỹ, nổi tiếng với vai Neytiri", avatar: "https://image.tmdb.org/t/p/w200/vO0WqJ0kGUtHvY3s0F4dW0QfGc.jpg", nationality: "Mỹ" },
      { name: "Thanh Hiền", bio: "Diễn viên kỳ cựu người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Trấn Thành", bio: "Danh hài, MC, đạo diễn người Việt Nam", avatar: "https://image.tmdb.org/t/p/w200/7Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Việt Nam" },
      { name: "Phương Anh Đào", bio: "Nữ diễn viên trẻ tài năng của Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Amy Poehler", bio: "Nữ diễn viên hài người Mỹ, lồng tiếng cho Joy", avatar: "https://image.tmdb.org/t/p/w200/5Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Mỹ" },
      { name: "Maya Hawke", bio: "Nữ diễn viên người Mỹ, lồng tiếng cho Anxiety", avatar: "https://image.tmdb.org/t/p/w200/3Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Mỹ" },
      { name: "Tom Hiddleston", bio: "Nam diễn viên người Anh, nổi tiếng với vai Loki", avatar: "https://image.tmdb.org/t/p/w200/mFyRvyzYUB0G0b6T1Dg6n8PAhB.jpg", nationality: "Anh" },
      { name: "Brie Larson", bio: "Nữ diễn viên người Mỹ, từng đoạt giải Oscar", avatar: "https://image.tmdb.org/t/p/w200/vO0WqJ0kGUtHvY3s0F4dW0QfGc.jpg", nationality: "Mỹ" },
      { name: "Timothée Chalamet", bio: "Nam diễn viên trẻ người Mỹ gốc Pháp", avatar: "https://image.tmdb.org/t/p/w200/4SYd5b0YjO2B2h0RjX7Z2PwLq0.jpg", nationality: "Mỹ" },
      { name: "Zendaya", bio: "Nữ diễn viên, ca sĩ người Mỹ", avatar: "https://image.tmdb.org/t/p/w200/4iXiJ4R7yYqB0lQuvFczu5YbB.jpg", nationality: "Mỹ" },
      { name: "Song Kang-ho", bio: "Nam diễn viên kỳ cựu người Hàn Quốc", avatar: "", nationality: "Hàn Quốc" },
      { name: "Rebecca Hall", bio: "Nữ diễn viên người Anh", avatar: "", nationality: "Anh" },
      { name: "Brian Tyree Henry", bio: "Nam diễn viên người Mỹ", avatar: "", nationality: "Mỹ" },
      { name: "Paul Rudd", bio: "Nam diễn viên hài người Mỹ", avatar: "https://image.tmdb.org/t/p/w200/5Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Mỹ" },
      { name: "Trương Minh Cường", bio: "Diễn viên người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Khả Như", bio: "Nữ diễn viên hài người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Tuấn Trần", bio: "Nam diễn viên trẻ người Việt Nam", avatar: "", nationality: "Việt Nam" },
    ]);
    console.log(`🎭 [Seed]: Đã tạo ${actors.length} diễn viên.`);

    // ===================== TẠO DIRECTORS =====================
    const directors = await Director.insertMany([
      { name: "Lý Hải", bio: "Đạo diễn, ca sĩ, diễn viên người Việt Nam, nổi tiếng với series Lật Mặt", avatar: "", nationality: "Việt Nam" },
      { name: "James Cameron", bio: "Đạo diễn huyền thoại người Canada, tác giả của Avatar và Titanic", avatar: "https://image.tmdb.org/t/p/w200/5Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Canada" },
      { name: "Shawn Levy", bio: "Đạo diễn, nhà sản xuất người Canada", avatar: "", nationality: "Canada" },
      { name: "Kelsey Mann", bio: "Đạo diễn hoạt hình người Mỹ của Pixar", avatar: "", nationality: "Mỹ" },
      { name: "Adam Wingard", bio: "Đạo diễn người Mỹ, nổi tiếng với Godzilla vs Kong", avatar: "", nationality: "Mỹ" },
      { name: "Trấn Thành", bio: "Đạo diễn, MC, danh hài người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Jordan Vogt-Roberts", bio: "Đạo diễn người Mỹ", avatar: "", nationality: "Mỹ" },
      { name: "Hoàng Nam", bio: "Đạo diễn phim kinh dị người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Denis Villeneuve", bio: "Đạo diễn người Canada gốc Pháp, tác giả Dune", avatar: "https://image.tmdb.org/t/p/w200/4SYd5b0YjO2B2h0RjX7Z2PwLq0.jpg", nationality: "Canada" },
      { name: "Lê Văn", bio: "Đạo diễn người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Gil Kenan", bio: "Đạo diễn người Mỹ gốc Israel", avatar: "", nationality: "Mỹ" },
      { name: "Park Chan-wook", bio: "Đạo diễn nổi tiếng người Hàn Quốc", avatar: "", nationality: "Hàn Quốc" },
      { name: "Christopher Nolan", bio: "Đạo diễn thiên tài người Anh", avatar: "https://image.tmdb.org/t/p/w200/5Yq0gV0vY2z0V6vC2v0Y2z0V6vC.jpg", nationality: "Anh" },
      { name: "Nguyễn Quang Dũng", bio: "Đạo diễn nổi tiếng người Việt Nam", avatar: "", nationality: "Việt Nam" },
      { name: "Bong Joon-ho", bio: "Đạo diễn người Hàn Quốc, từng đoạt giải Oscar", avatar: "", nationality: "Hàn Quốc" },
    ]);
    console.log(`🎬 [Seed]: Đã tạo ${directors.length} đạo diễn.`);

    // ===================== TẠO PHIM =====================
    const now = new Date();
    const movies = await Movie.insertMany([
      {
        title: "Lật Mặt 7: Một Điều Ước",
        poster_url: "https://image.tmdb.org/t/p/w500/2mg6ktvWxsOG9iMBP4P1pwOYltk.jpg",
        duration: 138,
        genres: ["Gia đình", "Tình cảm", "Kịch tính"],
        status: "now_playing",
        release_date: "2026-04-30",
        description: "Câu chuyện xoay quanh bà Hai, một người mẹ tảo tần nuôi dạy 5 người con khôn lớn. Khi bà gặp tai nạn, những góc khuất và xung đột trong gia đình bắt đầu lộ diện.",
        director: "Lý Hải",
        cast: ["Thanh Hiền", "Trương Minh Cường", "Quốc Cường", "Trần Kim Hải"],
        storyline: "Bà Hai, một người mẹ tảo tần nuôi dạy 5 người con khôn lớn. Khi bà gặp tai nạn, những góc khuất và xung đột trong gia đình bắt đầu lộ diện, buộc các con phải đối diện với sự thật.",
        language: "Tiếng Việt",
        rated: "P",
        formats: ["2D"],
      },
      {
        title: "Avatar: Fire and Ash",
        poster_url: "https://image.tmdb.org/t/p/w500/w6DBmG260sCHBQdGzkBIVn9gAQZ.jpg",
        duration: 160,
        genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing",
        release_date: "2025-12-19",
        description: "Hành trình trở lại hành tinh Pandora. Jake Sully và Neytiri phải đối mặt với bộ tộc người Na'vi của nguyên tố Lửa.",
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
        storyline: "Jake Sully và Neytiri phải đối mặt với bộ tộc người Na'vi của nguyên tố Lửa và Tro tàn, đe dọa sự sống còn của toàn bộ gia tộc.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "C13",
        formats: ["2D", "3D", "IMAX", "4DX", "ScreenX"],
      },
      {
        title: "Deadpool & Wolverine",
        poster_url: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        duration: 127,
        genres: ["Hành động", "Hài hước", "Khoa học viễn tưởng"],
        status: "now_playing",
        release_date: "2026-07-25",
        description: "Deadpool hợp tác với Wolverine trong một cuộc phiêu lưu xuyên vũ trụ đầy hỗn loạn và hài hước.",
        director: "Shawn Levy",
        cast: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"],
        storyline: "Deadpool hợp tác với Wolverine trong một cuộc phiêu lưu xuyên vũ trụ đầy hỗn loạn và hài hước.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "C18",
        formats: ["2D", "3D", "IMAX", "4DX"],
      },
      {
        title: "Inside Out 2",
        poster_url: "https://image.tmdb.org/t/p/w500/wAIFnJ5OeFU7tTnCWHiROsszS29.jpg",
        duration: 96,
        genres: ["Hoạt hình", "Gia đình", "Hài hước"],
        status: "now_playing",
        release_date: "2026-06-14",
        description: "Riley bước vào tuổi dậy thì và các cảm xúc mới xuất hiện: Lo âu, Ghen tị, Buồn chán và Xấu hổ.",
        director: "Kelsey Mann",
        cast: ["Amy Poehler", "Maya Hawke", "Phyllis Smith"],
        storyline: "Riley bước vào tuổi dậy thì và các cảm xúc mới xuất hiện: Lo âu, Ghen tị, Buồn chán và Xấu hổ.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "P",
        formats: ["2D", "3D", "IMAX"],
      },
      {
        title: "Godzilla x Kong: The New Empire",
        poster_url: "https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
        duration: 115,
        genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
        status: "now_playing",
        release_date: "2026-03-28",
        description: "Godzilla và Kong phải hợp tác để đối mặt với một mối đe dọa chưa từng có ẩn giấu trong lòng Trái Đất.",
        director: "Adam Wingard",
        cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"],
        storyline: "Godzilla và Kong phải hợp tác để đối mặt với một mối đe dọa chưa từng có ẩn giấu trong lòng Trái Đất.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "C13",
        formats: ["2D", "3D", "IMAX", "4DX"],
      },
      {
        title: "Mai",
        poster_url: "https://image.tmdb.org/t/p/w500/2nF8xD200rcDawuCg5ObxxqA2fC.jpg",
        duration: 131,
        genres: ["Tâm lý", "Tình cảm", "Kịch tính"],
        status: "now_playing",
        release_date: "2026-02-10",
        description: "Mai là câu chuyện về người phụ nữ tuổi trung niên với quá khứ đầy sóng gió và hành trình tìm kiếm hạnh phúc.",
        director: "Trấn Thành",
        cast: ["Phương Anh Đào", "Tuấn Trần", "Trấn Thành", "Uyển Ân"],
        storyline: "Mai là câu chuyện về người phụ nữ tuổi trung niên với quá khứ đầy sóng gió và hành trình tìm kiếm hạnh phúc.",
        language: "Tiếng Việt",
        rated: "C16",
        formats: ["2D"],
      },
      {
        title: "Kong: Đảo Đầu Lâu",
        poster_url: "https://image.tmdb.org/t/p/w500/ktotbBFrmO58kAKoPvpbChy53EB.jpg",
        duration: 118,
        genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        status: "now_playing",
        release_date: "2026-05-01",
        description: "Một nhóm thám hiểm đặt chân đến hòn đảo bí ẩn nơi Kong ngự trị và phải chiến đấu để sinh tồn.",
        director: "Jordan Vogt-Roberts",
        cast: ["Tom Hiddleston", "Brie Larson", "Samuel L. Jackson"],
        storyline: "Một nhóm thám hiểm đặt chân đến hòn đảo bí ẩn nơi Kong ngự trị và phải chiến đấu để sinh tồn.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "C13",
        formats: ["2D", "3D", "IMAX"],
      },
      {
        title: "Quỷ Nhập Tràng 2",
        poster_url: "https://image.tmdb.org/t/p/w500/mEH96rSqjuDLI5rAnu7sTIDTdc8.jpg",
        duration: 120,
        genres: ["Kinh dị", "Tâm lý", "Kịch tính"],
        status: "now_playing",
        release_date: "2026-05-15",
        description: "Những sự kiện siêu nhiên kỳ bí tiếp tục xảy ra tại ngôi làng nhỏ, đe dọa cuộc sống của người dân.",
        director: "Hoàng Nam",
        cast: ["Khả Như", "Nhất Trung", "Lê Nam"],
        storyline: "Những sự kiện siêu nhiên kỳ bí tiếp tục xảy ra tại ngôi làng nhỏ, đe dọa cuộc sống của người dân.",
        language: "Tiếng Việt",
        rated: "C18",
        formats: ["2D"],
      },
      {
        title: "Dune: Part Three",
        poster_url: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        duration: 155,
        genres: ["Khoa học viễn tưởng", "Phiêu lưu", "Kịch tính"],
        status: "coming_soon",
        release_date: "2026-10-17",
        rating: 0,
        total_reviews: 0,
        description: "Phần cuối cùng trong hành trình của Paul Atreides trên hành tinh sa mạc Arrakis.",
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        storyline: "Phần cuối cùng trong hành trình của Paul Atreides trên hành tinh sa mạc Arrakis.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "C13",
        formats: ["2D", "3D", "IMAX", "4DX"],
      },
      {
        title: "Siêu Trộm 2",
        poster_url: "https://image.tmdb.org/t/p/w500/usoYdcapXSsqAM1bDOtD7H42Wxe.jpg",
        duration: 122,
        genres: ["Hành động", "Hài hước", "Tội phạm"],
        status: "coming_soon",
        release_date: "2026-09-05",
        rating: 0,
        total_reviews: 0,
        description: "Nhóm siêu trộm trở lại với phi vụ táo bạo nhất từ trước đến nay.",
        director: "Lê Văn",
        cast: ["Trấn Thành", "Kiều Minh Tuấn", "Hari Won"],
        storyline: "Nhóm siêu trộm trở lại với phi vụ táo bạo nhất từ trước đến nay.",
        language: "Tiếng Việt",
        rated: "C16",
        formats: ["2D", "3D"],
      },
      {
        title: "Biệt Đội Săn Ma",
        poster_url: "https://image.tmdb.org/t/p/w500/3nBk7laQ3TAu2b5KKAUOIzvJZvB.jpg",
        duration: 105,
        genres: ["Hài hước", "Kinh dị", "Gia đình"],
        status: "coming_soon",
        release_date: "2026-12-25",
        rating: 0,
        total_reviews: 0,
        description: "Biệt đội săn ma quốc tế được triệu tập để đối phó với một thế lực siêu nhiên khổng lồ.",
        director: "Gil Kenan",
        cast: ["Paul Rudd", "Carrie Coon", "Finn Wolfhard"],
        storyline: "Biệt đội săn ma quốc tế được triệu tập để đối phó với một thế lực siêu nhiên khổng lồ.",
        language: "Tiếng Anh (Phụ đề Việt)",
        rated: "P",
        formats: ["2D", "3D"],
      },
      {
        title: "Vòng Xoay Tội Lỗi",
        poster_url: "https://image.tmdb.org/t/p/w500/vc2S0dvgpsM0XfSiXZDMVkRCSSU.jpg",
        duration: 135,
        genres: ["Tội phạm", "Tâm lý", "Kịch tính"],
        status: "coming_soon",
        release_date: "2026-11-20",
        rating: 0,
        total_reviews: 0,
        description: "Một vụ án mạng bí ẩn đưa vị thám tử vào vòng xoáy tội lỗi và những âm mưu đen tối.",
        director: "Park Chan-wook",
        cast: ["Song Kang-ho", "Lee Byung-hun", "Jeon Do-yeon"],
        storyline: "Một vụ án mạng bí ẩn đưa vị thám tử vào vòng xoáy tội lỗi và những âm mưu đen tối.",
        language: "Tiếng Hàn (Phụ đề Việt)",
        rated: "C18",
        formats: ["2D"],
      },
    ]);
    console.log(`🎬 [Seed]: Đã tạo ${movies.length} phim (${movies.filter(m => m.status === "now_playing").length} đang chiếu, ${movies.filter(m => m.status === "coming_soon").length} sắp chiếu).`);

    // ===================== TẠO TÀI KHOẢN =====================
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const users = await User.insertMany([
      { username: "admin", password: adminPassword, fullName: "Quản trị viên", email: "admin@cinez.com", phone: "0901234567", role: "admin", active: true },
      { username: "staff01", password: adminPassword, fullName: "Nhân viên 01", email: "staff1@cinez.com", phone: "0901234568", role: "staff", active: true },
      { username: "staff02", password: adminPassword, fullName: "Nhân viên 02", email: "staff2@cinez.com", phone: "0901234569", role: "staff", active: true },
      { username: "user01", password: userPassword, fullName: "Nguyễn Văn An", email: "user01@example.com", phone: "0912345671", role: "customer", active: true, loyaltyPoints: 1200 },
      { username: "user02", password: userPassword, fullName: "Trần Thị Bình", email: "user02@example.com", phone: "0912345672", role: "customer", active: true, loyaltyPoints: 800 },
      { username: "user03", password: userPassword, fullName: "Lê Hoàng Cường", email: "user03@example.com", phone: "0912345673", role: "customer", active: true, loyaltyPoints: 450 },
      { username: "user04", password: userPassword, fullName: "Phạm Minh Dung", email: "user04@example.com", phone: "0912345674", role: "customer", active: true, loyaltyPoints: 200 },
      { username: "user05", password: userPassword, fullName: "Hoàng Thị Em", email: "user05@example.com", phone: "0912345675", role: "customer", active: false, loyaltyPoints: 50 },
    ]);
    console.log(`👤 [Seed]: Đã tạo ${users.length} tài khoản (admin/staff/customer).`);

    // ===================== TẠO RẠP & CINEMA =====================
    const cinemas = await Cinema.insertMany([
      { name: "CineZ Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM", city: "Hồ Chí Minh", image: "https://picsum.photos/seed/cinezhungvuong/400/300" },
      { name: "CineZ Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM", city: "Hồ Chí Minh", image: "https://picsum.photos/seed/cinezvanhanh/400/300" },
      { name: "CineZ Vincom Thảo Điền", address: "159 Xa Lộ Hà Nội, Quận 2, TP.HCM", city: "Hồ Chí Minh", image: "https://picsum.photos/seed/cinezvincom/400/300" },
    ]);
    console.log(`🏢 [Seed]: Đã tạo ${cinemas.length} cụm rạp.`);

    // ===================== TẠO PHÒNG CHIẾU =====================
    const p01Layout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    const p02Layout = buildDefaultLayout(8, 14);
    const p03Layout = buildDefaultLayout(10, 16);
    const p04Layout = buildDefaultLayout(8, 12);
    const p05Layout = buildDefaultLayout(6, 10);

    const rooms = await Room.insertMany([
      { cinema: cinemas[0]!._id, name: "Phòng Chiếu 01 (IMAX)", type: "IMAX", rows_count: 8, seats_per_row: 15, totalSeats: getSeatLabels(p01Layout).length, status: "active", description: "Phòng IMAX cao cấp", layout: p01Layout },
      { cinema: cinemas[0]!._id, name: "Phòng Chiếu 02 (3D VIP)", type: "3D", rows_count: 8, seats_per_row: 14, totalSeats: getSeatLabels(p02Layout).length, status: "active", description: "Phòng 3D VIP sang trọng", layout: p02Layout },
      { cinema: cinemas[0]!._id, name: "Phòng Chiếu 03 (2D Standard)", type: "2D", rows_count: 10, seats_per_row: 16, totalSeats: getSeatLabels(p03Layout).length, status: "active", description: "Phòng chiếu tiêu chuẩn", layout: p03Layout },
      { cinema: cinemas[1]!._id, name: "Phòng Chiếu 04 (4DX)", type: "4DX", rows_count: 8, seats_per_row: 12, totalSeats: getSeatLabels(p04Layout).length, status: "active", description: "Phòng 4DX hiệu ứng chuyển động", layout: p04Layout },
      { cinema: cinemas[1]!._id, name: "Phòng Chiếu 05 (VIP)", type: "VIP", rows_count: 6, seats_per_row: 10, totalSeats: getSeatLabels(p05Layout).length, status: "active", description: "Phòng VIP ghế ngồi rộng", layout: p05Layout },
    ]);
    console.log(`🎦 [Seed]: Đã tạo ${rooms.length} phòng chiếu.`);

    // ===================== TẠO GHẾ =====================
    const seatDocs: any[] = [];
    const basePrices: Record<string, number> = {
      IMAX: 120000,
      "4DX": 130000,
      "3D": 90000,
      VIP: 150000,
      "2D": 75000,
    };

    for (const room of rooms) {
      const layout = getLayout(room);
      const basePrice = basePrices[room.type] || 75000;
      layout.rows.forEach((row: string) => {
        const seatType = layout.rowTypes?.[row] || "standard";
        const seatPrice = basePrice + (getSeatPrice(seatType) - getSeatPrice("standard"));
        getRowSeatNumbers(layout, row).forEach((n) => {
          seatDocs.push({
            room: room._id,
            row,
            number: n,
            label: `${row}${n}`,
            type: seatType,
            status: "available",
            price: seatPrice,
          });
        });
      });
    }
    await Seat.insertMany(seatDocs);
    console.log(`💺 [Seed]: Đã tạo ${seatDocs.length} ghế.`);

    // ===================== TẠO SUẤT CHIẾU =====================
    const nowPlayingMovies = movies.filter(m => m.status === "now_playing");

    // Build roomName → all seat labels map
    const seatLabelsByRoomName: Record<string, string[]> = {};
    for (const room of rooms) {
      const roomSeats = await Seat.find({ room: room._id });
      seatLabelsByRoomName[room.name] = roomSeats.map(s => s.label);
    }

    const showtimeDocs: any[] = [];
    const roomNames = rooms.map(r => r.name);

    for (const movie of nowPlayingMovies) {
      const showDates = [2, 3, 4, 5, 6, 7].map(d => {
        const date = new Date(now);
        date.setDate(date.getDate() + d);
        return date;
      });

      for (const date of showDates) {
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
          const hours = [8, 10, 13, 15, 18, 20, 22][Math.floor(Math.random() * 7)] ?? 18;
          const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)] ?? 0;
          const startTime = new Date(date);
          startTime.setHours(hours, minutes, 0, 0);

          if (startTime <= now) continue;

          const roomName = roomNames[Math.floor(Math.random() * roomNames.length)] ?? roomNames[0]!;
          const room = rooms.find(r => r.name === roomName) ?? null;
          const price = room ? (room.type === "IMAX" ? 120000 : room.type === "4DX" ? 130000 : room.type === "3D" ? 90000 : room.type === "VIP" ? 150000 : 75000) : 90000;
          const allLabels = seatLabelsByRoomName[roomName] || [];

          showtimeDocs.push({
            movie: movie._id,
            room: room ? room._id : null,
            roomName,
            startTime,
            price: price + Math.floor(Math.random() * 20) * 1000,
            availableSeats: [...allLabels],
            layout: room ? getLayout(room) : null,
            status: "active",
          });
        }
      }
    }
    const insertedShowtimes = await Showtime.insertMany(showtimeDocs);
    console.log(`🕐 [Seed]: Đã tạo ${insertedShowtimes.length} suất chiếu.`);

    // ===================== TẠO COMBO =====================
    const combos = await Combo.insertMany([
      { name: "Combo Solo", price: 65000, image: "https://picsum.photos/seed/combo-solo/300/300", description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn", status: "active" },
      { name: "Combo Couple", price: 95000, image: "https://picsum.photos/seed/combo-couple/300/300", description: "1 Bắp lớn + 2 Nước ngọt ly lớn", status: "active" },
      { name: "Combo Family", price: 159000, image: "https://picsum.photos/seed/combo-family/300/300", description: "2 Bắp lớn + 3 Nước ngọt ly lớn", status: "active" },
      { name: "Combo Student", price: 49000, image: "https://picsum.photos/seed/combo-student/300/300", description: "1 Bắp nhỏ + 1 Nước ngọt nhỏ", status: "active" },
      { name: "Burger Meal", price: 79000, image: "", description: "Burger gà + Khoai tây chiên + Nước ngọt", status: "active" },
    ]);
    console.log(`🍿 [Seed]: Đã tạo ${combos.length} combo.`);

    // ===================== TẠO KHUYẾN MÃI =====================
    const promos = await Promotion.insertMany([
      { code: "WELCOME10", title: "Giảm 10%", description: "Giảm 10% cho đơn hàng đầu tiên", discountType: "percent", discountValue: 10, minOrderValue: 100000, maxDiscount: 50000, usageLimit: 1000, usedCount: 0, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
      { code: "T5GIAM50", title: "Thứ 5 giảm 50k", description: "Giảm 50.000đ cho vé xem phim vào thứ 5 hàng tuần", discountType: "amount", discountValue: 50000, minOrderValue: 100000, maxDiscount: 50000, usageLimit: 500, usedCount: 15, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
      { code: "SINHNHAT", title: "Quà sinh nhật", description: "Giảm 30% vé xem phim nhân dịp sinh nhật (tối đa 100k)", discountType: "percent", discountValue: 30, minOrderValue: 0, maxDiscount: 100000, usageLimit: 1, usedCount: 0, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
      { code: "COMBO20", title: "Giảm combo 20%", description: "Giảm 20% khi mua combo bắp nước", discountType: "percent", discountValue: 20, minOrderValue: 50000, maxDiscount: 30000, usageLimit: 200, usedCount: 8, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
      { code: "THU7VIP", title: "Thứ 7 VIP", description: "Giảm 30k cho vé VIP vào thứ 7", discountType: "amount", discountValue: 30000, minOrderValue: 150000, maxDiscount: 30000, usageLimit: 100, usedCount: 3, startDate: new Date("2026-01-01"), endDate: new Date("2026-06-30"), active: true },
    ]);
    console.log(`🏷️ [Seed]: Đã tạo ${promos.length} khuyến mãi.`);

    // ===================== TẠO SLIDER =====================
    const sliders = await Slider.insertMany([
      { title: "Lật Mặt 7: Một Điều Ước", imageUrl: "https://picsum.photos/seed/slider-latmat7/800/400", linkUrl: "", description: "Phim gia đình cảm động nhất năm", order: 1, active: true },
      { title: "Avatar: Fire and Ash", imageUrl: "https://picsum.photos/seed/slider-avatar3/800/400", linkUrl: "", description: "Hành trình trở lại Pandora", order: 2, active: true },
      { title: "Deadpool & Wolverine", imageUrl: "https://picsum.photos/seed/slider-deadpool/800/400", linkUrl: "", description: "Bộ đôi lầy lội nhất vũ trụ", order: 3, active: true },
      { title: "Inside Out 2", imageUrl: "https://picsum.photos/seed/slider-insideout2/800/400", linkUrl: "", description: "Cảm xúc mới, cuộc phiêu lưu mới", order: 4, active: true },
    ]);
    console.log(`📺 [Seed]: Đã tạo ${sliders.length} slider.`);

    // ===================== TẠO BOOKING & INVOICE =====================
    const testUsers = users.filter(u => u.role === "customer");
    const activeShowtimes = nowPlayingMovies
      .map(movie => {
        const movieShowtimes = insertedShowtimes.filter(s => String(s.movie) === String(movie._id));
        return movieShowtimes[Math.floor(movieShowtimes.length / 2)];
      })
      .filter((s): s is NonNullable<typeof s> => !!s);

    const bookingDocs: any[] = [];
    const invoiceDocs: any[] = [];

    for (let i = 0; i < 8 && i < activeShowtimes.length; i++) {
      const showtimeRef = activeShowtimes[i]!;
      const userRef = testUsers[i % testUsers.length]!;

      // Pick real seats from the showtime's availableSeats
      const allLabels = seatLabelsByRoomName[showtimeRef.roomName] || [];
      const seatCount = Math.min(Math.floor(Math.random() * 3) + 1, Math.floor(allLabels.length / 2));
      const shuffled = [...allLabels].sort(() => Math.random() - 0.5);
      const seatNames = shuffled.slice(0, seatCount);

      // Remove booked seats from availableSeats
      for (const label of seatNames) {
        const idx = showtimeRef.availableSeats.indexOf(label);
        if (idx !== -1) showtimeRef.availableSeats.splice(idx, 1);
      }

      const comboItems = [{ name: combos[i % combos.length]!.name, quantity: (i % 2) + 1, price: combos[i % combos.length]!.price }];
      const comboSum = comboItems.reduce((s, c) => s + c.price * c.quantity, 0);
      const totalPrice = showtimeRef.price * seatCount + comboSum;

      const booking = await Booking.create({
        user: userRef._id,
        showtime: showtimeRef._id,
        seats: seatNames,
        combos: comboItems,
        totalPrice,
        status: "paid",
        paymentStatus: "completed",
        paymentMethod: ["momo", "zalopay", "vnpay", "cash"][i % 4],
      });

      // Update showtime in DB with reduced availableSeats
      await Showtime.findByIdAndUpdate(showtimeRef._id, { availableSeats: showtimeRef.availableSeats });

      const invoice = await Invoice.create({
        booking: booking._id,
        amount: totalPrice,
        method: ["momo", "zalopay", "vnpay", "credit_card", "cash"][i % 5] as "momo" | "zalopay" | "vnpay" | "credit_card" | "cash",
        status: "paid",
        transactionId: `TXN${Date.now()}${i}`,
      });

      bookingDocs.push(booking);
      invoiceDocs.push(invoice);
    }
    console.log(`🎫 [Seed]: Đã tạo ${bookingDocs.length} đơn đặt vé và hóa đơn (ghế đã được trừ khỏi suất chiếu).`);

    // ===================== TẠO REVIEW =====================
    const reviewMovies = movies.slice(0, 8);
    const reviewComments = [
      "Phim rất hay và cảm động, diễn xuất tuyệt vời!",
      "Xúc động từ đầu đến cuối, không thể rời mắt.",
      "Đồ họa đẹp không tưởng tượng nổi! Đáng đồng tiền.",
      "Hay nhưng hơi dài, cần cắt bớt vài phân đoạn.",
      "Hài hước và hành động mãn nhãn! Đã xem 2 lần.",
      "Deadpool và Wolverine quá đỉnh! Cặp đôi hoàn hảo.",
      "Rất phù hợp cho gia đình có trẻ nhỏ. Bé nhà mình rất thích.",
      "Cảnh chiến đấu hoành tráng! Âm thanh sống động.",
      "Kịch bản hay, diễn xuất tốt. Nên xem ở rạp IMAX.",
      "Phim hay nhưng kết thúc hơi có hậu quá đà.",
      "Một trong những phim hay nhất năm!",
      "Diễn viên chính quá xuất sắc, nội dung sâu sắc.",
      "Đạo diễn đã làm rất tốt, từng khung hình đều đẹp.",
      "Phim giải trí nhẹ nhàng, thích hợp cuối tuần.",
      "Âm nhạc trong phim rất tuyệt vời, gây xúc động mạnh.",
      "Lần đầu xem phim Việt mà thấy tự hào như vậy.",
      "Hiệu ứng đặc biệt quá đỉnh, xem 4DX càng phê.",
      "Nên có thêm phần 2 vì kết thúc mở quá hấp dẫn.",
      "Phim mang thông điệp nhân văn sâu sắc.",
      "Không gian và bối cảnh đẹp đến từng chi tiết.",
      "Tuyến nhân vật phát triển tốt, ai cũng có câu chuyện.",
      "Một bộ phim đáng xem ít nhất một lần.",
      "Các tình tiết gay cấn được đẩy lên cao trào hợp lý.",
      "Phim có những phút giây vừa vui nhộn vừa xúc động.",
      "Đã rủ cả nhà đi xem, ai cũng khen hay.",
      "Phim hành động mãn nhãn, không có chỗ chê.",
      "Kịch bản chặt chẽ, không có lỗ hổng.",
      "Diễn viên phụ cũng xuất sắc không kém.",
      "Một tác phẩm điện ảnh đẳng cấp quốc tế.",
      "Phim khiến mình suy nghĩ về cuộc sống rất nhiều.",
    ];
    const ratingDistribution = [5, 5, 5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 4, 3, 5, 5, 5, 4, 4, 5, 3, 5, 4, 5, 5, 4, 5, 4, 5, 3];

    const reviewDocs: any[] = [];
    for (let i = 0; i < 30; i++) {
      const movie = reviewMovies[i % reviewMovies.length]!;
      const user = testUsers[(i + Math.floor(i / reviewMovies.length)) % testUsers.length]!;
      reviewDocs.push({
        movie: movie._id,
        user: user._id,
        rating: ratingDistribution[i % ratingDistribution.length],
        comment: reviewComments[i % reviewComments.length],
      });
    }
    await Review.insertMany(reviewDocs);
    await Review.syncIndexes();
    console.log(`⭐ [Seed]: Đã tạo ${reviewDocs.length} đánh giá phim.`);

    // Tính điểm phim từ đánh giá thực tế (giống công thức API: avg sao x 2 -> thang 10)
    const movieStats = await Review.aggregate([
      { $group: { _id: "$movie", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    for (const stat of movieStats) {
      await Movie.findByIdAndUpdate(stat._id, {
        rating: Math.round(stat.avgRating * 2 * 10) / 10,
        total_reviews: stat.count,
      });
    }
    console.log(`⭐ [Seed]: Điểm ${movieStats.length} phim được tính từ đánh giá thực tế.`);

    // ===================== TỔNG KẾT =====================
    console.log("\n========================================");
    console.log("✅ [Seed]: TẠO DỮ LIỆU HOÀN TẤT!");
    console.log("========================================");
    console.log(`📊 Tổng kết:`);
    console.log(`   - ${genres.length} thể loại`);
    console.log(`   - ${actors.length} diễn viên`);
    console.log(`   - ${directors.length} đạo diễn`);
    console.log(`   - ${movies.length} phim`);
    console.log(`   - ${users.length} tài khoản (1 admin, 2 staff, 5 khách hàng)`);
    console.log(`   - ${cinemas.length} cụm rạp`);
    console.log(`   - ${rooms.length} phòng chiếu`);
    console.log(`   - ${seatDocs.length} ghế`);
    console.log(`   - ${showtimeDocs.length} suất chiếu`);
    console.log(`   - ${combos.length} combo`);
    console.log(`   - ${promos.length} khuyến mãi`);
    console.log(`   - ${sliders.length} slider`);
    console.log(`   - ${bookingDocs.length} đơn đặt vé + hóa đơn`);
    console.log(`   - ${reviewDocs.length} đánh giá phim`);
    console.log("========================================");
    console.log("👤 Admin: admin / admin123");
    console.log("👤 Staff: staff01 / admin123");
    console.log("👤 User:  user01 / user123");
    console.log("========================================\n");

  } catch (error) {
    console.error("🔴 [Seed] Thất bại:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 [Seed]: Đã ngắt kết nối an toàn.");
  }
}

seedDatabase();
