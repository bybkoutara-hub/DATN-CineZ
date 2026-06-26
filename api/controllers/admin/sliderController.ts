import { Request, Response } from "express";
import Slider from "../../models/sliderModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;
    const filter: any = {};
    if (active !== undefined) filter.active = active === "true";
    const sliders = await Slider.find(filter).sort({ order: 1, createdAt: -1 });
    res.status(200).json(sliders);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách slider", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      res.status(404).json({ message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json(slider);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết slider", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newSlider = new Slider(req.body);
    const saved = await newSlider.save();
    res.status(201).json({ message: "Thêm slider thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo slider", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json({ message: "Cập nhật slider thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật slider", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Slider.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy slider" });
      return;
    }
    res.status(200).json({ message: "Xóa slider thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa slider", error: error.message });
  }
};

export const reorder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
      return;
    }
    for (const item of items) {
      await Slider.findByIdAndUpdate(item._id, { order: item.order });
    }
    res.status(200).json({ message: "Sắp xếp slider thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi sắp xếp slider", error: error.message });
  }
};
