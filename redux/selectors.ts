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
    return auth.user;
  }
);

/* =====================================================
   SORTED CHATS (مع طباعات)
===================================================== */

export const selectSortedChats = createSelector(
  [selectChats],
  (chats) => {



    chats.forEach(c => {
   
    });

    const sorted = [...chats].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );




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

 

    if (!currentUserId) {
      return [];
    }

    const normalizedSearch = search.toLowerCase();

    const result = chats.filter(chat => {

      const other = chat.participants?.find(
        (p: any) => p._id !== currentUserId
      );

     

      if (!other?.username) return false;

      const match = other.username
        .toLowerCase()
        .includes(normalizedSearch);


      return match;
    });


    result.forEach(c => {
    
    });


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

      const chat = chats.find(c => c._id === chatId) || null;

      if (chat) {

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


      const chat = chats.find(c => c._id === chatId);
      if (!chat) {
        return null;
      }

      const other = chat.participants.find(
        (p: any) => p._id !== currentUserId
      ) || null;


      return other;
    }
  );