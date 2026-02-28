import changePasswordReducer from "@/redux/slices/changePasswordSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import followReducer from "./slices/followSlice";
import friendReducer from "./slices/friendSlice";
import messageReducer from "./slices/messageSlice";
import notificationReducer from "./slices/notificationSlice";
import profileReducer from "./slices/profileSlice";
import storeControlReducer from "./slices/storeControl.slice";
import tweetReducer from "./slices/tweetSlice";

import appReducer from "@/redux/slices/appSlice";
import storiesReducer from "@/redux/slices/storySlice";
import chatReducer from "./slices/chatSlice";
import contactUsReducer from "./slices/contactUsSlice";
import roomReducer from "./slices/room.slice";
import roomControlReducer from "./slices/roomControl.slice";
import uiReducer from "./slices/ui.slice";
import userReducer from "./slices/userSlice";


export const store = configureStore({

  reducer: {
    auth: authReducer,
    friends: friendReducer,
    notification: notificationReducer,
    profile: profileReducer,
    tweets: tweetReducer,
    follow: followReducer,
    chat: chatReducer,
    message: messageReducer,
    room: roomReducer,
    roomControl: roomControlReducer,
    storeControl: storeControlReducer,
    ui: uiReducer,
    user: userReducer,
    stories: storiesReducer,
      app: appReducer, // ✅ جديد
          contactUs: contactUsReducer,
            changePassword: changePasswordReducer,










  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
