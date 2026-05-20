
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { setForceUpdate } from "@/redux/slices/appSlice";
import { forceLogout } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { isTokenExpired } from "@/utils/token";

let appDispatch: AppDispatch | null = null;
let isHandlingAuthError = false;

const DEVICE_ID_KEY = "bimo_device_id";

export const injectDispatch = (dispatch: AppDispatch) => {
  appDispatch = dispatch;
};

const getAppVersion = () => {
  const v =
    Constants.expoConfig?.version ||
    // @ts-ignore
    Constants.manifest?.version ||
    Application.nativeApplicationVersion ||
    "0.0.0";

  return String(v);
};

const getBuildNumber = () => {
  const b =
    Constants.expoConfig?.android?.versionCode ??
    Constants.expoConfig?.ios?.buildNumber ??
    Application.nativeBuildVersion ??
    "0";

  return String(b);
};

const createLocalDeviceId = () => {
  const random1 = Math.random().toString(16).slice(2);
  const random2 = Math.random().toString(16).slice(2);
  const time = Date.now().toString(36);
  const platform = Platform.OS;

  return `bimo-${platform}-${time}-${random1}-${random2}`;
};

const getDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = createLocalDeviceId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

const api = axios.create({
  baseURL: "http://192.168.0.100:5000/api",
  timeout: 20000,
});

// const api = axios.create({
//   baseURL: "https://te-bot.site/api",
//   timeout: 20000,
// });

const clearLocalSession = async () => {
  await AsyncStorage.multiRemove(["token", "user"]);
  appDispatch?.(forceLogout());
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    const appVersion = getAppVersion();
    const buildNumber = getBuildNumber();
    const platform = Platform.OS;
    const deviceId = await getDeviceId();

    config.headers = config.headers || {};

    // ✅ مهم للحظر حتى قبل تسجيل الدخول أو التسجيل
    config.headers["x-device-id"] = deviceId;

    config.headers["x-app-version"] = appVersion;
    config.headers["x-app-build"] = buildNumber;
    config.headers["x-platform"] = platform;

    if (token) {
      const expired = isTokenExpired(token);

      if (expired) {
        if (!isHandlingAuthError) {
          isHandlingAuthError = true;
          await clearLocalSession();

          setTimeout(() => {
            isHandlingAuthError = false;
          }, 500);
        }

        return Promise.reject(new Error("Token expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 426 && data?.code === "FORCE_UPDATE") {
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

    const message = String(data?.message || "").toLowerCase();

const isBlockedError =
  status === 403 && String(data?.code || "").toUpperCase() === "BLOCKED";

const isAuthError =
  !isBlockedError &&
  (
    status === 401 ||
    status === 403 ||
    message.includes("token") ||
    message.includes("jwt") ||
    message.includes("expired") ||
    message.includes("unauthorized")
  );

    if (isAuthError && !isHandlingAuthError) {
      isHandlingAuthError = true;

      try {
        await clearLocalSession();
      } finally {
        setTimeout(() => {
          isHandlingAuthError = false;
        }, 500);
      }
    }

    return Promise.reject(error);
  }
);

export default api;