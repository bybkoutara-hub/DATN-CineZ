import express from "express";
import Movie from "../models/movieModel";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

const fixPosterUrl = (url: string): string => {
  if (!url) return "";
  return url.replace("media.themoviedb.org", "image.tmdb.org");
};

router.get("/movies", async (req, res) => {
  try {
    const { status, genre, search } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (genre) filter.genres = { $in: [genre] };
    if (search) {
      filter.title = { $regex: String(search), $options: "i" } as any;
    }
    const movies = await Movie.find(filter).sort({ release_date: -1 });
    const data = movies.map((m) => {
      const obj = m.toObject();
      obj.poster_url = fixPosterUrl(obj.poster_url);
      return obj;
    });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi lấy phim mobile", error: error.message });
  }
});

router.post("/bookings", protect, async (req, res) => {
  try {
    const { showtime, seats, combos, totalPrice } = req.body;
    const st = await Showtime.findById(showtime);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    const booking = await Booking.create({
      user: req.user?.id,
      showtime,
      seats,
      combos: combos || [],
      totalPrice,
      status: "paid",
      paymentStatus: "completed",
      paymentMethod: "cash",
    });
    res.status(201).json({ success: true, message: "Đặt vé xem phim thành công!", data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi xử lý đặt vé", error: error.message });
  }
});

export default router;
