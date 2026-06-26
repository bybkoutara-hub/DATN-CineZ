import mongoose, { Document, Schema } from "mongoose";

export interface IAdminUser extends Document {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  active: boolean;
}

const AdminUserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
