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
}

const initialState: ChatState = {
  chats: [],
  activeChatId: undefined,
  typingUsers: {},
  loading: false,
  totalUnread: 0
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
  ChatItem[]
>("chat/fetchChats", async (_, thunkAPI) => {

  console.log("📡 fetchChats START");

  try {

    const res = await api.get("/chats");

    console.log("📡 fetchChats SUCCESS:", res.data.length);

    return res.data;

  } catch (error) {

    console.log("❌ fetchChats ERROR");

    return thunkAPI.rejectWithValue("Failed to fetch chats");
  }
});

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

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 socketNewMessage RECEIVED");
  console.log("ChatId:", chatId);

  const chat = state.chats.find(
    c => c._id === chatId
  );

  if (!chat) {
    console.log("❌ Chat NOT FOUND in state");
    console.log("Available chats:", state.chats);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  chat.lastMessage = message;
  chat.updatedAt = message.createdAt;

  const isActive = state.activeChatId === chatId;

  if (!isActive) {
    chat.unreadCount += 1;
    state.totalUnread += 1;
    console.log("🔢 Unread incremented");
  } else {
    console.log("👀 Chat is active → no unread increment");
  }

  console.log("Updated unread:", chat.unreadCount);
  console.log("Updated totalUnread:", state.totalUnread);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  state.chats.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );
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

      console.log("🔄 setUnreadFromServer");
      console.log("Chat:", chatId);
      console.log("Server unread:", unreadCount);

      const chat = state.chats.find(
        c => c._id === chatId
      );

      if (!chat) {
        console.log("❌ Chat not found for unread sync");
        return;
      }

      state.totalUnread = Math.max(
        0,
        state.totalUnread - chat.unreadCount
      );

      chat.unreadCount = unreadCount;
      state.totalUnread += unreadCount;

      console.log("New unread:", chat.unreadCount);
      console.log("New totalUnread:", state.totalUnread);
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
      state.loading = true;
    })

    .addCase(fetchChats.fulfilled, (state, action) => {
      state.loading = false;
      state.chats = action.payload;
      state.totalUnread = action.payload.reduce(
        (sum, chat) => sum + chat.unreadCount,
        0
      );
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
  updateChatPresence,
  markChatSeenLocally
} = chatSlice.actions;


export default chatSlice.reducer;
