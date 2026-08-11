import mongoose, { Document, Schema } from "mongoose";

export interface ICombo extends Document {
  name: string;
  price: number;
  image: string;
  description: string;
  status: "active" | "inactive";
}

const ComboSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<ICombo>("Combo", ComboSchema);
