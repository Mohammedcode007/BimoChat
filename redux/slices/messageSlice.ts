// import { RootState } from "@/redux/store";
// import api from "@/services/api";
// import {
//     createAsyncThunk,
//     createSelector,
//     createSlice,
//     PayloadAction
// } from "@reduxjs/toolkit";

// /* =====================================================
//    TYPES
// ===================================================== */

// export interface MessageItem {
//   _id: string;
//   chat: string;
//   sender?: string;
//   type: string;
//   content?: string;
//   media?: any;

//   replyTo?: {
//     _id: string;
//     content?: string;
//   };

//   deliveryStatus: {
//     deliveredTo: string[];
//     seenBy: string[];
//   };

//   createdAt: string;
//   edited?: boolean;
//   optimistic?: boolean;
// }

// interface MessageState {
//   messages: Record<string, MessageItem[]>;
//   loading: boolean;
//   hasMore: boolean;
// }

// const initialState: MessageState = {
//   messages: {},
//   loading: false,
//   hasMore: true
// };

// /* =====================================================
//    FETCH MESSAGES
// ===================================================== */

// export const fetchMessages = createAsyncThunk(
//   "message/fetch",
//   async ({ chatId, page }: { chatId: string; page: number }) => {

//     const res = await api.get(`/messages/${chatId}?page=${page}`);

//     return {
//       chatId,
//       data: res.data as MessageItem[]
//     };
//   }
// );

// /* =====================================================
//    HELPERS
// ===================================================== */

// const mergeWithoutDuplicates = (
//   existing: MessageItem[],
//   incoming: MessageItem[]
// ) => {

//   const map = new Map<string, MessageItem>();

//   existing.forEach(m => map.set(m._id, m));
//   incoming.forEach(m => map.set(m._id, m));

//   return Array.from(map.values()).sort(
//     (a, b) =>
//       new Date(a.createdAt).getTime() -
//       new Date(b.createdAt).getTime()
//   );
// };

// /* =====================================================
//    SLICE
// ===================================================== */

// const messageSlice = createSlice({
//   name: "message",
//   initialState,
//   reducers: {

//     /* ================= SOCKET MESSAGE ================= */

//     addMessage: (
//       state,
//       action: PayloadAction<MessageItem>
//     ) => {

//       const message = action.payload;
//       const chatId = message.chat;

//       if (!state.messages[chatId]) {
//         state.messages[chatId] = [];
//       }

//       const exists = state.messages[chatId].some(
//         m => m._id === message._id
//       );

//       if (!exists) {
//         state.messages[chatId] = [
//           ...state.messages[chatId],
//           message
//         ];
//       }
//     },

//     /* ================= OPTIMISTIC ================= */

//     addOptimisticMessage: (
//       state,
//       action: PayloadAction<MessageItem>
//     ) => {

//       const message = action.payload;
//       const chatId = message.chat;

//       if (!state.messages[chatId]) {
//         state.messages[chatId] = [];
//       }

//       state.messages[chatId] = [
//         ...state.messages[chatId],
//         { ...message, optimistic: true }
//       ];
//     },

//     /* ================= REPLACE OPTIMISTIC ================= */

//     replaceOptimisticMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         tempId: string;
//         realMessage: MessageItem;
//       }>
//     ) => {

//       const { chatId, tempId, realMessage } = action.payload;

//       const msgs = state.messages[chatId];
//       if (!msgs) return;

//       state.messages[chatId] = msgs.map(m =>
//         m._id === tempId ? realMessage : m
//       );
//     },

//     /* ================= DELIVERED ================= */

//     markDelivered: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         messageId: string;
//         deliveredBy: string;
//       }>
//     ) => {

//       const { chatId, messageId, deliveredBy } = action.payload;

//       const msgs = state.messages[chatId];
//       if (!msgs) return;

//       state.messages[chatId] = msgs.map(msg => {

//         if (msg._id !== messageId) return msg;

//         if (msg.deliveryStatus.deliveredTo.includes(deliveredBy))
//           return msg;

//         return {
//           ...msg,
//           deliveryStatus: {
//             ...msg.deliveryStatus,
//             deliveredTo: [
//               ...msg.deliveryStatus.deliveredTo,
//               deliveredBy
//             ]
//           }
//         };
//       });
//     },

//     /* ================= SEEN ================= */

//     markSeen: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         userId: string;
//       }>
//     ) => {

//       const msgs = state.messages[action.payload.chatId];
//       if (!msgs) return;

//       state.messages[action.payload.chatId] =
//         msgs.map(msg => {

//           if (msg.deliveryStatus.seenBy.includes(action.payload.userId))
//             return msg;

//           return {
//             ...msg,
//             deliveryStatus: {
//               ...msg.deliveryStatus,
//               seenBy: [
//                 ...msg.deliveryStatus.seenBy,
//                 action.payload.userId
//               ]
//             }
//           };
//         });
//     },

//     /* ================= EDIT ================= */

//     editMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         messageId: string;
//         content: string;
//       }>
//     ) => {

//       const msgs = state.messages[action.payload.chatId];
//       if (!msgs) return;

//       state.messages[action.payload.chatId] =
//         msgs.map(msg =>
//           msg._id === action.payload.messageId
//             ? {
//                 ...msg,
//                 content: action.payload.content,
//                 edited: true
//               }
//             : msg
//         );
//     },

//     /* ================= DELETE ================= */

//     deleteMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         messageId: string;
//       }>
//     ) => {

//       const msgs = state.messages[action.payload.chatId];
//       if (!msgs) return;

//       state.messages[action.payload.chatId] =
//         msgs.map(msg =>
//           msg._id === action.payload.messageId
//             ? { ...msg, content: "", media: undefined }
//             : msg
//         );
//     }

//   },

//   extraReducers: builder => {

//     builder

//       .addCase(fetchMessages.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(fetchMessages.fulfilled, (state, action) => {

//         state.loading = false;

//         const { chatId, data } = action.payload;

//         if (!state.messages[chatId]) {
//           state.messages[chatId] = [];
//         }

//         state.messages[chatId] =
//           mergeWithoutDuplicates(
//             state.messages[chatId],
//             data
//           );

//         if (data.length === 0) {
//           state.hasMore = false;
//         }
//       })

//       .addCase(fetchMessages.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// /* =====================================================
//    MEMOIZED SELECTOR (IMPORTANT)
// ===================================================== */

// export const selectMessagesByChat = (chatId: string) =>
//   createSelector(
//     (state: RootState) => state.message.messages,
//     messages => messages[chatId] ?? []
//   );

// /* =====================================================
//    EXPORTS
// ===================================================== */

// export const {
//   addMessage,
//   addOptimisticMessage,
//   replaceOptimisticMessage,
//   markDelivered,
//   markSeen,
//   editMessage,
//   deleteMessage
// } = messageSlice.actions;

// export default messageSlice.reducer;
import { RootState } from "@/redux/store";
import api from "@/services/api";
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";

/* =====================================================
   TYPES
===================================================== */

export interface MessageItem {
  _id: string;
  chat: string;
  sender?: string;
  type: string;
  content?: string;
  media?: any;

  replyTo?: {
    _id: string;
    content?: string;
  };

  deliveryStatus: {
    deliveredTo: string[];
    seenBy: string[];
  };

  createdAt: string;
  edited?: boolean;
  optimistic?: boolean;
}

interface MessageState {
  messages: Record<string, MessageItem[]>;
  loading: boolean;
  hasMore: boolean;
}

const initialState: MessageState = {
  messages: {},
  loading: false,
  hasMore: true
};

/* =====================================================
   FETCH MESSAGES
===================================================== */

export const fetchMessages = createAsyncThunk(
  "message/fetch",
  async ({ chatId, page }: { chatId: string; page: number }) => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 FETCH MESSAGES START");
    console.log("💬 Chat:", chatId);
    console.log("📄 Page:", page);

    const res = await api.get(`/messages/${chatId}?page=${page}`);

    console.log("📦 Messages received:", res.data?.length || 0);
    console.log("📥 FETCH MESSAGES END");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      chatId,
      data: res.data as MessageItem[]
    };
  }
);

/* =====================================================
   HELPERS
===================================================== */

const mergeWithoutDuplicates = (
  existing: MessageItem[],
  incoming: MessageItem[]
) => {

  const map = new Map<string, MessageItem>();

  existing.forEach(m => map.set(m._id, m));
  incoming.forEach(m => map.set(m._id, m));

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );
};

/* =====================================================
   SLICE
===================================================== */

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {

    /* ================= SOCKET MESSAGE ================= */

    addMessage: (state, action: PayloadAction<MessageItem>) => {

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📩 SOCKET ADD MESSAGE");
      console.log("💬 Chat:", action.payload.chat);
      console.log("📨 Message:", action.payload._id);

      const message = action.payload;
      const chatId = message.chat;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      const exists = state.messages[chatId].some(
        m => m._id === message._id
      );

      if (!exists) {
        state.messages[chatId] = [
          ...state.messages[chatId],
          message
        ];
        console.log("✅ Message appended");
      } else {
        console.log("⚠ Message already exists");
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    },

    /* ================= OPTIMISTIC ================= */

    addOptimisticMessage: (state, action: PayloadAction<MessageItem>) => {

      console.log("🚀 OPTIMISTIC MESSAGE");
      console.log("💬 Chat:", action.payload.chat);
      console.log("🆔 Temp ID:", action.payload._id);

      const message = action.payload;
      const chatId = message.chat;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId] = [
        ...state.messages[chatId],
        { ...message, optimistic: true }
      ];
    },

    /* ================= REPLACE OPTIMISTIC ================= */

    replaceOptimisticMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        tempId: string;
        realMessage: MessageItem;
      }>
    ) => {

      console.log("🔁 REPLACE OPTIMISTIC");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("🆔 Temp:", action.payload.tempId);
      console.log("✅ Real:", action.payload.realMessage._id);

      const { chatId, tempId, realMessage } = action.payload;

      const msgs = state.messages[chatId];
      if (!msgs) return;

      state.messages[chatId] = msgs.map(m =>
        m._id === tempId ? realMessage : m
      );
    },

    /* ================= DELIVERED ================= */

    markDelivered: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        deliveredBy: string;
      }>
    ) => {

      console.log("📦 MARK DELIVERED");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("📨 Message:", action.payload.messageId);
      console.log("👤 Delivered By:", action.payload.deliveredBy);

      const { chatId, messageId, deliveredBy } = action.payload;

      const msgs = state.messages[chatId];
      if (!msgs) return;

      state.messages[chatId] = msgs.map(msg => {

        if (msg._id !== messageId) return msg;

        if (msg.deliveryStatus.deliveredTo.includes(deliveredBy))
          return msg;

        return {
          ...msg,
          deliveryStatus: {
            ...msg.deliveryStatus,
            deliveredTo: [
              ...msg.deliveryStatus.deliveredTo,
              deliveredBy
            ]
          }
        };
      });
    },

    /* ================= SEEN ================= */

    markSeen: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {

      console.log("👀 MARK SEEN");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("👤 User:", action.payload.userId);

      const msgs = state.messages[action.payload.chatId];
      if (!msgs) return;

      state.messages[action.payload.chatId] =
        msgs.map(msg => {

          if (msg.deliveryStatus.seenBy.includes(action.payload.userId))
            return msg;

          return {
            ...msg,
            deliveryStatus: {
              ...msg.deliveryStatus,
              seenBy: [
                ...msg.deliveryStatus.seenBy,
                action.payload.userId
              ]
            }
          };
        });
    },

    /* ================= EDIT ================= */

    editMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        content: string;
      }>
    ) => {

      console.log("✏ EDIT MESSAGE");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("📨 Message:", action.payload.messageId);

      const msgs = state.messages[action.payload.chatId];
      if (!msgs) return;

      state.messages[action.payload.chatId] =
        msgs.map(msg =>
          msg._id === action.payload.messageId
            ? {
                ...msg,
                content: action.payload.content,
                edited: true
              }
            : msg
        );
    },

    /* ================= DELETE ================= */

    deleteMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
      }>
    ) => {

      console.log("🗑 DELETE MESSAGE");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("📨 Message:", action.payload.messageId);

      const msgs = state.messages[action.payload.chatId];
      if (!msgs) return;

      state.messages[action.payload.chatId] =
        msgs.map(msg =>
          msg._id === action.payload.messageId
            ? { ...msg, content: "", media: undefined }
            : msg
        );
    }

  },

  extraReducers: builder => {

    builder

      .addCase(fetchMessages.pending, (state) => {
        console.log("⏳ FETCH MESSAGES PENDING");
        state.loading = true;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {

        console.log("✅ FETCH MESSAGES SUCCESS");
        console.log("💬 Chat:", action.payload.chatId);

        state.loading = false;

        const { chatId, data } = action.payload;

        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }

        state.messages[chatId] =
          mergeWithoutDuplicates(
            state.messages[chatId],
            data
          );

        if (data.length === 0) {
          state.hasMore = false;
        }
      })

      .addCase(fetchMessages.rejected, (state) => {
        console.log("❌ FETCH MESSAGES FAILED");
        state.loading = false;
      });
  }
});

/* =====================================================
   MEMOIZED SELECTOR
===================================================== */

export const selectMessagesByChat = (chatId: string) =>
  createSelector(
    (state: RootState) => state.message.messages,
    messages => {
      console.log("🔍 SELECTOR RUN:", chatId);
      return messages[chatId] ?? [];
    }
  );

/* =====================================================
   EXPORTS
===================================================== */

export const {
  addMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  markDelivered,
  markSeen,
  editMessage,
  deleteMessage
} = messageSlice.actions;

export default messageSlice.reducer;
