// Các type / enum dùng chung cho toàn bộ API (CGZ clone)
// Mongoose Document interfaces nằm cạnh từng model (xem models/*.ts).

export type Role = "user" | "admin" | "staff";

export type BookingStatus = "pending" | "paid" | "cancelled";

export type PaymentMethod = "momo" | "zalopay" | "vnpay" | "credit_card" | "cash";

// Format chuẩn envelope trả về cho client
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
