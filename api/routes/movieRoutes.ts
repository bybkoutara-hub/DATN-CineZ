// mobile-app/node-api/routes/movieRoutes.ts
import express from "express";
import {
    addMovie,
    addShowtime,
    getMovieDetailWithShowtimes,
    getMovies,
    getShowtimeDetail
} from "../controllers/movieController";

const router = express.Router();

// 1. Tuyến đường xử lý Phim (Các URL tĩnh đưa lên trước)
router.get("/", getMovies);                        // GET /api/movies (Danh sách phim)
router.post("/", addMovie);                        // POST /api/movies (Thêm phim mới)

// 2. Tuyến đường xử lý Suất chiếu (ĐƯA LÊN TRÊN ĐỂ TRÁNH BỊ ĐÈ ROUTE)
router.post("/showtimes", addShowtime);            // POST /api/movies/showtimes
router.get("/showtimes/:id", getShowtimeDetail);   // GET /api/movies/showtimes/:id

// 3. Tuyến đường chứa tham số biến động :id (LUÔN LUÔN XẾP CUỐI CÙNG)
router.get("/:id", getMovieDetailWithShowtimes);   // GET /api/movies/:id

export default router;