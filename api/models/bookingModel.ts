import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  seats: string[];
  combo?: mongoose.Types.ObjectId;
  comboQuantity: number;
  totalPrice: number;
  totalAmount: number;
  status: "pending" | "paid" | "cancelled" | "completed";
  paymentStatus: "pending" | "completed" | "cancelled";
  paymentMethod?: string;
  combos?: { name: string; quantity: number; price: number }[];
  qrCode?: string;
  userId?: mongoose.Types.ObjectId;
  showtimeId?: mongoose.Types.ObjectId;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    showtime: { type: Schema.Types.ObjectId, ref: "Showtime" },
    seats: { type: [String], default: [] },
    combo: { type: Schema.Types.ObjectId, ref: "Combo" },
    comboQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "cancelled", "completed"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    paymentMethod: { type: String, default: "" },
    combos: { type: [{ name: String, quantity: Number, price: Number }], default: [] },
    qrCode: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    showtimeId: { type: Schema.Types.ObjectId, ref: "Showtime" },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
