import { type Response } from "express";
import Comment from "../models/commentModel.js";
import Movie from "../models/movieModel.js";
import { User } from "../models/userModel.js";

export const getMovieComments = async (req: any, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;

    const comments = await Comment.find({ movieId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Không thể tải bình luận",
      error: error.message,
    });
  }
};

export const createMovieComment = async (req: any, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const userId = req.user?.id;
    const content = String(req.body?.content || "").trim();
    const rating = Number(req.body?.rating || 5);

    if (!userId) {
      res.status(401).json({ success: false, message: "Vui lòng đăng nhập để bình luận." });
      return;
    }

    if (!content) {
      res.status(400).json({ success: false, message: "Vui lòng nhập nội dung bình luận." });
      return;
    }

    if (content.length > 500) {
      res.status(400).json({ success: false, message: "Bình luận tối đa 500 ký tự." });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao." });
      return;
    }

    const [movie, user] = await Promise.all([
      Movie.findById(movieId),
      User.findById(userId),
    ]);

    if (!movie) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim." });
      return;
    }

    if (!user) {
      res.status(401).json({ success: false, message: "Tài khoản không tồn tại." });
      return;
    }

    const comment = await Comment.create({
      movieId,
      userId,
      content,
      rating,
    });

    const populated = await Comment.findById(comment._id).populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Đã thêm bình luận.",
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Không thể thêm bình luận",
      error: error.message,
    });
  }
};
