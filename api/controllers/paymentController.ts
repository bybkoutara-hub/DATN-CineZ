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

    const uid = String(booking.user || booking.userId || "");
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
      amount: booking.totalPrice || booking.totalAmount || 0,
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

    const amountMatched = Number(amount) === Math.round((booking.totalPrice || booking.totalAmount || 0) * 100);

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
        await releaseSeats(cancelled.showtimeId || cancelled.showtime, cancelled.seats || []);
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

    if (Number(amount) !== Math.round((booking.totalPrice || booking.totalAmount || 0) * 100)) {
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
      if (cancelled) await releaseSeats(cancelled.showtimeId || cancelled.showtime, cancelled.seats || []);
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
      await releaseSeats(booking.showtimeId || booking.showtime, booking.seats || []);
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
