import express from "express";
import { cancelBooking, createBooking, MyBookingsHistory } from "../controllers/bookingController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * -------------------------------------------------------------------------
 * LƯU Ý BẢO MẬT: Tất cả các route đặt vé đều chèn middleware `verifyToken` ở giữa.
 * Khi Mobile App gửi request, bắt buộc phải đính kèm Header:
 * Authorization: Bearer <token_jwt_sau_khi_dang_nhap>
 * -------------------------------------------------------------------------
 */

// [POST] /api/bookings -> Thực hiện tạo đơn đặt vé (giữ ghế, trừ ghế trống, tính tiền)
router.post("/", verifyToken, createBooking);

// [GET] /api/bookings/my-history -> Lấy danh sách lịch sử các vé đã đặt của User hiện tại
router.get("/my-history", verifyToken, MyBookingsHistory);

// [POST] /api/bookings/:id/cancel -> Hủy đơn pending & hoàn ghế (vd khi hủy thanh toán VNPay)
router.post("/:id/cancel", verifyToken, cancelBooking);

export default router;