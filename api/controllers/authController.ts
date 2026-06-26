import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

// Đăng ký tài khoản (tự động đăng nhập luôn, trả token)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name || email.split("@")[0], email, password: hashed, phone: phone || "" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" },
    );
    res.status(201).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, loyaltyPoints: user.loyaltyPoints },
      message: "Đăng ký thành công!",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập -> trả JWT
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ success: false, message: "Sai mật khẩu" });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints } },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lọc hồ sơ người dùng đang đăng nhập (cần middleware protect)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật hồ sơ (name, phone)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: { name, phone } },
      { new: true, runValidators: true },
    ).select("-password");
    if (!updated) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    res.status(200).json({ success: true, data: updated, message: "Cập nhật thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đổi mật khẩu
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng" });
      return;
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
