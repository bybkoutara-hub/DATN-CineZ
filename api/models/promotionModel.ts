import mongoose, { Document, Schema } from "mongoose";

export interface IPromotion extends Document {
  code: string;
  title: string;
  description: string;
  discountType: "percent" | "amount";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  expiryDate: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["percent", "amount"], default: "percent" },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    expiryDate: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
