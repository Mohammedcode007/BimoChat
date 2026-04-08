
import api from "@/services/api";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const isExpoGo = Constants.appOwnership === "expo";

let pushTokenSub: Notifications.EventSubscription | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function initFCMAndSyncToken() {
  console.log("🔔 initFCMAndSyncToken started");

  if (isExpoGo) {
    console.log("🚫 Remote push غير مدعوم في Expo Go على Android SDK 53+");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Notification permission not granted");
    return null;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log("✅ Device push token:", token);

  try {
    await api.post("/notifications/device-token", {
      token,
      platform: Platform.OS,
    });
    console.log("✅ Token synced to backend");
  } catch (error: any) {
    console.log(
      "❌ Failed to send token to backend",
      error?.response?.data || error?.message
    );
  }

  // منع تكرار listener
  if (!pushTokenSub) {
    pushTokenSub = Notifications.addPushTokenListener(async (event) => {
      try {
        console.log("🔁 Push token refreshed:", event.data);

        await api.post("/notifications/device-token", {
          token: event.data,
          platform: Platform.OS,
        });

        console.log("✅ Refreshed token synced");
      } catch (error: any) {
        console.log(
          "❌ Failed to sync refreshed token",
          error?.response?.data || error?.message
        );
      }
    });
  }

  return token;
}

export async function registerFCMListeners(onOpen?: (data: any) => void) {
  console.log("📡 registerFCMListeners called");

  const sub1 = Notifications.addNotificationReceivedListener((notification) => {
    console.log("📩 Foreground notification received");
    console.log("title:", notification.request.content.title);
    console.log("body:", notification.request.content.body);
    console.log("data:", notification.request.content.data);
  });

  const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("📌 User opened notification");

    const data = response.notification.request.content.data || {};
    console.log("notification open data:", data);

    onOpen?.(data);
  });

  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (lastResponse) {
    const data = lastResponse.notification.request.content.data || {};
    console.log("📦 Last notification response data:", data);

    onOpen?.(data);
    await Notifications.clearLastNotificationResponseAsync();
  }

  return () => {
    sub1.remove();
    sub2.remove();
  };
}

export function cleanupFCMTokenListener() {
  if (pushTokenSub) {
    pushTokenSub.remove();
    pushTokenSub = null;
  }
}

export async function removeFCMTokenFromBackend() {
  try {
    console.log("🗑️ removeFCMTokenFromBackend started");

    if (isExpoGo) {
      console.log("🚫 Expo Go -> skip token removal");
      return;
    }

    const token = (await Notifications.getDevicePushTokenAsync()).data;

    if (!token) {
      console.log("⚠️ No device push token found");
      return;
    }

    await api.delete("/notifications/device-token", {
      data: {
        token,
        platform: Platform.OS,
      },
    });

    console.log("✅ Device token removed from backend");
  } catch (error: any) {
    console.log(
      "❌ Failed to remove device token from backend",
      error?.response?.data || error?.message
    );
  }
}