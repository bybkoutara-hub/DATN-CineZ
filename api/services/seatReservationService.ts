import mongoose from "mongoose";
import Redis from "ioredis";
import Booking from "../models/bookingModel";
import Showtime from "../models/showtimeModel";

/**
 * Seat Reservation Service — Giữ ghế tạm thời & Chống trùng ghế khi thanh toán.
 *
 * CƠ CHẾ LOCKING (2 lớp):
 * 1. Redis Lock (lớp ngoài — tuần tự hóa): SET lock:hold:{showtimeId} NX EX 900
 *    - Đảm bảo tại 1 thời điểm chỉ 1 tiến trình xử lý giữ ghế cho 1 suất chiếu.
 *    - TTL 15 phút = holdExpiresAt, Redis tự xóa khóa khi hết hạn (Expired Keys).
 *    - Nếu Redis không khả dụng (demo/dev local): tự động fallback, vẫn an toàn nhờ lớp 2.
 * 2. Atomic Conditional Update (lớp trong — bảo đảm cuối cùng):
 *    Showtime.updateOne(
 *      { _id: showtimeId, availableSeats: { $all: seatIds }, status: "active" },
 *      { $pullAll: { availableSeats: seatIds } }
 *    )
 *    - Tương đương SELECT ... FOR UPDATE: nếu modifiedCount === 1 nghĩa là tất cả ghế
 *      vẫn AVAILABLE tại thời điểm ghi → giành được ghế. Ngược lại có ghế vừa bị
 *      user khác lấy → từ chối. Không có read-modify-write race.
 * 3. Sweeper (cron/interval): quét booking PENDING quá holdExpiresAt → nhả ghế,
 *    dùng atomic transition (pending -> cancelled) để không đụng webhook đang confirm.
 */

export const HOLD_DURATION_MS = 15 * 60 * 1000; // 15 phút
const LOCK_TTL_SECONDS = 15 * 60; // 900s = 15 phút (khớp holdExpiresAt)
const SWEEP_INTERVAL_MS = 30 * 1000; // quét mỗi 30 giây

let redis: Redis | null = null;
let isRedisAvailable = false;
let sweeperTimer: NodeJS.Timeout | null = null;

export const initSeatReservation = (): void => {
  try {
    redis = new Redis({
      port: Number(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST || "127.0.0.1",
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 2 ? null : Math.min(times * 200, 1000)),
    });
    redis.on("connect", () => {
      isRedisAvailable = true;
      console.log("[Redis]: Kết nối thành công — Seat Lock hoạt động.");
    });
    redis.on("error", (err: any) => {
      if (isRedisAvailable) console.error("[Redis]: Mất kết nối, fallback sang DB lock:", err.message);
      isRedisAvailable = false;
    });
    redis.connect().catch(() => {
      isRedisAvailable = false;
      console.warn("[Redis]: Không khả dụng (máy chưa chạy Redis) — vẫn an toàn nhờ atomic update MongoDB.");
    });
  } catch {
    isRedisAvailable = false;
  }

  if (!sweeperTimer) {
    sweeperTimer = setInterval(sweepExpiredHolds, SWEEP_INTERVAL_MS);
    console.log(`[SeatHold]: Sweeper quét booking hết hạn mỗi ${SWEEP_INTERVAL_MS / 1000}s, giữ ghế ${HOLD_DURATION_MS / 60000} phút.`);
  }
};

export const shutdownSeatReservation = (): void => {
  if (sweeperTimer) clearInterval(sweeperTimer);
  sweeperTimer = null;
  redis?.disconnect();
  redis = null;
};

/** Lớp 1: Redis lock (SET NX EX). Trả về true nếu giành được khóa hoặc không có Redis. */
export const acquireShowtimeLock = async (showtimeId: string): Promise<boolean> => {
  if (!isRedisAvailable || !redis) return true;
  try {
    const result = await redis.set(`lock:hold:${showtimeId}`, "1", "EX", LOCK_TTL_SECONDS, "NX");
    return result === "OK";
  } catch {
    return true; // Redis lỗi đột xuất -> để atomic update DB quyết định
  }
};

export const releaseShowtimeLock = async (showtimeId: string): Promise<void> => {
  if (!isRedisAvailable || !redis) return;
  try {
    await redis.del(`lock:hold:${showtimeId}`);
  } catch {
    /* noop */
  }
};

/** Lớp 2: Atomic conditional update — giành ghế chỉ khi TẤT CẢ vẫn AVAILABLE. */
export const holdSeatsAtomic = async (showtimeId: string, seatIds: string[]): Promise<boolean> => {
  const result = await Showtime.updateOne(
    { _id: showtimeId, status: "active", availableSeats: { $all: seatIds } },
    { $pullAll: { availableSeats: seatIds } }
  );
  return result.modifiedCount === 1; // =1 giành được ghế, =0 là ghế đã bị lấy
};

/** Nhả ghế (đã được giữ/hold) trở lại AVAILABLE. */
export const releaseSeats = async (showtimeId: any, seatIds: string[]): Promise<void> => {
  if (!seatIds || seatIds.length === 0 || !showtimeId) return;
  try {
    await Showtime.updateOne(
      { _id: showtimeId },
      { $addToSet: { availableSeats: { $each: seatIds } } }
    );
  } catch (err: any) {
    console.error("[SeatHold]: Lỗi nhả ghế:", err.message);
  }
};

export const nowPlusHold = (): Date => new Date(Date.now() + HOLD_DURATION_MS);

/** Đếm nghịch cảnh hết hạn cho client. */
export const secondsUntilHoldExpiry = (holdExpiresAt?: Date): number =>
  holdExpiresAt ? Math.max(0, Math.round((holdExpiresAt.getTime() - Date.now()) / 1000)) : 0;

/**
 * API 2 — Sweeper: tự động nhả ghế của booking PENDING đã quá holdExpiresAt.
 * Atomic transition (pending -> cancelled): chỉ tiến trình nào chuyển được mới nhả ghế,
 * tránh đụng webhook đang confirm (pending -> paid) hoặc webhook refund (pending -> refunded).
 */
export const sweepExpiredHolds = async (): Promise<number> => {
  try {
    const now = new Date();
    const expired = await Booking.find({
      status: "pending",
      paymentStatus: "pending",
      holdExpiresAt: { $ne: null, $lte: now },
    }).select("_id showtime seats holdExpiresAt");

    let released = 0;
    for (const booking of expired) {
      const claimed = await Booking.updateOne(
        { _id: booking._id, status: "pending" },
        { status: "cancelled", paymentStatus: "cancelled" }
      );
      if (claimed.modifiedCount === 1) {
        await releaseSeats(booking.showtime, booking.seats || []);
        console.log(`[SeatHold][Sweep]: Booking ${booking._id} hết hạn giữ ghế (${booking.holdExpiresAt}) -> nhả ${(booking.seats || []).length} ghế.`);
        released++;
      }
    }
    if (released > 0) console.log(`[SeatHold][Sweep]: Đã nhả ghế cho ${released} booking hết hạn.`);
    return released;
  } catch (err: any) {
    console.error("[SeatHold][Sweep]: Lỗi quét:", err.message);
    return 0;
  }
};
