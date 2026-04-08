import api from "@/services/api";
import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";

/* =========================================================
   TYPES
========================================================= */

interface FollowState {
  followingMap: Record<string, boolean>;
  blockedMap: Record<string, boolean>;
  loadingMap: Record<string, boolean>;
  blockLoadingMap: Record<string, boolean>;
  error: string | null;
}

const initialState: FollowState = {
  followingMap: {},
  blockedMap: {},
  loadingMap: {},
  blockLoadingMap: {},
  error: null
};

/* =========================================================
   TOGGLE FOLLOW
========================================================= */

export const toggleFollow = createAsyncThunk<
  { targetId: string; following: boolean },
  string
>(
  "follow/toggle",
  async (targetId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/follow/${targetId}`);

      return {
        targetId,
        following: res.data.following
      };

    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Follow failed"
      );
    }
  }
);

/* =========================================================
   BLOCK USER
========================================================= */

export const blockUser = createAsyncThunk<
  { targetId: string },
  string
>(
  "follow/block",
  async (targetId, { rejectWithValue }) => {
    try {
    

      const res = await api.post(`/follow/${targetId}/block`);

    

      return { targetId };

    } catch (err: any) {
     
      return rejectWithValue(
        err.response?.data?.message || "Block failed"
      );
    }
  }
);
/* =========================================================
   SLICE
========================================================= */

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {

    /* ===== Reset عند Logout ===== */
    resetFollowState: (state) => {
      state.followingMap = {};
      state.blockedMap = {};
      state.loadingMap = {};
      state.blockLoadingMap = {};
      state.error = null;
    },

    /* ===== Set Manual Status ===== */
    setFollowStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        isFollowing: boolean;
      }>
    ) => {
      state.followingMap[action.payload.userId] =
        action.payload.isFollowing;
    }

  },

  extraReducers: (builder) => {

    /* ================================
       TOGGLE FOLLOW
    ================================= */

    builder.addCase(toggleFollow.pending, (state, action) => {

      const id = action.meta.arg;

      // منع الضغط المتكرر
      if (state.loadingMap[id]) return;

      state.loadingMap[id] = true;
      state.error = null;
    });

    builder.addCase(toggleFollow.fulfilled, (state, action) => {

      const { targetId, following } = action.payload;

      state.loadingMap[targetId] = false;

      // تحديث الحالة من السيرفر فقط
      state.followingMap[targetId] = following;

      // لو كان محظور سابقاً → أزل الحظر
      if (following) {
        delete state.blockedMap[targetId];
      }
    });

    builder.addCase(toggleFollow.rejected, (state, action) => {

      const id = action.meta.arg;

      state.loadingMap[id] = false;

      state.error =
        (action.payload as string) || "Follow failed";
    });

    /* ================================
       BLOCK USER
    ================================= */

    builder.addCase(blockUser.pending, (state, action) => {

      const id = action.meta.arg;

      if (state.blockLoadingMap[id]) return;

      state.blockLoadingMap[id] = true;
      state.error = null;
    });

    builder.addCase(blockUser.fulfilled, (state, action) => {

      const { targetId } = action.payload;

      state.blockLoadingMap[targetId] = false;

      // تحديد كمحظور
      state.blockedMap[targetId] = true;

      // إزالة المتابعة فوراً
      state.followingMap[targetId] = false;
    });

    builder.addCase(blockUser.rejected, (state, action) => {

      const id = action.meta.arg;

      state.blockLoadingMap[id] = false;

      state.error =
        (action.payload as string) || "Block failed";
    });

  }
});

export const {
  resetFollowState,
  setFollowStatus
} = followSlice.actions;

export default followSlice.reducer;
