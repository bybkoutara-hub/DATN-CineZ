// mobile-app/node-api/middlewares/authMiddleware.ts
import { type NextFunction, type Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "MBOOKING_SUPER_SECRET_KEY_2026";

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Không có quyền truy cập, token bị thiếu!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Gán dữ liệu user giải mã vào request để controller sử dụng
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};