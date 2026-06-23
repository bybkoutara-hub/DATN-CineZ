import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

// Đăng ký tài khoản
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone });
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
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
