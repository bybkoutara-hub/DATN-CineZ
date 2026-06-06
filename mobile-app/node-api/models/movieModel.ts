import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  poster_url: string;
  duration: number;
  genres: string[];
  rating: number;
  total_reviews: string;
  release_date: string;
  status: "now_playing" | "coming_soon";
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    poster_url: { type: String, required: true },
    duration: { type: Number, required: true },
    genres: { type: [String], required: true },
    rating: { type: Number, default: 0 },
    total_reviews: { type: String, default: "0" },
    release_date: { type: String, required: true },
    status: { type: String, enum: ["now_playing", "coming_soon"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>("Movie", MovieSchema);