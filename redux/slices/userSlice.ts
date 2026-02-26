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

  avatar?: string;
  coverImage?: string;

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

export type UserFull = {
  _id: string;

  username: string;
  atUsername: string;
  email?: string;

  role: UserRole;

  isOnline: boolean;
  isInvisible?: boolean;
  lastSeen?: string;

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

  profileUser: null,
  loadingProfile: false,
  errorProfile: null,
};

// Helpers: backend may return {success,data} OR {data} OR direct object
const pickUserFromApi = (res: any): UserFull => {
  const u = res?.data?.data ?? res?.data ?? res;
  return u as UserFull;
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
    clearProfile(state) {
      state.profileUser = null;
      state.loadingProfile = false;
      state.errorProfile = null;
    },
  },
  extraReducers: (builder) => {
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

export const { setMe, patchMe, clearUserErrors, clearProfile } = userSlice.actions;

export default userSlice.reducer;

/* =========================
   ✅ Selectors
========================= */

// Me selectors
export const selectMe = (state: RootState) => state.user.me;
export const selectUserLoading = (state: RootState) => state.user.loadingMe;
export const selectUserUpdating = (state: RootState) => state.user.updating;
export const selectUserErrorMe = (state: RootState) => state.user.errorMe;
export const selectUserErrorUpdate = (state: RootState) => state.user.errorUpdate;

// Profile selectors (other user)
export const selectProfileUser = (state: RootState) => state.user.profileUser;
export const selectProfileLoading = (state: RootState) => state.user.loadingProfile;
export const selectProfileError = (state: RootState) => state.user.errorProfile;