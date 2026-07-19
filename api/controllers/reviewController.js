"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.getReviews = void 0;
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
// Đánh giá của 1 phim ?movieId=
const getReviews = async (req, res) => {
    try {
        const { movieId } = req.query;
        const filter = movieId ? { movie: String(movieId) } : {};
        const reviews = await reviewModel_1.default.find(filter).populate("user", "name").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReviews = getReviews;
// Tạo đánh giá (cần đăng nhập)
const addReview = async (req, res) => {
    try {
        const { movie, rating, comment } = req.body;
        const review = await reviewModel_1.default.create({ movie, user: req.user?.id, rating, comment });
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addReview = addReview;
//# sourceMappingURL=reviewController.js.map