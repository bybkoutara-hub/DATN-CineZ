const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Web-API: Connected to MongoDB successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));

// ============================================================
// ALL SCHEMAS & MODELS
// ============================================================

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ["admin", "customer", "staff"], default: "customer" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
const User = mongoose.model('User', userSchema);

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' }
}, { timestamps: true });
const Genre = mongoose.model('Genre', genreSchema);

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

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["2D", "3D", "IMAX", "4DX", "VIP"], default: "2D" },
  rows_count: { type: Number, default: 8 },
  seats_per_row: { type: Number, default: 15 },
  totalSeats: { type: Number, default: 120 },
  status: { type: String, enum: ["active", "maintenance"], default: "active" },
  description: { type: String, default: '' }
}, { timestamps: true });
const Room = mongoose.model('Room', roomSchema);

const showtimeSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomName: { type: String, required: true },
  startTime: { type: Date, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["active", "cancelled"], default: "active" }
}, { timestamps: true });
const Showtime = mongoose.model('Showtime', showtimeSchema);

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  items: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });
const Combo = mongoose.model('Combo', comboSchema);

const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ["percent", "amount"], default: "percent" },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });
const Promotion = mongoose.model('Promotion', promotionSchema);

const sliderSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
const Slider = mongoose.model('Slider', sliderSchema);

const seatSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["standard", "vip", "couple", "disabled"], default: "standard" },
  status: { type: String, enum: ["available", "maintenance", "broken"], default: "available" },
  price: { type: Number, default: 0 }
}, { timestamps: true });
seatSchema.index({ room: 1, label: 1 }, { unique: true });
const Seat = mongoose.model('Seat', seatSchema);

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: { type: [String], required: true },
  combo: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' },
  comboQuantity: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "completed" }
}, { timestamps: true });
const Booking = mongoose.model('Booking', bookingSchema);

const invoiceSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  invoiceNumber: { type: String, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["momo", "zalopay", "vnpay", "credit_card", "cash"], default: "cash" },
  status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "paid" },
  transactionId: { type: String, default: '' },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

function generateInvoiceNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `INV-${dateStr}-${rand}`;
}

invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = generateInvoiceNumber();
  }
  next();
});
const Invoice = mongoose.model('Invoice', invoiceSchema);

// ============================================================
// AUTH ENDPOINTS
// ============================================================

app.post('/api/admin/auth/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ success: false, message: "Tên tài khoản đã tồn tại!" });

    const newUser = new User({ username, password, fullName, email, phone, role: role || "customer" });
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
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập Admin!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token: "admin-token-" + user._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống đăng nhập", error: error.message });
  }
});

app.get('/api/admin/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('admin-token-')) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
    }
    const userId = token.replace('admin-token-', '');
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy thông tin", error: error.message });
  }
});

app.put('/api/admin/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('admin-token-')) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
    }
    const userId = token.replace('admin-token-', '');
    const { fullName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phone },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    res.status(200).json({ success: true, message: "Cập nhật thông tin thành công!", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
});

app.put('/api/admin/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('admin-token-')) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
    }
    const userId = token.replace('admin-token-', '');
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu", error: error.message });
  }
});

// ============================================================
// GENRE ENDPOINTS
// ============================================================

app.get('/api/admin/genres', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách thể loại", error });
  }
});

app.get('/api/admin/genres/:id', async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ message: "Không tìm thấy thể loại" });
    res.status(200).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết thể loại", error });
  }
});

app.post('/api/admin/genres', async (req, res) => {
  try {
    const newGenre = new Genre(req.body);
    const saved = await newGenre.save();
    res.status(201).json({ message: "Thêm thể loại thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo thể loại", error });
  }
});

app.put('/api/admin/genres/:id', async (req, res) => {
  try {
    const updated = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy thể loại" });
    res.status(200).json({ message: "Cập nhật thể loại thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thể loại", error });
  }
});

app.delete('/api/admin/genres/:id', async (req, res) => {
  try {
    const deleted = await Genre.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy thể loại" });
    res.status(200).json({ message: "Xóa thể loại thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa thể loại", error });
  }
});

// ============================================================
// MOVIE ENDPOINTS
// ============================================================

app.get('/api/admin/movies', async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách phim", error });
  }
});

app.get('/api/admin/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết phim", error });
  }
});

app.post('/api/admin/movies', async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const saved = await newMovie.save();
    res.status(201).json({ message: "Đã thêm phim mới vào hệ thống!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Không thể thêm phim mới", error });
  }
});

app.put('/api/admin/movies/:id', async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.status(200).json({ message: "Cập nhật thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật phim", error });
  }
});

app.delete('/api/admin/movies/:id', async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy phim" });
    res.status(200).json({ message: "Đã xóa phim thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa phim", error });
  }
});

// ============================================================
// ROOM ENDPOINTS
// ============================================================

app.get('/api/admin/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách phòng", error });
  }
});

app.get('/api/admin/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết phòng", error });
  }
});

app.post('/api/admin/rooms', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.rows_count && data.seats_per_row && !data.totalSeats) {
      data.totalSeats = data.rows_count * data.seats_per_row;
    }
    const newRoom = new Room(data);
    const saved = await newRoom.save();
    res.status(201).json({ message: "Thêm phòng thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo phòng", error });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.status(200).json({ message: "Cập nhật phòng thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật phòng", error });
  }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy phòng" });
    await Seat.deleteMany({ room: req.params.id });
    res.status(200).json({ message: "Xóa phòng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa phòng", error });
  }
});

// ============================================================
// SHOWTIME ENDPOINTS
// ============================================================

app.get('/api/admin/showtimes', async (req, res) => {
  try {
    const { movie_id, roomName, date } = req.query;
    let filter = {};
    if (movie_id) filter.movie_id = movie_id;
    if (roomName) filter.roomName = roomName;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }
    const showtimes = await Showtime.find(filter)
      .populate('movie_id', 'title poster_url duration')
      .sort({ startTime: 1 });
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách suất chiếu", error });
  }
});

app.get('/api/admin/showtimes/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie_id', 'title poster_url duration genres');
    if (!showtime) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    res.status(200).json(showtime);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết suất chiếu", error });
  }
});

app.post('/api/admin/showtimes', async (req, res) => {
  try {
    const newShowtime = new Showtime(req.body);
    const saved = await newShowtime.save();
    res.status(201).json({ message: "Tạo suất chiếu thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Không thể tạo suất chiếu", error });
  }
});

app.put('/api/admin/showtimes/:id', async (req, res) => {
  try {
    const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    res.status(200).json({ message: "Cập nhật suất chiếu thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật suất chiếu", error });
  }
});

app.delete('/api/admin/showtimes/:id', async (req, res) => {
  try {
    const deleted = await Showtime.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    res.status(200).json({ message: "Đã xóa suất chiếu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa suất chiếu", error });
  }
});

app.get('/api/admin/showtimes/:id/booked-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({ showtime_id: req.params.id, paymentStatus: "completed" });
    let bookedSeats = [];
    bookings.forEach(b => { bookedSeats = bookedSeats.concat(b.seats); });
    res.status(200).json({ success: true, bookedSeats });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy trạng thái ghế", error });
  }
});

// ============================================================
// COMBO ENDPOINTS
// ============================================================

app.get('/api/admin/combos', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const combos = await Combo.find(filter).sort({ price: 1 });
    res.status(200).json(combos);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách combo", error });
  }
});

app.get('/api/admin/combos/:id', async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) return res.status(404).json({ message: "Không tìm thấy combo" });
    res.status(200).json(combo);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết combo", error });
  }
});

app.post('/api/admin/combos', async (req, res) => {
  try {
    const newCombo = new Combo(req.body);
    const saved = await newCombo.save();
    res.status(201).json({ message: "Thêm combo thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo combo", error });
  }
});

app.put('/api/admin/combos/:id', async (req, res) => {
  try {
    const updated = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy combo" });
    res.status(200).json({ message: "Cập nhật combo thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật combo", error });
  }
});

app.delete('/api/admin/combos/:id', async (req, res) => {
  try {
    const deleted = await Combo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy combo" });
    res.status(200).json({ message: "Đã xóa combo" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa combo", error });
  }
});

// ============================================================
// MEMBER ENDPOINTS
// ============================================================

app.get('/api/admin/members', async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = { role: "customer" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) filter.active = status === 'active';
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách thành viên", error });
  }
});

app.get('/api/admin/members/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Không tìm thấy thành viên" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết thành viên", error });
  }
});

app.put('/api/admin/members/:id', async (req, res) => {
  try {
    const { fullName, email, phone, active } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, active },
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: "Không tìm thấy thành viên" });
    res.status(200).json({ message: "Cập nhật thành viên thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thành viên", error });
  }
});

app.get('/api/admin/members/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.id })
      .populate({ path: 'showtime_id', populate: { path: 'movie_id', select: 'title poster_url' } })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch sử đặt vé", error });
  }
});

// ============================================================
// DASHBOARD ENDPOINTS
// ============================================================

app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "completed" });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalMembers = await User.countDocuments({ role: "customer" });
    const totalMovies = await Movie.countDocuments();
    const totalShowtimes = await Showtime.countDocuments({ status: "active" });
    const totalBookings = await Booking.countDocuments();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayBookings = await Booking.find({
      paymentStatus: "completed",
      createdAt: { $gte: todayStart }
    });
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const todayTickets = todayBookings.reduce((sum, b) => sum + b.seats.length, 0);

    res.status(200).json({
      totalRevenue,
      totalTickets,
      totalMembers,
      totalMovies,
      totalShowtimes,
      totalBookings,
      todayRevenue,
      todayTickets
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tính toán thống kê", error: error.message });
  }
});

app.get('/api/admin/dashboard/revenue', async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = { paymentStatus: "completed" };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter).sort({ createdAt: 1 });

    const revenueByDate = {};
    bookings.forEach(b => {
      const dateKey = b.createdAt.toISOString().slice(0, 10);
      if (!revenueByDate[dateKey]) revenueByDate[dateKey] = { date: dateKey, revenue: 0, tickets: 0 };
      revenueByDate[dateKey].revenue += b.totalAmount;
      revenueByDate[dateKey].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(revenueByDate));
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy doanh thu", error: error.message });
  }
});

app.get('/api/admin/dashboard/revenue-by-movie', async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "completed" })
      .populate({ path: 'showtime_id', select: 'movie_id', populate: { path: 'movie_id', select: 'title' } });

    const revenueByMovie = {};
    bookings.forEach(b => {
      const movieTitle = b.showtime_id?.movie_id?.title || 'Unknown';
      if (!revenueByMovie[movieTitle]) revenueByMovie[movieTitle] = { title: movieTitle, revenue: 0, tickets: 0 };
      revenueByMovie[movieTitle].revenue += b.totalAmount;
      revenueByMovie[movieTitle].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(revenueByMovie).sort((a, b) => b.revenue - a.revenue));
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy doanh thu theo phim", error: error.message });
  }
});

app.get('/api/admin/dashboard/top-movies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const bookings = await Booking.find({ paymentStatus: "completed" })
      .populate({ path: 'showtime_id', select: 'movie_id', populate: { path: 'movie_id', select: 'title poster_url' } });

    const movieStats = {};
    bookings.forEach(b => {
      const movie = b.showtime_id?.movie_id;
      if (!movie) return;
      const id = movie._id.toString();
      if (!movieStats[id]) movieStats[id] = { _id: id, title: movie.title, poster_url: movie.poster_url, revenue: 0, tickets: 0 };
      movieStats[id].revenue += b.totalAmount;
      movieStats[id].tickets += b.seats.length;
    });

    res.status(200).json(Object.values(movieStats).sort((a, b) => b.revenue - a.revenue).slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy top phim", error: error.message });
  }
});

// ============================================================
// PROMOTION ENDPOINTS
// ============================================================

app.get('/api/admin/promotions', async (req, res) => {
  try {
    const { active, search } = req.query;
    let filter = {};
    if (active !== undefined) filter.active = active === 'true';
    if (search) filter.code = { $regex: search, $options: 'i' };
    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi", error });
  }
});

app.get('/api/admin/promotions/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết khuyến mãi", error });
  }
});

app.post('/api/admin/promotions', async (req, res) => {
  try {
    const newPromotion = new Promotion(req.body);
    const saved = await newPromotion.save();
    res.status(201).json({ message: "Thêm khuyến mãi thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo khuyến mãi", error });
  }
});

app.put('/api/admin/promotions/:id', async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    res.status(200).json({ message: "Cập nhật khuyến mãi thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật khuyến mãi", error });
  }
});

app.delete('/api/admin/promotions/:id', async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    res.status(200).json({ message: "Xóa khuyến mãi thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa khuyến mãi", error });
  }
});

app.post('/api/admin/promotions/validate', async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const promotion = await Promotion.findOne({ code: code.toUpperCase(), active: true });
    if (!promotion) {
      return res.status(404).json({ success: false, message: "Mã khuyến mãi không hợp lệ!" });
    }
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết hạn!" });
    }
    if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng!" });
    }
    if (orderValue && orderValue < promotion.minOrderValue) {
      return res.status(400).json({ success: false, message: `Giá trị đơn hàng tối thiểu là ${promotion.minOrderValue.toLocaleString()}đ!` });
    }

    let discount = 0;
    if (promotion.discountType === "percent") {
      discount = Math.round(orderValue * promotion.discountValue / 100);
      if (promotion.maxDiscount > 0 && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount;
      }
    } else {
      discount = promotion.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discount,
        description: promotion.description
      },
      message: "Áp dụng mã khuyến mãi thành công!"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi kiểm tra khuyến mãi", error: error.message });
  }
});

// ============================================================
// STAFF ENDPOINTS
// ============================================================

app.get('/api/admin/staff', async (req, res) => {
  try {
    const { search, role, active } = req.query;
    let filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    const staff = await User.find({ ...filter, role: { $in: ['staff', 'admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhân viên", error });
  }
});

app.get('/api/admin/staff/:id', async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    if (!staff) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết nhân viên", error });
  }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });

    const newStaff = new User({
      username,
      password,
      fullName,
      email,
      phone,
      role: role || 'staff',
      active: true
    });
    const saved = await newStaff.save();
    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công!",
      data: { _id: saved._id, username: saved.username, fullName: saved.fullName, email: saved.email, phone: saved.phone, role: saved.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo nhân viên", error: error.message });
  }
});

app.put('/api/admin/staff/:id', async (req, res) => {
  try {
    const { fullName, email, phone, role, active } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.status(200).json({ message: "Cập nhật nhân viên thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật nhân viên", error });
  }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.status(200).json({ message: "Xóa nhân viên thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa nhân viên", error });
  }
});

// ============================================================
// SLIDER ENDPOINTS
// ============================================================

app.get('/api/admin/sliders', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active !== undefined ? { active: active === 'true' } : {};
    const sliders = await Slider.find(filter).sort({ order: 1, createdAt: -1 });
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách slider", error });
  }
});

app.get('/api/admin/sliders/:id', async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ message: "Không tìm thấy slider" });
    res.status(200).json(slider);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết slider", error });
  }
});

app.post('/api/admin/sliders', async (req, res) => {
  try {
    const newSlider = new Slider(req.body);
    const saved = await newSlider.save();
    res.status(201).json({ message: "Thêm slider thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo slider", error });
  }
});

app.put('/api/admin/sliders/:id', async (req, res) => {
  try {
    const updated = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy slider" });
    res.status(200).json({ message: "Cập nhật slider thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật slider", error });
  }
});

app.delete('/api/admin/sliders/:id', async (req, res) => {
  try {
    const deleted = await Slider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy slider" });
    res.status(200).json({ message: "Xóa slider thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa slider", error });
  }
});

app.put('/api/admin/sliders/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }
    for (const item of items) {
      await Slider.findByIdAndUpdate(item._id, { order: item.order });
    }
    res.status(200).json({ message: "Sắp xếp slider thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi sắp xếp slider", error });
  }
});

// ============================================================
// SEAT ENDPOINTS
// ============================================================

app.get('/api/admin/seats', async (req, res) => {
  try {
    const { room: roomId, type, status } = req.query;
    let filter = {};
    if (roomId) filter.room = roomId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const seats = await Seat.find(filter).populate('room', 'name').sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách ghế", error });
  }
});

app.get('/api/admin/seats/room/:roomId', async (req, res) => {
  try {
    const seats = await Seat.find({ room: req.params.roomId }).sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy ghế theo phòng", error });
  }
});

app.post('/api/admin/seats/bulk', async (req, res) => {
  try {
    const { room: roomId, seats: seatsData } = req.body;
    if (!roomId || !Array.isArray(seatsData) || seatsData.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }
    await Seat.deleteMany({ room: roomId });

    const seatsToInsert = seatsData.map(s => ({
      room: roomId,
      row: s.row,
      number: s.number,
      label: s.label || `${s.row}${s.number}`,
      type: s.type || 'standard',
      status: s.status || 'available',
      price: s.price || 0
    }));
    const saved = await Seat.insertMany(seatsToInsert);
    res.status(201).json({ message: "Tạo ghế thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo ghế hàng loạt", error });
  }
});

app.put('/api/admin/seats/:id', async (req, res) => {
  try {
    const updated = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy ghế" });
    res.status(200).json({ message: "Cập nhật ghế thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật ghế", error });
  }
});

app.delete('/api/admin/seats/:id', async (req, res) => {
  try {
    const deleted = await Seat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy ghế" });
    res.status(200).json({ message: "Xóa ghế thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa ghế", error });
  }
});

// ============================================================
// BOOKING ENDPOINTS
// ============================================================

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const { paymentStatus, search, from, to } = req.query;
    let filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter)
      .populate('user_id', 'username fullName email phone')
      .populate({ path: 'showtime_id', populate: { path: 'movie_id', select: 'title poster_url duration' } })
      .populate('combo', 'name price')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đặt vé", error });
  }
});

app.get('/api/admin/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user_id', 'username fullName email phone')
      .populate({ path: 'showtime_id', populate: { path: 'movie_id', select: 'title poster_url duration genres' } })
      .populate('combo', 'name price items');
    if (!booking) return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đặt vé", error });
  }
});

app.put('/api/admin/bookings/:id', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    res.status(200).json({ message: "Cập nhật đặt vé thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật đặt vé", error });
  }
});

app.put('/api/admin/bookings/:id/cancel', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "cancelled" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Không tìm thấy đặt vé" });
    res.status(200).json({ message: "Hủy đặt vé thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hủy đặt vé", error });
  }
});

// ============================================================
// INVOICE ENDPOINTS
// ============================================================

app.get('/api/admin/invoices', async (req, res) => {
  try {
    const { status, method, from, to } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from);
      if (to) filter.issuedAt.$lte = new Date(to);
    }
    const invoices = await Invoice.find(filter)
      .populate({ path: 'booking', populate: [
        { path: 'user_id', select: 'username fullName' },
        { path: 'showtime_id', populate: { path: 'movie_id', select: 'title' } }
      ]})
      .sort({ issuedAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách hóa đơn", error });
  }
});

app.get('/api/admin/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({ path: 'booking', populate: [
        { path: 'user_id', select: 'username fullName email phone' },
        { path: 'showtime_id', populate: { path: 'movie_id', select: 'title poster_url duration genres' } },
        { path: 'combo', select: 'name price items' }
      ]});
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết hóa đơn", error });
  }
});

app.get('/api/admin/invoices/booking/:bookingId', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId })
      .populate({ path: 'booking', populate: [
        { path: 'user_id', select: 'username fullName email phone' },
        { path: 'showtime_id', populate: { path: 'movie_id', select: 'title poster_url duration' } }
      ]});
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn cho đặt vé này" });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy hóa đơn theo đặt vé", error });
  }
});

app.post('/api/admin/invoices', async (req, res) => {
  try {
    const { booking: bookingId, method, transactionId, status } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: "Thiếu thông tin đặt vé!" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Không tìm thấy đặt vé!" });

    const existing = await Invoice.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ message: "Hóa đơn cho đặt vé này đã tồn tại!" });

    const newInvoice = new Invoice({
      booking: bookingId,
      amount: booking.totalAmount,
      method: method || 'cash',
      status: status || 'paid',
      transactionId: transactionId || ''
    });
    const saved = await newInvoice.save();

    if (saved.status === 'paid') {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'completed' });
    }

    res.status(201).json({ message: "Tạo hóa đơn thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo hóa đơn", error });
  }
});

app.put('/api/admin/invoices/:id', async (req, res) => {
  try {
    const { status, method, transactionId } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (method) updateData.method = method;
    if (transactionId !== undefined) updateData.transactionId = transactionId;

    const updated = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json({ message: "Cập nhật hóa đơn thành công!", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật hóa đơn", error });
  }
});

// ============================================================
// MOBILE APP ENDPOINTS
// ============================================================

app.get('/api/mobile/movies', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const movies = await Movie.find(filter).sort({ release_date: -1 });
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy phim mobile", error: error.message });
  }
});

app.post('/api/mobile/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const saved = await newBooking.save();
    res.status(201).json({ success: true, message: "Đặt vé xem phim thành công!", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xử lý đặt vé", error: error.message });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`WEB-API RUNNING AT: http://localhost:${PORT}`);
  console.log(`Admin API: http://localhost:${PORT}/api/admin`);
});
