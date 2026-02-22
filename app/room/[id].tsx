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
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import RenderHTML from "react-native-render-html";

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
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchRoomMessages,
  fetchRoomStats,
  fetchRoomUsers,
  leaveRoomAndExit,
  pinRoomMessage,
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
import { boostRoom } from "@/redux/slices/roomControl.slice";
import {
  deleteRoomSocketMessage,
  joinRoomSocket,
  leaveRoomSocket,
  setRoomUserRoleSocket,
  toggleRoomReaction as toggleRoomReactionSocket
} from "@/services/socket";

/* ================= TYPES ================= */

type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";

type UserUI = {
  id: string;
  name: string;
  avatar?: string;
  role?: "creator" | "owner" | "admin" | "member";
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
const shouldShowStar = (role?: "creator" | "owner" | "admin" | "member") =>
  role === "creator" || role === "owner" || role === "admin";

// لون النجمة
const getStarColor = (role?: "creator" | "owner" | "admin" | "member") =>
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
  onGiftDone
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
        <View style={bubbleStyles.avatarWrapLeft}>
          <Image
            source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
            style={bubbleStyles.avatar}
          />

          {shouldShowStar(senderRole) && (
            <Text style={[bubbleStyles.avatarStar, { color: starColor }]}>★</Text>
          )}
        </View>
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
              {/* {showStar && <Text style={[bubbleStyles.roleStar, { color: starColor }]}>★</Text>} */}

              <Text style={bubbleStyles.senderName} numberOfLines={1}>
                {item.sender.name}
              </Text>
            </View>

            {/* ✅ خط تحت الاسم */}
            <View style={bubbleStyles.nameUnderline} />
          </View>
        )}

        {!!item.deletedForEveryone ? (
          <Text style={bubbleStyles.msgTextMuted}>🚫 تم حذف الرسالة</Text>
        ) : (
          <>
            {item.type === "text" && <Text style={bubbleStyles.msgText}>{item.text}</Text>}
       {item.type === "gift" ? (
  (() => {
    const lottieSrc = getGiftLottieSource(item.text);
    if (!lottieSrc) return <Text style={bubbleStyles.msgTextMuted}>🎁 Gift</Text>;

    // ✅ بعد انتهاء Fullscreen (giftDone=true) اعرض تمثيل ثابت داخل الشات
    if (giftDone) {
      return <Text style={bubbleStyles.msgTextMuted}>🚀 Boost</Text>;
    }

    // ✅ قبل ما ينتهي (أثناء 5 ثواني) ممكن:
    // - تعرض نص بسيط بدل تكرار الـ lottie داخل الفقاعة
    // - أو تعرض lottie صغير داخل الفقاعة
    return <Text style={bubbleStyles.msgTextMuted}>🎁 Boosting…</Text>;
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
              <TouchableOpacity
                style={bubbleStyles.audioRow}
                activeOpacity={0.85}
                onPress={() => onTogglePlay(item.uri!, item.id)}
              >
                <Ionicons
                  name={playingId === item.id ? "pause" : "play"}
                  size={20}
                  color={isMe ? "#FFF" : "#111827"}
                />

                <View style={bubbleStyles.audioProgressWrapper}>
                  <View style={bubbleStyles.audioProgressBg}>
                    <Animated.View
                      style={[
                        bubbleStyles.audioProgressFill,
                        {
                          width:
                            playingId === item.id
                              ? progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"]
                              })
                              : "0%",
                          backgroundColor: isMe ? "#FFF" : "#6D5DF6"
                        }
                      ]}
                    />
                  </View>
                  <Text style={[bubbleStyles.audioLabel, { color: isMe ? "#E5E7EB" : "#374151" }]}>
                    Voice message
                  </Text>
                </View>
              </TouchableOpacity>
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
        <View style={bubbleStyles.avatarWrapRight}>
          <Image
            source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }}
            style={bubbleStyles.avatar}
          />

          {shouldShowStar(senderRole) && (
            <Text style={[bubbleStyles.avatarStarRight, { color: starColor }]}>★</Text>
          )}
        </View>
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
  onChangeRole
}: {
  visible: boolean;
  onClose: () => void;
  users: UserUI[];
  myUserId: string;
  myRole?: UserUI["role"];
  onCopyUser: (u: UserUI) => void;
  onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
}>({ visible: false, messageId: null, giftKey: null });

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

  /* ================= HELPERS ================= */
  const stripHtmlToText = (input: string) => {
    // ✅ لا ننفّذ HTML — فقط نزيل التاجز ونحافظ على النص
    const s = String(input || "");
    // إزالة script/style بالكامل
    const noScripts = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    const noStyles = noScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
    // تحويل <br> و </p> إلى سطر جديد
    const withBreaks = noStyles
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n");
    // إزالة باقي التاجز
    const textOnly = withBreaks.replace(/<[^>]+>/g, "");
    // فك بعض الـ entities الأساسية (بدون مكتبات)
    return textOnly
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
  };

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

  /* ================= MAP MESSAGE ================= */

  const mapReduxToUIMessage = (m: any): MessageUI => {
    // ✅ طباعات مختصرة ويمكن التحكم بها
    const DEBUG_MAP = true; // اجعلها false في الإنتاج
    const log = (...args: any[]) => DEBUG_MAP && console.log("[mapReduxToUIMessage]", ...args);

    const backendType = String(m?.type || "text");

    // ✅ gift ليست System
    const isSystem =
      backendType === "system" ||
      backendType === "announcement" ||
      backendType === "join" ||
      backendType === "leave" ||
      backendType === "promotion" ||
      backendType === "ban" ||
      backendType === "role";

    const senderObj =
      typeof m?.sender === "object" && m?.sender
        ? m.sender
        : m?.sender
          ? { _id: String(m.sender), username: "", avatar: "" }
          : null;

    const senderId = senderObj?._id ? String(senderObj._id) : "";

    let systemUserName =
      String(senderObj?.username || "").trim() ||
      String(m?.senderUsername || m?.actorName || m?.username || "").trim();

    if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
    if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
    if (!systemUserName) systemUserName = "مستخدم";

    // ✅ طباعات أساسية
    log("IN", {
      id: String(m?._id || ""),
      backendType,
      isSystem,
      senderId,
      senderUsername: String(senderObj?.username || ""),
      systemUserName,
      createdAt: m?.createdAt
    });

    // ✅ نصوص النظام
    let systemText = String(m?.content || "");

    if (backendType === "join") {
      systemText = `✅ ${systemUserName} Join`;
      log("SYSTEM join", { systemText });
    } else if (backendType === "leave") {
      systemText = `🚪 ${systemUserName} Left`;
      log("SYSTEM leave", { systemText });
    } else if (backendType === "promotion") {
      // ✅ promotion قد يكون "ترقية عامة" أو "تغيير دور" (role:set) داخل promotion
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

      log("SYSTEM promotion meta", { action, actor, target, roleRaw, isRoleChange });

      if (isRoleChange) {
        const targetName = target || "مستخدم";
        const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
        systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
        log("SYSTEM role-change-as-promotion", { systemText });
      } else {
        systemText = `⭐ تمت ترقية ${systemUserName}`;
        log("SYSTEM promotion default", { systemText });
      }
    } else if (backendType === "ban") {
      systemText = `⛔ تم حظر ${systemUserName}`;
      log("SYSTEM ban", { systemText });
    } else if (backendType === "announcement") {
      systemText = `📢 ${m?.content || ""}`;
      log("SYSTEM announcement", { systemText });
    } else if (backendType === "role") {
      // ✅ للتوافق مع بيانات قديمة لو عندك type=role مخزن سابقًا
      const actor = String(m?.actorName || systemUserName || "مشرف");
      const target = String(m?.targetName || "مستخدم");
      const r = normalizeRoleLabelAr(String(m?.role || ""));
      systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
      log("SYSTEM legacy role", { actor, target, r, systemText });
    }

    // replyTo
    const uiReplyTo: MessageUI | undefined =
      m?.replyTo && typeof m.replyTo === "object"
        ? {
          id: String(m.replyTo._id || "reply"),
          type: "text",
          text: String(m.replyTo.content || "Media message"),
          uri: m.replyTo.media?.url,
          sender: {
            id: String(m.replyTo.sender?._id || "unknown"),
            name: String(m.replyTo.sender?.username || "User"),
            avatar: String(m.replyTo.sender?.avatar || "")
          },
          time: ""
        }
        : undefined;

    // ✅ تحديد نوع رسالة UI (أضفنا gift)
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

    // ✅ عرض أول Reaction إن وجدت
    const firstReactionEmoji =
      Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";

    const uiReaction = REACTIONS.includes(firstReactionEmoji as any)
      ? (firstReactionEmoji as Reaction)
      : undefined;

    // ✅ جهّز sender UI مرة واحدة
    const senderUI: UserUI = {
      id: String(senderId || "unknown"),
      name:
        String(senderObj?.username || "").trim() ||
        String(senderObj?.name || "").trim() ||
        String(senderObj?.fullName || "").trim() ||
        String(resolveUserNameById(senderId) || "").trim() ||
        (senderId && senderId === myUserId ? myName : "") ||
        "User",
      avatar:
        String(senderObj?.avatar || "").trim() ||
        String(resolveAvatarById(senderId) || "").trim() ||
        (senderId === myUserId ? myAvatar : ""),
      role: usersMap.get(senderId)?.role
    };

    // ✅ نص الرسالة النهائي:
    // - System => systemText
    // - Gift   => content = giftKey مثل "boost_rocket"
    // - غير ذلك => content الطبيعي
    const messageText = isSystem ? systemText : String(m?.content || "");

    const out: MessageUI = {
      id: String(m?._id),
      type: uiType,
      systemType: isSystem ? (backendType as any) : undefined,

      text: messageText,
      uri: m?.media?.url,

      // ✅ إعلان announcement نُظهر فيه المرسل
      // ✅ باقي system نخفي المرسل
      // ✅ gift رسالة عادية => نُظهر المرسل
      sender: backendType === "announcement" ? senderUI : isSystem ? undefined : senderUI,

      replyTo: uiReplyTo,
      reaction: uiReaction,
      deletedForEveryone: Boolean(m?.deletedForEveryone),
      time
    };

    // ✅ طباعات للخروج (مختصرة)
    log("OUT", {
      id: out.id,
      uiType: out.type,
      systemType: out.systemType,
      text: out.text,
      sender: out.sender?.name,
      hasReplyTo: Boolean(out.replyTo),
      reaction: out.reaction,
      deletedForEveryone: out.deletedForEveryone
    });

    return out;
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
  // ✅ ابحث عن أحدث رسالة gift لم يتم التعامل معها بعد
  const latestGift = [...uiMessages].find(
    (m) => m.type === "gift" && !giftDoneById[m.id] && !m.deletedForEveryone
  );

  if (!latestGift) return;

  // ✅ لو Overlay شغال بالفعل لنفس الرسالة لا تعيد التشغيل
  if (giftOverlay.visible && giftOverlay.messageId === latestGift.id) return;

  // ✅ جهّز Fullscreen
  const giftKey = String(latestGift.text || "");
  if (!giftKey) {
    // حتى لو giftKey ناقص، اعتبرها "تمت" حتى لا تتكرر
    markGiftDone(latestGift.id);
    return;
  }

  // افتح Overlay
  setGiftOverlay({ visible: true, messageId: latestGift.id, giftKey });

  // اقفل أي تايمر سابق
  if (giftOverlayTimerRef.current) clearTimeout(giftOverlayTimerRef.current);

  // ✅ بعد 5 ثواني: أخفِ الـ overlay وعلّم الرسالة كـ done
  giftOverlayTimerRef.current = setTimeout(() => {
    setGiftOverlay({ visible: false, messageId: null, giftKey: null });
    markGiftDone(latestGift.id);
  }, 6000);

  return () => {
    // cleanup عند أي re-render
  };
  // ملاحظة: نراقب uiMessages و giftDoneById
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

  const sendImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });

    if (!res.canceled) {
      await dispatch(
        sendRoomMessage({
          roomId,
          content: "📷 Image",
          type: "image",
          media: { url: res.assets[0].uri }
        })
      ).unwrap();

      scrollToBottom();
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

  const sendVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1
    });

    if (!res.canceled) {
      await dispatch(
        sendRoomMessage({
          roomId,
          content: "🎬 Video",
          type: "video",
          media: { url: res.assets[0].uri }
        })
      ).unwrap();

      scrollToBottom();
    }
  };

  /* ================= RECORDING ================= */

  const startRecording = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingId(null);
      }

      if (recording) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const result = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      const newRecording = result.recording;

      setRecording(newRecording);
      setIsRecordingPaused(false);
      setRecordDuration(0);

      recordTimer.current = setInterval(() => setRecordDuration((prev) => prev + 1), 1000);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Record failed");
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    await recording.pauseAsync();
    setIsRecordingPaused(true);
  };

  const resumeRecording = async () => {
    if (!recording) return;
    await recording.startAsync();
    setIsRecordingPaused(false);
  };

  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }

    setRecording(null);
    setIsRecordingPaused(false);
    setRecordDuration(0);

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    if (uri) {
      await dispatch(
        sendRoomMessage({
          roomId,
          content: "🎤 Voice message",
          type: "audio",
          media: { url: uri }
        })
      ).unwrap();

      scrollToBottom();
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
        content: "boost_rocket",
        gift: { name: "boost", value: level, animation: "rocket" }
      } as any)
    ).unwrap();

    const content = `🚀 <b>${myName}</b> boosted the room!`;
    await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();

  } catch (e: any) {
    Alert.alert("Error", e?.message || String(e) || "Boost failed");
  }
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

            <Image
              source={{
                uri: roomAvatar || "https://i.pravatar.cc/150?img=12"
              }}
              style={styles.avatar}
            />

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
        {recording && (
          <View style={styles.recordInfo}>
            <Text style={{ color: "#EF4444" }}>
              ● Recording {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, "0")}
            </Text>

            <TouchableOpacity onPress={isRecordingPaused ? resumeRecording : pauseRecording}>
              <Ionicons name={isRecordingPaused ? "play" : "pause"} size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= INPUT ================= */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={sendImage}>
            <Ionicons name="image-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendPDF}>
            <Ionicons name="document-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendVideo}>
            <Ionicons name="videocam-outline" size={24} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={setText}
            multiline
          />

          {text ? (
            <TouchableOpacity onPress={sendText}>
              <Ionicons name="send" size={22} color={COLORS.me} />
            </TouchableOpacity>
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
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
<Modal
  transparent
  visible={giftOverlay.visible}
  animationType="fade"
  onRequestClose={() => {
    // اختياري: لا تسمح بالإغلاق اليدوي أو اسمح
    // هنا سنسمح بالإغلاق اليدوي مع إنهاء المؤقت
    if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
    if (giftOverlayTimerRef.current) clearTimeout(giftOverlayTimerRef.current);
    setGiftOverlay({ visible: false, messageId: null, giftKey: null });
  }}
>
  <View style={styles.giftFullOverlay}>
    {(() => {
      const src = getGiftLottieSource(giftOverlay.giftKey || "");
      if (!src) return null;

      return (
        <LottieView
          source={src}
          autoPlay
          loop
          style={styles.giftFullLottie}
        />
      );
    })()}
  </View>
</Modal>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6
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