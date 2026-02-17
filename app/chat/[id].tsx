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
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import {
  addMessage,
  MessageItem,
  setMessages
} from "@/redux/slices/messageSlice";
import { AppDispatch, RootState } from "@/redux/store";

import {
  setActiveChat,
  setUnreadFromServer
} from "@/redux/slices/chatSlice";

import {
  emitMarkAsSeen,
  emitTyping,
  joinChatRoom,
  sendSocketMessage
} from "@/services/socket";

import api from "@/services/api";

/* ===================================================== */

export default function ChatScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;

  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList<MessageItem>>(null);

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const messages = useSelector(
    (state: RootState) =>
      state.message.messages[chatId] || []
  );

  const typingUsers = useSelector(
    (state: RootState) =>
      state.chat.typingUsers[chatId] || []
  );

  const [text, setText] = useState("");

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {

    if (!chatId) return;

    dispatch(setActiveChat(chatId));

    joinChatRoom(chatId);

    dispatch(setUnreadFromServer({
      chatId,
      unreadCount: 0
    }));

    const loadMessages = async () => {
      try {
        const res = await api.get(
          `/messages/${chatId}?page=1`
        );

        dispatch(setMessages({
          chatId,
          messages: res.data
        }));

        emitMarkAsSeen(chatId);

      } catch (err) {
        console.log("Load messages error:", err);
      }
    };

    loadMessages();

    return () => {
      dispatch(setActiveChat(undefined));
    };

  }, [chatId]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  /* ================= SEND MESSAGE ================= */

 const sendMessage = () => {

  if (!text.trim() || !currentUser?._id) return;

  // 🔥 أنشئ tempId
  const tempId = `temp-${Date.now()}`;

  const optimistic: MessageItem = {
    _id: tempId,
    clientTempId: tempId, // 🔥 مهم جداً
    chat: chatId,
    sender: currentUser._id,
    type: "text",
    content: text,
    deliveryStatus: {
      deliveredTo: [],
      seenBy: []
    },
    reactions: [],
    createdAt: new Date().toISOString(),
    optimistic: true
  };

  // 1️⃣ أضف optimistic
  dispatch(addMessage(optimistic));

  // 2️⃣ أرسل مع clientTempId
  sendSocketMessage(
    chatId,
    text,
    "text",
    tempId // 🔥 مهم
  );

  setText("");
};


  /* ================= RENDER MESSAGE ================= */

  const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {

    const isMe = item.sender === currentUser?._id;

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

          {isMe && (
            <View style={styles.statusRow}>
              {item.deliveryStatus?.seenBy?.length ? (
                <Ionicons name="checkmark-done" size={14} color="#60A5FA" />
              ) : item.deliveryStatus?.deliveredTo?.length ? (
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

  /* ================= UI ================= */

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

        {typingUsers.length > 0 && (
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

/* ===================================================== */

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

  typing: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 16,
    marginBottom: 4
  }

});
