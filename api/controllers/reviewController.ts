import { Request, Response } from "express";
import Review from "../models/reviewModel";
import { containsBadWords } from "../utils/badWords";

// Đánh giá của 1 phim ?movieId=
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.query;
    const filter: Record<string, any> = { status: "approved" };
    if (movieId) filter.movie = String(movieId);
    const reviews = await Review.find(filter).populate("user", "name").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo đánh giá (cần đăng nhập)
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie, rating, comment } = req.body;
    const hasBadWords = containsBadWords(comment || "");
    const status = hasBadWords ? "pending" : "approved";
    const review = await Review.create({ movie, user: req.user?.id, rating, comment, status });
    const message = hasBadWords
      ? "Bình luận của bạn chứa nội dung không phù hợp và đang chờ kiểm duyệt."
      : "Đã gửi bình luận thành công!";
    res.status(201).json({ success: true, message, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
