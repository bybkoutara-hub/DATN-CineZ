import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  movieId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "hidden" | "banned";
}

const commentSchema = new Schema<IComment>(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ["pending", "approved", "hidden", "banned"], default: "approved" },
  },
  { timestamps: true }
);

// Bỏ kiểm tra cache, ép TypeScript nhận chuẩn Model Mongoose
const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;