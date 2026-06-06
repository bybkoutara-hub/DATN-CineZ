import axios from "axios";

// Dùng trực tiếp hàm create
const api = axios.create({
  baseURL: "http://192.168.50.114:3000/api", // (Hoặc localhost tùy máy bạn)
  timeout: 10000,
});

export default api;
