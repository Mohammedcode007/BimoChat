

import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
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

import MiniAudioBar from "@/components/roomScreen/MiniAudioBar";
import { LocalUploadFile } from "@/services/upload/types";
import { uploadSingleFile } from "@/services/upload/uploadApi";
import { loadMessagesFromCache, saveMessagesToCache } from "@/storage/chatCache";
import { mergeMessages } from "@/utils/mergeMessages";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;
const CHAT_INPUT_HEIGHT = 66;
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
  const [activeAudioUri, setActiveAudioUri] = useState<string | null>(null);
  const [miniAudioHidden, setMiniAudioHidden] = useState(false);

  const audioPlayer = useAudioPlayer(activeAudioUri || null, {
    updateInterval: 250,
    downloadFirst: false,
  });

  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const audioProgressMillis = Math.floor(
    Number(audioStatus?.currentTime || 0) * 1000
  );

  const audioDurationMillis = Math.floor(
    Number(audioStatus?.duration || 0) * 1000
  );

  const audioIsPlaying = Boolean(audioStatus?.playing);
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
    height: keyboardHeight.value + CHAT_INPUT_HEIGHT + Math.max(insets.bottom, 0),
  };
});

  const currentUser = useSelector(selectCurrentUser);

  const messages = useSelector(
    useMemo(() => selectMessagesByChatId(chatId), [chatId])
  );

  const loading = useSelector((state: RootState) => {
    return Boolean((state.message as any).loadingByChatId?.[chatId]);
  });
  const hasMessages = Array.isArray(messages) && messages.length > 0;
  const showPaginationLoader = loading && hasMore && hasMessages;
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


  if (messages.length === 0) return;

  try {
    saveMessagesToCache(currentUser._id, chatId, messages);
  } catch {}
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
    }
  };
  const hasReduxMessages =
    Array.isArray(messages) && messages.length > 0;
  useEffect(() => {
    if (!chatId) return;
    if (!currentUser?._id) return;

    let isMounted = true;
    const run = async () => {
      try {
        dispatch(setActiveChat(chatId));
        joinChatRoom(chatId);

        markChatNotificationsAsRead();

        const currentReduxMessages = messagesRef.current || [];

        // if (currentReduxMessages.length) {
        //   setLoadedPages([1]);
        //   setPage(1);
        //   setHasMore(currentReduxMessages.length >= 20);

        //   const hasIncoming = currentReduxMessages.some((m: any) => {
        //     return String(m?.sender?._id || m?.sender) !== String(currentUser._id);
        //   });

        //   if (hasIncoming) {
        //     emitMarkAsSeen(chatId);
        //   }

        //   return;
        // }
if (currentReduxMessages.length) {
  setLoadedPages([1]);
  setPage(1);
  setHasMore(currentReduxMessages.length >= 20);

  const hasIncoming = currentReduxMessages.some((m: any) => {
    return String(m?.sender?._id || m?.sender) !== String(currentUser._id);
  });

  if (hasIncoming) {
    emitMarkAsSeen(chatId);
  }

  dispatch(
    loadMessages({
      chatId,
      page: 1,
      silent: true,
    }) as any
  )
    .unwrap()
    .then(async (res: any) => {
      if (!isMounted) return;

      const incoming = Array.isArray(res?.messages) ? res.messages : [];
      const latest = messagesRef.current || currentReduxMessages;
      const merged = mergeMessages(latest, incoming);

      messagesRef.current = merged;

      dispatch(setMessages({ chatId, messages: merged }));
      await saveMessagesToCache(currentUser._id!, chatId, merged);

      setHasMore(incoming.length >= 20);

      const hasNewIncoming = merged.some((m: any) => {
        return String(m?.sender?._id || m?.sender) !== String(currentUser._id);
      });

      if (hasNewIncoming) {
        emitMarkAsSeen(chatId);
      }
    })
    .catch(() => {});

  return;
}
        const cached = await loadMessagesFromCache(currentUser._id!, chatId);

        if (!isMounted) return;

        if (cached.length) {
          dispatch(setMessages({ chatId, messages: cached }));
          messagesRef.current = cached;

          setLoadedPages([1]);
          setPage(1);
          setHasMore(cached.length >= 20);

          const hasIncoming = cached.some((m: any) => {
            return String(m?.sender?._id || m?.sender) !== String(currentUser._id);
          });

          if (hasIncoming) {
            emitMarkAsSeen(chatId);
          }

          dispatch(
            loadMessages({
              chatId,
              page: 1,
              silent: true,
            }) as any
          )
            .unwrap()
            .then(async (res: any) => {
              if (!isMounted) return;

              const incoming = Array.isArray(res?.messages) ? res.messages : [];
              const merged = mergeMessages(messagesRef.current || cached, incoming);

              dispatch(setMessages({ chatId, messages: merged }));
              await saveMessagesToCache(currentUser._id!, chatId, merged);

              setHasMore(incoming.length >= 20);
            })
            .catch(() => { });

          return;
        }

        const res = await dispatch(loadMessages({ chatId, page: 1 })).unwrap();

        if (!isMounted) return;

        const incoming = Array.isArray(res?.messages) ? res.messages : [];
        const merged = mergeMessages([], incoming);

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
const cancelRecording = async () => {
  try {
    if (!recordingRef.current) {
      setIsRecording(false);
      setRecordedUri(null);
      return;
    }

    await recordingRef.current.stopAndUnloadAsync();

    recordingRef.current = null;
    setIsRecording(false);
    setRecordedUri(null);
  } catch {
    recordingRef.current = null;
    setIsRecording(false);
    setRecordedUri(null);
  }
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
function getFileNameFromUri(uri: string, fallback: string) {
  const cleanUri = String(uri || "").split("?")[0];
  const name = cleanUri.split("/").pop();

  if (name && name.includes(".")) return name;

  return fallback;
}
function getMimeTypeFromUri(uri: string, fallback: string) {
  const cleanUri = String(uri || "").split("?")[0].toLowerCase();

  if (cleanUri.endsWith(".jpg") || cleanUri.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (cleanUri.endsWith(".png")) {
    return "image/png";
  }

  if (cleanUri.endsWith(".webp")) {
    return "image/webp";
  }

  if (cleanUri.endsWith(".gif")) {
    return "image/gif";
  }

  if (cleanUri.endsWith(".mp4")) {
    return fallback.startsWith("audio/") ? "audio/mp4" : "video/mp4";
  }

  if (cleanUri.endsWith(".mov")) {
    return "video/quicktime";
  }

  if (cleanUri.endsWith(".m4a")) {
    return "audio/m4a";
  }

  if (cleanUri.endsWith(".aac")) {
    return "audio/aac";
  }

  if (cleanUri.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (cleanUri.endsWith(".wav")) {
    return "audio/wav";
  }

  if (cleanUri.endsWith(".caf")) {
    return "audio/x-caf";
  }

  if (cleanUri.endsWith(".3gp")) {
    return "audio/3gpp";
  }

  if (cleanUri.endsWith(".amr")) {
    return "audio/amr";
  }

  return fallback;
}

function getChatUploadFile(params: {
  uri: string;
  type: "image" | "video" | "audio";
}): LocalUploadFile {
  const now = Date.now();

  if (params.type === "image") {
    return {
      uri: params.uri,
      name: getFileNameFromUri(params.uri, `chat-image-${now}.jpg`),
      type: getMimeTypeFromUri(params.uri, "image/jpeg"),
    };
  }

  if (params.type === "video") {
    return {
      uri: params.uri,
      name: getFileNameFromUri(params.uri, `chat-video-${now}.mp4`),
      type: getMimeTypeFromUri(params.uri, "video/mp4"),
    };
  }

  return {
    uri: params.uri,
    name: getFileNameFromUri(params.uri, `chat-voice-${now}.m4a`),
    type: getMimeTypeFromUri(params.uri, "audio/m4a"),
  };
}
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
media: {
  url: uri,
  mimeType:
    type === "image"
      ? getMimeTypeFromUri(uri, "image/jpeg")
      : type === "video"
      ? getMimeTypeFromUri(uri, "video/mp4")
      : getMimeTypeFromUri(uri, "audio/m4a"),
},
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
    const file = getChatUploadFile({
      uri,
      type,
    });

    console.log("[Chat Upload] start:", {
      chatId,
      tempId,
      file,
      mediaType: type,
    });

    const uploaded = await uploadSingleFile({
      file,
      folder:
        type === "image"
          ? "chat"
          : type === "video"
          ? "videos"
          : "voice",
      userId: String(currentUser._id),
      extraFields: {
        source: "private_chat",
        chatId,
        mediaType: type,
      },
    });

    console.log("[Chat Upload] success:", uploaded);

    setMediaSendingState((prev) => ({ ...prev, [tempId]: "sending" }));

    /**
     * ملاحظة:
     * sendSocketMessage عندك يأخذ content كرابط فقط.
     * لذلك نرسل uploaded.url مثل القديم.
     * لو الباك يدعم media object لاحقًا، نقدر نرسل publicId و mimeType أيضًا.
     */
    sendSocketMessage(
      chatId,
      uploaded.url,
      type,
      tempId,
      undefined,
      replyToMessage?._id
    );

    setReplyToMessage(null);
  } catch (error: any) {
console.log("[Chat Upload] error:", {
  message: error?.message,
  status: error?.response?.status,
  response: error?.response?.data,
  error,
});

    setMediaSendingState((prev) => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });

    Alert.alert(
      "خطأ",
      String(error?.message || "فشل رفع أو إرسال الملف")
    );
  }
};

const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      await sendMediaMessage(uri, "image");
    }
  } catch (error: any) {
    console.log("[Chat Pick Image] error:", error);
  }
};
const pickVideo = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      await sendMediaMessage(uri, "video");
    }
  } catch (error: any) {
    console.log("[Chat Pick Video] error:", error);
  }
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

  const openMiniAudioPlayer = async (uri: string) => {
    try {
      if (!uri) return;

      setMiniAudioHidden(false);

      if (activeAudioUri === uri) {
        audioPlayer.play();
        return;
      }

      try {
        audioPlayer.pause();
      } catch { }

      setActiveAudioUri(uri);
    } catch { }
  };

  useEffect(() => {
    if (!activeAudioUri) return;

    const timer = setTimeout(() => {
      try {
        audioPlayer.play();
      } catch { }
    }, 80);

    return () => clearTimeout(timer);
  }, [activeAudioUri]);

  const toggleMiniAudio = () => {
    try {
      if (audioIsPlaying) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
    } catch { }
  };
  const seekMiniAudioToMillis = async (millis: number) => {
    try {
      const seconds = Math.max(0, Number(millis || 0) / 1000);
      await audioPlayer.seekTo(seconds);
    } catch { }
  };
  const closeMiniAudio = () => {
    try {
      audioPlayer.pause();
    } catch { }

    setActiveAudioUri(null);
    setMiniAudioHidden(false);
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
        onPlayAudio={openMiniAudioPlayer}
        activeAudioUri={activeAudioUri}
        activeAudioPlaying={audioIsPlaying}
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
      <MiniAudioBar
        visible={!!activeAudioUri}
        hidden={miniAudioHidden}
        top={insets.top + 58}
        isDark={isDark}
        progressMillis={audioProgressMillis}
        durationMillis={audioDurationMillis}
        isPlaying={audioIsPlaying}
        onTogglePlay={toggleMiniAudio}
        onSeekToMillis={seekMiniAudioToMillis}
        onHide={() => setMiniAudioHidden(true)}
        onShow={() => setMiniAudioHidden(false)}
        onClose={closeMiniAudio}
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

        
          setShowScrollToBottom(y > 220);
        }}
        initialNumToRender={14}
        maxToRenderPerBatch={10}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === "android"}
        ListHeaderComponent={<Animated.View style={listSpacerAnimatedStyle} />}
        ListFooterComponent={
          showPaginationLoader ? (
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
  paddingBottom: 12,
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

  // ✅ ترك الضغط أو السحب لأعلى يوقف التسجيل ويظهر المعاينة
  onMicPressOut={stopRecording}
  onPauseRecording={stopRecording}

  // ✅ السحب لليسار يلغي التسجيل تمامًا
  onCancelRecording={cancelRecording}

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
            onPress={() => { }}
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