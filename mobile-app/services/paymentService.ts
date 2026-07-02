import api from "./api";

// Tạo URL thanh toán VNPay cho một đơn đặt vé đang chờ (pending).
// Trả về chuỗi URL để mở trong trình duyệt thanh toán (hoặc null nếu đã thanh toán xong).
export const createVnpayUrl = async (bookingId: string): Promise<void> => {
  const response = await api.post("/payments/vnpay/create-url", { bookingId });
  if (!response.data?.success) {
    console.warn("VNPay response:", JSON.stringify(response.data));
    throw new Error(response.data?.message || `Không tạo được liên kết thanh toán VNPay. (${response.status})`);
  }
};
