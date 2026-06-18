import { Request, Response } from "express";
import Showtime from "../models/showtimeModel";

// Lấy suất chiếu theo phim ?movieId=...
export const getShowtimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.query;
    const filter: Record<string, unknown> = {};
    if (movieId) filter.movieId = movieId;
    filter.startTime = { $gte: new Date() }; // chỉ lấy suất sắp chiếu
    const showtimes = await Showtime.find(filter).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: showtimes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShowtimeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    res.status(200).json({ success: true, data: showtime });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
