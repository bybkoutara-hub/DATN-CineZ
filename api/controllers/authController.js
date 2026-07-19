"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.adminLogin = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Name, Email và Password" });
            return;
        }
        const exists = await userModel_1.default.findOne({ email });
        if (exists) {
            res.status(400).json({ success: false, message: "Email đã tồn tại" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await userModel_1.default.create({ name, email, password: hashed, phone: phone || "", role: "user" });
        res.status(201).json({ success: true, message: "Đăng ký tài khoản thành công!", data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
            return;
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ success: false, message: "Sai mật khẩu" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            success: true,
            token,
            data: { id: user._id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await userModel_1.default.findById(req.user?.id).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userModel_1.default.findOne({ username });
        if (!user) {
            res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
            return;
        }
        if (user.role !== "admin" && user.role !== "staff") {
            res.status(403).json({ success: false, message: "Bạn không có quyền truy cập cổng Admin!" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            success: true,
            message: "Đăng nhập Web Admin thành công!",
            data: { user: { username: user.username, fullName: user.fullName, name: user.name, email: user.email, role: user.role }, token }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống đăng nhập", error: error.message });
    }
};
exports.adminLogin = adminLogin;
const changePassword = async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;
        const userId = req.user?.id;
        const user = userId ? await userModel_1.default.findById(userId) : await userModel_1.default.findOne({ username });
        if (!user) {
            res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
            return;
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi đổi mật khẩu", error: error.message });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map