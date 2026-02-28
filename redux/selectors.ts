// selectors.ts (FULL) ✅ بعد التعديل لمعالجة participants (Objects أو IDs)
// - يمنع رجوع null بسبب أن participants أحياناً تكون string ids
// - يحافظ على نفس الـ API بتاع السيلكتورز

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
   HELPERS
===================================================== */

const isObj = (x: any) => x !== null && typeof x === "object";

/** يرجّع id للـ participant سواء كان object أو string */
const getPid = (p: any) => (isObj(p) ? String(p._id) : String(p));

/** يرجّع participant كـ object فقط (لو string يرجع null) */
const asUserObject = (p: any) => (isObj(p) ? p : null);

/* =====================================================
   CURRENT USER
===================================================== */

export const selectCurrentUser = createSelector([selectAuthState], (auth) => {
  return auth.user;
});

/* =====================================================
   SORTED CHATS
===================================================== */

export const selectSortedChats = createSelector([selectChats], (chats) => {
  const sorted = [...chats].sort(
    (a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return sorted;
});

/* =====================================================
   FILTERED CHATS
===================================================== */

export const selectFilteredChats = createSelector(
  [
    selectSortedChats,
    (_: RootState, search: string) => search,
    (_: RootState, __: string, currentUserId?: string) => currentUserId
  ],
  (chats: any[], search: string, currentUserId?: string) => {
    if (!currentUserId) return [];

    const normalizedSearch = String(search || "").toLowerCase().trim();

    // لو البحث فاضي رجّع الكل
    if (!normalizedSearch) return chats;

    const result = chats.filter((chat: any) => {
      // ✅ ابحث عن other فقط لو participants objects
      const otherObj =
        (chat.participants || [])
          .map(asUserObject)
          .filter(Boolean)
          .find((p: any) => String(p._id) !== String(currentUserId)) || null;

      // لو مفيش populate => ما نفلترش بالاسم (لأنه مش موجود)
      if (!otherObj?.username) return false;

      return String(otherObj.username)
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return result;
  }
);

/* =====================================================
   CHAT BY ID
===================================================== */

export const selectChatById = (chatId: string) =>
  createSelector([selectChats], (chats: any[]) => {
    const chat =
      chats.find((c: any) => String(c._id) === String(chatId)) || null;

    return chat;
  });

/* =====================================================
   MESSAGES BY CHAT ID
===================================================== */

export const selectMessagesByChatId = (chatId: string) =>
  createSelector([selectMessageState], (messageState: any) => {
    const messages = messageState.messages?.[chatId] ?? [];
    return messages;
  });

/* =====================================================
   TYPING USERS BY CHAT
===================================================== */

export const selectTypingUsersByChatId = (
  chatId: string,
  currentUserId?: string
) =>
  createSelector([selectTyping], (typingUsers: Record<string, string[]>) => {
    const filtered = (typingUsers?.[chatId] || []).filter(
      (id) => String(id) !== String(currentUserId)
    );

    return filtered;
  });

/* =====================================================
   OTHER USER
===================================================== */

export const selectOtherUser = (chatId: string, currentUserId?: string) =>
  createSelector([selectChats], (chats: any[]) => {
    const chat = chats.find((c: any) => String(c._id) === String(chatId));
    if (!chat) return null;

    // 1) ✅ لو participants objects (populate)
    const otherObj =
      (chat.participants || [])
        .map(asUserObject)
        .filter(Boolean)
        .find((p: any) => String(p._id) !== String(currentUserId)) || null;

    if (otherObj) return otherObj;

    // 2) ✅ لو participants IDs فقط: رجّع object بسيط (id فقط)
    const otherId =
      (chat.participants || [])
        .map(getPid)
        .find((pid: string) => pid !== String(currentUserId)) || null;

    if (!otherId) return null;

    return {
      _id: otherId,
      username: "", // هيظل فاضي لو لم يتم populate
      avatar: "",
      isOnline: false,
      lastSeen: undefined
    };
  });