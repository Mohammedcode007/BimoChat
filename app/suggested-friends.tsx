// import { AppTheme, Colors, ThemeName } from "@/constants/theme";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useRouter } from "expo-router";
// import { useEffect, useMemo, useState } from "react";
// import {
//     ActivityIndicator,
//     FlatList,
//     Image,
//     RefreshControl,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     useColorScheme,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// import {
//     cancelFriendRequest,
//     fetchSuggestedFriends,
//     sendFriendRequest,
//     UserItem,
// } from "@/redux/slices/friendSlice";

// import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
// import { setMessages } from "@/redux/slices/messageSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import api from "@/services/api";

// export default function SuggestedFriendsScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const scheme = useColorScheme();
//   const themeName: ThemeName = scheme === "dark" ? "dark" : "light";
//   const theme: AppTheme = Colors[themeName];
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   const {
//     suggestedFriends = [],
//     loadingSuggested = false,
//     loading = false,
//   } = useSelector((state: RootState) => state.friends);

//   const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     dispatch(fetchSuggestedFriends(20));
//   }, [dispatch]);

//   const onRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await dispatch(fetchSuggestedFriends(20)).unwrap();
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const openChat = async (targetUserId: string) => {
//     if (creatingChatId) return;

//     try {
//       setCreatingChatId(targetUserId);

//       const chat = await dispatch(createChat(targetUserId)).unwrap();

//       dispatch(setActiveChat(chat._id));

//       const messagesRes = await api.get(`/messages/${chat._id}?page=1`);

//       dispatch(
//         setMessages({
//           chatId: chat._id,
//           messages: messagesRes.data,
//         })
//       );

//       router.push(`/chat/${chat._id}`);
//     } catch (e) {
//       console.log("❌ openChat error:", e);
//     } finally {
//       setCreatingChatId(null);
//     }
//   };

//   const renderFriendButton = (user: UserItem) => {
//     const disabled = loading || loadingSuggested;

//     switch (user.relationshipStatus) {
//       case "none":
//         return (
//           <TouchableOpacity
//             style={[s.pillBtn, s.pillPrimary, disabled && s.disabledBtn]}
//             disabled={disabled}
//             onPress={() => dispatch(sendFriendRequest(user._id))}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="person-add-outline" size={16} color={theme.primaryText} />
//             <Text style={s.pillTextOnPrimary}>إضافة</Text>
//           </TouchableOpacity>
//         );

//       case "pending_sent":
//         return (
//           <TouchableOpacity
//             style={[s.pillBtn, s.pillWarning, disabled && s.disabledBtn]}
//             disabled={disabled}
//             onPress={() => dispatch(cancelFriendRequest(user._id))}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="close-circle-outline" size={16} color="#111827" />
//             <Text style={s.pillTextOnWarning}>إلغاء الطلب</Text>
//           </TouchableOpacity>
//         );

//       case "pending_received":
//         return (
//           <View style={[s.pillBtn, s.pillNeutral]}>
//             <Ionicons name="time-outline" size={16} color={theme.icon} />
//             <Text style={s.pillTextNeutral}>بانتظارك</Text>
//           </View>
//         );

//       case "accepted":
//         return (
//           <View style={[s.pillBtn, s.pillSuccess]}>
//             <Ionicons name="checkmark-circle-outline" size={16} color={theme.primaryText} />
//             <Text style={s.pillTextOnPrimary}>أصدقاء</Text>
//           </View>
//         );

//       case "blocked_by_me":
//         return (
//           <View style={[s.pillBtn, s.pillMuted]}>
//             <Ionicons name="ban-outline" size={16} color={theme.primaryText} />
//             <Text style={s.pillTextOnPrimary}>محظور</Text>
//           </View>
//         );

//       case "blocked_me":
//         return (
//           <View style={[s.pillBtn, s.pillDanger]}>
//             <Ionicons name="alert-circle-outline" size={16} color={theme.primaryText} />
//             <Text style={s.pillTextOnPrimary}>حظرك</Text>
//           </View>
//         );

//       default:
//         return null;
//     }
//   };

//   const renderItem = ({ item }: { item: UserItem }) => {
//     const isBusy = creatingChatId === String(item._id);

//     return (
//       <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
//         <TouchableOpacity
//           onPress={() =>
//             router.push({
//               pathname: "/profile/[id]",
//               params: { id: item._id },
//             })
//           }
//           style={{ position: "relative" }}
//           activeOpacity={0.9}
//         >
//           <Image
//             source={{
//               uri:
//                 item.avatar ||
//                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU7ukgfgh3h397fTWEGFf9ZtmU7jY6wbDY1Q&s",
//             }}
//             style={s.avatar}
//           />

//           <View
//             style={[
//               s.onlineDot,
//               {
//                 backgroundColor: item.isOnline ? theme.success : theme.subtleText,
//                 borderColor: theme.card,
//               },
//             ]}
//           />
//         </TouchableOpacity>

//         <View style={s.infoWrap}>
//           <View style={s.nameRow}>
//             <Text style={[s.name, { color: theme.text }]} numberOfLines={1}>
//               {item.username}
//             </Text>

//             {item.isOnline ? (
//               <View
//                 style={[
//                   s.onlinePill,
//                   { backgroundColor: theme.primarySoft, borderColor: theme.border },
//                 ]}
//               >
//                 <Text style={[s.onlinePillText, { color: theme.text }]}>Online</Text>
//               </View>
//             ) : null}
//           </View>

//           {!!item.atUsername && (
//             <Text style={[s.username, { color: theme.mutedText }]} numberOfLines={1}>
//               {item.atUsername}
//             </Text>
//           )}

//           {!!item.bio && (
//             <Text style={[s.bio, { color: theme.mutedText }]} numberOfLines={2}>
//               {item.bio}
//             </Text>
//           )}
//         </View>

//         <View style={s.actionsCol}>
//           <TouchableOpacity
//             style={[s.chatIconBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
//             onPress={() => openChat(String(item._id))}
//             disabled={isBusy}
//             activeOpacity={0.85}
//           >
//             {isBusy ? (
//               <ActivityIndicator size="small" color={theme.primaryText} />
//             ) : (
//               <Ionicons
//                 name="chatbubble-ellipses-outline"
//                 size={18}
//                 color={theme.primaryText}
//               />
//             )}
//           </TouchableOpacity>

//           {renderFriendButton(item)}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
//       <View style={[s.header, { borderBottomColor: theme.separator }]}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={s.headerBtn}
//           activeOpacity={0.85}
//           hitSlop={10}
//         >
//           <Ionicons name="arrow-back" size={22} color={theme.text} />
//         </TouchableOpacity>

//         <View style={{ flex: 1 }}>
//           <Text style={[s.headerTitle, { color: theme.text }]}>الأصدقاء المقترحون</Text>
//           <Text style={[s.headerSub, { color: theme.mutedText }]}>
//             أشخاص مناسبون للإضافة والتواصل
//           </Text>
//         </View>

//         <TouchableOpacity
//           onPress={onRefresh}
//           style={s.headerBtn}
//           activeOpacity={0.85}
//           hitSlop={10}
//         >
//           <Ionicons name="refresh-outline" size={22} color={theme.text} />
//         </TouchableOpacity>
//       </View>

//       {loadingSuggested && suggestedFriends.length === 0 ? (
//         <View style={s.centerBox}>
//           <ActivityIndicator />
//           <Text style={[s.centerText, { color: theme.mutedText }]}>جارٍ تحميل المقترحات...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={suggestedFriends}
//           keyExtractor={(item) => String(item._id)}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             paddingTop: 12,
//             paddingBottom: 24,
//             flexGrow: suggestedFriends.length === 0 ? 1 : 0,
//           }}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={
//             <View style={s.empty}>
//               <Ionicons name="people-outline" size={28} color={theme.icon} />
//               <Text style={[s.emptyTitle, { color: theme.text }]}>لا توجد اقتراحات الآن</Text>
//               <Text style={[s.emptyText, { color: theme.mutedText }]}>
//                 أضف مدينتك واهتماماتك لتحصل على اقتراحات أفضل
//               </Text>
//             </View>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// function makeStyles(theme: any) {
//   return StyleSheet.create({
//     container: {
//       flex: 1,
//       paddingHorizontal: 14,
//     },

//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       paddingVertical: 10,
//       borderBottomWidth: 1,
//       marginBottom: 6,
//     },

//     headerBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     headerTitle: {
//       fontSize: 18,
//       fontWeight: "900",
//     },

//     headerSub: {
//       marginTop: 2,
//       fontSize: 12,
//       fontWeight: "700",
//     },

//     card: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingVertical: 12,
//       paddingHorizontal: 10,
//       borderRadius: 18,
//       borderWidth: 1,
//       marginBottom: 10,
//     },

//     avatar: {
//       width: 54,
//       height: 54,
//       borderRadius: 18,
//       marginRight: 10,
//     },

//     onlineDot: {
//       position: "absolute",
//       bottom: 2,
//       right: 8,
//       width: 12,
//       height: 12,
//       borderRadius: 6,
//       borderWidth: 2,
//     },

//     infoWrap: {
//       flex: 1,
//       paddingRight: 10,
//     },

//     nameRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//     },

//     name: {
//       fontSize: 14,
//       fontWeight: "900",
//       maxWidth: "75%",
//     },

//     username: {
//       marginTop: 3,
//       fontSize: 12,
//       fontWeight: "700",
//     },

//     bio: {
//       marginTop: 5,
//       fontSize: 12,
//       lineHeight: 18,
//       fontWeight: "600",
//     },

//     onlinePill: {
//       paddingHorizontal: 10,
//       paddingVertical: 4,
//       borderRadius: 999,
//       borderWidth: 1,
//     },

//     onlinePillText: {
//       fontSize: 11,
//       fontWeight: "900",
//     },

//     actionsCol: {
//       alignItems: "flex-end",
//       gap: 8,
//     },

//     chatIconBtn: {
//       width: 40,
//       height: 40,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//       borderWidth: 1,
//     },

//     pillBtn: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 6,
//       paddingHorizontal: 12,
//       paddingVertical: 8,
//       borderRadius: 999,
//       minWidth: 96,
//       justifyContent: "center",
//     },

//     pillPrimary: {
//       backgroundColor: theme.primary,
//     },

//     pillSuccess: {
//       backgroundColor: theme.success,
//     },

//     pillWarning: {
//       backgroundColor: theme.warning,
//     },

//     pillDanger: {
//       backgroundColor: theme.danger,
//     },

//     pillMuted: {
//       backgroundColor: "#6B7280",
//     },

//     pillNeutral: {
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     pillTextOnPrimary: {
//       color: theme.primaryText,
//       fontSize: 12,
//       fontWeight: "900",
//     },

//     pillTextOnWarning: {
//       color: "#111827",
//       fontSize: 12,
//       fontWeight: "900",
//     },

//     pillTextNeutral: {
//       color: theme.text,
//       fontSize: 12,
//       fontWeight: "900",
//     },

//     disabledBtn: {
//       opacity: 0.5,
//     },

//     centerBox: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 10,
//     },

//     centerText: {
//       fontSize: 13,
//       fontWeight: "700",
//     },

//     empty: {
//       flex: 1,
//       alignItems: "center",
//       justifyContent: "center",
//       paddingHorizontal: 24,
//       gap: 10,
//     },

//     emptyTitle: {
//       fontSize: 16,
//       fontWeight: "900",
//     },

//     emptyText: {
//       fontSize: 13,
//       lineHeight: 21,
//       fontWeight: "700",
//       textAlign: "center",
//     },
//   });
// }
import { AppTheme, Colors, ThemeName } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import {
  cancelFriendRequest,
  fetchSuggestedFriends,
  sendFriendRequest,
  UserItem,
} from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function SuggestedFriendsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { language, t } = useTranslation();

  const isRTL = language === "ar" || I18nManager.isRTL;

  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === "dark" ? "dark" : "light";
  const theme: AppTheme = Colors[themeName];
  const s = useMemo(() => makeStyles(theme, isRTL), [theme, isRTL]);

  const copy = useMemo(
    () => ({
      title: t("suggestedFriends.title"),
      subtitle: t("suggestedFriends.subtitle"),
      loading: t("suggestedFriends.loading"),
      emptyTitle: t("suggestedFriends.emptyTitle"),
      emptyText: t("suggestedFriends.emptyText"),
      online: t("suggestedFriends.online"),
      add: t("suggestedFriends.add"),
      cancelRequest: t("suggestedFriends.cancelRequest"),
      pendingYou: t("suggestedFriends.pendingYou"),
      friends: t("suggestedFriends.friends"),
      blocked: t("suggestedFriends.blocked"),
      blockedYou: t("suggestedFriends.blockedYou"),
    }),
    [t]
  );

  const {
    suggestedFriends = [],
    loadingSuggested = false,
    loading = false,
  } = useSelector((state: RootState) => state.friends);

  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchSuggestedFriends(20));
  }, [dispatch]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchSuggestedFriends(20)).unwrap();
    } finally {
      setRefreshing(false);
    }
  };

  const openChat = async (targetUserId: string) => {
    if (creatingChatId) return;

    try {
      setCreatingChatId(targetUserId);

      const chat = await dispatch(createChat(targetUserId)).unwrap();

      dispatch(setActiveChat(chat._id));

      const messagesRes = await api.get(`/messages/${chat._id}?page=1`);

      dispatch(
        setMessages({
          chatId: chat._id,
          messages: messagesRes.data,
        })
      );

      router.push(`/chat/${chat._id}`);
    } catch (e) {
      console.log("openChat error:", e);
    } finally {
      setCreatingChatId(null);
    }
  };

  const renderFriendButton = (user: UserItem) => {
    const disabled = loading || loadingSuggested;

    switch (user.relationshipStatus) {
      case "none":
        return (
          <TouchableOpacity
            style={[s.pillBtn, s.pillPrimary, disabled && s.disabledBtn]}
            disabled={disabled}
            onPress={() => dispatch(sendFriendRequest(user._id))}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={16} color={theme.primaryText} />
            <Text style={s.pillTextOnPrimary}>{copy.add}</Text>
          </TouchableOpacity>
        );

      case "pending_sent":
        return (
          <TouchableOpacity
            style={[s.pillBtn, s.pillWarning, disabled && s.disabledBtn]}
            disabled={disabled}
            onPress={() => dispatch(cancelFriendRequest(user._id))}
            activeOpacity={0.85}
          >
            <Ionicons name="close-circle-outline" size={16} color="#111827" />
            <Text style={s.pillTextOnWarning}>{copy.cancelRequest}</Text>
          </TouchableOpacity>
        );

      case "pending_received":
        return (
          <View style={[s.pillBtn, s.pillNeutral]}>
            <Ionicons name="time-outline" size={16} color={theme.icon} />
            <Text style={s.pillTextNeutral}>{copy.pendingYou}</Text>
          </View>
        );

      case "accepted":
        return (
          <View style={[s.pillBtn, s.pillSuccess]}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.primaryText} />
            <Text style={s.pillTextOnPrimary}>{copy.friends}</Text>
          </View>
        );

      case "blocked_by_me":
        return (
          <View style={[s.pillBtn, s.pillMuted]}>
            <Ionicons name="ban-outline" size={16} color={theme.primaryText} />
            <Text style={s.pillTextOnPrimary}>{copy.blocked}</Text>
          </View>
        );

      case "blocked_me":
        return (
          <View style={[s.pillBtn, s.pillDanger]}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.primaryText} />
            <Text style={s.pillTextOnPrimary}>{copy.blockedYou}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: UserItem }) => {
    const isBusy = creatingChatId === String(item._id);

    return (
      <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/profile/[id]",
              params: { id: item._id },
            })
          }
          style={{ position: "relative" }}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri:
                item.avatar ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU7ukgfgh3h397fTWEGFf9ZtmU7jY6wbDY1Q&s",
            }}
            style={s.avatar}
          />

          <View
            style={[
              s.onlineDot,
              {
                backgroundColor: item.isOnline ? theme.success : theme.subtleText,
                borderColor: theme.card,
              },
            ]}
          />
        </TouchableOpacity>

        <View style={s.infoWrap}>
          <View style={s.nameRow}>
            <Text style={[s.name, { color: theme.text }]} numberOfLines={1}>
              {item.username}
            </Text>

            {item.isOnline ? (
              <View
                style={[
                  s.onlinePill,
                  { backgroundColor: theme.primarySoft, borderColor: theme.border },
                ]}
              >
                <Text style={[s.onlinePillText, { color: theme.text }]}>{copy.online}</Text>
              </View>
            ) : null}
          </View>

          {!!item.atUsername && (
            <Text style={[s.username, { color: theme.mutedText }]} numberOfLines={1}>
              {item.atUsername}
            </Text>
          )}

          {!!item.bio && (
            <Text style={[s.bio, { color: theme.mutedText }]} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
        </View>

        <View style={s.actionsCol}>
          <TouchableOpacity
            style={[s.chatIconBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => openChat(String(item._id))}
            disabled={isBusy}
            activeOpacity={0.85}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={theme.primaryText} />
            ) : (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={theme.primaryText}
              />
            )}
          </TouchableOpacity>

          {renderFriendButton(item)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <View style={[s.header, { borderBottomColor: theme.separator }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.headerBtn}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: theme.text }]}>{copy.title}</Text>
          <Text style={[s.headerSub, { color: theme.mutedText }]}>{copy.subtitle}</Text>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={s.headerBtn}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="refresh-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loadingSuggested && suggestedFriends.length === 0 ? (
        <View style={s.centerBox}>
          <ActivityIndicator />
          <Text style={[s.centerText, { color: theme.mutedText }]}>{copy.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={suggestedFriends}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 24,
            flexGrow: suggestedFriends.length === 0 ? 1 : 0,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={28} color={theme.icon} />
              <Text style={[s.emptyTitle, { color: theme.text }]}>{copy.emptyTitle}</Text>
              <Text style={[s.emptyText, { color: theme.mutedText }]}>
                {copy.emptyText}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(theme: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 14,
    },

    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      marginBottom: 6,
    },

    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "900",
      textAlign: isRTL ? "right" : "left",
    },

    headerSub: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
      textAlign: isRTL ? "right" : "left",
    },

    card: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 10,
    },

    avatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
    },

    onlineDot: {
      position: "absolute",
      bottom: 2,
      right: isRTL ? undefined : 8,
      left: isRTL ? 8 : undefined,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
    },

    infoWrap: {
      flex: 1,
      paddingRight: isRTL ? 0 : 10,
      paddingLeft: isRTL ? 10 : 0,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },

    nameRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      maxWidth: "75%",
      textAlign: isRTL ? "right" : "left",
    },

    username: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
      alignSelf: "stretch",
    },

    bio: {
      marginTop: 5,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
      alignSelf: "stretch",
    },

    onlinePill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },

    onlinePillText: {
      fontSize: 11,
      fontWeight: "900",
    },

    actionsCol: {
      alignItems: isRTL ? "flex-start" : "flex-end",
      gap: 8,
    },

    chatIconBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    pillBtn: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      minWidth: 96,
      justifyContent: "center",
    },

    pillPrimary: {
      backgroundColor: theme.primary,
    },

    pillSuccess: {
      backgroundColor: theme.success,
    },

    pillWarning: {
      backgroundColor: theme.warning,
    },

    pillDanger: {
      backgroundColor: theme.danger,
    },

    pillMuted: {
      backgroundColor: "#6B7280",
    },

    pillNeutral: {
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    pillTextOnPrimary: {
      color: theme.primaryText,
      fontSize: 12,
      fontWeight: "900",
    },

    pillTextOnWarning: {
      color: "#111827",
      fontSize: 12,
      fontWeight: "900",
    },

    pillTextNeutral: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "900",
    },

    disabledBtn: {
      opacity: 0.5,
    },

    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    centerText: {
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
    },

    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 10,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "900",
      textAlign: "center",
    },

    emptyText: {
      fontSize: 13,
      lineHeight: 21,
      fontWeight: "700",
      textAlign: "center",
    },
  });
}