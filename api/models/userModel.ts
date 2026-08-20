import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "admin" | "staff";
  status: "active" | "inactive";
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String },                        // tài khoản đăng nhập (admin/staff) — khách hàng đăng ký bằng email
    fullName: { type: String, default: "" },         // tên hiển thị
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },      // luôn bcrypt hash
    phone: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin", "staff"], default: "customer" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true } // tự động createdAt, updatedAt
);

// username chỉ bắt buộc với admin/staff → index sparse để vẫn cho phép khách không có username
UserSchema.index({ username: 1 }, { unique: true, sparse: true });

export default mongoose.model<IUser>("User", UserSchema);