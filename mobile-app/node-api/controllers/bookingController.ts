import { type Response } from "express";
import Booking from "../models/bookingModel.js"; // Đảm bảo bạn đã có bookingModel
import Showtime from "../models/showtimeModel.js"; // Cần gọi Showtime để cập nhật/trừ ghế trống
import { sendBookingConfirmationEmail } from "../utils/sendBookingEmail.js"; // Gửi email xác nhận

/**
 * Trả các ghế đã giữ về lại suất chiếu (thao tác nguyên tử, chống trùng/mất ghế).
 */
const returnSeats = async (showtimeId: any, seats: string[]): Promise<void> => {
  if (!seats || seats.length === 0) return;
  await Showtime.updateOne(
    { _id: showtimeId },
    { $addToSet: { availableSeats: { $each: seats } } }
  );
};

/**
 * @desc    Tạo đơn đặt vé xem phim mới (Giữ ghế nguyên tử + Tính tiền tại server)
 * @route   POST /api/bookings
 * @access  Private (Yêu cầu Token Đăng nhập)
 */
export const createBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const { showtimeId, seats, combos } = req.body;
    const userId = req.user?.id; // Lấy ID người dùng từ Middleware verifyToken gửi xuống
    if (!userId) {
      res.status(401).json({ success: false, message: "Phiên đăng nhập không hợp lệ." });
      return;
    }

    // 1. Kiểm tra dữ liệu đầu vào cơ bản
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      res.status(400).json({ success: false, message: "Vui lòng chọn suất chiếu và ít nhất một ghế ngồi." });
      return;
    }

    // 2. Lấy suất chiếu để xác thực tồn tại và lấy GIÁ VÉ CHUẨN từ server
    const showtime: any = await Showtime.findById(showtimeId);
    if (!showtime) {
      res.status(404).json({ success: false, message: "Suất chiếu không tồn tại hoặc đã bị hủy." });
      return;
    }

    // 3. Tính tiền tại SERVER, KHÔNG tin totalPrice client gửi lên (chống giả mạo giá).
    //    - Tiền vé = giá suất chiếu × số ghế.
    //    - Tiền combo = tổng (giá × số lượng) từ danh sách combo (lọc hợp lệ).
    const safeCombos = (Array.isArray(combos) ? combos : [])
      .filter(
        (c: any) =>
          c &&
          typeof c.price === "number" &&
          c.price >= 0 &&
          typeof c.quantity === "number" &&
          c.quantity > 0
      )
      .map((c: any) => ({
        name: String(c.name || "Combo"),
        quantity: Math.floor(c.quantity),
        price: c.price,
      }));
    const comboTotal = safeCombos.reduce((sum: number, c: any) => sum + c.price * c.quantity, 0);
    const ticketTotal = (showtime.price || 0) * seats.length;
    const serverTotal = ticketTotal + comboTotal;

    // 4. Xác định phương thức thanh toán & trạng thái vé:
    //    - VNPay: vé "pending" (giữ ghế), chờ thanh toán online thành công mới chuyển "completed".
    //    - Tiền mặt tại quầy: vé "completed" ngay, trả tiền khi đến rạp + gửi email luôn.
    const isVnpay = String(req.body.paymentMethod || "cash").toLowerCase() === "vnpay";
    const bookingStatus = isVnpay ? "pending" : "completed";
    const paymentMethodLabel = isVnpay ? "VNPay" : "Tiền mặt tại quầy";

    // 5. GIỮ GHẾ NGUYÊN TỬ: chỉ trừ ghế khi TẤT CẢ ghế còn trống ($all + $pull).
    //    Cách này an toàn với nhiều người đặt cùng lúc, không cần transaction/replica set.
    const reserved = await Showtime.findOneAndUpdate(
      { _id: showtimeId, availableSeats: { $all: seats } },
      { $pull: { availableSeats: { $in: seats } } },
      { new: true }
    );
    if (!reserved) {
      res.status(400).json({
        success: false,
        message: "Một hoặc nhiều ghế bạn vừa chọn đã có người khác đặt nhanh hơn. Vui lòng chọn ghế khác!",
      });
      return;
    }

    // 6. Tạo vé. Nếu tạo lỗi -> hoàn lại ghế đã giữ để tránh khóa ghế.
    let newBooking: any;
    try {
      newBooking = await Booking.create({
        userId,
        showtimeId,
        seats,
        combos: safeCombos,
        totalPrice: serverTotal,
        status: bookingStatus,
        paymentMethod: paymentMethodLabel,
      });
    } catch (createErr) {
      await returnSeats(showtimeId, seats);
      throw createErr;
    }

    // 7. Vé tiền mặt hoàn tất ngay -> gửi email xác nhận (không chặn phản hồi).
    if (!isVnpay) {
      sendBookingConfirmationEmail(String(newBooking._id));
    }

    const message = isVnpay
      ? "Đã giữ ghế, vui lòng thanh toán qua VNPay để hoàn tất."
      : "Đặt vé xem phim thành công!";
    res.status(201).json({ success: true, message, data: newBooking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đặt vé", error: error.message });
  }
};

/**
 * @desc    Hủy một đơn đặt vé đang chờ thanh toán (pending) và trả ghế lại
 * @route   POST /api/bookings/:id/cancel
 * @access  Private (Yêu cầu Token Đăng nhập)
 */
export const cancelBooking = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking: any = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt vé." });
      return;
    }
    if (String(booking.userId) !== String(userId)) {
      res.status(403).json({ success: false, message: "Bạn không có quyền hủy đơn này." });
      return;
    }

    // Chỉ hủy được đơn đang chờ thanh toán; cập nhật nguyên tử để tránh hủy 2 lần.
    const cancelled = await Booking.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status: "cancelled" },
      { new: true }
    );
    if (!cancelled) {
      res.status(400).json({ success: false, message: "Đơn này không ở trạng thái có thể hủy." });
      return;
    }

    await returnSeats(booking.showtimeId, booking.seats || []);
    res.status(200).json({ success: true, message: "Đã hủy đơn và hoàn ghế." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy đơn", error: error.message });
  }
};

/**
 * @desc    Lấy lịch sử danh sách các vé đã đặt của người dùng hiện tại
 * @route   GET /api/bookings/my-history
 * @access  Private (Yêu cầu Token Đăng nhập)
 */
export const MyBookingsHistory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    // Tìm lịch sử đặt vé và thực hiện .populate() để lôi toàn bộ thông tin Phim, Giờ chiếu, Rạp chiếu ra hiển thị lên UI Mobile
    const history = await Booking.find({ userId })
      .populate({
        path: "showtimeId",
        populate: {
          path: "movieId", // Lấy luôn thông tin chi tiết của bộ phim đó (Tên phim, Poster...)
          select: "title poster_url duration"
        }
      })
      .sort({ createdAt: -1 }); // Vé mới đặt xếp lên hàng đầu

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy lịch sử đặt vé", error: error.message });
  }
};
