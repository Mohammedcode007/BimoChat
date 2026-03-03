// room.slice.ts
import api from "@/services/api";
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */
export type RoomBannedEntry = {
  user: UserPublicSnapshot;
  reason?: string;
  bannedAt?: string;
  until?: string | null; // لو عندك حظر مؤقت
};
export type GiftPayload = {
  key: string;          // gift_rose / boost_rocket ...
  name: string;         // rose / boost
  value: number;        // السعر/المستوى...
  icon?: string;        // 🌹🔥🚀...
  targetId?: string;    // المستخدم المستهدف
  targetName?: string;  // اسم المستهدف (سهل للعرض)
  animation?: string;   // rocket / burst / rain ...
};

export type RoomDetails = {
  room: {
    _id: string;
    name: string;
    description: string;

    avatar: string;
    cover: string;

    type: RoomType;
    premiumLevel?: RoomPremiumLevel;

    maxUsers?: number;
    subscriptionPrice?: number;

    isLocked: boolean;
    slowModeSeconds: number;

    antiSpamEnabled: boolean;
    maxMessagesPerMinute: number;

    maxVoiceSeats: number;

    usersCount: number;
    messagesCount: number;
    totalRevenue: number;

    level: number;
    xp: number;
    boostLevel: number;
    boostPoints: number;
    boostExpiresAt?: string | null;

    isVerified: boolean;
    tags: string[];

    activePoll?: any | null;

    createdAt?: string;
    updatedAt?: string;

    // derived
    passwordProtected: boolean;
    membersCount: number;
  };

  lists: {
    creator: UserPublicSnapshot;
    owners: UserPublicSnapshot[];
    admins: UserPublicSnapshot[];
    activeUsers: UserPublicSnapshot[];

    voiceSpeakers: UserPublicSnapshot[];
    voiceQueue: UserPublicSnapshot[];
    raisedHands: UserPublicSnapshot[];

    vipUsers: RoomVipEntry[];
    mutedUsers: RoomMutedEntry[];
  };

  my: {
    userId: string;
    role: "creator" | "owner" | "admin" | "member" | "none";
    canManage: boolean;
    isInside: boolean;
  };
};
export type RoomType = "public" | "private" | "protected" | "subscription";
export type RoomPremiumLevel = 0 | 1 | 2 | 3 | 4;
export type UserPublicSnapshot = {
  _id: string;
  username: string;
  atUsername?: string;
  avatar?: string;
  coverImage?: string;
  isOnline?: boolean;
  lastSeen?: string | null;
  role?: string;

  // customization
  activeCustomization?: {
    avatarFrame?: string;
    messageEffect?: string;
    profileEntryAnimation?: string;
    badges?: string[];
    verificationType?: "none" | "blue" | "gold" | "business";
  };

  verificationType?: "none" | "blue" | "gold" | "business";
  avatarFrame?: string;
  badges?: string[];
  ownedMessageEffects?: string[];
  ownedGifts?: string[];
  profileEntryAnimation?: string;

  followersCount?: number;
  followingCount?: number;
  totalLikesReceived?: number;
  totalRetweetsReceived?: number;
  profileViews?: number;
};
export type RoomVipEntry = { user: UserPublicSnapshot; expiresAt: string };
export type RoomMutedEntry = { user: UserPublicSnapshot; until: string; reason?: string };
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
  | "gif"
  | "sticker"
  | "promotion"
  | "role"
  | "ban"
  | "gift";

export type RoomMessageSender = RoomUser | string | null;

export type RoomMessage = {
  _id: string;
  room: string;
  gift?: GiftPayload;

  sender?: RoomMessageSender;
  senderSnapshot?: UserPublicSnapshot;
  type: RoomMessageType;
  content: string;

  replyTo?: any;
  mentions?: string[];

  // رسائل النظام (تغيير دور/حظر/طرد..)
  actorName?: string;
  targetName?: string;
  role?: "owner" | "admin" | "member";

  media?: {
    url: string;
    fileName?: string;
    fileSize?: string;
    mimeType?: string;
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
  isActive?: boolean; // ✅ هل المستخدم الحالي داخل activeUsers

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
  detailsByRoom: Record<string, RoomDetails | undefined>;
  loadingDetails: boolean;
  // Active count per room
  activeCountByRoom: Record<string, number>;
  kickedByRoom: Record<string, { at: number; message?: string }>;
  bannedByRoom: Record<string, { at: number; reason?: string }>;
  usersByRoom: Record<string, RoomUser[]>;
  messagesByRoom: Record<string, RoomMessage[]>;
  bannedUsersByRoom: Record<string, RoomBannedEntry[]>;
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
  activeCountByRoom: {},
  usersByRoom: {},
  messagesByRoom: {},
  detailsByRoom: {},
  loadingDetails: false,
  loadingRooms: false,
    bannedUsersByRoom: {},
  loadingUsers: false,
  loadingMessages: false,
  kickedByRoom: {} as Record<string, { at: number; message?: string }>,
  bannedByRoom: {} as Record<string, { at: number; reason?: string }>,
  sending: false,
  mutatingRoom: false,

  error: undefined,

  currentUserId: undefined
};

/* =====================================================
   HELPERS
===================================================== */

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;

const dataOf = (res: any) => res?.data?.data ?? res?.data;

const toStr = (x: any) => (x === null || x === undefined ? "" : String(x));

const findRoomIdByMessageId = (
  messagesByRoom: Record<string, RoomMessage[]>,
  messageId: string
) => {
  for (const rid of Object.keys(messagesByRoom)) {
    const list = messagesByRoom[rid] || [];
    if (list.some((m) => m?._id === messageId)) return rid;
  }
  return undefined;
};

/* ================= BANNED (Control) ================= */

export const fetchBannedUsers = createAsyncThunk<
  { roomId: string; list: RoomBannedEntry[] },
  { roomId: string },
  { state: RootState }
>("room/fetchBannedUsers", async ({ roomId }, thunkAPI) => {
  const startedAt = Date.now();
  const log = (...args: any[]) => console.log("[fetchBannedUsers]", ...args);

  try {
    log("=====================================");
    log("START roomId:", roomId);

    const res = await api.get(`/rooms/${roomId}/control/banned`);
    log("Raw response.data:", res?.data);

    const data = dataOf(res);
    log("After dataOf(res):", data);

    // ✅ هنا التحويل المهم
    const users = Array.isArray(data?.users) ? data.users : [];
    const list: RoomBannedEntry[] = users.map((u: any) => ({
      user: u,             // ✅ الشكل المتوقع في UI
      reason: undefined,   // (اختياري) لو الباك لا يرجع reason
      bannedAt: undefined,
      until: null
    }));

    log("users length:", users.length);
    log("list length:", list.length);
    log("First list item:", list?.[0]);
    log("END (success) in ms:", Date.now() - startedAt);
    log("=====================================");

    return { roomId: String(data?.roomId || roomId), list };
  } catch (e: any) {
    log("ERROR:", e?.message, "resp:", e?.response?.data);
    log("END (failed) in ms:", Date.now() - startedAt);
    log("=====================================");
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to fetch banned users"));
  }
});

export const unbanOne = createAsyncThunk<
  { roomId: string; list?: RoomBannedEntry[]; targetId: string },
  { roomId: string; targetId: string; reason?: string },
  { state: RootState }
>("room/unbanOne", async ({ roomId, targetId, reason }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/control/unban/one`, { targetId, reason });
    const data = dataOf(res);

    // بعض الباك يرجع القائمة بعد التعديل
    const list: RoomBannedEntry[] | undefined = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : undefined;

    return { roomId, list, targetId };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Unban failed"));
  }
});

export const unbanMany = createAsyncThunk<
  { roomId: string; list?: RoomBannedEntry[]; targetIds: string[] },
  { roomId: string; targetIds: string[]; reason?: string },
  { state: RootState }
>("room/unbanMany", async ({ roomId, targetIds, reason }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/control/unban/many`, { targetIds, reason });
    const data = dataOf(res);

    const list: RoomBannedEntry[] | undefined = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : undefined;

    return { roomId, list, targetIds };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Unban many failed"));
  }
});

export const unbanAll = createAsyncThunk<
  { roomId: string; list?: RoomBannedEntry[] },
  { roomId: string; reason?: string },
  { state: RootState }
>("room/unbanAll", async ({ roomId, reason }, thunkAPI) => {
  try {
    const res = await api.patch(`/rooms/${roomId}/control/unban/all`, { reason });
    const data = dataOf(res);

    const list: RoomBannedEntry[] | undefined = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : undefined;

    return { roomId, list };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Unban all failed"));
  }
});
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

export const joinRoom = createAsyncThunk<
  { roomId: string },
  { roomId: string; password?: string },
  { state: RootState }
>(
  "room/joinRoom",
  async ({ roomId, password }, thunkAPI) => {
    try {
      // ✅ إرسال password في body
      await api.post(`/rooms/${roomId}/join`, { password });
      return { roomId };
    } catch (e: any) {
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
export const leaveAndRefreshRooms = createAsyncThunk<
  void,
  { roomId: string; type: RoomType },
  { state: RootState }
>("room/leaveAndRefreshRooms", async ({ roomId, type }, thunkAPI) => {
  await thunkAPI.dispatch(
    leaveRoomAndExit({ roomId, cleanup: true })
  ).unwrap();

  await thunkAPI.dispatch(
    fetchRoomsByType({ type, page: 1, limit: 30 })
  ).unwrap();
});
export const enterRoomDirect = createAsyncThunk<
  { roomId: string },
  { roomId: string; preload?: boolean },
  { state: RootState }
>("room/enterRoomDirect", async ({ roomId, preload = true }, thunkAPI) => {
  const startedAt = Date.now();
  const log = (...args: any[]) => console.log("[enterRoomDirect]", ...args);

  try {
    log("=====================================");
    log("START roomId:", roomId, "preload:", preload);

    // ✅ 1) اضبط الغرفة النشطة
    thunkAPI.dispatch(setActiveRoom(roomId));
    log("setActiveRoom done:", roomId);

    // ✅ 2) preload (نفس joinRoomAndEnter)
    if (preload) {
      log("preload begin...");
      await Promise.all([
        thunkAPI.dispatch(fetchRoomDetails(roomId)).unwrap(),
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
      log("preload done ✅");
    }

    /**
     * ✅ 3) أهم نقطة:
     * لو عندك Socket Join لازم يتنفّذ هنا أو في شاشة room/[id].
     *
     * مثال (غيّره حسب مشروعك):
     * socket.emit("room:join", { roomId });
     *
     * إن لم تضعه هنا، تأكد أن شاشة الغرفة عند mount
     * تعمل join للسوكت اعتمادًا على activeRoomId أو params.id
     */

    log("END success in ms:", Date.now() - startedAt);
    log("=====================================");

    return { roomId };
  } catch (e: any) {
    log("ERROR:", e?.message, "resp:", e?.response?.data);
    log("END failed in ms:", Date.now() - startedAt);
    log("=====================================");
    return thunkAPI.rejectWithValue(errMsg(e, "Enter room failed"));
  }
});
/* ================= MESSAGES ================= */

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
  const DEBUG = true; // ❗ اجعلها false في الإنتاج

  try {
    if (DEBUG) {
      console.log("========== SEND ROOM MESSAGE ==========");
      console.log("Payload:", {
        roomId: payload.roomId,
        type: payload.type,
        content: payload.content,
        replyTo: payload.replyTo,
        hasMedia: !!payload.media,
        hasGift: !!payload.gift,
      });
    }

    const res = await api.post(`/rooms/${payload.roomId}/messages`, payload);



    const msg: RoomMessage = dataOf(res);

    if (DEBUG) {

    }

    return { roomId: payload.roomId, message: msg };

  } catch (e: any) {
 
    return thunkAPI.rejectWithValue(errMsg(e, "Send failed"));
  }
});

export const fetchRoomMessages = createAsyncThunk<
  { roomId: string; messages: RoomMessage[]; append: boolean },
  { roomId: string; pagination?: Pagination; append?: boolean },
  { state: RootState }
>("room/fetchRoomMessages", async ({ roomId, pagination, append }, thunkAPI) => {
  try {


    const params = new URLSearchParams();

    if (pagination?.limit) {
      params.set("limit", String(pagination.limit));
    }

    if (pagination?.before) {
      params.set("before", String(pagination.before));
    }

    const qs = params.toString() ? `?${params.toString()}` : "";
    const finalUrl = `/rooms/${roomId}/messages${qs}`;


    const res = await api.get(finalUrl);


    const messages: RoomMessage[] = dataOf(res) ?? [];


    return { roomId, messages, append: Boolean(append) };
  } catch (e: any) {
   

    return thunkAPI.rejectWithValue(
      errMsg(e, "Failed to fetch messages")
    );
  }
});

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

export const toggleRoomReaction = createAsyncThunk<
  {
    roomId: string;
    messageId: string;
    reactions: { user: string; emoji: string; createdAt: string }[];
  },
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

export const addVip = createAsyncThunk<any, { roomId: string; targetId: string; days: number }, { state: RootState }>(
  "room/addVip",
  async ({ roomId, targetId, days }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/vip`, { targetId, days });
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "VIP add failed"));
    }
  }
);

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

export const votePoll = createAsyncThunk<any, { roomId: string; optionIndex: number }, { state: RootState }>(
  "room/votePoll",
  async ({ roomId, optionIndex }, thunkAPI) => {
    try {
      const res = await api.patch(`/rooms/${roomId}/poll/vote`, { optionIndex });
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Vote failed"));
    }
  }
);

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

export const boostRoom = createAsyncThunk<RoomItem, { roomId: string; level: number; hours: number }, { state: RootState }>(
  "room/boostRoom",
  async ({ roomId, level, hours }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/boost`, { level, hours });
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Boost failed"));
    }
  }
);
export const banUser = createAsyncThunk<any, { roomId: string; targetId: string; reason?: string }, { state: RootState }>(
  "room/banUser",
  async ({ roomId, targetId, reason }, thunkAPI) => {
    try {
      const res = await api.post(`/rooms/${roomId}/ban/${targetId}`, { reason });
      return dataOf(res);
    } catch (e: any) {
      return thunkAPI.rejectWithValue(errMsg(e, "Ban failed"));
    }
  }
);
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

export const fetchRoomDetails = createAsyncThunk<
  { roomId: string; details: RoomDetails },
  string,
  { state: RootState }
>("room/fetchRoomDetails", async (roomId, thunkAPI) => {
  try {
    // ✅ Protected: التوكن يُرسل في Authorization من api interceptor (يفترض موجود عندك)
    const res = await api.get(`/rooms/${roomId}/details`);
    const details: RoomDetails = dataOf(res);

    // ✅ حماية بسيطة ضد رد غير متوقع
    if (!details?.room?._id) {
      return thunkAPI.rejectWithValue("Invalid room details response");
    }

    return { roomId, details };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to fetch room details"));
  }
});
/* =====================================================
   JOIN & LEAVE HELPERS
===================================================== */

export const joinRoomAndEnter = createAsyncThunk<
  { roomId: string },
  { roomId: string; preload?: boolean; password?: string },
  { state: RootState }
>("room/joinRoomAndEnter", async ({ roomId, preload, password }, thunkAPI) => {
  try {
    // (اختياري) تحقق سريع من نوع الغرفة من الستور لو متاح
    const state = thunkAPI.getState();
    const room = state.room.rooms.find((r) => r._id === roomId);

    // ✅ لو الغرفة محمية والباسورد غير موجود، افشل برسالة واضحة
    if (room?.type === "protected" && !String(password || "").trim()) {
      return thunkAPI.rejectWithValue("Password required");
    }

    // ✅ مرّر الباسورد
    await thunkAPI.dispatch(joinRoom({ roomId, password })).unwrap();

    thunkAPI.dispatch(setActiveRoom(roomId));

    if (preload) {
      try {
        await Promise.all([
          thunkAPI.dispatch(fetchRoomDetails(roomId)).unwrap(),

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
      } catch (preloadError: any) {
        void preloadError;
      }
    }

    return { roomId };
  } catch (e: any) {
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
   SOCKET-DRIVEN REDUCERS
===================================================== */

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    resetRoomState: () => initialState,
    clearKickedFlag: (state, action: PayloadAction<{ roomId: string }>) => {
      delete state.kickedByRoom[action.payload.roomId];
    },
    clearBannedFlag: (state, action: PayloadAction<{ roomId: string }>) => {
      delete state.bannedByRoom[action.payload.roomId];
    },
    // ==========================
    // CHANGE ROLE (Socket only)
    // ==========================
    socketRoleSetRequested: (
      state,
      _action: PayloadAction<{ roomId: string; targetId: string; role: "owner" | "admin" | "member" }>
    ) => {
      state.mutatingRoom = true;
      state.error = undefined;
    },

    socketRoleSetFailed: (state, action: PayloadAction<{ message: string }>) => {
      state.mutatingRoom = false;
      state.error = action.payload.message || "Set role failed";
    },

    socketRoleSetSucceeded: (state) => {
      // سيتم تحديث الدور فعلياً عند وصول room:roles:update
      state.mutatingRoom = false;
    },

    setActiveRoom: (state, action: PayloadAction<string | undefined>) => {
      state.activeRoomId = action.payload;
      state.error = undefined;
    },

    /**
     * room:activeCount:update
     */
    socketRoomActiveCount: (state, action: PayloadAction<{ roomId: string; activeCount: number }>) => {
      const { roomId, activeCount } = action.payload;
      state.activeCountByRoom[roomId] = Number(activeCount) || 0;
    },

    /**
     * room:users:update (إشارة فقط)
     */
    socketRoomUsersUpdate: (state, _action: PayloadAction<{ roomId: string }>) => {
      void state;
    },

    /**
     * room:roles:update
     */
    socketRoomRolesUpdate: (
      state,
      action: PayloadAction<{
        roomId: string;
        owners?: string[];
        admins?: string[];
        members?: string[];
        creatorId?: string;
      }>
    ) => {
      const { roomId, owners = [], admins = [], members = [], creatorId } = action.payload;

      const list = state.usersByRoom[roomId];
      if (!list) {
        state.mutatingRoom = false;
        return;
      }

      const ownerSet = new Set(owners.map(toStr));
      const adminSet = new Set(admins.map(toStr));
      const memberSet = new Set(members.map(toStr));
      const creator = creatorId ? toStr(creatorId) : "";

      for (const u of list) {
        const id = toStr(u._id);

        if (creator && id === creator) {
          u.role = "creator";
          continue;
        }

        if (ownerSet.has(id)) u.role = "owner";
        else if (adminSet.has(id)) u.role = "admin";
        else if (memberSet.has(id)) u.role = "member";
        else u.role = undefined;
      }

      state.mutatingRoom = false;
    },

    /**
     * room:update
     */
    socketRoomUpdated: (state, action: PayloadAction<RoomItem>) => {
      const updated = action.payload;
      if (!updated?._id) return;

      const idx = state.rooms.findIndex((r) => r._id === updated._id);
      if (idx >= 0) state.rooms[idx] = { ...state.rooms[idx], ...updated };
      else state.rooms.unshift(updated);

      if (state.activeCountByRoom[updated._id] === undefined) {
        state.activeCountByRoom[updated._id] = 0;
      }
    },

    /**
     * room:type:update
     */
    socketRoomTypeUpdate: (state, action: PayloadAction<{ roomId: string; type: RoomType }>) => {
      const { roomId, type } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) room.type = type;
    },

    /**
     * room:premium:update
     */
    socketRoomPremiumUpdate: (
      state,
      action: PayloadAction<{ roomId: string; premiumLevel: RoomPremiumLevel }>
    ) => {
      const { roomId, premiumLevel } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) room.premiumLevel = premiumLevel;
    },

    /**
     * room:lock:update
     */
    socketRoomLockUpdate: (state, action: PayloadAction<{ roomId: string; isLocked: boolean }>) => {
      const { roomId, isLocked } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) room.isLocked = isLocked;
    },

    /**
     * room:slowmode:update
     */
    socketRoomSlowModeUpdate: (
      state,
      action: PayloadAction<{ roomId: string; slowModeSeconds: number }>
    ) => {
      const { roomId, slowModeSeconds } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) room.slowModeSeconds = slowModeSeconds;
    },

    /**
     * room:antispam:update
     */
    socketRoomAntiSpamUpdate: (
      state,
      action: PayloadAction<{ roomId: string; enabled: boolean; max?: number }>
    ) => {
      const { roomId, enabled, max } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) {
        room.antiSpamEnabled = Boolean(enabled);
        if (typeof max === "number") room.maxMessagesPerMinute = max;
      }
    },

    /**
     * room:boost:update
     */
    socketRoomBoostUpdate: (
      state,
      action: PayloadAction<{ roomId: string; boostLevel: number; boostExpiresAt?: string }>
    ) => {
      const { roomId, boostLevel, boostExpiresAt } = action.payload;
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) {
        room.boostLevel = Number(boostLevel) || 0;
        if (boostExpiresAt) room.boostExpiresAt = boostExpiresAt;
      }
    },

    /**
     * room:deleted
     */
    socketRoomDeleted: (state, action: PayloadAction<{ roomId: string }>) => {
      const { roomId } = action.payload;

      state.rooms = state.rooms.filter((r) => r._id !== roomId);
      delete state.usersByRoom[roomId];
      delete state.messagesByRoom[roomId];
      delete state.activeCountByRoom[roomId];
      delete state.detailsByRoom[roomId];

      if (state.activeRoomId === roomId) state.activeRoomId = undefined;
    },

    /**
     * room:user:joined / room:user:left
     *
     * ملاحظة: الأفضل عدم إضافة placeholder "User"
     * واعتماد room:users:update ثم fetchRoomUsers للحصول على بيانات صحيحة.
     */
    socketUserJoined: (state, _action: PayloadAction<{ roomId: string; userId: string }>) => {
      void state;
    },

    socketUserLeft: (state, action: PayloadAction<{ roomId: string; userId: string }>) => {
      const { roomId, userId } = action.payload;
      const list = state.usersByRoom[roomId];
      if (!list) return;
      state.usersByRoom[roomId] = list.filter((u) => u._id !== userId);
    },

    /**
     * room:message:new
     */
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

    /**
     * room:message:pinned / room:message:edited (دمج نفس reducer)
     */
    socketMessagePinned: (state, action: PayloadAction<{ roomId?: string; message: RoomMessage }>) => {
      const { message } = action.payload;
      const roomId = action.payload.roomId || toStr(message.room) || state.activeRoomId;
      if (!roomId) return;

      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const idx = list.findIndex((m) => m._id === message._id);
      if (idx >= 0) list[idx] = { ...list[idx], ...message };
    },

    /**
     * room:message:highlighted
     */
    socketMessageHighlighted: (state, action: PayloadAction<{ roomId?: string; message: RoomMessage }>) => {
      const { message } = action.payload;
      const roomId = action.payload.roomId || toStr(message.room) || state.activeRoomId;
      if (!roomId) return;

      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const idx = list.findIndex((m) => m._id === message._id);
      if (idx >= 0) list[idx] = { ...list[idx], ...message };
    },

    /**
     * room:message:deleted
     * يدعم وصول payload بدون roomId
     */
    socketMessageDeleted: (state, action: PayloadAction<{ roomId?: string; messageId: string }>) => {
      const { messageId } = action.payload;

      const roomId =
        action.payload.roomId ||
        findRoomIdByMessageId(state.messagesByRoom, messageId) ||
        state.activeRoomId;

      if (!roomId) return;

      const list = state.messagesByRoom[roomId];
      if (!list) return;

      state.messagesByRoom[roomId] = list.map((m) =>
        m._id === messageId ? { ...m, deletedForEveryone: true } : m
      );
    },

    /**
     * room:reaction:update
     * يدعم وصول payload بدون roomId
     */
    socketReactionUpdate: (
      state,
      action: PayloadAction<{
        roomId?: string;
        messageId: string;
        reactions: { user: string; emoji: string; createdAt: string }[];
      }>
    ) => {
      const { messageId, reactions } = action.payload;

      const roomId =
        action.payload.roomId ||
        findRoomIdByMessageId(state.messagesByRoom, messageId) ||
        state.activeRoomId;

      if (!roomId) return;

      const list = state.messagesByRoom[roomId];
      if (!list) return;

      const msg = list.find((m) => m._id === messageId);
      if (!msg) return;

      msg.reactions = reactions;
    },

    /**
     * room:kicked
     */
    socketRoomKicked: (state, action: PayloadAction<{ roomId: string; message?: string }>) => {
      const { roomId, message } = action.payload;

      // ✅ سجّل الفلاج
      state.kickedByRoom[roomId] = { at: Date.now(), message };

      // تنظيف بيانات الغرفة
      if (state.activeRoomId === roomId) state.activeRoomId = undefined;
      delete state.usersByRoom[roomId];
      delete state.messagesByRoom[roomId];
      delete state.activeCountByRoom[roomId];
      delete state.detailsByRoom[roomId];
    },

    socketRoomBanned: (
      state,
      action: PayloadAction<{ roomId: string; reason?: string }>
    ) => {
      const raw = action?.payload as any;

      // ✅ طباعات تشخيصية
      console.log("======================================");
      console.log("[socketRoomBanned] FIRED ✅");
      console.log("Payload raw:", raw);
      console.log("roomId:", raw?.roomId, "type:", typeof raw?.roomId);
      console.log("reason:", raw?.reason, "type:", typeof raw?.reason);
      console.log("activeRoomId(before):", state.activeRoomId);
      console.log("bannedByRoom(before):", state.bannedByRoom);
      console.log("usersByRoom has room?:", !!state.usersByRoom?.[String(raw?.roomId || "")]);
      console.log("messagesByRoom has room?:", !!state.messagesByRoom?.[String(raw?.roomId || "")]);
      console.log("detailsByRoom has room?:", !!state.detailsByRoom?.[String(raw?.roomId || "")]);

      const roomId = String(raw?.roomId || "");
      const reason = raw?.reason ? String(raw.reason) : undefined;

      if (!roomId) {
        console.log("[socketRoomBanned] ❌ Missing roomId -> ABORT");
        console.log("======================================");
        return;
      }

      // ✅ سجّل الفلاج
      state.bannedByRoom[roomId] = { at: Date.now(), reason };

      // تنظيف بيانات الغرفة
      if (state.activeRoomId === roomId) state.activeRoomId = undefined;
      delete state.usersByRoom[roomId];
      delete state.messagesByRoom[roomId];
      delete state.activeCountByRoom[roomId];
      delete state.detailsByRoom[roomId];

      // ✅ طباعات بعد التنفيذ
      console.log("bannedByRoom(after):", state.bannedByRoom?.[roomId]);
      console.log("activeRoomId(after):", state.activeRoomId);
      console.log("[socketRoomBanned] DONE ✅");
      console.log("======================================");
    },
  },

  extraReducers: (builder) => {
    builder
    // ====== BANNED LIST ======
.addCase(enterRoomDirect.pending, (state) => {
  state.mutatingRoom = true;
  state.error = undefined;
})
.addCase(enterRoomDirect.fulfilled, (state, action) => {
  state.mutatingRoom = false;
  state.activeRoomId = action.payload.roomId;
})
.addCase(enterRoomDirect.rejected, (state, action) => {
  state.mutatingRoom = false;
  state.error = (action.payload as any) || "Enter room failed";
})

  .addCase(fetchBannedUsers.pending, (state) => {
    state.mutatingRoom = true;
    state.error = undefined;
  })
  .addCase(fetchBannedUsers.fulfilled, (state, action) => {
    state.mutatingRoom = false;
    const { roomId, list } = action.payload;
    state.bannedUsersByRoom[roomId] = list;
  })
  .addCase(fetchBannedUsers.rejected, (state, action) => {
    state.mutatingRoom = false;
    state.error = (action.payload as any) || "Failed to fetch banned users";
  })

  .addCase(unbanOne.fulfilled, (state, action) => {
    const { roomId, list, targetId } = action.payload;

    // لو الباك رجّع قائمة جاهزة
    if (list) {
      state.bannedUsersByRoom[roomId] = list;
      return;
    }

    // وإلا حدّث محليًا بإزالة المستخدم
    const cur = state.bannedUsersByRoom[roomId] || [];
    state.bannedUsersByRoom[roomId] = cur.filter((x) => String(x?.user?._id) !== String(targetId));
  })
  .addCase(unbanMany.fulfilled, (state, action) => {
    const { roomId, list, targetIds } = action.payload;

    if (list) {
      state.bannedUsersByRoom[roomId] = list;
      return;
    }

    const removeSet = new Set((targetIds || []).map(String));
    const cur = state.bannedUsersByRoom[roomId] || [];
    state.bannedUsersByRoom[roomId] = cur.filter((x) => !removeSet.has(String(x?.user?._id)));
  })
  .addCase(unbanAll.fulfilled, (state, action) => {
    const { roomId, list } = action.payload;
    state.bannedUsersByRoom[roomId] = list ?? [];
  })
      .addCase(fetchRoomDetails.pending, (state) => {
        state.loadingDetails = true;
        state.error = undefined;
      })
      .addCase(fetchRoomDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;

        const { roomId, details } = action.payload;
        state.detailsByRoom[roomId] = details;

        // ✅ اختياري (مفيد): مزامنة قائمة الغرف الأساسية مع أحدث بيانات details.room
        const idx = state.rooms.findIndex((r) => r._id === roomId);
        if (idx >= 0) {
          const normalizedRoom: Partial<RoomItem> = {
            ...details.room,
            // ✅ منع null
            boostExpiresAt: details.room.boostExpiresAt ?? undefined,
          };

          state.rooms[idx] = { ...state.rooms[idx], ...normalizedRoom };
        }
      })
      .addCase(fetchRoomDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = (action.payload as any) || "Failed to fetch room details";
      })
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
        delete state.activeCountByRoom[roomId];
        delete state.detailsByRoom[roomId];
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
      .addCase(fetchRoomStats.fulfilled, (state, action) => {
        state.mutatingRoom = false;

        const stats = action.payload;
        if (!stats?.roomId) return;

        state.activeCountByRoom[stats.roomId] = Number(stats.activeCount) || 0;

        const room = state.rooms.find((r) => r._id === stats.roomId);
        if (room) {
          room.messagesCount = Number(stats.messagesCount) || room.messagesCount;
        }
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

        for (const r of action.payload.items) {
          if (state.activeCountByRoom[r._id] === undefined) state.activeCountByRoom[r._id] = 0;
        }
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

        if (state.activeCountByRoom[room._id] === undefined) state.activeCountByRoom[room._id] = 0;
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

        for (const r of action.payload.items) {
          if (state.activeCountByRoom[r._id] === undefined) state.activeCountByRoom[r._id] = 0;
        }
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
          [
            updateRoomInfo.typePrefix,
            changeRoomType.typePrefix,
            changeRoomPremium.typePrefix,
            toggleAntiSpam.typePrefix,
            boostRoom.typePrefix
          ].some((p) => action.type.startsWith(p)),
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
              delete state.activeCountByRoom[roomId];
              delete state.detailsByRoom[roomId];
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
        (action) =>
          action.type.startsWith("room/") &&
          action.type.endsWith("/fulfilled") &&
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
            toggleRoomReaction.typePrefix,
          ].some((p) => action.type.startsWith(p)),
        (state) => {
          state.mutatingRoom = false;
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
   EXPORTS
===================================================== */

export const {
  setActiveRoom,
  resetRoomState,

  // CHANGE ROLE (Socket only)
  socketRoleSetRequested,
  socketRoleSetFailed,
  socketRoleSetSucceeded,

  socketUserJoined,
  socketUserLeft,
  socketRoomActiveCount,

  socketNewRoomMessage,
  socketMessagePinned,
  socketMessageHighlighted,
  socketMessageDeleted,
  socketReactionUpdate,

  socketRoomUsersUpdate,
  socketRoomRolesUpdate,
  socketRoomUpdated,
  socketRoomTypeUpdate,
  socketRoomPremiumUpdate,
  socketRoomLockUpdate,
  socketRoomSlowModeUpdate,
  socketRoomAntiSpamUpdate,
  socketRoomBoostUpdate,
  socketRoomDeleted,
  clearKickedFlag,
  clearBannedFlag,
  socketRoomKicked,
  socketRoomBanned
} = roomSlice.actions;

export default roomSlice.reducer;

/* =====================================================
   SELECTORS
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
export const selectRoomDetailsById = createSelector(
  [(state: RootState) => state.room.detailsByRoom, (_: RootState, roomId: string) => roomId],
  (map, roomId) => map[roomId]
);
export const selectKickedFlag = createSelector(
  [(state: RootState) => state.room.kickedByRoom, (_: RootState, roomId: string) => roomId],
  (map, roomId) => map[roomId]
);

export const selectBannedFlag = createSelector(
  [(state: RootState) => state.room.bannedByRoom, (_: RootState, roomId: string) => roomId],
  (map, roomId) => map[roomId]
);
export const selectRoomLoadingDetails = (state: RootState) => state.room.loadingDetails;
export const selectRoomError = (state: RootState) => state.room.error;
export const selectRoomById = createSelector(
  [selectRooms, (_: RootState, roomId: string) => roomId],
  (rooms, roomId) => rooms.find((r) => r._id === roomId)
);
const EMPTY_BANNED: RoomBannedEntry[] = [];

export const selectBannedUsers = createSelector(
  [(state: RootState) => state.room.bannedUsersByRoom, (_: RootState, roomId: string) => roomId],
  (map, roomId) => map[roomId] ?? EMPTY_BANNED
);

export const selectRoomNameById = createSelector(
  [
    (state: RootState) => state.room.rooms,
    (state: RootState) => state.room.detailsByRoom,
    (_: RootState, roomId: string) => roomId,
  ],
  (rooms, detailsByRoom, roomId) => {
    const fromRooms = rooms.find((r) => r._id === roomId)?.name;
    const fromDetails = detailsByRoom?.[roomId]?.room?.name;
    return fromRooms || fromDetails || "Room";
  }
);
export const selectRoomAvatarById = createSelector(
  [
    (state: RootState) => state.room.rooms,
    (state: RootState) => state.room.detailsByRoom,
    (_: RootState, roomId: string) => roomId,
  ],
  (rooms, detailsByRoom, roomId) => {
    const fromRooms = rooms.find((r) => r._id === roomId)?.avatar;
    const fromDetails = detailsByRoom?.[roomId]?.room?.avatar;
    return fromRooms || fromDetails || "";
  }
);
export const selectRoomActiveCount = createSelector(
  [(state: RootState) => state.room.activeCountByRoom, (_: RootState, roomId: string) => roomId],
  (map, roomId) => map[roomId] ?? 0
);