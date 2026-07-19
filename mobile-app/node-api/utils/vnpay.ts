// ==========================================
// TIỆN ÍCH KÝ & XÁC THỰC GIAO DỊCH VNPAY (SANDBOX)
// ==========================================
// Tài liệu chuẩn: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// Chữ ký dùng HMAC-SHA512 trên chuỗi tham số đã sắp xếp A→Z.
import crypto from "crypto";

/**
 * Sắp xếp object theo key tăng dần và encode giá trị đúng chuẩn VNPay
 * (khoảng trắng thành dấu "+"). Trả về object đã sắp xếp.
 */
export const sortObject = (obj: Record<string, any>): Record<string, string> => {
  const sorted: Record<string, string> = {};
  const keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(encodeURIComponent(key));
    }
  }
  keys.sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[decodeURIComponent(key)]).replace(/%20/g, "+");
  }
  return sorted;
};

/** Ghép object đã sắp xếp thành query string (giá trị đã được encode sẵn). */
const buildSignData = (sorted: Record<string, string>): string =>
  Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

/** Tạo chữ ký HMAC-SHA512 từ chuỗi dữ liệu và secret. */
export const hmacSha512 = (secret: string, data: string): string =>
  crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");

/** Định dạng thời gian yyyyMMddHHmmss theo múi giờ GMT+7 (giờ Việt Nam). */
export const formatVnpDate = (date: Date = new Date()): string => {
  // Quy đổi về GMT+7 không phụ thuộc timezone của server
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    vn.getUTCFullYear().toString() +
    pad(vn.getUTCMonth() + 1) +
    pad(vn.getUTCDate()) +
    pad(vn.getUTCHours()) +
    pad(vn.getUTCMinutes()) +
    pad(vn.getUTCSeconds())
  );
};

export interface BuildVnpUrlInput {
  amount: number; // số tiền VND (chưa nhân 100)
  orderId: string; // mã tham chiếu giao dịch (vnp_TxnRef)
  orderInfo: string; // mô tả đơn hàng
  ipAddr: string;
  createDate?: string; // yyyyMMddHHmmss, mặc định now()
  bankCode?: string;
}

/**
 * Dựng URL thanh toán VNPay đã ký. Đọc cấu hình từ biến môi trường:
 * VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL.
 */
export const buildVnpUrl = (input: BuildVnpUrlInput): string => {
  const tmnCode = process.env.VNPAY_TMN_CODE || "";
  const secret = process.env.VNPAY_HASH_SECRET || "";
  const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = process.env.VNPAY_RETURN_URL || "";

  const params: Record<string, any> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.orderId,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(input.amount * 100), // VNPay yêu cầu nhân 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: input.ipAddr || "127.0.0.1",
    vnp_CreateDate: input.createDate || formatVnpDate(),
  };
  if (input.bankCode) params.vnp_BankCode = input.bankCode;

  const sorted = sortObject(params);
  const signData = buildSignData(sorted);
  const signed = hmacSha512(secret, signData);
  return `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
};

/**
 * Xác thực dữ liệu VNPay trả về (return/IPN). So sánh chữ ký được tính lại
 * với vnp_SecureHash gửi kèm. Trả về có hợp lệ hay không + mã phản hồi.
 */
export const verifyVnpReturn = (
  query: Record<string, any>
): { isValid: boolean; responseCode: string; txnRef: string; amount: string } => {
  const secret = process.env.VNPAY_HASH_SECRET || "";
  const received = String(query.vnp_SecureHash || "");

  // Loại bỏ chữ ký khỏi tập tham số trước khi tính lại
  const params: Record<string, any> = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = buildSignData(sorted);
  const signed = hmacSha512(secret, signData);

  // So sánh an toàn theo thời gian (chống timing attack). Bọc try/catch phòng
  // trường hợp độ dài buffer lệch nhau gây ném lỗi.
  let isValid = false;
  try {
    const a = Buffer.from(received.toLowerCase(), "hex");
    const b = Buffer.from(signed.toLowerCase(), "hex");
    isValid = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    isValid = false;
  }

  return {
    isValid,
    responseCode: String(query.vnp_ResponseCode || ""),
    txnRef: String(query.vnp_TxnRef || ""),
    amount: String(query.vnp_Amount || ""),
  };
};
