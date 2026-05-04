
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Audio, ResizeMode, Video } from "expo-av";
// import * as Clipboard from "expo-clipboard";
// import * as DocumentPicker from "expo-document-picker";
// import * as ImagePicker from "expo-image-picker";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActionSheetIOS,
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   ListRenderItem,
//   Modal,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { useKeyboardHandler } from "react-native-keyboard-controller";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// import api from "@/services/api";

// import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
// import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";

// import {
//   addMessage,
//   loadMessages,
//   MessageItem,
//   setMessages
// } from "@/redux/slices/messageSlice";

// import {
//   clearSearchResults,
//   searchMessagesInChat,
//   setActiveChat,
//   setSearchQuery,
// } from "@/redux/slices/chatSlice";

// import { blockUser } from "@/redux/slices/followSlice";
// import { unblockUser } from "@/redux/slices/friendSlice";
// import {
//   fetchBlockStatus,
//   fetchUserProfile,
// } from "@/redux/slices/userSlice";

// import { useColorScheme } from "@/hooks/use-color-scheme";
// import {
//   selectChatById,
//   selectCurrentUser,
//   selectMessagesByChatId,
//   selectOtherUser,
//   selectTypingUsersByChatId,
// } from "@/redux/selectors";
// import { AppDispatch, RootState } from "@/redux/store";
// import {
//   emitMarkAsSeen,
//   emitTyping,
//   joinChatRoom,
//   leaveChatRoom,
//   sendSocketMessage,
// } from "@/services/socket";
// import { uploadToCloudinary } from "@/services/upload.service";
// import { loadMessagesFromCache, saveMessagesToCache } from "@/storage/chatCache";
// import { formatLastSeen, formatTime } from "@/utils/helpFunctions";
// import { mergeMessages } from "@/utils/mergeMessages";

// type RelationshipStatus =
//   | "none"
//   | "pending_sent"
//   | "pending_received"
//   | "accepted"
//   | "blocked_by_me"
//   | "blocked_me";

// type ProfileUser = {
//   _id: string;
//   username: string;
//   atUsername?: string;
//   bio?: string;
//   country?: string;
//   city?: string;
//   avatar?: string;
//   coverImage?: string;
//   dateOfBirth?: string;
//   followersCount?: number;
//   followingCount?: number;
//   totalLikesReceived?: number;
//   profileViews?: number;
//   isOnline?: boolean;
//   lastSeen?: string;
//   isVerified?: boolean;
//   tags?: string[];
//   relationshipStatus?: RelationshipStatus;
//   isFollowing?: boolean;
// };

// type SearchResultItem = {
//   _id: string;
//   chat: string;
//   sender: string | { _id: string; username?: string; avatar?: string };
//   content: string;
//   type: string;
//   media?: any;
//   replyTo?: any;
//   createdAt: string;
//   updatedAt: string;
// };

// type ReplyState = {
//   _id: string;
//   content?: string;
//   type?: string;
//   sender?: string;
//   media?: any;
// } | null;
// function RoomInviteCard({
//   item,
//   isMe,
//   isDark,
//   onJoin,
// }: {
//   item: MessageItem;
//   isMe: boolean;
//   isDark: boolean;
//   onJoin: (roomId: string) => void;
// }) {
//   const invite = item.roomInvite;
//   if (!invite?.roomId) return null;

//   return (
//     <View
//       style={[
//         styles.inviteCard,
//         {
//           backgroundColor: isMe
//             ? "rgba(255,255,255,0.12)"
//             : isDark
//               ? "#0F172A"
//               : "#EEF2FF",
//           borderColor: isMe
//             ? "rgba(255,255,255,0.18)"
//             : isDark
//               ? "#1F2937"
//               : "#C7D2FE",
//         },
//       ]}
//     >
//       <View style={styles.inviteTopRow}>
//         {!!invite.roomAvatar ? (
//           <Image source={{ uri: invite.roomAvatar }} style={styles.inviteAvatar} />
//         ) : (
//           <View style={styles.inviteAvatarPlaceholder}>
//             <Ionicons name="people-outline" size={18} color="#FFF" />
//           </View>
//         )}

//         <View style={{ flex: 1 }}>
//           <Text
//             numberOfLines={1}
//             style={[
//               styles.inviteRoomName,
//               { color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827" },
//             ]}
//           >
//             {invite.roomName || "غرفة"}
//           </Text>

//           {!!invite.invitedByName && (
//             <Text
//               numberOfLines={1}
//               style={[
//                 styles.inviteMetaText,
//                 { color: isMe ? "rgba(255,255,255,0.85)" : isDark ? "#CBD5E1" : "#4B5563" },
//               ]}
//             >
//               دعوة من {invite.invitedByName}
//             </Text>
//           )}
//         </View>
//       </View>

//       {!!(invite.message || item.content) && (
//         <Text
//           style={[
//             styles.inviteMessageText,
//             { color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827" },
//           ]}
//         >
//           {invite.message || item.content}
//         </Text>
//       )}

//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.joinRoomBtn}
//         onPress={() => onJoin(invite.roomId)}
//       >
//         <Ionicons name="enter-outline" size={16} color="#FFF" />
//         <Text style={styles.joinRoomBtnText}>انضمام للغرفة</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// export default function ChatScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const chatId = id as string;

//   const { colorScheme, themePreference, setThemePreference } = useColorScheme();

//   const isDark = colorScheme === "dark";

//   const dispatch = useDispatch<AppDispatch>();
//   const insets = useSafeAreaInsets();

//   const keyboardHeight = useSharedValue(0);
//   const flatListRef = useRef<FlatList<any>>(null);
//   const recordingRef = useRef<Audio.Recording | null>(null);
//   const typingTimeout = useRef<any>(null);
//   const searchTimeout = useRef<any>(null);
//   const messagesRef = useRef<MessageItem[]>([]);
//   const [page, setPage] = useState(1);
//   const [loadedPages, setLoadedPages] = useState<number[]>([1]);
//   const [hasMore, setHasMore] = useState(true);

//   const [text, setText] = useState("");
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedUri, setRecordedUri] = useState<string | null>(null);
//   const [mediaSendingState, setMediaSendingState] = useState<
//     Record<string, "uploading" | "sending">
//   >({});
//   const [rel, setRel] = useState<RelationshipStatus>("none");

//   const [searchOpen, setSearchOpen] = useState(false);
//   const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
//   const [selectedSearchMessageId, setSelectedSearchMessageId] = useState<string | null>(null);

//   const [replyToMessage, setReplyToMessage] = useState<ReplyState>(null);

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
//       transform: [{ translateY: -keyboardHeight.value }],
//     };
//   });

//   const listSpacerAnimatedStyle = useAnimatedStyle(() => {
//     return {
//       height: keyboardHeight.value,
//     };
//   });

//   const currentUser = useSelector(selectCurrentUser);

//   const chat = useSelector(useMemo(() => selectChatById(chatId), [chatId]));

//   const messages = useSelector(
//     useMemo(() => selectMessagesByChatId(chatId), [chatId])
//   );


//   useEffect(() => {
//     messagesRef.current = Array.isArray(messages) ? messages : [];
//   }, [messages]);


// useEffect(() => {
//   if (!chatId) return;
//   if (!currentUser?._id) return;
//   if (!Array.isArray(messages)) return;

//   try {
//     saveMessagesToCache(currentUser._id, chatId, messages);
//   } catch {}
// }, [messages, chatId, currentUser?._id]);
//   const loading = useSelector((state: RootState) => state.message.loading);

//   const typingUsers = useSelector(
//     useMemo(
//       () => selectTypingUsersByChatId(chatId, currentUser?._id),
//       [chatId, currentUser?._id]
//     )
//   );

//   const otherUser = useSelector(
//     useMemo(
//       () => selectOtherUser(chatId, currentUser?._id),
//       [chatId, currentUser?._id]
//     )
//   );

//   const profileUser = useSelector(
//     (s: RootState) => (s.user as any).profileUser
//   ) as ProfileUser | null;

//   const blockStatus = useSelector((s: RootState) => (s.user as any).blockStatus) as
//     | { blockedByMe: boolean; blockedMe: boolean; anyBlocked: boolean }
//     | null;

//   const searchQuery = useSelector(
//     (s: RootState) => (s.chat as any).searchQuery || ""
//   ) as string;

//   const searchResults = useSelector(
//     (s: RootState) => ((s.chat as any).searchResults || [])
//   ) as SearchResultItem[];

//   const searchLoading = useSelector(
//     (s: RootState) => (s.chat as any).searchLoading || false
//   ) as boolean;

//   const blockedByMe = rel === "blocked_by_me";
//   const blockedMe = rel === "blocked_me";
//   const isBlocked = blockedByMe || blockedMe;

//   const inputSearchValue = searchQuery || "";

//   const highlightedMessageIds = useMemo(
//     () => new Set(searchResults.map((item) => item._id)),
//     [searchResults]
//   );

//   const currentSelectedResult =
//     searchResults.length > 0 ? searchResults[selectedSearchIndex] : null;

//   const menuLabel = blockedMe ? "محظور" : blockedByMe ? "فك الحظر" : "حظر";
//   const menuIcon: keyof typeof Ionicons.glyphMap = blockedMe
//     ? "alert-circle-outline"
//     : blockedByMe
//       ? "lock-open-outline"
//       : "lock-closed-outline";

//   const doToggleBlock = async () => {
//     const targetId = otherUser?._id;
//     if (!targetId) return;

//     if (blockedMe) {
//       setMenuOpen(false);
//       return;
//     }

//     try {
//       if (blockedByMe) {
//         await dispatch(unblockUser(targetId) as any).unwrap?.();
//       } else {
//         await dispatch(blockUser(targetId) as any).unwrap?.();
//       }

//       await dispatch(fetchBlockStatus({ targetUserId: String(targetId) }) as any);
//       await dispatch(fetchUserProfile(String(targetId)) as any).unwrap?.();
//     } catch (e) {
//     } finally {
//       setMenuOpen(false);
//     }
//   };
//   const handleJoinRoomFromInvite = (roomId: string) => {
//     if (!roomId) return;

//     router.push({
//       pathname: "/room/[id]",
//       params: { id: roomId },
//     });
//   };
//   useEffect(() => {
//     const targetId = otherUser?._id;
//     if (!targetId) return;

//     dispatch(fetchUserProfile(String(targetId)));
//     dispatch(fetchBlockStatus({ targetUserId: String(targetId) }) as any);
//   }, [otherUser?._id, dispatch]);

//   useEffect(() => {
//     if (!blockStatus) return;

//     if (blockStatus.blockedMe) setRel("blocked_me");
//     else if (blockStatus.blockedByMe) setRel("blocked_by_me");
//     else setRel("none");
//   }, [blockStatus?.blockedByMe, blockStatus?.blockedMe]);
//   const refreshMessages = async () => {
//     try {
//       if (!currentUser?._id) return;

//       setPage(1);
//       setLoadedPages([1]);
//       setHasMore(true);

//       const existing = await loadMessagesFromCache(currentUser._id, chatId);

//       const res = await dispatch(loadMessages({ chatId, page: 1 })).unwrap();
//       const merged = mergeMessages(existing, res.messages || []);

//       dispatch(setMessages({ chatId, messages: merged }));
//       await saveMessagesToCache(currentUser._id, chatId, merged);

//       if ((res.messages || []).length < 20) {
//         setHasMore(false);
//       }

//       const hasIncoming = merged.some(
//         (m: any) => String(m.sender) !== String(currentUser._id)
//       );

//       if (hasIncoming) {
//         emitMarkAsSeen(chatId);
//       }
//     } catch (e) {
//     }
//   };
//   useEffect(() => {
//     if (!chatId) return;
//     if (!currentUser?._id) return;

//     let isMounted = true;

//     const run = async () => {
//       try {
//         dispatch(setActiveChat(chatId));
//         joinChatRoom(chatId);

//         const cached = await loadMessagesFromCache(currentUser._id!, chatId);

//         if (!isMounted) return;

//         if (cached.length) {
//           dispatch(setMessages({ chatId, messages: cached }));
//         }

//         const res = await dispatch(loadMessages({ chatId, page: 1 })).unwrap();

//         if (!isMounted) return;

//         const incoming = Array.isArray(res?.messages) ? res.messages : [];
//         const currentStateMessages = messagesRef.current || [];
//         const baseMessages = currentStateMessages.length ? currentStateMessages : cached;
//         const merged = mergeMessages(baseMessages, incoming);

//         dispatch(setMessages({ chatId, messages: merged }));
//         await saveMessagesToCache(currentUser._id!, chatId, merged);

//         setLoadedPages([1]);
//         setPage(1);
//         setHasMore(incoming.length >= 20);

//         const hasIncoming = merged.some(
//           (m: any) =>
//             String(m?.sender?._id || m?.sender) !== String(currentUser._id)
//         );

//         if (hasIncoming) {
//           emitMarkAsSeen(chatId);
//         }
//       } catch (e) {
//       }
//     };

//     run();

//     return () => {
//       isMounted = false;
//       leaveChatRoom(chatId);
//       dispatch(setActiveChat(undefined));
//       dispatch(clearSearchResults());
//       setReplyToMessage(null);
//     };
//   }, [chatId, currentUser?._id, dispatch]);

//   useEffect(() => {
//     const requestPermissions = async () => {
//       await ImagePicker.requestMediaLibraryPermissionsAsync();
//     };
//     requestPermissions();
//   }, []);

//   useEffect(() => {
//     if (!searchOpen) return;

//     clearTimeout(searchTimeout.current);

//     searchTimeout.current = setTimeout(() => {
//       const q = String(inputSearchValue || "").trim();

//       if (!q) {
//         dispatch(clearSearchResults());
//         setSelectedSearchIndex(0);
//         setSelectedSearchMessageId(null);
//         return;
//       }

//       dispatch(searchMessagesInChat({ chatId, query: q }) as any);
//     }, 350);

//     return () => clearTimeout(searchTimeout.current);
//   }, [inputSearchValue, searchOpen, chatId, dispatch]);

//   useEffect(() => {
//     if (!searchResults.length) {
//       setSelectedSearchIndex(0);
//       setSelectedSearchMessageId(null);
//       return;
//     }

//     const safeIndex = Math.min(selectedSearchIndex, searchResults.length - 1);
//     setSelectedSearchIndex(safeIndex);
//     setSelectedSearchMessageId(searchResults[safeIndex]?._id || null);
//   }, [searchResults.length]);


//   const loadMore = async () => {
//     if (!hasMore || loading) return;
//     if (!currentUser?._id) return;

//     const nextPage = page + 1;

//     const loadMore = async () => {
//       if (!hasMore || loading) return;
//       if (!currentUser?._id) return;

//       const nextPage = page + 1;

//       try {
//         const res = await dispatch(loadMessages({ chatId, page: nextPage })).unwrap();

//         const currentStateMessages = messagesRef.current || [];
//         const merged = mergeMessages(currentStateMessages, res.messages || []);

//         dispatch(setMessages({ chatId, messages: merged }));
//         await saveMessagesToCache(currentUser._id, chatId, merged);

//         if ((res.messages || []).length < 20) {
//           setHasMore(false);
//         }

//         setPage(nextPage);
//         setLoadedPages((prev) =>
//           prev.includes(nextPage) ? prev : [...prev, nextPage]
//         );
//       } catch (e) {
//       }
//     };
//   };
//   const ensureMessageLoaded = async (messageId: string) => {
//     if (!currentUser?._id) return false;

//     let currentMessages = messagesRef.current || [];

//     let found = currentMessages.some((m) => m._id === messageId);
//     if (found) return true;

//     let guard = 0;
//     let localPage = page;
//     let localHasMore = hasMore;

//     while (!found && localHasMore && guard < 30) {
//       guard += 1;

//       const nextPage = localPage + 1;

//       try {
//         const res = await dispatch(loadMessages({ chatId, page: nextPage })).unwrap();

//         currentMessages = mergeMessages(currentMessages, res.messages || []);

//         dispatch(setMessages({ chatId, messages: currentMessages }));
//         await saveMessagesToCache(currentUser._id, chatId, currentMessages);

//         if ((res.messages || []).length < 20) {
//           localHasMore = false;
//           setHasMore(false);
//         }

//         localPage = nextPage;
//         setPage(nextPage);
//         setLoadedPages((prev) =>
//           prev.includes(nextPage) ? prev : [...prev, nextPage]
//         );

//         found = currentMessages.some((m) => m._id === messageId);
//         if (found) break;

//         if ((res.messages || []).length < 20) {
//           break;
//         }
//       } catch {
//         break;
//       }
//     }

//     return found;
//   };

//   const scrollToMessageIfLoaded = async (messageId: string) => {
//     let index = messages.findIndex((m: { _id: string; }) => m._id === messageId);

//     if (index === -1) {
//       const ok = await ensureMessageLoaded(messageId);
//       if (!ok) return false;
//     }

//     setTimeout(() => {
//       const newIndex = messages.findIndex((m: { _id: string; }) => m._id === messageId);
//       if (newIndex === -1) return;

//       setSelectedSearchMessageId(messageId);
//       flatListRef.current?.scrollToIndex?.({
//         index: newIndex,
//         animated: true,
//         viewPosition: 0.5,
//       });
//     }, 350);

//     return true;
//   };

//   const goToSearchResult = async (index: number) => {
//     if (!searchResults.length) return;

//     const normalized =
//       index < 0
//         ? searchResults.length - 1
//         : index >= searchResults.length
//           ? 0
//           : index;

//     const item = searchResults[normalized];
//     setSelectedSearchIndex(normalized);
//     setSelectedSearchMessageId(item._id);
//     await scrollToMessageIfLoaded(item._id);
//   };

//   const closeSearch = () => {
//     setSearchOpen(false);
//     setSelectedSearchIndex(0);
//     setSelectedSearchMessageId(null);
//     dispatch(clearSearchResults());
//   };

//   const startRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) return;

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       recordingRef.current = recording;
//       setIsRecording(true);
//     } catch { }
//   };

//   const stopRecording = async () => {
//     try {
//       if (!recordingRef.current) return;

//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();

//       recordingRef.current = null;
//       setIsRecording(false);

//       if (!uri) return;
//       setRecordedUri(uri);
//     } catch { }
//   };

//   const getReplyPreviewText = (msg: any) => {
//     if (!msg) return "";
//     if (msg.type === "image") return "📷 صورة";
//     if (msg.type === "video") return "🎥 فيديو";
//     if (msg.type === "audio") return "🎤 رسالة صوتية";
//     if (msg.type === "file") return "📎 ملف";
//     return String(msg.content || "");
//   };

//   const sendMessage = () => {
//     if (!text.trim() || !currentUser?._id) return;

//     const tempId = `temp-${Date.now()}`;

//     const optimistic: MessageItem = {
//       _id: tempId,
//       clientTempId: tempId,
//       chat: chatId,
//       sender: currentUser._id,
//       type: "text",
//       content: text,
//       replyTo: replyToMessage?._id,
//       reactions: [],
//       deliveryStatus: {
//         deliveredTo: [],
//         seenBy: [],
//       },
//       createdAt: new Date().toISOString(),
//       optimistic: true,
//     } as any;

//     dispatch(addMessage(optimistic));

//     sendSocketMessage(
//       chatId,
//       text,
//       "text",
//       tempId,
//       undefined,
//       replyToMessage?._id
//     );

//     setText("");
//     setReplyToMessage(null);
//   };
//   const sendMediaMessage = async (
//     uri: string,
//     type: "image" | "video" | "audio"
//   ) => {


//     if (!currentUser?._id) {

//       return;
//     }

//     const tempId = `temp-${Date.now()}`;

//     const optimisticMessage: MessageItem = {
//       _id: tempId,
//       clientTempId: tempId,
//       chat: chatId,
//       sender: currentUser._id,
//       type,
//       content: uri, // مهم جدًا لعرض الصورة/الفيديو/الصوت فورًا
//       media: { url: uri },
//       replyTo: replyToMessage?._id,
//       reactions: [],
//       deliveryStatus: {
//         deliveredTo: [],
//         seenBy: [],
//       },
//       createdAt: new Date().toISOString(),
//       optimistic: true,
//     } as any;

//     dispatch(addMessage(optimisticMessage));
//     setMediaSendingState((prev) => ({ ...prev, [tempId]: "uploading" }));

//     try {
//       const cloudType =
//         type === "image" ? "image" : type === "video" ? "video" : "raw";



//       const url = await uploadToCloudinary(uri, cloudType);



//       setMediaSendingState((prev) => ({ ...prev, [tempId]: "sending" }));



//       sendSocketMessage(
//         chatId,
//         url,
//         type,
//         tempId,
//         undefined,
//         replyToMessage?._id
//       );

//       setReplyToMessage(null);
//     } catch (error: any) {


//       setMediaSendingState((prev) => {
//         const next = { ...prev };
//         delete next[tempId];
//         return next;
//       });

//       Alert.alert("خطأ", "فشل رفع أو إرسال الملف");
//     } finally {

//     }
//   };

//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ["images"],
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets?.length) {
//         const uri = result.assets[0].uri;
//         await sendMediaMessage(uri, "image");
//       }
//     } catch { }
//   };

//   const pickVideo = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ["videos"],
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets?.length) {
//         const uri = result.assets[0].uri;
//         await sendMediaMessage(uri, "video");
//       }
//     } catch { }
//   };

//   const pickAudio = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "audio/*",
//         copyToCacheDirectory: true,
//       });

//       if (!result.canceled && result.assets?.length) {
//         await sendMediaMessage(result.assets[0].uri, "audio");
//       }
//     } catch { }
//   };

//   const handleDeleteMessage = async (
//     messageId: string,
//     type: "me" | "everyone"
//   ) => {
//     try {
//       await api.delete("/messages/delete", {
//         data: { messageId, type },
//       });

//       await refreshMessages();
//     } catch (error: any) {
//       Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف الرسالة");
//     }
//   };

//   const openMessageActions = (item: MessageItem) => {
//     const isMe = String(item.sender) === String(currentUser?._id);
//     const options = ["Reply", "Delete for me"];
//     const actions: Array<() => void> = [
//       () => {
//         setReplyToMessage({
//           _id: item._id,
//           content: item.content,
//           type: item.type,
//           sender: String(item.sender),
//           media: item.media,
//         });
//       },
//       () => {
//         Alert.alert("حذف الرسالة", "هل تريد حذف الرسالة لديك فقط؟", [
//           { text: "إلغاء", style: "cancel" },
//           {
//             text: "حذف",
//             style: "destructive",
//             onPress: () => handleDeleteMessage(item._id, "me"),
//           },
//         ]);
//       },
//     ];

//     if (isMe) {
//       options.push("Delete for everyone");
//       actions.push(() => {
//         Alert.alert("حذف للجميع", "هل تريد حذف الرسالة لدى الجميع؟", [
//           { text: "إلغاء", style: "cancel" },
//           {
//             text: "حذف",
//             style: "destructive",
//             onPress: () => handleDeleteMessage(item._id, "everyone"),
//           },
//         ]);
//       });
//     }

//     options.push("Cancel");

//     if (Platform.OS === "ios") {
//       ActionSheetIOS.showActionSheetWithOptions(
//         {
//           options,
//           cancelButtonIndex: options.length - 1,
//           destructiveButtonIndex: isMe ? [1, 2] as any : 1,
//         },
//         (buttonIndex) => {
//           if (buttonIndex < actions.length) actions[buttonIndex]();
//         }
//       );
//       return;
//     }

//     Alert.alert(
//       "خيارات الرسالة",
//       "اختر الإجراء المطلوب",
//       [
//         {
//           text: "Reply",
//           onPress: actions[0],
//         },
//         {
//           text: "Delete for me",
//           style: "destructive",
//           onPress: actions[1],
//         },
//         ...(isMe
//           ? [
//             {
//               text: "Delete for everyone",
//               style: "destructive" as const,
//               onPress: actions[2],
//             },
//           ]
//           : []),
//         {
//           text: "إلغاء",
//           style: "cancel",
//         },
//       ]
//     );
//   };

//   const findMessageById = (id?: string) => {
//     if (!id) return null;
//     return messages.find((m: { _id: string; }) => m._id === id) || null;
//   };

//   const renderHighlightedText = (
//     content: string,
//     query: string,
//     isMe: boolean,
//     isActiveResult: boolean
//   ) => {
//     const textValue = String(content || "");
//     const q = String(query || "").trim();

//     if (!q) {
//       return (
//         <Text
//           style={
//             isMe
//               ? styles.meText
//               : [styles.otherText, { color: isDark ? "#E5E7EB" : "#111827" }]
//           }
//         >
//           {textValue}
//         </Text>
//       );
//     }

//     const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const parts = textValue.split(new RegExp(`(${escaped})`, "gi"));

//     return (
//       <Text
//         style={
//           isMe
//             ? styles.meText
//             : [styles.otherText, { color: isDark ? "#E5E7EB" : "#111827" }]
//         }
//       >
//         {parts.map((part, index) => {
//           const matched = part.toLowerCase() === q.toLowerCase();
//           if (!matched) return <Text key={`${part}-${index}`}>{part}</Text>;

//           return (
//             <Text
//               key={`${part}-${index}`}
//               style={[
//                 styles.highlightText,
//                 isActiveResult && styles.highlightTextActive,
//               ]}
//             >
//               {part}
//             </Text>
//           );
//         })}
//       </Text>
//     );
//   };

//   const renderSearchResultSnippet = (textValue: string, q: string) => {
//     const text = String(textValue || "");
//     const query = String(q || "").trim();

//     if (!query) {
//       return (
//         <Text
//           numberOfLines={1}
//           style={{ color: isDark ? "#CBD5E1" : "#374151", fontSize: 13 }}
//         >
//           {text}
//         </Text>
//       );
//     }

//     const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const parts = text.split(new RegExp(`(${escaped})`, "gi"));

//     return (
//       <Text
//         numberOfLines={1}
//         style={{ color: isDark ? "#CBD5E1" : "#374151", fontSize: 13 }}
//       >
//         {parts.map((part, index) => {
//           const matched = part.toLowerCase() === query.toLowerCase();
//           return matched ? (
//             <Text key={`${part}-${index}`} style={styles.searchResultHighlight}>
//               {part}
//             </Text>
//           ) : (
//             <Text key={`${part}-${index}`}>{part}</Text>
//           );
//         })}
//       </Text>
//     );
//   };

//   const renderReplyBlock = (item: any, isMe: boolean) => {
//     const replyId =
//       typeof item.replyTo === "string"
//         ? item.replyTo
//         : item.replyTo?._id;

//     const repliedMsg =
//       typeof item.replyTo === "object" && item.replyTo?._id
//         ? item.replyTo
//         : findMessageById(replyId);

//     if (!replyId && !repliedMsg) return null;

//     const previewSource = repliedMsg || item.replyTo;

//     return (
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={() => {
//           const targetId = previewSource?._id || replyId;
//           if (targetId) {
//             scrollToMessageIfLoaded(targetId);
//           }
//         }}
//         style={[
//           styles.replyPreviewBox,
//           {
//             backgroundColor: isMe
//               ? "rgba(255,255,255,0.16)"
//               : isDark
//                 ? "rgba(255,255,255,0.06)"
//                 : "#EEF2FF",
//             borderLeftColor: isMe ? "#E5E7EB" : "#6D5DF6",
//           },
//         ]}
//       >
//         <Text
//           numberOfLines={1}
//           style={[
//             styles.replyPreviewTitle,
//             { color: isMe ? "#FFF" : "#6D5DF6" },
//           ]}
//         >
//           Reply
//         </Text>

//         <Text
//           numberOfLines={2}
//           style={[
//             styles.replyPreviewText,
//             { color: isMe ? "rgba(255,255,255,0.92)" : isDark ? "#CBD5E1" : "#374151" },
//           ]}
//         >
//           {getReplyPreviewText(previewSource)}
//         </Text>
//       </TouchableOpacity>
//     );
//   };
//   useEffect(() => {
//     setMediaSendingState((prev) => {
//       const next = { ...prev };
//       const optimisticIds = new Set(
//         (messages || [])
//           .filter((m: any) => m?.optimistic)
//           .map((m: any) => m?._id)
//       );

//       Object.keys(next).forEach((id) => {
//         if (!optimisticIds.has(id)) {
//           delete next[id];
//         }
//       });

//       return next;
//     });
//   }, [messages]);
//   const getMessageMediaUri = (item: any) => {
//     return item?.content || item?.media?.url || "";
//   };
//   const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {
//     const isMe = String(item.sender) === String(currentUser?._id);
//     const isMedia = item.type === "image" || item.type === "video";
//     const isMatched = highlightedMessageIds.has(item._id);
//     const isActiveResult = selectedSearchMessageId === item._id;
//     const mediaUri = getMessageMediaUri(item);
//     const mediaStatus = mediaSendingState[item._id];
//     const showMediaLoading =
//       !!mediaStatus &&
//       item.optimistic &&
//       (item.type === "image" || item.type === "video" || item.type === "audio");

//     if (item.deletedForEveryone) {
//       return (
//         <View style={styles.deletedBubble}>
//           <Text
//             style={[
//               styles.deletedText,
//               { color: isDark ? "#9CA3AF" : "#6B7280" },
//             ]}
//           >
//             This message was deleted
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <Pressable
//         onLongPress={() => openMessageActions(item)}
//           onPress={() => copyMessageText(item)}

//         delayLongPress={250}
//         style={[
//           styles.messageContainer,
//           isMe ? styles.rowMe : styles.rowOther,
//         ]}
//       >
//         <View
//           style={[
//             styles.bubble,
//             !isMedia && (isMe ? styles.me : styles.other),
//             isDark && !isMedia && !isMe ? styles.otherDark : null,
//             isMatched && styles.searchMatchedBubble,
//             isActiveResult && styles.searchActiveBubble,
//           ]}
//         >
//           {renderReplyBlock(item, isMe)}

//           {item.type === "room_invite" && item.roomInvite ? (
//             <RoomInviteCard
//               item={item}
//               isMe={isMe}
//               isDark={isDark}
//               onJoin={handleJoinRoomFromInvite}
//             />
//           ) : item.type === "image" && mediaUri ? (
//             <View style={{ position: "relative" }}>
//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPress={() => setImagePreview(mediaUri)}
//                 disabled={showMediaLoading}
//               >
//                 <Image
//                   source={{ uri: mediaUri }}
//                   style={{ width: 220, height: 220, borderRadius: 14 }}
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>

//               {showMediaLoading && (
//                 <View style={styles.mediaLoadingOverlay}>
//                   <ActivityIndicator size="small" color="#FFF" />
//                   <Text style={styles.mediaLoadingText}>
//                     {mediaStatus === "uploading" ? "جاري رفع الصورة..." : "جاري الإرسال..."}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           ) : item.type === "video" && mediaUri ? (
//             <View style={{ position: "relative" }}>
//               <Video
//                 source={{ uri: mediaUri }}
//                 style={{ width: 240, height: 240, borderRadius: 14 }}
//                 useNativeControls={!showMediaLoading}
//                 resizeMode={ResizeMode.CONTAIN}
//                 isLooping={false}
//                 shouldPlay={false}
//               />

//               {showMediaLoading && (
//                 <View style={styles.mediaLoadingOverlay}>
//                   <ActivityIndicator size="small" color="#FFF" />
//                   <Text style={styles.mediaLoadingText}>
//                     {mediaStatus === "uploading" ? "جاري رفع الفيديو..." : "جاري الإرسال..."}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           ) : item.type === "audio" && mediaUri ? (
//             <View style={{ minWidth: 190 }}>
//               <VoiceMessagePlayer uri={mediaUri} isMe={isMe} />

//               {showMediaLoading && (
//                 <View
//                   style={[
//                     styles.audioLoadingBox,
//                     {
//                       backgroundColor: isMe
//                         ? "rgba(255,255,255,0.12)"
//                         : isDark
//                           ? "rgba(255,255,255,0.06)"
//                           : "#E5E7EB",
//                     },
//                   ]}
//                 >
//                   <ActivityIndicator size="small" color={isMe ? "#FFF" : "#6D5DF6"} />
//                   <Text
//                     style={{
//                       marginTop: 6,
//                       fontSize: 12,
//                       fontWeight: "700",
//                       color: isMe ? "#FFF" : isDark ? "#E5E7EB" : "#111827",
//                     }}
//                   >
//                     {mediaStatus === "uploading" ? "جاري رفع الصوت..." : "جاري الإرسال..."}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           ) : (
//             renderHighlightedText(
//               item.content,
//               inputSearchValue,
//               isMe,
//               isActiveResult
//             )
//           )}
//           {/* {item.type === "image" && item.content ? (
//             <TouchableOpacity
//               activeOpacity={0.9}
//               onPress={() => setImagePreview(item.content)}
//             >
//               <Image
//                 source={{ uri: item.content }}
//                 style={{ width: 220, height: 220, borderRadius: 14 }}
//                 resizeMode="cover"
//               />
//             </TouchableOpacity>
//           ) : item.type === "video" && item.content ? (
//             <Video
//               source={{ uri: item.content }}
//               style={{ width: 240, height: 240, borderRadius: 14 }}
//               useNativeControls
//               resizeMode={ResizeMode.CONTAIN}
//               isLooping={false}
//             />
//           ) : item.type === "audio" && item.content ? (
//             <VoiceMessagePlayer uri={item.content} isMe={isMe} />
//           ) : (
//             renderHighlightedText(
//               item.content,
//               inputSearchValue,
//               isMe,
//               isActiveResult
//             )
//           )} */}
//         </View>

//         <View style={[styles.timeWrapper, isMe ? styles.timeRight : styles.timeLeft]}>
//           <Text
//             style={[
//               styles.timeText,
//               isMe ? styles.timeMe : styles.timeOther,
//               { color: isDark ? "#9CA3AF" : undefined },
//             ]}
//           >
//             {formatTime(item.createdAt)}
//           </Text>

//           {isMe && (
//             <View style={styles.statusIcon}>
//               {item.deliveryStatus?.seenBy?.length ? (
//                 <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
//               ) : item.deliveryStatus?.deliveredTo?.length ? (
//                 <Ionicons
//                   name="checkmark-done"
//                   size={14}
//                   color={isDark ? "#9CA3AF" : "#E5E7EB"}
//                 />
//               ) : (
//                 <Ionicons
//                   name="checkmark"
//                   size={14}
//                   color={isDark ? "#9CA3AF" : "#E5E7EB"}
//                 />
//               )}
//             </View>
//           )}
//         </View>
//       </Pressable>
//     );
//   };

//   const searchResultsCardVisible =
//     searchOpen &&
//     inputSearchValue.trim().length > 0 &&
//     (searchLoading || searchResults.length > 0);
// const copyMessageText = async (item: MessageItem) => {
//   try {
//     const value = String((item as any)?.content || "").trim();

//     if (!value) return;

//     // لا تنسخ روابط الصور والفيديو والصوت عند الضغط
//     if (
//       item.type === "image" ||
//       item.type === "video" ||
//       item.type === "audio" ||
//       item.type === "file"
//     ) {
//       return;
//     }

//     await Clipboard.setStringAsync(value);
//   } catch {}
// };
//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? "#0B1220" : "white" },
//       ]}
//     >
//       {!searchOpen ? (
//         <View
//           style={[
//             styles.header,
//             {
//               backgroundColor: isDark ? "#0F172A" : "#FFF",
//               borderColor: isDark ? "#111827" : "#E5E7EB",
//             },
//           ]}
//         >
//           <View style={styles.headerLeft}>
//             <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
//               <Ionicons
//                 name="arrow-back"
//                 size={22}
//                 color={isDark ? "#E5E7EB" : "#111827"}
//               />
//             </TouchableOpacity>

//             {otherUser?.avatar ? (
//               <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
//             ) : (
//               <View style={styles.avatarPlaceholder}>
//                 <Ionicons name="person" size={18} color="#FFF" />
//               </View>
//             )}

//             <View style={styles.userInfo}>
//               <Text
//                 style={[
//                   styles.username,
//                   { color: isDark ? "#E5E7EB" : "#111827" },
//                 ]}
//                 numberOfLines={1}
//               >
//                 {otherUser?.username || "User"}
//               </Text>

//               {!!typingUsers.length ? (
//                 <Text
//                   style={[
//                     styles.typing,
//                     { color: isDark ? "#9CA3AF" : "#6B7280" },
//                   ]}
//                 >
//                   Typing...
//                 </Text>
//               ) : blockedByMe ? (
//                 <Text style={[styles.lastSeen, { color: "#EF4444" }]}>
//                   تم حظر هذا الحساب
//                 </Text>
//               ) : blockedMe ? (
//                 <Text style={[styles.lastSeen, { color: "#EF4444" }]}>
//                   هذا الحساب حظرك
//                 </Text>
//               ) : otherUser?.isOnline ? (
//                 <Text style={styles.onlineText}>Online</Text>
//               ) : otherUser?.lastSeen ? (
//                 <Text
//                   style={[
//                     styles.lastSeen,
//                     { color: isDark ? "#9CA3AF" : "#6B7280" },
//                   ]}
//                 >
//                   Last seen {formatLastSeen(otherUser.lastSeen)}
//                 </Text>
//               ) : null}
//             </View>
//           </View>

//           <View style={styles.headerRight}>
//             <TouchableOpacity
//               style={styles.iconBtn}
//               onPress={() => {
//                 setSearchOpen(true);
//                 setMenuOpen(false);
//               }}
//             >
//               <Ionicons
//                 name="search-outline"
//                 size={21}
//                 color={isDark ? "#E5E7EB" : "#111827"}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.iconBtn}
//               onPress={() => setMenuOpen((v) => !v)}
//             >
//               <Ionicons
//                 name="ellipsis-vertical"
//                 size={20}
//                 color={isDark ? "#E5E7EB" : "#111827"}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <View
//           style={[
//             styles.searchHeader,
//             {
//               backgroundColor: isDark ? "#0F172A" : "#FFF",
//               borderColor: isDark ? "#111827" : "#E5E7EB",
//             },
//           ]}
//         >
//           <TouchableOpacity style={styles.searchBackBtn} onPress={closeSearch}>
//             <Ionicons
//               name="arrow-back"
//               size={22}
//               color={isDark ? "#E5E7EB" : "#111827"}
//             />
//           </TouchableOpacity>

//           <View
//             style={[
//               styles.searchInputWrap,
//               {
//                 backgroundColor: isDark ? "#111827" : "#F3F4F6",
//                 borderColor: isDark ? "#1F2937" : "#E5E7EB",
//               },
//             ]}
//           >
//             <Ionicons
//               name="search-outline"
//               size={18}
//               color={isDark ? "#9CA3AF" : "#6B7280"}
//             />

//             <TextInput
//               autoFocus
//               value={inputSearchValue}
//               onChangeText={(v) => {
//                 dispatch(setSearchQuery(v));
//                 setSelectedSearchIndex(0);
//                 setSelectedSearchMessageId(null);
//               }}
//               placeholder="ابحث داخل المحادثة"
//               placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
//               style={[
//                 styles.searchInput,
//                 { color: isDark ? "#E5E7EB" : "#111827" },
//               ]}
//               returnKeyType="search"
//             />

//             {!!inputSearchValue.trim() && (
//               <TouchableOpacity
//                 onPress={() => {
//                   dispatch(setSearchQuery(""));
//                   dispatch(clearSearchResults());
//                   setSelectedSearchIndex(0);
//                   setSelectedSearchMessageId(null);
//                 }}
//               >
//                 <Ionicons
//                   name="close-circle"
//                   size={18}
//                   color={isDark ? "#9CA3AF" : "#6B7280"}
//                 />
//               </TouchableOpacity>
//             )}
//           </View>

//           <View style={styles.searchNav}>
//             <Text
//               style={[
//                 styles.searchCounter,
//                 { color: isDark ? "#CBD5E1" : "#374151" },
//               ]}
//             >
//               {searchLoading
//                 ? "..."
//                 : searchResults.length
//                   ? `${selectedSearchIndex + 1}/${searchResults.length}`
//                   : "0/0"}
//             </Text>

//             <TouchableOpacity
//               style={styles.searchNavBtn}
//               onPress={() => goToSearchResult(selectedSearchIndex - 1)}
//               disabled={!searchResults.length}
//             >
//               <Ionicons
//                 name="chevron-up"
//                 size={20}
//                 color={
//                   searchResults.length
//                     ? isDark
//                       ? "#E5E7EB"
//                       : "#111827"
//                     : "#9CA3AF"
//                 }
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.searchNavBtn}
//               onPress={() => goToSearchResult(selectedSearchIndex + 1)}
//               disabled={!searchResults.length}
//             >
//               <Ionicons
//                 name="chevron-down"
//                 size={20}
//                 color={
//                   searchResults.length
//                     ? isDark
//                       ? "#E5E7EB"
//                       : "#111827"
//                     : "#9CA3AF"
//                 }
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {searchResultsCardVisible && (
//         <View
//           style={[
//             styles.searchResultsCard,
//             {
//               backgroundColor: isDark ? "#0F172A" : "#FFF",
//               borderColor: isDark ? "#111827" : "#E5E7EB",
//             },
//           ]}
//         >
//           {searchLoading ? (
//             <View style={styles.searchLoadingBox}>
//               <ActivityIndicator size="small" color="#6D5DF6" />
//               <Text
//                 style={{
//                   marginTop: 8,
//                   color: isDark ? "#CBD5E1" : "#374151",
//                   fontSize: 13,
//                 }}
//               >
//                 جاري البحث...
//               </Text>
//             </View>
//           ) : (
//             <FlatList
//               data={searchResults.slice(0, 8)}
//               keyExtractor={(item) => item._id}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//               renderItem={({ item, index }) => {
//                 const active = selectedSearchMessageId === item._id;
//                 return (
//                   <TouchableOpacity
//                     activeOpacity={0.85}
//                     onPress={async () => {
//                       setSelectedSearchIndex(index);
//                       setSelectedSearchMessageId(item._id);
//                       await scrollToMessageIfLoaded(item._id);
//                     }}
//                     style={[
//                       styles.searchResultItem,
//                       active && {
//                         backgroundColor: isDark
//                           ? "rgba(109,93,246,0.16)"
//                           : "rgba(109,93,246,0.08)",
//                       },
//                     ]}
//                   >
//                     <View style={styles.searchResultLeft}>
//                       <Ionicons
//                         name="search-outline"
//                         size={16}
//                         color={isDark ? "#9CA3AF" : "#6B7280"}
//                       />
//                     </View>

//                     <View style={styles.searchResultBody}>
//                       {renderSearchResultSnippet(item.content, inputSearchValue)}
//                       <Text
//                         numberOfLines={1}
//                         style={{
//                           marginTop: 4,
//                           color: isDark ? "#94A3B8" : "#6B7280",
//                           fontSize: 11,
//                         }}
//                       >
//                         {formatTime(item.createdAt)}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               }}
//             />
//           )}
//         </View>
//       )}

//       {replyToMessage && (
//         <View
//           style={[
//             styles.replyComposer,
//             {
//               backgroundColor: isDark ? "#0F172A" : "#FFF",
//               borderColor: isDark ? "#1F2937" : "#E5E7EB",
//             },
//           ]}
//         >
//           <View style={styles.replyComposerLine} />
//           <View style={{ flex: 1 }}>
//             <Text
//               style={[
//                 styles.replyComposerTitle,
//                 { color: "#6D5DF6" },
//               ]}
//             >
//               Replying
//             </Text>
//             <Text
//               numberOfLines={2}
//               style={{
//                 color: isDark ? "#CBD5E1" : "#374151",
//                 fontSize: 13,
//                 marginTop: 2,
//               }}
//             >
//               {getReplyPreviewText(replyToMessage)}
//             </Text>
//           </View>

//           <TouchableOpacity onPress={() => setReplyToMessage(null)}>
//             <Ionicons
//               name="close"
//               size={20}
//               color={isDark ? "#CBD5E1" : "#374151"}
//             />
//           </TouchableOpacity>
//         </View>
//       )}

//       {recordedUri && (
//         <VoiceRecorderPreview
//           uri={recordedUri}
//               topOffset={insets.top + 56} // عدل الرقم حسب ارتفاع الهيدر عندك

//           onCancel={() => setRecordedUri(null)}
//           onSend={async () => {
//             if (isBlocked) return;
//             await sendMediaMessage(recordedUri, "audio");
//             setRecordedUri(null);
//           }}
//         />
//       )}

//       {isBlocked && (
//         <View
//           style={{
//             marginHorizontal: 12,
//             marginTop: 10,
//             padding: 12,
//             borderRadius: 14,
//             borderWidth: 1,
//             backgroundColor: "rgba(239,68,68,0.08)",
//             borderColor: "rgba(239,68,68,0.25)",
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 10,
//           }}
//         >
//           <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
//           <Text
//             style={{
//               flex: 1,
//               fontWeight: "800",
//               color: isDark ? "#E5E7EB" : "#111827",
//             }}
//           >
//             {blockedMe
//               ? "هذا الحساب قام بحظرك، لا يمكنك إرسال رسائل."
//               : "لقد قمت بحظر هذا الحساب، قم بفك الحظر لإرسال رسائل."}
//           </Text>
//         </View>
//       )}

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         inverted
//         onEndReached={loadMore}
//         onEndReachedThreshold={0.2}
//         ListHeaderComponent={<Animated.View style={listSpacerAnimatedStyle} />}
//         ListFooterComponent={
//           loading && hasMore ? (
//             <View style={styles.paginationLoader}>
//               <ActivityIndicator size="small" color="#6D5DF6" />
//             </View>
//           ) : null
//         }
//         keyExtractor={(item) => item._id}
//         renderItem={renderMessage}
//         contentContainerStyle={{
//           paddingHorizontal: 12,
//           paddingTop: searchResultsCardVisible ? 210 : 12,
//           paddingBottom: 8,
//         }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//         onScrollToIndexFailed={() => { }}
//       />

//       <Animated.View
//         style={[
//           styles.inputBarWrap,
//           inputBarAnimatedStyle,
//           {
//             paddingBottom: Math.max(insets.bottom, 8),
//             backgroundColor: isDark ? "#0F172A" : "#FFF",
//             borderColor: isDark ? "#111827" : "#E5E7EB",
//             opacity: isBlocked ? 0.55 : 1,
//           },
//         ]}
//         pointerEvents={isBlocked ? "none" : "auto"}
//       >
//         <View
//           style={[
//             styles.inputBar,
//             {
//               backgroundColor: isDark ? "#0F172A" : "#FFF",
//               borderColor: isDark ? "#111827" : "#E5E7EB",
//             },
//           ]}
//         >
//           <TouchableOpacity style={styles.iconBtn} onPress={pickVideo}>
//             <Ionicons
//               name="videocam-outline"
//               size={22}
//               color={isDark ? "#9CA3AF" : "#6B7280"}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
//             <Ionicons
//               name="image-outline"
//               size={22}
//               color={isDark ? "#9CA3AF" : "#6B7280"}
//             />
//           </TouchableOpacity>

//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: isDark ? "#111827" : "#F3F4F6",
//                 color: isDark ? "#E5E7EB" : "#111827",
//               },
//             ]}
//             placeholder={
//               isBlocked ? "لا يمكنك المراسلة أثناء الحظر" : "Type a message"
//             }
//             placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
//             value={text}
//             onChangeText={(v) => {
//               setText(v);

//               emitTyping(chatId, true);
//               clearTimeout(typingTimeout.current);

//               typingTimeout.current = setTimeout(() => {
//                 emitTyping(chatId, false);
//               }, 1500);
//             }}
//             onFocus={() => {
//               setTimeout(() => {
//                 flatListRef.current?.scrollToOffset?.({
//                   offset: 0,
//                   animated: true,
//                 });
//               }, 50);
//             }}
//             multiline
//           />

//           {text.trim() ? (
//             <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
//               <Ionicons name="send" size={20} color="#FFF" />
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={styles.micBtn}
//               onPressIn={startRecording}
//               onPressOut={stopRecording}
//             >
//               <Ionicons
//                 name={isRecording ? "mic" : "mic-outline"}
//                 size={22}
//                 color={isRecording ? "red" : isDark ? "#9CA3AF" : "#6B7280"}
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* <View style={styles.bottomQuickActions}>
//           <TouchableOpacity style={styles.quickBtn} onPress={pickAudio}>
//             <Ionicons
//               name="musical-notes-outline"
//               size={18}
//               color={isDark ? "#CBD5E1" : "#374151"}
//             />
//             <Text
//               style={[
//                 styles.quickBtnText,
//                 { color: isDark ? "#CBD5E1" : "#374151" },
//               ]}
//             >
//               Audio
//             </Text>
//           </TouchableOpacity>
//         </View> */}
//       </Animated.View>

//       <Modal
//         visible={!!imagePreview}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setImagePreview(null)}
//       >
//         <View style={styles.previewOverlay}>
//           <Pressable
//             style={styles.previewCloseArea}
//             onPress={() => setImagePreview(null)}
//           />
//           <View style={styles.previewHeader}>
//             <TouchableOpacity
//               onPress={() => setImagePreview(null)}
//               style={styles.previewCloseBtn}
//             >
//               <Ionicons name="close" size={24} color="#FFF" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.previewBody}>
//             {!!imagePreview && (
//               <Image
//                 source={{ uri: imagePreview }}
//                 style={styles.previewImage}
//                 resizeMode="contain"
//               />
//             )}
//           </View>
//         </View>
//       </Modal>

//       {menuOpen && (
//         <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
//           <Pressable
//             style={[
//               styles.menuBox,
//               {
//                 backgroundColor: isDark ? "#0F172A" : "#FFF",
//                 borderColor: isDark ? "#111827" : "#E5E7EB",
//               },
//             ]}
//           >
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={doToggleBlock}
//               disabled={blockedMe}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name={menuIcon}
//                 size={18}
//                 color={
//                   blockedMe ? "#EF4444" : blockedByMe ? "#22C55E" : "#EF4444"
//                 }
//                 style={{ marginRight: 10 }}
//               />
//               <Text
//                 style={[
//                   styles.menuText,
//                   {
//                     color:
//                       blockedMe ? "#EF4444" : blockedByMe ? "#22C55E" : "#EF4444",
//                   },
//                 ]}
//               >
//                 {menuLabel}
//               </Text>
//             </TouchableOpacity>
//           </Pressable>
//         </Pressable>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF",
//     zIndex: 20,
//   },

//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   backBtn: {
//     marginRight: 8,
//   },

//   avatar: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     marginRight: 10,
//   },

//   avatarPlaceholder: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: "#6D5DF6",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   userInfo: {
//     justifyContent: "center",
//   },

//   username: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//   },

//   onlineText: {
//     fontSize: 12,
//     color: "#22C55E",
//     marginTop: 2,
//   },

//   lastSeen: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginTop: 2,
//   },

//   typing: {
//     fontSize: 12,
//     color: "#6B7280",
//     fontStyle: "italic",
//     marginTop: 2,
//   },

//   searchHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     zIndex: 30,
//   },

//   searchBackBtn: {
//     paddingHorizontal: 6,
//     marginRight: 4,
//   },

//   searchInputWrap: {
//     flex: 1,
//     height: 42,
//     borderRadius: 22,
//     borderWidth: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     marginRight: 8,
//   },

//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     paddingHorizontal: 8,
//   },

//   searchNav: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   searchCounter: {
//     fontSize: 12,
//     fontWeight: "700",
//     marginRight: 4,
//     minWidth: 38,
//     textAlign: "center",
//   },

//   searchNavBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   searchResultsCard: {
//     position: "absolute",
//     top: 120,
//     left: 12,
//     right: 12,
//     borderWidth: 1,
//     borderRadius: 16,
//     zIndex: 25,
//     maxHeight: 195,
//     overflow: "hidden",
//   },

//   searchLoadingBox: {
//     paddingVertical: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   searchResultItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },

//   searchResultLeft: {
//     width: 24,
//     alignItems: "center",
//     paddingTop: 2,
//   },

//   searchResultBody: {
//     flex: 1,
//     marginTop: 50
//   },

//   searchResultHighlight: {
//     backgroundColor: "#FDE68A",
//     color: "#111827",
//     fontWeight: "700",
//   },

//   paginationLoader: {
//     paddingVertical: 10,
//     alignItems: "center",
//   },

//   iconBtn: {
//     paddingHorizontal: 6,
//   },

//   replyComposer: {
//     marginHorizontal: 12,
//     marginTop: 8,
//     borderWidth: 1,
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   replyComposerLine: {
//     width: 4,
//     alignSelf: "stretch",
//     borderRadius: 8,
//     backgroundColor: "#6D5DF6",
//   },

//   replyComposerTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   inputBarWrap: {
//     borderTopWidth: 1,
//   },

//   inputBar: {
//     flexDirection: "row",
//     paddingHorizontal: 12,
//     paddingTop: 12,
//     alignItems: "center",
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF",
//   },

//   input: {
//     flex: 1,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     marginRight: 10,
//   },

//   sendBtn: {
//     backgroundColor: "#6D5DF6",
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   micBtn: {
//     padding: 6,
//   },

//   bottomQuickActions: {
//     paddingHorizontal: 12,
//     paddingTop: 8,
//     flexDirection: "row",
//   },

//   quickBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 8,
//   },

//   quickBtnText: {
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   messageContainer: {
//     marginVertical: 4,
//   },
//   mediaLoadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     borderRadius: 14,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   },

//   mediaLoadingText: {
//     color: "#FFF",
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   audioLoadingBox: {
//     marginTop: 8,
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   rowMe: {
//     alignItems: "flex-end",
//   },

//   rowOther: {
//     alignItems: "flex-start",
//   },

//   bubble: {
//     maxWidth: "75%",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//   },

//   me: {
//     backgroundColor: "#5fc4e8",
//     borderBottomRightRadius: 4,
//   },
//   inviteCard: {
//     minWidth: 220,
//     borderWidth: 1,
//     borderRadius: 16,
//     padding: 12,
//   },

//   inviteTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   inviteAvatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//   },

//   inviteAvatarPlaceholder: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     backgroundColor: "#6D5DF6",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   inviteRoomName: {
//     fontSize: 14,
//     fontWeight: "800",
//   },

//   inviteMetaText: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   inviteMessageText: {
//     marginTop: 10,
//     fontSize: 13,
//     lineHeight: 20,
//     fontWeight: "600",
//   },

//   joinRoomBtn: {
//     marginTop: 12,
//     height: 38,
//     borderRadius: 12,
//     backgroundColor: "#6D5DF6",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//   },

//   joinRoomBtnText: {
//     color: "#FFF",
//     fontSize: 13,
//     fontWeight: "800",
//   },
//   other: {
//     backgroundColor: "#f5f5f5",
//     borderBottomLeftRadius: 4,
//   },

//   otherDark: {
//     backgroundColor: "#111827",
//   },

//   meText: {
//     color: "#FFF",
//   },

//   otherText: {
//     color: "#111827",
//   },

//   replyPreviewBox: {
//     borderLeftWidth: 3,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     marginBottom: 8,
//   },

//   replyPreviewTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   replyPreviewText: {
//     fontSize: 12,
//     marginTop: 2,
//   },

//   highlightText: {
//     backgroundColor: "#FDE68A",
//     color: "#111827",
//     fontWeight: "700",
//     borderRadius: 4,
//   },

//   highlightTextActive: {
//     backgroundColor: "#F59E0B",
//     color: "#111827",
//   },

//   searchMatchedBubble: {
//     borderWidth: 1,
//     borderColor: "rgba(245,158,11,0.35)",
//   },

//   searchActiveBubble: {
//     borderWidth: 2,
//     borderColor: "#F59E0B",
//   },

//   timeWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 2,
//   },

//   timeRight: {
//     justifyContent: "flex-end",
//   },

//   timeLeft: {
//     justifyContent: "flex-start",
//   },

//   timeText: {
//     fontSize: 10,
//   },

//   timeMe: {
//     color: "#83858a",
//   },

//   timeOther: {
//     color: "#6B7280",
//   },

//   statusIcon: {
//     marginLeft: 2,
//   },

//   deletedBubble: {
//     alignSelf: "center",
//     marginVertical: 8,
//   },

//   deletedText: {
//     fontStyle: "italic",
//     color: "#6B7280",
//   },

//   previewOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.95)",
//   },

//   previewCloseArea: {
//     ...StyleSheet.absoluteFillObject,
//   },

//   previewHeader: {
//     paddingTop: 50,
//     paddingHorizontal: 16,
//     flexDirection: "row",
//     justifyContent: "flex-end",
//   },

//   previewCloseBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },

//   previewBody: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 12,
//   },

//   previewImage: {
//     width: "100%",
//     height: "80%",
//   },

//   menuOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 9999,
//   },

//   menuBox: {
//     position: "absolute",
//     top: 56,
//     right: 12,
//     minWidth: 160,
//     borderWidth: 1,
//     borderRadius: 12,
//     overflow: "hidden",
//     elevation: 6,
//   },

//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//   },

//   menuText: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
// });


import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";
import api from "@/services/api";

import BlockBanner from "@/components/chat/BlockBanner";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInputBar from "@/components/chat/ChatInputBar";
import ImagePreviewModal from "@/components/chat/ImagePreviewModal";
import MessageBubble from "@/components/chat/MessageBubble";
import ReplyComposer from "@/components/chat/ReplyComposer";
import SearchHeader from "@/components/chat/SearchHeader";
import SearchResultsCard from "@/components/chat/SearchResultsCard";

import {
  RelationshipStatus,
  ReplyState,
  SearchResultItem,
} from "@/components/chat/types";

import { styles } from "@/components/chat/styles";

import {
  addMessage,
  loadMessages,
  MessageItem,
  setMessages,
} from "@/redux/slices/messageSlice";

import {
  clearSearchResults,
  searchMessagesInChat,
  setActiveChat,
  setSearchQuery,
} from "@/redux/slices/chatSlice";

import { blockUser } from "@/redux/slices/followSlice";
import { unblockUser } from "@/redux/slices/friendSlice";
import {
  fetchBlockStatus,
  fetchUserProfile,
  markRelatedNotificationsAsRead,
} from "@/redux/slices/userSlice";

import { useColorScheme } from "@/hooks/use-color-scheme";

import {
  selectCurrentUser,
  selectMessagesByChatId,
  selectOtherUser,
  selectTypingUsersByChatId,
} from "@/redux/selectors";

import { AppDispatch, RootState } from "@/redux/store";

import {
  emitMarkAsSeen,
  emitTyping,
  joinChatRoom,
  leaveChatRoom,
  sendSocketMessage,
} from "@/services/socket";

import { uploadToCloudinary } from "@/services/upload.service";
import { loadMessagesFromCache, saveMessagesToCache } from "@/storage/chatCache";
import { mergeMessages } from "@/utils/mergeMessages";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const keyboardHeight = useSharedValue(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const typingTimeout = useRef<any>(null);
  const searchTimeout = useRef<any>(null);
  const messagesRef = useRef<MessageItem[]>([]);

  const [page, setPage] = useState(1);
  const [, setLoadedPages] = useState<number[]>([1]);
  const [hasMore, setHasMore] = useState(true);

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const [mediaSendingState, setMediaSendingState] = useState<
    Record<string, "uploading" | "sending">
  >({});

  const [rel, setRel] = useState<RelationshipStatus>("none");

  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [selectedSearchMessageId, setSelectedSearchMessageId] = useState<
    string | null
  >(null);

  const [replyToMessage, setReplyToMessage] = useState<ReplyState>(null);
const [actionsVisible, setActionsVisible] = useState(false);
const [actionsMessage, setActionsMessage] = useState<MessageItem | null>(null);
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
      transform: [{ translateY: -keyboardHeight.value }],
    };
  });

  const listSpacerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: keyboardHeight.value,
    };
  });

  const currentUser = useSelector(selectCurrentUser);

  const messages = useSelector(
    useMemo(() => selectMessagesByChatId(chatId), [chatId])
  );

  const loading = useSelector((state: RootState) => state.message.loading);

  const typingUsers = useSelector(
    useMemo(
      () => selectTypingUsersByChatId(chatId, currentUser?._id),
      [chatId, currentUser?._id]
    )
  );

  const otherUser = useSelector(
    useMemo(
      () => selectOtherUser(chatId, currentUser?._id),
      [chatId, currentUser?._id]
    )
  );

  const blockStatus = useSelector((s: RootState) => {
    return (s.user as any).blockStatus;
  }) as
    | {
      blockedByMe: boolean;
      blockedMe: boolean;
      anyBlocked: boolean;
    }
    | null;

  const searchQuery = useSelector((s: RootState) => {
    return (s.chat as any).searchQuery || "";
  }) as string;

  const searchResults = useSelector((s: RootState) => {
    return (s.chat as any).searchResults || [];
  }) as SearchResultItem[];

  const searchLoading = useSelector((s: RootState) => {
    return (s.chat as any).searchLoading || false;
  }) as boolean;

  const blockedByMe = rel === "blocked_by_me";
  const blockedMe = rel === "blocked_me";
  const isBlocked = blockedByMe || blockedMe;

  const inputSearchValue = searchQuery || "";

  const highlightedMessageIds = useMemo(() => {
    return new Set(searchResults.map((item) => item._id));
  }, [searchResults]);

  const menuLabel = blockedMe ? "محظور" : blockedByMe ? "فك الحظر" : "حظر";

  const menuIcon: keyof typeof Ionicons.glyphMap = blockedMe
    ? "alert-circle-outline"
    : blockedByMe
      ? "lock-open-outline"
      : "lock-closed-outline";

  const searchResultsCardVisible =
    searchOpen &&
    inputSearchValue.trim().length > 0 &&
    (searchLoading || searchResults.length > 0);

  useEffect(() => {
    messagesRef.current = Array.isArray(messages) ? messages : [];
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;
    if (!currentUser?._id) return;
    if (!Array.isArray(messages)) return;

    try {
      saveMessagesToCache(currentUser._id, chatId, messages);
    } catch { }
  }, [messages, chatId, currentUser?._id]);

  useEffect(() => {
    const targetId = otherUser?._id;
    if (!targetId) return;

    dispatch(fetchUserProfile(String(targetId)));
    dispatch(fetchBlockStatus({ targetUserId: String(targetId) }) as any);
  }, [otherUser?._id, dispatch]);

  useEffect(() => {
    if (!blockStatus) return;

    if (blockStatus.blockedMe) {
      setRel("blocked_me");
    } else if (blockStatus.blockedByMe) {
      setRel("blocked_by_me");
    } else {
      setRel("none");
    }
  }, [blockStatus?.blockedByMe, blockStatus?.blockedMe]);
const markChatNotificationsAsRead = async () => {
  try {
    if (!chatId) return;

    await dispatch(
      markRelatedNotificationsAsRead({
        relatedChat: chatId,
        types: ["message", "mention", "room_invite"],
      }) as any
    ).unwrap?.();
  } catch (e) {
    // لا تعطل فتح المحادثة لو فشل تصفير الإشعارات
  }
};
  useEffect(() => {
    if (!chatId) return;
    if (!currentUser?._id) return;

    let isMounted = true;

    const run = async () => {
      try {
        dispatch(setActiveChat(chatId));
        joinChatRoom(chatId);
await markChatNotificationsAsRead();

        const cached = await loadMessagesFromCache(currentUser._id!, chatId);

        if (!isMounted) return;

        if (cached.length) {
          dispatch(setMessages({ chatId, messages: cached }));
        }

        const res = await dispatch(loadMessages({ chatId, page: 1 })).unwrap();

        if (!isMounted) return;

        const incoming = Array.isArray(res?.messages) ? res.messages : [];
        const currentStateMessages = messagesRef.current || [];
        const baseMessages = currentStateMessages.length
          ? currentStateMessages
          : cached;

        const merged = mergeMessages(baseMessages, incoming);

        dispatch(setMessages({ chatId, messages: merged }));
        await saveMessagesToCache(currentUser._id!, chatId, merged);

        setLoadedPages([1]);
        setPage(1);
        setHasMore(incoming.length >= 20);

        const hasIncoming = merged.some((m: any) => {
          return String(m?.sender?._id || m?.sender) !== String(currentUser._id);
        });

        if (hasIncoming) {
          emitMarkAsSeen(chatId);
        }
      } catch (e) { }
    };

    run();

    return () => {
      isMounted = false;
      leaveChatRoom(chatId);
      dispatch(setActiveChat(undefined));
      dispatch(clearSearchResults());
      setReplyToMessage(null);
    };
  }, [chatId, currentUser?._id, dispatch]);

  useEffect(() => {
    const requestPermissions = async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const q = String(inputSearchValue || "").trim();

      if (!q) {
        dispatch(clearSearchResults());
        setSelectedSearchIndex(0);
        setSelectedSearchMessageId(null);
        return;
      }

      dispatch(searchMessagesInChat({ chatId, query: q }) as any);
    }, 350);

    return () => clearTimeout(searchTimeout.current);
  }, [inputSearchValue, searchOpen, chatId, dispatch]);

  useEffect(() => {
    if (!searchResults.length) {
      setSelectedSearchIndex(0);
      setSelectedSearchMessageId(null);
      return;
    }

    const safeIndex = Math.min(selectedSearchIndex, searchResults.length - 1);

    setSelectedSearchIndex(safeIndex);
    setSelectedSearchMessageId(searchResults[safeIndex]?._id || null);
  }, [searchResults.length, selectedSearchIndex, searchResults]);

  useEffect(() => {
    setMediaSendingState((prev) => {
      const next = { ...prev };

      const optimisticIds = new Set(
        (messages || [])
          .filter((m: any) => m?.optimistic)
          .map((m: any) => m?._id)
      );

      Object.keys(next).forEach((id) => {
        if (!optimisticIds.has(id)) {
          delete next[id];
        }
      });

      return next;
    });
  }, [messages]);

  const refreshMessages = async () => {
    try {
      if (!currentUser?._id) return;

      setPage(1);
      setLoadedPages([1]);
      setHasMore(true);

      const existing = await loadMessagesFromCache(currentUser._id, chatId);

      const res = await dispatch(loadMessages({ chatId, page: 1 })).unwrap();
      const merged = mergeMessages(existing, res.messages || []);

      dispatch(setMessages({ chatId, messages: merged }));
      await saveMessagesToCache(currentUser._id, chatId, merged);

      if ((res.messages || []).length < 20) {
        setHasMore(false);
      }

      const hasIncoming = merged.some((m: any) => {
        return String(m.sender) !== String(currentUser._id);
      });

      if (hasIncoming) {
        emitMarkAsSeen(chatId);
      }
    } catch (e) { }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    if (!currentUser?._id) return;

    const nextPage = page + 1;

    try {
      const res = await dispatch(
        loadMessages({ chatId, page: nextPage })
      ).unwrap();

      const currentStateMessages = messagesRef.current || [];
      const merged = mergeMessages(currentStateMessages, res.messages || []);

      dispatch(setMessages({ chatId, messages: merged }));
      await saveMessagesToCache(currentUser._id, chatId, merged);

      if ((res.messages || []).length < 20) {
        setHasMore(false);
      }

      setPage(nextPage);
      setLoadedPages((prev) =>
        prev.includes(nextPage) ? prev : [...prev, nextPage]
      );
    } catch (e) { }
  };

  const ensureMessageLoaded = async (messageId: string) => {
    if (!currentUser?._id) return false;

    let currentMessages = messagesRef.current || [];

    let found = currentMessages.some((m) => m._id === messageId);
    if (found) return true;

    let guard = 0;
    let localPage = page;
    let localHasMore = hasMore;

    while (!found && localHasMore && guard < 30) {
      guard += 1;

      const nextPage = localPage + 1;

      try {
        const res = await dispatch(
          loadMessages({ chatId, page: nextPage })
        ).unwrap();

        currentMessages = mergeMessages(currentMessages, res.messages || []);

        dispatch(setMessages({ chatId, messages: currentMessages }));
        await saveMessagesToCache(currentUser._id, chatId, currentMessages);

        if ((res.messages || []).length < 20) {
          localHasMore = false;
          setHasMore(false);
        }

        localPage = nextPage;
        setPage(nextPage);
        setLoadedPages((prev) =>
          prev.includes(nextPage) ? prev : [...prev, nextPage]
        );

        found = currentMessages.some((m) => m._id === messageId);
        if (found) break;

        if ((res.messages || []).length < 20) {
          break;
        }
      } catch {
        break;
      }
    }

    return found;
  };

  const scrollToMessageIfLoaded = async (messageId: string) => {
    let index = messages.findIndex((m: { _id: string }) => {
      return m._id === messageId;
    });

    if (index === -1) {
      const ok = await ensureMessageLoaded(messageId);
      if (!ok) return false;
    }

    setTimeout(() => {
      const newIndex = messages.findIndex((m: { _id: string }) => {
        return m._id === messageId;
      });

      if (newIndex === -1) return;

      setSelectedSearchMessageId(messageId);

      flatListRef.current?.scrollToIndex?.({
        index: newIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, 350);

    return true;
  };

  const goToSearchResult = async (index: number) => {
    if (!searchResults.length) return;

    const normalized =
      index < 0
        ? searchResults.length - 1
        : index >= searchResults.length
          ? 0
          : index;

    const item = searchResults[normalized];

    setSelectedSearchIndex(normalized);
    setSelectedSearchMessageId(item._id);

    await scrollToMessageIfLoaded(item._id);
  };
  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });

    setShowScrollToBottom(false);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSelectedSearchIndex(0);
    setSelectedSearchMessageId(null);
    dispatch(clearSearchResults());
  };

  const doToggleBlock = async () => {
    const targetId = otherUser?._id;
    if (!targetId) return;

    if (blockedMe) {
      setMenuOpen(false);
      return;
    }

    try {
      if (blockedByMe) {
        await dispatch(unblockUser(targetId) as any).unwrap?.();
      } else {
        await dispatch(blockUser(targetId) as any).unwrap?.();
      }

      await dispatch(fetchBlockStatus({ targetUserId: String(targetId) }) as any);
      await dispatch(fetchUserProfile(String(targetId)) as any).unwrap?.();
    } catch (e) {
    } finally {
      setMenuOpen(false);
    }
  };

  const handleJoinRoomFromInvite = (roomId: string) => {
    if (!roomId) return;

    router.push({
      pathname: "/room/[id]",
      params: { id: roomId },
    });
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch { }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) return;

      setRecordedUri(uri);
    } catch { }
  };

  const getReplyPreviewText = (msg: any) => {
    if (!msg) return "";
    if (msg.type === "image") return "📷 صورة";
    if (msg.type === "video") return "🎥 فيديو";
    if (msg.type === "audio") return "🎤 رسالة صوتية";
    if (msg.type === "file") return "📎 ملف";

    return String(msg.content || "");
  };

  const sendMessage = () => {
    if (!text.trim() || !currentUser?._id) return;

    const tempId = `temp-${Date.now()}`;

    const optimistic: MessageItem = {
      _id: tempId,
      clientTempId: tempId,
      chat: chatId,
      sender: currentUser._id,
      type: "text",
      content: text,
      replyTo: replyToMessage?._id,
      reactions: [],
      deliveryStatus: {
        deliveredTo: [],
        seenBy: [],
      },
      createdAt: new Date().toISOString(),
      optimistic: true,
    } as any;

    dispatch(addMessage(optimistic));

    sendSocketMessage(
      chatId,
      text,
      "text",
      tempId,
      undefined,
      replyToMessage?._id
    );

    setText("");
    setReplyToMessage(null);
  };

  const sendMediaMessage = async (
    uri: string,
    type: "image" | "video" | "audio"
  ) => {
    if (!currentUser?._id) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: MessageItem = {
      _id: tempId,
      clientTempId: tempId,
      chat: chatId,
      sender: currentUser._id,
      type,
      content: uri,
      media: { url: uri },
      replyTo: replyToMessage?._id,
      reactions: [],
      deliveryStatus: {
        deliveredTo: [],
        seenBy: [],
      },
      createdAt: new Date().toISOString(),
      optimistic: true,
    } as any;

    dispatch(addMessage(optimisticMessage));
    setMediaSendingState((prev) => ({ ...prev, [tempId]: "uploading" }));

    try {
      const cloudType =
        type === "image" ? "image" : type === "video" ? "video" : "raw";

      const url = await uploadToCloudinary(uri, cloudType);

      setMediaSendingState((prev) => ({ ...prev, [tempId]: "sending" }));

      sendSocketMessage(
        chatId,
        url,
        type,
        tempId,
        undefined,
        replyToMessage?._id
      );

      setReplyToMessage(null);
    } catch (error: any) {
      setMediaSendingState((prev) => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });

      Alert.alert("خطأ", "فشل رفع أو إرسال الملف");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        await sendMediaMessage(uri, "image");
      }
    } catch { }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        await sendMediaMessage(uri, "video");
      }
    } catch { }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length) {
        await sendMediaMessage(result.assets[0].uri, "audio");
      }
    } catch { }
  };

  const handleDeleteMessage = async (
    messageId: string,
    type: "me" | "everyone"
  ) => {
    try {
      await api.delete("/messages/delete", {
        data: { messageId, type },
      });

      await refreshMessages();
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل حذف الرسالة");
    }
  };

 const closeMessageActions = () => {
  setActionsVisible(false);
  setActionsMessage(null);
};

const openMessageActions = (item: MessageItem) => {
  setActionsMessage(item);
  setActionsVisible(true);
};

const handleReplyFromActions = () => {
  if (!actionsMessage) return;

  setReplyToMessage({
    _id: actionsMessage._id,
    content: actionsMessage.content,
    type: actionsMessage.type,
    sender: String(actionsMessage.sender),
    media: actionsMessage.media,
  });

  closeMessageActions();
};

const handleDeleteForMeFromActions = () => {
  if (!actionsMessage) return;

  const messageId = actionsMessage._id;

  closeMessageActions();

  Alert.alert("حذف الرسالة", "هل تريد حذف الرسالة لديك فقط؟", [
    { text: "إلغاء", style: "cancel" },
    {
      text: "حذف",
      style: "destructive",
      onPress: () => handleDeleteMessage(messageId, "me"),
    },
  ]);
};

const handleDeleteForEveryoneFromActions = () => {
  if (!actionsMessage) return;

  const messageId = actionsMessage._id;

  closeMessageActions();

  Alert.alert("حذف للجميع", "هل تريد حذف الرسالة لدى الجميع؟", [
    { text: "إلغاء", style: "cancel" },
    {
      text: "حذف",
      style: "destructive",
      onPress: () => handleDeleteMessage(messageId, "everyone"),
    },
  ]);
};

  const findMessageById = (messageId?: string) => {
    if (!messageId) return null;

    return messages.find((m: { _id: string }) => m._id === messageId) || null;
  };

  const renderHighlightedText = (
    content: string,
    query: string,
    isMe: boolean,
    isActiveResult: boolean
  ) => {
    const textValue = String(content || "");
    const q = String(query || "").trim();

    const baseTextStyle = isMe
      ? styles.meText
      : [styles.otherText, { color: isDark ? "#E5E7EB" : "#111827" }];

    if (!q) {
      return (
        <Text
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          selectable={false}
          style={baseTextStyle}
        >
          {textValue}
        </Text>
      );
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = textValue.split(new RegExp(`(${escaped})`, "gi"));

    return (
      <Text
        allowFontScaling={false}
        maxFontSizeMultiplier={1}
        selectable={false}
        style={baseTextStyle}
      >
        {parts.map((part, index) => {
          const matched = part.toLowerCase() === q.toLowerCase();

          if (!matched) {
            return (
              <Text
                key={`${part}-${index}`}
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
              >
                {part}
              </Text>
            );
          }

          return (
            <Text
              key={`${part}-${index}`}
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
              style={[
                styles.highlightText,
                isActiveResult && styles.highlightTextActive,
              ]}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderReplyBlock = (item: any, isMe: boolean) => {
    const replyId =
      typeof item.replyTo === "string" ? item.replyTo : item.replyTo?._id;

    const repliedMsg =
      typeof item.replyTo === "object" && item.replyTo?._id
        ? item.replyTo
        : findMessageById(replyId);

    if (!replyId && !repliedMsg) return null;

    const previewSource = repliedMsg || item.replyTo;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          const targetId = previewSource?._id || replyId;

          if (targetId) {
            scrollToMessageIfLoaded(targetId);
          }
        }}
        style={[
          styles.replyPreviewBox,
          {
            backgroundColor: isMe
              ? "rgba(255,255,255,0.16)"
              : isDark
                ? "rgba(255,255,255,0.06)"
                : "#EEF2FF",
            borderLeftColor: isMe ? "#E5E7EB" : "#6D5DF6",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          style={[
            styles.replyPreviewTitle,
            { color: isMe ? "#FFF" : "#6D5DF6" },
          ]}
        >
          Reply
        </Text>

        <Text
          numberOfLines={2}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          style={[
            styles.replyPreviewText,
            {
              color: isMe
                ? "rgba(255,255,255,0.92)"
                : isDark
                  ? "#CBD5E1"
                  : "#374151",
            },
          ]}
        >
          {getReplyPreviewText(previewSource)}
        </Text>
      </TouchableOpacity>
    );
  };

  const copyMessageText = async (item: MessageItem) => {
    try {
      const value = String((item as any)?.content || "").trim();

      if (!value) return;

      if (
        item.type === "image" ||
        item.type === "video" ||
        item.type === "audio" ||
        item.type === "file"
      ) {
        return;
      }

      await Clipboard.setStringAsync(value);
    } catch { }
  };

  const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {
    return (
      <MessageBubble
        item={item}
        currentUserId={currentUser?._id}
        isDark={isDark}
        inputSearchValue={inputSearchValue}
        highlightedMessageIds={highlightedMessageIds}
        selectedSearchMessageId={selectedSearchMessageId}
        mediaSendingState={mediaSendingState}
        onLongPress={openMessageActions}
        onCopy={copyMessageText}
        onImagePreview={setImagePreview}
        onJoinRoom={handleJoinRoomFromInvite}
        renderReplyBlock={renderReplyBlock}
        renderHighlightedText={renderHighlightedText}
      />
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0B1220" : "white" },
      ]}
    >
      {!searchOpen ? (
        <ChatHeader
          isDark={isDark}
          otherUser={otherUser}
          typingUsers={typingUsers}
          blockedByMe={blockedByMe}
          blockedMe={blockedMe}
          onBack={() => router.back()}
          onProfilePress={() => {
            const userId = String(otherUser?._id || "");
            if (!userId) return;

            router.push({
              pathname: "/profile/[id]",
              params: { id: userId },
            });
          }}
          onSearchPress={() => {
            setSearchOpen(true);
            setMenuOpen(false);
          }}
          onMenuPress={() => setMenuOpen((v) => !v)}
        />
      ) : (
        <SearchHeader
          isDark={isDark}
          inputSearchValue={inputSearchValue}
          searchLoading={searchLoading}
          searchResultsLength={searchResults.length}
          selectedSearchIndex={selectedSearchIndex}
          onClose={closeSearch}
          onChangeText={(value) => {
            dispatch(setSearchQuery(value));
            setSelectedSearchIndex(0);
            setSelectedSearchMessageId(null);
          }}
          onClear={() => {
            dispatch(setSearchQuery(""));
            dispatch(clearSearchResults());
            setSelectedSearchIndex(0);
            setSelectedSearchMessageId(null);
          }}
          onPrev={() => goToSearchResult(selectedSearchIndex - 1)}
          onNext={() => goToSearchResult(selectedSearchIndex + 1)}
        />
      )}

      <SearchResultsCard
        visible={searchResultsCardVisible}
        isDark={isDark}
        searchLoading={searchLoading}
        searchResults={searchResults}
        inputSearchValue={inputSearchValue}
        selectedSearchMessageId={selectedSearchMessageId}
        onPressResult={async (item, index) => {
          setSelectedSearchIndex(index);
          setSelectedSearchMessageId(item._id);
          await scrollToMessageIfLoaded(item._id);
        }}
      />

      <ReplyComposer
        replyToMessage={replyToMessage}
        isDark={isDark}
        getReplyPreviewText={getReplyPreviewText}
        onClose={() => setReplyToMessage(null)}
      />

      {recordedUri && (
        <VoiceRecorderPreview
          uri={recordedUri}
          topOffset={insets.top + 56}
          onCancel={() => setRecordedUri(null)}
          onSend={async () => {
            if (isBlocked) return;

            await sendMediaMessage(recordedUri, "audio");
            setRecordedUri(null);
          }}
        />
      )}

      {isBlocked && <BlockBanner isDark={isDark} blockedMe={blockedMe} />}

      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;

          // لأن FlatList inverted:
          // y = 0 يعني أنت في آخر المحادثة
          // كلما زاد y يعني المستخدم طلع لفوق
          setShowScrollToBottom(y > 220);
        }}
        initialNumToRender={14}
        maxToRenderPerBatch={10}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === "android"}
        ListHeaderComponent={<Animated.View style={listSpacerAnimatedStyle} />}
        ListFooterComponent={
          loading && hasMore ? (
            <View style={styles.paginationLoader}>
              <ActivityIndicator size="small" color="#6D5DF6" />
            </View>
          ) : null
        }
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: searchResultsCardVisible ? 210 : 12,
          paddingBottom: 8,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={() => { }}
      />
      {showScrollToBottom && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={scrollToBottom}
          style={[
            styles.scrollToBottomBtn,
            {
              bottom: Math.max(insets.bottom, 8) + 78,
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              borderColor: isDark ? "#374151" : "#E5E7EB",
            },
          ]}
        >
          <Ionicons
            name="chevron-down"
            size={24}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
        </TouchableOpacity>
      )}
      <ChatInputBar
        isDark={isDark}
        isBlocked={isBlocked}
        insetsBottom={insets.bottom}
        inputBarAnimatedStyle={inputBarAnimatedStyle}
        text={text}
        isRecording={isRecording}
        onPickVideo={pickVideo}
        onPickImage={pickImage}
        onSend={sendMessage}
        onMicPressIn={startRecording}
        onMicPressOut={stopRecording}
        onFocus={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset?.({
              offset: 0,
              animated: true,
            });
          }, 50);
        }}
        onTextChange={(value) => {
          setText(value);

          emitTyping(chatId, true);
          clearTimeout(typingTimeout.current);

          typingTimeout.current = setTimeout(() => {
            emitTyping(chatId, false);
          }, 1500);
        }}
      />

      <ImagePreviewModal
        imagePreview={imagePreview}
        onClose={() => setImagePreview(null)}
      />
<Modal
  visible={actionsVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={closeMessageActions}
>
  <Pressable style={styles.actionsOverlay} onPress={closeMessageActions}>
    <Pressable
      style={[
        styles.actionsBox,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          borderColor: isDark ? "#1F2937" : "#E5E7EB",
        },
      ]}
      onPress={() => {}}
    >
      <TouchableOpacity
        style={styles.actionsItem}
        activeOpacity={0.85}
        onPress={handleReplyFromActions}
      >
        <Ionicons
          name="return-up-back-outline"
          size={20}
          color={isDark ? "#E5E7EB" : "#111827"}
        />
        <Text
          style={[
            styles.actionsText,
            { color: isDark ? "#E5E7EB" : "#111827" },
          ]}
        >
          Reply
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionsItem}
        activeOpacity={0.85}
        onPress={handleDeleteForMeFromActions}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <Text style={[styles.actionsText, { color: "#EF4444" }]}>
          Delete for me
        </Text>
      </TouchableOpacity>

      {actionsMessage &&
        String(actionsMessage.sender) === String(currentUser?._id) && (
          <TouchableOpacity
            style={styles.actionsItem}
            activeOpacity={0.85}
            onPress={handleDeleteForEveryoneFromActions}
          >
            <Ionicons name="trash-bin-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionsText, { color: "#EF4444" }]}>
              Delete for everyone
            </Text>
          </TouchableOpacity>
        )}

      <TouchableOpacity
        style={styles.actionsCancel}
        activeOpacity={0.85}
        onPress={closeMessageActions}
      >
        <Text
          style={[
            styles.actionsCancelText,
            { color: isDark ? "#CBD5E1" : "#374151" },
          ]}
        >
          إلغاء
        </Text>
      </TouchableOpacity>
    </Pressable>
  </Pressable>
</Modal>
      {menuOpen && (
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[
              styles.menuBox,
              {
                backgroundColor: isDark ? "#0F172A" : "#FFF",
                borderColor: isDark ? "#111827" : "#E5E7EB",
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={doToggleBlock}
              disabled={blockedMe}
              activeOpacity={0.8}
            >
              <Ionicons
                name={menuIcon}
                size={18}
                color={
                  blockedMe ? "#EF4444" : blockedByMe ? "#22C55E" : "#EF4444"
                }
                style={{ marginRight: 10 }}
              />

              <Text
                style={[
                  styles.menuText,
                  {
                    color: blockedMe
                      ? "#EF4444"
                      : blockedByMe
                        ? "#22C55E"
                        : "#EF4444",
                  },
                ]}
              >
                {menuLabel}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}