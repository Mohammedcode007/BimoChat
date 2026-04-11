// src/redux/slices/roomControl.slice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export type RoomType = "public" | "private" | "protected" | "subscription";
export type RoomPremiumLevel = 0 | 1 | 2 | 3 | 4;

export type ActivePoll = {
  question: string;
  options: { text: string; votes: number }[];
  expiresAt?: string;
};
export type RoomBotLanguage = "ar" | "en";

export type RoomBotConfig = {
  enabled: boolean;
  welcomeEnabled: boolean;
  language: RoomBotLanguage;
  welcomeMessage?: string | null;
};
export type RoomControl = {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;

  type: RoomType;
  premiumLevel?: RoomPremiumLevel;

  tags?: string[];
  maxUsers?: number;

  slowModeSeconds?: number;

  isLocked?: boolean;

  antiSpamEnabled?: boolean;
  maxMessagesPerMinute?: number;

  maxVoiceSeats?: number;

  boostLevel?: number;
  boostExpiresAt?: string;

  subscriptionPrice?: number;

  activePoll?: ActivePoll | null;

  roomBot?: RoomBotConfig;
};

/* =====================================================
   HELPERS
===================================================== */

const errMsg = (err: any, fallback: string) =>
  err?.response?.data?.message ||
  err?.message ||
  fallback;

/**
 * ⚠️ هذا المسار مطابق للـ app.ts + router:
 * app.use("/api/room/control", roomControlRoutes);
 * router: /rooms/:id/control/...
 * => final: /api/room/control/rooms/:id/control/...
 *
 * api عندك غالباً عليه baseURL = "/api"
 */
const BASE = "/room/control";

/* =====================================================
   THUNKS
===================================================== */

/** GET /rooms/:id/control */
export const getRoomControl = createAsyncThunk<
  { room: RoomControl },
  { roomId: string },
  { rejectValue: string }
>("roomControl/getControl", async ({ roomId }, thunkAPI) => {
  try {
    const res = await api.get(`${BASE}/${roomId}/control`);
    return { room: res.data.room };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to load room control"));
  }
});

/** PATCH /rooms/:id/control/info */
export const updateRoomInfo = createAsyncThunk<
  { room: RoomControl },
  {
    roomId: string;
    name?: string;
    description?: string;
    avatar?: string;
    cover?: string;
    tags?: string[] | string; // يقبل array أو comma string مثل الباك
    maxUsers?: number;
    slowModeSeconds?: number;
  },
  { rejectValue: string }
>("roomControl/updateInfo", async ({ roomId, ...body }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/info`, body);
    return { room: res.data.room };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update room info"));
  }
});

/** PATCH /rooms/:id/control/type */
export const changeRoomType = createAsyncThunk<
  { room: RoomControl },
  {
    roomId: string;
    type: RoomType;
    password?: string; // مطلوب لو protected
    subscriptionPrice?: number; // مطلوب/اختياري لو subscription
  },
  { rejectValue: string }
>("roomControl/changeType", async ({ roomId, ...body }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/type`, body);
    return { room: res.data.room };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to change room type"));
  }
});

/** PATCH /rooms/:id/control/premium */
export const changeRoomPremiumLevel = createAsyncThunk<
  { room: RoomControl },
  { roomId: string; premiumLevel: RoomPremiumLevel },
  { rejectValue: string }
>("roomControl/changePremiumLevel", async ({ roomId, premiumLevel }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/premium`, { premiumLevel });
    return { room: res.data.room };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to change premium level"));
  }
});

/** PATCH /rooms/:id/control/lock */
export const setRoomLock = createAsyncThunk<
  { roomId: string; isLocked: boolean },
  { roomId: string; locked: boolean },
  { rejectValue: string }
>("roomControl/setLock", async ({ roomId, locked }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/lock`, { locked });
    return { roomId, isLocked: Boolean(res.data.isLocked) };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update lock state"));
  }
});
/** PATCH /rooms/:id/control/welcome */
export const updateRoomWelcome = createAsyncThunk<
  { roomId: string; roomBot: RoomBotConfig },
  {
    roomId: string;
    enabled?: boolean;
    welcomeEnabled?: boolean;
    language?: RoomBotLanguage;
    welcomeMessage?: string;
  },
  { rejectValue: string }
>("roomControl/updateWelcome", async ({ roomId, ...body }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/welcome`, body);
    return {
      roomId,
      roomBot: res.data.roomBot,
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update welcome settings"));
  }
});
/** PATCH /rooms/:id/control/antispam */
export const setRoomAntiSpam = createAsyncThunk<
  { roomId: string; antiSpamEnabled: boolean; maxMessagesPerMinute?: number },
  { roomId: string; enabled: boolean; maxMessagesPerMinute?: number },
  { rejectValue: string }
>("roomControl/setAntiSpam", async ({ roomId, enabled, maxMessagesPerMinute }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/antispam`, {
      enabled,
      maxMessagesPerMinute
    });
    return {
      roomId,
      antiSpamEnabled: Boolean(res.data.antiSpamEnabled),
      maxMessagesPerMinute: res.data.maxMessagesPerMinute
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update antispam"));
  }
});

/** PATCH /rooms/:id/control/slowmode */
export const setRoomSlowMode = createAsyncThunk<
  { roomId: string; slowModeSeconds: number },
  { roomId: string; seconds: number },
  { rejectValue: string }
>("roomControl/setSlowMode", async ({ roomId, seconds }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/slowmode`, { seconds });
    return { roomId, slowModeSeconds: Number(res.data.slowModeSeconds) || 0 };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update slow mode"));
  }
});

/** PATCH /rooms/:id/control/voice-seats */
export const setRoomMaxVoiceSeats = createAsyncThunk<
  { roomId: string; maxVoiceSeats: number },
  { roomId: string; seats: number },
  { rejectValue: string }
>("roomControl/setMaxVoiceSeats", async ({ roomId, seats }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/voice-seats`, { seats });
    return { roomId, maxVoiceSeats: Number(res.data.maxVoiceSeats) || 0 };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to update voice seats"));
  }
});

/** PATCH /rooms/:id/control/boost */
export const boostRoom = createAsyncThunk<
  { roomId: string; boostLevel: number; boostExpiresAt: string },
  { roomId: string; level: number; hours: number },
  { rejectValue: string }
>("roomControl/boost", async ({ roomId, level, hours }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/boost`, { level, hours });
    return {
      roomId,
      boostLevel: Number(res.data.boostLevel) || 0,
      boostExpiresAt: String(res.data.boostExpiresAt || "")
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to boost room"));
  }
});

/** POST /rooms/:id/control/poll/start */
export const startRoomPoll = createAsyncThunk<
  { roomId: string; activePoll: ActivePoll },
  { roomId: string; question: string; options: string[]; minutes?: number },
  { rejectValue: string }
>("roomControl/startPoll", async ({ roomId, ...body }, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/${roomId}/control/poll/start`, body);
    return { roomId, activePoll: res.data.activePoll };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to start poll"));
  }
});

/** POST /rooms/:id/control/poll/vote */
export const voteRoomPoll = createAsyncThunk<
  { roomId: string; activePoll: ActivePoll },
  { roomId: string; optionIndex: number },
  { rejectValue: string }
>("roomControl/votePoll", async ({ roomId, optionIndex }, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/${roomId}/control/poll/vote`, { optionIndex });
    return { roomId, activePoll: res.data.activePoll };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to vote poll"));
  }
});

/** POST /rooms/:id/control/poll/end */
export const endRoomPoll = createAsyncThunk<
  { roomId: string; success: true },
  { roomId: string },
  { rejectValue: string }
>("roomControl/endPoll", async ({ roomId }, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/${roomId}/control/poll/end`);
    return { roomId, success: Boolean(res.data.success) as true };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to end poll"));
  }
});

/** PATCH /rooms/:id/control/max-users/increase */
export const increaseRoomMaxUsers = createAsyncThunk<
  { roomId: string; maxUsers: number },
  { roomId: string; amount: number },
  { rejectValue: string }
>("roomControl/increaseMaxUsers", async ({ roomId, amount }, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/${roomId}/control/max-users/increase`, { amount });
    return { roomId, maxUsers: Number(res.data.maxUsers) || 0 };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to increase max users"));
  }
});

/** DELETE /rooms/:id/control */
export const deleteRoomControl = createAsyncThunk<
  { roomId: string; success: true },
  { roomId: string },
  { rejectValue: string }
>("roomControl/deleteRoom", async ({ roomId }, thunkAPI) => {
  try {
    const res = await api.delete(`${BASE}/${roomId}/control`);
    return { roomId, success: Boolean(res.data.success) as true };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to delete room"));
  }
});

/* =====================================================
   SLICE
===================================================== */

type RoomControlState = {
  room: RoomControl | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
};

const initialState: RoomControlState = {
  room: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null
};

const roomControlSlice = createSlice({
  name: "roomControl",
  initialState,
  reducers: {
    clearRoomControlError: (state) => {
      state.error = null;
    },
    resetRoomControl: (state) => {
      state.room = null;
      state.loading = false;
      state.saving = false;
      state.deleting = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* ========== getControl ========== */
      .addCase(getRoomControl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomControl.fulfilled, (state, action) => {
        state.loading = false;
        state.room = action.payload.room;
      })
      .addCase(getRoomControl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load room control";
      })
.addCase(updateRoomWelcome.pending, (state) => {
  state.saving = true;
  state.error = null;
})
.addCase(updateRoomWelcome.fulfilled, (state, action) => {
  state.saving = false;
  if (state.room && state.room._id === action.payload.roomId) {
    state.room.roomBot = action.payload.roomBot;
  }
})
.addCase(updateRoomWelcome.rejected, (state, action) => {
  state.saving = false;
  state.error = action.payload || "Failed to update welcome settings";
})
      /* ========== updateInfo / changeType / changePremium ========== */
      .addCase(updateRoomInfo.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateRoomInfo.fulfilled, (state, action) => {
        state.saving = false;
        state.room = action.payload.room;
      })
      .addCase(updateRoomInfo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update room info";
      })

      .addCase(changeRoomType.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeRoomType.fulfilled, (state, action) => {
        state.saving = false;
        state.room = action.payload.room;
      })
      .addCase(changeRoomType.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to change room type";
      })

      .addCase(changeRoomPremiumLevel.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeRoomPremiumLevel.fulfilled, (state, action) => {
        state.saving = false;
        state.room = action.payload.room;
      })
      .addCase(changeRoomPremiumLevel.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to change premium level";
      })

      /* ========== lock / antispam / slowmode / voice seats / boost ========== */
      .addCase(setRoomLock.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setRoomLock.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.isLocked = action.payload.isLocked;
        }
      })
      .addCase(setRoomLock.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update lock state";
      })

      .addCase(setRoomAntiSpam.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setRoomAntiSpam.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.antiSpamEnabled = action.payload.antiSpamEnabled;
          state.room.maxMessagesPerMinute = action.payload.maxMessagesPerMinute;
        }
      })
      .addCase(setRoomAntiSpam.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update antispam";
      })

      .addCase(setRoomSlowMode.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setRoomSlowMode.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.slowModeSeconds = action.payload.slowModeSeconds;
        }
      })
      .addCase(setRoomSlowMode.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update slow mode";
      })

      .addCase(setRoomMaxVoiceSeats.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setRoomMaxVoiceSeats.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.maxVoiceSeats = action.payload.maxVoiceSeats;
        }
      })
      .addCase(setRoomMaxVoiceSeats.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update voice seats";
      })

      .addCase(boostRoom.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(boostRoom.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.boostLevel = action.payload.boostLevel;
          state.room.boostExpiresAt = action.payload.boostExpiresAt;
        }
      })
      .addCase(boostRoom.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to boost room";
      })

      /* ========== Poll ========== */
      .addCase(startRoomPoll.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(startRoomPoll.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.activePoll = action.payload.activePoll;
        }
      })
      .addCase(startRoomPoll.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to start poll";
      })

      .addCase(voteRoomPoll.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(voteRoomPoll.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.activePoll = action.payload.activePoll;
        }
      })
      .addCase(voteRoomPoll.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to vote poll";
      })

      .addCase(endRoomPoll.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(endRoomPoll.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.activePoll = null;
        }
      })
      .addCase(endRoomPoll.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to end poll";
      })

      /* ========== max users increase ========== */
      .addCase(increaseRoomMaxUsers.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(increaseRoomMaxUsers.fulfilled, (state, action) => {
        state.saving = false;
        if (state.room && state.room._id === action.payload.roomId) {
          state.room.maxUsers = action.payload.maxUsers;
        }
      })
      .addCase(increaseRoomMaxUsers.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to increase max users";
      })

      /* ========== delete ========== */
      .addCase(deleteRoomControl.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteRoomControl.fulfilled, (state, action) => {
        state.deleting = false;
        // لو حذفنا نفس الغرفة المحملة، نصفرها
        if (state.room?._id === action.payload.roomId) {
          state.room = null;
        }
      })
      .addCase(deleteRoomControl.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete room";
      });
  }
});

export const { clearRoomControlError, resetRoomControl } = roomControlSlice.actions;
export default roomControlSlice.reducer;

/* =====================================================
   SELECTORS
===================================================== */

export const selectRoomControl = (s: RootState) => s.roomControl.room;
export const selectRoomControlLoading = (s: RootState) => s.roomControl.loading;
export const selectRoomControlSaving = (s: RootState) => s.roomControl.saving;
export const selectRoomControlDeleting = (s: RootState) => s.roomControl.deleting;
export const selectRoomControlError = (s: RootState) => s.roomControl.error;