import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

function getApiHost(): string {
  if (__DEV__) {
    const debuggerHost = Constants.expoGoConfig?.debuggerHost;
    if (debuggerHost) {
      return debuggerHost.split(":")[0];
    }
  }
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }
  return "localhost";
}

const api = axios.create({
  baseURL: `http://${getApiHost()}:5000/api`,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
