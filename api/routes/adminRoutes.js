"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authController_1 = require("../controllers/authController");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// Auth (không cần protect)
router.post("/auth/register", adminController_1.adminRegister);
router.post("/auth/login", authController_1.adminLogin);
// Auth (cần protect)
router.get("/auth/profile", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.adminGetProfile);
router.put("/auth/profile", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.adminUpdateProfile);
router.put("/auth/change-password", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), authController_1.changePassword);
// Genres
router.get("/genres", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getGenres);
router.get("/genres/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getGenreById);
router.post("/genres", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createGenre);
router.put("/genres/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateGenre);
router.delete("/genres/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteGenre);
// Movies
router.get("/movies", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminMovies);
router.get("/movies/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminMovieById);
router.post("/movies", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createAdminMovie);
router.put("/movies/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateAdminMovie);
router.delete("/movies/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteAdminMovie);
// Rooms
router.get("/rooms", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getRooms);
router.get("/rooms/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getRoomById);
router.post("/rooms", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createRoom);
router.put("/rooms/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateRoom);
router.delete("/rooms/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteRoom);
router.get("/rooms/:id/seats", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getRoomSeats);
// Showtimes
router.get("/showtimes", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminShowtimes);
router.get("/showtimes/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminShowtimeById);
router.post("/showtimes", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createAdminShowtime);
router.put("/showtimes/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateAdminShowtime);
router.delete("/showtimes/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteAdminShowtime);
router.get("/showtimes/:id/booked-seats", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getBookedSeats);
// Combos
router.get("/combos", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getCombos);
router.get("/combos/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getComboById);
router.post("/combos", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createCombo);
router.put("/combos/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateCombo);
router.delete("/combos/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteCombo);
// Promotions
router.get("/promotions", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getPromotions);
router.get("/promotions/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getPromotionById);
router.post("/promotions", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createPromotion);
router.put("/promotions/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updatePromotion);
router.delete("/promotions/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deletePromotion);
router.post("/promotions/validate", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.validatePromotion);
// Members
router.get("/members", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getMembers);
router.get("/members/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getMemberById);
router.put("/members/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.updateMember);
router.get("/members/:id/bookings", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getMemberBookings);
// Staff
router.get("/staff", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getStaffs);
router.get("/staff/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getStaffById);
router.post("/staff", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createStaff);
router.put("/staff/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateStaff);
router.delete("/staff/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteStaff);
// Sliders
router.get("/sliders", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getSliders);
router.get("/sliders/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getSliderById);
router.post("/sliders", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createSlider);
router.put("/sliders/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateSlider);
router.delete("/sliders/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteSlider);
router.put("/sliders/reorder", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.reorderSliders);
// Seats
router.get("/seats", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getSeats);
router.get("/seats/room/:roomId", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getSeatsByRoom);
router.post("/seats/bulk", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.bulkCreateSeats);
router.put("/seats/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateSeat);
router.delete("/seats/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.deleteSeat);
// Bookings
router.get("/bookings", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminBookings);
router.get("/bookings/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getAdminBookingById);
router.put("/bookings/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.updateBookingStatus);
router.put("/bookings/:id/cancel", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.cancelBooking);
// Invoices
router.get("/invoices", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getInvoices);
router.get("/invoices/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getInvoiceById);
router.get("/invoices/booking/:bookingId", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getInvoiceByBooking);
router.post("/invoices", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.createInvoice);
router.put("/invoices/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin"), adminController_1.updateInvoice);
// Dashboard
router.get("/dashboard/stats", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getDashboardStats);
router.get("/dashboard/revenue", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getDashboardRevenue);
router.get("/dashboard/revenue-by-movie", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getDashboardRevenueByMovie);
router.get("/dashboard/top-movies", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "staff"), adminController_1.getDashboardTopMovies);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map