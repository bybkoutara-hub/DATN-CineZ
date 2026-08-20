import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, name, email, password, phone } = req.body;
    const displayName = fullName || name || "";
    if (!displayName || !email || !password) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Họ tên, Email và Password" });
      return;
    }
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: displayName,
      email,
      password: hashed,
      phone: phone || "",
      role: "customer",
    });
    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      token,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
      return;
    }
    if (user.role !== "admin" && user.role !== "staff") {
      res.status(403).json({ success: false, message: "Bạn không có quyền truy cập cổng Admin!" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
      return;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      success: true,
      message: "Đăng nhập Web Admin thành công!",
      data: { user: { username: user.username, fullName: user.fullName, email: user.email, role: user.role }, token }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống đăng nhập", error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const userId = req.user?.id;
    const user = userId ? await User.findById(userId) : await User.findOne({ username });
    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
      return;
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
      return;
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu", error: error.message });
  }
};