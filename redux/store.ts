import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import followReducer from "./slices/followSlice";
import friendReducer from "./slices/friendSlice";
import messageReducer from "./slices/messageSlice";
import notificationReducer from "./slices/notificationSlice";
import profileReducer from "./slices/profileSlice";
import tweetReducer from "./slices/tweetSlice";

import chatReducer from "./slices/chatSlice";



export const store = configureStore({

  reducer: {
    auth: authReducer,
    friends: friendReducer,
    notification:notificationReducer,
    profile:profileReducer,
    tweets: tweetReducer,
    follow: followReducer,
        chat: chatReducer,
    message: messageReducer,


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
