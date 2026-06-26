import mongoose, { Document, Schema } from "mongoose";

// Giao dịch thanh toán (Momo, ZaloPay, VNPay, thẻ ATM, tiền mặt...)
export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  amount: number;
  method: "momo" | "zalopay" | "vnpay" | "credit_card" | "cash";
  status: "pending" | "success" | "failed";
  transactionId: string;
}

const PaymentSchema: Schema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["momo", "zalopay", "vnpay", "credit_card", "cash"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
