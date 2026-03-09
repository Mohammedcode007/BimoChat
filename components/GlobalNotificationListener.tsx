// import { RootState } from "@/redux/store";
// import { showNotificationToast } from "@/utils/notificationToast";
// import { Audio } from "expo-av";
// import { useEffect, useRef } from "react";
// import { useSelector } from "react-redux";

// type NotificationItem = {
//   _id: string;
//   type: string;
//   body: string;
//   isRead: boolean;
//   createdAt: string;
//   relatedTweet?: string;
//   relatedChat?: string;
//   relatedRoom?: string;
//   sender?: {
//     _id: string;
//     username: string;
//     avatar?: string;
//   };
// };

// export default function GlobalNotificationListener() {
//   const notifications = useSelector(
//     (state: RootState) => state.notification.notifications
//   );

//   const didInitRef = useRef(false);
//   const prevIdsRef = useRef<string[]>([]);
//   const soundRef = useRef<Audio.Sound | null>(null);

//   const playNotificationSound = async () => {
//     try {
//       if (soundRef.current) {
//         try {
//           await soundRef.current.unloadAsync();
//         } catch {}
//         soundRef.current = null;
//       }

//       await Audio.setAudioModeAsync({
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: false,
//         shouldDuckAndroid: true,
//         playThroughEarpieceAndroid: false,
//       });

//       const { sound } = await Audio.Sound.createAsync(
//         require("@/assets/sounds/notification.mp3"),
//         { shouldPlay: true }
//       );

//       soundRef.current = sound;

//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (!status.isLoaded) return;
//         if (status.didJustFinish) {
//           sound.unloadAsync().catch(() => {});
//           if (soundRef.current === sound) {
//             soundRef.current = null;
//           }
//         }
//       });
//     } catch (e) {
//       console.log("Notification sound failed:", e);
//     }
//   };

//   useEffect(() => {
//     const list = Array.isArray(notifications) ? notifications : [];
//     const currentIds = list.map((n: NotificationItem) => n._id);

//     if (!didInitRef.current) {
//       didInitRef.current = true;
//       prevIdsRef.current = currentIds;
//       return;
//     }

//     const prevSet = new Set(prevIdsRef.current);
//     const newItems = list.filter((n: NotificationItem) => !prevSet.has(n._id));

//     if (newItems.length > 0) {
//       const latest = [...newItems].sort(
//         (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       )[0];

//       playNotificationSound();
//       showNotificationToast(latest);
//     }

//     prevIdsRef.current = currentIds;
//   }, [notifications]);

//   useEffect(() => {
//     return () => {
//       if (soundRef.current) {
//         soundRef.current.unloadAsync().catch(() => {});
//         soundRef.current = null;
//       }
//     };
//   }, []);

//   return null;
// }
import { RootState } from "@/redux/store";
import { getNotificationSoundEnabled } from "@/services/localSettings.service";
import { showNotificationToast } from "@/utils/notificationToast";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

type NotificationItem = {
  _id: string;
  type: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedTweet?: string;
  relatedChat?: string;
  relatedRoom?: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
};

const SOUND_COOLDOWN_MS = 1800; // منع تكرار الصوت بسرعة
const TOAST_BATCH_WINDOW_MS = 1200; // دمج الإشعارات المتتابعة
const MAX_BATCH_SIZE = 5; // أقصى عدد ندمجه في دفعة واحدة

export default function GlobalNotificationListener() {
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  );

  // غيّر هذا السطر حسب اسم الحقل الحقيقي عندك
  const activeChatId = useSelector(
    (state: RootState) => state.chat?.activeChatId || null
  );

  const didInitRef = useRef(false);
  const prevIdsRef = useRef<string[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  const isPlayingSoundRef = useRef(false);
  const soundQueuedRef = useRef(false);
  const lastSoundAtRef = useRef(0);

  const pendingToastItemsRef = useRef<NotificationItem[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldSkipSoundForNotification = (item: NotificationItem) => {
    // لا تشغّل الصوت إذا كان المستخدم داخل نفس الشات المفتوح
    if (item.relatedChat && activeChatId && item.relatedChat === activeChatId) {
      return true;
    }

    return false;
  };

  const canPlaySoundNow = () => {
    const now = Date.now();
    return now - lastSoundAtRef.current >= SOUND_COOLDOWN_MS;
  };

  const unloadCurrentSound = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.unloadAsync();
    } catch {}

    soundRef.current = null;
  };

  const playNotificationSoundNow = async () => {
    try {
      const isSoundEnabled = await getNotificationSoundEnabled();
      if (!isSoundEnabled) return;

      if (isPlayingSoundRef.current) {
        soundQueuedRef.current = true;
        return;
      }

      if (!canPlaySoundNow()) {
        soundQueuedRef.current = true;
        return;
      }

      isPlayingSoundRef.current = true;
      lastSoundAtRef.current = Date.now();

      await unloadCurrentSound();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/notification.mp3"),
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }

          isPlayingSoundRef.current = false;

          if (soundQueuedRef.current) {
            soundQueuedRef.current = false;

            const wait = Math.max(
              0,
              SOUND_COOLDOWN_MS - (Date.now() - lastSoundAtRef.current)
            );

            setTimeout(() => {
              playNotificationSoundNow().catch(() => {});
            }, wait);
          }
        }
      });
    } catch (e) {
      isPlayingSoundRef.current = false;
      console.log("Notification sound failed:", e);
    }
  };

  const buildMergedToast = (items: NotificationItem[]): NotificationItem => {
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latest = sorted[0];
    const count = sorted.length;

    if (count === 1) {
      return latest;
    }

    const firstSender = latest.sender?.username || "مستخدم";
    const sameType = sorted.every((item) => item.type === latest.type);

    let body = `${count} إشعارات جديدة`;

    if (sameType && latest.type === "message") {
      body = `${count} رسائل جديدة`;
    } else if (sameType && latest.type === "like") {
      body = `${count} إعجابات جديدة`;
    } else if (sameType && latest.type === "follow") {
      body = `${count} متابعات جديدة`;
    } else if (sameType && latest.type === "comment") {
      body = `${count} تعليقات جديدة`;
    } else if (sameType && latest.type === "friend_request") {
      body = `${count} طلبات صداقة جديدة`;
    } else if (count === 2) {
      body = `${firstSender} وآخر أرسلوا إشعارات جديدة`;
    }

    return {
      ...latest,
      body,
    };
  };

  const flushToastBatch = () => {
    const items = pendingToastItemsRef.current;

    if (!items.length) return;

    const merged = buildMergedToast(items);
    showNotificationToast(merged);

    pendingToastItemsRef.current = [];
    toastTimerRef.current = null;
  };

  const enqueueToast = (items: NotificationItem[]) => {
    pendingToastItemsRef.current = [
      ...pendingToastItemsRef.current,
      ...items,
    ].slice(-MAX_BATCH_SIZE);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      flushToastBatch();
    }, TOAST_BATCH_WINDOW_MS);
  };

  useEffect(() => {
    const run = async () => {
      const list = Array.isArray(notifications) ? notifications : [];
      const currentIds = list.map((n: NotificationItem) => n._id);

      if (!didInitRef.current) {
        didInitRef.current = true;
        prevIdsRef.current = currentIds;
        return;
      }

      const prevSet = new Set(prevIdsRef.current);

      const newItems = list
        .filter((n: NotificationItem) => !prevSet.has(n._id))
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      if (newItems.length > 0) {
        enqueueToast(newItems);

        const shouldPlayForAnyItem = newItems.some(
          (item) => !shouldSkipSoundForNotification(item)
        );

        if (shouldPlayForAnyItem) {
          await playNotificationSoundNow();
        }
      }

      prevIdsRef.current = currentIds;
    };

    run().catch((error) => {
      console.log("GlobalNotificationListener error:", error);
    });
  }, [notifications, activeChatId]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }

      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      pendingToastItemsRef.current = [];
      isPlayingSoundRef.current = false;
      soundQueuedRef.current = false;
    };
  }, []);

  return null;
}