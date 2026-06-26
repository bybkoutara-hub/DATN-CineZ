import { Request, Response } from "express";
import Cinema from "../models/cinemaModel";

// Lấy danh sách cụm rạp (lọc theo thành phố nếu có ?city=)
export const getCinemas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city } = req.query;
    const filter = city ? { city: String(city) } : {};
    const cinemas = await Cinema.find(filter);
    res.status(200).json({ success: true, data: cinemas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCinemaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      res.status(404).json({ success: false, message: "Không tìm thấy rạp" });
      return;
    }
    res.status(200).json({ success: true, data: cinema });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: thêm cụm rạp
export const addCinema = async (req: Request, res: Response): Promise<void> => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({ success: true, data: cinema });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
