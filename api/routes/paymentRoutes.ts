import express from "express";
import { createPayment, createVnpayUrl, getPaymentByBooking } from "../controllers/paymentController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(protect);

router.post("/", createPayment);
router.post("/vnpay/create-url", createVnpayUrl);
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
