// import api from "@/services/api";
// import {
//     createAsyncThunk,
//     createSlice,
//     PayloadAction
// } from "@reduxjs/toolkit";

// /* =====================================================
//    TYPES
// ===================================================== */

// export interface ChatItem {
//   _id: string;

//   participants: {
//     _id: string;
//     username: string;
//     avatar?: string;
//     isOnline: boolean;
//   }[];

//   lastMessage?: {
//     _id: string;
//     content?: string;
//     type: string;
//     createdAt: string;
//     status?: "sent" | "delivered" | "seen";
//   };

//   unreadCount: number;
//   updatedAt: string;
// }

// interface ChatState {
//   chats: ChatItem[];
//   totalUnread: number;
//   activeChatId: string | null;
//   typingUsers: Record<string, boolean>;
//   loading: boolean;
// }

// const initialState: ChatState = {
//   chats: [],
//   totalUnread: 0,
//   activeChatId: null,
//   typingUsers: {},
//   loading: false
// };

// /* =====================================================
//    ASYNC THUNKS
// ===================================================== */

// export const fetchChats = createAsyncThunk<ChatItem[]>(
//   "chat/fetch",
//   async () => {
//     const res = await api.get("/chats");
//     return res.data;
//   }
// );

// export const fetchTotalUnread = createAsyncThunk<number>(
//   "chat/totalUnread",
//   async () => {
//     const res = await api.get("/chats/total-unread");
//     return res.data.totalUnread;
//   }
// );

// export const createChat = createAsyncThunk<
//   ChatItem,
//   string,
//   { rejectValue: string }
// >(
//   "chat/create",
//   async (targetId, thunkAPI) => {

//     try {

//       const res = await api.post("/chats/create", {
//         targetId
//       });

//       return res.data as ChatItem;

//     } catch (err: any) {

//       return thunkAPI.rejectWithValue(
//         err.response?.data?.message || "Create chat failed"
//       );
//     }
//   }
// );

// /* =====================================================
//    SLICE
// ===================================================== */

// const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {

//     /* ================= ACTIVE ================= */

//     setActiveChat: (
//       state,
//       action: PayloadAction<string | null>
//     ) => {
//       state.activeChatId = action.payload;
//     },

//     /* ================= SOCKET NEW MESSAGE ================= */

//     socketNewMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         message: ChatItem["lastMessage"];
//         isActive: boolean;
//       }>
//     ) => {

//       const { chatId, message, isActive } = action.payload;

//       const chat = state.chats.find(
//         c => c._id === chatId
//       );

//       if (!chat) return;

//       chat.lastMessage = message;
//       chat.updatedAt = new Date().toISOString();

//       if (!isActive) {
//         chat.unreadCount += 1;
//         state.totalUnread += 1;
//       }

//       /* 🔥 Move to top */
//       state.chats = [
//         chat,
//         ...state.chats.filter(c => c._id !== chatId)
//       ];
//     },

//     /* ================= SERVER UNREAD SYNC ================= */

//     setUnreadFromServer: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         unreadCount: number;
//       }>
//     ) => {

//       const chat = state.chats.find(
//         c => c._id === action.payload.chatId
//       );

//       if (!chat) return;

//       const difference =
//         action.payload.unreadCount - chat.unreadCount;

//       chat.unreadCount = action.payload.unreadCount;
//       state.totalUnread += difference;
//     },

//     /* ================= RESET UNREAD ================= */

//     resetUnread: (
//       state,
//       action: PayloadAction<string>
//     ) => {

//       const chat = state.chats.find(
//         c => c._id === action.payload
//       );

//       if (!chat) return;

//       state.totalUnread -= chat.unreadCount;
//       chat.unreadCount = 0;
//     },

//     /* ================= UPDATE MESSAGE STATUS ================= */

//     updateMessageStatus: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         messageId: string;
//         status: "delivered" | "seen";
//       }>
//     ) => {

//       const chat = state.chats.find(
//         c => c._id === action.payload.chatId
//       );

//       if (!chat?.lastMessage) return;

//       if (chat.lastMessage._id === action.payload.messageId) {
//         chat.lastMessage.status = action.payload.status;
//       }
//     },

//     /* ================= TYPING ================= */

//     setTyping: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         userId: string;
//         typing: boolean;
//       }>
//     ) => {

//       const key =
//         `${action.payload.chatId}-${action.payload.userId}`;

//       if (action.payload.typing) {
//         state.typingUsers[key] = true;
//       } else {
//         delete state.typingUsers[key];
//       }
//     }

//   },

//   extraReducers: builder => {

//     builder

//       /* ================= FETCH CHATS ================= */

//       .addCase(fetchChats.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(fetchChats.fulfilled, (state, action) => {
//         state.loading = false;
//         state.chats = action.payload;
//       })

//       .addCase(fetchChats.rejected, (state) => {
//         state.loading = false;
//       })

//       /* ================= TOTAL UNREAD ================= */

//       .addCase(fetchTotalUnread.fulfilled, (state, action) => {
//         state.totalUnread = action.payload;
//       })

//       /* ================= CREATE CHAT ================= */

//       .addCase(createChat.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(createChat.fulfilled, (state, action) => {

//         state.loading = false;

//         const exists = state.chats.find(
//           c => c._id === action.payload._id
//         );

//         if (!exists) {
//           state.chats.unshift(action.payload);
//         }

//         state.activeChatId = action.payload._id;
//       })

//       .addCase(createChat.rejected, (state) => {
//         state.loading = false;
//       });

//   }

// });

// /* =====================================================
//    EXPORTS
// ===================================================== */

// export const {
//   setActiveChat,
//   socketNewMessage,
//   setUnreadFromServer,
//   resetUnread,
//   updateMessageStatus,
//   setTyping
// } = chatSlice.actions;

// export default chatSlice.reducer;

import api from "@/services/api";
import {
    createAsyncThunk,
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";

/* =====================================================
   TYPES
===================================================== */

export interface ChatItem {
  _id: string;

  participants: {
    _id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
  }[];

  lastMessage?: {
    _id: string;
    content?: string;
    type: string;
    createdAt: string;
    status?: "sent" | "delivered" | "seen";
  };

  unreadCount: number;
  updatedAt: string;
}

interface ChatState {
  chats: ChatItem[];
  totalUnread: number;
  activeChatId: string | null;
  typingUsers: Record<string, boolean>;
  loading: boolean;
}

const initialState: ChatState = {
  chats: [],
  totalUnread: 0,
  activeChatId: null,
  typingUsers: {},
  loading: false
};

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const fetchChats = createAsyncThunk<ChatItem[]>(
  "chat/fetch",
  async () => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 FETCH CHATS START");

    const res = await api.get("/chats");

    console.log("📊 Chats received:", res.data?.length || 0);
    console.log("📋 FETCH CHATS END");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.data;
  }
);

export const fetchTotalUnread = createAsyncThunk<number>(
  "chat/totalUnread",
  async () => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 FETCH TOTAL UNREAD START");

    const res = await api.get("/chats/total-unread");

    console.log("📊 Total unread:", res.data.totalUnread);
    console.log("📊 FETCH TOTAL UNREAD END");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.data.totalUnread;
  }
);

export const createChat = createAsyncThunk<
  ChatItem,
  string,
  { rejectValue: string }
>(
  "chat/create",
  async (targetId, thunkAPI) => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💬 CREATE CHAT START");
    console.log("🎯 Target:", targetId);

    try {

      const res = await api.post("/chats/create", { targetId });

      console.log("✅ Chat created:", res.data._id);
      console.log("💬 CREATE CHAT END");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return res.data as ChatItem;

    } catch (err: any) {

      console.log("❌ CREATE CHAT FAILED:", err?.response?.data?.message);

      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Create chat failed"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    /* ================= ACTIVE ================= */

    setActiveChat: (state, action: PayloadAction<string | null>) => {

      console.log("📍 ACTIVE CHAT SET:", action.payload);

      state.activeChatId = action.payload;
    },

    /* ================= SOCKET NEW MESSAGE ================= */

    socketNewMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: ChatItem["lastMessage"];
        isActive: boolean;
      }>
    ) => {

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📩 SOCKET NEW MESSAGE");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("👁 Is Active:", action.payload.isActive);

      const { chatId, message, isActive } = action.payload;

      const chat = state.chats.find(
        c => c._id === chatId
      );

      if (!chat) {
        console.log("⚠ Chat not found in state");
        return;
      }

      chat.lastMessage = message;
      chat.updatedAt = new Date().toISOString();

      if (!isActive) {
        chat.unreadCount += 1;
        state.totalUnread += 1;
        console.log("📊 Increment unread");
      }

      state.chats = [
        chat,
        ...state.chats.filter(c => c._id !== chatId)
      ];

      console.log("📩 SOCKET NEW MESSAGE END");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    },

    /* ================= SERVER UNREAD SYNC ================= */

    setUnreadFromServer: (
      state,
      action: PayloadAction<{
        chatId: string;
        unreadCount: number;
      }>
    ) => {

      console.log("📡 UNREAD SYNC FROM SERVER");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("📊 New unread:", action.payload.unreadCount);

      const chat = state.chats.find(
        c => c._id === action.payload.chatId
      );

      if (!chat) return;

      const difference =
        action.payload.unreadCount - chat.unreadCount;

      chat.unreadCount = action.payload.unreadCount;
      state.totalUnread += difference;
    },

    /* ================= RESET UNREAD ================= */

    resetUnread: (state, action: PayloadAction<string>) => {

      console.log("🧹 RESET UNREAD:", action.payload);

      const chat = state.chats.find(
        c => c._id === action.payload
      );

      if (!chat) return;

      state.totalUnread -= chat.unreadCount;
      chat.unreadCount = 0;
    },

    /* ================= UPDATE MESSAGE STATUS ================= */

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        status: "delivered" | "seen";
      }>
    ) => {

      console.log("📦 UPDATE MESSAGE STATUS");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("📩 Message:", action.payload.messageId);
      console.log("📌 Status:", action.payload.status);

      const chat = state.chats.find(
        c => c._id === action.payload.chatId
      );

      if (!chat?.lastMessage) return;

      if (chat.lastMessage._id === action.payload.messageId) {
        chat.lastMessage.status = action.payload.status;
      }
    },

    /* ================= TYPING ================= */

    setTyping: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        typing: boolean;
      }>
    ) => {

      const key =
        `${action.payload.chatId}-${action.payload.userId}`;

      console.log("⌨️ TYPING UPDATE");
      console.log("💬 Chat:", action.payload.chatId);
      console.log("👤 User:", action.payload.userId);
      console.log("✏️ Typing:", action.payload.typing);

      if (action.payload.typing) {
        state.typingUsers[key] = true;
      } else {
        delete state.typingUsers[key];
      }
    }

  },

  extraReducers: builder => {

    builder

      /* ================= FETCH CHATS ================= */

      .addCase(fetchChats.pending, (state) => {
        console.log("⏳ FETCH CHATS PENDING");
        state.loading = true;
      })

      .addCase(fetchChats.fulfilled, (state, action) => {
        console.log("✅ FETCH CHATS SUCCESS");
        state.loading = false;
        state.chats = action.payload;
      })

      .addCase(fetchChats.rejected, (state) => {
        console.log("❌ FETCH CHATS FAILED");
        state.loading = false;
      })

      /* ================= TOTAL UNREAD ================= */

      .addCase(fetchTotalUnread.fulfilled, (state, action) => {
        console.log("📊 TOTAL UNREAD UPDATED:", action.payload);
        state.totalUnread = action.payload;
      })

      /* ================= CREATE CHAT ================= */

      .addCase(createChat.pending, (state) => {
        console.log("⏳ CREATE CHAT PENDING");
        state.loading = true;
      })

      .addCase(createChat.fulfilled, (state, action) => {

        console.log("✅ CREATE CHAT SUCCESS:", action.payload._id);

        state.loading = false;

        const exists = state.chats.find(
          c => c._id === action.payload._id
        );

        if (!exists) {
          state.chats.unshift(action.payload);
        }

        state.activeChatId = action.payload._id;
      })

      .addCase(createChat.rejected, (state) => {
        console.log("❌ CREATE CHAT FAILED");
        state.loading = false;
      });

  }

});

/* =====================================================
   EXPORTS
===================================================== */

export const {
  setActiveChat,
  socketNewMessage,
  setUnreadFromServer,
  resetUnread,
  updateMessageStatus,
  setTyping
} = chatSlice.actions;

export default chatSlice.reducer;
