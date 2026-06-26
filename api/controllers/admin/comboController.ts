import { Request, Response } from "express";
import AdminCombo from "../../models/admin/adminComboModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const combos = await AdminCombo.find(filter).sort({ price: 1 });
    res.status(200).json(combos);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách combo", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const combo = await AdminCombo.findById(req.params.id);
    if (!combo) {
      res.status(404).json({ message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json(combo);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết combo", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCombo = new AdminCombo(req.body);
    const saved = await newCombo.save();
    res.status(201).json({ message: "Thêm combo thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo combo", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AdminCombo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json({ message: "Cập nhật combo thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật combo", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AdminCombo.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy combo" });
      return;
    }
    res.status(200).json({ message: "Đã xóa combo" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa combo", error: error.message });
  }
};
