import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
