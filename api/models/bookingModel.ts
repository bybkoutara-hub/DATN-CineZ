import mongoose, { Document, Schema } from "mongoose";

// Combo item trong đơn đặt vé
export interface IComboItem {
  name: string;
  quantity: number;
  price: number;
}

// Vé / đơn đặt vé
export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  seats: string[]; // Ghế đã chọn: ["A1", "A2", "B5"]
  combo?: mongoose.Types.ObjectId; // Combo bắp nước (tuỳ chọn)
  combos?: IComboItem[]; // Mảng combo từ frontend
  totalPrice: number;
  paymentMethod: "vnpay" | "cash";
  status: "pending" | "paid" | "cancelled";
  qrCode?: string; // Mã QR check-in tại rạp
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    showtime: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
    seats: { type: [String], default: [] },
    combo: { type: Schema.Types.ObjectId, ref: "Combo" },
    combos: { type: [{ name: String, quantity: Number, price: Number }], default: [] },
    totalPrice: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["vnpay", "cash"], default: "cash" },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
    qrCode: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
