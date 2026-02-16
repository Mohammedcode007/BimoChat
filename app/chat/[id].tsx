import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
    addOptimisticMessage,
    fetchMessages,
    MessageItem,
    selectMessagesByChat
} from "@/redux/slices/messageSlice";
import { AppDispatch, RootState } from "@/redux/store";

import {
    resetUnread,
    setActiveChat
} from "@/redux/slices/chatSlice";

import {
    emitMarkAsSeen,
    emitTyping,
    sendSocketMessage
} from "@/services/socket";

/* =====================================================
   TYPES
===================================================== */

import { useLocalSearchParams } from "expo-router";

export default function ChatScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const chatId = id;


const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList<MessageItem>>(null);
useEffect(() => {

  if (!chatId) return;

  dispatch(setActiveChat(chatId));
  dispatch(resetUnread(chatId));

  dispatch(fetchMessages({ chatId, page: 1 }));

  emitMarkAsSeen(chatId);

  return () => {
    dispatch(setActiveChat(null));
  };

}, [chatId]);

const messages = useSelector(
  selectMessagesByChat(chatId)
);
useEffect(() => {

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💬 CHAT SCREEN RENDER");
  console.log("🆔 Chat ID:", chatId);
  console.log("👤 Current User:", currentUser?._id);
  console.log("📊 Messages Count:", messages.length);

  if (messages.length > 0) {

    const last = messages[messages.length - 1];

    console.log("──────────────────────────────");
    console.log("📝 Last Message ID:", last._id);
    console.log("👤 Sender:", last.sender);
    console.log("📦 Type:", last.type);
    console.log("📄 Content:", last.content);
    console.log("👁 Seen By:", last.deliveryStatus.seenBy.length);
    console.log("📬 Delivered To:", last.deliveryStatus.deliveredTo.length);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

}, [messages]);


  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const typingUsers = useSelector(
    (state: RootState) => state.chat.typingUsers
  );
useEffect(() => {

  console.log("⌨️ Typing Users:", typingUsers);

}, [typingUsers]);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MessageItem | null>(null);



  /* ================= Auto Scroll ================= */

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  /* ================= Send Text ================= */

  const sendMessage = () => {

    if (!text.trim()) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: MessageItem = {
      _id: tempId,
      chat: chatId,
      sender: currentUser._id,
      type: "text",
      content: text,
      deliveryStatus: { deliveredTo: [], seenBy: [] },
      createdAt: new Date().toISOString(),
      optimistic: true
    };

   dispatch(addOptimisticMessage(optimisticMessage));


    sendSocketMessage(chatId, text, "text", null, replyTo);

    setText("");
    setReplyTo(null);
  };

  /* =====================================================
     RENDER MESSAGE (Typed Properly)
  ===================================================== */

  const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {

    const isMe = item.sender === currentUser._id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.rowMe : styles.rowOther
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.me : styles.other
          ]}
        >

          {item.replyTo && (
            <View style={styles.replyBox}>
              <Text style={styles.replyText}>
                {item.replyTo.content}
              </Text>
            </View>
          )}

          {item.type === "text" && (
            <Text style={isMe ? styles.meText : styles.otherText}>
              {item.content}
            </Text>
          )}

          {item.type === "image" && item.media && (
            <Image
              source={{ uri: item.media }}
              style={styles.image}
            />
          )}

          {/* Status */}

          {isMe && (
            <View style={styles.statusRow}>
              {item.deliveryStatus.seenBy.length > 0 ? (
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
              ) : item.deliveryStatus.deliveredTo.length > 0 ? (
                <Ionicons name="checkmark-done" size={14} color="#FFF" />
              ) : (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              )}
            </View>
          )}

        </View>
      </View>
    );
  };

  /* ================= Typing Indicator ================= */

  const isTyping = Object.keys(typingUsers)
    .some(key => key.startsWith(chatId));

  /* =====================================================
     UI
  ===================================================== */

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
        />

        {isTyping && (
          <Text style={styles.typing}>
            typing...
          </Text>
        )}

        <View style={styles.inputBar}>

          <TextInput
            value={text}
            onChangeText={(v) => {
              setText(v);
              emitTyping(chatId);
            }}
            style={styles.input}
            placeholder="Message..."
          />

          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#4F46E5" />
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },

  messageRow: {
    marginVertical: 6
  },

  rowMe: {
    alignItems: "flex-end"
  },

  rowOther: {
    alignItems: "flex-start"
  },

  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18
  },

  me: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4
  },

  other: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4
  },

  meText: {
    color: "#FFF"
  },

  otherText: {
    color: "#111827"
  },

  statusRow: {
    marginTop: 4,
    alignSelf: "flex-end"
  },

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

  image: {
    width: 180,
    height: 180,
    borderRadius: 12
  },

  replyBox: {
    borderLeftWidth: 3,
    borderColor: "#A5B4FC",
    paddingLeft: 6,
    marginBottom: 4
  },

  replyText: {
    fontSize: 12,
    color: "#6B7280"
  },

  typing: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 16,
    marginBottom: 4
  }

});
