import mongoose, { Document, Schema } from "mongoose";

export interface IInvoice extends Document {
  booking: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  method: "momo" | "zalopay" | "vnpay" | "credit_card" | "cash";
  status: "pending" | "paid" | "failed" | "cancelled";
  transactionId: string;
  issuedAt: Date;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `INV-${dateStr}-${rand}`;
}

const InvoiceSchema: Schema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    invoiceNumber: { type: String, unique: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["momo", "zalopay", "vnpay", "credit_card", "cash"], default: "cash" },
    status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "paid" },
    transactionId: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InvoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    this.invoiceNumber = generateInvoiceNumber();
  }
});

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
