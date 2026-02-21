// room.slice.ts
import api from "@/services/api";
import {
    createAsyncThunk,
    createSelector,
    createSlice,
    PayloadAction
} from "@reduxjs/toolkit";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export type RoomType = "public" | "private" | "protected" | "subscription";
export type RoomPremiumLevel = 0 | 1 | 2 | 3 | 4;

export type RoomUser = {
  _id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: "creator" | "owner" | "admin" | "member";
  isVip?: boolean;
  vipExpiresAt?: string | null;
  isMuted?: boolean;
  mutedUntil?: string | null;
  isActive?: boolean;
};

export type RoomMessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "system"
  | "announcement"
  | "join"
  | "leave"
  | "gif"        // ✅ أضفها
  | "sticker"    // ✅ أضفها
  | "promotion"
  | "ban"
  | "gift";

export type RoomMessage = {
  _id: string;
  room: string;
  sender?: RoomUser | string;

  type: RoomMessageType;
  content: string;

  replyTo?: any;
  mentions?: string[];

  media?: {
    url: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };

  gift?: {
    name: string;
    value: number;
    animation?: string;
  };

  isPinned?: boolean;
  isHighlighted?: boolean;

  reactions?: { user: string; emoji: string; createdAt: string }[];

  deletedForEveryone?: boolean;

  createdAt: string;
  updatedAt: string;
};

export type RoomItem = {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;

  creator?: string;

  type: RoomType;
  maxUsers?: number;

  usersCount?: number;
  messagesCount?: number;

  premiumLevel?: RoomPremiumLevel;

  isLocked?: boolean;
  slowModeSeconds?: number;

  antiSpamEnabled?: boolean;
  maxMessagesPerMinute?: number;

  level?: number;
  xp?: number;

  boostLevel?: number;
  boostExpiresAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type RoomStats = {
  roomId: string;
  activeCount: number;
  totalUsersCount: number;
  messagesCount: number;
  level: number;
  xp: number;
  boostLevel: number;
  boostExpiresAt?: string;
};

type Pagination = { limit?: number; before?: string };

type RoomState = {
  rooms: RoomItem[];
  activeRoomId?: string;

  usersByRoom: Record<string, RoomUser[]>;
  messagesByRoom: Record<string, RoomMessage[]>;

  loadingRooms: boolean;
  loadingUsers: boolean;
  loadingMessages: boolean;

  sending: boolean;
  mutatingRoom: boolean;

  error?: string;

  currentUserId?: string;
};

const initialState: RoomState = {
  rooms: [],
  activeRoomId: undefined,

  usersByRoom: {},
  messagesByRoom: {},

  loadingRooms: false,
  loadingUsers: false,
  loadingMessages: false,

  sending: false,
  mutatingRoom: false,

  error: undefined,

  currentUserId: undefined
};

/* =====================================================
   HELPERS
===================================================== */

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.message || e?.message || fallback;

const dataOf = (res: any) => res?.data?.data ?? res?.data;

/* =====================================================
   ASYNC THUNKS
===================================================== */

/* ================= USERS & STATS ================= */

export const fetchRoomUsers = createAsyncThunk<
  { roomId: string; users: RoomUser[] },
  string,
  { state: RootState }
>("room/fetchRoomUsers", async (roomId, thunkAPI) => {
  try {
    const res = await api.get(`/rooms/${roomId}/users`);
    const payload = dataOf(res);
    return { roomId, users: payload?.users ?? payload ?? [] };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to fetch users"));
  }
});

export const fetchRoomStats = createAsyncThunk<RoomStats, string, { state: RootState }>(
  "room/fetchRoomStats",
  async (roomId, thunkAPI) => {
    try {
      const res = await api.get(`/rooms/${roomId}/stats`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Failed to fetch stats"));
    }
  }
);

/* ================= MEMBERSHIP ================= */

export const joinRoom = createAsyncThunk<{ roomId: string }, string, { state: RootState }>(
  "room/joinRoom",
  async (roomId, thunkAPI) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🟨 joinRoom START");
    console.log("roomId:", roomId);
    console.log("endpoint:", `/rooms/${roomId}/join`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      console.log("➡️ joinRoom BEFORE api.post");
      const res = await api.post(`/rooms/${roomId}/join`);
      console.log("✅ joinRoom AFTER api.post");
      console.log("status:", res?.status);
      console.log("data:", res?.data);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return { roomId };
    } catch (e: any) {
      console.log("❌ joinRoom ERROR");
      console.log("message:", e?.message);
      console.log("status:", e?.response?.status);
      console.log("data:", e?.response?.data);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      return thunkAPI.rejectWithValue(errMsg(e, "Join failed"));
    }
  }
);

export const leaveRoom = createAsyncThunk<{ roomId: string }, string, { state: RootState }>(
  "room/leaveRoom",
  async (roomId, thunkAPI) => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
      return { roomId };
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Leave failed"));
    }
  }
);

export const autoRejoin = createAsyncThunk<string[], void, { state: RootState }>(
  "room/autoRejoin",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`/rooms/me/active-rooms`);
      const payload = dataOf(res);
      return Array.isArray(payload) ? payload : payload?.rooms ?? [];
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Failed to load active rooms"));
    }
  }
);

/* ================= MESSAGES ================= */

// ✅ إرسال رسالة (REST)
export const sendRoomMessage = createAsyncThunk<
  { roomId: string; message: RoomMessage },
  {
    roomId: string;
    content?: string;
    type?: RoomMessageType;
    replyTo?: string;
    mentions?: string[];
    media?: RoomMessage["media"];
    gift?: RoomMessage["gift"];
  },
  { state: RootState }
>("room/sendRoomMessage", async (payload, thunkAPI) => {
  try {
    const res = await api.post(`/rooms/${payload.roomId}/messages`, payload);
    const msg: RoomMessage = dataOf(res);
    return { roomId: payload.roomId, message: msg };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Send failed"));
  }
});

// ✅ جلب رسائل الغرفة (GET /rooms/:roomId/messages?limit&before)
export const fetchRoomMessages = createAsyncThunk<
  { roomId: string; messages: RoomMessage[]; append: boolean },
  { roomId: string; pagination?: Pagination; append?: boolean },
  { state: RootState }
>("room/fetchRoomMessages", async ({ roomId, pagination, append }, thunkAPI) => {
  try {
    const params = new URLSearchParams();
    if (pagination?.limit) params.set("limit", String(pagination.limit));
    if (pagination?.before) params.set("before", String(pagination.before));

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/rooms/${roomId}/messages${qs}`);

    const messages: RoomMessage[] = dataOf(res) ?? [];
    return { roomId, messages, append: Boolean(append) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to fetch messages"));
  }
});

// ✅ Pin message
export const pinRoomMessage = createAsyncThunk<
  { roomId: string; message: RoomMessage },
  { roomId: string; messageId: string; pinned?: boolean },
  { state: RootState }
>("room/pinRoomMessage", async ({ roomId, messageId, pinned }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/messages/${messageId}/pin`, { pinned });
    const message: RoomMessage = dataOf(res);
    return { roomId, message };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Pin failed"));
  }
});

// ✅ Toggle reaction
export const toggleRoomReaction = createAsyncThunk<
  { roomId: string; messageId: string; reactions: { user: string; emoji: string; createdAt: string }[] },
  { roomId: string; messageId: string; emoji: string },
  { state: RootState }
>("room/toggleRoomReaction", async ({ roomId, messageId, emoji }, thunkAPI) => {
  try {
    const res = await api.post(`/rooms/${roomId}/messages/${messageId}/reaction`, { emoji });
    const reactions = dataOf(res);
    return { roomId, messageId, reactions: Array.isArray(reactions) ? reactions : [] };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Reaction failed"));
  }
});

/* ================= ROOMS LIST / CREATE / SEARCH ================= */

export const createRoom = createAsyncThunk<
  RoomItem,
  {
    name: string;
    description?: string;
    avatar?: string;
    cover?: string;
    type?: RoomType;
    maxUsers?: number;
    password?: string;
    subscriptionPrice?: number;
    tags?: string[];
    slowModeSeconds?: number;
    premiumLevel?: RoomPremiumLevel;
  },
  { state: RootState }
>("room/createRoom", async (payload, thunkAPI) => {
  try {
    const res = await api.post(`/rooms`, payload);
    const room: RoomItem = dataOf(res);
    return room;
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Create room failed"));
  }
});

export const fetchRoomsByType = createAsyncThunk<
  { items: RoomItem[]; type: RoomType; page?: number; limit?: number; total?: number; pages?: number },
  { type: RoomType; page?: number; limit?: number },
  { state: RootState }
>("room/fetchRoomsByType", async ({ type, page, limit }, thunkAPI) => {
  try {
    const params = new URLSearchParams();
    params.set("type", type);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));

    const res = await api.get(`/rooms?${params.toString()}`);
    const data = dataOf(res);

    const items: RoomItem[] = Array.isArray(data) ? data : data?.items ?? [];
    return {
      items,
      type,
      page: data?.page,
      limit: data?.limit,
      total: data?.total,
      pages: data?.pages
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Fetch rooms failed"));
  }
});

export const searchRooms = createAsyncThunk<
  { q: string; items: RoomItem[]; type?: RoomType },
  { q: string; type?: RoomType; limit?: number },
  { state: RootState }
>("room/searchRooms", async ({ q, type, limit }, thunkAPI) => {
  try {
    const params = new URLSearchParams();
    params.set("q", q);
    if (type) params.set("type", type);
    if (limit) params.set("limit", String(limit));

    const res = await api.get(`/rooms/search?${params.toString()}`);
    const data = dataOf(res);

    const items: RoomItem[] = Array.isArray(data) ? data : data?.items ?? data ?? [];
    return { q, items, type };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Search failed"));
  }
});

/* ================= ROOM SETTINGS ================= */

export const updateRoomInfo = createAsyncThunk<
  RoomItem,
  { roomId: string; data: Partial<Pick<RoomItem, "name" | "description" | "avatar" | "cover">> },
  { state: RootState }
>("room/updateRoomInfo", async ({ roomId, data }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}`, data);
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Room update failed"));
  }
});

export const changeRoomType = createAsyncThunk<
  RoomItem,
  { roomId: string; type: RoomType },
  { state: RootState }
>("room/changeRoomType", async ({ roomId, type }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/type`, { type });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Room type update failed"));
  }
});

export const changeRoomPremium = createAsyncThunk<
  RoomItem,
  { roomId: string; level: RoomPremiumLevel },
  { state: RootState }
>("room/changeRoomPremium", async ({ roomId, level }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/premium`, { level });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Room premium update failed"));
  }
});

export const toggleAntiSpam = createAsyncThunk<
  RoomItem,
  { roomId: string; enabled: boolean; max?: number },
  { state: RootState }
>("room/toggleAntiSpam", async ({ roomId, enabled, max }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/anti-spam`, { enabled, max });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Anti-spam update failed"));
  }
});

/* ================= VIP ================= */

export const addVip = createAsyncThunk<
  any,
  { roomId: string; targetId: string; days: number },
  { state: RootState }
>("room/addVip", async ({ roomId, targetId, days }, thunkAPI) => {
  try {
    const res = await api.post(`/rooms/${roomId}/vip`, { targetId, days });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "VIP add failed"));
  }
});

export const removeVip = createAsyncThunk<any, { roomId: string; targetId: string }, { state: RootState }>(
  "room/removeVip",
  async ({ roomId, targetId }, thunkAPI) => {
    try {
      const res = await api.delete(`/rooms/${roomId}/vip/${targetId}`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "VIP remove failed"));
    }
  }
);

/* ================= POLL ================= */

export const startPoll = createAsyncThunk<
  any,
  { roomId: string; question: string; options: string[]; minutes: number },
  { state: RootState }
>("room/startPoll", async ({ roomId, question, options, minutes }, thunkAPI) => {
  try {
    const res = await api.post(`/rooms/${roomId}/poll`, { question, options, minutes });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Poll start failed"));
  }
});

export const votePoll = createAsyncThunk<
  any,
  { roomId: string; optionIndex: number },
  { state: RootState }
>("room/votePoll", async ({ roomId, optionIndex }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/poll/vote`, { optionIndex });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Vote failed"));
  }
});

export const endPoll = createAsyncThunk<any, { roomId: string }, { state: RootState }>(
  "room/endPoll",
  async ({ roomId }, thunkAPI) => {
    try {
      const res = await api.delete(`/rooms/${roomId}/poll`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Poll end failed"));
    }
  }
);

/* ================= VOICE ================= */

export const setMaxVoiceSeats = createAsyncThunk<
  { roomId: string; seats: number },
  { roomId: string; seats: number },
  { state: RootState }
>("room/setMaxVoiceSeats", async ({ roomId, seats }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/voice/seats`, { seats });
    const payload = dataOf(res);
    return { roomId, seats: payload?.seats ?? payload ?? seats };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Set seats failed"));
  }
});

export const raiseHand = createAsyncThunk<any, { roomId: string }, { state: RootState }>(
  "room/raiseHand",
  async ({ roomId }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/voice/raise-hand`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Raise hand failed"));
    }
  }
);

export const clearRaisedHand = createAsyncThunk<any, { roomId: string }, { state: RootState }>(
  "room/clearRaisedHand",
  async ({ roomId }, thunkAPI) => {
    try {
      const res = await api.delete(`/rooms/${roomId}/voice/raise-hand`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Clear hand failed"));
    }
  }
);

/* ================= LEVEL / XP ================= */

export const addXP = createAsyncThunk<any, { roomId: string; amount: number }, { state: RootState }>(
  "room/addXP",
  async ({ roomId, amount }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/xp`, { amount });
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "XP update failed"));
    }
  }
);

/* ================= BOOST ================= */

export const boostRoom = createAsyncThunk<
  RoomItem,
  { roomId: string; level: number; hours: number },
  { state: RootState }
>("room/boostRoom", async ({ roomId, level, hours }, thunkAPI) => {
  try {
    const res = await api.post(`/rooms/${roomId}/boost`, { level, hours });
    return dataOf(res);
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Boost failed"));
  }
});

/* ================= MODERATION ================= */

export const kickUser = createAsyncThunk<any, { roomId: string; targetId: string }, { state: RootState }>(
  "room/kickUser",
  async ({ roomId, targetId }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/kick/${targetId}`);
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Kick failed"));
    }
  }
);

/* ================= DELETE ROOM ================= */

export const deleteRoom = createAsyncThunk<{ roomId: string }, { roomId: string }, { state: RootState }>(
  "room/deleteRoom",
  async ({ roomId }, thunkAPI) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      return { roomId };
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Delete room failed"));
    }
  }
);

/* =====================================================
   JOIN & LEAVE HELPERS
===================================================== */

export const joinRoomAndEnter = createAsyncThunk<
  { roomId: string },
  { roomId: string; preload?: boolean },
  { state: RootState }
>("room/joinRoomAndEnter", async ({ roomId, preload }, thunkAPI) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚪 JOIN ROOM & ENTER START");
  console.log("RoomId:", roomId);
  console.log("Preload:", preload);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    console.log("➡️ Dispatch joinRoom...");
    await thunkAPI.dispatch(joinRoom(roomId)).unwrap();
    console.log("✅ joinRoom success");

    console.log("➡️ setActiveRoom...");
    thunkAPI.dispatch(setActiveRoom(roomId));
    console.log("✅ setActiveRoom done");

    if (preload) {
      console.log("➡️ Preloading users/messages/stats...");

      try {
        await Promise.all([
          thunkAPI.dispatch(fetchRoomUsers(roomId)).unwrap(),
          thunkAPI
            .dispatch(
              fetchRoomMessages({
                roomId,
                pagination: { limit: 30 },
                append: false
              })
            )
            .unwrap(),
          thunkAPI.dispatch(fetchRoomStats(roomId)).unwrap()
        ]);

        console.log("✅ Preload success");
      } catch (preloadError: any) {
        const msg =
          typeof preloadError === "string"
            ? preloadError
            : preloadError?.message || preloadError?.response?.data?.message || "Preload failed";
        console.log("⚠️ Preload failed:", msg);
      }
    }

    console.log("🎉 JOIN ROOM & ENTER COMPLETED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { roomId };
  } catch (e: any) {
    console.log("❌ JOIN ROOM & ENTER FAILED");
    console.log("Error message:", e?.message);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return thunkAPI.rejectWithValue(errMsg(e, "Join failed"));
  }
});

export const leaveRoomAndExit = createAsyncThunk<
  { roomId: string },
  { roomId: string; cleanup?: boolean },
  { state: RootState }
>("room/leaveRoomAndExit", async ({ roomId }, thunkAPI) => {
  try {
    await thunkAPI.dispatch(leaveRoom(roomId)).unwrap();

    const state = thunkAPI.getState();
    if (state.room.activeRoomId === roomId) {
      thunkAPI.dispatch(setActiveRoom(undefined));
    }

    return { roomId };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Leave failed"));
  }
});

/* =====================================================
   SLICE
===================================================== */

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    resetRoomState: () => initialState,

    setActiveRoom: (state, action: PayloadAction<string | undefined>) => {
      state.activeRoomId = action.payload;
      state.error = undefined;
    },

    socketUserJoined: (state, action: PayloadAction<{ roomId: string; userId: string }>) => {
      const { roomId, userId } = action.payload;
      const list = state.usersByRoom[roomId];
      if (!list) return;
      const exists = list.some((u) => u._id === userId);
      if (!exists) list.unshift({ _id: userId, username: "User" });
    },

    socketUserLeft: (state, action: PayloadAction<{ roomId: string; userId: string }>) => {
      const { roomId, userId } = action.payload;
      const list = state.usersByRoom[roomId];
      if (!list) return;
      state.usersByRoom[roomId] = list.filter((u) => u._id !== userId);
    },

    socketNewRoomMessage: (state, action: PayloadAction<{ roomId: string; message: RoomMessage }>) => {
      const { roomId, message } = action.payload;

      if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];

      const exists = state.messagesByRoom[roomId].some((m) => m._id === message._id);
      if (!exists) state.messagesByRoom[roomId].unshift(message);

      const room = state.rooms.find((r) => r._id === roomId);
      if (room) {
        room.messagesCount = (room.messagesCount || 0) + 1;
        room.updatedAt = message.updatedAt || message.createdAt;
      }
    },

    socketMessagePinned: (state, action: PayloadAction<{ roomId: string; message: RoomMessage }>) => {
      const { roomId, message } = action.payload;
      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const idx = list.findIndex((m) => m._id === message._id);
      if (idx >= 0) list[idx] = { ...list[idx], ...message };
    },

    socketMessageHighlighted: (state, action: PayloadAction<{ roomId: string; message: RoomMessage }>) => {
      const { roomId, message } = action.payload;
      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const idx = list.findIndex((m) => m._id === message._id);
      if (idx >= 0) list[idx] = { ...list[idx], ...message };
    },

    socketMessageDeleted: (state, action: PayloadAction<{ roomId: string; messageId: string }>) => {
      const { roomId, messageId } = action.payload;
      const list = state.messagesByRoom[roomId];
      if (!list) return;

      state.messagesByRoom[roomId] = list.map((m) =>
        m._id === messageId ? { ...m, deletedForEveryone: true } : m
      );
    },

    socketReactionUpdate: (
      state,
      action: PayloadAction<{
        roomId: string;
        messageId: string;
        reactions: { user: string; emoji: string; createdAt: string }[];
      }>
    ) => {
      const { roomId, messageId, reactions } = action.payload;
      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const msg = list.find((m) => m._id === messageId);
      if (!msg) return;

      msg.reactions = reactions;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(joinRoomAndEnter.pending, (state) => {
        state.mutatingRoom = true;
        state.error = undefined;
      })
      .addCase(joinRoomAndEnter.fulfilled, (state, action) => {
        state.mutatingRoom = false;
        state.activeRoomId = action.payload.roomId;
      })
      .addCase(joinRoomAndEnter.rejected, (state, action) => {
        state.mutatingRoom = false;
        state.error = (action.payload as any) || "Join failed";
      })

      .addCase(leaveRoomAndExit.pending, (state) => {
        state.mutatingRoom = true;
        state.error = undefined;
      })
      .addCase(leaveRoomAndExit.fulfilled, (state, action) => {
        state.mutatingRoom = false;
        const roomId = action.payload.roomId;

        if (state.activeRoomId === roomId) state.activeRoomId = undefined;

        delete state.usersByRoom[roomId];
        delete state.messagesByRoom[roomId];
      })
      .addCase(leaveRoomAndExit.rejected, (state, action) => {
        state.mutatingRoom = false;
        state.error = (action.payload as any) || "Leave failed";
      })

      .addCase(fetchRoomUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = undefined;
      })
      .addCase(fetchRoomUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.usersByRoom[action.payload.roomId] = action.payload.users;
      })
      .addCase(fetchRoomUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = (action.payload as any) || "Failed";
      })

      .addCase(fetchRoomStats.pending, (state) => {
        state.mutatingRoom = true;
        state.error = undefined;
      })
      .addCase(fetchRoomStats.fulfilled, (state) => {
        state.mutatingRoom = false;
      })
      .addCase(fetchRoomStats.rejected, (state, action) => {
        state.mutatingRoom = false;
        state.error = (action.payload as any) || "Failed to fetch stats";
      })

      .addCase(joinRoom.rejected, (state, action) => {
        state.error = (action.payload as any) || "Join failed";
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.error = (action.payload as any) || "Leave failed";
      })
      .addCase(autoRejoin.rejected, (state, action) => {
        state.error = (action.payload as any) || "Failed";
      })

      .addCase(sendRoomMessage.pending, (state) => {
        state.sending = true;
        state.error = undefined;
      })
      .addCase(sendRoomMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { roomId, message } = action.payload;

        if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];
        const exists = state.messagesByRoom[roomId].some((m) => m._id === message._id);
        if (!exists) state.messagesByRoom[roomId].unshift(message);
      })
      .addCase(sendRoomMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = (action.payload as any) || "Send failed";
      })

      // ✅ (مطلوب) ريدوسر جلب الرسائل
      .addCase(fetchRoomMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = undefined;
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const { roomId, messages, append } = action.payload;

        if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];

        if (append) {
          const existingIds = new Set(state.messagesByRoom[roomId].map((m) => m._id));
          const filtered = messages.filter((m) => !existingIds.has(m._id));
          state.messagesByRoom[roomId].push(...filtered);
        } else {
          state.messagesByRoom[roomId] = messages;
        }
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = (action.payload as any) || "Failed to fetch messages";
      })

      .addCase(fetchRoomsByType.pending, (state) => {
        state.loadingRooms = true;
        state.error = undefined;
      })
      .addCase(fetchRoomsByType.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload.items;
      })
      .addCase(fetchRoomsByType.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = (action.payload as any) || "Fetch rooms failed";
      })

      .addCase(createRoom.pending, (state) => {
        state.loadingRooms = true;
        state.error = undefined;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loadingRooms = false;
        const room = action.payload;
        const exists = state.rooms.some((r) => r._id === room._id);
        if (!exists) state.rooms.unshift(room);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = (action.payload as any) || "Create room failed";
      })

      .addCase(searchRooms.pending, (state) => {
        state.loadingRooms = true;
        state.error = undefined;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload.items;
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = (action.payload as any) || "Search failed";
      })

      .addMatcher(
        (action) =>
          action.type.startsWith("room/") &&
          action.type.endsWith("/pending") &&
          [
            updateRoomInfo.typePrefix,
            changeRoomType.typePrefix,
            changeRoomPremium.typePrefix,
            toggleAntiSpam.typePrefix,
            addVip.typePrefix,
            removeVip.typePrefix,
            startPoll.typePrefix,
            votePoll.typePrefix,
            endPoll.typePrefix,
            setMaxVoiceSeats.typePrefix,
            raiseHand.typePrefix,
            clearRaisedHand.typePrefix,
            addXP.typePrefix,
            boostRoom.typePrefix,
            kickUser.typePrefix,
            deleteRoom.typePrefix,
            pinRoomMessage.typePrefix,
            toggleRoomReaction.typePrefix
          ].some((p) => action.type.startsWith(p)),
        (state) => {
          state.mutatingRoom = true;
          state.error = undefined;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("room/") &&
          action.type.endsWith("/fulfilled") &&
          [updateRoomInfo.typePrefix, changeRoomType.typePrefix, changeRoomPremium.typePrefix, toggleAntiSpam.typePrefix, boostRoom.typePrefix].some((p) =>
            action.type.startsWith(p)
          ),
        (state, action: any) => {
          state.mutatingRoom = false;
          const updated: RoomItem = action.payload;
          if (!updated?._id) return;
          const idx = state.rooms.findIndex((r) => r._id === updated._id);
          if (idx >= 0) state.rooms[idx] = { ...state.rooms[idx], ...updated };
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("room/") && action.type.endsWith("/fulfilled"),
        (state, action: any) => {
          if (action.type.startsWith(deleteRoom.typePrefix)) {
            state.mutatingRoom = false;
            const roomId = action.payload?.roomId;
            if (roomId) {
              state.rooms = state.rooms.filter((r) => r._id !== roomId);
              delete state.usersByRoom[roomId];
              delete state.messagesByRoom[roomId];
              if (state.activeRoomId === roomId) state.activeRoomId = undefined;
            }
          }

          if (action.type.startsWith(pinRoomMessage.typePrefix)) {
            state.mutatingRoom = false;
            const { roomId, message } = action.payload || {};
            const list = state.messagesByRoom[roomId];
            if (roomId && message && list) {
              const idx = list.findIndex((m) => m._id === message._id);
              if (idx >= 0) list[idx] = { ...list[idx], ...message };
            }
          }

          if (action.type.startsWith(toggleRoomReaction.typePrefix)) {
            state.mutatingRoom = false;
            const { roomId, messageId, reactions } = action.payload || {};
            const list = state.messagesByRoom[roomId];
            const msg = list?.find((m) => m._id === messageId);
            if (msg) msg.reactions = reactions;
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("room/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.mutatingRoom = false;
          state.sending = false;
          state.loadingRooms = false;
          state.loadingUsers = false;
          state.loadingMessages = false;
          state.error = action.payload || "Failed";
        }
      );
  }
});

/* =====================================================
   EXPORTS (كما طلبت)
===================================================== */

export const {
  setActiveRoom,
  resetRoomState,

  socketUserJoined,
  socketUserLeft,

  socketNewRoomMessage,
  socketMessagePinned,
  socketMessageHighlighted,
  socketMessageDeleted,
  socketReactionUpdate
} = roomSlice.actions;

export default roomSlice.reducer;

/* =====================================================
   SELECTORS (Fix warning + إضافة جلب الرسائل)
===================================================== */

const EMPTY_USERS: RoomUser[] = [];
const EMPTY_MESSAGES: RoomMessage[] = [];

export const selectRooms = (state: RootState) => state.room.rooms;
export const selectActiveRoomId = (state: RootState) => state.room.activeRoomId;

export const selectRoomUsers = createSelector(
  [(state: RootState) => state.room.usersByRoom, (_: RootState, roomId: string) => roomId],
  (usersByRoom, roomId) => usersByRoom[roomId] ?? EMPTY_USERS
);

export const selectRoomMessages = createSelector(
  [(state: RootState) => state.room.messagesByRoom, (_: RootState, roomId: string) => roomId],
  (messagesByRoom, roomId) => messagesByRoom[roomId] ?? EMPTY_MESSAGES
);

export const selectRoomLoadingUsers = (state: RootState) => state.room.loadingUsers;
export const selectRoomLoadingMessages = (state: RootState) => state.room.loadingMessages;
export const selectRoomLoadingRooms = (state: RootState) => state.room.loadingRooms;

export const selectRoomError = (state: RootState) => state.room.error;