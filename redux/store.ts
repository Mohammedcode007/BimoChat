import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import friendReducer from "./slices/friendSlice";
import notificationReducer from "./slices/notificationSlice";


export const store = configureStore({

  reducer: {
    auth: authReducer,
    friends: friendReducer,
    notification:notificationReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
