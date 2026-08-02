import { Resend } from "resend";
import QRCode from "qrcode";
import Booking from "../models/bookingModel";

const formatVnd = (value: number): string => `${(value || 0).toLocaleString("vi-VN")} đ`;

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

/** Sinh mã QR vé dạng PNG buffer (nhúng email qua CID để Gmail hiển thị). */
const generateTicketQr = async (data: {
  bookingId: string;
  seats: string[];
  roomName: string;
  showtime: string;
}): Promise<Buffer | null> => {
  try {
    const payload = JSON.stringify({
      type: "CINEZ_TICKET",
      bookingId: data.bookingId,
      seats: data.seats,
      roomName: data.roomName,
      showtime: data.showtime,
    });
    return await QRCode.toBuffer(payload, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (err: any) {
    console.error(`🚨 [Email]: Lỗi sinh mã QR: ${err.message}`);
    return null;
  }
};

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
  hasQr: boolean;
}): string => {
  const comboRows = data.combos.length
    ? data.combos
        .map(
          (c) =>
            `<tr><td style="padding:4px 0;color:#444;">${c.name} x ${c.quantity}</td>
             <td style="padding:4px 0;text-align:right;color:#444;">${formatVnd(c.price * c.quantity)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="padding:4px 0;color:#888;">Không có combo</td></tr>`;

  const qrBlock = data.hasQr
    ? `
      <div style="margin-top:20px;background:#f6f6f6;border-radius:10px;padding:14px;text-align:center;">
        <p style="margin:0 0 8px;color:#888;font-size:13px;">QUÉT MÃ QR ĐỂ SOÁT VÉ</p>
        <img src="cid:ticketQr" alt="Mã QR vé" width="180" height="180" style="width:180px;height:180px;border-radius:8px;background:#fff;padding:8px;border:1px solid #e0e0e0;" />
        <p style="margin:8px 0 0;color:#888;font-size:13px;">Mã đặt vé</p>
        <p style="margin:4px 0 0;color:#111;font-size:18px;font-weight:bold;letter-spacing:1px;">${data.bookingId}</p>
      </div>`
    : `
      <div style="margin-top:20px;background:#f6f6f6;border-radius:10px;padding:14px;text-align:center;">
        <p style="margin:0;color:#888;font-size:13px;">MÃ ĐẶT VÉ</p>
        <p style="margin:4px 0 0;color:#111;font-size:18px;font-weight:bold;letter-spacing:1px;">${data.bookingId}</p>
      </div>`;

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
            <p style="margin:2px 0;color:#555;font-size:14px;">🏢 ${data.roomName}</p>
            <p style="margin:2px 0;color:#555;font-size:14px;">🕐 ${data.showtime}</p>
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

        ${qrBlock}

        <p style="margin-top:20px;color:#888;font-size:13px;">Vui lòng đưa mã QR này tại quầy soát vé để nhận vé. Chúc bạn xem phim vui vẻ! 🍿</p>
      </div>
      <div style="background:#111;padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#777;font-size:12px;">CineZ Cinema — Email tự động, vui lòng không trả lời.</p>
      </div>
    </div>
  </div>`;
};

export const sendBookingConfirmationEmail = async (bookingId: string): Promise<boolean> => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ [Email]: Thiếu RESEND_API_KEY, bỏ qua gửi email.");
      return false;
    }

    const resend = new Resend(apiKey);

    const booking: any = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate({
        path: "showtimeId",
        populate: { path: "movieId", select: "title poster_url duration" },
      });

    if (!booking) {
      console.warn(`⚠️ [Email]: Không tìm thấy booking ${bookingId}`);
      return false;
    }

    const user = booking.user || {};
    if (!user.email) {
      console.warn(`⚠️ [Email]: Booking ${bookingId} không có email người dùng.`);
      return false;
    }

    const showtime = booking.showtimeId || {};
    const movie = showtime.movieId || {};
    const showtimeText = formatShowtime(showtime.startTime);

    const qrBuffer = await generateTicketQr({
      bookingId: String(booking._id),
      seats: booking.seats || [],
      roomName: showtime.roomName || "Phòng chiếu CineZ",
      showtime: showtimeText,
    });

    if (qrBuffer && !booking.qrCode) {
      await Booking.findByIdAndUpdate(booking._id, {
        qrCode: `data:image/png;base64,${qrBuffer.toString("base64")}`,
      });
    }

    const html = buildEmailHtml({
      customerName: user.name || "Quý khách",
      movieTitle: movie.title || "Vé xem phim",
      poster: movie.poster_url || "",
      roomName: showtime.roomName || "Phòng chiếu CineZ",
      showtime: showtimeText,
      seats: booking.seats || [],
      combos: booking.combos || [],
      totalPrice: booking.totalPrice || 0,
      bookingId: String(booking._id),
      paymentMethod: booking.paymentMethod || "Tiền mặt tại quầy",
      hasQr: !!qrBuffer,
    });

    const from = process.env.MAIL_FROM || "CineZ <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: [user.email],
      subject: `🎬 Xác nhận đặt vé — ${movie.title || "CineZ"}`,
      html,
      attachments: qrBuffer
        ? [{ filename: "ticket-qr.png", content: qrBuffer.toString("base64"), contentId: "ticketQr" }]
        : undefined,
    });

    if (error) {
      console.error(`🚨 [Email]: Gửi thất bại:`, error);
      return false;
    }

    console.log(`✅ [Email]: Đã gửi xác nhận đặt vé (kèm QR) tới ${user.email}`);
    return true;
  } catch (error: any) {
    console.error(`🚨 [Email]: Lỗi gửi email: ${error.message}`);
    return false;
  }
};
