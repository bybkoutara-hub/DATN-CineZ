import mongoose from "mongoose";

// 1. Định nghĩa cấu trúc Schema Đặt Vé (Booking Schema)
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Liên kết tới model User để lấy thông tin khách hàng
      required: [true, "Đơn đặt vé phải thuộc về một người dùng"],
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime", // Liên kết tới model Showtime để lấy phim, rạp, giờ chiếu
      required: [true, "Đơn đặt vé phải thuộc về một suất chiếu cụ thể"],
    },
    seats: {
      type: [String], // Mảng danh sách các ghế được chọn (Ví dụ: ["A1", "A2"])
      required: [true, "Vui lòng cung cấp danh sách ghế ngồi đã chọn"],
    },
    combos: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ], // Mảng lưu thông tin bắp nước đi kèm lúc đặt vé (nếu có)
    totalPrice: {
      type: Number,
      required: [true, "Vui lòng cung cấp tổng số tiền thanh toán"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"], // Các trạng thái: Đang xử lý, Thành công, Đã hủy
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Tiền mặt tại rạp",
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt (Thời gian đặt vé)
  }
);

// 2. Tạo và Xuất model Booking (Được ép kiểu để an toàn 100% với TypeScript)
export const Booking = (mongoose.models.Booking || mongoose.model("Booking", bookingSchema)) as mongoose.Model<any>;

export default Booking;