import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import AdminUser from "../../models/admin/adminUserModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, active } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === "true";
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    const staff = await AdminUser.find({ ...filter, role: { $in: ["staff", "admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhân viên", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await AdminUser.findById(req.params.id).select("-password");
    if (!staff) {
      res.status(404).json({ message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết nhân viên", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }
    const existing = await AdminUser.findOne({ username });
    if (existing) {
      res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newStaff = new AdminUser({
      username,
      password: hashed,
      fullName,
      email,
      phone,
      role: role || "staff",
      active: true,
    });
    const saved = await newStaff.save();
    res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công!",
      data: {
        _id: saved._id,
        username: saved.username,
        fullName: saved.fullName,
        email: saved.email,
        phone: saved.phone,
        role: saved.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo nhân viên", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, role, active } = req.body;
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;
    const updated = await AdminUser.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json({ message: "Cập nhật nhân viên thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật nhân viên", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AdminUser.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy nhân viên" });
      return;
    }
    res.status(200).json({ message: "Xóa nhân viên thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa nhân viên", error: error.message });
  }
};
