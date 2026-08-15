import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Nội dung bình luận không được để trống"],
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema)) as mongoose.Model<any>;
