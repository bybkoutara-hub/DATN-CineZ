import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  name: string;
  totalSeats: number;
}

const RoomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    totalSeats: { type: Number, default: 120 },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>("Room", RoomSchema);
