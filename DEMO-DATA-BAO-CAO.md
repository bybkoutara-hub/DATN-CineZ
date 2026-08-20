# 📋 NOTE DỮ LIỆU DEMO — BÁO CÁO ĐỒ ÁN CINEZ

> File này dùng để mở lên tra cứu ngay trong lúc báo cáo. Mọi dữ liệu demo đều có sẵn dưới đây.

---

## 1. CÁCH CHẠY DỰ ÁN (3 terminal riêng)

| Phần | Thư mục | Lệnh chạy | URL |
|---|---|---|---|
| Backend API | `api` | `npm run dev` (hoặc `npx tsx server.ts`) | http://localhost:5000 |
| Mobile App | `mobile-app` | `npx expo start` → bấm `a` (Android) | Expo Go |
| Web Admin | `webadmin` | `npm run dev` | http://localhost:5173 |

- Seed dữ liệu mẫu: `npm run seed-full` (trong `api`) — **chạy lại trước buổi báo cáo** để dữ liệu luôn mới (suất chiếu được tạo trong 7 ngày tới).
- Cần MongoDB chạy local (127.0.0.1:27017). Redis không bắt buộc.

---

## 2. TÀI KHOẢN DEMO

### 🔐 Web Admin (`http://localhost:5173`)
| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `admin` | `admin123` | Quản trị viên (full quyền) |
| `staff01` | `admin123` | Nhân viên |
| `staff02` | `admin123` | Nhân viên |

### 📱 Mobile App (khách hàng)
| Tài khoản | Mật khẩu | Ghi chú |
|---|---|---|
| `user01@example.com` | `user123` | Nguyễn Văn An — **tài khoản demo chính** |
| `user02@example.com` | `user123` | Trần Thị Bình |
| `user03@example.com` | `user123` | Lê Hoàng Cường |
| `user04@example.com` | `user123` | Phạm Minh Dung |
| `user05@example.com` | `user123` | Hoàng Thị Em (tài khoản bị khóa - status inactive) |

> Tài khoản đăng ký bằng email khác (không phải bybkoutara@gmail.com) sẽ KHÔNG nhận được email xác nhận vé do giới hạn Resend — demo email thì dùng tài khoản đăng ký với `bybkoutara@gmail.com`.

---

## 3. 💳 THẺ TEST VNPAY (CỔNG SANDBOX)

Khi thanh toán VNPay trên app, chọn **"Thanh toán qua thẻ nội địa (ATM)"** rồi nhập:

| Trường | Giá trị |
|---|---|
| Số thẻ | `9704198526191432198` |
| Chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành | `07/15` |
| Mật khẩu OTP | `123456` |

- Cổng sandbox: https://sandbox.vnpayment.vn
- Sau khi thanh toán xong, app tự chuyển về màn hình Vé (ticket) kèm thông báo thành công.

---

## 4. 🏷️ MÃ GIẢM GIÁ (áp dụng ở màn Thanh toán)

| Mã | Giảm | Điều kiện |
|---|---|---|
| `WELCOME10` | 10% (tối đa 50k) | Đơn từ 100k |
| `T5GIAM50` | 50.000đ | Đơn từ 100k (thứ 5) |
| `SINHNHAT` | 30% (tối đa 100k) | Không yêu cầu tối thiểu |
| `COMBO20` | 20% (tối đa 30k) | Đơn từ 50k |
| `THU7VIP` | 30.000đ | Đơn từ 150k (hết hạn 30/06) |

---

## 5. 🍿 COMBO BẮP NƯỚC (màn Combo)

| Combo | Giá |
|---|---|
| Combo Solo (1 bắp lớn + 1 nước lớn) | 65.000đ |
| Combo Couple (1 bắp + 2 nước) | 95.000đ |
| Combo Family (2 bắp + 3 nước) | 159.000đ |
| Combo Student (1 bắp nhỏ + 1 nước nhỏ) | 49.000đ |
| Burger Meal | 79.000đ |

---

## 6. 🎬 PHIM DEMO

### Đang chiếu (8 phim — đặt vé được)
1. **Lật Mặt 7: Một Điều Ước** — Gia đình, 138 phút, P
2. **Avatar: Fire and Ash** — Hành động/SF, 160 phút, C13 (có 2D/3D/IMAX/4DX)
3. **Deadpool & Wolverine** — Hành động/Hài, 127 phút, C18
4. **Inside Out 2** — Hoạt hình, 96 phút, P
5. **Godzilla x Kong: The New Empire** — Hành động, 115 phút, C13
6. **Mai** — Tâm lý/Tình cảm, 131 phút, C16
7. **Kong: Đảo Đầu Lâu** — Hành động, 118 phút, C13
8. **Quỷ Nhập Tràng 2** — Kinh dị, 120 phút, C18

### Sắp chiếu (4 phim — chỉ xem, không đặt vé)
Dune: Part Three • Siêu Trộm 2 • Biệt Đội Săn Ma • Vòng Xoay Tội Lỗi

---

## 7. 🏢 RẠP & PHÒNG CHIẾU

- 3 cụm rạp: **CineZ Hùng Vương Plaza** (Q.5), **CineZ Vạn Hạnh Mall** (Q.10), **CineZ Vincom Thảo Điền** (Q.2)
- 5 phòng chiếu: IMAX (120k), 3D VIP (90k), 2D Standard (75k), 4DX (130k), VIP (150k)
- Giá ghế cộng thêm theo loại ghế (Couple/Recliner/Sweetbox...)

---

## 8. 🎫 DỮ LIỆU VÉ CÓ SẴN (seed tạo sẵn 10 đơn)

- **7 đơn đã thanh toán** (hiện trong Dashboard doanh thu, Invoices)
- 1 đơn chờ thanh toán (pending), 1 đơn đã hủy (cancelled), 1 đơn hoàn tiền (refunded)
- Trải 7 ngày gần nhất → demo biểu đồ Dashboard có số liệu
- Xem ở app: đăng nhập `user01@example.com` → tab **Vé**

---

## 9. 📌 LUỒNG DEMO GỢI Ý (chạy theo thứ tự)

1. **Mobile**: Mở app → trang chào → Đăng nhập `user01@example.com` / `user123`
2. Trang chủ → chọn phim **Avatar: Fire and Ash** → xem chi tiết, đánh giá
3. Chọn suất chiếu → chọn ghế (thử ghế Couple/VIP) → chọn combo → màn Thanh toán
4. Nhập mã giảm giá `WELCOME10` → thấy tiền giảm
5. Chọn **VNPay** → nhập thẻ test (mục 3) → thanh toán xong → tab Vé hiện QR
6. **Web Admin**: đăng nhập `admin` → xem Dashboard (doanh thu 7 ngày, biểu đồ)
7. Admin: Quản lý phim/suất chiếu/phòng/khuyến mãi/hóa đơn/thành viên/đánh giá
8. Demo thêm: báo cáo doanh thu, hủy vé, xem chi tiết hóa đơn, export

---

## 10. ⚠️ LƯU Ý TRƯỚC BUỔI BÁO CÁO

- [ ] Chạy lại seed (`npm run seed-full`) để suất chiếu trong 7 ngày tới còn hiệu lực
- [ ] Kiểm tra cả 2 máy đều chạy được (máy 1: API + mobile, máy 2: API + webadmin)
- [ ] Mở sẵn: Slide, Document, Github, DrawIO (Use case, ERD), sản phẩm demo
- [ ] IP trong `mobile-app/services/api.ts` và `api/.env` (VNPAY_RETURN_URL) phải đúng IP LAN của máy chạy API
- [ ] Tắt chat apps, tắt điện thoại khi vào báo cáo