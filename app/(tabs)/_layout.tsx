
import { Redirect, Tabs } from "expo-router";
import React, { useMemo } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RootState } from "@/redux/store";

import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppHeader from "@/components/AppHeader";
import ConnectedDotsBackground from "@/components/ConnectedDotsBackground";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const { isLoggedIn, hydrated, loading } = useSelector((state: RootState) => state.auth);
  const tabBarHidden = useSelector((state: RootState) => state.ui.tabBarHidden);

  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);


  // ✅ أهم سطر: انتظر hydration
  if (!hydrated || loading) {
    return (
      <View style={[s.full, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }


  if (!isLoggedIn) {
  return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={s.full}>
      {/* ✅ Header ثابت أعلى التطبيق */}
      <AppHeader />

      {/* ✅ Tabs أسفل الهيدر */}
      <View style={{ flex: 1 }}>
        <Tabs

          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,

            tabBarActiveTintColor: theme.tint,
            tabBarInactiveTintColor: theme.mutedText,

            tabBarShowLabel: false,

            tabBarStyle: [s.tabBar, tabBarHidden && s.tabBarHidden],

            tabBarItemStyle: s.item,
tabBarBackground: () => (
<ConnectedDotsBackground
  height={50}
  backgroundColor={isDark ? "rgba(20,20,24,0.92)" : "rgba(255,255,255,0.92)"}

  dotColor={isDark ? "#FFD700" : "#D4AF37"}     // لون النقاط
  lineColor={isDark ? "#FACC15" : "#E6B800"}    // لون الخطوط

  style={s.tabBarBg}
/>
)          }}
        >
          {/* <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <Octicons name="home" size={20} color={color} />
                </View>
              ),
            }}
          /> */}

          <Tabs.Screen
            name="index"
            options={{
              title: "chats",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <Ionicons name="chatbubbles-outline" size={20} color={color} />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="rooms"
            options={{
              title: "Rooms",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <MaterialCommunityIcons name="account-group-outline" size={22} color={color} />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="friends"
            options={{
              title: "Friends",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <FontAwesome5 name="user-friends" size={18} color={color} />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="tweets"
            options={{
              title: "Tweets",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <Ionicons name="newspaper-outline" size={20} color={color} />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, focused }) => (
                <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                  <Feather name="settings" size={20} color={color} />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    full: { flex: 1, backgroundColor: theme.background },

    tabBar: {

      height: 50,


    },

    // ✅ تحريك للأسفل + إخفاء بصري + تعطيل لمس
    tabBarHidden: {
      transform: [{ translateY: 120 }],
      opacity: 0,
      pointerEvents: "none",
    } as any,

    tabBarBg: {
      flex: 1,
      backgroundColor: isDark ? "rgba(20,20,24,0.92)" : "rgba(255,255,255,0.92)",
    },

    item: { paddingTop: 10, paddingBottom: 8 },
    label: { fontSize: 11, fontWeight: "800" },

    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
    },

    iconWrapActive: {},
  });
}