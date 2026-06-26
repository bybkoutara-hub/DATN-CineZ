import { Request, Response } from "express";
import AdminMovie from "../../models/admin/adminMovieModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };
    const movies = await AdminMovie.find(filter).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách phim", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = await AdminMovie.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json(movie);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết phim", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const newMovie = new AdminMovie(req.body);
    const saved = await newMovie.save();
    res.status(201).json({ message: "Đã thêm phim mới vào hệ thống!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Không thể thêm phim mới", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AdminMovie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json({ message: "Cập nhật thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật phim", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AdminMovie.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy phim" });
      return;
    }
    res.status(200).json({ message: "Đã xóa phim thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa phim", error: error.message });
  }
};
