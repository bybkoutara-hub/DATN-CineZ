import mongoose, { Document, Schema } from "mongoose";

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  roomName: string;
  startTime: Date;
  price: number;
  availableSeats: string[];
  status: "active" | "cancelled";
}

const ShowtimeSchema: Schema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: [String], required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<IShowtime>("Showtime", ShowtimeSchema);
