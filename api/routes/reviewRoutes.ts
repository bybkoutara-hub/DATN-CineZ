import express from "express";
import { addReview, getReviews } from "../controllers/reviewController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, addReview);

export default router;
