import express from "express";
import { addMovie, addShowtime, getMovieDetailWithShowtimes, getMovies, getShowtimeDetail } from "../controllers/movieController";

const router = express.Router();

router.get("/", getMovies);
router.post("/", addMovie);

// Thêm 2 dòng này bên dưới
router.get("/:id", getMovieDetailWithShowtimes); // GET /api/movies/:id (Lấy chi tiết phim & suất chiếu)
router.post("/showtimes", addShowtime);          // POST /api/movies/showtimes (Manager tạo suất chiếu)
router.get("/movies/showtimes/:id", getShowtimeDetail);

export default router;