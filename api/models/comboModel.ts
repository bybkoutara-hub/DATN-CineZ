import mongoose, { Document, Schema } from "mongoose";

// Bắp nước / Combo (CGV F&B)
export interface ICombo extends Document {
  name: string; // VD: Combo Caramel, Combo Couple
  price: number;
  image: string;
  items: string[]; // ["Bắp ngọt L", "2 Coca L", ...]
}

const ComboSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    items: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICombo>("Combo", ComboSchema);
