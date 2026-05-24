import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { updateUser } from "./authSlice";

/* =====================================================
   TYPES
===================================================== */

interface UpdateProfilePayload {
  username?: string;
  atUsername?: string;
  email?: string;

  avatar?: string;
  avatarPublicId?: string;

  avatarGif?: string;
  avatarGifPublicId?: string;

  coverImage?: string;
  cover?: string;
  coverImagePublicId?: string;

  bio?: string;
  gender?: string;
  country?: string;

  activeCustomization?: {
    avatarFrame?: string;
    avatarGif?: string;
    usernameColor?: string;
    messageTextColor?: string;
    messageEffect?: string;
    profileEntryAnimation?: string;
    badges?: string[];
    verificationType?: string;
  };
customImageBadge?: {
  url?: string;
  isActive?: boolean;
  purchasedAt?: string | Date | null;
  expiresAt?: string | Date | null;
};
  notificationSound?: boolean;
  readReceiptsEnabled?: boolean;

  oldPassword?: string;
  newPassword?: string;
}

interface ProfileState {
  profile: any | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  success: false,
  error: null,
};

/* =====================================================
   GET MY PROFILE
===================================================== */

export const getMyProfile = createAsyncThunk(
  "profile/getMyProfile",
  async (userId: string, thunkAPI) => {
    try {


      const res = await api.get(`/users/profile/${userId}`);


      // تحديث auth.user أيضاً
      thunkAPI.dispatch(updateUser(res.data));

      return res.data;

    } catch (err: any) {


      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

/* =====================================================
   UPDATE PROFILE
===================================================== */

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data: UpdateProfilePayload, thunkAPI) => {
    try {
      console.log("🟡 [profileSlice][updateProfile] SEND:", {
        keys: Object.keys(data || {}),
        avatar: data?.avatar,
        avatarGif: data?.avatarGif,
        activeCustomizationAvatarGif: data?.activeCustomization?.avatarGif,
        customImageBadge: data?.customImageBadge,
        data,
      });

      const res = await api.patch("/users/update", data);

      console.log("🟢 [profileSlice][updateProfile] RESPONSE:", {
        status: res.status,
        userId: res.data?._id,
        username: res.data?.username,
        avatar: res.data?.avatar,
        avatarGif: res.data?.avatarGif,
        activeCustomizationAvatarGif:
          res.data?.activeCustomization?.avatarGif,
        customImageBadge: res.data?.customImageBadge,
        data: res.data,
      });

      // تحديث auth.user فورًا
      thunkAPI.dispatch(updateUser(res.data));

      return res.data;
    } catch (err: any) {
      console.log("🔴 [profileSlice][updateProfile] ERROR:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Update failed"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileState: state => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: builder => {
    builder

      /* ===== GET PROFILE ===== */
      .addCase(getMyProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPDATE ===== */
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.profile = action.payload;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
