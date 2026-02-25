
// import {
//   deleteNotification,
//   markNotificationAsRead,
// } from '@/redux/slices/notificationSlice';
// import { AppDispatch, RootState } from '@/redux/store';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useMemo } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// /* ================= TYPES ================= */

// interface NotificationItem {
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
// }

// /* ================= SCREEN ================= */

// export default function NotificationsScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { notifications, loading } = useSelector(
//     (state: RootState) => state.notification
//   );

//   /* ================= GROUPING ================= */

//   const groupedNotifications = useMemo(() => {
//     const map: Record<string, any> = {};

//     notifications.forEach((item: NotificationItem) => {

//       // لا نقوم بتجميع طلبات الصداقة
//       if (item.type === 'friend_request') {
//         map[item._id] = { ...item, count: 1, users: [item.sender] };
//         return;
//       }

//       const key =
//         `${item.sender?._id}-${item.type}-${item.relatedTweet || ''}`;

//       if (!map[key]) {
//         map[key] = {
//           ...item,
//           count: 1,
//           users: [item.sender],
//         };
//       } else {
//         map[key].count += 1;
//         map[key].users.push(item.sender);
//       }
//     });

//     return Object.values(map);
//   }, [notifications]);

//   /* ================= ICONS ================= */

//   const getIcon = (type: string) => {
//     switch (type) {
//       case 'tweet_like':
//         return { name: 'heart', color: '#EF4444' };

//       case 'tweet_reply':
//         return { name: 'chatbubble', color: '#10B981' };

//       case 'follow':
//         return { name: 'person-add', color: '#2563EB' };

//       case 'friend_request':
//         return { name: 'person-add-outline', color: '#2563EB' };

//       case 'message':
//         return { name: 'mail', color: '#7C3AED' };

//       default:
//         return { name: 'notifications', color: '#6B7280' };
//     }
//   };

//   /* ================= PRESS HANDLER ================= */

//   const handlePress = (item: NotificationItem) => {

//     if (!item.isRead) {
//       dispatch(markNotificationAsRead(item._id));
//     }

//     switch (item.type) {

//       case 'friend_request':
//         router.push({
//           pathname: '/friend-request-modal',
//           params: {
//             notificationId: item._id,
//             senderId: item.sender?._id
//           }
//         });
//         break;

//       case 'tweet_like':
//       case 'tweet_reply':
//         if (item.relatedTweet) {
//           router.push(`/tweet/${item.relatedTweet}`);
//         }
//         break;

//       case 'message':
//         if (item.relatedChat) {
//           router.push(`/chat/${item.relatedChat}`);
//         }
//         break;

//       case 'room_invite':
//         if (item.relatedRoom) {
//           router.push(`/room/${item.relatedRoom}`);
//         }
//         break;

//       default:
//         break;
//     }
//   };

//   /* ================= SWIPE DELETE ================= */

//   const renderRightActions = (id: string) => (
//     <TouchableOpacity
//       style={styles.deleteBtn}
//       onPress={() => dispatch(deleteNotification(id))}
//     >
//       <Ionicons name="trash" size={20} color="#FFF" />
//     </TouchableOpacity>
//   );

//   /* ================= RENDER ================= */

//   return (
//     <SafeAreaView style={styles.safe}>

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>الإشعارات</Text>
//       </View>

//       <FlatList
//         data={groupedNotifications}
//         keyExtractor={(item: any) => item._id}
//         contentContainerStyle={{ padding: 16 }}
//         refreshing={loading}
//         ListEmptyComponent={
//           loading ? (
//             <ActivityIndicator />
//           ) : (
//             <Text style={{ textAlign: 'center', marginTop: 40 }}>
//               لا توجد إشعارات
//             </Text>
//           )
//         }
//         renderItem={({ item, index }) => {

//           const icon = getIcon(item.type);

//           return (
//             <Animated.View entering={FadeInDown.delay(index * 60)}>

//               <Swipeable
//                 renderRightActions={() =>
//                   renderRightActions(item._id)
//                 }
//               >

//                 <TouchableOpacity
//                   onPress={() => handlePress(item)}
//                   style={[
//                     styles.item,
//                     !item.isRead && styles.unread,
//                   ]}
//                 >

//                   <View style={styles.iconBox}>
//                     <Ionicons
//                       name={icon.name as any}
//                       size={18}
//                       color={icon.color}
//                     />
//                   </View>

//                   <View style={{ flex: 1 }}>

//                     <Text style={styles.title}>
//                       {item.count > 1
//                         ? `${item.users[0]?.username} و ${item.count - 1} آخرين`
//                         : item.sender?.username}
//                     </Text>

//                     <Text style={styles.body}>
//                       {item.body}
//                     </Text>

//                     <Text style={styles.time}>
//                       {new Date(item.createdAt).toLocaleString()}
//                     </Text>

//                   </View>

//                   {!item.isRead && <View style={styles.dot} />}

//                 </TouchableOpacity>

//               </Swipeable>

//             </Animated.View>
//           );
//         }}
//       />

//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({

//   safe: { flex: 1, backgroundColor: '#FFF' },

//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomWidth: 0.5,
//     borderColor: '#E5E7EB',
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   item: {
//     flexDirection: 'row',
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: '#F8FAFC',
//     marginBottom: 12,
//     alignItems: 'center',
//   },

//   unread: {
//     backgroundColor: '#EEF2FF',
//   },

//   iconBox: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#F1F5F9',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   title: {
//     fontSize: 14,
//     fontWeight: '700',
//   },

//   body: {
//     fontSize: 13,
//     marginTop: 2,
//   },

//   time: {
//     fontSize: 11,
//     color: '#94A3B8',
//     marginTop: 4,
//   },

//   dot: {
//     width: 8,
//     height: 8,
//     backgroundColor: '#2563EB',
//     borderRadius: 4,
//   },

//   deleteBtn: {
//     backgroundColor: '#EF4444',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 25,
//     borderRadius: 14,
//     marginBottom: 12,
//   },

// });


// app/(tabs)/notifications.tsx  (أو نفس مسارك الحالي)
// ✅ نسخة كاملة بتصميم أعمق/عصري + تفاصيل أكثر + دعم Dark/Light عبر theme
// ✅ كل الألوان من theme (Colors + useColorScheme)
// ✅ تجميع الإشعارات + استثناء friend_request من التجميع
// ✅ Swipe للحذف + زر “حذف” واضح
// ✅ شارات/بادجات + عدد + وقت بصيغة لطيفة
// ✅ دعم RTL (العربي) + محاذاة مناسبة

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "@/constants/theme";
import {
  deleteNotification,
  markNotificationAsRead,
} from "@/redux/slices/notificationSlice";
import { AppDispatch, RootState } from "@/redux/store";

/* ================= TYPES ================= */

interface NotificationItem {
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
}

type GroupedNotification = NotificationItem & {
  count: number;
  users: Array<NotificationItem["sender"] | undefined>;
};

/* ================= HELPERS ================= */

const safeStr = (v: any) => String(v ?? "").trim();

const formatTimeSmart = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // صيغة لطيفة بالعربي (بدون مكتبات)
  return d.toLocaleString("ar-EG", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

const buildTitleAr = (item: GroupedNotification) => {
  const first = item.users?.[0]?.username || item.sender?.username || "مستخدم";
  if ((item.count || 1) > 1) {
    const rest = Math.max(0, (item.count || 1) - 1);
    return `${first} و ${rest} آخرين`;
  }
  return first;
};

const buildSubtitleAr = (type: string) => {
  switch (type) {
    case "tweet_like":
      return "تفاعل جديد";
    case "tweet_reply":
      return "رد جديد";
    case "follow":
      return "متابع جديد";
    case "friend_request":
      return "طلب صداقة";
    case "message":
      return "رسالة جديدة";
    case "room_invite":
      return "دعوة لغرفة";
    default:
      return "إشعار";
  }
};

const getIconMeta = (type: string) => {
  switch (type) {
    case "tweet_like":
      return { name: "heart", tone: "danger" as const };
    case "tweet_reply":
      return { name: "chatbubble-ellipses", tone: "success" as const };
    case "follow":
      return { name: "person-add", tone: "primary" as const };
    case "friend_request":
      return { name: "person-add-outline", tone: "primary" as const };
    case "message":
      return { name: "mail", tone: "purple" as const };
    case "room_invite":
      return { name: "people", tone: "warning" as const };
    default:
      return { name: "notifications", tone: "muted" as const };
  }
};

const pickToneColor = (theme: any, tone: ReturnType<typeof getIconMeta>["tone"]) => {
  if (tone === "danger") return theme.danger;
  if (tone === "success") return theme.success;
  if (tone === "warning") return theme.warning;
  if (tone === "purple") return theme.purple;
  if (tone === "primary") return theme.primary;
  return theme.muted;
};

const getInitials = (name: string) => {
  const t = safeStr(name);
  if (!t) return "U";
  const parts = t.split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
};

/* ================= STYLES ================= */

const createStyles = (theme: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },

    header: {
      height: 64,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },

    headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
    headerTitle: { fontSize: 18, fontWeight: "900", color: theme.text },
    headerSubtitle: { fontSize: 12, fontWeight: "700", color: theme.textSecondary, marginTop: 2 },

    headerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.primary + "14",
      borderWidth: 1,
      borderColor: theme.primary + "25",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    headerBadgeText: { fontSize: 12, fontWeight: "900", color: theme.primary },

    listContent: { padding: 16, paddingBottom: 26 },

    // Card
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      overflow: "hidden",
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 5 },
      }),
    },

    cardUnread: {
      borderColor: theme.primary + "35",
      backgroundColor: theme.primary + "10",
    },

    cardInner: {
      flexDirection: "row-reverse", // RTL
      alignItems: "center",
      padding: 14,
      gap: 12,
    },

    // Left accent bar (يعطي عمق)
    accentBar: {
      width: 4,
      alignSelf: "stretch",
      borderRadius: 999,
      marginRight: 10,
      backgroundColor: theme.border,
      opacity: 0.9,
    },

    accentBarUnread: {
      backgroundColor: theme.primary,
    },

    // Avatar
    avatarWrap: { width: 46, height: 46, borderRadius: 23, overflow: "hidden" },
    avatar: { width: "100%", height: "100%" },

    avatarFallback: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarFallbackText: { fontWeight: "900", color: theme.text, fontSize: 14 },

    // Icon bubble
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },

    content: { flex: 1, minWidth: 0 },

    titleRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    title: {
      flex: 1,
      textAlign: "right",
      color: theme.text,
      fontSize: 14,
      fontWeight: "900",
    },

    metaChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
    },
    metaChipText: { fontSize: 11, fontWeight: "900", color: theme.textSecondary },

    body: {
      marginTop: 8,
      textAlign: "right",
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },

    footerRow: {
      marginTop: 10,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    time: { fontSize: 11, color: theme.muted, fontWeight: "800", textAlign: "right" },

    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
      borderWidth: 2,
      borderColor: theme.card,
    },

    // Swipe delete
    deleteWrap: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
      borderRadius: 18,
      marginBottom: 12,
      backgroundColor: theme.danger,
    },
    deleteText: { color: "#FFF", fontWeight: "900", marginTop: 6, fontSize: 12 },

    emptyWrap: { alignItems: "center", paddingTop: 56 },
    emptyTitle: { color: theme.text, fontSize: 16, fontWeight: "900" },
    emptySub: { color: theme.textSecondary, marginTop: 8, fontSize: 13, fontWeight: "700" },
  });

/* ================= SCREEN ================= */

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { notifications, loading } = useSelector((state: RootState) => state.notification);

  // ✅ عدّ غير المقروء
  const unreadCount = useMemo(() => {
    return (notifications || []).reduce((acc: number, n: NotificationItem) => acc + (n?.isRead ? 0 : 1), 0);
  }, [notifications]);

  /* ================= GROUPING ================= */
  const groupedNotifications: GroupedNotification[] = useMemo(() => {
    const map: Record<string, GroupedNotification> = {};

    (notifications || []).forEach((item: NotificationItem) => {
      // ✅ لا نجمع friend_request
      if (item.type === "friend_request") {
        map[item._id] = { ...item, count: 1, users: [item.sender] };
        return;
      }

      const key = `${item.sender?._id || "unknown"}-${item.type}-${item.relatedTweet || ""}-${item.relatedChat || ""}-${item.relatedRoom || ""}`;

      if (!map[key]) {
        map[key] = { ...item, count: 1, users: [item.sender] };
      } else {
        map[key].count += 1;
        map[key].users.push(item.sender);
        // ✅ خذ الأحدث كـ createdAt/ body إن أحببت
        const cur = new Date(map[key].createdAt).getTime();
        const next = new Date(item.createdAt).getTime();
        if (next > cur) {
          map[key] = { ...map[key], ...item, users: map[key].users, count: map[key].count };
        }
      }
    });

    // ✅ ترتيب تنازلي بالأحدث
    const out = Object.values(map);
    out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return out;
  }, [notifications]);

  /* ================= PRESS HANDLER ================= */
  const handlePress = (item: GroupedNotification) => {
    if (!item.isRead) {
      dispatch(markNotificationAsRead(item._id));
    }

    switch (item.type) {
      case "friend_request":
        router.push({
          pathname: "/friend-request-modal",
          params: {
            notificationId: item._id,
            senderId: item.sender?._id,
          },
        });
        break;

      case "tweet_like":
      case "tweet_reply":
        if (item.relatedTweet) router.push(`/tweet/${item.relatedTweet}`);
        break;

      case "message":
        if (item.relatedChat) router.push(`/chat/${item.relatedChat}`);
        break;

      case "room_invite":
        if (item.relatedRoom) router.push(`/room/${item.relatedRoom}`);
        break;

      default:
        break;
    }
  };

  /* ================= SWIPE DELETE ================= */
  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteWrap}
      activeOpacity={0.9}
      onPress={() => dispatch(deleteNotification(id))}
    >
      <Ionicons name="trash" size={22} color="#FFF" />
      <Text style={styles.deleteText}>حذف</Text>
    </TouchableOpacity>
  );

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item, index }: { item: GroupedNotification; index: number }) => {
    const iconMeta = getIconMeta(item.type);
    const iconColor = pickToneColor(theme, iconMeta.tone);

    const title = buildTitleAr(item);
    const subtitle = buildSubtitleAr(item.type);
    const timeText = formatTimeSmart(item.createdAt);

    const avatarUrl = safeStr(item.users?.[0]?.avatar || item.sender?.avatar);
    const initials = getInitials(title);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Swipeable renderRightActions={() => renderRightActions(item._id)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handlePress(item)}
            style={[styles.card, !item.isRead && styles.cardUnread]}
          >
            <View style={styles.cardInner}>
              {/* Accent */}
              <View style={[styles.accentBar, !item.isRead && styles.accentBarUnread]} />

              {/* Avatar */}
              {avatarUrl ? (
                <View style={styles.avatarWrap}>
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                </View>
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{initials}</Text>
                </View>
              )}

              {/* Icon bubble */}
              <View style={styles.iconBubble}>
                <Ionicons name={iconMeta.name as any} size={18} color={iconColor} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>

                  <View style={styles.metaChip}>
                    <Ionicons name="information-circle" size={14} color={theme.muted} />
                    <Text style={styles.metaChipText}>{subtitle}</Text>
                    {!!item.count && item.count > 1 && (
                      <Text style={[styles.metaChipText, { color: theme.primary }]}>+{item.count - 1}</Text>
                    )}
                  </View>
                </View>

                <Text style={styles.body} numberOfLines={2}>
                  {safeStr(item.body) || "—"}
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.time}>{timeText}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="notifications" size={20} color={theme.text} />
          <View>
            <Text style={styles.headerTitle}>الإشعارات</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount ? `لديك ${unreadCount} غير مقروء` : "كل شيء مُحدّث"}
            </Text>
          </View>
        </View>

        <View style={styles.headerBadge}>
          <Ionicons name="list" size={16} color={theme.primary} />
          <Text style={styles.headerBadgeText}>{groupedNotifications.length}</Text>
        </View>
      </View>

      <FlatList
        data={groupedNotifications}
        keyExtractor={(item: GroupedNotification) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-done" size={30} color={theme.muted} />
              <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptySub}>سيظهر هنا كل جديد يحدث في حسابك.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}