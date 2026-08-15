import mongoose, { Document, Schema } from "mongoose";

export interface IPromotion extends Document {
  code: string;            // VD "CINEZ20" (luôn in hoa)
  title: string;
  description: string;
  discountType: "percent" | "amount";
  discountValue: number;   // VD 20 (20%) hoặc số tiền
  minOrderValue: number;   // đơn tối thiểu để áp dụng
  maxDiscount: number;     // trần giảm tối đa (0 = không trần)
  usageLimit: number;      // số lượt dùng tối đa (0 = vô hạn)
  usedCount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
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
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Lọc nhanh mã còn hiệu lực theo thời gian
PromotionSchema.index({ code: 1, active: 1 });
PromotionSchema.index({ endDate: 1 });

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);