
// import AppHeader from "@/components/AppHeader";
// import {
//   consumeBackgroundReminderTrigger,
//   incrementBackgroundReminderOpenCount,
//   shouldShowBackgroundReminder,
// } from "@/components/backgroundReminder";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { selectSortedChats } from "@/redux/selectors";
// import { fetchChats, fetchTotalUnread, hydrateChatsFromCache } from "@/redux/slices/chatSlice";
// import { getFriends } from "@/redux/slices/friendSlice";
// import { fetchMyStories, fetchStoriesFeed } from "@/redux/slices/storySlice";
// import { getFollowingFeed, getForYouFeed } from "@/redux/slices/tweetSlice";
// import { fetchMyFullUser } from "@/redux/slices/userSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import { loadChatsFromCache } from "@/storage/chatCache";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
// import React, { useEffect, useMemo, useRef } from "react";
// import { ActivityIndicator, Animated, Easing, InteractionManager, Platform, StyleSheet, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// type IoniconName = keyof typeof Ionicons.glyphMap;

// const TAB_CONFIG = {
//   tweets: {
//     title: "Tweets",
//     label: "Tweets",
//     icon: "newspaper-outline" as IoniconName,
//     activeIcon: "newspaper" as IoniconName,
//   },
//   rooms: {
//     title: "Rooms",
//     label: "Rooms",
//     icon: "grid-outline" as IoniconName,
//     activeIcon: "headset" as IoniconName,
//   },
//   chats: {
//     title: "Chats",
//     label: "Chats",
//     icon: "chatbox-outline" as IoniconName,
//     activeIcon: "chatbubble-ellipses" as IoniconName,
//   },
//   friends: {
//     title: "Friends",
//     label: "Friends",
//     icon: "people-outline" as IoniconName,
//     activeIcon: "people" as IoniconName,
//   },

// } as const;
// type TabIconProps = {
//   focused: boolean;
//   color: string;
//   iconName: IoniconName;
//   size?: number;
//   children?: React.ReactNode;
//   styles: ReturnType<typeof makeStyles>;
// };

// const AnimatedTabIcon = React.memo(function AnimatedTabIcon({
//   focused,
//   color,
//   iconName,
//   size,
//   children,
//   styles,
// }: TabIconProps) {
//   const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

//   useEffect(() => {
//    Animated.timing(progress, {
//   toValue: focused ? 1 : 0,
//   duration: 220,
//   easing: Easing.out(Easing.cubic),
//   useNativeDriver: false,
// }).start();
//   }, [focused, progress]);

//   const bgOpacity = progress.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 1],
//   });

//   const bgScale = progress.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.72, 1],
//   });
// const bgColor = progress.interpolate({
//   inputRange: [0, 1],
//   outputRange: ["rgba(217,238,243,0)", "rgba(217,238,243,1)"],
// });
//   const iconScale = progress.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.06],
//   });

//   return (
//     <View style={styles.tabIconWrap}>
//  <Animated.View
//   pointerEvents="none"
//   style={[
//     styles.activeTabIconBg,
//     {
//       opacity: bgOpacity,
//       backgroundColor: bgColor,
//       transform: [{ scale: bgScale }],
//     },
//   ]}
// />

//       <Animated.View
//         style={{
//           transform: [{ scale: iconScale }],
//         }}
//       >
//         <Ionicons name={iconName} size={size ?? 22} color={color} />
//       </Animated.View>

//       {children}
//     </View>
//   );
// });
// export default function TabLayout() {
//   const { colorScheme } = useColorScheme();
//   const theme = Colors[colorScheme ?? "light"];
//   const dispatch = useDispatch<AppDispatch>();
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const segments = useSegments();
//   const token = useSelector((state: RootState) => state.auth.token);
//   const totalUnread = useSelector(
//     (state: RootState) => state.chat.totalUnread
//   );
//   const authUser = useSelector((state: RootState) => state.auth.user);
// const chats = useSelector(selectSortedChats);

// const preloadStartedRef = useRef(false);
// const messagesPreloadedRef = useRef(false);
//   const me = useSelector((state: RootState) => state.user.me);
//   const hasCheckedBackgroundReminderRef = useRef(false);

//   const { isLoggedIn, hydrated, loading } = useSelector(
//     (state: RootState) => state.auth
//   );

//   const s = useMemo(() => makeStyles(theme), [theme]);

//   // useEffect(() => {
//   //   if (!token) return;

//   //   dispatch(fetchMyFullUser());
//   //   dispatch(fetchChats() as any);
//   //   dispatch(fetchTotalUnread() as any);
//   // }, [dispatch, token]);
// useEffect(() => {
//   if (!token) return;
//   if (!hydrated || loading || !isLoggedIn) return;
//   if (preloadStartedRef.current) return;

//   preloadStartedRef.current = true;

//   const currentUserId = String(authUser?._id || me?._id || "");

//   try {
//     if (currentUserId) {
//       const cachedChats = loadChatsFromCache(currentUserId);

//       if (Array.isArray(cachedChats) && cachedChats.length > 0) {
//         dispatch(hydrateChatsFromCache(cachedChats));
//       }
//     }
//   } catch (error) {
//     console.log("[MAIN_LAYOUT_PRELOAD][cache chats error]", error);
//   }

//   dispatch(fetchMyFullUser());

//   dispatch(fetchChats() as any);
//   dispatch(fetchTotalUnread() as any);

//   const task = InteractionManager.runAfterInteractions(() => {
//     setTimeout(() => {
//       dispatch(getFriends() as any);

//       dispatch(fetchMyStories() as any);
//       dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any);

//       dispatch(getForYouFeed({ page: 1 }) as any);
//       dispatch(getFollowingFeed({ page: 1 }) as any);
//     }, 350);
//   });

//   return () => {
//     task.cancel?.();
//   };
// }, [
//   token,
//   hydrated,
//   loading,
//   isLoggedIn,
//   authUser?._id,
//   me?._id,
//   dispatch,
// ]);
//   useEffect(() => {
//     const checkBackgroundReminder = async () => {
//       try {
//         if (!hydrated || loading || !isLoggedIn) return;
//         if (hasCheckedBackgroundReminderRef.current) return;

//         const isOnBackgroundActivityScreen = Array.isArray(segments)
//           ? segments.some((segment) => String(segment) === "background-activity")
//           : false;

//         if (isOnBackgroundActivityScreen) return;

//         hasCheckedBackgroundReminderRef.current = true;

//         await incrementBackgroundReminderOpenCount();

//         const result = await shouldShowBackgroundReminder();

//         if (result.shouldShow) {
//           await consumeBackgroundReminderTrigger();
//           router.push("/background-activity" as any);
//         }
//       } catch (error) { }
//     };

//     checkBackgroundReminder();
//   }, [hydrated, loading, isLoggedIn, segments, router]);

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

//   const androidBottomInset =
//     Platform.OS === "android" ? Math.max(insets.bottom, 8) : 0;
//   const iosBottomInset =
//     Platform.OS === "ios" ? Math.max(insets.bottom, 20) : 0;
//   const bottomPadding =
//     Platform.OS === "ios" ? iosBottomInset : androidBottomInset;
//   const tabBarHeight = 56 + bottomPadding;

//   return (
//     <View style={s.full}>
//       <AppHeader />
//       <View style={{ flex: 1 }}>
//         <Tabs
//           initialRouteName="rooms"
//           screenOptions={({ route }) => {
//             const config =
//               TAB_CONFIG[route.name as keyof typeof TAB_CONFIG] ?? TAB_CONFIG.chats;

//             return {
//               headerShown: false,
//               animation: "fade",
//               lazy: true,
//               freezeOnBlur: true,
//               tabBarHideOnKeyboard: true,
//               sceneStyle: {
//                 backgroundColor: theme.background,
//               },
//               tabBarActiveTintColor:
//                 colorScheme === "dark" ? "#FFFFFF" : "#111827",
//               tabBarInactiveTintColor:
//                 colorScheme === "dark" ? "#7E8695" : "#6B7280",
//               tabBarShowLabel: true,
//               tabBarLabelStyle: {
//                 fontSize: 12,
//                 fontWeight: "800" as const,
//                 marginTop: 5,
//                 marginBottom: 0,
//               },
//               tabBarStyle: {
//                 height: tabBarHeight + 4,
//                 paddingTop: 5,
//                 paddingBottom: bottomPadding,
//                 backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
//                 borderTopWidth: 1,
//                 borderTopColor:
//                   colorScheme === "dark"
//                     ? "rgba(255,255,255,0.08)"
//                     : "rgba(0,0,0,0.08)",
//                 elevation: 8,
//               },
//               tabBarItemStyle: {
//                 paddingTop: 2,
//                 paddingBottom: 4,
//               },
//               tabBarIcon: ({ focused, color, size }) => {
//                 const isChatsTab = route.name === "chats";
//                 const unread = Number(totalUnread || 0);

//                 return (
//                   <AnimatedTabIcon
//                     focused={focused}
//                     color={color}
//                     iconName={config.icon}
//                     size={20}
//                     styles={s}
//                   >
//                     {isChatsTab && unread > 0 && (
//                       <View style={s.unreadBadge}>
//                         <Text style={s.unreadBadgeText}>
//                           {unread > 99 ? "99+" : unread}
//                         </Text>
//                       </View>
//                     )}
//                   </AnimatedTabIcon>
//                 );
//               },
//               title: config.title,
//               tabBarLabel: config.label,
//             };
//           }}
//         >
//           <Tabs.Screen name="tweets" />
//           <Tabs.Screen name="rooms" />
//           <Tabs.Screen name="index" options={{ href: null }} />
//           <Tabs.Screen name="chats" />
//           <Tabs.Screen name="friends" />
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
//     tabIconWrap: {
//       width: 54,
//       height: 30,
//       alignItems: "center",
//       justifyContent: "center",
//     },

// activeTabIconBg: {
//   position: "absolute",
//   width: 70,
//   height: 28,
//   borderRadius: 18,
// },

//     unreadBadge: {
//       position: "absolute",
//       top: -5,
//       right: -8,
//       minWidth: 17,
//       height: 17,
//       borderRadius: 9,
//       paddingHorizontal: 4,
//       backgroundColor: "#EF4444",
//       alignItems: "center",
//       justifyContent: "center",
//       borderWidth: 1.5,
//       borderColor: theme.background || "#FFFFFF",
//     },

//     unreadBadgeText: {
//       color: "#FFFFFF",
//       fontSize: 10,
//       fontWeight: "800",
//       includeFontPadding: false,
//       textAlign: "center",
//     },
//   });
// }
import AppHeader from "@/components/AppHeader";
import {
  consumeBackgroundReminderTrigger,
  incrementBackgroundReminderOpenCount,
  shouldShowBackgroundReminder,
} from "@/components/backgroundReminder";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { selectSortedChats } from "@/redux/selectors";
import {
  fetchChats,
  fetchTotalUnread,
  hydrateChatsFromCache,
} from "@/redux/slices/chatSlice";
import { getFriends } from "@/redux/slices/friendSlice";
import { fetchMyStories, fetchStoriesFeed } from "@/redux/slices/storySlice";
import { getFollowingFeed, getForYouFeed } from "@/redux/slices/tweetSlice";
import { fetchMyFullUser } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { loadChatsFromCache } from "@/storage/chatCache";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG = {
  tweets: {
    titleKey: "tabs.tweets",
    labelKey: "tabs.tweets",
    icon: "newspaper-outline" as IoniconName,
    activeIcon: "newspaper" as IoniconName,
  },
  rooms: {
    titleKey: "tabs.rooms",
    labelKey: "tabs.rooms",
    icon: "grid-outline" as IoniconName,
    activeIcon: "headset" as IoniconName,
  },
  chats: {
    titleKey: "tabs.chats",
    labelKey: "tabs.chats",
    icon: "chatbox-outline" as IoniconName,
    activeIcon: "chatbubble-ellipses" as IoniconName,
  },
  friends: {
    titleKey: "tabs.friends",
    labelKey: "tabs.friends",
    icon: "people-outline" as IoniconName,
    activeIcon: "people" as IoniconName,
  },
} as const;

type TabIconProps = {
  focused: boolean;
  color: string;
  iconName: IoniconName;
  size?: number;
  children?: React.ReactNode;
  styles: ReturnType<typeof makeStyles>;
};

const AnimatedTabIcon = React.memo(function AnimatedTabIcon({
  focused,
  color,
  iconName,
  size,
  children,
  styles,
}: TabIconProps) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [focused, progress]);

  const bgOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const bgScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  const bgColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(217,238,243,0)", "rgba(217,238,243,1)"],
  });

  const iconScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <View style={styles.tabIconWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeTabIconBg,
          {
            opacity: bgOpacity,
            backgroundColor: bgColor,
            transform: [{ scale: bgScale }],
          },
        ]}
      />

      <Animated.View
        style={{
          transform: [{ scale: iconScale }],
        }}
      >
        <Ionicons name={iconName} size={size ?? 22} color={color} />
      </Animated.View>

      {children}
    </View>
  );
});

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { t, isRTL } = useTranslation();

  const token = useSelector((state: RootState) => state.auth.token);
  const totalUnread = useSelector((state: RootState) => state.chat.totalUnread);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const chats = useSelector(selectSortedChats);

  const preloadStartedRef = useRef(false);
  const messagesPreloadedRef = useRef(false);
  const me = useSelector((state: RootState) => state.user.me);
  const hasCheckedBackgroundReminderRef = useRef(false);

  const { isLoggedIn, hydrated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const s = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    if (!token) return;
    if (!hydrated || loading || !isLoggedIn) return;
    if (preloadStartedRef.current) return;

    preloadStartedRef.current = true;

    const currentUserId = String(authUser?._id || me?._id || "");

    try {
      if (currentUserId) {
        const cachedChats = loadChatsFromCache(currentUserId);

        if (Array.isArray(cachedChats) && cachedChats.length > 0) {
          dispatch(hydrateChatsFromCache(cachedChats));
        }
      }
    } catch (error) {
      console.log("[MAIN_LAYOUT_PRELOAD][cache chats error]", error);
    }

    dispatch(fetchMyFullUser());

    dispatch(fetchChats() as any);
    dispatch(fetchTotalUnread() as any);

    const task = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        dispatch(getFriends() as any);

        dispatch(fetchMyStories() as any);
        dispatch(fetchStoriesFeed({ page: 1, limit: 30 }) as any);

        dispatch(getForYouFeed({ page: 1 }) as any);
        dispatch(getFollowingFeed({ page: 1 }) as any);
      }, 350);
    });

    return () => {
      task.cancel?.();
    };
  }, [
    token,
    hydrated,
    loading,
    isLoggedIn,
    authUser?._id,
    me?._id,
    dispatch,
  ]);

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
      } catch (error) {}
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
              TAB_CONFIG[route.name as keyof typeof TAB_CONFIG] ??
              TAB_CONFIG.chats;

            return {
              headerShown: false,
              animation: "fade",
              lazy: true,
              freezeOnBlur: true,
              tabBarHideOnKeyboard: true,
              sceneStyle: {
                backgroundColor: theme.background,
              },
              tabBarActiveTintColor:
                colorScheme === "dark" ? "#FFFFFF" : "#111827",
              tabBarInactiveTintColor:
                colorScheme === "dark" ? "#7E8695" : "#6B7280",
              tabBarShowLabel: true,
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "800" as const,
                marginTop: 5,
                marginBottom: 0,
                writingDirection: isRTL ? "rtl" : "ltr",
                textAlign: "center" as const,
              },
              tabBarStyle: {
                height: tabBarHeight + 4,
                paddingTop: 5,
                paddingBottom: bottomPadding,
                backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)",
                elevation: 8,
              },
              tabBarItemStyle: {
                paddingTop: 2,
                paddingBottom: 4,
              },
              tabBarIcon: ({ focused, color, size }) => {
                const isChatsTab = route.name === "chats";
                const unread = Number(totalUnread || 0);
                const iconName =  config.icon;

                return (
                  <AnimatedTabIcon
                    focused={focused}
                    color={color}
                    iconName={iconName}
                    size={20}
                    styles={s}
                  >
                    {isChatsTab && unread > 0 && (
                      <View style={s.unreadBadge}>
                        <Text style={s.unreadBadgeText}>
                          {unread > 99 ? "99+" : unread}
                        </Text>
                      </View>
                    )}
                  </AnimatedTabIcon>
                );
              },
              title: t(config.titleKey),
              tabBarLabel: t(config.labelKey),
            };
          }}
        >
          <Tabs.Screen name="tweets" />
          <Tabs.Screen name="rooms" />
          <Tabs.Screen name="index" options={{ href: null }} />
          <Tabs.Screen name="chats" />
          <Tabs.Screen name="friends" />
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
      width: 54,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },

    activeTabIconBg: {
      position: "absolute",
      width: 70,
      height: 28,
      borderRadius: 18,
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