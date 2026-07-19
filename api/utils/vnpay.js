"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVnpReturn = exports.buildVnpUrl = exports.formatVnpDate = exports.hmacSha512 = exports.sortObject = void 0;
const crypto_1 = __importDefault(require("crypto"));
const sortObject = (obj) => {
    const sorted = {};
    const keys = [];
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
exports.sortObject = sortObject;
const buildSignData = (sorted) => Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join("&");
const hmacSha512 = (secret, data) => crypto_1.default.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
exports.hmacSha512 = hmacSha512;
const formatVnpDate = (date = new Date()) => {
    const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return (vn.getUTCFullYear().toString() +
        pad(vn.getUTCMonth() + 1) +
        pad(vn.getUTCDate()) +
        pad(vn.getUTCHours()) +
        pad(vn.getUTCMinutes()) +
        pad(vn.getUTCSeconds()));
};
exports.formatVnpDate = formatVnpDate;
const buildVnpUrl = (input) => {
    const tmnCode = process.env.VNPAY_TMN_CODE || "";
    const secret = process.env.VNPAY_HASH_SECRET || "";
    const vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = process.env.VNPAY_RETURN_URL || "";
    const params = {
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
        vnp_CreateDate: input.createDate || (0, exports.formatVnpDate)(),
    };
    if (input.bankCode)
        params.vnp_BankCode = input.bankCode;
    const sorted = (0, exports.sortObject)(params);
    const signData = buildSignData(sorted);
    const signed = (0, exports.hmacSha512)(secret, signData);
    return `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
};
exports.buildVnpUrl = buildVnpUrl;
const verifyVnpReturn = (query) => {
    const secret = process.env.VNPAY_HASH_SECRET || "";
    const received = String(query.vnp_SecureHash || "");
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    const sorted = (0, exports.sortObject)(params);
    const signData = buildSignData(sorted);
    const signed = (0, exports.hmacSha512)(secret, signData);
    let isValid = false;
    try {
        const a = Buffer.from(received.toLowerCase(), "hex");
        const b = Buffer.from(signed.toLowerCase(), "hex");
        isValid = a.length === b.length && crypto_1.default.timingSafeEqual(a, b);
    }
    catch {
        isValid = false;
    }
    return {
        isValid,
        responseCode: String(query.vnp_ResponseCode || ""),
        txnRef: String(query.vnp_TxnRef || ""),
        amount: String(query.vnp_Amount || ""),
    };
};
exports.verifyVnpReturn = verifyVnpReturn;
//# sourceMappingURL=vnpay.js.map