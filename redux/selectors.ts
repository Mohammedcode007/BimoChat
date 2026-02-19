import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

/* =====================================================
   BASE SELECTORS
===================================================== */

const selectChatState = (state: RootState) => state.chat;
const selectMessageState = (state: RootState) => state.message;
const selectAuthState = (state: RootState) => state.auth;

/* =====================================================
   CURRENT USER
===================================================== */

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

/* =====================================================
   CHAT BY ID
===================================================== */

export const selectChatById = (chatId: string) =>
  createSelector(
    [selectChatState],
    (chat) =>
      chat.chats.find(c => c._id === chatId) || null
  );

/* =====================================================
   MESSAGES BY CHAT ID
===================================================== */

export const selectMessagesByChatId = (chatId: string) =>
  createSelector(
    [selectMessageState],
    (message) =>
      message.messages[chatId] ?? []
  );

/* =====================================================
   TYPING USERS (EXCLUDING CURRENT USER)
===================================================== */

export const selectTypingUsersByChatId = (
  chatId: string,
  currentUserId?: string
) =>
  createSelector(
    [selectChatState],
    (chat) =>
      (chat.typingUsers[chatId] || [])
        .filter(id => id !== currentUserId)
  );

/* =====================================================
   OTHER USER (PRIVATE CHAT)
===================================================== */

export const selectOtherUser = (
  chatId: string,
  currentUserId?: string
) =>
  createSelector(
    [selectChatState],
    (chatState) => {
      const chat = chatState.chats.find(c => c._id === chatId);
      if (!chat) return null;

      return chat.participants.find(
        (p: any) => p._id !== currentUserId
      ) || null;
    }
  );
