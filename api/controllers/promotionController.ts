import { Request, Response } from "express";
import Promotion from "../models/promotionModel";

// Danh sách khuyến mãi đang hoạt động
export const getPromotions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const promos = await Promotion.find({ active: true, startDate: { $lte: now }, endDate: { $gte: now } });
    res.status(200).json({ success: true, data: promos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Áp mã giảm giá (validate) -> trả số tiền được giảm
export const applyPromo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;
    const promo = await Promotion.findOne({ code, active: true });
    if (!promo) {
      res.status(404).json({ success: false, message: "Mã không hợp lệ" });
      return;
    }
    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      res.status(400).json({ success: false, message: "Mã đã hết hạn" });
      return;
    }
    const discount =
      promo.discountType === "percent"
        ? (orderTotal * promo.discountValue) / 100
        : promo.discountValue;
    res.status(200).json({ success: true, data: { discount, finalTotal: Math.max(0, orderTotal - discount) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
