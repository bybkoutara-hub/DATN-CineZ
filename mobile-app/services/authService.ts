import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const isWeb = typeof window !== "undefined" && window.localStorage;

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) return window.localStorage.getItem(key);
      return await AsyncStorage.getItem(key);
    } catch { return null; }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) { window.localStorage.setItem(key, value); return; }
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      if (isWeb) { keys.forEach(k => window.localStorage.removeItem(k)); return; }
      await AsyncStorage.multiRemove(keys);
    } catch {}
  },
};

export const loginApi = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  const result = response.data;
  const token = result?.data?.token || result?.token;
  if (token) {
    await storage.setItem("userToken", token);
    await storage.setItem("userInfo", JSON.stringify(result?.data?.user || result?.data || {}));
  }
  return result;
};

export const registerApi = async (
  email: string,
  password: string,
  name?: string,
  phone?: string,
) => {
  const response = await api.post("/auth/register", { email, password, name, phone });
  return response.data;
};

export const getProfileApi = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

export const updateProfileApi = async (data: { name?: string; phone?: string }) => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

export const changePasswordApi = async (currentPassword: string, newPassword: string) => {
  const response = await api.put("/auth/change-password", { currentPassword, newPassword });
  return response.data;
};

export const getStoredUser = async () => {
  try {
    const raw = await storage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const isLoggedIn = async () => {
  const token = await storage.getItem("userToken");
  return !!token;
};

export const logoutApi = async () => {
  await storage.multiRemove(["userToken", "userInfo"]);
};
