import { Request, Response } from "express";
import Review from "../models/reviewModel";

// Đánh giá của 1 phim ?movieId=
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.query;
    const filter = movieId ? { movie: String(movieId) } : {};
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
    const review = await Review.create({ movie, user: req.user?.id, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
