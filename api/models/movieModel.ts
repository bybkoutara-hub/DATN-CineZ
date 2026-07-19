import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  poster_url: string;
  duration: number;
  genres: string[];
  rating: number;
  total_reviews: number;
  release_date: Date;
  status: "now_playing" | "coming_soon";
  description: string;
  director: string;
  cast: string[];
  storyline: string;
  language: string;
  rated: "P" | "C13" | "C16" | "C18";
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    poster_url: { type: String, required: true },
    duration: { type: Number, required: true },
    genres: { type: [String], required: true },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 },
    release_date: { type: Date, required: true },
    status: { type: String, enum: ["now_playing", "coming_soon"], required: true },
    description: { type: String, default: "" },
    director: { type: String, default: "" },
    cast: { type: [String], default: [] },
    storyline: { type: String, default: "" },
    language: { type: String, default: "" },
    rated: { type: String, enum: ["P", "C13", "C16", "C18"], default: "P" },
  },
  { timestamps: true }
);

export default mongoose.model<IMovie>("Movie", MovieSchema);
