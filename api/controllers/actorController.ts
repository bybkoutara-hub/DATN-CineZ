import { Request, Response } from "express";
import Actor from "../models/actorModel";

export const getActors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const actors = await Actor.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: actors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const actor = await Actor.findById(req.params.id);
    if (!actor) {
      res.status(404).json({ success: false, message: "Không tìm thấy diễn viên" });
      return;
    }
    res.status(200).json({ success: true, data: actor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
