
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
//   _id: string;
//   username: string;
//   atUsername?: string;
//   avatar?: string;
//   isOnline: boolean;
//   lastSeen?: string;
//   relationshipStatus: FriendshipStatus;
// }

// interface FriendState {
//   searchResults: UserItem[];
//   pendingRequests: UserItem[];
//     blockedUsers: UserItem[];   // ✅ جديد

//   friends: UserItem[];          // 🔥 قائمة الأصدقاء
//   loading: boolean;
//   error?: string;
// }

// const initialState: FriendState = {
//   searchResults: [],
//   pendingRequests: [],
//   friends: [],       
//   blockedUsers: [],
//   loading: false,
//   error: undefined
// };

// /* =====================================================
//    ASYNC THUNKS
// ===================================================== */
// export const getBlockedUsers = createAsyncThunk<
//   UserItem[],
//   void,
//   { rejectValue: string }
// >("friends/getBlocked", async (_, thunkAPI) => {
//   try {
//     const res = await api.get("/users/blocked");
//     return res.data;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Fetch blocked failed"
//     );
//   }
// });

// export const unblockUser = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/unblock", async (userId, thunkAPI) => {
//   try {
//     await api.post("/users/unblock", {
//       targetUserId: userId
//     });
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Unblock failed"
//     );
//   }
// });

// export const searchUsers = createAsyncThunk<
//   UserItem[],
//   string,
//   { rejectValue: string }
// >("friends/search", async (query, thunkAPI) => {
//   try {
//     const res = await api.get(`/users/search?q=${query}`);
//     return res.data;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Search failed"
//     );
//   }
// });

// export const getFriends = createAsyncThunk<
//   UserItem[],
//   void,
//   { rejectValue: string }
// >("friends/getFriends", async (_, thunkAPI) => {
//   try {
//     const res = await api.get(`/friends`);
//     return res.data;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Fetch friends failed"
//     );
//   }
// });

// export const sendFriendRequest = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/send", async (userId, thunkAPI) => {
//   try {
//     await api.post(`/friends/${userId}/send`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Send failed"
//     );
//   }
// });

// export const cancelFriendRequest = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/cancel", async (userId, thunkAPI) => {
//   try {
//     await api.post(`/friends/${userId}/cancel`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Cancel failed"
//     );
//   }
// });

// export const acceptFriendRequest = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/accept", async (userId, thunkAPI) => {
//   try {
//     await api.post(`/friends/${userId}/accept`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Accept failed"
//     );
//   }
// });

// export const rejectFriendRequest = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/reject", async (userId, thunkAPI) => {
//   try {
//     await api.post(`/friends/${userId}/reject`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Reject failed"
//     );
//   }
// });

// export const removeFriend = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/remove", async (userId, thunkAPI) => {
//   try {
//     await api.delete(`/friends/${userId}/remove`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Remove failed"
//     );
//   }
// });

// export const blockUser = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("friends/block", async (userId, thunkAPI) => {
//   try {
//     await api.post(`/friends/${userId}/block`);
//     return userId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Block failed"
//     );
//   }
// });

// export const getPendingRequests = createAsyncThunk<
//   UserItem[],
//   void,
//   { rejectValue: string }
// >("friends/pending", async (_, thunkAPI) => {
//   try {
//     const res = await api.get(`/friends/pending`);
//     return res.data;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Pending failed"
//     );
//   }
// });

// /* =====================================================
//    SLICE
// ===================================================== */

// const friendSlice = createSlice({
//   name: "friends",
//   initialState,

//   reducers: {

//     updateRelationshipStatus: (
//       state,
//       action: PayloadAction<{ userId: string; status: FriendshipStatus }>
//     ) => {

//       const updateUser = (list: UserItem[]) => {
//         const user = list.find(u => u._id === action.payload.userId);
//         if (user) user.relationshipStatus = action.payload.status;
//       };

//       updateUser(state.searchResults);
//       updateUser(state.pendingRequests);
//       updateUser(state.friends);     // 🔥 مهم
//     },

//     updateOnlineStatus: (
//       state,
//       action: PayloadAction<{
//         userId: string;
//         status: "online" | "offline";
//         lastSeen?: string;
//       }>
//     ) => {

//       const updateUser = (list: UserItem[]) => {
//         const user = list.find(u => u._id === action.payload.userId);
//         if (!user) return;

//         if (action.payload.status === "online") {
//           user.isOnline = true;
//           user.lastSeen = undefined;
//         } else {
//           user.isOnline = false;
//           user.lastSeen = action.payload.lastSeen;
//         }
//       };

//       updateUser(state.searchResults);
//       updateUser(state.pendingRequests);
//       updateUser(state.friends);   // 🔥 مهم
//     },

//     clearFriendError: (state) => {
//       state.error = undefined;
//     }

//   },

//   extraReducers: builder => {

//     builder

//       /* ===== SEARCH ===== */
//       .addCase(searchUsers.pending, (state) => {
//         state.loading = true;
//         state.error = undefined;
//       })
//       .addCase(searchUsers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.searchResults = action.payload;
//       })
//       .addCase(searchUsers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       /* ===== GET FRIENDS ===== */
//       .addCase(getFriends.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getFriends.fulfilled, (state, action) => {
//         state.loading = false;
//         state.friends = action.payload;
//       })
//       .addCase(getFriends.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       /* ===== SEND ===== */
//       .addCase(sendFriendRequest.fulfilled, (state, action) => {
//         const user = state.searchResults.find(
//           u => u._id === action.payload
//         );
//         if (user) user.relationshipStatus = "pending_sent";
//       })

//       /* ===== REJECT ===== */
//       .addCase(rejectFriendRequest.fulfilled, (state, action) => {

//         const user = state.searchResults.find(
//           u => u._id === action.payload
//         );
//         if (user) user.relationshipStatus = "none";

//         state.pendingRequests = state.pendingRequests.filter(
//           u => u._id !== action.payload
//         );
//       })

//       /* ===== CANCEL ===== */
//       .addCase(cancelFriendRequest.fulfilled, (state, action) => {
//         const user = state.searchResults.find(
//           u => u._id === action.payload
//         );
//         if (user) user.relationshipStatus = "none";
//       })

//       /* ===== ACCEPT ===== */
//       .addCase(acceptFriendRequest.fulfilled, (state, action) => {

//         const user = state.searchResults.find(
//           u => u._id === action.payload
//         );
//         if (user) user.relationshipStatus = "accepted";

//         state.pendingRequests = state.pendingRequests.filter(
//           u => u._id !== action.payload
//         );

//         // تحديث في قائمة الأصدقاء لو كان موجود في البحث
//         const acceptedUser = state.searchResults.find(
//           u => u._id === action.payload
//         );
//         if (acceptedUser && !state.friends.some(f => f._id === acceptedUser._id)) {
//           state.friends.push(acceptedUser);
//         }
//       })

//       /* ===== REMOVE ===== */
//       .addCase(removeFriend.fulfilled, (state, action) => {

//         const userId = action.payload;

//         const user = state.searchResults.find(
//           u => u._id === userId
//         );
//         if (user) user.relationshipStatus = "none";

//         state.friends = state.friends.filter(
//           u => u._id !== userId
//         );
//       })

//       /* ===== BLOCK ===== */
//       .addCase(blockUser.fulfilled, (state, action) => {

//         const userId = action.payload;

//         const user = state.searchResults.find(
//           u => u._id === userId
//         );
//         if (user) user.relationshipStatus = "blocked_by_me";

//         state.pendingRequests = state.pendingRequests.filter(
//           u => u._id !== userId
//         );

//         state.friends = state.friends.filter(
//           u => u._id !== userId
//         );
//       })

//       /* ===== PENDING ===== */
//       .addCase(getPendingRequests.fulfilled, (state, action) => {
//         state.pendingRequests = action.payload;
//       });

//   }

// });

// export const {
//   updateRelationshipStatus,
//   updateOnlineStatus,
//   clearFriendError
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
    bio?: string;

  relationshipStatus: FriendshipStatus;
}

interface FriendState {
  searchResults: UserItem[];
  pendingRequests: UserItem[];
  blockedUsers: UserItem[];
  friends: UserItem[];
    bio?: string;

  loading: boolean;
  error?: string;
}

const initialState: FriendState = {
  searchResults: [],
  pendingRequests: [],
  blockedUsers: [],
  friends: [],
  loading: false,
  error: undefined
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
    }

  },

  extraReducers: builder => {

    builder

      /* SEARCH */
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.loading = false;
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
        state.blockedUsers = action.payload.map(user => ({
          ...user,
          relationshipStatus: "blocked_by_me"
        }));
      })

      /* SEND */
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const user = state.searchResults.find(u => u._id === action.payload);
        if (user) user.relationshipStatus = "pending_sent";
      })

      /* ACCEPT */
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const userId = action.payload;

        state.pendingRequests = state.pendingRequests.filter(
          u => u._id !== userId
        );

        const user = state.searchResults.find(u => u._id === userId);
        if (user) {
          user.relationshipStatus = "accepted";
          if (!state.friends.some(f => f._id === userId)) {
            state.friends.push(user);
          }
        }
      })

      /* REJECT */
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const userId = action.payload;

        state.pendingRequests = state.pendingRequests.filter(
          u => u._id !== userId
        );

        const user = state.searchResults.find(u => u._id === userId);
        if (user) user.relationshipStatus = "none";
      })

      /* REMOVE */
      .addCase(removeFriend.fulfilled, (state, action) => {
        const userId = action.payload;
        state.friends = state.friends.filter(u => u._id !== userId);
      })

      /* BLOCK */
      .addCase(blockUser.fulfilled, (state, action) => {
        const userId = action.payload;

        state.friends = state.friends.filter(u => u._id !== userId);
        state.pendingRequests = state.pendingRequests.filter(u => u._id !== userId);

        const user = state.searchResults.find(u => u._id === userId);
        if (user) {
          user.relationshipStatus = "blocked_by_me";
          if (!state.blockedUsers.some(u => u._id === userId)) {
            state.blockedUsers.push(user);
          }
        }
      })

      /* UNBLOCK */
      .addCase(unblockUser.fulfilled, (state, action) => {
        const userId = action.payload;

        state.blockedUsers = state.blockedUsers.filter(
          u => u._id !== userId
        );

        const user = state.searchResults.find(
          u => u._id === userId
        );

        if (user) user.relationshipStatus = "none";
      });

  }

});

export const {
  updateOnlineStatus,
  clearFriendError
} = friendSlice.actions;

export default friendSlice.reducer;
