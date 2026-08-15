import { Request, Response } from "express";
import Director from "../models/directorModel";

export const getDirectors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const directors = await Director.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: directors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDirectorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const director = await Director.findById(req.params.id);
    if (!director) {
      res.status(404).json({ success: false, message: "Không tìm thấy đạo diễn" });
      return;
    }
    res.status(200).json({ success: true, data: director });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
