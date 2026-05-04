// redux/slices/userSlice.ts
// ✅ GET    /users/me/full
// ✅ PATCH  /users/me/settings
// ✅ GET    /users/:userId        (getUserProfile)
// ✅ Expo/React Native friendly (RTK)
// ✅ Handles loading/error + updates local user state
// ✅ IMPORTANT: avoid circular deps by using `import type` for RootState

import api from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type VerificationType = "none" | "blue" | "gold" | "business";
type UserRole = "user" | "admin";

export type UpdateProfilePayload = {
  displayName?: string;
  bio?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string | Date;
  email?: string;
gender?: string;
  avatar?: string;
  coverImage?: string;
  age?: number;

  tags?: string[];

  privacy?: {
    profileVisible?: boolean;
    showLastActive?: boolean;
    showMedia?: boolean;
    allowMessages?: boolean;
  };

  notifications?: {
    messages?: boolean;
    likes?: boolean;
    follows?: boolean;
  };

  partnerPreferences?: {
    ageRange?: string;
    location?: string;
    maritalStatus?: string;
    religiosity?: string;
  };

  notificationSound?: boolean;
  readReceiptsEnabled?: boolean;
};
export type UpdateLocationPayload = {
  country?: string;
  city?: string;
};
export type MarkRelatedNotificationsPayload = {
  relatedChat?: string;
  relatedTweet?: string;
  relatedMessage?: string;
  relatedRoom?: string;
  types?: string[];
};
export type UserFull = {
  _id: string;

  username: string;
  atUsername: string;
  email?: string;
friendsCount?: number;
  role: UserRole;

  isOnline: boolean;
  isInvisible?: boolean;
  lastSeen?: string;
  age?: number;

  blockedUsers: string[];

  CoinzBalance: number;

  dateOfBirth?: string;
  
  country?: string;
  city?: string;
  displayName?: string;
  bio?: string;

  avatar?: string;
  coverImage?: string;

  avatarFrame?: string;
  badges: string[];
  verificationType: VerificationType;

  ownedMessageEffects: string[];
  ownedGifts: string[];

  profileEntryAnimation?: string;

  activeCustomization?: {
    avatarFrame?: string;
    messageEffect?: string;
    profileEntryAnimation?: string;
    badges: string[];
    verificationType: VerificationType;
  };

  followersCount: number;
  followingCount: number;
  totalLikesReceived: number;
  totalRetweetsReceived: number;
  profileViews: number;

  isVerified: boolean;
  notificationSound: boolean;
  readReceiptsEnabled: boolean;

  privacy?: {
    profileVisible: boolean;
    showLastActive: boolean;
    showMedia: boolean;
    allowMessages: boolean;
  };

  notifications?: {
    messages: boolean;
    likes: boolean;
    follows: boolean;
  };

  partnerPreferences?: {
    ageRange?: string;
    location?: string;
    maritalStatus?: string;
    religiosity?: string;
  };

  tags: string[];

  createdAt: string;
  updatedAt: string;
};

type SliceState = {
  // ===== Me =====
  me: UserFull | null;
  loadingMe: boolean;
  updating: boolean;
  errorMe: string | null;
  errorUpdate: string | null;
  creatingAccount: boolean;
  blockStatus: { blockedByMe: boolean; blockedMe: boolean; anyBlocked: boolean } | null;
  loadingBlockStatus: boolean;
  errorBlockStatus: string | null;
  errorCreateAccount: string | null;
  lastCreatedCreds: { username: string; password: string } | null;
  debiting: boolean;
  errorDebit: string | null;
  // ===== Other user profile =====
  profileUser: UserFull | null;
  loadingProfile: boolean;
  errorProfile: string | null;
};

const initialState: SliceState = {
  me: null,
  loadingMe: false,
  updating: false,
  errorMe: null,
  errorUpdate: null,
  debiting: false,
  creatingAccount: false,
  errorCreateAccount: null,
  lastCreatedCreds: null,
  blockStatus: null,
  loadingBlockStatus: false,
  errorBlockStatus: null,
  errorDebit: null,
  profileUser: null,
  loadingProfile: false,
  errorProfile: null,
};

// Helpers: backend may return {success,data} OR {data} OR direct object
const pickUserFromApi = (res: any): UserFull => {
  const u =
    res?.data?.user ??
    res?.data?.data ??
    res?.data?.profileUser ??
    res?.data ??
    res;

  return {
    ...(u as UserFull),
    friendsCount: Number((u as any)?.friendsCount ?? 0),
  };
};
/* =========================
   ✅ Thunks
========================= */

// GET /users/me/full
export const fetchMyFullUser = createAsyncThunk<UserFull, void, { rejectValue: string }>(
  "user/fetchMyFullUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/me/full");
      return pickUserFromApi(res);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load user";
      return rejectWithValue(msg);
    }
  }
);
// PATCH /notifications/mark-related-read
export const markRelatedNotificationsAsRead = createAsyncThunk<
  {
    success: boolean;
    matchedCount: number;
    modifiedCount: number;
  },
  MarkRelatedNotificationsPayload,
  { rejectValue: string }
>(
  "user/markRelatedNotificationsAsRead",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.patch("/notifications/mark-related-read", payload);

      return {
        success: Boolean(res.data?.success),
        matchedCount: Number(res.data?.matchedCount || 0),
        modifiedCount: Number(res.data?.modifiedCount || 0),
      };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to mark related notifications as read";

      return rejectWithValue(String(msg));
    }
  }
);
export const createPaidAccount = createAsyncThunk<
  {
    success: boolean;
    cost: number;
    credentials: { username: string; password: string };
    user: any;
  },
  { username: string; password: string },
  { rejectValue: string }
>(
  "user/createPaidAccount",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log("🟡 [createPaidAccount thunk] START", {
        username,
        passwordLength: String(password || "").length,
      });

      const res = await api.post("/auth/coinz/create-account", {
        username,
        password,
      });

      console.log("✅ [createPaidAccount thunk] SUCCESS", {
        status: res.status,
        data: res.data,
      });

      return res.data;
    } catch (e: any) {
      console.log("❌ [createPaidAccount thunk] FAILED", {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
        baseURL: e?.config?.baseURL,
        method: e?.config?.method,
      });

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to create account";

      return rejectWithValue(String(msg));
    }
  }
);
// ✅ POST /auth/register  (بدون حفظ token/user)
export const registerNoLogin = createAsyncThunk<
  { credentials: { username: string; password: string } },
  { username: string; password: string },
  { rejectValue: string }
>("user/registerNoLogin", async ({ username, password }, { rejectWithValue }) => {
  try {
    await api.post("/auth/register", { username, password });

    // لا نحفظ token ولا user في AsyncStorage
    return { credentials: { username, password } };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "Registration failed";
    return rejectWithValue(msg);
  }
});
export const changeMyEmail = createAsyncThunk<
  UserFull,
  { email: string },
  { rejectValue: string }
>(
  "user/changeMyEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await api.patch("/users/me/change-email", { email });
      return pickUserFromApi(res);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to change email";
      return rejectWithValue(msg);
    }
  }
);
export const fetchBlockStatus = createAsyncThunk<
  { blockedByMe: boolean; blockedMe: boolean; anyBlocked: boolean },
  { targetUserId: string },
  { rejectValue: string }
>("user/fetchBlockStatus", async ({ targetUserId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/users/block-status/${targetUserId}`);
    return {
      blockedByMe: !!res.data.blockedByMe,
      blockedMe: !!res.data.blockedMe,
      anyBlocked: !!res.data.anyBlocked,
    };
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to load block status");
  }
});
// PATCH /users/me/settings
export const updateMyProfileSettings = createAsyncThunk<UserFull, UpdateProfilePayload, { rejectValue: string }>(
  "user/updateMyProfileSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.patch("/users/me/settings", payload);
      return pickUserFromApi(res);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update profile";
      return rejectWithValue(msg);
    }
  }
);
export const updateMyLocation = createAsyncThunk<
  UserFull,
  UpdateLocationPayload,
  { rejectValue: string }
>(
  "user/updateMyLocation",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.patch("/users/update-location", payload);
      const data = res?.data?.data ?? res?.data ?? {};

      return {
        ...(data as UserFull),
      };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update location";
      return rejectWithValue(msg);
    }
  }
);
// PATCH /users/coinz/debit-me
export const debitMyCoinz = createAsyncThunk<
  { CoinzBalance: number; debited: number },
  { amount: number; reason?: string },
  { rejectValue: string }
>(
  "user/debitMyCoinz",
  async ({ amount, reason }, { rejectWithValue }) => {
    try {
      const res = await api.patch("/users/coinz/debit-me", {
        amount,
        reason,
      });

      return {
        CoinzBalance: Number(res.data.coinzBalance ?? res.data.CoinzBalance) || 0,
        debited: Number(res.data.debited) || 0,
      };
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to debit coinz";
      return rejectWithValue(msg);
    }
  }
);
// GET /users/:userId   ✅ مطابق للـ controller عندك (getUserProfile)
export const fetchUserProfile = createAsyncThunk<UserFull, string, { rejectValue: string }>(
  "user/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/profile/${userId}`);
      return pickUserFromApi(res);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to fetch profile";
      return rejectWithValue(msg);
    }
  }
);

/* =========================
   ✅ Slice
========================= */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMe(state, action: PayloadAction<UserFull | null>) {
      state.me = action.payload;
    },
    patchMe(state, action: PayloadAction<Partial<UserFull>>) {
      if (!state.me) return;
      state.me = { ...state.me, ...action.payload };
    },
    clearUserErrors(state) {
      state.errorMe = null;
      state.errorUpdate = null;
      state.errorProfile = null;
    },
    clearBlockStatus(state) {
  state.blockStatus = null;
  state.loadingBlockStatus = false;
  state.errorBlockStatus = null;
},
    clearProfile(state) {
      state.profileUser = null;
      state.loadingProfile = false;
      state.errorProfile = null;
    },
      resetUserState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ===== change email =====
builder.addCase(changeMyEmail.pending, (state) => {
  state.updating = true;
  state.errorUpdate = null;
});

builder.addCase(changeMyEmail.fulfilled, (state, action) => {
  state.updating = false;
  state.me = action.payload;
});

builder.addCase(changeMyEmail.rejected, (state, action) => {
  state.updating = false;
  state.errorUpdate = action.payload || "Failed to change email";
});
        // ===== update location =====
    builder.addCase(updateMyLocation.pending, (state) => {
      state.updating = true;
      state.errorUpdate = null;
    });

    builder.addCase(updateMyLocation.fulfilled, (state, action) => {
      state.updating = false;

      if (state.me) {
        state.me.country = action.payload.country;
        state.me.city = action.payload.city;
        state.me.updatedAt = action.payload.updatedAt;
      } else {
        state.me = action.payload;
      }
    });

    builder.addCase(updateMyLocation.rejected, (state, action) => {
      state.updating = false;
      state.errorUpdate = action.payload || "Failed to update location";
    });
    // ===== registerNoLogin =====
    builder.addCase(registerNoLogin.pending, (state) => {
      state.creatingAccount = true;
      state.errorCreateAccount = null;
    });

    builder.addCase(registerNoLogin.fulfilled, (state, action) => {
      state.creatingAccount = false;
      state.lastCreatedCreds = action.payload.credentials;
    });

    builder.addCase(registerNoLogin.rejected, (state, action) => {
      state.creatingAccount = false;
      state.errorCreateAccount = action.payload || "Registration failed";
    });
    // ===== debit coinz =====
    builder.addCase(debitMyCoinz.pending, (state) => {
      state.debiting = true;
      state.errorDebit = null;
    });

    builder.addCase(debitMyCoinz.fulfilled, (state, action) => {
      state.debiting = false;

      if (state.me) {
        state.me.CoinzBalance = action.payload.CoinzBalance;
      }
    });

    builder.addCase(debitMyCoinz.rejected, (state, action) => {
      state.debiting = false;
      state.errorDebit = action.payload || "Failed to debit coinz";
    });
    // ===== fetchBlockStatus =====
builder.addCase(fetchBlockStatus.pending, (state) => {
  state.loadingBlockStatus = true;
  state.errorBlockStatus = null;
});

builder.addCase(fetchBlockStatus.fulfilled, (state, action) => {
  state.loadingBlockStatus = false;
  state.blockStatus = action.payload;
});

builder.addCase(fetchBlockStatus.rejected, (state, action) => {
  state.loadingBlockStatus = false;
  state.errorBlockStatus = action.payload || "Failed to load block status";
});
    // ===== fetch me =====
    builder.addCase(fetchMyFullUser.pending, (state) => {
      state.loadingMe = true;
      state.errorMe = null;
    });
    builder.addCase(fetchMyFullUser.fulfilled, (state, action) => {
      state.loadingMe = false;
      state.me = action.payload;
    });
    builder.addCase(fetchMyFullUser.rejected, (state, action) => {
      state.loadingMe = false;
      state.errorMe = action.payload || "Failed to load user";
    });

    // ===== update settings =====
    builder.addCase(updateMyProfileSettings.pending, (state) => {
      state.updating = true;
      state.errorUpdate = null;
    });
    builder.addCase(updateMyProfileSettings.fulfilled, (state, action) => {
      state.updating = false;
      state.me = action.payload;
    });
    builder.addCase(updateMyProfileSettings.rejected, (state, action) => {
      state.updating = false;
      state.errorUpdate = action.payload || "Failed to update profile";
    });

    // ===== fetch other user profile =====
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loadingProfile = true;
      state.errorProfile = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loadingProfile = false;
      state.profileUser = action.payload;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loadingProfile = false;
      state.errorProfile = action.payload || "Failed to fetch profile";
    });
  },
});

export const {
  setMe,
  patchMe,
  clearUserErrors,
  clearProfile,
  clearBlockStatus,
    resetUserState,

} = userSlice.actions;
export default userSlice.reducer;

/* =========================
   ✅ Selectors
========================= */

// Me selectors
export const selectBlockStatus = (state: RootState) => state.user.blockStatus;
export const selectBlockStatusLoading = (state: RootState) => state.user.loadingBlockStatus;
export const selectBlockStatusError = (state: RootState) => state.user.errorBlockStatus;
export const selectMe = (state: RootState) => state.user.me;
export const selectUserLoading = (state: RootState) => state.user.loadingMe;
export const selectUserUpdating = (state: RootState) => state.user.updating;
export const selectUserErrorMe = (state: RootState) => state.user.errorMe;
export const selectUserErrorUpdate = (state: RootState) => state.user.errorUpdate;
export const selectUserDebiting = (state: RootState) => state.user.debiting;
export const selectUserErrorDebit = (state: RootState) => state.user.errorDebit;
export const selectUserCreatingAccount = (state: RootState) => state.user.creatingAccount;
export const selectUserCreateAccountError = (state: RootState) => state.user.errorCreateAccount;
export const selectUserLastCreatedCreds = (state: RootState) => state.user.lastCreatedCreds;
// Profile selectors (other user)
export const selectProfileUser = (state: RootState) => state.user.profileUser;
export const selectProfileLoading = (state: RootState) => state.user.loadingProfile;
export const selectProfileError = (state: RootState) => state.user.errorProfile;