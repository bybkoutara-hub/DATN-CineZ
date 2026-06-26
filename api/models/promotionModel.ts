import mongoose, { Document, Schema } from "mongoose";

// Mã khuyến mãi / voucher
export interface IPromotion extends Document {
  code: string;
  title: string;
  description: string;
  discountValue: number;
  expiryDate: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    discountValue: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
