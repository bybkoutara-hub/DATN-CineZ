import { Request, Response } from "express";
import AdminBooking from "../../models/admin/adminBookingModel";
import AdminShowtime from "../../models/admin/adminShowtimeModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, search, from, to } = req.query;
    const filter: any = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }
    const bookings = await AdminBooking.find(filter)
      .populate("user_id", "username fullName email phone")
      .populate({
        path: "showtime_id",
        populate: { path: "movieId", select: "title poster duration" },
      })
      .populate("combo", "name price")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách đặt vé", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await AdminBooking.findById(req.params.id)
      .populate("user_id", "username fullName email phone")
      .populate({
        path: "showtime_id",
        populate: { path: "movieId", select: "title poster duration genres" },
      })
      .populate("combo", "name price items");
    if (!booking) {
      res.status(404).json({ message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đặt vé", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus } = req.body;
    const updated = await AdminBooking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json({ message: "Cập nhật đặt vé thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật đặt vé", error: error.message });
  }
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AdminBooking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "cancelled" },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy đặt vé" });
      return;
    }
    res.status(200).json({ message: "Hủy đặt vé thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi hủy đặt vé", error: error.message });
  }
};
