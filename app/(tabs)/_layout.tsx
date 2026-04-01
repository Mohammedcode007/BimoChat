
// import { Redirect, Tabs } from "expo-router";
// import React, { useEffect, useMemo } from "react";

// import AppHeader from "@/components/AppHeader";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { RootState } from "@/redux/store";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import {
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import Animated, {
//   Easing,
//   interpolate,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from "react-native-reanimated";
// import { useSelector } from "react-redux";

// const TAB_CONFIG = [
//   {
//     name: "index",
//     label: "Chat",
//     icon: "chatbubble-outline",
//     activeIcon: "chatbubble",
//   },
//   {
//     name: "rooms",
//     label: "Room",
//   icon: "chatbubbles-outline",
// activeIcon: "chatbubbles",
//   },
//   {
//     name: "friends",
//     label: "Friend",
//     icon: "people-outline",
//     activeIcon: "people",
//   },
//   {
//     name: "tweets",
//     label: "Tweet",
//   icon: "newspaper-outline",
// activeIcon: "newspaper",
//   },
// ] as const;

// type IoniconName = keyof typeof Ionicons.glyphMap;

// const SCREEN_WIDTH = Dimensions.get("window").width;
// const TAB_BAR_HORIZONTAL_MARGIN = 12;
// const TAB_BAR_HORIZONTAL_PADDING = 10;
// const TAB_COUNT = TAB_CONFIG.length;

// const INNER_BAR_WIDTH =
//   SCREEN_WIDTH - TAB_BAR_HORIZONTAL_MARGIN * 2 - TAB_BAR_HORIZONTAL_PADDING * 2;

// const SLOT_WIDTH = INNER_BAR_WIDTH / TAB_COUNT;

// /** زدنا العرض حتى يحتوي الأيقونة + النص بالكامل */
// const INDICATOR_WIDTH = Math.min(SLOT_WIDTH - 2, 104);
// const getIndicatorTranslateX = (index: number) => {
//   const raw = index * SLOT_WIDTH + (SLOT_WIDTH - INDICATOR_WIDTH) / 2;
//   const max = INNER_BAR_WIDTH - INDICATOR_WIDTH;
//   return Math.max(0, Math.min(raw, max));
// };
// function TabButton({
//   focused,
//   label,
//   icon,
//   activeIcon,
//   activeColor,
//   inactiveColor,
//   onPress,
//   onLongPress,
//   isFirstTab,
// }: {
//   focused: boolean;
//   label: string;
//   icon: IoniconName;
//   activeIcon: IoniconName;
//   activeColor: string;
//   inactiveColor: string;
//   onPress: () => void;
//   onLongPress: () => void;
//   isFirstTab: boolean;
// }) {
//   const progress = useSharedValue(focused ? 1 : 0);

//   useEffect(() => {
//     progress.value = withTiming(focused ? 1 : 0, {
//       duration: 260,
//       easing: Easing.out(Easing.cubic),
//     });
//   }, [focused, progress]);

//   const iconStyle = useAnimatedStyle(() => ({
//     transform: [
//       { scale: interpolate(progress.value, [0, 1], [1, 1.05]) },
//       {
//     translateX: interpolate(progress.value, [0, 1], [0, -1]),
//       },
//     ],
//   }));

// const labelStyle = useAnimatedStyle(() => ({
//   opacity: interpolate(progress.value, [0, 1], [0, 1]),
//   width: interpolate(progress.value, [0, 1], [0, 42]),
//   marginLeft: interpolate(progress.value, [0, 1], [0, 6]),
//   transform: [{ translateX: interpolate(progress.value, [0, 1], [6, 0]) }],
// }));
//   return (
//     <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabPressable}>
//       <View style={styles.tabInner}>
//         <Animated.View style={[styles.iconHolder, iconStyle]}>
//           <Ionicons
//             name={focused ? activeIcon : icon}
//             size={20}
//             color={focused ? activeColor : inactiveColor}
//           />
//         </Animated.View>

//         <Animated.View style={[styles.labelWrap, labelStyle]}>
//           <Text
//             numberOfLines={1}
//             style={[
//               styles.activeLabel,
//               { color: focused ? activeColor : "transparent" },
//             ]}
//           >
//             {label}
//           </Text>
//         </Animated.View>
//       </View>
//     </Pressable>
//   );
// }

// function CustomTabBar({ state, navigation }: BottomTabBarProps) {
//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();

//   const isDark = colorScheme === "dark";
//   const tabBarHidden = useSelector((s: RootState) => s.ui.tabBarHidden);

//   const translateX = useSharedValue(getIndicatorTranslateX(state.index));
//   const hideProgress = useSharedValue(tabBarHidden ? 1 : 0);

//   useEffect(() => {
//     translateX.value = withTiming(getIndicatorTranslateX(state.index), {
//       duration: 420,
//       easing: Easing.out(Easing.cubic),
//     });
//   }, [state.index, translateX]);

//   useEffect(() => {
//     hideProgress.value = withTiming(tabBarHidden ? 1 : 0, {
//       duration: 220,
//       easing: Easing.out(Easing.cubic),
//     });
//   }, [tabBarHidden, hideProgress]);

//   const animatedIndicatorStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: translateX.value }],
//   }));

//   const animatedBarStyle = useAnimatedStyle(() => ({
//     opacity: interpolate(hideProgress.value, [0, 1], [1, 0]),
//     transform: [{ translateY: interpolate(hideProgress.value, [0, 1], [0, 120]) }],
//   }));

//   const bgColor = isDark ? "#15171D" : "#FFFFFF";
//   const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
//   const activeBg = isDark ? "#2C254D" : "#EAE3FF";
//   const activeText = isDark ? "#B79CFF" : "#6B4EFF";
//   const inactiveText = isDark ? "#7E8695" : "#8B93A1";

//   return (
//     <View pointerEvents="box-none" style={styles.outerWrap}>
//       <Animated.View
//         style={[
//           styles.tabBar,
//           {
//             backgroundColor: bgColor,
//             borderColor,
//             shadowOpacity: isDark ? 0.28 : 0.08,
//           },
//           animatedBarStyle,
//         ]}
//       >
//         <Animated.View
//           pointerEvents="none"
//           style={[
//             styles.indicator,
//             { backgroundColor: activeBg, width: INDICATOR_WIDTH },
//             animatedIndicatorStyle,
//           ]}
//         />

//         {state.routes.map((route, index) => {
//           const cfg = TAB_CONFIG.find((t) => t.name === route.name);
//           if (!cfg) return null;

//           const focused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: "tabPress",
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!focused && !event.defaultPrevented) {
//               navigation.navigate(route.name as never);
//             }
//           };

//           const onLongPress = () => {
//             navigation.emit({
//               type: "tabLongPress",
//               target: route.key,
//             });
//           };

//           return (
//             <View key={route.key} style={styles.slot}>
//               <TabButton
//                 focused={focused}
//                 label={cfg.label}
//                 icon={cfg.icon as IoniconName}
//                 activeIcon={cfg.activeIcon as IoniconName}
//                 activeColor={activeText}
//                 inactiveColor={inactiveText}
//                 onPress={onPress}
//                 onLongPress={onLongPress}
//                 isFirstTab={index === 0}
//               />
//             </View>
//           );
//         })}
//       </Animated.View>
//     </View>
//   );
// }

// export default function TabLayout() {
//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();

//   const theme = Colors[colorScheme ?? "light"];

//   const { isLoggedIn, hydrated, loading } = useSelector(
//     (state: RootState) => state.auth
//   );

//   const s = useMemo(() => makeStyles(theme), [theme]);

//   if (!hydrated || loading) {
//     return (
//       <View style={[s.full, s.loaderWrap]}>
//         <ActivityIndicator size="large" color={theme.tint} />
//       </View>
//     );
//   }

//   if (!isLoggedIn) {
//     return <Redirect href="/(auth)/welcome" />;
//   }

//   return (
//     <View style={s.full}>
//       <AppHeader />

//       <View style={{ flex: 1 }}>
//         <Tabs
//           tabBar={(props) => <CustomTabBar {...props} />}
//           screenOptions={{
//             headerShown: false,
//             animation: "shift",
//             sceneStyle: { backgroundColor: theme.background },
//           }}
//         >
//           <Tabs.Screen name="index" options={{ title: "Home" }} />
//           <Tabs.Screen name="rooms" options={{ title: "Rooms" }} />
//           <Tabs.Screen name="friends" options={{ title: "Friends" }} />
//           <Tabs.Screen name="tweets" options={{ title: "Tweets" }} />
//         </Tabs>
//       </View>
//     </View>
//   );
// }

// function makeStyles(theme: any) {
//   return StyleSheet.create({
//     full: {
//       flex: 1,
//       backgroundColor: theme.background,
//     },
//     loaderWrap: {
//       justifyContent: "center",
//       alignItems: "center",
//     },
//   });
// }

// const styles = StyleSheet.create({
//   outerWrap: {
//     position: "absolute",
//     left: TAB_BAR_HORIZONTAL_MARGIN,
//     right: TAB_BAR_HORIZONTAL_MARGIN,
//     bottom: 12,
//   },

//   tabBar: {
//     height: 74,
//     borderRadius: 28,
//     borderWidth: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
//     paddingVertical: 8,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowRadius: 18,
//     shadowOffset: { width: 0, height: 8 },
//     elevation: Platform.OS === "android" ? 10 : 0,
//   },

//   indicator: {
//     position: "absolute",
//     left: 0,
//     top: 17,
//     height: 40,
//     borderRadius: 22,
//   },

//   slot: {
//     width: SLOT_WIDTH,
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 2,
//   },

// tabPressable: {
//   width: INDICATOR_WIDTH,
//   height: 44,
//   alignItems: "center",
//   justifyContent: "center",
// },

// tabInner: {
//   width: INDICATOR_WIDTH,
//   height: 40,
//   flexDirection: "row",
//   alignItems: "center",
//   justifyContent: "center",
//   paddingHorizontal: 6,
// },

//   iconHolder: {
//     width: 20,
//     height: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   labelWrap: {
//     height: 20,
//     overflow: "hidden",
//     alignItems: "flex-start",
//     justifyContent: "center",
//   },

//   activeLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0,
//     includeFontPadding: false,
//     textAlignVertical: "center",
//   },
// });
import { Redirect, Tabs } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";

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
          initialRouteName="tweets"
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