import mongoose, { Document, Schema } from "mongoose";

export interface IAdminMovie extends Document {
  title: string;
  originalTitle: string;
  poster: string;
  description: string;
  genres: string[];
  director: string;
  duration: number;
  releaseDate: string;
  rated: string;
  status: "showing" | "coming" | "ended";
  rating: number;
}

const AdminMovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    originalTitle: { type: String, default: "" },
    poster: { type: String, default: "" },
    description: { type: String, default: "" },
    genres: { type: [String], default: [] },
    director: { type: String, default: "" },
    duration: { type: Number, required: true },
    releaseDate: { type: String, default: "" },
    rated: { type: String, default: "P" },
    status: { type: String, enum: ["showing", "coming", "ended"], default: "showing" },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "movies" }
);

export default mongoose.model<IAdminMovie>("AdminMovie", AdminMovieSchema);
