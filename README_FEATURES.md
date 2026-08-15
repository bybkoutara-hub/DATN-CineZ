# CineZ Mobile - 3 chức năng đã bổ sung

## 1. Bình luận phim
- `GET /api/comments/movie/:movieId`: xem bình luận.
- `POST /api/comments/movie/:movieId`: người dùng đăng nhập mới được bình luận.
- Hỗ trợ nội dung tối đa 500 ký tự và đánh giá 1-5 sao.
- UI đã thêm khu vực bình luận ngay trong `app/movie-detail.tsx`.

## 2. Giờ chiếu
- Movie Detail lấy lịch chiếu từ `GET /api/movies/:id`.
- Hiển thị **ngày + giờ chiếu + giá vé**.
- Chọn một suất chiếu rồi bấm `Tiếp tục` để sang chọn ghế.

## 3. Tối đa 8 ghế
- Mobile chặn chọn ghế thứ 9.
- Hiển thị `Đã chọn x/8 ghế`.
- Backend cũng kiểm tra tối đa 8 ghế để tránh client gửi vượt giới hạn.
- Backend còn kiểm tra ghế trùng.

## Các file chính
### React Native
- `app/movie-detail.tsx`
- `app/select-seat.tsx`
- `services/api.ts`

### Node/Express
- `node-api/models/commentModel.ts`
- `node-api/controllers/commentController.ts`
- `node-api/routes/commentRoutes.ts`
- `node-api/controllers/bookingController.ts`
- `node-api/server.ts`

## Chạy project
Terminal 1:
```bash
cd node-api
npm install
npm run dev
```

Terminal 2:
```bash
npm install
npx expo start
```

> Nhớ sửa `baseURL` trong `services/api.ts` thành IP máy chạy backend nếu điện thoại thật không truy cập được API.

## Upload GitHub
```bash
git init
git add .
git commit -m "feat: add comments showtimes and max 8 seats"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Không upload `node_modules`, `.expo` hoặc file `.env` chứa secret lên GitHub.
