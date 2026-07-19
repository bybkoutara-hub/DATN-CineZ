"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const movieModel_js_1 = __importDefault(require("../models/movieModel.js"));
const showtimeModel_js_1 = __importDefault(require("../models/showtimeModel.js"));
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mbooking';
const cinemaSchema = new mongoose_1.default.Schema({ name: String, address: String });
const Cinema = mongoose_1.default.models.Cinema || mongoose_1.default.model("Cinema", cinemaSchema);
const comboSchema = new mongoose_1.default.Schema({ name: String, price: Number, description: String });
const Combo = mongoose_1.default.models.Combo || mongoose_1.default.model("Combo", comboSchema);
async function seedDatabase() {
    try {
        console.log("⏳ [Seed]: Đang kết nối tới database...");
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("🟢 [Seed]: Kết nối MongoDB thành công.");
        // 1. Làm sạch dữ liệu cũ để nạp mới hoàn toàn
        await movieModel_js_1.default.deleteMany({});
        await showtimeModel_js_1.default.deleteMany({});
        await Cinema.deleteMany({});
        await Combo.deleteMany({});
        await userModel_js_1.default.deleteMany({ role: { $in: ["admin", "staff", "user"] } });
        console.log("🧹 [Seed]: Đã làm sạch toàn bộ dữ liệu cũ.");
        // 2. Tạo tài khoản Admin mặc định
        const adminPassword = await bcryptjs_1.default.hash("admin123", 10);
        await userModel_js_1.default.create({
            username: "admin",
            password: adminPassword,
            fullName: "Quản trị viên",
            email: "admin@cinez.com",
            role: "admin",
        });
        console.log("👤 [Seed]: Đã tạo tài khoản Admin (admin / admin123).");
        // 3. Thêm Rạp phim & Combo bắp nước mẫu
        await Cinema.insertMany([
            { name: "MBooking Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM" },
            { name: "MBooking Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM" }
        ]);
        await Combo.insertMany([
            { name: "Combo Solo", price: 65000, description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn" },
            { name: "Combo Couple", price: 95000, description: "1 Bắp lớn + 2 Nước ngọt ly lớn" }
        ]);
        // 4. Nạp dữ liệu PHIM SIÊU CHI TIẾT (Đầy đủ các trường để lên giao diện Mobile đẹp mắt)
        const createdMovies = await movieModel_js_1.default.insertMany([
            {
                title: "Lật Mặt 7: Một Điều Ước",
                poster_url: "https://homepage.lyhaiproductions.com/wp-content/uploads/2024/04/LM7_POSTER_MAIN_ONLINE.jpg",
                duration: 138,
                genres: ["Gia đình", "Tình cảm", "Kịch tính"],
                status: "now_playing",
                release_date: new Date("2026-04-30"),
                rating: 4.9,
                total_reviews: 2450,
                description: "Câu chuyện xoay quanh bà Hai, một người mẹ tảo tần nuôi dạy 5 người con khôn lớn. Khi bà gặp tai nạn, những góc khuất và xung đột trong gia đình bắt đầu lộ diện, đặt ra câu hỏi nhức nhối về trách nhiệm phụng dưỡng cha mẹ ở xã hội hiện đại.",
                // Thêm các trường chi tiết nếu model của bạn có hỗ trợ (hoặc tự động lưu vào mongo)
                director: "Lý Hải",
                cast: ["Thanh Hiền", "Trương Minh Cường", "Đinh Y Nhung", "Quách Ngọc Tuyên"],
                language: "Tiếng Việt (Có phụ đề tiếng Anh)",
                banner_url: "https://homepage.lyhaiproductions.com/wp-content/uploads/2024/04/LM7_BANNER.jpg"
            },
            {
                title: "Avatar: Fire and Ash",
                poster_url: "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/e8vWyY2gJZQ8Uo171D7u0mG6.png",
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
                banner_url: "https://images.squarespace-cdn.com/content/v1/511cbfc4e4b0a70bc10b5030/1441865201502-V68U797D66WHLI6SFO9Y/avatar-banner.jpg"
            }
        ]);
        console.log("🎬 [Seed]: Đã nạp xong 2 phim siêu chi tiết.");
        // 5. Hàm tạo 20 ghế mặc định tự động từ A1 -> B10
        const generateDefaultSeats = () => {
            const seats = [];
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
        // 7. Tạo suất chiếu kết nối chuẩn xác bằng 'movieId' (Đoạn này giữ nguyên)
        const sampleShowtimes = [
            {
                movieId: latMatPhim._id,
                roomName: "Phòng Chiếu 01 (IMAX)",
                startTime: new Date("2026-08-20T18:30:00.000Z"),
                price: 90000,
                availableSeats: generateDefaultSeats()
            },
            {
                movieId: latMatPhim._id,
                roomName: "Phòng Chiếu 03 (2D Standard)",
                startTime: new Date("2026-08-20T21:00:00.000Z"),
                price: 75000,
                availableSeats: generateDefaultSeats()
            },
            {
                movieId: avatarPhim._id,
                roomName: "Phòng Chiếu 02 (3D VIP)",
                startTime: new Date("2026-08-21T19:45:00.000Z"),
                price: 120000,
                availableSeats: generateDefaultSeats()
            }
        ];
        await showtimeModel_js_1.default.insertMany(sampleShowtimes);
        console.log(`🟢 [Seed]: Đã tạo các suất chiếu mẫu cho phim "${latMatPhim.title}" và "${avatarPhim.title}" thành công!`);
    }
    catch (error) {
        console.error("🔴 [Seed] Thất bại:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 [Seed]: Đã ngắt kết nối an toàn.");
    }
}
seedDatabase();
//# sourceMappingURL=seed.js.map