import { Request, Response } from "express";
import Genre from "../models/genreModel";

export const getGenres = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: genres });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      res.status(404).json({ success: false, message: "Không tìm thấy thể loại" });
      return;
    }
    res.status(200).json({ success: true, data: genre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
