import type { Response } from "express";

// Helper thống nhất format JSON response theo pattern { success, data/message }
export const ok = (res: Response, data: unknown, message = "Thành công") =>
  res.status(200).json({ success: true, message, data });

export const created = (res: Response, data: unknown) =>
  res.status(201).json({ success: true, data });

export const fail = (res: Response, message: string, code = 400) =>
  res.status(code).json({ success: false, message });
