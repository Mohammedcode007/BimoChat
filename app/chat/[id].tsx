
// ChatScreen.tsx
// ✅ تطبيق Dark Mode فقط (بدون أي تغييرات أخرى في المنطق/التصميم)
// ✅ عند الضغط على الصورة تفتح بحجم كامل (Modal)

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  addMessage,
  clearChatMessages,
  loadMessages,
  MessageItem
} from "@/redux/slices/messageSlice";

import { setActiveChat } from "@/redux/slices/chatSlice";

import { AppDispatch, RootState } from "@/redux/store";
import {
  emitMarkAsSeen,
  emitTyping,
  joinChatRoom,
  leaveChatRoom,
  sendSocketMessage
} from "@/services/socket";

import {
  selectChatById,
  selectCurrentUser,
  selectMessagesByChatId,
  selectOtherUser,
  selectTypingUsersByChatId
} from "@/redux/selectors";
import * as DocumentPicker from "expo-document-picker";

import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";
import { uploadToCloudinary } from "@/services/upload.service";
import { formatLastSeen, formatTime } from "@/utils/helpFunctions";
import { Audio, ResizeMode, Video } from "expo-av";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";

/* ===================================================== */

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<any>(null);
  const typingTimeout = useRef<any>(null);

  const currentUser = useSelector(selectCurrentUser);

  const chat = useSelector(
    useMemo(() => selectChatById(chatId), [chatId])
  );

  const messages = useSelector(
    useMemo(() => selectMessagesByChatId(chatId), [chatId])
  );

  const loading = useSelector(
    (state: RootState) => state.message.loading
  );

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

  const [text, setText] = useState("");

  // ✅ Fullscreen image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
useEffect(() => {
  console.log("======== CHAT DEBUG START ========");
  console.log("chatId:", chatId);
  console.log("currentUser:", currentUser);
  console.log("chat object:", chat);
  console.log("chat participants:", chat?.participants);
  console.log("otherUser selector result:", otherUser);
  console.log("messages count:", messages?.length);
  console.log("==================================");
}, [chatId, currentUser, chat, otherUser, messages]);
  /* ================= INITIAL LOAD ================= */

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } =
        await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) { }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) return;

      // ✅ فقط عرض المعاينة
      setRecordedUri(uri);
    } catch (err) { }
  };

useEffect(() => {
  if (!chatId) return;
  if (!currentUser?._id) return;

  dispatch(setActiveChat(chatId));
  joinChatRoom(chatId);

  dispatch(loadMessages({ chatId, page: 1 }))
    .unwrap()
    .then((res) => {
      const hasIncoming = res.messages.some(
        (m: any) => m.sender !== currentUser._id
      );

      if (hasIncoming) emitMarkAsSeen(chatId);
    })
    .catch(() => {});

  return () => {
    leaveChatRoom(chatId);
    dispatch(setActiveChat(undefined));
    dispatch(clearChatMessages(chatId));
  };
}, [chatId, currentUser?._id, dispatch]);

  // useEffect(() => {
  //   if (!chatId) return;
  //   if (!currentUser?._id) return;

  //   dispatch(setActiveChat(chatId));

  //   return () => {
  //     dispatch(setActiveChat(undefined));
  //   };
  // }, [chatId]);

  const loadMore = () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;

    dispatch(loadMessages({ chatId, page: nextPage }))
      .unwrap()
      .then((res) => {
        if (res.messages.length < 20) {
          setHasMore(false);
        }
        setPage(nextPage);
      })
      .catch(() => { });
  };

  /* ================= SEND MESSAGE ================= */

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
      reactions: [],
      deliveryStatus: {
        deliveredTo: [],
        seenBy: []
      },
      createdAt: new Date().toISOString(),
      optimistic: true
    };

    dispatch(addMessage(optimistic));

    sendSocketMessage(chatId, text, "text", tempId);

    setText("");
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;

        const tempId = `temp-${Date.now()}`;

        // 1️⃣ Optimistic
        dispatch(addMessage({
          _id: tempId,
          clientTempId: tempId,
          chat: chatId,
          sender: currentUser!._id,
          type: "image",
          content: "",
          media: { url: uri },
          reactions: [],
          deliveryStatus: {
            deliveredTo: [],
            seenBy: []
          },
          createdAt: new Date().toISOString(),
          optimistic: true
        }));

        // 2️⃣ رفع إلى Cloudinary
        const url = await uploadToCloudinary(uri, "image");

        // 3️⃣ إرسال عبر Socket
        sendSocketMessage(chatId, url, "image", tempId);
      }
    } catch (error) { }
  };

  const sendMediaMessage = async (
    uri: string,
    type: "image" | "video" | "audio"
  ) => {
    if (!currentUser?._id) return;

    const tempId = `temp-${Date.now()}`;

    dispatch(addMessage({
      _id: tempId,
      clientTempId: tempId,
      chat: chatId,
      sender: currentUser._id,
      type,
      content: "",
      media: { url: uri },
      reactions: [],
      deliveryStatus: {
        deliveredTo: [],
        seenBy: []
      },
      createdAt: new Date().toISOString(),
      optimistic: true
    }));

    try {
      const cloudType =
        type === "image"
          ? "image"
          : type === "video"
            ? "video"
            : "raw";

      const url = await uploadToCloudinary(uri, cloudType);

      sendSocketMessage(chatId, url, type, tempId);
    } catch (err) { }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      sendMediaMessage(uri, "video");
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        sendMediaMessage(asset.uri, "audio");
      }
    } catch (error) { }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") { }
    };

    requestPermissions();
  }, []);

  /* ================= RENDER MESSAGE ================= */

  const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {
    const isMe = item.sender === currentUser?._id;
    const isMedia =
      item.type === "image" || item.type === "video";

    if (item.deletedForEveryone) {
      return (
        <View style={styles.deletedBubble}>
          <Text style={[styles.deletedText, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
            This message was deleted
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.rowMe : styles.rowOther
        ]}
      >
        <View
          style={[
            styles.bubble,
            !isMedia && (isMe ? styles.me : styles.other),
            isDark && !isMedia && !isMe ? styles.otherDark : null,
          ]}
        >
          {/* IMAGE */}
          {item.type === "image" && item.content ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImagePreview(item.content)}
            >
              <Image
                source={{ uri: item.content }}
                style={{ width: 220, height: 220, borderRadius: 14 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )

            /* VIDEO */
            : item.type === "video" && item.content ? (
              <Video
                source={{ uri: item.content }}
                style={{ width: 240, height: 240, borderRadius: 14 }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
              />
            )

              /* AUDIO */
              : item.type === "audio" && item.content ? (
                <VoiceMessagePlayer
                  uri={item.content}
                  isMe={isMe}
                />
              )

                /* TEXT */
                : (
                  <Text style={isMe ? styles.meText : [styles.otherText, { color: isDark ? "#E5E7EB" : "#111827" }]}>
                    {item.content}
                  </Text>
                )}
        </View>

        {/* Time outside bubble */}
        <View style={[styles.timeWrapper, isMe ? styles.timeRight : styles.timeLeft]}>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeMe : styles.timeOther,
              { color: isDark ? "#9CA3AF" : undefined }
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>

          {isMe && (
            <View style={styles.statusIcon}>
              {item.deliveryStatus?.seenBy?.length ? (
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
              ) : item.deliveryStatus?.deliveredTo?.length ? (
                <Ionicons name="checkmark-done" size={14} color={isDark ? "#9CA3AF" : "#E5E7EB"} />
              ) : (
                <Ionicons name="checkmark" size={14} color={isDark ? "#9CA3AF" : "#E5E7EB"} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  /* ================= BLOCKED ================= */

  if (chat?.isBlocked) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: isDark ? "#0B1220" : "white" }]}>
        <Text style={{ color: isDark ? "#E5E7EB" : "#111827" }}>
          This conversation is blocked
        </Text>
      </SafeAreaView>
    );
  }

  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0B1220" : "white" }]}>
        {/* HEADER */}
        <View style={[
          styles.header,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFF",
            borderColor: isDark ? "#111827" : "#E5E7EB",
          }
        ]}>

          {/* LEFT SECTION */}
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
            </TouchableOpacity>

            {otherUser?.avatar ? (
              <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={[styles.username, { color: isDark ? "#E5E7EB" : "#111827" }]}>
                {otherUser?.username || "User"}
              </Text>

              {!!typingUsers.length ? (
                <Text style={[styles.typing, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
                  Typing...
                </Text>
              ) : otherUser?.isOnline ? (
                <Text style={styles.onlineText}>Online</Text>
              ) : otherUser?.lastSeen ? (
                <Text style={[styles.lastSeen, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
                  Last seen {formatLastSeen(otherUser.lastSeen)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* RIGHT SECTION */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="call-outline" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="videocam-outline" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color={isDark ? "#E5E7EB" : "#111827"} />
            </TouchableOpacity>
          </View>
        </View>

        {recordedUri && (
          <VoiceRecorderPreview
            uri={recordedUri}
            onCancel={() => setRecordedUri(null)}
            onSend={async () => {
              const url = await uploadToCloudinary(recordedUri, "raw");

              const tempId = `temp-${Date.now()}`;

              dispatch(addMessage({
                _id: tempId,
                clientTempId: tempId,
                chat: chatId,
                sender: currentUser!._id,
                type: "audio",
                content: url,
                createdAt: new Date().toISOString(),
                reactions: [],
                deliveryStatus: { deliveredTo: [], seenBy: [] }
              }));

              sendSocketMessage(chatId, url, "audio", tempId);
              setRecordedUri(null);
            }}
          />
        )}

        {/* CHAT LIST */}
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={messages}
          inverted
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loading && hasMore ? (
              <View style={styles.paginationLoader}>
                <ActivityIndicator size="small" color="#6D5DF6" />
              </View>
            ) : null
          }
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT BAR */}
        <View style={[
          styles.inputBar,
          {
            backgroundColor: isDark ? "#0F172A" : "#FFF",
            borderColor: isDark ? "#111827" : "#E5E7EB",
          }
        ]}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickVideo}>
            <Ionicons name="videocam-outline" size={22} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={22} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#111827" : "#F3F4F6",
                color: isDark ? "#E5E7EB" : "#111827",
              }
            ]}
            placeholder="Type a message"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={text}
            onChangeText={(v) => {
              setText(v);

              emitTyping(chatId, true);

              clearTimeout(typingTimeout.current);

              typingTimeout.current = setTimeout(() => {
                emitTyping(chatId, false);
              }, 1500);
            }}
            multiline
          />

          {text.trim() ? (
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micBtn}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={22}
                color={isRecording ? "red" : (isDark ? "#9CA3AF" : "#6B7280")}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ✅ Fullscreen Image Modal */}
        <Modal
          visible={!!imagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setImagePreview(null)}
        >
          <View style={styles.previewOverlay}>
            <Pressable style={styles.previewCloseArea} onPress={() => setImagePreview(null)} />
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={() => setImagePreview(null)} style={styles.previewCloseBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewBody}>
              {!!imagePreview && (
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ===================================================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    marginRight: 8,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6D5DF6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  userInfo: {
    justifyContent: "center",
  },

  paginationLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },

  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  onlineText: {
    fontSize: 12,
    color: "#22C55E",
    marginTop: 2,
  },

  lastSeen: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  typing: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },

  iconBtn: {
    paddingHorizontal: 6,
  },

  messageRow: { marginVertical: 6 },
  me: { backgroundColor: "#80c080", borderBottomRightRadius: 4 },
  other: { backgroundColor: "#f5f5f5", borderBottomLeftRadius: 4 },

  // ✅ Dark alternative for other bubble only (text already handled)
  otherDark: { backgroundColor: "#111827" },

  meText: { color: "#FFF" },
  otherText: { color: "#111827" },

  reactionRow: { flexDirection: "row", marginTop: 6 },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6
  },

  sendBtn: {
    backgroundColor: "#6D5DF6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  micBtn: {
    padding: 6,
  },

  timeMe: { color: "#83858a" },
  timeOther: { color: "#6B7280" },
  statusIcon: { marginLeft: 2 },

  inputBar: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF"
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10
  },

  deletedBubble: { alignSelf: "center", marginVertical: 8 },
  deletedText: { fontStyle: "italic", color: "#6B7280" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  messageContainer: {
    marginVertical: 4,
  },

  bubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  timeRight: {
    justifyContent: "flex-end",
  },

  timeLeft: {
    justifyContent: "flex-start",
  },

  timeText: {
    fontSize: 10,
  },

  rowMe: {
    alignItems: "flex-end",
  },

  rowOther: {
    alignItems: "flex-start",
  },

  /* ===== Fullscreen Image Preview ===== */
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  previewCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  previewHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  previewCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  previewBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
});