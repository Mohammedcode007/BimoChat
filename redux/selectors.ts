import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";

/* =====================================================
   BASE SELECTORS
===================================================== */

const selectChats = (state: RootState) => state.chat.chats;
const selectTyping = (state: RootState) => state.chat.typingUsers;
const selectMessageState = (state: RootState) => state.message;
const selectAuthState = (state: RootState) => state.auth;

/* =====================================================
   CURRENT USER
===================================================== */

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => {
    console.log("🧠 selectCurrentUser RUN");
    return auth.user;
  }
);

/* =====================================================
   SORTED CHATS (مع طباعات)
===================================================== */

export const selectSortedChats = createSelector(
  [selectChats],
  (chats) => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🧠 selectSortedChats RUN");
    console.log("Chats length:", chats.length);

    chats.forEach(c => {
      console.log(
        "Chat:",
        c._id,
        "| updatedAt:",
        c.updatedAt,
        "| lastMessageId:",
        c.lastMessage?._id
      );
    });

    const sorted = [...chats].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

    console.log(
      "🔝 First after sort:",
      sorted[0]?._id,
      sorted[0]?.updatedAt
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return sorted;
  }
);

/* =====================================================
   FILTERED CHATS (مع طباعات)
===================================================== */

export const selectFilteredChats = createSelector(
  [
    selectSortedChats,
    (_: RootState, search: string) => search,
    (_: RootState, __: string, currentUserId?: string) => currentUserId
  ],
  (chats, search, currentUserId) => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔎 selectFilteredChats RUN");
    console.log("Search:", search);
    console.log("CurrentUser:", currentUserId);
    console.log("Incoming chats length:", chats.length);

    if (!currentUserId) {
      console.log("⛔ No current user");
      return [];
    }

    const normalizedSearch = search.toLowerCase();

    const result = chats.filter(chat => {

      const other = chat.participants?.find(
        (p: any) => p._id !== currentUserId
      );

      console.log(
        "Checking chat:",
        chat._id,
        "| updatedAt:",
        chat.updatedAt,
        "| lastMessageId:",
        chat.lastMessage?._id
      );

      if (!other?.username) return false;

      const match = other.username
        .toLowerCase()
        .includes(normalizedSearch);

      console.log("Match:", match);

      return match;
    });

    console.log("✅ Filtered result length:", result.length);

    result.forEach(c => {
      console.log(
        "Result chat:",
        c._id,
        "| updatedAt:",
        c.updatedAt,
        "| lastMessageId:",
        c.lastMessage?._id
      );
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return result;
  }
);

/* =====================================================
   CHAT BY ID
===================================================== */

export const selectChatById = (chatId: string) =>
  createSelector(
    [selectChats],
    (chats) => {
      console.log("🔍 selectChatById RUN:", chatId);

      const chat = chats.find(c => c._id === chatId) || null;

      if (chat) {
        console.log(
          "Found chat:",
          chat._id,
          "| updatedAt:",
          chat.updatedAt,
          "| lastMessageId:",
          chat.lastMessage?._id
        );
      }

      return chat;
    }
  );

/* =====================================================
   MESSAGES BY CHAT ID
===================================================== */

export const selectMessagesByChatId = (chatId: string) =>
  createSelector(
    [selectMessageState],
    (messageState) => {

      const messages = messageState.messages[chatId] ?? [];

      console.log(
        "💬 selectMessagesByChatId RUN:",
        chatId,
        "| count:",
        messages.length
      );

      return messages;
    }
  );

/* =====================================================
   TYPING USERS BY CHAT
===================================================== */

export const selectTypingUsersByChatId = (
  chatId: string,
  currentUserId?: string
) =>
  createSelector(
    [selectTyping],
    (typingUsers) => {

      const filtered =
        (typingUsers[chatId] || [])
          .filter(id => id !== currentUserId);

      console.log(
        "⌨️ selectTypingUsersByChatId RUN:",
        chatId,
        "| typing:",
        filtered
      );

      return filtered;
    }
  );

/* =====================================================
   OTHER USER
===================================================== */

export const selectOtherUser = (
  chatId: string,
  currentUserId?: string
) =>
  createSelector(
    [selectChats],
    (chats) => {

      console.log("👤 selectOtherUser RUN:", chatId);

      const chat = chats.find(c => c._id === chatId);
      if (!chat) {
        console.log("❌ Chat not found");
        return null;
      }

      const other = chat.participants.find(
        (p: any) => p._id !== currentUserId
      ) || null;

      console.log("Other user:", other?._id);

      return other;
    }
  );