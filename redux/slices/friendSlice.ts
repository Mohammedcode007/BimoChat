// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import api from "../../services/api";

// /* =====================================================
//    TYPES
// ===================================================== */

// export type FriendshipStatus =
//   | "none"
//   | "pending_sent"
//   | "pending_received"
//   | "accepted"
//   | "blocked_by_me"
//   | "blocked_me";


// export interface UserItem {
//     _id: string;
//     username: string;
//     atUsername?: string;
//     avatar?: string;
//     isOnline: boolean;
//     lastSeen?: string;
//     relationshipStatus: FriendshipStatus;
// }

// interface FriendState {
//     searchResults: UserItem[];
//     pendingRequests: UserItem[];
//     loading: boolean;
//     error?: string;
// }

// const initialState: FriendState = {
//     searchResults: [],
//     pendingRequests: [],
//     loading: false,
// };

// /* =====================================================
//    SEARCH USERS
// ===================================================== */

// export const searchUsers = createAsyncThunk<
//     UserItem[],
//     string,
//     { rejectValue: string }
// >("friends/search", async (query, thunkAPI) => {
//     try {
//         console.log("🔎 Searching users:", query);

//         const res = await api.get(`/users/search?q=${query}`);

//         console.log("✅ Search response:", res.data);

//         return res.data;

//     } catch (err: any) {
//         console.error("❌ Search error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    SEND FRIEND REQUEST
// ===================================================== */

// export const sendFriendRequest = createAsyncThunk<
//     string,
//     string,
//     { rejectValue: string }
// >("friends/send", async (userId, thunkAPI) => {
//     try {
//         console.log("📤 Sending friend request to:", userId);

//         await api.post(`/friends/${userId}/send`);

//         return userId;

//     } catch (err: any) {
//         console.error("❌ Send error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    CANCEL FRIEND REQUEST
// ===================================================== */

// export const cancelFriendRequest = createAsyncThunk<
//     string,
//     string,
//     { rejectValue: string }
// >("friends/cancel", async (userId, thunkAPI) => {
//     try {
//         console.log("❌ Canceling friend request:", userId);

//         await api.post(`/friends/${userId}/cancel`);

//         return userId;

//     } catch (err: any) {
//         console.error("❌ Cancel error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    ACCEPT REQUEST
// ===================================================== */

// export const acceptFriendRequest = createAsyncThunk<
//     string,
//     string,
//     { rejectValue: string }
// >("friends/accept", async (userId, thunkAPI) => {
//     try {
//         console.log("✅ Accepting friend:", userId);

//         await api.post(`/friends/${userId}/accept`);

//         return userId;

//     } catch (err: any) {
//         console.error("❌ Accept error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    REMOVE FRIEND
// ===================================================== */

// export const removeFriend = createAsyncThunk<
//     string,
//     string,
//     { rejectValue: string }
// >("friends/remove", async (userId, thunkAPI) => {
//     try {
//         console.log("🗑 Removing friend:", userId);

//         await api.delete(`/friends/${userId}/remove`);

//         return userId;

//     } catch (err: any) {
//         console.error("❌ Remove error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });


// /* =====================================================
//    BLOCK USER
// ===================================================== */

// export const blockUser = createAsyncThunk<
//     string,
//     string,
//     { rejectValue: string }
// >("friends/block", async (userId, thunkAPI) => {
//     try {
//         console.log("⛔ Blocking user:", userId);

//         await api.post(`/friends/${userId}/block`);

//         return userId;

//     } catch (err: any) {
//         console.error("❌ Block error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    GET PENDING REQUESTS
// ===================================================== */

// export const getPendingRequests = createAsyncThunk<
//     UserItem[],
//     void,
//     { rejectValue: string }
// >("friends/pending", async (_, thunkAPI) => {
//     try {
//         console.log("📥 Fetching pending requests");

//         const res = await api.get(`/friends/pending`);

//         return res.data;

//     } catch (err: any) {
//         console.error("❌ Pending error:", err.response?.data || err.message);
//         return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
// });

// /* =====================================================
//    SLICE
// ===================================================== */

// const friendSlice = createSlice({
//     name: "friends",
//     initialState,

//     reducers: {

//         /* ================= RELATION UPDATE (SOCKET) ================= */

//         updateRelationshipStatus: (
//             state,
//             action: PayloadAction<{ userId: string; status: FriendshipStatus }>
//         ) => {

//             console.log("🔄 Realtime relationship update:", action.payload);

//             const user = state.searchResults.find(
//                 u => u._id === action.payload.userId
//             );

//             if (user) {
//                 user.relationshipStatus = action.payload.status;
//             }
//         },

//         /* ================= ONLINE STATUS UPDATE (SOCKET) ================= */

//         updateOnlineStatus: (
//             state,
//             action: PayloadAction<{
//                 userId: string;
//                 status: "online" | "offline";
//                 lastSeen?: string;
//             }>
//         ) => {

//             console.log("🟢 Presence update:", action.payload);

//             const user = state.searchResults.find(
//                 u => u._id === action.payload.userId
//             );

//             if (user) {
//                 if (action.payload.status === "online") {
//                     user.isOnline = true;
//                     user.lastSeen = undefined;
//                 } else {
//                     user.isOnline = false;
//                     user.lastSeen = action.payload.lastSeen;
//                 }
//             }
//         }

//     },

//   extraReducers: builder => {

//   builder

//     /* ===== SEARCH ===== */
//     .addCase(searchUsers.pending, state => {
//       state.loading = true;
//     })

//     .addCase(searchUsers.fulfilled, (state, action) => {
//       state.loading = false;
//       state.searchResults = action.payload;
//     })

//     .addCase(searchUsers.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     })

//     /* ===== SEND ===== */
//     .addCase(sendFriendRequest.fulfilled, (state, action) => {
//       const user = state.searchResults.find(
//         u => u._id === action.payload
//       );
//       if (user) {
//         user.relationshipStatus = "pending_sent";
//       }
//     })

//     /* ===== CANCEL ===== */
//     .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//       const user = state.searchResults.find(
//         u => u._id === action.payload
//       );
//       if (user) {
//         user.relationshipStatus = "none";
//       }
//     })

//     /* ===== ACCEPT ===== */
//     .addCase(acceptFriendRequest.fulfilled, (state, action) => {
//       const user = state.searchResults.find(
//         u => u._id === action.payload
//       );
//       if (user) {
//         user.relationshipStatus = "accepted";
//       }
//     })

//     /* ===== REMOVE ===== */
//     .addCase(removeFriend.fulfilled, (state, action) => {
//       const user = state.searchResults.find(
//         u => u._id === action.payload
//       );
//       if (user) {
//         user.relationshipStatus = "none";
//       }
//     })

//     /* ===== BLOCK ===== */
//     .addCase(blockUser.fulfilled, (state, action) => {
//       const user = state.searchResults.find(
//         u => u._id === action.payload
//       );
//       if (user) {
//         user.relationshipStatus = "blocked_by_me";
//       }
//     })

//     /* ===== PENDING LIST ===== */
//     .addCase(getPendingRequests.fulfilled, (state, action) => {
//       state.pendingRequests = action.payload;
//     });

// }


// });

// export const {
//     updateRelationshipStatus,
//     updateOnlineStatus
// } = friendSlice.actions;

// export default friendSlice.reducer;

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
  relationshipStatus: FriendshipStatus;
}

interface FriendState {
  searchResults: UserItem[];
  pendingRequests: UserItem[];
  loading: boolean;
  error?: string;
}

const initialState: FriendState = {
  searchResults: [],
  pendingRequests: [],
  loading: false,
  error: undefined
};

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const searchUsers = createAsyncThunk<
  UserItem[],
  string,
  { rejectValue: string }
>("friends/search", async (query, thunkAPI) => {
  try {
    const res = await api.get(`/users/search?q=${query}`);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Search failed"
    );
  }
});

export const sendFriendRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/send", async (userId, thunkAPI) => {
  try {
    await api.post(`/friends/${userId}/send`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Send failed"
    );
  }
});

export const cancelFriendRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/cancel", async (userId, thunkAPI) => {
  try {
    await api.post(`/friends/${userId}/cancel`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Cancel failed"
    );
  }
});

export const acceptFriendRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/accept", async (userId, thunkAPI) => {
  try {
    await api.post(`/friends/${userId}/accept`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Accept failed"
    );
  }
});

export const rejectFriendRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/reject", async (userId, thunkAPI) => {
  try {
    await api.post(`/friends/${userId}/reject`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Reject failed"
    );
  }
});

export const removeFriend = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/remove", async (userId, thunkAPI) => {
  try {
    await api.delete(`/friends/${userId}/remove`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Remove failed"
    );
  }
});

export const blockUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("friends/block", async (userId, thunkAPI) => {
  try {
    await api.post(`/friends/${userId}/block`);
    return userId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Block failed"
    );
  }
});

export const getPendingRequests = createAsyncThunk<
  UserItem[],
  void,
  { rejectValue: string }
>("friends/pending", async (_, thunkAPI) => {
  try {
    const res = await api.get(`/friends/pending`);
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Pending failed"
    );
  }
});

/* =====================================================
   SLICE
===================================================== */

const friendSlice = createSlice({
  name: "friends",
  initialState,

  reducers: {

    /* ========= UPDATE RELATION FROM SOCKET ========= */

    updateRelationshipStatus: (
      state,
      action: PayloadAction<{ userId: string; status: FriendshipStatus }>
    ) => {
      const updateUser = (list: UserItem[]) => {
        const user = list.find(u => u._id === action.payload.userId);
        if (user) user.relationshipStatus = action.payload.status;
      };

      updateUser(state.searchResults);
      updateUser(state.pendingRequests);
    },

    /* ========= ONLINE STATUS ========= */

    updateOnlineStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        status: "online" | "offline";
        lastSeen?: string;
      }>
    ) => {

      const updateUser = (list: UserItem[]) => {
        const user = list.find(u => u._id === action.payload.userId);
        if (!user) return;

        if (action.payload.status === "online") {
          user.isOnline = true;
          user.lastSeen = undefined;
        } else {
          user.isOnline = false;
          user.lastSeen = action.payload.lastSeen;
        }
      };

      updateUser(state.searchResults);
      updateUser(state.pendingRequests);
    },

    clearFriendError: (state) => {
      state.error = undefined;
    }

  },

  extraReducers: builder => {

    builder

      /* ===== SEARCH ===== */
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== SEND ===== */
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const user = state.searchResults.find(
          u => u._id === action.payload
        );
        if (user) user.relationshipStatus = "pending_sent";
      })
/* ===== REJECT ===== */
.addCase(rejectFriendRequest.fulfilled, (state, action) => {
  const user = state.searchResults.find(
    u => u._id === action.payload
  );

  if (user) {
    user.relationshipStatus = "none";
  }

  state.pendingRequests = state.pendingRequests.filter(
    u => u._id !== action.payload
  );
})

      /* ===== CANCEL ===== */
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        const user = state.searchResults.find(
          u => u._id === action.payload
        );
        if (user) user.relationshipStatus = "none";
      })

      /* ===== ACCEPT ===== */
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const user = state.searchResults.find(
          u => u._id === action.payload
        );
        if (user) user.relationshipStatus = "accepted";

        state.pendingRequests = state.pendingRequests.filter(
          u => u._id !== action.payload
        );
      })

      /* ===== REMOVE ===== */
      .addCase(removeFriend.fulfilled, (state, action) => {
        const user = state.searchResults.find(
          u => u._id === action.payload
        );
        if (user) user.relationshipStatus = "none";
      })

      /* ===== BLOCK ===== */
      .addCase(blockUser.fulfilled, (state, action) => {
        const user = state.searchResults.find(
          u => u._id === action.payload
        );
        if (user) user.relationshipStatus = "blocked_by_me";

        state.pendingRequests = state.pendingRequests.filter(
          u => u._id !== action.payload
        );
      })

      /* ===== PENDING ===== */
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      });

  }

});

export const {
  updateRelationshipStatus,
  updateOnlineStatus,
  clearFriendError
} = friendSlice.actions;

export default friendSlice.reducer;
