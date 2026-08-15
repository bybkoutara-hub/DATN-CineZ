# Thiết kế: Email xác nhận đặt vé + Thanh toán VNPay + Đồng bộ tiếng Việt

Ngày: 2026-06-22

## Mục tiêu
1. Gửi email HTML xác nhận khi đặt vé thành công.
2. Thanh toán online thật qua VNPay (sandbox), giữ ghế đúng trạng thái.
3. Sửa các logic vô lý (vé completed trước khi trả tiền, dữ liệu vé cứng, ép combo mặc định).
4. Đồng bộ toàn bộ text UI sang tiếng Việt.
5. Review chéo nhiều agent + test.

## Kiến trúc

### Backend (node-api, Express + Mongoose, ESM)
- `utils/sendBookingEmail.ts`: `sendBookingConfirmationEmail(bookingId)` — populate booking→showtime→movie + user, dựng HTML, gửi qua Resend REST API bằng `fetch`. Không chặn luồng nếu gửi lỗi (chỉ log).
- `utils/vnpay.ts`: `buildVnpUrl(params)` ký HMAC-SHA512, `verifyVnpReturn(query)` xác thực `vnp_SecureHash`. Sắp xếp key A→Z, encode đúng chuẩn VNPay.
- `controllers/paymentController.ts`:
  - `createVnpUrl` (POST, private): nhận `bookingId`, kiểm booking thuộc user + `pending`, dựng URL.
  - `vnpReturn` (GET, public): verify → `00` thì `completed` + email; ngược lại `cancelled` + trả ghế. Redirect deep link `mobileapp://vnpay-return?status=...&bookingId=...`.
  - `vnpIpn` (GET, public): xác thực + cập nhật (dự phòng, LAN không gọi được).
- `routes/paymentRoutes.ts` → gắn `/api/payment` trong `server.ts`.
- `controllers/bookingController.ts`:
  - `paymentMethod === 'vnpay'` → tạo booking `status: 'pending'` (vẫn giữ ghế), KHÔNG gửi email.
  - Ngược lại (tiền mặt tại quầy) → `status: 'completed'` + gửi email.

### Frontend (Expo Router)
- `services/paymentService.ts`: `createVnpayUrl(bookingId)`.
- `app/payment.tsx`: chỉ 2 phương thức — **VNPay** và **Tiền mặt tại quầy**. VNPay: tạo booking pending → lấy URL → `WebBrowser.openAuthSessionAsync` → xử lý kết quả. Cash: createBooking → tab vé. Dịch tiếng Việt.
- `app/my-ticket.tsx`: dùng dữ liệu vé thật (giá, ghế, suất, mã đặt vé), mã vạch thật, sửa "Oder ID"→"Mã đặt vé", bỏ địa chỉ cứng.
- `app/(tabs)/ticket.tsx`: truyền thêm `_id`, `totalPrice`, `combos`. Dịch "My ticket".
- `app/combo.tsx`: bỏ ép mặc định combo (=0), thay placeholder ảnh, dịch "Best Seller".
- `app/select-seat.tsx`: dịch toàn bộ text Anh→Việt.
- Quét các màn còn lại dịch nốt.

## Env mới (node-api/.env)
VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL, RESEND_API_KEY, MAIL_FROM, APP_RETURN_SCHEME, SERVER_PUBLIC_URL.

## Trạng thái vé
- `pending`: VNPay chờ thanh toán (đã giữ ghế).
- `completed`: tiền mặt hoặc VNPay thành công (đã gửi email).
- `cancelled`: VNPay thất bại/hủy (đã trả ghế).

## Kiểm thử
- Typecheck/lint frontend + backend.
- Unit test ký/verify VNPay (chữ ký khớp, phát hiện giả mạo).
- Review chéo: agent backend, agent frontend, agent test.
- Screenshot màn chính qua Expo web.
