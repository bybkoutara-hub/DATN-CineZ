import express from "express";
import { createPayment, getPaymentByBooking, createVnpayUrl, vnpReturn, vnpIpn, confirmVnpayPayment, paymentWebhook } from "../controllers/paymentController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

// Public routes - VNPay callbacks & webhook thanh toán (không cần auth)
router.get("/vnpay/return", vnpReturn);
router.get("/vnpay/ipn", vnpIpn);
router.post("/webhook", paymentWebhook);

router.use(protect);

// Protected routes - cần đăng nhập
router.post("/", createPayment);
router.post("/vnpay/create-url", createVnpayUrl);
router.post("/vnpay/confirm", confirmVnpayPayment);
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
