
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
  status?: string;
  statusMessage?: string;

  country?: string;
  countryCode?: string;
  city?: string;

  birthdate?: string | Date;
  dateOfBirth?: string | Date;

  email?: string;
  gender?: "Male" | "Female" | string;

  avatar?: string;
  cover?: string;
  coverImage?: string;

  age?: number;
  tags?: string[];

  privacy?: {
    profileVisible?: boolean;
    showLastActive?: boolean;
    showMedia?: boolean;
    allowMessages?: boolean;
    showOnlineStatus?: boolean;
    showLastSeen?: boolean;
    showProfile?: boolean;
    showFriends?: boolean;
  };

  notifications?: {
    messages?: boolean;
    likes?: boolean;
    follows?: boolean;
    friends?: boolean;
    rooms?: boolean;
    gifts?: boolean;
    system?: boolean;
  };

  partnerPreferences?: {
    ageRange?: string;
    location?: string;
    maritalStatus?: string;
    religiosity?: string;
  };

  notificationSound?: boolean;
  readReceiptsEnabled?: boolean;

  [key: string]: any;
};

export type UpdateLocationPayload = {
  country?: string;
  countryCode?: string;
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
  id?: string;

  username: string;
  atUsername?: string;
  email?: string;

  friendsCount?: number;
  role?: UserRole | string;

  isOnline?: boolean;
  isInvisible?: boolean;
  lastSeen?: string;
  age?: number;

  blockedUsers?: string[];

  CoinzBalance: number;

  birthdate?: string;
  dateOfBirth?: string;

  country?: string;
  countryCode?: string;
  city?: string;
  gender?: string;

  displayName?: string;
  bio?: string;
  status?: string;
  statusMessage?: string;

  avatar?: string;
  cover?: string;
  coverImage?: string;

  avatarFrame?: string;
  badges?: string[];
  verificationType?: VerificationType;

  ownedMessageEffects?: string[];
  ownedGifts?: string[];

  profileEntryAnimation?: string;

  activeCustomization?: {
    avatarGif?: string;
    usernameColor?: string;
    messageTextColor?: string;
    avatarFrame?: string;
    messageEffect?: string;
    profileEntryAnimation?: string;
    badges?: string[];
    verificationType?: VerificationType;
  };

  followersCount?: number;
  followingCount?: number;
  totalLikesReceived?: number;
  totalRetweetsReceived?: number;
  profileViews?: number;

  isVerified?: boolean;
  notificationSound?: boolean;
  readReceiptsEnabled?: boolean;

  privacy?: {
    profileVisible?: boolean;
    showLastActive?: boolean;
    showMedia?: boolean;
    allowMessages?: boolean;
    showOnlineStatus?: boolean;
    showLastSeen?: boolean;
    showProfile?: boolean;
    showFriends?: boolean;
  };

  notifications?: {
    messages?: boolean;
    likes?: boolean;
    follows?: boolean;
    friends?: boolean;
    rooms?: boolean;
    gifts?: boolean;
    system?: boolean;
  };

  partnerPreferences?: {
    ageRange?: string;
    location?: string;
    maritalStatus?: string;
    religiosity?: string;
  };

  tags?: string[];

  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
};

type SliceState = {
  // ===== Me =====
  me: UserFull | null;
  loadingMe: boolean;
  updating: boolean;
  errorMe: string | null;
  errorUpdate: string | null;

  creatingAccount: boolean;
  errorCreateAccount: string | null;
  lastCreatedCreds: { username: string; password: string } | null;

  blockStatus: {
    blockedByMe: boolean;
    blockedMe: boolean;
    anyBlocked: boolean;
  } | null;
  loadingBlockStatus: boolean;
  errorBlockStatus: string | null;

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

  creatingAccount: false,
  errorCreateAccount: null,
  lastCreatedCreds: null,

  blockStatus: null,
  loadingBlockStatus: false,
  errorBlockStatus: null,

  debiting: false,
  errorDebit: null,

  profileUser: null,
  loadingProfile: false,
  errorProfile: null,
};

/* =========================
   ✅ Helpers
========================= */

const getErrorMessage = (e: any, fallback: string) => {
  return String(
    e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      fallback
  );
};

const normalizeUser = (rawUser: any): UserFull => {
  const user = rawUser || {};

  const id = String(user?._id || user?.id || "");

  return {
    ...(user as UserFull),

    _id: id,
    id: String(user?.id || user?._id || id),

    username: String(user?.username || ""),
    atUsername: user?.atUsername || "",

    email: user?.email || "",

    avatar: user?.avatar || "",
    cover: user?.cover || user?.coverImage || "",
    coverImage: user?.coverImage || user?.cover || "",

    bio: user?.bio || "",
    status: user?.status || "",
    statusMessage: user?.statusMessage || user?.status || user?.bio || "",

    country: user?.country || "",
    countryCode: user?.countryCode || "",
    city: user?.city || "",
    gender: user?.gender || "",

    birthdate: user?.birthdate || user?.dateOfBirth || "",
    dateOfBirth: user?.dateOfBirth || user?.birthdate || "",

    blockedUsers: Array.isArray(user?.blockedUsers) ? user.blockedUsers : [],

    badges: Array.isArray(user?.badges) ? user.badges : [],
    ownedMessageEffects: Array.isArray(user?.ownedMessageEffects)
      ? user.ownedMessageEffects
      : [],
    ownedGifts: Array.isArray(user?.ownedGifts) ? user.ownedGifts : [],
    tags: Array.isArray(user?.tags) ? user.tags : [],

    friendsCount: Number(user?.friendsCount ?? 0),
    followersCount: Number(user?.followersCount ?? 0),
    followingCount: Number(user?.followingCount ?? 0),
    totalLikesReceived: Number(user?.totalLikesReceived ?? 0),
    totalRetweetsReceived: Number(user?.totalRetweetsReceived ?? 0),
    profileViews: Number(user?.profileViews ?? 0),

    CoinzBalance: Number(user?.CoinzBalance ?? user?.coinzBalance ?? 0),

    isOnline: Boolean(user?.isOnline),
    isInvisible: Boolean(user?.isInvisible),
    isVerified: Boolean(user?.isVerified),

    notificationSound: Boolean(user?.notificationSound),
    readReceiptsEnabled: Boolean(user?.readReceiptsEnabled),

    verificationType: user?.verificationType || "none",

    privacy: {
      ...(user?.privacy || {}),
    },

    notifications: {
      ...(user?.notifications || {}),
    },

    partnerPreferences: {
      ...(user?.partnerPreferences || {}),
    },

    activeCustomization: {
      ...(user?.activeCustomization || {}),
      badges: Array.isArray(user?.activeCustomization?.badges)
        ? user.activeCustomization.badges
        : [],
      verificationType:
        user?.activeCustomization?.verificationType ||
        user?.verificationType ||
        "none",
    },
  };
};

const pickUserFromApi = (res: any): UserFull => {
  const raw =
    res?.data?.user ??
    res?.data?.data?.user ??
    res?.data?.profileUser ??
    res?.data?.data?.profileUser ??
    res?.data?.me ??
    res?.data?.data?.me ??
    res?.data?.data ??
    res?.data ??
    res;

  const user = raw?.user ?? raw?.me ?? raw;

  return normalizeUser(user);
};

const mergeUser = (oldUser: UserFull | null, newUser: any): UserFull => {
  const normalized = normalizeUser(newUser);

  return {
    ...(oldUser || ({} as UserFull)),
    ...normalized,

    privacy: {
      ...(oldUser?.privacy || {}),
      ...(normalized?.privacy || {}),
    },

    notifications: {
      ...(oldUser?.notifications || {}),
      ...(normalized?.notifications || {}),
    },

    partnerPreferences: {
      ...(oldUser?.partnerPreferences || {}),
      ...(normalized?.partnerPreferences || {}),
    },

    activeCustomization: {
      ...(oldUser?.activeCustomization || {}),
      ...(normalized?.activeCustomization || {}),
    },
  };
};

/* =========================
   ✅ Thunks
========================= */

// GET /users/me/full
export const fetchMyFullUser = createAsyncThunk<
  UserFull,
  void,
  { rejectValue: string }
>("user/fetchMyFullUser", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/users/me/full");
    return pickUserFromApi(res);
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Failed to load user"));
  }
});

// PATCH /notifications/mark-related-read
export const markRelatedNotificationsAsRead = createAsyncThunk<
  {
    success: boolean;
    matchedCount: number;
    modifiedCount: number;
  },
  MarkRelatedNotificationsPayload,
  { rejectValue: string }
>("user/markRelatedNotificationsAsRead", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch("/notifications/mark-related-read", payload);

    return {
      success: Boolean(res.data?.success),
      matchedCount: Number(res.data?.matchedCount || 0),
      modifiedCount: Number(res.data?.modifiedCount || 0),
    };
  } catch (e: any) {
    return rejectWithValue(
      getErrorMessage(e, "Failed to mark related notifications as read")
    );
  }
});

// POST /auth/coinz/create-account
export const createPaidAccount = createAsyncThunk<
  {
    success: boolean;
    cost: number;
    credentials: { username: string; password: string };
    user: any;
  },
  { username: string; password: string },
  { rejectValue: string }
>("user/createPaidAccount", async ({ username, password }, { rejectWithValue }) => {
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

    return rejectWithValue(getErrorMessage(e, "Failed to create account"));
  }
});

// POST /auth/register  بدون حفظ token/user
export const registerNoLogin = createAsyncThunk<
  { credentials: { username: string; password: string } },
  { username: string; password: string },
  { rejectValue: string }
>("user/registerNoLogin", async ({ username, password }, { rejectWithValue }) => {
  try {
    await api.post("/auth/register", { username, password });

    return { credentials: { username, password } };
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Registration failed"));
  }
});

// PATCH /users/me/change-email
export const changeMyEmail = createAsyncThunk<
  UserFull,
  { email: string },
  { rejectValue: string }
>("user/changeMyEmail", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await api.patch("/users/me/change-email", { email });
    return pickUserFromApi(res);
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Failed to change email"));
  }
});

// GET /users/block-status/:targetUserId
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
    return rejectWithValue(getErrorMessage(e, "Failed to load block status"));
  }
});

// PATCH /users/me/settings
export const updateMyProfileSettings = createAsyncThunk<
  UserFull,
  UpdateProfilePayload,
  { rejectValue: string }
>("user/updateMyProfileSettings", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch("/users/me/settings", payload);
    return pickUserFromApi(res);
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Failed to update profile"));
  }
});

// PATCH /users/update-location
export const updateMyLocation = createAsyncThunk<
  UserFull,
  UpdateLocationPayload,
  { rejectValue: string }
>("user/updateMyLocation", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch("/users/update-location", payload);
    return pickUserFromApi(res);
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Failed to update location"));
  }
});

// PATCH /users/coinz/debit-me
export const debitMyCoinz = createAsyncThunk<
  { CoinzBalance: number; debited: number },
  { amount: number; reason?: string },
  { rejectValue: string }
>("user/debitMyCoinz", async ({ amount, reason }, { rejectWithValue }) => {
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
    return rejectWithValue(getErrorMessage(e, "Failed to debit coinz"));
  }
});

// GET /users/profile/:userId
export const fetchUserProfile = createAsyncThunk<
  UserFull,
  string,
  { rejectValue: string }
>("user/fetchUserProfile", async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/users/profile/${userId}`);
    return pickUserFromApi(res);
  } catch (e: any) {
    return rejectWithValue(getErrorMessage(e, "Failed to fetch profile"));
  }
});

/* =========================
   ✅ Slice
========================= */

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    setMe(state, action: PayloadAction<UserFull | null>) {
      state.me = action.payload ? normalizeUser(action.payload) : null;
    },

    patchMe(state, action: PayloadAction<Partial<UserFull>>) {
      if (!state.me) {
        state.me = normalizeUser(action.payload);
        return;
      }

      state.me = mergeUser(state.me, action.payload);
    },

    clearUserErrors(state) {
      state.errorMe = null;
      state.errorUpdate = null;
      state.errorProfile = null;
      state.errorCreateAccount = null;
      state.errorDebit = null;
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
    /* =========================
       changeMyEmail
    ========================= */

    builder.addCase(changeMyEmail.pending, (state) => {
      state.updating = true;
      state.errorUpdate = null;
    });

    builder.addCase(changeMyEmail.fulfilled, (state, action) => {
      state.updating = false;
      state.errorUpdate = null;
      state.me = mergeUser(state.me, action.payload);
    });

    builder.addCase(changeMyEmail.rejected, (state, action) => {
      state.updating = false;
      state.errorUpdate = action.payload || "Failed to change email";
    });

    /* =========================
       updateMyLocation
    ========================= */

    builder.addCase(updateMyLocation.pending, (state) => {
      state.updating = true;
      state.errorUpdate = null;
    });

    builder.addCase(updateMyLocation.fulfilled, (state, action) => {
      state.updating = false;
      state.errorUpdate = null;
      state.me = mergeUser(state.me, action.payload);
    });

    builder.addCase(updateMyLocation.rejected, (state, action) => {
      state.updating = false;
      state.errorUpdate = action.payload || "Failed to update location";
    });

    /* =========================
       registerNoLogin
    ========================= */

    builder.addCase(registerNoLogin.pending, (state) => {
      state.creatingAccount = true;
      state.errorCreateAccount = null;
    });

    builder.addCase(registerNoLogin.fulfilled, (state, action) => {
      state.creatingAccount = false;
      state.errorCreateAccount = null;
      state.lastCreatedCreds = action.payload.credentials;
    });

    builder.addCase(registerNoLogin.rejected, (state, action) => {
      state.creatingAccount = false;
      state.errorCreateAccount = action.payload || "Registration failed";
    });

    /* =========================
       createPaidAccount
    ========================= */

    builder.addCase(createPaidAccount.pending, (state) => {
      state.creatingAccount = true;
      state.errorCreateAccount = null;
      state.lastCreatedCreds = null;
    });

    builder.addCase(createPaidAccount.fulfilled, (state, action) => {
      state.creatingAccount = false;
      state.errorCreateAccount = null;
      state.lastCreatedCreds = action.payload?.credentials || null;

      if (state.me && action.payload?.user?.CoinzBalance !== undefined) {
        state.me.CoinzBalance = Number(action.payload.user.CoinzBalance);
      }
    });

    builder.addCase(createPaidAccount.rejected, (state, action) => {
      state.creatingAccount = false;
      state.errorCreateAccount = action.payload || "Failed to create account";
    });

    /* =========================
       debitMyCoinz
    ========================= */

    builder.addCase(debitMyCoinz.pending, (state) => {
      state.debiting = true;
      state.errorDebit = null;
    });

    builder.addCase(debitMyCoinz.fulfilled, (state, action) => {
      state.debiting = false;
      state.errorDebit = null;

      if (state.me) {
        state.me.CoinzBalance = action.payload.CoinzBalance;
      }
    });

    builder.addCase(debitMyCoinz.rejected, (state, action) => {
      state.debiting = false;
      state.errorDebit = action.payload || "Failed to debit coinz";
    });

    /* =========================
       fetchBlockStatus
    ========================= */

    builder.addCase(fetchBlockStatus.pending, (state) => {
      state.loadingBlockStatus = true;
      state.errorBlockStatus = null;
    });

    builder.addCase(fetchBlockStatus.fulfilled, (state, action) => {
      state.loadingBlockStatus = false;
      state.errorBlockStatus = null;
      state.blockStatus = action.payload;
    });

    builder.addCase(fetchBlockStatus.rejected, (state, action) => {
      state.loadingBlockStatus = false;
      state.errorBlockStatus = action.payload || "Failed to load block status";
    });

    /* =========================
       fetchMyFullUser
    ========================= */

    builder.addCase(fetchMyFullUser.pending, (state) => {
      state.loadingMe = true;
      state.errorMe = null;
    });

    builder.addCase(fetchMyFullUser.fulfilled, (state, action) => {
      state.loadingMe = false;
      state.errorMe = null;
      state.me = normalizeUser(action.payload);
    });

    builder.addCase(fetchMyFullUser.rejected, (state, action) => {
      state.loadingMe = false;
      state.errorMe = action.payload || "Failed to load user";
    });

    /* =========================
       updateMyProfileSettings
    ========================= */

    builder.addCase(updateMyProfileSettings.pending, (state) => {
      state.updating = true;
      state.errorUpdate = null;
    });

    builder.addCase(updateMyProfileSettings.fulfilled, (state, action) => {
      state.updating = false;
      state.errorUpdate = null;
      state.me = mergeUser(state.me, action.payload);
    });

    builder.addCase(updateMyProfileSettings.rejected, (state, action) => {
      state.updating = false;
      state.errorUpdate = action.payload || "Failed to update profile";
    });

    /* =========================
       fetchUserProfile
    ========================= */

    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loadingProfile = true;
      state.errorProfile = null;
    });

    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loadingProfile = false;
      state.errorProfile = null;
      state.profileUser = normalizeUser(action.payload);
    });

    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loadingProfile = false;
      state.errorProfile = action.payload || "Failed to fetch profile";
    });

    /* =========================
       markRelatedNotificationsAsRead
    ========================= */

    builder.addCase(markRelatedNotificationsAsRead.rejected, (state) => {
      // لا نغيّر حالة المستخدم هنا حتى لا يؤثر فشل تعليم الإشعارات على الصفحة
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
export const selectMe = (state: RootState) => state.user.me;
export const selectUserLoading = (state: RootState) => state.user.loadingMe;
export const selectUserUpdating = (state: RootState) => state.user.updating;
export const selectUserErrorMe = (state: RootState) => state.user.errorMe;
export const selectUserErrorUpdate = (state: RootState) =>
  state.user.errorUpdate;

// Block status selectors
export const selectBlockStatus = (state: RootState) => state.user.blockStatus;
export const selectBlockStatusLoading = (state: RootState) =>
  state.user.loadingBlockStatus;
export const selectBlockStatusError = (state: RootState) =>
  state.user.errorBlockStatus;

// Coinz selectors
export const selectUserDebiting = (state: RootState) => state.user.debiting;
export const selectUserErrorDebit = (state: RootState) => state.user.errorDebit;

// Create account selectors
export const selectUserCreatingAccount = (state: RootState) =>
  state.user.creatingAccount;
export const selectUserCreateAccountError = (state: RootState) =>
  state.user.errorCreateAccount;
export const selectUserLastCreatedCreds = (state: RootState) =>
  state.user.lastCreatedCreds;

// Profile selectors - other user
export const selectProfileUser = (state: RootState) => state.user.profileUser;
export const selectProfileLoading = (state: RootState) =>
  state.user.loadingProfile;
export const selectProfileError = (state: RootState) => state.user.errorProfile;