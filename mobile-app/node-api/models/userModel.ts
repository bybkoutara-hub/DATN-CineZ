import mongoose from "mongoose";

// 1. Định nghĩa cấu trúc dữ liệu của Người dùng (User Schema)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên người dùng"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true, // Không cho phép trùng lặp email trong hệ thống
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải chứa ít nhất 6 ký tự"],
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Phân quyền: người dùng hoặc quản trị viên
      default: "user",
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt trong MongoDB
  }
);

// 2. Tạo và Xuất model User (Sử dụng cú pháp Named Export để fix lỗi ở authController)
export const User = (mongoose.models.User || mongoose.model("User", userSchema)) as mongoose.Model<any>;