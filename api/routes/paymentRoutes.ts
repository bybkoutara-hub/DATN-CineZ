import express from "express";
import { createPayment, getPaymentByBooking, createVnpayUrl, vnpayRedirect } from "../controllers/paymentController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

// VNPay redirect (không cần auth - là callback từ cổng thanh toán)
router.get("/vnpay-redirect", vnpayRedirect);

router.use(protect);

router.post("/", createPayment);
router.post("/vnpay/create-url", createVnpayUrl);
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
