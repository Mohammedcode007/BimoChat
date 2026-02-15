import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import followReducer from "./slices/followSlice";
import friendReducer from "./slices/friendSlice";
import notificationReducer from "./slices/notificationSlice";
import profileReducer from "./slices/profileSlice";
import tweetReducer from "./slices/tweetSlice";




export const store = configureStore({

  reducer: {
    auth: authReducer,
    friends: friendReducer,
    notification:notificationReducer,
    profile:profileReducer,
    tweets: tweetReducer,
    follow: followReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
