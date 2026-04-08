
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

  if (isExpoGo) {
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
    return null;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;

  try {
    await api.post("/notifications/device-token", {
      token,
      platform: Platform.OS,
    });
  } catch (error: any) {
  
  }

  // منع تكرار listener
  if (!pushTokenSub) {
    pushTokenSub = Notifications.addPushTokenListener(async (event) => {
      try {

        await api.post("/notifications/device-token", {
          token: event.data,
          platform: Platform.OS,
        });

      } catch (error: any) {
     
      }
    });
  }

  return token;
}

export async function registerFCMListeners(onOpen?: (data: any) => void) {

  const sub1 = Notifications.addNotificationReceivedListener((notification) => {
   
  });

  const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {

    const data = response.notification.request.content.data || {};

    onOpen?.(data);
  });

  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (lastResponse) {
    const data = lastResponse.notification.request.content.data || {};

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

    if (isExpoGo) {
      return;
    }

    const token = (await Notifications.getDevicePushTokenAsync()).data;

    if (!token) {
      return;
    }

    await api.delete("/notifications/device-token", {
      data: {
        token,
        platform: Platform.OS,
      },
    });

  } catch (error: any) {

  }
}