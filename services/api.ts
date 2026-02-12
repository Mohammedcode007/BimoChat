import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.101:5000/api",
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token attached from AsyncStorage");
    } else {
      console.log("⚠️ No token found in storage");
    }

    return config;
  },
  error => Promise.reject(error)
);

export default api;
