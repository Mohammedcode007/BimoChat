// import { Redirect, Tabs } from 'expo-router';
// import React from 'react';

// import AppHeader from '@/components/AppHeader';
// import { HapticTab } from '@/components/haptic-tab';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { RootState } from '@/redux/store';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import Feather from '@expo/vector-icons/Feather';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import Octicons from '@expo/vector-icons/Octicons';
// import { ActivityIndicator, View } from 'react-native';
// import { useSelector } from 'react-redux';
// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const { isLoggedIn, loading } = useSelector(
//     (state: RootState) => state.auth
//   );

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!isLoggedIn) {
//     return <Redirect href="/(auth)/login" />;
//   }
//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header ثابت */}
//       <AppHeader />
//       <Tabs
//         screenOptions={{
//           tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//           headerShown: false,
//           tabBarButton: HapticTab,
//         }}
//       >
//         {/* Home */}
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: 'Home',
//             tabBarIcon: ({ color }) => (
//               <Octicons name="home" size={22} color={color} />
//             ),
//           }}
//         />

//         {/* Chats */}
//         <Tabs.Screen
//           name="chats"
//           options={{
//             title: 'Chats',
//             tabBarIcon: ({ color }) => (
//               <Ionicons name="chatbubbles-outline" size={22} color={color} />
//             ),
//           }}
//         />

//         {/* Rooms */}
//         <Tabs.Screen
//           name="rooms"
//           options={{
//             title: 'Rooms',
//             tabBarIcon: ({ color }) => (
//               <MaterialCommunityIcons name="home-group" size={22} color={color} />
//             ),
//           }}
//         />

//         {/* Friends */}
//         <Tabs.Screen
//           name="friends"
//           options={{
//             title: 'Friends',
//             tabBarIcon: ({ color }) => (
//               <FontAwesome5 name="user-friends" size={22} color={color} />
//             ),
//           }}
//         />

//         {/* Tweets */}
//         <Tabs.Screen
//           name="tweets"
//           options={{
//             title: 'Tweets',
//             tabBarIcon: ({ color }) => (
//               <AntDesign name="retweet" size={22} color={color} />
//             ),
//           }}
//         />

//         {/* Settings */}
//         <Tabs.Screen
//           name="settings"
//           options={{
//             title: 'Settings',
//             tabBarIcon: ({ color }) => (
//               <Feather name="settings" size={22} color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </View>

//   );
// }
import { Redirect, Tabs } from "expo-router";
import React, { useMemo } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RootState } from "@/redux/store";

import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";

import AppHeader from "@/components/AppHeader";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const { isLoggedIn, loading } = useSelector((state: RootState) => state.auth);
  const tabBarHidden = useSelector((state: RootState) => state.ui.tabBarHidden);

  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  if (loading) {
    return (
      <View style={[s.full, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
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

          tabBarShowLabel: true,
          tabBarLabelStyle: s.label,

          tabBarStyle: [s.tabBar, tabBarHidden && s.tabBarHidden],

          tabBarItemStyle: s.item,
          tabBarBackground: () => <View style={s.tabBarBg} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View style={[s.iconWrap, focused && s.iconWrapActive]}>
                <Octicons name="home" size={20} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
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
                <MaterialCommunityIcons name="home-group" size={20} color={color} />
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
                <AntDesign name="retweet" size={20} color={color} />
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
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 10,
      height: 66,
      borderRadius: 22,
      borderTopWidth: 0,
      overflow: "hidden",

      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.28 : 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 6 },
      }),
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
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
    },

    item: { paddingTop: 10, paddingBottom: 8 },
    label: { fontSize: 11, fontWeight: "800" },

    iconWrap: {
      width: 40,
      height: 34,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },

    iconWrapActive: {
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });
}