
// import { Redirect, Tabs } from "expo-router";
// import React, { useMemo } from "react";

// import { HapticTab } from "@/components/haptic-tab";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { RootState } from "@/redux/store";

// import Feather from "@expo/vector-icons/Feather";
// import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// import AppHeader from "@/components/AppHeader";
// import ConnectedDotsBackground from "@/components/ConnectedDotsBackground";
// import { ActivityIndicator, StyleSheet, View } from "react-native";
// import { useSelector } from "react-redux";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"];
//   const isDark = colorScheme === "dark";

//   const { isLoggedIn, hydrated, loading } = useSelector((state: RootState) => state.auth);
//   const tabBarHidden = useSelector((state: RootState) => state.ui.tabBarHidden);

//   const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);


//   // ✅ أهم سطر: انتظر hydration
//   if (!hydrated || loading) {
//     return (
//       <View style={[s.full, { justifyContent: "center", alignItems: "center" }]}>
//         <ActivityIndicator size="large" color={theme.tint} />
//       </View>
//     );
//   }


//   if (!isLoggedIn) {
//   return <Redirect href="/(auth)/welcome" />;
//   }

//   return (
//     <View style={s.full}>
//       {/* ✅ Header ثابت أعلى التطبيق */}
//       <AppHeader />

//       {/* ✅ Tabs أسفل الهيدر */}
//       <View style={{ flex: 1 }}>
//         <Tabs

//           screenOptions={{
//             headerShown: false,
//             tabBarButton: HapticTab,

//             tabBarActiveTintColor: theme.tint,
//             tabBarInactiveTintColor: theme.mutedText,

//             tabBarShowLabel: false,

//             tabBarStyle: [s.tabBar, tabBarHidden && s.tabBarHidden],

//             tabBarItemStyle: s.item,
// tabBarBackground: () => (
// <ConnectedDotsBackground
//   height={50}
//   backgroundColor={isDark ? "rgba(20,20,24,0.92)" : "rgba(255,255,255,0.92)"}

//   dotColor={isDark ? "#FFD700" : "#D4AF37"}     // لون النقاط
//   lineColor={isDark ? "#FACC15" : "#E6B800"}    // لون الخطوط

//   style={s.tabBarBg}
// />
// )          }}
//         >
   

//           <Tabs.Screen
//             name="index"
//             options={{
//               title: "chats",
//               tabBarIcon: ({ color, focused }) => (
//                 <View style={[s.iconWrap, focused && s.iconWrapActive]}>
//                   <Ionicons name="chatbubbles-outline" size={20} color={color} />
//                 </View>
//               ),
//             }}
//           />

//           <Tabs.Screen
//             name="rooms"
//             options={{
//               title: "Rooms",
//               tabBarIcon: ({ color, focused }) => (
//                 <View style={[s.iconWrap, focused && s.iconWrapActive]}>
//                   <MaterialCommunityIcons name="account-group-outline" size={22} color={color} />
//                 </View>
//               ),
//             }}
//           />

//           <Tabs.Screen
//             name="friends"
//             options={{
//               title: "Friends",
//               tabBarIcon: ({ color, focused }) => (
//                 <View style={[s.iconWrap, focused && s.iconWrapActive]}>
//                   <FontAwesome5 name="user-friends" size={18} color={color} />
//                 </View>
//               ),
//             }}
//           />

//           <Tabs.Screen
//             name="tweets"
//             options={{
//               title: "Tweets",
//               tabBarIcon: ({ color, focused }) => (
//                 <View style={[s.iconWrap, focused && s.iconWrapActive]}>
//                   <Ionicons name="newspaper-outline" size={20} color={color} />
//                 </View>
//               ),
//             }}
//           />

//           <Tabs.Screen
//             name="settings"
//             options={{
//               title: "Settings",
//               tabBarIcon: ({ color, focused }) => (
//                 <View style={[s.iconWrap, focused && s.iconWrapActive]}>
//                   <Feather name="settings" size={20} color={color} />
//                 </View>
//               ),
//             }}
//           />
//         </Tabs>
//       </View>
//     </View>
//   );
// }

// function makeStyles(theme: any, isDark: boolean) {
//   return StyleSheet.create({
//     full: { flex: 1, backgroundColor: theme.background },

//     tabBar: {

//       height: 50,


//     },

//     // ✅ تحريك للأسفل + إخفاء بصري + تعطيل لمس
//     tabBarHidden: {
//       transform: [{ translateY: 120 }],
//       opacity: 0,
//       pointerEvents: "none",
//     } as any,

//     tabBarBg: {
//       flex: 1,
//       backgroundColor: isDark ? "rgba(20,20,24,0.92)" : "rgba(255,255,255,0.92)",
//     },

//     item: { paddingTop: 10, paddingBottom: 8 },
//     label: { fontSize: 11, fontWeight: "800" },

//     iconWrap: {
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     iconWrapActive: {},
//   });
// }

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
//   { name: "index", label: "Home", icon: "home-outline", activeIcon: "home" },
//   { name: "rooms", label: "Rooms", icon: "radio-button-off-outline", activeIcon: "radio-button-on" },
//   { name: "friends", label: "Friends", icon: "pie-chart-outline", activeIcon: "pie-chart" },
//   { name: "tweets", label: "Tweets", icon: "time-outline", activeIcon: "time" },
//   { name: "settings", label: "Profile", icon: "person-outline", activeIcon: "person" },
// ] as const;

// type TabName = (typeof TAB_CONFIG)[number]["name"];
// type IoniconName = keyof typeof Ionicons.glyphMap;

// const SCREEN_WIDTH = Dimensions.get("window").width;
// const TAB_BAR_HORIZONTAL_MARGIN = 12;
// const TAB_BAR_HORIZONTAL_PADDING = 10;
// const TAB_COUNT = TAB_CONFIG.length;

// // العرض الداخلي الصافي للشريط
// const INNER_BAR_WIDTH =
//   SCREEN_WIDTH - TAB_BAR_HORIZONTAL_MARGIN * 2 - TAB_BAR_HORIZONTAL_PADDING * 2;

// // عرض كل خانة
// const SLOT_WIDTH = INNER_BAR_WIDTH / TAB_COUNT;

// // عرض الخلفية المتحركة نفسها
// const INDICATOR_WIDTH = 75;

// // مكان الخلفية داخل كل خانة
// const getIndicatorTranslateX = (index: number) =>
//   index * SLOT_WIDTH + (SLOT_WIDTH - INDICATOR_WIDTH) / 2;

// function TabButton({
//   focused,
//   label,
//   icon,
//   activeIcon,
//   activeColor,
//   inactiveColor,
//   onPress,
//   onLongPress,
// }: {
//   focused: boolean;
//   label: string;
//   icon: IoniconName;
//   activeIcon: IoniconName;
//   activeColor: string;
//   inactiveColor: string;
//   onPress: () => void;
//   onLongPress: () => void;
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
//       { translateX: interpolate(progress.value, [0, 1], [0, -2]) },
//     ],
//   }));

//   const labelStyle = useAnimatedStyle(() => ({
//     opacity: interpolate(progress.value, [0, 1], [0, 1]),
//     maxWidth: interpolate(progress.value, [0, 1], [0, 48]),
// marginLeft: interpolate(progress.value, [0, 1], [0, 3]),
//     transform: [{ translateX: interpolate(progress.value, [0, 1], [6, 0]) }],
//   }));

//   return (
//     <Pressable
//       onPress={onPress}
//       onLongPress={onLongPress}
//       style={styles.tabPressable}
//     >
//       <View style={styles.tabInner}>
//         <Animated.View style={iconStyle}>
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
//   const colorScheme = useColorScheme();
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
//           const cfg = TAB_CONFIG.find((t) => t.name === route.name) as
//             | (typeof TAB_CONFIG)[number]
//             | undefined;

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
//               />
//             </View>
//           );
//         })}
//       </Animated.View>
//     </View>
//   );
// }

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
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
//           <Tabs.Screen name="settings" options={{ title: "Profile" }} />
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
//   height: 40,
//   width: INDICATOR_WIDTH,
//   flexDirection: "row",
//   alignItems: "center",
//   justifyContent: "center",
// },

// labelWrap: {
//   overflow: "hidden",
//   alignItems: "center",
//   justifyContent: "center",
// },
//   activeLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.1,
//   },
// });

import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useMemo } from "react";

import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSelector } from "react-redux";

const TAB_CONFIG = [
  {
    name: "index",
    label: "Chat",
    icon: "chatbubble-outline",
    activeIcon: "chatbubble",
  },
  {
    name: "rooms",
    label: "Room",
  icon: "chatbubbles-outline",
activeIcon: "chatbubbles",
  },
  {
    name: "friends",
    label: "Friend",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    name: "tweets",
    label: "Tweet",
  icon: "newspaper-outline",
activeIcon: "newspaper",
  },
] as const;

type IoniconName = keyof typeof Ionicons.glyphMap;

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_BAR_HORIZONTAL_MARGIN = 12;
const TAB_BAR_HORIZONTAL_PADDING = 10;
const TAB_COUNT = TAB_CONFIG.length;

const INNER_BAR_WIDTH =
  SCREEN_WIDTH - TAB_BAR_HORIZONTAL_MARGIN * 2 - TAB_BAR_HORIZONTAL_PADDING * 2;

const SLOT_WIDTH = INNER_BAR_WIDTH / TAB_COUNT;

/** زدنا العرض حتى يحتوي الأيقونة + النص بالكامل */
const INDICATOR_WIDTH = Math.min(SLOT_WIDTH - 2, 104);
const getIndicatorTranslateX = (index: number) => {
  const raw = index * SLOT_WIDTH + (SLOT_WIDTH - INDICATOR_WIDTH) / 2;
  const max = INNER_BAR_WIDTH - INDICATOR_WIDTH;
  return Math.max(0, Math.min(raw, max));
};
function TabButton({
  focused,
  label,
  icon,
  activeIcon,
  activeColor,
  inactiveColor,
  onPress,
  onLongPress,
  isFirstTab,
}: {
  focused: boolean;
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
  isFirstTab: boolean;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.05]) },
      {
    translateX: interpolate(progress.value, [0, 1], [0, -1]),
      },
    ],
  }));

const labelStyle = useAnimatedStyle(() => ({
  opacity: interpolate(progress.value, [0, 1], [0, 1]),
  width: interpolate(progress.value, [0, 1], [0, 42]),
  marginLeft: interpolate(progress.value, [0, 1], [0, 6]),
  transform: [{ translateX: interpolate(progress.value, [0, 1], [6, 0]) }],
}));
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabPressable}>
      <View style={styles.tabInner}>
        <Animated.View style={[styles.iconHolder, iconStyle]}>
          <Ionicons
            name={focused ? activeIcon : icon}
            size={20}
            color={focused ? activeColor : inactiveColor}
          />
        </Animated.View>

        <Animated.View style={[styles.labelWrap, labelStyle]}>
          <Text
            numberOfLines={1}
            style={[
              styles.activeLabel,
              { color: focused ? activeColor : "transparent" },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const tabBarHidden = useSelector((s: RootState) => s.ui.tabBarHidden);

  const translateX = useSharedValue(getIndicatorTranslateX(state.index));
  const hideProgress = useSharedValue(tabBarHidden ? 1 : 0);

  useEffect(() => {
    translateX.value = withTiming(getIndicatorTranslateX(state.index), {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [state.index, translateX]);

  useEffect(() => {
    hideProgress.value = withTiming(tabBarHidden ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [tabBarHidden, hideProgress]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hideProgress.value, [0, 1], [1, 0]),
    transform: [{ translateY: interpolate(hideProgress.value, [0, 1], [0, 120]) }],
  }));

  const bgColor = isDark ? "#15171D" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const activeBg = isDark ? "#2C254D" : "#EAE3FF";
  const activeText = isDark ? "#B79CFF" : "#6B4EFF";
  const inactiveText = isDark ? "#7E8695" : "#8B93A1";

  return (
    <View pointerEvents="box-none" style={styles.outerWrap}>
      <Animated.View
        style={[
          styles.tabBar,
          {
            backgroundColor: bgColor,
            borderColor,
            shadowOpacity: isDark ? 0.28 : 0.08,
          },
          animatedBarStyle,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { backgroundColor: activeBg, width: INDICATOR_WIDTH },
            animatedIndicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const cfg = TAB_CONFIG.find((t) => t.name === route.name);
          if (!cfg) return null;

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <View key={route.key} style={styles.slot}>
              <TabButton
                focused={focused}
                label={cfg.label}
                icon={cfg.icon as IoniconName}
                activeIcon={cfg.activeIcon as IoniconName}
                activeColor={activeText}
                inactiveColor={inactiveText}
                onPress={onPress}
                onLongPress={onLongPress}
                isFirstTab={index === 0}
              />
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: "shift",
            sceneStyle: { backgroundColor: theme.background },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          <Tabs.Screen name="rooms" options={{ title: "Rooms" }} />
          <Tabs.Screen name="friends" options={{ title: "Friends" }} />
          <Tabs.Screen name="tweets" options={{ title: "Tweets" }} />
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

const styles = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    left: TAB_BAR_HORIZONTAL_MARGIN,
    right: TAB_BAR_HORIZONTAL_MARGIN,
    bottom: 12,
  },

  tabBar: {
    height: 74,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    paddingVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === "android" ? 10 : 0,
  },

  indicator: {
    position: "absolute",
    left: 0,
    top: 17,
    height: 40,
    borderRadius: 22,
  },

  slot: {
    width: SLOT_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

tabPressable: {
  width: INDICATOR_WIDTH,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
},

tabInner: {
  width: INDICATOR_WIDTH,
  height: 40,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 6,
},

  iconHolder: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  labelWrap: {
    height: 20,
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  activeLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});