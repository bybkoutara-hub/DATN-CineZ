import api from "./api";

export const createVnpayUrl = async (bookingId: string): Promise<string> => {
  const response = await api.post("/payments/vnpay/create-url", { bookingId });
  if (!response.data?.success || !response.data?.paymentUrl) {
    throw new Error(response.data?.message || "Không tạo được liên kết thanh toán VNPay.");
  }
  return response.data.paymentUrl as string;
};
