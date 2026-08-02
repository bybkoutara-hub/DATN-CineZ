import mongoose, { Document, Schema } from "mongoose";

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  roomName: string;
  startTime: Date;
  price: number;
  availableSeats: string[];
  layout?: any;
  status: "active" | "cancelled";
}

const ShowtimeSchema: Schema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", default: null },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: [String], required: true },
    layout: { type: Schema.Types.Mixed, default: null },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<IShowtime>("Showtime", ShowtimeSchema);
