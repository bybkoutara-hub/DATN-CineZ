import mongoose, { Document, Schema } from "mongoose";

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  roomName: string;      // Ví dụ: Phòng 01, Phòng IMAX
  startTime: Date;       // Thời gian bắt đầu chiếu
  price: number;         // Giá vé cơ bản
  availableSeats: string[]; // Danh sách ghế trống (Ví dụ: ["A1", "A2", "B1"...])
}

const ShowtimeSchema: Schema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShowtime>("Showtime", ShowtimeSchema);