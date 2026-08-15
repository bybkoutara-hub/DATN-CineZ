import mongoose, { Document, Schema } from "mongoose";

export interface ISlider extends Document {
  title: string;
  imageUrl: string;        // ảnh banner (Cloudinary)
  linkUrl: string;         // liên kết khi bấm vào banner
  description: string;
  order: number;           // thứ tự hiển thị
  active: boolean;
}

const SliderSchema: Schema = new Schema(
  {
    title: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlider>("Slider", SliderSchema);