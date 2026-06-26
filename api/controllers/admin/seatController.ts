import { Request, Response } from "express";
import Seat from "../../models/seatModel";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room: roomId, type, status } = req.query;
    const filter: any = {};
    if (roomId) filter.room = roomId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    const seats = await Seat.find(filter).populate("room", "name").sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách ghế", error: error.message });
  }
};

export const getByRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const seats = await Seat.find({ room: req.params.roomId }).sort({ row: 1, number: 1 });
    res.status(200).json(seats);
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy ghế theo phòng", error: error.message });
  }
};

export const bulkCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room: roomId, seats: seatsData } = req.body;
    if (!roomId || !Array.isArray(seatsData) || seatsData.length === 0) {
      res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
      return;
    }
    await Seat.deleteMany({ room: roomId });
    const seatsToInsert = seatsData.map((s: any) => ({
      room: roomId,
      row: s.row,
      number: s.number,
      label: s.label || `${s.row}${s.number}`,
      type: s.type || "standard",
      status: s.status || "available",
      price: s.price || 0,
    }));
    const saved = await Seat.insertMany(seatsToInsert);
    res.status(201).json({ message: "Tạo ghế thành công!", data: saved });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi tạo ghế hàng loạt", error: error.message });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy ghế" });
      return;
    }
    res.status(200).json({ message: "Cập nhật ghế thành công!", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật ghế", error: error.message });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Seat.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy ghế" });
      return;
    }
    res.status(200).json({ message: "Xóa ghế thành công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xóa ghế", error: error.message });
  }
};
