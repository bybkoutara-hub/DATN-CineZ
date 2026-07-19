import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  name: string;
  type: "2D" | "3D" | "IMAX" | "4DX" | "VIP";
  rows_count: number;
  seats_per_row: number;
  totalSeats: number;
  status: "active" | "maintenance";
  description: string;
}

const RoomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["2D", "3D", "IMAX", "4DX", "VIP"], default: "2D" },
    rows_count: { type: Number, default: 8 },
    seats_per_row: { type: Number, default: 15 },
    totalSeats: { type: Number, default: 120 },
    status: { type: String, enum: ["active", "maintenance"], default: "active" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>("Room", RoomSchema);
