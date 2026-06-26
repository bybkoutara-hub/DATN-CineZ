import express from "express";
import { cancelBooking, createBooking, getBookingById, getMyBookings } from "../controllers/bookingController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(protect); // toàn bộ route booking cần đăng nhập

router.post("/", createBooking);
router.get("/mine", getMyBookings);
router.get("/my-history", getMyBookings);
router.post("/:id/cancel", cancelBooking);
router.get("/:id", getBookingById);

export default router;
