
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
  StyleSheet,
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
  boostRoom,
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
  selectFavoriteRooms,
  selectKickedFlag,
  selectRoomActiveCount,
  selectRoomAvatarById,
  selectRoomLoadingMessages,
  selectRoomMessages,
  selectRoomNameById,
  selectRooms,
  selectRoomUsers,
  sendBombColorAnswer,
  sendRoomMessage,
  socketRoleSetFailed,
  socketRoleSetRequested,
  socketRoleSetSucceeded,
  toggleRoomFavorite
} from "@/redux/slices/room.slice";
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
import MiniAudioBar from "@/components/roomScreen/MiniAudioBar";
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
import { LocalUploadFile } from "@/services/upload/types";
import { uploadSingleFile } from "@/services/upload/uploadApi";

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
  const [audioBarHidden, setAudioBarHidden] = useState(false);
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
  const rooms = useAppSelector(selectRooms);
  const favoriteRooms = useAppSelector(selectFavoriteRooms);
  const mutatingRoom = useAppSelector((state) => state.room.mutatingRoom);

  const currentRoom = useMemo(() => {
    return rooms.find((r: any) => String(r?._id) === String(roomId));
  }, [rooms, roomId]);

  const isRoomFavorite = useMemo(() => {
    if (currentRoom?.isFavorite) return true;

    return favoriteRooms.some(
      (r: any) => String(r?._id) === String(roomId)
    );
  }, [currentRoom?.isFavorite, favoriteRooms, roomId]);
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
  const [usersModalLoading, setUsersModalLoading] = useState(false);
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
  // const openAudioModal = (message: MessageUI) => {
  //   if (!message?.uri) return;
  //   setActiveAudio(message);
  //   setShowAudioModal(true);
  // };
  const openAudioModal = async (message: MessageUI) => {
    if (!message?.uri) return;

    const audioId = String(
      message.id ||
      message.serverId ||
      message.clientId ||
      Date.now()
    );

    setActiveAudio(message);
    setAudioBarHidden(false);

    await togglePlay(String(message.uri), audioId);
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
  const normalizeResolvedBadges = (badges?: any[]): UserBadgeUI[] => {
  if (!Array.isArray(badges)) return [];

  return badges
    .map((b: any) => ({
      key: String(b?.key || b?._id || ""),
      name: String(b?.name || ""),
      iconUrl: String(b?.iconUrl || ""),
      lottieUrl: String(b?.lottieUrl || ""),
      isAnimated: Boolean(b?.isAnimated || b?.lottieUrl),
    }))
    .filter((b: any) => b.key || b.iconUrl || b.lottieUrl);
};

const getUserActiveBadges = (user: any, fallbackInventory?: any[]) => {
  const resolved = normalizeResolvedBadges(user?.activeBadgesResolved);

  if (resolved.length > 0) {
    return resolved;
  }

  return buildActiveBadgesFromUser(user, fallbackInventory);
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
    ? getUserActiveBadges(u, myInventory)
    : getUserActiveBadges(u),
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
activeBadges: meInRoom ? getUserActiveBadges(meInRoom, myInventory) : [],
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
    } catch { }
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

  let cancelled = false;

  const loadRoom = async () => {
    try {
      /**
       * لا تمسح الرسائل هنا.
       * لو الرسائل موجودة في Redux، ستظل ظاهرة بدون فلاش.
       */
      joinRoomSocket(roomId);

      const hasMessages =
        Array.isArray(reduxMessages) && reduxMessages.length > 0;

      const messagesPromise = hasMessages
        ? Promise.resolve()
        : dispatch(
            fetchRoomMessages({
              roomId,
              pagination: { limit: 50 },
              append: false,
            })
          ).unwrap();

      const usersPromise = dispatch(fetchRoomUsers(roomId)).unwrap();
      const statsPromise = dispatch(fetchRoomStats(roomId)).unwrap();
      const inventoryPromise = dispatch(getMyInventory() as any);

      await Promise.allSettled([
        messagesPromise,
        usersPromise,
        statsPromise,
        inventoryPromise,
      ]);

      if (cancelled) return;

      ensureMicPermission();
    } catch (e) {
      console.log("[ChatScreen][loadRoom] error:", e);
    }
  };

  loadRoom();

  return () => {
    cancelled = true;

    /**
     * لا تمسح الرسائل عند الخروج للخلف.
     * امسحها فقط عند leave الحقيقي أو logout.
     */
  };
}, [roomId, dispatch]);
  // useEffect(() => {
  //   if (!roomId) return;

  //   const hasMessages = Array.isArray(reduxMessages) && reduxMessages.length > 0;
  //   const hasUsers = Array.isArray(roomUsers) && roomUsers.length > 0;
  //   const hasStats = typeof activeCount === "number";

  //   const loadRoom = async () => {
  //     try {
  //       if (!hasMessages) {
  //         await dispatch(
  //           fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })
  //         ).unwrap();
  //       }

  //       if (!hasUsers) {
  //         await dispatch(fetchRoomUsers(roomId)).unwrap();
  //       }

  //       if (!hasStats) {
  //         await dispatch(fetchRoomStats(roomId)).unwrap();
  //       }

  //       await dispatch(getMyInventory() as any);
  //       joinRoomSocket(roomId);
  //       ensureMicPermission();
  //     } catch (e) {
  //     }
  //   };

  //   loadRoom();

  //   return () => {
  //     // leaveRoomSocket(roomId);
  //   };
  // }, [roomId]);
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
    ? getUserActiveBadges(u, myInventory)
    : getUserActiveBadges(u),
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
  snap
    ? senderId === myUserId
      ? getUserActiveBadges(snap, myInventory)
      : getUserActiveBadges(snap)
    : [];

const activeBadgesFromSenderObj =
  senderObj
    ? senderId === myUserId
      ? getUserActiveBadges(senderObj, myInventory)
      : getUserActiveBadges(senderObj)
    : [];

const activeBadgesFromUsersMap = usersMap.get(senderId)?.activeBadges || [];

const activeBadges =
  activeBadgesFromSnapshot.length > 0
    ? activeBadgesFromSnapshot
    : activeBadgesFromSenderObj.length > 0
      ? activeBadgesFromSenderObj
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
    const metaAction = String(m?.meta?.action || m?.action || "").trim();

    const isAnaTitleGame = metaAction === "ana_title_game";
    const isLookalikeGame = metaAction === "lookalike_game";
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

    // let uiType: MessageUI["type"] = "text";
    // let resolvedSystemType: MessageUI["systemType"] | undefined = undefined;

    // if (backendType === "gift") uiType = "gift";
    // else if (backendType === "song") uiType = "song";
    // else if (backendType === "game") uiType = "game";
    // else if (backendType === "image") uiType = "image";
    // else if (backendType === "video") uiType = "video";
    // else if (backendType === "audio") uiType = "audio";
    // else if (backendType === "file") uiType = "file";
    // else if (isSystem) uiType = "system";
    let uiType: MessageUI["type"] = "text";
    let resolvedSystemType: MessageUI["systemType"] | undefined = undefined;

    if (isAnaTitleGame || isLookalikeGame) uiType = "game";
    else if (backendType === "gift") uiType = "gift";
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
  isAnaTitleGame
    ? {
        gameType: "ana_title",
        gameId: String(m?._id || "").trim(),
        title: String(m?.meta?.role || m?.role || m?.content || "").trim(),
        state: "result",
        turnUserId: "",
        winnerUserId: "",
        payload: {
          game: "ana_title_game",
          targetName: String(m?.meta?.targetName || m?.targetName || "").trim(),
          title: String(m?.meta?.role || m?.role || m?.content || "").trim(),
          botName: String(m?.meta?.actorName || m?.actorName || "game").trim(),
        },
      }
    : isLookalikeGame
      ? {
          gameType: "lookalike",
          gameId: String(m?._id || "").trim(),
          title: String(m?.meta?.role || m?.role || m?.content || "").trim(),
          state: "result",
          turnUserId: "",
          winnerUserId: "",
          payload: {
            game: "lookalike_game",
            targetName: String(m?.meta?.targetName || m?.targetName || "").trim(),
            title: String(m?.meta?.role || m?.role || m?.content || "").trim(),
            botName: String(m?.meta?.actorName || m?.actorName || "game").trim(),
          },
        }
      : backendType === "game"
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
      m?.action || "",
      m?.targetName || "",
      m?.role || "",
      m?.meta?.action || "",
      m?.meta?.targetName || "",
      m?.meta?.role || "",
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
    setActiveAudio((prev) => ({
      ...(prev || {}),
      id,
      uri,
      type: "audio",
      time: "",
    } as any));
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
  const seekRoomAudioToMillis = async (millis: number) => {
    try {
      if (!sound) return;

      const safeMillis = Math.max(
        0,
        Math.min(Number(millis || 0), Number(playbackDuration || 0))
      );

      await sound.setPositionAsync(safeMillis);
      setPlaybackProgress(safeMillis);
    } catch { }
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
      activeBadgesResolved: normalizeResolvedBadges(
        (meInRoom as any)?.activeBadgesResolved
      ),
      customEmojiBadge:
        meInRoom?.customEmojiBadge || me?.customEmojiBadge || null,
    }
            : me
              ? {
                _id: me._id,
                username: me.username,
                atUsername: me.atUsername,
                avatar: me.avatar,
                activeBadgesResolved: normalizeResolvedBadges((me as any)?.activeBadgesResolved),
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
function getFileNameFromUri(uri: string, fallback: string) {
  const cleanUri = String(uri || "").split("?")[0];
  const name = cleanUri.split("/").pop();

  if (name && name.includes(".")) return name;

  return fallback;
}

function getRoomUploadFile(params: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  fallbackName: string;
  fallbackType: string;
}): LocalUploadFile {
  return {
    uri: params.uri,
    name:
      String(params.name || "").trim() ||
      getFileNameFromUri(params.uri, params.fallbackName),
    type: String(params.mimeType || "").trim() || params.fallbackType,
  };
}
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

  if (!asset || !localUri) return;

  try {
    setUploading({
      visible: true,
      title: "جاري رفع الصورة…",
      sub: "يتم تجهيز الصورة وإرسالها",
      startedAt: Date.now(),
      previewUri: localUri,
      kind: "image",
    });

    const clientId = `image:${Date.now()}:${Math.random()
      .toString(16)
      .slice(2)}`;

    const file = getRoomUploadFile({
      uri: localUri,
      name: asset.fileName || null,
      mimeType: asset.mimeType || null,
      fallbackName: `room-image-${Date.now()}.jpg`,
      fallbackType: "image/jpeg",
    });

    console.log("[Room Upload][Image] file:", file);

    const uploaded = await uploadSingleFile({
      file,
      folder: "rooms",
      userId: myUserId,
      extraFields: {
        source: "room",
        roomId,
        mediaType: "image",
      },
    });

    console.log("[Room Upload][Image] uploaded:", uploaded);

    await dispatch(
      sendRoomMessage({
        roomId,
        clientId,
        content: "📷 Image",
        type: "image",
        media: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
          mimeType: file.type,
          fileName: file.name,
          size: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
        },
      } as any)
    ).unwrap();

    scrollToBottom();
  } catch (e: any) {
    console.log("[Room Upload][Image] error:", e);
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
  // const sendImage = async () => {
  //   if (!roomId) return;

  //   const res = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     quality: 0.85,
  //     allowsEditing: false,
  //   });

  //   if (res.canceled) return;

  //   const asset = res.assets?.[0];
  //   const localUri = asset?.uri;
  //   if (!localUri) return;

  //   try {
  //     setUploading({
  //       visible: true,
  //       title: "جاري رفع الصورة…",
  //       sub: "يتم تجهيز الصورة وإرسالها",
  //       startedAt: Date.now(),
  //       previewUri: localUri,
  //       kind: "image",
  //     });

  //     const secureUrl = await uploadToCloudinary(localUri, "image");

  //     await dispatch(
  //       sendRoomMessage({
  //         roomId,
  //         content: "📷 Image",
  //         type: "image",
  //         media: {
  //           url: secureUrl,
  //           mimeType: asset?.mimeType || "image/jpeg",
  //           fileName: asset?.fileName || "image.jpg",
  //         },
  //       })
  //     ).unwrap();

  //     scrollToBottom();
  //   } catch (e: any) {
  //     Alert.alert("Error", e?.message || "Upload failed");
  //   } finally {
  //     setUploading({
  //       visible: false,
  //       title: "Uploading…",
  //       sub: undefined,
  //       startedAt: undefined,
  //       previewUri: undefined,
  //       kind: undefined,
  //     });
  //   }
  // };
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

    if (!asset || !localUri) return;

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

    const file = getRoomUploadFile({
      uri: localUri,
      name: asset.name || null,
      mimeType: asset.mimeType || "image/gif",
      fallbackName: `room-gif-${Date.now()}.gif`,
      fallbackType: "image/gif",
    });


    const uploaded = await uploadSingleFile({
      file,
      folder: "rooms",
      userId: myUserId,
      extraFields: {
        source: "room",
        roomId,
        mediaType: "gif",
      },
    });


    await dispatch(
      sendRoomMessage({
        roomId,
        clientId,
        content: "GIF",
        type: "image",
        media: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
          mimeType: file.type,
          fileName: file.name,
          size: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
        },
      } as any)
    ).unwrap();

    scrollToBottom();
  } catch (e: any) {
    console.log("[Room Upload][GIF] error:", e);
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
  const onToggleRoomFavorite = async () => {
    if (!roomId || mutatingRoom) return;

    try {
      setShowRoomMenu(false);

      await dispatch(toggleRoomFavorite({ roomId })).unwrap();
    } catch {
      // Failed silently
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
      if (!roomId) return;

      /**
       * مهم:
       * boostRoom الآن لا يستقبل level ولا hours.
       * الباك هو الذي يحدد:
       * - كل بوست = 1
       * - السعر = 1500 Coinz
       * - المدة = 30 يوم
       */
      const r = await dispatch(boostRoom({ roomId })).unwrap();

      const boostPoints = Number(r?.boostPoints || r?.room?.boostPoints || 0);

      if (!boostPoints) {
        Alert.alert("Error", "Boost did not succeed.");
        return;
      }

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId: `boost_gift_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          type: "gift",
          content: "boost_rocket",
          gift: {
            key: "boost_rocket",
            name: "boost",
            value: 1500,
            icon: "🚀",
            animation: "rocket",
          },
        } as any)
      ).unwrap();

      const content = `🚀 <b>${myName}</b> boosted the room! Total boosts: ${boostPoints}`;

      await dispatch(
        sendRoomMessage({
          roomId,
          clientId: `boost_announcement_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          content,
          type: "announcement",
        })
      ).unwrap();

      await dispatch(fetchRoomStats(roomId)).unwrap();
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
          <TouchableOpacity
            onPress={async () => {
              setShowUsersModal(true);

              try {
                setUsersModalLoading(true);
                await dispatch(fetchRoomUsers(roomId)).unwrap();
              } catch (e) {
              } finally {
                setUsersModalLoading(false);
              }
            }}
            hitSlop={10}
            style={{ marginRight: 10 }}
            activeOpacity={0.85}
          >
            <Ionicons name="people-outline" size={23} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBoostRoom}
            hitSlop={10}
            style={{ marginRight: 10 }}
            activeOpacity={0.85}
          >
            <Ionicons name="rocket-outline" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowRoomMenu(true)}
            hitSlop={10}
            activeOpacity={0.85}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      <MiniAudioBar
        visible={!!activeAudio}
        hidden={audioBarHidden}
        top={insets.top + 58}
        isDark={colorScheme === "dark"}
        progressMillis={playbackProgress}
        durationMillis={playbackDuration}
        isPlaying={!!playingId}
        onTogglePlay={() => {
          if (!activeAudio?.uri) return;

          togglePlay(
            String(activeAudio.uri),
            String(activeAudio.id || activeAudio.serverId || activeAudio.clientId)
          );
        }}
        onSeekToMillis={seekRoomAudioToMillis}
        onHide={() => setAudioBarHidden(true)}
        onShow={() => setAudioBarHidden(false)}
        onClose={async () => {
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
          setPlaybackDuration(1);
          setAudioBarHidden(false);
        }}
      />
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
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onToggleRoomFavorite}
                activeOpacity={0.85}
                disabled={mutatingRoom}
              >
                <Ionicons
                  name={isRoomFavorite ? "star" : "star-outline"}
                  size={18}
                  color={isRoomFavorite ? "#F59E0B" : theme.text}
                />

                <Text
                  style={[
                    styles.menuText,
                    isRoomFavorite && { color: "#F59E0B" },
                    mutatingRoom && { opacity: 0.6 },
                  ]}
                >
                  {isRoomFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Text>
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
          loading={usersModalLoading}
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


        {/* ================= FIXED AUDIO TOP PLAYER ================= */}

        {/* {showAudioModal && !!activeAudio?.uri && (
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
        )} */}
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
        {/* {!!pendingVoiceUri && (
          <VoiceRecorderPreview
            uri={pendingVoiceUri}
            topOffset={insets.top + 56} // عدل الرقم حسب ارتفاع الهيدر عندك
            onCancel={() => setPendingVoiceUri(null)}
            onSend={async () => {
              if (!roomId || !pendingVoiceUri) return;
              try {
                setUploading({ visible: true, title: "جاري رفع الصوت…", sub: "يرجى الانتظار" });

           const clientId = `voice:${Date.now()}:${Math.random()
  .toString(16)
  .slice(2)}`;

const file = getRoomUploadFile({
  uri: pendingVoiceUri,
  name: `voice-${Date.now()}.m4a`,
  mimeType: "audio/mp4",
  fallbackName: `voice-${Date.now()}.m4a`,
  fallbackType: "audio/mp4",
});

console.log("[Room Upload][Voice] file:", file);

const uploaded = await uploadSingleFile({
  file,
  folder: "voice",
  userId: myUserId,
  extraFields: {
    source: "room",
    roomId,
    mediaType: "voice",
  },
});

console.log("[Room Upload][Voice] uploaded:", uploaded);

await dispatch(
  sendRoomMessage({
    roomId,
    clientId,
    content: "🎤 Voice message",
    type: "audio",
    media: {
      url: uploaded.url,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      mimeType: file.type,
      fileName: file.name,
      size: uploaded.bytes,
      duration: uploaded.duration,
    },
  } as any)
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
        )} */}
{!!pendingVoiceUri && (
  <VoiceRecorderPreview
    uri={pendingVoiceUri}
    topOffset={insets.top + 56}
    onCancel={() => setPendingVoiceUri(null)}
    onSend={async () => {
      if (!roomId || !pendingVoiceUri) return;

      try {
        setUploading({
          visible: true,
          title: "جاري رفع الصوت…",
          sub: "يرجى الانتظار",
          startedAt: Date.now(),
          previewUri: undefined,
          kind: undefined,
        });

        const clientId = `voice:${Date.now()}:${Math.random()
          .toString(16)
          .slice(2)}`;

        const file = getRoomUploadFile({
          uri: pendingVoiceUri,
          name: `voice-${Date.now()}.m4a`,
          mimeType: "audio/mp4",
          fallbackName: `voice-${Date.now()}.m4a`,
          fallbackType: "audio/mp4",
        });

        console.log("[Room Upload][Voice] file:", file);

        const uploaded = await uploadSingleFile({
          file,
          folder: "voice",
          userId: myUserId,
          extraFields: {
            source: "room",
            roomId,
            mediaType: "voice",
          },
        });

        console.log("[Room Upload][Voice] uploaded:", uploaded);

        await dispatch(
          sendRoomMessage({
            roomId,
            clientId,
            content: "🎤 Voice message",
            type: "audio",
            media: {
              url: uploaded.url,
              publicId: uploaded.publicId,
              resourceType: uploaded.resourceType,
              mimeType: file.type,
              fileName: file.name,
              size: uploaded.bytes,
              duration: uploaded.duration,
            },
          } as any)
        ).unwrap();

        try {
          await FileSystem.deleteAsync(pendingVoiceUri, {
            idempotent: true,
          });
        } catch {}

        setPendingVoiceUri(null);
        scrollToBottom();
      } catch (e: any) {
        console.log("[Room Upload][Voice] error:", e);
        Alert.alert("Error", e?.message || "Failed to send voice");
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

const miniAudioStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9999,
    alignItems: "center",
  },

  player: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },

  roundBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 6,
  },

  time: {
    fontSize: 10,
    fontWeight: "800",
    minWidth: 36,
    textAlign: "center",
    marginRight: 6,
  },

  progressBg: {
    width: 46,
    height: 3,
    borderRadius: 99,
    overflow: "hidden",
    marginRight: 4,
  },

  progressFill: {
    height: "100%",
    borderRadius: 99,
  },

  iconBtn: {
    width: 26,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});