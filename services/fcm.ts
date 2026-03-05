import api from "@/services/api"; // عدّل المسار حسب مشروعك
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export async function initFCMAndSyncToken() {
  // 1) صلاحيات الإشعارات (Android 13+ و iOS)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log("❌ Notification permission not granted");
    return null;
  }

  // 2) احصل على FCM Token
  const token = await messaging().getToken();
  console.log("✅ FCM Token:", token);

  // 3) ارسله للباك
  await api.post("/notifications/device-token", { token, platform: Platform.OS });

  // 4) لو تغير التوكن لاحقاً (مهم)
  messaging().onTokenRefresh(async (newToken) => {
    try {
      await api.post("/notifications/device-token", {
        token: newToken,
        platform: Platform.OS,
      });
    } catch (e) {
      console.log("Token refresh sync error:", e);
    }
  });

  return token;
}