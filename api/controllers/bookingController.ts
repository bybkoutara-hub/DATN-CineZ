import { Request, Response } from "express";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";

// Tạo đơn đặt vé (chọn ghế + combo)
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { showtime, seats, combo } = req.body;
    // TODO: kiểm tra ghế còn trống trong showtime.availableSeats
    const st = await Showtime.findById(showtime);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    const seatPrice = st.price * (seats?.length ?? 0);
    const comboPrice = 0; // TODO: tra giá combo từ Combo model
    const booking = await Booking.create({
      user: req.user?.id,
      showtime,
      seats,
      combo,
      totalPrice: seatPrice + comboPrice,
      status: "pending",
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
