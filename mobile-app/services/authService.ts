// services/authService.ts
import api from "./api";

// Hàm đăng nhập (nếu đã có thì giữ nguyên)
export const loginApi = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm đăng ký mới
export const registerApi = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      fullName,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
