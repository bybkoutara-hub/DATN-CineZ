import express from "express";
import { addReview, deleteReview, getReviews, updateReview } from "../controllers/reviewController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
