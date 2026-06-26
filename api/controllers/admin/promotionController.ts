import { Request, Response } from "express";
import AdminPromotion from "../../models/admin/adminPromotionModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active, search } = req.query;
    const filter: any = {};
    if (active !== undefined) filter.active = active === "true";
    if (search) filter.code = { $regex: search, $options: "i" };
    const promotions = await AdminPromotion.find(filter).sort({ createdAt: -1 });
    res.status(200).json(promotions);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotion = await AdminPromotion.findById(req.params.id);
    if (!promotion) {
      res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json(promotion);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết khuyến mãi", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPromotion = new AdminPromotion(req.body);
    const saved = await newPromotion.save();
    res.status(201).json({ message: "Thêm khuyến mãi thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo khuyến mãi", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AdminPromotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json({ message: "Cập nhật khuyến mãi thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật khuyến mãi", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AdminPromotion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
      return;
    }
    res.status(200).json({ message: "Xóa khuyến mãi thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa khuyến mãi", error: error.message });
  }
};

export const validate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderValue } = req.body;
    const promotion = await AdminPromotion.findOne({
      code: code.toUpperCase(),
      active: true,
    });
    if (!promotion) {
      res.status(404).json({ success: false, message: "Mã khuyến mãi không hợp lệ!" });
      return;
    }
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết hạn!" });
      return;
    }
    if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
      res.status(400).json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng!" });
      return;
    }
    if (orderValue && orderValue < promotion.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Giá trị đơn hàng tối thiểu là ${promotion.minOrderValue.toLocaleString()}đ!`,
      });
      return;
    }
    let discount = 0;
    if (promotion.discountType === "percent") {
      discount = Math.round((orderValue * promotion.discountValue) / 100);
      if (promotion.maxDiscount > 0 && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount;
      }
    } else {
      discount = promotion.discountValue;
    }
    res.status(200).json({
      success: true,
      data: {
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        discount,
        description: promotion.description,
      },
      message: "Áp dụng mã khuyến mãi thành công!",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi kiểm tra khuyến mãi", error: error.message });
  }
};
