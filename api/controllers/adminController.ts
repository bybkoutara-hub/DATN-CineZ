import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Genre from "../models/genreModel";
import Movie from "../models/movieModel";
import Room from "../models/roomModel";
import Showtime from "../models/showtimeModel";
import Combo from "../models/comboModel";
import Promotion from "../models/promotionModel";
import Slider from "../models/sliderModel";
import Booking from "../models/bookingModel";
import User from "../models/userModel";

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Genre.find().sort({ name: 1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const createGenre = async (req: Request, res: Response): Promise<void> => {
  try { const g = new Genre(req.body); res.status(201).json(await g.save()); }
  catch (error: any) { res.status(500).json({ message: "Lỗi tạo thể loại", error }); }
};

export const updateGenre = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi sửa", error }); }
};

export const deleteGenre = async (req: Request, res: Response): Promise<void> => {
  try { await Genre.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa thể loại thành công!" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getAdminMovies = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Movie.find().sort({ createdAt: -1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi lấy danh sách phim", error }); }
};

export const getAdminMovieById = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Movie.findById(req.params.id)); }
  catch (error: any) { res.status(500).json({ message: "Lỗi lấy chi tiết phim", error }); }
};

export const createAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const m = new Movie(req.body);
    res.status(201).json({ message: "Đã thêm phim mới vào hệ thống!", data: await m.save() });
  } catch (error: any) { res.status(500).json({ message: "Không thể thêm phim mới", error }); }
};

export const updateAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: "Cập nhật thành công!", data: await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true }) });
  } catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const deleteAdminMovie = async (req: Request, res: Response): Promise<void> => {
  try { await Movie.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa phim thành công!" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Room.find().sort({ name: 1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi lấy danh sách phòng", error }); }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try { const r = new Room(req.body); res.status(201).json(await r.save()); }
  catch (error: any) { res.status(500).json({ message: "Lỗi tạo phòng", error }); }
};

export const getRoomSeats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = ["A", "B", "C", "D", "E"];
    const seatsList: { id: string; row: string; number: number; type: string }[] = [];
    rows.forEach(row => {
      for (let i = 1; i <= 6; i++) {
        seatsList.push({ id: `${row}${i}`, row, number: i, type: row === "E" ? "Vip" : "Standard" });
      }
    });
    res.status(200).json(seatsList);
  } catch { res.status(500).json({ message: "Lỗi lấy sơ đồ ghế" }); }
};

export const getAdminShowtimes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const showtimes = await Showtime.find().populate("movieId", "title poster_url duration").sort({ startTime: 1 });
    res.status(200).json(showtimes);
  } catch (error: any) { res.status(500).json({ message: "Lỗi khi lấy danh sách suất chiếu", error }); }
};

export const createAdminShowtime = async (req: Request, res: Response): Promise<void> => {
  try { const s = new Showtime(req.body); res.status(201).json(await s.save()); }
  catch (error: any) { res.status(500).json({ message: "Không thể tạo suất chiếu", error }); }
};

export const deleteAdminShowtime = async (req: Request, res: Response): Promise<void> => {
  try { await Showtime.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa suất chiếu thành công!" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getBookedSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ showtime: req.params.id, status: "paid" });
    const bookedSeats: string[] = [];
    bookings.forEach(b => { bookedSeats.push(...b.seats); });
    res.status(200).json({ success: true, bookedSeats });
  } catch (error: any) { res.status(500).json({ message: "Lỗi lấy trạng thái ghế", error }); }
};

export const getCombos = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Combo.find().sort({ price: 1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const createCombo = async (req: Request, res: Response): Promise<void> => {
  try { const c = new Combo(req.body); res.status(201).json(await c.save()); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const updateCombo = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const deleteCombo = async (req: Request, res: Response): Promise<void> => {
  try { await Combo.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa combo" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getPromotions = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Promotion.find().sort({ createdAt: -1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try { const p = new Promotion(req.body); res.status(201).json(await p.save()); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi cập nhật khuyến mãi" }); }
};

export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try { await Promotion.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Xóa thành công" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getMembers = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await User.find({ role: "user" }).sort({ createdAt: -1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const getStaffs = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await User.find({ role: "staff" }).sort({ createdAt: -1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const s = new User({ username, password: hashed, fullName, role: "staff" });
    res.status(201).json(await s.save());
  } catch (error: any) { res.status(500).json({ message: "Lỗi thêm nhân viên", error }); }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (error: any) { res.status(500).json({ message: "Lỗi cập nhật nhân viên", error }); }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try { await User.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Đã xóa nhân viên thành công!" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi xóa nhân viên", error }); }
};

export const getSliders = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Slider.find().sort({ createdAt: -1 })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const createSlider = async (req: Request, res: Response): Promise<void> => {
  try { const s = new Slider(req.body); res.status(201).json(await s.save()); }
  catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const updateSlider = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json(await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (error: any) { res.status(500).json({ message: "Lỗi" }); }
};

export const deleteSlider = async (req: Request, res: Response): Promise<void> => {
  try { await Slider.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Xóa banner thành công" }); }
  catch (error: any) { res.status(500).json({ message: "Lỗi" }); }
};

export const getAdminBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Booking.find()
      .populate("user", "name email fullName")
      .populate({ path: "showtime", populate: { path: "movieId", select: "title" } })
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error: any) { res.status(500).json({ message: "Lỗi", error }); }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    const newStatus = status || paymentStatus;
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
    res.status(200).json({ message: "Cập nhật trạng thái hóa đơn thành công!", data: updated });
  } catch (error: any) { res.status(500).json({ message: "Lỗi cập nhật trạng thái", error }); }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ status: "paid" });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalMembers = await User.countDocuments({ role: "user" });
    res.status(200).json({
      success: true,
      data: { totalRevenue, totalTickets, totalMembers }
    });
  } catch (error: any) { res.status(500).json({ success: false, message: "Lỗi tính toán thống kê", error: error.message }); }
};
