

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

export type FriendshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked_by_me"
  | "blocked_me";

export interface UserItem {
  _id: string;
  username: string;
  atUsername?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  bio?: string;

  relationshipStatus: FriendshipStatus;
}

interface FriendState {
  searchResults: UserItem[];
  suggestedFriends: UserItem[];
  pendingRequests: UserItem[];
  blockedUsers: UserItem[];
  friends: UserItem[];

  loading: boolean;
  loadingSuggested: boolean;

  error?: string;
  errorSuggested?: string;
}
const initialState: FriendState = {
  searchResults: [],
  suggestedFriends: [],
  pendingRequests: [],
  blockedUsers: [],
  friends: [],
  loading: false,
  loadingSuggested: false,
  error: undefined,
  errorSuggested: undefined,
};
/* =====================================================
   ASYNC THUNKS
===================================================== */

export const searchUsers = createAsyncThunk<UserItem[], string>(
  "friends/search",
  async (query, thunkAPI) => {
    try {
      const res = await api.get(`/users/search?q=${query}`);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue("Search failed");
    }
  }
);

export const getFriends = createAsyncThunk<UserItem[]>(
  "friends/getFriends",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`/friends`);
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Fetch friends failed");
    }
  }
);

export const getPendingRequests = createAsyncThunk<UserItem[]>(
  "friends/pending",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`/friends/pending`);
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Pending failed");
    }
  }
);

export const getBlockedUsers = createAsyncThunk<UserItem[]>(
  "friends/getBlocked",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/users/blocked");
      return res.data;
    } catch {
      return thunkAPI.rejectWithValue("Fetch blocked failed");
    }
  }
);

export const sendFriendRequest = createAsyncThunk<string, string>(
  "friends/send",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/friends/${userId}/send`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Send failed");
    }
  }
);

export const cancelFriendRequest = createAsyncThunk<string, string>(
  "friends/cancel",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/friends/${userId}/cancel`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Cancel failed");
    }
  }
);

export const acceptFriendRequest = createAsyncThunk<string, string>(
  "friends/accept",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/friends/${userId}/accept`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Accept failed");
    }
  }
);

export const rejectFriendRequest = createAsyncThunk<string, string>(
  "friends/reject",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/friends/${userId}/reject`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Reject failed");
    }
  }
);
export const fetchSuggestedFriends = createAsyncThunk<UserItem[], number | undefined>(
  "friends/suggested",
  async (limit = 12, thunkAPI) => {
    try {
      console.log("🚀 fetchSuggestedFriends started");
      console.log("📦 Limit:", limit);

      const url = `/friends/suggested?limit=${limit}`;
      console.log("🌐 Request URL:", url);

      const res = await api.get(url);

      console.log("✅ Response received:", res.status);
      console.log("📄 Full response:", res.data);

      const data = res.data?.data || [];

      console.log("👥 Suggested friends count:", data.length);
      console.log("👥 Suggested friends:", data);

      return data;
    } catch (err: any) {
      console.log("❌ fetchSuggestedFriends error");

      if (err.response) {
        console.log("📡 Server response error:", err.response.data);
        console.log("📡 Status:", err.response.status);
      } else if (err.request) {
        console.log("📡 No response received:", err.request);
      } else {
        console.log("📡 Error message:", err.message);
      }

      return thunkAPI.rejectWithValue("Fetch suggested friends failed");
    }
  }
);
export const removeFriend = createAsyncThunk<string, string>(
  "friends/remove",
  async (userId, thunkAPI) => {
    try {
      await api.delete(`/friends/${userId}/remove`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Remove failed");
    }
  }
);

export const blockUser = createAsyncThunk<string, string>(
  "friends/block",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/friends/${userId}/block`);
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Block failed");
    }
  }
);

export const unblockUser = createAsyncThunk<string, string>(
  "friends/unblock",
  async (userId, thunkAPI) => {
    try {
      await api.post(`/users/unblock`, { targetUserId: userId });
      return userId;
    } catch {
      return thunkAPI.rejectWithValue("Unblock failed");
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const friendSlice = createSlice({
  name: "friends",
  initialState,

  reducers: {

    updateOnlineStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        isOnline: boolean;
        lastSeen?: string | null;
      }>
    ) => {

      const { userId, isOnline, lastSeen } = action.payload;

      const update = (list: UserItem[]) => {

        const user = list.find(u => u._id === userId);
        if (!user) return;

        user.isOnline = isOnline;

        if (isOnline) {
          user.lastSeen = undefined;
        } else {
          user.lastSeen = lastSeen || undefined;
        }
      };

      update(state.searchResults);
      update(state.friends);
      update(state.pendingRequests);
      update(state.blockedUsers);
    },


    clearFriendError: (state) => {
      state.error = undefined;
    },
    clearSuggestedFriends: (state) => {
      state.suggestedFriends = [];
      state.errorSuggested = undefined;
    },
  },

 extraReducers: (builder) => {
  builder

    /* SEARCH */
    .addCase(searchUsers.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(searchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.searchResults = action.payload;
    })
    .addCase(searchUsers.rejected, (state) => {
      state.loading = false;
      state.error = "Search failed";
    })

    /* SUGGESTED FRIENDS */
    .addCase(fetchSuggestedFriends.pending, (state) => {
      state.loadingSuggested = true;
      state.errorSuggested = undefined;
    })
    .addCase(fetchSuggestedFriends.fulfilled, (state, action) => {
      state.loadingSuggested = false;
      state.suggestedFriends = action.payload;
    })
    .addCase(fetchSuggestedFriends.rejected, (state) => {
      state.loadingSuggested = false;
      state.errorSuggested = "Fetch suggested friends failed";
    })

    /* FRIENDS */
    .addCase(getFriends.fulfilled, (state, action) => {
      state.friends = action.payload;
    })

    /* PENDING */
    .addCase(getPendingRequests.fulfilled, (state, action) => {
      state.pendingRequests = action.payload;
    })

    /* BLOCKED */
    .addCase(getBlockedUsers.fulfilled, (state, action) => {
      state.blockedUsers = action.payload.map((user) => ({
        ...user,
        relationshipStatus: "blocked_by_me",
      }));
    })

    /* SEND */
    .addCase(sendFriendRequest.fulfilled, (state, action) => {
      const userId = action.payload;

      const searchUser = state.searchResults.find((u) => u._id === userId);
      if (searchUser) searchUser.relationshipStatus = "pending_sent";

      const suggestedUser = state.suggestedFriends.find((u) => u._id === userId);
      if (suggestedUser) suggestedUser.relationshipStatus = "pending_sent";
    })

    /* CANCEL */
    .addCase(cancelFriendRequest.fulfilled, (state, action) => {
      const userId = action.payload;

      const searchUser = state.searchResults.find((u) => u._id === userId);
      if (searchUser) searchUser.relationshipStatus = "none";

      const suggestedUser = state.suggestedFriends.find((u) => u._id === userId);
      if (suggestedUser) suggestedUser.relationshipStatus = "none";
    })

    /* ACCEPT */
    .addCase(acceptFriendRequest.fulfilled, (state, action) => {
      const userId = action.payload;

      state.pendingRequests = state.pendingRequests.filter((u) => u._id !== userId);

      const searchUser = state.searchResults.find((u) => u._id === userId);
      if (searchUser) {
        searchUser.relationshipStatus = "accepted";
        if (!state.friends.some((f) => f._id === userId)) {
          state.friends.push(searchUser);
        }
      }

      const suggestedUser = state.suggestedFriends.find((u) => u._id === userId);
      if (suggestedUser) {
        suggestedUser.relationshipStatus = "accepted";
        if (!state.friends.some((f) => f._id === userId)) {
          state.friends.push(suggestedUser);
        }
      }
    })

    /* REJECT */
    .addCase(rejectFriendRequest.fulfilled, (state, action) => {
      const userId = action.payload;

      state.pendingRequests = state.pendingRequests.filter((u) => u._id !== userId);

      const searchUser = state.searchResults.find((u) => u._id === userId);
      if (searchUser) searchUser.relationshipStatus = "none";

      const suggestedUser = state.suggestedFriends.find((u) => u._id === userId);
      if (suggestedUser) suggestedUser.relationshipStatus = "none";
    })

    /* REMOVE */
    .addCase(removeFriend.fulfilled, (state, action) => {
      const userId = action.payload;

      state.friends = state.friends.filter((u) => u._id !== userId);

      const searchUser = state.searchResults.find((u) => u._id === userId);
      if (searchUser) searchUser.relationshipStatus = "none";

      const suggestedUser = state.suggestedFriends.find((u) => u._id === userId);
      if (suggestedUser) suggestedUser.relationshipStatus = "none";
    })

    /* BLOCK */
    .addCase(blockUser.fulfilled, (state, action) => {
      const userId = action.payload;

      state.friends = state.friends.filter((u) => u._id !== userId);
      state.pendingRequests = state.pendingRequests.filter((u) => u._id !== userId);
      state.suggestedFriends = state.suggestedFriends.filter((u) => u._id !== userId);

      const user = state.searchResults.find((u) => u._id === userId);
      if (user) {
        user.relationshipStatus = "blocked_by_me";
        if (!state.blockedUsers.some((u) => u._id === userId)) {
          state.blockedUsers.push(user);
        }
      }
    })

    /* UNBLOCK */
    .addCase(unblockUser.fulfilled, (state, action) => {
      const userId = action.payload;

      state.blockedUsers = state.blockedUsers.filter((u) => u._id !== userId);

      const user = state.searchResults.find((u) => u._id === userId);
      if (user) user.relationshipStatus = "none";
    });
}

});

export const {
  updateOnlineStatus,
  clearFriendError,
  clearSuggestedFriends,
} = friendSlice.actions;

export default friendSlice.reducer;
