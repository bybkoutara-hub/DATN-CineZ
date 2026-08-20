import mongoose, { Document, Schema } from "mongoose";

export interface IComboItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;                  // FK -> User
  showtime: mongoose.Types.ObjectId;              // FK -> Showtime
  seats: string[];                                // ["A1","A2"]
  combos: IComboItem[];                           // snapshot combo bắp nước khi đặt
  totalPrice: number;                             // tổng tiền cuối cùng (đã trừ giảm giá)
  status: "pending" | "paid" | "cancelled" | "completed" | "refunded";
  paymentStatus: "pending" | "completed" | "cancelled";
  paymentMethod: string;                          // "vnpay" | "cash" | "hold"
  promoCode: string;
  discount: number;
  appliedPromotion?: mongoose.Types.ObjectId;     // FK -> Promotion
  holdExpiresAt?: Date;                           // thời hạn giữ ghế (15 phút)
  refundNote: string;                             // ghi chú hoàn tiền (khi webhook trễ)
  qrCode: string;                                 // mã QR vé (base64 PNG)
  // Hóa đơn được nhúng trực tiếp vào booking (1:1)
  invoiceNumber: string;                          // mã hóa đơn INV-YYYYMMDD-XXXX
  invoiceStatus: "pending" | "paid" | "failed" | "cancelled";
  transactionId: string;                          // mã giao dịch thanh toán
  issuedAt: Date;                                 // thời điểm xuất hóa đơn
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `INV-${dateStr}-${rand}`;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    showtime: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
    seats: { type: [String], default: [] },
    combos: { type: [{ _id: false, name: String, quantity: Number, price: Number }], default: [] },
    totalPrice: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "paid", "cancelled", "completed", "refunded"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    paymentMethod: { type: String, default: "" },
    promoCode: { type: String, default: "" },
    discount: { type: Number, default: 0 },
    appliedPromotion: { type: Schema.Types.ObjectId, ref: "Promotion", default: null },
    holdExpiresAt: { type: Date, default: null },
    refundNote: { type: String, default: "" },
    qrCode: { type: String, default: "" },
    invoiceNumber: { type: String, default: "" },
    invoiceStatus: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },
    transactionId: { type: String, default: "" },
    issuedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Truy vấn nhanh: lịch sử vé của user; kiểm tra ghế đã đặt theo suất
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ showtime: 1, status: 1 });
BookingSchema.index({ invoiceStatus: 1, issuedAt: -1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);