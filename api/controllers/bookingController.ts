import { Request, Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";
import Promotion from "../models/promotionModel";
import {
  acquireShowtimeLock,
  releaseShowtimeLock,
  holdSeatsAtomic,
  nowPlusHold,
} from "../services/seatReservationService";

/** Số ghế tối đa được đặt trong một lần (1 booking). */
export const MAX_SEATS_PER_BOOKING = 8;

/**
 * Kiểm tra danh sách ghế hợp lệ trước khi giữ ghế:
 * - không rỗng
 * - không quá MAX_SEATS_PER_BOOKING ghế
 * - không bị trùng lặp
 * - không vượt số ghế trống hiện có của suất chiếu
 * Trả về message lỗi hoặc null nếu hợp lệ.
 */
const validateSeatRequest = (seats: unknown, availableCount: number): string | null => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return "Chưa chọn ghế";
  }
  if (seats.length > MAX_SEATS_PER_BOOKING) {
    return `Mỗi lần đặt tối đa ${MAX_SEATS_PER_BOOKING} ghế (bạn đang chọn ${seats.length} ghế)`;
  }
  if (new Set(seats.map((s) => String(s))).size !== seats.length) {
    return "Danh sách ghế bị trùng lặp, vui lòng chọn lại";
  }
  if (seats.length > availableCount) {
    return `Suất chiếu chỉ còn ${availableCount} ghế trống`;
  }
  return null;
};

/**
 * API 1 — Giữ ghế tạm thời (15 phút):
 * POST /api/bookings/hold { showtime, seats }
 * - Redis Lock (SET NX EX 900) tuần tự hóa: 1 thời điểm chỉ 1 user xử lý 1 suất.
 * - Atomic conditional update: chỉ giữ khi TẤT CẢ ghế vẫn AVAILABLE -> chống 2 người chọn trùng.
 */
export const holdBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { showtime, showtimeId, seats } = req.body;
    const showtimeIdStr = showtime || showtimeId; // showtime là chuẩn; showtimeId giữ để tương thích client cũ
    if (!showtimeIdStr) {
      res.status(400).json({ success: false, message: "Thiếu thông tin suất chiếu" });
      return;
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      res.status(400).json({ success: false, message: "Chưa chọn ghế để giữ" });
      return;
    }
    const st = await Showtime.findById(showtimeIdStr);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }
    const seatError = validateSeatRequest(seats, st.availableSeats?.length ?? 0);
    if (seatError) {
      res.status(400).json({ success: false, message: seatError });
      return;
    }

    await acquireShowtimeLock(String(showtimeIdStr));
    const grabbed = await holdSeatsAtomic(String(showtimeIdStr), seats);
    await releaseShowtimeLock(String(showtimeIdStr));

    if (!grabbed) {
      res.status(409).json({
        success: false,
        message: "Một số ghế vừa được người khác chọn. Vui lòng chọn ghế khác.",
        conflictSeats: seats,
      });
      return;
    }

    const holdExpiresAt = nowPlusHold();
    const booking = await Booking.create({
      user: req.user?.id,
      showtime: showtimeIdStr,
      seats,
      totalPrice: st.price * seats.length,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "hold",
      holdExpiresAt,
    });

    res.status(201).json({
      success: true,
      message: `Đã giữ ghế ${seats.length} trong 15 phút. Hãy thanh toán trước khi hết hạn.`,
      data: booking,
      holdExpiresAt,
      expiresInSeconds: Math.round((holdExpiresAt.getTime() - Date.now()) / 1000),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { showtime, showtimeId, seats, combos, totalPrice, paymentMethod, promoCode } = req.body;
    const showtimeIdStr = showtime || showtimeId;
    if (!showtimeIdStr) {
      res.status(400).json({ success: false, message: "Thiếu thông tin suất chiếu" });
      return;
    }
    const st = await Showtime.findById(showtimeIdStr);
    if (!st) {
      res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
      return;
    }

    // Giữ ghế: atomic conditional update (chống race — 2 user chọn cùng ghế cùng lúc)
    if (seats && Array.isArray(seats) && seats.length > 0) {
      const seatError = validateSeatRequest(seats, st.availableSeats?.length ?? 0);
      if (seatError) {
        res.status(400).json({ success: false, message: seatError });
        return;
      }
      await acquireShowtimeLock(String(showtimeIdStr));
      const grabbed = await holdSeatsAtomic(String(showtimeIdStr), seats);
      await releaseShowtimeLock(String(showtimeIdStr));
      if (!grabbed) {
        res.status(409).json({
          success: false,
          message: "Một số ghế vừa được người khác chọn. Vui lòng chọn lại.",
          conflictSeats: seats,
        });
        return;
      }
    }

    // Tính giá: tiền ghế + tiền combo (đã chọn từ màn hình bắp nước)
    const seatPrice = st.price * (seats?.length ?? 0);
    const comboPrice = Array.isArray(combos)
      ? combos.reduce((sum: number, c: any) => sum + (c.price || 0) * (c.quantity || 1), 0)
      : 0;

    const rawTotal = seatPrice + comboPrice;

    // Áp dụng mã giảm giá nếu có
    let discount = 0;
    let appliedPromotionId: mongoose.Types.ObjectId | undefined = undefined;
    let finalPromoCode = "";

    if (promoCode) {
      const promo = await Promotion.findOne({ code: (promoCode as string).toUpperCase(), active: true });
      if (promo) {
        const now = new Date();
        if (now >= promo.startDate && now <= promo.endDate) {
          if (promo.usageLimit === 0 || promo.usedCount < promo.usageLimit) {
            if (rawTotal >= promo.minOrderValue) {
              if (promo.discountType === "percent") {
                discount = Math.round((rawTotal * promo.discountValue) / 100);
                if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
                  discount = promo.maxDiscount;
                }
              } else {
                discount = promo.discountValue;
              }
              appliedPromotionId = promo._id;
              finalPromoCode = promo.code;
              await Promotion.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
            }
          }
        }
      }
    }

    const finalTotal = Math.max(0, rawTotal - discount);
    const isPaidImmediately = paymentMethod === "cash";

    const booking = await Booking.create({
      user: req.user?.id,
      showtime: showtimeIdStr,
      seats,
      combos: combos || [],
      totalPrice: finalTotal,
      status: isPaidImmediately ? "paid" : "pending",
      paymentStatus: isPaidImmediately ? "completed" : "pending",
      paymentMethod: paymentMethod || "cash",
      promoCode: finalPromoCode,
      discount,
      appliedPromotion: appliedPromotionId,
      holdExpiresAt: isPaidImmediately ? undefined : nowPlusHold(),
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lịch sử vé của người dùng đang đăng nhập
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?.id })
      .populate("showtime")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const fixPosterUrl = (url: string): string => {
  if (!url) return "";
  return url.replace("media.themoviedb.org", "image.tmdb.org");
};

// Lịch sử vé (mobile app gọi /my-history)
export const getMyBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const history = await Booking.find({ user: userId })
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title poster_url duration" },
      })
      .sort({ createdAt: -1 });
    const data = history.map((b) => {
      const obj: any = b.toObject();
      const movie = obj.showtime?.movie || {};
      if (movie.poster_url) {
        movie.poster_url = fixPosterUrl(movie.poster_url);
      }
      obj.moviePoster = movie.poster_url || "";
      return obj;
    });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
};

// Hủy đơn đang chờ thanh toán (pending) và hoàn ghế
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
      return;
    }
    if (String(booking.user) !== String(userId)) {
      res.status(403).json({ success: false, message: "Bạn không có quyền hủy đơn này." });
      return;
    }
    if (booking.status !== "pending") {
      res.status(400).json({ success: false, message: "Đơn này không ở trạng thái có thể hủy." });
      return;
    }
    // Hoàn ghế
    if (booking.seats && booking.seats.length > 0) {
      await Showtime.findByIdAndUpdate(booking.showtime, {
        $addToSet: { availableSeats: { $each: booking.seats } },
      });
    }
    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();
    res.status(200).json({ success: true, message: "Đã hủy đơn và hoàn ghế." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy đơn", error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("showtime")
      .populate("user", "fullName email phone");
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn vé" });
      return;
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};