import mongoose, { Document, Schema } from "mongoose";

export interface ISeat extends Document {
  room: mongoose.Types.ObjectId;
  row: string;
  number: number;
  label: string;
  type: "standard" | "vip" | "couple" | "disabled";
  status: "available" | "maintenance" | "broken";
  price: number;
}

const SeatSchema: Schema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["standard", "vip", "couple", "disabled"], default: "standard" },
    status: { type: String, enum: ["available", "maintenance", "broken"], default: "available" },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SeatSchema.index({ room: 1, label: 1 }, { unique: true });

export default mongoose.model<ISeat>("Seat", SeatSchema);
