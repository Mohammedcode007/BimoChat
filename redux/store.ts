import appReducer from "@/redux/slices/appSlice";
import blockControlReducer from "@/redux/slices/blockControl.slice";
import changePasswordReducer from "@/redux/slices/changePasswordSlice";
import storiesReducer from "@/redux/slices/storySlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import contactUsReducer from "./slices/contactUsSlice";
import followReducer from "./slices/followSlice";
import friendReducer from "./slices/friendSlice";
import messageReducer from "./slices/messageSlice";
import notificationReducer from "./slices/notificationSlice";
import profileReducer from "./slices/profileSlice";
import reportReducer from "./slices/reportSlice";
import roomReducer from "./slices/room.slice";
import roomControlReducer from "./slices/roomControl.slice";
import storeControlReducer from "./slices/storeControl.slice";
import tweetReducer from "./slices/tweetSlice";
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
    report: reportReducer,
    blockControl: blockControlReducer,









  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
