import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF"));
    }
  },
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh" });
      return;
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(500).json({
        success: false,
        message: "Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET trong .env)",
      });
      return;
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "cinez",
      resource_type: "image",
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: "Upload ảnh thành công",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || "Upload ảnh thất bại" });
  }
};
