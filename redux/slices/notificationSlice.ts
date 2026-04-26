// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import api from "../../services/api";

// /* =====================================================
//    TYPES
// ===================================================== */

// export type NotificationType =
//   | "message"
//   | "friend_request"
//   | "friend_accepted"
//   | "tweet_like"
//   | "tweet_reply"
//   | "tweet_retweet"
//   | "room_invite"
//   | "badge_awarded"
//   | "system";

// export interface SenderInfo {
//   _id: string;
//   username: string;
//   avatar?: string;
//   isVerified?: boolean;
// }

// export interface NotificationItem {
//   _id: string;
//   recipient: string;
//   sender?: SenderInfo;   // ✅ لم يعد string
//   type: NotificationType;
//   body: string;
//   isRead: boolean;
//   createdAt: string;
// }

// interface NotificationState {
//   notifications: NotificationItem[];
//   unreadCount: number;
//   loading: boolean;
//   error?: string;
// }

// const initialState: NotificationState = {
//   notifications: [],
//   unreadCount: 0,
//   loading: false,
//   error: undefined
// };

// /* =====================================================
//    ASYNC THUNKS
// ===================================================== */

// export const fetchNotifications = createAsyncThunk<
//   NotificationItem[],
//   void,
//   { rejectValue: string }
// >("notifications/fetch", async (_, thunkAPI) => {
//   try {
//     const res = await api.get("/notifications");


//     return res.data;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Failed to fetch notifications"
//     );
//   }
// });

// export const fetchUnreadCount = createAsyncThunk<
//   number,
//   void,
//   { rejectValue: string }
// >("notifications/unreadCount", async (_, thunkAPI) => {
//   try {
//     const res = await api.get("/notifications/unread-count");


//     return res.data.unreadCount;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Failed to fetch unread count"
//     );
//   }
// });

// export const markNotificationAsRead = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("notifications/readOne", async (notificationId, thunkAPI) => {
//   try {

//     await api.patch(`/notifications/${notificationId}/read`);
//     return notificationId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Failed to mark as read"
//     );
//   }
// });

// export const deleteNotification = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >("notifications/delete", async (notificationId, thunkAPI) => {
//   try {

//     await api.delete(`/notifications/${notificationId}`);
//     return notificationId;
//   } catch (err: any) {
//     return thunkAPI.rejectWithValue(
//       err.response?.data?.message || "Failed to delete notification"
//     );
//   }
// });

// /* =====================================================
//    SLICE
// ===================================================== */

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {

//     /* ========= SOCKET: NEW ========= */

//     addNotificationFromSocket: (
//       state,
//       action: PayloadAction<NotificationItem>
//     ) => {


//       state.notifications.unshift(action.payload);
//       state.unreadCount += 1;
//     },

//     /* ========= SOCKET: SYNC ========= */

//     syncNotificationsFromSocket: (
//       state,
//       action: PayloadAction<{
//         notifications: NotificationItem[];
//         unreadCount: number;
//       }>
//     ) => {


//       state.notifications = action.payload.notifications;
//       state.unreadCount = action.payload.unreadCount;
//     },

//     setUnreadCount: (state, action: PayloadAction<number>) => {
//       state.unreadCount = action.payload;
//     },

//     clearNotificationError: (state) => {
//       state.error = undefined;
//     }

//   },

//   extraReducers: (builder) => {

//     builder

//       /* ===== FETCH ===== */
//       .addCase(fetchNotifications.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(fetchNotifications.fulfilled, (
//         state,
//         action: PayloadAction<NotificationItem[]>
//       ) => {


//         state.loading = false;
//         state.notifications = action.payload;
//       })

//       .addCase(fetchNotifications.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       /* ===== UNREAD COUNT ===== */
//       .addCase(fetchUnreadCount.fulfilled, (
//         state,
//         action: PayloadAction<number>
//       ) => {
//         state.unreadCount = action.payload;
//       })

//       /* ===== READ ONE ===== */
//       .addCase(markNotificationAsRead.fulfilled, (
//         state,
//         action: PayloadAction<string>
//       ) => {

//         const notification = state.notifications.find(
//           (n: NotificationItem) => n._id === action.payload
//         );

//         if (notification && !notification.isRead) {
//           notification.isRead = true;
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }

//       })

//       /* ===== DELETE ===== */
//       .addCase(deleteNotification.fulfilled, (
//         state,
//         action: PayloadAction<string>
//       ) => {

//         const deleted = state.notifications.find(
//           (n: NotificationItem) => n._id === action.payload
//         );

//         if (deleted && !deleted.isRead) {
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }

//         state.notifications = state.notifications.filter(
//           (n: NotificationItem) => n._id !== action.payload
//         );

//       });

//   }

// });

// export const {
//   addNotificationFromSocket,
//   syncNotificationsFromSocket,
//   setUnreadCount,
//   clearNotificationError
// } = notificationSlice.actions;

// export default notificationSlice.reducer;


import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

export type NotificationType =
  | "message"
  | "friend_request"
  | "friend_accepted"
  | "tweet_like"
  | "tweet_reply"
  | "tweet_retweet"
  | "room_invite"
  | "badge_awarded"
  | "follow"
  | "reaction"
  | "comment_like"
  | "comment_reply"
  | "mention"
  | "song_love"
  | "system";

export interface SenderInfo {
  _id: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: SenderInfo;   // ✅ لم يعد string
  type: NotificationType;
  title?: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error?: string;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: undefined
};

/* =====================================================
   ASYNC THUNKS
===================================================== */

export const fetchNotifications = createAsyncThunk<
  NotificationItem[],
  void,
  { rejectValue: string }
>("notifications/fetch", async (_, thunkAPI) => {
  try {
    const res = await api.get("/notifications");

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch notifications"
    );
  }
});

export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/unreadCount", async (_, thunkAPI) => {
  try {
    const res = await api.get("/notifications/unread-count");

    return res.data.unreadCount;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch unread count"
    );
  }
});

export const markNotificationAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/readOne", async (notificationId, thunkAPI) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
    return notificationId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to mark as read"
    );
  }
});

export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/delete", async (notificationId, thunkAPI) => {
  try {
    await api.delete(`/notifications/${notificationId}`);
    return notificationId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to delete notification"
    );
  }
});

/* =====================================================
   SLICE
===================================================== */

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {

    /* ========= SOCKET: NEW ========= */

    addNotificationFromSocket: (
      state,
      action: PayloadAction<NotificationItem>
    ) => {
      const incoming = action.payload;

      const exists = state.notifications.some(
        (n) => String(n._id) === String(incoming._id)
      );

      if (!exists) {
        state.notifications.unshift(incoming);

        if (!incoming.isRead) {
          state.unreadCount += 1;
        }
      }
    },

    /* ========= SOCKET: SYNC ========= */

    syncNotificationsFromSocket: (
      state,
      action: PayloadAction<{
        notifications: NotificationItem[];
        unreadCount: number;
      }>
    ) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    clearNotificationError: (state) => {
      state.error = undefined;
    }

  },

  extraReducers: (builder) => {

    builder

      /* ===== FETCH ===== */
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchNotifications.fulfilled, (
        state,
        action: PayloadAction<NotificationItem[]>
      ) => {
        state.loading = false;
        state.notifications = action.payload;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== UNREAD COUNT ===== */
      .addCase(fetchUnreadCount.fulfilled, (
        state,
        action: PayloadAction<number>
      ) => {
        state.unreadCount = action.payload;
      })

      /* ===== READ ONE ===== */
      .addCase(markNotificationAsRead.fulfilled, (
        state,
        action: PayloadAction<string>
      ) => {
        const notification = state.notifications.find(
          (n: NotificationItem) => n._id === action.payload
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      /* ===== DELETE ===== */
      .addCase(deleteNotification.fulfilled, (
        state,
        action: PayloadAction<string>
      ) => {
        const deleted = state.notifications.find(
          (n: NotificationItem) => n._id === action.payload
        );

        if (deleted && !deleted.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.notifications = state.notifications.filter(
          (n: NotificationItem) => n._id !== action.payload
        );
      });

  }

});

export const {
  addNotificationFromSocket,
  syncNotificationsFromSocket,
  setUnreadCount,
  clearNotificationError
} = notificationSlice.actions;

export default notificationSlice.reducer;