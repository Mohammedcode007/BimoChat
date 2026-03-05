import api from "@/services/api";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * Expo Go على Android (SDK53+) لا يدعم Remote Push عبر expo-notifications
 */
const isExpoGo = Constants.appOwnership === "expo";

export async function initFCMAndSyncToken() {

  console.log("🔔 initFCMAndSyncToken started");

  if (!Device.isDevice) {
    console.log("❌ Push notifications require a real device (not emulator).");
    return null;
  }

  if (isExpoGo) {
    console.log("🚫 Remote Push غير مدعوم داخل Expo Go (SDK53+). استخدم Development Build.");
    return null;
  }

  console.log("📦 Loading expo-notifications dynamically...");

  const Notifications = await import("expo-notifications");

  console.log("✅ expo-notifications loaded");

  /* =====================================================
     FOREGROUND NOTIFICATION BEHAVIOR
  ===================================================== */

  Notifications.setNotificationHandler({
    handleNotification: async () => {
      console.log("📩 Notification received while app in foreground");

      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });

  /* =====================================================
     ANDROID CHANNEL
  ===================================================== */

  if (Platform.OS === "android") {

    console.log("📱 Setting Android notification channel...");

    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });

    console.log("✅ Android notification channel created");
  }

  /* =====================================================
     PERMISSION
  ===================================================== */

  console.log("🔐 Checking notification permission...");

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  console.log("🔎 Existing permission status:", existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {

    console.log("🪪 Requesting notification permission...");

    const { status } = await Notifications.requestPermissionsAsync();

    finalStatus = status;

    console.log("📊 Permission result:", status);
  }

  if (finalStatus !== "granted") {

    console.log("❌ Notification permission not granted");

    return null;
  }

  /* =====================================================
     GET FCM TOKEN
  ===================================================== */

  console.log("📡 Requesting FCM token...");

  const token = (await Notifications.getDevicePushTokenAsync()).data;

  console.log("✅ FCM Token received:");
  console.log(token);

  /* =====================================================
     SEND TOKEN TO BACKEND
  ===================================================== */

  try {

    console.log("📤 Sending token to backend...");

    const response = await api.post("/notifications/device-token", {
      token,
      platform: Platform.OS,
    });

    console.log("✅ Token sent to backend successfully");
    console.log("📨 Backend response:", response.data);

  } catch (error: any) {

    console.log("❌ Failed to send token to backend");

    console.log(error?.response?.data || error.message);
  }

  /* =====================================================
     TOKEN REFRESH LISTENER
  ===================================================== */

  Notifications.addPushTokenListener(async (event) => {

    console.log("🔁 FCM token refreshed:");
    console.log(event.data);

    try {

      console.log("📤 Sending refreshed token to backend...");

      await api.post("/notifications/device-token", {
        token: event.data,
        platform: Platform.OS,
      });

      console.log("✅ Refreshed token synced");

    } catch (e) {

      console.log("❌ Failed to sync refreshed token", e);
    }
  });

  return token;
}

/**
 * REGISTER LISTENERS
 */

export async function registerFCMListeners() {

  console.log("📡 registerFCMListeners called");

  if (isExpoGo) {

    console.log("⚠️ Skipping listeners because running in Expo Go");

    return () => {};
  }

  const Notifications = await import("expo-notifications");

  console.log("✅ Notification listeners registered");

  const sub1 =
    Notifications.addNotificationReceivedListener((notification) => {

      console.log("📩 Foreground notification received:");

      console.log(notification.request.content);
    });

  const sub2 =
    Notifications.addNotificationResponseReceivedListener((response) => {

      console.log("📌 User opened notification");

      console.log(response.notification.request.content.data);
    });

  return () => {

    console.log("🧹 Removing notification listeners");

    sub1.remove();
    sub2.remove();
  };
}