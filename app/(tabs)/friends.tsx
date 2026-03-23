
// import { Colors } from "@/constants/theme";
// import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
// import { useTranslation } from "@/hooks/useTranslation";
// import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
// import { getFriends, removeFriend } from "@/redux/slices/friendSlice";
// import { setMessages } from "@/redux/slices/messageSlice";
// import { StoryOwnerGroup } from "@/redux/slices/storySlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import api from "@/services/api";
// import { formatLastSeenListFriend } from "@/utils/helpFunctions";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useRouter } from "expo-router";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   I18nManager,
//   Image,
//   Platform,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useColorScheme,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { useDispatch, useSelector } from "react-redux";

// export default function FriendsScreen() {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
//   const { language, t } = useTranslation();

//   const isRTL = language === "ar" || I18nManager.isRTL;

//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const me = useSelector((st: RootState) => st.auth?.user);

//   const { friends, loading } = useSelector((state: RootState) => state.friends);
//   const storiesFeed = useSelector((st: RootState) => st.stories?.feed || []);
//   const myStories = useSelector((st: RootState) => st.stories?.myStories || null);
//   const [search, setSearch] = useState("");
//   const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const seenStoryIds = useSelector((st: RootState) => (st as any).stories?.seenStoryIds || {});

//   const s = useMemo(
//     () => makeStyles(theme, colorScheme === "dark", isRTL),
//     [theme, colorScheme, isRTL]
//   );

//   const copy = useMemo(
//     () => ({
//       searchPlaceholder:
//         t("friendsScreenLAN.searchPlaceholder") ||
//         (isRTL ? "ابحث عن الأصدقاء" : "Search friends"),
//       suggested:
//         t("friendsScreenLAN.suggested") ||
//         (isRTL ? "المقترحون" : "Suggested"),
//       add:
//         t("friendsScreenLAN.add") ||
//         (isRTL ? "إضافة" : "Add"),
//       remove:
//         t("friendsScreenLAN.remove") ||
//         (isRTL ? "إزالة" : "Remove"),
//       deleteTitle:
//         t("friendsScreenLAN.deleteTitle") ||
//         (isRTL ? "تأكيد الحذف" : "Confirm removal"),
//       deleteMessage:
//         t("friendsScreenLAN.deleteMessage") ||
//         (isRTL ? "هل أنت متأكد أنك تريد إزالة هذا الصديق؟" : "Are you sure you want to remove this friend?"),
//       cancel:
//         t("common.cancel") ||
//         (isRTL ? "إلغاء" : "Cancel"),
//       confirmRemove:
//         t("friendsScreenLAN.confirmRemove") ||
//         (isRTL ? "إزالة" : "Remove"),
//       myStory:
//         t("stories.myStory") ||
//         (isRTL ? "حالتك" : "Your story"),
//       addStory:
//         t("stories.add") ||
//         (isRTL ? "إضافة" : "Add"),
//       noStories:
//         t("stories.noStories") ||
//         (isRTL ? "لا توجد حالات" : "No stories"),
//       noMatchingFriends:
//         t("friendsScreenLAN.noMatching") ||
//         (isRTL ? "لا يوجد أصدقاء مطابقون" : "No matching friends"),
//       noFriendsYet:
//         t("friendsScreenLAN.noFriendsYet") ||
//         (isRTL ? "لا يوجد أصدقاء بعد" : "No friends yet"),
//       tryAnotherName:
//         t("friendsScreenLAN.tryAnother") ||
//         (isRTL ? "جرّب اسمًا آخر." : "Try another name."),
//       addFriendsHint:
//         t("friendsScreenLAN.addFriendsHint") ||
//         (isRTL ? "أضف أصدقاء لبدء المحادثة فورًا." : "Add friends to start chatting instantly."),
//       addFriend:
//         t("friendsScreenLAN.addFriend") ||
//         (isRTL ? "إضافة صديق" : "Add friend"),
//       noBio:
//         t("friendsScreenLAN.noBio") ||
//         (isRTL ? "لا توجد نبذة" : "No bio"),
//       online:
//         t("status.online") ||
//         (isRTL ? "متصل" : "Online"),
//       lastSeen:
//         t("status.lastSeen") ||
//         (isRTL ? "آخر ظهور" : "Last seen"),
//       now:
//         t("status.now") ||
//         (isRTL ? "الآن" : "Now"),
//       user:
//         t("common.user") ||
//         (isRTL ? "مستخدم" : "User"),
//     }),
//     [t, isRTL]
//   );

//   useEffect(() => {
//     dispatch(getFriends());
//   }, [dispatch]);

//   const filteredFriends = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return friends;
//     return friends.filter((f) => (f.username || "").toLowerCase().includes(q));
//   }, [friends, search]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await dispatch(getFriends()).unwrap();
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const deleteFriendHandler = (id: string) => {
//     Alert.alert(copy.deleteTitle, copy.deleteMessage, [
//       {
//         text: copy.cancel,
//         style: "cancel",
//       },
//       {
//         text: copy.confirmRemove,
//         style: "destructive",
//         onPress: () => dispatch(removeFriend(id)),
//       },
//     ]);
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
//     } finally {
//       setCreatingChatId(null);
//     }
//   };

//   const isSeen = useCallback(
//     (storyId?: string) => {
//       if (!storyId) return false;
//       return Boolean((seenStoryIds as any)[String(storyId)]);
//     },
//     [seenStoryIds]
//   );

//   const getBubbleRings = useCallback(
//     (group: any) => {
//       const stories = Array.isArray(group?.stories) ? group.stories : [];
//       const a = stories[0];
//       const b = stories[1];

//       const count = Math.min(stories.length, 2);

//       const activeColor = theme.tint;
//       const normalColor = theme.border;

//       const aSeen = a?._id ? isSeen(String(a._id)) : true;
//       const bSeen = b?._id ? isSeen(String(b._id)) : true;

//       const ring1Color = aSeen ? normalColor : activeColor;
//       const ring2Color = bSeen ? normalColor : activeColor;

//       return { count, ring1Color, ring2Color };
//     },
//     [isSeen, theme.tint, theme.border]
//   );

//   function StoryRing({
//     theme,
//     count,
//     ring1Color,
//     ring2Color,
//     avatarStyle,
//     children,
//   }: {
//     theme: any;
//     count: number;
//     ring1Color: string;
//     ring2Color: string;
//     avatarStyle: any;
//     children: React.ReactNode;
//   }) {
//     const OUT = 56;
//     const IN = 50;

//     if (count >= 2) {
//       return (
//         <View style={{ width: OUT, height: OUT, alignItems: "center", justifyContent: "center" }}>
//           <View
//             style={{
//               position: "absolute",
//               width: OUT,
//               height: OUT,
//               borderRadius: 20,
//               borderWidth: 2,
//               borderColor: ring1Color,
//               backgroundColor: theme.surface,
//             }}
//           />
//           <View
//             style={{
//               position: "absolute",
//               width: IN,
//               height: IN,
//               borderRadius: 18,
//               borderWidth: 2,
//               borderColor: ring2Color,
//               backgroundColor: "transparent",
//             }}
//           />
//           <View style={avatarStyle}>{children}</View>
//         </View>
//       );
//     }

//     return (
//       <View
//         style={{
//           width: OUT,
//           height: OUT,
//           borderRadius: 20,
//           borderWidth: 2,
//           borderColor: ring1Color,
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundColor: theme.surface,
//         }}
//       >
//         <View style={avatarStyle}>{children}</View>
//       </View>
//     );
//   }

//   const storyBubbles = useMemo(() => {
//     const myId = String(me?._id || "me");

//     const myStoriesArr = Array.isArray(myStories?.stories) ? myStories.stories : [];
//     const myLatest = myStoriesArr.length ? myStoriesArr[0]?.createdAt : undefined;

//     const myGroup: StoryOwnerGroup = {
//       _id: myId,
//       username: me?.username || copy.myStory,
//       atUsername: me?.atUsername || "",
//       avatar: me?.avatar || "",
//       isOnline: true,
//       stories: myStoriesArr,
//       latestStoryAt: myLatest,
//     } as any;

//     const others = (storiesFeed || []).filter((g: any) => String(g?._id) !== myId);

//     const bubbles: any[] = [];

//     if (myStoriesArr.length > 0) bubbles.push(myGroup);

//     bubbles.push({
//       _id: "add_story",
//       isAddBubble: true,
//     });

//     return [...bubbles, ...others];
//   }, [storiesFeed, myStories, me, copy.myStory]);

//   const onPressStoryBubble = (g: StoryOwnerGroup) => {
//     const isMeBubble = String(g._id) === String(me?._id);
//     const hasStories = (g?.stories?.length || 0) > 0;

//     if (isMeBubble && !hasStories) {
//       router.push("/story/create" as any);
//       return;
//     }

//     if (isMeBubble && hasStories) {
//       router.push({
//         pathname: "/story/[id]" as any,
//         params: { id: "me" },
//       } as any);
//       return;
//     }

//     const first = (g as any)?.stories?.[0];
//     if (!first?._id) return;

//     router.push({
//       pathname: "/story/[id]" as any,
//       params: { id: String(first._id) },
//     } as any);
//   };

//   const renderRightActions = (item: any) => (
//     <View style={s.actionsWrap}>
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={s.deleteBtn}
//         onPress={() => deleteFriendHandler(item._id)}
//       >
//         <Ionicons name="trash" size={18} color="#FFF" />
//         <Text style={s.deleteText}>{copy.remove}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={s.container}>
//       <View style={s.topSection}>
//         <View style={s.searchModernWrap}>
//           <View style={s.searchIconWrap}>
//             <Ionicons name="search-outline" size={18} color={theme.icon} />
//           </View>

//           <TextInput
//             placeholder={copy.searchPlaceholder}
//             value={search}
//             onChangeText={setSearch}
//             style={s.searchInput}
//             placeholderTextColor={theme.mutedText}
//             autoCorrect={false}
//             returnKeyType="search"
//           />

//           {!!search.trim() && (
//             <TouchableOpacity
//               onPress={() => setSearch("")}
//               style={s.clearBtn}
//               hitSlop={10}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="close-circle" size={18} color={theme.icon} />
//             </TouchableOpacity>
//           )}
//         </View>

//         <View style={s.headerActionsRow}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={[s.modernActionCard, s.modernActionSecondary]}
//             onPress={() => router.push("/suggested-friends")}
//           >
//             <View style={[s.modernActionIcon, { backgroundColor: theme.surface2 }]}>
//               <Ionicons name="people-outline" size={18} color={theme.text} />
//             </View>
//             <View style={s.modernActionTextWrap}>
//               <Text style={s.modernActionTitle}>{copy.suggested}</Text>
//               <Text style={s.modernActionSub}>
//                 {isRTL ? "اكتشف أصدقاء جدد" : "Discover new friends"}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={[s.modernActionCard, s.modernActionPrimary]}
//             onPress={() => router.push("/add-friend")}
//           >
//             <View style={[s.modernActionIcon, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
//               <Ionicons name="person-add-outline" size={18} color={theme.primaryText} />
//             </View>
//             <View style={s.modernActionTextWrap}>
//               <Text style={[s.modernActionTitle, { color: theme.primaryText }]}>{copy.add}</Text>
//               <Text style={[s.modernActionSub, { color: theme.primaryText, opacity: 0.9 }]}>
//                 {isRTL ? "أضف صديقًا جديدًا" : "Add a new friend"}
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={s.storiesWrap}>
//         <View style={s.sectionHead} />

//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={storyBubbles}
//           keyExtractor={(it: any, idx) => String(it?._id || idx)}
//           contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 6 }}
//           ListEmptyComponent={
//             <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
//               <Text style={{ color: theme.subtleText, fontWeight: "800" }}>
//                 {copy.noStories}
//               </Text>
//             </View>
//           }
//           renderItem={({ item }) => {
//             if (item?.isAddBubble) {
//               return (
//                 <TouchableOpacity
//                   activeOpacity={0.9}
//                   style={s.storyItem}
//                   onPress={() => router.push("/story/create" as any)}
//                 >
//                   <View style={[s.storyRing, s.storyRingMe]}>
//                     <View style={s.storyAvatar}>
//                       <Ionicons name="add" size={20} color={theme.primary} />
//                     </View>
//                   </View>
//                   <Text style={s.storyName}>{copy.addStory}</Text>
//                 </TouchableOpacity>
//               );
//             }

//             const isMeBubble = String(item._id) === String(me?._id);
//             const rings = getBubbleRings(item);
//             const ring1 = isMeBubble ? theme.tint : rings.ring1Color;

//             return (
//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 style={s.storyItem}
//                 onPress={() => onPressStoryBubble(item)}
//               >
//                 <StoryRing
//                   theme={theme}
//                   count={rings.count}
//                   ring1Color={ring1}
//                   ring2Color={rings.ring2Color}
//                   avatarStyle={s.storyAvatar}
//                 >
//                   <Ionicons name="person" size={18} color={theme.icon} />
//                 </StoryRing>

//                 <Text style={s.storyName} numberOfLines={1}>
//                   {isMeBubble ? copy.myStory : item.username || copy.user}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       </View>

//       <FlatList
//         data={filteredFriends}
//         keyExtractor={(item) => String(item._id)}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 16 }}
//         onScrollBeginDrag={onScrollBeginDrag}
//         onScroll={onScroll}
//         ItemSeparatorComponent={() => <View style={s.sep} />}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         ListEmptyComponent={
//           loading ? (
//             <View style={s.centerPad}>
//               <ActivityIndicator size="large" color={theme.primary} />
//             </View>
//           ) : (
//             <View style={s.empty}>
//               <View style={s.emptyIcon}>
//                 <Ionicons name="people-outline" size={26} color={theme.icon} />
//               </View>
//               <Text style={s.emptyTitle}>
//                 {search.trim() ? copy.noMatchingFriends : copy.noFriendsYet}
//               </Text>
//               <Text style={s.emptySub}>
//                 {search.trim() ? copy.tryAnotherName : copy.addFriendsHint}
//               </Text>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={() => router.push("/add-friend")}
//                 style={s.emptyCta}
//               >
//                 <Ionicons name="person-add-outline" size={18} color={theme.primaryText} />
//                 <Text style={s.emptyCtaText}>{copy.addFriend}</Text>
//               </TouchableOpacity>
//             </View>
//           )
//         }
//         renderItem={({ item }) => {
//           const cleanBio = item.bio ? String(item.bio).replace(/<[^>]+>/g, "") : "";

//           return (
//             <Swipeable
//               overshootRight={false}
//               renderRightActions={() => renderRightActions(item)}
//             >
//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={() => openChat(item._id)}
//                 style={s.rowPress}
//               >
//                 <View style={s.row}>
//                   <View style={s.avatarWrap}>
//                     <Image
//                       source={{
//                         uri: item.avatar || `https://i.pravatar.cc/150?u=${item._id}`,
//                       }}
//                       style={s.avatar}
//                     />
//                     <View
//                       style={[
//                         s.statusDot,
//                         item.isOnline ? s.onlineDot : s.offlineDot,
//                       ]}
//                     />
//                   </View>

//                   <View style={s.info}>
//                     <View style={s.nameLine}>
//                       <Text
//                         style={s.name}
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                       >
//                         {item.username}
//                       </Text>
//                     </View>

//                     <Text style={s.bio} numberOfLines={1}>
//                       {cleanBio || copy.noBio}
//                     </Text>
//                   </View>

//                   <View style={s.right}>
//                     {/* <View
//                       style={[
//                         s.pill,
//                         item.isOnline ? s.pillOnline : s.pillOffline,
//                       ]}
//                     >
//                       <Text style={s.pillText}>
//                         {item.isOnline ? copy.online : copy.lastSeen}
//                       </Text>
//                     </View> */}

//                     <Text style={s.time} numberOfLines={1}>
//                       {item.isOnline ? copy.now : formatLastSeenListFriend(item.lastSeen)}
//                     </Text>

//                     {creatingChatId === item._id && (
//                       <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 6 }} />
//                     )}
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             </Swipeable>
//           );
//         }}
//       />
//     </View>
//   );
// }

// function makeStyles(theme: any, isDark: boolean, isRTL: boolean) {
//   return StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background,
//       paddingHorizontal: 12,
//       paddingTop: 10,
//     },

//     topSection: {
//       marginBottom: 10,
//       gap: 10,
//     },

//     searchModernWrap: {
//       minHeight: 54,
//       borderRadius: 22,
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       paddingHorizontal: 10,
//       ...Platform.select({
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: isDark ? 0.18 : 0.06,
//           shadowRadius: 14,
//           shadowOffset: { width: 0, height: 8 },
//         },
//         android: { elevation: 2 },
//       }),
//     },

//     searchIconWrap: {
//       width: 34,
//       height: 34,
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     headerActionsRow: {
//       flexDirection: isRTL ? "row-reverse" : "row",
//       gap: 10,
//     },

//     modernActionCard: {
//       flex: 1,
//       minHeight: 74,
//       borderRadius: 22,
//       paddingHorizontal: 12,
//       paddingVertical: 12,
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       borderWidth: 1,
//       ...Platform.select({
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: isDark ? 0.14 : 0.05,
//           shadowRadius: 12,
//           shadowOffset: { width: 0, height: 8 },
//         },
//         android: { elevation: 1 },
//       }),
//     },

//     modernActionSecondary: {
//       backgroundColor: theme.surface,
//       borderColor: theme.border,
//     },

//     modernActionPrimary: {
//       backgroundColor: theme.primary,
//       borderColor: theme.primary,
//     },

//     modernActionIcon: {
//       width: 42,
//       height: 42,
//       borderRadius: 15,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: isRTL ? 0 : 10,
//       marginLeft: isRTL ? 10 : 0,
//     },

//     modernActionTextWrap: {
//       flex: 1,
//       alignItems: isRTL ? "flex-end" : "flex-start",
//     },

//     modernActionTitle: {
//       fontSize: 13,
//       fontWeight: "900",
//       color: theme.text,
//       textAlign: isRTL ? "right" : "left",
//     },

//     modernActionSub: {
//       marginTop: 3,
//       fontSize: 11,
//       fontWeight: "700",
//       color: theme.mutedText,
//       textAlign: isRTL ? "right" : "left",
//     },

//     storiesWrap: {},
//     sectionHead: {
//       paddingHorizontal: 0,
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 10,
//     },

//     storyItem: {
//       width: 70,
//       alignItems: "center",
//       marginRight: isRTL ? 0 : 10,
//       marginLeft: isRTL ? 10 : 0,
//     },

//     storyRing: {
//       width: 56,
//       height: 56,
//       borderRadius: 20,
//       borderWidth: 2,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface,
//     },

//     storyRingMe: { borderColor: theme.tint },

//     storyAvatar: {
//       width: 44,
//       height: 44,
//       borderRadius: 16,
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     storyName: {
//       marginTop: 6,
//       fontSize: 12,
//       fontWeight: "800",
//       color: theme.mutedText,
//       textAlign: "center",
//     },

//     searchInput: {
//       flex: 1,
//       fontSize: 14,
//       color: theme.text,
//       fontWeight: "700",
//       marginHorizontal: 10,
//       textAlign: isRTL ? "right" : "left",
//       writingDirection: isRTL ? "rtl" : "ltr",
//     },

//     clearBtn: {
//       width: 32,
//       height: 32,
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     rowPress: { borderRadius: 16, overflow: "hidden" },

//     row: {
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       paddingVertical: 10,
//       paddingHorizontal: 10,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       borderRadius: 16,
//     },

//     sep: { height: 8 },

//     avatarWrap: {
//       width: 46,
//       height: 46,
//       borderRadius: 16,
//       marginRight: isRTL ? 0 : 10,
//       marginLeft: isRTL ? 10 : 0,
//       position: "relative",
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.surface2,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     avatar: {
//       width: 44,
//       height: 44,
//       borderRadius: 15,
//       backgroundColor: theme.surface2,
//     },

//     statusDot: {
//       position: "absolute",
//       bottom: -2,
//       right: isRTL ? undefined : -2,
//       left: isRTL ? -2 : undefined,
//       width: 12,
//       height: 12,
//       borderRadius: 6,
//       borderWidth: 2,
//       borderColor: theme.background,
//     },

//     onlineDot: { backgroundColor: theme.success ?? "#22C55E" },
//     offlineDot: { backgroundColor: theme.mutedText ?? "#9CA3AF" },

//     info: {
//       flex: 1,
//       paddingRight: isRTL ? 0 : 10,
//       paddingLeft: isRTL ? 10 : 0,
//       alignItems: isRTL ? "flex-end" : "flex-start",
//     },

//     nameLine: {
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       gap: 8,
//     },

//     name: {
//       fontSize: 14,
//       fontWeight: "900",
//       color: theme.text,
//       maxWidth: 170,
//       textAlign: isRTL ? "right" : "left",
//     },

//     bio: {
//       marginTop: 3,
//       fontSize: 12,
//       fontWeight: "700",
//       color: theme.mutedText,
//       textAlign: isRTL ? "right" : "left",
//     },

//     right: {
//       alignItems: isRTL ? "flex-start" : "flex-end",
//       justifyContent: "center",
//       minWidth: 86,
//     },

//     pill: {
//       paddingHorizontal: 10,
//       paddingVertical: 4,
//       borderRadius: 999,
//       borderWidth: 1,
//       borderColor: theme.border,
//       marginBottom: 4,
//     },

//     pillOnline: { backgroundColor: theme.primarySoft },
//     pillOffline: { backgroundColor: theme.surface2 },

//     pillText: {
//       fontSize: 10,
//       fontWeight: "900",
//       color: theme.text,
//       minWidth:40
//     },

//     time: {
//       fontSize: 11,
//       fontWeight: "800",
//       color: theme.mutedText,
//       textAlign: isRTL ? "left" : "right",
//     },

//     actionsWrap: {
//       justifyContent: "center",
//       alignItems: "flex-end",
//       paddingLeft: 10,
//     },

//     deleteBtn: {
//       width: 96,
//       height: "88%",
//       borderRadius: 16,
//       backgroundColor: theme.danger ?? "#EF4444",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 6,
//       paddingVertical: 10,
//     },

//     deleteText: {
//       color: "#fff",
//       fontSize: 12,
//       fontWeight: "900",
//     },

//     centerPad: { paddingTop: 60 },

//     empty: {
//       marginTop: 70,
//       alignItems: "center",
//       paddingHorizontal: 16,
//     },

//     emptyIcon: {
//       width: 54,
//       height: 54,
//       borderRadius: 18,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//       marginBottom: 10,
//     },

//     emptyTitle: {
//       fontSize: 16,
//       fontWeight: "900",
//       color: theme.text,
//       marginBottom: 6,
//       textAlign: "center",
//     },

//     emptySub: {
//       fontSize: 12,
//       fontWeight: "700",
//       color: theme.mutedText,
//       textAlign: "center",
//       marginBottom: 14,
//     },

//     emptyCta: {
//       flexDirection: isRTL ? "row-reverse" : "row",
//       alignItems: "center",
//       gap: 8,
//       paddingHorizontal: 14,
//       paddingVertical: 10,
//       borderRadius: 16,
//       backgroundColor: theme.primary,
//       borderWidth: 1,
//       borderColor: theme.primary,
//     },

//     emptyCtaText: {
//       color: theme.primaryText,
//       fontWeight: "900",
//     },
//   });
// }
import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { getFriends, removeFriend } from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { fetchMyStories, fetchStoriesFeed, StoryOwnerGroup } from "@/redux/slices/storySlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";
import { formatLastSeenListFriend } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  I18nManager,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
  const { language, t } = useTranslation();

  const isRTL = language === "ar" || I18nManager.isRTL;

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector((st: RootState) => st.auth?.user);

  const { friends, loading } = useSelector((state: RootState) => state.friends);
  const storiesFeed = useSelector((st: RootState) => st.stories?.feed || []);
  const myStories = useSelector((st: RootState) => st.stories?.myStories || null);
  const seenStoryIds = useSelector((st: RootState) => (st as any).stories?.seenStoryIds || {});

  const [search, setSearch] = useState("");
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const s = useMemo(
    () => makeStyles(theme, colorScheme === "dark", isRTL),
    [theme, colorScheme, isRTL]
  );

  const copy = useMemo(
    () => ({
      searchPlaceholder:
        t("friendsScreenLAN.searchPlaceholder") ||
        (isRTL ? "ابحث عن الأصدقاء" : "Search friends"),
      suggested:
        t("friendsScreenLAN.suggested") ||
        (isRTL ? "المقترحون" : "Suggested"),
      add:
        t("friendsScreenLAN.add") ||
        (isRTL ? "إضافة" : "Add"),
      remove:
        t("friendsScreenLAN.remove") ||
        (isRTL ? "إزالة" : "Remove"),
      deleteTitle:
        t("friendsScreenLAN.deleteTitle") ||
        (isRTL ? "تأكيد الحذف" : "Confirm removal"),
      deleteMessage:
        t("friendsScreenLAN.deleteMessage") ||
        (isRTL
          ? "هل أنت متأكد أنك تريد إزالة هذا الصديق؟"
          : "Are you sure you want to remove this friend?"),
      cancel:
        t("common.cancel") ||
        (isRTL ? "إلغاء" : "Cancel"),
      confirmRemove:
        t("friendsScreenLAN.confirmRemove") ||
        (isRTL ? "إزالة" : "Remove"),
      myStory:
        t("stories.myStory") ||
        (isRTL ? "حالتك" : "Your story"),
      addStory:
        t("stories.add") ||
        (isRTL ? "إضافة" : "Add"),
      noStories:
        t("stories.noStories") ||
        (isRTL ? "لا توجد حالات" : "No stories"),
      noMatchingFriends:
        t("friendsScreenLAN.noMatching") ||
        (isRTL ? "لا يوجد أصدقاء مطابقون" : "No matching friends"),
      noFriendsYet:
        t("friendsScreenLAN.noFriendsYet") ||
        (isRTL ? "لا يوجد أصدقاء بعد" : "No friends yet"),
      tryAnotherName:
        t("friendsScreenLAN.tryAnother") ||
        (isRTL ? "جرّب اسمًا آخر." : "Try another name."),
      addFriendsHint:
        t("friendsScreenLAN.addFriendsHint") ||
        (isRTL
          ? "أضف أصدقاء لبدء المحادثة فورًا."
          : "Add friends to start chatting instantly."),
      addFriend:
        t("friendsScreenLAN.addFriend") ||
        (isRTL ? "إضافة صديق" : "Add friend"),
      noBio:
        t("friendsScreenLAN.noBio") ||
        (isRTL ? "لا توجد نبذة" : "No bio"),
      online:
        t("status.online") ||
        (isRTL ? "متصل" : "Online"),
      lastSeen:
        t("status.lastSeen") ||
        (isRTL ? "آخر ظهور" : "Last seen"),
      now:
        t("status.now") ||
        (isRTL ? "الآن" : "Now"),
      user:
        t("common.user") ||
        (isRTL ? "مستخدم" : "User"),
      textStory:
        t("stories.textStory") ||
        (isRTL ? "حالة نصية" : "Text story"),
      videoStory:
        t("stories.videoStory") ||
        (isRTL ? "فيديو" : "Video"),
      imageStory:
        t("stories.imageStory") ||
        (isRTL ? "صورة" : "Image"),
    }),
    [t, isRTL]
  );

useEffect(() => {
  const loadAll = async () => {
    try {
      await Promise.all([
        dispatch(getFriends()).unwrap(),
        dispatch(fetchMyStories()).unwrap(),
        dispatch(fetchStoriesFeed({ page: 1, limit: 30 })).unwrap(),
      ]);
    } catch (e) {
      console.log("Failed to load friends/stories:", e);
    }
  };

  loadAll();
}, [dispatch]);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => (f.username || "").toLowerCase().includes(q));
  }, [friends, search]);

const onRefresh = async () => {
  setRefreshing(true);
  try {
    await Promise.all([
      dispatch(getFriends()).unwrap(),
      dispatch(fetchMyStories()).unwrap(),
      dispatch(fetchStoriesFeed({ page: 1, limit: 30 })).unwrap(),
    ]);
  } catch (e) {
    console.log("Refresh failed:", e);
  } finally {
    setRefreshing(false);
  }
};
  const deleteFriendHandler = (id: string) => {
    Alert.alert(copy.deleteTitle, copy.deleteMessage, [
      {
        text: copy.cancel,
        style: "cancel",
      },
      {
        text: copy.confirmRemove,
        style: "destructive",
        onPress: () => dispatch(removeFriend(id)),
      },
    ]);
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
    } finally {
      setCreatingChatId(null);
    }
  };

  const isSeen = useCallback(
    (storyId?: string) => {
      if (!storyId) return false;
      return Boolean((seenStoryIds as any)[String(storyId)]);
    },
    [seenStoryIds]
  );

  const getBubbleRings = useCallback(
    (group: any) => {
      const stories = Array.isArray(group?.stories) ? group.stories : [];
      const a = stories[0];
      const b = stories[1];

      const count = Math.min(stories.length, 2);

      const activeColor = theme.tint;
      const normalColor = theme.border;

      const aSeen = a?._id ? isSeen(String(a._id)) : true;
      const bSeen = b?._id ? isSeen(String(b._id)) : true;

      const ring1Color = aSeen ? normalColor : activeColor;
      const ring2Color = bSeen ? normalColor : activeColor;

      return { count, ring1Color, ring2Color };
    },
    [isSeen, theme.tint, theme.border]
  );

  const getStoryVisual = useCallback(
    (group: any) => {
      const latestPreview = group?.latestPreview || null;
      const firstStory = Array.isArray(group?.stories) ? group.stories[0] : null;

      const previewType =
        latestPreview?.type ||
        firstStory?.previewType ||
        firstStory?.type ||
        "text";

      const previewImage =
        latestPreview?.image ||
        firstStory?.previewImage ||
        firstStory?.thumbUrl ||
        firstStory?.mediaUrl ||
        "";

      const previewText =
        latestPreview?.text ||
        firstStory?.previewText ||
        firstStory?.text ||
        "";

      return {
        type: previewType,
        image: previewImage,
        text: typeof previewText === "string" ? previewText.trim() : "",
      };
    },
    []
  );

  function StoryRing({
    theme,
    count,
    ring1Color,
    ring2Color,
    avatarStyle,
    children,
  }: {
    theme: any;
    count: number;
    ring1Color: string;
    ring2Color: string;
    avatarStyle: any;
    children: React.ReactNode;
  }) {
    const OUT = 56;
    const IN = 50;

    if (count >= 2) {
      return (
        <View
          style={{
            width: OUT,
            height: OUT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: OUT,
              height: OUT,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: ring1Color,
              backgroundColor: theme.surface,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: IN,
              height: IN,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: ring2Color,
              backgroundColor: "transparent",
            }}
          />
          <View style={avatarStyle}>{children}</View>
        </View>
      );
    }

    return (
      <View
        style={{
          width: OUT,
          height: OUT,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: ring1Color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface,
        }}
      >
        <View style={avatarStyle}>{children}</View>
      </View>
    );
  }

  function StoryPreviewContent({
    item,
    isMeBubble,
  }: {
    item: any;
    isMeBubble: boolean;
  }) {
    const visual = getStoryVisual(item);
    const fallbackAvatar =
      item?.avatar || (isMeBubble ? me?.avatar || "" : "");

    if (visual.image) {
      return (
        <View style={s.storyPreviewWrap}>
          <Image
            source={{ uri: visual.image }}
            style={s.storyPreviewImage}
            resizeMode="cover"
          />
          {visual.type === "video" && (
            <View style={s.storyPreviewBadge}>
              <Ionicons name="play" size={10} color="#FFF" />
            </View>
          )}
        </View>
      );
    }

    if (visual.type === "text" && visual.text) {
      return (
        <View style={[s.storyPreviewWrap, s.storyTextPreview]}>
          <Text style={s.storyTextPreviewText} numberOfLines={3}>
            {visual.text}
          </Text>
        </View>
      );
    }

    if (fallbackAvatar) {
      return (
        <Image
          source={{ uri: fallbackAvatar }}
          style={s.storyPreviewImage}
          resizeMode="cover"
        />
      );
    }

    return <Ionicons name="person" size={18} color={theme.icon} />;
  }

  const storyBubbles = useMemo(() => {
    const myId = String(me?._id || "me");

    const myStoriesArr = Array.isArray(myStories?.stories) ? myStories.stories : [];
    const myLatest = myStoriesArr.length ? myStoriesArr[0]?.createdAt : undefined;

    const myGroup: StoryOwnerGroup = {
      _id: myId,
      username: me?.username || copy.myStory,
      atUsername: me?.atUsername || "",
      avatar: me?.avatar || "",
      isOnline: true,
      stories: myStoriesArr,
      latestStoryAt: myLatest,
      latestPreview: myStories?.latestPreview || null,
    };

    const others = (storiesFeed || []).filter((g: any) => String(g?._id) !== myId);

    const bubbles: any[] = [];

    if (myStoriesArr.length > 0) bubbles.push(myGroup);

    bubbles.push({
      _id: "add_story",
      isAddBubble: true,
    });

    return [...bubbles, ...others];
  }, [storiesFeed, myStories, me, copy.myStory]);

  const onPressStoryBubble = (g: StoryOwnerGroup) => {
    const isMeBubble = String(g._id) === String(me?._id);
    const hasStories = (g?.stories?.length || 0) > 0;

    if (isMeBubble && !hasStories) {
      router.push("/story/create" as any);
      return;
    }

    if (isMeBubble && hasStories) {
      router.push({
        pathname: "/story/[id]" as any,
        params: { id: "me" },
      } as any);
      return;
    }

    const first = (g as any)?.stories?.[0];
    if (!first?._id) return;

    router.push({
      pathname: "/story/[id]" as any,
      params: { id: String(first._id) },
    } as any);
  };

  const renderRightActions = (item: any) => (
    <View style={s.actionsWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={s.deleteBtn}
        onPress={() => deleteFriendHandler(item._id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={s.deleteText}>{copy.remove}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <View style={s.searchModernWrap}>
          <View style={s.searchIconWrap}>
            <Ionicons name="search-outline" size={18} color={theme.icon} />
          </View>

          <TextInput
            placeholder={copy.searchPlaceholder}
            value={search}
            onChangeText={setSearch}
            style={s.searchInput}
            placeholderTextColor={theme.mutedText}
            autoCorrect={false}
            returnKeyType="search"
          />

          {!!search.trim() && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={s.clearBtn}
              hitSlop={10}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={18} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.headerActionsRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[s.modernActionCard, s.modernActionSecondary]}
            onPress={() => router.push("/suggested-friends")}
          >
            <View style={[s.modernActionIcon, { backgroundColor: theme.surface2 }]}>
              <Ionicons name="people-outline" size={18} color={theme.text} />
            </View>
            <View style={s.modernActionTextWrap}>
              <Text style={s.modernActionTitle}>{copy.suggested}</Text>
              <Text style={s.modernActionSub}>
                {isRTL ? "اكتشف أصدقاء جدد" : "Discover new friends"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[s.modernActionCard, s.modernActionPrimary]}
            onPress={() => router.push("/add-friend")}
          >
            <View
              style={[s.modernActionIcon, { backgroundColor: "rgba(255,255,255,0.16)" }]}
            >
              <Ionicons
                name="person-add-outline"
                size={18}
                color={theme.primaryText}
              />
            </View>
            <View style={s.modernActionTextWrap}>
              <Text style={[s.modernActionTitle, { color: theme.primaryText }]}>
                {copy.add}
              </Text>
              <Text
                style={[
                  s.modernActionSub,
                  { color: theme.primaryText, opacity: 0.9 },
                ]}
              >
                {isRTL ? "أضف صديقًا جديدًا" : "Add a new friend"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.storiesWrap}>
        <View style={s.sectionHead} />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={storyBubbles}
          keyExtractor={(it: any, idx) => String(it?._id || idx)}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 6 }}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ color: theme.subtleText, fontWeight: "800" }}>
                {copy.noStories}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item?.isAddBubble) {
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={s.storyItem}
                  onPress={() => router.push("/story/create" as any)}
                >
                  <View style={[s.storyRing, s.storyRingMe]}>
                    <View style={s.storyAvatar}>
                      <Ionicons name="add" size={20} color={theme.primary} />
                    </View>
                  </View>
                  <Text style={s.storyName}>{copy.addStory}</Text>
                </TouchableOpacity>
              );
            }

            const isMeBubble = String(item._id) === String(me?._id);
            const rings = getBubbleRings(item);
            const ring1 = isMeBubble ? theme.tint : rings.ring1Color;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={s.storyItem}
                onPress={() => onPressStoryBubble(item)}
              >
                <StoryRing
                  theme={theme}
                  count={rings.count}
                  ring1Color={ring1}
                  ring2Color={rings.ring2Color}
                  avatarStyle={s.storyAvatar}
                >
                  <StoryPreviewContent item={item} isMeBubble={isMeBubble} />
                </StoryRing>

                <Text style={s.storyName} numberOfLines={1}>
                  {isMeBubble ? copy.myStory : item.username || copy.user}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <View style={s.centerPad}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Ionicons name="people-outline" size={26} color={theme.icon} />
              </View>
              <Text style={s.emptyTitle}>
                {search.trim() ? copy.noMatchingFriends : copy.noFriendsYet}
              </Text>
              <Text style={s.emptySub}>
                {search.trim() ? copy.tryAnotherName : copy.addFriendsHint}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/add-friend")}
                style={s.emptyCta}
              >
                <Ionicons name="person-add-outline" size={18} color={theme.primaryText} />
                <Text style={s.emptyCtaText}>{copy.addFriend}</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const cleanBio = item.bio ? String(item.bio).replace(/<[^>]+>/g, "") : "";

          return (
            <Swipeable
              overshootRight={false}
              renderRightActions={() => renderRightActions(item)}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openChat(item._id)}
                style={s.rowPress}
              >
                <View style={s.row}>
                  <View style={s.avatarWrap}>
                    <Image
                      source={{
                        uri: item.avatar || `https://i.pravatar.cc/150?u=${item._id}`,
                      }}
                      style={s.avatar}
                    />
                    <View
                      style={[
                        s.statusDot,
                        item.isOnline ? s.onlineDot : s.offlineDot,
                      ]}
                    />
                  </View>

                  <View style={s.info}>
                    <View style={s.nameLine}>
                      <Text style={s.name} numberOfLines={1} ellipsizeMode="tail">
                        {item.username}
                      </Text>
                    </View>

                    <Text style={s.bio} numberOfLines={1}>
                      {cleanBio || copy.noBio}
                    </Text>
                  </View>

                  <View style={s.right}>
                    <Text style={s.time} numberOfLines={1}>
                      {item.isOnline ? copy.now : formatLastSeenListFriend(item.lastSeen)}
                    </Text>

                    {creatingChatId === item._id && (
                      <ActivityIndicator
                        size="small"
                        color={theme.primary}
                        style={{ marginTop: 6 }}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 12,
      paddingTop: 10,
    },

    topSection: {
      marginBottom: 10,
      gap: 10,
    },

    searchModernWrap: {
      minHeight: 54,
      borderRadius: 22,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.18 : 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 2 },
      }),
    },

    searchIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    headerActionsRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
    },

    modernActionCard: {
      flex: 1,
      minHeight: 74,
      borderRadius: 22,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      borderWidth: 1,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.14 : 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 1 },
      }),
    },

    modernActionSecondary: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },

    modernActionPrimary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    modernActionIcon: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
    },

    modernActionTextWrap: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },

    modernActionTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
      textAlign: isRTL ? "right" : "left",
    },

    modernActionSub: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: isRTL ? "right" : "left",
    },

    storiesWrap: {},
    sectionHead: {
      paddingHorizontal: 0,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    storyItem: {
      width: 74,
      alignItems: "center",
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
    },

    storyRing: {
      width: 56,
      height: 56,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
    },

    storyRingMe: { borderColor: theme.tint },

    storyAvatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    storyPreviewWrap: {
      width: "100%",
      height: "100%",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
    },

    storyPreviewImage: {
      width: "100%",
      height: "100%",
    },

    storyPreviewBadge: {
      position: "absolute",
      bottom: 3,
      right: 3,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
    },

    storyTextPreview: {
      paddingHorizontal: 4,
      paddingVertical: 4,
      backgroundColor: theme.surface2,
    },

    storyTextPreviewText: {
      fontSize: 8.5,
      fontWeight: "900",
      lineHeight: 11,
      color: theme.text,
      textAlign: "center",
    },

    storyName: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: "center",
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      fontWeight: "700",
      marginHorizontal: 10,
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
    },

    clearBtn: {
      width: 32,
      height: 32,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    rowPress: { borderRadius: 16, overflow: "hidden" },

    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
    },

    sep: { height: 8 },

    avatarWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
      position: "relative",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: theme.surface2,
    },

    statusDot: {
      position: "absolute",
      bottom: -2,
      right: isRTL ? undefined : -2,
      left: isRTL ? -2 : undefined,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.background,
    },

    onlineDot: { backgroundColor: theme.success ?? "#22C55E" },
    offlineDot: { backgroundColor: theme.mutedText ?? "#9CA3AF" },

    info: {
      flex: 1,
      paddingRight: isRTL ? 0 : 10,
      paddingLeft: isRTL ? 10 : 0,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },

    nameLine: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      maxWidth: 170,
      textAlign: isRTL ? "right" : "left",
    },

    bio: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: isRTL ? "right" : "left",
    },

    right: {
      alignItems: isRTL ? "flex-start" : "flex-end",
      justifyContent: "center",
      minWidth: 86,
    },

    time: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: isRTL ? "left" : "right",
    },

    actionsWrap: {
      justifyContent: "center",
      alignItems: "flex-end",
      paddingLeft: 10,
    },

    deleteBtn: {
      width: 96,
      height: "88%",
      borderRadius: 16,
      backgroundColor: theme.danger ?? "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
    },

    deleteText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "900",
    },

    centerPad: { paddingTop: 60 },

    empty: {
      marginTop: 70,
      alignItems: "center",
      paddingHorizontal: 16,
    },

    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 6,
      textAlign: "center",
    },

    emptySub: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "center",
      marginBottom: 14,
    },

    emptyCta: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
    },

    emptyCtaText: {
      color: theme.primaryText,
      fontWeight: "900",
    },
  });
}