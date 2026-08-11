import { Request, Response } from "express";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";
import { sendBookingConfirmationEmail } from "../utils/sendBookingEmail.js";
import { buildVnpUrl, verifyVnpReturn } from "../utils/vnpay.js";

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

export const createVnpayUrl = async (req: any, res: Response): Promise<void> => {
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

    const uid = String(booking.user || "");
    if (uid && uid !== String(req.user?.id)) {
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
      amount: booking.totalPrice || 0,
      orderId: String(booking._id),
      orderInfo: `Thanh toan ve xem phim ${booking._id}`,
      ipAddr: (String(ipAddr).split(",")[0] || "127.0.0.1").trim(),
    });

    res.status(200).json({ success: true, paymentUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo URL thanh toán", error: error.message });
  }
};

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

    if (booking.status === "paid" || booking.status === "completed") {
      redirectToApp(res, "success", txnRef);
      return;
    }

    const amountMatched = Number(amount) === Math.round((booking.totalPrice || 0) * 100);

    if (responseCode === "00" && amountMatched) {
      const updated = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "paid", paymentStatus: "completed" },
        { new: true }
      );
      if (updated) {
        sendBookingConfirmationEmail(String(updated._id));
      }
      redirectToApp(res, "success", txnRef);
    } else {
      const cancelled = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "cancelled", paymentStatus: "cancelled" },
        { new: true }
      );
      if (cancelled) {
        await releaseSeats(cancelled.showtime, cancelled.seats || []);
      }
      redirectToApp(res, "failed", txnRef);
    }
  } catch (error: any) {
    console.error("🔴 [VNPay Return]:", error.message);
    redirectToApp(res, "error", String(req.query.vnp_TxnRef || ""));
  }
};

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

    if (Number(amount) !== Math.round((booking.totalPrice || 0) * 100)) {
      res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
      return;
    }

    if (booking.status === "paid" || booking.status === "completed") {
      res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      return;
    }

    if (responseCode === "00") {
      const updated = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "paid", paymentStatus: "completed" },
        { new: true }
      );
      if (updated) sendBookingConfirmationEmail(String(updated._id));
    } else {
      const cancelled = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "cancelled", paymentStatus: "cancelled" },
        { new: true }
      );
      if (cancelled) await releaseSeats(cancelled.showtime, cancelled.seats || []);
    }
    res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error: any) {
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { booking, method } = req.body;
    const bk = await Booking.findById(booking);
    if (!bk) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    const updated = await Booking.findOneAndUpdate(
      { _id: booking, status: "pending" },
      { status: "paid", paymentStatus: "completed" },
      { new: true }
    );
    if (!updated) {
      res.status(400).json({ success: false, message: "Đơn này không ở trạng thái chờ thanh toán" });
      return;
    }
    sendBookingConfirmationEmail(booking);
    res.status(200).json({ success: true, data: { booking } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmVnpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vnpayParams } = req.body;
    if (!vnpayParams) {
      res.status(400).json({ success: false, message: "Thiếu dữ liệu VNPay." });
      return;
    }

    const { isValid, responseCode, txnRef } = verifyVnpReturn(vnpayParams);
    if (!isValid) {
      res.status(400).json({ success: false, message: "Chữ ký VNPay không hợp lệ." });
      return;
    }

    const booking: any = await Booking.findById(txnRef);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
      return;
    }

    if (booking.status === "paid" || booking.status === "completed") {
      res.status(200).json({ success: true, status: "success" });
      return;
    }

    if (responseCode === "00") {
      const updated = await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "paid", paymentStatus: "completed" },
        { new: true }
      );
      if (updated) sendBookingConfirmationEmail(String(updated._id));
      res.status(200).json({ success: true, status: "success" });
    } else {
      await Booking.findOneAndUpdate(
        { _id: txnRef, status: "pending" },
        { status: "cancelled", paymentStatus: "cancelled" },
        { new: true }
      );
      await releaseSeats(booking.showtime, booking.seats || []);
      res.status(200).json({ success: true, status: "failed" });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentByBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
      return;
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isSuccessResultCode = (code: any): boolean =>
  code === "00" || code === 0 || code === "0" || code === "success" || code === "SUCCESS" || code === "PAID" || code === "completed";

/**
 * API 3 — Webhook thanh toán (POST /api/payments/webhook)
 * Nhận callback từ cổng thanh toán (VNPay / MoMo / ZaloPay).
 * Body: { bookingId, resultCode, transactionId?, provider? }
 * - Booking còn trong thời gian HOLDING -> PAID, ghế BOOKED (đã loại khỏi availableSeats khi hold).
 * - Booking đã EXPIRED khi webhook tới trễ -> ghế có thể đã bị người khác đặt:
 *   chuyển booking -> refunded + nhả ghế + log Auto-refund.
 * - Idempotent: webhook gửi lại không gây tác dụng phụ.
 */
export const paymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, resultCode, transactionId, provider } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Thiếu bookingId" });
      return;
    }

    const booking: any = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé" });
      return;
    }

    // Idempotent — webhook retry không đổi trạng thái đã xác nhận
    if (booking.status === "paid" || booking.status === "completed") {
      res.status(200).json({ success: true, status: "already_paid", message: "Đơn đã thanh toán trước đó" });
      return;
    }
    if (booking.status !== "pending") {
      res.status(200).json({ success: false, status: booking.status, message: "Đơn không trong trạng thái chờ thanh toán" });
      return;
    }

    const now = new Date();
    const holdExpired = !!(booking.holdExpiresAt && booking.holdExpiresAt < now);
    const meta = transactionId ? { transactionId: String(transactionId) } : {};

    if (isSuccessResultCode(resultCode)) {
      if (holdExpired) {
        // Webhook tới TRỄ (quá 15 phút giữ ghế) — ghế có thể đã nhả/bị người khác đặt:
        // Kích hoạt Auto-refund cho khách + ghi log.
        const claimed = await Booking.findOneAndUpdate(
          { _id: bookingId, status: "pending" },
          {
            status: "refunded",
            paymentStatus: "cancelled",
            refundNote: "Thanh toán đến sau khi hết hạn giữ ghế (15 phút) — tự động hoàn tiền",
            ...meta,
          },
          { new: true }
        );
        if (claimed) {
          await releaseSeats(claimed.showtime, claimed.seats || []);
          console.log(
            `[Webhook][Auto-Refund] Booking ${bookingId} (${provider || "unknown"}): thanh toán trễ, hết hạn giữ ghế lúc ${booking.holdExpiresAt}. ` +
            `Hoàn tiền ${booking.totalPrice || 0} VNĐ cho khách. Ghế đã nhả để người khác đặt.`
          );
        }
        res.status(200).json({
          success: true,
          status: "refunded",
          message: "Đơn đã hết hạn giữ ghế — đã tự động hoàn tiền",
        });
        return;
      }

      // Còn thời gian HOLDING -> PAID; ghế đã BOOKED sẵn (bị loại khỏi availableSeats khi giữ)
      const updated = await Booking.findOneAndUpdate(
        { _id: bookingId, status: "pending" },
        { status: "paid", paymentStatus: "completed", ...meta },
        { new: true }
      );
      if (updated) sendBookingConfirmationEmail(String(updated._id));
      res.status(200).json({ success: true, status: "paid", message: "Thanh toán thành công — vé đã xác nhận" });
      return;
    }

    // Thanh toán thất bại -> hủy đơn + nhả ghế cho người khác
    const cancelled = await Booking.findOneAndUpdate(
      { _id: bookingId, status: "pending" },
      { status: "cancelled", paymentStatus: "cancelled", ...meta },
      { new: true }
    );
    if (cancelled) await releaseSeats(cancelled.showtime, cancelled.seats || []);
    res.status(200).json({ success: true, status: "cancelled", message: "Thanh toán thất bại — đã hủy và nhả ghế" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
