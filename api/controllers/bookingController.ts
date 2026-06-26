import { Request, Response } from "express";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";

// Tạo đơn đặt vé (chọn ghế + combo)
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { showtimeId, seats, combos, totalPrice, paymentMethod } = req.body;
    const st = await Showtime.findById(showtimeId);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    // Kiểm tra ghế còn trống
    const invalidSeats = (seats || []).filter((s: string) => !st.availableSeats.includes(s));
    if (invalidSeats.length > 0) {
      res.status(400).json({ success: false, message: `Ghế ${invalidSeats.join(", ")} đã có người đặt` });
      return;
    }
    // Xoá ghế đã chọn khỏi availableSeats
    st.availableSeats = st.availableSeats.filter((s: string) => !(seats || []).includes(s));
    await st.save();

    const booking = await Booking.create({
      user: req.user?.id,
      showtime: showtimeId,
      seats: seats || [],
      combos: combos || [],
      totalPrice: totalPrice || 0,
      paymentMethod: paymentMethod || "cash",
      status: paymentMethod === "vnpay" ? "pending" : "paid",
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
      .populate({ path: "showtime", populate: { path: "movieId", select: "title poster_url duration genres" } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    if (booking.status !== "pending") {
      res.status(400).json({ success: false, message: "Chỉ có thể hủy đơn vé đang chờ thanh toán" });
      return;
    }
    // Hoàn ghế
    const st = await Showtime.findById(booking.showtime);
    if (st) {
      const restored = (booking.seats || []).filter((s: string) => !st.availableSeats.includes(s));
      st.availableSeats.push(...restored);
      await st.save();
    }
    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ success: true, message: "Hủy đơn vé thành công!", data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
