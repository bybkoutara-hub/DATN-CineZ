import { Request, Response } from "express";
import Room from "../models/roomModel";

// Danh sách phòng chiếu
export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find({ status: "active" }).sort({ name: 1 });
    res.status(200).json({ success: true, data: rooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ name: req.params.name });
    if (!room) {
      res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
      return;
    }
    res.status(200).json({ success: true, data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
