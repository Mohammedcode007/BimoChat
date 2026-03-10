
// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { setForceUpdate } from "@/redux/slices/appSlice";
import type { AppDispatch } from "@/redux/store";

let appDispatch: AppDispatch | null = null;

/**
 * ✅ يتم استدعاؤها مرة واحدة بعد إنشاء الـ store
 * لمنع circular dependency (لا تستورد store هنا)
 */
export const injectDispatch = (dispatch: AppDispatch) => {
  console.log("🟢 injectDispatch called");
  appDispatch = dispatch;
};

/**
 * ✅ استخراج نسخة التطبيق الصحيحة
 * - في Expo Go / Dev: الأفضل Constants.expoConfig.version
 * - في Build production: يمكن الاعتماد على nativeApplicationVersion أيضًا
 */
const getAppVersion = () => {
  const v =
    Constants.expoConfig?.version ||
    // بعض البيئات القديمة:
    // @ts-ignore
    Constants.manifest?.version ||
    Application.nativeApplicationVersion ||
    "0.0.0";
  return String(v);
};

/**
 * ✅ استخراج رقم البناء Build (اختياري لكنه مفيد)
 */
const getBuildNumber = () => {
  const b =
    Constants.expoConfig?.android?.versionCode ??
    // iOS buildNumber يكون string غالبًا
    Constants.expoConfig?.ios?.buildNumber ??
    // fallback
    Application.nativeBuildVersion ??
    "0";
  return String(b);
};

const api = axios.create({
  baseURL: "https://api.te-bot.site/api",
  timeout: 20000,
});
// const api = axios.create({
// baseURL: "http://192.168.0.101:5000/api",
//   timeout: 20000,
// });
/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    const appVersion = getAppVersion(); // ✅ مثل 1.0.0
    const buildNumber = getBuildNumber(); // ✅ مثل 54
    const platform = Platform.OS; // android | ios

    // ✅ Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Headers for Force Update
    config.headers["x-app-version"] = appVersion;
    config.headers["x-app-build"] = buildNumber; // اختياري
    config.headers["x-platform"] = platform;

 

    return config;
  },
  (error) => {
    console.log("❌ REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const url = error?.config?.url;

  

    // ✅ Force Update
    if (status === 426 && data?.code === "FORCE_UPDATE") {
    

      if (!appDispatch) {
      }

      appDispatch?.(
        setForceUpdate({
          required: true,
          storeUrl: data.storeUrl,
          message: data.message_ar || data.message_en,
          minSupportedVersion: data.minSupportedVersion,
          latestVersion: data.latestVersion,
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;