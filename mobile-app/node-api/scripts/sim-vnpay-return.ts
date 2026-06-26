// Mô phỏng VNPay gọi về URL return với chữ ký hợp lệ để kiểm thử end-to-end.
// Dùng: npx tsx scripts/sim-vnpay-return.ts <txnRef> <amount> <responseCode>
import { hmacSha512, sortObject } from "../utils/vnpay.js";

process.env.VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || "NU3W61XPNAW4DDRSYM30E0G4GL97VG7M";
const secret = process.env.VNPAY_HASH_SECRET;

const txnRef = process.argv[2] || "";
const amount = process.argv[3] || "0";
const responseCode = process.argv[4] || "00";

// Tập tham số giống VNPay trả về thực tế
const params: Record<string, any> = {
  vnp_Amount: amount,
  vnp_BankCode: "NCB",
  vnp_BankTranNo: "VNP14000001",
  vnp_CardType: "ATM",
  vnp_OrderInfo: `Thanh toan ve xem phim ${txnRef}`,
  vnp_PayDate: "20260622081800",
  vnp_ResponseCode: responseCode,
  vnp_TmnCode: "B77INC60",
  vnp_TransactionNo: "14000001",
  vnp_TransactionStatus: responseCode,
  vnp_TxnRef: txnRef,
};

const sorted = sortObject(params);
const signData = Object.keys(sorted)
  .map((k) => `${k}=${sorted[k]}`)
  .join("&");
const secureHash = hmacSha512(secret, signData);

// In ra query string đầy đủ để gọi tới endpoint return
console.log(`${signData}&vnp_SecureHash=${secureHash}`);
