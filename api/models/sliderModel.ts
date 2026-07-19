import mongoose, { Document, Schema } from "mongoose";

export interface ISlider extends Document {
  title: string;
  imageUrl: string;
  image: string;
  linkUrl: string;
  link: string;
  description: string;
  order: number;
  active: boolean;
}

const SliderSchema: Schema = new Schema(
  {
    title: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    image: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    link: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlider>("Slider", SliderSchema);
