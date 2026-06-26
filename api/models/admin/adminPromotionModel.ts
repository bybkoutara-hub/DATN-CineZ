import mongoose, { Document, Schema } from "mongoose";

export interface IAdminPromotion extends Document {
  code: string;
  name: string;
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
}

const AdminPromotionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["percent", "amount"], default: "percent" },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "promotions" }
);

export default mongoose.model<IAdminPromotion>("AdminPromotion", AdminPromotionSchema);
