import crypto from "crypto";

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

const buildSignData = (sorted: Record<string, string>): string =>
  Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");

export const hmacSha512 = (secret: string, data: string): string =>
  crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");

export const formatVnpDate = (date: Date = new Date()): string => {
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
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddr: string;
  createDate?: string;
  bankCode?: string;
}

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
    vnp_Amount: Math.round(input.amount * 100),
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

export const verifyVnpReturn = (
  query: Record<string, any>
): { isValid: boolean; responseCode: string; txnRef: string; amount: string } => {
  const secret = process.env.VNPAY_HASH_SECRET || "";
  const received = String(query.vnp_SecureHash || "");

  const params: Record<string, any> = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = buildSignData(sorted);
  const signed = hmacSha512(secret, signData);

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
