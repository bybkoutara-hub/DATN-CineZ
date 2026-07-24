# 🎬 CineZ — Ứng dụng đặt vé xem phim (CGV Clone)

Đồ án tốt nghiệp (DATN) — ứng dụng đặt vé xem phim mô phỏng **CGV Cinemas**: xem phim đang chiếu / sắp chiếu, chọn suất chiếu, chọn ghế (sơ đồ 18 cột có Couple/VIP), mua bắp nước (combo), thanh toán VNPay, lưu vé QR.

Monorepo 3 thành phần:

| Thư mục | Vai trò | Công nghệ |
|---------|---------|-----------|
| [`mobile-app/`](mobile-app) | App người dùng (mobile) | Expo · React Native · TypeScript · expo-router · Axios · WebView |
| [`api/`](api) | Backend REST API | Node.js · Express 5 · TypeScript · MongoDB (Mongoose) · JWT |
| [`webadmin/`](webadmin) | Web quản trị (admin) | React · js |

---

## 📁 Cấu trúc thư mục

```
DATN-CineZ/
├── mobile-app/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # Trang chủ
│   │   │   ├── movie.tsx         # Danh sách phim
│   │   │   ├── ticket.tsx        # Vé của tôi
│   │   │   └── profile.tsx       # Tài khoản
│   │   ├── sign-in.tsx           # Đăng nhập
│   │   ├── sign-up.tsx           # Đăng ký
│   │   ├── verification.tsx      # Xác thực
│   │   ├── movie-detail.tsx      # Chi tiết phim + chọn suất
│   │   ├── select-seat.tsx       # Sơ đồ ghế 18 cột (Couple/VIP/Thường)
│   │   ├── combo.tsx             # Bắp nước
│   │   ├── payment.tsx           # Thanh toán (VNPay WebView / Tiền mặt)
│   │   ├── my-ticket.tsx         # Chi tiết vé (QR)
│   │   └── movie-comments.tsx    # Bình luận phim
│   ├── services/                 # API calls (api, auth, booking, combo, movie...)
│   ├── constants/                # api.ts, theme.ts
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Format tiền, ngày giờ
│   └── package.json
│
├── api/
│   ├── server.ts                 # Entry: Express + MongoDB + routes
│   ├── routes/                   # auth, bookings, movies, payments, combos...
│   ├── controllers/              # Logic: createBooking, getMyBookingHistory...
│   ├── models/                   # Mongoose: User, Movie, Showtime, Booking...
│   ├── middlewares/              # auth.middleware.ts (JWT protect)
│   ├── utils/                    # vnpay.ts (sort, hash, verify) · sendBookingEmail
│   ├── scripts/                  # seed.ts · seed-full.ts
│   ├── types/                    # index.ts (TypeScript types)
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── webadmin/                     # React admin (quản lý phim, suất chiếu, thống kê)
│   ├── public/
│   ├── src/
│   │   ├── pages/                # Movies, Showtimes, Dashboard...
│   │   ├── api/                  # apiService.js (có 401 interceptor)
│   │   └── ...
│   └── package.json
│
├── VNPay/                        # Mã nguồn VNPay tham khảo
├── .gitignore
└── README.md
```

---

## 🧱 Công nghệ

| Layer | Stack |
|-------|-------|
| Mobile | React Native (Expo) · TypeScript · expo-router · expo-image · react-native-webview |
| API | Node.js · Express 5 · TypeScript · Mongoose 9 · JWT · bcryptjs |
| Database | MongoDB (database `mbooking`) |
| Thanh toán | VNPay Sandbox (WebView + server-side verify) |

---

## ⚙️ Yêu cầu môi trường

- **Node.js 20+** + npm
- **MongoDB** — mặc định `mongodb://127.0.0.1:27017/mbooking`
  ```bash
  docker run -d -p 27017:27017 --name cinez-mongo mongo:7
  ```
- **Expo Go** (iOS/Android) hoặc emulator

---

## 🚀 Cài đặt & chạy

### 1. MongoDB
Đảm bảo MongoDB đang chạy ở `mongodb://127.0.0.1:27017`.

### 2. Backend API

```bash
cd api
cp .env.example .env
npm install
npm run dev        # tsx watch server.ts → http://localhost:5000
```

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `npm run dev` | `tsx watch server.ts` | Dev, tự reload |
| `npm run build` | `tsc` | Build ra `dist/` |
| `npm start` | `node dist/server.js` | Production |
| `npm run seed` | `tsx scripts/seed.ts` | Seed dữ liệu mẫu |

### 3. Cấu hình VNPay

Trong `api/.env`:

```env
VNPAY_TMN_CODE=TD3422D1
VNPAY_HASH_SECRET=SMKTJ11T9JQDIZQPCF7E8ZIJ6DXV969Z
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payments/vnpay/return
```

Thẻ test VNPay sandbox:
- Ngân hàng: NCB
- Số thẻ: `9704198526191432198`
- Tên: `NGUYEN VAN A`
- Ngày: `07/15`
- OTP: `123456`

### 4. Mobile app

```bash
cd mobile-app
npm install
npx expo start
```

Cấu hình URL API trong `mobile-app/services/api.ts`:
```ts
baseURL: "http://<IP-LAN>:5000/api",  // IP máy chạy backend
```

### 5. Web admin

```bash
cd webadmin
npm install
npm start
```

---

## 🔌 API endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | — | Đăng ký |
| POST | `/api/auth/login` | — | Đăng nhập → JWT |
| GET | `/api/auth/me` | ✅ | Thông tin user |
| GET | `/api/movies?status=now_playing\|coming_soon` | — | Danh sách phim |
| GET | `/api/movies/:id` | — | Chi tiết phim + suất chiếu |
| GET | `/api/movies/showtimes/:showtimeId` | — | Chi tiết suất chiếu (ghế trống) |
| GET | `/api/cinemas?city=` | — | Danh sách rạp |
| POST | `/api/bookings` | ✅ | Tạo đơn đặt vé |
| GET | `/api/bookings/my-history` | ✅ | Lịch sử vé (populated) |
| POST | `/api/bookings/:id/cancel` | ✅ | Hủy đơn pending |
| POST | `/api/payments/vnpay/create` | ✅ | Tạo URL thanh toán VNPay |
| POST | `/api/payments/vnpay/confirm` | ✅ | Xác nhận kết quả VNPay |
| GET | `/api/payments/vnpay/return` | — | Return URL từ VNPay |
| GET | `/api/combos` | — | Danh sách combo/bắp nước |
| GET | `/api/promotions` | — | Khuyến mãi |
| POST | `/api/promotions/apply` | — | Áp mã giảm giá |
| GET/POST | `/api/reviews` | * | Đánh giá phim |

---

## 🌱 Seed dữ liệu

```bash
cd api
npm run seed         # seed cơ bản
npm run seed-full    # seed nhiều dữ liệu hơn
```

---

## 🔐 Luồng đặt vé

```
Đăng nhập → Chọn phim → Chọn suất → Chọn ghế (sơ đồ 18 cột) →
Chọn combo → Thanh toán (VNPay WebView / Tiền mặt) → Vé QR
```

---

## ✅ Đã hoàn thành

- [x] Sơ đồ ghế 18 cột: phân loại **Thường / VIP / Couple** (bậc thang)
- [x] Màn hình vòng cung + legend 5 loại ghế
- [x] Thanh toán VNPay (WebView + xác thực chữ ký HMAC-SHA512)
- [x] Hiển thị poster phim (fix domain `image.tmdb.org`)
- [x] Lịch sử vé + QR code
- [x] Đăng ký/đăng nhập JWT
- [x] Seed dữ liệu mẫu (phim, suất chiếu, combo)
- [x] Web admin: quản lý phim, suất chiếu, thống kê



---

## 📄 Giấy phép

Dự án phục vụ mục đích học tập (Đồ án tốt nghiệp).
