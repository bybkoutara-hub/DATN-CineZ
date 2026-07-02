import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_HOST = "10.109.41.195"; // Sửa IP này theo IP máy tính (chạy ipconfig để xem)
const API_PORT = "5000";

const api = axios.create({
  baseURL: `http://${API_HOST}:${API_PORT}/api`,
  timeout: 10000,
});

const isWeb = typeof window !== "undefined" && window.localStorage;

const getToken = async (): Promise<string | null> => {
  try {
    if (isWeb) return window.localStorage.getItem("userToken");
    return await AsyncStorage.getItem("userToken");
  } catch {
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
