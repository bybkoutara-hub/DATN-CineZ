import mongoose, { Document, Schema } from "mongoose";

// Cụm rạp (CGV Vincom, CGV Aeon,...). Quan hệ phòng chiếu nằm ở Room.cinema (1-N)
export interface ICinema extends Document {
  name: string;
  address: string;
  city: string; // Hà Nội, TP.HCM, Đà Nẵng...
  image: string;
}

const CinemaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

CinemaSchema.index({ city: 1 });

export default mongoose.model<ICinema>("Cinema", CinemaSchema);