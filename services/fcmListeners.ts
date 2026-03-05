import messaging from "@react-native-firebase/messaging";

export function registerFCMListeners() {
  // عندما التطبيق مفتوح (Foreground)
  messaging().onMessage(async (remoteMessage) => {
    console.log("📩 Foreground FCM:", remoteMessage?.notification, remoteMessage?.data);
    // هنا إن أردت: تعرض Banner داخل التطبيق أو تحدث Redux
  });

  // عندما التطبيق بالخلفية وتم فتحه عبر إشعار
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("📌 Opened from background:", remoteMessage?.data);
  });

  // عندما التطبيق كان مغلق وتم فتحه عبر إشعار
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("📌 Opened from killed:", remoteMessage?.data);
      }
    });
}