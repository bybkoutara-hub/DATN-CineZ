import { Request, Response } from "express";
import AdminShowtime from "../../models/admin/adminShowtimeModel";
import AdminBooking from "../../models/admin/adminBookingModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie_id, roomName, date } = req.query;
    const filter: any = {};
    if (movie_id) filter.movieId = movie_id;
    if (roomName) filter.roomName = roomName;
    if (date) {
      filter.date = date;
    }
    const showtimes = await AdminShowtime.find(filter)
      .populate("movieId", "title poster duration")
      .populate("roomId", "name type")
      .sort({ date: 1, startTime: 1 });
    res.status(200).json(showtimes);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách suất chiếu", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const showtime = await AdminShowtime.findById(req.params.id)
      .populate("movieId", "title poster duration genres")
      .populate("roomId", "name type");
    if (!showtime) {
      res.status(404).json({ message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json(showtime);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết suất chiếu", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newShowtime = new AdminShowtime(req.body);
    const saved = await newShowtime.save();
    res.status(201).json({ message: "Tạo suất chiếu thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Không thể tạo suất chiếu", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AdminShowtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json({ message: "Cập nhật suất chiếu thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật suất chiếu", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AdminShowtime.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json({ message: "Đã xóa suất chiếu thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa suất chiếu", error: error.message });
  }
};

export const getBookedSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await AdminBooking.find({
      showtime_id: req.params.id,
      paymentStatus: "completed",
    });
    const bookedSeats: string[] = [];
    bookings.forEach((b) => bookedSeats.push(...b.seats));
    res.status(200).json({ success: true, bookedSeats });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy trạng thái ghế", error: error.message });
  }
};
