// ==========================================
// XỬ LÝ THANH TOÁN ONLINE QUA VNPAY
// ==========================================
import { type Request, type Response } from "express";
import Booking from "../models/bookingModel.js";
import Showtime from "../models/showtimeModel.js";
import { sendBookingConfirmationEmail } from "../utils/sendBookingEmail.js";
import { buildVnpUrl, verifyVnpReturn } from "../utils/vnpay.js";

/** Trả ghế đã giữ về lại suất chiếu (thao tác nguyên tử, chống trùng/mất ghế). */
const releaseSeats = async (showtimeId: any, seats: string[]): Promise<void> => {
  try {
    if (!seats || seats.length === 0) return;
    await Showtime.updateOne(
      { _id: showtimeId },
      { $addToSet: { availableSeats: { $each: seats } } }
    );
  } catch (err: any) {
    console.error("🔴 [VNPay]: Lỗi trả ghế:", err.message);
  }
};

/**
 * @desc    Tạo URL thanh toán VNPay cho một đơn đặt vé đang chờ (pending)
 * @route   POST /api/payment/vnpay/create-url
 * @access  Private
 */
export const createVnpUrl = async (req: any, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Thiếu mã đơn đặt vé (bookingId)." });
      return;
    }

    const booking: any = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
      return;
    }
    // Chỉ chủ đơn mới được thanh toán đơn của mình
    if (String(booking.userId) !== String(req.user.id)) {
      res.status(403).json({ success: false, message: "Bạn không có quyền thanh toán đơn này." });
      return;
    }
    if (booking.status !== "pending") {
      res.status(400).json({ success: false, message: "Đơn này không ở trạng thái chờ thanh toán." });
      return;
    }

    const ipAddr =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    const paymentUrl = buildVnpUrl({
      amount: booking.totalPrice,
      orderId: String(booking._id),
      orderInfo: `Thanh toan ve xem phim ${booking._id}`,
      ipAddr: (String(ipAddr).split(",")[0] || "127.0.0.1").trim(),
    });

    res.status(200).json({ success: true, paymentUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo URL thanh toán", error: error.message });
  }
};

/** Trang HTML nhỏ tự chuyển hướng về app qua deep link. */
const redirectToApp = (res: Response, status: string, bookingId: string): void => {
  const scheme = process.env.APP_RETURN_SCHEME || "mobileapp://vnpay-return";
  const deepLink = `${scheme}?status=${status}&bookingId=${bookingId}`;
  const label =
    status === "success" ? "Thanh toán thành công" : "Thanh toán không thành công";
  res.status(200).send(`<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${label}</title>
<script>window.location.href = ${JSON.stringify(deepLink)};</script>
<style>body{font-family:Arial;background:#0d0d0d;color:#fff;display:flex;flex-direction:column;
align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:0 24px;}
a{color:#E2A43B;font-weight:bold;font-size:18px;margin-top:16px;}</style></head>
<body><h2>${label}</h2><p>Đang quay lại ứng dụng CineZ...</p>
<a href="${deepLink}">Nhấn vào đây nếu không tự chuyển</a></body></html>`);
};

/**
 * @desc    VNPay redirect trình duyệt người dùng về sau khi thanh toán
 * @route   GET /api/payment/vnpay/return
 * @access  Public
 */
export const vnpReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isValid, responseCode, txnRef, amount } = verifyVnpReturn(req.query as Record<string, any>);

    if (!isValid) {
      redirectToApp(res, "invalid", txnRef);
      return;
    }

    const booking: any = await Booking.findById(txnRef);
    if (!booking) {
      redirectToApp(res, "notfound", txnRef);
      return;
    }

    // Tránh xử lý lặp: nếu đã completed thì coi như thành công
    if (booking.status === "completed") {
      redirectToApp(res, "success", txnRef);
      return;
    }

    // Đối chiếu số tiền VNPay trả về với số tiền đơn (chống thao túng số tiền)
    const amountMatched = Number(amount) === Math.round((booking.totalPrice || 0) * 100);

    if (responseCode === "00" && amountMatched) {
      // Cập nhật nguyên tử: chỉ completed khi đơn còn pending -> chống xử lý 2 lần
      const updated = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "completed" },
        { new: true }
      );
      if (updated) {
        sendBookingConfirmationEmail(String(updated._id)); // gửi email xác nhận
      }
      redirectToApp(res, "success", txnRef);
    } else {
      // Thất bại/hủy/sai số tiền: đánh dấu hủy (nguyên tử) và trả ghế lại
      const cancelled = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "cancelled" },
        { new: true }
      );
      if (cancelled) {
        await releaseSeats(cancelled.showtimeId, cancelled.seats || []);
      }
      redirectToApp(res, "failed", txnRef);
    }
  } catch (error: any) {
    console.error("🔴 [VNPay Return]:", error.message);
    redirectToApp(res, "error", String(req.query.vnp_TxnRef || ""));
  }
};

/**
 * @desc    IPN server-to-server từ VNPay (dự phòng; LAN có thể không gọi tới được)
 * @route   GET /api/payment/vnpay/ipn
 * @access  Public
 */
export const vnpIpn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isValid, responseCode, txnRef, amount } = verifyVnpReturn(req.query as Record<string, any>);
    if (!isValid) {
      res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
      return;
    }

    const booking: any = await Booking.findById(txnRef);
    if (!booking) {
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
      return;
    }
    // Đối chiếu số tiền theo chuẩn VNPay (sai -> RspCode 04)
    if (Number(amount) !== Math.round((booking.totalPrice || 0) * 100)) {
      res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
      return;
    }
    if (booking.status === "completed") {
      res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      return;
    }

    if (responseCode === "00") {
      const updated = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "completed" },
        { new: true }
      );
      if (updated) sendBookingConfirmationEmail(String(updated._id));
    } else {
      const cancelled = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "cancelled" },
        { new: true }
      );
      if (cancelled) await releaseSeats(cancelled.showtimeId, cancelled.seats || []);
    }
    res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error: any) {
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};
