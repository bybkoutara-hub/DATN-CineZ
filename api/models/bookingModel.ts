import mongoose, { Document, Schema } from "mongoose";

// Vé / đơn đặt vé
export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  seats: string[]; // Ghế đã chọn: ["A1", "A2", "B5"]
  combo?: mongoose.Types.ObjectId; // Combo bắp nước (tuỳ chọn)
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  qrCode?: string; // Mã QR check-in tại rạp
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    showtime: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
    seats: { type: [String], default: [] },
    combo: { type: Schema.Types.ObjectId, ref: "Combo" },
    totalPrice: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
    qrCode: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
