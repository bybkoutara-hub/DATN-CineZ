import api from "./api";

// Tạo URL thanh toán VNPay cho một đơn đặt vé đang chờ (pending).
// Trả về chuỗi URL để mở trong trình duyệt thanh toán.
export const createVnpayUrl = async (bookingId: string): Promise<string> => {
  const response = await api.post("/payment/vnpay/create-url", { bookingId });
  if (!response.data?.success || !response.data?.paymentUrl) {
    throw new Error(response.data?.message || "Không tạo được liên kết thanh toán VNPay.");
  }
  return response.data.paymentUrl as string;
};
