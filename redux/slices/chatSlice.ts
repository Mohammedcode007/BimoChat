import api from "@/services/api";
import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export interface ChatItem {
  _id: string;

  participants: {
    _id: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
  }[];

  lastMessage?: any;
  lastMessagePreview?: string;
  lastMessageType?: string;

  unreadCount: number;
  unreadCounts?: Record<string, number>;

  isBlocked?: boolean;
  blockedBy?: string;

  isGroup?: boolean;

  mutedBy?: string[];
  archivedBy?: string[];
  deletedFor?: string[];

  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: ChatItem[];
  activeChatId?: string;
  typingUsers: Record<string, string[]>;
  loading: boolean;
  totalUnread: number;
  currentUserId?: string;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: undefined,
  typingUsers: {},
  loading: false,
  totalUnread: 0,
  currentUserId: undefined   // 🔥 مهم
};

/* =====================================================
   ASYNC THUNKS
===================================================== */
export const markChatSeen = createAsyncThunk<
  string,
  string
>("chat/markChatSeen", async (chatId, thunkAPI) => {

  try {

    await api.post(`/chats/${chatId}/seen`);

    return chatId;

  } catch {

    return thunkAPI.rejectWithValue(chatId);
  }
});

export const fetchChats = createAsyncThunk<
  { chats: ChatItem[]; userId?: string },
  void,
  { state: RootState }
>(
  "chat/fetchChats",
  async (_, thunkAPI) => {

    const state = thunkAPI.getState();
    const userId = state.auth.user?._id;

    const res = await api.get("/chats");

    return {
      chats: res.data,
      userId
    };
  }
);

export const createChat = createAsyncThunk<
  ChatItem,
  string
>("chat/createChat", async (targetId, thunkAPI) => {

  console.log("📤 createChat with:", targetId);

  try {

    const res = await api.post("/chats", { targetId });

    console.log("✅ createChat SUCCESS:", res.data._id);

    return res.data;

  } catch {

    console.log("❌ createChat FAILED");

    return thunkAPI.rejectWithValue("Failed to create chat");
  }
});

export const deleteChat = createAsyncThunk<
  string,
  string
>("chat/deleteChat", async (chatId, thunkAPI) => {

  try {

    await api.delete(`/chats/${chatId}`);

    return chatId;

  } catch {

    return thunkAPI.rejectWithValue(chatId);
  }
});

export const fetchTotalUnread = createAsyncThunk<
  number
>("chat/fetchTotalUnread", async (_, thunkAPI) => {

  console.log("📊 fetchTotalUnread START");

  try {

    const res = await api.get("/chats/unread/total");

    console.log("📊 totalUnread from server:", res.data.total);

    return res.data.total;

  } catch {

    console.log("❌ fetchTotalUnread FAILED");

    return thunkAPI.rejectWithValue("Failed to get unread");
  }
});

/* =====================================================
   SLICE
===================================================== */

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChatState: () => initialState,

    /* ================= ACTIVE CHAT ================= */

    setActiveChat: (
      state,
      action: PayloadAction<string | undefined>
    ) => {

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎯 setActiveChat");
      console.log("New Active:", action.payload);

      /* 🔥 تنظيف typing للشات القديم */
      if (state.activeChatId && state.typingUsers[state.activeChatId]) {
        delete state.typingUsers[state.activeChatId];
      }

      state.activeChatId = action.payload;

      if (!action.payload) return;

      const chat = state.chats.find(
        c => c._id === action.payload
      );

      if (!chat) return;

      state.totalUnread = Math.max(
        0,
        state.totalUnread - chat.unreadCount
      );

      chat.unreadCount = 0;
    },

    /* ================= MARK CHAT SEEN LOCALLY ================= */

    markChatSeenLocally: (
      state,
      action: PayloadAction<string>
    ) => {

      const chatId = action.payload;

      const chat = state.chats.find(
        c => c._id === chatId
      );

      if (!chat) return;

      state.totalUnread = Math.max(
        0,
        state.totalUnread - chat.unreadCount
      );

      chat.unreadCount = 0;
    },
    updateChatPresence: (
      state,
      action: PayloadAction<{
        userId: string;
        isOnline: boolean;
        lastSeen?: string | null;
      }>
    ) => {

      const { userId, isOnline, lastSeen } = action.payload;

      state.chats.forEach(chat => {

        chat.participants.forEach(participant => {

          if (participant._id === userId) {
            participant.isOnline = isOnline;
            participant.lastSeen = lastSeen || undefined;
          }

        });

      });

    },
    /* ================= SOCKET NEW MESSAGE ================= */
    socketNewMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: any;
      }>
    ) => {

      const { chatId, message } = action.payload;

      console.log("━━━━━━━━ SOCKET NEW MESSAGE ━━━━━━━━");
      console.log("Incoming chatId:", chatId);
      console.log("Incoming messageId:", message?._id);

      const index = state.chats.findIndex(c => c._id === chatId);

      if (index === -1) {
        console.log("❌ Chat NOT FOUND in state");
        return;
      }

      const oldChat = state.chats[index];

      console.log("📌 BEFORE UPDATE");
      console.log("Old lastMessageId:", oldChat.lastMessage?._id);
      console.log("Old updatedAt:", oldChat.updatedAt);

      const oldReference = oldChat;

      const newChat = {
        ...oldChat,
        lastMessage: message,
        lastMessagePreview: message.content,
        lastMessageType: message.type,
        updatedAt: message.updatedAt || message.createdAt
      };
      console.log("📌 AFTER PREPARE NEW OBJECT");
      console.log("New lastMessageId:", newChat.lastMessage?._id);
      console.log("New updatedAt:", newChat.updatedAt);

      console.log(
        "🧠 Same message?",
        oldChat.lastMessage?._id === message?._id
      );

      console.log(
        "🧠 Same updatedAt?",
        oldChat.updatedAt === message.createdAt
      );

      state.chats[index] = newChat;

      console.log("📌 AFTER REPLACEMENT");

      console.log(
        "🔁 Reference changed?",
        oldReference !== state.chats[index]
      );

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    },




    /* ================= SYNC UNREAD ================= */
    setUnreadFromServer: (
      state,
      action: PayloadAction<{
        chatId: string;
        unreadCount: number;
      }>
    ) => {

      const { chatId, unreadCount } = action.payload;

      const chat = state.chats.find(c => c._id === chatId);
      if (!chat) return;

      // 🔥 لا تعدل أي شيء غير unreadCount
      chat.unreadCount = unreadCount;

      // 🔥 لا تعيد حساب totalUnread بالكامل
      state.totalUnread = state.chats.reduce(
        (sum, c) => sum + c.unreadCount,
        0
      );
    }
    ,
    // setUnreadFromServer: (
    //   state,
    //   action: PayloadAction<{
    //     chatId: string;
    //     unreadCount: number;
    //   }>
    // ) => {

    //   const { chatId, unreadCount } = action.payload;

    //   console.log("🔄 setUnreadFromServer");
    //   console.log("Chat:", chatId);
    //   console.log("Server unread:", unreadCount);

    //   const chat = state.chats.find(
    //     c => c._id === chatId
    //   );

    //   if (!chat) {
    //     console.log("❌ Chat not found for unread sync");
    //     return;
    //   }

    //   state.totalUnread = Math.max(
    //     0,
    //     state.totalUnread - chat.unreadCount
    //   );

    //   chat.unreadCount = unreadCount;
    //   state.totalUnread += unreadCount;

    //   console.log("New unread:", chat.unreadCount);
    //   console.log("New totalUnread:", state.totalUnread);
    // },

    /* ================= TYPING ================= */

    setTyping: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        typing: boolean;
      }>
    ) => {

      const { chatId, userId, typing } = action.payload;

      // if (state.activeChatId !== chatId) return;

      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }

      if (typing) {

        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId);
        }

      } else {

        state.typingUsers[chatId] =
          state.typingUsers[chatId].filter(
            id => id !== userId
          );
      }
    },


  },

  extraReducers: builder => {

    builder
      .addCase(fetchChats.pending, (state) => {
        console.log("🚨 fetchChats.pending CALLED AGAIN");
        state.loading = true;
      })

      .addCase(fetchChats.fulfilled, (state, action) => {

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📥 fetchChats.fulfilled START");

        state.loading = false;

        const { chats: serverChats, userId } = action.payload;

        console.log("👤 Incoming userId:", userId);
        console.log("📦 Server chats count:", serverChats.length);
        console.log("📦 Local chats BEFORE merge:", state.chats.length);

        state.currentUserId = userId;

        serverChats.forEach(serverChat => {

          console.log("--------------------------------------------------");
          console.log("🔎 Processing chat:", serverChat._id);
          console.log("🕒 Server updatedAt:", serverChat.updatedAt);

          const existingChat = state.chats.find(
            c => c._id === serverChat._id
          );

          if (!existingChat) {

            console.log("🆕 Chat not found locally → PUSH");
            state.chats.push(serverChat);

          } else {

            console.log("✅ Chat exists locally");
            console.log("🕒 Local updatedAt:", existingChat.updatedAt);

            const localTime = new Date(existingChat.updatedAt).getTime();
            const serverTime = new Date(serverChat.updatedAt).getTime();

            console.log("⏱ Local timestamp:", localTime);
            console.log("⏱ Server timestamp:", serverTime);

            // 🔥 لا تستبدل إلا لو السيرفر أحدث
            if (serverTime > localTime) {

              console.log("🔄 Server is NEWER → REPLACING local chat");

              Object.assign(existingChat, serverChat);

            } else {

              console.log("⛔ Local is newer or equal → SKIP replace");

            }

          }

        });

        state.totalUnread = state.chats.reduce(
          (sum, chat) => sum + chat.unreadCount,
          0
        );

        console.log("📦 Local chats AFTER merge:", state.chats.length);
        console.log("🔢 totalUnread recalculated:", state.totalUnread);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      })
      .addCase(fetchChats.rejected, (state) => {
        state.loading = false;
      })

      .addCase(createChat.fulfilled, (state, action) => {
        const exists = state.chats.find(
          c => c._id === action.payload._id
        );
        if (!exists) {
          state.chats.unshift(action.payload);
        }
      })

      .addCase(fetchTotalUnread.fulfilled, (state, action) => {
        state.totalUnread = action.payload;
      })

      /* ================= MARK CHAT SEEN ================= */

      .addCase(markChatSeen.fulfilled, (state, action) => {

        const chatId = action.payload;

        const chat = state.chats.find(
          c => c._id === chatId
        );

        if (!chat) return;

        state.totalUnread = Math.max(
          0,
          state.totalUnread - chat.unreadCount
        );

        chat.unreadCount = 0;

      })

      /* ================= DELETE CHAT ================= */

      .addCase(deleteChat.pending, (state, action) => {

        const chatId = action.meta.arg;

        const chat = state.chats.find(c => c._id === chatId);
        if (!chat) return;

        state.totalUnread = Math.max(
          0,
          state.totalUnread - chat.unreadCount
        );

        state.chats = state.chats.filter(
          c => c._id !== chatId
        );

        if (state.activeChatId === chatId) {
          state.activeChatId = undefined;
        }

      })

      .addCase(deleteChat.rejected, () => {
        console.log("❌ deleteChat failed");
      })

      .addCase(deleteChat.fulfilled, () => {
        console.log("🗑️ deleteChat success");
      });

  }


});

export const {
  setActiveChat,
  socketNewMessage,
  setUnreadFromServer,
  setTyping,
  resetChatState,
  updateChatPresence,
  markChatSeenLocally
} = chatSlice.actions;


export default chatSlice.reducer;
