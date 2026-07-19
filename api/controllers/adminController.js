"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlider = exports.updateSlider = exports.createSlider = exports.getSliderById = exports.getSliders = exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getStaffById = exports.getStaffs = exports.getMemberBookings = exports.updateMember = exports.getMemberById = exports.getMembers = exports.validatePromotion = exports.deletePromotion = exports.updatePromotion = exports.createPromotion = exports.getPromotionById = exports.getPromotions = exports.deleteCombo = exports.updateCombo = exports.createCombo = exports.getComboById = exports.getCombos = exports.getBookedSeats = exports.deleteAdminShowtime = exports.updateAdminShowtime = exports.createAdminShowtime = exports.getAdminShowtimeById = exports.getAdminShowtimes = exports.getRoomSeats = exports.deleteRoom = exports.updateRoom = exports.createRoom = exports.getRoomById = exports.getRooms = exports.deleteAdminMovie = exports.updateAdminMovie = exports.createAdminMovie = exports.getAdminMovieById = exports.getAdminMovies = exports.deleteGenre = exports.updateGenre = exports.createGenre = exports.getGenreById = exports.getGenres = exports.adminUpdateProfile = exports.adminGetProfile = exports.adminRegister = void 0;
exports.getDashboardTopMovies = exports.getDashboardRevenueByMovie = exports.getDashboardRevenue = exports.getDashboardStats = exports.updateInvoice = exports.createInvoice = exports.getInvoiceByBooking = exports.getInvoiceById = exports.getInvoices = exports.cancelBooking = exports.updateBookingStatus = exports.getAdminBookingById = exports.getAdminBookings = exports.deleteSeat = exports.updateSeat = exports.bulkCreateSeats = exports.getSeatsByRoom = exports.getSeats = exports.reorderSliders = void 0;
const genreModel_1 = __importDefault(require("../models/genreModel"));
const movieModel_1 = __importDefault(require("../models/movieModel"));
const roomModel_1 = __importDefault(require("../models/roomModel"));
const showtimeModel_1 = __importDefault(require("../models/showtimeModel"));
const comboModel_1 = __importDefault(require("../models/comboModel"));
const promotionModel_1 = __importDefault(require("../models/promotionModel"));
const sliderModel_1 = __importDefault(require("../models/sliderModel"));
const seatModel_1 = __importDefault(require("../models/seatModel"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
// ==================== AUTH ====================
const adminRegister = async (req, res) => {
    try {
        const { username, password, fullName, email, phone, role } = req.body;
        if (!username || !password || !fullName) {
            res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
            return;
        }
        const userExists = await userModel_1.default.findOne({ username });
        if (userExists) {
            res.status(400).json({ success: false, message: "Tên tài khoản đã tồn tại!" });
            return;
        }
        const newUser = new userModel_1.default({ username, password, fullName, email, phone, role: role || "customer" });
        await newUser.save();
        res.status(201).json({ success: true, message: "Tạo tài khoản thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký", error: error.message });
    }
};
exports.adminRegister = adminRegister;
const adminGetProfile = async (req, res) => {
    try {
        const user = await userModel_1.default.findById(req.user?.id).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy thông tin", error: error.message });
    }
};
exports.adminGetProfile = adminGetProfile;
const adminUpdateProfile = async (req, res) => {
    try {
        const { fullName, email, phone } = req.body;
        const user = await userModel_1.default.findByIdAndUpdate(req.user?.id, { fullName, email, phone }, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật thông tin thành công!", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật", error: error.message });
    }
};
exports.adminUpdateProfile = adminUpdateProfile;
// ==================== GENRES ====================
const getGenres = async (_req, res) => {
    try {
        const genres = await genreModel_1.default.find().sort({ name: 1 });
        res.status(200).json(genres);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách thể loại", error });
    }
};
exports.getGenres = getGenres;
const getGenreById = async (req, res) => {
    try {
        const genre = await genreModel_1.default.findById(req.params.id);
        if (!genre) {
            res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
            return;
        }
        res.status(200).json(genre);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết thể loại", error });
    }
};
exports.getGenreById = getGenreById;
const createGenre = async (req, res) => {
    try {
        const newGenre = new genreModel_1.default(req.body);
        const saved = await newGenre.save();
        res.status(201).json({ success: true, message: "Thêm thể loại thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo thể loại", error });
    }
};
exports.createGenre = createGenre;
const updateGenre = async (req, res) => {
    try {
        const updated = await genreModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật thể loại thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật thể loại", error });
    }
};
exports.updateGenre = updateGenre;
const deleteGenre = async (req, res) => {
    try {
        const deleted = await genreModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
            return;
        }
        res.status(200).json({ success: true, message: "Xóa thể loại thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa thể loại", error });
    }
};
exports.deleteGenre = deleteGenre;
// ==================== MOVIES ====================
const getAdminMovies = async (req, res) => {
    try {
        const { status, search } = req.query;
        let filter = {};
        if (status)
            filter.status = status;
        if (search)
            filter.title = { $regex: search, $options: "i" };
        const movies = await movieModel_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json(movies);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách phim", error });
    }
};
exports.getAdminMovies = getAdminMovies;
const getAdminMovieById = async (req, res) => {
    try {
        const movie = await movieModel_1.default.findById(req.params.id);
        if (!movie) {
            res.status(404).json({ success: false, message: "Không tìm thấy phim" });
            return;
        }
        res.status(200).json(movie);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết phim", error });
    }
};
exports.getAdminMovieById = getAdminMovieById;
const createAdminMovie = async (req, res) => {
    try {
        const newMovie = new movieModel_1.default(req.body);
        const saved = await newMovie.save();
        res.status(201).json({ success: true, message: "Đã thêm phim mới vào hệ thống!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Không thể thêm phim mới", error });
    }
};
exports.createAdminMovie = createAdminMovie;
const updateAdminMovie = async (req, res) => {
    try {
        const updated = await movieModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy phim" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật phim", error });
    }
};
exports.updateAdminMovie = updateAdminMovie;
const deleteAdminMovie = async (req, res) => {
    try {
        const deleted = await movieModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy phim" });
            return;
        }
        res.status(200).json({ success: true, message: "Đã xóa phim thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa phim", error });
    }
};
exports.deleteAdminMovie = deleteAdminMovie;
// ==================== ROOMS ====================
const getRooms = async (_req, res) => {
    try {
        const rooms = await roomModel_1.default.find().sort({ name: 1 });
        res.status(200).json(rooms);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách phòng", error });
    }
};
exports.getRooms = getRooms;
const getRoomById = async (req, res) => {
    try {
        const room = await roomModel_1.default.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
            return;
        }
        res.status(200).json(room);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết phòng", error });
    }
};
exports.getRoomById = getRoomById;
const createRoom = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.rows_count && data.seats_per_row && !data.totalSeats) {
            data.totalSeats = data.rows_count * data.seats_per_row;
        }
        const newRoom = new roomModel_1.default(data);
        const saved = await newRoom.save();
        res.status(201).json({ success: true, message: "Thêm phòng thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo phòng", error });
    }
};
exports.createRoom = createRoom;
const updateRoom = async (req, res) => {
    try {
        const updated = await roomModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật phòng thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật phòng", error });
    }
};
exports.updateRoom = updateRoom;
const deleteRoom = async (req, res) => {
    try {
        const deleted = await roomModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
            return;
        }
        await seatModel_1.default.deleteMany({ room: req.params.id });
        res.status(200).json({ success: true, message: "Xóa phòng thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa phòng", error });
    }
};
exports.deleteRoom = deleteRoom;
const getRoomSeats = async (req, res) => {
    try {
        const seats = await seatModel_1.default.find({ room: req.params.id }).sort({ row: 1, number: 1 });
        res.status(200).json(seats);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy sơ đồ ghế", error });
    }
};
exports.getRoomSeats = getRoomSeats;
// ==================== SHOWTIMES ====================
const getAdminShowtimes = async (req, res) => {
    try {
        const { movie_id, roomName, date } = req.query;
        let filter = {};
        if (movie_id)
            filter.movieId = movie_id;
        if (roomName)
            filter.roomName = roomName;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.startTime = { $gte: start, $lte: end };
        }
        const showtimes = await showtimeModel_1.default.find(filter)
            .populate("movieId", "title poster_url duration")
            .sort({ startTime: 1 });
        res.status(200).json(showtimes);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách suất chiếu", error });
    }
};
exports.getAdminShowtimes = getAdminShowtimes;
const getAdminShowtimeById = async (req, res) => {
    try {
        const showtime = await showtimeModel_1.default.findById(req.params.id)
            .populate("movieId", "title poster_url duration genres");
        if (!showtime) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        res.status(200).json(showtime);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết suất chiếu", error });
    }
};
exports.getAdminShowtimeById = getAdminShowtimeById;
const createAdminShowtime = async (req, res) => {
    try {
        const newShowtime = new showtimeModel_1.default(req.body);
        const saved = await newShowtime.save();
        res.status(201).json({ success: true, message: "Tạo suất chiếu thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Không thể tạo suất chiếu", error });
    }
};
exports.createAdminShowtime = createAdminShowtime;
const updateAdminShowtime = async (req, res) => {
    try {
        const updated = await showtimeModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật suất chiếu thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật suất chiếu", error });
    }
};
exports.updateAdminShowtime = updateAdminShowtime;
const deleteAdminShowtime = async (req, res) => {
    try {
        const deleted = await showtimeModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            return;
        }
        res.status(200).json({ success: true, message: "Đã xóa suất chiếu thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa suất chiếu", error });
    }
};
exports.deleteAdminShowtime = deleteAdminShowtime;
const getBookedSeats = async (req, res) => {
    try {
        const bookings = await bookingModel_1.default.find({
            $or: [
                { showtime: req.params.id, status: "paid" },
                { showtimeId: req.params.id, paymentStatus: "completed" },
            ],
        });
        const bookedSeats = [];
        bookings.forEach((b) => bookedSeats.push(...b.seats));
        res.status(200).json({ success: true, bookedSeats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy trạng thái ghế", error });
    }
};
exports.getBookedSeats = getBookedSeats;
// ==================== COMBOS ====================
const getCombos = async (req, res) => {
    try {
        const status = req.query.status;
        const filter = status ? { status } : {};
        const combos = await comboModel_1.default.find(filter).sort({ price: 1 });
        res.status(200).json(combos);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách combo", error });
    }
};
exports.getCombos = getCombos;
const getComboById = async (req, res) => {
    try {
        const combo = await comboModel_1.default.findById(req.params.id);
        if (!combo) {
            res.status(404).json({ success: false, message: "Không tìm thấy combo" });
            return;
        }
        res.status(200).json(combo);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết combo", error });
    }
};
exports.getComboById = getComboById;
const createCombo = async (req, res) => {
    try {
        const newCombo = new comboModel_1.default(req.body);
        const saved = await newCombo.save();
        res.status(201).json({ success: true, message: "Thêm combo thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo combo", error });
    }
};
exports.createCombo = createCombo;
const updateCombo = async (req, res) => {
    try {
        const updated = await comboModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy combo" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật combo thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật combo", error });
    }
};
exports.updateCombo = updateCombo;
const deleteCombo = async (req, res) => {
    try {
        const deleted = await comboModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy combo" });
            return;
        }
        res.status(200).json({ success: true, message: "Đã xóa combo" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa combo", error });
    }
};
exports.deleteCombo = deleteCombo;
// ==================== PROMOTIONS ====================
const getPromotions = async (req, res) => {
    try {
        const { active, search } = req.query;
        let filter = {};
        if (active !== undefined)
            filter.active = active === "true";
        if (search)
            filter.code = { $regex: search, $options: "i" };
        const promotions = await promotionModel_1.default.find(filter).sort({ createdAt: -1 });
        res.status(200).json(promotions);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách khuyến mãi", error });
    }
};
exports.getPromotions = getPromotions;
const getPromotionById = async (req, res) => {
    try {
        const promotion = await promotionModel_1.default.findById(req.params.id);
        if (!promotion) {
            res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
            return;
        }
        res.status(200).json(promotion);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết khuyến mãi", error });
    }
};
exports.getPromotionById = getPromotionById;
const createPromotion = async (req, res) => {
    try {
        const newPromotion = new promotionModel_1.default(req.body);
        const saved = await newPromotion.save();
        res.status(201).json({ success: true, message: "Thêm khuyến mãi thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo khuyến mãi", error });
    }
};
exports.createPromotion = createPromotion;
const updatePromotion = async (req, res) => {
    try {
        const updated = await promotionModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật khuyến mãi thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật khuyến mãi", error });
    }
};
exports.updatePromotion = updatePromotion;
const deletePromotion = async (req, res) => {
    try {
        const deleted = await promotionModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy khuyến mãi" });
            return;
        }
        res.status(200).json({ success: true, message: "Xóa khuyến mãi thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa khuyến mãi", error });
    }
};
exports.deletePromotion = deletePromotion;
const validatePromotion = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        const promotion = await promotionModel_1.default.findOne({ code: code.toUpperCase(), active: true });
        if (!promotion) {
            res.status(404).json({ success: false, message: "Mã khuyến mãi không hợp lệ!" });
            return;
        }
        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
            res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết hạn!" });
            return;
        }
        if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
            res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng!" });
            return;
        }
        if (orderValue && orderValue < promotion.minOrderValue) {
            res.status(400).json({ success: false, message: `Giá trị đơn hàng tối thiểu là ${promotion.minOrderValue.toLocaleString()}đ!` });
            return;
        }
        let discount = 0;
        if (promotion.discountType === "percent") {
            discount = Math.round((orderValue || 0) * promotion.discountValue / 100);
            if (promotion.maxDiscount > 0 && discount > promotion.maxDiscount) {
                discount = promotion.maxDiscount;
            }
        }
        else {
            discount = promotion.discountValue;
        }
        res.status(200).json({
            success: true,
            data: {
                code: promotion.code,
                discountType: promotion.discountType,
                discountValue: promotion.discountValue,
                discount,
                description: promotion.description,
            },
            message: "Áp dụng mã khuyến mãi thành công!",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi kiểm tra khuyến mãi", error: error.message });
    }
};
exports.validatePromotion = validatePromotion;
// ==================== MEMBERS ====================
const getMembers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let filter = { role: { $in: ["user", "customer"] } };
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (status !== undefined)
            filter.active = status === "active";
        const users = await userModel_1.default.find(filter).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách thành viên", error });
    }
};
exports.getMembers = getMembers;
const getMemberById = async (req, res) => {
    try {
        const user = await userModel_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy thành viên" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết thành viên", error });
    }
};
exports.getMemberById = getMemberById;
const updateMember = async (req, res) => {
    try {
        const { fullName, email, phone, active } = req.body;
        const updated = await userModel_1.default.findByIdAndUpdate(req.params.id, { fullName, email, phone, active }, { new: true }).select("-password");
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy thành viên" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật thành viên thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật thành viên", error });
    }
};
exports.updateMember = updateMember;
const getMemberBookings = async (req, res) => {
    try {
        const bookings = await bookingModel_1.default.find({
            $or: [{ user: req.params.id }, { userId: req.params.id }],
        })
            .populate({ path: "showtime", populate: { path: "movieId", select: "title poster_url" } })
            .populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster_url" } })
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy lịch sử đặt vé", error });
    }
};
exports.getMemberBookings = getMemberBookings;
// ==================== STAFF ====================
const getStaffs = async (req, res) => {
    try {
        const { search, role, active } = req.query;
        let filter = {};
        if (role)
            filter.role = role;
        if (active !== undefined)
            filter.active = active === "true";
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }
        const staff = await userModel_1.default.find({ ...filter, role: { $in: ["staff", "admin"] } })
            .select("-password")
            .sort({ createdAt: -1 });
        res.status(200).json(staff);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách nhân viên", error });
    }
};
exports.getStaffs = getStaffs;
const getStaffById = async (req, res) => {
    try {
        const staff = await userModel_1.default.findById(req.params.id).select("-password");
        if (!staff) {
            res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
            return;
        }
        res.status(200).json(staff);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết nhân viên", error });
    }
};
exports.getStaffById = getStaffById;
const createStaff = async (req, res) => {
    try {
        const { username, password, fullName, email, phone, role } = req.body;
        if (!username || !password || !fullName) {
            res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
            return;
        }
        const existing = await userModel_1.default.findOne({ username });
        if (existing) {
            res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
            return;
        }
        const newStaff = new userModel_1.default({
            username, password, fullName, email, phone,
            role: role || "staff", active: true,
        });
        const saved = await newStaff.save();
        res.status(201).json({
            success: true,
            message: "Thêm nhân viên thành công!",
            data: { _id: saved._id, username: saved.username, fullName: saved.fullName, email: saved.email, phone: saved.phone, role: saved.role },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo nhân viên", error: error.message });
    }
};
exports.createStaff = createStaff;
const updateStaff = async (req, res) => {
    try {
        const { fullName, email, phone, role, active } = req.body;
        const updateData = {};
        if (fullName !== undefined)
            updateData.fullName = fullName;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (role !== undefined)
            updateData.role = role;
        if (active !== undefined)
            updateData.active = active;
        const updated = await userModel_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật nhân viên thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật nhân viên", error });
    }
};
exports.updateStaff = updateStaff;
const deleteStaff = async (req, res) => {
    try {
        const deleted = await userModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
            return;
        }
        res.status(200).json({ success: true, message: "Xóa nhân viên thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa nhân viên", error });
    }
};
exports.deleteStaff = deleteStaff;
// ==================== SLIDERS ====================
const getSliders = async (req, res) => {
    try {
        const { active } = req.query;
        const filter = active !== undefined ? { active: active === "true" } : {};
        const sliders = await sliderModel_1.default.find(filter).sort({ order: 1, createdAt: -1 });
        res.status(200).json(sliders);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách slider", error });
    }
};
exports.getSliders = getSliders;
const getSliderById = async (req, res) => {
    try {
        const slider = await sliderModel_1.default.findById(req.params.id);
        if (!slider) {
            res.status(404).json({ success: false, message: "Không tìm thấy slider" });
            return;
        }
        res.status(200).json(slider);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết slider", error });
    }
};
exports.getSliderById = getSliderById;
const createSlider = async (req, res) => {
    try {
        const newSlider = new sliderModel_1.default(req.body);
        const saved = await newSlider.save();
        res.status(201).json({ success: true, message: "Thêm slider thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo slider", error });
    }
};
exports.createSlider = createSlider;
const updateSlider = async (req, res) => {
    try {
        const updated = await sliderModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy slider" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật slider thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật slider", error });
    }
};
exports.updateSlider = updateSlider;
const deleteSlider = async (req, res) => {
    try {
        const deleted = await sliderModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy slider" });
            return;
        }
        res.status(200).json({ success: true, message: "Xóa slider thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa slider", error });
    }
};
exports.deleteSlider = deleteSlider;
const reorderSliders = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
            return;
        }
        for (const item of items) {
            await sliderModel_1.default.findByIdAndUpdate(item._id, { order: item.order });
        }
        res.status(200).json({ success: true, message: "Sắp xếp slider thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi sắp xếp slider", error });
    }
};
exports.reorderSliders = reorderSliders;
// ==================== SEATS ====================
const getSeats = async (req, res) => {
    try {
        const { room: roomId, type, status } = req.query;
        let filter = {};
        if (roomId)
            filter.room = roomId;
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        const seats = await seatModel_1.default.find(filter).populate("room", "name").sort({ row: 1, number: 1 });
        res.status(200).json(seats);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách ghế", error });
    }
};
exports.getSeats = getSeats;
const getSeatsByRoom = async (req, res) => {
    try {
        const seats = await seatModel_1.default.find({ room: req.params.roomId }).sort({ row: 1, number: 1 });
        res.status(200).json(seats);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy ghế theo phòng", error });
    }
};
exports.getSeatsByRoom = getSeatsByRoom;
const bulkCreateSeats = async (req, res) => {
    try {
        const { room: roomId, seats: seatsData } = req.body;
        if (!roomId || !Array.isArray(seatsData) || seatsData.length === 0) {
            res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
            return;
        }
        await seatModel_1.default.deleteMany({ room: roomId });
        const seatsToInsert = seatsData.map((s) => ({
            room: roomId,
            row: s.row,
            number: s.number,
            label: s.label || `${s.row}${s.number}`,
            type: s.type || "standard",
            status: s.status || "available",
            price: s.price || 0,
        }));
        const saved = await seatModel_1.default.insertMany(seatsToInsert);
        res.status(201).json({ success: true, message: "Tạo ghế thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo ghế hàng loạt", error });
    }
};
exports.bulkCreateSeats = bulkCreateSeats;
const updateSeat = async (req, res) => {
    try {
        const updated = await seatModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật ghế thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật ghế", error });
    }
};
exports.updateSeat = updateSeat;
const deleteSeat = async (req, res) => {
    try {
        const deleted = await seatModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
            return;
        }
        res.status(200).json({ success: true, message: "Xóa ghế thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa ghế", error });
    }
};
exports.deleteSeat = deleteSeat;
// ==================== BOOKINGS ====================
const getAdminBookings = async (req, res) => {
    try {
        const { paymentStatus, search, from, to } = req.query;
        let filter = {};
        if (paymentStatus)
            filter.$or = [{ status: paymentStatus }, { paymentStatus }];
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        const bookings = await bookingModel_1.default.find(filter)
            .populate("user", "username fullName email phone")
            .populate("userId", "username fullName email phone")
            .populate({ path: "showtime", populate: { path: "movieId", select: "title poster_url duration" } })
            .populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster_url duration" } })
            .populate("combo", "name price")
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách đặt vé", error });
    }
};
exports.getAdminBookings = getAdminBookings;
const getAdminBookingById = async (req, res) => {
    try {
        const booking = await bookingModel_1.default.findById(req.params.id)
            .populate("user", "username fullName email phone")
            .populate("userId", "username fullName email phone")
            .populate({ path: "showtime", populate: { path: "movieId", select: "title poster_url duration genres" } })
            .populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster_url duration genres" } })
            .populate("combo", "name price items");
        if (!booking) {
            res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
            return;
        }
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết đặt vé", error });
    }
};
exports.getAdminBookingById = getAdminBookingById;
const updateBookingStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (paymentStatus)
            updateData.paymentStatus = paymentStatus;
        const updated = await bookingModel_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật đặt vé thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật đặt vé", error });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const cancelBooking = async (req, res) => {
    try {
        const updated = await bookingModel_1.default.findByIdAndUpdate(req.params.id, { status: "cancelled", paymentStatus: "cancelled" }, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy đặt vé" });
            return;
        }
        res.status(200).json({ success: true, message: "Hủy đặt vé thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hủy đặt vé", error });
    }
};
exports.cancelBooking = cancelBooking;
// ==================== INVOICES ====================
const getInvoices = async (req, res) => {
    try {
        const { status, method, from, to } = req.query;
        let filter = {};
        if (status)
            filter.status = status;
        if (method)
            filter.method = method;
        if (from || to) {
            filter.issuedAt = {};
            if (from)
                filter.issuedAt.$gte = new Date(from);
            if (to)
                filter.issuedAt.$lte = new Date(to);
        }
        const invoices = await invoiceModel_1.default.find(filter)
            .populate({
            path: "booking",
            populate: [
                { path: "user", select: "username fullName" },
                { path: "userId", select: "username fullName" },
                { path: "showtime", populate: { path: "movieId", select: "title" } },
                { path: "showtimeId", populate: { path: "movieId", select: "title" } },
            ],
        })
            .sort({ issuedAt: -1 });
        res.status(200).json(invoices);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách hóa đơn", error });
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await invoiceModel_1.default.findById(req.params.id)
            .populate({
            path: "booking",
            populate: [
                { path: "user", select: "username fullName email phone" },
                { path: "userId", select: "username fullName email phone" },
                { path: "showtime", populate: { path: "movieId", select: "title poster_url duration genres" } },
                { path: "showtimeId", populate: { path: "movieId", select: "title poster_url duration genres" } },
                { path: "combo", select: "name price items" },
            ],
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
            return;
        }
        res.status(200).json(invoice);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy chi tiết hóa đơn", error });
    }
};
exports.getInvoiceById = getInvoiceById;
const getInvoiceByBooking = async (req, res) => {
    try {
        const invoice = await invoiceModel_1.default.findOne({ booking: req.params.bookingId })
            .populate({
            path: "booking",
            populate: [
                { path: "user", select: "username fullName email phone" },
                { path: "userId", select: "username fullName email phone" },
                { path: "showtime", populate: { path: "movieId", select: "title poster_url duration" } },
                { path: "showtimeId", populate: { path: "movieId", select: "title poster_url duration" } },
            ],
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn cho đặt vé này" });
            return;
        }
        res.status(200).json(invoice);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy hóa đơn theo đặt vé", error });
    }
};
exports.getInvoiceByBooking = getInvoiceByBooking;
const createInvoice = async (req, res) => {
    try {
        const { booking: bookingId, method, transactionId, status } = req.body;
        if (!bookingId) {
            res.status(400).json({ success: false, message: "Thiếu thông tin đặt vé!" });
            return;
        }
        const booking = await bookingModel_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({ success: false, message: "Không tìm thấy đặt vé!" });
            return;
        }
        const existing = await invoiceModel_1.default.findOne({ booking: bookingId });
        if (existing) {
            res.status(400).json({ success: false, message: "Hóa đơn cho đặt vé này đã tồn tại!" });
            return;
        }
        const newInvoice = new invoiceModel_1.default({
            booking: bookingId,
            amount: booking.totalPrice || booking.totalAmount,
            method: method || "cash",
            status: status || "paid",
            transactionId: transactionId || "",
        });
        const saved = await newInvoice.save();
        if (saved.status === "paid") {
            await bookingModel_1.default.findByIdAndUpdate(bookingId, { paymentStatus: "completed" });
        }
        res.status(201).json({ success: true, message: "Tạo hóa đơn thành công!", data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo hóa đơn", error });
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { status, method, transactionId } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (method)
            updateData.method = method;
        if (transactionId !== undefined)
            updateData.transactionId = transactionId;
        const updated = await invoiceModel_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
            return;
        }
        res.status(200).json({ success: true, message: "Cập nhật hóa đơn thành công!", data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật hóa đơn", error });
    }
};
exports.updateInvoice = updateInvoice;
// ==================== DASHBOARD ====================
const getDashboardStats = async (_req, res) => {
    try {
        const bookings = await bookingModel_1.default.find({
            $or: [{ status: "paid" }, { paymentStatus: "completed" }],
        });
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);
        const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
        const totalMembers = await userModel_1.default.countDocuments({ role: { $in: ["user", "customer"] } });
        const totalMovies = await movieModel_1.default.countDocuments();
        const totalShowtimes = await showtimeModel_1.default.countDocuments({ status: "active" });
        const totalBookings = await bookingModel_1.default.countDocuments();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayBookings = await bookingModel_1.default.find({
            $or: [{ status: "paid" }, { paymentStatus: "completed" }],
            createdAt: { $gte: todayStart },
        });
        const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);
        const todayTickets = todayBookings.reduce((sum, b) => sum + b.seats.length, 0);
        res.status(200).json({
            success: true,
            data: { totalRevenue, totalTickets, totalMembers, totalMovies, totalShowtimes, totalBookings, todayRevenue, todayTickets },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tính toán thống kê", error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const getDashboardRevenue = async (req, res) => {
    try {
        const { from, to } = req.query;
        let filter = {
            $or: [{ status: "paid" }, { paymentStatus: "completed" }],
        };
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        const bookings = await bookingModel_1.default.find(filter).sort({ createdAt: 1 });
        const revenueByDate = {};
        bookings.forEach((b) => {
            const dateKey = b.createdAt.toISOString().slice(0, 10);
            if (!revenueByDate[dateKey])
                revenueByDate[dateKey] = { date: dateKey, revenue: 0, tickets: 0 };
            revenueByDate[dateKey].revenue += b.totalPrice || b.totalAmount || 0;
            revenueByDate[dateKey].tickets += b.seats.length;
        });
        res.status(200).json(Object.values(revenueByDate));
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy doanh thu", error: error.message });
    }
};
exports.getDashboardRevenue = getDashboardRevenue;
const getDashboardRevenueByMovie = async (_req, res) => {
    try {
        const bookings = await bookingModel_1.default.find({
            $or: [{ status: "paid" }, { paymentStatus: "completed" }],
        })
            .populate({ path: "showtime", select: "movieId", populate: { path: "movieId", select: "title" } })
            .populate({ path: "showtimeId", select: "movieId", populate: { path: "movieId", select: "title" } });
        const revenueByMovie = {};
        bookings.forEach((b) => {
            const movieTitle = b.showtime?.movieId?.title || b.showtimeId?.movieId?.title || "Unknown";
            if (!revenueByMovie[movieTitle])
                revenueByMovie[movieTitle] = { title: movieTitle, revenue: 0, tickets: 0 };
            revenueByMovie[movieTitle].revenue += b.totalPrice || b.totalAmount || 0;
            revenueByMovie[movieTitle].tickets += b.seats.length;
        });
        res.status(200).json(Object.values(revenueByMovie).sort((a, b) => b.revenue - a.revenue));
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy doanh thu theo phim", error: error.message });
    }
};
exports.getDashboardRevenueByMovie = getDashboardRevenueByMovie;
const getDashboardTopMovies = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const bookings = await bookingModel_1.default.find({
            $or: [{ status: "paid" }, { paymentStatus: "completed" }],
        })
            .populate({ path: "showtime", select: "movieId", populate: { path: "movieId", select: "title poster_url" } })
            .populate({ path: "showtimeId", select: "movieId", populate: { path: "movieId", select: "title poster_url" } });
        const movieStats = {};
        bookings.forEach((b) => {
            const movie = b.showtime?.movieId || b.showtimeId?.movieId;
            if (!movie)
                return;
            const id = movie._id.toString();
            if (!movieStats[id])
                movieStats[id] = { _id: id, title: movie.title, poster_url: movie.poster_url, revenue: 0, tickets: 0 };
            movieStats[id].revenue += b.totalPrice || b.totalAmount || 0;
            movieStats[id].tickets += b.seats.length;
        });
        res.status(200).json(Object.values(movieStats).sort((a, b) => b.revenue - a.revenue).slice(0, limit));
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi lấy top phim", error: error.message });
    }
};
exports.getDashboardTopMovies = getDashboardTopMovies;
//# sourceMappingURL=adminController.js.map