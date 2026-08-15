import { Request, Response } from "express";
import https from "https";
import http from "http";

export const proxyImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).json({ success: false, message: "Missing url param" });
      return;
    }

    const urlObj = new URL(imageUrl);
    const mod = urlObj.protocol === "https:" ? https : http;

    mod
      .get(
        imageUrl,
        { headers: { "User-Agent": "CineZ/1.0", Referer: "https://cinez.app" } },
        (proxyRes) => {
          const contentType = proxyRes.headers["content-type"] || "image/jpeg";
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "public, max-age=86400");
          proxyRes.pipe(res);
        }
      )
      .on("error", () => {
        res.redirect("https://via.placeholder.com/500x750?text=No+Image");
      });
  } catch {
    res.redirect("https://via.placeholder.com/500x750?text=No+Image");
  }
};
