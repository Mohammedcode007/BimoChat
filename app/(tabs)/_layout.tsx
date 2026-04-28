
import AppHeader from "@/components/AppHeader";
import {
  consumeBackgroundReminderTrigger,
  incrementBackgroundReminderOpenCount,
  shouldShowBackgroundReminder,
} from "@/components/backgroundReminder";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchChats, fetchTotalUnread } from "@/redux/slices/chatSlice";
import { fetchMyFullUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG = {
  tweets: {
    title: "Tweets",
    label: "Tweets",
    icon: "newspaper-outline" as IoniconName,
    activeIcon: "newspaper" as IoniconName,
  },
  rooms: {
    title: "Rooms",
    label: "Rooms",
    icon: "headset-outline" as IoniconName,
    activeIcon: "headset" as IoniconName,
  },
  chats: {
    title: "Chats",
    label: "Chats",
    icon: "chatbubble-ellipses-outline" as IoniconName,
    activeIcon: "chatbubble-ellipses" as IoniconName,
  },
  friends: {
    title: "Friends",
    label: "Friends",
    icon: "people-outline" as IoniconName,
    activeIcon: "people" as IoniconName,
  },
  settings: {
    title: "Settings",
    label: "Settings",
    icon: "settings-outline" as IoniconName,
    activeIcon: "settings" as IoniconName,
  },
} as const;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const token = useSelector((state: RootState) => state.auth.token);
  const totalUnread = useSelector(
    (state: RootState) => state.chat.totalUnread
  );
  const me = useSelector((state: RootState) => state.user.me);
  const hasCheckedBackgroundReminderRef = useRef(false);

  const { isLoggedIn, hydrated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const s = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    if (token && !me) {
      dispatch(fetchMyFullUser());
    }
    dispatch(fetchChats() as any);
    dispatch(fetchTotalUnread() as any);
  }, [dispatch, token, me]);

  useEffect(() => {
    const checkBackgroundReminder = async () => {
      try {
        if (!hydrated || loading || !isLoggedIn) return;
        if (hasCheckedBackgroundReminderRef.current) return;

        const isOnBackgroundActivityScreen = Array.isArray(segments)
          ? segments.some((segment) => String(segment) === "background-activity")
          : false;

        if (isOnBackgroundActivityScreen) return;

        hasCheckedBackgroundReminderRef.current = true;

        await incrementBackgroundReminderOpenCount();

        const result = await shouldShowBackgroundReminder();

        if (result.shouldShow) {
          await consumeBackgroundReminderTrigger();
          router.push("/background-activity" as any);
        }
      } catch (error) { }
    };

    checkBackgroundReminder();
  }, [hydrated, loading, isLoggedIn, segments, router]);

  if (!hydrated || loading) {
    return (
      <View style={[s.full, s.loaderWrap]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const androidBottomInset =
    Platform.OS === "android" ? Math.max(insets.bottom, 8) : 0;
  const iosBottomInset =
    Platform.OS === "ios" ? Math.max(insets.bottom, 20) : 0;
  const bottomPadding =
    Platform.OS === "ios" ? iosBottomInset : androidBottomInset;
  const tabBarHeight = 56 + bottomPadding;

  return (
    <View style={s.full}>
      <AppHeader />
      <View style={{ flex: 1 }}>
        <Tabs
          initialRouteName="rooms"
          screenOptions={({ route }) => {
            const config =
              TAB_CONFIG[route.name as keyof typeof TAB_CONFIG] ?? TAB_CONFIG.chats;

            return {
              headerShown: false,
              animation: "none",
              sceneStyle: {
                backgroundColor: theme.background,
              },
              tabBarActiveTintColor:
                colorScheme === "dark" ? "#FFFFFF" : "#111827",
              tabBarInactiveTintColor:
                colorScheme === "dark" ? "#7E8695" : "#6B7280",
              tabBarShowLabel: true,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: "600" as const,
                marginTop: -2,
                marginBottom: 2,
              },
              tabBarStyle: {
                height: tabBarHeight,
                paddingTop: 6,
                paddingBottom: bottomPadding,
                backgroundColor:
                  colorScheme === "dark" ? "#000000" : "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)",
                elevation: 8,
              },
              tabBarItemStyle: {
                paddingVertical: 2,
              },
              tabBarIcon: ({ focused, color, size }) => {
                const isChatsTab = route.name === "chats";
                const unread = Number(totalUnread || 0);

                return (
                  <View style={s.tabIconWrap}>
                    <Ionicons
                      name={focused ? config.activeIcon : config.icon}
                      size={size ?? 22}
                      color={color}
                    />

                    {isChatsTab && unread > 0 && (
                      <View style={s.unreadBadge}>
                        <Text style={s.unreadBadgeText}>
                          {unread > 99 ? "99+" : unread}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              },
              title: config.title,
              tabBarLabel: config.label,
            };
          }}
        >
          <Tabs.Screen name="tweets" />
          <Tabs.Screen name="rooms" />
          <Tabs.Screen name="index" options={{ href: null }} />
          <Tabs.Screen name="chats" />
          <Tabs.Screen name="friends" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>
    </View>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    full: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loaderWrap: {
      justifyContent: "center",
      alignItems: "center",
    },
    tabIconWrap: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },

    unreadBadge: {
      position: "absolute",
      top: -5,
      right: -8,
      minWidth: 17,
      height: 17,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: theme.background || "#FFFFFF",
    },

    unreadBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "800",
      includeFontPadding: false,
      textAlign: "center",
    },
  });
}