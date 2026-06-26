import { Request, Response } from "express";
import Payment from "../models/paymentModel";
import Booking from "../models/bookingModel";

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

export const createVnpayUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Thiếu bookingId" });
      return;
    }
    const bk = await Booking.findById(bookingId);
    if (!bk) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    // Mock VNPay URL - thay bằng tích hợp thật khi có thông tin merchant
    const mockPaymentUrl = `http://localhost:5000/api/payments/vnpay-return?bookingId=${bookingId}&amount=${bk.totalPrice}`;
    res.status(200).json({ success: true, paymentUrl: mockPaymentUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
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
