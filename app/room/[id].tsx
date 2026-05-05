

// import { getMyInventory, selectMyStore } from "@/redux/slices/storeControl.slice";
// import { getTextDirectionStyle } from "@/utils/textDirection";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Audio, ResizeMode, Video } from "expo-av";
// import * as Clipboard from "expo-clipboard";
// import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from "expo-file-system";
// import { Image } from "expo-image";
// import * as ImagePicker from "expo-image-picker";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,

//   Easing,

//   FlatList,
//   ImageSourcePropType,
//   Keyboard,
//   KeyboardAvoidingView,
//   Linking,
//   Modal,
//   PanResponder,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from "react-native";
// import { useKeyboardHandler } from "react-native-keyboard-controller";
// import Reanimated, {
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// import { Colors } from "@/constants/theme";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import {
//   clearBannedFlag,
//   clearKickedFlag,
//   fetchRoomMessages,
//   fetchRoomsByType,
//   fetchRoomStats,
//   fetchRoomUsers,
//   inviteToRoom,
//   leaveRoomAndExit,
//   optimisticAddRoomMessage,
//   pinRoomMessage,
//   selectBannedFlag,
//   selectKickedFlag,
//   selectRoomActiveCount,
//   selectRoomAvatarById,
//   selectRoomLoadingMessages,
//   selectRoomMessages,
//   selectRoomNameById,
//   selectRoomUsers,
//   sendBombColorAnswer,
//   sendRoomMessage,
//   socketRoleSetFailed,
//   socketRoleSetRequested,
//   socketRoleSetSucceeded
// } from "@/redux/slices/room.slice";

// import { boostRoom } from "@/redux/slices/roomControl.slice";

// import { stripHtmlToText } from "@/components/stripHtmlToText";
// import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
// import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";

// import {
//   banRoomUserSocket,
//   deleteRoomSocketMessage,
//   joinRoomSocket,
//   kickRoomUserSocket,
//   setRoomUserRoleSocket,
//   toggleRoomReaction as toggleRoomReactionSocket
// } from "@/services/socket";

// import BoostLottieOverlay from "@/components/BoostLottieOverlay";
// import LottieBadge from "@/components/LottieBadge";
// import ActiveRoomsDrawer from "@/components/room/ActiveRoomsDrawer";
// import CricketGameMessage from "@/components/room/CricketGameMessage";
// import { STICKER_PACKS, StickerItem } from "@/data/roomStickers";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
// import { searchUsers } from "@/redux/slices/friendSlice";
// import { setMessages } from "@/redux/slices/messageSlice";
// import { debitMyCoinz } from "@/redux/slices/userSlice";
// import { RootState } from "@/redux/store";
// import api from "@/services/api";
// import { uploadToCloudinary } from "@/services/upload.service";
// import { addManySeenGiftIds, addSeenGiftId, getSeenGiftIds } from "@/storage/roomGiftSeen";
// import { Feather, Octicons } from "@expo/vector-icons";
// import LottieView from "lottie-react-native";
// import { ScrollView } from "react-native-gesture-handler";
// import WebView from "react-native-webview";
// import { useSelector } from "react-redux";

// /* ================= TYPES ================= */
// type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";
// type RoomRole = "creator" | "owner" | "admin" | "member";
// type SnapshotRole = string;
// type UserBadgeUI = {
//   key: string;
//   name?: string;
//   lottieUrl?: string;
//   iconUrl?: string;
//   emoji?: string;
// };

// type UserUI = {
//   id: string;
//   name: string;
//   avatar?: string;
//   avatarGif?: string;
//   usernameColor?: string;
//   messageTextColor?: string;
//   role?: RoomRole;
//   activeBadges?: UserBadgeUI[];
//   customEmojiBadge?: {
//     emoji: string;
//     isActive: boolean;
//     expiresAt?: string | null;
//   } | null;
//   snapshotRole?: SnapshotRole;
//   isOnline?: boolean;
// };

// type MessageUI = {
//   id: string;
//   type: "text" | "image" | "file" | "audio" | "video" | "system" | "gift" | "song" | "game";
//   systemType?: "join" | "leave" | "announcement" | "promotion" | "ban" | "role" | "music";
//   music?: {
//     title?: string;
//     channel?: string;
//     audioUrl?: string;
//     thumbnail?: string;
//     youtubeUrl?: string;

//     playedById?: string;
//     playedByName?: string;
//     playedByAtUsername?: string;

//     songCode?: string;
//     loveCommand?: string;
//   };
//   game?: {
//     gameType?: string;
//     gameId?: string;
//     title?: string;
//     state?: string;
//     turnUserId?: string;
//     winnerUserId?: string;
//     payload?: any;
//   };
//   text?: string;
//   uri?: string;
//   mediaMimeType?: string;
//   mediaFileName?: string;
//   clientId?: string;       // ✅ للـ optimistic
//   serverId?: string;       // ✅ اختياري لو تحب تمييز _id صراحةً

//   sender?: UserUI;
//   time: string;
//   replyTo?: MessageUI;
//   reaction?: Reaction;

//   reactions?: {
//     emoji: Reaction;
//     userId: string;
//     username: string;
//     avatar?: string;
//     avatarGif?: string;
//   }[];

//   reactionCount?: number;
//   gift?: {
//     key: string;
//     icon?: string;
//     targetId?: string;
//     targetName?: string;
//     count?: number;
//   };
//   deletedForEveryone?: boolean;
// };

// const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];
// const normalizeMessageReactions = (m: any) => {
//   console.log("🟡 normalizeMessageReactions MESSAGE:", {
//     messageId: m?._id,
//     room: m?.room,
//     rawReactions: m?.reactions,
//     reactionUsers: m?.reactionUsers,
//     metaReactions: m?.meta?.reactions,
//     reactionCount: m?.reactionCount,
//     reactionsCount: m?.reactionsCount,
//   });

//   const raw =
//     Array.isArray(m?.reactions)
//       ? m.reactions
//       : Array.isArray(m?.reactionUsers)
//         ? m.reactionUsers
//         : Array.isArray(m?.meta?.reactions)
//           ? m.meta.reactions
//           : [];

//   const reactions = raw
//     .map((r: any, index: number) => {
//       console.log("🔵 RAW REACTION ITEM:", {
//         index,
//         reaction: r,
//         userType: typeof r?.user,
//         user: r?.user,
//         userUsername: r?.user?.username,
//         rootUsername: r?.username,
//         rootName: r?.name,
//       });

//       const emoji = String(r?.emoji || r?.reaction || "").trim() as Reaction;

//       const userObj =
//         r?.user && typeof r.user === "object"
//           ? r.user
//           : r?.sender && typeof r.sender === "object"
//             ? r.sender
//             : r?.createdBy && typeof r.createdBy === "object"
//               ? r.createdBy
//               : r?.userSnapshot && typeof r.userSnapshot === "object"
//                 ? r.userSnapshot
//                 : null;

//       const userId = String(
//         r?.userId ||
//         r?.senderId ||
//         (typeof r?.user === "string" ? r.user : "") ||
//         userObj?._id ||
//         userObj?.id ||
//         ""
//       ).trim();

//       const username = String(
//         r?.username ||
//         r?.name ||
//         r?.displayName ||
//         userObj?.username ||
//         userObj?.name ||
//         userObj?.displayName ||
//         userObj?.atUsername ||
//         "مستخدم"
//       ).trim();

//       const avatar = String(
//         r?.avatar ||
//         userObj?.avatar ||
//         ""
//       ).trim();

//       const avatarGif = String(
//         r?.avatarGif ||
//         userObj?.avatarGif ||
//         userObj?.activeCustomization?.avatarGif ||
//         ""
//       ).trim();

//       console.log("🟢 NORMALIZED REACTION ITEM:", {
//         index,
//         emoji,
//         userId,
//         username,
//         avatar,
//         avatarGif,
//         hasUserObj: Boolean(userObj),
//         userObj,
//       });

//       if (!emoji || !REACTIONS.includes(emoji)) return null;

//       return {
//         emoji,
//         userId,
//         username,
//         avatar,
//         avatarGif,
//       };
//     })
//     .filter(Boolean) as {
//       emoji: Reaction;
//       userId: string;
//       username: string;
//       avatar?: string;
//       avatarGif?: string;
//     }[];

//   const fallbackEmoji = String(
//     m?.reaction ||
//     m?.myReaction ||
//     m?.meta?.reaction ||
//     ""
//   ).trim() as Reaction;

//   if (!reactions.length && fallbackEmoji && REACTIONS.includes(fallbackEmoji)) {
//     console.log("🟠 REACTION FALLBACK USED:", {
//       messageId: m?._id,
//       fallbackEmoji,
//       reactionCount: Number(m?.reactionCount || m?.reactionsCount || 1),
//     });

//     return {
//       reactions: [],
//       firstReactionEmoji: fallbackEmoji,
//       reactionCount: Number(m?.reactionCount || m?.reactionsCount || 1),
//     };
//   }

//   const firstReactionEmoji = reactions[0]?.emoji;
//   const reactionCount =
//     reactions.length ||
//     Number(m?.reactionCount || m?.reactionsCount || 0);

//   console.log("✅ NORMALIZED REACTIONS FINAL:", {
//     messageId: m?._id,
//     firstReactionEmoji,
//     reactionCount,
//     reactions,
//   });

//   return {
//     reactions,
//     firstReactionEmoji,
//     reactionCount,
//   };
// };
// /* ================= BADGES ================= */
// type BadgeKey = string;

// const BADGE_META: Record<BadgeKey, { label: string; icon?: string; bg: string; fg: string }> = {
//   gold: { label: "GOLD", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
//   blue: { label: "", icon: "twitter-verified", bg: "transparent", fg: "#1DA1F2" },
//   business: { label: "BUSINESS", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },
//   vip: { label: "VIP", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
//   pro: { label: "PRO", icon: "⚡", bg: "#DCFCE7", fg: "#166534" }
// };
// const getGiftPrice = (giftKey: string) => {
//   const tempGift = TEMP_GIFTS.find((g) => g.key === giftKey);
//   if (typeof tempGift?.price === "number") return tempGift.price;

//   const meta = GIFT_META[giftKey] as any;
//   if (typeof meta?.price === "number") return meta.price;

//   return 0;
// };
// const BADGE_ORDER: BadgeKey[] = ["gold", "blue", "business", "vip", "pro"];

// const normalizeBadges = (badges?: string[]) => {
//   const arr = Array.isArray(badges) ? badges : [];
//   const cleaned = arr.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
//   const out: string[] = [];
//   const seen = new Set<string>();
//   for (const b of cleaned) {
//     if (!seen.has(b)) {
//       seen.add(b);
//       out.push(b);
//     }
//   }
//   return out;
// };
// const getItemImageUrl = (item: any): string => {
//   const direct =
//     String(item?.iconUrl || "") ||
//     String(item?.coverUrl || "") ||
//     String(item?.previewUrl || "");

//   if (direct) return direct;

//   const meta = item?.meta || {};
//   return (
//     String(meta?.iconUrl || "") ||
//     String(meta?.coverUrl || "") ||
//     String(meta?.previewUrl || "")
//   );
// };

// const normalizeBadgeKey = (v: any) => String(v || "").trim().toLowerCase();

// const dedupeBadges = (badges?: UserBadgeUI[]) => {
//   const arr = Array.isArray(badges) ? badges : [];
//   const out: UserBadgeUI[] = [];
//   const seen = new Set<string>();

//   for (const b of arr) {
//     const key = normalizeBadgeKey(b?.key);
//     if (!key || seen.has(key)) continue;
//     seen.add(key);
//     out.push({
//       key,
//       name: b?.name,
//       lottieUrl: b?.lottieUrl,
//       iconUrl: b?.iconUrl,
//       emoji: b?.emoji,
//     });
//   }

//   return out;
// };

// const pickPrimaryBadge = (badges?: UserBadgeUI[]) => {
//   const list = dedupeBadges(badges);
//   if (!list.length) return null;
//   return list[0];
// };

// const DynamicUserBadge = ({
//   badge,
//   size = 25,
// }: {
//   badge?: UserBadgeUI | null;
//   size?: number;
// }) => {
//   if (!badge?.key) return null;

//   if (badge.lottieUrl) {
//     return (
//       <View style={{ marginLeft: 6, width: size, height: size, alignItems: "center", justifyContent: "center" }}>
//         <LottieBadge url={badge.lottieUrl} size={size} />
//       </View>
//     );
//   }

//   if (badge.iconUrl) {
//     return (
//       <Image
//         source={{ uri: badge.iconUrl }}
//         style={{ width: size, height: size, borderRadius: size / 2, marginLeft: 6 }}
//         resizeMode="contain"
//       />
//     );
//   }

//   if (badge.emoji) {
//     return (
//       <View style={{ marginLeft: 6, alignItems: "center", justifyContent: "center" }}>
//         <Text style={{ fontSize: size - 2 }}>{badge.emoji}</Text>
//       </View>
//     );
//   }

//   return null;
// };
// const verificationToBadge = (verificationType?: string) => {
//   const v = String(verificationType || "").trim().toLowerCase();
//   if (!v || v === "none") return null;
//   return v;
// };
// const buildActiveBadgesFromUser = (
//   u: any,
//   fallbackInventory?: any[]
// ): UserBadgeUI[] => {
//   if (Array.isArray(u?.activeBadges) && u.activeBadges.length) {
//     return dedupeBadges(u.activeBadges);
//   }

//   const activeKeys = Array.isArray(u?.activeCustomization?.badges)
//     ? u.activeCustomization.badges.map((x: any) => String(x || "").trim()).filter(Boolean)
//     : [];

//   const inventory = Array.isArray(u?.inventory)
//     ? u.inventory
//     : Array.isArray(fallbackInventory)
//       ? fallbackInventory
//       : [];

//   const out: UserBadgeUI[] = [];

//   for (const key of activeKeys) {
//     const invRow = inventory.find(
//       (row: any) =>
//         String(row?.itemType || "").trim() === "badge" &&
//         String(row?.itemKey || "").trim() === key
//     );

//     const item = invRow?.item || invRow?.storeItem || null;
//     const meta = item?.meta || invRow?.meta || {};

//     out.push({
//       key,
//       name: item?.name || key,
//       lottieUrl: String(meta?.lottieUrl || item?.lottieUrl || ""),
//       iconUrl: getItemImageUrl(item) || String(meta?.iconUrl || ""),
//       emoji: String(meta?.emoji || ""),
//     });
//   }

//   return dedupeBadges(out);
// };

// const isCustomEmojiBadgeActive = (
//   badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null
// ) => {
//   if (!badge?.emoji) return false;
//   if (!badge?.isActive) return false;
//   if (badge?.expiresAt) {
//     const t = new Date(badge.expiresAt).getTime();
//     if (Number.isFinite(t) && t <= Date.now()) return false;
//   }
//   return true;
// };
// const NameBadge = ({ badgeKey }: { badgeKey?: string | null }) => {
//   if (!badgeKey) return null;
//   const meta = BADGE_META[badgeKey];
//   if (!meta) return null;

//   if (badgeKey === "blue") {
//     return <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" style={{ marginLeft: 6 }} />;
//   }

//   return (
//     <View style={[nameBadgeStyles.badge, { backgroundColor: meta.bg }]}>
//       {!!meta.icon && (
//         <Text style={[nameBadgeStyles.icon, { color: meta.fg }]}>{meta.icon}</Text>
//       )}
//     </View>
//   );
// };
// const CustomEmojiBadgeView = ({
//   badge
// }: {
//   badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null;
// }) => {
//   if (!isCustomEmojiBadgeActive(badge)) return null;

//   return (
//     <View
//       style={{
//         marginLeft: 6,
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Text style={{ fontSize: 15 }}>{badge?.emoji}</Text>
//     </View>
//   );
// };
// const nameBadgeStyles = StyleSheet.create({
//   badge: { flexDirection: "row", alignItems: "center", borderRadius: 999 },
//   icon: { fontSize: 14 }
// });

// /* ================= GIFTS ================= */
// type GiftItem = {
//   key: string;
//   title: string;
//   icon?: string;
//   lottie?: any;
//   price?: number;
// };
// const TEMP_GIFTS: GiftItem[] = [
//   {
//     key: "gift_rose",
//     title: "Rose",
//     lottie: require("@/assets/lottie/rose.json"),
//     price: 10
//   },
//   {
//     key: "gift_tea",
//     title: "tea",
//     lottie: require("@/assets/lottie/tea.json"),
//     price: 5
//   },
//   {
//     key: "gift_bird",
//     title: "bird",
//     lottie: require("@/assets/lottie/bird.json"),
//     price: 15
//   },
//   {
//     key: "gift_cat",
//     title: "cat",
//     lottie: require("@/assets/lottie/cat.json"),
//     price: 25
//   },
//   {
//     key: "gift_hearts",
//     title: "Hearts",
//     lottie: require("@/assets/lottie/hearts.json"),
//     price: 50
//   }
// ];

// const GIFT_META: Record<
//   string,
//   { icon: string; count: number; lottie?: any }
// > = {
//   gift_rose: {
//     icon: "🌹",
//     count: 40,
//     lottie: require("@/assets/lottie/rose.json")
//   },
//   gift_tea: {
//     icon: "👍",
//     count: 55,
//     lottie: require("@/assets/lottie/tea.json")
//   },
//   gift_bird: {
//     icon: "🔥",
//     count: 60,
//     lottie: require("@/assets/lottie/bird.json")
//   },
//   gift_cat: {
//     icon: "👑",
//     count: 35,
//     lottie: require("@/assets/lottie/cat.json")
//   },
//   gift_hearts: {
//     icon: "🚀",
//     count: 45,
//     lottie: require("@/assets/lottie/hearts.json")
//   },
//   boost_rocket: {
//     icon: "🚀",
//     count: 55,
//     lottie: require("@/assets/lottie/rocket2.json")
//   }
// };

// function GiftPickerModal({
//   visible,
//   onClose,
//   target,
//   onPick,
//   theme
// }: {
//   visible: boolean;
//   onClose: () => void;
//   target?: UserUI | null;
//   onPick: (gift: { key: string }) => void;
//   theme: typeof Colors.light;
// }) {
//   return (
//     <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
//       <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }} onPress={onClose}>
//         <Pressable
//           style={{
//             backgroundColor: theme.card,
//             borderTopLeftRadius: 18,
//             borderTopRightRadius: 18,
//             paddingHorizontal: 14,
//             paddingTop: 12,
//             paddingBottom: 18,
//             borderTopWidth: 1,
//             borderColor: theme.border
//           }}
//           onPress={() => { }}
//         >
//           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//             <View style={{ flex: 1, paddingRight: 10 }}>
//               <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text }}>Send a Gift</Text>
//               <Text style={{ marginTop: 4, fontSize: 12, color: theme.mutedText }} numberOfLines={1}>
//                 To: {target?.name || "User"}
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={onClose}
//               style={{
//                 width: 36,
//                 height: 36,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 borderRadius: 12,
//                 backgroundColor: theme.surface2,
//                 borderWidth: 1,
//                 borderColor: theme.border
//               }}
//               activeOpacity={0.85}
//             >
//               <Ionicons name="close" size={20} color={theme.text} />
//             </TouchableOpacity>
//           </View>

//           <View style={{ height: 1, backgroundColor: theme.separator, marginVertical: 12 }} />

//           <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
//             {TEMP_GIFTS.map((g) => (
//               <TouchableOpacity
//                 key={g.key}
//                 activeOpacity={0.85}
//                 onPress={() => onPick({ key: g.key })}
//                 style={{
//                   width: "30%",
//                   minWidth: 95,
//                   borderWidth: 1,
//                   borderColor: theme.border,
//                   backgroundColor: theme.surface2,
//                   borderRadius: 14,
//                   paddingVertical: 12,
//                   alignItems: "center"
//                 }}
//               >
//                 {g.lottie ? (
//                   <LottieView
//                     source={g.lottie}
//                     autoPlay
//                     loop
//                     style={{ width: 56, height: 56 }}
//                   />
//                 ) : (
//                   <Text style={{ fontSize: 24 }}>{g.icon}</Text>
//                 )}
//                 <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: theme.text }} numberOfLines={1}>
//                   {g.title}
//                 </Text>
//                 {!!g.price && (
//                   <Text style={{ marginTop: 4, fontSize: 11, color: theme.mutedText, fontWeight: "700" }}>
//                     {g.price} Coinz
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={{ marginTop: 12, fontSize: 12, color: theme.mutedText, lineHeight: 18 }}>
//             (مؤقتًا) اختيار الهدية فقط بدون إرسال.
//           </Text>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }

// function GiftBurstOverlay({
//   visible,
//   icon,
//   count = 45,
//   fromName,
//   toName,
//   durationMs = 2600,
//   onDone
// }: {
//   visible: boolean;
//   icon: string;
//   count?: number;
//   fromName?: string;
//   toName?: string;
//   durationMs?: number;
//   onDone: () => void;
// }) {
//   const { width, height } = useWindowDimensions();
//   const opacity = useRef(new Animated.Value(0)).current;

//   const particles = useRef(
//     Array.from({ length: Math.max(12, Math.min(count, 90)) }).map(() => ({
//       x: Math.random(),
//       delay: Math.floor(Math.random() * 260),
//       dur: 1400 + Math.floor(Math.random() * 900),
//       startY: 0.25 + Math.random() * 0.6,
//       endY: 0.05 + Math.random() * 0.25,
//       size: 18 + Math.floor(Math.random() * 18),
//       spin: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 25),
//       t: new Animated.Value(0)
//     }))
//   ).current;

//   useEffect(() => {
//     if (!visible) return;

//     opacity.setValue(1);
//     particles.forEach((p) => p.t.setValue(0));


//     const anims = particles.map((p) =>
//       Animated.timing(p.t, { toValue: 1, duration: p.dur, delay: p.delay, useNativeDriver: true })
//     );
//     Animated.parallel(anims).start();

//     const fadeOutAt = Math.max(500, durationMs - 450);
//     const fadeTimer = setTimeout(() => {
//       Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
//     }, fadeOutAt);

//     const doneTimer = setTimeout(() => onDone(), durationMs);

//     return () => {
//       clearTimeout(fadeTimer);
//       clearTimeout(doneTimer);
//     };
//   }, [visible]);

//   if (!visible) return null;

//   return (
//     <View
//       pointerEvents="none"
//       style={{
//         position: "absolute",
//         left: 0,
//         top: 0,
//         right: 0,
//         bottom: 0,
//         alignItems: "center",
//         justifyContent: "center"
//       }}
//     >
//       <Animated.View style={{ opacity, width: "100%", height: "100%" }}>
//         <View style={{ position: "absolute", top: 70, left: 16, right: 16, alignItems: "center" }}>
//           <View
//             style={{
//               paddingHorizontal: 14,
//               paddingVertical: 10,
//               borderRadius: 999,
//               backgroundColor: "rgba(255,255,255,0.08)",
//               borderWidth: 1,
//               borderColor: "rgba(255,255,255,0.12)"
//             }}
//           >
//             <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
//               {fromName ? `${fromName} → ` : ""}
//               {toName ? toName : "Someone"}
//             </Text>
//           </View>
//         </View>

//         {particles.map((p, idx) => {
//           const xPx = 12 + p.x * (width - 24);
//           const startY = height * p.startY;
//           const endY = height * p.endY;

//           const translateY = p.t.interpolate({ inputRange: [0, 1], outputRange: [startY, endY] });
//           const scale = p.t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.7, 1.1, 0.95] });
//           const rotate = p.t.interpolate({ inputRange: [0, 1], outputRange: [`${-p.spin}deg`, `${p.spin}deg`] });
//           const particleOpacity = p.t.interpolate({ inputRange: [0, 0.15, 0.9, 1], outputRange: [0, 1, 1, 0] });

//           return (
//             <Animated.View
//               key={idx}
//               style={{
//                 position: "absolute",
//                 left: xPx,
//                 transform: [{ translateY }, { scale }, { rotate }],
//                 opacity: particleOpacity
//               }}
//             >
//               <Text style={{ fontSize: p.size, color: "#FFF" }}>{icon}</Text>
//             </Animated.View>
//           );
//         })}
//       </Animated.View>
//     </View>
//   );
// }


// function MediaPickerModal({
//   visible,
//   onClose,
//   onPickImage,
//   onPickGif,
//   onPickSticker,
//   theme,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onPickImage: () => void;
//   onPickGif: () => void;
//   onPickSticker: () => void;
//   theme: typeof Colors.light;
// }) {
//   const Option = ({
//     icon,
//     color,
//     onPress,
//   }: {
//     icon: keyof typeof Ionicons.glyphMap;
//     color: string;
//     onPress: () => void;
//   }) => (
//     <TouchableOpacity
//       activeOpacity={0.85}
//       onPress={() => {
//         onClose();
//         requestAnimationFrame(onPress);
//       }}
//       style={{
//         width: 48,
//         height: 48,
//         borderRadius: 24,
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: theme.card,
//         borderWidth: 1,
//         borderColor: theme.border,
//         shadowColor: "#000",
//         shadowOpacity: 0.16,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 3 },
//         elevation: 5,
//       }}
//     >
//       <Ionicons name={icon} size={23} color={color} />
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <Pressable
//         onPress={onClose}
//         style={{
//           flex: 1,
//           backgroundColor: "transparent",
//           justifyContent: "flex-end",
//         }}
//       >
//         <View
//           pointerEvents="box-none"
//           style={{
//             paddingHorizontal: 14,
//             paddingBottom: 72,
//             alignItems: "flex-start",
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 10,
//               paddingHorizontal: 10,
//               paddingVertical: 8,
//               borderRadius: 999,
//               backgroundColor: "rgba(0,0,0,0.08)",
//             }}
//           >
//             <Option
//               icon="image-outline"
//               color="#2563EB"
//               onPress={onPickImage}
//             />

//             <Option
//               icon="film-outline"
//               color="#A855F7"
//               onPress={onPickGif}
//             />

//             <Option
//               icon="happy-outline"
//               color="#F59E0B"
//               onPress={onPickSticker}
//             />
//           </View>
//         </View>
//       </Pressable>
//     </Modal>
//   );
// }
// function UploadingOverlay({
//   visible,
//   title,
//   sub,
//   seconds,
//   previewUri,
//   kind,
//   theme,
// }: {
//   visible: boolean;
//   title: string;
//   sub?: string;
//   seconds: number;
//   previewUri?: string;
//   kind?: "image" | "gif" | "sticker";
//   theme: typeof Colors.light;
// }) {
//   if (!visible) return null;

//   const label =
//     kind === "gif" ? "GIF" : kind === "sticker" ? "Sticker" : "Image";

//   return (
//     <View
//       pointerEvents="auto"
//       style={{
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: "rgba(0,0,0,0.34)",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 9999,
//         paddingHorizontal: 24,
//       }}
//     >
//       <View
//         style={{
//           width: "100%",
//           maxWidth: 320,
//           borderRadius: 24,
//           padding: 16,
//           backgroundColor: theme.card,
//           borderWidth: 1,
//           borderColor: theme.border,
//           alignItems: "center",
//         }}
//       >
//         {!!previewUri ? (
//           <View
//             style={{
//               width: 128,
//               height: 128,
//               borderRadius: 22,
//               overflow: "hidden",
//               backgroundColor: theme.surface2,
//               borderWidth: 1,
//               borderColor: theme.border,
//               marginBottom: 14,
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Image
//               source={{ uri: previewUri }}
//               style={{ width: "100%", height: "100%" }}
//               contentFit={kind === "image" ? "cover" : "contain"}
//               cachePolicy="memory-disk"
//             />
//           </View>
//         ) : (
//           <View
//             style={{
//               width: 86,
//               height: 86,
//               borderRadius: 24,
//               backgroundColor: theme.surface2,
//               borderWidth: 1,
//               borderColor: theme.border,
//               alignItems: "center",
//               justifyContent: "center",
//               marginBottom: 14,
//             }}
//           >
//             <Ionicons
//               name={kind === "gif" ? "film-outline" : kind === "sticker" ? "happy-outline" : "image-outline"}
//               size={34}
//               color={theme.text}
//             />
//           </View>
//         )}

//         <Text
//           style={{
//             color: theme.text,
//             fontSize: 16,
//             fontWeight: "900",
//             textAlign: "center",
//           }}
//         >
//           {title}
//         </Text>

//         <Text
//           style={{
//             color: theme.mutedText,
//             fontSize: 12,
//             fontWeight: "800",
//             textAlign: "center",
//             marginTop: 6,
//           }}
//         >
//           {sub || `Uploading ${label}...`}
//         </Text>

//         <Text
//           style={{
//             color: theme.tint,
//             fontSize: 13,
//             fontWeight: "900",
//             marginTop: 10,
//           }}
//         >
//           {seconds} ثانية
//         </Text>

//         <View
//           style={{
//             width: "100%",
//             height: 5,
//             borderRadius: 999,
//             overflow: "hidden",
//             backgroundColor: theme.surface2,
//             marginTop: 14,
//           }}
//         >
//           <Animated.View
//             style={{
//               width: "55%",
//               height: "100%",
//               borderRadius: 999,
//               backgroundColor: theme.tint,
//             }}
//           />
//         </View>
//       </View>
//     </View>
//   );
// }
// function StickerPickerModal({
//   visible,
//   onClose,
//   onPick,
//   theme,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onPick: (item: StickerItem) => void;
//   theme: typeof Colors.light;
// }) {
//   const [activePackId, setActivePackId] = useState(
//     STICKER_PACKS[0]?.id || ""
//   );

//   const activePack =
//     STICKER_PACKS.find((pack) => pack.id === activePackId) ||
//     STICKER_PACKS[0];

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="fade"
//       onRequestClose={onClose}
//     >

//       <Pressable
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.28)",
//           justifyContent: "flex-end",
//         }}
//         onPress={onClose}
//       >
//         <Pressable
//           onPress={() => { }}
//           style={{
//             backgroundColor: theme.card,
//             borderTopLeftRadius: 22,
//             borderTopRightRadius: 22,
//             paddingTop: 10,
//             paddingBottom: 16,
//             borderWidth: 1,
//             borderColor: theme.border,
//             height: 330,
//           }}
//         >
//           {/* شريط صغير أعلى المودل */}
//           <View
//             style={{
//               width: 42,
//               height: 5,
//               borderRadius: 999,
//               backgroundColor: theme.border,
//               alignSelf: "center",
//               marginBottom: 10,
//             }}
//           />

//           {/* Header بسيط */}
//           <View
//             style={{
//               paddingHorizontal: 14,
//               marginBottom: 8,
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text
//               style={{
//                 color: theme.text,
//                 fontSize: 15,
//                 fontWeight: "900",
//               }}
//             >
//               Stickers
//             </Text>

//             <TouchableOpacity
//               onPress={onClose}
//               activeOpacity={0.85}
//               style={{
//                 width: 34,
//                 height: 34,
//                 borderRadius: 17,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: theme.surface2,
//                 borderWidth: 1,
//                 borderColor: theme.border,
//               }}
//             >
//               <Ionicons name="close" size={19} color={theme.text} />
//             </TouchableOpacity>
//           </View>

//           {/* Packs مثل LINE */}
//           <View
//             style={{
//               borderTopWidth: 1,
//               borderBottomWidth: 1,
//               borderColor: theme.separator,
//               paddingVertical: 7,
//               marginBottom: 10,
//             }}
//           >
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={{
//                 paddingHorizontal: 12,
//                 gap: 8,
//               }}
//             >
//               {STICKER_PACKS.map((pack) => {
//                 const active = pack.id === activePackId;

//                 return (
//                   <TouchableOpacity
//                     key={pack.id}
//                     activeOpacity={0.85}
//                     onPress={() => setActivePackId(pack.id)}
//                     style={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: 14,
//                       alignItems: "center",
//                       justifyContent: "center",
//                       backgroundColor: active ? theme.tint : theme.surface2,
//                       borderWidth: 1,
//                       borderColor: active ? theme.tint : theme.border,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: 23,
//                       }}
//                     >
//                       {pack.icon}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           {/* Grid الاستيكرات */}
//           <FlatList
//             data={activePack?.stickers || []}
//             keyExtractor={(item) => item.id}
//             numColumns={4}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{
//               paddingHorizontal: 12,
//               paddingBottom: 8,
//               gap: 8,
//             }}
//             columnWrapperStyle={{
//               gap: 8,
//             }}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 activeOpacity={0.85}
//                 onPress={() => {
//                   onClose();
//                   requestAnimationFrame(() => onPick(item));
//                 }}
//                 style={{
//                   flex: 1,
//                   aspectRatio: 1,
//                   borderRadius: 16,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: theme.surface2,
//                   borderWidth: 1,
//                   borderColor: theme.border,
//                   overflow: "hidden",
//                   padding: 6,
//                 }}
//               >
//                 <Image
//                   source={{ uri: item.url }}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                   }}
//                   contentFit="contain"
//                   cachePolicy="memory-disk"
//                   transition={0}
//                 />
//               </TouchableOpacity>
//             )}
//           />
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }
// function GiftLottieOverlay({
//   visible,
//   source,
//   fromName,
//   toName,
//   durationMs = 2600,
//   onDone
// }: {
//   visible: boolean;
//   source?: any;
//   fromName?: string;
//   toName?: string;
//   durationMs?: number;
//   onDone: () => void;
// }) {
//   const opacity = useRef(new Animated.Value(0)).current;
//   const scale = useRef(new Animated.Value(0.85)).current;

//   useEffect(() => {
//     if (!visible) return;

//     opacity.setValue(1);
//     scale.setValue(1);

//     // Animated.parallel([
//     //   Animated.timing(opacity, {
//     //     toValue: 1,
//     //     duration: 100,
//     //     useNativeDriver: true
//     //   }),
//     //   Animated.spring(scale, {
//     //     toValue: 1,
//     //     friction: 6,
//     //     tension: 70,
//     //     useNativeDriver: true
//     //   })
//     // ]).start();

//     const fadeTimer = setTimeout(() => {
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: 180,
//         useNativeDriver: true
//       }).start();
//     }, Math.max(500, durationMs - 400));

//     const doneTimer = setTimeout(() => onDone(), durationMs);

//     return () => {
//       clearTimeout(fadeTimer);
//       clearTimeout(doneTimer);
//     };
//   }, [visible, durationMs, onDone, opacity, scale]);

//   if (!visible || !source) return null;

//   return (
//     <View
//       pointerEvents="none"
//       style={{
//         position: "absolute",
//         left: 0,
//         top: 0,
//         right: 0,
//         bottom: 0,
//         justifyContent: "center",
//         alignItems: "center"
//       }}
//     >
//       <Animated.View
//         style={{
//           opacity,
//           transform: [{ scale }],
//           alignItems: "center",
//           justifyContent: "center"
//         }}
//       >
//         <View
//           style={{
//             position: "absolute",
//             top: -90,
//             left: -120,
//             right: -120,
//             alignItems: "center"
//           }}
//         >
//           <View
//             style={{
//               paddingHorizontal: 14,
//               paddingVertical: 10,
//               borderRadius: 999,
//               backgroundColor: "rgba(255,255,255,0.08)",
//               borderWidth: 1,
//               borderColor: "rgba(255,255,255,0.12)"
//             }}
//           >
//             <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
//               {fromName ? `${fromName} → ` : ""}
//               {toName || "Someone"}
//             </Text>
//           </View>
//         </View>

//         <View
//           style={{
//             width: 260,
//             height: 260,
//             alignItems: "center",
//             justifyContent: "center"
//           }}
//         >
//           <LottieView
//             source={source}
//             autoPlay
//             loop
//             style={{ width: 260, height: 260 }}
//           />
//         </View>
//       </Animated.View>
//     </View>
//   );
// }
// /* ================= ROLE STAR ================= */
// const ROLE_STAR_COLOR: Record<RoomRole, string> = {
//   creator: "#F59E0B", // منشئ الغرفة - ذهبي/برتقالي
//   owner: "#EF4444",   // Owner - أحمر
//   admin: "#2563EB",   // Admin - أزرق
//   member: "#16A34A",  // Member - أخضر
// };

// const shouldShowStar = (role?: RoomRole) =>
//   role === "creator" ||
//   role === "owner" ||
//   role === "admin" ||
//   role === "member";

// const getStarColor = (role?: RoomRole) => {
//   if (!role) return "#16A34A";
//   return ROLE_STAR_COLOR[role] || "#16A34A";
// };
// /* ================= USERS MODAL (Themed) ================= */
// function UsersModal({
//   visible,
//   onClose,
//   users,
//   myUserId,
//   myRole,
//   onCopyUser,
//   onChangeRole,
//   onKickUser,
//   onBanUser,
//   onOpenGift,
//   onAvatarPress,
//   onStartChat,
//   theme
// }: {
//   visible: boolean;
//   onClose: () => void;
//   users: UserUI[];
//   myUserId: string;
//   myRole?: UserUI["role"];
//   onCopyUser: (u: UserUI) => void;
//   onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
//   onKickUser: (u: UserUI) => void;
//   onBanUser: (u: UserUI) => void;
//   onOpenGift: (u: UserUI) => void;
//   onAvatarPress: (u: UserUI) => void;
//   onStartChat: (u: UserUI) => void;
//   theme: typeof Colors.light;
// }) {
//   const canManage = myRole === "creator" || myRole === "owner" || myRole === "admin";
//   const s = useMemo(() => makeUsersStyles(theme), [theme]);

//   const getRoleColor = (role?: UserUI["role"]) => {
//     if (role === "creator") return "#FF8C00";
//     if (role === "owner") return "#FF0000";   // أحمر
//     if (role === "admin") return "#1D4ED8";   // أزرق
//     return "#16A34A";                         // أخضر
//   };
//   const RoleChip = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
//     <TouchableOpacity onPress={onPress} style={[s.roleChip, active && s.roleChipActive]} activeOpacity={0.85}>
//       <Text style={[s.roleChipText, active && s.roleChipTextActive]}>{title}</Text>
//     </TouchableOpacity>
//   );
//   const ROLE_ORDER: Record<string, number> = {
//     creator: 0,
//     owner: 1,
//     admin: 2,
//     member: 3,
//   };

//   const sortedUsers = [...users].sort((a, b) => {
//     const aRank = ROLE_ORDER[String(a.role || "member")] ?? 99;
//     const bRank = ROLE_ORDER[String(b.role || "member")] ?? 99;
//     if (aRank !== bRank) return aRank - bRank;

//     return String(a.name || "").localeCompare(String(b.name || ""));
//   });
//   return (
//     <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
//       <Pressable style={s.overlay} onPress={onClose}>
//         <Pressable style={s.sheet} onPress={() => { }}>
//           <View style={s.header}>
//             <Text style={s.title}>Users</Text>
//             <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={s.closeBtn}>
//               <Ionicons name="close" size={22} color={theme.text} />
//             </TouchableOpacity>
//           </View>

//           <View style={s.note}>
//             <Text style={s.noteText}>
//               اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
//               {canManage ? "يمكنك أيضًا تغيير الدور." : "ليس لديك صلاحية لتغيير الأدوار."}
//             </Text>
//           </View>

//           <View style={s.list}>
//             {sortedUsers.map((u) => {
//               const isMe = u.id === myUserId;
//               return (
//                 <TouchableOpacity
//                   key={u.id}
//                   style={s.row}
//                   onPress={() => onCopyUser(u)}
//                   activeOpacity={0.88}
//                 >
//                   <TouchableOpacity
//                     activeOpacity={0.85}
//                     onPress={(e) => {
//                       e.stopPropagation?.();
//                       onAvatarPress(u);
//                     }}
//                   >
//                     <Image
//                       source={resolveAvatarSource(u)}
//                       style={s.usersModalAvatar}
//                       contentFit="cover"
//                       cachePolicy="memory-disk"
//                       transition={0}
//                     />
//                   </TouchableOpacity>

//                   <View style={s.centerContent}>
//                     <Text
//                       style={[
//                         s.name,
//                         { color: getRoleColor(u.role) }
//                       ]}
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                     >
//                       {u.name} {isMe ? "(You)" : ""}
//                     </Text>

//                     <View style={s.inlineBadges}>
//                       <CustomEmojiBadgeView badge={u.customEmojiBadge} />
//                       <DynamicUserBadge badge={pickPrimaryBadge(u.activeBadges)} />
//                     </View>

//                     {canManage && !isMe && (
//                       <View style={s.rolesRow}>
//                         <RoleChip
//                           title="Member"
//                           active={(u.role || "member") === "member"}
//                           onPress={() => onChangeRole(u, "member")}
//                         />
//                         <RoleChip
//                           title="Admin"
//                           active={u.role === "admin"}
//                           onPress={() => onChangeRole(u, "admin")}
//                         />
//                         <RoleChip
//                           title="Owner"
//                           active={u.role === "owner"}
//                           onPress={() => onChangeRole(u, "owner")}
//                         />
//                       </View>
//                     )}

//                     {canManage && !isMe && (
//                       <View style={s.actionsRow}>
//                         <TouchableOpacity
//                           onPress={() => onKickUser(u)}
//                           style={s.kickBtn}
//                           activeOpacity={0.85}
//                         >
//                           <Text style={s.kickText}>Kick</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           onPress={() => onBanUser(u)}
//                           style={s.banBtn}
//                           activeOpacity={0.85}
//                         >
//                           <Text style={s.banText}>Ban</Text>
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </View>

//                   <View style={s.trailingActions}>
//                     {!isMe && (
//                       <>
//                         <TouchableOpacity
//                           onPress={(e) => {
//                             e.stopPropagation?.();
//                             onClose();
//                             requestAnimationFrame(() => {
//                               onOpenGift(u);
//                             });
//                           }}
//                           activeOpacity={0.85}
//                           style={s.iconBtn}
//                         >
//                           <Ionicons name="gift-outline" size={20} color={theme.text} />
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           onPress={(e) => {
//                             e.stopPropagation?.();
//                             onStartChat(u);
//                           }}
//                           activeOpacity={0.85}
//                           style={s.iconBtn}
//                         >
//                           <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.text} />
//                         </TouchableOpacity>
//                       </>
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }
// const resolveUsernameColor = (u?: Partial<UserUI> & { activeCustomization?: any } | null) => {
//   const color =
//     String(
//       (u as any)?.usernameColor ||
//       (u as any)?.activeCustomization?.usernameColor ||
//       ""
//     ).trim();

//   return color || undefined;
// };

// const resolveMessageTextColor = (u?: Partial<UserUI> & { activeCustomization?: any } | null) => {
//   const color =
//     String(
//       (u as any)?.messageTextColor ||
//       (u as any)?.activeCustomization?.messageTextColor ||
//       ""
//     ).trim();

//   return color || undefined;
// };
// const resolveAvatarSource = (u?: Partial<UserUI> & { activeCustomization?: any } | null) => {
//   const gif =
//     String(
//       (u as any)?.avatarGif ||
//       (u as any)?.activeCustomization?.avatarGif ||
//       ""
//     ).trim();

//   const avatar =
//     String(
//       (u as any)?.avatar ||
//       ""
//     ).trim();

//   return gif || avatar || "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg";
// };
// function ReactionDetailsModal({
//   visible,
//   message,
//   onClose,
//   theme,
// }: {
//   visible: boolean;
//   message: MessageUI | null;
//   onClose: () => void;
//   theme: typeof Colors.light;
// }) {
//   const reactions = Array.isArray(message?.reactions) ? message!.reactions! : [];

//   const grouped = REACTIONS
//     .map((emoji) => ({
//       emoji,
//       users: reactions.filter((r) => r.emoji === emoji),
//     }))
//     .filter((x) => x.users.length > 0);

//   const total = reactions.length || Number(message?.reactionCount || 0);

//   const [activeEmoji, setActiveEmoji] = useState<Reaction | "all">("all");

//   useEffect(() => {
//     if (!visible) return;

//     const firstEmoji = grouped[0]?.emoji;
//     setActiveEmoji(firstEmoji || "all");
//   }, [visible, message?.id, reactions.length]);

//   const visibleUsers =
//     activeEmoji === "all"
//       ? reactions
//       : reactions.filter((r) => r.emoji === activeEmoji);

//   const uniqueUsers = visibleUsers.filter((u, index, arr) => {
//     const id = String(u.userId || u.username || index);
//     return (
//       arr.findIndex((x) => String(x.userId || x.username) === id) === index
//     );
//   });

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <Pressable
//         onPress={onClose}
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.45)",
//           justifyContent: "flex-end",
//         }}
//       >
//         <Pressable
//           onPress={() => { }}
//           style={{
//             backgroundColor: theme.card,
//             borderTopLeftRadius: 22,
//             borderTopRightRadius: 22,
//             paddingHorizontal: 16,
//             paddingTop: 14,
//             paddingBottom: 22,
//             borderWidth: 1,
//             borderColor: theme.border,
//             maxHeight: "70%",
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: 12,
//             }}
//           >
//             <View>
//               <Text
//                 style={{
//                   color: theme.text,
//                   fontSize: 16,
//                   fontWeight: "900",
//                 }}
//               >
//                 Reactions
//               </Text>

//               <Text
//                 style={{
//                   color: theme.mutedText,
//                   fontSize: 12,
//                   fontWeight: "700",
//                   marginTop: 3,
//                 }}
//               >
//                 Total: {total}
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={onClose}
//               activeOpacity={0.85}
//               style={{
//                 width: 38,
//                 height: 38,
//                 borderRadius: 14,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: theme.surface2,
//                 borderWidth: 1,
//                 borderColor: theme.border,
//               }}
//             >
//               <Ionicons name="close" size={20} color={theme.text} />
//             </TouchableOpacity>
//           </View>

//           {grouped.length > 0 ? (
//             <>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{
//                   paddingBottom: 10,
//                   gap: 8,
//                 }}
//               >
//                 <TouchableOpacity
//                   activeOpacity={0.85}
//                   onPress={() => setActiveEmoji("all")}
//                   style={{
//                     paddingHorizontal: 12,
//                     height: 36,
//                     borderRadius: 999,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     flexDirection: "row",
//                     backgroundColor:
//                       activeEmoji === "all" ? theme.tint : theme.surface2,
//                     borderWidth: 1,
//                     borderColor:
//                       activeEmoji === "all" ? theme.tint : theme.border,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: activeEmoji === "all" ? "#FFFFFF" : theme.text,
//                       fontSize: 13,
//                       fontWeight: "900",
//                     }}
//                   >
//                     All {total}
//                   </Text>
//                 </TouchableOpacity>

//                 {grouped.map((group) => {
//                   const active = activeEmoji === group.emoji;

//                   return (
//                     <TouchableOpacity
//                       key={group.emoji}
//                       activeOpacity={0.85}
//                       onPress={() => setActiveEmoji(group.emoji)}
//                       style={{
//                         paddingHorizontal: 12,
//                         height: 36,
//                         borderRadius: 999,
//                         alignItems: "center",
//                         justifyContent: "center",
//                         flexDirection: "row",
//                         backgroundColor: active ? theme.tint : theme.surface2,
//                         borderWidth: 1,
//                         borderColor: active ? theme.tint : theme.border,
//                       }}
//                     >
//                       <Text style={{ fontSize: 16 }}>{group.emoji}</Text>

//                       <Text
//                         style={{
//                           marginLeft: 6,
//                           color: active ? "#FFFFFF" : theme.text,
//                           fontSize: 13,
//                           fontWeight: "900",
//                         }}
//                       >
//                         {group.users.length}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>

//               <View
//                 style={{
//                   height: 1,
//                   backgroundColor: theme.separator,
//                   marginBottom: 8,
//                 }}
//               />

//               <ScrollView showsVerticalScrollIndicator={false}>
//                 {uniqueUsers.map((u, index) => (
//                   <View
//                     key={`${u.emoji}-${u.userId || u.username || index}`}
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       paddingVertical: 11,
//                       borderBottomWidth: 1,
//                       borderBottomColor: theme.separator,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         width: 34,
//                         fontSize: 18,
//                         textAlign: "center",
//                       }}
//                     >
//                       {u.emoji}
//                     </Text>

//                     <Text
//                       style={{
//                         flex: 1,
//                         color: theme.text,
//                         fontSize: 14,
//                         fontWeight: "900",
//                       }}
//                       numberOfLines={1}
//                     >
//                       {u.username || "مستخدم"}
//                     </Text>
//                   </View>
//                 ))}
//               </ScrollView>
//             </>
//           ) : (
//             <View
//               style={{
//                 paddingVertical: 24,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text
//                 style={{
//                   color: theme.mutedText,
//                   fontSize: 13,
//                   fontWeight: "800",
//                   textAlign: "center",
//                 }}
//               >
//                 لا توجد تفاصيل مستخدمين متاحة لهذا الرياكشن.
//               </Text>
//             </View>
//           )}
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }
// /* ================= MESSAGE ITEM (Themed) ================= */
// function MessageItem({
//   item,
//   isMe,
//   showName,
//   onLongPress,
//   onPressImage,
//   onTogglePlay,
//   playingId,
//   progressAnim,
//   onGiftDone,
//   onAvatarPress,
//   onAvatarLongPress,
//   onOpenAudioModal,
//   theme,
//   bubble,
//   currentUserId,
//   onSendCricketJoin,
//   onSendCricketPlay,
//   onSendSongLove,
//     onSendBombColorAnswer,

//   onOpenReactionDetails,
// }: {
//   item: MessageUI;
//   isMe: boolean;
//   showName: boolean;
//   onLongPress: () => void;
//   onPressImage: (uri: string) => void;
//   onTogglePlay: (uri: string, id: string) => void;
//   playingId: string | null;
//   progressAnim: Animated.Value;
//   onGiftDone?: () => void;
//   onAvatarPress: (u?: UserUI) => void;
//   onAvatarLongPress: (u?: UserUI) => void;
//   onOpenAudioModal: (message: MessageUI) => void;
//   theme: typeof Colors.light;
//   bubble: ReturnType<typeof makeBubbleStyles>;
//   currentUserId: string;
//   onSendCricketJoin?: (gameId: string) => void;
//   onSendCricketPlay?: (gameId: string, n: number) => void;
//   onSendSongLove?: (songCode: string) => void;
//     onSendBombColorAnswer?: (
//     color: "red" | "green" | "blue",
//     challengeId?: string
//   ) => void;
//   onOpenReactionDetails?: (message: MessageUI) => void;
// }) {
//   const { width } = useWindowDimensions();
//   type CricketMessageUI = MessageUI & {
//     type: "game";
//     game: {
//       gameType: "cricket" | string;
//       gameId?: string;
//       title?: string;
//       state?: string;
//       turnUserId?: string;
//       winnerUserId?: string;
//       payload?: any;
//     };
//   };
//   function isCricketMessage(item: MessageUI): item is CricketMessageUI {
//     return item.type === "game" && item.game?.gameType === "cricket";
//   }
//   function isSugarLuckMessage(item: MessageUI) {
//     return item.type === "game" && item.game?.gameType === "luck";
//   }
//   function isDuelMessage(item: MessageUI) {
//   return item.type === "game" && item.game?.gameType === "duel";
// }
// function isBombColorMessage(item: MessageUI) {
//   return (
//     item.type === "game" &&
//     (
//       item.game?.gameType === "bomb" ||
//       item.game?.payload?.game === "bomb_color" ||
//       item.game?.title === "Bomb Color"
//     )
//   );
// }
//   const copyUserNameOnly = async (user?: UserUI) => {
//     const name = String(user?.name || "").trim();
//     if (!name) return;

//     await Clipboard.setStringAsync(name);
//     Alert.alert("Copied", "Name copied");
//   };
//   const copyMessageContent = async () => {
//     if (item.type === "system") return;
//     if (item.deletedForEveryone) return;

//     const value =
//       item.type === "text"
//         ? item.text || ""
//         : item.type === "file"
//           ? item.text || item.uri || ""
//           : item.type === "image" || item.type === "video" || item.type === "audio"
//             ? item.uri || ""
//             : "";

//     const v = String(value || "").trim();
//     if (!v) return;

//     await Clipboard.setStringAsync(v);
//   };
//   if (item.type === "song" || (item.type === "system" && item.systemType === "music")) {
//     const audioUrl = String(item.music?.audioUrl || item.uri || "").trim();

//     const playedByName = String(
//       item.music?.playedByName ||
//       item.sender?.name ||
//       "مستخدم"
//     ).trim();

//     const songCode = String(item.music?.songCode || "").trim().toUpperCase();
//     const loveCommand = String(
//       item.music?.loveCommand || (songCode ? `love@${songCode}` : "")
//     ).trim();



//     return (
//       <View style={bubble.sysWrap}>
//         <View
//           style={[
//             bubble.sysBubble,
//             {
//               width: Math.min(width - 36, 340),
//               padding: 12,
//               alignItems: "center",
//             },
//           ]}
//         >
//           <Text
//             style={{
//               color: theme.text,
//               fontWeight: "900",
//               fontSize: 14,
//               textAlign: "center",
//             }}
//             numberOfLines={2}
//           >
//             {item.music?.title || item.text || "Audio Track"}
//           </Text>

//           <Text
//             style={{
//               color: theme.mutedText,
//               fontSize: 12,
//               marginTop: 6,
//               textAlign: "center",
//               fontWeight: "800",
//             }}
//             numberOfLines={1}
//           >
//             الأغنية من {playedByName}
//           </Text>

//           {!!item.music?.channel && (
//             <Text
//               style={{
//                 color: theme.mutedText,
//                 fontSize: 12,
//                 marginTop: 4,
//                 textAlign: "center",
//               }}
//               numberOfLines={1}
//             >
//               {item.music.channel}
//             </Text>
//           )}

//           {!!songCode && (
//             <TouchableOpacity
//               activeOpacity={0.85}
//               onPress={async () => {
//                 await Clipboard.setStringAsync(loveCommand);
//                 Alert.alert("تم النسخ", `تم نسخ ${loveCommand}`);
//               }}
//               style={{
//                 marginTop: 8,
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//                 borderRadius: 999,
//                 backgroundColor: theme.surface2,
//                 borderWidth: 1,
//                 borderColor: theme.border,
//               }}
//             >
//               <Text
//                 style={{
//                   color: theme.text,
//                   fontSize: 12,
//                   fontWeight: "900",
//                 }}
//               >
//                 ID: {songCode}
//               </Text>
//             </TouchableOpacity>
//           )}

//           {!!audioUrl && (
//             <TouchableOpacity
//               activeOpacity={0.85}
//               onPress={() =>
//                 onOpenAudioModal({
//                   ...item,
//                   type: "audio",
//                   uri: audioUrl,
//                   text: item.music?.title || item.text || "Audio Track",
//                 })
//               }
//               style={{
//                 marginTop: 10,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexWrap: "wrap",
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 14,
//                   color: theme.text,
//                   fontWeight: "500",
//                 }}
//               >
//                 Audio track{" "}
//               </Text>

//               <Text
//                 style={{
//                   fontSize: 14,
//                   color: "#2563EB",
//                   fontWeight: "800",
//                 }}
//               >
//                 Play
//               </Text>
//             </TouchableOpacity>
//           )}

//           {!!songCode ? (
//             <TouchableOpacity
//               activeOpacity={0.85}
//               onPress={() => onSendSongLove?.(songCode)}
//               style={{
//                 marginTop: 10,
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 paddingHorizontal: 14,
//                 paddingVertical: 8,
//                 borderRadius: 999,
//                 backgroundColor: "rgba(239,68,68,0.12)",
//                 borderWidth: 1,
//                 borderColor: "rgba(239,68,68,0.25)",
//               }}
//             >
//               <Ionicons name="heart" size={16} color="#EF4444" />

//               <Text
//                 style={{
//                   marginLeft: 6,
//                   fontSize: 13,
//                   color: "#EF4444",
//                   fontWeight: "900",
//                 }}
//               >
//                 للإعجاب اضغط إعجاب
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <Text
//               style={{
//                 marginTop: 10,
//                 color: theme.mutedText,
//                 fontSize: 12,
//                 fontWeight: "700",
//                 textAlign: "center",
//               }}
//             >
//               للإعجاب استخدم أمر الإعجاب الخاص بالأغنية
//             </Text>
//           )}

//           <Text style={[bubble.sysTime, { marginTop: 8 }]}>{item.time}</Text>
//         </View>
//       </View>
//     );
//   }

//   if (item.type === "system") {
//     const isJoin = item.systemType === "join";
//     const isLeave = item.systemType === "leave";

//     const systemText = String(item.text || "").trim();

//     const isPrivateMentionStatus =
//       systemText.includes("Private message sent") ||
//       systemText.includes("Private message failed") ||
//       systemText.includes("User @") ||
//       systemText.includes("You cannot send a private mention message");

//     if (isJoin || isLeave) {
//       return (
//         <View
//           style={{
//             alignItems: "center",
//             justifyContent: "center",
//             marginVertical: 6,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             {isJoin && (
//               <Octicons
//                 name="sign-in"
//                 size={16}
//                 color={theme.text}
//                 style={{ marginRight: 6 }}
//               />
//             )}

//             <Text
//               style={{
//                 color: theme.text,
//                 fontSize: 13,
//                 fontWeight: "600",
//               }}
//             >
//               {item.text}
//             </Text>

//             {isLeave && (
//               <Feather
//                 name="log-out"
//                 size={16}
//                 color={theme.text}
//                 style={{ marginLeft: 6 }}
//               />
//             )}
//           </View>
//         </View>
//       );
//     }

//     // ✅ هذا التعديل خاص برسائل المنشن فقط
//     if (isPrivateMentionStatus) {
//       const isSuccess = systemText.includes("Private message sent");

//       const cleanText = systemText
//         .replace(/^✅\s*/, "")
//         .replace(/^❌\s*/, "")
//         .trim();

//       return (
//         <View style={bubble.sysWrap}>
//           <View
//             style={[
//               bubble.privateMentionBubble,
//               {
//                 borderColor: isSuccess
//                   ? "rgba(22,163,74,0.25)"
//                   : "rgba(239,68,68,0.25)",
//                 backgroundColor: isSuccess
//                   ? "rgba(22,163,74,0.08)"
//                   : "rgba(239,68,68,0.08)",
//               },
//             ]}
//           >
//             <Ionicons
//               name={isSuccess ? "checkmark-circle" : "close-circle"}
//               size={16}
//               color={isSuccess ? "#16A34A" : "#EF4444"}
//               style={{ marginRight: 6 }}
//             />

//             <Text
//               style={[
//                 bubble.privateMentionText,
//                 {
//                   color: isSuccess ? "#166534" : "#991B1B",
//                 },
//               ]}
//               numberOfLines={2}
//             >
//               {cleanText}
//             </Text>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View style={bubble.sysWrap}>
//         <View style={[bubble.sysBubble, { width: width - 50 }]}>
//           <PinnedHtmlWebView
//             html={String(item.text || "")}
//             width={width - 70}
//             minHeight={36}
//             textColor={theme.text}
//             textAlign="center"
//             fontSize={14}
//             lineHeight={24}
//           />
//         </View>
//       </View>
//     );
//   }
//   // if (item.type === "system") {
//   //   const isJoin = item.systemType === "join";
//   //   const isLeave = item.systemType === "leave";

//   //   if (isJoin || isLeave) {
//   //     return (
//   //       <View
//   //         style={{
//   //           alignItems: "center",
//   //           justifyContent: "center",
//   //           marginVertical: 6,
//   //         }}
//   //       >
//   //         <View
//   //           style={{
//   //             flexDirection: "row",
//   //             alignItems: "center",
//   //           }}
//   //         >
//   //           {/* 👈 الدخول: الأيقونة في اليسار */}
//   //           {isJoin && (
//   //             <Octicons
//   //               name="sign-in"
//   //               size={16}
//   //               color={theme.text}
//   //               style={{ marginRight: 6 }}
//   //             />
//   //           )}

//   //           {/* 👤 الاسم */}
//   //           <Text
//   //             style={{
//   //               color: theme.text,
//   //               fontSize: 13,
//   //               fontWeight: "600",
//   //             }}
//   //           >
//   //             {item.text}
//   //           </Text>

//   //           {/* 👉 الخروج: الأيقونة في اليمين */}
//   //           {isLeave && (
//   //             <Feather
//   //               name="log-out"
//   //               size={16}
//   //               color={theme.text}
//   //               style={{ marginLeft: 6 }}
//   //             />
//   //           )}
//   //         </View>
//   //       </View>
//   //     );
//   //   }

//   //   return (
//   //     <View style={bubble.sysWrap}>
//   //       <View style={[bubble.sysBubble, { width: width - 50 }]}>
//   //         <PinnedHtmlWebView
//   //           html={String(item.text || "")}
//   //           width={width - 70}
//   //           minHeight={36}
//   //           textColor={theme.text}
//   //           textAlign="center"
//   //           fontSize={14}
//   //           lineHeight={24}
//   //         />
//   //       </View>
//   //     </View>
//   //   );
//   // }
//   if (isSugarLuckMessage(item)) {
//     const title = String(item.game?.title || "سُــــــكَّــــــر").trim();
//     const state = String(item.game?.state || "").trim();
//     const pointsChange = Number(item.game?.payload?.pointsChange || 0);

//     const isWin =
//       state.includes("win") ||
//       state === "mega_win" ||
//       pointsChange > 0;

//     const isLoss =
//       state.includes("loss") ||
//       pointsChange < 0;

//     const accentColor = isWin
//       ? "#22C55E"
//       : isLoss
//         ? "#EF4444"
//         : "#F59E0B";

//     return (
//       <View style={bubble.sysWrap}>
//         <TouchableOpacity
//           activeOpacity={0.9}
//           onLongPress={onLongPress}
//           style={[
//             bubble.sysBubble,
//             {
//               width: Math.min(width - 36, 360),
//               paddingHorizontal: 14,
//               paddingVertical: 12,
//               borderWidth: 1,
//               borderColor: `${accentColor}55`,
//               backgroundColor:
//                 theme.background === "#000" || String(theme.background).toLowerCase().includes("000")
//                   ? "rgba(255,255,255,0.06)"
//                   : "rgba(0,0,0,0.04)",
//             },
//           ]}
//         >
//           <View
//             style={{
//               alignSelf: "stretch",
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "center",
//               marginBottom: 8,
//             }}
//           >
//             <Ionicons name="game-controller-outline" size={17} color={accentColor} />

//             <Text
//               style={{
//                 marginLeft: 6,
//                 color: accentColor,
//                 fontSize: 14,
//                 fontWeight: "900",
//                 textAlign: "center",
//               }}
//               numberOfLines={1}
//             >
//               سُــــــكَّــــــر
//             </Text>
//           </View>

//           {!!title && (
//             <Text
//               style={{
//                 color: theme.text,
//                 fontSize: 14,
//                 fontWeight: "900",
//                 textAlign: "center",
//                 marginBottom: 6,
//               }}
//             >
//               {title}
//             </Text>
//           )}

//           <Text
//             style={[
//               {
//                 color: theme.text,
//                 fontSize: 13,
//                 lineHeight: 22,
//                 fontWeight: "800",
//               },
//               getTextDirectionStyle(item.text || ""),
//             ]}
//           >
//             {item.text}
//           </Text>

//           {typeof item.game?.payload?.player?.points !== "undefined" && (
//             <View
//               style={{
//                 marginTop: 10,
//                 alignSelf: "center",
//                 paddingHorizontal: 12,
//                 paddingVertical: 6,
//                 borderRadius: 999,
//                 backgroundColor: `${accentColor}18`,
//                 borderWidth: 1,
//                 borderColor: `${accentColor}45`,
//               }}
//             >
//               <Text
//                 style={{
//                   color: accentColor,
//                   fontSize: 12,
//                   fontWeight: "900",
//                 }}
//               >
//                 الرصيد: {item.game.payload.player.points} نقطة  
//               </Text>
//             </View>
//           )}

//           <Text style={[bubble.sysTime, { marginTop: 8 }]}>
//             {item.time}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// if (isDuelMessage(item)) {
//   const title = String(item.game?.title || "لعبة ضرب").trim();
//   const state = String(item.game?.state || "").trim();
//   const payload = item.game?.payload || {};

//   const rawAnimationUrl = String(
//     payload?.animation?.lottieUrl ||
//       payload?.lottieUrl ||
//       item.uri ||
//       ""
//   ).trim();

//   const animationUrl = rawAnimationUrl.replace(
//     "http://localhost:5000",
//     "https://te-bot.site"
//   );

//   const animationKey = String(
//     payload?.animation?.key ||
//       payload?.command ||
//       ""
//   ).trim();

//   const phase = String(payload?.phase || state || "").trim();

//   console.log("🥊 [DUEL FRONT DISPLAY]", {
//     id: item.id,
//     title,
//     state,
//     phase,
//     rawAnimationUrl,
//     animationUrl,
//     animationKey,
//     payload,
//   });

//   return (
//     <View style={bubble.sysWrap}>
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onLongPress={onLongPress}
//         style={[
//           bubble.sysBubble,
//           {
//             width: Math.min(width - 36, 360),
//             paddingHorizontal: 14,
//             paddingVertical: 12,
//             borderWidth: 1,
//             borderColor: "rgba(245,158,11,0.35)",
//             backgroundColor:
//               theme.background === "#000" ||
//               String(theme.background).toLowerCase().includes("000")
//                 ? "rgba(255,255,255,0.06)"
//                 : "rgba(0,0,0,0.04)",
//           },
//         ]}
//       >
//         <View
//           style={{
//             alignSelf: "stretch",
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             marginBottom: 8,
//           }}
//         >
//           <Ionicons
//             name="game-controller-outline"
//             size={17}
//             color="#F59E0B"
//           />

//           <Text
//             style={{
//               marginLeft: 6,
//               color: "#F59E0B",
//               fontSize: 14,
//               fontWeight: "900",
//               textAlign: "center",
//             }}
//             numberOfLines={1}
//           >
//             {title}
//           </Text>
//         </View>

//         {!!animationUrl ? (
//           <View
//             style={{
//               width: 180,
//               height: 180,
//               alignSelf: "center",
//               alignItems: "center",
//               justifyContent: "center",
//               marginBottom: 8,
//             }}
//           >
//             <LottieView
//               source={{ uri: animationUrl }}
//               autoPlay
//               loop
//               resizeMode="contain"
//               style={{
//                 width: 180,
//                 height: 180,
//               }}
//             />
//           </View>
//         ) : (
//           <View
//             style={{
//               width: 96,
//               height: 96,
//               alignSelf: "center",
//               alignItems: "center",
//               justifyContent: "center",
//               marginBottom: 8,
//               borderRadius: 24,
//               backgroundColor: theme.surface2,
//               borderWidth: 1,
//               borderColor: theme.border,
//             }}
//           >
//             <Text style={{ fontSize: 44 }}>
//               {animationKey === "slap"
//                 ? "✋"
//                 : animationKey === "box"
//                   ? "🥊"
//                   : "💥"}
//             </Text>
//           </View>
//         )}

//         <Text
//           style={[
//             {
//               color: theme.text,
//               fontSize: 13,
//               lineHeight: 22,
//               fontWeight: "800",
//               textAlign: "center",
//             },
//             getTextDirectionStyle(item.text || ""),
//           ]}
//         >
//           {item.text}
//         </Text>

//         {!!phase && (
//           <Text
//             style={{
//               marginTop: 8,
//               color: theme.mutedText,
//               fontSize: 11,
//               fontWeight: "800",
//               textAlign: "center",
//             }}
//           >
//             {phase}
//           </Text>
//         )}

//         <Text style={[bubble.sysTime, { marginTop: 8 }]}>
//           {item.time}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// if (isBombColorMessage(item)) {
//   const state = String(item.game?.state || "").trim();
//   const payload = item.game?.payload || {};

//   const challengeId = String(
//     payload?.challengeId ||
//     item.game?.gameId ||
//     ""
//   ).trim();

//   const targetId = String(payload?.targetId || "").trim();
//   const targetName = String(payload?.targetName || "المستخدم").trim();
//   const attackerName = String(payload?.attackerName || "مستخدم").trim();
//   const stake = Number(payload?.stake || 0);

//   const isStarted = state === "started";
//   const isMyTurn =
//     isStarted &&
//     !!currentUserId &&
//     !!targetId &&
//     String(currentUserId) === String(targetId);

//   const accent =
//     state === "success"
//       ? "#22C55E"
//       : state === "failed"
//         ? "#EF4444"
//         : "#F59E0B";

//   const ColorButton = ({
//     label,
//     color,
//     bg,
//     onPress,
//   }: {
//     label: string;
//     color: string;
//     bg: string;
//     onPress: () => void;
//   }) => (
//     <TouchableOpacity
//       activeOpacity={0.88}
//       onPress={onPress}
//       disabled={!isMyTurn}
//       style={{
//         flex: 1,
//         minHeight: 42,
//         borderRadius: 14,
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: isMyTurn ? bg : theme.surface2,
//         borderWidth: 1,
//         borderColor: isMyTurn ? color : theme.border,
//         opacity: isMyTurn ? 1 : 0.45,
//       }}
//     >
//       <Text
//         style={{
//           color: isMyTurn ? color : theme.mutedText,
//           fontSize: 13,
//           fontWeight: "900",
//         }}
//       >
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={bubble.sysWrap}>
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onLongPress={onLongPress}
//         style={[
//           bubble.sysBubble,
//           {
//             width: Math.min(width - 36, 370),
//             paddingHorizontal: 14,
//             paddingVertical: 12,
//             borderWidth: 1,
//             borderColor: `${accent}55`,
//             backgroundColor:
//               theme.background === "#000" ||
//               String(theme.background).toLowerCase().includes("000")
//                 ? "rgba(255,255,255,0.06)"
//                 : "rgba(0,0,0,0.04)",
//           },
//         ]}
//       >
//         <View
//           style={{
//             alignSelf: "stretch",
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             marginBottom: 8,
//           }}
//         >
//           <Text style={{ fontSize: 22 }}>💣</Text>

//           <Text
//             style={{
//               marginLeft: 6,
//               color: accent,
//               fontSize: 14,
//               fontWeight: "900",
//               textAlign: "center",
//             }}
//             numberOfLines={1}
//           >
//             Bomb Color
//           </Text>
//         </View>

//         <Text
//           style={{
//             color: theme.text,
//             fontSize: 13,
//             lineHeight: 22,
//             fontWeight: "800",
//             textAlign: "center",
//           }}
//         >
//           {item.text}
//         </Text>

//         {!!stake && (
//           <View
//             style={{
//               marginTop: 10,
//               alignSelf: "center",
//               paddingHorizontal: 12,
//               paddingVertical: 6,
//               borderRadius: 999,
//               backgroundColor: `${accent}18`,
//               borderWidth: 1,
//               borderColor: `${accent}45`,
//             }}
//           >
//             <Text
//               style={{
//                 color: accent,
//                 fontSize: 12,
//                 fontWeight: "900",
//               }}
//             >
//               الرهان: {stake.toLocaleString()} نقطة
//             </Text>
//           </View>
//         )}

//         {isStarted && (
//           <Text
//             style={{
//               marginTop: 10,
//               color: isMyTurn ? theme.text : theme.mutedText,
//               fontSize: 12,
//               lineHeight: 18,
//               fontWeight: "800",
//               textAlign: "center",
//             }}
//           >
//             {isMyTurn
//               ? "اختر لونًا قبل انتهاء الوقت"
//               : `بانتظار اختيار ${targetName}`}
//           </Text>
//         )}

//         {isStarted && (
//           <View
//             style={{
//               flexDirection: "row",
//               gap: 8,
//               marginTop: 12,
//               alignSelf: "stretch",
//             }}
//           >
//             <ColorButton
//               label="أحمر"
//               color="#EF4444"
//               bg="rgba(239,68,68,0.12)"
//               onPress={() => onSendBombColorAnswer?.("red", challengeId)}
//             />

//             <ColorButton
//               label="أخضر"
//               color="#22C55E"
//               bg="rgba(34,197,94,0.12)"
//               onPress={() => onSendBombColorAnswer?.("green", challengeId)}
//             />

//             <ColorButton
//               label="أزرق"
//               color="#2563EB"
//               bg="rgba(37,99,235,0.12)"
//               onPress={() => onSendBombColorAnswer?.("blue", challengeId)}
//             />
//           </View>
//         )}

//         <Text style={[bubble.sysTime, { marginTop: 8 }]}>
//           {item.time}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
//   if (isCricketMessage(item)) {
//     const gameId = String(item.game?.gameId || item.game?.payload?.gameId || "").trim();
//     return (
//       <CricketGameMessage
//         item={item}
//         currentUserId={currentUserId}
//         theme={theme}
//         onJoin={() => {
//           if (!gameId) {
//             Alert.alert("Notice", "Game id not found");
//             return;
//           }

//           onSendCricketJoin?.(gameId);
//         }}
//         onChooseNumber={(n) => {
//           if (!gameId) {
//             Alert.alert("Notice", "Game id not found");
//             return;
//           }

//           onSendCricketPlay?.(gameId, n);
//         }}
//       />
//     );
//   }
//   const senderRole = item.sender?.role;
//   const starColor = getStarColor(senderRole);

//   const shouldShowAvatarAndName = showName && !!item.sender?.name;

//   const avatarBorderColor = resolveUsernameColor(item.sender) || theme.border;

//   const avatarStyle = [
//     bubble.avatar,
//     {
//       borderColor: avatarBorderColor,
//       borderWidth: resolveUsernameColor(item.sender) ? 2 : 2,
//     },
//   ];
//   return (
//     <View style={[bubble.row, isMe ? bubble.rowMe : bubble.rowOther]}>
//       {!isMe && (
//         shouldShowAvatarAndName ? (
//           <Pressable
//             style={bubble.avatarWrapLeft}
//             onPress={() => onAvatarPress(item.sender)}
//             onLongPress={() => onAvatarLongPress(item.sender)}
//             delayLongPress={350}
//           >
//             <Image
//               source={{ uri: resolveAvatarSource(item.sender) }}
//               style={avatarStyle}
//               contentFit="cover"
//               cachePolicy="memory-disk"
//               transition={0}
//             />

//             {shouldShowStar(senderRole) && (
//               <Text style={[bubble.avatarStarLeft, { color: starColor }]}>★</Text>
//             )}
//           </Pressable>
//         ) : (
//           <View style={bubble.avatarSpacerLeft} />
//         )
//       )}

//       <TouchableOpacity
//         activeOpacity={0.88}
//         onLongPress={onLongPress}
//         onPress={() => {
//           if (item.type === "text" || item.type === "file") copyMessageContent();
//         }}
//         style={[bubble.bubble, isMe ? bubble.bubbleMe : bubble.bubbleOther]}
//       >
//         {shouldShowAvatarAndName && (
//           <View style={bubble.nameWrap}>
//             {/* <View style={bubble.nameRow}>
//               <Text style={bubble.senderName} numberOfLines={1}>
//                 {item.sender.name}
//               </Text>

//               <CustomEmojiBadgeView badge={item.sender?.customEmojiBadge} />

//               <DynamicUserBadge badge={pickPrimaryBadge(item.sender?.activeBadges)} />
//             </View> */}
//             <View
//               style={[
//                 bubble.nameRow,
//                 { alignSelf: isMe ? "flex-end" : "flex-start" }
//               ]}
//             >
//               <DynamicUserBadge badge={pickPrimaryBadge(item.sender?.activeBadges)} />
//               <CustomEmojiBadgeView badge={item.sender?.customEmojiBadge} />

//               <Text
//                 style={[
//                   bubble.senderName,
//                   resolveUsernameColor(item.sender)
//                     ? { color: resolveUsernameColor(item.sender) }
//                     : null,
//                   { flexShrink: 1, flexWrap: "wrap" }
//                 ]}
//                 onLongPress={() => copyUserNameOnly(item.sender)}

//               >
//                 {item?.sender?.name}
//               </Text>
//             </View>
//             <View style={bubble.nameUnderline} />
//           </View>
//         )}

//         {!!item.deletedForEveryone ? (
//           <Text style={bubble.msgTextMuted}>🚫 تم حذف الرسالة</Text>
//         ) : (
//           <>
//             {!item.deletedForEveryone && item.replyTo && (
//               <View style={bubble.replyBox}>
//                 <View style={bubble.replyTop}>
//                   <Text style={bubble.replyName} numberOfLines={1}>
//                     {item.replyTo.sender?.name || "User"}
//                   </Text>
//                   <Text style={bubble.replyTag}>Reply</Text>
//                 </View>

//                 {item.replyTo.type !== "text" ? (
//                   <Text style={bubble.replyText} numberOfLines={2}>
//                     {item.replyTo.type === "image"
//                       ? `📷 ${stripHtmlToText(String(item.replyTo.text || "")) || "Image"}`
//                       : item.replyTo.type === "video"
//                         ? `🎬 ${stripHtmlToText(String(item.replyTo.text || "")) || "Video"}`
//                         : item.replyTo.type === "audio"
//                           ? `🎤 ${stripHtmlToText(String(item.replyTo.text || "")) || "Voice"}`
//                           : item.replyTo.type === "file"
//                             ? `📄 ${stripHtmlToText(String(item.replyTo.text || "")) || "File"}`
//                             : stripHtmlToText(String(item.replyTo.text || "")) || "—"}
//                   </Text>
//                 ) : (
//                   <Text style={bubble.replyText} numberOfLines={2}>
//                     {stripHtmlToText(String(item.replyTo.text || "")) || "—"}
//                   </Text>
//                 )}
//               </View>
//             )}

//             {item.type === "text" && (
//               <Text
//                 style={[
//                   bubble.msgText,
//                   getTextDirectionStyle(item.text),
//                   resolveMessageTextColor(item.sender)
//                     ? { color: resolveMessageTextColor(item.sender) }
//                     : null,
//                 ]}
//               >
//                 {item.text}
//               </Text>
//             )}

//             {item.type === "gift" ? (
//               (() => {
//                 const key = item.gift?.key || "";
//                 const senderName = item.sender?.name || "Someone";
//                 if (key.startsWith("boost")) {
//                   return (
//                     <Text style={[bubble.msgTextMuted, { fontWeight: "900", color: theme.warning }]}>
//                       🚀 {senderName} Boosted the Room
//                     </Text>
//                   );
//                 }
//                 return (
//                   <Text style={bubble.msgTextMuted}>
//                     🎁 {senderName} → {item.gift?.targetName || "Someone"} {item.gift?.icon || "🎁"}
//                   </Text>
//                 );
//               })()
//             ) : null}
//             {/* 
//             {item.type === "image" && item.uri ? (
//               <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(item.uri!)}>
//                 <Image source={{ uri: item.uri }} style={bubble.media} />
//               </TouchableOpacity>
//             ) : null} */}
//             {item.type === "image" && item.uri ? (
//               (() => {
//                 const mime = String(item.mediaMimeType || "").toLowerCase();
//                 const uri = String(item.uri || "").toLowerCase();

//                 const isStickerOrGif =
//                   mime === "image/gif" ||
//                   mime === "image/webp" ||
//                   uri.endsWith(".gif") ||
//                   uri.endsWith(".webp");

//                 return (
//                   <TouchableOpacity
//                     activeOpacity={0.9}
//                     onPress={() => onPressImage(item.uri!)}
//                   >
//                     <Image
//                       source={{ uri: item.uri }}
//                       style={isStickerOrGif ? bubble.stickerMedia : bubble.media}
//                       contentFit={isStickerOrGif ? "contain" : "cover"}
//                       cachePolicy="memory-disk"
//                     />
//                   </TouchableOpacity>
//                 );
//               })()
//             ) : null}
//             {item.type === "video" && item.uri ? (
//               <View style={bubble.videoWrapper}>
//                 <Video source={{ uri: item.uri }} style={bubble.video} useNativeControls resizeMode={ResizeMode.CONTAIN} isLooping={false} />
//               </View>
//             ) : null}

//             {item.type === "file" ? (
//               <View style={bubble.fileRow}>
//                 <Text style={bubble.fileIcon}>📄</Text>
//                 <Text style={bubble.fileName} numberOfLines={1}>
//                   {item.text || "File"}
//                 </Text>
//               </View>
//             ) : null}

//             {item.type === "audio" && item.uri ? (
//               <TouchableOpacity
//                 activeOpacity={0.85}
//                 onPress={() => onOpenAudioModal(item)}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 14,
//                     color: theme.text,
//                     fontWeight: "500",
//                   }}
//                 >
//                   Voice message{" "}
//                 </Text>

//                 <Text
//                   style={{
//                     fontSize: 14,
//                     color: "#2563EB",
//                     fontWeight: "800",
//                   }}
//                 >
//                   Play
//                 </Text>
//               </TouchableOpacity>
//             ) : null}
//           </>
//         )}

//       </TouchableOpacity>
//       {item.reaction && (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={() => onOpenReactionDetails?.(item)}
//           style={[
//             bubble.reactionOutside,
//             isMe ? bubble.reactionOutsideMe : bubble.reactionOutsideOther,
//           ]}
//         >
//           <Text style={bubble.reactionEmoji}>{item.reaction}</Text>

//           {Number(item.reactionCount || 0) > 1 && (
//             <Text style={bubble.reactionCount}>
//               {item.reactionCount}
//             </Text>
//           )}
//         </TouchableOpacity>
//       )}
//       {isMe && (
//         shouldShowAvatarAndName ? (
//           <Pressable
//             style={bubble.avatarWrapRight}
//             onPress={() => onAvatarPress(item.sender)}
//             onLongPress={() => onAvatarLongPress(item.sender)}
//             delayLongPress={350}
//           >
//             <Image
//               source={{ uri: resolveAvatarSource(item.sender) }}
//               style={avatarStyle}
//               contentFit="cover"
//               cachePolicy="memory-disk"
//               transition={0}
//             />

//             {shouldShowStar(senderRole) && (
//               <Text style={[bubble.avatarStarRight, { color: starColor }]}>★</Text>
//             )}
//           </Pressable>
//         ) : (
//           <View style={bubble.avatarSpacerRight} />
//         )
//       )}
//     </View>
//   );
// }
// function PinnedHtmlWebView({
//   html,
//   width,
//   minHeight = 42,
//   textColor = "#333333",
//   textAlign = "center",
//   fontSize = 15,
//   lineHeight = 26,
// }: {
//   html?: string;
//   width: number;
//   minHeight?: number;
//   textColor?: string;
//   textAlign?: "left" | "center" | "right";
//   fontSize?: number;
//   lineHeight?: number;
// }) {
//   const raw = String(html || "").trim();

//   const plainText = raw
//     .replace(/<[^>]*>/g, " ")
//     .replace(/&nbsp;/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

//   const estimateHeight = useMemo(() => {
//     const charsPerLine = Math.max(18, Math.floor(width / (fontSize * 0.65)));
//     const lines = Math.max(1, Math.ceil(plainText.length / charsPerLine));

//     return Math.max(
//       minHeight,
//       Math.min(220, lines * lineHeight + 10)
//     );
//   }, [plainText, width, fontSize, lineHeight, minHeight]);

//   const [webHeight, setWebHeight] = useState(estimateHeight);
//   const [measured, setMeasured] = useState(false);

//   const heightAnim = useRef(new Animated.Value(estimateHeight)).current;
//   const opacityAnim = useRef(new Animated.Value(0.92)).current;
//   const scaleAnim = useRef(new Animated.Value(0.985)).current;
//   const translateYAnim = useRef(new Animated.Value(4)).current;

//   const lastHeightRef = useRef(estimateHeight);

//   const bodyHtml = /<[a-z][\s\S]*>/i.test(raw)
//     ? raw
//     : `<div>${raw.replace(/\n/g, "<br/>")}</div>`;

//   useEffect(() => {
//     lastHeightRef.current = estimateHeight;
//     setWebHeight(estimateHeight);
//     setMeasured(false);

//     heightAnim.setValue(estimateHeight);
//     opacityAnim.setValue(0.92);
//     scaleAnim.setValue(0.985);
//     translateYAnim.setValue(4);
//   }, [raw, width, estimateHeight]);

//   const animateToHeight = (nextHeight: number) => {
//     const finalHeight = Math.max(Math.ceil(nextHeight), minHeight);

//     if (Math.abs(lastHeightRef.current - finalHeight) < 2) {
//       setMeasured(true);
//       return;
//     }

//     lastHeightRef.current = finalHeight;
//     setWebHeight(finalHeight);
//     setMeasured(true);
//     Animated.parallel([
//       Animated.timing(heightAnim, {
//         toValue: finalHeight,
//         duration: 220,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: false,
//       }),
//       Animated.timing(opacityAnim, {
//         toValue: 1,
//         duration: 180,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: false,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 180,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: false,
//       }),
//       Animated.timing(translateYAnim, {
//         toValue: 0,
//         duration: 180,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: false,
//       }),
//     ]).start();
//   };

//   return (
//     <Animated.View
//       style={{
//         width,
//         height: heightAnim,
//         overflow: "hidden",
//         opacity: opacityAnim,
//         transform: [
//           { translateY: translateYAnim },
//           { scale: scaleAnim },
//         ],
//       }}
//     >
//       <WebView
//         originWhitelist={["*"]}
//         scrollEnabled={false}
//         nestedScrollEnabled={false}
//         javaScriptEnabled={true}
//         domStorageEnabled={false}
//         automaticallyAdjustContentInsets={false}
//         showsVerticalScrollIndicator={false}
//         showsHorizontalScrollIndicator={false}
//         bounces={false}
//         overScrollMode="never"
//         onMessage={(event) => {
//           const nextHeight = Number(event.nativeEvent.data);
//           if (!Number.isFinite(nextHeight)) return;

//           animateToHeight(nextHeight);
//         }}
//         injectedJavaScript={`
//           (function() {
//             function sendHeight() {
//               var body = document.body;
//               var html = document.documentElement;

//               var height = Math.max(
//                 body.scrollHeight,
//                 body.offsetHeight,
//                 html.clientHeight,
//                 html.scrollHeight,
//                 html.offsetHeight
//               );

//               window.ReactNativeWebView.postMessage(String(height));
//             }

//             if (document.readyState === "complete") {
//               sendHeight();
//             } else {
//               window.addEventListener("load", sendHeight);
//             }

//             setTimeout(sendHeight, 30);
//             setTimeout(sendHeight, 100);
//             setTimeout(sendHeight, 220);

//             true;
//           })();
//         `}
//         source={{
//           html: `
//             <!DOCTYPE html>
//             <html dir="rtl">
//               <head>
//                 <meta charset="utf-8" />
//                 <meta
//                   name="viewport"
//                   content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
//                 />
//                 <style>
//                   html, body {
//                     margin: 0;
//                     padding: 0;
//                     background: transparent;
//                     color: ${textColor};
//                     text-align: ${textAlign};
//                     font-size: ${fontSize}px;
//                     line-height: ${lineHeight}px;
//                     font-weight: 600;
//                     overflow: hidden;
//                     word-break: break-word;
//                     overflow-wrap: anywhere;
//                   }

//                   body {
//                     width: 100%;
//                   }

//                   * {
//                     max-width: 100%;
//                     box-sizing: border-box;
//                   }

//                   img, video {
//                     max-width: 100%;
//                     height: auto;
//                     border-radius: 10px;
//                   }

//                   a {
//                     color: ${textColor};
//                     text-decoration: none;
//                   }

//                   p, h1, h2, h3, h4, h5, h6 {
//                     margin: 0 0 6px 0;
//                     padding: 0;
//                   }
//                 </style>
//               </head>

//               <body>
//                 ${bodyHtml || "—"}
//               </body>
//             </html>
//           `,
//         }}
//         style={{
//           width,
//           height: webHeight,
//           backgroundColor: "transparent",
//         }}
//       />
//     </Animated.View>
//   );
// }
// /* ================= MAIN SCREEN ================= */
// export default function ChatScreen() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { width } = useWindowDimensions();
//   const insets = useSafeAreaInsets();
//   const seenGiftIdsRef = useRef<Set<string>>(new Set());
//   const didInitSeenGiftsRef = useRef(false);
//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();
//   const [showAudioModal, setShowAudioModal] = useState(false);
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const [showStickerPicker, setShowStickerPicker] = useState(false);
//   const styles = useMemo(
//     () => makeScreenStyles(theme, insets.top, insets.bottom),
//     [theme, insets.top, insets.bottom]
//   );

//   const bubbleStyles = useMemo(() => makeBubbleStyles(theme), [theme]);

//   const { id } = useLocalSearchParams<{ id: string }>();
//   const roomId = String(id || "");

//   const flatListRef = useRef<any>(null);
//   const keyboardHeight = useSharedValue(0);
//   const [inputBarHeight, setInputBarHeight] = useState(0);

//   useKeyboardHandler(
//     {
//       onMove: (e) => {
//         "worklet";
//         keyboardHeight.value = Math.max(0, e.height);
//       },
//       onEnd: (e) => {
//         "worklet";
//         keyboardHeight.value = Math.max(0, e.height);
//       },
//     },
//     []
//   );
//   const inputBarAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         {
//           translateY: -keyboardHeight.value,
//         },
//       ],
//     };
//   });

//   const listSpacerAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       height: keyboardHeight.value,
//     };
//   });
//   const authUser = useAppSelector((state) => state.auth.user);
//   const myUserId = String((authUser as any)?._id || (authUser as any)?.id || "");
//   const myName = String((authUser as any)?.username || (authUser as any)?.name || "Me");
//   const myAvatar = String(
//     (authUser as any)?.avatar ||
//     "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg"
//   );
//   const myStore = useAppSelector(selectMyStore);
//   const myInventory = Array.isArray(myStore?.inventory)
//     ? myStore.inventory
//     : [];
//   const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
//   const loadingMessages = useAppSelector(selectRoomLoadingMessages);
//   const roomUsers = useAppSelector((state) => selectRoomUsers(state, roomId));
//   const roomName = useAppSelector((state) => selectRoomNameById(state, roomId));
//   const roomAvatar = useAppSelector((state) => selectRoomAvatarById(state, roomId));
//   const activeCount = useAppSelector((state) => selectRoomActiveCount(state, roomId));
//   const showInitialMessagesSkeleton =
//     loadingMessages && (!reduxMessages || reduxMessages.length === 0);
//   const [text, setText] = useState("");
//   const [replyTo, setReplyTo] = useState<MessageUI | null>(null);

//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [pendingVoiceUri, setPendingVoiceUri] = useState<string | null>(null);

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const progressAnim = useRef(new Animated.Value(0)).current;

//   const [uploading, setUploading] = useState<{
//     visible: boolean;
//     title: string;
//     sub?: string;
//     startedAt?: number;
//     previewUri?: string;
//     kind?: "image" | "gif" | "sticker";
//   }>({
//     visible: false,
//     title: "Uploading…",
//     sub: undefined,
//     startedAt: undefined,
//     previewUri: undefined,
//     kind: undefined,
//   });
//   useEffect(() => {
//     if (!uploading.visible || !uploading.startedAt) {
//       setUploadSeconds(0);
//       return;
//     }

//     const timer = setInterval(() => {
//       setUploadSeconds(
//         Math.max(0, Math.floor((Date.now() - uploading.startedAt!) / 1000))
//       );
//     }, 500);

//     return () => clearInterval(timer);
//   }, [uploading.visible, uploading.startedAt]);
//   const [uploadSeconds, setUploadSeconds] = useState(0);
//   const [showMediaPicker, setShowMediaPicker] = useState(false);
//   const [showActiveRoomsDrawer, setShowActiveRoomsDrawer] = useState(false);
//   const [selectedInviteUser, setSelectedInviteUser] = useState<any>(null);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [playbackProgress, setPlaybackProgress] = useState(0);
//   const [playbackDuration, setPlaybackDuration] = useState(1);
//   const [activeAudio, setActiveAudio] = useState<MessageUI | null>(null);
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [inviteUsername, setInviteUsername] = useState("");
//   const [inviteLoading, setInviteLoading] = useState(false);
//   const [inviteSearch, setInviteSearch] = useState("");
//   const [inviteSendingId, setInviteSendingId] = useState<string | null>(null);
//   const { searchResults: inviteSearchResults, loading: inviteSearchLoading } =
//     useAppSelector((state) => state.friends);
//   const [previewImage, setPreviewImage] = useState<string | ImageSourcePropType | null>(null);
//   const [reactionDetailsMessage, setReactionDetailsMessage] =
//     useState<MessageUI | null>(null);

//   const [showReactionDetails, setShowReactionDetails] = useState(false);

//   const openReactionDetails = (message: MessageUI) => {
//     setReactionDetailsMessage(message);
//     setShowReactionDetails(true);
//   };

//   const closeReactionDetails = () => {
//     setShowReactionDetails(false);
//     setReactionDetailsMessage(null);
//   };
//   const [showRoomMenu, setShowRoomMenu] = useState(false);
//   const [showUsersModal, setShowUsersModal] = useState(false);

//   const [showActions, setShowActions] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(null);
//   const [pinnedHidden, setPinnedHidden] = useState(false);
//   const [creatingChatId, setCreatingChatId] = useState<string | null>(null);

//   const pinnedTranslateX = useRef(new Animated.Value(0)).current;
//   const arrowTranslateX = useRef(new Animated.Value(40)).current; // يبدأ مخفي
//   const [pinHtml, setPinHtml] = useState<string>("");
//   const [showPinModal, setShowPinModal] = useState(false);

//   const [pinPreviewFull, setPinPreviewFull] = useState(false);

//   const [giftPicker, setGiftPicker] = useState<{ visible: boolean; target?: UserUI | null }>({ visible: false, target: null });

//   const [giftDoneById, setGiftDoneById] = useState<Record<string, boolean>>({});
//   const markGiftDone = (id: string) => setGiftDoneById((prev) => ({ ...prev, [id]: true }));
//   const openAudioModal = (message: MessageUI) => {
//     if (!message?.uri) return;
//     setActiveAudio(message);
//     setShowAudioModal(true);
//   };
//   const sendCricketJoin = async (gameId: string) => {
//     try {
//       const content = `!cricket join ${gameId}`;
//       const clientId = `cricket_join_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content,
//           type: "text",
//         })
//       ).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Join failed");
//     }
//   };
// const handleSendBombColorAnswer = async (
//   color: "red" | "green" | "blue",
//   challengeId?: string
// ) => {
//   if (!roomId) return;

//   try {
//     await dispatch(
//       sendBombColorAnswer({
//         roomId,
//         color,
//         challengeId,
//       }) as any
//     );
//   } catch (e: any) {
//     Alert.alert(
//       "Bomb",
//       e?.message || "تعذر إرسال اختيار اللون"
//     );
//   }
// };
//   const sendCricketPlay = async (gameId: string, n: number) => {
//     try {
//       const content = `!cricket play ${gameId} ${n}`;
//       const clientId = `cricket_play_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content,
//           type: "text",
//         })
//       ).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Play failed");
//     }
//   };
//   const sendSongLove = async (songCode: string) => {
//     try {
//       const code = String(songCode || "").trim().toUpperCase();

//       if (!code) {
//         Alert.alert("Notice", "Song ID not found");
//         return;
//       }

//       const content = `love@${code}`;
//       const clientId = `song_love_${Date.now()}_${Math.random()
//         .toString(36)
//         .slice(2, 8)}`;

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content,
//           type: "text",
//         })
//       ).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Love failed");
//     }
//   };
//   const [giftOverlay, setGiftOverlay] = useState<{
//     visible: boolean;
//     messageId: string | null;
//     giftKey: string | null;
//     icon: string;
//     count: number;
//     lottie?: any;
//     fromName?: string;
//     toName?: string;
//   }>({
//     visible: false,
//     messageId: null,
//     giftKey: null,
//     icon: "🎁",
//     count: 45,
//     lottie: undefined,
//     fromName: undefined,
//     toName: undefined
//   });
//   const onAvatarPress = (u?: UserUI) => {
//     const userId = String(u?.id || "").trim();
//     if (!userId) return;

//     router.push({
//       pathname: "/profile/[id]",
//       params: { id: userId },
//     });
//   };
//   const handleInviteSearch = async () => {
//     const q = String(inviteUsername || "").trim();
//     if (!q) {
//       Alert.alert("Notice", "Please enter a username");
//       return;
//     }

//     try {
//       setInviteLoading(true);
//       setSelectedInviteUser(null);
//       await dispatch(searchUsers(q)).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Search failed");
//     } finally {
//       setInviteLoading(false);
//     }
//   };
//   // ✅ لمنع leave مرتين
//   const didLeaveRef = useRef(false);
//   const kicked = useAppSelector((state) => selectKickedFlag(state, roomId));
//   const banned = useAppSelector((state) => selectBannedFlag(state, roomId));

//   const myRole = useMemo<UserUI["role"]>(() => {
//     const me = (roomUsers || []).find((u: any) => String(u?._id) === myUserId);
//     return me?.role;
//   }, [roomUsers, myUserId]);
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
//     } catch (e: any) {
//     } finally {
//       setCreatingChatId(null);
//     }
//   };

//   const canModerate = useMemo(() => myRole === "creator" || myRole === "owner" || myRole === "admin", [myRole]);
//   type UsersMapValue = {
//     username?: string;
//     avatar?: string;
//     avatarGif?: string;
//     usernameColor?: string;
//     messageTextColor?: string;
//     role?: any;
//     activeBadges?: UserBadgeUI[];
//     customEmojiBadge?: {
//       emoji?: string;
//       isActive?: boolean;
//       expiresAt?: string | null;
//     } | null;
//   };
//   const usersMap = useMemo(() => {
//     const map = new Map<string, UsersMapValue>();

//     for (const u of roomUsers || []) {
//       if (u?._id) {
//         map.set(String(u._id), {
//           username: u.username,
//           avatar: u.avatar,
//           avatarGif: u?.activeCustomization?.avatarGif || u?.avatarGif || "",
//           usernameColor: u?.activeCustomization?.usernameColor || u?.usernameColor || "",
//           messageTextColor: u?.activeCustomization?.messageTextColor || u?.messageTextColor || "",
//           role: u.role,
//           activeBadges:
//             String(u?._id) === String(myUserId)
//               ? buildActiveBadgesFromUser(u, myInventory)
//               : buildActiveBadgesFromUser(u),
//           customEmojiBadge:
//             u?.customEmojiBadge && typeof u.customEmojiBadge === "object"
//               ? {
//                 emoji: String(u.customEmojiBadge.emoji || ""),
//                 isActive: Boolean(u.customEmojiBadge.isActive),
//                 expiresAt: u.customEmojiBadge.expiresAt
//                   ? String(u.customEmojiBadge.expiresAt)
//                   : null
//               }
//               : null
//         });
//       }
//     }

//     if (myUserId) {
//       const meInRoom = (roomUsers || []).find((u: any) => String(u?._id) === String(myUserId));

//       map.set(myUserId, {
//         username: myName,
//         avatar: myAvatar,
//         avatarGif:
//           meInRoom?.activeCustomization?.avatarGif ||
//           (authUser as any)?.activeCustomization?.avatarGif ||
//           (authUser as any)?.avatarGif ||
//           "",
//         usernameColor:
//           meInRoom?.activeCustomization?.usernameColor ||
//           (authUser as any)?.activeCustomization?.usernameColor ||
//           (authUser as any)?.usernameColor ||
//           "",
//         messageTextColor:
//           meInRoom?.activeCustomization?.messageTextColor ||
//           (authUser as any)?.activeCustomization?.messageTextColor ||
//           (authUser as any)?.messageTextColor ||
//           "",
//         role: myRole,
//         activeBadges: meInRoom ? buildActiveBadgesFromUser(meInRoom, myInventory) : [],
//         customEmojiBadge:
//           (authUser as any)?.customEmojiBadge && typeof (authUser as any).customEmojiBadge === "object"
//             ? {
//               emoji: String((authUser as any).customEmojiBadge.emoji || ""),
//               isActive: Boolean((authUser as any).customEmojiBadge.isActive),
//               expiresAt: (authUser as any).customEmojiBadge.expiresAt
//                 ? String((authUser as any).customEmojiBadge.expiresAt)
//                 : null
//             }
//             : null
//       });
//     }

//     return map;
//   }, [roomUsers, myUserId, myName, myAvatar, myRole, authUser, myInventory]);
//   useEffect(() => {
//     let mounted = true;

//     const loadSeenGiftIds = async () => {
//       if (!myUserId || !roomId) return;

//       const storedIds = await getSeenGiftIds(myUserId, roomId);
//       if (!mounted) return;

//       seenGiftIdsRef.current = new Set(storedIds);
//       didInitSeenGiftsRef.current = true;
//     };

//     loadSeenGiftIds();

//     return () => {
//       mounted = false;
//     };
//   }, [myUserId, roomId]);

//   const resolveUserNameById = (id?: string) => {
//     if (!id) return "";
//     const v = usersMap.get(String(id));
//     return String(v?.username || "");
//   };

//   const normalizeRoleLabelAr = (role?: string) => {
//     if (!role) return "عضو";
//     if (role === "creator") return "منشئ";
//     if (role === "owner") return "مالك";
//     if (role === "admin") return "مشرف";
//     return "عضو";
//   };

//   const clipText = (s: string, max = 120) => {
//     const t = String(s || "");
//     if (t.length <= max) return t;
//     return t.slice(0, max - 1) + "…";
//   };

//   const safeDisplayText = (content: string) => stripHtmlToText(content) || "—";

//   const scrollToBottom = () => {
//     try {
//       flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
//     } catch { }
//   };
//   const hidePinnedBar = () => {
//     Animated.parallel([
//       Animated.timing(pinnedTranslateX, {
//         toValue: -260,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.timing(arrowTranslateX, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setPinnedHidden(true);
//     });
//   };

//   const showPinnedBar = () => {
//     setPinnedHidden(false);

//     Animated.parallel([
//       Animated.timing(pinnedTranslateX, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.timing(arrowTranslateX, {
//         toValue: 40,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };
//   const pinnedPanResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_: any, gestureState: { dx: number; }) => {
//         return Math.abs(gestureState.dx) > 8;
//       },

//       onPanResponderMove: (_: any, gestureState: { dx: number; }) => {
//         if (gestureState.dx < 0) {
//           pinnedTranslateX.setValue(gestureState.dx);
//         }
//       },

//       onPanResponderRelease: (_: any, gestureState: { dx: number; }) => {
//         if (gestureState.dx < -80) {
//           hidePinnedBar();
//         } else {
//           Animated.spring(pinnedTranslateX, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;
//   const arrowPanResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         return Math.abs(gestureState.dx) > 8;
//       },

//       onPanResponderMove: (_, gestureState) => {
//         if (gestureState.dx < 0) {
//           arrowTranslateX.setValue(Math.max(0, 40 + gestureState.dx));
//         }
//       },

//       onPanResponderRelease: (_, gestureState) => {
//         if (gestureState.dx < -35) {
//           showPinnedBar();
//         } else {
//           Animated.spring(arrowTranslateX, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;
//   const formatTime = (millis: number) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   /* ================= MIC PERMISSION ================= */
//   const ensureMicPermission = async () => {
//     try {
//       const perm = await Audio.getPermissionsAsync();
//       if (perm.granted) return true;

//       const req = await Audio.requestPermissionsAsync();
//       if (req.granted) return true;

//       Alert.alert(
//         "Microphone Permission",
//         "لا يمكن تسجيل الصوت بدون إذن الميكروفون. افتح الإعدادات ثم فعّل Microphone.",
//         [
//           { text: "إلغاء", style: "cancel" },
//           { text: "فتح الإعدادات", onPress: () => Linking.openSettings() }
//         ]
//       );
//       return false;
//     } catch {
//       Alert.alert("Error", "تعذر طلب إذن الميكروفون.");
//       return false;
//     }
//   };
//   const handleInviteUser = async () => {
//     const user = selectedInviteUser;
//     const targetId = String(user?._id || user?.id || "").trim();

//     if (!targetId) {
//       Alert.alert("Notice", "Please select a user first");
//       return;
//     }

//     if (targetId === myUserId) {
//       Alert.alert("Notice", "You cannot invite yourself");
//       return;
//     }

//     try {
//       setInviteLoading(true);
//       setInviteSendingId(targetId);

//       await dispatch(
//         inviteToRoom({
//           roomId,
//           targetId,
//           message: `Join the room "${roomName}" 🔥`,
//         })
//       ).unwrap();

//       Alert.alert(
//         "Success",
//         `Invitation sent to ${user?.username || user?.name || "user"}`
//       );

//       setShowInviteModal(false);
//       setInviteUsername("");
//       setInviteSearch("");
//       setSelectedInviteUser(null);
//     } catch (e: any) {
//       Alert.alert(
//         "Error",
//         e?.message || "Failed to send invitation"
//       );
//     } finally {
//       setInviteLoading(false);
//       setInviteSendingId(null);
//     }
//   };

//   useEffect(() => {
//     if (!roomId) return;

//     const hasMessages = Array.isArray(reduxMessages) && reduxMessages.length > 0;
//     const hasUsers = Array.isArray(roomUsers) && roomUsers.length > 0;
//     const hasStats = typeof activeCount === "number";

//     const loadRoom = async () => {
//       try {
//         if (!hasMessages) {
//           await dispatch(
//             fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })
//           ).unwrap();
//         }

//         if (!hasUsers) {
//           await dispatch(fetchRoomUsers(roomId)).unwrap();
//         }

//         if (!hasStats) {
//           await dispatch(fetchRoomStats(roomId)).unwrap();
//         }

//         await dispatch(getMyInventory() as any);
//         joinRoomSocket(roomId);
//         ensureMicPermission();
//       } catch (e) {
//       }
//     };

//     loadRoom();

//     return () => {
//       // leaveRoomSocket(roomId);
//     };
//   }, [roomId]);
//   /* ================= KICK/BAN HANDLERS ================= */
//   useEffect(() => {
//     if (!roomId || !kicked) return;
//     if (didLeaveRef.current) return;
//     didLeaveRef.current = true;

//     const msg = (kicked as any)?.message || "تم طردك من الغرفة.";
//     Alert.alert("تم الطرد", msg, [
//       {
//         text: "حسناً",
//         onPress: async () => {
//           try {
//             await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
//           } catch { }
//           dispatch(clearKickedFlag({ roomId }));
//           router.back();
//         }
//       }
//     ]);
//   }, [kicked, roomId, dispatch, router]);

//   useEffect(() => {
//     if (!roomId || !banned) return;
//     if (didLeaveRef.current) return;
//     didLeaveRef.current = true;

//     const reason = (banned as any)?.reason ? `السبب: ${(banned as any).reason}` : "";
//     const msg = reason || "تم حظرك من الغرفة.";

//     Alert.alert("تم الحظر", msg, [
//       {
//         text: "حسناً",
//         onPress: async () => {
//           try {
//             await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
//           } catch { }
//           dispatch(clearBannedFlag({ roomId }));
//           router.back();
//         }
//       }
//     ]);
//   }, [banned, roomId, dispatch, router]);

//   /* ================= CLEANUP SOUND/TIMERS ================= */
//   useEffect(() => {
//     return () => {
//       (async () => {
//         try {
//           if (sound) {
//             await sound.stopAsync();
//             await sound.unloadAsync();
//           }
//         } catch { }
//       })();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ================= KEYBOARD FIX (inverted) ================= */
//   useEffect(() => {
//     const sub = Keyboard.addListener("keyboardDidHide", () => {
//       try {
//         flatListRef.current?.scrollToOffset?.({ offset: 0, animated: false });
//       } catch { }
//     });
//     return () => sub.remove();
//   }, []);

//   const usersUI: UserUI[] = useMemo(() => {
//     return (roomUsers || []).map((u: any) => ({
//       id: String(u?._id),
//       name: String(u?.username || "User"),
//       avatar: String(u?.avatar || ""),
//       avatarGif: String(u?.activeCustomization?.avatarGif || u?.avatarGif || ""),
//       usernameColor: String(u?.activeCustomization?.usernameColor || u?.usernameColor || ""),
//       messageTextColor: String(u?.activeCustomization?.messageTextColor || u?.messageTextColor || ""),

//       role: u?.role,
//       activeBadges:
//         String(u?._id) === String(myUserId)
//           ? buildActiveBadgesFromUser(u, myInventory)
//           : buildActiveBadgesFromUser(u),
//       customEmojiBadge:
//         u?.customEmojiBadge && typeof u?.customEmojiBadge === "object"
//           ? {
//             emoji: String(u.customEmojiBadge.emoji || ""),
//             isActive: Boolean(u.customEmojiBadge.isActive),
//             expiresAt: u.customEmojiBadge.expiresAt
//               ? String(u.customEmojiBadge.expiresAt)
//               : null
//           }
//           : null,
//       isOnline: Boolean(u?.isOnline)
//     }));
//   }, [roomUsers, myUserId, myInventory]);
//   /* ================= messagesById (for reply preview) ================= */
//   const messagesById = useMemo(() => {
//     const mp = new Map<string, any>();
//     for (const m of reduxMessages || []) {
//       if (m?._id) mp.set(String(m._id), m);
//     }
//     return mp;
//   }, [reduxMessages]);

//   /* ================= SENDER PICKING ================= */
//   const DEBUG_USER = false;

//   const logSenderFromMessage = (m: any, tag = "SENDER_DUMP") => {
//     if (!DEBUG_USER) return;
//     try {
//       const snap = m?.senderSnapshot;
//       const active = snap?.activeCustomization;
//       const dump = {
//         tag,
//         messageId: String(m?._id || ""),
//         backendType: String(m?.type || ""),
//         senderRaw: m?.sender,
//         senderSnapshot: snap
//           ? {
//             _id: String(snap?._id || ""),
//             username: String(snap?.username || ""),
//             avatar: String(snap?.avatar || ""),
//             verificationType: String(snap?.verificationType || ""),
//             badgesRoot: Array.isArray(snap?.badges) ? snap.badges : [],
//             activeCustomization: active
//               ? {
//                 badges: Array.isArray(active?.badges) ? active.badges : [],
//                 verificationType: String(active?.verificationType || "")
//               }
//               : null
//           }
//           : null
//       };
//     } catch (e) {
//     }
//   };

//   const pickSenderFromMessage = (m: any) => {
//     const senderObj =
//       typeof m?.sender === "object" && m?.sender
//         ? m.sender
//         : m?.sender
//           ? { _id: String(m.sender), username: "", avatar: "" }
//           : null;

//     const snap = m?.senderSnapshot || null;

//     const senderId = String(snap?._id || senderObj?._id || m?.senderId || "").trim();
//     const username = String(
//       snap?.username ||
//       senderObj?.username ||
//       m?.senderUsername ||
//       m?.actorName ||
//       m?.username ||
//       ""
//     ).trim();

//     const avatar = String(
//       snap?.avatar ||
//       senderObj?.avatar ||
//       usersMap.get(senderId)?.avatar ||
//       ""
//     ).trim();

//     const avatarGif = String(
//       snap?.activeCustomization?.avatarGif ||
//       snap?.avatarGif ||
//       senderObj?.activeCustomization?.avatarGif ||
//       senderObj?.avatarGif ||
//       usersMap.get(senderId)?.avatarGif ||
//       ""
//     ).trim();

//     const usernameColor =
//       String(
//         snap?.activeCustomization?.usernameColor ||
//         snap?.usernameColor ||
//         senderObj?.activeCustomization?.usernameColor ||
//         senderObj?.usernameColor ||
//         usersMap.get(senderId)?.usernameColor ||
//         ""
//       ).trim();

//     const messageTextColor =
//       String(
//         snap?.activeCustomization?.messageTextColor ||
//         snap?.messageTextColor ||
//         senderObj?.activeCustomization?.messageTextColor ||
//         senderObj?.messageTextColor ||
//         usersMap.get(senderId)?.messageTextColor ||
//         ""
//       ).trim();

//     const snapshotRole = String(snap?.role || senderObj?.role || "").trim();

//     const activeBadgesFromSnapshot =
//       senderId === myUserId
//         ? buildActiveBadgesFromUser(snap, myInventory)
//         : buildActiveBadgesFromUser(snap);

//     const activeBadgesFromUsersMap = usersMap.get(senderId)?.activeBadges || [];
//     const activeBadges =
//       activeBadgesFromSnapshot.length > 0
//         ? activeBadgesFromSnapshot
//         : activeBadgesFromUsersMap;

//     const customEmojiBadge =
//       snap?.customEmojiBadge && typeof snap.customEmojiBadge === "object"
//         ? {
//           emoji: String(snap.customEmojiBadge.emoji || ""),
//           isActive: Boolean(snap.customEmojiBadge.isActive),
//           expiresAt: snap.customEmojiBadge.expiresAt
//             ? String(snap.customEmojiBadge.expiresAt)
//             : null
//         }
//         : senderObj?.customEmojiBadge && typeof senderObj.customEmojiBadge === "object"
//           ? {
//             emoji: String(senderObj.customEmojiBadge.emoji || ""),
//             isActive: Boolean(senderObj.customEmojiBadge.isActive),
//             expiresAt: senderObj.customEmojiBadge.expiresAt
//               ? String(senderObj.customEmojiBadge.expiresAt)
//               : null
//           }
//           : null;

//     return {
//       senderId,
//       username,
//       avatar,
//       avatarGif,
//       usernameColor,
//       messageTextColor,
//       snapshotRole: snapshotRole || undefined,
//       activeBadges,
//       customEmojiBadge
//     };
//   };
//   function parseSongMessage(m: any) {
//     const song = m?.song || {};
//     const text = String(m?.content || "").trim();

//     const lines = text
//       .split("\n")
//       .map((x: string) => String(x || "").trim())
//       .filter(Boolean);

//     const titleLine = lines.find((l: string) => l.startsWith("🎵"));
//     const channelLine = lines.find((l: string) => l.startsWith("🎤"));
//     const linkLine = lines.find((l: string) => l.startsWith("🔗"));

//     const title =
//       String(song?.title || "").trim() ||
//       (titleLine ? titleLine.replace(/^🎵\s*/, "").trim() : "") ||
//       text;

//     const channel =
//       String(song?.channelTitle || "").trim() ||
//       (channelLine ? channelLine.replace(/^🎤\s*/, "").trim() : "");

//     const audioUrl =
//       String(song?.audioUrl || "").trim() ||
//       String(m?.media?.url || "").trim() ||
//       (linkLine ? linkLine.replace(/^🔗\s*/, "").trim() : "");

//     const thumbnail =
//       String(song?.thumbnail || "").trim() ||
//       (String(m?.media?.mimeType || "").toLowerCase().startsWith("image/")
//         ? String(m?.media?.url || "").trim()
//         : "");

//     const youtubeUrl = String(song?.youtubeUrl || "").trim();

//     if (!title && !audioUrl) return null;

//     return {
//       title,
//       channel,
//       audioUrl,
//       thumbnail,
//       youtubeUrl,

//       playedById: String(song?.playedById || "").trim(),
//       playedByName: String(song?.playedByName || "").trim(),
//       playedByAtUsername: String(song?.playedByAtUsername || "").trim(),

//       songCode: String(song?.songCode || "").trim().toUpperCase(),
//       loveCommand: String(song?.loveCommand || "").trim(),
//     };
//   }
//   const mapReduxToUIMessage = (m: any): MessageUI => {
//     logSenderFromMessage(m, "MAP_MESSAGE_USER_DUMP");

//     const backendType = String(m?.type || "text");

//     const parsedSong =
//       backendType === "song"
//         ? parseSongMessage(m)
//         : backendType === "system" && String(m?.systemType || "") === "room_music"
//           ? parseSongMessage(m)
//           : null;
//     const isSystem =
//       backendType === "system" ||
//       backendType === "announcement" ||
//       backendType === "join" ||
//       backendType === "leave" ||
//       backendType === "promotion" ||
//       backendType === "ban" ||
//       backendType === "role";

//     // ✅ IDs
//     const serverId = m?._id ? String(m._id) : undefined;
//     const clientId = m?.clientId ? String(m.clientId) : undefined;

//     // إذا عندك clientId استخدمه دائمًا، وإلا استخدم serverId
//     const stableId =
//       clientId ||
//       serverId ||
//       `tmp:${String(m?.createdAt || Date.now())}:${Math.random().toString(16).slice(2)}`;

//     const picked = pickSenderFromMessage(m);
//     const senderId = String(picked.senderId || "").trim();


//     // اسم المستخدم في رسائل السيستم
//     let systemUserName = String(picked.username || "").trim();
//     if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
//     if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
//     if (!systemUserName) systemUserName = "مستخدم";

//     // نص السيستم
//     let systemText = String(m?.content || "");

//     if (backendType === "join") systemText = systemUserName;
//     else if (backendType === "leave") systemText = systemUserName;
//     else if (backendType === "promotion") {
//       const action = String(m?.action || m?.meta?.action || "");
//       const actor = String(m?.actorName || m?.meta?.actorName || "").trim() || systemUserName || "مشرف";
//       const target = String(m?.targetName || m?.meta?.targetName || "").trim();
//       const roleRaw = String(m?.role || m?.meta?.role || "").trim();

//       const isRoleChange =
//         action === "role:set" ||
//         Boolean(m?.actorName || m?.targetName || m?.role || m?.meta?.actorName || m?.meta?.targetName || m?.meta?.role);

//       if (isRoleChange) {
//         const targetName = target || "مستخدم";
//         const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
//         systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
//       } else {
//         systemText = `⭐ تمت ترقية ${systemUserName}`;
//       }
//     } else if (backendType === "ban") systemText = `⛔ تم حظر ${systemUserName}`;
//     else if (backendType === "announcement") systemText = `📢 ${m?.content || ""}`;
//     else if (backendType === "role") {
//       const actor = String(m?.actorName || systemUserName || "مشرف");
//       const target = String(m?.targetName || "مستخدم");
//       const r = normalizeRoleLabelAr(String(m?.role || ""));
//       systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
//     }

//     // ✅ replyTo preview
//     const replyRaw = m?.replyTo || m?.replyToId || m?.meta?.replyTo || m?.meta?.replyToId || null;

//     const buildReplyPreview = (raw: any): MessageUI | undefined => {
//       if (!raw) return undefined;

//       // لو السيرفر بعت object كامل
//       if (typeof raw === "object") {
//         const rid = String(raw?._id || raw?.clientId || "reply");
//         const rType = String(raw?.type || "text");

//         const uiT: MessageUI["type"] =
//           rType === "image"
//             ? "image"
//             : rType === "video"
//               ? "video"
//               : rType === "audio"
//                 ? "audio"
//                 : rType === "file"
//                   ? "file"
//                   : "text";
//         if (uiType === "audio") {
//         }
//         return {
//           id: rid,
//           clientId: raw?.clientId ? String(raw.clientId) : undefined,
//           serverId: raw?._id ? String(raw._id) : undefined,
//           type: uiT,
//           text: String(
//             raw?.content ||
//             raw?.text ||
//             raw?.message ||
//             raw?.media?.url ||
//             "Media message"
//           ),
//           uri: raw?.media?.url,
//           mediaMimeType: String(raw?.media?.mimeType || ""),
//           mediaFileName: String(raw?.media?.fileName || ""),
//           sender: {
//             id: String(raw?.sender?._id || raw?.senderId || "unknown"),
//             name: String(raw?.sender?.username || raw?.senderUsername || "User"),
//             avatar: String(raw?.sender?.avatar || "")
//           },
//           time: ""
//         };
//       }

//       // لو replyTo عبارة عن id string
//       if (typeof raw === "string") {
//         const rid = String(raw);
//         const ref = messagesById.get(rid);

//         if (!ref) {
//           return { id: rid, type: "text", text: "Replying to a message…", time: "" } as any;
//         }

//         const refType = String(ref?.type || "text");
//         const uiT: MessageUI["type"] =
//           refType === "image"
//             ? "image"
//             : refType === "video"
//               ? "video"
//               : refType === "audio"
//                 ? "audio"
//                 : refType === "file"
//                   ? "file"
//                   : "text";

//         const pickedRef = pickSenderFromMessage(ref);
//         const refSenderId = String(pickedRef?.senderId || "").trim();
//         const refSenderName =
//           String(pickedRef?.username || "").trim() ||
//           (refSenderId === myUserId ? myName : String(resolveUserNameById(refSenderId) || "").trim()) ||
//           "User";

//         return {
//           id: String(ref?.clientId || ref?._id || rid),
//           clientId: ref?.clientId ? String(ref.clientId) : undefined,
//           serverId: ref?._id ? String(ref._id) : undefined,
//           type: uiT,
//           text: String(ref?.content || "Media message"),
//           uri: ref?.media?.url,
//           mediaMimeType: String(ref?.media?.mimeType || ""),
//           mediaFileName: String(ref?.media?.fileName || ""),
//           sender: {
//             id: refSenderId || "unknown",
//             name: refSenderName,
//             avatar: String(pickedRef?.avatar || "")
//           },
//           time: ""
//         };
//       }

//       return undefined;
//     };

//     const uiReplyTo = buildReplyPreview(replyRaw);

//     // ✅ uiType
//     const mediaUrl = String(m?.media?.url || "").trim();
//     const mediaMime = String(m?.media?.mimeType || "").trim().toLowerCase();
//     const systemTypeRaw = String(m?.systemType || "").trim();

//     const isAudioMedia =
//       !!mediaUrl &&
//       (mediaMime.startsWith("audio/") || systemTypeRaw === "room_music_audio");
// console.log("📩 [ROOM SERVER MESSAGE RAW]", {
//   id: m?._id,
//   clientId: m?.clientId,
//   room: m?.room,
//   type: m?.type,
//   systemType: m?.systemType,
//   gameType: m?.gameType || m?.game?.gameType,
//   content: m?.content,
//   media: m?.media,
//   music: m?.music,
//   game: m?.game,
//   gift: m?.gift || m?.meta?.gift,
//   sender: m?.sender,
//   createdAt: m?.createdAt,
//   fullMessage: m,
// });
//     let uiType: MessageUI["type"] = "text";
//     let resolvedSystemType: MessageUI["systemType"] | undefined = undefined;

//     if (backendType === "gift") uiType = "gift";
//     else if (backendType === "song") uiType = "song";
//     else if (backendType === "game") uiType = "game";
//     else if (backendType === "image") uiType = "image";
//     else if (backendType === "video") uiType = "video";
//     else if (backendType === "audio") uiType = "audio";
//     else if (backendType === "file") uiType = "file";
//     else if (isSystem) uiType = "system";
//     if (backendType === "system") {

//     }
//     // ✅ time (يفضل تثبيت createdAt في optimistic لتقليل الحركة)
//     const time = new Date(m?.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//     // ✅ reaction (أول reaction فقط)
//     const firstReactionEmoji =
//       Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";
//     const uiReaction = REACTIONS.includes(firstReactionEmoji as any) ? (firstReactionEmoji as Reaction) : undefined;

//     // ✅ sender role من usersMap
//     const roomRole = usersMap.get(senderId)?.role as RoomRole | undefined;

//     const senderUI: UserUI = {
//       id: String(senderId || "unknown"),
//       name: picked.username || (senderId && senderId === myUserId ? myName : "User"),
//       avatar: picked.avatar || (senderId && senderId === myUserId ? myAvatar : ""),
//       avatarGif: picked.avatarGif || "",
//       usernameColor: picked.usernameColor || "",
//       messageTextColor: picked.messageTextColor || "",
//       role: roomRole,
//       snapshotRole: picked.snapshotRole,
//       activeBadges: picked.activeBadges || [],
//       customEmojiBadge: (picked as any).customEmojiBadge || null
//     };
//     const messageText =
//       parsedSong
//         ? parsedSong.title
//         : uiType === "audio"
//           ? String(m?.content || m?.music?.title || "Voice")
//           : isSystem
//             ? systemText
//             : String(m?.content || "");
//     // ✅ gift payload
//     const giftPayload = m?.gift || m?.meta?.gift || null;
//     const giftKey = backendType === "gift" ? String(giftPayload?.key || m?.content || "") : "";
//     const giftIcon = String(giftPayload?.icon || "") || (GIFT_META[giftKey]?.icon || "🎁");
//     const giftCount = Number(giftPayload?.count || 0) || (GIFT_META[giftKey]?.count || 45);

//     const giftTargetId = giftPayload?.targetId ? String(giftPayload.targetId) : undefined;
//     const giftTargetName = giftPayload?.targetName ? String(giftPayload.targetName) : undefined;
//     const reactionInfo = normalizeMessageReactions(m);
//     return {
//       // ✅ أهم سطر: id ثابت للـ FlatList
//       id: stableId,

//       // ✅ احتفظ بالاثنين للاستخدام في socket actions (reaction/delete) وفي replace بالريدكس
//       clientId,
//       serverId,

//       type: uiType,
//       systemType: isSystem ? (backendType as any) : undefined,
//       music: parsedSong
//         ? {
//           title: parsedSong.title,
//           channel: parsedSong.channel,
//           audioUrl: parsedSong.audioUrl,
//           thumbnail: parsedSong.thumbnail,
//           youtubeUrl: parsedSong.youtubeUrl,

//           playedById: parsedSong.playedById,
//           playedByName: parsedSong.playedByName,
//           playedByAtUsername: parsedSong.playedByAtUsername,

//           songCode: parsedSong.songCode,
//           loveCommand: parsedSong.loveCommand,
//         }
//         : undefined,

//       game:
//         backendType === "game"
//           ? {
//             gameType: String(m?.gameType || m?.game?.gameType || "").trim(),
//             gameId: String(m?.game?.gameId || "").trim(),
//             title: String(m?.game?.title || m?.content || "").trim(),
//             state: String(m?.game?.state || "").trim(),
//             turnUserId: String(m?.game?.turnUserId || "").trim(),
//             winnerUserId: String(m?.game?.winnerUserId || "").trim(),
//             payload: m?.game?.payload || null,
//           }
//           : undefined,
//       text: messageText,
//       uri: m?.media?.url,
//       mediaMimeType: String(m?.media?.mimeType || ""),
//       mediaFileName: String(m?.media?.fileName || ""),
//       // في announcement كنت تخفي sender عندك — نفس السلوك
//       sender:
//         uiType === "audio" || uiType === "song" || uiType === "game"
//           ? senderUI
//           : backendType === "announcement"
//             ? senderUI
//             : isSystem
//               ? undefined
//               : senderUI,

//       gift:
//         uiType === "gift"
//           ? { key: giftKey, icon: giftIcon, count: giftCount, targetId: giftTargetId, targetName: giftTargetName }
//           : undefined,

//       replyTo: uiReplyTo,
//       reaction: reactionInfo.firstReactionEmoji
//         ? (reactionInfo.firstReactionEmoji as Reaction)
//         : uiReaction,

//       reactions: reactionInfo.reactions,
//       reactionCount: reactionInfo.reactionCount,
//       deletedForEveryone: Boolean(m?.deletedForEveryone),
//       time
//     };
//   };

//   const uiMessages: MessageUI[] = useMemo(() => {
//     if (!reduxMessages) return [];
//     return reduxMessages.map(mapReduxToUIMessage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reduxMessages, roomUsers, myUserId, myName, myAvatar, myRole]);
//   const didSeedCurrentGiftsRef = useRef(false);

//   useEffect(() => {
//     if (!didInitSeenGiftsRef.current) return;
//     if (didSeedCurrentGiftsRef.current) return;
//     if (!myUserId || !roomId) return;
//     if (!uiMessages?.length) return;

//     const existingGiftIds = uiMessages
//       .filter((m) => m.type === "gift" && m.id)
//       .map((m) => String(m.id));

//     existingGiftIds.forEach((id) => seenGiftIdsRef.current.add(id));

//     if (existingGiftIds.length) {
//       addManySeenGiftIds(myUserId, roomId, existingGiftIds);
//     }

//     didSeedCurrentGiftsRef.current = true;
//   }, [uiMessages, myUserId, roomId]);
//   /* ================= latestPinned ================= */
//   const latestPinned = useMemo(() => {
//     const list = reduxMessages || [];
//     const pinned = list.filter((m: any) => Boolean(m?.isPinned) && !m?.deletedForEveryone);
//     if (!pinned.length) return null;

//     pinned.sort((a: any, b: any) => {
//       const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
//       const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
//       return tb - ta;
//     });

//     return mapReduxToUIMessage(pinned[0]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reduxMessages, roomUsers, myUserId, myName, myAvatar, myRole]);

//   /* ================= GIFT OVERLAY AUTO ================= */
//   useEffect(() => {
//     if (!didInitSeenGiftsRef.current) return;
//     if (!didSeedCurrentGiftsRef.current) return;
//     if (!uiMessages?.length) return;

//     const latestGift = [...uiMessages]
//       .reverse()
//       .find(
//         (m) =>
//           m.type === "gift" &&
//           m.id &&
//           !m.deletedForEveryone &&
//           !seenGiftIdsRef.current.has(String(m.id))
//       );

//     if (!latestGift) return;

//     const key = String(latestGift.gift?.key || "");
//     const meta = GIFT_META[key] || {
//       icon: latestGift.gift?.icon || "🎁",
//       count: latestGift.gift?.count || 45,
//       lottie: undefined,
//     };

//     setGiftOverlay({
//       visible: true,
//       messageId: String(latestGift.id),
//       giftKey: key,
//       icon: latestGift.gift?.icon || meta.icon,
//       count: latestGift.gift?.count || meta.count,
//       lottie: meta.lottie,
//       fromName: latestGift.sender?.name || "Someone",
//       toName: latestGift.gift?.targetName || "Someone",
//     });

//     seenGiftIdsRef.current.add(String(latestGift.id));
//     addSeenGiftId(myUserId, roomId, String(latestGift.id));
//   }, [uiMessages, myUserId, roomId]);
//   /* ================= AUDIO (GLOBAL BAR anim) ================= */
//   useEffect(() => {
//     Animated.timing(progressAnim, {
//       toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
//       duration: 120,
//       useNativeDriver: false
//     }).start();
//   }, [playbackProgress, playbackDuration, progressAnim]);

//   const togglePlay = async (uri: string, id: string) => {
//     if (recording) return;

//     await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

//     if (playingId === id && sound) {
//       await sound.pauseAsync();
//       setPlayingId(null);
//       return;
//     }

//     if (activeAudio?.id === id && sound) {
//       await sound.playAsync();
//       setPlayingId(id);
//       return;
//     }

//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }

//     const { sound: newSound } = await Audio.Sound.createAsync({ uri });
//     setSound(newSound);
//     setPlayingId(id);
//     setActiveAudio({ id, uri, type: "audio", time: "" } as any);

//     newSound.setOnPlaybackStatusUpdate((status) => {
//       if (!status.isLoaded) return;

//       setPlaybackProgress(status.positionMillis);
//       setPlaybackDuration(status.durationMillis || 1);

//       if (status.didJustFinish) {
//         setPlayingId(null);
//         setActiveAudio(null);
//         setPlaybackProgress(0);
//       }
//     });

//     await newSound.playAsync();
//   };
//   const currentUserId = useSelector((s: RootState) => s.auth.user?._id);
//   // اختياري لو عندك بيانات المستخدم كاملة
//   const me = useSelector((s: RootState) => s.auth.user);

//   const myCoinz = myStore?.coinzBalance ?? 0;
//   const sendText = async () => {
//     const content = text.trim();
//     if (!content || !roomId) return;

//     if (!currentUserId) {
//       Alert.alert("Error", "Missing current user");
//       return;
//     }

//     const clientId = `c:${Date.now()}:${Math.random().toString(16).slice(2)}`;

//     const meInRoom = (roomUsers || []).find(
//       (u: any) => String(u?._id) === String(currentUserId)
//     );

//     dispatch(
//       optimisticAddRoomMessage({
//         roomId,
//         message: {
//           clientId,
//           type: "text",
//           content,
//           replyTo: replyTo?.serverId || replyTo?.id,
//           mentions: [],
//           sender: currentUserId,
//           senderSnapshot: meInRoom
//             ? {
//               _id: meInRoom._id,
//               username: meInRoom.username,
//               atUsername: me?.atUsername || "",
//               avatar: meInRoom.avatar,
//               avatarGif:
//                 meInRoom?.activeCustomization?.avatarGif || meInRoom?.avatarGif || "",
//               coverImage: me?.coverImage || "",
//               usernameColor:
//                 meInRoom?.activeCustomization?.usernameColor || meInRoom?.usernameColor || "",
//               messageTextColor:
//                 meInRoom?.activeCustomization?.messageTextColor || meInRoom?.messageTextColor || "",
//               isOnline: true,
//               verificationType:
//                 meInRoom?.verificationType || me?.verificationType || "none",
//               activeCustomization:
//                 meInRoom?.activeCustomization || { badges: [] },
//               inventory: Array.isArray(myInventory) ? myInventory : [],
//               customEmojiBadge:
//                 meInRoom?.customEmojiBadge || me?.customEmojiBadge || null,
//             }
//             : me
//               ? {
//                 _id: me._id,
//                 username: me.username,
//                 atUsername: me.atUsername,
//                 avatar: me.avatar,
//                 avatarGif:
//                   me?.activeCustomization?.avatarGif || me?.avatarGif || "",
//                 coverImage: me.coverImage,
//                 usernameColor:
//                   me?.activeCustomization?.usernameColor || me?.usernameColor || "",
//                 messageTextColor:
//                   me?.activeCustomization?.messageTextColor || me?.messageTextColor || "",
//                 isOnline: true,
//                 verificationType: me.verificationType,
//                 activeCustomization: me.activeCustomization,
//                 inventory: Array.isArray(myInventory) ? myInventory : [],
//                 customEmojiBadge: me.customEmojiBadge,
//               }
//               : undefined,
//         },
//       })
//     );

//     setText("");
//     setReplyTo(null);
//     scrollToBottom();

//     try {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content,
//           type: "text",
//           replyTo: replyTo?.serverId || replyTo?.id,
//         })
//       ).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Send failed");
//     }
//   };

//   const sendImage = async () => {
//     if (!roomId) return;

//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.85,
//       allowsEditing: false,
//     });

//     if (res.canceled) return;

//     const asset = res.assets?.[0];
//     const localUri = asset?.uri;
//     if (!localUri) return;

//     try {
//       setUploading({
//         visible: true,
//         title: "جاري رفع الصورة…",
//         sub: "يتم تجهيز الصورة وإرسالها",
//         startedAt: Date.now(),
//         previewUri: localUri,
//         kind: "image",
//       });

//       const secureUrl = await uploadToCloudinary(localUri, "image");

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content: "📷 Image",
//           type: "image",
//           media: {
//             url: secureUrl,
//             mimeType: asset?.mimeType || "image/jpeg",
//             fileName: asset?.fileName || "image.jpg",
//           },
//         })
//       ).unwrap();

//       scrollToBottom();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Upload failed");
//     } finally {
//       setUploading({
//         visible: false,
//         title: "Uploading…",
//         sub: undefined,
//         startedAt: undefined,
//         previewUri: undefined,
//         kind: undefined,
//       });
//     }
//   };
//   const sendSticker = async (sticker: StickerItem) => {
//     if (!roomId) return;

//     const url = String(sticker?.url || "").trim();
//     if (!url) return;

//     try {
//       const clientId = `sticker:${Date.now()}:${Math.random()
//         .toString(16)
//         .slice(2)}`;

//       setShowStickerPicker(false);

//       setUploading({
//         visible: true,
//         title: "جاري إرسال الستيكار…",
//         sub: sticker.title || "Sticker",
//         startedAt: Date.now(),
//         previewUri: url,
//         kind: "sticker",
//       });

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content: sticker.title || "Sticker",
//           type: "image",
//           media: {
//             url,
//             mimeType: sticker.mimeType || "image/gif",
//             fileName: `${sticker.id || "sticker"}.gif`,
//           },
//         })
//       ).unwrap();

//       scrollToBottom();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Sticker send failed");
//     } finally {
//       setUploading({
//         visible: false,
//         title: "Uploading…",
//         sub: undefined,
//         startedAt: undefined,
//         previewUri: undefined,
//         kind: undefined,
//       });
//     }
//   };
//   const sendGifFromDevice = async () => {
//     if (!roomId) return;

//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: ["image/gif"],
//         copyToCacheDirectory: true,
//         multiple: false,
//       });

//       if (result.canceled) return;

//       const asset = result.assets?.[0];
//       const localUri = asset?.uri;

//       if (!localUri) return;

//       const clientId = `gif:${Date.now()}:${Math.random()
//         .toString(16)
//         .slice(2)}`;

//       setUploading({
//         visible: true,
//         title: "جاري رفع GIF…",
//         sub: asset?.name ? `يتم رفع ${asset.name}` : "يتم رفع GIF وإرساله",
//         startedAt: Date.now(),
//         previewUri: localUri,
//         kind: "gif",
//       });

//       const secureUrl = await uploadToCloudinary(localUri, "image");

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           clientId,
//           content: "GIF",
//           type: "image",
//           media: {
//             url: secureUrl,
//             mimeType: "image/gif",
//             fileName: asset?.name || "animation.gif",
//           },
//         })
//       ).unwrap();

//       scrollToBottom();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "GIF upload failed");
//     } finally {
//       setUploading({
//         visible: false,
//         title: "Uploading…",
//         sub: undefined,
//         startedAt: undefined,
//         previewUri: undefined,
//         kind: undefined,
//       });
//     }
//   };


//   /* ================= RECORDING ================= */
//   const startRecording = async () => {
//     try {
//       if (pendingVoiceUri) return;
//       if (recording) return;

//       const ok = await ensureMicPermission();
//       if (!ok) return;

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: false,
//         shouldDuckAndroid: true,
//         playThroughEarpieceAndroid: false
//       });

//       const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(rec);
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Record failed");
//       setRecording(null);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       if (!recording) return;

//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();

//       setRecording(null);
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

//       if (uri) setPendingVoiceUri(uri);
//     } catch {
//       setRecording(null);
//     }
//   };

//   useEffect(() => {
//     if (recording) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
//           Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
//         ])
//       ).start();
//     } else {
//       pulseAnim.setValue(1);
//     }
//   }, [recording, pulseAnim]);

//   /* ================= ACTIONS ================= */
//   const addReaction = (msg: MessageUI, emoji: Reaction) => {
//     // ممنوع إرسال reaction قبل وصول _id الحقيقي من السيرفر
//     if (!msg?.serverId) {
//       Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
//       return;
//     }

//     toggleRoomReactionSocket({ roomId, messageId: msg.serverId, emoji });
//     setShowActions(false);
//   };

//   const deleteMessage = (msg: MessageUI) => {
//     if (!msg?.serverId) {
//       Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
//       return;
//     }

//     deleteRoomSocketMessage({ roomId, messageId: msg.serverId });
//     setShowActions(false);
//   };
//   /* ================= MENU ACTIONS ================= */
//   const onRefreshRoom = async () => {
//     try {
//       setShowRoomMenu(false);
//       await dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })).unwrap();
//       await dispatch(fetchRoomUsers(roomId)).unwrap();
//       await dispatch(fetchRoomStats(roomId)).unwrap();
//       scrollToBottom();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Refresh failed");
//     }
//   };

//   const onOpenUsers = async () => {
//     try {
//       setShowRoomMenu(false);
//       await dispatch(fetchRoomUsers(roomId)).unwrap();
//       setShowUsersModal(true);
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Failed to load users");
//     }
//   };

//   const onOpenStats = async () => {
//     try {
//       setShowRoomMenu(false);
//       const stats: any = await dispatch(fetchRoomStats(roomId)).unwrap();
//       Alert.alert(
//         "Room Stats",
//         `Active: ${stats?.activeCount ?? "-"}\nTotal: ${stats?.totalUsersCount ?? "-"}\nMessages: ${stats?.messagesCount ?? "-"}\nLevel: ${stats?.level ?? "-"}`
//       );
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Failed to load stats");
//     }
//   };
//   const onLeaveRoom = () => {
//     if (!roomId) return;
//     if (didLeaveRef.current) return;

//     setShowRoomMenu(false);
//     didLeaveRef.current = true;

//     router.back();

//     setTimeout(() => {
//       dispatch(leaveRoomAndExit({ roomId, cleanup: true }));
//       dispatch(fetchRoomsByType({ type: "public", page: 1, limit: 30 }));
//     }, 0);
//   };
//   /* ================= USERS: COPY/ROLE/KICK/BAN ================= */
//   const onCopyUser = async (u: UserUI) => {
//     await Clipboard.setStringAsync(`${u.name} (${u.id})`);
//     Alert.alert("Copied", `Copied: ${u.name}`);
//   };

//   const onChangeRole = async (u: UserUI, newRole: UserUI["role"]) => {
//     try {
//       if (!canModerate) {
//         Alert.alert("No permission", "ليس لديك صلاحية لتغيير الدور");
//         return;
//       }
//       if (!u?.id || u.id === myUserId) return;
//       if (!roomId) return;

//       dispatch(socketRoleSetRequested({ roomId, targetId: u.id, role: newRole as any }));

//       const ack = await setRoomUserRoleSocket({ roomId, targetId: u.id, role: newRole as any });

//       if (ack?.ok) {
//         dispatch(socketRoleSetSucceeded());
//         Alert.alert("Success", `${u.name} => ${newRole}`);
//       } else {
//         dispatch(socketRoleSetFailed({ message: ack?.message || "Set role failed" }));
//         Alert.alert("Error", ack?.message || "Failed to change role");
//       }
//     } catch (e: any) {
//       dispatch(socketRoleSetFailed({ message: e?.message || "Set role failed" }));
//       Alert.alert("Error", e?.message || "Failed to change role");
//     }
//   };

//   const onKickUser = (u: UserUI) => {
//     if (!canModerate) return;
//     if (!u?.id || u.id === myUserId) return;
//     if (!roomId) return;

//     Alert.alert("Kick user", `Kick ${u.name}?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Kick",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             const ack = await kickRoomUserSocket({ roomId, targetId: u.id });
//             if (!ack?.ok) {
//               Alert.alert("Error", ack?.message || "Kick failed");
//               return;
//             }
//             Alert.alert("Done", `${u.name} kicked`);
//             dispatch(fetchRoomUsers(roomId));
//           } catch (e: any) {
//             Alert.alert("Error", e?.message || "Kick failed");
//           }
//         }
//       }
//     ]);
//   };

//   const onBanUser = (u: UserUI) => {
//     if (!canModerate) return;
//     if (!u?.id || u.id === myUserId) return;
//     if (!roomId) return;

//     Alert.alert("Ban user", `Ban ${u.name}?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Ban",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             const reason = "Violation";
//             const ack = await banRoomUserSocket({ roomId, targetId: u.id, reason });
//             if (!ack?.ok) {
//               Alert.alert("Error", ack?.message || "Ban failed");
//               return;
//             }
//             Alert.alert("Done", `${u.name} banned`);
//             dispatch(fetchRoomUsers(roomId));
//           } catch (e: any) {
//             Alert.alert("Error", e?.message || "Ban failed");
//           }
//         }
//       }
//     ]);
//   };

//   /* ================= BOOST ================= */
//   const onBoostRoom = async () => {
//     try {
//       // if (!canModerate) {
//       //   Alert.alert("No permission", "You don't have permission to boost this room.");
//       //   return;
//       // }
//       if (!roomId) return;

//       const level = 1;
//       const hours = 24;

//       const r = await dispatch(boostRoom({ roomId, level, hours })).unwrap();

//       if (!r?.boostExpiresAt && typeof r?.boostLevel !== "number") {
//         Alert.alert("Error", "Boost did not succeed.");
//         return;
//       }

//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           type: "gift",
//           content: "boost_rocket",
//           gift: {
//             key: "boost_rocket",
//             name: "boost",
//             value: level,
//             icon: "🚀",
//             animation: "rocket"
//           }
//         } as any)
//       ).unwrap();

//       const content = `🚀 <b>${myName}</b> boosted the room!`;
//       await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || String(e) || "Boost failed");
//     }
//   };

//   const goDetails = () => {
//     router.push({ pathname: "/room-details", params: { roomId } });
//   };

//   /* ================= PIN ================= */
//   const unpinMessage = async (messageId: string) => {
//     try {
//       await dispatch(pinRoomMessage({ roomId, messageId, pinned: false })).unwrap();
//       Alert.alert("Done", "تم إلغاء التثبيت");
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Unpin failed");
//     }
//   };

//   /* ================= RENDER ================= */
//   return (
//     <View style={styles.root}>
//       {/* ================= HEADER ================= */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <TouchableOpacity
//             onPress={() => setShowActiveRoomsDrawer(true)}
//             hitSlop={10}
//             style={{ marginRight: 10 }}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="albums-outline" size={21} color={theme.text} />
//           </TouchableOpacity>
//           <TouchableOpacity activeOpacity={0.85} onPress={goDetails}>
//             <Image source={{ uri: roomAvatar || "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg" }} style={styles.roomAvatar} />
//           </TouchableOpacity>

//           <View style={{ flex: 1, minWidth: 0 }}>
//             <Text style={styles.roomName} numberOfLines={1}>
//               {roomName}
//             </Text>
//             <Text style={styles.roomMeta}>
//               Online: {activeCount}
//               {uiMessages.length > 0 ? ` • ${uiMessages.length} Messages` : ""}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.headerRight}>


//           <TouchableOpacity onPress={onBoostRoom} hitSlop={10} style={{ marginRight: 10 }} activeOpacity={0.85}>
//             <Ionicons name="rocket-outline" size={20} color={theme.text} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setShowRoomMenu(true)} hitSlop={10} activeOpacity={0.85}>
//             <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <SafeAreaView
//         style={styles.contentSafe}
//         edges={["left", "right", "bottom"]}
//       >
//         {/* ================= FIXED REPLY PREVIEW TOP ================= */}
//         {replyTo && (
//           <View pointerEvents="box-none" style={styles.fixedReplyLayer}>
//             <View style={styles.fixedReplyCard}>
//               <View style={styles.fixedReplyIcon}>
//                 <Ionicons name="return-up-back-outline" size={16} color="#FFF" />
//               </View>

//               <View style={{ flex: 1, minWidth: 0 }}>
//                 <Text style={styles.fixedReplyTitle} numberOfLines={1}>
//                   Replying to {replyTo.sender?.name || "User"}
//                 </Text>

//                 <Text style={styles.fixedReplyText} numberOfLines={1}>
//                   {stripHtmlToText(String(replyTo.text || "")) || "Media"}
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 onPress={() => setReplyTo(null)}
//                 activeOpacity={0.85}
//                 style={styles.fixedReplyClose}
//               >
//                 <Ionicons name="close" size={18} color={theme.icon} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//         {/* ================= ROOM MENU ================= */}
//         <Modal transparent visible={showRoomMenu} animationType="fade" onRequestClose={() => setShowRoomMenu(false)}>
//           <TouchableOpacity activeOpacity={1} style={styles.menuOverlay} onPress={() => setShowRoomMenu(false)}>
//             <View style={styles.menuBox}>
//               <TouchableOpacity style={styles.menuItem} onPress={onRefreshRoom} activeOpacity={0.85}>
//                 <Ionicons name="refresh" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Refresh</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setShowRoomMenu(false);
//                   setInviteUsername("");
//                   setShowInviteModal(true);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="person-add-outline" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Invite a Friend</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.menuItem} onPress={onOpenUsers} activeOpacity={0.85}>
//                 <Ionicons name="people" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Users</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem} onPress={onOpenStats} activeOpacity={0.85}>
//                 <Ionicons name="stats-chart" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Stats</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setShowRoomMenu(false);
//                   setShowPinModal(true);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="pin" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Pin Message</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setShowRoomMenu(false);
//                   router.push({ pathname: "/room/[id]/settings", params: { id: roomId } });
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons name="settings-outline" size={18} color={theme.text} />
//                 <Text style={styles.menuText}>Setting Room</Text>
//               </TouchableOpacity>

//               <View style={styles.menuDivider} />

//               <TouchableOpacity style={styles.menuItem} onPress={onLeaveRoom} activeOpacity={0.85}>
//                 <Ionicons name="exit-outline" size={18} color={theme.danger} />
//                 <Text style={[styles.menuText, { color: theme.danger }]}>Leave Room</Text>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         </Modal>

//         {/* ================= USERS MODAL ================= */}
//         <UsersModal
//           visible={showUsersModal}
//           onClose={() => setShowUsersModal(false)}
//           users={usersUI}
//           myUserId={myUserId}
//           onAvatarPress={onAvatarPress}
//           myRole={myRole}
//           onOpenGift={(u) => setGiftPicker({ visible: true, target: u })}
//           onStartChat={(u) => openChat(String(u.id))}
//           onCopyUser={onCopyUser}
//           onChangeRole={onChangeRole}
//           onKickUser={onKickUser}
//           onBanUser={onBanUser}
//           theme={theme}
//         />

//         {/* ================= GLOBAL AUDIO BAR ================= */}
//         {/* {activeAudio && (
//         <View style={styles.globalAudioPlayer}>
//           <View style={styles.audioIcon}>
//             <Ionicons name="musical-notes" size={18} color={theme.primaryText} />
//           </View>

//           <View style={styles.audioCenter}>
//             <Text style={styles.audioNow}>Playing voice…</Text>

//             <View style={styles.globalProgressBg}>
//               <Animated.View
//                 style={[
//                   styles.globalProgressFill,
//                   {
//                     width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
//                   }
//                 ]}
//               />
//             </View>

//             <View style={styles.audioTimes}>
//               <Text style={styles.timeText}>{formatTime(playbackProgress)}</Text>
//               <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             onPress={async () => {
//               try {
//                 if (sound) {
//                   await sound.stopAsync();
//                   await sound.unloadAsync();
//                 }
//               } catch { }
//               setSound(null);
//               setPlayingId(null);
//               setActiveAudio(null);
//               setPlaybackProgress(0);
//             }}
//             activeOpacity={0.85}
//           >
//             <Ionicons name="close" size={22} color={theme.icon} />
//           </TouchableOpacity>
//         </View>
//       )} */}
//         {/* ================= FIXED AUDIO TOP PLAYER ================= */}
//         {showAudioModal && !!activeAudio?.uri && (
//           <View pointerEvents="box-none" style={styles.fixedAudioLayer}>
//             <View style={styles.fixedAudioCard}>
//               <View style={styles.fixedAudioHeader}>
//                 <View style={styles.fixedAudioIcon}>
//                   <Ionicons name="mic" size={16} color="#FFF" />
//                 </View>

//                 <Text style={styles.fixedAudioTitle} numberOfLines={1}>
//                   Voice message
//                 </Text>

//                 <TouchableOpacity
//                   onPress={() => {
//                     setShowAudioModal(false);
//                     setActiveAudio(null);
//                   }}
//                   activeOpacity={0.85}
//                   style={styles.fixedAudioClose}
//                 >
//                   <Ionicons name="close" size={18} color={theme.icon} />
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.fixedAudioPlayer}>
//                 <VoiceMessagePlayer uri={activeAudio.uri} isMe={false} />
//               </View>
//             </View>
//           </View>
//         )}
//         {/* ================= PINNED BAR ================= */}
//         {latestPinned && (
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={styles.pinnedBar}
//             onPress={() => setPinPreviewFull(true)}
//           >
//             <View style={styles.pinnedLeft}>
//               <Ionicons name="pin" size={18} color={theme.primary} />
//               <Text style={styles.pinnedTitle}>Pinned</Text>
//             </View>

//             <View style={{ flex: 1, minWidth: 0 }}>
//               <Text style={styles.pinnedText} numberOfLines={1}>
//                 {clipText(safeDisplayText(latestPinned.text || ""), 80)}
//               </Text>
//               <Text style={styles.pinnedMeta} numberOfLines={1}>
//                 {latestPinned.sender?.name ? `${latestPinned.sender.name} • ` : ""}
//                 {latestPinned.time}
//               </Text>
//             </View>

//             <Ionicons name="chevron-forward" size={18} color={theme.icon} />
//           </TouchableOpacity>
//         )}
//         {/* ================= VOICE PREVIEW ================= */}
//         {!!pendingVoiceUri && (
//           <VoiceRecorderPreview
//             uri={pendingVoiceUri}
//             topOffset={insets.top + 56} // عدل الرقم حسب ارتفاع الهيدر عندك
//             onCancel={() => setPendingVoiceUri(null)}
//             onSend={async () => {
//               if (!roomId || !pendingVoiceUri) return;
//               try {
//                 setUploading({ visible: true, title: "جاري رفع الصوت…", sub: "يرجى الانتظار" });

//                 const secureUrl = await uploadToCloudinary(pendingVoiceUri, "raw");

//                 await dispatch(
//                   sendRoomMessage({
//                     roomId,
//                     content: "🎤 Voice message",
//                     type: "audio",
//                     media: { url: secureUrl }
//                   })
//                 ).unwrap();

//                 try {
//                   await FileSystem.deleteAsync(pendingVoiceUri, { idempotent: true });
//                 } catch { }

//                 setPendingVoiceUri(null);
//                 scrollToBottom();
//               } catch (e: any) {
//                 Alert.alert("Error", e?.message || "Failed to send voice");
//               } finally {
//                 setUploading({ visible: false, title: "Uploading…", sub: undefined });
//               }
//             }}
//           />
//         )}

//         {/* ================= CHAT ================= */}
//         <FlatList
//           ref={flatListRef}
//           data={uiMessages}
//           inverted
//           keyExtractor={(item) => item.id}
//           ListHeaderComponent={<Reanimated.View style={listSpacerAnimatedStyle} />}
//           contentContainerStyle={{
//             padding: 14,
//             paddingTop: replyTo ? 78 : 14,
//           }}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item, index }) => {
//             const isMe = Boolean(myUserId) && item.sender?.id === myUserId;
//             const previousMessage = uiMessages[index + 1];
//             const showName =
//               !previousMessage || previousMessage.type === "system" || previousMessage.sender?.id !== item.sender?.id;

//             return (
//               <MessageItem
//                 item={item}
//                 isMe={isMe}
//                 showName={showName}
//                 currentUserId={myUserId}
//                 onOpenAudioModal={openAudioModal}
//                 onSendCricketJoin={sendCricketJoin}
//                 onSendBombColorAnswer={handleSendBombColorAnswer}
//                 onSendCricketPlay={sendCricketPlay}
//                 onOpenReactionDetails={openReactionDetails}
//                 onSendSongLove={sendSongLove}
//                 onAvatarLongPress={(u) => {
//                   if (!u?.id) return;
//                   setGiftPicker({ visible: true, target: u });
//                 }}
//                 onAvatarPress={onAvatarPress}

//                 onPressImage={(payload) => setPreviewImage(payload)}
//                 onTogglePlay={togglePlay}
//                 playingId={playingId}
//                 progressAnim={progressAnim}
//                 onLongPress={() => {
//                   setSelectedMessage(item);
//                   setShowActions(true);
//                 }}
//                 onGiftDone={() => markGiftDone(item.id)}
//                 theme={theme}
//                 bubble={bubbleStyles}
//               />
//             );
//           }}
//         />





//         {/* ================= INPUT ================= */}
//         <Reanimated.View
//           onLayout={(e) => {
//             setInputBarHeight(e.nativeEvent.layout.height);
//           }}
//           style={[
//             styles.inputBarWrap,
//             inputBarAnimatedStyle,
//           ]}
//         >
//           <View style={styles.inputBar}>
//             <TouchableOpacity
//               onPress={() => setShowMediaPicker(true)}
//               disabled={uploading.visible}
//               activeOpacity={0.85}
//               style={{
//                 width: 42,
//                 height: 42,
//                 borderRadius: 16,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: theme.surface2,
//                 borderWidth: 1,
//                 borderColor: theme.border,
//               }}
//             >
//               <Ionicons name="add-circle-outline" size={25} color={theme.text} />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               placeholder="Type a message"
//               placeholderTextColor={theme.subtleText}
//               value={text}
//               onFocus={() => {
//                 setTimeout(() => {
//                   flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
//                 }, 50);
//               }}
//               onChangeText={setText}
//               multiline
//             />

//             {text ? (
//               <TouchableOpacity onPress={sendText} disabled={uploading.visible} activeOpacity={0.85}>
//                 <Ionicons name="send" size={22} color={theme.primary} />
//               </TouchableOpacity>
//             ) : (
//               <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//                 <TouchableOpacity
//                   onPressIn={startRecording}
//                   onPressOut={stopRecording}
//                   disabled={uploading.visible || !!pendingVoiceUri}
//                   activeOpacity={0.85}
//                 >
//                   <Ionicons name="mic" size={26} color={recording ? theme.danger : theme.text} />
//                 </TouchableOpacity>
//               </Animated.View>
//             )}
//           </View>
//         </Reanimated.View>
//         <Modal
//           transparent
//           visible={showInviteModal}
//           animationType="fade"
//           onRequestClose={() => setShowInviteModal(false)}
//         >
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.menuOverlay}
//             onPress={() => setShowInviteModal(false)}
//           >
//             <TouchableOpacity
//               activeOpacity={1}
//               style={styles.inviteModalBox}
//               onPress={() => { }}
//             >
//               <View style={styles.inviteModalHeader}>
//                 <Text style={styles.inviteModalTitle}>Invite a Friend</Text>

//                 <TouchableOpacity
//                   onPress={() => setShowInviteModal(false)}
//                   activeOpacity={0.85}
//                   style={styles.inviteModalCloseBtn}
//                 >
//                   <Ionicons name="close" size={20} color={theme.text} />
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.inviteModalHint}>
//                 Enter the username exactly as it appears in the app
//               </Text>

//               <View style={styles.inviteInputWrap}>
//                 <Ionicons name="person-outline" size={18} color={theme.icon} />
//                 <TextInput
//                   style={styles.inviteInput}
//                   placeholder="Username"
//                   placeholderTextColor={theme.subtleText}
//                   value={inviteUsername}
//                   onChangeText={(val) => {
//                     setInviteUsername(val);
//                     setSelectedInviteUser(null);
//                   }}
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   returnKeyType="search"
//                   onSubmitEditing={handleInviteSearch}
//                 />
//               </View>

//               <TouchableOpacity
//                 style={[
//                   styles.inviteSendBtn,
//                   { marginTop: 10, opacity: inviteLoading ? 0.7 : 1 }
//                 ]}
//                 onPress={handleInviteSearch}
//                 activeOpacity={0.85}
//                 disabled={inviteLoading}
//               >
//                 <Text style={styles.inviteSendText}>
//                   {inviteLoading ? "Searching..." : "Search User"}
//                 </Text>
//               </TouchableOpacity>

//               {!!inviteSearchResults?.length && (
//                 <View style={{ marginTop: 12, gap: 8 }}>
//                   {inviteSearchResults.map((user: any) => {
//                     const userId = String(user?._id || user?.id || "");
//                     const isSelected =
//                       String(selectedInviteUser?._id || selectedInviteUser?.id || "") === userId;
//                     const isSending = inviteSendingId === userId;

//                     return (
//                       <TouchableOpacity
//                         key={userId}
//                         activeOpacity={0.85}
//                         onPress={() => setSelectedInviteUser(user)}
//                         style={{
//                           borderWidth: 1,
//                           borderColor: isSelected ? theme.primary : theme.border,
//                           backgroundColor: isSelected ? theme.surface2 : theme.card,
//                           borderRadius: 12,
//                           paddingHorizontal: 12,
//                           paddingVertical: 10,
//                           flexDirection: "row",
//                           alignItems: "center",
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <View style={{ flex: 1 }}>
//                           <Text style={{ color: theme.text, fontWeight: "700" }}>
//                             {user?.username || user?.name || "User"}
//                           </Text>
//                           {!!user?.atUsername && (
//                             <Text style={{ color: theme.mutedText, marginTop: 2 }}>
//                               @{user.atUsername}
//                             </Text>
//                           )}
//                         </View>

//                         {isSelected && (
//                           <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
//                         )}
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               )}

//               <View style={styles.inviteActionsRow}>
//                 <TouchableOpacity
//                   style={styles.inviteCancelBtn}
//                   onPress={() => {
//                     setShowInviteModal(false);
//                     setInviteUsername("");
//                     setSelectedInviteUser(null);
//                   }}
//                   activeOpacity={0.85}
//                   disabled={inviteLoading || !!inviteSendingId}
//                 >
//                   <Text style={styles.inviteCancelText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.inviteSendBtn,
//                     {
//                       opacity:
//                         inviteLoading || !!inviteSendingId || !selectedInviteUser ? 0.6 : 1,
//                     },
//                   ]}
//                   onPress={handleInviteUser}
//                   activeOpacity={0.85}
//                   disabled={inviteLoading || !!inviteSendingId || !selectedInviteUser}
//                 >
//                   <Text style={styles.inviteSendText}>
//                     {inviteSendingId ? "Sending..." : "Send Invite"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         </Modal>
//         {/* ================= ACTIONS MODAL ================= */}
//         <Modal transparent visible={showActions} animationType="fade" onRequestClose={() => setShowActions(false)}>
//           <View style={styles.actionsOverlay}>
//             <View style={styles.actionsBox}>
//               <View style={styles.reactionsRow}>
//                 {REACTIONS.map((r) => (
//                   <TouchableOpacity key={r} onPress={() => selectedMessage && addReaction(selectedMessage, r)}
//                     activeOpacity={0.85}>
//                     <Text style={{ fontSize: 22 }}>{r}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <TouchableOpacity
//                 onPress={() => {
//                   if (!selectedMessage?.serverId) {
//                     Alert.alert("انتظر قليلًا", "لا يمكن الرد على الرسالة قبل وصولها للسيرفر.");
//                     return;
//                   }

//                   setReplyTo(selectedMessage);
//                   setShowActions(false);
//                 }}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.action}>Reply</Text>
//               </TouchableOpacity>

//               {(selectedMessage?.sender?.id === myUserId || canModerate) &&
//                 selectedMessage?.type !== "system" &&
//                 !selectedMessage?.deletedForEveryone && (
//                   <TouchableOpacity onPress={() => selectedMessage && deleteMessage(selectedMessage)}
//                     activeOpacity={0.85}>
//                     <Text style={[styles.action, { color: theme.danger }]}>Delete</Text>
//                   </TouchableOpacity>
//                 )}

//               <TouchableOpacity onPress={() => setShowActions(false)} activeOpacity={0.85}>
//                 <Text style={styles.cancel}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         {/* ================= IMAGE PREVIEW ================= */}
//         <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
//           <View style={styles.imagePreviewOverlay}>
//             <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)} activeOpacity={0.85}>
//               <Ionicons name="close" size={28} color="#FFF" />
//             </TouchableOpacity>

//             <Image
//               source={typeof previewImage === "string" ? { uri: previewImage } : previewImage!}
//               style={styles.fullImage}
//               resizeMode="contain"
//             />
//           </View>
//         </Modal>

//         {/* ================= PIN MODAL ================= */}
//         <Modal
//           transparent
//           visible={showPinModal}
//           animationType="fade"
//           onRequestClose={() => setShowPinModal(false)}
//         >
//           <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
//           >
//             <Pressable style={styles.pinOverlay} onPress={() => setShowPinModal(false)}>
//               <Pressable style={styles.pinSheet} onPress={() => { }}>
//                 <ScrollView
//                   keyboardShouldPersistTaps="handled"
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={{ paddingBottom: 10 }}
//                 >
//                   <View style={styles.pinHeader}>
//                     <Text style={styles.pinTitle}>Pin a message</Text>
//                     <TouchableOpacity
//                       onPress={() => setShowPinModal(false)}
//                       style={styles.pinCloseBtn}
//                       activeOpacity={0.85}
//                     >
//                       <Ionicons name="close" size={20} color={theme.text} />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.pinList}>
//                     <Text style={styles.pinLabel}>رسالة التثبيت</Text>

//                     <View style={styles.pinInputWrap}>
//                       <Ionicons name="text-outline" size={18} color={theme.icon} />
//                       <TextInput
//                         style={styles.pinInput}
//                         placeholder="اكتب رسالة التثبيت (تقبل HTML مثل <b>...</b> و <br /> )"
//                         placeholderTextColor={theme.subtleText}
//                         value={pinHtml}
//                         onChangeText={setPinHtml}
//                         multiline
//                         textAlignVertical="top"
//                       />
//                     </View>

//                     {!!pinHtml.trim() && (
//                       <View style={styles.pinPreviewBox}>
//                         <Text style={styles.pinPreviewTitle}>معاينة</Text>

//                         <PinnedHtmlWebView
//                           html={pinHtml}
//                           width={width - 60}
//                           minHeight={36}
//                           textColor={theme.text}
//                           textAlign="center"
//                           fontSize={15}
//                           lineHeight={26}
//                         />
//                       </View>
//                     )}
//                   </View>

//                   <View style={styles.pinActions}>
//                     <TouchableOpacity
//                       style={[styles.pinBtn, styles.pinBtnCancel]}
//                       onPress={() => setShowPinModal(false)}
//                       activeOpacity={0.85}
//                     >
//                       <Text style={styles.pinBtnCancelText}>Cancel</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[styles.pinBtn, !pinHtml.trim() && styles.pinBtnDisabled]}
//                       disabled={!pinHtml.trim()}
//                       activeOpacity={0.85}
//                       onPress={async () => {
//                         try {
//                           const content = pinHtml.trim();
//                           if (!content) return;

//                           const created = await dispatch(
//                             sendRoomMessage({ roomId, content, type: "announcement" })
//                           ).unwrap();

//                           const messageId = created?.message?._id;

//                           if (!messageId) {
//                             Alert.alert("Error", "لم يتم الحصول على id للرسالة الجديدة.");
//                             return;
//                           }

//                           await dispatch(
//                             pinRoomMessage({ roomId, messageId, pinned: true })
//                           ).unwrap();

//                           setShowPinModal(false);
//                           setPinHtml("");
//                           Alert.alert("Done", "تم إرسال الرسالة وتثبيتها");
//                         } catch (e: any) {
//                           Alert.alert("Error", e?.message || "Pin failed");
//                         }
//                       }}
//                     >
//                       <Ionicons name="pin" size={16} color={theme.primaryText} />
//                       <Text style={styles.pinBtnText}>Pin</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </ScrollView>
//               </Pressable>
//             </Pressable>
//           </KeyboardAvoidingView>
//         </Modal>

//         {/* ================= PIN PREVIEW FULL ================= */}
//         <Modal transparent visible={pinPreviewFull} animationType="fade" onRequestClose={() => setPinPreviewFull(false)}>
//           <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
//             <Pressable style={styles.fullBox} onPress={() => { }}>
//               <View style={styles.fullHeader}>
//                 <Text style={styles.fullTitle}>Pinned message</Text>

//                 {latestPinned && canModerate && (
//                   <TouchableOpacity onPress={() => unpinMessage(latestPinned.id)} activeOpacity={0.85}>
//                     <Text style={{ color: theme.danger, fontWeight: "900" }}>Unpin</Text>
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity onPress={() => setPinPreviewFull(false)} activeOpacity={0.85}>
//                   <Ionicons name="close" size={20} color={theme.text} />
//                 </TouchableOpacity>
//               </View>

//               {(() => {
//                 const msg = latestPinned;
//                 const raw = msg?.text || "";
//                 return (
//                   <>
//                     <Text style={styles.fullMeta}>
//                       {msg?.sender?.name ? `${msg.sender.name} • ` : ""}
//                       {msg?.time || ""}
//                     </Text>

//                     <PinnedHtmlWebView
//                       html={raw}
//                       width={width - 56}
//                       minHeight={36}
//                       textColor={theme.text}
//                       textAlign="center"
//                       fontSize={16}
//                       lineHeight={30}
//                     />
//                   </>
//                 );
//               })()}
//             </Pressable>
//           </Pressable>
//         </Modal>

//         {/* ================= GIFT FULLSCREEN OVERLAY ================= */}
//         {String(giftOverlay.giftKey || "").startsWith("boost") ? (
//           <BoostLottieOverlay
//             visible={giftOverlay.visible}
//             title="🚀 Room Boosted!"
//             subtitle={`${giftOverlay.fromName || "Someone"} boosted the room`}
//             onDone={() => {
//               if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
//               setGiftOverlay({
//                 visible: false,
//                 messageId: null,
//                 giftKey: null,
//                 icon: "🎁",
//                 count: 45,
//                 lottie: undefined,
//                 fromName: undefined,
//                 toName: undefined,
//               });
//             }}
//           />
//         ) : giftOverlay.lottie ? (
//           <GiftLottieOverlay
//             visible={giftOverlay.visible}
//             source={giftOverlay.lottie}
//             fromName={giftOverlay.fromName}
//             toName={giftOverlay.toName}
//             durationMs={2600}
//             onDone={() => {
//               if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
//               setGiftOverlay({
//                 visible: false,
//                 messageId: null,
//                 giftKey: null,
//                 icon: "🎁",
//                 count: 45,
//                 lottie: undefined,
//                 fromName: undefined,
//                 toName: undefined,
//               });
//             }}
//           />
//         ) : (
//           <GiftBurstOverlay
//             visible={giftOverlay.visible}
//             icon={giftOverlay.icon}
//             count={giftOverlay.count}
//             fromName={giftOverlay.fromName}
//             toName={giftOverlay.toName}
//             durationMs={2600}
//             onDone={() => {
//               if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
//               setGiftOverlay({
//                 visible: false,
//                 messageId: null,
//                 giftKey: null,
//                 icon: "🎁",
//                 count: 45,
//                 lottie: undefined,
//                 fromName: undefined,
//                 toName: undefined,
//               });
//             }}
//           />
//         )}

//         {/* ================= GIFT PICKER ================= */}
//         <GiftPickerModal
//           visible={giftPicker.visible}
//           target={giftPicker.target}
//           onClose={() => setGiftPicker({ visible: false, target: null })}
//           theme={theme}
//           onPick={async (g) => {
//             try {
//               const target = giftPicker.target;
//               setGiftPicker({ visible: false, target: null });

//               if (!roomId) return;

//               const isBoost = String(g.key || "").startsWith("boost");

//               if (!isBoost && !target?.id) {
//                 Alert.alert("Error", "Target user not found");
//                 return;
//               }

//               const tempGift = TEMP_GIFTS.find((x) => x.key === g.key);
//               const giftPrice = Number(tempGift?.price || 0);

//               if (myCoinz < giftPrice) {
//                 Alert.alert(
//                   "رصيد غير كافٍ",
//                   `هذه الهدية تحتاج ${giftPrice} Coinz، بينما رصيدك الحالي ${myCoinz} Coinz.`,
//                   [
//                     { text: "إلغاء", style: "cancel" },
//                     {
//                       text: "الذهاب إلى المتجر",
//                       onPress: () => router.push("/store")
//                     }
//                   ]
//                 );
//                 return;
//               }

//               if (giftPrice > 0) {
//                 const debitRes = await dispatch(
//                   debitMyCoinz({
//                     amount: giftPrice,
//                     reason: `gift:${g.key}`
//                   }) as any
//                 );

//                 if (!debitMyCoinz.fulfilled.match(debitRes)) {
//                   Alert.alert(
//                     "تعذر الخصم",
//                     String((debitRes as any)?.payload || "فشل خصم الرصيد")
//                   );
//                   await dispatch(getMyInventory() as any);
//                   return;
//                 }

//                 await dispatch(getMyInventory() as any);
//               }

//               const meta = GIFT_META[g.key] || { icon: "🎁", count: 45, lottie: undefined };

//               await dispatch(
//                 sendRoomMessage({
//                   roomId,
//                   type: "gift",
//                   content: g.key,
//                   gift: {
//                     key: g.key,
//                     icon: meta.icon,
//                     targetId: isBoost ? undefined : target!.id,
//                     targetName: isBoost ? undefined : target!.name,
//                     count: meta.count
//                   }
//                 } as any)
//               ).unwrap();

//               const toLabel = isBoost ? "Room" : target?.name || "Someone";
//               const announce = `🎁 <b>${myName}</b> sent ${meta.icon} to <b>${toLabel}</b>`;

//               await dispatch(
//                 sendRoomMessage({
//                   roomId,
//                   content: announce,
//                   type: "announcement"
//                 })
//               ).unwrap();

//               await dispatch(getMyInventory() as any);
//             } catch (e: any) {
//               Alert.alert("Error", e?.message || "Failed to send gift");
//               await dispatch(getMyInventory() as any);
//             }
//           }}
//         />
//       </SafeAreaView>

//       <ActiveRoomsDrawer
//         visible={showActiveRoomsDrawer}
//         onClose={() => setShowActiveRoomsDrawer(false)}
//         currentRoomId={roomId}
//         theme={theme}
//       />
//       <ReactionDetailsModal
//         visible={showReactionDetails}
//         message={reactionDetailsMessage}
//         onClose={closeReactionDetails}
//         theme={theme}
//       />
//       <StickerPickerModal
//         visible={showStickerPicker}
//         onClose={() => setShowStickerPicker(false)}
//         onPick={sendSticker}
//         theme={theme}
//       />
//       <MediaPickerModal
//         visible={showMediaPicker}
//         onClose={() => setShowMediaPicker(false)}
//         onPickImage={sendImage}
//         onPickGif={sendGifFromDevice}
//         onPickSticker={() => setShowStickerPicker(true)}
//         theme={theme}
//       />

//       <UploadingOverlay
//         visible={uploading.visible}
//         title={uploading.title}
//         sub={uploading.sub}
//         seconds={uploadSeconds}
//         previewUri={uploading.previewUri}
//         kind={uploading.kind}
//         theme={theme}
//       />
//     </View >
//   );
// }

// /* ================= STYLES FACTORIES ================= */
// function makeBubbleStyles(theme: typeof Colors.light) {
//   return StyleSheet.create({
//     row: {
//       flexDirection: "row",
//       marginBottom: 5,
//       alignItems: "flex-start", // 👈 هذا هو الحل
//     },
//     avatarSpacerLeft: {
//       width: 48,
//       height: 20,
//       marginRight: 8,
//       flexShrink: 0,
//     },

//     avatarSpacerRight: {
//       width: 48,
//       height: 20,
//       marginLeft: 8,
//       flexShrink: 0,
//     },

//     rowOther: {
//       justifyContent: "flex-start",
//     },

//     rowMe: {
//       justifyContent: "flex-end",
//     },

//     avatar: {
//       width: 48,
//       height: 48,
//       borderRadius: 24,
//       backgroundColor: theme.surface2,
//     },

//     avatarWrapLeft: {
//       width: 48,
//       height: 48,
//       marginRight: 8,
//       position: "relative",
//       flexShrink: 0,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     avatarWrapRight: {
//       width: 48,
//       height: 48,
//       marginLeft: 8,
//       position: "relative",
//       flexShrink: 0,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     bubble: {
//       maxWidth: "78%",
//       borderRadius: 14,
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       // borderWidth: 1,
//       // borderColor: theme.border,
//       backgroundColor: theme.surface,
//       flexShrink: 1,
//     },

//     bubbleOther: {
//       borderTopLeftRadius: 6,
//     },

//     bubbleMe: {
//       borderTopRightRadius: 6,
//     },
//     avatarStarLeft: {
//       position: "absolute",
//       top: -6,
//       left: -2,
//       fontSize: 14,
//       fontWeight: "900",
//       textShadowColor: "rgba(0,0,0,0.25)",
//       textShadowOffset: { width: 0, height: 1 },
//       textShadowRadius: 2
//     },
//     stickerMedia: {
//       width: 190,
//       height: 190,
//       maxWidth: 220,
//       borderRadius: 18,
//       backgroundColor: "transparent",
//       marginTop: 6,
//     },
//     avatarStarRight: {
//       position: "absolute",
//       top: -6,
//       right: -2,
//       fontSize: 14,
//       fontWeight: "900",
//       textShadowColor: "rgba(0,0,0,0.25)",
//       textShadowOffset: { width: 0, height: 1 },
//       textShadowRadius: 2
//     },



//     msgText: { fontSize: 15, color: theme.text, lineHeight: 20 },
//     msgTextMuted: { fontSize: 14, color: theme.mutedText },

//     nameWrap: { marginBottom: 6 },
//     nameRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       maxWidth: "100%",
//     },
//     senderName: {
//       fontWeight: "800",
//       flexShrink: 1,
//       flexWrap: "wrap",
//     },
//     // senderName: {  
//     //   fontWeight: "bold",
//     //   fontSize: 13,
//     //   maxWidth: "85%",
//     //   marginRight: 4,
//     //   marginLeft: 4
//     // },
//     nameUnderline: { marginTop: 4, height: 1, backgroundColor: theme.separator, width: "100%" },

//     media: { width: 220, height: 220, borderRadius: 12, marginTop: 4 },
//     videoWrapper: { width: 240, height: 170, borderRadius: 12, overflow: "hidden", backgroundColor: "#000", marginTop: 6 },
//     video: { width: "100%", height: "100%" },

//     fileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
//     fileIcon: { fontSize: 18 },
//     fileName: { maxWidth: 200, fontSize: 14, color: theme.text },

//     replyBox: {
//       borderLeftWidth: 3,
//       borderLeftColor: theme.primary,
//       backgroundColor: theme.surface2,
//       paddingVertical: 8,
//       paddingHorizontal: 10,
//       borderRadius: 12,
//       marginBottom: 8
//     },
//     replyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
//     replyName: { fontSize: 12, fontWeight: "900", color: theme.text, maxWidth: "78%" },
//     replyTag: { fontSize: 11, fontWeight: "800", color: theme.mutedText },
//     replyText: { fontSize: 12, color: theme.mutedText, lineHeight: 16 },

//     reactionOutside: {
//       position: "absolute",
//       bottom: -13,
//       minWidth: 30,
//       height: 24,
//       borderRadius: 999,
//       paddingHorizontal: 8,
//       backgroundColor: theme.card,
//       borderWidth: 1,
//       borderColor: theme.border,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       shadowColor: "#000",
//       shadowOpacity: 0.12,
//       shadowRadius: 6,
//       shadowOffset: { width: 0, height: 2 },
//       elevation: 4,
//       zIndex: 20,
//     },

//     reactionOutsideMe: {
//       right: 54,
//     },

//     reactionOutsideOther: {
//       left: 54,
//     },

//     reactionEmoji: {
//       fontSize: 14,
//       marginRight: 4,
//     },

//     reactionCount: {
//       fontSize: 11,
//       fontWeight: "900",
//       color: theme.text,
//     },


//     sysWrap: {
//       width: "100%",
//       alignItems: "center",
//       marginVertical: 6,
//     },

//     sysBubble: {
//       backgroundColor: theme.primarySoft,
//       borderColor: theme.border,
//       borderWidth: 1,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 14,
//     },

//     // ✅ خاص برسائل نجاح/فشل المنشن فقط
//     privateMentionBubble: {
//       maxWidth: "88%",
//       minHeight: 34,
//       paddingHorizontal: 12,
//       paddingVertical: 7,
//       borderRadius: 999,
//       borderWidth: 1,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     privateMentionText: {
//       flexShrink: 1,
//       fontSize: 13,
//       fontWeight: "800",
//       lineHeight: 18,
//       writingDirection: "ltr",
//       textAlign: "left",
//     },

//     sysTime: {
//       fontSize: 11,
//       color: theme.mutedText,
//       textAlign: "center",
//       marginTop: 4,
//     },
//   });
// }

// function makeUsersStyles(theme: typeof Colors.light) {
//   return StyleSheet.create({
//     overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
//     usersModalAvatar: {
//       width: 34,
//       height: 34,
//       borderRadius: 17,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     sheet: {
//       backgroundColor: theme.card,
//       borderTopLeftRadius: 18,
//       borderTopRightRadius: 18,
//       paddingHorizontal: 14,
//       paddingTop: 14,
//       paddingBottom: 18,
//       maxHeight: "80%",
//       borderTopWidth: 1,
//       borderColor: theme.border
//     },
//     header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//     title: { fontSize: 16, fontWeight: "900", color: theme.text },
//     closeBtn: {
//       width: 36,
//       height: 36,
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border
//     },
//     note: { marginTop: 10, backgroundColor: theme.cardAlt, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
//     noteText: { fontSize: 12, color: theme.mutedText, lineHeight: 18 },
//     list: { marginTop: 12, gap: 10 },


//     avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surface2 },
//     row: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingVertical: 1,
//       paddingHorizontal: 0,
//       marginVertical: 0,
//     },

//     centerContent: {
//       flex: 1,
//       minWidth: 0,
//       marginLeft: 10,
//     },

//     name: {
//       fontSize: 15,
//       fontWeight: "700",
//       flexShrink: 1,
//     },

//     inlineBadges: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 2,
//       minHeight: 18,
//     },

//     trailingActions: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "flex-end",
//       marginLeft: 8,
//     },

//     iconBtn: {
//       width: 32,
//       height: 32,
//       alignItems: "center",
//       justifyContent: "center",
//       marginLeft: 4,
//     },



//     sub: { fontSize: 12, color: theme.mutedText, marginTop: 2 },

//     badge: { backgroundColor: theme.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.border },
//     badgeText: { fontSize: 11, color: theme.primary, fontWeight: "900" },

//     rolesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
//     roleChip: { borderWidth: 1, borderColor: theme.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.surface2 },
//     roleChipActive: { backgroundColor: theme.primarySoft, borderColor: theme.primary },
//     roleChipText: { fontSize: 12, fontWeight: "800", color: theme.mutedText },
//     roleChipTextActive: { color: theme.primary },


//     actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
//     kickBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(245, 158, 11, 0.16)", borderWidth: 1, borderColor: theme.warning },
//     kickText: { fontWeight: "900", color: theme.warning },
//     banBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(239, 68, 68, 0.14)", borderWidth: 1, borderColor: theme.danger },
//     banText: { fontWeight: "900", color: theme.danger }
//   });
// }

// function makeScreenStyles(
//   theme: typeof Colors.light,
//   topInset: number,
//   bottomInset: number
// ) {
//   return StyleSheet.create({
//     root: {
//       flex: 1,
//       backgroundColor: theme.backgroundChat,
//     },

//     contentSafe: {
//       flex: 1,
//       backgroundColor: theme.backgroundChat,
//     },
//     stickerMedia: {
//       width: 150,
//       height: 150,
//       borderRadius: 14,
//       backgroundColor: "transparent",
//       marginTop: 6,
//     },
//     header: {
//       height: 54 + topInset,
//       paddingTop: topInset,
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingHorizontal: 12,
//       borderBottomWidth: 1,
//       borderColor: theme.separator,
//       backgroundColor: theme.card,
//     },

//     headerLeft: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       flex: 1,
//       minWidth: 0,
//     },

//     headerRight: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "flex-end",
//       gap: 8,
//     },

//     headerIconBtn: {
//       width: 32,
//       height: 32,
//       borderRadius: 16,
//       alignItems: "center",
//       justifyContent: "center",
//       marginTop: -1,
//     },
//     roomAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.surface2 },
//     roomName: { fontSize: 16, fontWeight: "900", color: theme.text },
//     roomMeta: { fontSize: 12, color: theme.mutedText },
//     voiceInlineRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       flexWrap: "wrap",
//     },

//     voiceInlineText: {
//       fontSize: 14,
//       color: theme.text,
//       fontWeight: "500",
//     },

//     voiceInlinePlay: {
//       fontSize: 14,
//       color: "#2563EB",
//       fontWeight: "800",
//     },

//     audioModalOverlay: {
//       flex: 1,
//       backgroundColor: "rgba(0,0,0,0.18)",
//       justifyContent: "flex-start",
//     },

//     audioModalCard: {
//       marginTop: 88,
//       marginHorizontal: 12,
//       backgroundColor: theme.card,
//       borderRadius: 16,
//       borderWidth: 1,
//       borderColor: theme.border,
//       paddingHorizontal: 12,
//       paddingVertical: 12,
//       shadowColor: "#000",
//       shadowOpacity: 0.08,
//       shadowRadius: 8,
//       shadowOffset: { width: 0, height: 3 },
//       elevation: 6,
//     },

//     audioModalHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//     },

//     audioModalTitle: {
//       fontSize: 15,
//       fontWeight: "900",
//       color: theme.text,
//     },

//     audioModalSender: {
//       marginTop: 4,
//       fontSize: 12,
//       color: theme.mutedText,
//       fontWeight: "600",
//     },
//     pinnedBar: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//       backgroundColor: "rgba(0,0,0,0.0)", // 👈 شفاف
//       borderBottomWidth: 1,
//       borderColor: theme.separator,
//       paddingHorizontal: 12,
//       paddingVertical: 10
//     },
//     pinnedLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
//     pinnedTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
//     pinnedText: { fontSize: 13, fontWeight: "700", color: theme.mutedText },
//     pinnedMeta: { marginTop: 2, fontSize: 11, color: theme.subtleText },

//     inputBar: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       paddingHorizontal: 10,
//       paddingTop: 10,
//       paddingBottom: 10 + Math.max(0, bottomInset * 0.2),
//       backgroundColor: theme.card
//     },

//     inputBarWrap: {
//       borderTopWidth: 1,
//       borderColor: theme.separator,
//       backgroundColor: theme.card
//     },
//     input: {
//       flex: 1,
//       backgroundColor: theme.surface2,
//       borderRadius: 20,
//       paddingHorizontal: 14,
//       paddingVertical: 8,
//       maxHeight: 120,
//       color: theme.text,
//       borderWidth: 1,
//       borderColor: theme.border
//     },

//     replyPreview: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       padding: 10,
//       backgroundColor: theme.cardAlt,
//       borderTopWidth: 1,
//       borderColor: theme.separator
//     },



//     actionsOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
//     actionsBox: { backgroundColor: theme.card, width: "80%", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
//     reactionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
//     action: { fontSize: 16, paddingVertical: 10, fontWeight: "800", color: theme.text },
//     cancel: { textAlign: "center", marginTop: 8, color: theme.mutedText, fontWeight: "800" },

//     imagePreviewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
//     fullImage: { width: "100%", height: "100%" },
//     imagePreviewClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },

//     menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.12)" },
//     menuBox: {
//       position: "absolute",
//       top: 60,
//       right: 12,
//       width: 200,
//       backgroundColor: theme.card,
//       borderRadius: 12,
//       paddingVertical: 8,
//       borderWidth: 1,
//       borderColor: theme.border,
//       shadowColor: "#000",
//       shadowOpacity: 0.12,
//       shadowRadius: 10,
//       elevation: 6
//     },
//     menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
//     menuText: { fontSize: 14, color: theme.text, fontWeight: "900" },
//     menuDivider: { height: 1, backgroundColor: theme.separator, marginVertical: 6 },
//     fixedReplyLayer: {
//       position: "absolute",
//       top: 8,
//       left: 0,
//       right: 0,
//       zIndex: 950,
//       elevation: 950,
//       alignItems: "center",
//       pointerEvents: "box-none",
//     },

//     fixedReplyCard: {
//       width: "92%",
//       minHeight: 52,
//       borderRadius: 16,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       backgroundColor: theme.card,
//       borderWidth: 1,
//       borderColor: theme.border,
//       flexDirection: "row",
//       alignItems: "center",
//       shadowColor: "#000",
//       shadowOpacity: 0.12,
//       shadowRadius: 12,
//       shadowOffset: { width: 0, height: 5 },
//       elevation: 7,
//     },

//     fixedReplyIcon: {
//       width: 30,
//       height: 30,
//       borderRadius: 15,
//       backgroundColor: theme.primary,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: 8,
//     },

//     fixedReplyTitle: {
//       color: theme.text,
//       fontSize: 12,
//       fontWeight: "900",
//     },

//     fixedReplyText: {
//       marginTop: 2,
//       color: theme.mutedText,
//       fontSize: 12,
//       fontWeight: "700",
//     },

//     fixedReplyClose: {
//       width: 30,
//       height: 30,
//       borderRadius: 15,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       marginLeft: 8,
//     },
//     globalAudioPlayer: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 12,
//       paddingVertical: 10,
//       backgroundColor: theme.card,
//       borderBottomWidth: 1,
//       borderColor: theme.separator
//     },
//     audioIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
//     audioCenter: { flex: 1 },
//     audioNow: { fontSize: 12, color: theme.text, fontWeight: "900", marginBottom: 6 },
//     globalProgressBg: { width: "100%", height: 3, backgroundColor: theme.separator, borderRadius: 2, overflow: "hidden" },
//     globalProgressFill: { height: "100%", backgroundColor: theme.primary },
//     audioTimes: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
//     timeText: { fontSize: 11, color: theme.mutedText },

//     pinOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
//     pinSheet: {
//       backgroundColor: theme.card,
//       borderTopLeftRadius: 18,
//       borderTopRightRadius: 18,
//       paddingHorizontal: 14,
//       paddingTop: 12,
//       paddingBottom: 14,
//       maxHeight: "80%",
//       borderTopWidth: 1,
//       borderColor: theme.border
//     },
//     pinHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//     pinTitle: { fontSize: 16, fontWeight: "900", color: theme.text },
//     pinCloseBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },

//     pinList: { marginTop: 12 },
//     pinLabel: { marginTop: 6, fontSize: 12, fontWeight: "900", color: theme.text },

//     pinInputWrap: {
//       marginTop: 8,
//       flexDirection: "row",
//       gap: 10,
//       alignItems: "flex-start",
//       paddingHorizontal: 12,
//       paddingVertical: 10,
//       borderRadius: 14,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.surface2
//     },
//     inviteModalBox: {
//       marginHorizontal: 20,
//       marginTop: "45%",
//       backgroundColor: theme.card,
//       borderRadius: 18,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 16,
//     },

//     inviteModalHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     },

//     inviteModalTitle: {
//       fontSize: 16,
//       fontWeight: "900",
//       color: theme.text,
//     },

//     inviteModalCloseBtn: {
//       width: 34,
//       height: 34,
//       borderRadius: 12,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     inviteModalHint: {
//       fontSize: 13,
//       color: theme.mutedText,
//       marginBottom: 12,
//       lineHeight: 20,
//     },

//     inviteInputWrap: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.surface2,
//       borderRadius: 14,
//       paddingHorizontal: 12,
//       minHeight: 48,
//     },

//     inviteInput: {
//       flex: 1,
//       color: theme.text,
//       fontSize: 14,
//       fontWeight: "600",
//       paddingVertical: 10,
//     },

//     inviteActionsRow: {
//       flexDirection: "row",
//       gap: 10,
//       marginTop: 14,
//     },
//     fixedAudioLayer: {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       right: 0,
//       zIndex: 999,
//       elevation: 999,
//       alignItems: "center",
//       pointerEvents: "box-none",
//     },

//     fixedAudioCard: {
//       width: "92%",
//       borderRadius: 18,
//       paddingHorizontal: 12,
//       paddingVertical: 10,
//       backgroundColor: theme.card,
//       borderWidth: 1,
//       borderColor: theme.border,
//       shadowColor: "#000",
//       shadowOpacity: 0.14,
//       shadowRadius: 14,
//       shadowOffset: { width: 0, height: 6 },
//       elevation: 8,
//     },

//     fixedAudioHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: 8,
//     },

//     fixedAudioIcon: {
//       width: 28,
//       height: 28,
//       borderRadius: 14,
//       backgroundColor: theme.primary,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: 8,
//     },

//     fixedAudioTitle: {
//       flex: 1,
//       color: theme.text,
//       fontSize: 13,
//       fontWeight: "900",
//     },

//     fixedAudioClose: {
//       width: 30,
//       height: 30,
//       borderRadius: 15,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//     },

//     fixedAudioPlayer: {
//       width: "100%",
//     },

//     inviteCancelBtn: {
//       flex: 1,
//       height: 44,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: theme.border,
//       backgroundColor: theme.surface2,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     inviteCancelText: {
//       color: theme.text,
//       fontSize: 14,
//       fontWeight: "800",
//     },

//     inviteSendBtn: {
//       flex: 1,
//       height: 44,
//       borderRadius: 12,
//       backgroundColor: theme.primary,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     inviteSendText: {
//       color: theme.primaryText,
//       fontSize: 14,
//       fontWeight: "800",
//     },
//     pinInput: { flex: 1, minHeight: 110, maxHeight: 180, fontSize: 13, color: theme.text, lineHeight: 18 },

//     pinPreviewBox: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.border },
//     pinPreviewTitle: { fontSize: 12, fontWeight: "900", color: theme.text },

//     pinActions: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
//     pinBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: theme.primary },
//     pinBtnText: { color: theme.primaryText, fontWeight: "900" },
//     pinBtnCancel: { backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },
//     pinBtnCancelText: { color: theme.text, fontWeight: "900" },
//     pinBtnDisabled: { opacity: 0.5 },

//     fullOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 },
//     fullBox: { width: "100%", maxHeight: "70%", backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border },
//     fullHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
//     fullTitle: { fontSize: 14, fontWeight: "900", color: theme.text },
//     fullMeta: { fontSize: 12, color: theme.mutedText, marginBottom: 10, fontWeight: "800" }
//   });
// }

import { getMyInventory, selectMyStore } from "@/redux/slices/storeControl.slice";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    ImageSourcePropType,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import BoostLottieOverlay from "@/components/BoostLottieOverlay";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";
import ActiveRoomsDrawer from "@/components/room/ActiveRoomsDrawer";
import { stripHtmlToText } from "@/components/stripHtmlToText";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { searchUsers } from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import {
    clearBannedFlag,
    clearKickedFlag,
    fetchRoomMessages,
    fetchRoomsByType,
    fetchRoomStats,
    fetchRoomUsers,
    inviteToRoom,
    leaveRoomAndExit,
    optimisticAddRoomMessage,
    pinRoomMessage,
    selectBannedFlag,
    selectKickedFlag,
    selectRoomActiveCount,
    selectRoomAvatarById,
    selectRoomLoadingMessages,
    selectRoomMessages,
    selectRoomNameById,
    selectRoomUsers,
    sendBombColorAnswer,
    sendRoomMessage,
    socketRoleSetFailed,
    socketRoleSetRequested,
    socketRoleSetSucceeded,
} from "@/redux/slices/room.slice";
import { boostRoom } from "@/redux/slices/roomControl.slice";
import { debitMyCoinz } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import api from "@/services/api";
import {
    banRoomUserSocket,
    deleteRoomSocketMessage,
    joinRoomSocket,
    kickRoomUserSocket,
    setRoomUserRoleSocket,
    toggleRoomReaction as toggleRoomReactionSocket,
} from "@/services/socket";
import { uploadToCloudinary } from "@/services/upload.service";
import {
    addManySeenGiftIds,
    addSeenGiftId,
    getSeenGiftIds,
} from "@/storage/roomGiftSeen";

import GiftBurstOverlay from "@/components/roomScreen/GiftBurstOverlay";
import GiftLottieOverlay from "@/components/roomScreen/GiftLottieOverlay";
import GiftPickerModal from "@/components/roomScreen/GiftPickerModal";
import MediaPickerModal from "@/components/roomScreen/MediaPickerModal";
import MessageItem from "@/components/roomScreen/MessageItem";
import PinnedHtmlWebView from "@/components/roomScreen/PinnedHtmlWebView";
import ReactionDetailsModal from "@/components/roomScreen/ReactionDetailsModal";
import StickerPickerModal from "@/components/roomScreen/StickerPickerModal";
import UploadingOverlay from "@/components/roomScreen/UploadingOverlay";
import UsersModal from "@/components/roomScreen/UsersModal";
import { buildActiveBadgesFromUser } from "@/components/roomScreen/badgeHelpers";
import { REACTIONS } from "@/components/roomScreen/constants";
import { GIFT_META, TEMP_GIFTS } from "@/components/roomScreen/giftHelpers";
import { makeBubbleStyles } from "@/components/roomScreen/styles/bubbleStyles";
import { makeScreenStyles } from "@/components/roomScreen/styles/roomStyles";
import { MessageUI, Reaction, RoomRole, UserBadgeUI, UserUI } from "@/components/roomScreen/types";
import { StickerItem } from "@/data/roomStickers";

const normalizeMessageReactions = (m: any) => {
  const raw = Array.isArray(m?.reactions)
    ? m.reactions
    : Array.isArray(m?.reactionUsers)
      ? m.reactionUsers
      : Array.isArray(m?.meta?.reactions)
        ? m.meta.reactions
        : [];

  const reactions = raw
    .map((r: any) => {
      const emoji = String(r?.emoji || r?.reaction || "").trim() as Reaction;

      const userObj =
        r?.user && typeof r.user === "object"
          ? r.user
          : r?.sender && typeof r.sender === "object"
            ? r.sender
            : r?.createdBy && typeof r.createdBy === "object"
              ? r.createdBy
              : r?.userSnapshot && typeof r.userSnapshot === "object"
                ? r.userSnapshot
                : null;

      const userId = String(
        r?.userId ||
        r?.senderId ||
        (typeof r?.user === "string" ? r.user : "") ||
        userObj?._id ||
        userObj?.id ||
        ""
      ).trim();

      const username = String(
        r?.username ||
        r?.name ||
        r?.displayName ||
        userObj?.username ||
        userObj?.name ||
        userObj?.displayName ||
        userObj?.atUsername ||
        "مستخدم"
      ).trim();

      const avatar = String(r?.avatar || userObj?.avatar || "").trim();

      const avatarGif = String(
        r?.avatarGif ||
        userObj?.avatarGif ||
        userObj?.activeCustomization?.avatarGif ||
        ""
      ).trim();

      if (!emoji || !REACTIONS.includes(emoji)) return null;

      return {
        emoji,
        userId,
        username,
        avatar,
        avatarGif,
      };
    })
    .filter(Boolean) as {
      emoji: Reaction;
      userId: string;
      username: string;
      avatar?: string;
      avatarGif?: string;
    }[];

  const fallbackEmoji = String(
    m?.reaction || m?.myReaction || m?.meta?.reaction || ""
  ).trim() as Reaction;

  if (!reactions.length && fallbackEmoji && REACTIONS.includes(fallbackEmoji)) {
    return {
      reactions: [],
      firstReactionEmoji: fallbackEmoji,
      reactionCount: Number(m?.reactionCount || m?.reactionsCount || 1),
    };
  }

  const firstReactionEmoji = reactions[0]?.emoji;
  const reactionCount =
    reactions.length || Number(m?.reactionCount || m?.reactionsCount || 0);

  return {
    reactions,
    firstReactionEmoji,
    reactionCount,
  };
};

/* ================= MAIN SCREEN ================= */
export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const seenGiftIdsRef = useRef<Set<string>>(new Set());
  const didInitSeenGiftsRef = useRef(false);
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();
  const [showAudioModal, setShowAudioModal] = useState(false);
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const styles = useMemo(
    () => makeScreenStyles(theme, insets.top, insets.bottom),
    [theme, insets.top, insets.bottom]
  );

  const bubbleStyles = useMemo(() => makeBubbleStyles(theme), [theme]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id || "");

  const flatListRef = useRef<any>(null);
  const keyboardHeight = useSharedValue(0);
  const [inputBarHeight, setInputBarHeight] = useState(0);
const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        keyboardHeight.value = Math.max(0, e.height);
      },
      onEnd: (e) => {
        "worklet";
        keyboardHeight.value = Math.max(0, e.height);
      },
    },
    []
  );
  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -keyboardHeight.value,
        },
      ],
    };
  });

  const listSpacerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: keyboardHeight.value,
    };
  });
  const authUser = useAppSelector((state) => state.auth.user);
  const myUserId = String((authUser as any)?._id || (authUser as any)?.id || "");
  const myName = String((authUser as any)?.username || (authUser as any)?.name || "Me");
  const myAvatar = String(
    (authUser as any)?.avatar ||
    "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg"
  );
  const myStore = useAppSelector(selectMyStore);
  const myInventory = Array.isArray(myStore?.inventory)
    ? myStore.inventory
    : [];
  const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
  const loadingMessages = useAppSelector(selectRoomLoadingMessages);
  const roomUsers = useAppSelector((state) => selectRoomUsers(state, roomId));
  const roomName = useAppSelector((state) => selectRoomNameById(state, roomId));
  const roomAvatar = useAppSelector((state) => selectRoomAvatarById(state, roomId));
  const activeCount = useAppSelector((state) => selectRoomActiveCount(state, roomId));
  const showInitialMessagesSkeleton =
    loadingMessages && (!reduxMessages || reduxMessages.length === 0);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MessageUI | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pendingVoiceUri, setPendingVoiceUri] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [uploading, setUploading] = useState<{
    visible: boolean;
    title: string;
    sub?: string;
    startedAt?: number;
    previewUri?: string;
    kind?: "image" | "gif" | "sticker";
  }>({
    visible: false,
    title: "Uploading…",
    sub: undefined,
    startedAt: undefined,
    previewUri: undefined,
    kind: undefined,
  });
  useEffect(() => {
    if (!uploading.visible || !uploading.startedAt) {
      setUploadSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setUploadSeconds(
        Math.max(0, Math.floor((Date.now() - uploading.startedAt!) / 1000))
      );
    }, 500);

    return () => clearInterval(timer);
  }, [uploading.visible, uploading.startedAt]);
  const [uploadSeconds, setUploadSeconds] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showActiveRoomsDrawer, setShowActiveRoomsDrawer] = useState(false);
  const [selectedInviteUser, setSelectedInviteUser] = useState<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [activeAudio, setActiveAudio] = useState<MessageUI | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteSendingId, setInviteSendingId] = useState<string | null>(null);
  const { searchResults: inviteSearchResults, loading: inviteSearchLoading } =
    useAppSelector((state) => state.friends);
  const [previewImage, setPreviewImage] = useState<string | ImageSourcePropType | null>(null);
  const [reactionDetailsMessage, setReactionDetailsMessage] =
    useState<MessageUI | null>(null);

  const [showReactionDetails, setShowReactionDetails] = useState(false);

  const openReactionDetails = (message: MessageUI) => {
    setReactionDetailsMessage(message);
    setShowReactionDetails(true);
  };

  const closeReactionDetails = () => {
    setShowReactionDetails(false);
    setReactionDetailsMessage(null);
  };
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(null);
  const [pinnedHidden, setPinnedHidden] = useState(false);
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);

  const pinnedTranslateX = useRef(new Animated.Value(0)).current;
  const arrowTranslateX = useRef(new Animated.Value(40)).current; // يبدأ مخفي
  const [pinHtml, setPinHtml] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);

  const [pinPreviewFull, setPinPreviewFull] = useState(false);

  const [giftPicker, setGiftPicker] = useState<{ visible: boolean; target?: UserUI | null }>({ visible: false, target: null });

  const [giftDoneById, setGiftDoneById] = useState<Record<string, boolean>>({});
  const markGiftDone = (id: string) => setGiftDoneById((prev) => ({ ...prev, [id]: true }));
  const openAudioModal = (message: MessageUI) => {
    if (!message?.uri) return;
    setActiveAudio(message);
    setShowAudioModal(true);
  };
  const sendCricketJoin = async (gameId: string) => {
    try {
      const content = `!cricket join ${gameId}`;
      const clientId = `cricket_join_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content,
          type: "text",
        })
      ).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Join failed");
    }
  };
  const handleSendBombColorAnswer = async (
    color: "red" | "green" | "blue",
    challengeId?: string
  ) => {
    if (!roomId) return;

    try {
      await dispatch(
        sendBombColorAnswer({
          roomId,
          color,
          challengeId,
        }) as any
      );
    } catch (e: any) {
      Alert.alert(
        "Bomb",
        e?.message || "تعذر إرسال اختيار اللون"
      );
    }
  };
  const sendCricketPlay = async (gameId: string, n: number) => {
    try {
      const content = `!cricket play ${gameId} ${n}`;
      const clientId = `cricket_play_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content,
          type: "text",
        })
      ).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Play failed");
    }
  };
  const sendSongLove = async (songCode: string) => {
    try {
      const code = String(songCode || "").trim().toUpperCase();

      if (!code) {
        Alert.alert("Notice", "Song ID not found");
        return;
      }

      const content = `love@${code}`;
      const clientId = `song_love_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content,
          type: "text",
        })
      ).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Love failed");
    }
  };
  const [giftOverlay, setGiftOverlay] = useState<{
    visible: boolean;
    messageId: string | null;
    giftKey: string | null;
    icon: string;
    count: number;
    lottie?: any;
    fromName?: string;
    toName?: string;
  }>({
    visible: false,
    messageId: null,
    giftKey: null,
    icon: "🎁",
    count: 45,
    lottie: undefined,
    fromName: undefined,
    toName: undefined
  });
  const onAvatarPress = (u?: UserUI) => {
    const userId = String(u?.id || "").trim();
    if (!userId) return;

    router.push({
      pathname: "/profile/[id]",
      params: { id: userId },
    });
  };
  const handleInviteSearch = async () => {
    const q = String(inviteUsername || "").trim();
    if (!q) {
      Alert.alert("Notice", "Please enter a username");
      return;
    }

    try {
      setInviteLoading(true);
      setSelectedInviteUser(null);
      await dispatch(searchUsers(q)).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Search failed");
    } finally {
      setInviteLoading(false);
    }
  };
  // ✅ لمنع leave مرتين
  const didLeaveRef = useRef(false);
  const kicked = useAppSelector((state) => selectKickedFlag(state, roomId));
  const banned = useAppSelector((state) => selectBannedFlag(state, roomId));

  const myRole = useMemo<UserUI["role"]>(() => {
    const me = (roomUsers || []).find((u: any) => String(u?._id) === myUserId);
    return me?.role;
  }, [roomUsers, myUserId]);
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
    } catch (e: any) {
    } finally {
      setCreatingChatId(null);
    }
  };

  const canModerate = useMemo(() => myRole === "creator" || myRole === "owner" || myRole === "admin", [myRole]);
  type UsersMapValue = {
    username?: string;
    avatar?: string;
    avatarGif?: string;
    usernameColor?: string;
    messageTextColor?: string;
    role?: any;
    activeBadges?: UserBadgeUI[];
    customEmojiBadge?: {
      emoji?: string;
      isActive?: boolean;
      expiresAt?: string | null;
    } | null;
  };
  const usersMap = useMemo(() => {
    const map = new Map<string, UsersMapValue>();

    for (const u of roomUsers || []) {
      if (u?._id) {
        map.set(String(u._id), {
          username: u.username,
          avatar: u.avatar,
          avatarGif: u?.activeCustomization?.avatarGif || u?.avatarGif || "",
          usernameColor: u?.activeCustomization?.usernameColor || u?.usernameColor || "",
          messageTextColor: u?.activeCustomization?.messageTextColor || u?.messageTextColor || "",
          role: u.role,
          activeBadges:
            String(u?._id) === String(myUserId)
              ? buildActiveBadgesFromUser(u, myInventory)
              : buildActiveBadgesFromUser(u),
          customEmojiBadge:
            u?.customEmojiBadge && typeof u.customEmojiBadge === "object"
              ? {
                emoji: String(u.customEmojiBadge.emoji || ""),
                isActive: Boolean(u.customEmojiBadge.isActive),
                expiresAt: u.customEmojiBadge.expiresAt
                  ? String(u.customEmojiBadge.expiresAt)
                  : null
              }
              : null
        });
      }
    }

    if (myUserId) {
      const meInRoom = (roomUsers || []).find((u: any) => String(u?._id) === String(myUserId));

      map.set(myUserId, {
        username: myName,
        avatar: myAvatar,
        avatarGif:
          meInRoom?.activeCustomization?.avatarGif ||
          (authUser as any)?.activeCustomization?.avatarGif ||
          (authUser as any)?.avatarGif ||
          "",
        usernameColor:
          meInRoom?.activeCustomization?.usernameColor ||
          (authUser as any)?.activeCustomization?.usernameColor ||
          (authUser as any)?.usernameColor ||
          "",
        messageTextColor:
          meInRoom?.activeCustomization?.messageTextColor ||
          (authUser as any)?.activeCustomization?.messageTextColor ||
          (authUser as any)?.messageTextColor ||
          "",
        role: myRole,
        activeBadges: meInRoom ? buildActiveBadgesFromUser(meInRoom, myInventory) : [],
        customEmojiBadge:
          (authUser as any)?.customEmojiBadge && typeof (authUser as any).customEmojiBadge === "object"
            ? {
              emoji: String((authUser as any).customEmojiBadge.emoji || ""),
              isActive: Boolean((authUser as any).customEmojiBadge.isActive),
              expiresAt: (authUser as any).customEmojiBadge.expiresAt
                ? String((authUser as any).customEmojiBadge.expiresAt)
                : null
            }
            : null
      });
    }

    return map;
  }, [roomUsers, myUserId, myName, myAvatar, myRole, authUser, myInventory]);
  useEffect(() => {
    let mounted = true;

    const loadSeenGiftIds = async () => {
      if (!myUserId || !roomId) return;

      const storedIds = await getSeenGiftIds(myUserId, roomId);
      if (!mounted) return;

      seenGiftIdsRef.current = new Set(storedIds);
      didInitSeenGiftsRef.current = true;
    };

    loadSeenGiftIds();

    return () => {
      mounted = false;
    };
  }, [myUserId, roomId]);

  const resolveUserNameById = (id?: string) => {
    if (!id) return "";
    const v = usersMap.get(String(id));
    return String(v?.username || "");
  };

  const normalizeRoleLabelAr = (role?: string) => {
    if (!role) return "عضو";
    if (role === "creator") return "منشئ";
    if (role === "owner") return "مالك";
    if (role === "admin") return "مشرف";
    return "عضو";
  };

  const clipText = (s: string, max = 120) => {
    const t = String(s || "");
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + "…";
  };

  const safeDisplayText = (content: string) => stripHtmlToText(content) || "—";

 const scrollToBottom = () => {
  try {
    flatListRef.current?.scrollToOffset?.({
      offset: 0,
      animated: true,
    });

    setShowScrollToBottom(false);
  } catch {}
};
  const hidePinnedBar = () => {
    Animated.parallel([
      Animated.timing(pinnedTranslateX, {
        toValue: -260,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(arrowTranslateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPinnedHidden(true);
    });
  };

  const showPinnedBar = () => {
    setPinnedHidden(false);

    Animated.parallel([
      Animated.timing(pinnedTranslateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(arrowTranslateX, {
        toValue: 40,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const pinnedPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: any, gestureState: { dx: number; }) => {
        return Math.abs(gestureState.dx) > 8;
      },

      onPanResponderMove: (_: any, gestureState: { dx: number; }) => {
        if (gestureState.dx < 0) {
          pinnedTranslateX.setValue(gestureState.dx);
        }
      },

      onPanResponderRelease: (_: any, gestureState: { dx: number; }) => {
        if (gestureState.dx < -80) {
          hidePinnedBar();
        } else {
          Animated.spring(pinnedTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  const arrowPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          arrowTranslateX.setValue(Math.max(0, 40 + gestureState.dx));
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -35) {
          showPinnedBar();
        } else {
          Animated.spring(arrowTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  /* ================= MIC PERMISSION ================= */
  const ensureMicPermission = async () => {
    try {
      const perm = await Audio.getPermissionsAsync();
      if (perm.granted) return true;

      const req = await Audio.requestPermissionsAsync();
      if (req.granted) return true;

      Alert.alert(
        "Microphone Permission",
        "لا يمكن تسجيل الصوت بدون إذن الميكروفون. افتح الإعدادات ثم فعّل Microphone.",
        [
          { text: "إلغاء", style: "cancel" },
          { text: "فتح الإعدادات", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    } catch {
      Alert.alert("Error", "تعذر طلب إذن الميكروفون.");
      return false;
    }
  };
  const handleInviteUser = async () => {
    const user = selectedInviteUser;
    const targetId = String(user?._id || user?.id || "").trim();

    if (!targetId) {
      Alert.alert("Notice", "Please select a user first");
      return;
    }

    if (targetId === myUserId) {
      Alert.alert("Notice", "You cannot invite yourself");
      return;
    }

    try {
      setInviteLoading(true);
      setInviteSendingId(targetId);

      await dispatch(
        inviteToRoom({
          roomId,
          targetId,
          message: `Join the room "${roomName}" 🔥`,
        })
      ).unwrap();

      Alert.alert(
        "Success",
        `Invitation sent to ${user?.username || user?.name || "user"}`
      );

      setShowInviteModal(false);
      setInviteUsername("");
      setInviteSearch("");
      setSelectedInviteUser(null);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to send invitation"
      );
    } finally {
      setInviteLoading(false);
      setInviteSendingId(null);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const hasMessages = Array.isArray(reduxMessages) && reduxMessages.length > 0;
    const hasUsers = Array.isArray(roomUsers) && roomUsers.length > 0;
    const hasStats = typeof activeCount === "number";

    const loadRoom = async () => {
      try {
        if (!hasMessages) {
          await dispatch(
            fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })
          ).unwrap();
        }

        if (!hasUsers) {
          await dispatch(fetchRoomUsers(roomId)).unwrap();
        }

        if (!hasStats) {
          await dispatch(fetchRoomStats(roomId)).unwrap();
        }

        await dispatch(getMyInventory() as any);
        joinRoomSocket(roomId);
        ensureMicPermission();
      } catch (e) {
      }
    };

    loadRoom();

    return () => {
      // leaveRoomSocket(roomId);
    };
  }, [roomId]);
  /* ================= KICK/BAN HANDLERS ================= */
  useEffect(() => {
    if (!roomId || !kicked) return;
    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const msg = (kicked as any)?.message || "تم طردك من الغرفة.";
    Alert.alert("تم الطرد", msg, [
      {
        text: "حسناً",
        onPress: async () => {
          try {
            await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
          } catch { }
          dispatch(clearKickedFlag({ roomId }));
          router.back();
        }
      }
    ]);
  }, [kicked, roomId, dispatch, router]);

  useEffect(() => {
    if (!roomId || !banned) return;
    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const reason = (banned as any)?.reason ? `السبب: ${(banned as any).reason}` : "";
    const msg = reason || "تم حظرك من الغرفة.";

    Alert.alert("تم الحظر", msg, [
      {
        text: "حسناً",
        onPress: async () => {
          try {
            await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
          } catch { }
          dispatch(clearBannedFlag({ roomId }));
          router.back();
        }
      }
    ]);
  }, [banned, roomId, dispatch, router]);

  /* ================= CLEANUP SOUND/TIMERS ================= */
  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch { }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= KEYBOARD FIX (inverted) ================= */
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      try {
        flatListRef.current?.scrollToOffset?.({ offset: 0, animated: false });
      } catch { }
    });
    return () => sub.remove();
  }, []);

  const usersUI: UserUI[] = useMemo(() => {
    return (roomUsers || []).map((u: any) => ({
      id: String(u?._id),
      name: String(u?.username || "User"),
      avatar: String(u?.avatar || ""),
      avatarGif: String(u?.activeCustomization?.avatarGif || u?.avatarGif || ""),
      usernameColor: String(u?.activeCustomization?.usernameColor || u?.usernameColor || ""),
      messageTextColor: String(u?.activeCustomization?.messageTextColor || u?.messageTextColor || ""),

      role: u?.role,
      activeBadges:
        String(u?._id) === String(myUserId)
          ? buildActiveBadgesFromUser(u, myInventory)
          : buildActiveBadgesFromUser(u),
      customEmojiBadge:
        u?.customEmojiBadge && typeof u?.customEmojiBadge === "object"
          ? {
            emoji: String(u.customEmojiBadge.emoji || ""),
            isActive: Boolean(u.customEmojiBadge.isActive),
            expiresAt: u.customEmojiBadge.expiresAt
              ? String(u.customEmojiBadge.expiresAt)
              : null
          }
          : null,
      isOnline: Boolean(u?.isOnline)
    }));
  }, [roomUsers, myUserId, myInventory]);
  /* ================= messagesById (for reply preview) ================= */
  const messagesById = useMemo(() => {
    const mp = new Map<string, any>();
    for (const m of reduxMessages || []) {
      if (m?._id) mp.set(String(m._id), m);
    }
    return mp;
  }, [reduxMessages]);

  /* ================= SENDER PICKING ================= */
  const DEBUG_USER = false;

  const logSenderFromMessage = (m: any, tag = "SENDER_DUMP") => {
    if (!DEBUG_USER) return;
    try {
      const snap = m?.senderSnapshot;
      const active = snap?.activeCustomization;
      const dump = {
        tag,
        messageId: String(m?._id || ""),
        backendType: String(m?.type || ""),
        senderRaw: m?.sender,
        senderSnapshot: snap
          ? {
            _id: String(snap?._id || ""),
            username: String(snap?.username || ""),
            avatar: String(snap?.avatar || ""),
            verificationType: String(snap?.verificationType || ""),
            badgesRoot: Array.isArray(snap?.badges) ? snap.badges : [],
            activeCustomization: active
              ? {
                badges: Array.isArray(active?.badges) ? active.badges : [],
                verificationType: String(active?.verificationType || "")
              }
              : null
          }
          : null
      };
    } catch (e) {
    }
  };

  const pickSenderFromMessage = (m: any) => {
    const senderObj =
      typeof m?.sender === "object" && m?.sender
        ? m.sender
        : m?.sender
          ? { _id: String(m.sender), username: "", avatar: "" }
          : null;

    const snap = m?.senderSnapshot || null;

    const senderId = String(snap?._id || senderObj?._id || m?.senderId || "").trim();
    const username = String(
      snap?.username ||
      senderObj?.username ||
      m?.senderUsername ||
      m?.actorName ||
      m?.username ||
      ""
    ).trim();

    const avatar = String(
      snap?.avatar ||
      senderObj?.avatar ||
      usersMap.get(senderId)?.avatar ||
      ""
    ).trim();

    const avatarGif = String(
      snap?.activeCustomization?.avatarGif ||
      snap?.avatarGif ||
      senderObj?.activeCustomization?.avatarGif ||
      senderObj?.avatarGif ||
      usersMap.get(senderId)?.avatarGif ||
      ""
    ).trim();

    const usernameColor =
      String(
        snap?.activeCustomization?.usernameColor ||
        snap?.usernameColor ||
        senderObj?.activeCustomization?.usernameColor ||
        senderObj?.usernameColor ||
        usersMap.get(senderId)?.usernameColor ||
        ""
      ).trim();

    const messageTextColor =
      String(
        snap?.activeCustomization?.messageTextColor ||
        snap?.messageTextColor ||
        senderObj?.activeCustomization?.messageTextColor ||
        senderObj?.messageTextColor ||
        usersMap.get(senderId)?.messageTextColor ||
        ""
      ).trim();

    const snapshotRole = String(snap?.role || senderObj?.role || "").trim();

    const activeBadgesFromSnapshot =
      senderId === myUserId
        ? buildActiveBadgesFromUser(snap, myInventory)
        : buildActiveBadgesFromUser(snap);

    const activeBadgesFromUsersMap = usersMap.get(senderId)?.activeBadges || [];
    const activeBadges =
      activeBadgesFromSnapshot.length > 0
        ? activeBadgesFromSnapshot
        : activeBadgesFromUsersMap;

    const customEmojiBadge =
      snap?.customEmojiBadge && typeof snap.customEmojiBadge === "object"
        ? {
          emoji: String(snap.customEmojiBadge.emoji || ""),
          isActive: Boolean(snap.customEmojiBadge.isActive),
          expiresAt: snap.customEmojiBadge.expiresAt
            ? String(snap.customEmojiBadge.expiresAt)
            : null
        }
        : senderObj?.customEmojiBadge && typeof senderObj.customEmojiBadge === "object"
          ? {
            emoji: String(senderObj.customEmojiBadge.emoji || ""),
            isActive: Boolean(senderObj.customEmojiBadge.isActive),
            expiresAt: senderObj.customEmojiBadge.expiresAt
              ? String(senderObj.customEmojiBadge.expiresAt)
              : null
          }
          : null;

    return {
      senderId,
      username,
      avatar,
      avatarGif,
      usernameColor,
      messageTextColor,
      snapshotRole: snapshotRole || undefined,
      activeBadges,
      customEmojiBadge
    };
  };
  function parseSongMessage(m: any) {
    const song = m?.song || {};
    const text = String(m?.content || "").trim();

    const lines = text
      .split("\n")
      .map((x: string) => String(x || "").trim())
      .filter(Boolean);

    const titleLine = lines.find((l: string) => l.startsWith("🎵"));
    const channelLine = lines.find((l: string) => l.startsWith("🎤"));
    const linkLine = lines.find((l: string) => l.startsWith("🔗"));

    const title =
      String(song?.title || "").trim() ||
      (titleLine ? titleLine.replace(/^🎵\s*/, "").trim() : "") ||
      text;

    const channel =
      String(song?.channelTitle || "").trim() ||
      (channelLine ? channelLine.replace(/^🎤\s*/, "").trim() : "");

    const audioUrl =
      String(song?.audioUrl || "").trim() ||
      String(m?.media?.url || "").trim() ||
      (linkLine ? linkLine.replace(/^🔗\s*/, "").trim() : "");

    const thumbnail =
      String(song?.thumbnail || "").trim() ||
      (String(m?.media?.mimeType || "").toLowerCase().startsWith("image/")
        ? String(m?.media?.url || "").trim()
        : "");

    const youtubeUrl = String(song?.youtubeUrl || "").trim();

    if (!title && !audioUrl) return null;

    return {
      title,
      channel,
      audioUrl,
      thumbnail,
      youtubeUrl,

      playedById: String(song?.playedById || "").trim(),
      playedByName: String(song?.playedByName || "").trim(),
      playedByAtUsername: String(song?.playedByAtUsername || "").trim(),

      songCode: String(song?.songCode || "").trim().toUpperCase(),
      loveCommand: String(song?.loveCommand || "").trim(),
    };
  }
  const mapReduxToUIMessage = (m: any): MessageUI => {
    logSenderFromMessage(m, "MAP_MESSAGE_USER_DUMP");

    const backendType = String(m?.type || "text");

    const parsedSong =
      backendType === "song"
        ? parseSongMessage(m)
        : backendType === "system" && String(m?.systemType || "") === "room_music"
          ? parseSongMessage(m)
          : null;
    const isSystem =
      backendType === "system" ||
      backendType === "announcement" ||
      backendType === "join" ||
      backendType === "leave" ||
      backendType === "promotion" ||
      backendType === "ban" ||
      backendType === "role";

    // ✅ IDs
    const serverId = m?._id ? String(m._id) : undefined;
    const clientId = m?.clientId ? String(m.clientId) : undefined;

    // إذا عندك clientId استخدمه دائمًا، وإلا استخدم serverId
    const stableId =
      clientId ||
      serverId ||
      `tmp:${String(m?.createdAt || Date.now())}:${Math.random().toString(16).slice(2)}`;

    const picked = pickSenderFromMessage(m);
    const senderId = String(picked.senderId || "").trim();


    // اسم المستخدم في رسائل السيستم
    let systemUserName = String(picked.username || "").trim();
    if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
    if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
    if (!systemUserName) systemUserName = "مستخدم";

    // نص السيستم
    let systemText = String(m?.content || "");

    if (backendType === "join") systemText = systemUserName;
    else if (backendType === "leave") systemText = systemUserName;
    else if (backendType === "promotion") {
      const action = String(m?.action || m?.meta?.action || "");
      const actor = String(m?.actorName || m?.meta?.actorName || "").trim() || systemUserName || "مشرف";
      const target = String(m?.targetName || m?.meta?.targetName || "").trim();
      const roleRaw = String(m?.role || m?.meta?.role || "").trim();

      const isRoleChange =
        action === "role:set" ||
        Boolean(m?.actorName || m?.targetName || m?.role || m?.meta?.actorName || m?.meta?.targetName || m?.meta?.role);

      if (isRoleChange) {
        const targetName = target || "مستخدم";
        const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
        systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
      } else {
        systemText = `⭐ تمت ترقية ${systemUserName}`;
      }
    } else if (backendType === "ban") systemText = `⛔ تم حظر ${systemUserName}`;
    else if (backendType === "announcement") systemText = `📢 ${m?.content || ""}`;
    else if (backendType === "role") {
      const actor = String(m?.actorName || systemUserName || "مشرف");
      const target = String(m?.targetName || "مستخدم");
      const r = normalizeRoleLabelAr(String(m?.role || ""));
      systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
    }

    // ✅ replyTo preview
    const replyRaw = m?.replyTo || m?.replyToId || m?.meta?.replyTo || m?.meta?.replyToId || null;

    const buildReplyPreview = (raw: any): MessageUI | undefined => {
      if (!raw) return undefined;

      // لو السيرفر بعت object كامل
      if (typeof raw === "object") {
        const rid = String(raw?._id || raw?.clientId || "reply");
        const rType = String(raw?.type || "text");

        const uiT: MessageUI["type"] =
          rType === "image"
            ? "image"
            : rType === "video"
              ? "video"
              : rType === "audio"
                ? "audio"
                : rType === "file"
                  ? "file"
                  : "text";
        if (uiType === "audio") {
        }
        return {
          id: rid,
          clientId: raw?.clientId ? String(raw.clientId) : undefined,
          serverId: raw?._id ? String(raw._id) : undefined,
          type: uiT,
          text: String(
            raw?.content ||
            raw?.text ||
            raw?.message ||
            raw?.media?.url ||
            "Media message"
          ),
          uri: raw?.media?.url,
          mediaMimeType: String(raw?.media?.mimeType || ""),
          mediaFileName: String(raw?.media?.fileName || ""),
          sender: {
            id: String(raw?.sender?._id || raw?.senderId || "unknown"),
            name: String(raw?.sender?.username || raw?.senderUsername || "User"),
            avatar: String(raw?.sender?.avatar || "")
          },
          time: ""
        };
      }

      // لو replyTo عبارة عن id string
      if (typeof raw === "string") {
        const rid = String(raw);
        const ref = messagesById.get(rid);

        if (!ref) {
          return { id: rid, type: "text", text: "Replying to a message…", time: "" } as any;
        }

        const refType = String(ref?.type || "text");
        const uiT: MessageUI["type"] =
          refType === "image"
            ? "image"
            : refType === "video"
              ? "video"
              : refType === "audio"
                ? "audio"
                : refType === "file"
                  ? "file"
                  : "text";

        const pickedRef = pickSenderFromMessage(ref);
        const refSenderId = String(pickedRef?.senderId || "").trim();
        const refSenderName =
          String(pickedRef?.username || "").trim() ||
          (refSenderId === myUserId ? myName : String(resolveUserNameById(refSenderId) || "").trim()) ||
          "User";

        return {
          id: String(ref?.clientId || ref?._id || rid),
          clientId: ref?.clientId ? String(ref.clientId) : undefined,
          serverId: ref?._id ? String(ref._id) : undefined,
          type: uiT,
          text: String(ref?.content || "Media message"),
          uri: ref?.media?.url,
          mediaMimeType: String(ref?.media?.mimeType || ""),
          mediaFileName: String(ref?.media?.fileName || ""),
          sender: {
            id: refSenderId || "unknown",
            name: refSenderName,
            avatar: String(pickedRef?.avatar || "")
          },
          time: ""
        };
      }

      return undefined;
    };

    const uiReplyTo = buildReplyPreview(replyRaw);

    // ✅ uiType
    const mediaUrl = String(m?.media?.url || "").trim();
    const mediaMime = String(m?.media?.mimeType || "").trim().toLowerCase();
    const systemTypeRaw = String(m?.systemType || "").trim();

    const isAudioMedia =
      !!mediaUrl &&
      (mediaMime.startsWith("audio/") || systemTypeRaw === "room_music_audio");

    let uiType: MessageUI["type"] = "text";
    let resolvedSystemType: MessageUI["systemType"] | undefined = undefined;

    if (backendType === "gift") uiType = "gift";
    else if (backendType === "song") uiType = "song";
    else if (backendType === "game") uiType = "game";
    else if (backendType === "image") uiType = "image";
    else if (backendType === "video") uiType = "video";
    else if (backendType === "audio") uiType = "audio";
    else if (backendType === "file") uiType = "file";
    else if (isSystem) uiType = "system";
    if (backendType === "system") {

    }
    // ✅ time (يفضل تثبيت createdAt في optimistic لتقليل الحركة)
    const time = new Date(m?.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // ✅ reaction (أول reaction فقط)
    const firstReactionEmoji =
      Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";
    const uiReaction = REACTIONS.includes(firstReactionEmoji as any) ? (firstReactionEmoji as Reaction) : undefined;

    // ✅ sender role من usersMap
    const roomRole = usersMap.get(senderId)?.role as RoomRole | undefined;

    const senderUI: UserUI = {
      id: String(senderId || "unknown"),
      name: picked.username || (senderId && senderId === myUserId ? myName : "User"),
      avatar: picked.avatar || (senderId && senderId === myUserId ? myAvatar : ""),
      avatarGif: picked.avatarGif || "",
      usernameColor: picked.usernameColor || "",
      messageTextColor: picked.messageTextColor || "",
      role: roomRole,
      snapshotRole: picked.snapshotRole,
      activeBadges: picked.activeBadges || [],
      customEmojiBadge: (picked as any).customEmojiBadge || null
    };
    const messageText =
      parsedSong
        ? parsedSong.title
        : uiType === "audio"
          ? String(m?.content || m?.music?.title || "Voice")
          : isSystem
            ? systemText
            : String(m?.content || "");
    // ✅ gift payload
    const giftPayload = m?.gift || m?.meta?.gift || null;
    const giftKey = backendType === "gift" ? String(giftPayload?.key || m?.content || "") : "";
    const giftIcon = String(giftPayload?.icon || "") || (GIFT_META[giftKey]?.icon || "🎁");
    const giftCount = Number(giftPayload?.count || 0) || (GIFT_META[giftKey]?.count || 45);

    const giftTargetId = giftPayload?.targetId ? String(giftPayload.targetId) : undefined;
    const giftTargetName = giftPayload?.targetName ? String(giftPayload.targetName) : undefined;
    const reactionInfo = normalizeMessageReactions(m);
    return {
      // ✅ أهم سطر: id ثابت للـ FlatList
      id: stableId,

      // ✅ احتفظ بالاثنين للاستخدام في socket actions (reaction/delete) وفي replace بالريدكس
      clientId,
      serverId,

      type: uiType,
      systemType: isSystem ? (backendType as any) : undefined,
      music: parsedSong
        ? {
          title: parsedSong.title,
          channel: parsedSong.channel,
          audioUrl: parsedSong.audioUrl,
          thumbnail: parsedSong.thumbnail,
          youtubeUrl: parsedSong.youtubeUrl,

          playedById: parsedSong.playedById,
          playedByName: parsedSong.playedByName,
          playedByAtUsername: parsedSong.playedByAtUsername,

          songCode: parsedSong.songCode,
          loveCommand: parsedSong.loveCommand,
        }
        : undefined,

      game:
        backendType === "game"
          ? {
            gameType: String(m?.gameType || m?.game?.gameType || "").trim(),
            gameId: String(m?.game?.gameId || "").trim(),
            title: String(m?.game?.title || m?.content || "").trim(),
            state: String(m?.game?.state || "").trim(),
            turnUserId: String(m?.game?.turnUserId || "").trim(),
            winnerUserId: String(m?.game?.winnerUserId || "").trim(),
            payload: m?.game?.payload || null,
          }
          : undefined,
      text: messageText,
      uri: m?.media?.url,
      mediaMimeType: String(m?.media?.mimeType || ""),
      mediaFileName: String(m?.media?.fileName || ""),
      // في announcement كنت تخفي sender عندك — نفس السلوك
      sender:
        uiType === "audio" || uiType === "song" || uiType === "game"
          ? senderUI
          : backendType === "announcement"
            ? senderUI
            : isSystem
              ? undefined
              : senderUI,

      gift:
        uiType === "gift"
          ? { key: giftKey, icon: giftIcon, count: giftCount, targetId: giftTargetId, targetName: giftTargetName }
          : undefined,

      replyTo: uiReplyTo,
      reaction: reactionInfo.firstReactionEmoji
        ? (reactionInfo.firstReactionEmoji as Reaction)
        : uiReaction,

      reactions: reactionInfo.reactions,
      reactionCount: reactionInfo.reactionCount,
      deletedForEveryone: Boolean(m?.deletedForEveryone),
      time
    };
  };
  type UiMessageCacheRow = {
    sig: string;
    ui: MessageUI;
  };

  const uiMessageCacheRef = useRef<Map<string, UiMessageCacheRow>>(new Map());

  const getRawMessageStableId = (m: any) => {
    return String(
      m?.clientId ||
      m?._id ||
      `${m?.createdAt || ""}:${m?.type || ""}:${m?.content || ""}`
    );
  };

  const getRawSenderIdQuick = (m: any) => {
    const sender =
      typeof m?.sender === "object" && m?.sender
        ? m.sender
        : null;

    const snap = m?.senderSnapshot || null;

    return String(
      snap?._id ||
      sender?._id ||
      m?.senderId ||
      (typeof m?.sender === "string" ? m.sender : "") ||
      ""
    ).trim();
  };

  const getCompactUserSignature = (userId?: string) => {
    const id = String(userId || "").trim();
    if (!id) return "";

    const u = usersMap.get(id);
    if (!u) return "";

    return [
      u.username || "",
      u.avatar || "",
      u.avatarGif || "",
      u.usernameColor || "",
      u.messageTextColor || "",
      u.role || "",
      JSON.stringify(u.activeBadges || []),
      JSON.stringify(u.customEmojiBadge || null),
    ].join("|");
  };

  const getRawMessageSignature = (m: any) => {
    const senderId = getRawSenderIdQuick(m);

    return [
      getRawMessageStableId(m),
      m?._id || "",
      m?.clientId || "",
      m?.type || "",
      m?.systemType || "",
      m?.content || "",
      m?.updatedAt || m?.createdAt || "",
      Boolean(m?.deletedForEveryone) ? "1" : "0",
      Boolean(m?.isPinned) ? "1" : "0",

      senderId,
      getCompactUserSignature(senderId),

      m?.media?.url || "",
      m?.media?.mimeType || "",
      m?.media?.fileName || "",

      m?.reactionCount || 0,
      m?.reactionsCount || 0,
      m?.reaction || "",
      m?.myReaction || "",

      Array.isArray(m?.reactions) ? m.reactions.length : 0,
      Array.isArray(m?.reactionUsers) ? m.reactionUsers.length : 0,
      Array.isArray(m?.meta?.reactions) ? m.meta.reactions.length : 0,

      m?.game?.state || "",
      m?.game?.turnUserId || "",
      m?.game?.winnerUserId || "",
      m?.game?.payload ? JSON.stringify(m.game.payload) : "",

      m?.gift?.key || m?.meta?.gift?.key || "",
      m?.gift?.targetId || m?.meta?.gift?.targetId || "",
    ].join("|");
  };
  const uiMessages: MessageUI[] = useMemo(() => {
    if (!Array.isArray(reduxMessages) || !reduxMessages.length) {
      uiMessageCacheRef.current.clear();
      return [];
    }

    const cache = uiMessageCacheRef.current;
    const nextKeys = new Set<string>();

    const nextMessages = reduxMessages.map((rawMessage: any) => {
      const key = getRawMessageStableId(rawMessage);
      const sig = getRawMessageSignature(rawMessage);

      nextKeys.add(key);

      const cached = cache.get(key);

      if (cached && cached.sig === sig) {
        return cached.ui;
      }

      const ui = mapReduxToUIMessage(rawMessage);

      cache.set(key, {
        sig,
        ui,
      });

      return ui;
    });

    // تنظيف الرسائل التي لم تعد موجودة حتى لا يكبر الكاش مع الوقت
    for (const key of cache.keys()) {
      if (!nextKeys.has(key)) {
        cache.delete(key);
      }
    }

    return nextMessages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, usersMap, myUserId, myName, myAvatar, myRole, myInventory]);
  const didSeedCurrentGiftsRef = useRef(false);

  useEffect(() => {
    if (!didInitSeenGiftsRef.current) return;
    if (didSeedCurrentGiftsRef.current) return;
    if (!myUserId || !roomId) return;
    if (!uiMessages?.length) return;

    const existingGiftIds = uiMessages
      .filter((m) => m.type === "gift" && m.id)
      .map((m) => String(m.id));

    existingGiftIds.forEach((id) => seenGiftIdsRef.current.add(id));

    if (existingGiftIds.length) {
      addManySeenGiftIds(myUserId, roomId, existingGiftIds);
    }

    didSeedCurrentGiftsRef.current = true;
  }, [uiMessages, myUserId, roomId]);
  /* ================= latestPinned ================= */
  const latestPinned = useMemo(() => {
    const list = reduxMessages || [];

    const pinned = list.filter(
      (m: any) => Boolean(m?.isPinned) && !m?.deletedForEveryone
    );

    if (!pinned.length) return null;

    pinned.sort((a: any, b: any) => {
      const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return tb - ta;
    });

    const raw = pinned[0];
    const key = getRawMessageStableId(raw);

    return uiMessages.find((m) => {
      return (
        m.id === key ||
        m.clientId === raw?.clientId ||
        m.serverId === String(raw?._id || "")
      );
    }) || mapReduxToUIMessage(raw);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, uiMessages]);

  /* ================= GIFT OVERLAY AUTO ================= */
  useEffect(() => {
    if (!didInitSeenGiftsRef.current) return;
    if (!didSeedCurrentGiftsRef.current) return;
    if (!uiMessages?.length) return;

    const latestGift = [...uiMessages]
      .reverse()
      .find(
        (m) =>
          m.type === "gift" &&
          m.id &&
          !m.deletedForEveryone &&
          !seenGiftIdsRef.current.has(String(m.id))
      );

    if (!latestGift) return;

    const key = String(latestGift.gift?.key || "");
    const meta = GIFT_META[key] || {
      icon: latestGift.gift?.icon || "🎁",
      count: latestGift.gift?.count || 45,
      lottie: undefined,
    };

    setGiftOverlay({
      visible: true,
      messageId: String(latestGift.id),
      giftKey: key,
      icon: latestGift.gift?.icon || meta.icon,
      count: latestGift.gift?.count || meta.count,
      lottie: meta.lottie,
      fromName: latestGift.sender?.name || "Someone",
      toName: latestGift.gift?.targetName || "Someone",
    });

    seenGiftIdsRef.current.add(String(latestGift.id));
    addSeenGiftId(myUserId, roomId, String(latestGift.id));
  }, [uiMessages, myUserId, roomId]);
  /* ================= AUDIO (GLOBAL BAR anim) ================= */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
      duration: 120,
      useNativeDriver: false
    }).start();
  }, [playbackProgress, playbackDuration, progressAnim]);

  const togglePlay = async (uri: string, id: string) => {
    if (recording) return;

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

    if (playingId === id && sound) {
      await sound.pauseAsync();
      setPlayingId(null);
      return;
    }

    if (activeAudio?.id === id && sound) {
      await sound.playAsync();
      setPlayingId(id);
      return;
    }

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    setPlayingId(id);
    setActiveAudio({ id, uri, type: "audio", time: "" } as any);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      setPlaybackProgress(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 1);

      if (status.didJustFinish) {
        setPlayingId(null);
        setActiveAudio(null);
        setPlaybackProgress(0);
      }
    });

    await newSound.playAsync();
  };
  const currentUserId = useSelector((s: RootState) => s.auth.user?._id);
  // اختياري لو عندك بيانات المستخدم كاملة
  const me = useSelector((s: RootState) => s.auth.user);

  const myCoinz = myStore?.coinzBalance ?? 0;
  const sendText = async () => {
    const content = text.trim();
    if (!content || !roomId) return;

    if (!currentUserId) {
      Alert.alert("Error", "Missing current user");
      return;
    }

    const clientId = `c:${Date.now()}:${Math.random().toString(16).slice(2)}`;

    const meInRoom = (roomUsers || []).find(
      (u: any) => String(u?._id) === String(currentUserId)
    );

    dispatch(
      optimisticAddRoomMessage({
        roomId,
        message: {
          clientId,
          type: "text",
          content,
          replyTo: replyTo?.serverId || replyTo?.id,
          mentions: [],
          sender: currentUserId,
          senderSnapshot: meInRoom
            ? {
              _id: meInRoom._id,
              username: meInRoom.username,
              atUsername: me?.atUsername || "",
              avatar: meInRoom.avatar,
              avatarGif:
                meInRoom?.activeCustomization?.avatarGif || meInRoom?.avatarGif || "",
              coverImage: me?.coverImage || "",
              usernameColor:
                meInRoom?.activeCustomization?.usernameColor || meInRoom?.usernameColor || "",
              messageTextColor:
                meInRoom?.activeCustomization?.messageTextColor || meInRoom?.messageTextColor || "",
              isOnline: true,
              verificationType:
                meInRoom?.verificationType || me?.verificationType || "none",
              activeCustomization:
                meInRoom?.activeCustomization || { badges: [] },
              inventory: Array.isArray(myInventory) ? myInventory : [],
              customEmojiBadge:
                meInRoom?.customEmojiBadge || me?.customEmojiBadge || null,
            }
            : me
              ? {
                _id: me._id,
                username: me.username,
                atUsername: me.atUsername,
                avatar: me.avatar,
                avatarGif:
                  me?.activeCustomization?.avatarGif || me?.avatarGif || "",
                coverImage: me.coverImage,
                usernameColor:
                  me?.activeCustomization?.usernameColor || me?.usernameColor || "",
                messageTextColor:
                  me?.activeCustomization?.messageTextColor || me?.messageTextColor || "",
                isOnline: true,
                verificationType: me.verificationType,
                activeCustomization: me.activeCustomization,
                inventory: Array.isArray(myInventory) ? myInventory : [],
                customEmojiBadge: me.customEmojiBadge,
              }
              : undefined,
        },
      })
    );

    setText("");
    setReplyTo(null);
    scrollToBottom();

    try {
      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content,
          type: "text",
          replyTo: replyTo?.serverId || replyTo?.id,
        })
      ).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Send failed");
    }
  };

  const sendImage = async () => {
    if (!roomId) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });

    if (res.canceled) return;

    const asset = res.assets?.[0];
    const localUri = asset?.uri;
    if (!localUri) return;

    try {
      setUploading({
        visible: true,
        title: "جاري رفع الصورة…",
        sub: "يتم تجهيز الصورة وإرسالها",
        startedAt: Date.now(),
        previewUri: localUri,
        kind: "image",
      });

      const secureUrl = await uploadToCloudinary(localUri, "image");

      await dispatch(
        sendRoomMessage({
          roomId,
          content: "📷 Image",
          type: "image",
          media: {
            url: secureUrl,
            mimeType: asset?.mimeType || "image/jpeg",
            fileName: asset?.fileName || "image.jpg",
          },
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Upload failed");
    } finally {
      setUploading({
        visible: false,
        title: "Uploading…",
        sub: undefined,
        startedAt: undefined,
        previewUri: undefined,
        kind: undefined,
      });
    }
  };
  const sendSticker = async (sticker: StickerItem) => {
    if (!roomId) return;

    const url = String(sticker?.url || "").trim();
    if (!url) return;

    try {
      const clientId = `sticker:${Date.now()}:${Math.random()
        .toString(16)
        .slice(2)}`;

      setShowStickerPicker(false);

      setUploading({
        visible: true,
        title: "جاري إرسال الستيكار…",
        sub: sticker.title || "Sticker",
        startedAt: Date.now(),
        previewUri: url,
        kind: "sticker",
      });

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content: sticker.title || "Sticker",
          type: "image",
          media: {
            url,
            mimeType: sticker.mimeType || "image/gif",
            fileName: `${sticker.id || "sticker"}.gif`,
          },
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Sticker send failed");
    } finally {
      setUploading({
        visible: false,
        title: "Uploading…",
        sub: undefined,
        startedAt: undefined,
        previewUri: undefined,
        kind: undefined,
      });
    }
  };
  const sendGifFromDevice = async () => {
    if (!roomId) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/gif"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      const localUri = asset?.uri;

      if (!localUri) return;

      const clientId = `gif:${Date.now()}:${Math.random()
        .toString(16)
        .slice(2)}`;

      setUploading({
        visible: true,
        title: "جاري رفع GIF…",
        sub: asset?.name ? `يتم رفع ${asset.name}` : "يتم رفع GIF وإرساله",
        startedAt: Date.now(),
        previewUri: localUri,
        kind: "gif",
      });

      const secureUrl = await uploadToCloudinary(localUri, "image");

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId,
          content: "GIF",
          type: "image",
          media: {
            url: secureUrl,
            mimeType: "image/gif",
            fileName: asset?.name || "animation.gif",
          },
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "GIF upload failed");
    } finally {
      setUploading({
        visible: false,
        title: "Uploading…",
        sub: undefined,
        startedAt: undefined,
        previewUri: undefined,
        kind: undefined,
      });
    }
  };


  /* ================= RECORDING ================= */
  const startRecording = async () => {
    try {
      if (pendingVoiceUri) return;
      if (recording) return;

      const ok = await ensureMicPermission();
      if (!ok) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Record failed");
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) setPendingVoiceUri(uri);
    } catch {
      setRecording(null);
    }
  };

  useEffect(() => {
    let loopAnim: Animated.CompositeAnimation | null = null;

    if (recording) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      loopAnim.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      loopAnim?.stop();
      pulseAnim.stopAnimation();
    };
  }, [recording, pulseAnim]);

  /* ================= ACTIONS ================= */
  const addReaction = (msg: MessageUI, emoji: Reaction) => {
    // ممنوع إرسال reaction قبل وصول _id الحقيقي من السيرفر
    if (!msg?.serverId) {
      Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
      return;
    }

    toggleRoomReactionSocket({ roomId, messageId: msg.serverId, emoji });
    setShowActions(false);
  };

  const deleteMessage = (msg: MessageUI) => {
    if (!msg?.serverId) {
      Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
      return;
    }

    deleteRoomSocketMessage({ roomId, messageId: msg.serverId });
    setShowActions(false);
  };
  /* ================= MENU ACTIONS ================= */
  const onRefreshRoom = async () => {
    try {
      setShowRoomMenu(false);
      await dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })).unwrap();
      await dispatch(fetchRoomUsers(roomId)).unwrap();
      await dispatch(fetchRoomStats(roomId)).unwrap();
      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Refresh failed");
    }
  };

  const onOpenUsers = async () => {
    try {
      setShowRoomMenu(false);
      await dispatch(fetchRoomUsers(roomId)).unwrap();
      setShowUsersModal(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load users");
    }
  };

  const onOpenStats = async () => {
    try {
      setShowRoomMenu(false);
      const stats: any = await dispatch(fetchRoomStats(roomId)).unwrap();
      Alert.alert(
        "Room Stats",
        `Active: ${stats?.activeCount ?? "-"}\nTotal: ${stats?.totalUsersCount ?? "-"}\nMessages: ${stats?.messagesCount ?? "-"}\nLevel: ${stats?.level ?? "-"}`
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load stats");
    }
  };
  const onLeaveRoom = () => {
    if (!roomId) return;
    if (didLeaveRef.current) return;

    setShowRoomMenu(false);
    didLeaveRef.current = true;

    router.back();

    setTimeout(() => {
      dispatch(leaveRoomAndExit({ roomId, cleanup: true }));
      dispatch(fetchRoomsByType({ type: "public", page: 1, limit: 30 }));
    }, 0);
  };
  /* ================= USERS: COPY/ROLE/KICK/BAN ================= */
  const onCopyUser = async (u: UserUI) => {
    await Clipboard.setStringAsync(`${u.name} (${u.id})`);
    Alert.alert("Copied", `Copied: ${u.name}`);
  };

  const onChangeRole = async (u: UserUI, newRole: UserUI["role"]) => {
    try {
      if (!canModerate) {
        Alert.alert("No permission", "ليس لديك صلاحية لتغيير الدور");
        return;
      }
      if (!u?.id || u.id === myUserId) return;
      if (!roomId) return;

      dispatch(socketRoleSetRequested({ roomId, targetId: u.id, role: newRole as any }));

      const ack = await setRoomUserRoleSocket({ roomId, targetId: u.id, role: newRole as any });

      if (ack?.ok) {
        dispatch(socketRoleSetSucceeded());
        Alert.alert("Success", `${u.name} => ${newRole}`);
      } else {
        dispatch(socketRoleSetFailed({ message: ack?.message || "Set role failed" }));
        Alert.alert("Error", ack?.message || "Failed to change role");
      }
    } catch (e: any) {
      dispatch(socketRoleSetFailed({ message: e?.message || "Set role failed" }));
      Alert.alert("Error", e?.message || "Failed to change role");
    }
  };

  const onKickUser = (u: UserUI) => {
    if (!canModerate) return;
    if (!u?.id || u.id === myUserId) return;
    if (!roomId) return;

    Alert.alert("Kick user", `Kick ${u.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Kick",
        style: "destructive",
        onPress: async () => {
          try {
            const ack = await kickRoomUserSocket({ roomId, targetId: u.id });
            if (!ack?.ok) {
              Alert.alert("Error", ack?.message || "Kick failed");
              return;
            }
            Alert.alert("Done", `${u.name} kicked`);
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Kick failed");
          }
        }
      }
    ]);
  };

  const onBanUser = (u: UserUI) => {
    if (!canModerate) return;
    if (!u?.id || u.id === myUserId) return;
    if (!roomId) return;

    Alert.alert("Ban user", `Ban ${u.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Ban",
        style: "destructive",
        onPress: async () => {
          try {
            const reason = "Violation";
            const ack = await banRoomUserSocket({ roomId, targetId: u.id, reason });
            if (!ack?.ok) {
              Alert.alert("Error", ack?.message || "Ban failed");
              return;
            }
            Alert.alert("Done", `${u.name} banned`);
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Ban failed");
          }
        }
      }
    ]);
  };

  /* ================= BOOST ================= */
  const onBoostRoom = async () => {
    try {
      // if (!canModerate) {
      //   Alert.alert("No permission", "You don't have permission to boost this room.");
      //   return;
      // }
      if (!roomId) return;

      const level = 1;
      const hours = 24;

      const r = await dispatch(boostRoom({ roomId, level, hours })).unwrap();

      if (!r?.boostExpiresAt && typeof r?.boostLevel !== "number") {
        Alert.alert("Error", "Boost did not succeed.");
        return;
      }

      await dispatch(
        sendRoomMessage({
          roomId,
          type: "gift",
          content: "boost_rocket",
          gift: {
            key: "boost_rocket",
            name: "boost",
            value: level,
            icon: "🚀",
            animation: "rocket"
          }
        } as any)
      ).unwrap();

      const content = `🚀 <b>${myName}</b> boosted the room!`;
      await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e) || "Boost failed");
    }
  };

  const goDetails = () => {
    router.push({ pathname: "/room-details", params: { roomId } });
  };

  /* ================= PIN ================= */
  const unpinMessage = async (messageId: string) => {
    try {
      await dispatch(pinRoomMessage({ roomId, messageId, pinned: false })).unwrap();
      Alert.alert("Done", "تم إلغاء التثبيت");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Unpin failed");
    }
  };

  /* ================= RENDER ================= */
  return (
    <View style={styles.root}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setShowActiveRoomsDrawer(true)}
            hitSlop={10}
            style={{ marginRight: 10 }}
            activeOpacity={0.85}
          >
            <Ionicons name="albums-outline" size={21} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={goDetails}>
            <Image source={{ uri: roomAvatar || "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg" }} style={styles.roomAvatar} />
          </TouchableOpacity>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomName}
            </Text>
            <Text style={styles.roomMeta}>
              Online: {activeCount}
              {uiMessages.length > 0 ? ` • ${uiMessages.length} Messages` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>


          <TouchableOpacity onPress={onBoostRoom} hitSlop={10} style={{ marginRight: 10 }} activeOpacity={0.85}>
            <Ionicons name="rocket-outline" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowRoomMenu(true)} hitSlop={10} activeOpacity={0.85}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      <SafeAreaView
        style={styles.contentSafe}
        edges={["left", "right", "bottom"]}
      >
        {/* ================= FIXED REPLY PREVIEW TOP ================= */}
        {replyTo && (
          <View pointerEvents="box-none" style={styles.fixedReplyLayer}>
            <View style={styles.fixedReplyCard}>
              <View style={styles.fixedReplyIcon}>
                <Ionicons name="return-up-back-outline" size={16} color="#FFF" />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.fixedReplyTitle} numberOfLines={1}>
                  Replying to {replyTo.sender?.name || "User"}
                </Text>

                <Text style={styles.fixedReplyText} numberOfLines={1}>
                  {stripHtmlToText(String(replyTo.text || "")) || "Media"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setReplyTo(null)}
                activeOpacity={0.85}
                style={styles.fixedReplyClose}
              >
                <Ionicons name="close" size={18} color={theme.icon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* ================= ROOM MENU ================= */}
        <Modal transparent visible={showRoomMenu} animationType="fade" onRequestClose={() => setShowRoomMenu(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.menuOverlay} onPress={() => setShowRoomMenu(false)}>
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={onRefreshRoom} activeOpacity={0.85}>
                <Ionicons name="refresh" size={18} color={theme.text} />
                <Text style={styles.menuText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowRoomMenu(false);
                  setInviteUsername("");
                  setShowInviteModal(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={18} color={theme.text} />
                <Text style={styles.menuText}>Invite a Friend</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onOpenUsers} activeOpacity={0.85}>
                <Ionicons name="people" size={18} color={theme.text} />
                <Text style={styles.menuText}>Users</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onOpenStats} activeOpacity={0.85}>
                <Ionicons name="stats-chart" size={18} color={theme.text} />
                <Text style={styles.menuText}>Stats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowRoomMenu(false);
                  setShowPinModal(true);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="pin" size={18} color={theme.text} />
                <Text style={styles.menuText}>Pin Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowRoomMenu(false);
                  router.push({ pathname: "/room/[id]/settings", params: { id: roomId } });
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="settings-outline" size={18} color={theme.text} />
                <Text style={styles.menuText}>Setting Room</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={onLeaveRoom} activeOpacity={0.85}>
                <Ionicons name="exit-outline" size={18} color={theme.danger} />
                <Text style={[styles.menuText, { color: theme.danger }]}>Leave Room</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ================= USERS MODAL ================= */}
        <UsersModal
          visible={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          users={usersUI}
          myUserId={myUserId}
          onAvatarPress={onAvatarPress}
          myRole={myRole}
          onOpenGift={(u) => setGiftPicker({ visible: true, target: u })}
          onStartChat={(u) => openChat(String(u.id))}
          onCopyUser={onCopyUser}
          onChangeRole={onChangeRole}
          onKickUser={onKickUser}
          onBanUser={onBanUser}
          theme={theme}
        />

        {/* ================= GLOBAL AUDIO BAR ================= */}
        {/* {activeAudio && (
        <View style={styles.globalAudioPlayer}>
          <View style={styles.audioIcon}>
            <Ionicons name="musical-notes" size={18} color={theme.primaryText} />
          </View>

          <View style={styles.audioCenter}>
            <Text style={styles.audioNow}>Playing voice…</Text>

            <View style={styles.globalProgressBg}>
              <Animated.View
                style={[
                  styles.globalProgressFill,
                  {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                  }
                ]}
              />
            </View>

            <View style={styles.audioTimes}>
              <Text style={styles.timeText}>{formatTime(playbackProgress)}</Text>
              <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={async () => {
              try {
                if (sound) {
                  await sound.stopAsync();
                  await sound.unloadAsync();
                }
              } catch { }
              setSound(null);
              setPlayingId(null);
              setActiveAudio(null);
              setPlaybackProgress(0);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>
      )} */}
        {/* ================= FIXED AUDIO TOP PLAYER ================= */}
        {showAudioModal && !!activeAudio?.uri && (
          <View pointerEvents="box-none" style={styles.fixedAudioLayer}>
            <View style={styles.fixedAudioCard}>
              <View style={styles.fixedAudioHeader}>
                <View style={styles.fixedAudioIcon}>
                  <Ionicons name="mic" size={16} color="#FFF" />
                </View>

                <Text style={styles.fixedAudioTitle} numberOfLines={1}>
                  Voice message
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowAudioModal(false);
                    setActiveAudio(null);
                  }}
                  activeOpacity={0.85}
                  style={styles.fixedAudioClose}
                >
                  <Ionicons name="close" size={18} color={theme.icon} />
                </TouchableOpacity>
              </View>

              <View style={styles.fixedAudioPlayer}>
                <VoiceMessagePlayer uri={activeAudio.uri} isMe={false} />
              </View>
            </View>
          </View>
        )}
        {/* ================= PINNED BAR ================= */}
        {latestPinned && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.pinnedBar}
            onPress={() => setPinPreviewFull(true)}
          >
            <View style={styles.pinnedLeft}>
              <Ionicons name="pin" size={18} color={theme.primary} />
              <Text style={styles.pinnedTitle}>Pinned</Text>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pinnedText} numberOfLines={1}>
                {clipText(safeDisplayText(latestPinned.text || ""), 80)}
              </Text>
              <Text style={styles.pinnedMeta} numberOfLines={1}>
                {latestPinned.sender?.name ? `${latestPinned.sender.name} • ` : ""}
                {latestPinned.time}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.icon} />
          </TouchableOpacity>
        )}
        {/* ================= VOICE PREVIEW ================= */}
        {!!pendingVoiceUri && (
          <VoiceRecorderPreview
            uri={pendingVoiceUri}
            topOffset={insets.top + 56} // عدل الرقم حسب ارتفاع الهيدر عندك
            onCancel={() => setPendingVoiceUri(null)}
            onSend={async () => {
              if (!roomId || !pendingVoiceUri) return;
              try {
                setUploading({ visible: true, title: "جاري رفع الصوت…", sub: "يرجى الانتظار" });

                const secureUrl = await uploadToCloudinary(pendingVoiceUri, "raw");

                await dispatch(
                  sendRoomMessage({
                    roomId,
                    content: "🎤 Voice message",
                    type: "audio",
                    media: { url: secureUrl }
                  })
                ).unwrap();

                try {
                  await FileSystem.deleteAsync(pendingVoiceUri, { idempotent: true });
                } catch { }

                setPendingVoiceUri(null);
                scrollToBottom();
              } catch (e: any) {
                Alert.alert("Error", e?.message || "Failed to send voice");
              } finally {
                setUploading({ visible: false, title: "Uploading…", sub: undefined });
              }
            }}
          />
        )}

        {/* ================= CHAT ================= */}
        <FlatList
          ref={flatListRef}
          data={uiMessages}
          inverted
          keyExtractor={(item) => item.id}
          scrollEventThrottle={16}
onScroll={(event) => {
  const y = event.nativeEvent.contentOffset.y;

  // لأن القائمة inverted:
  // y = 0 يعني أنت في آخر المحادثة
  // كلما زاد y يعني المستخدم طلع لفوق
  setShowScrollToBottom(y > 220);
}}
          ListHeaderComponent={<Reanimated.View style={listSpacerAnimatedStyle} />}
          contentContainerStyle={{
            padding: 14,
            paddingTop: replyTo ? 78 : 14,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}

          initialNumToRender={12}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={({ item, index }) => {
            const isMe = Boolean(myUserId) && item.sender?.id === myUserId;
            const previousMessage = uiMessages[index + 1];
            const showName =
              !previousMessage || previousMessage.type === "system" || previousMessage.sender?.id !== item.sender?.id;

            return (
              <MessageItem
                item={item}
                isMe={isMe}
                showName={showName}
                currentUserId={myUserId}
                onOpenAudioModal={openAudioModal}
                onSendCricketJoin={sendCricketJoin}
                onSendBombColorAnswer={handleSendBombColorAnswer}
                onSendCricketPlay={sendCricketPlay}
                onOpenReactionDetails={openReactionDetails}
                onSendSongLove={sendSongLove}
                onAvatarLongPress={(u) => {
                  if (!u?.id) return;
                  setGiftPicker({ visible: true, target: u });
                }}
                onAvatarPress={onAvatarPress}

                onPressImage={(payload) => setPreviewImage(payload)}
                onTogglePlay={togglePlay}
                playingId={playingId}
                progressAnim={progressAnim}
                onLongPress={() => {
                  setSelectedMessage(item);
                  setShowActions(true);
                }}
                onGiftDone={() => markGiftDone(item.id)}
                theme={theme}
                bubble={bubbleStyles}
              />
            );
          }}
        />


{showScrollToBottom && (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={scrollToBottom}
    style={[
      styles.scrollToBottomBtn,
      {
        bottom:
          Math.max(insets.bottom, 8) +
          Math.max(inputBarHeight || 0, 72) +
          14,
        backgroundColor:
          colorScheme === "dark" ? "#1F2937" : "#FFFFFF",
        borderColor:
          colorScheme === "dark" ? "#374151" : "#E5E7EB",
      },
    ]}
  >
    <Ionicons
      name="chevron-down"
      size={24}
      color={colorScheme === "dark" ? "#E5E7EB" : "#111827"}
    />
  </TouchableOpacity>
)}


        {/* ================= INPUT ================= */}
        <Reanimated.View
          onLayout={(e) => {
            setInputBarHeight(e.nativeEvent.layout.height);
          }}
          style={[
            styles.inputBarWrap,
            inputBarAnimatedStyle,
          ]}
        >
          <View style={styles.inputBar}>
            <TouchableOpacity
              onPress={() => setShowMediaPicker(true)}
              disabled={uploading.visible}
              activeOpacity={0.85}
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="add-circle-outline" size={25} color={theme.text} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor={theme.subtleText}
              value={text}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
                }, 50);
              }}
              onChangeText={setText}
              multiline
            />

            {text ? (
              <TouchableOpacity onPress={sendText} disabled={uploading.visible} activeOpacity={0.85}>
                <Ionicons name="send" size={22} color={theme.primary} />
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                  disabled={uploading.visible || !!pendingVoiceUri}
                  activeOpacity={0.85}
                >
                  <Ionicons name="mic" size={26} color={recording ? theme.danger : theme.text} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Reanimated.View>
        <Modal
          transparent
          visible={showInviteModal}
          animationType="fade"
          onRequestClose={() => setShowInviteModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.menuOverlay}
            onPress={() => setShowInviteModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.inviteModalBox}
              onPress={() => { }}
            >
              <View style={styles.inviteModalHeader}>
                <Text style={styles.inviteModalTitle}>Invite a Friend</Text>

                <TouchableOpacity
                  onPress={() => setShowInviteModal(false)}
                  activeOpacity={0.85}
                  style={styles.inviteModalCloseBtn}
                >
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inviteModalHint}>
                Enter the username exactly as it appears in the app
              </Text>

              <View style={styles.inviteInputWrap}>
                <Ionicons name="person-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.inviteInput}
                  placeholder="Username"
                  placeholderTextColor={theme.subtleText}
                  value={inviteUsername}
                  onChangeText={(val) => {
                    setInviteUsername(val);
                    setSelectedInviteUser(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleInviteSearch}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.inviteSendBtn,
                  { marginTop: 10, opacity: inviteLoading ? 0.7 : 1 }
                ]}
                onPress={handleInviteSearch}
                activeOpacity={0.85}
                disabled={inviteLoading}
              >
                <Text style={styles.inviteSendText}>
                  {inviteLoading ? "Searching..." : "Search User"}
                </Text>
              </TouchableOpacity>

              {!!inviteSearchResults?.length && (
                <View style={{ marginTop: 12, gap: 8 }}>
                  {inviteSearchResults.map((user: any) => {
                    const userId = String(user?._id || user?.id || "");
                    const isSelected =
                      String(selectedInviteUser?._id || selectedInviteUser?.id || "") === userId;
                    const isSending = inviteSendingId === userId;

                    return (
                      <TouchableOpacity
                        key={userId}
                        activeOpacity={0.85}
                        onPress={() => setSelectedInviteUser(user)}
                        style={{
                          borderWidth: 1,
                          borderColor: isSelected ? theme.primary : theme.border,
                          backgroundColor: isSelected ? theme.surface2 : theme.card,
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.text, fontWeight: "700" }}>
                            {user?.username || user?.name || "User"}
                          </Text>
                          {!!user?.atUsername && (
                            <Text style={{ color: theme.mutedText, marginTop: 2 }}>
                              @{user.atUsername}
                            </Text>
                          )}
                        </View>

                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.inviteActionsRow}>
                <TouchableOpacity
                  style={styles.inviteCancelBtn}
                  onPress={() => {
                    setShowInviteModal(false);
                    setInviteUsername("");
                    setSelectedInviteUser(null);
                  }}
                  activeOpacity={0.85}
                  disabled={inviteLoading || !!inviteSendingId}
                >
                  <Text style={styles.inviteCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.inviteSendBtn,
                    {
                      opacity:
                        inviteLoading || !!inviteSendingId || !selectedInviteUser ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleInviteUser}
                  activeOpacity={0.85}
                  disabled={inviteLoading || !!inviteSendingId || !selectedInviteUser}
                >
                  <Text style={styles.inviteSendText}>
                    {inviteSendingId ? "Sending..." : "Send Invite"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
        {/* ================= ACTIONS MODAL ================= */}
        <Modal transparent visible={showActions} animationType="fade" onRequestClose={() => setShowActions(false)}>
          <View style={styles.actionsOverlay}>
            <View style={styles.actionsBox}>
              <View style={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <TouchableOpacity key={r} onPress={() => selectedMessage && addReaction(selectedMessage, r)}
                    activeOpacity={0.85}>
                    <Text style={{ fontSize: 22 }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!selectedMessage?.serverId) {
                    Alert.alert("انتظر قليلًا", "لا يمكن الرد على الرسالة قبل وصولها للسيرفر.");
                    return;
                  }

                  setReplyTo(selectedMessage);
                  setShowActions(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.action}>Reply</Text>
              </TouchableOpacity>

              {(selectedMessage?.sender?.id === myUserId || canModerate) &&
                selectedMessage?.type !== "system" &&
                !selectedMessage?.deletedForEveryone && (
                  <TouchableOpacity onPress={() => selectedMessage && deleteMessage(selectedMessage)}
                    activeOpacity={0.85}>
                    <Text style={[styles.action, { color: theme.danger }]}>Delete</Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity onPress={() => setShowActions(false)} activeOpacity={0.85}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ================= IMAGE PREVIEW ================= */}
        <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)} activeOpacity={0.85}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>

            <Image
              source={typeof previewImage === "string" ? { uri: previewImage } : previewImage!}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>

        {/* ================= PIN MODAL ================= */}
        <Modal
          transparent
          visible={showPinModal}
          animationType="fade"
          onRequestClose={() => setShowPinModal(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            <Pressable style={styles.pinOverlay} onPress={() => setShowPinModal(false)}>
              <Pressable style={styles.pinSheet} onPress={() => { }}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  <View style={styles.pinHeader}>
                    <Text style={styles.pinTitle}>Pin a message</Text>
                    <TouchableOpacity
                      onPress={() => setShowPinModal(false)}
                      style={styles.pinCloseBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="close" size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pinList}>
                    <Text style={styles.pinLabel}>رسالة التثبيت</Text>

                    <View style={styles.pinInputWrap}>
                      <Ionicons name="text-outline" size={18} color={theme.icon} />
                      <TextInput
                        style={styles.pinInput}
                        placeholder="اكتب رسالة التثبيت (تقبل HTML مثل <b>...</b> و <br /> )"
                        placeholderTextColor={theme.subtleText}
                        value={pinHtml}
                        onChangeText={setPinHtml}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>

                    {!!pinHtml.trim() && (
                      <View style={styles.pinPreviewBox}>
                        <Text style={styles.pinPreviewTitle}>معاينة</Text>

                        <PinnedHtmlWebView
                          html={pinHtml}
                          width={width - 60}
                          minHeight={36}
                          textColor={theme.text}
                          textAlign="center"
                          fontSize={15}
                          lineHeight={26}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.pinActions}>
                    <TouchableOpacity
                      style={[styles.pinBtn, styles.pinBtnCancel]}
                      onPress={() => setShowPinModal(false)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.pinBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.pinBtn, !pinHtml.trim() && styles.pinBtnDisabled]}
                      disabled={!pinHtml.trim()}
                      activeOpacity={0.85}
                      onPress={async () => {
                        try {
                          const content = pinHtml.trim();
                          if (!content) return;

                          const created = await dispatch(
                            sendRoomMessage({ roomId, content, type: "announcement" })
                          ).unwrap();

                          const messageId = created?.message?._id;

                          if (!messageId) {
                            Alert.alert("Error", "لم يتم الحصول على id للرسالة الجديدة.");
                            return;
                          }

                          await dispatch(
                            pinRoomMessage({ roomId, messageId, pinned: true })
                          ).unwrap();

                          setShowPinModal(false);
                          setPinHtml("");
                          Alert.alert("Done", "تم إرسال الرسالة وتثبيتها");
                        } catch (e: any) {
                          Alert.alert("Error", e?.message || "Pin failed");
                        }
                      }}
                    >
                      <Ionicons name="pin" size={16} color={theme.primaryText} />
                      <Text style={styles.pinBtnText}>Pin</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>

        {/* ================= PIN PREVIEW FULL ================= */}
        <Modal transparent visible={pinPreviewFull} animationType="fade" onRequestClose={() => setPinPreviewFull(false)}>
          <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
            <Pressable style={styles.fullBox} onPress={() => { }}>
              <View style={styles.fullHeader}>
                <Text style={styles.fullTitle}>Pinned message</Text>

                {latestPinned && canModerate && (
                  <TouchableOpacity onPress={() => unpinMessage(latestPinned.id)} activeOpacity={0.85}>
                    <Text style={{ color: theme.danger, fontWeight: "900" }}>Unpin</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => setPinPreviewFull(false)} activeOpacity={0.85}>
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {(() => {
                const msg = latestPinned;
                const raw = msg?.text || "";
                return (
                  <>
                    <Text style={styles.fullMeta}>
                      {msg?.sender?.name ? `${msg.sender.name} • ` : ""}
                      {msg?.time || ""}
                    </Text>

                    <PinnedHtmlWebView
                      html={raw}
                      width={width - 56}
                      minHeight={36}
                      textColor={theme.text}
                      textAlign="center"
                      fontSize={16}
                      lineHeight={30}
                    />
                  </>
                );
              })()}
            </Pressable>
          </Pressable>
        </Modal>

        {/* ================= GIFT FULLSCREEN OVERLAY ================= */}
        {String(giftOverlay.giftKey || "").startsWith("boost") ? (
          <BoostLottieOverlay
            visible={giftOverlay.visible}
            title="🚀 Room Boosted!"
            subtitle={`${giftOverlay.fromName || "Someone"} boosted the room`}
            onDone={() => {
              if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
              setGiftOverlay({
                visible: false,
                messageId: null,
                giftKey: null,
                icon: "🎁",
                count: 45,
                lottie: undefined,
                fromName: undefined,
                toName: undefined,
              });
            }}
          />
        ) : giftOverlay.lottie ? (
          <GiftLottieOverlay
            visible={giftOverlay.visible}
            source={giftOverlay.lottie}
            fromName={giftOverlay.fromName}
            toName={giftOverlay.toName}
            durationMs={2600}
            onDone={() => {
              if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
              setGiftOverlay({
                visible: false,
                messageId: null,
                giftKey: null,
                icon: "🎁",
                count: 45,
                lottie: undefined,
                fromName: undefined,
                toName: undefined,
              });
            }}
          />
        ) : (
          <GiftBurstOverlay
            visible={giftOverlay.visible}
            icon={giftOverlay.icon}
            count={giftOverlay.count}
            fromName={giftOverlay.fromName}
            toName={giftOverlay.toName}
            durationMs={2600}
            onDone={() => {
              if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
              setGiftOverlay({
                visible: false,
                messageId: null,
                giftKey: null,
                icon: "🎁",
                count: 45,
                lottie: undefined,
                fromName: undefined,
                toName: undefined,
              });
            }}
          />
        )}

        {/* ================= GIFT PICKER ================= */}
        <GiftPickerModal
          visible={giftPicker.visible}
          target={giftPicker.target}
          onClose={() => setGiftPicker({ visible: false, target: null })}
          theme={theme}
          onPick={async (g) => {
            try {
              const target = giftPicker.target;
              setGiftPicker({ visible: false, target: null });

              if (!roomId) return;

              const isBoost = String(g.key || "").startsWith("boost");

              if (!isBoost && !target?.id) {
                Alert.alert("Error", "Target user not found");
                return;
              }

              const tempGift = TEMP_GIFTS.find((x) => x.key === g.key);
              const giftPrice = Number(tempGift?.price || 0);

              if (myCoinz < giftPrice) {
                Alert.alert(
                  "رصيد غير كافٍ",
                  `هذه الهدية تحتاج ${giftPrice} Coinz، بينما رصيدك الحالي ${myCoinz} Coinz.`,
                  [
                    { text: "إلغاء", style: "cancel" },
                    {
                      text: "الذهاب إلى المتجر",
                      onPress: () => router.push("/store")
                    }
                  ]
                );
                return;
              }

              if (giftPrice > 0) {
                const debitRes = await dispatch(
                  debitMyCoinz({
                    amount: giftPrice,
                    reason: `gift:${g.key}`
                  }) as any
                );

                if (!debitMyCoinz.fulfilled.match(debitRes)) {
                  Alert.alert(
                    "تعذر الخصم",
                    String((debitRes as any)?.payload || "فشل خصم الرصيد")
                  );
                  await dispatch(getMyInventory() as any);
                  return;
                }

                await dispatch(getMyInventory() as any);
              }

              const meta = GIFT_META[g.key] || { icon: "🎁", count: 45, lottie: undefined };

              await dispatch(
                sendRoomMessage({
                  roomId,
                  type: "gift",
                  content: g.key,
                  gift: {
                    key: g.key,
                    icon: meta.icon,
                    targetId: isBoost ? undefined : target!.id,
                    targetName: isBoost ? undefined : target!.name,
                    count: meta.count
                  }
                } as any)
              ).unwrap();

              const toLabel = isBoost ? "Room" : target?.name || "Someone";
              const announce = `🎁 <b>${myName}</b> sent ${meta.icon} to <b>${toLabel}</b>`;

              await dispatch(
                sendRoomMessage({
                  roomId,
                  content: announce,
                  type: "announcement"
                })
              ).unwrap();

              await dispatch(getMyInventory() as any);
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to send gift");
              await dispatch(getMyInventory() as any);
            }
          }}
        />
      </SafeAreaView>

      <ActiveRoomsDrawer
        visible={showActiveRoomsDrawer}
        onClose={() => setShowActiveRoomsDrawer(false)}
        currentRoomId={roomId}
        theme={theme}
      />
      <ReactionDetailsModal
        visible={showReactionDetails}
        message={reactionDetailsMessage}
        onClose={closeReactionDetails}
        theme={theme}
      />
      <StickerPickerModal
        visible={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onPick={sendSticker}
        theme={theme}
      />
      <MediaPickerModal
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onPickImage={sendImage}
        onPickGif={sendGifFromDevice}
        onPickSticker={() => setShowStickerPicker(true)}
        theme={theme}
      />

      <UploadingOverlay
        visible={uploading.visible}
        title={uploading.title}
        sub={uploading.sub}
        seconds={uploadSeconds}
        previewUri={uploading.previewUri}
        kind={uploading.kind}
        theme={theme}
      />
    </View >
  );
}
