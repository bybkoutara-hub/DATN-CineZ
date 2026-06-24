// Kiểm thử ký & xác thực chữ ký VNPay (không cần DB).
// Chạy: npx tsx scripts/test-vnpay.ts
import assert from "assert";
import { buildVnpUrl, verifyVnpReturn } from "../utils/vnpay.js";

process.env.VNPAY_TMN_CODE = "B77INC60";
process.env.VNPAY_HASH_SECRET = "NU3W61XPNAW4DDRSYM30E0G4GL97VG7M";
process.env.VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
process.env.VNPAY_RETURN_URL = "http://192.168.1.30:5001/api/payment/vnpay/return";

let passed = 0;
const test = (name: string, fn: () => void) => {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (e: any) {
    console.error(`❌ ${name}: ${e.message}`);
    process.exitCode = 1;
  }
};

// Phân tích query string của URL thành object
const parseQuery = (url: string): Record<string, string> => {
  const q = url.split("?")[1] || "";
  const obj: Record<string, string> = {};
  for (const pair of q.split("&")) {
    const [k, v] = pair.split("=");
    if (!k) continue;
    // Mô phỏng Express/qs: dấu "+" -> khoảng trắng rồi decode (req.query đã giải mã)
    obj[k] = decodeURIComponent((v || "").replace(/\+/g, "%20"));
  }
  return obj;
};

test("buildVnpUrl tạo URL có vnp_SecureHash", () => {
  const url = buildVnpUrl({
    amount: 120000,
    orderId: "64f0c1a2b3d4e5f600000001",
    orderInfo: "Thanh toan ve xem phim 64f0c1a2b3d4e5f600000001",
    ipAddr: "127.0.0.1",
    createDate: "20260622120000",
  });
  assert(url.includes("vnp_SecureHash="), "URL phải chứa vnp_SecureHash");
  assert(url.includes("vnp_Amount=12000000"), "Số tiền phải nhân 100 (12000000)");
});

test("verifyVnpReturn xác thực chữ ký hợp lệ", () => {
  const url = buildVnpUrl({
    amount: 120000,
    orderId: "64f0c1a2b3d4e5f600000001",
    orderInfo: "Thanh toan ve xem phim",
    ipAddr: "127.0.0.1",
    createDate: "20260622120000",
  });
  const query = parseQuery(url);
  // Giả lập VNPay thêm vnp_ResponseCode khi trả về thành công
  // (Lưu ý: phải giữ nguyên tập tham số đã ký để chữ ký khớp.)
  const result = verifyVnpReturn(query);
  assert.strictEqual(result.isValid, true, "Chữ ký gốc phải hợp lệ");
});

test("verifyVnpReturn phát hiện giả mạo (đổi số tiền)", () => {
  const url = buildVnpUrl({
    amount: 120000,
    orderId: "64f0c1a2b3d4e5f600000001",
    orderInfo: "Thanh toan ve",
    ipAddr: "127.0.0.1",
    createDate: "20260622120000",
  });
  const query = parseQuery(url);
  query.vnp_Amount = "100"; // kẻ gian sửa số tiền
  const result = verifyVnpReturn(query);
  assert.strictEqual(result.isValid, false, "Chữ ký phải KHÔNG hợp lệ khi bị sửa");
});

test("verifyVnpReturn phát hiện chữ ký sai", () => {
  const url = buildVnpUrl({
    amount: 50000,
    orderId: "abc123",
    orderInfo: "Thanh toan ve",
    ipAddr: "127.0.0.1",
    createDate: "20260622120000",
  });
  const query = parseQuery(url);
  query.vnp_SecureHash = "deadbeef";
  const result = verifyVnpReturn(query);
  assert.strictEqual(result.isValid, false, "Chữ ký rác phải bị từ chối");
});

console.log(`\n🎯 Hoàn tất: ${passed}/4 test pass`);
