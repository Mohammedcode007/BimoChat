
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchMyFullUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  index: {
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
const token = useSelector((state: RootState) => state.auth.token);
const me = useSelector((state: RootState) => state.user.me);

useEffect(() => {
  if (token && !me) {
    dispatch(fetchMyFullUser());
  }
}, [dispatch, token, me]);
  const { isLoggedIn, hydrated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const s = useMemo(() => makeStyles(theme), [theme]);

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

  return (
    <View style={s.full}>
      <AppHeader />

      <View style={{ flex: 1 }}>
        <Tabs
          initialRouteName="rooms"
          screenOptions={({ route }) => {
            const config =
              TAB_CONFIG[route.name as keyof typeof TAB_CONFIG] ?? TAB_CONFIG.index;

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
                marginBottom: 4,
              },
              tabBarStyle: {
                height: Platform.OS === "ios" ? 84 : 64,
                paddingTop: 6,
                paddingBottom: Platform.OS === "ios" ? 20 : 8,
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
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? config.activeIcon : config.icon}
                  size={size ?? 22}
                  color={color}
                />
              ),
              title: config.title,
              tabBarLabel: config.label,
            };
          }}
        >
          <Tabs.Screen name="tweets" />
          <Tabs.Screen name="rooms" />
          <Tabs.Screen name="index" options={{ href: "/" }} />
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
  });
} 