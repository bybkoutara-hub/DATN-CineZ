import { Request, Response } from "express";
import Promotion from "../models/promotionModel";

export const getPromotions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const promos = await Promotion.find({ expiryDate: { $gte: now } });
    res.status(200).json({ success: true, data: promos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyPromo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
      return;
    }

    const promo = await Promotion.findOne({ code: (code as string).toUpperCase(), active: true });
    if (!promo) {
      res.status(404).json({ success: false, message: "Mã khuyến mãi không hợp lệ!" });
      return;
    }

    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết hạn!" });
      return;
    }

    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng!" });
      return;
    }

    const orderValue = Number(orderTotal) || 0;
    if (orderValue < promo.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Giá trị đơn hàng tối thiểu là ${promo.minOrderValue.toLocaleString("vi-VN")}đ!`,
      });
      return;
    }

    let discount = 0;
    if (promo.discountType === "percent") {
      discount = Math.round(orderValue * promo.discountValue / 100);
      if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount,
        finalTotal: Math.max(0, orderValue - discount),
        promotionId: promo._id,
        description: promo.description,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
