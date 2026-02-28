import { Colors } from "@/constants/theme";
import { RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function AppHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  const user = useSelector((state: RootState) => state.auth.user);

  // أخفِ الهيدر في شاشات معينة
  if (pathname.includes("chat/room")) return null;

  const title = useMemo(() => {
    if (pathname === "/") return "Bimo";
    if (pathname.includes("chats")) return "Chats";
    if (pathname.includes("rooms")) return "Rooms";
    if (pathname.includes("friends")) return "Friends";
    if (pathname.includes("tweets")) return "Tweets";
    if (pathname.includes("settings")) return "Settings";
    return "";
  }, [pathname]);

  const s = useMemo(() => makeStyles(theme, colorScheme === "dark"), [theme, colorScheme]);

  return (
    <View style={[s.wrap, { paddingTop: insets.top }]}>
      <View style={s.container}>
        {/* Left: User */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={s.userContainer}
          onPress={() =>
            router.push({
              pathname: "/profile/[id]" as any,
              params: { id: user?._id },
            } as any)
          }
        >
          <View style={s.avatarWrap}>
            <Image
              source={{
                uri: user?.avatar || "https://i.pravatar.cc/150?img=3",
              }}
              style={s.avatar}
            />
            <View style={s.onlineDot} />
          </View>

          <View style={{ flexShrink: 1 }}>
            <Text style={s.username} numberOfLines={1}>
              {user?.username || "User"}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>
              {title || "Home"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Actions */}
        <View style={s.actions}>
          <IconBtn
            theme={theme}
            style={s.iconBtn}
            icon="search-outline"
            onPress={() => router.push("/search")}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/notifications")}
            style={[s.iconBtn, s.notificationContainer]}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.icon} />
            {Number(unreadCount) > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>
                  {Number(unreadCount) > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <IconBtn
            theme={theme}
            style={s.iconBtn}
            icon="storefront-outline"
            onPress={() => router.push("/store")}
          />
        </View>
      </View>
    </View>
  );
}

/* ================= Small Components ================= */

function IconBtn({
  icon,
  onPress,
  theme,
  style,
}: {
  icon: any;
  onPress: () => void;
  theme: any;
  style?: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={style}>
      <Ionicons name={icon} size={20} color={theme.icon} />
    </TouchableOpacity>
  );
}

/* ================= Styles ================= */

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator ?? (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,28,0.10)"),
    },

    container: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    userContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      paddingRight: 12,
    },

    avatarWrap: {
      width: 40,
      height: 40,
      borderRadius: 16,
      padding: 2,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.18 : 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 2 },
      }),
    },

    avatar: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: theme.surface2,
    },

    onlineDot: {
      position: "absolute",
      bottom: -1,
      right: -1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.success ?? "#22C55E",
      borderWidth: 2,
      borderColor: theme.background,
    },

    username: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
    },

    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    notificationContainer: {
      position: "relative",
    },

    badge: {
      position: "absolute",
      top: -6,
      right: -8,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.danger ?? "#EF4444",
      borderWidth: 2,
      borderColor: theme.background,
    },

    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "900",
      lineHeight: 12,
    },
  });
}