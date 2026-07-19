import { Request, Response } from "express";
import Review from "../models/reviewModel";
import Movie from "../models/movieModel";

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, page = "1", limit = "10" } = req.query;
    const filter = movieId ? { movie: String(movieId) } : {};
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter).populate("user", "name").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
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
    const review = await Review.create({ movie, user: req.user?.id, rating, comment });

    const stats = await Review.aggregate([
      { $match: { movie: review.movie } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(review.movie, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        total_reviews: stats[0].count,
      });
    } else {
      await Movie.findByIdAndUpdate(review.movie, { rating: review.rating, total_reviews: 1 });
    }

    const populated = await Review.findById(review._id).populate("user", "name");
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
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    const stats = await Review.aggregate([
      { $match: { movie: review.movie } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(review.movie, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        total_reviews: stats[0].count,
      });
    }

    const populated = await Review.findById(review._id).populate("user", "name");
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

    const stats = await Review.aggregate([
      { $match: { movie: movieId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(movieId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        total_reviews: stats[0].count,
      });
    } else {
      await Movie.findByIdAndUpdate(movieId, { rating: 0, total_reviews: 0 });
    }

    res.status(200).json({ success: true, message: "Xóa đánh giá thành công" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
