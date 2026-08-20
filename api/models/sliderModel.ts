import mongoose, { Document, Schema } from "mongoose";

export interface ISlider extends Document {
  title: string;
  imageUrl: string;        // ảnh banner (Cloudinary)
  linkUrl: string;         // liên kết khi bấm vào banner
  description: string;
  order: number;           // thứ tự hiển thị
  status: "active" | "inactive";
}

const SliderSchema: Schema = new Schema(
  {
    title: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<ISlider>("Slider", SliderSchema);