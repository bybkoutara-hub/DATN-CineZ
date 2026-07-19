"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShowtimeDetail = exports.addShowtime = exports.getMovieDetailWithShowtimes = exports.addMovie = exports.getMovies = void 0;
const movieModel_js_1 = __importDefault(require("../models/movieModel.js"));
const showtimeModel_js_1 = __importDefault(require("../models/showtimeModel.js"));
const getMovies = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter = { status };
        }
        const movies = await movieModel_js_1.default.find(filter);
        res.status(200).json({ success: true, data: movies });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMovies = getMovies;
const addMovie = async (req, res) => {
    try {
        const newMovie = new movieModel_js_1.default(req.body);
        await newMovie.save();
        res.status(201).json({ success: true, data: newMovie });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.addMovie = addMovie;
// Hàm lấy chi tiết phim và lịch chiếu tương ứng (ĐÃ FIX LỒNG CẤU TRÚC THEO FRONTEND)
const getMovieDetailWithShowtimes = async (req, res) => {
    try {
        const { id } = req.params; // Nhận Movie ID từ đường dẫn URL
        if (!id) {
            res.status(400).json({ success: false, message: "Mã định danh phim không hợp lệ" });
            return;
        }
        // 1. Tìm thông tin bộ phim
        const movie = await movieModel_js_1.default.findById(id);
        if (!movie) {
            res.status(404).json({ success: false, message: "Không tìm thấy phim này" });
            return;
        }
        // 2. Tìm tất cả các suất chiếu của bộ phim đó lớn hơn hoặc bằng thời gian hiện tại
        const showtimes = await showtimeModel_js_1.default.find({
            movieId: id,
            startTime: { $gte: new Date() }
        }).sort({ startTime: 1 });
        // 3. ĐÓNG GÓI ĐÚNG DẠNG LỒNG NHAU THEO KỲ VỌNG CỦA FRONTEND MOVIE_SERVICE
        res.status(200).json({
            success: true,
            data: {
                movie: movie,
                showtimes: showtimes || []
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy chi tiết phim",
            error: error.message
        });
    }
};
exports.getMovieDetailWithShowtimes = getMovieDetailWithShowtimes;
// Hàm hỗ trợ Manager thêm suất chiếu (ĐÃ FIX ĐỒNG BỘ TÊN TRƯỜNG SCHEMA movie_id)
const addShowtime = async (req, res) => {
    try {
        const { movieId, roomName, startTime, price } = req.body;
        // Tạo sẵn cụm 20 ghế mặc định tự động từ A1 -> B10
        const availableSeats = [];
        for (let row of ["A", "B"]) {
            for (let i = 1; i <= 10; i++) {
                availableSeats.push(`${row}${i}`);
            }
        }
        // Đổi trường gán từ movieId sang movie_id cho đúng Schema Database
        const newShowtime = new showtimeModel_js_1.default({
            movieId: movieId,
            roomName,
            startTime,
            price,
            availableSeats
        });
        await newShowtime.save();
        res.status(201).json({ success: true, data: newShowtime });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.addShowtime = addShowtime;
const getShowtimeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const showtime = await showtimeModel_js_1.default.findById(id);
        if (!showtime) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        res.status(200).json({ success: true, data: showtime });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getShowtimeDetail = getShowtimeDetail;
//# sourceMappingURL=movieController.js.map