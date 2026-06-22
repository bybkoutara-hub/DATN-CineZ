import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  role: string;
}

// Mở rộng Request để lưu user sau khi verify JWT
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

// Middleware bảo vệ route: yêu cầu header Authorization: Bearer <token>
export const protect = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  }
  try {
    const token = header.split(" ")[1] ?? "";
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

// Middleware phân quyền theo role (dùng sau protect)
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }
    next();
  };
};
