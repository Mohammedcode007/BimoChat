// redux/slices/messageSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* =====================================================
   TYPES
===================================================== */

export interface DeliveryStatus {
  deliveredTo: string[];
  seenBy: string[];
  deliveredAt?: string;
  seenAt?: string;
}

export interface Reaction {
  user: string;
  emoji: string;
  createdAt: string;
}

export interface MessageItem {
  _id: string;
  chat: string;
  sender: string;
  type: string;
  content: string;
  media?: string;
  replyTo?: any;
  reactions?: Reaction[];
  deliveryStatus?: DeliveryStatus;
  deletedForEveryone?: boolean;
  createdAt: string;
  optimistic?: boolean;
    clientTempId?: string; // 🔥 أضف هذا

}

/* =====================================================
   STATE
===================================================== */

interface MessageState {
  messages: Record<string, MessageItem[]>;
}

const initialState: MessageState = {
  messages: {}
};

/* =====================================================
   SLICE
===================================================== */

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {

    /* ================= SET INITIAL MESSAGES ================= */

    setMessages: (
      state,
      action: PayloadAction<{
        chatId: string;
        messages: MessageItem[];
      }>
    ) => {

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📥 setMessages CALLED");
      console.log("ChatId:", action.payload.chatId);
      console.log("Messages count:", action.payload.messages.length);

      state.messages[action.payload.chatId] =
        action.payload.messages.map(msg => ({
          ...msg,
          reactions: msg.reactions || [],
          deliveryStatus: msg.deliveryStatus || {
            deliveredTo: [],
            seenBy: []
          }
        }));

      console.log("✅ Messages stored in state");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    },

    /* ================= ADD NEW MESSAGE ================= */

addMessage: (
  state,
  action: PayloadAction<MessageItem>
) => {

  const incoming = action.payload;
  const chatId = incoming.chat;

  if (!state.messages[chatId]) {
    state.messages[chatId] = [];
  }

  const messages = state.messages[chatId];

  /* =====================================================
     1) لو الرسالة قادمة من السيرفر
        استخدم clientTempId لاستبدال optimistic
  ===================================================== */

  if (!incoming.optimistic && incoming.clientTempId) {

    const optimisticIndex = messages.findIndex(
      m => m._id === incoming.clientTempId
    );

    if (optimisticIndex !== -1) {

      console.log("🔁 Replacing optimistic via clientTempId");

      messages[optimisticIndex] = {
        ...incoming,
        optimistic: false
      };

      return;
    }
  }

  /* =====================================================
     2) منع duplicate بالـ _id الحقيقي
  ===================================================== */

  const exists = messages.find(
    m => m._id === incoming._id
  );

  if (!exists) {

    messages.push({
      ...incoming,
      reactions: incoming.reactions || [],
      deliveryStatus: incoming.deliveryStatus || {
        deliveredTo: [],
        seenBy: []
      }
    });

  }

},


    /* ================= DELIVERY UPDATE ================= */

    markDeliveredFromSocket: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {

      console.log("📬 markDeliveredFromSocket",
        action.payload);

      const { chatId, userId } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;

      msgs.forEach(msg => {

        if (!msg.deliveryStatus) return;

        if (!msg.deliveryStatus.deliveredTo.includes(userId)) {
          msg.deliveryStatus.deliveredTo.push(userId);
        }
      });
    },

    /* ================= SEEN UPDATE ================= */

    markSeenFromSocket: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {

      console.log("👁 markSeenFromSocket",
        action.payload);

      const { chatId, userId } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;

      msgs.forEach(msg => {

        if (!msg.deliveryStatus) return;

        if (!msg.deliveryStatus.seenBy.includes(userId)) {
          msg.deliveryStatus.seenBy.push(userId);
        }
      });
    },

    /* ================= REACTION UPDATE ================= */

    updateReaction: (
      state,
      action: PayloadAction<{
        messageId: string;
        reactions: Reaction[];
      }>
    ) => {

      console.log("❤️ updateReaction",
        action.payload.messageId);

      Object.values(state.messages).forEach(list => {

        const msg = list.find(
          m => m._id === action.payload.messageId
        );

        if (msg) {
          msg.reactions = action.payload.reactions;
        }
      });
    },

    /* ================= DELETE FOR EVERYONE ================= */

    deleteMessageFromSocket: (
      state,
      action: PayloadAction<{
        messageId: string;
      }>
    ) => {

      console.log("🗑 deleteMessageFromSocket",
        action.payload.messageId);

      Object.values(state.messages).forEach(list => {

        const msg = list.find(
          m => m._id === action.payload.messageId
        );

        if (msg) {
          msg.deletedForEveryone = true;
          msg.content = "This message was deleted";
          msg.media = undefined;
        }
      });
    },

    /* ================= CLEAR CHAT ================= */

    clearChatMessages: (
      state,
      action: PayloadAction<string>
    ) => {

      console.log("🧹 clearChatMessages",
        action.payload);

      delete state.messages[action.payload];
    }

  }
});

/* =====================================================
   EXPORTS
===================================================== */

export const {
  setMessages,
  addMessage,
  markDeliveredFromSocket,
  markSeenFromSocket,
  updateReaction,
  deleteMessageFromSocket,
  clearChatMessages
} = messageSlice.actions;

export default messageSlice.reducer;
