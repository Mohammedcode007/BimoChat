

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { deleteNotification, markNotificationAsRead } from "@/redux/slices/notificationSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

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

const getInitials = (name: string) => {
  const t = safeStr(name);
  if (!t) return "U";
  const parts = t.split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
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

/* ================= STYLES ================= */

const createStyles = (theme: any, isRTL: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    top: {
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },

    titleRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
    },

    screenTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "900",
      textAlign: isRTL ? "right" : "left",
    },

    actionsRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 10,
    },

    actionBtn: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.surface2,
    },

    actionText: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 12,
    },

    tabsRow: {
      marginTop: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 8,
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },

  tabActive: {
  backgroundColor: theme.primary + "2E",
},

 tabText: {
  fontWeight: "800",
  fontSize: 12,
  color: theme.mutedText,
  textAlign: "center",
},

    tabTextActive: {
      color: theme.primary,
    },

    countPill: {
      marginTop: 10,
      alignSelf: isRTL ? "flex-end" : "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
    },

    countText: {
      color: theme.textSecondary,
      fontWeight: "800",
      fontSize: 12,
    },

    listContent: {
      paddingBottom: 30,
    },

    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },

   rowUnread: {
  backgroundColor: theme.primary + "14",
},

    avatarWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: "hidden",
      marginLeft: isRTL ? 12 : 0,
      marginRight: isRTL ? 0 : 12,
    },

    avatar: {
      width: "100%",
      height: "100%",
    },

    avatarFallback: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: isRTL ? 12 : 0,
      marginRight: isRTL ? 0 : 12,
    },

    avatarFallbackText: {
      fontWeight: "900",
      color: theme.text,
      fontSize: 12,
    },

    center: {
      flex: 1,
      minWidth: 0,
    },

    headerLine: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    name: {
      flex: 1,
      color: theme.text,
      fontWeight: "900",
      fontSize: 14,
      textAlign: isRTL ? "right" : "left",
    },

    time: {
      color: theme.muted,
      fontWeight: "700",
      fontSize: 11,
      textAlign: isRTL ? "right" : "left",
    },

    subLine: {
      marginTop: 4,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
    },

    iconDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
    },

    subtitle: {
      color: theme.textSecondary,
      fontWeight: "700",
      fontSize: 12,
      textAlign: isRTL ? "right" : "left",
    },

    body: {
      marginTop: 4,
      color: theme.textSecondary,
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      textAlign: isRTL ? "right" : "left",
    },

    right: {
      alignItems: isRTL ? "flex-start" : "flex-end",
      justifyContent: "center",
      marginRight: isRTL ? 10 : 0,
      marginLeft: isRTL ? 0 : 10,
      gap: 8,
    },

    miniBtn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 4,
    },

    miniBtnText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.text,
    },

    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },

    bubbleCount: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      backgroundColor: theme.primary + "18",
    },

    bubbleCountText: {
      fontWeight: "900",
      color: theme.primary,
      fontSize: 11,
    },

    deleteWrap: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
      backgroundColor: theme.danger,
    },

    deleteText: {
      color: "#FFF",
      fontWeight: "900",
      marginTop: 6,
      fontSize: 12,
    },

    emptyWrap: {
      alignItems: "center",
      paddingTop: 56,
      paddingHorizontal: 20,
    },

    emptyTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
      marginTop: 10,
      textAlign: "center",
    },

    emptySub: {
      color: theme.textSecondary,
      marginTop: 8,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
  });

/* ================= SCREEN ================= */

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { language, t } = useTranslation();
  const isRTL = language === "ar" || I18nManager.isRTL;

  const styles = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);

  const { notifications, loading } = useSelector((state: RootState) => state.notification);

  const [tab, setTab] = useState<TabKey>("all");

  const prevCountRef = useRef<number>(0);
  const didInitRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const copy = useMemo(
    () => ({
      title: t("notifications.title"),
      all: t("notifications.all"),
      unread: t("notifications.unread"),
      requests: t("notifications.requests"),
      read: t("notifications.read"),
      delete: t("notifications.delete"),
      emptyTitle: t("notifications.emptyTitle"),
      emptySub: t("notifications.emptySub"),
      unknownUser: t("notifications.unknownUser"),
      others: t("notifications.others"),
      newNotification: t("notifications.newNotification"),
      dash: t("notifications.dash"),

      types: {
        tweet_like: t("notifications.types.tweet_like"),
        tweet_reply: t("notifications.types.tweet_reply"),
        follow: t("notifications.types.follow"),
        friend_request: t("notifications.types.friend_request"),
        message: t("notifications.types.message"),
        room_invite: t("notifications.types.room_invite"),
        default: t("notifications.types.default"),
      },
    }),
    [t]
  );

  const unreadCount = useMemo(() => {
    return (notifications || []).reduce(
      (acc: number, n: NotificationItem) => acc + (n?.isRead ? 0 : 1),
      0
    );
  }, [notifications]);

  const formatTimeSmart = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  const buildTitle = (item: GroupedNotification) => {
    const first = item.users?.[0]?.username || item.sender?.username || copy.unknownUser;
    if ((item.count || 1) > 1) {
      const rest = Math.max(0, (item.count || 1) - 1);
      return isRTL ? `${first} و ${rest} ${copy.others}` : `${first} and ${rest} ${copy.others}`;
    }
    return first;
  };

  const buildSubtitle = (type: string) => {
    switch (type) {
      case "tweet_like":
        return copy.types.tweet_like;
      case "tweet_reply":
        return copy.types.tweet_reply;
      case "follow":
        return copy.types.follow;
      case "friend_request":
        return copy.types.friend_request;
      case "message":
        return copy.types.message;
      case "room_invite":
        return copy.types.room_invite;
      default:
        return copy.types.default;
    }
  };

  /* ================= GROUPING ================= */
  const groupedNotifications: GroupedNotification[] = useMemo(() => {
    const map: Record<string, GroupedNotification> = {};

    (notifications || []).forEach((item: NotificationItem) => {
      const senderId = safeStr(item.sender?._id || "unknown");
      const relatedTweet = safeStr(item.relatedTweet);
      const relatedChat = safeStr(item.relatedChat);
      const relatedRoom = safeStr(item.relatedRoom);

      if (item.type === "friend_request") {
        map[item._id] = { ...item, count: 1, users: [item.sender] };
        return;
      }

      if (item.type === "message") {
        const key = `message-${senderId}-${relatedChat || item._id}`;
        if (!map[key]) {
          map[key] = { ...item, count: 1, users: [item.sender] };
        } else {
          map[key].count += 1;
          map[key].users.push(item.sender);

          const cur = new Date(map[key].createdAt).getTime();
          const next = new Date(item.createdAt).getTime();
          if (next > cur) {
            map[key] = {
              ...map[key],
              ...item,
              users: map[key].users,
              count: map[key].count,
            };
          }
        }
        return;
      }

      const key = `${senderId}-${item.type}-${relatedTweet}-${relatedChat}-${relatedRoom}`;

      if (!map[key]) {
        map[key] = { ...item, count: 1, users: [item.sender] };
      } else {
        map[key].count += 1;
        map[key].users.push(item.sender);

        const cur = new Date(map[key].createdAt).getTime();
        const next = new Date(item.createdAt).getTime();
        if (next > cur) {
          map[key] = {
            ...map[key],
            ...item,
            users: map[key].users,
            count: map[key].count,
          };
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

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteWrap}
      activeOpacity={0.9}
      onPress={() => dispatch(deleteNotification(id))}
    >
      <Ionicons name="trash" size={20} color="#FFF" />
      <Text style={styles.deleteText}>{copy.delete}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: GroupedNotification; index: number }) => {
    const title = buildTitle(item);
    const subtitle = buildSubtitle(item.type);
    const timeText = formatTimeSmart(item.createdAt);

    const iconMeta = getIconMeta(item.type);
    const iconColor = pickToneColor(theme, iconMeta.tone);

    const avatarUrl = safeStr(item.users?.[0]?.avatar || item.sender?.avatar);
    const initials = getInitials(title);

    return (
      <Animated.View entering={FadeInDown.delay(index * 25)}>
        <Swipeable
          renderRightActions={() => renderRightActions(item._id)}
          renderLeftActions={isRTL ? undefined : () => renderRightActions(item._id)}
        >
          <Pressable
            onPress={() => handlePress(item)}
            style={[styles.row, !item.isRead && styles.rowUnread]}
          >
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
                  <Ionicons name={iconMeta.name as any} size={13} color={iconColor} />
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
                {safeStr(item.body) || copy.dash}
              </Text>
            </View>

            <View style={styles.right}>
              {!item.isRead ? (
                <>
                  <View style={styles.unreadDot} />
                  <TouchableOpacity
                    style={styles.miniBtn}
                    activeOpacity={0.9}
                    onPress={() => dispatch(markNotificationAsRead(item._id))}
                  >
                    <Ionicons name="checkmark" size={14} color={theme.primary} />
                    <Text style={styles.miniBtnText}>{copy.read}</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </Pressable>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>{copy.title}</Text>

          <View style={styles.actionsRow}>
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
            <Text style={[styles.tabText, tab === "all" && styles.tabTextActive]}>
              {copy.all}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setTab("unread")}
            style={[styles.tab, tab === "unread" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "unread" && styles.tabTextActive]}>
              {copy.unread}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setTab("requests")}
            style={[styles.tab, tab === "requests" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>
              {isRTL ? `${copy.requests} (${requestsCount})` : `${copy.requests} (${requestsCount})`}
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
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptySub}>{copy.emptySub}</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}