import mongoose, { Document, Schema } from "mongoose";

export interface IAdminShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  movieTitle: string;
  roomId: mongoose.Types.ObjectId;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  status: "active" | "cancelled";
}

const AdminShowtimeSchema: Schema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "AdminMovie", required: true },
    movieTitle: { type: String, default: "" },
    roomId: { type: Schema.Types.ObjectId, ref: "AdminRoom", required: true },
    roomName: { type: String, required: true },
    date: { type: String, default: "" },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    basePrice: { type: Number, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true, collection: "showtimes" }
);

export default mongoose.model<IAdminShowtime>("AdminShowtime", AdminShowtimeSchema);
