// app/(tabs)/notifications.tsx
// ✅ تصميم جديد نهائيًا (Inbox style) + Tabs (الكل/غير مقروء/طلبات)
// ✅ RTL عربي + Dark/Light
// ✅ Grouping مع استثناء friend_request
// ✅ Swipe للحذف + زر "مقروء" داخل البطاقة

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
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
import { deleteNotification, markNotificationAsRead } from "@/redux/slices/notificationSlice";
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

type TabKey = "all" | "unread" | "requests";

/* ================= HELPERS ================= */

const safeStr = (v: any) => String(v ?? "").trim();

const formatTimeSmart = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

const getInitials = (name: string) => {
  const t = safeStr(name);
  if (!t) return "U";
  const parts = t.split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
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
      return "أُعجب بتغريدتك";
    case "tweet_reply":
      return "رد على تغريدتك";
    case "follow":
      return "بدأ يتابعك";
    case "friend_request":
      return "أرسل طلب صداقة";
    case "message":
      return "أرسل رسالة";
    case "room_invite":
      return "دعوة لغرفة";
    default:
      return "إشعار جديد";
  }
};

const getIconMeta = (type: string) => {
  switch (type) {
    case "tweet_like":
      return { name: "heart" as const, tone: "danger" as const };
    case "tweet_reply":
      return { name: "chatbubble-ellipses" as const, tone: "success" as const };
    case "follow":
      return { name: "person-add" as const, tone: "primary" as const };
    case "friend_request":
      return { name: "people" as const, tone: "primary" as const };
    case "message":
      return { name: "mail" as const, tone: "purple" as const };
    case "room_invite":
      return { name: "door-open" as const, tone: "warning" as const };
    default:
      return { name: "notifications" as const, tone: "muted" as const };
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

/* ================= STYLES (NEW DESIGN) ================= */

const createStyles = (theme: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },

    top: {
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },

    titleRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },

    screenTitle: { color: theme.text, fontSize: 22, fontWeight: "900", textAlign: "right" },
    actionsRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },

    actionBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionText: { color: theme.text, fontWeight: "900", fontSize: 12 },

    tabsRow: {
      marginTop: 12,
      flexDirection: "row-reverse",
      gap: 10,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: {
      backgroundColor: theme.primary + "18",
      borderColor: theme.primary + "55",
    },
    tabText: { fontWeight: "900", fontSize: 12, color: theme.textSecondary },
    tabTextActive: { color: theme.primary },

    countPill: {
      marginTop: 8,
      alignSelf: "flex-end",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
    },
    countText: { color: theme.textSecondary, fontWeight: "900", fontSize: 12 },

    listContent: { padding: 14, paddingBottom: 26 },

    // Notification Row (NEW)
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.03,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 2 },
      }),
    },

    unreadStripe: {
      width: 4,
      alignSelf: "stretch",
      borderRadius: 999,
      backgroundColor: theme.border,
      marginLeft: 10,
    },
    unreadStripeActive: { backgroundColor: theme.primary },

    avatarWrap: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
    avatar: { width: "100%", height: "100%" },
    avatarFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarFallbackText: { fontWeight: "900", color: theme.text },

    center: { flex: 1, minWidth: 0, marginRight: 10 },

    headerLine: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    name: { flex: 1, color: theme.text, fontWeight: "900", fontSize: 14, textAlign: "right" },
    time: { color: theme.muted, fontWeight: "800", fontSize: 11, textAlign: "right" },

    subLine: {
      marginTop: 4,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },

    iconDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    subtitle: { flex: 1, color: theme.textSecondary, fontWeight: "800", fontSize: 12, textAlign: "right" },

    body: {
      marginTop: 6,
      color: theme.textSecondary,
      fontWeight: "600",
      fontSize: 13,
      lineHeight: 18,
      textAlign: "right",
    },

    right: { alignItems: "flex-start", justifyContent: "center", gap: 8 },

    miniBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
    },
    miniBtnText: { fontSize: 12, fontWeight: "900", color: theme.text },

    bubbleCount: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
      backgroundColor: theme.primary + "18",
      borderWidth: 1,
      borderColor: theme.primary + "55",
    },
    bubbleCountText: { fontWeight: "900", color: theme.primary, fontSize: 12 },

    // Swipe delete
    deleteWrap: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
      borderRadius: 16,
      marginBottom: 10,
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

  const [tab, setTab] = useState<TabKey>("all");

  const unreadCount = useMemo(() => {
    return (notifications || []).reduce((acc: number, n: NotificationItem) => acc + (n?.isRead ? 0 : 1), 0);
  }, [notifications]);

  /* ================= GROUPING ================= */
  const groupedNotifications: GroupedNotification[] = useMemo(() => {
    const map: Record<string, GroupedNotification> = {};

    (notifications || []).forEach((item: NotificationItem) => {
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
        const cur = new Date(map[key].createdAt).getTime();
        const next = new Date(item.createdAt).getTime();
        if (next > cur) {
          map[key] = { ...map[key], ...item, users: map[key].users, count: map[key].count };
        }
      }
    });

    const out = Object.values(map);
    out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return out;
  }, [notifications]);

  const filtered = useMemo(() => {
    const list = groupedNotifications || [];
    if (tab === "unread") return list.filter((n) => !n.isRead);
    if (tab === "requests") return list.filter((n) => n.type === "friend_request");
    return list;
  }, [groupedNotifications, tab]);

  const requestsCount = useMemo(() => {
    return (groupedNotifications || []).filter((n) => n.type === "friend_request").length;
  }, [groupedNotifications]);

  /* ================= NAV ================= */
  const handlePress = (item: GroupedNotification) => {
    if (!item.isRead) dispatch(markNotificationAsRead(item._id));

    switch (item.type) {
      case "friend_request":
        router.push({
          pathname: "/friend-request-modal",
          params: { notificationId: item._id, senderId: item.sender?._id },
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
      <Ionicons name="trash" size={20} color="#FFF" />
      <Text style={styles.deleteText}>حذف</Text>
    </TouchableOpacity>
  );

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item, index }: { item: GroupedNotification; index: number }) => {
    const title = buildTitleAr(item);
    const subtitle = buildSubtitleAr(item.type);
    const timeText = formatTimeSmart(item.createdAt);

    const iconMeta = getIconMeta(item.type);
    const iconColor = pickToneColor(theme, iconMeta.tone);

    const avatarUrl = safeStr(item.users?.[0]?.avatar || item.sender?.avatar);
    const initials = getInitials(title);

    return (
      <Animated.View entering={FadeInDown.delay(index * 35)}>
        <Swipeable renderRightActions={() => renderRightActions(item._id)}>
          <Pressable onPress={() => handlePress(item)} style={styles.row}>
            <View style={[styles.unreadStripe, !item.isRead && styles.unreadStripeActive]} />

            {avatarUrl ? (
              <View style={styles.avatarWrap}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              </View>
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{initials}</Text>
              </View>
            )}

            <View style={styles.center}>
              <View style={styles.headerLine}>
                <Text style={styles.name} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.time}>{timeText}</Text>
              </View>

              <View style={styles.subLine}>
                <View style={styles.iconDot}>
                  <Ionicons name={iconMeta.name as any} size={14} color={iconColor} />
                </View>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
                {item.count > 1 && (
                  <View style={styles.bubbleCount}>
                    <Text style={styles.bubbleCountText}>{item.count}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.body} numberOfLines={2}>
                {safeStr(item.body) || "—"}
              </Text>
            </View>

            <View style={styles.right}>
              {!item.isRead && (
                <TouchableOpacity
                  style={styles.miniBtn}
                  activeOpacity={0.9}
                  onPress={() => dispatch(markNotificationAsRead(item._id))}
                >
                  <Ionicons name="checkmark" size={16} color={theme.primary} />
                  <Text style={styles.miniBtnText}>مقروء</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Swipeable>
      </Animated.View>
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>الإشعارات</Text>

          <View style={styles.actionsRow}>
            {/* اختياري: لو عندك أكشن markAllAsRead / clearAll */}
            {/* <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>تحديد الكل</Text></TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>حذف الكل</Text></TouchableOpacity> */}

            <View style={styles.actionBtn}>
              <Ionicons name="mail-unread" size={16} color={theme.text} />
              <Text style={styles.actionText}>{unreadCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setTab("all")}
            style={[styles.tab, tab === "all" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "all" && styles.tabTextActive]}>الكل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setTab("unread")}
            style={[styles.tab, tab === "unread" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "unread" && styles.tabTextActive]}>غير مقروء</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setTab("requests")}
            style={[styles.tab, tab === "requests" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>
              طلبات ({requestsCount})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countPill}>
          <Ionicons name="list" size={16} color={theme.muted} />
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
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
              <Ionicons name="checkmark-done" size={28} color={theme.muted} />
              <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptySub}>سيظهر هنا كل جديد يحدث في حسابك.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}