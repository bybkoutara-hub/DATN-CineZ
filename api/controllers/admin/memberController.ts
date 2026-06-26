import { Request, Response } from "express";
import AdminUser from "../../models/admin/adminUserModel";
import AdminBooking from "../../models/admin/adminBookingModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    const filter: any = { role: "customer" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== undefined) filter.active = status === "active";
    const users = await AdminUser.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách thành viên", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await AdminUser.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy thành viên" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết thành viên", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, active } = req.body;
    const updated = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { fullName, email, phone, active },
      { new: true }
    ).select("-password");
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy thành viên" });
      return;
    }
    res.status(200).json({ message: "Cập nhật thành viên thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật thành viên", error: error.message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await AdminBooking.find({ user_id: req.params.id })
      .populate({
        path: "showtime_id",
        populate: { path: "movieId", select: "title poster" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy lịch sử đặt vé", error: error.message });
  }
};
