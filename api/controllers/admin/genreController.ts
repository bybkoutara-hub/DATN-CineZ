import { Request, Response } from "express";
import Genre from "../../models/genreModel";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json(genres);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách thể loại", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      res.status(404).json({ message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json(genre);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết thể loại", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newGenre = new Genre(req.body);
    const saved = await newGenre.save();
    res.status(201).json({ message: "Thêm thể loại thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo thể loại", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json({ message: "Cập nhật thể loại thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật thể loại", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Genre.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json({ message: "Xóa thể loại thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa thể loại", error: error.message });
  }
};
