// d:/DATN/mobile-app/node-api/models/comboModel.ts
import mongoose from "mongoose";

// 1. Định nghĩa cấu trúc dữ liệu Combo Bắp nước (Combo Schema)
const comboSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên combo bắp nước"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá tiền của combo"],
      min: [0, "Giá tiền không thể âm"],
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả chi tiết các món trong combo"],
      trim: true,
    },
    image_url: {
      type: String,
      default: "", // Đường dẫn ảnh bắp nước hiển thị lên giao diện (nếu có)
    },
    isAvailable: {
      type: Boolean,
      default: true, // Trạng thái combo còn hàng để bán hay không
    }
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  }
);

// 2. Tạo và Xuất model Combo (Được ép kiểu để an toàn 100% với TypeScript giống User và Booking)
export const Combo = (mongoose.models.Combo || mongoose.model("Combo", comboSchema)) as mongoose.Model<any>;

export default Combo;