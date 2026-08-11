import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  original_title: string;
  poster_url: string;
  duration: number;          // phút
  genres: string[];          // thể loại (snapshot string — nguồn dữ liệu lọc/hiển thị)
  rating: number;            // 0-10 (tự động tính từ Review: avg * 2)
  total_reviews: number;
  release_date: Date;
  status: "now_playing" | "coming_soon";
  description: string;
  director: string;          // tên đạo diễn (denormalize — hiển thị nhanh)
  cast: string[];            // tên diễn viên (denormalize — hiển thị nhanh)
  storyline: string;
  language: string;
  country: string;
  trailer_url: string;
  formats: string[];         // ["2D","3D","IMAX"]
  rated: "P" | "C13" | "C16" | "C18";
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    original_title: { type: String, default: "" },
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
    country: { type: String, default: "" },
    trailer_url: { type: String, default: "" },
    formats: { type: [String], default: [] },
    rated: { type: String, enum: ["P", "C13", "C16", "C18"], default: "P" },
  },
  { timestamps: true }
);

// Lọc nhanh: trạng thái chiếu + ngày phát hành; tìm kiếm theo tên
MovieSchema.index({ status: 1, release_date: -1 });
MovieSchema.index({ title: 1 });

export default mongoose.model<IMovie>("Movie", MovieSchema);