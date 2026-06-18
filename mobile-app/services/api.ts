import axios from "axios";

// Dùng trực tiếp hàm create
const api = axios.create({
  // Đổi IP thành IP máy đang chạy API (không dùng localhost khi test trên thiết bị thật).
  // Port 5000 phải khớp với api/server.ts (PORT mặc định).
  baseURL: "http://192.168.50.114:5000/api",
  timeout: 10000,
});

export default api;
