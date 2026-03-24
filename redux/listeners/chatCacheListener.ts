import { saveChatsToCache } from "@/storage/chatCache";
import { createListenerMiddleware } from "@reduxjs/toolkit";

export const chatCacheListener = createListenerMiddleware();

chatCacheListener.startListening({
  predicate: (action) =>
    action.type.startsWith("chat/"),

  effect: async (_, api) => {
    const state: any = api.getState();

    const userId = state.auth.user?._id;
    if (!userId) return;

    const chats = state.chat.chats;

    saveChatsToCache(userId, chats);
  },
});