import express from "express";
import { createPayment, getPaymentByBooking, createVnpayUrl, vnpReturn, vnpIpn } from "../controllers/paymentController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes - VNPay callbacks (không cần auth)
router.get("/vnpay/return", vnpReturn);
router.get("/vnpay/ipn", vnpIpn);

router.use(protect);

// Protected routes - cần đăng nhập
router.post("/", createPayment);
router.post("/vnpay/create-url", createVnpayUrl);
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
