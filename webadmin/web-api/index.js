const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001; 

// 1. Middlewares chống lỗi chặn dữ liệu (CORS) giữa Web, Mobile và Backend
app.use(cors());
app.use(express.json());

// 2. Kết nối tới Database chung của đồ án (mbooking)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
mongoose.connect(MONGO_URI)
  .then(() => console.log("👉 Web-API: Kết nối MongoDB thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));


// ============================================================
// 3. ĐỊNH NGHĨA TOÀN BỘ CẤU TRÚC DỮ LIỆU ĐỒ ÁN (SCHEMAS & MODELS)
// ============================================================

// --- Bảng Người dùng, Admin & Nhân viên (User Schema) ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
const User = mongoose.model('User', userSchema);

// --- Bảng Thể loại phim (Genre Schema) ---
const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' }
}, { timestamps: true });
const Genre = mongoose.model('Genre', genreSchema);

// --- Bảng Phim (Movie Schema) ---
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster_url: { type: String, required: true },
  duration: { type: Number, required: true }, 
  genres: { type: [String], required: true }, 
  status: { type: String, enum: ["now_playing", "coming_soon"], required: true },
  release_date: { type: Date, required: true },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  description: { type: String, default: "" }
}, { timestamps: true });
const Movie = mongoose.model('Movie', movieSchema);

// --- Bảng Phòng chiếu (Room Schema) ---
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  totalSeats: { type: Number, default: 120 }
}, { timestamps: true });
const Room = mongoose.model('Room', roomSchema);

// --- Bảng Suất chiếu (Showtime Schema) ---
const showtimeSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomName: { type: String, required: true }, 
  startTime: { type: Date, required: true },  
  price: { type: Number, required: true }      
}, { timestamps: true });
const Showtime = mongoose.model('Showtime', showtimeSchema);

// --- Bảng Combo bắp nước (Combo Schema) ---
const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  items: { type: String, required: true }, 
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });
const Combo = mongoose.model('Combo', comboSchema);

// --- Bảng Đặt vé & Hóa đơn (Booking Schema) ---
const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: { type: [String], required: true }, 
  totalAmount: { type: Number, required: true }, 
  paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "completed" }
}, { timestamps: true });
const Booking = mongoose.model('Booking', bookingSchema);

// --- Bảng Mã khuyến mãi (Promotion Schema) ---
const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  discountValue: { type: Number, required: true },
  description: { type: String, default: "" },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });
const Promotion = mongoose.model('Promotion', promotionSchema);

// --- Bảng Banner quảng cáo trang chủ (Slider Schema) ---
const sliderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });
const Slider = mongoose.model('Slider', sliderSchema);


// ============================================================
// 4. HỆ THỐNG XỬ LÝ API (ENDPOINTS) CHO CẢ WEB & MOBILE
// ============================================================

// --- 4.1 API HỆ THỐNG XÁC THỰC (AUTH) ---
app.post('/api/admin/auth/register', async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ success: false, message: "Tên tài khoản này đã tồn tại!" });

    const newUser = new User({ username, password, fullName, role: role || "customer" });
    await newUser.save();
    res.status(201).json({ success: true, message: "Tạo tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký", error: error.message });
  }
});

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
    if (user.role !== 'admin' && user.role !== 'staff') return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập cổng Admin!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });

    res.status(200).json({ 
      success: true, 
      message: "Đăng nhập Web Admin thành công!", 
      data: { 
        user: { username: user.username, fullName: user.fullName, role: user.role }, 
        token: "admin-token-" + user._id 
      } 
    });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi hệ thống đăng nhập", error: error.message }); }
});

app.put('/api/admin/auth/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });

    user.password = newPassword; 
    await user.save();
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu", error }); }
});


// --- 4.2 API THỂ LOẠI PHIM (GENRES) ---
app.get('/api/admin/genres', async (req, res) => {
  try { res.status(200).json(await Genre.find().sort({ name: 1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.post('/api/admin/genres', async (req, res) => {
  try { const newGenre = new Genre(req.body); res.status(201).json(await newGenre.save()); } catch (error) { res.status(500).json({ message: "Lỗi tạo thể loại", error }); }
});
app.put('/api/admin/genres/:id', async (req, res) => {
  try { res.status(200).json(await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).json({ message: "Lỗi sửa", error }); }
});
app.delete('/api/admin/genres/:id', async (req, res) => {
  try { await Genre.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa thể loại thành công!" }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});


// --- 4.3 API QUẢN LÝ PHIM (MOVIES) ---
app.get('/api/admin/movies', async (req, res) => {
  try { res.status(200).json(await Movie.find().sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: "Lỗi lấy danh sách phim", error }); }
});
app.get('/api/admin/movies/:id', async (req, res) => {
  try { res.status(200).json(await Movie.findById(req.params.id)); } catch (error) { res.status(500).json({ message: "Lỗi lấy chi tiết phim", error }); }
});
app.post('/api/admin/movies', async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    res.status(201).json({ message: "Đã thêm phim mới vào hệ thống!", data: await newMovie.save() });
  } catch (error) { res.status(500).json({ message: "Không thể thêm phim mới", error }); }
});
app.put('/api/admin/movies/:id', async (req, res) => {
  try { res.status(200).json({ message: "Cập nhật thành công!", data: await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }) }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.delete('/api/admin/movies/:id', async (req, res) => {
  try { await Movie.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa phim thành công!" }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});


// --- 4.4 API PHÒNG CHIẾU & SƠ ĐỒ GHẾ (ROOMS & SEATS) ---
app.get('/api/admin/rooms', async (req, res) => {
  try { res.status(200).json(await Room.find().sort({ name: 1 })); } catch (error) { res.status(500).json({ message: "Lỗi lấy danh sách phòng", error }); }
});
app.post('/api/admin/rooms', async (req, res) => {
  try { const newRoom = new Room(req.body); res.status(201).json(await newRoom.save()); } catch (error) { res.status(500).json({ message: "Lỗi tạo phòng", error }); }
});
app.get('/api/admin/rooms/:id/seats', async (req, res) => {
  try {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsList = [];
    rows.forEach(row => {
      for (let i = 1; i <= 6; i++) {
        seatsList.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          type: row === 'E' ? 'Vip' : 'Standard'
        });
      }
    });
    res.status(200).json(seatsList);
  } catch (error) { res.status(500).json({ message: "Lỗi lấy sơ đồ ghế" }); }
});


// --- 4.5 API SUẤT CHIẾU & GHẾ NGỒI ĐÃ ĐẶT (SHOWTIMES & BOOKED SEATS) ---
app.get('/api/admin/showtimes', async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate('movie_id', 'title poster_url duration').sort({ startTime: 1 });
    res.status(200).json(showtimes);
  } catch (error) { res.status(500).json({ message: "Lỗi khi lấy danh sách suất chiếu", error }); }
});
app.post('/api/admin/showtimes', async (req, res) => {
  try { const newShowtime = new Showtime(req.body); res.status(201).json(await newShowtime.save()); } catch (error) { res.status(500).json({ message: "Không thể tạo suất chiếu", error }); }
});
app.delete('/api/admin/showtimes/:id', async (req, res) => {
  try { await Showtime.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa suất chiếu thành công!" }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.get('/api/admin/showtimes/:id/booked-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({ showtime_id: req.params.id, paymentStatus: "completed" });
    let bookedSeats = [];
    bookings.forEach(b => { bookedSeats = bookedSeats.concat(b.seats); });
    res.status(200).json({ success: true, bookedSeats }); 
  } catch (error) { res.status(500).json({ message: "Lỗi lấy trạng thái ghế", error }); }
});


// --- 4.6 API QUẢN LÝ COMBO BẮP NƯỚC ---
app.get('/api/admin/combos', async (req, res) => {
  try { res.status(200).json(await Combo.find().sort({ price: 1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.post('/api/admin/combos', async (req, res) => {
  try { const newCombo = new Combo(req.body); res.status(201).json(await newCombo.save()); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.put('/api/admin/combos/:id', async (req, res) => {
  try { res.status(200).json(await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.delete('/api/admin/combos/:id', async (req, res) => {
  try { await Combo.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa combo" }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});


// --- 4.7 API MÃ KHUYẾN MÃI (PROMOTIONS) ---
app.get('/api/admin/promotions', async (req, res) => {
  try { res.status(200).json(await Promotion.find().sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.post('/api/admin/promotions', async (req, res) => {
  try { const newPromo = new Promotion(req.body); res.status(201).json(await newPromo.save()); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.put('/api/admin/promotions/:id', async (req, res) => {
  try { res.status(200).json(await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).json({ message: "Lỗi cập nhật khuyến mãi" }); }
});
app.delete('/api/admin/promotions/:id', async (req, res) => {
  try { await Promotion.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Xóa thành công" }); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});


// --- 4.8 API QUẢN LÝ THÀNH VIÊN (MEMBERS) & NHÂN VIÊN (STAFF) ---
app.get('/api/admin/members', async (req, res) => {
  try { res.status(200).json(await User.find({ role: "customer" }).sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.get('/api/admin/staffs', async (req, res) => {
  try { res.status(200).json(await User.find({ role: "staff" }).sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.post('/api/admin/staffs', async (req, res) => {
  try {
    const { username, password, fullName } = req.body;
    const newStaff = new User({ username, password, fullName, role: "staff" });
    res.status(201).json(await newStaff.save());
  } catch (error) { res.status(500).json({ message: "Lỗi thêm nhân viên", error }); }
});
app.put('/api/admin/staffs/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const updatedStaff = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedStaff);
  } catch (error) { res.status(500).json({ message: "Lỗi cập nhật nhân viên", error }); }
});
app.delete('/api/admin/staffs/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa nhân viên thành công!" });
  } catch (error) { res.status(500).json({ message: "Lỗi xóa nhân viên", error }); }
});


// --- 4.9 API QUẢN LÝ SLIDER/BANNER (SLIDERS) ---
app.get('/api/admin/sliders', async (req, res) => {
  try { res.status(200).json(await Slider.find().sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.post('/api/admin/sliders', async (req, res) => {
  try { const newSlider = new Slider(req.body); res.status(201).json(await newSlider.save()); } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.put('/api/admin/sliders/:id', async (req, res) => {
  try { res.status(200).json(await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});
app.delete('/api/admin/sliders/:id', async (req, res) => {
  try { await Slider.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Xóa banner thành công" }); } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});


// --- 4.10 API QUẢN LÝ ĐẶT VÉ & HÓA ĐƠN (BOOKINGS/INVOICES) ---
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const data = await Booking.find()
      .populate('user_id', 'fullName username')
      .populate({ path: 'showtime_id', populate: { path: 'movie_id', select: 'title' } })
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) { res.status(500).json({ message: "Lỗi", error }); }
});
app.put('/api/admin/bookings/:id/status', async (req, res) => {
  try {
    const { paymentStatus } = req.body; 
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    res.status(200).json({ message: "Cập nhật trạng thái hóa đơn thành công!", data: updatedBooking });
  } catch (error) { res.status(500).json({ message: "Lỗi cập nhật trạng thái", error }); }
});


// --- 4.11 API THỐNG KÊ DASHBOARD ---
app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "completed" });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalMembers = await User.countDocuments({ role: "customer" });

    res.status(200).json({
      success: true,
      data: { totalRevenue, totalTickets, totalMembers }
    });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi tính toán thống kê", error: error.message }); }
});


// --- 4.12 API PHỤC VỤ LUỒNG ĐẶT VÉ TRÊN MOBILE APP ---
app.get('/api/mobile/movies', async (req, res) => {
  try {
    const { status } = req.query; 
    const filter = status ? { status } : {};
    const movies = await Movie.find(filter).sort({ release_date: -1 });
    res.status(200).json({ success: true, data: movies });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi lấy phim mobile", error: error.message }); }
});

app.post('/api/mobile/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const saved = await newBooking.save();
    res.status(201).json({ success: true, message: "Đặt vé xem phim thành công!", data: saved });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi xử lý đặt vé", error: error.message }); }
});


// ==========================================
// 5. KHỞI CHẠY SERVER BACKEND
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 WEB-API HOÀN CHỈNH 100% ĐANG CHẠY TẠI CỔNG: http://localhost:${PORT}`);
});