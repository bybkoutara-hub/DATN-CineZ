// services/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Hàm đăng nhập: gọi API, lưu token + thông tin user vào AsyncStorage
export const loginApi = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const result = response.data;

    // Lưu token để interceptor tự đính kèm cho các request sau,
    // và lưu thông tin user để màn Profile hiển thị nhanh không cần gọi lại API.
    if (result?.token) {
      await AsyncStorage.setItem("userToken", result.token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(result.data || {}));
    }
    return result;
  } catch (error) {
    throw error;
  }
};

// Hàm đăng ký mới (backend dùng trường `fullName` để lưu tên hiển thị)
export const registerApi = async (
  email: string,
  password: string,
  fullName?: string,
  phone?: string,
) => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      fullName,
      phone,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy thông tin Profile mới nhất từ server (yêu cầu token)
export const getProfileApi = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

// Lấy nhanh thông tin user đã lưu trong máy (không cần gọi mạng)
export const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Kiểm tra đã đăng nhập hay chưa
export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem("userToken");
  return !!token;
};

// Đăng xuất: xóa token + thông tin user
export const logoutApi = async () => {
  await AsyncStorage.multiRemove(["userToken", "userInfo"]);
};
