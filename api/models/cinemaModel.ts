import mongoose, { Document, Schema } from "mongoose";

// Cụm rạp / rạp chiếu (CGV Vincom, CGV Aeon, ...)
export interface ICinema extends Document {
  name: string;
  address: string;
  city: string; // Hà Nội, TP.HCM, Đà Nẵng...
  rooms: string[]; // Danh sách phòng chiếu (P01, IMAX, 4DX, Starium...)
  image: string;
}

const CinemaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    rooms: { type: [String], default: [] },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ICinema>("Cinema", CinemaSchema);
