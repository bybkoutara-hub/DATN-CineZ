"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware bảo vệ route: yêu cầu header Authorization: Bearer <token>
const protect = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }
    try {
        const token = header.split(" ")[1] ?? "";
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "dev-secret");
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Token không hợp lệ" });
    }
};
exports.protect = protect;
// Middleware phân quyền theo role (dùng sau protect)
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map