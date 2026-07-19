"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// mobile-app/node-api/routes/movieRoutes.ts
const express_1 = __importDefault(require("express"));
const movieController_js_1 = require("../controllers/movieController.js");
const router = express_1.default.Router();
// 1. Tuyến đường xử lý Phim (Các URL tĩnh đưa lên trước)
router.get("/", movieController_js_1.getMovies); // GET /api/movies (Danh sách phim)
router.post("/", movieController_js_1.addMovie); // POST /api/movies (Thêm phim mới)
// 2. Tuyến đường xử lý Suất chiếu (ĐƯA LÊN TRÊN ĐỂ TRÁNH BỊ ĐÈ ROUTE)
router.post("/showtimes", movieController_js_1.addShowtime); // POST /api/movies/showtimes
router.get("/showtimes/:id", movieController_js_1.getShowtimeDetail); // GET /api/movies/showtimes/:id
// 3. Tuyến đường chứa tham số biến động :id (LUÔN LUÔN XẾP CUỐI CÙNG)
router.get("/:id", movieController_js_1.getMovieDetailWithShowtimes); // GET /api/movies/:id
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map