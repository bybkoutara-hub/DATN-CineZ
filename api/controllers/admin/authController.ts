import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminUser from "../../models/admin/adminUserModel";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({ username });
    if (!user) {
      res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
      return;
    }
    if (user.role !== "admin" && user.role !== "staff") {
      res.status(403).json({ success: false, message: "Bạn không có quyền truy cập Admin!" });
      return;
    }
    if (!user.active) {
      res.status(403).json({ success: false, message: "Tài khoản đã bị vô hiệu hóa!" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
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
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống đăng nhập", error: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
      return;
    }
    const userExists = await AdminUser.findOne({ username });
    if (userExists) {
      res.status(400).json({ success: false, message: "Tên tài khoản đã tồn tại!" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = new AdminUser({ username, password: hashed, fullName, email, phone, role: role || "customer" });
    await newUser.save();
    res.status(201).json({ success: true, message: "Tạo tài khoản thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký", error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { id: string };
    const user = await AdminUser.findById(decoded.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy thông tin", error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { id: string };
    const { fullName, email, phone } = req.body;
    const user = await AdminUser.findByIdAndUpdate(
      decoded.id,
      { fullName, email, phone },
      { new: true }
    ).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      return;
    }
    res.status(200).json({ success: true, message: "Cập nhật thông tin thành công!", data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật", error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { id: string };
    const { oldPassword, newPassword } = req.body;
    const user = await AdminUser.findById(decoded.id);
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
      return;
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu", error: error.message });
  }
};
