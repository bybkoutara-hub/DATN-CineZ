import bcrypt from "bcryptjs";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "MBOOKING_SUPER_SECRET_KEY_2026";

/**
 * @desc    Đăng ký tài khoản mới
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Kiểm tra các trường bắt buộc
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Name, Email và Password" });
      return;
    }

    // 2. Kiểm tra Email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "Email này đã được đăng ký sử dụng" });
      return;
    }

    // 3. Mã hóa mật khẩu (Bcrypt) trước khi lưu vào DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo User mới trong Database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "user" // Mặc định là khách hàng mua vé
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký", error: error.message });
  }
};

/**
 * @desc    Đăng nhập ứng dụng & Trả về Token JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Email và Mật khẩu" });
      return;
    }

    // 2. Tìm User theo email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác" });
      return;
    }

    // 3. Kiểm tra đối khớp mật khẩu mã hóa
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác" });
      return;
    }

    // 4. Khởi tạo Token JWT (Hết hạn sau 30 ngày cho Mobile đỡ bắt đăng nhập lại liên tục)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token, // Mobile App sẽ lưu token này vào AsyncStorage hoặc SecureStore
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng nhập", error: error.message });
  }
};

/**
 * @desc    Lấy thông tin Profile cá nhân dựa vào Token JWT gửi kèm ở Header
 * @route   GET /api/auth/profile
 * @access  Private (Cần đi qua Middleware Verify Token)
 */
export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    // req.user sẽ được truyền xuống từ Middleware kiểm tra JWT
    const user = await User.findById(req.user.id).select("-password"); // Loại bỏ mật khẩu vì lý do bảo mật

    if (!user) {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy thông tin cá nhân", error: error.message });
  }
};