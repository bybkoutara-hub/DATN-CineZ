import mongoose, { Document, Schema } from "mongoose";

export interface IAdminCombo extends Document {
  name: string;
  image: string;
  description: string;
  items: string;
  price: number;
  status: "active" | "inactive";
}

const AdminComboSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    items: { type: String, default: "" },
    price: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true, collection: "combos" }
);

export default mongoose.model<IAdminCombo>("AdminCombo", AdminComboSchema);
