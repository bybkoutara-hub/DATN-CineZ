// Các type / enum dùng chung cho toàn bộ API (CineZ clone)
// Mongoose Document interfaces nằm cạnh từng model (xem models/*.ts).

export type Role = "customer" | "admin" | "staff";

export type BookingStatus = "pending" | "paid" | "cancelled" | "completed" | "refunded";

export type PaymentMethod = "momo" | "zalopay" | "vnpay" | "credit_card" | "cash";

export type PaymentStatus = "pending" | "completed" | "cancelled";

// Format chuẩn envelope trả về cho client
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}