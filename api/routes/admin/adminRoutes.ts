import { Router } from "express";
import * as authController from "../../controllers/admin/authController";
import * as movieController from "../../controllers/admin/movieController";
import * as showtimeController from "../../controllers/admin/showtimeController";
import * as genreController from "../../controllers/admin/genreController";
import * as roomController from "../../controllers/admin/roomController";
import * as comboController from "../../controllers/admin/comboController";
import * as promotionController from "../../controllers/admin/promotionController";
import * as memberController from "../../controllers/admin/memberController";
import * as staffController from "../../controllers/admin/staffController";
import * as dashboardController from "../../controllers/admin/dashboardController";
import * as sliderController from "../../controllers/admin/sliderController";
import * as seatController from "../../controllers/admin/seatController";
import * as bookingController from "../../controllers/admin/bookingController";
import * as invoiceController from "../../controllers/admin/invoiceController";

const router = Router();

// Auth
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/profile", authController.getProfile);
router.put("/auth/profile", authController.updateProfile);
router.put("/auth/change-password", authController.changePassword);

// Dashboard
router.get("/dashboard/stats", dashboardController.getStats);
router.get("/dashboard/revenue", dashboardController.getRevenue);
router.get("/dashboard/revenue-by-movie", dashboardController.getRevenueByMovie);
router.get("/dashboard/top-movies", dashboardController.getTopMovies);

// Movies
router.get("/movies", movieController.getAll);
router.get("/movies/:id", movieController.getById);
router.post("/movies", movieController.create);
router.put("/movies/:id", movieController.update);
router.delete("/movies/:id", movieController.remove);

// Showtimes
router.get("/showtimes", showtimeController.getAll);
router.get("/showtimes/:id", showtimeController.getById);
router.post("/showtimes", showtimeController.create);
router.put("/showtimes/:id", showtimeController.update);
router.delete("/showtimes/:id", showtimeController.remove);
router.get("/showtimes/:id/booked-seats", showtimeController.getBookedSeats);

// Genres
router.get("/genres", genreController.getAll);
router.get("/genres/:id", genreController.getById);
router.post("/genres", genreController.create);
router.put("/genres/:id", genreController.update);
router.delete("/genres/:id", genreController.remove);

// Rooms
router.get("/rooms", roomController.getAll);
router.get("/rooms/:id", roomController.getById);
router.post("/rooms", roomController.create);
router.put("/rooms/:id", roomController.update);
router.delete("/rooms/:id", roomController.remove);

// Combos
router.get("/combos", comboController.getAll);
router.get("/combos/:id", comboController.getById);
router.post("/combos", comboController.create);
router.put("/combos/:id", comboController.update);
router.delete("/combos/:id", comboController.remove);

// Promotions
router.get("/promotions", promotionController.getAll);
router.get("/promotions/:id", promotionController.getById);
router.post("/promotions", promotionController.create);
router.put("/promotions/:id", promotionController.update);
router.delete("/promotions/:id", promotionController.remove);
router.post("/promotions/validate", promotionController.validate);

// Members
router.get("/members", memberController.getAll);
router.get("/members/:id", memberController.getById);
router.put("/members/:id", memberController.update);
router.get("/members/:id/bookings", memberController.getBookings);

// Staff
router.get("/staff", staffController.getAll);
router.get("/staff/:id", staffController.getById);
router.post("/staff", staffController.create);
router.put("/staff/:id", staffController.update);
router.delete("/staff/:id", staffController.remove);

// Sliders
router.get("/sliders", sliderController.getAll);
router.get("/sliders/:id", sliderController.getById);
router.post("/sliders", sliderController.create);
router.put("/sliders/:id", sliderController.update);
router.delete("/sliders/:id", sliderController.remove);
router.put("/sliders/reorder", sliderController.reorder);

// Seats
router.get("/seats", seatController.getAll);
router.get("/seats/room/:roomId", seatController.getByRoom);
router.post("/seats/bulk", seatController.bulkCreate);
router.put("/seats/:id", seatController.update);
router.delete("/seats/:id", seatController.remove);

// Bookings
router.get("/bookings", bookingController.getAll);
router.get("/bookings/:id", bookingController.getById);
router.put("/bookings/:id", bookingController.update);
router.put("/bookings/:id/cancel", bookingController.cancel);

// Invoices
router.get("/invoices", invoiceController.getAll);
router.get("/invoices/:id", invoiceController.getById);
router.post("/invoices", invoiceController.create);
router.put("/invoices/:id", invoiceController.update);
router.get("/invoices/booking/:bookingId", invoiceController.getByBooking);

export default router;
