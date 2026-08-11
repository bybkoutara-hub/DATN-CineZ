import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Dùng trực tiếp hàm create
const api = axios.create({
  baseURL: "http://172.16.98.115:5000/api", // IP máy thật - đổi theo mạng của bạn
  timeout: 10000,
});

// Tự động đính kèm JWT token (nếu đã đăng nhập) vào header Authorization
// cho mọi request, nhờ vậy các API cần bảo vệ (profile, lịch sử vé...) hoạt động.
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Bỏ qua nếu không đọc được token, request vẫn gửi như khách
  }
  return config;
});

export default api;
