import express from "express";
import { protect, requireRole } from "../middlewares/auth.middleware";
import { adminLogin, changePassword } from "../controllers/authController";
import {
  adminRegister, adminGetProfile, adminUpdateProfile,
  getGenres, getGenreById, createGenre, updateGenre, deleteGenre,
  getAdminMovies, getAdminMovieById, createAdminMovie, updateAdminMovie, deleteAdminMovie,
  getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomSeats, updateRoomLayout,
  getAdminShowtimes, getAdminShowtimeById, createAdminShowtime, updateAdminShowtime, deleteAdminShowtime, getBookedSeats,
  getCombos, getComboById, createCombo, updateCombo, deleteCombo,
  getPromotions, getPromotionById, createPromotion, updatePromotion, deletePromotion, validatePromotion,
  getMembers, getMemberById, updateMember, getMemberBookings,
  getStaffs, getStaffById, createStaff, updateStaff, deleteStaff,
  getSliders, getSliderById, createSlider, updateSlider, deleteSlider, reorderSliders,
  getSeats, getSeatsByRoom, bulkCreateSeats, updateSeat, deleteSeat,
  getAdminBookings, getAdminBookingById, updateBookingStatus, cancelBooking,
  getInvoices, getInvoiceById, getInvoiceByBooking, createInvoice, updateInvoice,
  getDashboardStats, getDashboardRevenue, getDashboardRevenueByMovie, getDashboardTopMovies,
  getAdminActors, getAdminActorById, createActor, updateActor, deleteActor,
  getAdminDirectors, getAdminDirectorById, createDirector, updateDirector, deleteDirector,
  getAdminReviews, getAdminReviewById, deleteAdminReview,
} from "../controllers/adminController";

const router = express.Router();

// Auth (không cần protect)
router.post("/auth/register", adminRegister);
router.post("/auth/login", adminLogin);

// Auth (cần protect)
router.get("/auth/profile", protect, requireRole("admin", "staff"), adminGetProfile);
router.put("/auth/profile", protect, requireRole("admin", "staff"), adminUpdateProfile);
router.put("/auth/change-password", protect, requireRole("admin", "staff"), changePassword);

// Genres
router.get("/genres", protect, requireRole("admin", "staff"), getGenres);
router.get("/genres/:id", protect, requireRole("admin", "staff"), getGenreById);
router.post("/genres", protect, requireRole("admin"), createGenre);
router.put("/genres/:id", protect, requireRole("admin"), updateGenre);
router.delete("/genres/:id", protect, requireRole("admin"), deleteGenre);

// Movies
router.get("/movies", protect, requireRole("admin", "staff"), getAdminMovies);
router.get("/movies/:id", protect, requireRole("admin", "staff"), getAdminMovieById);
router.post("/movies", protect, requireRole("admin"), createAdminMovie);
router.put("/movies/:id", protect, requireRole("admin"), updateAdminMovie);
router.delete("/movies/:id", protect, requireRole("admin"), deleteAdminMovie);

// Rooms
router.get("/rooms", protect, requireRole("admin", "staff"), getRooms);
router.get("/rooms/:id", protect, requireRole("admin", "staff"), getRoomById);
router.post("/rooms", protect, requireRole("admin"), createRoom);
router.put("/rooms/:id", protect, requireRole("admin"), updateRoom);
router.delete("/rooms/:id", protect, requireRole("admin"), deleteRoom);
router.get("/rooms/:id/seats", protect, requireRole("admin", "staff"), getRoomSeats);
router.put("/rooms/:id/layout", protect, requireRole("admin"), updateRoomLayout);

// Showtimes
router.get("/showtimes", protect, requireRole("admin", "staff"), getAdminShowtimes);
router.get("/showtimes/:id", protect, requireRole("admin", "staff"), getAdminShowtimeById);
router.post("/showtimes", protect, requireRole("admin"), createAdminShowtime);
router.put("/showtimes/:id", protect, requireRole("admin"), updateAdminShowtime);
router.delete("/showtimes/:id", protect, requireRole("admin"), deleteAdminShowtime);
router.get("/showtimes/:id/booked-seats", protect, requireRole("admin", "staff"), getBookedSeats);

// Combos
router.get("/combos", protect, requireRole("admin", "staff"), getCombos);
router.get("/combos/:id", protect, requireRole("admin", "staff"), getComboById);
router.post("/combos", protect, requireRole("admin"), createCombo);
router.put("/combos/:id", protect, requireRole("admin"), updateCombo);
router.delete("/combos/:id", protect, requireRole("admin"), deleteCombo);

// Promotions
router.get("/promotions", protect, requireRole("admin", "staff"), getPromotions);
router.get("/promotions/:id", protect, requireRole("admin", "staff"), getPromotionById);
router.post("/promotions", protect, requireRole("admin"), createPromotion);
router.put("/promotions/:id", protect, requireRole("admin"), updatePromotion);
router.delete("/promotions/:id", protect, requireRole("admin"), deletePromotion);
router.post("/promotions/validate", protect, requireRole("admin", "staff"), validatePromotion);

// Members
router.get("/members", protect, requireRole("admin", "staff"), getMembers);
router.get("/members/:id", protect, requireRole("admin", "staff"), getMemberById);
router.put("/members/:id", protect, requireRole("admin", "staff"), updateMember);
router.get("/members/:id/bookings", protect, requireRole("admin", "staff"), getMemberBookings);

// Staff
router.get("/staff", protect, requireRole("admin", "staff"), getStaffs);
router.get("/staff/:id", protect, requireRole("admin", "staff"), getStaffById);
router.post("/staff", protect, requireRole("admin"), createStaff);
router.put("/staff/:id", protect, requireRole("admin"), updateStaff);
router.delete("/staff/:id", protect, requireRole("admin"), deleteStaff);

// Sliders
router.get("/sliders", protect, requireRole("admin", "staff"), getSliders);
router.get("/sliders/:id", protect, requireRole("admin", "staff"), getSliderById);
router.post("/sliders", protect, requireRole("admin"), createSlider);
router.put("/sliders/:id", protect, requireRole("admin"), updateSlider);
router.delete("/sliders/:id", protect, requireRole("admin"), deleteSlider);
router.put("/sliders/reorder", protect, requireRole("admin"), reorderSliders);

// Seats
router.get("/seats", protect, requireRole("admin", "staff"), getSeats);
router.get("/seats/room/:roomId", protect, requireRole("admin", "staff"), getSeatsByRoom);
router.post("/seats/bulk", protect, requireRole("admin"), bulkCreateSeats);
router.put("/seats/:id", protect, requireRole("admin"), updateSeat);
router.delete("/seats/:id", protect, requireRole("admin"), deleteSeat);

// Bookings
router.get("/bookings", protect, requireRole("admin", "staff"), getAdminBookings);
router.get("/bookings/:id", protect, requireRole("admin", "staff"), getAdminBookingById);
router.put("/bookings/:id", protect, requireRole("admin", "staff"), updateBookingStatus);
router.put("/bookings/:id/cancel", protect, requireRole("admin"), cancelBooking);

// Invoices
router.get("/invoices", protect, requireRole("admin", "staff"), getInvoices);
router.get("/invoices/:id", protect, requireRole("admin", "staff"), getInvoiceById);
router.get("/invoices/booking/:bookingId", protect, requireRole("admin", "staff"), getInvoiceByBooking);
router.post("/invoices", protect, requireRole("admin"), createInvoice);
router.put("/invoices/:id", protect, requireRole("admin"), updateInvoice);

// Dashboard
router.get("/dashboard/stats", protect, requireRole("admin", "staff"), getDashboardStats);
router.get("/dashboard/revenue", protect, requireRole("admin", "staff"), getDashboardRevenue);
router.get("/dashboard/revenue-by-movie", protect, requireRole("admin", "staff"), getDashboardRevenueByMovie);
router.get("/dashboard/top-movies", protect, requireRole("admin", "staff"), getDashboardTopMovies);

// Actors
router.get("/actors", protect, requireRole("admin", "staff"), getAdminActors);
router.get("/actors/:id", protect, requireRole("admin", "staff"), getAdminActorById);
router.post("/actors", protect, requireRole("admin"), createActor);
router.put("/actors/:id", protect, requireRole("admin"), updateActor);
router.delete("/actors/:id", protect, requireRole("admin"), deleteActor);

// Directors
router.get("/directors", protect, requireRole("admin", "staff"), getAdminDirectors);
router.get("/directors/:id", protect, requireRole("admin", "staff"), getAdminDirectorById);
router.post("/directors", protect, requireRole("admin"), createDirector);
router.put("/directors/:id", protect, requireRole("admin"), updateDirector);
router.delete("/directors/:id", protect, requireRole("admin"), deleteDirector);

// Reviews
router.get("/reviews", protect, requireRole("admin", "staff"), getAdminReviews);
router.get("/reviews/:id", protect, requireRole("admin", "staff"), getAdminReviewById);
router.delete("/reviews/:id", protect, requireRole("admin"), deleteAdminReview);

export default router;
