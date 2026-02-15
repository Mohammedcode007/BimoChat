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
  coverImage?: string;
  bio?: string;
  country?: string;
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

      console.log("📥 [PROFILE] Fetching profile for:", userId);

      const res = await api.get(`/users/profile/${userId}`);

      console.log("✅ [PROFILE] Data received:", res.data);

      // تحديث auth.user أيضاً
      thunkAPI.dispatch(updateUser(res.data));

      return res.data;

    } catch (err: any) {

      console.log("❌ [PROFILE] Fetch failed:", err.response?.data || err);

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

      console.log("📤 [PROFILE] Updating with data:", data);

      const res = await api.patch("/users/update", data);

      console.log("✅ [PROFILE] Update success:", res.data);

      // تحديث auth.user فورًا
      thunkAPI.dispatch(updateUser(res.data));

      return res.data;

    } catch (err: any) {

      console.log("❌ [PROFILE] Update failed:", err.response?.data || err);

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
      console.log("🧹 [PROFILE] Clearing state");
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: builder => {
    builder

      /* ===== GET PROFILE ===== */
      .addCase(getMyProfile.pending, state => {
        console.log("⏳ [PROFILE] getMyProfile pending");
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyProfile.fulfilled, (state, action) => {
        console.log("🎉 [PROFILE] getMyProfile fulfilled");
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(getMyProfile.rejected, (state, action) => {
        console.log("🚨 [PROFILE] getMyProfile rejected:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPDATE ===== */
      .addCase(updateProfile.pending, state => {
        console.log("⏳ [PROFILE] updateProfile pending");
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log("🎉 [PROFILE] updateProfile fulfilled");
        state.loading = false;
        state.success = true;
        state.profile = action.payload;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        console.log("🚨 [PROFILE] updateProfile rejected:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
