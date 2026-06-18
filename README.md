# 🎬 CineZ — Ứng dụng đặt vé xem phim (CGV Clone)

Đồ án tốt nghiệp (DATN) — ứng dụng đặt vé xem phim mô phỏng **CGV Cinemas**: xem phim đang chiếu / sắp chiếu, chọn cụm rạp & suất chiếu, chọn ghế, mua bắp nước (combo), thanh toán (Momo/ZaloPay/VNPay...), lưu vé QR và quản lý thành viên/điểm thưởng.

Monorepo 3 thành phần:

| Thư mục | Vai trò | Công nghệ |
|---------|---------|-----------|
| [`mobile-app/`](mobile-app) | App người dùng (mobile) | Expo · React Native · TypeScript · expo-router · Axios |
| [`api/`](api) | Backend REST API | Node.js · Express 5 · TypeScript · MongoDB (Mongoose) · JWT |
| [`webadmin/`](webadmin) | Web quản trị (admin) | *(git submodule — xem mục Web admin)* |

---

## 📁 Cấu trúc thư mục

```
DATN-CineZ/
├── mobile-app/                  # App người dùng (Expo)
│   ├── app/                     # Màn hình expo-router
│   │   ├── (tabs)/              # Tab chính: Trang chủ · Phim · Vé · Tài khoản
│   │   ├── sign-in.tsx · signup.tsx · verification.tsx   # Đăng ký/đăng nhập
│   │   ├── movie-detail.tsx     # Chi tiết phim + chọn suất chiếu
│   │   ├── select-seat.tsx      # Sơ đồ ghế
│   │   ├── combo.tsx            # Bắp nước
│   │   ├── payment.tsx          # Thanh toán
│   │   └── my-ticket.tsx        # Vé của tôi (QR)
│   ├── components/              # UI component dùng chung
│   ├── services/                # Gọi API (movieService, cinemaService, bookingService...)
│   ├── hooks/                   # Custom hooks
│   ├── constants/               # api.ts (endpoint), theme.ts
│   ├── types/                   # Kiểu dữ liệu domain (Movie, Cinema, Booking...)
│   ├── utils/                   # format VND / ngày giờ
│   ├── assets/images/           # Ảnh phim, logo (IMAX, 4DX, Momo, ZaloPay...)
│   └── app.json package.json tsconfig.json
│
├── api/                         # Backend Express + TypeScript
│   ├── server.ts                # Entry: kết nối Mongo + mount routes
│   ├── routes/                  # auth, movies, cinemas, showtimes, bookings,
│   │                            #   payments, combos, promotions, reviews
│   ├── controllers/             # Logic xử lý từng endpoint
│   ├── models/                  # Mongoose schema (movie, cinema, showtime,
│   │                            #   user, booking, payment, combo, promotion, review)
│   ├── middlewares/             # auth.middleware.ts (JWT protect + requireRole)
│   ├── utils/                   # response.ts (helper JSON)
│   ├── types/                   # Kiểu/enum dùng chung
│   ├── scripts/seed.ts          # Seed dữ liệu mẫu
│   ├── .env.example
│   └── package.json tsconfig.json
│
├── webadmin/                    # Web admin (git submodule)
├── .gitignore
└── README.md
```

> **Lưu ý:** `api/` trước đây nằm trong `mobile-app/node-api/`, đã tách ra top-level vì là server HTTP riêng.

---

## 🧱 Công nghệ

| Layer | Stack |
|-------|-------|
| Mobile | React Native (Expo SDK 54) · TypeScript · expo-router · Axios · AsyncStorage |
| API | Node.js · Express 5 · TypeScript · Mongoose 9 · JWT (jsonwebtoken) · bcryptjs |
| Database | MongoDB (database `mbooking`) |
| Kiểm thử API | Postman / Bruno / curl |

---

## ⚙️ Yêu cầu môi trường

- **Node.js 20+** (đã test trên Node 24) + npm
- **MongoDB** chạy local — mặc định `mongodb://127.0.0.1:27017/mbooking`
  - Cài nhanh: tải MongoDB Community Server, hoặc dùng Docker:
    ```bash
    docker run -d -p 27017:27017 --name cinez-mongo mongo:7
    ```
- **Expo Go** (trên điện thoại) hoặc emulator Android/iOS để chạy mobile app

---

## 🚀 Cài đặt & chạy server

### 1. Khởi động MongoDB
Đảm bảo MongoDB đang chạy ở `mongodb://127.0.0.1:27017`. Tạo database tên `mbooking` (tự sinh khi ghi dữ liệu đầu tiên).

### 2. Chạy backend API (`api/`)

```bash
cd api
cp .env.example .env        # (Windows: copy .env.example .env) — chỉnh PORT/MONGODB_URI nếu cần
npm install
npm run dev                 # chạy ở chế độ dev (tự reload) → http://localhost:5000
```

Các script có sẵn (`api/package.json`):

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `npm run dev` | `ts-node-dev --respawn --transpile-only server.ts` | Chạy dev, tự reload khi sửa code |
| `npm run build` | `tsc` | Build ra `dist/` |
| `npm start` | `node dist/server.js` | Chạy bản đã build (production) |
| `npm run seed` | `ts-node --transpile-only scripts/seed.ts` | Nạp dữ liệu mẫu |

Kiểm tra server đã lên:

```bash
curl http://localhost:5000/
# → Hệ thống CineZ Movie Booking API đang chạy! 🎬
```

> Khi server khởi động thành công sẽ log: `[MongoDB]: Kết nối thành công tại: 127.0.0.1` và `[Server]: API đang hoạt động tại port 5000`. Nếu không thấy dòng MongoDB, nghĩa là Mongo chưa chạy.

### 3. Chạy mobile app (`mobile-app/`)

```bash
cd mobile-app
npm install
npx expo start            # quét QR bằng Expo Go trên điện thoại
```

**Quan trọng — cấu hình URL API** trong [`mobile-app/services/api.ts`](mobile-app/services/api.ts):

```ts
const api = axios.create({
  baseURL: "http://192.168.50.114:5000/api",  // ← đổi IP + port cho đúng máy bạn
});
```

- Khi chạy app trên **điện thoại thật**, phải dùng **IP LAN của máy chạy API** (lệnh `ipconfig` / `ifconfig`), không dùng `localhost`.
- Port `5000` phải khớp với `PORT` của API (mặc định 5000).

### 4. Web admin (`webadmin/`)

`webadmin/` được quy hoạch là **git submodule** (web admin riêng). Hiện gitlink đã có nhưng **chưa có file `.gitmodules`**, nên cần khởi tạo:

```bash
# Thêm submodule (nếu đã có repo admin riêng):
git submodule add <url-repo-webadmin> webadmin

# Hoặc nếu chỉ muốn dựng lốc tại chỗ: xoá gitlink rồi tạo project webadmin trong thư mục này
git rm --cached webadmin
```

---

## 🔌 Các endpoint API

Tất cả endpoint có tiền tố `/api`. Phản hồi theo format thống nhất `{ success, message?, data? }`.

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | — | Đăng ký tài khoản |
| POST | `/api/auth/login` | — | Đăng nhập, trả JWT |
| GET | `/api/auth/me` | ✅ | Thông tin người dùng đang đăng nhập |
| GET | `/api/movies?status=now_playing\|coming_soon` | — | Danh sách phim |
| GET | `/api/movies/:id` | — | Chi tiết phim + suất chiếu |
| GET | `/api/cinemas?city=` | — | Danh sách cụm rạp |
| GET | `/api/showtimes?movieId=` | — | Suất chiếu của phim |
| POST | `/api/bookings` | ✅ | Tạo đơn đặt vé (chọn ghế + combo) |
| GET | `/api/bookings/mine` | ✅ | Vé của tôi |
| POST | `/api/payments` | ✅ | Tạo giao dịch thanh toán |
| GET | `/api/combos` | — | Danh sách bắp nước |
| GET | `/api/promotions` | — | Khuyến mãi đang hoạt động |
| POST | `/api/promotions/apply` | — | Áp mã giảm giá |
| GET | `/api/reviews?movieId=` | — | Đánh giá phim |
| POST | `/api/reviews` | ✅ | Tạo đánh giá |

> Endpoint cần đăng nhập gửi header: `Authorization: Bearer <token>`.

---

## 🌱 Dữ liệu mẫu (seed)

```bash
cd api
npm run seed
```

Nạp phim / suất chiếu mẫu vào MongoDB (xem [`api/scripts/seed.ts`](api/scripts/seed.ts)). Mở rộng thêm cinema, combo, promotion khi cần.

---

## 🔐 Luồng xác thực & đặt vé

```
Đăng ký/đăng nhập ──► nhận JWT ──► lưu AsyncStorage (mobile)
   │
   ▼
Chọn phim ──► chọn cụm rạp + suất chiếu ──► chọn ghế ──► chọn combo (tuỳ chọn)
   │
   ▼
Tạo Booking (POST /api/bookings, kèm JWT) ──► Thanh toán (POST /api/payments)
   │
   ▼
Booking chuyển sang "paid" + sinh vé QR ──► "Vé của tôi"
```

- Mật khẩu băm bằng **bcrypt**.
- JWT mang `{ id, role }`, hết hạn 7 ngày.
- Phân quyền: `user` | `staff` | `admin` (middleware `requireRole`).

---

## 🗺️ Lộ trình xây dựng tiếp (gần giống CGV)

Mục tiêu hoàn thiện dần thành một app giống CGV thật:

### Người dùng (mobile)
- [ ] **Sơ đồ ghế 2D trực quan** — phân loại ghế (Standard, VIP, Sweet Box, Deluxe) với giá khác nhau, ghế đã bán realtime (WebSocket / polling).
- [ ] **Định vị rạp theo vị trí** — bản đồ + chọn cụm rạp gần nhất (GPS).
- [ ] **Lịch chiếu theo rạp** — chọn rạp → xem lịch chiếu cả tuần.
- [ ] **Thanh toán thật** — tích hợp cổng Momo / ZaloPay / VNPay / thẻ ATM (webhook xác nhận).
- [ ] **Vé QR / PDF** — sinh mã QR check-in tại rạp, lưu vé offline.
- [ ] **Thành viên & điểm thưởng (CGV Membership)** — hạng thành viên, tích điểm, đổi điểm lấy voucher.
- [ ] **Thông báo đẩy (Push notification)** — nhắc lịch chiếu, khuyến mãi.
- [ ] **Đánh giá & bình luận phim** — sao, review, bình luận.
- [ ] **Trailer / teasER** — xem trailer trong app (YouTube embed / video).
- [ ] **Đa ngôn ngữ** — Tiếng Việt / English.

### Quản trị (webadmin)
- [ ] Dashboard doanh thu, ghế bán ra, phim hot (biểu đồ).
- [ ] Quản lý phim (CRUD), lịch chiếu, phòng chiếu.
- [ ] Quản lý cụm rạp, phòng, sơ đồ ghế.
- [ ] Quản lý combo (F&B), khuyến mãi/voucher.
- [ ] Quản lý người dùng, phân quyền staff/admin.
- [ ] Báo cáo thống kê (theo ngày/tháng/rạp).

### Kỹ thuật
- [ ] Đặt tầng environment (`.env` cho dev/prod), Docker Compose (api + mongo).
- [ ] Rate limiting, validation đầu vào (zod / express-validator).
- [ ] Unit test (Jest) + integration test.
- [ ] CI/CD (GitHub Actions: lint + build + test).
- [ ] Swagger / OpenAPI docs cho endpoint.

---

## 📚 Tài liệu thêm
- Cấu trúc app (Expo): [`mobile-app/README.md`](mobile-app/README.md)
- Entry API: [`api/server.ts`](api/server.ts)
- Seed: [`api/scripts/seed.ts`](api/scripts/seed.ts)

---

## 📄 Giấy phép
Dự án phục vụ mục đích học tập (Đồ án tốt nghiệp).
