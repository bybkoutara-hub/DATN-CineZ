import express from "express";
import { createMovieComment, getMovieComments } from "../controllers/commentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/movie/:movieId", getMovieComments);
router.post("/movie/:movieId", verifyToken, createMovieComment);

export default router;
