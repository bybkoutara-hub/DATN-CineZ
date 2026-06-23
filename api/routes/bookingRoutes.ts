import express from "express";
import { createBooking, getBookingById, getMyBookings } from "../controllers/bookingController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(protect); // toàn bộ route booking cần đăng nhập

router.post("/", createBooking);
router.get("/mine", getMyBookings);
router.get("/:id", getBookingById);

export default router;
