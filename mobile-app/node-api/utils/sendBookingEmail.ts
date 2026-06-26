// ==========================================
// GỬI EMAIL XÁC NHẬN ĐẶT VÉ (RESEND API)
// ==========================================
// Dùng fetch tới REST API của Resend, không cần thêm thư viện.
import Booking from "../models/bookingModel.js";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Định dạng số tiền sang dạng "120.000 đ". */
const formatVnd = (value: number): string =>
  `${(value || 0).toLocaleString("vi-VN")} đ`;

/** Định dạng thời gian suất chiếu sang giờ Việt Nam. */
const formatShowtime = (iso?: string | Date): string => {
  if (!iso) return "Đang cập nhật";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Đang cập nhật";
  }
};

/** Dựng nội dung HTML cho email vé. */
const buildEmailHtml = (data: {
  customerName: string;
  movieTitle: string;
  poster: string;
  roomName: string;
  showtime: string;
  seats: string[];
  combos: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  bookingId: string;
  paymentMethod: string;
}): string => {
  const comboRows = data.combos.length
    ? data.combos
        .map(
          (c) =>
            `<tr><td style="padding:4px 0;color:#444;">${c.name} × ${c.quantity}</td>
             <td style="padding:4px 0;text-align:right;color:#444;">${formatVnd(c.price * c.quantity)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="padding:4px 0;color:#888;">Không có combo</td></tr>`;

  return `
  <div style="background:#0d0d0d;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:#E2A43B;padding:20px 24px;">
        <h1 style="margin:0;color:#000;font-size:20px;">🎬 CineZ — Xác nhận đặt vé</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:15px;color:#222;">Xin chào <b>${data.customerName}</b>,</p>
        <p style="font-size:15px;color:#444;">Cảm ơn bạn đã đặt vé tại CineZ. Đơn đặt vé của bạn đã được xác nhận thành công!</p>

        <div style="display:flex;gap:16px;margin:20px 0;">
          ${
            data.poster
              ? `<img src="${data.poster}" alt="poster" width="100" style="width:100px;border-radius:10px;object-fit:cover;" />`
              : ""
          }
          <div>
            <h2 style="margin:0 0 8px;font-size:18px;color:#111;">${data.movieTitle}</h2>
            <p style="margin:2px 0;color:#555;font-size:14px;">🏟️ ${data.roomName}</p>
            <p style="margin:2px 0;color:#555;font-size:14px;">🕒 ${data.showtime}</p>
            <p style="margin:2px 0;color:#555;font-size:14px;">💺 Ghế: <b>${data.seats.join(", ") || "--"}</b></p>
          </div>
        </div>

        <table style="width:100%;border-top:1px solid #eee;border-bottom:1px solid #eee;padding:8px 0;font-size:14px;border-collapse:collapse;">
          ${comboRows}
        </table>

        <table style="width:100%;margin-top:16px;font-size:15px;">
          <tr>
            <td style="color:#444;">Phương thức thanh toán</td>
            <td style="text-align:right;color:#444;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="color:#111;font-weight:bold;padding-top:8px;font-size:17px;">Tổng cộng</td>
            <td style="text-align:right;color:#E2A43B;font-weight:bold;padding-top:8px;font-size:17px;">${formatVnd(data.totalPrice)}</td>
          </tr>
        </table>

        <div style="margin-top:20px;background:#f6f6f6;border-radius:10px;padding:14px;text-align:center;">
          <p style="margin:0;color:#888;font-size:13px;">Mã đặt vé</p>
          <p style="margin:4px 0 0;color:#111;font-size:18px;font-weight:bold;letter-spacing:1px;">${data.bookingId}</p>
        </div>

        <p style="margin-top:20px;color:#888;font-size:13px;">Vui lòng đưa mã đặt vé này tại quầy để nhận vé. Chúc bạn xem phim vui vẻ! 🍿</p>
      </div>
      <div style="background:#111;padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#777;font-size:12px;">© CineZ Cinema · Email tự động, vui lòng không trả lời.</p>
      </div>
    </div>
  </div>`;
};

/**
 * Gửi email xác nhận đặt vé. Tự populate đầy đủ thông tin từ bookingId.
 * Không ném lỗi ra ngoài để tránh làm hỏng luồng đặt vé — chỉ ghi log.
 */
export const sendBookingConfirmationEmail = async (bookingId: string): Promise<boolean> => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM || "CineZ <noreply@qlhtt.io.vn>";
    if (!apiKey) {
      console.warn("⚠️ [Email]: Thiếu RESEND_API_KEY, bỏ qua gửi email.");
      return false;
    }

    const booking: any = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate({
        path: "showtimeId",
        populate: { path: "movieId", select: "title poster_url duration" },
      });

    if (!booking) {
      console.warn(`⚠️ [Email]: Không tìm thấy booking ${bookingId}`);
      return false;
    }

    const user = booking.userId || {};
    if (!user.email) {
      console.warn(`⚠️ [Email]: Booking ${bookingId} không có email người dùng.`);
      return false;
    }

    const showtime = booking.showtimeId || {};
    const movie = showtime.movieId || {};

    const html = buildEmailHtml({
      customerName: user.name || "Quý khách",
      movieTitle: movie.title || "Vé xem phim",
      poster: movie.poster_url || "",
      roomName: showtime.roomName || "Phòng chiếu CineZ",
      showtime: formatShowtime(showtime.startTime),
      seats: booking.seats || [],
      combos: booking.combos || [],
      totalPrice: booking.totalPrice || 0,
      bookingId: String(booking._id),
      paymentMethod: booking.paymentMethod || "Tiền mặt tại quầy",
    });

    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: `🎬 Xác nhận đặt vé — ${movie.title || "CineZ"}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`🔴 [Email]: Gửi thất bại (${res.status}): ${errText}`);
      return false;
    }

    console.log(`🟢 [Email]: Đã gửi xác nhận đặt vé tới ${user.email}`);
    return true;
  } catch (error: any) {
    console.error(`🔴 [Email]: Lỗi gửi email: ${error.message}`);
    return false;
  }
};
