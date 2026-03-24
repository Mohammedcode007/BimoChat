
// import api from "@/services/api";
// import {
//   createAsyncThunk,
//   createSlice,
//   PayloadAction
// } from "@reduxjs/toolkit";
// import { RootState } from "../store";

// /* =====================================================
//    TYPES
// ===================================================== */

// export interface ChatParticipant {
//   _id: string;
//   username: string;
//   avatar?: string;
//   isOnline?: boolean;
//   lastSeen?: string;
//   isInvisible?: boolean;
// }

// export interface ChatItem {
//   _id: string;

//   // ✅ أحيانًا قد تأتي participants كـ objects (populate) أو ids (strings)
//   participants: (ChatParticipant | string)[];

//   lastMessage?: any;
//   lastMessagePreview?: string;
//   lastMessageType?: string;

//   unreadCount: number;
//   unreadCounts?: Record<string, number>;

//   isBlocked?: boolean;
//   blockedBy?: string;

//   isGroup?: boolean;

//   mutedBy?: string[];
//   archivedBy?: string[];
//   deletedFor?: string[];

//   createdAt: string;
//   updatedAt: string;
// }
// export interface ChatSearchMessageItem {
//   _id: string;
//   chat: string;
//   sender: string | {
//     _id: string;
//     username?: string;
//     avatar?: string;
//   };
//   content: string;
//   type: string;
//   media?: any;
//   replyTo?: any;
//   createdAt: string;
//   updatedAt: string;
// }
// interface ChatState {
//   chats: ChatItem[];
//   activeChatId?: string;
//   typingUsers: Record<string, string[]>;
//   loading: boolean;
//   totalUnread: number;
//   currentUserId?: string;

//   searchResults: ChatSearchMessageItem[];
//   searchLoading: boolean;
//   searchError?: string | null;
//   searchQuery: string;
// }
// const initialState: ChatState = {
//   chats: [],
//   activeChatId: undefined,
//   typingUsers: {},
//   loading: false,
//   totalUnread: 0,
//   currentUserId: undefined,

//   searchResults: [],
//   searchLoading: false,
//   searchError: null,
//   searchQuery: ""
// };

// /* =====================================================
//    HELPERS (🔥 تمنع دهس participants populated)
// ===================================================== */

// const isObj = (x: any) => x && typeof x === "object";

// const isParticipantsIdsOnly = (parts: any): boolean =>
//   Array.isArray(parts) && parts.length > 0 && typeof parts[0] === "string";

// const isParticipantsObjects = (parts: any): boolean =>
//   Array.isArray(parts) && parts.length > 0 && isObj(parts[0]);

// const ensurePreviewType = (chat: any) => {
//   if (!chat) return;
//   if (!chat.lastMessagePreview && chat.lastMessage?.content) {
//     chat.lastMessagePreview = String(chat.lastMessage.content || "");
//   }
//   if (!chat.lastMessageType && chat.lastMessage?.type) {
//     chat.lastMessageType = String(chat.lastMessage.type || "text");
//   }
// };

// const recomputeTotalUnread = (state: ChatState) => {
//   state.totalUnread = state.chats.reduce(
//     (sum, c) => sum + Number(c.unreadCount || 0),
//     0
//   );
// };

// const moveChatToTop = (state: ChatState, idx: number) => {
//   const moved = state.chats.splice(idx, 1)[0];
//   state.chats.unshift(moved);
// };

// /* =====================================================
//    ASYNC THUNKS
// ===================================================== */

// export const markChatSeen = createAsyncThunk<
//   string,
//   string
// >("chat/markChatSeen", async (chatId, thunkAPI) => {
//   try {
//     await api.post(`/chats/${chatId}/seen`);
//     return chatId;
//   } catch {
//     return thunkAPI.rejectWithValue(chatId);
//   }
// });

// export const fetchChats = createAsyncThunk<
//   { chats: ChatItem[]; userId?: string },
//   void,
//   { state: RootState }
// >(
//   "chat/fetchChats",
//   async (_, thunkAPI) => {
//     const state = thunkAPI.getState();
//     const userId = state.auth.user?._id;

//     const res = await api.get("/chats");

//     return {
//       chats: res.data,
//       userId
//     };
//   }
// );

// export const createChat = createAsyncThunk<
//   ChatItem,
//   string
// >("chat/createChat", async (targetId, thunkAPI) => {
//   try {
//     const res = await api.post("/chats", { targetId });
//     return res.data;
//   } catch {
//     return thunkAPI.rejectWithValue("Failed to create chat") as any;
//   }
// });
// export const searchMessagesInChat = createAsyncThunk<
//   { chatId: string; query: string; results: ChatSearchMessageItem[] },
//   { chatId: string; query: string },
//   { rejectValue: string }
// >(
//   "chat/searchMessagesInChat",
//   async ({ chatId, query }, thunkAPI) => {
//     try {
//       const q = String(query || "").trim();

//       if (!q) {
//         return {
//           chatId,
//           query: "",
//           results: [],
//         };
//       }

//       const res = await api.get(`/messages/${chatId}/search`, {
//         params: { q },
//       });

//       return {
//         chatId,
//         query: q,
//         results: Array.isArray(res.data) ? res.data : [],
//       };
//     } catch (error: any) {
//       const message =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Search failed";

//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );
// export const deleteChat = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: { chatId: string; message: string } }
// >("chat/deleteChat", async (chatId, thunkAPI) => {
//   try {
//     console.log("🗑️ deleteChat thunk started");
//     console.log("📌 chatId:", chatId);
//     console.log("🌐 Sending DELETE request to:", `/chats/${chatId}`);

//     const response = await api.delete(`/chats/${chatId}`);

//     console.log("✅ deleteChat success");
//     console.log("📦 response:", response?.data);

//     return chatId;
//   } catch (error: any) {
//     const message =
//       error?.response?.data?.message ||
//       error?.message ||
//       "Delete chat failed";

//     console.log("❌ deleteChat failed");
//     console.log("📌 failed chatId:", chatId);
//     console.log("📛 error message:", message);
//     console.log("📛 full error response:", error?.response?.data);

//     return thunkAPI.rejectWithValue({
//       chatId,
//       message,
//     });
//   }
// });

// export const fetchTotalUnread = createAsyncThunk<
//   number
// >("chat/fetchTotalUnread", async (_, thunkAPI) => {
//   try {
//     const res = await api.get("/chats/unread/total");
//     return res.data.total;
//   } catch {
//     return thunkAPI.rejectWithValue("Failed to get unread") as any;
//   }
// });

// /* =====================================================
//    SLICE
// ===================================================== */

// const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     resetChatState: () => initialState,
// clearSearchResults: (state) => {
//   state.searchResults = [];
//   state.searchLoading = false;
//   state.searchError = null;
//   state.searchQuery = "";
// },

// setSearchQuery: (state, action: PayloadAction<string>) => {
//   state.searchQuery = action.payload;
// },
//     /* ================= ACTIVE CHAT ================= */

//     socketUpsertChatFromInbox: (
//       state,
//       action: PayloadAction<{
//         chat?: any;           // chatSnap from backend
//         chatId?: string;      // fallback
//         unreadCount?: number; // unread للـ target أو 0 للمرسل
//       }>
//     ) => {
//       const incomingChat = action.payload.chat;
//       const chatId = incomingChat?._id || action.payload.chatId;
//       if (!chatId) return;

//       const unreadCount = Number(action.payload.unreadCount ?? 0);

//       const idx = state.chats.findIndex((c) => c._id === chatId);

//       // ✅ لو الشات موجود: حدّثه
//       if (idx !== -1) {
//         const chat = state.chats[idx];
//         const prevUnread = Number(chat.unreadCount || 0);

//         if (incomingChat) {
//           // 🔥 احفظ participants لو كانوا populated
//           const prevParticipants = chat.participants;

//           // دمج بيانات السيرفر (participants/lastMessage/preview/type/updatedAt...)
//           Object.assign(chat, incomingChat);

//           // 🔥 لو incoming participants جايه ids فقط → لا تدهس populated
//           if (
//             isParticipantsIdsOnly(incomingChat.participants) &&
//             isParticipantsObjects(prevParticipants)
//           ) {
//             chat.participants = prevParticipants;
//           }

//           // unreadCount من payload
//           chat.unreadCount = unreadCount;

//           // تجهيز preview/type لو غير موجودين
//           ensurePreviewType(chat);
//         } else {
//           // fallback بسيط لو لم يأت chat كامل
//           chat.unreadCount = unreadCount;
//           chat.updatedAt = new Date().toISOString();
//         }

//         // ✅ حرّك الشات للأعلى
//         moveChatToTop(state, idx);

//         // ✅ تحديث totalUnread بدقة
//         state.totalUnread = Math.max(
//           0,
//           state.totalUnread - prevUnread + unreadCount
//         );
//         return;
//       }

//       // ✅ لو الشات غير موجود: أضفه
//       if (incomingChat) {
//         const newChat: any = {
//           ...incomingChat,
//           unreadCount,
//         };

//         ensurePreviewType(newChat);

//         state.chats.unshift(newChat);
//         state.totalUnread = state.totalUnread + unreadCount;
//       }
//     },

//     setActiveChat: (
//       state,
//       action: PayloadAction<string | undefined>
//     ) => {
//       /* 🔥 تنظيف typing للشات القديم */
//       if (state.activeChatId && state.typingUsers[state.activeChatId]) {
//         delete state.typingUsers[state.activeChatId];
//       }

//       state.activeChatId = action.payload;

//       if (!action.payload) return;

//       const chat = state.chats.find(
//         c => c._id === action.payload
//       );

//       if (!chat) return;

//       state.totalUnread = Math.max(
//         0,
//         state.totalUnread - Number(chat.unreadCount || 0)
//       );

//       chat.unreadCount = 0;
//     },

//     /* ================= MARK CHAT SEEN LOCALLY ================= */

//     markChatSeenLocally: (
//       state,
//       action: PayloadAction<string>
//     ) => {
//       const chatId = action.payload;

//       const chat = state.chats.find(
//         c => c._id === chatId
//       );

//       if (!chat) return;

//       state.totalUnread = Math.max(
//         0,
//         state.totalUnread - Number(chat.unreadCount || 0)
//       );

//       chat.unreadCount = 0;
//     },

//     updateChatPresence: (
//       state,
//       action: PayloadAction<{
//         userId: string;
//         isOnline: boolean;
//         lastSeen?: string | null;
//       }>
//     ) => {
//       const { userId, isOnline, lastSeen } = action.payload;

//       state.chats.forEach(chat => {
//         chat.participants.forEach((participant: any) => {
//           // participant قد يكون string أو object
//           if (typeof participant === "string") return;

//           if (participant._id === userId) {
//             participant.isOnline = isOnline;
//             participant.lastSeen = lastSeen || undefined;
//           }
//         });
//       });
//     },

//     /* ================= SOCKET NEW MESSAGE ================= */

//     socketNewMessage: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         message: any;
//       }>
//     ) => {
//       const { chatId, message } = action.payload;

//       const idx = state.chats.findIndex(c => c._id === chatId);
//       if (idx === -1) return;

//       const oldChat = state.chats[idx];

//       // ✅ لا تلمس participants إطلاقًا
//       const newChat: ChatItem = {
//         ...oldChat,
//         lastMessage: message,
//         lastMessagePreview: message?.content ?? oldChat.lastMessagePreview,
//         lastMessageType: message?.type ?? oldChat.lastMessageType,
//         updatedAt: message?.updatedAt || message?.createdAt || new Date().toISOString()
//       };

//       // ✅ حرّكه للأعلى
//       state.chats.splice(idx, 1);
//       state.chats.unshift(newChat);
//     },

//     /* ================= SYNC UNREAD ================= */

//     setUnreadFromServer: (
//       state,
//       action: PayloadAction<{
//         chatId: string;
//         unreadCount: number;
//       }>
//     ) => {
//       const { chatId, unreadCount } = action.payload;

//       const chat = state.chats.find(c => c._id === chatId);
//       if (!chat) return;

//       chat.unreadCount = Number(unreadCount || 0);

//       // ✅ إعادة حساب سليمة
//       recomputeTotalUnread(state);
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
//       const { chatId, userId, typing } = action.payload;

//       if (!state.typingUsers[chatId]) {
//         state.typingUsers[chatId] = [];
//       }

//       if (typing) {
//         if (!state.typingUsers[chatId].includes(userId)) {
//           state.typingUsers[chatId].push(userId);
//         }
//       } else {
//         state.typingUsers[chatId] =
//           state.typingUsers[chatId].filter(id => id !== userId);
//       }
//     },
//   },

//   extraReducers: builder => {
//     builder
//       .addCase(fetchChats.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(fetchChats.fulfilled, (state, action) => {
//         state.loading = false;

//         const { chats: serverChats, userId } = action.payload;

//         state.currentUserId = userId;

//         serverChats.forEach((serverChat: any) => {
//           ensurePreviewType(serverChat);

//           const existingChat = state.chats.find(
//             c => c._id === serverChat._id
//           );

//           if (!existingChat) {
//             state.chats.push(serverChat);
//             return;
//           }

//           const localTime = new Date(existingChat.updatedAt).getTime();
//           const serverTime = new Date(serverChat.updatedAt).getTime();

//           // 🔥 لا تستبدل إلا لو السيرفر أحدث
//           if (serverTime > localTime) {
//             const prevParticipants = existingChat.participants;

//             Object.assign(existingChat, serverChat);

//             // 🔥 لو السيرفر رجع participants ids فقط، لا تدهس populated
//             if (
//               isParticipantsIdsOnly(serverChat.participants) &&
//               isParticipantsObjects(prevParticipants)
//             ) {
//               existingChat.participants = prevParticipants;
//             }
//           }
//         });

//         // ✅ ترتيب (مفيد)
//         state.chats.sort(
//           (a, b) =>
//             new Date(b.updatedAt).getTime() -
//             new Date(a.updatedAt).getTime()
//         );

//         recomputeTotalUnread(state);
//       })

//       .addCase(fetchChats.rejected, (state) => {
//         state.loading = false;
//       })

//       .addCase(createChat.fulfilled, (state, action) => {
//         const exists = state.chats.find(
//           c => c._id === action.payload._id
//         );
//         if (!exists) {
//           const chat: any = action.payload;
//           ensurePreviewType(chat);
//           state.chats.unshift(chat);
//         }
//       })

//       .addCase(fetchTotalUnread.fulfilled, (state, action) => {
//         state.totalUnread = Number(action.payload || 0);
//       })

//       /* ================= MARK CHAT SEEN ================= */

//       .addCase(markChatSeen.fulfilled, (state, action) => {
//         const chatId = action.payload;

//         const chat = state.chats.find(
//           c => c._id === chatId
//         );

//         if (!chat) return;

//         state.totalUnread = Math.max(
//           0,
//           state.totalUnread - Number(chat.unreadCount || 0)
//         );

//         chat.unreadCount = 0;
//       })

//       /* ================= DELETE CHAT ================= */

//       .addCase(deleteChat.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(deleteChat.fulfilled, (state, action) => {
//         state.loading = false;

//         const chatId = action.payload;
//         const chat = state.chats.find(c => c._id === chatId);

//         if (chat) {
//           state.totalUnread = Math.max(
//             0,
//             state.totalUnread - Number(chat.unreadCount || 0)
//           );
//         }

//         state.chats = state.chats.filter(c => c._id !== chatId);

//         if (state.activeChatId === chatId) {
//           state.activeChatId = undefined;
//         }
//       })

//       .addCase(deleteChat.rejected, (state, action) => {
//         state.loading = false;
//         console.log("❌ deleteChat.rejected:", action.payload);
//       })
//             .addCase(searchMessagesInChat.pending, (state) => {
//         state.searchLoading = true;
//         state.searchError = null;
//       })

//       .addCase(searchMessagesInChat.fulfilled, (state, action) => {
//         state.searchLoading = false;
//         state.searchResults = action.payload.results;
//         state.searchQuery = action.payload.query;
//         state.searchError = null;
//       })

//       .addCase(searchMessagesInChat.rejected, (state, action) => {
//         state.searchLoading = false;
//         state.searchResults = [];
//         state.searchError = action.payload || "Search failed";
//       });
//   }
// });

// export const {
//   setActiveChat,
//   socketNewMessage,
//   setUnreadFromServer,
//   setTyping,
//   resetChatState,
//   updateChatPresence,
//   socketUpsertChatFromInbox,
//   markChatSeenLocally,
//   clearSearchResults,
//   setSearchQuery
// } = chatSlice.actions;

// export default chatSlice.reducer;
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

export interface ChatParticipant {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  isInvisible?: boolean;
}

export interface ChatItem {
  _id: string;

  // ✅ أحيانًا قد تأتي participants كـ objects (populate) أو ids (strings)
  participants: (ChatParticipant | string)[];

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

export interface ChatSearchMessageItem {
  _id: string;
  chat: string;
  sender: string | {
    _id: string;
    username?: string;
    avatar?: string;
  };
  content: string;
  type: string;
  media?: any;
  replyTo?: any;
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

  searchResults: ChatSearchMessageItem[];
  searchLoading: boolean;
  searchError?: string | null;
  searchQuery: string;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: undefined,
  typingUsers: {},
  loading: false,
  totalUnread: 0,
  currentUserId: undefined,

  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchQuery: ""
};

/* =====================================================
   HELPERS (🔥 تمنع دهس participants populated)
===================================================== */

const isObj = (x: any) => x && typeof x === "object";

const isParticipantsIdsOnly = (parts: any): boolean =>
  Array.isArray(parts) && parts.length > 0 && typeof parts[0] === "string";

const isParticipantsObjects = (parts: any): boolean =>
  Array.isArray(parts) && parts.length > 0 && isObj(parts[0]);

const ensurePreviewType = (chat: any) => {
  if (!chat) return;

  if (!chat.lastMessagePreview && chat.lastMessage?.content) {
    chat.lastMessagePreview = String(chat.lastMessage.content || "");
  }

  if (!chat.lastMessageType && chat.lastMessage?.type) {
    chat.lastMessageType = String(chat.lastMessage.type || "text");
  }
};

const recomputeTotalUnread = (state: ChatState) => {
  state.totalUnread = state.chats.reduce(
    (sum, c) => sum + Number(c.unreadCount || 0),
    0
  );
};

const moveChatToTop = (state: ChatState, idx: number) => {
  const moved = state.chats.splice(idx, 1)[0];
  state.chats.unshift(moved);
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
  try {
    const res = await api.post("/chats", { targetId });
    return res.data;
  } catch {
    return thunkAPI.rejectWithValue("Failed to create chat") as any;
  }
});

export const searchMessagesInChat = createAsyncThunk<
  { chatId: string; query: string; results: ChatSearchMessageItem[] },
  { chatId: string; query: string },
  { rejectValue: string }
>(
  "chat/searchMessagesInChat",
  async ({ chatId, query }, thunkAPI) => {
    try {
      const q = String(query || "").trim();

      if (!q) {
        return {
          chatId,
          query: "",
          results: [],
        };
      }

      const res = await api.get(`/messages/${chatId}/search`, {
        params: { q },
      });

      return {
        chatId,
        query: q,
        results: Array.isArray(res.data) ? res.data : [],
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Search failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteChat = createAsyncThunk<
  string,
  string,
  { rejectValue: { chatId: string; message: string } }
>("chat/deleteChat", async (chatId, thunkAPI) => {
  try {
    console.log("🗑️ deleteChat thunk started");
    console.log("📌 chatId:", chatId);
    console.log("🌐 Sending DELETE request to:", `/chats/${chatId}`);

    const response = await api.delete(`/chats/${chatId}`);

    console.log("✅ deleteChat success");
    console.log("📦 response:", response?.data);

    return chatId;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Delete chat failed";

    console.log("❌ deleteChat failed");
    console.log("📌 failed chatId:", chatId);
    console.log("📛 error message:", message);
    console.log("📛 full error response:", error?.response?.data);

    return thunkAPI.rejectWithValue({
      chatId,
      message,
    });
  }
});

export const fetchTotalUnread = createAsyncThunk<
  number
>("chat/fetchTotalUnread", async (_, thunkAPI) => {
  try {
    const res = await api.get("/chats/unread/total");
    return res.data.total;
  } catch {
    return thunkAPI.rejectWithValue("Failed to get unread") as any;
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

    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchLoading = false;
      state.searchError = null;
      state.searchQuery = "";
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    hydrateChatsFromCache: (state, action: PayloadAction<ChatItem[]>) => {
      const cachedChats = Array.isArray(action.payload) ? action.payload : [];

      cachedChats.forEach((cachedChat) => {
        ensurePreviewType(cachedChat);

        const existing = state.chats.find((c) => c._id === cachedChat._id);

        if (!existing) {
          state.chats.push(cachedChat);
          return;
        }

        const existingTime = new Date(existing.updatedAt || 0).getTime();
        const cachedTime = new Date(cachedChat.updatedAt || 0).getTime();

        if (cachedTime >= existingTime) {
          const prevParticipants = existing.participants;

          Object.assign(existing, cachedChat);

          if (
            isParticipantsIdsOnly(cachedChat.participants) &&
            isParticipantsObjects(prevParticipants)
          ) {
            existing.participants = prevParticipants;
          }

          ensurePreviewType(existing);
        }
      });

      state.chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      recomputeTotalUnread(state);
    },

    upsertChatLocal: (state, action: PayloadAction<ChatItem>) => {
      const incoming = action.payload;
      ensurePreviewType(incoming);

      const idx = state.chats.findIndex((c) => c._id === incoming._id);

      if (idx === -1) {
        state.chats.unshift(incoming);
        recomputeTotalUnread(state);
        return;
      }

      const prevParticipants = state.chats[idx].participants;
      Object.assign(state.chats[idx], incoming);

      if (
        isParticipantsIdsOnly(incoming.participants) &&
        isParticipantsObjects(prevParticipants)
      ) {
        state.chats[idx].participants = prevParticipants;
      }

      ensurePreviewType(state.chats[idx]);
      moveChatToTop(state, idx);
      recomputeTotalUnread(state);
    },

    /* ================= SOCKET / INBOX UPSERT ================= */

    socketUpsertChatFromInbox: (
      state,
      action: PayloadAction<{
        chat?: any;
        chatId?: string;
        unreadCount?: number;
      }>
    ) => {
      const incomingChat = action.payload.chat;
      const chatId = incomingChat?._id || action.payload.chatId;
      if (!chatId) return;

      const unreadCount = Number(action.payload.unreadCount ?? 0);

      const idx = state.chats.findIndex((c) => c._id === chatId);

      if (idx !== -1) {
        const chat = state.chats[idx];
        const prevUnread = Number(chat.unreadCount || 0);

        if (incomingChat) {
          const prevParticipants = chat.participants;

          Object.assign(chat, incomingChat);

          if (
            isParticipantsIdsOnly(incomingChat.participants) &&
            isParticipantsObjects(prevParticipants)
          ) {
            chat.participants = prevParticipants;
          }

          chat.unreadCount = unreadCount;
          ensurePreviewType(chat);
        } else {
          chat.unreadCount = unreadCount;
          chat.updatedAt = new Date().toISOString();
        }

        moveChatToTop(state, idx);

        state.totalUnread = Math.max(
          0,
          state.totalUnread - prevUnread + unreadCount
        );
        return;
      }

      if (incomingChat) {
        const newChat: any = {
          ...incomingChat,
          unreadCount,
        };

        ensurePreviewType(newChat);

        state.chats.unshift(newChat);
        state.totalUnread = state.totalUnread + unreadCount;
      }
    },

    /* ================= ACTIVE CHAT ================= */

    setActiveChat: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
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
        state.totalUnread - Number(chat.unreadCount || 0)
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
        state.totalUnread - Number(chat.unreadCount || 0)
      );

      chat.unreadCount = 0;
    },

    /* ================= PRESENCE ================= */

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
        chat.participants.forEach((participant: any) => {
          if (typeof participant === "string") return;

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

      const idx = state.chats.findIndex(c => c._id === chatId);
      if (idx === -1) return;

      const oldChat = state.chats[idx];

      const newChat: ChatItem = {
        ...oldChat,
        lastMessage: message,
        lastMessagePreview: message?.content ?? oldChat.lastMessagePreview,
        lastMessageType: message?.type ?? oldChat.lastMessageType,
        updatedAt:
          message?.updatedAt ||
          message?.createdAt ||
          new Date().toISOString()
      };

      state.chats.splice(idx, 1);
      state.chats.unshift(newChat);
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

      chat.unreadCount = Number(unreadCount || 0);
      recomputeTotalUnread(state);
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

      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }

      if (typing) {
        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId);
        }
      } else {
        state.typingUsers[chatId] =
          state.typingUsers[chatId].filter(id => id !== userId);
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

        const { chats: serverChats, userId } = action.payload;
        state.currentUserId = userId;

        serverChats.forEach((serverChat: any) => {
          ensurePreviewType(serverChat);

          const existingChat = state.chats.find(
            c => c._id === serverChat._id
          );

          if (!existingChat) {
            state.chats.push(serverChat);
            return;
          }

          const localTime = new Date(existingChat.updatedAt).getTime();
          const serverTime = new Date(serverChat.updatedAt).getTime();

          if (serverTime > localTime) {
            const prevParticipants = existingChat.participants;

            Object.assign(existingChat, serverChat);

            if (
              isParticipantsIdsOnly(serverChat.participants) &&
              isParticipantsObjects(prevParticipants)
            ) {
              existingChat.participants = prevParticipants;
            }

            ensurePreviewType(existingChat);
          }
        });

        state.chats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        );

        recomputeTotalUnread(state);
      })

      .addCase(fetchChats.rejected, (state) => {
        state.loading = false;
      })

      .addCase(createChat.fulfilled, (state, action) => {
        const exists = state.chats.find(
          c => c._id === action.payload._id
        );

        if (!exists) {
          const chat: any = action.payload;
          ensurePreviewType(chat);
          state.chats.unshift(chat);
          recomputeTotalUnread(state);
        }
      })

      .addCase(fetchTotalUnread.fulfilled, (state, action) => {
        state.totalUnread = Number(action.payload || 0);
      })

      .addCase(markChatSeen.fulfilled, (state, action) => {
        const chatId = action.payload;

        const chat = state.chats.find(
          c => c._id === chatId
        );

        if (!chat) return;

        state.totalUnread = Math.max(
          0,
          state.totalUnread - Number(chat.unreadCount || 0)
        );

        chat.unreadCount = 0;
      })

      .addCase(deleteChat.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteChat.fulfilled, (state, action) => {
        state.loading = false;

        const chatId = action.payload;
        const chat = state.chats.find(c => c._id === chatId);

        if (chat) {
          state.totalUnread = Math.max(
            0,
            state.totalUnread - Number(chat.unreadCount || 0)
          );
        }

        state.chats = state.chats.filter(c => c._id !== chatId);

        if (state.activeChatId === chatId) {
          state.activeChatId = undefined;
        }
      })

      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        console.log("❌ deleteChat.rejected:", action.payload);
      })

      .addCase(searchMessagesInChat.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })

      .addCase(searchMessagesInChat.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results;
        state.searchQuery = action.payload.query;
        state.searchError = null;
      })

      .addCase(searchMessagesInChat.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchResults = [];
        state.searchError = action.payload || "Search failed";
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
  socketUpsertChatFromInbox,
  markChatSeenLocally,
  clearSearchResults,
  setSearchQuery,
  hydrateChatsFromCache,
  upsertChatLocal,
} = chatSlice.actions;

export default chatSlice.reducer;