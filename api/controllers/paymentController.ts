import { Request, Response } from "express";
import Payment from "../models/paymentModel";
import Booking from "../models/bookingModel";
import { sendBookingConfirmationEmail } from "../utils/sendBookingEmail.js";

// Tạo giao dịch thanh toán cho một booking
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { booking, method } = req.body;
    const bk = await Booking.findById(booking);
    if (!bk) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    // TODO: tích hợp cổng thanh toán thật (Momo/ZaloPay/VNPay)
    const payment = await Payment.create({
      booking,
      amount: bk.totalPrice,
      method,
      status: "success", // mock: mặc định thành công
      transactionId: "MOCK_" + Date.now(),
    });
    await Booking.findByIdAndUpdate(booking, { status: "paid" });
    res.status(201).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mock VNPay - thanh toán trực tiếp (không cần browser)
export const createVnpayUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📡 [VNPay] createVnpayUrl called, body:", JSON.stringify(req.body));
    const { bookingId } = req.body;
    if (!bookingId) {
      console.log("🔴 [VNPay] Missing bookingId");
      res.status(400).json({ success: false, message: "Thiếu mã đơn vé" });
      return;
    }
    const bk = await Booking.findById(bookingId);
    if (!bk) {
      console.log("🔴 [VNPay] Booking not found:", bookingId);
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    // Mock: đánh dấu thanh toán thành công ngay
    console.log("🟢 [VNPay] Marking booking as paid:", bookingId);
    bk.status = "paid";
    bk.paymentStatus = "completed";
    await bk.save();

    // Gửi email xác nhận (bất đồng bộ, không chặn response)
    sendBookingConfirmationEmail(bookingId);

    // Trả về URL trang thành công (tương thích cả app cũ kiểm tra paymentUrl)
    const host = req.headers.host || "localhost:5000";
    const successUrl = `http://${host}/api/payments/vnpay-redirect?bookingId=${bookingId}`;
    res.status(200).json({ success: true, paymentUrl: successUrl });
  } catch (error: any) {
    console.error("🔴 [VNPay] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mock VNPay - callback: hiển thị trang thành công
export const vnpayRedirect = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.query;
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>Thanh toán thành công</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0d0d0d;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:Arial,Helvetica,sans-serif;">
  <div style="background:#1c1c1e;border-radius:20px;padding:40px 32px;text-align:center;max-width:380px;width:90%;">
    <div style="width:72px;height:72px;border-radius:50%;background:rgba(52,199,89,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 style="color:#fff;font-size:22px;margin:0 0 8px;">Thanh toán thành công!</h1>
    <p style="color:#888;font-size:14px;margin:0 0 24px;">Đơn đặt vé của bạn đã được xác nhận.</p>
    <div style="background:#0d0d0d;border-radius:12px;padding:14px;">
      <p style="color:#666;font-size:12px;margin:0 0 4px;">Mã đặt vé</p>
      <p style="color:#E2A43B;font-size:20px;font-weight:bold;margin:0;letter-spacing:1px;">${bookingId || "---"}</p>
    </div>
    <p style="color:#555;font-size:13px;margin-top:24px;">Bạn có thể đóng trang này và quay lại ứng dụng.</p>
  </div>
</body>
</html>
  `);
};

export const getPaymentByBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) {
      res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
      return;
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
