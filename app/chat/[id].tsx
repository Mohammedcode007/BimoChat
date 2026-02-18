// ChatScreen.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  clearChatMessages,
  MessageItem,
  setMessages,
  updateReaction
} from "@/redux/slices/messageSlice";

import {
  markChatSeenLocally,
  setActiveChat
} from "@/redux/slices/chatSlice";

import { AppDispatch, RootState } from "@/redux/store";
import {
  emitMarkAsSeen,
  emitTyping,
  joinChatRoom,
  sendSocketMessage
} from "@/services/socket";

import api from "@/services/api";
import { formatLastSeen, formatTime } from "@/utils/helpFunctions";

/* ===================================================== */

export default function ChatScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = id as string;

  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList<MessageItem>>(null);
  const typingTimeout = useRef<any>(null);

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const chat = useSelector(
    (state: RootState) =>
      state.chat.chats.find(c => c._id === chatId)
  );

  const messages = useSelector(
    (state: RootState) =>
      state.message.messages[chatId] || []
  );

  const typingUsers = useSelector(
    (state: RootState) =>
      (state.chat.typingUsers[chatId] || [])
        .filter(id => id !== currentUser?._id)
  );

  const [text, setText] = useState("");

  /* ================= OTHER USER ================= */

  const otherUser = useMemo(() => {
    if (!chat || !currentUser) return null;

    return chat.participants.find(
      (p: any) => p._id !== currentUser._id
    );
  }, [chat, currentUser]);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {

    if (!chatId) return;

    dispatch(setActiveChat(chatId));
    dispatch(markChatSeenLocally(chatId));
    joinChatRoom(chatId);

    const loadMessages = async () => {

      const res = await api.get(`/messages/${chatId}`);

      dispatch(setMessages({
        chatId,
        messages: res.data
      }));

      emitMarkAsSeen(chatId);
    };

    loadMessages();

    return () => {
      dispatch(setActiveChat(undefined));
      dispatch(clearChatMessages(chatId));
      clearTimeout(typingTimeout.current);

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

    sendSocketMessage(
      chatId,
      text,
      "text",
      tempId   // 🔥 هنا
    );

    setText("");
  };

  /* ================= ADD REACTION ================= */

  const toggleReaction = (message: MessageItem, emoji: string) => {

    const updated = message.reactions || [];

    dispatch(updateReaction({
      messageId: message._id,
      reactions: updated
    }));
  };

  /* ================= RENDER MESSAGE ================= */

  const renderMessage: ListRenderItem<MessageItem> = ({ item }) => {

    const isMe = item.sender === currentUser?._id;

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
      <View style={[
        styles.messageRow,
        isMe ? styles.rowMe : styles.rowOther
      ]}>

        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => toggleReaction(item, "❤️")}
        >

          <View style={[
            styles.bubble,
            isMe ? styles.me : styles.other
          ]}>

            <Text style={isMe ? styles.meText : styles.otherText}>
              {item.content}
            </Text>

            <View style={styles.timeRow}>

              <Text style={[
                styles.timeText,
                isMe ? styles.timeMe : styles.timeOther
              ]}>
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
                      color="#E5E7EB"
                    />
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


            {!!item.reactions?.length && (
              <View style={styles.reactionRow}>
                {item.reactions.map((r, i) => (
                  <Text key={i}>{r.emoji}</Text>
                ))}
              </View>
            )}

       

          </View>
        </TouchableOpacity>

      </View>
    );
  };

  /* ================= BLOCKED CHECK ================= */

  if (chat?.isBlocked) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>This conversation is blocked</Text>
      </SafeAreaView>
    );
  }

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        {otherUser?.avatar && (
          <Image
            source={{ uri: otherUser.avatar }}
            style={styles.avatar}
          />
        )}

        <View>


          <View>
            <Text style={styles.username}>
              {otherUser?.username || "User"}
            </Text>

            {!!typingUsers.length ? (
              <Text style={styles.typing}>
                typing...
              </Text>
            ) : otherUser?.isOnline ? (
              <Text style={styles.onlineText}>
                Online
              </Text>
            ) : otherUser?.lastSeen ? (
              <Text style={styles.lastSeen}>
                Last seen {formatLastSeen(otherUser.lastSeen)}
              </Text>
            ) : null}
          </View>

        </View>
      </View>

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

        <View style={styles.inputBar}>

          <TextInput
            value={text}
            onChangeText={(v) => {

              setText(v);

              emitTyping(chatId, true);

              clearTimeout(typingTimeout.current);

              typingTimeout.current = setTimeout(() => {
                emitTyping(chatId, false);
              }, 1500);

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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF"
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "600" },
  messageRow: { marginVertical: 6 },
  rowMe: { alignItems: "flex-end" },
  rowOther: { alignItems: "flex-start" },
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 18 },
  me: { backgroundColor: "#4F46E5", borderBottomRightRadius: 4 },
  other: { backgroundColor: "#E5E7EB", borderBottomLeftRadius: 4 },
  meText: { color: "#FFF" },
  otherText: { color: "#111827" },
  statusRow: { marginTop: 4, alignSelf: "flex-end" },
  reactionRow: { flexDirection: "row", marginTop: 6 },
  onlineText: {
    fontSize: 12,
    color: "#22C55E",
    marginTop: 2
  },

  lastSeen: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6
  },

  timeText: {
    fontSize: 11,
    marginRight: 4
  },

  timeMe: {
    color: "#E5E7EB"
  },

  timeOther: {
    color: "#6B7280"
  },

  statusIcon: {
    marginLeft: 2
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
  typing: { fontSize: 12, color: "#6B7280" },
  deletedBubble: { alignSelf: "center", marginVertical: 8 },
  deletedText: { fontStyle: "italic", color: "#6B7280" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});
