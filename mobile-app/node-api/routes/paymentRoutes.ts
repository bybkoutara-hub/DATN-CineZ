import express from "express";
import { createVnpUrl, vnpIpn, vnpReturn } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// [POST] /api/payment/vnpay/create-url -> Tạo URL thanh toán cho đơn pending (cần đăng nhập)
router.post("/vnpay/create-url", verifyToken, createVnpUrl);

// [GET] /api/payment/vnpay/return -> VNPay redirect trình duyệt người dùng về (public)
router.get("/vnpay/return", vnpReturn);

// [GET] /api/payment/vnpay/ipn -> IPN server-to-server từ VNPay (public)
router.get("/vnpay/ipn", vnpIpn);

export default router;
