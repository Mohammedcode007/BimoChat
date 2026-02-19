// // ChatScreen.tsx

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   ListRenderItem,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";

// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useLocalSearchParams } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";

// import {
//   addMessage,
//   clearChatMessages,
//   MessageItem,
//   setMessages,
//   updateReaction
// } from "@/redux/slices/messageSlice";

// import {
//   markChatSeenLocally,
//   setActiveChat
// } from "@/redux/slices/chatSlice";

// import { AppDispatch, RootState } from "@/redux/store";
// import {
//   emitMarkAsSeen,
//   emitTyping,
//   joinChatRoom,
//   sendSocketMessage
// } from "@/services/socket";

// import api from "@/services/api";
// import { formatLastSeen, formatTime } from "@/utils/helpFunctions";

// /* ===================================================== */

// export default function ChatScreen() {

//   const { id } = useLocalSearchParams<{ id: string }>();
//   const chatId = id as string;

//   const dispatch = useDispatch<AppDispatch>();
//   const flatListRef = useRef<FlatList<MessageItem>>(null);
//   const typingTimeout = useRef<any>(null);

//   const currentUser = useSelector(
//     (state: RootState) => state.auth.user
//   );

//   const chat = useSelector(
//     (state: RootState) =>
//       state.chat.chats.find(c => c._id === chatId)
//   );

//   const messages = useSelector(
//     (state: RootState) =>
//       state.message.messages[chatId] || []
//   );

//   const typingUsers = useSelector(
//     (state: RootState) =>
//       (state.chat.typingUsers[chatId] || [])
//         .filter(id => id !== currentUser?._id)
//   );

//   const [text, setText] = useState("");

//   /* ================= OTHER USER ================= */

//   const otherUser = useMemo(() => {
//     if (!chat || !currentUser) return null;

//     return chat.participants.find(
//       (p: any) => p._id !== currentUser._id
//     );
//   }, [chat, currentUser]);

//   /* ================= INITIAL LOAD ================= */

//   useEffect(() => {

//     if (!chatId) return;

//     dispatch(setActiveChat(chatId));
//     dispatch(markChatSeenLocally(chatId));
//     joinChatRoom(chatId);

//     const loadMessages = async () => {

//       const res = await api.get(`/messages/${chatId}`);

//       dispatch(setMessages({
//         chatId,
//         messages: res.data
//       }));

//       emitMarkAsSeen(chatId);
//     };

//     loadMessages();

//     return () => {
//       dispatch(setActiveChat(undefined));
//       dispatch(clearChatMessages(chatId));
//       clearTimeout(typingTimeout.current);

//     };

//   }, [chatId]);

//   /* ================= AUTO SCROLL ================= */

//   useEffect(() => {
//     if (messages.length > 0) {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }
//   }, [messages.length]);

//   /* ================= SEND MESSAGE ================= */

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
//       reactions: [],
//       deliveryStatus: {
//         deliveredTo: [],
//         seenBy: []
//       },
//       createdAt: new Date().toISOString(),
//       optimistic: true
//     };

//     dispatch(addMessage(optimistic));

//     sendSocketMessage(
//       chatId,
//       text,
//       "text",
//       tempId   // 🔥 هنا
//     );

//     setText("");
//   };

//   /* ================= ADD REACTION ================= */

//   const toggleReaction = (message: MessageItem, emoji: string) => {

//     const updated = message.reactions || [];

//     dispatch(updateReaction({
//       messageId: message._id,
//       reactions: updated
//     }));
//   };

//   /* ================= RENDER MESSAGE ================= */

//   const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {

//     const isMe = item.sender === currentUser?._id;

//     if (item.deletedForEveryone) {
//       return (
//         <View style={styles.deletedBubble}>
//           <Text style={styles.deletedText}>
//             This message was deleted
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <View style={[
//         styles.messageRow,
//         isMe ? styles.rowMe : styles.rowOther
//       ]}>

//         <TouchableOpacity
//           activeOpacity={0.9}
//           onLongPress={() => toggleReaction(item, "❤️")}
//         >

//           <View style={[
//             styles.bubble,
//             isMe ? styles.me : styles.other
//           ]}>

//             <Text style={isMe ? styles.meText : styles.otherText}>
//               {item.content}
//             </Text>

//             <View style={styles.timeRow}>

//               <Text style={[
//                 styles.timeText,
//                 isMe ? styles.timeMe : styles.timeOther
//               ]}>
//                 {formatTime(item.createdAt)}
//               </Text>

//               {isMe && (
//                 <View style={styles.statusIcon}>
//                   {item.deliveryStatus?.seenBy?.length ? (
//                     <Ionicons
//                       name="checkmark-done"
//                       size={14}
//                       color="#60A5FA"
//                     />
//                   ) : item.deliveryStatus?.deliveredTo?.length ? (
//                     <Ionicons
//                       name="checkmark-done"
//                       size={14}
//                       color="#E5E7EB"
//                     />
//                   ) : (
//                     <Ionicons
//                       name="checkmark"
//                       size={14}
//                       color="#E5E7EB"
//                     />
//                   )}
//                 </View>
//               )}

//             </View>


//             {!!item.reactions?.length && (
//               <View style={styles.reactionRow}>
//                 {item.reactions.map((r, i) => (
//                   <Text key={i}>{r.emoji}</Text>
//                 ))}
//               </View>
//             )}

       

//           </View>
//         </TouchableOpacity>

//       </View>
//     );
//   };

//   /* ================= BLOCKED CHECK ================= */

//   if (chat?.isBlocked) {
//     return (
//       <SafeAreaView style={styles.center}>
//         <Text>This conversation is blocked</Text>
//       </SafeAreaView>
//     );
//   }

//   /* ================= UI ================= */

//   return (
//     <SafeAreaView style={styles.container}>

//       <View style={styles.header}>
//         {otherUser?.avatar && (
//           <Image
//             source={{ uri: otherUser.avatar }}
//             style={styles.avatar}
//           />
//         )}

//         <View>


//           <View>
//             <Text style={styles.username}>
//               {otherUser?.username || "User"}
//             </Text>

//             {!!typingUsers.length ? (
//               <Text style={styles.typing}>
//                 typing...
//               </Text>
//             ) : otherUser?.isOnline ? (
//               <Text style={styles.onlineText}>
//                 Online
//               </Text>
//             ) : otherUser?.lastSeen ? (
//               <Text style={styles.lastSeen}>
//                 Last seen {formatLastSeen(otherUser.lastSeen)}
//               </Text>
//             ) : null}
//           </View>

//         </View>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >

//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item) => item._id}
//           renderItem={renderMessage}
//           contentContainerStyle={{ padding: 16 }}
//         />

//         <View style={styles.inputBar}>

//           <TextInput
//             value={text}
//             onChangeText={(v) => {

//               setText(v);

//               emitTyping(chatId, true);

//               clearTimeout(typingTimeout.current);

//               typingTimeout.current = setTimeout(() => {
//                 emitTyping(chatId, false);
//               }, 1500);

//             }}
//             style={styles.input}
//             placeholder="Message..."
//           />

//           <TouchableOpacity onPress={sendMessage}>
//             <Ionicons name="send" size={24} color="#4F46E5" />
//           </TouchableOpacity>

//         </View>

//       </KeyboardAvoidingView>

//     </SafeAreaView>
//   );
// }

// /* ===================================================== */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F9FAFB" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderBottomWidth: 1,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF"
//   },
//   avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
//   username: { fontSize: 16, fontWeight: "600" },
//   messageRow: { marginVertical: 6 },
//   rowMe: { alignItems: "flex-end" },
//   rowOther: { alignItems: "flex-start" },
//   bubble: { maxWidth: "75%", padding: 12, borderRadius: 18 },
//   me: { backgroundColor: "#4F46E5", borderBottomRightRadius: 4 },
//   other: { backgroundColor: "#E5E7EB", borderBottomLeftRadius: 4 },
//   meText: { color: "#FFF" },
//   otherText: { color: "#111827" },
//   statusRow: { marginTop: 4, alignSelf: "flex-end" },
//   reactionRow: { flexDirection: "row", marginTop: 6 },
//   onlineText: {
//     fontSize: 12,
//     color: "#22C55E",
//     marginTop: 2
//   },

//   lastSeen: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginTop: 2
//   },
//   timeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     marginTop: 6
//   },

//   timeText: {
//     fontSize: 11,
//     marginRight: 4
//   },

//   timeMe: {
//     color: "#E5E7EB"
//   },

//   timeOther: {
//     color: "#6B7280"
//   },

//   statusIcon: {
//     marginLeft: 2
//   },

//   inputBar: {
//     flexDirection: "row",
//     padding: 12,
//     alignItems: "center",
//     borderTopWidth: 1,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FFF"
//   },
//   input: {
//     flex: 1,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     marginRight: 10
//   },
//   typing: { fontSize: 12, color: "#6B7280" },
//   deletedBubble: { alignSelf: "center", marginVertical: 8 },
//   deletedText: { fontStyle: "italic", color: "#6B7280" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" }
// });




// ChatScreen.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  addMessage,
  clearChatMessages,
  loadMessages,
  MessageItem
} from "@/redux/slices/messageSlice";

import {
  markChatSeenLocally,
  setActiveChat
} from "@/redux/slices/chatSlice";

import { AppDispatch } from "@/redux/store";
import {
  emitMarkAsSeen,
  emitTyping,
  joinChatRoom,
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

  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

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

    } catch (err) {
      console.log("Start recording error:", err);
    }
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

    } catch (err) {
      console.log("Stop recording error:", err);
    }
  };


  useEffect(() => {

    if (!chatId) return;

    dispatch(setActiveChat(chatId));
    dispatch(markChatSeenLocally(chatId));
    joinChatRoom(chatId);
    dispatch(loadMessages(chatId));

    return () => {
      dispatch(setActiveChat(undefined));
      dispatch(clearChatMessages(chatId));
      clearTimeout(typingTimeout.current);
    };

  }, [chatId]);

useEffect(() => {
  if (!chatId) return;
  if (!currentUser?._id) return;

  if (messages.length > 0) {
    emitMarkAsSeen(chatId);
  }

}, [messages.length]);

useEffect(() => {
  if (!chatId || !currentUser?._id) return;

  console.log("👀 Attempting mark as seen");
  console.log("Active Chat:", chatId);
  console.log("Messages count:", messages.length);

  emitMarkAsSeen(chatId);

}, [messages.length]);

useEffect(() => {
  if (!chatId) return;
  if (!currentUser?._id) return;

  // تأكيد أن هذه الشاشة هي النشطة فعلاً
  dispatch(setActiveChat(chatId));

  return () => {
    dispatch(setActiveChat(undefined));
  };

}, [chatId]);

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

    } catch (error) {
      console.log("Image pick error:", error);
    }
  };

  const sendMediaMessage = async (
    uri: string,
    type: "image" | "video" | "audio"
  ) => {

    if (!currentUser?._id) return;

    const tempId = `temp-${Date.now()}`;

    /* =====================
       1️⃣ Optimistic Message
    ===================== */

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

      /* =====================
         2️⃣ Upload
      ===================== */

      const cloudType =
        type === "image"
          ? "image"
          : type === "video"
            ? "video"
            : "raw";

      const url = await uploadToCloudinary(uri, cloudType);

      /* =====================
         3️⃣ Send Socket
      ===================== */

      sendSocketMessage(
        chatId,
        url,          // 🔥 الرابط هو محتوى الرسالة
        type,
        tempId
      );

    } catch (err) {

      console.log("Upload error:", err);
    }
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

      // 🔥 الطريقة الصحيحة في SDK 54+
      if (!result.canceled && result.assets?.length) {

        const asset = result.assets[0];

        sendMediaMessage(asset.uri, "audio");
      }

    } catch (error) {
      console.log("Audio pick error:", error);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        console.log("Media permission denied");
      }
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
          <Text style={styles.deletedText}>
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
        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            !isMedia && (isMe ? styles.me : styles.other)
          ]}
        >

          {/* IMAGE */}
          {item.type === "image" && item.content ? (
            <Image
              source={{ uri: item.content }}
              style={{ width: 220, height: 220, borderRadius: 14 }}
              resizeMode="cover"
            />
          )

            /* VIDEO */
            : item.type === "video" && item.content ? (
              <Video
                source={{ uri: item.content }}
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: 14
                }}
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
                  <Text style={isMe ? styles.meText : styles.otherText}>
                    {item.content}
                  </Text>
                )}

        </View>


        {/* Time outside bubble */}
        <View
          style={[
            styles.timeWrapper,
            isMe ? styles.timeRight : styles.timeLeft
          ]}
        >
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeMe : styles.timeOther
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>

 
            {isMe && (
               <View style={styles.statusIcon}>
                 {item.deliveryStatus?.seenBy?.length ? (
                     <Ionicons
                      name="checkmark-done"
                      size={14}
                      color="#60A5FA"
                    />
                   ) : item.deliveryStatus?.deliveredTo?.length ? (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color="#E5E7EB"                    />
                 ) : (
                   <Ionicons
                     name="checkmark"
                     size={14}
                     color="#E5E7EB"
                    />
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
      <SafeAreaView style={styles.center}>
        <Text>This conversation is blocked</Text>
      </SafeAreaView>
    );
  }

  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <SafeAreaView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>

          {/* LEFT SECTION */}
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>

            {otherUser?.avatar ? (
              <Image
                source={{ uri: otherUser.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {otherUser?.username || "User"}
              </Text>

              {!!typingUsers.length ? (
                <Text style={styles.typing}>Typing...</Text>
              ) : otherUser?.isOnline ? (
                <Text style={styles.onlineText}>Online</Text>
              ) : otherUser?.lastSeen ? (
                <Text style={styles.lastSeen}>
                  Last seen {formatLastSeen(otherUser.lastSeen)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* RIGHT SECTION */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="call-outline" size={22} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="videocam-outline" size={22} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#111827" />
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
          data={[...messages].reverse()}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={{ padding: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />


        {/* INPUT BAR */}
        {/* INPUT */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={pickVideo}
          >
            <Ionicons name="videocam-outline" size={22} color="#6B7280" />
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.iconBtn}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={22} color="#6B7280" />
          </TouchableOpacity>


          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={(v) => {

              setText(v);

              emitTyping(chatId, true);

              clearTimeout(typingTimeout.current);

              typingTimeout.current = setTimeout(() => {
                emitTyping(chatId, false);
              }, 1500);

            }}
            // onChangeText={setText}
            multiline
          />

          {text.trim() ? (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={sendMessage}
            >
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
                color={isRecording ? "red" : "#6B7280"}
              />
            </TouchableOpacity>

          )}
        </View>


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
    backgroundColor: '#6D5DF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginVertical: 4,   // أقل مسافة بين الرسائل
  },

  bubble: {
    maxWidth: "75%",
    paddingVertical: 8,   // تقليل padding
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

});
