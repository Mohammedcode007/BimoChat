import { addMessage, setMessages } from "@/redux/slices/messageSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { saveMessagesToCache } from "@/storage/chatCache";
import {
    createListenerMiddleware,
    TypedStartListening,
} from "@reduxjs/toolkit";

export const messageCacheListener = createListenerMiddleware();

type AppStartListening = TypedStartListening<RootState, AppDispatch>;
const startAppListening =
  messageCacheListener.startListening as AppStartListening;

function persistChatMessages(chatId: string, api: { getState: () => RootState }) {
  const state = api.getState();
  const userId = state.auth.user?._id;
  if (!userId) return;

  const messages = state.message.messages[chatId] || [];
  saveMessagesToCache(userId, chatId, messages);
}

startAppListening({
  actionCreator: setMessages,
  effect: async (action, api) => {
    const chatId = action.payload.chatId;
    if (!chatId) return;

    persistChatMessages(chatId, api);
  },
});

startAppListening({
  actionCreator: addMessage,
  effect: async (action, api) => {
    const chatId = String(action.payload.chat);
    if (!chatId) return;

    persistChatMessages(chatId, api);
  },
});