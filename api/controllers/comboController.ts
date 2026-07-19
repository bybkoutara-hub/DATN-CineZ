import { Request, Response } from "express";
import Combo from "../models/comboModel";

// Danh sách bắp nước / combo
export const getCombos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const combos = await Combo.find();
    res.status(200).json({ success: true, data: combos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const combo = await Combo.create(req.body);
    res.status(201).json({ success: true, data: combo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
