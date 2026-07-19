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
const genreModel_js_1 = __importDefault(require("../models/genreModel.js"));
const roomModel_js_1 = __importDefault(require("../models/roomModel.js"));
const seatModel_js_1 = __importDefault(require("../models/seatModel.js"));
const comboModel_js_1 = __importDefault(require("../models/comboModel.js"));
const promotionModel_js_1 = __importDefault(require("../models/promotionModel.js"));
const sliderModel_js_1 = __importDefault(require("../models/sliderModel.js"));
const cinemaModel_js_1 = __importDefault(require("../models/cinemaModel.js"));
const bookingModel_js_1 = __importDefault(require("../models/bookingModel.js"));
const invoiceModel_js_1 = __importDefault(require("../models/invoiceModel.js"));
const reviewModel_js_1 = __importDefault(require("../models/reviewModel.js"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
async function seedDatabase() {
    try {
        console.log("⏳ [Seed]: Đang kết nối tới database...");
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("🟢 [Seed]: Kết nối MongoDB thành công.");
        // ===================== XÓA DỮ LIỆU CŨ =====================
        await Promise.all([
            movieModel_js_1.default.deleteMany({}),
            showtimeModel_js_1.default.deleteMany({}),
            userModel_js_1.default.deleteMany({}),
            genreModel_js_1.default.deleteMany({}),
            roomModel_js_1.default.deleteMany({}),
            seatModel_js_1.default.deleteMany({}),
            comboModel_js_1.default.deleteMany({}),
            promotionModel_js_1.default.deleteMany({}),
            sliderModel_js_1.default.deleteMany({}),
            cinemaModel_js_1.default.deleteMany({}),
            bookingModel_js_1.default.deleteMany({}),
            invoiceModel_js_1.default.deleteMany({}),
            reviewModel_js_1.default.deleteMany({}),
        ]);
        console.log("🧹 [Seed]: Đã làm sạch toàn bộ dữ liệu cũ.");
        // ===================== TẠO GENRES =====================
        const genres = await genreModel_js_1.default.insertMany([
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
        // ===================== TẠO PHIM =====================
        const now = new Date();
        const movies = await movieModel_js_1.default.insertMany([
            {
                title: "Lật Mặt 7: Một Điều Ước",
                poster_url: "https://homepage.lyhaiproductions.com/wp-content/uploads/2024/04/LM7_POSTER_MAIN_ONLINE.jpg",
                duration: 138,
                genres: ["Gia đình", "Tình cảm", "Kịch tính"],
                status: "now_playing",
                release_date: "2026-04-30",
                rating: 4.9,
                total_reviews: "2450",
                description: "Câu chuyện xoay quanh bà Hai, một người mẹ tảo tần nuôi dạy 5 người con khôn lớn. Khi bà gặp tai nạn, những góc khuất và xung đột trong gia đình bắt đầu lộ diện.",
            },
            {
                title: "Avatar: Fire and Ash",
                poster_url: "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/e8vWyY2gJZQ8Uo171D7u0mG6.png",
                duration: 160,
                genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
                status: "now_playing",
                release_date: "2025-12-19",
                rating: 4.7,
                total_reviews: "1820",
                description: "Hành trình trở lại hành tinh Pandora. Jake Sully và Neytiri phải đối mặt với bộ tộc người Na'vi của nguyên tố Lửa.",
            },
            {
                title: "Deadpool & Wolverine",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
                duration: 127,
                genres: ["Hành động", "Hài hước", "Khoa học viễn tưởng"],
                status: "now_playing",
                release_date: "2026-07-25",
                rating: 4.8,
                total_reviews: "3200",
                description: "Deadpool hợp tác với Wolverine trong một cuộc phiêu lưu xuyên vũ trụ đầy hỗn loạn và hài hước.",
            },
            {
                title: "Inside Out 2",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/vpnVM9B6NMmQpWeZvVJ3d8CfzqI.jpg",
                duration: 96,
                genres: ["Hoạt hình", "Gia đình", "Hài hước"],
                status: "now_playing",
                release_date: "2026-06-14",
                rating: 4.6,
                total_reviews: "1500",
                description: "Riley bước vào tuổi dậy thì và các cảm xúc mới xuất hiện: Lo âu, Ghen tị, Buồn chán và Xấu hổ.",
            },
            {
                title: "Godzilla x Kong: The New Empire",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
                duration: 115,
                genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
                status: "now_playing",
                release_date: "2026-03-28",
                rating: 4.5,
                total_reviews: "980",
                description: "Godzilla và Kong phải hợp tác để đối mặt với một mối đe dọa chưa từng có ẩn giấu trong lòng Trái Đất.",
            },
            {
                title: "Mai",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wu1uC3ixtgzBtodLmQkpUBpDrES.jpg",
                duration: 131,
                genres: ["Tâm lý", "Tình cảm", "Kịch tính"],
                status: "now_playing",
                release_date: "2026-02-10",
                rating: 4.3,
                total_reviews: "2100",
                description: "Mai là câu chuyện về người phụ nữ tuổi trung niên với quá khứ đầy sóng gió và hành trình tìm kiếm hạnh phúc.",
            },
            {
                title: "Kong: Đảo Đầu Lâu",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/jeAQuxUNrLk3cH5uRPfNUFT34oG.jpg",
                duration: 118,
                genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
                status: "now_playing",
                release_date: "2026-05-01",
                rating: 4.2,
                total_reviews: "760",
                description: "Một nhóm thám hiểm đặt chân đến hòn đảo bí ẩn nơi Kong ngự trị và phải chiến đấu để sinh tồn.",
            },
            {
                title: "Quỷ Nhập Tràng 2",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3qI1R9dQpEQcFkZQUjGj0MbF60t.jpg",
                duration: 120,
                genres: ["Kinh dị", "Tâm lý", "Kịch tính"],
                status: "now_playing",
                release_date: "2026-05-15",
                rating: 4.1,
                total_reviews: "530",
                description: "Những sự kiện siêu nhiên kỳ bí tiếp tục xảy ra tại ngôi làng nhỏ, đe dọa cuộc sống của người dân.",
            },
            {
                title: "Dune: Part Three",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                duration: 155,
                genres: ["Khoa học viễn tưởng", "Phiêu lưu", "Kịch tính"],
                status: "coming_soon",
                release_date: "2026-10-17",
                rating: 0,
                total_reviews: "0",
                description: "Phần cuối cùng trong hành trình của Paul Atreides trên hành tinh sa mạc Arrakis.",
            },
            {
                title: "Siêu Trộm 2",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/6mkFg2K2hiDq0J6H8bB7gFLDSbL.jpg",
                duration: 122,
                genres: ["Hành động", "Hài hước", "Tội phạm"],
                status: "coming_soon",
                release_date: "2026-09-05",
                rating: 0,
                total_reviews: "0",
                description: "Nhóm siêu trộm trở lại với phi vụ táo bạo nhất từ trước đến nay.",
            },
            {
                title: "Biệt Đội Săn Ma",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wdjd2AuScjB9mB6pF2SjMtKtMCW.jpg",
                duration: 105,
                genres: ["Hài hước", "Kinh dị", "Gia đình"],
                status: "coming_soon",
                release_date: "2026-12-25",
                rating: 0,
                total_reviews: "0",
                description: "Biệt đội săn ma quốc tế được triệu tập để đối phó với một thế lực siêu nhiên khổng lồ.",
            },
            {
                title: "Vòng Xoay Tội Lỗi",
                poster_url: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7iMBZzWZ9G7m7WxjH5VzXq7Uy0D.jpg",
                duration: 135,
                genres: ["Tội phạm", "Tâm lý", "Kịch tính"],
                status: "coming_soon",
                release_date: "2026-11-20",
                rating: 0,
                total_reviews: "0",
                description: "Một vụ án mạng bí ẩn đưa vị thám tử vào vòng xoáy tội lỗi và những âm mưu đen tối.",
            },
        ]);
        console.log(`🎬 [Seed]: Đã tạo ${movies.length} phim (${movies.filter(m => m.status === "now_playing").length} đang chiếu, ${movies.filter(m => m.status === "coming_soon").length} sắp chiếu).`);
        // ===================== TẠO TÀI KHOẢN =====================
        const adminPassword = await bcryptjs_1.default.hash("admin123", 10);
        const userPassword = await bcryptjs_1.default.hash("user123", 10);
        const users = await userModel_js_1.default.insertMany([
            { username: "admin", password: adminPassword, fullName: "Quản trị viên", email: "admin@cinez.com", phone: "0901234567", role: "admin", active: true },
            { username: "staff01", password: adminPassword, fullName: "Nhân viên 01", email: "staff1@cinez.com", phone: "0901234568", role: "staff", active: true },
            { username: "staff02", password: adminPassword, fullName: "Nhân viên 02", email: "staff2@cinez.com", phone: "0901234569", role: "staff", active: true },
            { username: "user01", password: userPassword, fullName: "Nguyễn Văn An", email: "user01@example.com", phone: "0912345671", role: "user", active: true, loyaltyPoints: 1200 },
            { username: "user02", password: userPassword, fullName: "Trần Thị Bình", email: "user02@example.com", phone: "0912345672", role: "user", active: true, loyaltyPoints: 800 },
            { username: "user03", password: userPassword, fullName: "Lê Hoàng Cường", email: "user03@example.com", phone: "0912345673", role: "user", active: true, loyaltyPoints: 450 },
            { username: "user04", password: userPassword, fullName: "Phạm Minh Dung", email: "user04@example.com", phone: "0912345674", role: "user", active: true, loyaltyPoints: 200 },
            { username: "user05", password: userPassword, fullName: "Hoàng Thị Em", email: "user05@example.com", phone: "0912345675", role: "user", active: false, loyaltyPoints: 50 },
        ]);
        console.log(`👤 [Seed]: Đã tạo ${users.length} tài khoản (admin/staff/customer).`);
        // ===================== TẠO RẠP & CINEMA =====================
        const cinemas = await cinemaModel_js_1.default.insertMany([
            { name: "CineZ Hùng Vương Plaza", address: "126 Hùng Vương, Quận 5, TP.HCM", city: "Hồ Chí Minh", image: "https://cdn.galaxycine.vn/media/2024/12/hungvuong--1734077338559.png" },
            { name: "CineZ Vạn Hạnh Mall", address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM", city: "Hồ Chí Minh", image: "https://cdn.galaxycine.vn/media/2024/12/vanhanh--1734077588229.png" },
            { name: "CineZ Vincom Thảo Điền", address: "159 Xa Lộ Hà Nội, Quận 2, TP.HCM", city: "Hồ Chí Minh", image: "https://cdn.galaxycine.vn/media/2024/12/vincom-thaodien-1734077906549.png" },
        ]);
        console.log(`🏢 [Seed]: Đã tạo ${cinemas.length} cụm rạp.`);
        // ===================== TẠO PHÒNG CHIẾU =====================
        const rooms = await roomModel_js_1.default.insertMany([
            { name: "Phòng Chiếu 01 (IMAX)", type: "IMAX", rows_count: 10, seats_per_row: 18, totalSeats: 180, status: "active", description: "Phòng IMAX cao cấp" },
            { name: "Phòng Chiếu 02 (3D VIP)", type: "3D", rows_count: 8, seats_per_row: 14, totalSeats: 112, status: "active", description: "Phòng 3D VIP sang trọng" },
            { name: "Phòng Chiếu 03 (2D Standard)", type: "2D", rows_count: 10, seats_per_row: 16, totalSeats: 160, status: "active", description: "Phòng chiếu tiêu chuẩn" },
            { name: "Phòng Chiếu 04 (4DX)", type: "4DX", rows_count: 8, seats_per_row: 12, totalSeats: 96, status: "active", description: "Phòng 4DX hiệu ứng chuyển động" },
            { name: "Phòng Chiếu 05 (VIP)", type: "VIP", rows_count: 6, seats_per_row: 10, totalSeats: 60, status: "active", description: "Phòng VIP ghế ngồi rộng" },
        ]);
        console.log(`🎦 [Seed]: Đã tạo ${rooms.length} phòng chiếu.`);
        // ===================== TẠO GHẾ =====================
        const seatDocs = [];
        const seatTypes = ["standard", "standard", "standard", "vip", "couple"];
        const extraPrices = [0, 0, 0, 20000, 10000];
        for (const room of rooms) {
            const rowLetters = "ABCDEFGHIJ".slice(0, room.rows_count);
            const basePrice = room.type === "IMAX" ? 120000 : room.type === "4DX" ? 130000 : room.type === "3D" ? 90000 : room.type === "VIP" ? 150000 : 75000;
            for (let r = 0; r < rowLetters.length; r++) {
                const row = rowLetters[r];
                const seatsInRow = r === 0 ? room.seats_per_row : room.seats_per_row;
                for (let n = 1; n <= seatsInRow; n++) {
                    const seatTypeIdx = r >= rowLetters.length - 2 ? (r >= rowLetters.length - 1 ? 3 : 2) : n <= 2 ? 4 : 0;
                    const seatType = seatTypes[seatTypeIdx % seatTypes.length];
                    seatDocs.push({
                        room: room._id,
                        row,
                        number: n,
                        label: `${row}${n}`,
                        type: seatType,
                        status: "available",
                        price: basePrice + (extraPrices[seatTypeIdx % extraPrices.length] || 0),
                    });
                }
            }
        }
        await seatModel_js_1.default.insertMany(seatDocs);
        console.log(`💺 [Seed]: Đã tạo ${seatDocs.length} ghế.`);
        // ===================== TẠO SUẤT CHIẾU =====================
        const nowPlayingMovies = movies.filter(m => m.status === "now_playing");
        // Build roomName → all seat labels map
        const seatLabelsByRoomName = {};
        for (const room of rooms) {
            const roomSeats = await seatModel_js_1.default.find({ room: room._id });
            seatLabelsByRoomName[room.name] = roomSeats.map(s => s.label);
        }
        const showtimeDocs = [];
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
                    const hours = [8, 10, 13, 15, 18, 20, 22][Math.floor(Math.random() * 7)];
                    const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
                    const startTime = new Date(date);
                    startTime.setHours(hours, minutes, 0, 0);
                    if (startTime <= now)
                        continue;
                    const roomName = roomNames[Math.floor(Math.random() * roomNames.length)];
                    const room = rooms.find(r => r.name === roomName);
                    const price = room ? (room.type === "IMAX" ? 120000 : room.type === "4DX" ? 130000 : room.type === "3D" ? 90000 : room.type === "VIP" ? 150000 : 75000) : 90000;
                    const allLabels = seatLabelsByRoomName[roomName] || [];
                    showtimeDocs.push({
                        movieId: movie._id,
                        roomName,
                        startTime,
                        price: price + Math.floor(Math.random() * 20000),
                        availableSeats: [...allLabels],
                        status: "active",
                    });
                }
            }
        }
        await showtimeModel_js_1.default.insertMany(showtimeDocs);
        console.log(`🕐 [Seed]: Đã tạo ${showtimeDocs.length} suất chiếu.`);
        // ===================== TẠO COMBO =====================
        const combos = await comboModel_js_1.default.insertMany([
            { name: "Combo Solo", price: 65000, image: "https://www.cgv.vn/media/catalog/product/placeholder/default/COMBO_S.jpg", items: ["Bắp ngọt lớn", "Nước ngọt 32oz"], description: "1 Bắp ngọt lớn + 1 Nước ngọt ly lớn", status: "active" },
            { name: "Combo Couple", price: 95000, image: "https://www.cgv.vn/media/catalog/product/placeholder/default/COMBO_L.jpg", items: ["Bắp ngọt lớn", "Nước ngọt 32oz x2"], description: "1 Bắp lớn + 2 Nước ngọt ly lớn", status: "active" },
            { name: "Combo Family", price: 159000, image: "https://www.cgv.vn/media/catalog/product/placeholder/default/COMBO_FAMILY.jpg", items: ["Bắp ngọt lớn x2", "Nước ngọt 32oz x3"], description: "2 Bắp lớn + 3 Nước ngọt ly lớn", status: "active" },
            { name: "Combo Student", price: 49000, image: "https://www.cgv.vn/media/catalog/product/placeholder/default/COMBO_S.jpg", items: ["Bắp ngọt nhỏ", "Nước ngọt 22oz"], description: "1 Bắp nhỏ + 1 Nước ngọt nhỏ", status: "active" },
            { name: "Burger Meal", price: 79000, image: "", items: ["Burger gà", "Khoai tây chiên", "Nước ngọt 32oz"], description: "Burger gà + Khoai tây chiên + Nước ngọt", status: "active" },
        ]);
        console.log(`🍿 [Seed]: Đã tạo ${combos.length} combo.`);
        // ===================== TẠO KHUYẾN MÃI =====================
        const promos = await promotionModel_js_1.default.insertMany([
            { code: "WELCOME10", title: "Giảm 10%", description: "Giảm 10% cho đơn hàng đầu tiên", discountType: "percent", discountValue: 10, minOrderValue: 100000, maxDiscount: 50000, usageLimit: 1000, usedCount: 0, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
            { code: "T5GIAM50", title: "Thứ 5 giảm 50k", description: "Giảm 50.000đ cho vé xem phim vào thứ 5 hàng tuần", discountType: "amount", discountValue: 50000, minOrderValue: 100000, maxDiscount: 50000, usageLimit: 500, usedCount: 15, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
            { code: "SINHNHAT", title: "Quà sinh nhật", description: "Giảm 30% vé xem phim nhân dịp sinh nhật (tối đa 100k)", discountType: "percent", discountValue: 30, minOrderValue: 0, maxDiscount: 100000, usageLimit: 1, usedCount: 0, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
            { code: "COMBO20", title: "Giảm combo 20%", description: "Giảm 20% khi mua combo bắp nước", discountType: "percent", discountValue: 20, minOrderValue: 50000, maxDiscount: 30000, usageLimit: 200, usedCount: 8, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), active: true },
            { code: "THU7VIP", title: "Thứ 7 VIP", description: "Giảm 30k cho vé VIP vào thứ 7", discountType: "amount", discountValue: 30000, minOrderValue: 150000, maxDiscount: 30000, usageLimit: 100, usedCount: 3, startDate: new Date("2026-01-01"), endDate: new Date("2026-06-30"), active: true },
        ]);
        console.log(`🏷️ [Seed]: Đã tạo ${promos.length} khuyến mãi.`);
        // ===================== TẠO SLIDER =====================
        const sliders = await sliderModel_js_1.default.insertMany([
            { title: "Lật Mặt 7: Một Điều Ước", imageUrl: "https://homepage.lyhaiproductions.com/wp-content/uploads/2024/04/LM7_BANNER.jpg", image: "https://homepage.lyhaiproductions.com/wp-content/uploads/2024/04/LM7_BANNER.jpg", linkUrl: "", link: "", description: "Phim gia đình cảm động nhất năm", order: 1, active: true },
            { title: "Avatar: Fire and Ash", imageUrl: "https://images.squarespace-cdn.com/content/v1/511cbfc4e4b0a70bc10b5030/1441865201502-V68U797D66WHLI6SFO9Y/avatar-banner.jpg", image: "https://images.squarespace-cdn.com/content/v1/511cbfc4e4b0a70bc10b5030/1441865201502-V68U797D66WHLI6SFO9Y/avatar-banner.jpg", linkUrl: "", link: "", description: "Hành trình trở lại Pandora", order: 2, active: true },
            { title: "Deadpool & Wolverine", imageUrl: "https://image.tmdb.org/t/p/original/9l1eZi1RPN6Y0JQJ5SVFNEjPkKp.jpg", image: "https://image.tmdb.org/t/p/original/9l1eZi1RPN6Y0JQJ5SVFNEjPkKp.jpg", linkUrl: "", link: "", description: "Bộ đôi lầy lội nhất vũ trụ", order: 3, active: true },
            { title: "Inside Out 2", imageUrl: "https://image.tmdb.org/t/p/original/vpnVM9B6NMmQpWeZvVJ3d8CfzqI.jpg", image: "https://image.tmdb.org/t/p/original/vpnVM9B6NMmQpWeZvVJ3d8CfzqI.jpg", linkUrl: "", link: "", description: "Cảm xúc mới, cuộc phiêu lưu mới", order: 4, active: true },
        ]);
        console.log(`📺 [Seed]: Đã tạo ${sliders.length} slider.`);
        // ===================== TẠO BOOKING & INVOICE =====================
        const testUsers = users.filter(u => u.role === "user");
        const activeShowtimes = showtimeDocs.slice(0, 10);
        const bookingDocs = [];
        const invoiceDocs = [];
        for (let i = 0; i < 8 && i < activeShowtimes.length; i++) {
            const showtimeRef = activeShowtimes[i];
            const userRef = testUsers[i % testUsers.length];
            // Pick real seats from the showtime's availableSeats
            const allLabels = seatLabelsByRoomName[showtimeRef.roomName] || [];
            const seatCount = Math.min(Math.floor(Math.random() * 3) + 1, Math.floor(allLabels.length / 2));
            const shuffled = [...allLabels].sort(() => Math.random() - 0.5);
            const seatNames = shuffled.slice(0, seatCount);
            // Remove booked seats from availableSeats
            for (const label of seatNames) {
                const idx = showtimeRef.availableSeats.indexOf(label);
                if (idx !== -1)
                    showtimeRef.availableSeats.splice(idx, 1);
            }
            const totalPrice = showtimeRef.price * seatCount;
            const booking = await bookingModel_js_1.default.create({
                user: userRef._id,
                showtime: showtimeRef._id,
                showtimeId: showtimeRef._id,
                userId: userRef._id,
                seats: seatNames,
                combo: combos[i % combos.length]._id,
                comboQuantity: Math.floor(Math.random() * 2) + 1,
                totalPrice,
                totalAmount: totalPrice,
                status: "paid",
                paymentStatus: "completed",
            });
            // Update showtime in DB with reduced availableSeats
            await showtimeModel_js_1.default.findByIdAndUpdate(showtimeRef._id, { availableSeats: showtimeRef.availableSeats });
            const invoice = await invoiceModel_js_1.default.create({
                booking: booking._id,
                amount: totalPrice,
                method: ["momo", "zalopay", "vnpay", "credit_card", "cash"][i % 5],
                status: "paid",
                transactionId: `TXN${Date.now()}${i}`,
            });
            bookingDocs.push(booking);
            invoiceDocs.push(invoice);
        }
        console.log(`🎫 [Seed]: Đã tạo ${bookingDocs.length} đơn đặt vé và hóa đơn (ghế đã được trừ khỏi suất chiếu).`);
        // ===================== TẠO REVIEW =====================
        const reviewMovies = movies.slice(0, 6);
        await reviewModel_js_1.default.insertMany([
            { movie: reviewMovies[0]._id, user: testUsers[0]._id, rating: 5, comment: "Phim rất hay và cảm động, diễn xuất tuyệt vời!" },
            { movie: reviewMovies[0]._id, user: testUsers[1]._id, rating: 5, comment: "Xúc động từ đầu đến cuối." },
            { movie: reviewMovies[1]._id, user: testUsers[0]._id, rating: 5, comment: "Đồ họa đẹp không tưởng tượng nổi!" },
            { movie: reviewMovies[1]._id, user: testUsers[2]._id, rating: 4, comment: "Hay nhưng hơi dài." },
            { movie: reviewMovies[2]._id, user: testUsers[1]._id, rating: 5, comment: "Hài hước và hành động mãn nhãn!" },
            { movie: reviewMovies[2]._id, user: testUsers[3]._id, rating: 5, comment: "Deadpool và Wolverine quá đỉnh!" },
            { movie: reviewMovies[3]._id, user: testUsers[0]._id, rating: 4, comment: "Rất phù hợp cho gia đình có trẻ nhỏ." },
            { movie: reviewMovies[4]._id, user: testUsers[2]._id, rating: 5, comment: "Cảnh chiến đấu hoành tráng!" },
            { movie: reviewMovies[5]._id, user: testUsers[1]._id, rating: 4, comment: "Kịch bản hay, diễn xuất tốt." },
        ]);
        console.log(`⭐ [Seed]: Đã tạo 9 đánh giá phim.`);
        // ===================== TỔNG KẾT =====================
        console.log("\n========================================");
        console.log("✅ [Seed]: TẠO DỮ LIỆU HOÀN TẤT!");
        console.log("========================================");
        console.log(`📊 Tổng kết:`);
        console.log(`   - ${genres.length} thể loại`);
        console.log(`   - ${movies.length} phim`);
        console.log(`   - ${users.length} tài khoản (1 admin, 2 staff, 5 user)`);
        console.log(`   - ${cinemas.length} cụm rạp`);
        console.log(`   - ${rooms.length} phòng chiếu`);
        console.log(`   - ${seatDocs.length} ghế`);
        console.log(`   - ${showtimeDocs.length} suất chiếu`);
        console.log(`   - ${combos.length} combo`);
        console.log(`   - ${promos.length} khuyến mãi`);
        console.log(`   - ${sliders.length} slider`);
        console.log(`   - ${bookingDocs.length} đơn đặt vé + hóa đơn`);
        console.log(`   - 9 đánh giá phim`);
        console.log("========================================");
        console.log("👤 Admin: admin / admin123");
        console.log("👤 Staff: staff01 / admin123");
        console.log("👤 User:  user01 / user123");
        console.log("========================================\n");
    }
    catch (error) {
        console.error("🔴 [Seed] Thất bại:", error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 [Seed]: Đã ngắt kết nối an toàn.");
    }
}
seedDatabase();
//# sourceMappingURL=seed-full.js.map