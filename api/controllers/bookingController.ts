import { Request, Response } from "express";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";
import Combo from "../models/comboModel";

// Tạo đơn đặt vé (chọn ghế + combo)
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { showtimeId, showtime: showtimeAlt, seats, combos, combo, totalPrice, paymentMethod } = req.body;
    const showtimeIdStr = showtimeId || showtimeAlt;
    if (!showtimeIdStr) {
      res.status(400).json({ success: false, message: "Thiếu thông tin suất chiếu" });
      return;
    }
    const st = await Showtime.findById(showtimeIdStr);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }

    // Calculate price
    const seatPrice = st.price * (seats?.length ?? 0);
    let comboId = combo;
    let comboPrice = 0;
    if (combos && Array.isArray(combos) && combos.length > 0) {
      comboPrice = combos.reduce((sum: number, c: any) => sum + (c.price || 0) * (c.quantity || 1), 0);
    } else if (combo) {
      const found = await Combo.findById(combo);
      if (found) comboPrice = found.price;
    }

    // Remove booked seats from showtime.availableSeats
    if (seats && Array.isArray(seats)) {
      st.availableSeats = st.availableSeats.filter((s: string) => !seats.includes(s));
      await st.save();
    }

    const booking = await Booking.create({
      user: req.user?.id,
      userId: req.user?.id,
      showtime: showtimeIdStr,
      showtimeId: showtimeIdStr,
      seats,
      combo: comboId,
      comboQuantity: combos?.length || 0,
      totalPrice: totalPrice || seatPrice + comboPrice,
      totalAmount: totalPrice || seatPrice + comboPrice,
      status: paymentMethod === "cash" ? "paid" : "pending",
      paymentStatus: paymentMethod === "cash" ? "completed" : "pending",
      paymentMethod: paymentMethod || "cash",
      combos: combos || [],
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lịch sử vé của người dùng đang đăng nhập
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?.id })
      .populate("showtime")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const fixPosterUrl = (url: string): string => {
  if (!url) return "";
  return url.replace("media.themoviedb.org", "image.tmdb.org");
};

// Lịch sử vé (mobile app gọi /my-history)
export const getMyBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const history = await Booking.find({ user: userId })
      .populate({
        path: "showtime",
        populate: { path: "movieId", select: "title poster_url duration" },
      })
      .sort({ createdAt: -1 });
    const data = history.map((b) => {
      const obj = b.toObject();
      const movie = obj.showtime?.movieId || obj.showtimeId?.movieId || {};
      if (movie.poster_url) {
        movie.poster_url = fixPosterUrl(movie.poster_url);
      }
      obj.moviePoster = movie.poster_url || "";
      return obj;
    });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
};

// Hủy đơn đang chờ thanh toán (pending) và hoàn ghế
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
      return;
    }
    if (String(booking.user) !== String(userId)) {
      res.status(403).json({ success: false, message: "Bạn không có quyền hủy đơn này." });
      return;
    }
    if (booking.status !== "pending") {
      res.status(400).json({ success: false, message: "Đơn này không ở trạng thái có thể hủy." });
      return;
    }
    // Hoàn ghế
    if (booking.seats && booking.seats.length > 0) {
      await Showtime.findByIdAndUpdate(booking.showtimeId, {
        $addToSet: { availableSeats: { $each: booking.seats } },
      });
    }
    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();
    res.status(200).json({ success: true, message: "Đã hủy đơn và hoàn ghế." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy đơn", error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id).populate("showtime").populate("combo");
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


