import { Request, Response } from "express";
import Room from "../../models/roomModel";
import Seat from "../../models/seatModel";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách phòng", error: error.message });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: "Không tìm thấy phòng" });
      return;
    }
    res.status(200).json(room);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy chi tiết phòng", error: error.message });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.rows_count && data.seats_per_row && !data.totalSeats) {
      data.totalSeats = data.rows_count * data.seats_per_row;
    }
    const newRoom = new Room(data);
    const saved = await newRoom.save();
    res.status(201).json({ message: "Thêm phòng thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo phòng", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy phòng" });
      return;
    }
    res.status(200).json({ message: "Cập nhật phòng thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật phòng", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy phòng" });
      return;
    }
    await Seat.deleteMany({ room: req.params.id });
    res.status(200).json({ message: "Xóa phòng thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa phòng", error: error.message });
  }
};
