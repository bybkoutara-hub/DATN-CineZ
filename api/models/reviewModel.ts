import mongoose, { Document, Schema } from "mongoose";

// Đánh giá / nhận xét phim
export interface IReview extends Document {
  movie: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number; // 1 - 5 sao
  comment: string;
}

const ReviewSchema: Schema = new Schema(
  {
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", ReviewSchema);
