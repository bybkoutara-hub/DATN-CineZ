import express from "express";
import { protect, requireRole } from "../middlewares/auth.middleware";
import {
  getGenres, createGenre, updateGenre, deleteGenre,
  getAdminMovies, getAdminMovieById, createAdminMovie, updateAdminMovie, deleteAdminMovie,
  getRooms, createRoom, getRoomSeats,
  getAdminShowtimes, createAdminShowtime, deleteAdminShowtime, getBookedSeats,
  getCombos, createCombo, updateCombo, deleteCombo,
  getPromotions, createPromotion, updatePromotion, deletePromotion,
  getMembers, getStaffs, createStaff, updateStaff, deleteStaff,
  getSliders, createSlider, updateSlider, deleteSlider,
  getAdminBookings, updateBookingStatus,
  getDashboardStats,
} from "../controllers/adminController";
import { adminLogin, changePassword } from "../controllers/authController";

const router = express.Router();

router.post("/auth/login", adminLogin);
router.put("/auth/change-password", changePassword);

router.get("/genres", protect, requireRole("admin", "staff"), getGenres);
router.post("/genres", protect, requireRole("admin"), createGenre);
router.put("/genres/:id", protect, requireRole("admin"), updateGenre);
router.delete("/genres/:id", protect, requireRole("admin"), deleteGenre);

router.get("/movies", protect, requireRole("admin", "staff"), getAdminMovies);
router.get("/movies/:id", protect, requireRole("admin", "staff"), getAdminMovieById);
router.post("/movies", protect, requireRole("admin"), createAdminMovie);
router.put("/movies/:id", protect, requireRole("admin"), updateAdminMovie);
router.delete("/movies/:id", protect, requireRole("admin"), deleteAdminMovie);

router.get("/rooms", protect, requireRole("admin", "staff"), getRooms);
router.post("/rooms", protect, requireRole("admin"), createRoom);
router.get("/rooms/:id/seats", protect, requireRole("admin", "staff"), getRoomSeats);

router.get("/showtimes", protect, requireRole("admin", "staff"), getAdminShowtimes);
router.post("/showtimes", protect, requireRole("admin"), createAdminShowtime);
router.delete("/showtimes/:id", protect, requireRole("admin"), deleteAdminShowtime);
router.get("/showtimes/:id/booked-seats", protect, requireRole("admin", "staff"), getBookedSeats);

router.get("/combos", protect, requireRole("admin", "staff"), getCombos);
router.post("/combos", protect, requireRole("admin"), createCombo);
router.put("/combos/:id", protect, requireRole("admin"), updateCombo);
router.delete("/combos/:id", protect, requireRole("admin"), deleteCombo);

router.get("/promotions", protect, requireRole("admin", "staff"), getPromotions);
router.post("/promotions", protect, requireRole("admin"), createPromotion);
router.put("/promotions/:id", protect, requireRole("admin"), updatePromotion);
router.delete("/promotions/:id", protect, requireRole("admin"), deletePromotion);

router.get("/members", protect, requireRole("admin", "staff"), getMembers);
router.get("/staffs", protect, requireRole("admin", "staff"), getStaffs);
router.post("/staffs", protect, requireRole("admin"), createStaff);
router.put("/staffs/:id", protect, requireRole("admin"), updateStaff);
router.delete("/staffs/:id", protect, requireRole("admin"), deleteStaff);

router.get("/sliders", protect, requireRole("admin", "staff"), getSliders);
router.post("/sliders", protect, requireRole("admin"), createSlider);
router.put("/sliders/:id", protect, requireRole("admin"), updateSlider);
router.delete("/sliders/:id", protect, requireRole("admin"), deleteSlider);

router.get("/bookings", protect, requireRole("admin", "staff"), getAdminBookings);
router.put("/bookings/:id/status", protect, requireRole("admin"), updateBookingStatus);

router.get("/dashboard/stats", protect, requireRole("admin", "staff"), getDashboardStats);

export default router;
