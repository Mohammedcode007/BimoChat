// // app/(tabs)/room/[id].tsx
// // ✅ تعديل شامل ليتوافق مع الدوال/الأحداث الجديدة في الباك + تحسينات:
// // 1) عرض Active Online من Redux (activeCountByRoom) بدل الاعتماد على usersCount
// // 2) تغيير الـ Role عبر Socket ACK (room:role:set) + التحديث الحقيقي يصل عبر room:roles:update
// // 3) حذف الرسالة: يسمح لصاحب الرسالة + (creator/owner/admin)
// // 4) إصلاح scrollToBottom مع inverted list
// // 5) تحسين mapReduxToUIMessage: قراءة reactions من الباك إن وجدت (أول reaction للعرض)
// // 6) تنظيف audio timers + unload sound عند الخروج

// import { Ionicons } from "@expo/vector-icons";
// import { Audio, ResizeMode, Video } from "expo-av";
// import * as Clipboard from "expo-clipboard";
// import * as DocumentPicker from "expo-document-picker";
// import * as ImagePicker from "expo-image-picker";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Image,
//   ImageSourcePropType,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useWindowDimensions,
//   View
// } from "react-native";
// import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
// import RenderHTML from "react-native-render-html";
// import { SafeAreaView } from "react-native-safe-area-context";

// // ✅ Redux
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import {
//   clearBannedFlag,
//   clearKickedFlag,
//   fetchRoomMessages,
//   fetchRoomStats,
//   fetchRoomUsers,
//   leaveAndRefreshRooms,
//   leaveRoomAndExit,
//   pinRoomMessage,
//   selectBannedFlag,
//   selectKickedFlag,
//   selectRoomActiveCount,
//   selectRoomAvatarById,
//   selectRoomLoadingMessages,
//   selectRoomMessages,
//   selectRoomNameById,
//   selectRoomUsers,
//   sendRoomMessage,
//   socketRoleSetFailed,
//   socketRoleSetRequested,
//   socketRoleSetSucceeded
// } from "@/redux/slices/room.slice";

// // ✅ Socket helpers
// import { RocketBoostOverlay } from "@/components/RocketBoostOverlay";
// import { boostRoom } from "@/redux/slices/roomControl.slice";
// import {
//   banRoomUserSocket,
//   deleteRoomSocketMessage,
//   joinRoomSocket,
//   kickRoomUserSocket,
//   leaveRoomSocket,
//   setRoomUserRoleSocket,
//   toggleRoomReaction as toggleRoomReactionSocket
// } from "@/services/socket";

// /* ================= TYPES ================= */
// type BadgeKey = string;

// // ✅ ألوان/أيقونات البادجات حسب النوع
// const BADGE_META: Record<BadgeKey, { label: string; icon?: string; bg: string; fg: string }> = {
//   gold: { label: "GOLD", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
//   blue: {
//     label: "",
//     icon: "twitter-verified", // سنعالجها يدويًا في الرندر
//     bg: "transparent",
//     fg: "#1DA1F2"
//   },
//   business: { label: "BUSINESS", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },

//   // أمثلة إضافية إن أحببت
//   vip: { label: "VIP", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
//   pro: { label: "PRO", icon: "⚡", bg: "#DCFCE7", fg: "#166534" },
// };
// type GiftItem = {
//   key: string;
//   title: string;
//   icon: string;      // emoji مؤقتًا
//   price?: number;    // اختياري
// };

// const TEMP_GIFTS: GiftItem[] = [
//   { key: "gift_rose", title: "Rose", icon: "🌹", price: 10 },
//   { key: "gift_like", title: "Like", icon: "👍", price: 5 },
//   { key: "gift_fire", title: "Fire", icon: "🔥", price: 15 },
//   { key: "gift_crown", title: "Crown", icon: "👑", price: 25 },
//   { key: "gift_rocket", title: "Rocket", icon: "🚀", price: 50 },
// ];
// const GIFT_META: Record<string, { icon: string; count: number }> = {
//   gift_rose: { icon: "🌹", count: 40 },
//   gift_like: { icon: "👍", count: 55 },
//   gift_fire: { icon: "🔥", count: 60 },
//   gift_crown: { icon: "👑", count: 35 },
//   gift_rocket: { icon: "🚀", count: 45 },

//   // لو عندك boost_rocket كـ giftKey:
//   boost_rocket: { icon: "🚀", count: 55 },
// };
// function GiftPickerModal({
//   visible,
//   onClose,
//   target,
//   onPick
// }: {
//   visible: boolean;
//   onClose: () => void;
//   target?: UserUI | null;
//   onPick: (gift: { key: string }) => void; // مؤقت
// }) {
//   return (
//     <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
//       <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }} onPress={onClose}>
//         <Pressable
//           style={{
//             backgroundColor: "#FFF",
//             borderTopLeftRadius: 18,
//             borderTopRightRadius: 18,
//             paddingHorizontal: 14,
//             paddingTop: 12,
//             paddingBottom: 18
//           }}
//           onPress={() => { }}
//         >
//           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//             <View style={{ flex: 1, paddingRight: 10 }}>
//               <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>
//                 Send a Gift
//               </Text>
//               <Text style={{ marginTop: 4, fontSize: 12, color: "#6B7280" }} numberOfLines={1}>
//                 To: {target?.name || "User"}
//               </Text>
//             </View>

//             <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
//               <Ionicons name="close" size={20} color="#111827" />
//             </TouchableOpacity>
//           </View>

//           <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 }} />

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
//                   borderColor: "#E5E7EB",
//                   backgroundColor: "#F9FAFB",
//                   borderRadius: 14,
//                   paddingVertical: 12,
//                   alignItems: "center"
//                 }}
//               >
//                 <Text style={{ fontSize: 24 }}>{g.icon}</Text>
//                 <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: "#111827" }} numberOfLines={1}>
//                   {g.title}
//                 </Text>
//                 {!!g.price && (
//                   <Text style={{ marginTop: 4, fontSize: 11, color: "#6B7280", fontWeight: "700" }}>
//                     {g.price} Coinz
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={{ marginTop: 12, fontSize: 12, color: "#6B7280", lineHeight: 18 }}>
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

//   // لكل عنصر: X + translateY + scale + rotate بسيط
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

//     opacity.setValue(0);
//     particles.forEach((p) => p.t.setValue(0));

//     // Fade in
//     Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();

//     // Play particles
//     const anims = particles.map((p) =>
//       Animated.timing(p.t, {
//         toValue: 1,
//         duration: p.dur,
//         delay: p.delay,
//         useNativeDriver: true
//       })
//     );

//     Animated.parallel(anims).start();

//     // Fade out near the end, then done
//     const fadeOutAt = Math.max(500, durationMs - 450);
//     const fadeTimer = setTimeout(() => {
//       Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
//     }, fadeOutAt);

//     const doneTimer = setTimeout(() => {
//       onDone();
//     }, durationMs);

//     return () => {
//       clearTimeout(fadeTimer);
//       clearTimeout(doneTimer);
//     };
//   }, [visible]);

//   if (!visible) return null;

//   return (
// <View
//   pointerEvents="none"
//   style={{
//     position: "absolute",
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "transparent", // ✅ شفافة بالكامل
//     alignItems: "center",
//     justifyContent: "center"
//   }}
// >
//       <Animated.View style={{ opacity, width: "100%", height: "100%" }}>
//         {/* عنوان صغير عصري */}
//         <View
//           style={{
//             position: "absolute",
//             top: 70,
//             left: 16,
//             right: 16,
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
//               {fromName ? `${fromName} → ` : ""}{toName ? toName : "Someone"}
//             </Text>
//           </View>
//         </View>

//         {/* العناصر المتحركة */}
//         {particles.map((p, idx) => {
//           const xPx = 12 + p.x * (width - 24);
//           const startY = height * p.startY;
//           const endY = height * p.endY;

//           const translateY = p.t.interpolate({
//             inputRange: [0, 1],
//             outputRange: [startY, endY]
//           });

//           const scale = p.t.interpolate({
//             inputRange: [0, 0.25, 1],
//             outputRange: [0.7, 1.1, 0.95]
//           });

//           const rotate = p.t.interpolate({
//             inputRange: [0, 1],
//             outputRange: [`${-p.spin}deg`, `${p.spin}deg`]
//           });

//           const particleOpacity = p.t.interpolate({
//             inputRange: [0, 0.15, 0.9, 1],
//             outputRange: [0, 1, 1, 0]
//           });

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
// // ✅ تنظيف + توحيد + إزالة تكرار
// const normalizeBadges = (badges?: string[]) => {
//   const arr = Array.isArray(badges) ? badges : [];
//   const cleaned = arr
//     .map((x) => String(x || "").trim().toLowerCase())
//     .filter(Boolean);

//   // إزالة التكرار مع الحفاظ على الترتيب
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

// // ✅ إن أردت اعتبار verificationType Badge أيضًا (اختياري)
// // لو لا تريد ذلك، احذف هذا كله ولن يتأثر شيء
// const verificationToBadge = (verificationType?: string) => {
//   const v = String(verificationType || "").trim().toLowerCase();
//   if (!v || v === "none") return null;
//   // قد يجيك "gold" أو "blue" أو "business"
//   return v;
// };
// type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";
// type RoomRole = "creator" | "owner" | "admin" | "member";
// type SnapshotRole = string; // ✅ أي قيمة (user / moderator / ...)
// type UserUI = {
//   id: string;
//   name: string;
//   avatar?: string;
//   role?: RoomRole;
//   activeBadges?: string[];

//   // ✅ دور snapshot (للبادجات/التحقق... إلخ)
//   snapshotRole?: SnapshotRole;
//   isOnline?: boolean;
// };

// type MessageUI = {
//   id: string;
//   type: "text" | "image" | "file" | "audio" | "video" | "system" | "gift"; // ✅ أضف gift
//   systemType?: "join" | "leave" | "announcement" | "promotion" | "ban" | "role";

//   text?: string;
//   uri?: string;

//   sender?: UserUI;
//   time: string;

//   replyTo?: MessageUI;
//   reaction?: Reaction;
//   gift?: {
//     key: string;            // gift_rose ...
//     icon?: string;          // 🌹 ...
//     targetId?: string;      // userId
//     targetName?: string;    // username
//     count?: number;         // كم عنصر يظهر في الانيميشن
//   };
//   deletedForEveryone?: boolean;
// };

// const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

// const COLORS = {
//   me: "#6D5DF6",
//   other: "#FFFFFF",
//   bg: "#F6F7FB",
//   time: "#9CA3AF"
// };
// // ✅ 1) أضف هذه الدوال/الثوابت داخل ملف room/[id].tsx (يفضّل فوق MessageItem)

// // ألوان النجمة حسب الدور
// const ROLE_STAR_COLOR: Record<string, string> = {
//   creator: "#F59E0B", // ذهبي
//   owner: "#8B5CF6",   // بنفسجي
//   admin: "#3B82F6"    // أزرق
// };

// // هل يظهر Star؟
// const shouldShowStar = (role?: RoomRole) =>
//   role === "creator" || role === "owner" || role === "admin";

// const getStarColor = (role?: RoomRole) =>
//   role ? ROLE_STAR_COLOR[role] || "#111827" : "#111827";
// /* =====================================================
//    ✅ MESSAGE ITEM
// ===================================================== */

// // ✅ Gifts الموجودة في assets
// // ✅ Gifts Lottie الموجودة في assets (ملفات json)
// const GIFT_LOTTIES: Record<string, any> = {
//   boost_rocket: require("../../assets/lottie/rocket_boot.json"),
//   // أضف المزيد حسب الحاجة
// };

// const getGiftLottieSource = (key?: string) => {
//   if (!key) return null;
//   return GIFT_LOTTIES[key] || null;
// };

// const BADGE_ORDER: BadgeKey[] = [
//   "gold",
//   "blue",
//   "business",
//   "vip",
//   "pro"
// ];

// const pickPrimaryBadge = (badges?: string[]) => {
//   const list = normalizeBadges(badges);
//   if (!list.length) return null;

//   // اختر أول بادج مهمة حسب ترتيبك
//   for (const key of BADGE_ORDER) {
//     if (list.includes(key)) return key;
//   }
//   // لو لا يوجد من القائمة، خذ أول واحدة
//   return list[0];
// };


// const NameBadge = ({ badgeKey }: { badgeKey?: string | null }) => {
//   if (!badgeKey) return null;

//   const meta = BADGE_META[badgeKey];

//   if (!meta) return null;

//   // ✅ حالة التوثيق الأزرق مثل تويتر
//   if (badgeKey === "blue") {
//     return (
//       <Ionicons
//         name="checkmark-circle"
//         size={16}
//         color="#1DA1F2"
//         style={{ marginLeft: 6 }}
//       />
//     );
//   }

//   // ✅ باقي البادجات بشكل chip
//   return (
//     <View style={[nameBadgeStyles.badge, { backgroundColor: meta.bg }]}>
//       {!!meta.icon && (
//         <Text style={[nameBadgeStyles.icon, { color: meta.fg }]}>
//           {meta.icon}
//         </Text>
//       )}
//       {/* {!!meta.label && (
//         <Text style={[nameBadgeStyles.text, { color: meta.fg }]}>
//           {meta.label}
//         </Text>
//       )} */}
//     </View>
//   );
// };

// const nameBadgeStyles = StyleSheet.create({
//   badge: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 999
//   },
//   icon: { fontSize: 14 },
//   text: { fontSize: 11, fontWeight: "900" }
// });
// function MessageItem({
//   item,
//   isMe,
//   showName,
//   onLongPress,
//   onPressImage,
//   onTogglePlay,
//   playingId,
//   progressAnim,
//   giftDone,
//   onGiftDone,
//   onAvatarLongPress,
// }: {
//   item: MessageUI;
//   isMe: boolean;
//   showName: boolean;
//   onLongPress: () => void;
//   onPressImage: (uri: string) => void;
//   onTogglePlay: (uri: string, id: string) => void;
//   playingId: string | null;
//   progressAnim: Animated.Value;
//   giftDone?: boolean;
//   onGiftDone?: () => void;
//   onAvatarLongPress: (u?: UserUI) => void;
// }) {
//   const { width } = useWindowDimensions();

//   if (item.type === "system") {
//     return (
//       <View style={bubbleStyles.sysWrap}>
//         <View style={bubbleStyles.sysBubble}>
//           <RenderHTML
//             contentWidth={width - 40}
//             source={{ html: String(item.text || "") }}
//             baseStyle={{
//               fontSize: 13,
//               color: "#111827",
//               textAlign: "center",
//               fontWeight: "600",
//               lineHeight: 18
//             }}
//           />
//           <Text style={bubbleStyles.sysTime}>{item.time}</Text>
//         </View>
//       </View>
//     );
//   }

//   const senderRole = item.sender?.role;
//   const showStar = showName && !isMe && shouldShowStar(senderRole);
//   const starColor = getStarColor(senderRole);
//   const copyMessageContent = async () => {
//     if (item.type === "system") return;
//     if (item.deletedForEveryone) return;

//     // ننسخ حسب النوع
//     const value =
//       item.type === "text"
//         ? (item.text || "")
//         : item.type === "file"
//           ? (item.text || item.uri || "")
//           : item.type === "image" || item.type === "video" || item.type === "audio"
//             ? (item.uri || "")
//             : "";

//     const v = String(value || "").trim();
//     if (!v) return;

//     await Clipboard.setStringAsync(v);
//     Alert.alert("Copied", "تم نسخ محتوى الرسالة");
//   };
//   return (
//     <View style={[bubbleStyles.row, isMe ? bubbleStyles.rowMe : bubbleStyles.rowOther]}>
//       {!isMe && (
//         <Pressable
//           style={bubbleStyles.avatarWrapLeft}
//           onLongPress={() => onAvatarLongPress(item.sender)}
//           delayLongPress={350}
//         >
//           <Image
//             source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
//             style={bubbleStyles.avatar}
//           />
//           {shouldShowStar(senderRole) && (
//             <Text style={[bubbleStyles.avatarStar, { color: starColor }]}>★</Text>
//           )}
//         </Pressable>
//       )}
//       <TouchableOpacity
//         activeOpacity={0.85}
//         onLongPress={onLongPress}
//         onPress={() => {
//           // ✅ لا ننسخ عند الضغط على أنواع لها تفاعل خاص داخل الفقاعة
//           // (الصورة/الصوت لهم Touchables خاصة بهم بالفعل)
//           if (item.type === "text" || item.type === "file") {
//             copyMessageContent();
//           }
//         }}
//         style={[
//           bubbleStyles.bubble,
//           isMe ? bubbleStyles.bubbleMe : bubbleStyles.bubbleOther
//         ]}      >
//         {showName && !!item.sender?.name && (
//           <View style={bubbleStyles.nameWrap}>
//             <View style={bubbleStyles.nameRow}>
//               <Text style={bubbleStyles.senderName} numberOfLines={1}>
//                 {item.sender.name}
//               </Text>

//               {/* ✅ بادج بجانب الاسم */}
//               <NameBadge badgeKey={pickPrimaryBadge(item.sender?.activeBadges)} />
//             </View>

//             {/* ✅ خط تحت الاسم */}
//             <View style={bubbleStyles.nameUnderline} />
//           </View>
//         )}

//         {!!item.deletedForEveryone ? (
//           <Text style={bubbleStyles.msgTextMuted}>🚫 تم حذف الرسالة</Text>
//         ) : (
//           <>
//             {item.type === "text" && <Text style={bubbleStyles.msgText}>{item.text}</Text>}
//           {item.type === "gift" ? (
//   (() => {
//     const key = item.gift?.key || "";
//     const senderName = item.sender?.name || "Someone";

//     // ✅ حالة Boost
//     if (key.startsWith("boost")) {
//       return (
//         <Text style={[bubbleStyles.msgTextMuted, { fontWeight: "800", color: "#F59E0B" }]}>
//           🚀 {senderName} Boosted the Room
//         </Text>
//       );
//     }

//     // ✅ باقي الهدايا العادية
//     return (
//       <Text style={bubbleStyles.msgTextMuted}>
//         🎁 {senderName} → {item.gift?.targetName || "Someone"} {item.gift?.icon || "🎁"}
//       </Text>
//     );
//   })()
// ) : null}
//             {item.type === "image" && item.uri ? (
//               <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(item.uri!)}>
//                 <Image source={{ uri: item.uri }} style={bubbleStyles.media} />
//               </TouchableOpacity>
//             ) : null}

//             {item.type === "video" && item.uri ? (
//               <View style={bubbleStyles.videoWrapper}>
//                 <Video
//                   source={{ uri: item.uri }}
//                   style={bubbleStyles.video}
//                   useNativeControls
//                   resizeMode={ResizeMode.CONTAIN}
//                   isLooping={false}
//                 />
//               </View>
//             ) : null}

//             {item.type === "file" ? (
//               <View style={bubbleStyles.fileRow}>
//                 <Text style={bubbleStyles.fileIcon}>📄</Text>
//                 <Text style={bubbleStyles.fileName} numberOfLines={1}>
//                   {item.text || "File"}
//                 </Text>
//               </View>
//             ) : null}

//             {item.type === "audio" && item.uri ? (
//               <TouchableOpacity
//                 style={bubbleStyles.audioRow}
//                 activeOpacity={0.85}
//                 onPress={() => onTogglePlay(item.uri!, item.id)}
//               >
//                 <Ionicons
//                   name={playingId === item.id ? "pause" : "play"}
//                   size={20}
//                   color={isMe ? "#FFF" : "#111827"}
//                 />

//                 <View style={bubbleStyles.audioProgressWrapper}>
//                   <View style={bubbleStyles.audioProgressBg}>
//                     <Animated.View
//                       style={[
//                         bubbleStyles.audioProgressFill,
//                         {
//                           width:
//                             playingId === item.id
//                               ? progressAnim.interpolate({
//                                 inputRange: [0, 1],
//                                 outputRange: ["0%", "100%"]
//                               })
//                               : "0%",
//                           backgroundColor: isMe ? "#FFF" : "#6D5DF6"
//                         }
//                       ]}
//                     />
//                   </View>
//                   <Text style={[bubbleStyles.audioLabel, { color: isMe ? "#E5E7EB" : "#374151" }]}>
//                     Voice message
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             ) : null}
//           </>
//         )}

//         {item.reaction && (
//           <View style={bubbleStyles.reaction}>
//             <Text>{item.reaction}</Text>
//           </View>
//         )}

//         {/* <Text style={[bubbleStyles.time, { color: isMe ? "#E5E7EB" : COLORS.time }]}>{item.time}</Text> */}
//       </TouchableOpacity>
//       {isMe && (
//         <Pressable
//           style={bubbleStyles.avatarWrapRight}
//           onLongPress={() => onAvatarLongPress(item.sender)}
//           delayLongPress={350}
//         >
//           <Image
//             source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
//             style={bubbleStyles.avatar}
//           />
//           {shouldShowStar(senderRole) && (
//             <Text style={[bubbleStyles.avatarStarRight, { color: starColor }]}>★</Text>
//           )}
//         </Pressable>
//       )}
//     </View>
//   );
// }

// /* =====================================================
//    ✅ USERS MODAL
// ===================================================== */

// function UsersModal({
//   visible,
//   onClose,
//   users,
//   myUserId,
//   myRole,
//   onCopyUser,
//   onChangeRole,
//    onKickUser,
//   onBanUser
// }: {
//   visible: boolean;
//   onClose: () => void;
//   users: UserUI[];
//   myUserId: string;
//   myRole?: UserUI["role"];
//   onCopyUser: (u: UserUI) => void;
//   onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
//     onKickUser: (u: UserUI) => void;
//   onBanUser: (u: UserUI) => void;
// }) {
//   const canManage = myRole === "creator" || myRole === "owner" || myRole === "admin";

//   const roleLabel = (r?: string) => {
//     if (r === "creator") return "Creator";
//     if (r === "owner") return "Owner";
//     if (r === "admin") return "Admin";
//     return "Member";
//   };

//   const RoleChip = ({
//     title,
//     active,
//     onPress
//   }: {
//     title: string;
//     active: boolean;
//     onPress: () => void;
//   }) => (
//     <TouchableOpacity
//       onPress={onPress}
//       style={[usersStyles.roleChip, active && usersStyles.roleChipActive]}
//       activeOpacity={0.85}
//     >
//       <Text style={[usersStyles.roleChipText, active && usersStyles.roleChipTextActive]}>{title}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
//       <Pressable style={usersStyles.overlay} onPress={onClose}>
//         <Pressable style={usersStyles.sheet} onPress={() => { }}>
//           <View style={usersStyles.header}>
//             <Text style={usersStyles.title}>Users</Text>
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={22} />
//             </TouchableOpacity>
//           </View>

//           <View style={usersStyles.note}>
//             <Text style={usersStyles.noteText}>
//               اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
//               {canManage ? "يمكنك أيضًا تغيير الدور." : "ليس لديك صلاحية لتغيير الأدوار."}
//             </Text>
//           </View>

//           <View style={usersStyles.list}>
//             {users.map((u) => {
//               const isMe = u.id === myUserId;
//               return (
//                 <TouchableOpacity
//                   key={u.id}
//                   style={usersStyles.row}
//                   onPress={() => onCopyUser(u)}
//                   activeOpacity={0.85}
//                 >
//                   <Image
//                     source={{ uri: u.avatar || "https://i.pravatar.cc/150?img=12" }}
//                     style={usersStyles.avatar}
//                   />

//                   <View style={{ flex: 1 }}>
//                     <View style={usersStyles.rowTop}>
//                       <Text style={usersStyles.name} numberOfLines={1}>
//                         {u.name} {isMe ? "(You)" : ""}
//                       </Text>
//                       <View style={usersStyles.badge}>
//                         <Text style={usersStyles.badgeText}>{roleLabel(u.role)}</Text>
//                       </View>
//                     </View>

//                     <Text style={usersStyles.sub} numberOfLines={1}>
//                       ID: {u.id}
//                     </Text>

//                     {canManage && !isMe && (
//                       <View style={usersStyles.rolesRow}>
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
//   <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
//     <TouchableOpacity
//       onPress={() => onKickUser(u)}
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//         borderRadius: 10,
//         backgroundColor: "#FEF3C7",
//         borderWidth: 1,
//         borderColor: "#F59E0B"
//       }}
//       activeOpacity={0.85}
//     >
//       <Text style={{ fontWeight: "800", color: "#92400E" }}>Kick</Text>
//     </TouchableOpacity>

//     <TouchableOpacity
//       onPress={() => onBanUser(u)}
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 8,
//         borderRadius: 10,
//         backgroundColor: "#FEE2E2",
//         borderWidth: 1,
//         borderColor: "#EF4444"
//       }}
//       activeOpacity={0.85}
//     >
//       <Text style={{ fontWeight: "800", color: "#991B1B" }}>Ban</Text>
//     </TouchableOpacity>
//   </View>
// )}
//                   </View>

//                   <Ionicons name="copy-outline" size={18} color="#6B7280" />
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }

// /* =====================================================
//    ✅ MAIN SCREEN
// ===================================================== */

// export default function ChatScreen() {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { width } = useWindowDimensions();

//   const { id } = useLocalSearchParams<{ id: string }>();
//   const roomId = String(id || "");
//   const [pinHtml, setPinHtml] = useState<string>("");
//   const flatListRef = useRef<any>(null);

//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const progressAnim = useRef(new Animated.Value(0)).current;

//   const authUser = useAppSelector((state) => state.auth.user);
//   const myUserId = String(authUser?._id || authUser?.id || "");
//   const myName = String(authUser?.username || authUser?.name || "Me");
//   const myAvatar = String(authUser?.avatar || "https://i.pravatar.cc/150?img=32");

//   const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
//   const loadingMessages = useAppSelector(selectRoomLoadingMessages);
//   const roomUsers = useAppSelector((state) => selectRoomUsers(state, roomId));
//   const roomName = useAppSelector((state) => selectRoomNameById(state, roomId));
//   const roomAvatar = useAppSelector((state) => selectRoomAvatarById(state, roomId));
//   // ✅ Active online count from slice (socket + stats)
//   const activeCount = useAppSelector((state) => selectRoomActiveCount(state, roomId));
//   const [giftPicker, setGiftPicker] = useState<{
//     visible: boolean;
//     target?: UserUI | null;
//   }>({ visible: false, target: null });
//   // ✅ دوري في الغرفة
//   const myRole = useMemo<UserUI["role"]>(() => {
//     const me = (roomUsers || []).find((u: any) => String(u?._id) === myUserId);
//     return me?.role;
//   }, [roomUsers, myUserId]);

//   const canModerate = useMemo(
//     () => myRole === "creator" || myRole === "owner" || myRole === "admin",
//     [myRole]
//   );

//   const usersMap = useMemo(() => {
//     const map = new Map<string, { username?: string; avatar?: string; role?: any }>();
//     for (const u of roomUsers || []) {
//       if (u?._id) map.set(String(u._id), { username: u.username, avatar: u.avatar, role: u.role });
//     }
//     if (myUserId) map.set(myUserId, { username: myName, avatar: myAvatar, role: myRole });
//     return map;
//   }, [roomUsers, myUserId, myName, myAvatar, myRole]);

//   // UI states
//   const [text, setText] = useState("");
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);

//   const [replyTo, setReplyTo] = useState<MessageUI | null>(null);
//   const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(null);
//   const [showActions, setShowActions] = useState(false);
//   const [giftDoneById, setGiftDoneById] = useState<Record<string, boolean>>({});
//   const markGiftDone = (id: string) => setGiftDoneById((prev) => ({ ...prev, [id]: true }));

//   // ✅ Fullscreen Gift Overlay
//   const [giftOverlay, setGiftOverlay] = useState<{
//     visible: boolean;
//     messageId: string | null;
//     giftKey: string | null;
//     icon: string;
//     count: number;
//     fromName?: string;
//     toName?: string;
//   }>({
//     visible: false,
//     messageId: null,
//     giftKey: null,
//     icon: "🎁",
//     count: 45,
//     fromName: undefined,
//     toName: undefined
//   });

//   const giftOverlayTimerRef = useRef<any>(null);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [playbackProgress, setPlaybackProgress] = useState(0);
//   const [playbackDuration, setPlaybackDuration] = useState(1);
//   const [activeAudio, setActiveAudio] = useState<MessageUI | null>(null);
//   const [showPinModal, setShowPinModal] = useState(false);
//   const [pinSelectedId, setPinSelectedId] = useState<string | null>(null);
//   const [pinPreviewFull, setPinPreviewFull] = useState(false);
//   const [isRecordingPaused, setIsRecordingPaused] = useState(false);
//   const [recordDuration, setRecordDuration] = useState(0);
//   const recordTimer = useRef<any>(null);
//   const [pinPreviewMessageId, setPinPreviewMessageId] = useState<string | null>(null);
//   const [previewImage, setPreviewImage] = useState<string | ImageSourcePropType | null>(null);
//   // بدل string | null  // ✅ Menu
//   const [showRoomMenu, setShowRoomMenu] = useState(false);
//   const [showUsersModal, setShowUsersModal] = useState(false);

//   // ✅ لمنع leave مرتين
//   const didLeaveRef = useRef(false);
// const kicked = useAppSelector((state) => selectKickedFlag(state, roomId));
// const banned = useAppSelector((state) => selectBannedFlag(state, roomId));
// useEffect(() => {
//   if (!roomId) return;
//   if (!kicked) return;

//   // امنع تكرار التنفيذ
//   if (didLeaveRef.current) return;
//   didLeaveRef.current = true;

//   const msg = kicked?.message || "تم طردك من الغرفة.";

//   Alert.alert("تم الطرد", msg, [
//     {
//       text: "حسناً",
//       onPress: async () => {
//         try {
//           // تنظيف من الستور + خروج
//           await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
//         } catch {}

//         // امسح الفلاج بعد التعامل
//         dispatch(clearKickedFlag({ roomId }));

//         router.back();
//       },
//     },
//   ]);
// }, [kicked, roomId, dispatch, router]);
// useEffect(() => {
//   if (!roomId) return;
//   if (!banned) return;

//   if (didLeaveRef.current) return;
//   didLeaveRef.current = true;

//   const reason = banned?.reason ? `السبب: ${banned.reason}` : "";
//   const msg = reason || "تم حظرك من الغرفة.";

//   Alert.alert("تم الحظر", msg, [
//     {
//       text: "حسناً",
//       onPress: async () => {
//         try {
//           await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
//         } catch {}

//         dispatch(clearBannedFlag({ roomId }));

//         router.back();
//       },
//     },
//   ]);
// }, [banned, roomId, dispatch, router]);
// const onBanUser = (u: UserUI) => {
//   if (!canModerate) return;
//   if (!u?.id || u.id === myUserId) return;
//   if (!roomId) return;

//   Alert.alert("Ban user", `Ban ${u.name}?`, [
//     { text: "Cancel", style: "cancel" },
//     {
//       text: "Ban",
//       style: "destructive",
//       onPress: async () => {
//         try {
//           const reason = "Violation"; // أو اجعلها input لاحقًا

//           const ack = await banRoomUserSocket({ roomId, targetId: u.id, reason });

//           if (!ack?.ok) {
//             Alert.alert("Error", ack?.message || "Ban failed");
//             return;
//           }

//           Alert.alert("Done", `${u.name} banned`);

//           // ✅ اختياري: تحديث المستخدمين
//           dispatch(fetchRoomUsers(roomId));
//         } catch (e: any) {
//           Alert.alert("Error", e?.message || "Ban failed");
//         }
//       }
//     }
//   ]);
// };
// const onKickUser = (u: UserUI) => {
//   if (!canModerate) return;
//   if (!u?.id || u.id === myUserId) return;
//   if (!roomId) return;

//   Alert.alert("Kick user", `Kick ${u.name}?`, [
//     { text: "Cancel", style: "cancel" },
//     {
//       text: "Kick",
//       style: "destructive",
//       onPress: async () => {
//         try {
//           const ack = await kickRoomUserSocket({ roomId, targetId: u.id });

//           if (!ack?.ok) {
//             Alert.alert("Error", ack?.message || "Kick failed");
//             return;
//           }

//           Alert.alert("Done", `${u.name} kicked`);

//           // ✅ اختياري: تحديث قائمة المستخدمين عندك سريعًا
//           // (لأن kick قد ينعكس عبر room:users:update أو room:roles:update، لكن هذا يجعلها أسرع)
//           dispatch(fetchRoomUsers(roomId));
//         } catch (e: any) {
//           Alert.alert("Error", e?.message || "Kick failed");
//         }
//       }
//     }
//   ]);
// };
//   /* ================= HELPERS ================= */
//   const stripHtmlToText = (input: string) => {
//     // ✅ لا ننفّذ HTML — فقط نزيل التاجز ونحافظ على النص
//     const s = String(input || "");
//     // إزالة script/style بالكامل
//     const noScripts = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
//     const noStyles = noScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
//     // تحويل <br> و </p> إلى سطر جديد
//     const withBreaks = noStyles
//       .replace(/<br\s*\/?>/gi, "\n")
//       .replace(/<\/p>/gi, "\n");
//     // إزالة باقي التاجز
//     const textOnly = withBreaks.replace(/<[^>]+>/g, "");
//     // فك بعض الـ entities الأساسية (بدون مكتبات)
//     return textOnly
//       .replace(/&nbsp;/g, " ")
//       .replace(/&lt;/g, "<")
//       .replace(/&gt;/g, ">")
//       .replace(/&amp;/g, "&")
//       .trim();
//   };

//   const clipText = (s: string, max = 120) => {
//     const t = String(s || "");
//     if (t.length <= max) return t;
//     return t.slice(0, max - 1) + "…";
//   };

//   const safeDisplayText = (content: string) => {
//     // ✅ للعرض في قائمة التثبيت: نستخدم النص المنقّى
//     const cleaned = stripHtmlToText(content);
//     return cleaned || "—";
//   };

//   // ✅ inverted list => bottom is offset 0
//   const scrollToBottom = () => {
//     try {
//       flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
//     } catch {
//       // ignore
//     }
//   };

//   const formatTime = (millis: number) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   const resolveUserNameById = (id?: string) => {
//     if (!id) return "";
//     const v = usersMap.get(String(id));
//     return String(v?.username || "");
//   };

//   const resolveAvatarById = (id?: string) => {
//     if (!id) return "";
//     const v = usersMap.get(String(id));
//     return String(v?.avatar || "");
//   };

//   const normalizeRoleLabelAr = (role?: string) => {
//     if (!role) return "عضو";
//     if (role === "creator") return "منشئ";
//     if (role === "owner") return "مالك";
//     if (role === "admin") return "مشرف";
//     return "عضو";
//   };

//   const pretty = (x: any) => {
//     try {
//       return JSON.stringify(x, null, 2);
//     } catch {
//       return String(x);
//     }
//   };

//   const safeUserLog = (obj: any) => {
//     // ✅ لا تطبع أي توكن/سيكرتس حتى لو وصلتك بالغلط
//     const clone = obj ? JSON.parse(JSON.stringify(obj)) : obj;

//     // إن وجدت حقول حساسة امسحها
//     if (clone?.token) delete clone.token;
//     if (clone?.accessToken) delete clone.accessToken;
//     if (clone?.refreshToken) delete clone.refreshToken;
//     if (clone?.authorization) delete clone.authorization;

//     return clone;
//   };



//   // ✅ Helpers for user extraction + debug (ضعهم فوق mapReduxToUIMessage)

//   const DEBUG_USER = true;

//   const logSenderFromMessage = (m: any, tag = "SENDER_DUMP") => {
//     try {
//       const snap = m?.senderSnapshot;
//       const active = snap?.activeCustomization;

//       const dump = {
//         tag,
//         messageId: String(m?._id || ""),
//         backendType: String(m?.type || ""),
//         senderRaw: m?.sender, // قد يكون string id أو object
//         senderSnapshot: snap
//           ? {
//             _id: String(snap?._id || ""),
//             username: String(snap?.username || ""),
//             atUsername: String(snap?.atUsername || ""),
//             avatar: String(snap?.avatar || ""),
//             verificationType: String(snap?.verificationType || ""),
//             avatarFrame: String(snap?.avatarFrame || ""),
//             badgesRoot: Array.isArray(snap?.badges) ? snap.badges : [],
//             profileEntryAnimation: String(snap?.profileEntryAnimation || ""),
//             activeCustomization: active
//               ? {
//                 avatarFrame: String(active?.avatarFrame || ""),
//                 messageEffect: String(active?.messageEffect || ""),
//                 profileEntryAnimation: String(active?.profileEntryAnimation || ""),
//                 badges: Array.isArray(active?.badges) ? active.badges : [],
//                 verificationType: String(active?.verificationType || "")
//               }
//               : null
//           }
//           : null
//       };

//       console.log(`[${tag}]`, dump);
//     } catch (e) {
//       console.log(`[${tag}] FAILED`, e);
//     }
//   };

//   const pickSenderFromMessage = (m: any) => {
//     // sender قد يكون Object أو String
//     const senderObj =
//       typeof m?.sender === "object" && m?.sender
//         ? m.sender
//         : m?.sender
//           ? { _id: String(m.sender), username: "", avatar: "" }
//           : null;

//     const snap = m?.senderSnapshot || null;

//     const senderId = String(
//       snap?._id ||
//       senderObj?._id ||
//       m?.senderId ||
//       ""
//     ).trim();

//     // ✅ الاسم: Snapshot ثم senderObj ثم حقول fallback
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
//       ""
//     ).trim();

//     // ✅ snapshotRole: غالبًا موجودة داخل senderSnapshot.role أو sender.role
//     const snapshotRole = String(
//       snap?.role || senderObj?.role || ""
//     ).trim();
//     const verificationType = String(
//       snap?.verificationType || senderObj?.verificationType || ""
//     ).trim();
//     // ✅ badges: المكان الصحيح حسب لوجك
//     const activeBadges: string[] =
//       Array.isArray(snap?.activeCustomization?.badges) && snap.activeCustomization.badges.length
//         ? snap.activeCustomization.badges
//         : Array.isArray(snap?.badges) && snap.badges.length
//           ? snap.badges
//           : [];

//     return {
//       senderId,
//       username,
//       avatar,
//       snapshotRole: snapshotRole || undefined,
//       activeBadges,
//       verificationType
//     };
//   };


//   const mapReduxToUIMessage = (m: any): MessageUI => {
//     // ✅ ديبج: طباعة بيانات المستخدم كاملة من الرسالة
//     if (DEBUG_USER) {
//       logSenderFromMessage(m, "MAP_MESSAGE_USER_DUMP");
//     }

//     const backendType = String(m?.type || "text");

//     const isSystem =
//       backendType === "system" ||
//       backendType === "announcement" ||
//       backendType === "join" ||
//       backendType === "leave" ||
//       backendType === "promotion" ||
//       backendType === "ban" ||
//       backendType === "role";

//     // ✅ استخراج المرسل من الرسالة نفسها (snapshot أولاً)
//     const picked = pickSenderFromMessage(m);
//     const senderId = picked.senderId;

//     // ✅ دمج البادجات + (اختياري) اعتبار verificationType كبادج
//     const verificationToBadge = (verificationType?: string) => {
//       const v = String(verificationType || "").trim().toLowerCase();
//       if (!v || v === "none") return null;
//       // متوقع: blue | gold | business
//       return v;
//     };

//     const normalizeBadges = (badges?: string[]) => {
//       const arr = Array.isArray(badges) ? badges : [];
//       const cleaned = arr
//         .map((x) => String(x || "").trim().toLowerCase())
//         .filter(Boolean);

//       const out: string[] = [];
//       const seen = new Set<string>();
//       for (const b of cleaned) {
//         if (!seen.has(b)) {
//           seen.add(b);
//           out.push(b);
//         }
//       }
//       return out;
//     };

//     // لو pickSenderFromMessage بيرجع verificationType ضمّه هنا، وإلا ساعتها هيبقى ""
//     const extraBadge = verificationToBadge((picked as any)?.verificationType);

//     const mergedBadges = normalizeBadges([
//       ...(picked.activeBadges || []),
//       ...(extraBadge ? [extraBadge] : [])
//     ]);

//     // اسم المستخدم للنظام/العرض
//     let systemUserName = String(picked.username || "").trim();

//     if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
//     if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
//     if (!systemUserName) systemUserName = "مستخدم";

//     // ✅ نصوص النظام
//     let systemText = String(m?.content || "");

//     if (backendType === "join") {
//       systemText = `✅ ${systemUserName} Join`;
//     } else if (backendType === "leave") {
//       systemText = `🚪 ${systemUserName} Left`;
//     } else if (backendType === "promotion") {
//       const action = String(m?.action || m?.meta?.action || "");
//       const actor =
//         String(m?.actorName || m?.meta?.actorName || "").trim() || systemUserName || "مشرف";
//       const target = String(m?.targetName || m?.meta?.targetName || "").trim();
//       const roleRaw = String(m?.role || m?.meta?.role || "").trim();

//       const isRoleChange =
//         action === "role:set" ||
//         Boolean(
//           m?.actorName ||
//           m?.targetName ||
//           m?.role ||
//           m?.meta?.actorName ||
//           m?.meta?.targetName ||
//           m?.meta?.role
//         );

//       if (isRoleChange) {
//         const targetName = target || "مستخدم";
//         const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
//         systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
//       } else {
//         systemText = `⭐ تمت ترقية ${systemUserName}`;
//       }
//     } else if (backendType === "ban") {
//       systemText = `⛔ تم حظر ${systemUserName}`;
//     } else if (backendType === "announcement") {
//       systemText = `📢 ${m?.content || ""}`;
//     } else if (backendType === "role") {
//       const actor = String(m?.actorName || systemUserName || "مشرف");
//       const target = String(m?.targetName || "مستخدم");
//       const r = normalizeRoleLabelAr(String(m?.role || ""));
//       systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
//     }

//     // replyTo (اترك الموجود عندك، هذا مجرد placeholder آمن)
//     const uiReplyTo: MessageUI | undefined =
//       m?.replyTo && typeof m.replyTo === "object"
//         ? {
//           id: String(m.replyTo._id || "reply"),
//           type: "text",
//           text: String(m.replyTo.content || "Media message"),
//           uri: m.replyTo.media?.url,
//           sender: {
//             id: String(m.replyTo.sender?._id || "unknown"),
//             name: String(m.replyTo.sender?.username || "User"),
//             avatar: String(m.replyTo.sender?.avatar || "")
//           },
//           time: ""
//         }
//         : undefined;

//     // ✅ تحديد نوع رسالة UI
//     let uiType: MessageUI["type"] = "text";
//     if (isSystem) uiType = "system";
//     else if (backendType === "gift") uiType = "gift";
//     else if (backendType === "image") uiType = "image";
//     else if (backendType === "video") uiType = "video";
//     else if (backendType === "audio") uiType = "audio";
//     else if (backendType === "file") uiType = "file";

//     const time = new Date(m?.createdAt || Date.now()).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit"
//     });

//     // Reaction كما هو
//     const firstReactionEmoji =
//       Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";

//     const uiReaction = REACTIONS.includes(firstReactionEmoji as any)
//       ? (firstReactionEmoji as Reaction)
//       : undefined;

//     // ✅ role الخاص بالغرفة من usersMap إن وجد
//     const roomRole = (usersMap.get(senderId)?.role as RoomRole | undefined);

//     // ✅ senderUI يعتمد على snapshot أولاً
//     const senderUI: UserUI = {
//       id: String(senderId || "unknown"),
//       name: picked.username || (senderId && senderId === myUserId ? myName : "User"),
//       avatar: picked.avatar || (senderId && senderId === myUserId ? myAvatar : ""),
//       role: roomRole,
//       snapshotRole: picked.snapshotRole,
//       activeBadges: mergedBadges // ✅ هنا المهم: دمج + تنظيف
//     };

//     // ✅ النص النهائي
//     const messageText = isSystem ? systemText : String(m?.content || "");
//  const giftPayload = m?.gift || m?.meta?.gift || null;

// // ✅ المفتاح الحقيقي للهديّة: من gift.key أولاً ثم fallback للـ content
// const giftKey =
//   backendType === "gift"
//     ? String(giftPayload?.key || m?.content || "")
//     : "";

//     const giftIcon =
//       String(giftPayload?.icon || "") ||
//       (GIFT_META[giftKey]?.icon || "🎁");

//     const giftCount =
//       Number(giftPayload?.count || 0) ||
//       (GIFT_META[giftKey]?.count || 45);

//     const giftTargetId = giftPayload?.targetId ? String(giftPayload.targetId) : undefined;
//     const giftTargetName = giftPayload?.targetName ? String(giftPayload.targetName) : undefined;
//     return {
//       id: String(m?._id),
//       type: uiType,
//       systemType: isSystem ? (backendType as any) : undefined,
//       text: messageText,
//       uri: m?.media?.url,

//       // ✅ announcement نظهر فيه sender
//       // ✅ باقي system نخفي sender
//       sender: backendType === "announcement" ? senderUI : isSystem ? undefined : senderUI,
//       gift: uiType === "gift"
//         ? {
//           key: giftKey,
//           icon: giftIcon,
//           count: giftCount,
//           targetId: giftTargetId,
//           targetName: giftTargetName
//         }
//         : undefined,
//       replyTo: uiReplyTo,
//       reaction: uiReaction,
//       deletedForEveryone: Boolean(m?.deletedForEveryone),
//       time
//     };
//   };
//   /* ✅ ضع latestPinned هنا */
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
//   const uiMessages: MessageUI[] = useMemo(() => {
//     if (!reduxMessages) return [];
//     return reduxMessages.map(mapReduxToUIMessage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reduxMessages, roomUsers, myUserId, myName, myAvatar]);

//   const usersUI: UserUI[] = useMemo(() => {
//     return (roomUsers || []).map((u: any) => ({
//       id: String(u?._id),
//       name: String(u?.username || "User"),
//       avatar: String(u?.avatar || ""),
//       role: u?.role,
//       isOnline: Boolean(u?.isOnline)
//     }));
//   }, [roomUsers]);

//   /* ================= FETCH + SOCKET ================= */

//   useEffect(() => {
//     if (!roomId) return;

//     dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false }));
//     dispatch(fetchRoomUsers(roomId));
//     dispatch(fetchRoomStats(roomId));

//     // ✅ دخول السوكت عند فتح الشاشة
//     joinRoomSocket(roomId);

//     // ✅ لا تعمل leave هنا إطلاقًا
//     return () => { };
//   }, [roomId, dispatch]);

//   // ✅ cleanup sound/timer
//   useEffect(() => {
//     return () => {
//       try {
//         if (recordTimer.current) clearInterval(recordTimer.current);
//       } catch { }

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

//   /* ================= AUDIO ================= */
//   useEffect(() => {
//     const latestGift = [...uiMessages].find(
//       (m) => m.type === "gift" && !giftDoneById[m.id] && !m.deletedForEveryone
//     );

//     if (!latestGift) return;

//     if (giftOverlay.visible && giftOverlay.messageId === latestGift.id) return;

//     const key = String(latestGift.gift?.key || latestGift.text || "");
//     const meta = GIFT_META[key] || { icon: "🎁", count: 45 };

//     const fromName = latestGift.sender?.name || "Someone";
// const isBoost = key.startsWith("boost");

// const toName = isBoost ? "Room" : (latestGift.gift?.targetName || "Someone");
//     setGiftOverlay({
//       visible: true,
//       messageId: latestGift.id,
//       giftKey: key,
//       icon: latestGift.gift?.icon || meta.icon,
//       count: latestGift.gift?.count || meta.count,
//       fromName,
//       toName
//     });

//     // لا تحتاج تايمر هنا لو استخدمت onDone داخل GiftBurstOverlay
//   }, [uiMessages, giftDoneById, giftOverlay.visible, giftOverlay.messageId]);
//   const togglePlay = async (uri: string, id: string) => {
//     if (recording) return;

//     await Audio.setAudioModeAsync({
//       allowsRecordingIOS: false,
//       playsInSilentModeIOS: true
//     });

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

//   useEffect(() => {
//     Animated.timing(progressAnim, {
//       toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
//       duration: 120,
//       useNativeDriver: false
//     }).start();
//   }, [playbackProgress, playbackDuration, progressAnim]);

//   /* ================= SEND TEXT ================= */

//   const sendText = async () => {
//     const content = text.trim();
//     if (!content || !roomId) return;

//     try {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content,
//           type: "text",
//           replyTo: replyTo?.id
//         })
//       ).unwrap();

//       setText("");
//       setReplyTo(null);
//       scrollToBottom();
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Send failed");
//     }
//   };

//   /* ================= MEDIA ================= */

//   const sendImage = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8
//     });

//     if (!res.canceled) {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content: "📷 Image",
//           type: "image",
//           media: { url: res.assets[0].uri }
//         })
//       ).unwrap();

//       scrollToBottom();
//     }
//   };
//   const unpinMessage = async (messageId: string) => {
//     try {
//       await dispatch(pinRoomMessage({ roomId, messageId, pinned: false })).unwrap();
//       Alert.alert("Done", "تم إلغاء التثبيت");
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Unpin failed");
//     }
//   };

//   const sendPDF = async () => {
//     const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });

//     if (res.assets && res.assets[0]) {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content: res.assets[0].name,
//           type: "file",
//           media: {
//             url: res.assets[0].uri,
//             fileName: res.assets[0].name,
//             mimeType: "application/pdf"
//           }
//         })
//       ).unwrap();

//       scrollToBottom();
//     }
//   };

//   const sendVideo = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//       quality: 1
//     });

//     if (!res.canceled) {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content: "🎬 Video",
//           type: "video",
//           media: { url: res.assets[0].uri }
//         })
//       ).unwrap();

//       scrollToBottom();
//     }
//   };

//   /* ================= RECORDING ================= */

//   const startRecording = async () => {
//     try {
//       if (sound) {
//         await sound.stopAsync();
//         await sound.unloadAsync();
//         setSound(null);
//         setPlayingId(null);
//       }

//       if (recording) return;

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true
//       });

//       const result = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       const newRecording = result.recording;

//       setRecording(newRecording);
//       setIsRecordingPaused(false);
//       setRecordDuration(0);

//       recordTimer.current = setInterval(() => setRecordDuration((prev) => prev + 1), 1000);
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Record failed");
//     }
//   };

//   const pauseRecording = async () => {
//     if (!recording) return;
//     await recording.pauseAsync();
//     setIsRecordingPaused(true);
//   };

//   const resumeRecording = async () => {
//     if (!recording) return;
//     await recording.startAsync();
//     setIsRecordingPaused(false);
//   };

//   const stopRecording = async () => {
//     if (!recording) return;

//     await recording.stopAndUnloadAsync();
//     const uri = recording.getURI();

//     if (recordTimer.current) {
//       clearInterval(recordTimer.current);
//       recordTimer.current = null;
//     }

//     setRecording(null);
//     setIsRecordingPaused(false);
//     setRecordDuration(0);

//     await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

//     if (uri) {
//       await dispatch(
//         sendRoomMessage({
//           roomId,
//           content: "🎤 Voice message",
//           type: "audio",
//           media: { url: uri }
//         })
//       ).unwrap();

//       scrollToBottom();
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

//   /* ================= ACTIONS (Reaction/Reply/Delete) ================= */

//   const addReaction = (messageId: string, emoji: Reaction) => {
//     toggleRoomReactionSocket({ roomId, messageId, emoji });
//     setShowActions(false);
//   };

//   const deleteMessage = (messageId: string) => {
//     deleteRoomSocketMessage({ roomId, messageId });
//     setShowActions(false);
//   };

//   /* ================= ROOM MENU ACTIONS ================= */

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
//         `Active: ${stats?.activeCount ?? "-"}\nTotal: ${stats?.totalUsersCount ?? "-"}\nMessages: ${stats?.messagesCount ?? "-"
//         }\nLevel: ${stats?.level ?? "-"}`
//       );
//     } catch (e: any) {
//       Alert.alert("Error", e?.message || "Failed to load stats");
//     }
//   };

//   /* ================= LEAVE ROOM ================= */

//   const onLeaveRoom = async () => {
//     if (!roomId) return;
//     if (didLeaveRef.current) return;

//     try {
//       setShowRoomMenu(false);
//       didLeaveRef.current = true;

//       leaveRoomSocket(roomId);
//       await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
//       await dispatch(
//   leaveAndRefreshRooms({ roomId, type: "public" })
// ).unwrap();
//       router.back();
//     } catch (e: any) {
//       didLeaveRef.current = false;
//       Alert.alert("Error", e?.message || "Failed to leave room");
//     }
//   };

//   /* ================= USERS: COPY + CHANGE ROLE ================= */

//   const onCopyUser = async (u: UserUI) => {
//     await Clipboard.setStringAsync(`${u.name} (${u.id})`);
//     Alert.alert("Copied", `Copied: ${u.name}`);
//   };

//   // ✅ تغيير Role عبر السوكت مع ACK
//   const onChangeRole = async (u: UserUI, newRole: UserUI["role"]) => {
//     try {
//       if (!canModerate) {
//         Alert.alert("No permission", "ليس لديك صلاحية لتغيير الدور");
//         return;
//       }

//       if (!u?.id || u.id === myUserId) return;
//       if (!roomId) return;

//       dispatch(socketRoleSetRequested({ roomId, targetId: u.id, role: newRole as any }));

//       const ack = await setRoomUserRoleSocket({
//         roomId,
//         targetId: u.id,
//         role: newRole as any
//       });

//       if (ack?.ok) {
//         dispatch(socketRoleSetSucceeded());
//         // لا نعدل الدور محلياً هنا — التحديث الحقيقي سيصل عبر room:roles:update
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


//   // ✅ داخل ChatScreen() استبدل onBoostRoom بهذا الشكل (يستخدم boostRoom من roomControl.slice)
//   // ملاحظة: افترضت أنك مستورد boostRoom من roomControl.slice.ts
//   // import { boostRoom } from "@/redux/slices/roomControl.slice";

//   const onBoostRoom = async () => {
//     try {
//       if (!canModerate) {
//         Alert.alert("No permission", "You don't have permission to boost this room.");
//         return;
//       }
//       if (!roomId) return;

//       const level = 1;
//       const hours = 24;

//       // ✅ لازم نستلم نتيجة البوست
//       const r = await dispatch(boostRoom({ roomId, level, hours })).unwrap();

//       // ✅ شرط نجاح "مؤكد"
//       if (!r?.boostExpiresAt && typeof r?.boostLevel !== "number") {
//         Alert.alert("Error", "Boost did not succeed.");
//         return; // ❌ لا ترسل Gift
//       }

//       // ✅ الآن فقط: أرسل Gift
// await dispatch(
//   sendRoomMessage({
//     roomId,
//     type: "gift",
//     content: "boost_rocket", // fallback فقط
//     gift: {
//       key: "boost_rocket",
//       name: "boost",
//       value: level,
//       icon: "🚀",
//       animation: "rocket"
//       // ✅ لا target في boost
//     }
//   })
// ).unwrap();

//       const content = `🚀 <b>${myName}</b> boosted the room!`;
//       await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();

//     } catch (e: any) {
//       Alert.alert("Error", e?.message || String(e) || "Boost failed");
//     }
//   };
//   const goDetails = () => {
//     router.push({
//       pathname: "/room-details",
//       params: { roomId: roomId }
//     });
//   };

//   /* ================= RENDER ================= */

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
//     >
//       <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
//         {/* ================= HEADER ================= */}
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <TouchableOpacity onPress={() => router.back()}>
//               <Ionicons name="arrow-back" size={22} />
//             </TouchableOpacity>

//             <TouchableOpacity activeOpacity={0.85} onPress={goDetails}>
//               <Image
//                 source={{ uri: roomAvatar || "https://i.pravatar.cc/150?img=12" }}
//                 style={styles.avatar}
//               />
//             </TouchableOpacity>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.name} numberOfLines={1}>
//                 {roomName}
//               </Text>

//               <Text style={styles.online}>
//                 {loadingMessages ? "Loading..." : `Online: ${activeCount} • ${uiMessages.length} Messages`}
//               </Text>
//             </View>
//           </View>


//           <View style={styles.headerRight}>
//             {/* 🚀 Boost */}
//             <TouchableOpacity onPress={onBoostRoom} hitSlop={10} style={{ marginRight: 10 }}>
//               <Ionicons name="rocket-outline" size={20} />
//             </TouchableOpacity>

//             {/* Menu */}
//             <TouchableOpacity onPress={() => setShowRoomMenu(true)} hitSlop={10}>
//               <Ionicons name="ellipsis-vertical" size={20} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ================= ROOM MENU ================= */}
//         <Modal transparent visible={showRoomMenu} animationType="fade" onRequestClose={() => setShowRoomMenu(false)}>
//           <TouchableOpacity activeOpacity={1} style={styles.menuOverlay} onPress={() => setShowRoomMenu(false)}>
//             <View style={styles.menuBox}>
//               <TouchableOpacity style={styles.menuItem} onPress={onRefreshRoom}>
//                 <Ionicons name="refresh" size={18} color="#111827" />
//                 <Text style={styles.menuText}>Refresh</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem} onPress={onOpenUsers}>
//                 <Ionicons name="people" size={18} color="#111827" />
//                 <Text style={styles.menuText}>Users</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem} onPress={onOpenStats}>
//                 <Ionicons name="stats-chart" size={18} color="#111827" />
//                 <Text style={styles.menuText}>Stats</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setShowRoomMenu(false);
//                   setShowPinModal(true);
//                 }}
//               >
//                 <Ionicons name="pin" size={18} color="#111827" />
//                 <Text style={styles.menuText}>Pin Message</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setShowRoomMenu(false);

//                   router.push({
//                     pathname: "/room/[id]/settings",
//                     params: { id: roomId }, // تأكد أن roomId موجود
//                   });
//                 }}
//               >
//                 <Ionicons name="settings-outline" size={18} color="#111827" />
//                 <Text style={styles.menuText}>Setting Room</Text>
//               </TouchableOpacity>
//               <View style={styles.menuDivider} />

//               <TouchableOpacity style={styles.menuItem} onPress={onLeaveRoom}>
//                 <Ionicons name="exit-outline" size={18} color="#EF4444" />
//                 <Text style={[styles.menuText, { color: "#EF4444" }]}>Leave Room</Text>
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
//           myRole={myRole}
//           onCopyUser={onCopyUser}
//           onChangeRole={onChangeRole}
//             onKickUser={onKickUser}
//   onBanUser={onBanUser}
//         />

//         {/* ================= GLOBAL AUDIO BAR (اختياري) ================= */}
//         {activeAudio && (
//           <View style={styles.globalAudioPlayer}>
//             <View style={styles.audioIcon}>
//               <Ionicons name="musical-notes" size={18} color="#FFF" />
//             </View>

//             <View style={styles.audioCenter}>
//               <Text style={styles.audioNow}>Playing voice…</Text>

//               <View style={styles.globalProgressBg}>
//                 <Animated.View
//                   style={[
//                     styles.globalProgressFill,
//                     {
//                       width: progressAnim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: ["0%", "100%"]
//                       })
//                     }
//                   ]}
//                 />
//               </View>

//               <View style={styles.audioTimes}>
//                 <Text style={styles.timeText}>{formatTime(playbackProgress)}</Text>
//                 <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={async () => {
//                 try {
//                   if (sound) {
//                     await sound.stopAsync();
//                     await sound.unloadAsync();
//                   }
//                 } catch { }
//                 setSound(null);
//                 setPlayingId(null);
//                 setActiveAudio(null);
//                 setPlaybackProgress(0);
//               }}
//             >
//               <Ionicons name="close" size={22} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
//         )}
//         {latestPinned && (
//           <TouchableOpacity
//             activeOpacity={0.9}
//             style={styles.pinnedBar}
//             onPress={() => {
//               setPinPreviewMessageId(latestPinned.id);
//               setPinPreviewFull(true);
//             }}
//           >
//             <View style={styles.pinnedLeft}>
//               <Ionicons name="pin" size={18} color="#6D5DF6" />
//               <Text style={styles.pinnedTitle}>Pinned</Text>
//             </View>

//             <View style={{ flex: 1, minWidth: 0 }}>
//               <Text style={styles.pinnedText} numberOfLines={1}>
//                 {clipText(safeDisplayText(latestPinned.text || ""), 80)}
//               </Text>
//               <Text style={styles.pinnedMeta} numberOfLines={1}>
//                 {latestPinned.sender?.name ? `${latestPinned.sender.name} • ` : ""}{latestPinned.time}
//               </Text>
//             </View>

//             <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
//           </TouchableOpacity>
//         )}
//         {/* ================= CHAT ================= */}
//         <KeyboardAwareFlatList
//           ref={flatListRef}
//           data={uiMessages}
//           inverted
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ padding: 14 }}
//           renderItem={({ item, index }) => {
//             const isMe = Boolean(myUserId) && item.sender?.id === myUserId;


//             const previousMessage = uiMessages[index + 1];
//             const showName =
//               !previousMessage ||
//               previousMessage.type === "system" ||
//               previousMessage.sender?.id !== item.sender?.id;

//             return (
//               <MessageItem
//                 item={item}
//                 isMe={isMe}
//                 showName={showName}
//                 onAvatarLongPress={(u) => {
//                   if (!u?.id) return;
//                   setGiftPicker({ visible: true, target: u });
//                 }}
//                 onPressImage={(payload) => {
//                   if (String(payload).startsWith("gift:")) {
//                     // لم نعد نفتح صورة، لكن يمكنك ترك هذا إن احتجته لاحقًا
//                     return;
//                   }
//                   setPreviewImage(payload);
//                 }}
//                 onTogglePlay={togglePlay}
//                 playingId={playingId}
//                 progressAnim={progressAnim}
//                 onLongPress={() => {
//                   // لا تعرض منيو على رسائل النظام أو الرسائل المحذوفة (اختياري)
//                   setSelectedMessage(item);
//                   setShowActions(true);

//                 }}
//                 giftDone={Boolean(giftDoneById[item.id])}
//                 onGiftDone={() => markGiftDone(item.id)}
//               />
//             );
//           }}
//         />

//         {/* ================= REPLY PREVIEW ================= */}
//         {replyTo && (
//           <View style={styles.replyPreview}>
//             <Text numberOfLines={1}>Replying to: {replyTo.text || "Media"}</Text>
//             <TouchableOpacity onPress={() => setReplyTo(null)}>
//               <Ionicons name="close" size={18} />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* ================= RECORD INFO ================= */}
//         {recording && (
//           <View style={styles.recordInfo}>
//             <Text style={{ color: "#EF4444" }}>
//               ● Recording {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, "0")}
//             </Text>

//             <TouchableOpacity onPress={isRecordingPaused ? resumeRecording : pauseRecording}>
//               <Ionicons name={isRecordingPaused ? "play" : "pause"} size={20} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* ================= INPUT ================= */}
//         <View style={styles.inputBar}>
//           <TouchableOpacity onPress={sendImage}>
//             <Ionicons name="image-outline" size={24} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={sendPDF}>
//             <Ionicons name="document-outline" size={24} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={sendVideo}>
//             <Ionicons name="videocam-outline" size={24} />
//           </TouchableOpacity>

//           <TextInput
//             style={styles.input}
//             placeholder="Type a message"
//             value={text}
//             onChangeText={setText}
//             multiline
//           />

//           {text ? (
//             <TouchableOpacity onPress={sendText}>
//               <Ionicons name="send" size={22} color={COLORS.me} />
//             </TouchableOpacity>
//           ) : (
//             <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//               <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
//                 <Ionicons name="mic" size={26} color={recording ? "#EF4444" : "#000"} />
//               </TouchableOpacity>
//             </Animated.View>
//           )}
//         </View>

//         {/* ================= ACTIONS MODAL ================= */}
//         <Modal transparent visible={showActions} animationType="fade" onRequestClose={() => setShowActions(false)}>
//           <View style={styles.actionsOverlay}>
//             <View style={styles.actionsBox}>
//               <View style={styles.reactionsRow}>
//                 {REACTIONS.map((r) => (
//                   <TouchableOpacity key={r} onPress={() => selectedMessage && addReaction(selectedMessage.id, r)}>
//                     <Text style={{ fontSize: 22 }}>{r}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <TouchableOpacity
//                 onPress={() => {
//                   setReplyTo(selectedMessage);
//                   setShowActions(false);
//                 }}
//               >
//                 <Text style={styles.action}>Reply</Text>
//               </TouchableOpacity>

//               {/* ✅ Delete permission: صاحب الرسالة أو المشرف */}
//               {(selectedMessage?.sender?.id === myUserId || canModerate) &&
//                 selectedMessage?.type !== "system" &&
//                 !selectedMessage?.deletedForEveryone && (
//                   <TouchableOpacity onPress={() => selectedMessage && deleteMessage(selectedMessage.id)}>
//                     <Text style={[styles.action, { color: "red" }]}>Delete</Text>
//                   </TouchableOpacity>
//                 )}

//               <TouchableOpacity onPress={() => setShowActions(false)}>
//                 <Text style={styles.cancel}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         {/* ================= IMAGE PREVIEW MODAL ================= */}
//         <Modal
//           visible={!!previewImage}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setPreviewImage(null)}
//         >
//           <View style={styles.imagePreviewOverlay}>
//             <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)}>
//               <Ionicons name="close" size={28} color="#FFF" />
//             </TouchableOpacity>

//             <Image
//               source={typeof previewImage === "string" ? { uri: previewImage } : previewImage!}
//               style={styles.fullImage}
//               resizeMode="contain"
//             />
//           </View>
//         </Modal>
//         <Modal
//           transparent
//           visible={showPinModal}
//           animationType="fade"
//           onRequestClose={() => setShowPinModal(false)}
//         >
//           <Pressable style={styles.pinOverlay} onPress={() => setShowPinModal(false)}>
//             <Pressable style={styles.pinSheet} onPress={() => { }}>
//               <View style={styles.pinHeader}>
//                 <Text style={styles.pinTitle}>Pin a message</Text>

//                 <TouchableOpacity onPress={() => setShowPinModal(false)} style={styles.pinCloseBtn}>
//                   <Ionicons name="close" size={20} color="#111827" />
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.pinList}>
//                 <Text style={styles.pinLabel}>رسالة التثبيت</Text>

//                 <View style={styles.pinInputWrap}>
//                   <Ionicons name="text-outline" size={18} color="#6B7280" />
//                   <TextInput
//                     style={styles.pinInput}
//                     placeholder="اكتب رسالة التثبيت (تقبل HTML مثل <b>...</b> و <br /> )"
//                     placeholderTextColor="#9CA3AF"
//                     value={pinHtml}
//                     onChangeText={setPinHtml}
//                     multiline
//                   />
//                 </View>

//                 {!!pinHtml.trim() && (
//                   <View style={styles.pinPreviewBox}>
//                     <Text style={styles.pinPreviewTitle}>معاينة</Text>

//                     <RenderHTML
//                       contentWidth={width - 60}
//                       source={{ html: String(pinHtml) }}
//                       baseStyle={{ fontSize: 13, color: "#111827", lineHeight: 20 }}
//                     />
//                   </View>
//                 )}
//               </View>

//               <View style={styles.pinActions}>
//                 <TouchableOpacity
//                   style={[styles.pinBtn, styles.pinBtnCancel]}
//                   onPress={() => setShowPinModal(false)}
//                 >
//                   <Text style={styles.pinBtnCancelText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.pinBtn, !pinHtml.trim() && styles.pinBtnDisabled]}
//                   disabled={!pinHtml.trim()}
//                   onPress={async () => {
//                     try {
//                       const content = pinHtml.trim();
//                       if (!content) return;

//                       // 1) إنشاء رسالة announcement
//                       const created = await dispatch(
//                         sendRoomMessage({
//                           roomId,
//                           content,
//                           type: "announcement",
//                         })
//                       ).unwrap();

//                       // ✅ 2) استخراج messageId الصحيح حسب نوع الـ thunk عندك
//                       const messageId = created?.message?._id;

//                       if (!messageId) {
//                         Alert.alert("Error", "لم يتم الحصول على id للرسالة الجديدة.");
//                         return;
//                       }

//                       // 3) تثبيت الرسالة
//                       await dispatch(pinRoomMessage({ roomId, messageId, pinned: true })).unwrap();

//                       setShowPinModal(false);
//                       setPinHtml("");
//                       Alert.alert("Done", "تم إرسال الرسالة وتثبيتها");
//                     } catch (e: any) {
//                       Alert.alert("Error", e?.message || "Pin failed");
//                     }
//                   }}
//                 >
//                   <Ionicons name="pin" size={16} color="#FFF" />
//                   <Text style={styles.pinBtnText}>Pin</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* ✅ Preview Full (Safe text only) */}
//               <Modal
//                 transparent
//                 visible={pinPreviewFull}
//                 animationType="fade"
//                 onRequestClose={() => setPinPreviewFull(false)}
//               >
//                 <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
//                   <Pressable style={styles.fullBox} onPress={() => { }}>
//                     <View style={styles.fullHeader}>
//                       <Text style={styles.fullTitle}>Full preview</Text>
//                       <TouchableOpacity onPress={() => setPinPreviewFull(false)}>
//                         <Ionicons name="close" size={20} color="#111827" />
//                       </TouchableOpacity>
//                     </View>

//                     {(() => {
//                       const msg = uiMessages.find((x) => x.id === pinSelectedId);
//                       const raw = msg?.text || "";
//                       const cleaned = safeDisplayText(raw);

//                       return (
//                         <Text style={styles.fullText}>
//                           {cleaned}
//                         </Text>
//                       );
//                     })()}
//                   </Pressable>
//                 </Pressable>
//               </Modal>
//             </Pressable>
//           </Pressable>
//         </Modal>
//         <Modal
//           transparent
//           visible={pinPreviewFull}
//           animationType="fade"
//           onRequestClose={() => setPinPreviewFull(false)}
//         >
//           <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
//             <Pressable style={styles.fullBox} onPress={() => { }}>
//               <View style={styles.fullHeader}>
//                 <Text style={styles.fullTitle}>Pinned message</Text>

//                 {latestPinned && canModerate && (
//                   <TouchableOpacity onPress={() => unpinMessage(latestPinned.id)}>
//                     <Text style={{ color: "red", fontWeight: "800" }}>Unpin</Text>
//                   </TouchableOpacity>
//                 )}
//                 <TouchableOpacity onPress={() => setPinPreviewFull(false)}>
//                   <Ionicons name="close" size={20} color="#111827" />
//                 </TouchableOpacity>
//               </View>

//               {(() => {
//                 // نعتمد على latestPinned لأنه أحدث مثبت، ولو حبيت لاحقًا تدعم أكثر من مثبت
//                 const msg = latestPinned;
//                 const raw = msg?.text || "";

//                 return (
//                   <>
//                     <Text style={styles.fullMeta}>
//                       {msg?.sender?.name ? `${msg.sender.name} • ` : ""}{msg?.time || ""}
//                     </Text>

//                     <RenderHTML
//                       contentWidth={width - 40}
//                       source={{ html: String(raw || "") }}
//                       baseStyle={{ fontSize: 13, color: "#111827", lineHeight: 20 }}
//                     />
//                   </>
//                 );
//               })()}
//             </Pressable>
//           </Pressable>
//         </Modal>
//         {/* ================= GIFT FULLSCREEN OVERLAY ================= */}
//   {String(giftOverlay.giftKey || "").startsWith("boost") ? (
//   <RocketBoostOverlay
//     visible={giftOverlay.visible}
//     durationMs={2800}
//     onDone={() => {
//       if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
//       setGiftOverlay({
//         visible: false,
//         messageId: null,
//         giftKey: null,
//         icon: "🎁",
//         count: 45,
//       });
//     }}
//   />
// ) : (
//   <GiftBurstOverlay
//     visible={giftOverlay.visible}
//     icon={giftOverlay.icon}
//     count={giftOverlay.count}
//     fromName={giftOverlay.fromName}
//     toName={giftOverlay.toName}
//     durationMs={2600}
//     onDone={() => {
//       if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
//       setGiftOverlay({
//         visible: false,
//         messageId: null,
//         giftKey: null,
//         icon: "🎁",
//         count: 45,
//       });
//     }}
//   />
// )}
//         <GiftPickerModal
//           visible={giftPicker.visible}
//           target={giftPicker.target}
//           onClose={() => setGiftPicker({ visible: false, target: null })}
//           onPick={async (g) => {
//             try {
//               const target = giftPicker.target;
//               setGiftPicker({ visible: false, target: null });

//               if (!roomId) return;
//            const isBoost = String(g.key || "").startsWith("boost");

// // ✅ الهدايا تحتاج target - البوست لا يحتاج
// if (!isBoost && !target?.id) {
//   Alert.alert("Error", "Target user not found");
//   return;
// }

//               // ✅ استخدم meta لو موجود
//               const meta = GIFT_META[g.key] || { icon: "🎁", count: 45 };

//               // ✅ أرسل Gift Message (يفضل أن السيرفر يحفظ targetId/targetName داخل gift)
//         await dispatch(
//   sendRoomMessage({
//     roomId,
//     type: "gift",
//     content: g.key,
//     gift: {
//       key: g.key,
//       icon: meta.icon,
//       targetId: isBoost ? undefined : target!.id,
//       targetName: isBoost ? undefined : target!.name,
//       count: meta.count
//     }
//   } as any)
// ).unwrap();

//               // (اختياري) إعلان system/announcement
// const toLabel = isBoost ? "Room" : (target?.name || "Someone");

// const announce = `🎁 <b>${myName}</b> sent ${meta.icon} to <b>${toLabel}</b>`;
// await dispatch(sendRoomMessage({ roomId, content: announce, type: "announcement" })).unwrap();
//               await dispatch(sendRoomMessage({ roomId, content: announce, type: "announcement" })).unwrap();
//             } catch (e: any) {
//               Alert.alert("Error", e?.message || "Failed to send gift");
//             }
//           }}
//         />
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );
// }

// /* =====================================================
//    STYLES
// ===================================================== */

// const bubbleStyles = StyleSheet.create({
//   row: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
//   rowOther: { justifyContent: "flex-start" },
//   rowMe: { justifyContent: "flex-end" },
//   giftWrap: {
//     marginTop: 6,
//     width: 220,
//     height: 220,
//     borderRadius: 12,
//     overflow: "hidden",
//     alignItems: "center",
//     justifyContent: "center"
//   },
//   giftLottie: {
//     width: "100%",
//     height: "100%"
//   },

//   avatarStar: {
//     position: "absolute",
//     top: -6,
//     left: -10,
//     fontSize: 14,
//     fontWeight: "900",
//     textShadowColor: "rgba(0,0,0,0.25)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   avatarWrap: {
//     width: 40,
//     height: 40,
//     marginRight: 8,
//     position: "relative",
//   },

//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#EEE"
//   },

//   avatarSpacer: {
//     width: 40,
//     marginRight: 8
//   },

//   bubble: {
//     maxWidth: "78%",
//     borderRadius: 14,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2
//   },

//   bubbleOther: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 6
//   },

//   bubbleMe: {
//     backgroundColor: "#FFFFFF",
//     borderTopRightRadius: 6
//   },

//   senderName: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#2563EB",
//     marginBottom: 4
//   },

//   msgText: { fontSize: 15, color: "#111827", lineHeight: 20 },
//   msgTextMuted: { fontSize: 14, color: "#6B7280" },

//   time: { fontSize: 11, marginTop: 6, alignSelf: "flex-end" },
//   nameWrap: {
//     marginBottom: 6
//   },
//   nameRow: {
//     flexDirection: "row-reverse",
//     alignItems: "center",
//     gap: 6,
//     flexWrap: "wrap"
//   },
//   roleStar: {
//     fontSize: 12,
//     fontWeight: "900"
//   },
//   nameUnderline: {
//     marginTop: 4,
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     width: "100%"
//   },
//   media: { width: 220, height: 220, borderRadius: 12, marginTop: 4 },

//   videoWrapper: {
//     width: 240,
//     height: 170,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#000",
//     marginTop: 6
//   },
//   video: { width: "100%", height: "100%" },

//   fileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
//   fileIcon: { fontSize: 18 },
//   fileName: { maxWidth: 200, fontSize: 14, color: "#111827" },

//   audioRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
//   audioProgressWrapper: { flex: 1, minWidth: 160 },
//   avatarWrapLeft: {
//     width: 40,
//     height: 40,
//     marginRight: 8,
//     position: "relative"
//   },
//   avatarStarLeft: {
//     position: "absolute",
//     top: -6,
//     right: -10, // ⭐ للآخرين: أعلى يمين الصورة
//     fontSize: 14,
//     fontWeight: "900",
//     textShadowColor: "rgba(0,0,0,0.25)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2
//   },

//   avatarStarRight: {
//     position: "absolute",
//     top: -6,
//     right: -10, // ⭐ لك: أعلى يسار الصورة
//     fontSize: 14,
//     fontWeight: "900",
//     textShadowColor: "rgba(0,0,0,0.25)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2
//   },
//   avatarWrapRight: {
//     width: 40,
//     height: 40,
//     marginLeft: 8,
//     position: "relative"
//   },
//   audioProgressBg: {
//     height: 3,
//     width: "100%",
//     borderRadius: 2,
//     backgroundColor: "#E5E7EB",
//     overflow: "hidden",
//     marginBottom: 6
//   },
//   audioProgressFill: { height: "100%", borderRadius: 2 },
//   audioLabel: { fontSize: 12 },

//   reaction: {
//     position: "absolute",
//     bottom: -10,
//     right: 10,
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderWidth: 1,
//     borderColor: "#E5E7EB"
//   },

//   sysWrap: { width: "100%", alignItems: "center", marginVertical: 6 },
//   sysBubble: {
//     backgroundColor: "#EEF2FF",
//     borderColor: "#C7D2FE",
//     borderWidth: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderRadius: 14
//   },
//   sysText: { fontSize: 13, color: "#111827", textAlign: "center", fontWeight: "600" },
//   sysTime: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 4 }
// });

// const usersStyles = StyleSheet.create({
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
//   sheet: {
//     backgroundColor: "#FFF",
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     paddingHorizontal: 14,
//     paddingTop: 14,
//     paddingBottom: 18,
//     maxHeight: "80%"
//   },
//   header: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
//   title: { fontSize: 16, fontWeight: "800" },
//   note: { marginTop: 10, backgroundColor: "#F3F4F6", padding: 10, borderRadius: 12 },
//   noteText: { fontSize: 12, color: "#374151", lineHeight: 18 },
//   list: { marginTop: 12 },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6"
//   },
//   avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EEE" },
//   rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   name: { fontSize: 14, fontWeight: "800", color: "#111827", maxWidth: 220 },
//   sub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

//   badge: { backgroundColor: "#EEF2FF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
//   badgeText: { fontSize: 11, color: "#3730A3", fontWeight: "800" },

//   rolesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
//   roleChip: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999
//   },
//   roleChipActive: { backgroundColor: "#6D5DF6", borderColor: "#6D5DF6" },
//   roleChipText: { fontSize: 12, fontWeight: "700", color: "#111827" },
//   roleChipTextActive: { color: "#FFF" }
// });

// const styles = StyleSheet.create({
//   header: {
//     height: 56,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingRight: 75,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF"
//   },
//   pinOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "flex-end"
//   },
//   pinSheet: {
//     backgroundColor: "#FFF",
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     paddingHorizontal: 14,
//     paddingTop: 12,
//     paddingBottom: 14,
//     maxHeight: "80%"
//   },
//   pinHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between"
//   },
//   pinTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
//   pinCloseBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
//   pinHint: { marginTop: 8, fontSize: 12, color: "#6B7280", lineHeight: 18 },

//   pinList: { marginTop: 12 },
//   pinRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     marginBottom: 10
//   },
//   pinRowActive: { borderColor: "#6D5DF6", backgroundColor: "#EEF2FF" },
//   pinRowTitle: { fontSize: 12, fontWeight: "800", color: "#111827" },
//   pinRowText: { fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 18 },
//   pinMore: { marginTop: 6, fontSize: 12, color: "#2563EB", fontWeight: "800" },

//   pinActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 10,
//     marginTop: 6
//   },
//   pinBtn: {
//     flex: 1,
//     height: 44,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 8,
//     backgroundColor: "#6D5DF6"
//   },
//   pinBtnText: { color: "#FFF", fontWeight: "800" },
//   pinBtnCancel: { backgroundColor: "#F3F4F6" },
//   pinBtnCancelText: { color: "#111827", fontWeight: "800" },
//   pinBtnDisabled: { opacity: 0.5 },


//   pinnedBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 0.5,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 12,
//     paddingVertical: 10
//   },
//   pinnedLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6
//   },
//   pinnedTitle: {
//     fontSize: 13,
//     fontWeight: "900",
//     color: "#111827"
//   },
//   pinnedText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#374151"
//   },
//   pinLabel: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#111827" },

//   pinInputWrap: {
//     marginTop: 8,
//     flexDirection: "row",
//     gap: 10,
//     alignItems: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#F9FAFB"
//   },

//   pinInput: {
//     flex: 1,
//     minHeight: 110,
//     maxHeight: 180,
//     fontSize: 13,
//     color: "#111827",
//     lineHeight: 18
//   },

//   pinPreviewBox: {
//     marginTop: 12,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: "#EEF2FF",
//     borderWidth: 1,
//     borderColor: "#C7D2FE"
//   },

//   pinPreviewTitle: { fontSize: 12, fontWeight: "900", color: "#111827" },
//   pinPreviewNote: { marginTop: 6, fontSize: 12, color: "#374151", lineHeight: 18 },
//   pinnedMeta: {
//     marginTop: 2,
//     fontSize: 11,
//     color: "#6B7280"
//   },

//   fullOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16
//   },
//   fullBox: {
//     width: "100%",
//     maxHeight: "70%",
//     backgroundColor: "#FFF",
//     borderRadius: 16,
//     padding: 14
//   },
//   fullHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10
//   },
//   giftFullOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.95)",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   giftFullLottie: {
//     width: "100%",
//     height: "100%"
//   },
//   fullMeta: { fontSize: 12, color: "#6B7280", marginBottom: 10, fontWeight: "700" },
//   fullTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
//   fullText: { fontSize: 13, color: "#111827", lineHeight: 20 },
//   headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
//   headerRight: { flexDirection: "row", gap: 16, paddingRight: 15 },
//   avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEE" },
//   name: { fontSize: 16, fontWeight: "800" },
//   online: { fontSize: 12, color: "#6B7280" },

//   inputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 10,
//     borderTopWidth: 0.5,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF"
//   },
//   input: {
//     flex: 1,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     maxHeight: 120
//   },

//   replyPreview: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "#EEF2FF"
//   },

//   recordInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: "#FFF"
//   },

//   actionsOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   actionsBox: {
//     backgroundColor: "#FFF",
//     width: "80%",
//     borderRadius: 16,
//     padding: 16
//   },
//   reactionsRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12
//   },
//   action: { fontSize: 16, paddingVertical: 10, fontWeight: "700" },
//   cancel: { textAlign: "center", marginTop: 8, color: "#6B7280", fontWeight: "700" },

//   imagePreviewOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.95)",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   fullImage: { width: "100%", height: "100%" },
//   imagePreviewClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },

//   menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.12)" },
//   menuBox: {
//     position: "absolute",
//     top: 60,
//     right: 12,
//     width: 190,
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOpacity: 0.12,
//     shadowRadius: 10,
//     elevation: 6
//   },
//   menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
//   menuText: { fontSize: 14, color: "#111827", fontWeight: "800" },
//   menuDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 6 },

//   globalAudioPlayer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 0.5,
//     borderColor: "#E5E7EB"
//   },
//   audioIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#6D5DF6",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10
//   },
//   audioCenter: { flex: 1 },
//   audioNow: { fontSize: 12, color: "#111827", fontWeight: "800", marginBottom: 6 },
//   globalProgressBg: {
//     width: "100%",
//     height: 3,
//     backgroundColor: "#E5E7EB",
//     borderRadius: 2,
//     overflow: "hidden"
//   },
//   globalProgressFill: { height: "100%", backgroundColor: "#6D5DF6" },
//   audioTimes: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
//   timeText: { fontSize: 11, color: "#6B7280" },


//   avatarWrap: {
//     width: 34,
//     height: 34,
//     marginRight: 8,
//     position: "relative",
//   },

//   avatarStar: {
//     position: "absolute",
//     top: -6,     // أعلى
//     right: -10,  // يمين وبجانب الصورة (خارجها)
//     fontSize: 14,
//     fontWeight: "900",
//     textShadowColor: "rgba(0,0,0,0.25)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },

//   avatarStarText: {
//     fontSize: 11,
//     fontWeight: "900",
//     lineHeight: 12
//   },
// });


// app/(tabs)/room/[id].tsx
// ✅ تعديل شامل ليتوافق مع الدوال/الأحداث الجديدة في الباك + تحسينات:
// 1) عرض Active Online من Redux (activeCountByRoom) بدل الاعتماد على usersCount
// 2) تغيير الـ Role عبر Socket ACK (room:role:set) + التحديث الحقيقي يصل عبر room:roles:update
// 3) حذف الرسالة: يسمح لصاحب الرسالة + (creator/owner/admin)
// 4) إصلاح scrollToBottom مع inverted list
// 5) تحسين mapReduxToUIMessage: قراءة reactions من الباك إن وجدت (أول reaction للعرض)
// 6) تنظيف audio timers + unload sound عند الخروج

import { Ionicons } from "@expo/vector-icons";
import { Audio, ResizeMode, Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import RenderHTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearBannedFlag,
  clearKickedFlag,
  fetchRoomMessages,
  fetchRoomStats,
  fetchRoomUsers,
  leaveAndRefreshRooms,
  leaveRoomAndExit,
  pinRoomMessage,
  selectBannedFlag,
  selectKickedFlag,
  selectRoomActiveCount,
  selectRoomAvatarById,
  selectRoomLoadingMessages,
  selectRoomMessages,
  selectRoomNameById,
  selectRoomUsers,
  sendRoomMessage,
  socketRoleSetFailed,
  socketRoleSetRequested,
  socketRoleSetSucceeded
} from "@/redux/slices/room.slice";

// ✅ Socket helpers
import { RocketBoostOverlay } from "@/components/RocketBoostOverlay";
import { stripHtmlToText } from "@/components/stripHtmlToText";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";
import { boostRoom } from "@/redux/slices/roomControl.slice";
import {
  banRoomUserSocket,
  deleteRoomSocketMessage,
  joinRoomSocket,
  kickRoomUserSocket,
  leaveRoomSocket,
  setRoomUserRoleSocket,
  toggleRoomReaction as toggleRoomReactionSocket
} from "@/services/socket";
import { uploadToCloudinary } from "@/services/upload.service";

/* ================= TYPES ================= */
type BadgeKey = string;

// ✅ ألوان/أيقونات البادجات حسب النوع
const BADGE_META: Record<BadgeKey, { label: string; icon?: string; bg: string; fg: string }> = {
  gold: { label: "GOLD", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
  blue: {
    label: "",
    icon: "twitter-verified", // سنعالجها يدويًا في الرندر
    bg: "transparent",
    fg: "#1DA1F2"
  },
  business: { label: "BUSINESS", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },

  // أمثلة إضافية إن أحببت
  vip: { label: "VIP", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
  pro: { label: "PRO", icon: "⚡", bg: "#DCFCE7", fg: "#166534" },
};
type GiftItem = {
  key: string;
  title: string;
  icon: string;      // emoji مؤقتًا
  price?: number;    // اختياري
};

const TEMP_GIFTS: GiftItem[] = [
  { key: "gift_rose", title: "Rose", icon: "🌹", price: 10 },
  { key: "gift_like", title: "Like", icon: "👍", price: 5 },
  { key: "gift_fire", title: "Fire", icon: "🔥", price: 15 },
  { key: "gift_crown", title: "Crown", icon: "👑", price: 25 },
  { key: "gift_rocket", title: "Rocket", icon: "🚀", price: 50 },
];
const GIFT_META: Record<string, { icon: string; count: number }> = {
  gift_rose: { icon: "🌹", count: 40 },
  gift_like: { icon: "👍", count: 55 },
  gift_fire: { icon: "🔥", count: 60 },
  gift_crown: { icon: "👑", count: 35 },
  gift_rocket: { icon: "🚀", count: 45 },

  // لو عندك boost_rocket كـ giftKey:
  boost_rocket: { icon: "🚀", count: 55 },
};
function GiftPickerModal({
  visible,
  onClose,
  target,
  onPick
}: {
  visible: boolean;
  onClose: () => void;
  target?: UserUI | null;
  onPick: (gift: { key: string }) => void; // مؤقت
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: "#FFF",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 18
          }}
          onPress={() => { }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#111827" }}>
                Send a Gift
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: "#6B7280" }} numberOfLines={1}>
                To: {target?.name || "User"}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="close" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {TEMP_GIFTS.map((g) => (
              <TouchableOpacity
                key={g.key}
                activeOpacity={0.85}
                onPress={() => onPick({ key: g.key })}
                style={{
                  width: "30%",
                  minWidth: 95,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 24 }}>{g.icon}</Text>
                <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: "#111827" }} numberOfLines={1}>
                  {g.title}
                </Text>
                {!!g.price && (
                  <Text style={{ marginTop: 4, fontSize: 11, color: "#6B7280", fontWeight: "700" }}>
                    {g.price} Coinz
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ marginTop: 12, fontSize: 12, color: "#6B7280", lineHeight: 18 }}>
            (مؤقتًا) اختيار الهدية فقط بدون إرسال.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
function GiftBurstOverlay({
  visible,
  icon,
  count = 45,
  fromName,
  toName,
  durationMs = 2600,
  onDone
}: {
  visible: boolean;
  icon: string;
  count?: number;
  fromName?: string;
  toName?: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;

  // لكل عنصر: X + translateY + scale + rotate بسيط
  const particles = useRef(
    Array.from({ length: Math.max(12, Math.min(count, 90)) }).map(() => ({
      x: Math.random(),
      delay: Math.floor(Math.random() * 260),
      dur: 1400 + Math.floor(Math.random() * 900),
      startY: 0.25 + Math.random() * 0.6,
      endY: 0.05 + Math.random() * 0.25,
      size: 18 + Math.floor(Math.random() * 18),
      spin: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 25),
      t: new Animated.Value(0)
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    particles.forEach((p) => p.t.setValue(0));

    // Fade in
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();

    // Play particles
    const anims = particles.map((p) =>
      Animated.timing(p.t, {
        toValue: 1,
        duration: p.dur,
        delay: p.delay,
        useNativeDriver: true
      })
    );

    Animated.parallel(anims).start();

    // Fade out near the end, then done
    const fadeOutAt = Math.max(500, durationMs - 450);
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    }, fadeOutAt);

    const doneTimer = setTimeout(() => {
      onDone();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent", // ✅ شفافة بالكامل
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Animated.View style={{ opacity, width: "100%", height: "100%" }}>
        {/* عنوان صغير عصري */}
        <View
          style={{
            position: "absolute",
            top: 70,
            left: 16,
            right: 16,
            alignItems: "center"
          }}
        >
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)"
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
              {fromName ? `${fromName} → ` : ""}{toName ? toName : "Someone"}
            </Text>
          </View>
        </View>

        {/* العناصر المتحركة */}
        {particles.map((p, idx) => {
          const xPx = 12 + p.x * (width - 24);
          const startY = height * p.startY;
          const endY = height * p.endY;

          const translateY = p.t.interpolate({
            inputRange: [0, 1],
            outputRange: [startY, endY]
          });

          const scale = p.t.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0.7, 1.1, 0.95]
          });

          const rotate = p.t.interpolate({
            inputRange: [0, 1],
            outputRange: [`${-p.spin}deg`, `${p.spin}deg`]
          });

          const particleOpacity = p.t.interpolate({
            inputRange: [0, 0.15, 0.9, 1],
            outputRange: [0, 1, 1, 0]
          });

          return (
            <Animated.View
              key={idx}
              style={{
                position: "absolute",
                left: xPx,
                transform: [{ translateY }, { scale }, { rotate }],
                opacity: particleOpacity
              }}
            >
              <Text style={{ fontSize: p.size, color: "#FFF" }}>{icon}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}
// ✅ تنظيف + توحيد + إزالة تكرار
const normalizeBadges = (badges?: string[]) => {
  const arr = Array.isArray(badges) ? badges : [];
  const cleaned = arr
    .map((x) => String(x || "").trim().toLowerCase())
    .filter(Boolean);

  // إزالة التكرار مع الحفاظ على الترتيب
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of cleaned) {
    if (!seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out;
};

// ✅ إن أردت اعتبار verificationType Badge أيضًا (اختياري)
// لو لا تريد ذلك، احذف هذا كله ولن يتأثر شيء
const verificationToBadge = (verificationType?: string) => {
  const v = String(verificationType || "").trim().toLowerCase();
  if (!v || v === "none") return null;
  // قد يجيك "gold" أو "blue" أو "business"
  return v;
};
type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";
type RoomRole = "creator" | "owner" | "admin" | "member";
type SnapshotRole = string; // ✅ أي قيمة (user / moderator / ...)
type UserUI = {
  id: string;
  name: string;
  avatar?: string;
  role?: RoomRole;
  activeBadges?: string[];

  // ✅ دور snapshot (للبادجات/التحقق... إلخ)
  snapshotRole?: SnapshotRole;
  isOnline?: boolean;
};

type MessageUI = {
  id: string;
  type: "text" | "image" | "file" | "audio" | "video" | "system" | "gift"; // ✅ أضف gift
  systemType?: "join" | "leave" | "announcement" | "promotion" | "ban" | "role";

  text?: string;
  uri?: string;

  sender?: UserUI;
  time: string;

  replyTo?: MessageUI;
  reaction?: Reaction;
  gift?: {
    key: string;            // gift_rose ...
    icon?: string;          // 🌹 ...
    targetId?: string;      // userId
    targetName?: string;    // username
    count?: number;         // كم عنصر يظهر في الانيميشن
  };
  deletedForEveryone?: boolean;
};

const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const COLORS = {
  me: "#6D5DF6",
  other: "#FFFFFF",
  bg: "#F6F7FB",
  time: "#9CA3AF"
};
// ✅ 1) أضف هذه الدوال/الثوابت داخل ملف room/[id].tsx (يفضّل فوق MessageItem)

// ألوان النجمة حسب الدور
const ROLE_STAR_COLOR: Record<string, string> = {
  creator: "#F59E0B", // ذهبي
  owner: "#8B5CF6",   // بنفسجي
  admin: "#3B82F6"    // أزرق
};

// هل يظهر Star؟
const shouldShowStar = (role?: RoomRole) =>
  role === "creator" || role === "owner" || role === "admin";

const getStarColor = (role?: RoomRole) =>
  role ? ROLE_STAR_COLOR[role] || "#111827" : "#111827";
/* =====================================================
   ✅ MESSAGE ITEM
===================================================== */

// ✅ Gifts الموجودة في assets
// ✅ Gifts Lottie الموجودة في assets (ملفات json)
const GIFT_LOTTIES: Record<string, any> = {
  boost_rocket: require("../../assets/lottie/rocket_boot.json"),
  // أضف المزيد حسب الحاجة
};

const getGiftLottieSource = (key?: string) => {
  if (!key) return null;
  return GIFT_LOTTIES[key] || null;
};

const BADGE_ORDER: BadgeKey[] = [
  "gold",
  "blue",
  "business",
  "vip",
  "pro"
];

const pickPrimaryBadge = (badges?: string[]) => {
  const list = normalizeBadges(badges);
  if (!list.length) return null;

  // اختر أول بادج مهمة حسب ترتيبك
  for (const key of BADGE_ORDER) {
    if (list.includes(key)) return key;
  }
  // لو لا يوجد من القائمة، خذ أول واحدة
  return list[0];
};


const NameBadge = ({ badgeKey }: { badgeKey?: string | null }) => {
  if (!badgeKey) return null;

  const meta = BADGE_META[badgeKey];

  if (!meta) return null;

  // ✅ حالة التوثيق الأزرق مثل تويتر
  if (badgeKey === "blue") {
    return (
      <Ionicons
        name="checkmark-circle"
        size={16}
        color="#1DA1F2"
        style={{ marginLeft: 6 }}
      />
    );
  }

  // ✅ باقي البادجات بشكل chip
  return (
    <View style={[nameBadgeStyles.badge, { backgroundColor: meta.bg }]}>
      {!!meta.icon && (
        <Text style={[nameBadgeStyles.icon, { color: meta.fg }]}>
          {meta.icon}
        </Text>
      )}
      {/* {!!meta.label && (
        <Text style={[nameBadgeStyles.text, { color: meta.fg }]}>
          {meta.label}
        </Text>
      )} */}
    </View>
  );
};

const nameBadgeStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999
  },
  icon: { fontSize: 14 },
  text: { fontSize: 11, fontWeight: "900" }
});
function MessageItem({
  item,
  isMe,
  showName,
  onLongPress,
  onPressImage,
  onTogglePlay,
  playingId,
  progressAnim,
  giftDone,
  onGiftDone,
  onAvatarLongPress,
}: {
  item: MessageUI;
  isMe: boolean;
  showName: boolean;
  onLongPress: () => void;
  onPressImage: (uri: string) => void;
  onTogglePlay: (uri: string, id: string) => void;
  playingId: string | null;
  progressAnim: Animated.Value;
  giftDone?: boolean;
  onGiftDone?: () => void;
  onAvatarLongPress: (u?: UserUI) => void;
}) {
  const { width } = useWindowDimensions();

  if (item.type === "system") {
    return (
      <View style={bubbleStyles.sysWrap}>
        <View style={bubbleStyles.sysBubble}>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: String(item.text || "") }}
            baseStyle={{
              fontSize: 13,
              color: "#111827",
              textAlign: "center",
              fontWeight: "600",
              lineHeight: 18
            }}
          />
          <Text style={bubbleStyles.sysTime}>{item.time}</Text>
        </View>
      </View>
    );
  }

  const senderRole = item.sender?.role;
  const showStar = showName && !isMe && shouldShowStar(senderRole);
  const starColor = getStarColor(senderRole);
  const copyMessageContent = async () => {
    if (item.type === "system") return;
    if (item.deletedForEveryone) return;

    // ننسخ حسب النوع
    const value =
      item.type === "text"
        ? (item.text || "")
        : item.type === "file"
          ? (item.text || item.uri || "")
          : item.type === "image" || item.type === "video" || item.type === "audio"
            ? (item.uri || "")
            : "";

    const v = String(value || "").trim();
    if (!v) return;

    await Clipboard.setStringAsync(v);
    Alert.alert("Copied", "تم نسخ محتوى الرسالة");
  };
  return (
    <View style={[bubbleStyles.row, isMe ? bubbleStyles.rowMe : bubbleStyles.rowOther]}>
      {!isMe && (
        <Pressable
          style={bubbleStyles.avatarWrapLeft}
          onLongPress={() => onAvatarLongPress(item.sender)}
          delayLongPress={350}
        >
          <Image
            source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
            style={bubbleStyles.avatar}
          />
          {shouldShowStar(senderRole) && (
            <Text style={[bubbleStyles.avatarStar, { color: starColor }]}>★</Text>
          )}
        </Pressable>
      )}
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={onLongPress}
        onPress={() => {
          // ✅ لا ننسخ عند الضغط على أنواع لها تفاعل خاص داخل الفقاعة
          // (الصورة/الصوت لهم Touchables خاصة بهم بالفعل)
          if (item.type === "text" || item.type === "file") {
            copyMessageContent();
          }
        }}
        style={[
          bubbleStyles.bubble,
          isMe ? bubbleStyles.bubbleMe : bubbleStyles.bubbleOther
        ]}      >
        {showName && !!item.sender?.name && (
          <View style={bubbleStyles.nameWrap}>
            <View style={bubbleStyles.nameRow}>
              <Text style={bubbleStyles.senderName} numberOfLines={1}>
                {item.sender.name}
              </Text>

              {/* ✅ بادج بجانب الاسم */}
              <NameBadge badgeKey={pickPrimaryBadge(item.sender?.activeBadges)} />
            </View>

            {/* ✅ خط تحت الاسم */}
            <View style={bubbleStyles.nameUnderline} />
          </View>
        )}

        {!!item.deletedForEveryone ? (
          <Text style={bubbleStyles.msgTextMuted}>🚫 تم حذف الرسالة</Text>
        ) : (
          <>
            {!item.deletedForEveryone && item.replyTo && (
              <View style={bubbleStyles.replyBox}>
                <View style={bubbleStyles.replyTop}>
                  <Text style={bubbleStyles.replyName} numberOfLines={1}>
                    {item.replyTo.sender?.name || "User"}
                  </Text>
                  <Text style={bubbleStyles.replyTag}>Reply</Text>
                </View>

                {item.replyTo.type !== "text" ? (
                  <Text style={bubbleStyles.replyText} numberOfLines={1}>
                    {item.replyTo.type === "image"
                      ? "📷 Image"
                      : item.replyTo.type === "video"
                        ? "🎬 Video"
                        : item.replyTo.type === "audio"
                          ? "🎤 Voice"
                          : item.replyTo.type === "file"
                            ? "📄 File"
                            : "Message"}
                  </Text>
                ) : (
                  <Text style={bubbleStyles.replyText} numberOfLines={2}>
                    {stripHtmlToText(String(item.replyTo.text || "")) || "—"}
                  </Text>
                )}
              </View>
            )}
            {item.type === "text" && (
              <Text
                style={[
                  bubbleStyles.msgText,
                  isMe && {
                    textAlign: "right",
                    writingDirection: "rtl"
                  }
                ]}
              >
                {item.text}
              </Text>
            )}
            {item.type === "gift" ? (
              (() => {
                const key = item.gift?.key || "";
                const senderName = item.sender?.name || "Someone";

                // ✅ حالة Boost
                if (key.startsWith("boost")) {
                  return (
                    <Text style={[bubbleStyles.msgTextMuted, { fontWeight: "800", color: "#F59E0B" }]}>
                      🚀 {senderName} Boosted the Room
                    </Text>
                  );
                }

                // ✅ باقي الهدايا العادية
                return (
                  <Text style={bubbleStyles.msgTextMuted}>
                    🎁 {senderName} → {item.gift?.targetName || "Someone"} {item.gift?.icon || "🎁"}
                  </Text>
                );
              })()
            ) : null}
            {item.type === "image" && item.uri ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(item.uri!)}>
                <Image source={{ uri: item.uri }} style={bubbleStyles.media} />
              </TouchableOpacity>
            ) : null}

            {item.type === "video" && item.uri ? (
              <View style={bubbleStyles.videoWrapper}>
                <Video
                  source={{ uri: item.uri }}
                  style={bubbleStyles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping={false}
                />
              </View>
            ) : null}

            {item.type === "file" ? (
              <View style={bubbleStyles.fileRow}>
                <Text style={bubbleStyles.fileIcon}>📄</Text>
                <Text style={bubbleStyles.fileName} numberOfLines={1}>
                  {item.text || "File"}
                </Text>
              </View>
            ) : null}

            {item.type === "audio" && item.uri ? (
              <VoiceMessagePlayer
                uri={item.uri}
                isMe={isMe}

              />
            ) : null}
          </>
        )}

        {item.reaction && (
          <View style={bubbleStyles.reaction}>
            <Text>{item.reaction}</Text>
          </View>
        )}

        {/* <Text style={[bubbleStyles.time, { color: isMe ? "#E5E7EB" : COLORS.time }]}>{item.time}</Text> */}
      </TouchableOpacity>
      {isMe && (
        <Pressable
          style={bubbleStyles.avatarWrapRight}
          onLongPress={() => onAvatarLongPress(item.sender)}
          delayLongPress={350}
        >
          <Image
            source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
            style={bubbleStyles.avatar}
          />
          {shouldShowStar(senderRole) && (
            <Text style={[bubbleStyles.avatarStarRight, { color: starColor }]}>★</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

/* =====================================================
   ✅ USERS MODAL
===================================================== */

function UsersModal({
  visible,
  onClose,
  users,
  myUserId,
  myRole,
  onCopyUser,
  onChangeRole,
  onKickUser,
  onBanUser
}: {
  visible: boolean;
  onClose: () => void;
  users: UserUI[];
  myUserId: string;
  myRole?: UserUI["role"];
  onCopyUser: (u: UserUI) => void;
  onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
  onKickUser: (u: UserUI) => void;
  onBanUser: (u: UserUI) => void;
}) {
  const canManage = myRole === "creator" || myRole === "owner" || myRole === "admin";

  const roleLabel = (r?: string) => {
    if (r === "creator") return "Creator";
    if (r === "owner") return "Owner";
    if (r === "admin") return "Admin";
    return "Member";
  };

  const RoleChip = ({
    title,
    active,
    onPress
  }: {
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[usersStyles.roleChip, active && usersStyles.roleChipActive]}
      activeOpacity={0.85}
    >
      <Text style={[usersStyles.roleChipText, active && usersStyles.roleChipTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={usersStyles.overlay} onPress={onClose}>
        <Pressable style={usersStyles.sheet} onPress={() => { }}>
          <View style={usersStyles.header}>
            <Text style={usersStyles.title}>Users</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          <View style={usersStyles.note}>
            <Text style={usersStyles.noteText}>
              اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
              {canManage ? "يمكنك أيضًا تغيير الدور." : "ليس لديك صلاحية لتغيير الأدوار."}
            </Text>
          </View>

          <View style={usersStyles.list}>
            {users.map((u) => {
              const isMe = u.id === myUserId;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={usersStyles.row}
                  onPress={() => onCopyUser(u)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: u.avatar || "https://i.pravatar.cc/150?img=12" }}
                    style={usersStyles.avatar}
                  />

                  <View style={{ flex: 1 }}>
                    <View style={usersStyles.rowTop}>
                      <Text style={usersStyles.name} numberOfLines={1}>
                        {u.name} {isMe ? "(You)" : ""}
                      </Text>
                      <View style={usersStyles.badge}>
                        <Text style={usersStyles.badgeText}>{roleLabel(u.role)}</Text>
                      </View>
                    </View>

                    <Text style={usersStyles.sub} numberOfLines={1}>
                      ID: {u.id}
                    </Text>

                    {canManage && !isMe && (
                      <View style={usersStyles.rolesRow}>
                        <RoleChip
                          title="Member"
                          active={(u.role || "member") === "member"}
                          onPress={() => onChangeRole(u, "member")}
                        />
                        <RoleChip
                          title="Admin"
                          active={u.role === "admin"}
                          onPress={() => onChangeRole(u, "admin")}
                        />
                        <RoleChip
                          title="Owner"
                          active={u.role === "owner"}
                          onPress={() => onChangeRole(u, "owner")}
                        />
                      </View>
                    )}
                    {canManage && !isMe && (
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={() => onKickUser(u)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: "#FEF3C7",
                            borderWidth: 1,
                            borderColor: "#F59E0B"
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={{ fontWeight: "800", color: "#92400E" }}>Kick</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => onBanUser(u)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: "#FEE2E2",
                            borderWidth: 1,
                            borderColor: "#EF4444"
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={{ fontWeight: "800", color: "#991B1B" }}>Ban</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Ionicons name="copy-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* =====================================================
   ✅ MAIN SCREEN
===================================================== */

export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();

  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id || "");
  const [pinHtml, setPinHtml] = useState<string>("");
  const flatListRef = useRef<any>(null);
  const [pendingVoiceUri, setPendingVoiceUri] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [uploading, setUploading] = useState<{ visible: boolean; title: string; sub?: string }>({
    visible: false,
    title: "Uploading…",
    sub: undefined
  });

  const authUser = useAppSelector((state) => state.auth.user);
  const myUserId = String(authUser?._id || authUser?.id || "");
  const myName = String(authUser?.username || authUser?.name || "Me");
  const myAvatar = String(authUser?.avatar || "https://i.pravatar.cc/150?img=32");

  const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
  const loadingMessages = useAppSelector(selectRoomLoadingMessages);
  const roomUsers = useAppSelector((state) => selectRoomUsers(state, roomId));
  const roomName = useAppSelector((state) => selectRoomNameById(state, roomId));
  const roomAvatar = useAppSelector((state) => selectRoomAvatarById(state, roomId));
  // ✅ Active online count from slice (socket + stats)
  const activeCount = useAppSelector((state) => selectRoomActiveCount(state, roomId));
  const [giftPicker, setGiftPicker] = useState<{
    visible: boolean;
    target?: UserUI | null;
  }>({ visible: false, target: null });
  // ✅ دوري في الغرفة
  const myRole = useMemo<UserUI["role"]>(() => {
    const me = (roomUsers || []).find((u: any) => String(u?._id) === myUserId);
    return me?.role;
  }, [roomUsers, myUserId]);

  const canModerate = useMemo(
    () => myRole === "creator" || myRole === "owner" || myRole === "admin",
    [myRole]
  );

  const usersMap = useMemo(() => {
    const map = new Map<string, { username?: string; avatar?: string; role?: any }>();
    for (const u of roomUsers || []) {
      if (u?._id) map.set(String(u._id), { username: u.username, avatar: u.avatar, role: u.role });
    }
    if (myUserId) map.set(myUserId, { username: myName, avatar: myAvatar, role: myRole });
    return map;
  }, [roomUsers, myUserId, myName, myAvatar, myRole]);

  // UI states
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [replyTo, setReplyTo] = useState<MessageUI | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [giftDoneById, setGiftDoneById] = useState<Record<string, boolean>>({});
  const markGiftDone = (id: string) => setGiftDoneById((prev) => ({ ...prev, [id]: true }));

  // ✅ Fullscreen Gift Overlay
  const [giftOverlay, setGiftOverlay] = useState<{
    visible: boolean;
    messageId: string | null;
    giftKey: string | null;
    icon: string;
    count: number;
    fromName?: string;
    toName?: string;
  }>({
    visible: false,
    messageId: null,
    giftKey: null,
    icon: "🎁",
    count: 45,
    fromName: undefined,
    toName: undefined
  });

  const giftOverlayTimerRef = useRef<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [activeAudio, setActiveAudio] = useState<MessageUI | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinSelectedId, setPinSelectedId] = useState<string | null>(null);
  const [pinPreviewFull, setPinPreviewFull] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimer = useRef<any>(null);
  const [pinPreviewMessageId, setPinPreviewMessageId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | ImageSourcePropType | null>(null);
  // بدل string | null  // ✅ Menu
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // ✅ لمنع leave مرتين
  const didLeaveRef = useRef(false);
  const kicked = useAppSelector((state) => selectKickedFlag(state, roomId));
  const banned = useAppSelector((state) => selectBannedFlag(state, roomId));
  const messagesById = useMemo(() => {
    const mp = new Map<string, any>();
    for (const m of reduxMessages || []) {
      if (m?._id) mp.set(String(m._id), m);
    }
    return mp;
  }, [reduxMessages]);
  useEffect(() => {
    if (!roomId) return;
    if (!kicked) return;

    // امنع تكرار التنفيذ
    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const msg = kicked?.message || "تم طردك من الغرفة.";

    Alert.alert("تم الطرد", msg, [
      {
        text: "حسناً",
        onPress: async () => {
          try {
            // تنظيف من الستور + خروج
            await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
          } catch { }

          // امسح الفلاج بعد التعامل
          dispatch(clearKickedFlag({ roomId }));

          router.back();
        },
      },
    ]);
  }, [kicked, roomId, dispatch, router]);
  useEffect(() => {
    if (!roomId) return;
    if (!banned) return;

    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const reason = banned?.reason ? `السبب: ${banned.reason}` : "";
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
        },
      },
    ]);
  }, [banned, roomId, dispatch, router]);
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
            const reason = "Violation"; // أو اجعلها input لاحقًا

            const ack = await banRoomUserSocket({ roomId, targetId: u.id, reason });

            if (!ack?.ok) {
              Alert.alert("Error", ack?.message || "Ban failed");
              return;
            }

            Alert.alert("Done", `${u.name} banned`);

            // ✅ اختياري: تحديث المستخدمين
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Ban failed");
          }
        }
      }
    ]);
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

            // ✅ اختياري: تحديث قائمة المستخدمين عندك سريعًا
            // (لأن kick قد ينعكس عبر room:users:update أو room:roles:update، لكن هذا يجعلها أسرع)
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Kick failed");
          }
        }
      }
    ]);
  };
  /* ================= HELPERS ================= */


  const clipText = (s: string, max = 120) => {
    const t = String(s || "");
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + "…";
  };

  const safeDisplayText = (content: string) => {
    // ✅ للعرض في قائمة التثبيت: نستخدم النص المنقّى
    const cleaned = stripHtmlToText(content);
    return cleaned || "—";
  };

  // ✅ inverted list => bottom is offset 0
  const scrollToBottom = () => {
    try {
      flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    } catch {
      // ignore
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const resolveUserNameById = (id?: string) => {
    if (!id) return "";
    const v = usersMap.get(String(id));
    return String(v?.username || "");
  };

  const resolveAvatarById = (id?: string) => {
    if (!id) return "";
    const v = usersMap.get(String(id));
    return String(v?.avatar || "");
  };

  const normalizeRoleLabelAr = (role?: string) => {
    if (!role) return "عضو";
    if (role === "creator") return "منشئ";
    if (role === "owner") return "مالك";
    if (role === "admin") return "مشرف";
    return "عضو";
  };

  const pretty = (x: any) => {
    try {
      return JSON.stringify(x, null, 2);
    } catch {
      return String(x);
    }
  };

  const safeUserLog = (obj: any) => {
    // ✅ لا تطبع أي توكن/سيكرتس حتى لو وصلتك بالغلط
    const clone = obj ? JSON.parse(JSON.stringify(obj)) : obj;

    // إن وجدت حقول حساسة امسحها
    if (clone?.token) delete clone.token;
    if (clone?.accessToken) delete clone.accessToken;
    if (clone?.refreshToken) delete clone.refreshToken;
    if (clone?.authorization) delete clone.authorization;

    return clone;
  };



  // ✅ Helpers for user extraction + debug (ضعهم فوق mapReduxToUIMessage)

  const DEBUG_USER = true;

  const logSenderFromMessage = (m: any, tag = "SENDER_DUMP") => {
    try {
      const snap = m?.senderSnapshot;
      const active = snap?.activeCustomization;

      const dump = {
        tag,
        messageId: String(m?._id || ""),
        backendType: String(m?.type || ""),
        senderRaw: m?.sender, // قد يكون string id أو object
        senderSnapshot: snap
          ? {
            _id: String(snap?._id || ""),
            username: String(snap?.username || ""),
            atUsername: String(snap?.atUsername || ""),
            avatar: String(snap?.avatar || ""),
            verificationType: String(snap?.verificationType || ""),
            avatarFrame: String(snap?.avatarFrame || ""),
            badgesRoot: Array.isArray(snap?.badges) ? snap.badges : [],
            profileEntryAnimation: String(snap?.profileEntryAnimation || ""),
            activeCustomization: active
              ? {
                avatarFrame: String(active?.avatarFrame || ""),
                messageEffect: String(active?.messageEffect || ""),
                profileEntryAnimation: String(active?.profileEntryAnimation || ""),
                badges: Array.isArray(active?.badges) ? active.badges : [],
                verificationType: String(active?.verificationType || "")
              }
              : null
          }
          : null
      };

      console.log(`[${tag}]`, dump);
    } catch (e) {
      console.log(`[${tag}] FAILED`, e);
    }
  };

  const pickSenderFromMessage = (m: any) => {
    // sender قد يكون Object أو String
    const senderObj =
      typeof m?.sender === "object" && m?.sender
        ? m.sender
        : m?.sender
          ? { _id: String(m.sender), username: "", avatar: "" }
          : null;

    const snap = m?.senderSnapshot || null;

    const senderId = String(
      snap?._id ||
      senderObj?._id ||
      m?.senderId ||
      ""
    ).trim();

    // ✅ الاسم: Snapshot ثم senderObj ثم حقول fallback
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
      ""
    ).trim();

    // ✅ snapshotRole: غالبًا موجودة داخل senderSnapshot.role أو sender.role
    const snapshotRole = String(
      snap?.role || senderObj?.role || ""
    ).trim();
    const verificationType = String(
      snap?.verificationType || senderObj?.verificationType || ""
    ).trim();
    // ✅ badges: المكان الصحيح حسب لوجك
    const activeBadges: string[] =
      Array.isArray(snap?.activeCustomization?.badges) && snap.activeCustomization.badges.length
        ? snap.activeCustomization.badges
        : Array.isArray(snap?.badges) && snap.badges.length
          ? snap.badges
          : [];

    return {
      senderId,
      username,
      avatar,
      snapshotRole: snapshotRole || undefined,
      activeBadges,
      verificationType
    };
  };


  const mapReduxToUIMessage = (m: any): MessageUI => {
    // ✅ ديبج: طباعة بيانات المستخدم كاملة من الرسالة
    if (DEBUG_USER) {
      logSenderFromMessage(m, "MAP_MESSAGE_USER_DUMP");
    }

    const backendType = String(m?.type || "text");

    const isSystem =
      backendType === "system" ||
      backendType === "announcement" ||
      backendType === "join" ||
      backendType === "leave" ||
      backendType === "promotion" ||
      backendType === "ban" ||
      backendType === "role";

    // ✅ استخراج المرسل من الرسالة نفسها (snapshot أولاً)
    const picked = pickSenderFromMessage(m);
    const senderId = picked.senderId;

    // ✅ دمج البادجات + (اختياري) اعتبار verificationType كبادج
    const verificationToBadge = (verificationType?: string) => {
      const v = String(verificationType || "").trim().toLowerCase();
      if (!v || v === "none") return null;
      // متوقع: blue | gold | business
      return v;
    };

    const normalizeBadges = (badges?: string[]) => {
      const arr = Array.isArray(badges) ? badges : [];
      const cleaned = arr
        .map((x) => String(x || "").trim().toLowerCase())
        .filter(Boolean);

      const out: string[] = [];
      const seen = new Set<string>();
      for (const b of cleaned) {
        if (!seen.has(b)) {
          seen.add(b);
          out.push(b);
        }
      }
      return out;
    };

    // لو pickSenderFromMessage بيرجع verificationType ضمّه هنا، وإلا ساعتها هيبقى ""
    const extraBadge = verificationToBadge((picked as any)?.verificationType);

    const mergedBadges = normalizeBadges([
      ...(picked.activeBadges || []),
      ...(extraBadge ? [extraBadge] : [])
    ]);

    // اسم المستخدم للنظام/العرض
    let systemUserName = String(picked.username || "").trim();

    if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
    if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
    if (!systemUserName) systemUserName = "مستخدم";

    // ✅ نصوص النظام
    let systemText = String(m?.content || "");

    if (backendType === "join") {
      systemText = `✅ ${systemUserName} Join`;
    } else if (backendType === "leave") {
      systemText = `🚪 ${systemUserName} Left`;
    } else if (backendType === "promotion") {
      const action = String(m?.action || m?.meta?.action || "");
      const actor =
        String(m?.actorName || m?.meta?.actorName || "").trim() || systemUserName || "مشرف";
      const target = String(m?.targetName || m?.meta?.targetName || "").trim();
      const roleRaw = String(m?.role || m?.meta?.role || "").trim();

      const isRoleChange =
        action === "role:set" ||
        Boolean(
          m?.actorName ||
          m?.targetName ||
          m?.role ||
          m?.meta?.actorName ||
          m?.meta?.targetName ||
          m?.meta?.role
        );

      if (isRoleChange) {
        const targetName = target || "مستخدم";
        const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
        systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
      } else {
        systemText = `⭐ تمت ترقية ${systemUserName}`;
      }
    } else if (backendType === "ban") {
      systemText = `⛔ تم حظر ${systemUserName}`;
    } else if (backendType === "announcement") {
      systemText = `📢 ${m?.content || ""}`;
    } else if (backendType === "role") {
      const actor = String(m?.actorName || systemUserName || "مشرف");
      const target = String(m?.targetName || "مستخدم");
      const r = normalizeRoleLabelAr(String(m?.role || ""));
      systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
    }

    // replyTo (اترك الموجود عندك، هذا مجرد placeholder آمن)
    const replyRaw =
      m?.replyTo ||
      m?.replyToId ||
      m?.meta?.replyTo ||
      m?.meta?.replyToId ||
      null;

    const buildReplyPreview = (raw: any): MessageUI | undefined => {
      if (!raw) return undefined;

      // 1) replyTo = populated object
      if (typeof raw === "object") {
        const rid = String(raw?._id || "reply");
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

        return {
          id: rid,
          type: uiT,
          text: String(raw?.content || "Media message"),
          uri: raw?.media?.url,
          sender: {
            id: String(raw?.sender?._id || raw?.senderId || "unknown"),
            name: String(raw?.sender?.username || raw?.senderUsername || "User"),
            avatar: String(raw?.sender?.avatar || "")
          },
          time: ""
        };
      }

      // 2) replyTo = id string
      if (typeof raw === "string") {
        const rid = String(raw);
        const ref = messagesById.get(rid);

        // لو الرسالة الأصلية غير موجودة عندك في الذاكرة
        if (!ref) {
          return {
            id: rid,
            type: "text",
            text: "Replying to a message…",
            time: ""
          } as any;
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

        // استخرج اسم/صورة المرسل للرسالة الأصلية (snapshot أولاً)
        const pickedRef = pickSenderFromMessage(ref);
        const refSenderId = String(pickedRef?.senderId || "").trim();
        const refSenderName =
          String(pickedRef?.username || "").trim() ||
          (refSenderId === myUserId ? myName : String(resolveUserNameById(refSenderId) || "").trim()) ||
          "User";

        return {
          id: String(ref?._id || rid),
          type: uiT,
          text: String(ref?.content || "Media message"),
          uri: ref?.media?.url,
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
    // ✅ تحديد نوع رسالة UI
    let uiType: MessageUI["type"] = "text";
    if (isSystem) uiType = "system";
    else if (backendType === "gift") uiType = "gift";
    else if (backendType === "image") uiType = "image";
    else if (backendType === "video") uiType = "video";
    else if (backendType === "audio") uiType = "audio";
    else if (backendType === "file") uiType = "file";

    const time = new Date(m?.createdAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    // Reaction كما هو
    const firstReactionEmoji =
      Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";

    const uiReaction = REACTIONS.includes(firstReactionEmoji as any)
      ? (firstReactionEmoji as Reaction)
      : undefined;

    // ✅ role الخاص بالغرفة من usersMap إن وجد
    const roomRole = (usersMap.get(senderId)?.role as RoomRole | undefined);

    // ✅ senderUI يعتمد على snapshot أولاً
    const senderUI: UserUI = {
      id: String(senderId || "unknown"),
      name: picked.username || (senderId && senderId === myUserId ? myName : "User"),
      avatar: picked.avatar || (senderId && senderId === myUserId ? myAvatar : ""),
      role: roomRole,
      snapshotRole: picked.snapshotRole,
      activeBadges: mergedBadges // ✅ هنا المهم: دمج + تنظيف
    };

    // ✅ النص النهائي
    const messageText = isSystem ? systemText : String(m?.content || "");
    const giftPayload = m?.gift || m?.meta?.gift || null;

    // ✅ المفتاح الحقيقي للهديّة: من gift.key أولاً ثم fallback للـ content
    const giftKey =
      backendType === "gift"
        ? String(giftPayload?.key || m?.content || "")
        : "";

    const giftIcon =
      String(giftPayload?.icon || "") ||
      (GIFT_META[giftKey]?.icon || "🎁");

    const giftCount =
      Number(giftPayload?.count || 0) ||
      (GIFT_META[giftKey]?.count || 45);

    const giftTargetId = giftPayload?.targetId ? String(giftPayload.targetId) : undefined;
    const giftTargetName = giftPayload?.targetName ? String(giftPayload.targetName) : undefined;
    return {
      id: String(m?._id),
      type: uiType,
      systemType: isSystem ? (backendType as any) : undefined,
      text: messageText,
      uri: m?.media?.url,

      // ✅ announcement نظهر فيه sender
      // ✅ باقي system نخفي sender
      sender: backendType === "announcement" ? senderUI : isSystem ? undefined : senderUI,
      gift: uiType === "gift"
        ? {
          key: giftKey,
          icon: giftIcon,
          count: giftCount,
          targetId: giftTargetId,
          targetName: giftTargetName
        }
        : undefined,
      replyTo: uiReplyTo,
      reaction: uiReaction,
      deletedForEveryone: Boolean(m?.deletedForEveryone),
      time
    };
  };
  /* ✅ ضع latestPinned هنا */
  const latestPinned = useMemo(() => {
    const list = reduxMessages || [];
    const pinned = list.filter((m: any) => Boolean(m?.isPinned) && !m?.deletedForEveryone);
    if (!pinned.length) return null;

    pinned.sort((a: any, b: any) => {
      const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return tb - ta;
    });

    return mapReduxToUIMessage(pinned[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, roomUsers, myUserId, myName, myAvatar, myRole]);
  const uiMessages: MessageUI[] = useMemo(() => {
    if (!reduxMessages) return [];
    return reduxMessages.map(mapReduxToUIMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, roomUsers, myUserId, myName, myAvatar]);

  const usersUI: UserUI[] = useMemo(() => {
    return (roomUsers || []).map((u: any) => ({
      id: String(u?._id),
      name: String(u?.username || "User"),
      avatar: String(u?.avatar || ""),
      role: u?.role,
      isOnline: Boolean(u?.isOnline)
    }));
  }, [roomUsers]);

  /* ================= FETCH + SOCKET ================= */

  useEffect(() => {
    if (!roomId) return;

    dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false }));
    dispatch(fetchRoomUsers(roomId));
    dispatch(fetchRoomStats(roomId));

    // ✅ دخول السوكت عند فتح الشاشة
    joinRoomSocket(roomId);

    // ✅ لا تعمل leave هنا إطلاقًا
    return () => { };
  }, [roomId, dispatch]);

  // ✅ cleanup sound/timer
  useEffect(() => {
    return () => {
      try {
        if (recordTimer.current) clearInterval(recordTimer.current);
      } catch { }

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

  /* ================= AUDIO ================= */
  useEffect(() => {
    const latestGift = [...uiMessages].find(
      (m) => m.type === "gift" && !giftDoneById[m.id] && !m.deletedForEveryone
    );

    if (!latestGift) return;

    if (giftOverlay.visible && giftOverlay.messageId === latestGift.id) return;

    const key = String(latestGift.gift?.key || latestGift.text || "");
    const meta = GIFT_META[key] || { icon: "🎁", count: 45 };

    const fromName = latestGift.sender?.name || "Someone";
    const isBoost = key.startsWith("boost");

    const toName = isBoost ? "Room" : (latestGift.gift?.targetName || "Someone");
    setGiftOverlay({
      visible: true,
      messageId: latestGift.id,
      giftKey: key,
      icon: latestGift.gift?.icon || meta.icon,
      count: latestGift.gift?.count || meta.count,
      fromName,
      toName
    });

    // لا تحتاج تايمر هنا لو استخدمت onDone داخل GiftBurstOverlay
  }, [uiMessages, giftDoneById, giftOverlay.visible, giftOverlay.messageId]);
  const togglePlay = async (uri: string, id: string) => {
    if (recording) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true
    });

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

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
      duration: 120,
      useNativeDriver: false
    }).start();
  }, [playbackProgress, playbackDuration, progressAnim]);

  /* ================= SEND TEXT ================= */

  const sendText = async () => {
    const content = text.trim();
    if (!content || !roomId) return;

    try {
      await dispatch(
        sendRoomMessage({
          roomId,
          content,
          type: "text",
          replyTo: replyTo?.id
        })
      ).unwrap();

      setText("");
      setReplyTo(null);
      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Send failed");
    }
  };

  /* ================= MEDIA ================= */

  /* ================= MEDIA (Image/Video -> Cloudinary) ================= */
  const sendImage = async () => {
    if (!roomId) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (res.canceled) return;

    const localUri = res.assets?.[0]?.uri;
    if (!localUri) return;

    try {
      setUploading({ visible: true, title: "جاري رفع الصورة…", sub: "يرجى الانتظار" });

      const secureUrl = await uploadToCloudinary(localUri, "image");

      await dispatch(
        sendRoomMessage({
          roomId,
          content: "📷 Image",
          type: "image",
          media: { url: secureUrl }
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Upload failed");
    } finally {
      setUploading({ visible: false, title: "Uploading…", sub: undefined });
    }
  };

  const sendVideo = async () => {
    if (!roomId) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1
    });

    if (res.canceled) return;

    const localUri = res.assets?.[0]?.uri;
    if (!localUri) return;

    try {
      setUploading({ visible: true, title: "جاري رفع الفيديو…", sub: "قد يستغرق بعض الوقت" });

      const secureUrl = await uploadToCloudinary(localUri, "video");

      await dispatch(
        sendRoomMessage({
          roomId,
          content: "🎬 Video",
          type: "video",
          media: { url: secureUrl }
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Upload failed");
    } finally {
      setUploading({ visible: false, title: "Uploading…", sub: undefined });
    }
  };
  const unpinMessage = async (messageId: string) => {
    try {
      await dispatch(pinRoomMessage({ roomId, messageId, pinned: false })).unwrap();
      Alert.alert("Done", "تم إلغاء التثبيت");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Unpin failed");
    }
  };

  const sendPDF = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });

    if (res.assets && res.assets[0]) {
      await dispatch(
        sendRoomMessage({
          roomId,
          content: res.assets[0].name,
          type: "file",
          media: {
            url: res.assets[0].uri,
            fileName: res.assets[0].name,
            mimeType: "application/pdf"
          }
        })
      ).unwrap();

      scrollToBottom();
    }
  };



  /* ================= RECORDING ================= */

  const startRecording = async () => {
    try {
      if (pendingVoiceUri) return; // لا تبدأ تسجيل جديد وهناك Preview

      if (recording) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const result = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(result.recording);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Record failed");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        // ✅ لا ترسل الآن — اعرض Preview
        setPendingVoiceUri(uri);
      }
    } catch (e: any) {
      setRecording(null);
    }
  };

  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recording, pulseAnim]);

  /* ================= ACTIONS (Reaction/Reply/Delete) ================= */

  const addReaction = (messageId: string, emoji: Reaction) => {
    toggleRoomReactionSocket({ roomId, messageId, emoji });
    setShowActions(false);
  };

  const deleteMessage = (messageId: string) => {
    deleteRoomSocketMessage({ roomId, messageId });
    setShowActions(false);
  };

  /* ================= ROOM MENU ACTIONS ================= */

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
        `Active: ${stats?.activeCount ?? "-"}\nTotal: ${stats?.totalUsersCount ?? "-"}\nMessages: ${stats?.messagesCount ?? "-"
        }\nLevel: ${stats?.level ?? "-"}`
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load stats");
    }
  };

  /* ================= LEAVE ROOM ================= */

  const onLeaveRoom = async () => {
    if (!roomId) return;
    if (didLeaveRef.current) return;

    try {
      setShowRoomMenu(false);
      didLeaveRef.current = true;

      leaveRoomSocket(roomId);
      await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
      await dispatch(
        leaveAndRefreshRooms({ roomId, type: "public" })
      ).unwrap();
      router.back();
    } catch (e: any) {
      didLeaveRef.current = false;
      Alert.alert("Error", e?.message || "Failed to leave room");
    }
  };

  /* ================= USERS: COPY + CHANGE ROLE ================= */

  const onCopyUser = async (u: UserUI) => {
    await Clipboard.setStringAsync(`${u.name} (${u.id})`);
    Alert.alert("Copied", `Copied: ${u.name}`);
  };

  // ✅ تغيير Role عبر السوكت مع ACK
  const onChangeRole = async (u: UserUI, newRole: UserUI["role"]) => {
    try {
      if (!canModerate) {
        Alert.alert("No permission", "ليس لديك صلاحية لتغيير الدور");
        return;
      }

      if (!u?.id || u.id === myUserId) return;
      if (!roomId) return;

      dispatch(socketRoleSetRequested({ roomId, targetId: u.id, role: newRole as any }));

      const ack = await setRoomUserRoleSocket({
        roomId,
        targetId: u.id,
        role: newRole as any
      });

      if (ack?.ok) {
        dispatch(socketRoleSetSucceeded());
        // لا نعدل الدور محلياً هنا — التحديث الحقيقي سيصل عبر room:roles:update
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


  // ✅ داخل ChatScreen() استبدل onBoostRoom بهذا الشكل (يستخدم boostRoom من roomControl.slice)
  // ملاحظة: افترضت أنك مستورد boostRoom من roomControl.slice.ts
  // import { boostRoom } from "@/redux/slices/roomControl.slice";

  const onBoostRoom = async () => {
    try {
      if (!canModerate) {
        Alert.alert("No permission", "You don't have permission to boost this room.");
        return;
      }
      if (!roomId) return;

      const level = 1;
      const hours = 24;

      // ✅ لازم نستلم نتيجة البوست
      const r = await dispatch(boostRoom({ roomId, level, hours })).unwrap();

      // ✅ شرط نجاح "مؤكد"
      if (!r?.boostExpiresAt && typeof r?.boostLevel !== "number") {
        Alert.alert("Error", "Boost did not succeed.");
        return; // ❌ لا ترسل Gift
      }

      // ✅ الآن فقط: أرسل Gift
      await dispatch(
        sendRoomMessage({
          roomId,
          type: "gift",
          content: "boost_rocket", // fallback فقط
          gift: {
            key: "boost_rocket",
            name: "boost",
            value: level,
            icon: "🚀",
            animation: "rocket"
            // ✅ لا target في boost
          }
        })
      ).unwrap();

      const content = `🚀 <b>${myName}</b> boosted the room!`;
      await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();

    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e) || "Boost failed");
    }
  };
  const goDetails = () => {
    router.push({
      pathname: "/room-details",
      params: { roomId: roomId }
    });
  };

  /* ================= RENDER ================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={goDetails}>
              <Image
                source={{ uri: roomAvatar || "https://i.pravatar.cc/150?img=12" }}
                style={styles.avatar}
              />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {roomName}
              </Text>

              <Text style={styles.online}>
                {loadingMessages ? "Loading..." : `Online: ${activeCount} • ${uiMessages.length} Messages`}
              </Text>
            </View>
          </View>


          <View style={styles.headerRight}>
            {/* 🚀 Boost */}
            <TouchableOpacity onPress={onBoostRoom} hitSlop={10} style={{ marginRight: 10 }}>
              <Ionicons name="rocket-outline" size={20} />
            </TouchableOpacity>

            {/* Menu */}
            <TouchableOpacity onPress={() => setShowRoomMenu(true)} hitSlop={10}>
              <Ionicons name="ellipsis-vertical" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= ROOM MENU ================= */}
        <Modal transparent visible={showRoomMenu} animationType="fade" onRequestClose={() => setShowRoomMenu(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.menuOverlay} onPress={() => setShowRoomMenu(false)}>
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={onRefreshRoom}>
                <Ionicons name="refresh" size={18} color="#111827" />
                <Text style={styles.menuText}>Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onOpenUsers}>
                <Ionicons name="people" size={18} color="#111827" />
                <Text style={styles.menuText}>Users</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onOpenStats}>
                <Ionicons name="stats-chart" size={18} color="#111827" />
                <Text style={styles.menuText}>Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowRoomMenu(false);
                  setShowPinModal(true);
                }}
              >
                <Ionicons name="pin" size={18} color="#111827" />
                <Text style={styles.menuText}>Pin Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowRoomMenu(false);

                  router.push({
                    pathname: "/room/[id]/settings",
                    params: { id: roomId }, // تأكد أن roomId موجود
                  });
                }}
              >
                <Ionicons name="settings-outline" size={18} color="#111827" />
                <Text style={styles.menuText}>Setting Room</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={onLeaveRoom}>
                <Ionicons name="exit-outline" size={18} color="#EF4444" />
                <Text style={[styles.menuText, { color: "#EF4444" }]}>Leave Room</Text>
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
          myRole={myRole}
          onCopyUser={onCopyUser}
          onChangeRole={onChangeRole}
          onKickUser={onKickUser}
          onBanUser={onBanUser}
        />

        {/* ================= GLOBAL AUDIO BAR (اختياري) ================= */}
        {activeAudio && (
          <View style={styles.globalAudioPlayer}>
            <View style={styles.audioIcon}>
              <Ionicons name="musical-notes" size={18} color="#FFF" />
            </View>

            <View style={styles.audioCenter}>
              <Text style={styles.audioNow}>Playing voice…</Text>

              <View style={styles.globalProgressBg}>
                <Animated.View
                  style={[
                    styles.globalProgressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"]
                      })
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
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
        {latestPinned && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.pinnedBar}
            onPress={() => {
              setPinPreviewMessageId(latestPinned.id);
              setPinPreviewFull(true);
            }}
          >
            <View style={styles.pinnedLeft}>
              <Ionicons name="pin" size={18} color="#6D5DF6" />
              <Text style={styles.pinnedTitle}>Pinned</Text>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pinnedText} numberOfLines={1}>
                {clipText(safeDisplayText(latestPinned.text || ""), 80)}
              </Text>
              <Text style={styles.pinnedMeta} numberOfLines={1}>
                {latestPinned.sender?.name ? `${latestPinned.sender.name} • ` : ""}{latestPinned.time}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {/* ================= CHAT ================= */}
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={uiMessages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14 }}
          renderItem={({ item, index }) => {
            const isMe = Boolean(myUserId) && item.sender?.id === myUserId;


            const previousMessage = uiMessages[index + 1];
            const showName =
              !previousMessage ||
              previousMessage.type === "system" ||
              previousMessage.sender?.id !== item.sender?.id;

            return (
              <MessageItem
                item={item}
                isMe={isMe}
                showName={showName}
                onAvatarLongPress={(u) => {
                  if (!u?.id) return;
                  setGiftPicker({ visible: true, target: u });
                }}
                onPressImage={(payload) => {
                  if (String(payload).startsWith("gift:")) {
                    // لم نعد نفتح صورة، لكن يمكنك ترك هذا إن احتجته لاحقًا
                    return;
                  }
                  setPreviewImage(payload);
                }}
                onTogglePlay={togglePlay}
                playingId={playingId}
                progressAnim={progressAnim}
                onLongPress={() => {
                  // لا تعرض منيو على رسائل النظام أو الرسائل المحذوفة (اختياري)
                  setSelectedMessage(item);
                  setShowActions(true);

                }}
                giftDone={Boolean(giftDoneById[item.id])}
                onGiftDone={() => markGiftDone(item.id)}
              />
            );
          }}
        />

        {/* ================= REPLY PREVIEW ================= */}
        {replyTo && (
          <View style={styles.replyPreview}>
            <Text numberOfLines={1}>Replying to: {replyTo.text || "Media"}</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={18} />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= RECORD INFO ================= */}
        {!!pendingVoiceUri && (
          <VoiceRecorderPreview
            uri={pendingVoiceUri}
            onCancel={() => setPendingVoiceUri(null)}
            onSend={async () => {
              if (!roomId || !pendingVoiceUri) return;
              try {
                setUploading({ visible: true, title: "جاري رفع الصوت…", sub: "يرجى الانتظار" });

                // ✅ ارفع الصوت (افترض أنك تدعم type="audio" داخل uploadToCloudinary)
                const secureUrl = await uploadToCloudinary(pendingVoiceUri, "raw");

                await dispatch(
                  sendRoomMessage({
                    roomId,
                    content: "🎤 Voice message",
                    type: "audio",
                    media: { url: secureUrl }
                  })
                ).unwrap();

                // (اختياري) احذف الملف المحلي بعد الإرسال
                try { await FileSystem.deleteAsync(pendingVoiceUri, { idempotent: true }); } catch { }

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
        {/* ================= INPUT ================= */}
        {/* ================= INPUT ================= */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={sendImage} disabled={uploading.visible}>
            <Ionicons name="image-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendPDF} disabled={uploading.visible}>
            <Ionicons name="document-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendVideo} disabled={uploading.visible}>
            <Ionicons name="videocam-outline" size={24} />
          </TouchableOpacity>

          <TextInput style={styles.input} placeholder="Type a message" value={text} onChangeText={setText} multiline />

          {text ? (
            <TouchableOpacity onPress={sendText} disabled={uploading.visible}>
              <Ionicons name="send" size={22} color={COLORS.me} />
            </TouchableOpacity>
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPressIn={startRecording}
                onPressOut={stopRecording}
                disabled={uploading.visible || !!pendingVoiceUri}
              >
                <Ionicons name="mic" size={26} color={recording ? "#EF4444" : "#000"} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* ================= ACTIONS MODAL ================= */}
        <Modal transparent visible={showActions} animationType="fade" onRequestClose={() => setShowActions(false)}>
          <View style={styles.actionsOverlay}>
            <View style={styles.actionsBox}>
              <View style={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <TouchableOpacity key={r} onPress={() => selectedMessage && addReaction(selectedMessage.id, r)}>
                    <Text style={{ fontSize: 22 }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setReplyTo(selectedMessage);
                  setShowActions(false);
                }}
              >
                <Text style={styles.action}>Reply</Text>
              </TouchableOpacity>

              {/* ✅ Delete permission: صاحب الرسالة أو المشرف */}
              {(selectedMessage?.sender?.id === myUserId || canModerate) &&
                selectedMessage?.type !== "system" &&
                !selectedMessage?.deletedForEveryone && (
                  <TouchableOpacity onPress={() => selectedMessage && deleteMessage(selectedMessage.id)}>
                    <Text style={[styles.action, { color: "red" }]}>Delete</Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity onPress={() => setShowActions(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ================= IMAGE PREVIEW MODAL ================= */}
        <Modal
          visible={!!previewImage}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>

            <Image
              source={typeof previewImage === "string" ? { uri: previewImage } : previewImage!}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
        <Modal
          transparent
          visible={showPinModal}
          animationType="fade"
          onRequestClose={() => setShowPinModal(false)}
        >
          <Pressable style={styles.pinOverlay} onPress={() => setShowPinModal(false)}>
            <Pressable style={styles.pinSheet} onPress={() => { }}>
              <View style={styles.pinHeader}>
                <Text style={styles.pinTitle}>Pin a message</Text>

                <TouchableOpacity onPress={() => setShowPinModal(false)} style={styles.pinCloseBtn}>
                  <Ionicons name="close" size={20} color="#111827" />
                </TouchableOpacity>
              </View>

              <View style={styles.pinList}>
                <Text style={styles.pinLabel}>رسالة التثبيت</Text>

                <View style={styles.pinInputWrap}>
                  <Ionicons name="text-outline" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.pinInput}
                    placeholder="اكتب رسالة التثبيت (تقبل HTML مثل <b>...</b> و <br /> )"
                    placeholderTextColor="#9CA3AF"
                    value={pinHtml}
                    onChangeText={setPinHtml}
                    multiline
                  />
                </View>

                {!!pinHtml.trim() && (
                  <View style={styles.pinPreviewBox}>
                    <Text style={styles.pinPreviewTitle}>معاينة</Text>

                    <RenderHTML
                      contentWidth={width - 60}
                      source={{ html: String(pinHtml) }}
                      baseStyle={{ fontSize: 13, color: "#111827", lineHeight: 20 }}
                    />
                  </View>
                )}
              </View>

              <View style={styles.pinActions}>
                <TouchableOpacity
                  style={[styles.pinBtn, styles.pinBtnCancel]}
                  onPress={() => setShowPinModal(false)}
                >
                  <Text style={styles.pinBtnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pinBtn, !pinHtml.trim() && styles.pinBtnDisabled]}
                  disabled={!pinHtml.trim()}
                  onPress={async () => {
                    try {
                      const content = pinHtml.trim();
                      if (!content) return;

                      // 1) إنشاء رسالة announcement
                      const created = await dispatch(
                        sendRoomMessage({
                          roomId,
                          content,
                          type: "announcement",
                        })
                      ).unwrap();

                      // ✅ 2) استخراج messageId الصحيح حسب نوع الـ thunk عندك
                      const messageId = created?.message?._id;

                      if (!messageId) {
                        Alert.alert("Error", "لم يتم الحصول على id للرسالة الجديدة.");
                        return;
                      }

                      // 3) تثبيت الرسالة
                      await dispatch(pinRoomMessage({ roomId, messageId, pinned: true })).unwrap();

                      setShowPinModal(false);
                      setPinHtml("");
                      Alert.alert("Done", "تم إرسال الرسالة وتثبيتها");
                    } catch (e: any) {
                      Alert.alert("Error", e?.message || "Pin failed");
                    }
                  }}
                >
                  <Ionicons name="pin" size={16} color="#FFF" />
                  <Text style={styles.pinBtnText}>Pin</Text>
                </TouchableOpacity>
              </View>

              {/* ✅ Preview Full (Safe text only) */}
              <Modal
                transparent
                visible={pinPreviewFull}
                animationType="fade"
                onRequestClose={() => setPinPreviewFull(false)}
              >
                <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
                  <Pressable style={styles.fullBox} onPress={() => { }}>
                    <View style={styles.fullHeader}>
                      <Text style={styles.fullTitle}>Full preview</Text>
                      <TouchableOpacity onPress={() => setPinPreviewFull(false)}>
                        <Ionicons name="close" size={20} color="#111827" />
                      </TouchableOpacity>
                    </View>

                    {(() => {
                      const msg = uiMessages.find((x) => x.id === pinSelectedId);
                      const raw = msg?.text || "";
                      const cleaned = safeDisplayText(raw);

                      return (
                        <Text style={styles.fullText}>
                          {cleaned}
                        </Text>
                      );
                    })()}
                  </Pressable>
                </Pressable>
              </Modal>
            </Pressable>
          </Pressable>
        </Modal>
        <Modal
          transparent
          visible={pinPreviewFull}
          animationType="fade"
          onRequestClose={() => setPinPreviewFull(false)}
        >
          <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
            <Pressable style={styles.fullBox} onPress={() => { }}>
              <View style={styles.fullHeader}>
                <Text style={styles.fullTitle}>Pinned message</Text>

                {latestPinned && canModerate && (
                  <TouchableOpacity onPress={() => unpinMessage(latestPinned.id)}>
                    <Text style={{ color: "red", fontWeight: "800" }}>Unpin</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setPinPreviewFull(false)}>
                  <Ionicons name="close" size={20} color="#111827" />
                </TouchableOpacity>
              </View>

              {(() => {
                // نعتمد على latestPinned لأنه أحدث مثبت، ولو حبيت لاحقًا تدعم أكثر من مثبت
                const msg = latestPinned;
                const raw = msg?.text || "";

                return (
                  <>
                    <Text style={styles.fullMeta}>
                      {msg?.sender?.name ? `${msg.sender.name} • ` : ""}{msg?.time || ""}
                    </Text>

                    <RenderHTML
                      contentWidth={width - 40}
                      source={{ html: String(raw || "") }}
                      baseStyle={{ fontSize: 13, color: "#111827", lineHeight: 20 }}
                    />
                  </>
                );
              })()}
            </Pressable>
          </Pressable>
        </Modal>
        {/* ================= GIFT FULLSCREEN OVERLAY ================= */}
        {String(giftOverlay.giftKey || "").startsWith("boost") ? (
          <RocketBoostOverlay
            visible={giftOverlay.visible}
            durationMs={2800}
            onDone={() => {
              if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
              setGiftOverlay({
                visible: false,
                messageId: null,
                giftKey: null,
                icon: "🎁",
                count: 45,
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
              });
            }}
          />
        )}
        <GiftPickerModal
          visible={giftPicker.visible}
          target={giftPicker.target}
          onClose={() => setGiftPicker({ visible: false, target: null })}
          onPick={async (g) => {
            try {
              const target = giftPicker.target;
              setGiftPicker({ visible: false, target: null });

              if (!roomId) return;
              const isBoost = String(g.key || "").startsWith("boost");

              // ✅ الهدايا تحتاج target - البوست لا يحتاج
              if (!isBoost && !target?.id) {
                Alert.alert("Error", "Target user not found");
                return;
              }

              // ✅ استخدم meta لو موجود
              const meta = GIFT_META[g.key] || { icon: "🎁", count: 45 };

              // ✅ أرسل Gift Message (يفضل أن السيرفر يحفظ targetId/targetName داخل gift)
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

              // (اختياري) إعلان system/announcement
              const toLabel = isBoost ? "Room" : (target?.name || "Someone");

              const announce = `🎁 <b>${myName}</b> sent ${meta.icon} to <b>${toLabel}</b>`;
              await dispatch(sendRoomMessage({ roomId, content: announce, type: "announcement" })).unwrap();
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to send gift");
            }
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const bubbleStyles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
  rowOther: { justifyContent: "flex-start" },
  rowMe: { justifyContent: "flex-end" },
  giftWrap: {
    marginTop: 6,
    width: 220,
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  giftLottie: {
    width: "100%",
    height: "100%"
  },

  avatarStar: {
    position: "absolute",
    top: -6,
    left: -10,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    marginRight: 8,
    position: "relative",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEE"
  },

  avatarSpacer: {
    width: 40,
    marginRight: 8
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },

  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6
  },

  bubbleMe: {
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 6
  },

  senderName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 4
  },

  msgText: { fontSize: 15, color: "#111827", lineHeight: 20 },
  msgTextMuted: { fontSize: 14, color: "#6B7280" },

  time: { fontSize: 11, marginTop: 6, alignSelf: "flex-end" },
  nameWrap: {
    marginBottom: 6
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  roleStar: {
    fontSize: 12,
    fontWeight: "900"
  },
  nameUnderline: {
    marginTop: 4,
    height: 1,
    backgroundColor: "#E5E7EB",
    width: "100%"
  },
  media: { width: 220, height: 220, borderRadius: 12, marginTop: 4 },

  videoWrapper: {
    width: 240,
    height: 170,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginTop: 6
  },
  video: { width: "100%", height: "100%" },

  fileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  fileIcon: { fontSize: 18 },
  fileName: { maxWidth: 200, fontSize: 14, color: "#111827" },

  audioRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  audioProgressWrapper: { flex: 1, minWidth: 160 },
  avatarWrapLeft: {
    width: 40,
    height: 40,
    marginRight: 8,
    position: "relative"
  },
  avatarStarLeft: {
    position: "absolute",
    top: -6,
    right: -10, // ⭐ للآخرين: أعلى يمين الصورة
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  replyBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#6D5DF6",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8
  },
  replyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4
  },
  replyName: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    maxWidth: "78%"
  },
  replyTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280"
  },
  replyText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16
  },
  avatarStarRight: {
    position: "absolute",
    top: -6,
    right: -10, // ⭐ لك: أعلى يسار الصورة
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  avatarWrapRight: {
    width: 40,
    height: 40,
    marginLeft: 8,
    position: "relative"
  },
  audioProgressBg: {
    height: 3,
    width: "100%",
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 6
  },
  audioProgressFill: { height: "100%", borderRadius: 2 },
  audioLabel: { fontSize: 12 },

  reaction: {
    position: "absolute",
    bottom: -10,
    right: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  sysWrap: { width: "100%", alignItems: "center", marginVertical: 6 },
  sysBubble: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14
  },
  sysText: { fontSize: 13, color: "#111827", textAlign: "center", fontWeight: "600" },
  sysTime: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 4 }
});

const usersStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
    maxHeight: "80%"
  },
  header: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800" },
  note: { marginTop: 10, backgroundColor: "#F3F4F6", padding: 10, borderRadius: 12 },
  noteText: { fontSize: 12, color: "#374151", lineHeight: 18 },
  list: { marginTop: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EEE" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 14, fontWeight: "800", color: "#111827", maxWidth: 220 },
  sub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  badge: { backgroundColor: "#EEF2FF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, color: "#3730A3", fontWeight: "800" },

  rolesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  roleChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  roleChipActive: { backgroundColor: "#6D5DF6", borderColor: "#6D5DF6" },
  roleChipText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  roleChipTextActive: { color: "#FFF" }
});

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 75,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF"
  },
  pinOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end"
  },
  pinSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    maxHeight: "80%"
  },
  pinHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pinTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  pinCloseBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pinHint: { marginTop: 8, fontSize: 12, color: "#6B7280", lineHeight: 18 },

  pinList: { marginTop: 12 },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10
  },

  pinRowActive: { borderColor: "#6D5DF6", backgroundColor: "#EEF2FF" },
  pinRowTitle: { fontSize: 12, fontWeight: "800", color: "#111827" },
  pinRowText: { fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 18 },
  pinMore: { marginTop: 6, fontSize: 12, color: "#2563EB", fontWeight: "800" },

  pinActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6
  },
  pinBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#6D5DF6"
  },
  pinBtnText: { color: "#FFF", fontWeight: "800" },
  pinBtnCancel: { backgroundColor: "#F3F4F6" },
  pinBtnCancelText: { color: "#111827", fontWeight: "800" },
  pinBtnDisabled: { opacity: 0.5 },


  pinnedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  pinnedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  pinnedTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827"
  },
  pinnedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151"
  },
  pinLabel: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#111827" },

  pinInputWrap: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB"
  },

  pinInput: {
    flex: 1,
    minHeight: 110,
    maxHeight: 180,
    fontSize: 13,
    color: "#111827",
    lineHeight: 18
  },

  pinPreviewBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE"
  },

  pinPreviewTitle: { fontSize: 12, fontWeight: "900", color: "#111827" },
  pinPreviewNote: { marginTop: 6, fontSize: 12, color: "#374151", lineHeight: 18 },
  pinnedMeta: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280"
  },

  fullOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  fullBox: {
    width: "100%",
    maxHeight: "70%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14
  },
  fullHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  giftFullOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center"
  },
  giftFullLottie: {
    width: "100%",
    height: "100%"
  },
  fullMeta: { fontSize: 12, color: "#6B7280", marginBottom: 10, fontWeight: "700" },
  fullTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  fullText: { fontSize: 13, color: "#111827", lineHeight: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", gap: 16, paddingRight: 15 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEE" },
  name: { fontSize: 16, fontWeight: "800" },
  online: { fontSize: 12, color: "#6B7280" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF"
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120
  },

  replyPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#EEF2FF"
  },

  recordInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF"
  },

  actionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center"
  },
  actionsBox: {
    backgroundColor: "#FFF",
    width: "80%",
    borderRadius: 16,
    padding: 16
  },
  reactionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  action: { fontSize: 16, paddingVertical: 10, fontWeight: "700" },
  cancel: { textAlign: "center", marginTop: 8, color: "#6B7280", fontWeight: "700" },

  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center"
  },
  fullImage: { width: "100%", height: "100%" },
  imagePreviewClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },

  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.12)" },
  menuBox: {
    position: "absolute",
    top: 60,
    right: 12,
    width: 190,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  menuText: { fontSize: 14, color: "#111827", fontWeight: "800" },
  menuDivider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 6 },

  globalAudioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB"
  },
  audioIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#6D5DF6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  audioCenter: { flex: 1 },
  audioNow: { fontSize: 12, color: "#111827", fontWeight: "800", marginBottom: 6 },
  globalProgressBg: {
    width: "100%",
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden"
  },
  globalProgressFill: { height: "100%", backgroundColor: "#6D5DF6" },
  audioTimes: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  timeText: { fontSize: 11, color: "#6B7280" },


  avatarWrap: {
    width: 34,
    height: 34,
    marginRight: 8,
    position: "relative",
  },

  avatarStar: {
    position: "absolute",
    top: -6,     // أعلى
    right: -10,  // يمين وبجانب الصورة (خارجها)
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  avatarStarText: {
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 12
  },
});