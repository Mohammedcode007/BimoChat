
// import { io, Socket } from "socket.io-client";

// import {
//   setTyping,
//   setUnreadFromServer,
//   socketNewMessage,
//   updateChatPresence
// } from "@/redux/slices/chatSlice";

// import {
//   addMessage,
//   deleteMessageFromSocket,
//   markDeliveredFromSocket,
//   markSeenFromSocket,
//   updateReaction
// } from "@/redux/slices/messageSlice";

// import {
//   addNotificationFromSocket,
//   setUnreadCount,
//   syncNotificationsFromSocket
// } from "@/redux/slices/notificationSlice";

// import { updateOnlineStatus } from "@/redux/slices/friendSlice";

// /* =====================================================
//    SOCKET INSTANCE
// ===================================================== */

// let socket: Socket | null = null;
// let isListenersAttached = false;

// /* =====================================================
//    CONNECT
// ===================================================== */

// export const connectSocket = (token: string): Socket => {

//   if (socket) {
//     console.log("⚠️ Socket already exists");
//     return socket;
//   }

//   console.log("🔌 Creating new socket connection...");

//   socket = io("http://192.168.0.101:5000", {
//     auth: { token },
//     transports: ["websocket"],
//     reconnection: true,
//   });

//   socket.on("connect", () => {
//     console.log("🟢 Socket CONNECTED:", socket?.id);
//   });

//   socket.on("disconnect", (reason) => {
//     console.log("🔴 Socket DISCONNECTED:", reason);
//   });

//   socket.on("connect_error", (err) => {
//     console.log("⚠️ Socket ERROR:", err.message);
//   });

//   return socket;
// };

// /* =====================================================
//    ATTACH LISTENERS
// ===================================================== */

// export const attachSocketListeners = (
//   dispatch: any,
//   getState: any
// ) => {

//   if (!socket) {
//     console.log("❌ No socket instance");
//     return;
//   }

//   if (isListenersAttached) {
//     console.log("⚠️ Listeners already attached");
//     return;
//   }

//   console.log("📡 Attaching ALL socket listeners...");
//   isListenersAttached = true;

//   /* ================= CLEAN OLD LISTENERS ================= */

//   socket.removeAllListeners("chat:new");
//   socket.removeAllListeners("chat:delivery:update");
//   socket.removeAllListeners("chat:seen:update");
//   socket.removeAllListeners("chat:unread:update");
//   socket.removeAllListeners("chat:reaction:update");
//   socket.removeAllListeners("chat:message:deleted");
//   socket.removeAllListeners("chat:typing");
//   socket.removeAllListeners("notification:new");
//   socket.removeAllListeners("notification:sync");
//   socket.removeAllListeners("notification:unreadTotal");
//   socket.removeAllListeners("presence:update");

//   /* ================= NEW MESSAGE ================= */

//   socket.on("chat:new", (message) => {

//     console.log("📥 chat:new RECEIVED:", message._id);

//     dispatch(addMessage(message));

//     dispatch(socketNewMessage({
//       chatId: message.chat,
//       message,
//     }));
//   });

//   /* ================= DELIVERY ================= */

//   socket.on("chat:delivery:update", (data) => {
//     console.log("📬 DELIVERY UPDATE:", data);
//     dispatch(markDeliveredFromSocket(data));
//   });

//   /* ================= SEEN ================= */

//   socket.on("chat:seen:update", (data) => {

//     console.log("👁 SEEN UPDATE FULL:", JSON.stringify(data));

//     dispatch(markSeenFromSocket(data));

//     // dispatch(setUnreadFromServer({
//     //   chatId: data.chatId,
//     //   unreadCount: 0
//     // }));
//   });

//   /* ================= UNREAD ================= */

//   socket.on("chat:unread:update", (data) => {
//     console.log("🔢 UNREAD UPDATE:", data);
//     dispatch(setUnreadFromServer(data));
//   });

//   /* ================= REACTION ================= */

//   socket.on("chat:reaction:update", (data) => {
//     console.log("❤️ REACTION UPDATE:", data.messageId);
//     dispatch(updateReaction(data));
//   });

//   /* ================= DELETE ================= */

//   socket.on("chat:message:deleted", (data) => {
//     console.log("🗑 MESSAGE DELETED:", data.messageId);
//     dispatch(deleteMessageFromSocket(data));
//   });

//   /* ================= TYPING ================= */

//   socket.on("chat:typing", (data) => {

//     console.log("⌨️ TYPING RECEIVED:", data);

//     dispatch(setTyping({
//       chatId: data.chatId,
//       userId: data.userId,
//       typing: data.typing
//     }));
//   });

//   /* ================= NOTIFICATIONS ================= */

//   socket.on("notification:new", (notification) => {
//     console.log("🔔 NEW NOTIFICATION:", notification._id);
//     dispatch(addNotificationFromSocket(notification));
//   });

//   socket.on("notification:sync", (data) => {
//     console.log("🔄 NOTIFICATION SYNC");
//     dispatch(syncNotificationsFromSocket(data));
//   });

//   socket.on("notification:unreadTotal", (total) => {
//     console.log("🔢 TOTAL UNREAD:", total);
//     dispatch(setUnreadCount(total));
//   });

//   /* ================= PRESENCE ================= */

//  socket.on("presence:update", (data) => {

//   console.log("🟢 PRESENCE UPDATE:", data);

//   const currentUserId = getState().auth.user?._id;
//   if (data.userId === currentUserId) return;

//   dispatch(updateOnlineStatus({
//     userId: data.userId,
//     isOnline: data.isOnline,   // ✅ Boolean
//     lastSeen: data.lastSeen
//   }));

//   dispatch(updateChatPresence({
//     userId: data.userId,
//     isOnline: data.isOnline,   // ✅ Boolean
//     lastSeen: data.lastSeen
//   }));
// });


//   console.log("✅ All socket listeners attached successfully");
// };


// /* =====================================================
//    JOIN ROOM
// ===================================================== */

// export const joinChatRoom = (chatId: string) => {

//   if (!socket) {
//     console.log("❌ Cannot join — socket not ready");
//     return;
//   }

//   console.log("🏠 Joining room:", chatId);
//   socket.emit("chat:join", { chatId });
// };

// /* =====================================================
//    LEAVE ROOM
// ===================================================== */

// export const leaveChatRoom = (chatId: string) => {

//   if (!socket) return;

//   console.log("🚪 Leaving room:", chatId);
//   socket.emit("chat:leave", { chatId });
// };

// /* =====================================================
//    SEND MESSAGE
// ===================================================== */

// export const sendSocketMessage = (
//   chatId: string,
//   content: string,
//   type: string,
//   clientTempId: string,   // 🔥 مهم جدًا
//   media?: any,
//   replyTo?: any
// ) => {

//   if (!socket) {
//     console.log("❌ Cannot send — socket not connected");
//     return;
//   }

//   console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//   console.log("📤 EMIT chat:send");
//   console.log("Chat:", chatId);
//   console.log("Content:", content);
//   console.log("ClientTempId:", clientTempId);

//   socket.emit("chat:send", {
//     chatId,
//     content,
//     type,
//     media,
//     replyTo,
//     clientTempId   // 🔥 إرسال الـ tempId للسيرفر
//   });

//   console.log("✅ chat:send emitted");
//   console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
// };


// /* =====================================================
//    TYPING
// ===================================================== */

// const typingTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>();
// const typingStateMap = new Map<string, boolean>();

// export const emitTyping = (
//   chatId: string,
//   isTyping: boolean
// ) => {

//   if (!socket) return;

//   /* ================= START TYPING ================= */

//   if (isTyping) {

//     // لو كان بالفعل في حالة typing لا نعيد الإرسال
//     if (typingStateMap.get(chatId)) return;

//     typingStateMap.set(chatId, true);

//     socket.emit("chat:typing", {
//       chatId,
//       typing: true
//     });

//     // تنظيف أي timeout سابق
//     if (typingTimeoutMap.has(chatId)) {
//       clearTimeout(typingTimeoutMap.get(chatId)!);
//     }

//     const timeout = setTimeout(() => {

//       socket?.emit("chat:typing", {
//         chatId,
//         typing: false
//       });

//       typingStateMap.set(chatId, false);
//       typingTimeoutMap.delete(chatId);

//     }, 1500);

//     typingTimeoutMap.set(chatId, timeout);
//   }

//   /* ================= STOP TYPING ================= */

//   else {

//     if (!typingStateMap.get(chatId)) return;

//     socket.emit("chat:typing", {
//       chatId,
//       typing: false
//     });

//     typingStateMap.set(chatId, false);

//     if (typingTimeoutMap.has(chatId)) {
//       clearTimeout(typingTimeoutMap.get(chatId)!);
//       typingTimeoutMap.delete(chatId);
//     }
//   }
// };



// /* =====================================================
//    MARK AS SEEN
// ===================================================== */

// export const emitMarkAsSeen = (chatId: string) => {

//   if (!socket) return;

//   console.log("👁 EMIT chat:seen:", chatId);
//   socket.emit("chat:seen", { chatId });
// };

// /* =====================================================
//    DISCONNECT
// ===================================================== */

// export const disconnectSocket = () => {

//   if (!socket) return;

//   console.log("🔌 Disconnecting socket...");

//   socket.removeAllListeners();
//   socket.disconnect();

//   socket = null;
//   isListenersAttached = false;
// };
// src/services/socket.ts
import { io, Socket } from "socket.io-client";

import {
  setTyping,
  setUnreadFromServer,
  socketNewMessage,
  updateChatPresence
} from "@/redux/slices/chatSlice";

import {
  addMessage,
  deleteMessageFromSocket,
  markDeliveredFromSocket,
  markSeenFromSocket,
  updateReaction
} from "@/redux/slices/messageSlice";

import {
  addNotificationFromSocket,
  setUnreadCount,
  syncNotificationsFromSocket
} from "@/redux/slices/notificationSlice";

import { updateOnlineStatus } from "@/redux/slices/friendSlice";

// ✅ ROOMS SLICE
import {
  socketMessageDeleted,
  socketMessageHighlighted,
  socketMessagePinned,
  socketNewRoomMessage,
  socketReactionUpdate,
  socketUserJoined,
  socketUserLeft
} from "@/redux/slices/room.slice";

/* =====================================================
   SOCKET INSTANCE
===================================================== */

let socket: Socket | null = null;
let isListenersAttached = false;

/* =====================================================
   CONNECT
===================================================== */

export const connectSocket = (token: string): Socket => {
  if (socket) {
    console.log("⚠️ Socket already exists");
    return socket;
  }

  console.log("🔌 Creating new socket connection...");

  socket = io("http://192.168.0.101:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true
  });

  socket.on("connect", () => {
    console.log("🟢 Socket CONNECTED:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket DISCONNECTED:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Socket ERROR:", err.message);
  });

  return socket;
};

/* =====================================================
   ATTACH LISTENERS
===================================================== */

export const attachSocketListeners = (dispatch: any, getState: any) => {
  if (!socket) {
    console.log("❌ No socket instance");
    return;
  }

  if (isListenersAttached) {
    console.log("⚠️ Listeners already attached");
    return;
  }

  console.log("📡 Attaching ALL socket listeners...");
  isListenersAttached = true;

  /* ================= CLEAN OLD LISTENERS ================= */

  socket.removeAllListeners("chat:new");
  socket.removeAllListeners("chat:delivery:update");
  socket.removeAllListeners("chat:seen:update");
  socket.removeAllListeners("chat:unread:update");
  socket.removeAllListeners("chat:reaction:update");
  socket.removeAllListeners("chat:message:deleted");
  socket.removeAllListeners("chat:typing");

  socket.removeAllListeners("notification:new");
  socket.removeAllListeners("notification:sync");
  socket.removeAllListeners("notification:unreadTotal");

  socket.removeAllListeners("presence:update");

  // ✅ ROOMS CLEAN (الموجود عندك)
  socket.removeAllListeners("room:user:joined");
  socket.removeAllListeners("room:user:left");
  socket.removeAllListeners("room:message:new");
  socket.removeAllListeners("room:message:edited");
  socket.removeAllListeners("room:message:deleted");
  socket.removeAllListeners("room:message:pinned");
  socket.removeAllListeners("room:message:highlighted");
  socket.removeAllListeners("room:reaction:update");
  socket.removeAllListeners("room:users");
  socket.removeAllListeners("room:messages");
  socket.removeAllListeners("room:error");

  // ✅ NEW (إذا فعّلتها في الباك: update/type/premium/antispam/lock/slowmode/boost/roles/ban/mute/kick/vip/poll/voice)
  socket.removeAllListeners("room:update");
  socket.removeAllListeners("room:type:update");
  socket.removeAllListeners("room:premium:update");
  socket.removeAllListeners("room:antispam:update");
  socket.removeAllListeners("room:lock:update");
  socket.removeAllListeners("room:slowmode:update");
  socket.removeAllListeners("room:maxUsers:update");
  socket.removeAllListeners("room:boost:update");
  socket.removeAllListeners("room:roles:update");
  socket.removeAllListeners("room:user:removed");
  socket.removeAllListeners("room:user:banned");
  socket.removeAllListeners("room:user:unbanned");
  socket.removeAllListeners("room:user:muted");
  socket.removeAllListeners("room:user:unmuted");
  socket.removeAllListeners("room:user:kicked");
  socket.removeAllListeners("room:vip:update");
  socket.removeAllListeners("room:poll:start");
  socket.removeAllListeners("room:poll:update");
  socket.removeAllListeners("room:poll:end");
  socket.removeAllListeners("room:voice:seats");
  socket.removeAllListeners("room:hand:update");
  socket.removeAllListeners("room:deleted");

  /* ================= CHAT NEW MESSAGE ================= */

  socket.on("chat:new", (message) => {
    console.log("📥 chat:new RECEIVED:", message._id);

    dispatch(addMessage(message));

    dispatch(
      socketNewMessage({
        chatId: message.chat,
        message
      })
    );
  });

  /* ================= DELIVERY ================= */

  socket.on("chat:delivery:update", (data) => {
    console.log("📬 DELIVERY UPDATE:", data);
    dispatch(markDeliveredFromSocket(data));
  });

  /* ================= SEEN ================= */

  socket.on("chat:seen:update", (data) => {
    console.log("👁 SEEN UPDATE FULL:", JSON.stringify(data));
    dispatch(markSeenFromSocket(data));
  });

  /* ================= UNREAD ================= */

  socket.on("chat:unread:update", (data) => {
    console.log("🔢 UNREAD UPDATE:", data);
    dispatch(setUnreadFromServer(data));
  });

  /* ================= REACTION ================= */

  socket.on("chat:reaction:update", (data) => {
    console.log("❤️ REACTION UPDATE:", data.messageId);
    dispatch(updateReaction(data));
  });

  /* ================= DELETE ================= */

  socket.on("chat:message:deleted", (data) => {
    console.log("🗑 MESSAGE DELETED:", data.messageId);
    dispatch(deleteMessageFromSocket(data));
  });

  /* ================= TYPING ================= */

  socket.on("chat:typing", (data) => {
    console.log("⌨️ TYPING RECEIVED:", data);

    dispatch(
      setTyping({
        chatId: data.chatId,
        userId: data.userId,
        typing: data.typing
      })
    );
  });

  /* ================= NOTIFICATIONS ================= */

  socket.on("notification:new", (notification) => {
    console.log("🔔 NEW NOTIFICATION:", notification._id);
    dispatch(addNotificationFromSocket(notification));
  });

  socket.on("notification:sync", (data) => {
    console.log("🔄 NOTIFICATION SYNC");
    dispatch(syncNotificationsFromSocket(data));
  });

  socket.on("notification:unreadTotal", (total) => {
    console.log("🔢 TOTAL UNREAD:", total);
    dispatch(setUnreadCount(total));
  });

  /* ================= PRESENCE ================= */

  socket.on("presence:update", (data) => {
    console.log("🟢 PRESENCE UPDATE:", data);

    const currentUserId = getState().auth.user?._id;
    if (data.userId === currentUserId) return;

    dispatch(
      updateOnlineStatus({
        userId: data.userId,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen
      })
    );

    dispatch(
      updateChatPresence({
        userId: data.userId,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen
      })
    );
  });

  /* ================= ROOMS (الموجود عندك) ================= */

  socket.on("room:user:joined", (data) => {
    console.log("🏠 room:user:joined:", data);
    dispatch(socketUserJoined({ roomId: data.roomId, userId: data.userId }));
  });

  socket.on("room:user:left", (data) => {
    console.log("🚪 room:user:left:", data);
    dispatch(socketUserLeft({ roomId: data.roomId, userId: data.userId }));
  });

  socket.on("room:message:new", (message) => {
    console.log("📥 room:message:new:", message?._id);
    dispatch(socketNewRoomMessage({ roomId: message.room, message }));
  });

  socket.on("room:message:edited", (message) => {
    console.log("✏️ room:message:edited:", message?._id);
    // reuse merge action
    dispatch(socketMessagePinned({ roomId: message.room, message }));
  });

  socket.on("room:message:pinned", (message) => {
    console.log("📌 room:message:pinned:", message?._id);
    dispatch(socketMessagePinned({ roomId: message.room, message }));
  });

  socket.on("room:message:highlighted", (message) => {
    console.log("✨ room:message:highlighted:", message?._id);
    dispatch(socketMessageHighlighted({ roomId: message.room, message }));
  });

  socket.on("room:message:deleted", (data) => {
    console.log("🗑 room:message:deleted:", data);
    const roomId = data.roomId || getState().room?.activeRoomId;
    if (!roomId) return;
    dispatch(socketMessageDeleted({ roomId, messageId: data.messageId }));
  });

  socket.on("room:reaction:update", (data) => {
    console.log("❤️ room:reaction:update:", data?.messageId);
    const roomId = data.roomId || getState().room?.activeRoomId;
    if (!roomId) return;

    dispatch(
      socketReactionUpdate({
        roomId,
        messageId: data.messageId,
        reactions: data.reactions
      })
    );
  });

  // Optional sync events
  socket.on("room:users", (data) => {
    console.log("👥 room:users sync:", data);
  });

  socket.on("room:messages", (messages) => {
    console.log("💬 room:messages sync:", messages?.length);
  });

  socket.on("room:error", (err) => {
    console.log("⚠️ room:error:", err);
  });

  /* ================= ROOMS NEW (تحديثات على مستوى الغرفة) =================
     ملاحظة: هذه الأحداث موجودة في الباك عندك داخل roomService (emit).
     لو حابب تحدّث الواجهة فورًا، إمّا تعمل Actions جديدة في room.slice
     أو تكتفي بعمل refetch للغرف/الغرفة عند وصول الحدث.
  */

  socket.on("room:update", (room) => {
    console.log("🛠 room:update:", room?._id);
    // خيار 1: اعمل dispatch لثنك fetchRoomsByType / أو تحديث محلي إن عندك action
    // مثال بسيط: لو عندك reducer socketRoomUpdated
    // dispatch(socketRoomUpdated(room))
  });

  socket.on("room:type:update", (type) => {
    console.log("🔁 room:type:update:", type);
  });

  socket.on("room:premium:update", (level) => {
    console.log("💎 room:premium:update:", level);
  });

  socket.on("room:antispam:update", (data) => {
    console.log("🛡 room:antispam:update:", data);
  });

  socket.on("room:lock:update", (locked) => {
    console.log("🔒 room:lock:update:", locked);
  });

  socket.on("room:slowmode:update", (seconds) => {
    console.log("🐢 room:slowmode:update:", seconds);
  });

  socket.on("room:maxUsers:update", (maxUsers) => {
    console.log("👥 room:maxUsers:update:", maxUsers);
  });

  socket.on("room:boost:update", (data) => {
    console.log("🚀 room:boost:update:", data);
  });

  socket.on("room:roles:update", (data) => {
    console.log("🧩 room:roles:update:", data);
  });

  socket.on("room:user:removed", (data) => {
    console.log("🚫 room:user:removed:", data);
  });

  socket.on("room:user:banned", (data) => {
    console.log("⛔ room:user:banned:", data);
  });

  socket.on("room:user:unbanned", (data) => {
    console.log("✅ room:user:unbanned:", data);
  });

  socket.on("room:user:muted", (data) => {
    console.log("🔇 room:user:muted:", data);
  });

  socket.on("room:user:unmuted", (data) => {
    console.log("🔊 room:user:unmuted:", data);
  });

  socket.on("room:user:kicked", (data) => {
    console.log("🥾 room:user:kicked:", data);
  });

  socket.on("room:vip:update", (list) => {
    console.log("⭐ room:vip:update:", list?.length);
  });

  socket.on("room:poll:start", (poll) => {
    console.log("🗳 room:poll:start:", poll);
  });

  socket.on("room:poll:update", (poll) => {
    console.log("🗳 room:poll:update:", poll);
  });

  socket.on("room:poll:end", () => {
    console.log("🗳 room:poll:end");
  });

  socket.on("room:voice:seats", (seats) => {
    console.log("🎙 room:voice:seats:", seats);
  });

  socket.on("room:hand:update", (list) => {
    console.log("✋ room:hand:update:", list?.length);
  });

  socket.on("room:deleted", (data) => {
    console.log("🧨 room:deleted:", data);
    // مثال: لو الغرفة الحالية اتحذفت، تقدر تعمل redirect
  });

  console.log("✅ All socket listeners attached successfully");
};

/* =====================================================
   JOIN CHAT ROOM
===================================================== */

export const joinChatRoom = (chatId: string) => {
  if (!socket) {
    console.log("❌ Cannot join — socket not ready");
    return;
  }

  console.log("🏠 Joining chat room:", chatId);
  socket.emit("chat:join", { chatId });
};

/* =====================================================
   LEAVE CHAT ROOM
===================================================== */

export const leaveChatRoom = (chatId: string) => {
  if (!socket) return;
  console.log("🚪 Leaving chat room:", chatId);
  socket.emit("chat:leave", { chatId });
};

/* =====================================================
   SEND CHAT MESSAGE
===================================================== */

export const sendSocketMessage = (
  chatId: string,
  content: string,
  type: string,
  clientTempId: string,
  media?: any,
  replyTo?: any
) => {
  if (!socket) {
    console.log("❌ Cannot send — socket not connected");
    return;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📤 EMIT chat:send");
  console.log("Chat:", chatId);
  console.log("Content:", content);
  console.log("ClientTempId:", clientTempId);

  socket.emit("chat:send", {
    chatId,
    content,
    type,
    media,
    replyTo,
    clientTempId
  });

  console.log("✅ chat:send emitted");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};

/* =====================================================
   TYPING
===================================================== */

const typingTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>();
const typingStateMap = new Map<string, boolean>();

export const emitTyping = (chatId: string, isTyping: boolean) => {
  if (!socket) return;

  if (isTyping) {
    if (typingStateMap.get(chatId)) return;

    typingStateMap.set(chatId, true);

    socket.emit("chat:typing", {
      chatId,
      typing: true
    });

    if (typingTimeoutMap.has(chatId)) {
      clearTimeout(typingTimeoutMap.get(chatId)!);
    }

    const timeout = setTimeout(() => {
      socket?.emit("chat:typing", {
        chatId,
        typing: false
      });

      typingStateMap.set(chatId, false);
      typingTimeoutMap.delete(chatId);
    }, 1500);

    typingTimeoutMap.set(chatId, timeout);
  } else {
    if (!typingStateMap.get(chatId)) return;

    socket.emit("chat:typing", {
      chatId,
      typing: false
    });

    typingStateMap.set(chatId, false);

    if (typingTimeoutMap.has(chatId)) {
      clearTimeout(typingTimeoutMap.get(chatId)!);
      typingTimeoutMap.delete(chatId);
    }
  }
};

/* =====================================================
   MARK CHAT AS SEEN
===================================================== */

export const emitMarkAsSeen = (chatId: string) => {
  if (!socket) return;

  console.log("👁 EMIT chat:seen:", chatId);
  socket.emit("chat:seen", { chatId });
};

/* =====================================================
   ROOMS: JOIN / LEAVE / SEND / ACTIONS
===================================================== */

export const joinRoomSocket = (roomId: string) => {
  if (!socket) {
    console.log("❌ Cannot join room — socket not ready");
    return;
  }

  console.log("🏠 Joining ROOM:", roomId);
  socket.emit("room:join", roomId); // server expects string
};

export const leaveRoomSocket = (roomId: string) => {
  if (!socket) return;
  console.log("🚪 Leaving ROOM:", roomId);
  socket.emit("room:leave", roomId);
};

export const sendRoomSocketMessage = (payload: {
  roomId: string;
  content?: string;
  type?: string;
  replyTo?: string;
  mentions?: string[];
  media?: any;
  gift?: any;
}) => {
  if (!socket) {
    console.log("❌ Cannot send room message — socket not connected");
    return;
  }

  console.log("📤 EMIT room:message:send:", payload.roomId);
  socket.emit("room:message:send", payload);
};

export const editRoomSocketMessage = (payload: {
  roomId: string;
  messageId: string;
  content: string;
}) => {
  if (!socket) return;
  socket.emit("room:message:edit", payload);
};

export const deleteRoomSocketMessage = (payload: {
  roomId: string;
  messageId: string;
}) => {
  if (!socket) return;
  socket.emit("room:message:delete", payload);
};

export const pinRoomSocketMessage = (payload: {
  roomId: string;
  messageId: string;
  pinned?: boolean;
}) => {
  if (!socket) return;
  socket.emit("room:message:pin", payload);
};

export const highlightRoomSocketMessage = (payload: {
  roomId: string;
  messageId: string;
  highlighted?: boolean;
}) => {
  if (!socket) return;
  socket.emit("room:message:highlight", payload);
};

export const toggleRoomReaction = (payload: {
  roomId: string;
  messageId: string;
  emoji: string;
}) => {
  if (!socket) return;
  socket.emit("room:reaction:toggle", payload);
};

/* ================= NEW SOCKET EMITS (اختياري حسب ما ستضيفه في الباك) =================
   ملاحظة: في الكود الذي أرسلته للباك لا يوجد listeners لهذه الأحداث (syncUsers/syncMessages),
   إن كنت تريدها لازم تضيف socket.on(...) لها في rooms.socket.ts داخل السيرفر.
*/

export const syncRoomUsers = (roomId: string) => {
  if (!socket) return;
  socket.emit("room:syncUsers", roomId);
};

export const syncRoomMessages = (payload: {
  roomId: string;
  limit?: number;
  before?: string;
}) => {
  if (!socket) return;
  socket.emit("room:syncMessages", payload);
};

/* =====================================================
   DISCONNECT
===================================================== */

export const disconnectSocket = () => {
  if (!socket) return;

  console.log("🔌 Disconnecting socket...");

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  isListenersAttached = false;
};