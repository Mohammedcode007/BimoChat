import { Ionicons } from "@expo/vector-icons";
import { Audio, ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    fetchRoomMessages,
    leaveRoomAndExit,
    selectRoomLoadingMessages,
    selectRoomMessages,
    sendRoomMessage
} from "@/redux/slices/room.slice";

// ✅ Socket helpers
import {
    deleteRoomSocketMessage,
    joinRoomSocket,
    leaveRoomSocket,
    toggleRoomReaction as toggleRoomReactionSocket
} from "@/services/socket";

/* ================= TYPES ================= */

type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";

type User = {
  id: string;
  name: string;
  avatar: string;
};

type Message = {
  id: string;
  type: "text" | "image" | "file" | "audio" | "video" | "system";
  systemType?: "join" | "leave" | "announcement" | "promotion" | "ban"; // اختياري

  text?: string;
  uri?: string;

  sender?: User;        // ✅ قد تكون undefined في رسائل النظام
  time: string;

  replyTo?: Message;
  reaction?: Reaction;

  deletedForEveryone?: boolean; // ✅ مهم
};
/* ================= CONSTANTS ================= */

const COLORS = {
  me: "#6D5DF6",
  other: "#F2F2F2",
  bg: "#FFFFFF",
  time: "#9CA3AF"
};

const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

/* ================= CURRENT USER ================= */


/* ================= COMPONENT ================= */

export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id || "");

  const flatListRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
const authUser = useAppSelector((state) => state.auth.user);
const myUserId = String(authUser?._id || authUser?.id || ""); // ✅ حسب شكل user عندك
const myName = String(authUser?.username || authUser?.name || "Me");
const myAvatar = String(authUser?.avatar || "https://i.pravatar.cc/150?img=32");
const currentUser: User = {
  id: myUserId,
  name: myName,
  avatar: myAvatar
};
  /**
   * ✅ تعديل مهم ليناسب الكود الجديد:
   * selectRoomMessages و selectRoomUsers أصبحت memoized selectors بـ createSelector
   * وبالتالي نستخدمها بالشكل التالي:
   * useAppSelector((state) => selectRoomMessages(state, roomId))
   */
  const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
  const loadingMessages = useAppSelector(selectRoomLoadingMessages);

  // UI states
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimer = useRef<number | null>(null);

  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [activeAudio, setActiveAudio] = useState<Message | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /* =====================================================
     HELPERS
  ===================================================== */

  const scrollToBottom = () => {
    // قائمة inverted -> الأسفل = index 0
    flatListRef.current?.scrollToPosition?.(0, 0, true);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

const mapReduxToUIMessage = (m: any): Message => {
  const backendType = String(m.type || "text");

  // =====================================================
  // استخراج المرسل (إن وجد)
  // =====================================================

  const senderObj =
    typeof m.sender === "object" && m.sender
      ? m.sender
      : m.sender
      ? { _id: String(m.sender), username: "User", avatar: undefined }
      : null;

  // =====================================================
  // تحديد هل الرسالة system
  // =====================================================

  const isSystem =
    backendType === "system" ||
    backendType === "announcement" ||
    backendType === "join" ||
    backendType === "leave" ||
    backendType === "promotion" ||
    backendType === "ban";

  // =====================================================
  // اسم المستخدم في رسائل السيستم
  // =====================================================

  let systemUserName = "";

  // 1) لو فيه sender object
  if (senderObj?.username) {
    systemUserName = senderObj.username;
  }

  // 2) لو فيه mentions (مثلاً join/leave)
  if (!systemUserName && Array.isArray(m.mentions) && m.mentions.length > 0) {
    const mentioned = m.mentions[0];

    if (typeof mentioned === "object") {
      systemUserName = mentioned.username || "User";
    } else {
      systemUserName = "User";
    }
  }

  if (!systemUserName) systemUserName = "User";

  // =====================================================
  // نص رسائل السيستم
  // =====================================================

  let systemText = String(m.content || "");

  if (backendType === "join") {
    systemText = `✅ ${systemUserName} joined the room`;
  } else if (backendType === "leave") {
    systemText = `🚪 ${systemUserName} left the room`;
  } else if (backendType === "promotion") {
    systemText = `⭐ ${systemUserName} was promoted`;
  } else if (backendType === "ban") {
    systemText = `⛔ ${systemUserName} was banned`;
  } else if (backendType === "announcement") {
    systemText = `📢 ${m.content || ""}`;
  }

  // =====================================================
  // Reply
  // =====================================================

  const uiReplyTo: Message | undefined =
    m.replyTo && typeof m.replyTo === "object"
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

  // =====================================================
  // تحويل نوع الرسالة
  // =====================================================

  let uiType: Message["type"] = "text";
  if (isSystem) uiType = "system";
  else if (backendType === "image") uiType = "image";
  else if (backendType === "video") uiType = "video";
  else if (backendType === "audio") uiType = "audio";
  else if (backendType === "file") uiType = "file";
  else uiType = "text";

  // =====================================================
  // الوقت
  // =====================================================

  const time = new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    id: String(m._id),
    type: uiType,

    systemType: isSystem ? (backendType as any) : undefined,

    text: isSystem ? systemText : String(m.content || ""),
    uri: m.media?.url,

    sender: isSystem
      ? undefined
      : {
          id: String(senderObj?._id || "unknown"),
          name: String(senderObj?.username || "User"),
          avatar: String(senderObj?.avatar || "")
        },

    replyTo: uiReplyTo,
    reaction: undefined,

    deletedForEveryone: Boolean(m.deletedForEveryone),

    time
  };
};
  const uiMessages: Message[] = useMemo(() => {
    if (!reduxMessages) return [];
    return reduxMessages.map(mapReduxToUIMessage);
  }, [reduxMessages]);

  /* =====================================================
     FETCH + SOCKET JOIN/LEAVE
  ===================================================== */

  useEffect(() => {
    if (!roomId) return;

    dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false }));
    joinRoomSocket(roomId);

    return () => {
      leaveRoomSocket(roomId);
    };
  }, [roomId, dispatch]);

  /* =====================================================
     AUDIO PLAY
  ===================================================== */

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
    setActiveAudio({ id, uri } as Message);

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

  const seekBy = async (offset: number) => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    let newPos = status.positionMillis + offset;
    newPos = Math.max(0, Math.min(newPos, status.durationMillis || 0));
    await sound.setPositionAsync(newPos);
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
      duration: 120,
      useNativeDriver: false
    }).start();
  }, [playbackProgress, playbackDuration, progressAnim]);

  /* =====================================================
     SEND TEXT (REAL)
  ===================================================== */

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
      console.log("Send failed:", e?.message || e);
    }
  };

  /* =====================================================
     MEDIA (UI فقط - حاليا محلي)
  ===================================================== */

const sendImage = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8
  });

  if (!res.canceled) {
    await dispatch(
      sendRoomMessage({
        roomId,
        content: "📷 Image selected",
        type: "image",
        media: { url: res.assets[0].uri }
      })
    ).unwrap();

    scrollToBottom();
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
          media: { url: res.assets[0].uri, fileName: res.assets[0].name, mimeType: "application/pdf" }
        })
      );
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
          content: "🎬 Video selected",
          type: "video",
          media: { url: res.assets[0].uri }
        })
      );
      scrollToBottom();
    }
  };

  /* =====================================================
     RECORDING
  ===================================================== */

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

      recordTimer.current = setInterval(() => setRecordDuration((prev) => prev + 1), 1000) as any;
    } catch (e) {
      console.log("Recording error:", e);
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

    if (recordTimer.current !== null) {
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
      );
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

  /* =====================================================
     ACTIONS: REACTION / REPLY / DELETE
  ===================================================== */

  const addReaction = (messageId: string, emoji: Reaction) => {
    toggleRoomReactionSocket({ roomId, messageId, emoji });
    setShowActions(false);
  };

  const deleteMessage = (messageId: string) => {
    deleteRoomSocketMessage({ roomId, messageId });
    setShowActions(false);
  };

  /* =====================================================
     LEAVE ROOM
  ===================================================== */

  const onLeaveRoom = async () => {
    if (!roomId) return;

    try {
      leaveRoomSocket(roomId);
      await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
    } catch (e) {
      console.log("Leave failed:", e);
    } finally {
      router.back();
    }
  };

  /* ================= RENDER ================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onLeaveRoom}>
              <Ionicons name="arrow-back" size={22} />
            </TouchableOpacity>

            <Image source={{ uri: "https://i.pravatar.cc/150?img=12" }} style={styles.avatar} />

            <View>
              <Text style={styles.name}>React Native Room</Text>
              <Text style={styles.online}>
                {loadingMessages ? "Loading..." : `${uiMessages.length} Messages`}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Ionicons name="call-outline" size={22} />
            <Ionicons name="videocam-outline" size={22} />
            <Ionicons name="ellipsis-vertical" size={20} />
          </View>
        </View>

        {activeAudio && (
          <View style={styles.globalAudioPlayer}>
            <View style={styles.audioIcon}>
              <Ionicons name="musical-notes" size={18} color="#FFF" />
            </View>

            <View style={styles.audioCenter}>
              <View style={styles.audioControls}>
                <TouchableOpacity onPress={() => seekBy(-10000)}>
                  <Ionicons name="play-back" size={22} color="#374151" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() => togglePlay(activeAudio.uri!, activeAudio.id)}
                >
                  <Ionicons name={playingId ? "pause" : "play"} size={26} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => seekBy(10000)}>
                  <Ionicons name="play-forward" size={22} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.timeText}>{formatTime(playbackProgress)}</Text>

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

                <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setActiveAudio(null)}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* ================= CHAT ================= */}
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={uiMessages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => {
            
  // ✅ رسائل system: وسط + شكل مختلف
if (item.type === "system") {
  const label =
    item.systemType === "join"
      ? "✅ انضم"
      : item.systemType === "leave"
      ? "🚪 خرج"
      : item.systemType === "ban"
      ? "⛔ حظر"
      : item.systemType === "promotion"
      ? "⭐ ترقية"
      : item.systemType === "announcement"
      ? "📢 إعلان"
      : "ℹ️ نظام";

  return (
    <View style={styles.systemWrap}>
      <View style={styles.systemBubble}>
        <Text style={styles.systemLabel}>{label}</Text>
        <Text style={styles.systemText}>{item.text}</Text>
        <Text style={styles.systemTime}>{item.time}</Text>
      </View>
    </View>
  );
}

  // ✅ رسائل عادية
const isMe = Boolean(myUserId) && item.sender?.id === myUserId;
  const previousMessage = uiMessages[index + 1];
  const showName =
    !previousMessage ||
    previousMessage.type === "system" ||
    previousMessage.sender?.id !== item.sender?.id;

  return (
    <View style={{ marginBottom: 12 }}>
{showName && item.type !== "system" && (
  <Text style={[styles.outsideName, { alignSelf: isMe ? "flex-end" : "flex-start" }]}>
    {isMe ? currentUser.name : item.sender.name}
  </Text>
)}
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          setSelectedMessage(item);
          setShowActions(true);
        }}
        style={[styles.bubble, isMe ? styles.me : styles.other]}
      >
        <>
          {/* ✅ لو الرسالة محذوفة للجميع */}
          {item.deletedForEveryone ? (
            <Text style={[styles.text, { opacity: 0.6 }, isMe && { color: "#FFF" }]}>
              🚫 This message was deleted
            </Text>
          ) : (
            <>
              {item.replyTo && (
                <View style={styles.replyBox}>
                  <Text style={styles.replyName}>
                    {item.replyTo.sender?.id === currentUser.id ? "You" : item.replyTo.sender?.name || "User"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.replyText, { color: isMe ? "#fff" : "#111827" }]}
                  >
                    {item.replyTo.text || "Media message"}
                  </Text>
                </View>
              )}

              {item.type === "text" && (
                <Text style={[styles.text, isMe && { color: "#FFF" }]}>{item.text}</Text>
              )}

              {item.type === "video" && item.uri && (
                <View style={styles.videoWrapper}>
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.video}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                  />
                </View>
              )}

              {item.type === "image" && item.uri && (
                <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImage(item.uri!)}>
                  <Image source={{ uri: item.uri }} style={styles.media} />
                </TouchableOpacity>
              )}

              {item.type === "file" && (
                <View style={styles.pdfRow}>
                  <Ionicons name="document-text-outline" size={22} color={isMe ? "#fff" : "#111827"} />
                  <Text
                    numberOfLines={1}
                    style={{ color: isMe ? "#fff" : "#111827", maxWidth: 220 }}
                  >
                    {item.text || "File"}
                  </Text>
                </View>
              )}

              {item.type === "audio" && item.uri && (
                <TouchableOpacity
                  style={styles.audioRow}
                  activeOpacity={0.8}
                  onPress={() => togglePlay(item.uri!, item.id)}
                >
                  <Ionicons
                    name={playingId === item.id ? "pause" : "play"}
                    size={22}
                    color={isMe ? "#FFF" : "#000"}
                  />

                  <View style={styles.audioProgressWrapper}>
                    <View style={styles.audioProgressBg}>
                      <Animated.View
                        style={[
                          styles.audioProgressFill,
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

                    <Text style={[styles.audioLabel, { color: isMe ? "#FFF" : "#000" }]}>
                      Voice message
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}

          {item.reaction && (
            <View style={styles.reaction}>
              <Text>{item.reaction}</Text>
            </View>
          )}

          <Text style={[styles.time, { color: isMe ? "#E5E7EB" : COLORS.time }]}>
            {item.time}
          </Text>
        </>
      </TouchableOpacity>
    </View>
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
        <TouchableOpacity onPress={() => sendImage()}>
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
        <Modal transparent visible={showActions} animationType="fade">
          <View style={styles.actionsOverlay}>
            <View style={styles.actionsBox}>
              <View style={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => selectedMessage && addReaction(selectedMessage.id, r)}
                  >
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

              {selectedMessage?.sender?.id === currentUser.id && (
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

            <Image source={{ uri: previewImage! }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB"
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerRight: { flexDirection: "row", gap: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  name: { fontSize: 16, fontWeight: "600" },
  online: { fontSize: 12, color: "#22C55E" },

  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },
  me: { alignSelf: "flex-end", backgroundColor: COLORS.me },
  other: { alignSelf: "flex-start", backgroundColor: COLORS.other },

  text: { fontSize: 15 },
  time: { fontSize: 11, marginTop: 4 },

  media: { width: 180, height: 180, borderRadius: 12 },

  pdfRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: "#E5E7EB"
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120
  },
systemWrap: {
  width: "100%",
  alignItems: "center",
  marginBottom: 10
},


  replyBox: {
    borderLeftWidth: 3,
    borderColor: "#A5B4FC",
    paddingLeft: 8,
    marginBottom: 6
  },
  replyName: { fontSize: 12, fontWeight: "600" },
  replyText: { fontSize: 12 },

  outsideName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    marginHorizontal: 6,
    color: "#6D5DF6"
  },

systemBubble: {
  maxWidth: "85%",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 14,
  backgroundColor: "#F3F4F6",
  borderWidth: 1,
  borderColor: "#E5E7EB"
},
systemLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: "#6B7280",
  marginBottom: 2,
  textAlign: "center"
},
systemText: {
  fontSize: 13,
  color: "#111827",
  textAlign: "center"
},
systemTime: {
  fontSize: 11,
  color: "#9CA3AF",
  textAlign: "center",
  marginTop: 4
},
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  audioProgressWrapper: { flex: 1 },
  audioProgressBg: {
    height: 3,
    width: "100%",
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 6
  },
  audioProgressFill: { height: "100%", borderRadius: 2 },
  audioLabel: { fontSize: 12, opacity: 0.9 },

  reaction: {
    position: "absolute",
    bottom: -8,
    right: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 6
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
    paddingVertical: 6
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
  action: { fontSize: 16, paddingVertical: 10 },
  cancel: { textAlign: "center", marginTop: 8, color: "#6B7280" },

  videoWrapper: {
    width: 220,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000"
  },
  video: { width: "100%", height: "100%" },

  globalAudioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
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
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 6
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6D5DF6",
    alignItems: "center",
    justifyContent: "center"
  },
  progressSection: { flexDirection: "row", alignItems: "center", gap: 8 },
  globalProgressBg: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden"
  },
  globalProgressFill: { height: "100%", backgroundColor: "#6D5DF6" },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
    width: 40,
    textAlign: "center"
  },

  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center"
  },
  fullImage: { width: "100%", height: "100%" },
  imagePreviewClose: { position: "absolute", top: 50, right: 20, zIndex: 10 }
});