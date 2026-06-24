import api from "./api"; // Đường dẫn đến file cấu hình axios chung của bạn

// Hàm lấy thông tin suất chiếu (bao gồm danh sách ghế trống)
export const getShowtimeDetail = async (showtimeId: string) => {
  try {
    const response = await api.get(`/movies/showtimes/${showtimeId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching showtime detail:", error);
    throw error;
  }
};

// Tạo đơn đặt vé mới (gọi API có sẵn POST /bookings, yêu cầu token đăng nhập).
export const createBooking = async (payload: {
  showtimeId: string;
  seats: string[];
  combos?: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  paymentMethod?: string;
}) => {
  const response = await api.post("/bookings", payload);
  return response.data;
};

// Hủy một đơn đặt vé đang chờ thanh toán (pending) để hoàn ghế lại.
// Dùng khi người dùng hủy/đóng cổng thanh toán VNPay giữa chừng.
export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error: any) {
    // Không chặn luồng UI nếu hủy lỗi; backend còn cron/return tự dọn.
    console.warn("Hủy đơn pending lỗi:", error?.response?.data?.message || error.message);
    return null;
  }
};

// Lấy lịch sử các vé đã đặt của user hiện tại (yêu cầu token đăng nhập).
// Backend đã populate sẵn showtime -> movie nên có đủ tên phim, poster để hiển thị.
export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/my-history");
    return response.data.success ? response.data.data : [];
  } catch (error: any) {
    console.error("Lỗi lấy lịch sử vé:", error.message, error.response?.status);
    return [];
  }
};