import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "admin" | "staff";
  loyaltyPoints: number;
  username: string;
  fullName: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    loyaltyPoints: { type: Number, default: 0 },
    username: { type: String, default: null },
    fullName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
