import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "admin" | "staff" | "customer";
  loyaltyPoints: number;
  username: string;
  fullName: string;
  active: boolean;
  isCommentBlocked: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "staff", "customer"], default: "user" },
    loyaltyPoints: { type: Number, default: 0 },
    username: { type: String, default: null },
    fullName: { type: String, default: "" },
    active: { type: Boolean, default: true },
    isCommentBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
