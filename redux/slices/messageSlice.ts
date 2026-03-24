// // redux/slices/messageSlice.ts

// import api from "@/services/api";
// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// /* =====================================================
//    TYPES
// ===================================================== */

// export interface DeliveryStatus {
//   deliveredTo: string[];
//   seenBy: string[];
//   deliveredAt?: string;
//   seenAt?: string;
// }

// export interface Reaction {
//   user: string;
//   emoji: string;
//   createdAt: string;
// }
// export interface MediaPayload {
//   url: string;
//   publicId?: string;
//   fileName?: string;
//   fileSize?: number;
//   mimeType?: string;
//   thumbnail?: string;
//   duration?: number;
// }

// export interface MessageItem {
//   _id: string;
//   chat: string;
//   sender: string;
//   type: string;
//   content: string;
//   media?: MediaPayload;
//   replyTo?: any;
//   status?: "sent" | "delivered" | "seen"; // 🔥 أضف هذا

//   reactions?: Reaction[];
//   deliveryStatus?: DeliveryStatus;
//   deletedForEveryone?: boolean;
//   createdAt: string;
//   optimistic?: boolean;
//   clientTempId?: string; // 🔥 أضف هذا

// }
// interface MessageState {
//   messages: Record<string, MessageItem[]>;
//   loading: boolean;
// }

// const initialState: MessageState = {
//   messages: {},
//   loading: false
// };
// /* =====================================================
//    STATE
// ===================================================== */

// interface MessageState {
//   messages: Record<string, MessageItem[]>;
// }

// export const loadMessages = createAsyncThunk<
//   { chatId: string; messages: MessageItem[]; page: number },
//   { chatId: string; page: number }
// >(
//   "message/loadMessages",
//   async ({ chatId, page }, { rejectWithValue }) => {
//     try {
//       const res = await api.get(
//         `/messages/${chatId}?page=${page}`
//       );

//       return {
//         chatId,
//         messages: res.data,
//         page
//       };

//     } catch (error: any) {
//       return rejectWithValue(
//         error?.response?.data || "Failed"
//       );
//     }
//   }
// );



// /* =====================================================
//    SLICE
// ===================================================== */

// const messageSlice = createSlice({
//   name: "message",
//   initialState,
//   reducers: {

//     /* ================= SET INITIAL MESSAGES ================= */

//     setMessages: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         messages: MessageItem[];
//       }>
//     ) => {

    

//       state.messages[action.payload.chatId] =
//         action.payload.messages.map(msg => ({
//           ...msg,
//           reactions: msg.reactions || [],
//           deliveryStatus: msg.deliveryStatus || {
//             deliveredTo: [],
//             seenBy: []
//           }
//         }));

//     },

//     /* ================= ADD NEW MESSAGE ================= */

//     addMessage: (
//       state,
//       action: PayloadAction<MessageItem>
//     ) => {

//       const incoming = action.payload;
//       const chatId = incoming.chat;

//       if (!state.messages[chatId]) {
//         state.messages[chatId] = [];
//       }

//       const messages = state.messages[chatId];

//       /* ==========================================
//          1) Replace optimistic via clientTempId
//       ========================================== */

//       if (incoming.clientTempId) {

//         const optimisticIndex = messages.findIndex(
//           m =>
//             m.clientTempId &&
//             m.clientTempId === incoming.clientTempId
//         );

//         if (optimisticIndex !== -1) {

//           messages[optimisticIndex] = {
//             ...incoming,
//             optimistic: false,
//             clientTempId: undefined
//           };


//           return;
//         }
//       }

//       /* ==========================================
//          2) Prevent duplicate by real _id
//       ========================================== */

//       /* ==========================================
//       2) Prevent duplicate by real _id
//    ========================================== */

//       const exists = messages.find(
//         m => m._id === incoming._id
//       );

//       if (!exists) {

//         state.messages[chatId] = [
//           {
//             ...incoming,
//             reactions: incoming.reactions || [],
//             deliveryStatus: incoming.deliveryStatus || {
//               deliveredTo: [],
//               seenBy: []
//             }
//           },
//           ...messages
//         ];
//       }

//     },



//     /* ================= DELIVERY UPDATE ================= */

//     markDeliveredFromSocket: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         userId: string;
//       }>
//     ) => {

    

//       const { chatId, userId } = action.payload;
//       const msgs = state.messages[chatId];
//       if (!msgs) return;

//       msgs.forEach(msg => {

//         if (!msg.deliveryStatus) return;

//         if (!msg.deliveryStatus.deliveredTo.includes(userId)) {
//           msg.deliveryStatus.deliveredTo.push(userId);
//         }
//       });
//     },

//     /* ================= SEEN UPDATE ================= */

//     markSeenFromSocket: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         userId: string;
//         messageIds: string[];
//       }>
//     ) => {

//       const { chatId, userId, messageIds } =
//         action.payload;

//       const msgs = state.messages[chatId];
//       if (!msgs) return;

//       msgs.forEach(msg => {

//         if (!messageIds.includes(msg._id)) return;

//         if (!msg.deliveryStatus) return;

//         if (!msg.deliveryStatus.seenBy.includes(userId)) {
//           msg.deliveryStatus.seenBy.push(userId);
//         }

//         msg.status = "seen";
//       });
//     },




//     /* ================= REACTION UPDATE ================= */

//     updateReaction: (
//       state,
//       action: PayloadAction<{
//         messageId: string;
//         reactions: Reaction[];
//       }>
//     ) => {

    

//       Object.values(state.messages).forEach(list => {

//         const msg = list.find(
//           m => m._id === action.payload.messageId
//         );

//         if (msg) {
//           msg.reactions = action.payload.reactions;
//         }
//       });
//     },

//     /* ================= DELETE FOR EVERYONE ================= */

//     deleteMessageFromSocket: (
//       state,
//       action: PayloadAction<{
//         messageId: string;
//       }>
//     ) => {

   
//       Object.values(state.messages).forEach(list => {

//         const msg = list.find(
//           m => m._id === action.payload.messageId
//         );

//         if (msg) {
//           msg.deletedForEveryone = true;
//           msg.content = "This message was deleted";
//           msg.media = undefined;
//         }
//       });
//     },

//     /* ================= CLEAR CHAT ================= */

//     clearChatMessages: (
//       state,
//       action: PayloadAction<string>
//     ) => {

    

//       delete state.messages[action.payload];
//     }

//   },
//   /* =====================================================
//      EXTRA REDUCERS (ASYNC)
//   ===================================================== */

//   extraReducers: (builder) => {

//     builder
//       .addCase(loadMessages.pending, (state) => {
//         state.loading = true;
//       })

//     .addCase(loadMessages.fulfilled, (state, action) => {
//   const { chatId, messages, page } = action.payload;

//   state.loading = false;

//   const normalized = messages.map(msg => ({
//     ...msg,
//     reactions: msg.reactions || [],
//     deliveryStatus: msg.deliveryStatus || {
//       deliveredTo: [],
//       seenBy: []
//     }
//   }));

//   if (page === 1) {
//     // أول تحميل
//     state.messages[chatId] = normalized;
//   } else {
//     const existing = state.messages[chatId] || [];

//     // إنشاء Set بجميع الـ IDs الموجودة
//     const existingIds = new Set(existing.map(m => m._id));

//     // فلترة الرسائل الجديدة لمنع التكرار
//     const filtered = normalized.filter(
//       m => !existingIds.has(m._id)
//     );

//     // دمج بدون تكرار (مع inverted نضيف القديمة في النهاية)
//     state.messages[chatId] = [
//       ...existing,
//       ...filtered
//     ];
//   }
// })



//       .addCase(loadMessages.rejected, (state) => {
//         state.loading = false;
//       });
//   }


// });




// /* =====================================================
//    EXPORTS
// ===================================================== */

// export const {
//   setMessages,
//   addMessage,
//   markDeliveredFromSocket,
//   markSeenFromSocket,
//   updateReaction,
//   deleteMessageFromSocket,
//   clearChatMessages
// } = messageSlice.actions;

// export default messageSlice.reducer;

// redux/slices/messageSlice.ts

import api from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export interface MediaPayload {
  url: string;
  publicId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  duration?: number;
}

export interface MessageItem {
  _id: string;
  chat: string;
  sender: string;
  type: string;
  content: string;
  media?: MediaPayload;
  replyTo?: any;
  status?: "sent" | "delivered" | "seen";
  reactions?: Reaction[];
  deliveryStatus?: DeliveryStatus;
  deletedForEveryone?: boolean;
  createdAt: string;
  optimistic?: boolean;
  clientTempId?: string;
}

interface MessageState {
  messages: Record<string, MessageItem[]>;
  loading: boolean;
}

const initialState: MessageState = {
  messages: {},
  loading: false,
};

/* =====================================================
   HELPERS
===================================================== */

const normalizeMessage = (msg: MessageItem): MessageItem => ({
  ...msg,
  reactions: msg.reactions || [],
  deliveryStatus: msg.deliveryStatus || {
    deliveredTo: [],
    seenBy: [],
  },
});

const mergeUniqueMessages = (
  existing: MessageItem[],
  incoming: MessageItem[]
): MessageItem[] => {
  const map = new Map<string, MessageItem>();

  for (const msg of existing) {
    map.set(msg._id, normalizeMessage(msg));
  }

  for (const msg of incoming) {
    const normalized = normalizeMessage(msg);
    const prev = map.get(normalized._id);

    map.set(normalized._id, {
      ...prev,
      ...normalized,
      reactions: normalized.reactions || prev?.reactions || [],
      deliveryStatus:
        normalized.deliveryStatus ||
        prev?.deliveryStatus || {
          deliveredTo: [],
          seenBy: [],
        },
    });
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const loadMessages = createAsyncThunk<
  { chatId: string; messages: MessageItem[]; page: number },
  { chatId: string; page: number }
>("message/loadMessages", async ({ chatId, page }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/messages/${chatId}?page=${page}`);

    return {
      chatId,
      messages: Array.isArray(res.data) ? res.data : [],
      page,
    };
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || "Failed");
  }
});

/* =====================================================
   SLICE
===================================================== */

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    /* ================= SET INITIAL / HYDRATED MESSAGES ================= */

    setMessages: (
      state,
      action: PayloadAction<{
        chatId: string;
        messages: MessageItem[];
      }>
    ) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages.map(normalizeMessage);
    },

    /* ================= ADD NEW MESSAGE ================= */

    addMessage: (state, action: PayloadAction<MessageItem>) => {
      const incoming = normalizeMessage(action.payload);
      const chatId = incoming.chat;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      const messages = state.messages[chatId];

      // 1) استبدال optimistic بالرسالة الحقيقية عن طريق clientTempId
      if (incoming.clientTempId) {
        const optimisticIndex = messages.findIndex(
          (m) => !!m.clientTempId && m.clientTempId === incoming.clientTempId
        );

        if (optimisticIndex !== -1) {
          messages[optimisticIndex] = {
            ...incoming,
            optimistic: false,
            clientTempId: undefined,
          };
          return;
        }
      }

      // 2) منع التكرار بالـ _id
      const exists = messages.some((m) => m._id === incoming._id);
      if (exists) return;

      state.messages[chatId] = [incoming, ...messages];
    },

    /* ================= DELIVERY UPDATE ================= */

    markDeliveredFromSocket: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {
      const { chatId, userId } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;

      msgs.forEach((msg) => {
        if (!msg.deliveryStatus) {
          msg.deliveryStatus = {
            deliveredTo: [],
            seenBy: [],
          };
        }

        if (!msg.deliveryStatus.deliveredTo.includes(userId)) {
          msg.deliveryStatus.deliveredTo.push(userId);
        }

        if (msg.status !== "seen") {
          msg.status = "delivered";
        }
      });
    },

    /* ================= SEEN UPDATE ================= */

    markSeenFromSocket: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        messageIds: string[];
      }>
    ) => {
      const { chatId, userId, messageIds } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs) return;

      msgs.forEach((msg) => {
        if (!messageIds.includes(msg._id)) return;

        if (!msg.deliveryStatus) {
          msg.deliveryStatus = {
            deliveredTo: [],
            seenBy: [],
          };
        }

        if (!msg.deliveryStatus.seenBy.includes(userId)) {
          msg.deliveryStatus.seenBy.push(userId);
        }

        if (!msg.deliveryStatus.deliveredTo.includes(userId)) {
          msg.deliveryStatus.deliveredTo.push(userId);
        }

        msg.status = "seen";
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
      Object.values(state.messages).forEach((list) => {
        const msg = list.find((m) => m._id === action.payload.messageId);
        if (msg) {
          msg.reactions = action.payload.reactions || [];
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
      Object.values(state.messages).forEach((list) => {
        const msg = list.find((m) => m._id === action.payload.messageId);

        if (msg) {
          msg.deletedForEveryone = true;
          msg.content = "This message was deleted";
          msg.media = undefined;
        }
      });
    },

    /* ================= CLEAR CHAT ================= */

    clearChatMessages: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload];
    },
  },

  /* =====================================================
     EXTRA REDUCERS (ASYNC)
  ===================================================== */

  extraReducers: (builder) => {
    builder
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
      })

      .addCase(loadMessages.fulfilled, (state, action) => {
        const { chatId, messages, page } = action.payload;
        state.loading = false;

        const normalized = messages.map(normalizeMessage);

        if (page === 1) {
          state.messages[chatId] = normalized;
          return;
        }

        const existing = state.messages[chatId] || [];
        state.messages[chatId] = mergeUniqueMessages(existing, normalized);
      })

      .addCase(loadMessages.rejected, (state) => {
        state.loading = false;
      });
  },
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
  clearChatMessages,
} = messageSlice.actions;

export default messageSlice.reducer;