import { Router, Request, Response, NextFunction } from "express";
import { protect, requireRole } from "../middlewares/auth.middleware";
import { upload, uploadImage } from "../controllers/uploadController";

const router = Router();

router.post(
  "/image",
  protect,
  requireRole("admin", "staff"),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message || "Upload ảnh thất bại" });
        return;
      }
      next();
    });
  },
  uploadImage
);

export default router;
