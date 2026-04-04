// import {
//   acceptFriendRequest,
//   rejectFriendRequest
// } from '@/redux/slices/friendSlice';

// import {
//   deleteNotification,
//   markNotificationAsRead
// } from '@/redux/slices/notificationSlice';

// import { AppDispatch, RootState } from '@/redux/store';
// import { Ionicons } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { useDispatch, useSelector } from 'react-redux';

// export default function FriendRequestModal() {

//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { notificationId, senderId } = useLocalSearchParams();

//   const { notifications } = useSelector(
//     (state: RootState) => state.notification
//   );

//   const notification = notifications.find(
//     n => n._id === notificationId
//   );

//   const [loading, setLoading] = useState(false);

//   /* ================= AUTO CLOSE IF REQUEST DISAPPEARS ================= */

//   useEffect(() => {
//     if (!notification) {
//       router.back();
//     }
//   }, [notification]);

//   if (!notification) return null;

//   const sender = notification.sender;

//   /* ================= HANDLE ACCEPT ================= */

//   const handleAccept = async () => {

//     if (loading) return;

//     setLoading(true);

//     await dispatch(acceptFriendRequest(senderId as string));
//     await dispatch(markNotificationAsRead(notificationId as string));
//     await dispatch(deleteNotification(notificationId as string));

//     setLoading(false);
//     router.back();
//   };

//   /* ================= HANDLE REJECT ================= */

//   const handleReject = async () => {

//     if (loading) return;

//     setLoading(true);

//     await dispatch(rejectFriendRequest(senderId as string));
//     await dispatch(markNotificationAsRead(notificationId as string));
//     await dispatch(deleteNotification(notificationId as string));

//     setLoading(false);
//     router.back();
//   };

//   return (

//     <View style={styles.overlay}>

//       <Animated.View
//         entering={FadeInDown.springify()}
//         style={styles.sheet}
//       >

//         {/* Avatar */}
//         <Image
//           source={{
//             uri: sender?.avatar ||
//               'https://i.pravatar.cc/150'
//           }}
//           style={styles.avatar}
//         />

//         {/* Username */}
//         <View style={styles.nameRow}>
//           <Text style={styles.username}>
//             {sender?.username}
//           </Text>

//           {sender?.isVerified && (
//             <Ionicons
//               name="checkmark-circle"
//               size={18}
//               color="#2563EB"
//             />
//           )}
//         </View>

//         <Text style={styles.subtitle}>
//           أرسل لك طلب صداقة
//         </Text>

//         {/* Buttons */}
//         <View style={styles.buttons}>

//           <TouchableOpacity
//             disabled={loading}
//             style={[styles.button, styles.accept]}
//             onPress={handleAccept}
//           >
//             {loading
//               ? <ActivityIndicator color="#fff" />
//               : <Text style={styles.buttonText}>قبول</Text>}
//           </TouchableOpacity>

//           <TouchableOpacity
//             disabled={loading}
//             style={[styles.button, styles.reject]}
//             onPress={handleReject}
//           >
//             {loading
//               ? <ActivityIndicator color="#fff" />
//               : <Text style={styles.buttonText}>رفض</Text>}
//           </TouchableOpacity>

//         </View>

//       </Animated.View>

//     </View>
//   );
// }

// const styles = StyleSheet.create({

//   overlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.4)'
//   },

//   sheet: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     alignItems: 'center'
//   },

//   avatar: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     marginBottom: 16
//   },

//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6
//   },

//   username: {
//     fontSize: 18,
//     fontWeight: '700'
//   },

//   subtitle: {
//     marginTop: 6,
//     color: '#64748B',
//     marginBottom: 24
//   },

//   buttons: {
//     flexDirection: 'row',
//     gap: 16
//   },

//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 12,
//     minWidth: 110,
//     alignItems: 'center'
//   },

//   accept: {
//     backgroundColor: '#16A34A'
//   },

//   reject: {
//     backgroundColor: '#DC2626'
//   },

//   buttonText: {
//     color: '#fff',
//     fontWeight: '600'
//   }

// });

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/redux/slices/friendSlice";
import {
  deleteNotification,
  markNotificationAsRead,
} from "@/redux/slices/notificationSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export default function FriendRequestModal() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t, isRTL } = useTranslation();

  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const { notificationId, senderId } = useLocalSearchParams();

  const { notifications } = useSelector(
    (state: RootState) => state.notification
  );

  const notification = notifications.find((n) => n._id === notificationId);

  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  useEffect(() => {
    if (!notification) {
      router.back();
    }
  }, [notification, router]);

  if (!notification) return null;

  const sender = notification.sender;

  const handleAccept = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await dispatch(acceptFriendRequest(senderId as string));
      await dispatch(markNotificationAsRead(notificationId as string));
      await dispatch(deleteNotification(notificationId as string));

      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await dispatch(rejectFriendRequest(senderId as string));
      await dispatch(markNotificationAsRead(notificationId as string));
      await dispatch(deleteNotification(notificationId as string));

      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View entering={FadeInDown.springify()} style={styles.sheet}>
        <Image
          source={{
            uri: sender?.avatar || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
        />

        <View
          style={[
            styles.nameRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <Text style={styles.username}>{sender?.username}</Text>

          {sender?.isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={theme.info}
            />
          )}
        </View>

        <Text
          style={[
            styles.subtitle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {t("friendRequestModal.sentYouRequest")}
        </Text>

        <View
          style={[
            styles.buttons,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity
            disabled={loading}
            style={[styles.button, styles.accept]}
            onPress={handleAccept}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {t("friendRequestModal.accept")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            style={[styles.button, styles.reject]}
            onPress={handleReject}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {t("friendRequestModal.reject")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark
        ? "rgba(0,0,0,0.55)"
        : "rgba(0,0,0,0.4)",
    },

    sheet: {
      backgroundColor: theme.card,
      padding: 24,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.24 : 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -6 },
      elevation: 10,
    },

    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
    },

    nameRow: {
      alignItems: "center",
      gap: 6,
    },

    username: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },

    subtitle: {
      marginTop: 6,
      color: theme.mutedText,
      marginBottom: 24,
      fontSize: 14,
      fontWeight: "600",
    },

    buttons: {
      gap: 16,
    },

    button: {
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
      minWidth: 110,
      alignItems: "center",
      justifyContent: "center",
    },

    accept: {
      backgroundColor: theme.success ?? "#16A34A",
    },

    reject: {
      backgroundColor: theme.danger ?? "#DC2626",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
    },
  });
}