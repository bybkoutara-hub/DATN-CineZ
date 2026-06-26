import mongoose, { Document, Schema } from "mongoose";

export interface ISlider extends Document {
  title: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}

const SliderSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlider>("Slider", SliderSchema);
