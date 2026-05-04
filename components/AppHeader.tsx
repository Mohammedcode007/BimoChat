
// import { Colors } from "@/constants/theme";
// import { useDrawer } from "@/context/DrawerContext";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { RootState } from "@/redux/store";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Image } from "expo-image";
// import { router, usePathname } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useSelector } from "react-redux";

// export default function AppHeader() {
//   const pathname = usePathname();
//   const insets = useSafeAreaInsets();
//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();
//   const [showThemeMenu, setShowThemeMenu] = useState(false);

//   const dropdownProgress = useSharedValue(0);
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const isDark = colorScheme === "dark";
//   const { open } = useDrawer();

//   const unreadCount = useSelector(
//     (state: RootState) => state.notification.unreadCount
//   );

//   const authUser = useSelector((state: RootState) => state.auth.user);
//   const me = useSelector((state: RootState) => state.user.me);

//   const user = me || authUser;

//   // if (pathname.includes("chat/room")) return null;

//   const title = useMemo(() => {
//     if (pathname === "/") return "Bimo";
//     if (pathname.includes("chats")) return "Chats";
//     if (pathname.includes("rooms")) return "Rooms";
//     if (pathname.includes("friends")) return "Friends";
//     if (pathname.includes("tweets")) return "Tweets";
//     if (pathname.includes("settings")) return "Settings";
//     if (pathname.includes("notifications")) return "Notifications";
//     if (pathname.includes("search")) return "Search";
//     if (pathname.includes("store")) return "Store";
//     return "Home";
//   }, [pathname]);

//   const s = useMemo(
//     () => makeStyles(theme, colorScheme === "dark"),
//     [theme, colorScheme]
//   );
//   const themeIcon =
//     themePreference === "dark"
//       ? "moon"
//       : themePreference === "light"
//         ? "sunny"
//         : "phone-portrait";

//   useEffect(() => {
//     dropdownProgress.value = withTiming(showThemeMenu ? 1 : 0, {
//       duration: 220,
//     });
//   }, [showThemeMenu, dropdownProgress]);

//   const dropdownAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       opacity: dropdownProgress.value,
//       transform: [
//         {
//           translateY: interpolate(dropdownProgress.value, [0, 1], [-8, 0]),
//         },
//         {
//           scale: interpolate(dropdownProgress.value, [0, 1], [0.96, 1]),
//         },
//       ],
//       pointerEvents: dropdownProgress.value === 0 ? "none" : "auto",
//     } as any;
//   });

//   if (pathname.includes("chat/room")) return null;

//   const toggleThemeMenu = () => {
//     setShowThemeMenu((prev) => !prev);
//   };
//   const closeThemeMenu = () => {
//     setShowThemeMenu(false);
//   };
//   return (
//     <View style={[s.wrap, { paddingTop: insets.top }]}>

//       <View style={s.container}>


//         {/* User */}
//         <TouchableOpacity
//           activeOpacity={0.9}
//           style={s.userContainer}
//           onPress={() =>
//             router.push({
//               pathname: "/profile/[id]" as any,
//               params: { id: user?._id },
//             } as any)
//           }
//         >
//           <View style={s.avatarWrap}>
//             <Image
//               source={
//                 user?.avatar
//                   ? { uri: String(user.avatar) }
//                   : require("@/assets/images/default-avatar.png")
//               }
//               style={s.avatar}
//               contentFit="cover"
//               transition={0}
//               cachePolicy="memory-disk"
//             />
//             <View style={s.onlineDot} />
//           </View>

//         </TouchableOpacity>
//         {/* Drawer Button */}
//         <View style={s.rightActions}>
//           <View style={s.themeMenuWrap}>
//             <Pressable
//               onPress={toggleThemeMenu}
//               android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
//               style={({ pressed }) => [
//                 s.themeBtn,
//                 pressed && Platform.OS === "ios" ? { opacity: 0.86 } : null,
//               ]}
//             >
//               <Ionicons name={themeIcon as any} size={18} color={theme.icon} />
//               <Ionicons
//                 name={showThemeMenu ? "chevron-up" : "chevron-down"}
//                 size={14}
//                 color={theme.mutedText}
//               />
//             </Pressable>

//             {showThemeMenu && (
//               <>
//                 <Pressable style={s.backdrop} onPress={closeThemeMenu} />

//                 <Animated.View style={[s.dropdown, dropdownAnimatedStyle]}>
//                   {[
//                     {
//                       key: "system",
//                       label: "System",
//                       icon: "phone-portrait-outline",
//                     },
//                     {
//                       key: "light",
//                       label: "Light",
//                       icon: "sunny-outline",
//                     },
//                     {
//                       key: "dark",
//                       label: "Dark",
//                       icon: "moon-outline",
//                     },
//                   ].map((item) => {
//                     const active = themePreference === item.key;

//                     return (
//                       <Pressable
//                         key={item.key}
//                         onPress={async () => {
//                           await setThemePreference(item.key as any);
//                           closeThemeMenu();
//                         }}
//                         android_ripple={{
//                           color: isDark
//                             ? "rgba(255,255,255,0.08)"
//                             : "rgba(0,0,0,0.06)",
//                         }}
//                         style={({ pressed }) => [
//                           s.dropdownItem,
//                           active && {
//                             backgroundColor: theme.primarySoft,
//                           },
//                           pressed && Platform.OS === "ios"
//                             ? { opacity: 0.82 }
//                             : null,
//                         ]}
//                       >
//                         <View style={s.dropdownItemLeft}>
//                           <Ionicons
//                             name={item.icon as any}
//                             size={18}
//                             color={active ? theme.primary : theme.icon}
//                           />
//                           <Text
//                             style={[
//                               s.dropdownItemText,
//                               { color: active ? theme.primary : theme.text },
//                             ]}
//                           >
//                             {item.label}
//                           </Text>
//                         </View>

//                         {active && (
//                           <Ionicons
//                             name="checkmark"
//                             size={18}
//                             color={theme.primary}
//                           />
//                         )}
//                       </Pressable>
//                     );
//                   })}
//                 </Animated.View>
//               </>
//             )}
//           </View>
//           {/* Search Button */}
//           <Pressable
//             onPress={() => router.push("/search")}
//             android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
//             style={({ pressed }) => [
//               s.menuBtn,
//               pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
//             ]}
//           >
//             <Ionicons name="search-outline" size={22} color={theme.icon} />
//           </Pressable>

//           {/* Store Button */}
//           <Pressable
//             onPress={() => router.push("/store")}
//             android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
//             style={({ pressed }) => [
//               s.menuBtn,
//               pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
//             ]}
//           >
//             <Ionicons name="storefront-outline" size={22} color={theme.icon} />
//           </Pressable>
//           <Pressable
//             onPress={open}
//             android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
//             style={({ pressed }) => [
//               s.menuBtn,
//               pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
//             ]}
//           >
//             <Ionicons name="menu-outline" size={28} color={theme.icon} />

//             {Number(unreadCount) > 0 && (
//               <View style={s.badge}>
//                 <Text style={s.badgeText}>
//                   {Number(unreadCount) > 99 ? "99+" : String(unreadCount)}
//                 </Text>
//               </View>
//             )}
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );
// }

// function makeStyles(theme: any, isDark: boolean) {
//   return StyleSheet.create({
//     wrap: {
//       position: "relative",
//       overflow: "visible",
//       zIndex: 9999,
//       elevation: 50,
//       backgroundColor: theme.background,
//       borderBottomWidth: 1,
//       borderBottomColor:
//         theme.separator ??
//         (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,28,0.10)"),
//     },

//     headerBg: {
//       ...StyleSheet.absoluteFillObject,
//       zIndex: 0,
//     },

//     container: {
//       zIndex: 2,
//       paddingHorizontal: 16,
//       paddingBottom: 10,
//       paddingTop: 10,
//       flexDirection: "row",
//       alignItems: "center",
//       overflow: "visible",
//     },
//     menuBtn: {
//       width: 36,
//       height: 36,
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       position: "relative",
//       overflow: "visible",
//     },
//     rightActions: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 4,
//       zIndex: 999999,
//       elevation: 999,
//     },

//     themeMenuWrap: {
//       position: "relative",
//       zIndex: 999999,
//       elevation: 999,
//     },

//     themeBtn: {
//       minWidth: 58,
//       height: 36,
//       borderRadius: 12,
//       paddingHorizontal: 10,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 4,
//       overflow: "hidden",
//       backgroundColor: isDark
//         ? "rgba(255,255,255,0.08)"
//         : "rgba(0,0,0,0.05)",
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     backdrop: {
//       position: "absolute",
//       top: -1200,
//       left: -1200,
//       right: -1200,
//       bottom: -1200,
//       zIndex: 999990,
//     },

//     dropdown: {
//       position: "absolute",
//       top: 44,
//       right: 0,
//       width: 170,
//       borderRadius: 16,
//       padding: 8,
//       backgroundColor: theme.card ?? theme.background,
//       borderWidth: 1,
//       borderColor: theme.border,
//       zIndex: 999999,
//       elevation: 1000,
//       overflow: "hidden",
//       ...Platform.select({
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: 0.16,
//           shadowRadius: 16,
//           shadowOffset: { width: 0, height: 10 },
//         },
//         android: {
//           elevation: 1000,
//         },
//       }),
//     },

//     dropdownItem: {
//       minHeight: 42,
//       borderRadius: 12,
//       paddingHorizontal: 12,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       overflow: "hidden",
//     },

//     dropdownItemLeft: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//     },

//     dropdownItemText: {
//       fontSize: 14,
//       fontWeight: "800",
//     },
//     userContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       flex: 1,
//       minWidth: 0,
//     },

//     textWrap: {
//       flex: 1,
//       minWidth: 0,
//     },

//     avatarWrap: {
//       width: 40,
//       height: 40,
//       borderRadius: 16,
//       padding: 2,
//       backgroundColor: theme.primarySoft,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//       position: "relative",
//       ...Platform.select({
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: isDark ? 0.18 : 0.08,
//           shadowRadius: 10,
//           shadowOffset: { width: 0, height: 6 },
//         },
//         android: {
//           elevation: 2,
//         },
//       }),
//     },

//     avatar: {
//       width: 36,
//       height: 36,
//       borderRadius: 14,
//       backgroundColor: theme.surface2,
//     },

//     onlineDot: {
//       position: "absolute",
//       bottom: -1,
//       right: -1,
//       width: 12,
//       height: 12,
//       borderRadius: 6,
//       backgroundColor: theme.success ?? "#22C55E",
//       borderWidth: 2,
//       borderColor: theme.background,
//     },

//     username: {
//       fontSize: 14,
//       fontWeight: "900",
//       color: theme.text,
//     },

//     subtitle: {
//       marginTop: 2,
//       fontSize: 12,
//       fontWeight: "700",
//       color: theme.mutedText,
//     },

//     badge: {
//       position: "absolute",
//       top: -3,
//       right: -5,
//       minWidth: 17,
//       height: 17,
//       borderRadius: 999,
//       paddingHorizontal: 4,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.danger ?? "#EF4444",
//       borderWidth: 1.5,
//       borderColor: theme.background,
//     },

//     badgeText: {
//       color: "#fff",
//       fontSize: 9,
//       fontWeight: "900",
//       lineHeight: 11,
//     },
//   });
// }
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { leaveAllActiveRooms, logout } from "@/redux/slices/authSlice";
import { resetChatState } from "@/redux/slices/chatSlice";
import { resetRoomState, setActiveRoom } from "@/redux/slices/room.slice";
import { resetUserState } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { disconnectSocket } from "@/services/socket";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function AppHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { colorScheme, themePreference, setThemePreference } =
    useColorScheme();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownProgress = useSharedValue(0);

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const unreadCount = useSelector(
    (state: RootState) => state.notification.unreadCount
  );

  const authUser = useSelector((state: RootState) => state.auth.user);
  const me = useSelector((state: RootState) => state.user.me);

  const user = me || authUser;

  const s = useMemo(
    () => makeStyles(theme, colorScheme === "dark"),
    [theme, colorScheme]
  );

  const themeIcon =
    themePreference === "dark"
      ? "moon"
      : themePreference === "light"
        ? "sunny"
        : "phone-portrait";

  useEffect(() => {
    dropdownProgress.value = withTiming(showThemeMenu ? 1 : 0, {
      duration: 220,
    });
  }, [showThemeMenu, dropdownProgress]);

  const dropdownAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dropdownProgress.value,
      transform: [
        {
          translateY: interpolate(dropdownProgress.value, [0, 1], [-8, 0]),
        },
        {
          scale: interpolate(dropdownProgress.value, [0, 1], [0.96, 1]),
        },
      ],
      pointerEvents: dropdownProgress.value === 0 ? "none" : "auto",
    } as any;
  });

  if (pathname.includes("chat/room")) return null;

  const toggleThemeMenu = () => {
    setShowThemeMenu((prev) => !prev);
  };

  const closeThemeMenu = () => {
    setShowThemeMenu(false);
  };

  const handleOpenNotifications = () => {
    closeThemeMenu();
    router.push("/notifications");
  };

  const handleOpenStore = () => {
    closeThemeMenu();
    router.push("/store");
  };

  // const handleConfirmLogout = () => {
  //   try {
  //     setShowLogoutModal(false);
  //     closeThemeMenu();

  //     disconnectSocket();

  //     dispatch(logout());
  //     dispatch(resetUserState());
  //     dispatch(resetChatState());

  //     router.replace("/login");
  //   } catch (e) {
  //     setShowLogoutModal(false);
  //   }
  // };
const handleConfirmLogout = async () => {
  try {
    setShowLogoutModal(false);
    closeThemeMenu();

    /**
     * 1) اخرج من كل الغرف قبل فصل السوكيت وقبل مسح التوكن
     */
    try {
      await dispatch(leaveAllActiveRooms()).unwrap();
    } catch (e) {
      // لا تمنع تسجيل الخروج لو فشل طلب الخروج من الغرف
    }

    /**
     * 2) نظف بيانات الغرف من Redux حتى لا تظهر رسائل قديمة بعد تسجيل الدخول
     */
    dispatch(setActiveRoom(undefined));
    dispatch(resetRoomState());

    /**
     * 3) افصل السوكيت بعد الخروج من الغرف
     */
    disconnectSocket();

    /**
     * 4) سجل خروج ونظف باقي البيانات
     */
    await dispatch(logout()).unwrap();

    dispatch(resetUserState());
    dispatch(resetChatState());

    router.replace("/login");
  } catch (e) {
    setShowLogoutModal(false);

    dispatch(setActiveRoom(undefined));
    dispatch(resetRoomState());
    dispatch(resetUserState());
    dispatch(resetChatState());

    disconnectSocket();

    router.replace("/login");
  }
};
  return (
    <View style={[s.wrap, { paddingTop: insets.top }]}>
      <View style={s.container}>
        {/* User */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={s.userContainer}
          onPress={() => {
            if (!user?._id) return;

            router.push({
              pathname: "/profile/[id]" as any,
              params: { id: user._id },
            } as any);
          }}
        >
          <View style={s.avatarWrap}>
            <Image
              source={
                user?.avatar
                  ? { uri: String(user.avatar) }
                  : require("@/assets/images/default-avatar.png")
              }
              style={s.avatar}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
            <View style={s.onlineDot} />
          </View>
        </TouchableOpacity>

        <View style={s.rightActions}>
          {/* Theme Button */}
          <View style={s.themeMenuWrap}>
            <Pressable
              onPress={toggleThemeMenu}
              android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
              style={({ pressed }) => [
                s.themeBtn,
                pressed && Platform.OS === "ios" ? { opacity: 0.86 } : null,
              ]}
            >
              <Ionicons name={themeIcon as any} size={18} color={theme.icon} />
              <Ionicons
                name={showThemeMenu ? "chevron-up" : "chevron-down"}
                size={14}
                color={theme.mutedText}
              />
            </Pressable>

            {showThemeMenu && (
              <>
                <Pressable style={s.backdrop} onPress={closeThemeMenu} />

                <Animated.View style={[s.dropdown, dropdownAnimatedStyle]}>
                  {[
                    {
                      key: "system",
                      label: "System",
                      icon: "phone-portrait-outline",
                    },
                    {
                      key: "light",
                      label: "Light",
                      icon: "sunny-outline",
                    },
                    {
                      key: "dark",
                      label: "Dark",
                      icon: "moon-outline",
                    },
                  ].map((item) => {
                    const active = themePreference === item.key;

                    return (
                      <Pressable
                        key={item.key}
                        onPress={async () => {
                          await setThemePreference(item.key as any);
                          closeThemeMenu();
                        }}
                        android_ripple={{
                          color: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.06)",
                        }}
                        style={({ pressed }) => [
                          s.dropdownItem,
                          active && {
                            backgroundColor: theme.primarySoft,
                          },
                          pressed && Platform.OS === "ios"
                            ? { opacity: 0.82 }
                            : null,
                        ]}
                      >
                        <View style={s.dropdownItemLeft}>
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={active ? theme.primary : theme.icon}
                          />
                          <Text
                            style={[
                              s.dropdownItemText,
                              { color: active ? theme.primary : theme.text },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>

                        {active && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={theme.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </Animated.View>
              </>
            )}
          </View>

          {/* Notifications Button */}
          <Pressable
            onPress={handleOpenNotifications}
            android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
            style={({ pressed }) => [
              s.menuBtn,
              pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={theme.icon}
            />

            {Number(unreadCount) > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>
                  {Number(unreadCount) > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Store Button */}
          <Pressable
            onPress={handleOpenStore}
            android_ripple={{ color: "rgba(255,255,255,0.12)", radius: 22 }}
            style={({ pressed }) => [
              s.menuBtn,
              pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
            ]}
          >
            <Ionicons name="storefront-outline" size={22} color={theme.icon} />
          </Pressable>

          {/* Logout Button */}
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            android_ripple={{ color: "rgba(239,68,68,0.12)", radius: 22 }}
            style={({ pressed }) => [
              s.logoutIconBtn,
              pressed && Platform.OS === "ios" ? { opacity: 0.82 } : null,
            ]}
          >
            <Ionicons name="log-out-outline" size={23} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Logout Confirm Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={s.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowLogoutModal(false)}
          />

          <View style={s.logoutModalCard}>
            <View style={s.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={28} color="#EF4444" />
            </View>

            <Text style={s.logoutModalTitle}>
              {t?.("drawer.logout.alertTitle") || "تسجيل الخروج"}
            </Text>

            <Text style={s.logoutModalText}>
              {t?.("drawer.logout.alertMessage") ||
                "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟"}
            </Text>

            <View style={s.logoutModalActions}>
              <Pressable
                onPress={() => setShowLogoutModal(false)}
                style={({ pressed }) => [
                  s.cancelBtn,
                  pressed ? { opacity: 0.8 } : null,
                ]}
              >
                <Text style={s.cancelBtnText}>
                  {t?.("common.cancel") || "إلغاء"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmLogout}
                style={({ pressed }) => [
                  s.confirmLogoutBtn,
                  pressed ? { opacity: 0.85 } : null,
                ]}
              >
                <Text style={s.confirmLogoutBtnText}>
                  {t?.("drawer.logout.alertConfirm") || "خروج"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    wrap: {
      position: "relative",
      overflow: "visible",
      zIndex: 9999,
      elevation: 50,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.separator ??
        (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,28,0.10)"),
    },

    container: {
      zIndex: 2,
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      overflow: "visible",
    },

    userContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      minWidth: 0,
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
        android: {
          elevation: 2,
        },
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

    rightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      zIndex: 999999,
      elevation: 999,
    },

    menuBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "visible",
    },

    logoutIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(239,68,68,0.10)"
        : "rgba(239,68,68,0.08)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(239,68,68,0.22)"
        : "rgba(239,68,68,0.16)",
    },

    themeMenuWrap: {
      position: "relative",
      zIndex: 999999,
      elevation: 999,
    },

    themeBtn: {
      minWidth: 58,
      height: 36,
      borderRadius: 12,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.05)",
      borderWidth: 1,
      borderColor: theme.border,
    },

    backdrop: {
      position: "absolute",
      top: -1200,
      left: -1200,
      right: -1200,
      bottom: -1200,
      zIndex: 999990,
    },

    dropdown: {
      position: "absolute",
      top: 44,
      right: 0,
      width: 170,
      borderRadius: 16,
      padding: 8,
      backgroundColor: theme.card ?? theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      zIndex: 999999,
      elevation: 1000,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
        },
        android: {
          elevation: 1000,
        },
      }),
    },

    dropdownItem: {
      minHeight: 42,
      borderRadius: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
    },

    dropdownItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    dropdownItemText: {
      fontSize: 14,
      fontWeight: "800",
    },

    badge: {
      position: "absolute",
      top: -3,
      right: -5,
      minWidth: 17,
      height: 17,
      borderRadius: 999,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.danger ?? "#EF4444",
      borderWidth: 1.5,
      borderColor: theme.background,
    },

    badgeText: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "900",
      lineHeight: 11,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 22,
    },

    logoutModalCard: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 26,
      padding: 20,
      backgroundColor: theme.card ?? theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
        android: {
          elevation: 8,
        },
      }),
    },

    logoutModalIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(239,68,68,0.12)"
        : "rgba(239,68,68,0.09)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(239,68,68,0.24)"
        : "rgba(239,68,68,0.18)",
      marginBottom: 14,
    },

    logoutModalTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
      textAlign: "center",
      marginBottom: 8,
    },

    logoutModalText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.mutedText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 18,
    },

    logoutModalActions: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    cancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.05)",
      borderWidth: 1,
      borderColor: theme.border,
    },

    cancelBtnText: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    confirmLogoutBtn: {
      flex: 1,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EF4444",
    },

    confirmLogoutBtnText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#fff",
    },
  });
}