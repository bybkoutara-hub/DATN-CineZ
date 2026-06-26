import { Request, Response } from "express";
import Invoice from "../../models/invoiceModel";
import AdminBooking from "../../models/admin/adminBookingModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, method, from, to } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from as string);
      if (to) filter.issuedAt.$lte = new Date(to as string);
    }
    const invoices = await Invoice.find(filter)
      .populate({
        path: "booking",
        populate: [
          { path: "user_id", select: "username fullName" },
          { path: "showtime_id", populate: { path: "movieId", select: "title" } },
        ],
      })
      .sort({ issuedAt: -1 });
    res.status(200).json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách hóa đơn", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: "booking",
      populate: [
        { path: "user_id", select: "username fullName email phone" },
        { path: "showtime_id", populate: { path: "movieId", select: "title poster duration genres" } },
        { path: "combo", select: "name price items" },
      ],
    });
    if (!invoice) {
      res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      return;
    }
    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết hóa đơn", error: error.message });
  }
};

export const getByBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findOne({ booking: req.params.bookingId }).populate({
      path: "booking",
      populate: [
        { path: "user_id", select: "username fullName email phone" },
        { path: "showtime_id", populate: { path: "movieId", select: "title poster duration" } },
      ],
    });
    if (!invoice) {
      res.status(404).json({ message: "Không tìm thấy hóa đơn cho đặt vé này" });
      return;
    }
    res.status(200).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy hóa đơn theo đặt vé", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { booking: bookingId, method, transactionId, status } = req.body;
    if (!bookingId) {
      res.status(400).json({ message: "Thiếu thông tin đặt vé!" });
      return;
    }
    const booking = await AdminBooking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Không tìm thấy đặt vé!" });
      return;
    }
    const existing = await Invoice.findOne({ booking: bookingId });
    if (existing) {
      res.status(400).json({ message: "Hóa đơn cho đặt vé này đã tồn tại!" });
      return;
    }
    const newInvoice = new Invoice({
      booking: bookingId,
      amount: booking.totalAmount,
      method: method || "cash",
      status: status || "paid",
      transactionId: transactionId || "",
    });
    const saved = await newInvoice.save();
    if (saved.status === "paid") {
      await AdminBooking.findByIdAndUpdate(bookingId, { paymentStatus: "completed" });
    }
    res.status(201).json({ message: "Tạo hóa đơn thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo hóa đơn", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, method, transactionId } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (method) updateData.method = method;
    if (transactionId !== undefined) updateData.transactionId = transactionId;
    const updated = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      return;
    }
    res.status(200).json({ message: "Cập nhật hóa đơn thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật hóa đơn", error: error.message });
  }
};
