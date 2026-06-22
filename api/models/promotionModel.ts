import mongoose, { Document, Schema } from "mongoose";

// Mã khuyến mãi / voucher
export interface IPromotion extends Document {
  code: string; // Mã voucher (VD: CGV50K)
  description: string;
  discountType: "percent" | "amount"; // Giảm % hay giảm số tiền
  discountValue: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const PromotionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["percent", "amount"], default: "amount" },
    discountValue: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
