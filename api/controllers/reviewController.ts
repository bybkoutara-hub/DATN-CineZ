import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/reviewModel";
import Movie from "../models/movieModel";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";

const INVALID_RATING_MESSAGE = "Đánh giá phải là số nguyên từ 1 đến 5 sao";

const isValidRating = (rating: any): rating is number => {
  const r = Number(rating);
  return Number.isInteger(r) && r >= 1 && r <= 5;
};

const updateMovieStats = async (movieId: mongoose.Types.ObjectId): Promise<void> => {
  const stats = await Review.aggregate([
    { $match: { movie: movieId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      rating: Math.round(stats[0].avgRating * 2 * 10) / 10,
      total_reviews: stats[0].count,
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, { rating: 0, total_reviews: 0 });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, page = "1", limit = "10" } = req.query;
    const filter = movieId ? { movie: String(movieId) } : {};
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter).populate("user", "fullName").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie, rating, comment } = req.body;

    if (!mongoose.isValidObjectId(movie)) {
      res.status(400).json({ success: false, message: "ID phim không hợp lệ" });
      return;
    }
    const movieDoc = await Movie.findById(movie);
    if (!movieDoc) {
      res.status(404).json({ success: false, message: "Không tìm thấy phim" });
      return;
    }
    if (!isValidRating(rating)) {
      res.status(400).json({ success: false, message: INVALID_RATING_MESSAGE });
      return;
    }

    const bookings = await Booking.find({
      user: req.user?.id,
      status: { $in: ["paid", "completed"] },
      paymentStatus: "completed",
    }).select("showtime");
    const showtimeIds = Array.from(
      new Set(bookings.map(b => b.showtime).filter(Boolean).map(id => String(id)))
    );
    const hasTicket = showtimeIds.length > 0
      ? await Showtime.exists({ _id: { $in: showtimeIds }, movie: String(movie) })
      : false;
    if (!hasTicket) {
      res.status(403).json({ success: false, message: "Bạn chỉ có thể đánh giá phim đã đặt vé xem" });
      return;
    }

    // Cho phép bình luận nhiều lần: luôn tạo review mới (không cập nhật review cũ)
    const review = await Review.create({
      movie,
      user: req.user?.id,
      rating: Number(rating),
      comment: typeof comment === "string" ? comment.trim() : "",
    });

    await updateMovieStats(review.movie);

    const populated = await Review.findById(review._id).populate("user", "fullName");
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
      return;
    }
    if (review.user.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: "Bạn không có quyền sửa đánh giá này" });
      return;
    }
    if (rating !== undefined && !isValidRating(rating)) {
      res.status(400).json({ success: false, message: INVALID_RATING_MESSAGE });
      return;
    }
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = typeof comment === "string" ? comment.trim() : "";
    await review.save();

    await updateMovieStats(review.movie);

    const populated = await Review.findById(review._id).populate("user", "fullName");
    res.status(200).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
      return;
    }
    if (review.user.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: "Bạn không có quyền xóa đánh giá này" });
      return;
    }
    const movieId = review.movie;
    await Review.findByIdAndDelete(req.params.id);

    await updateMovieStats(movieId);

    res.status(200).json({ success: true, message: "Xóa đánh giá thành công" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
