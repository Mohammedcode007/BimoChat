import { io, Socket } from "socket.io-client";

import {
  setTyping,
  setUnreadFromServer,
  socketNewMessage,
  socketUpsertChatFromInbox,
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

// ✅ ROOMS SLICE (UPDATED IMPORTS)
import {
  socketMessageDeleted,
  socketMessageHighlighted,
  socketMessagePinned,
  socketNewRoomMessage,
  socketReactionUpdate,
  socketRoomActiveCount,
  socketRoomAntiSpamUpdate,
  socketRoomBanned,
  socketRoomBoostUpdate,
  socketRoomDeleted,
  socketRoomKicked,
  socketRoomLockUpdate,
  socketRoomPremiumUpdate,
  socketRoomRolesUpdate,
  socketRoomSlowModeUpdate,
  socketRoomTypeUpdate,
  socketRoomUpdated,
  socketRoomUsersUpdate,
  socketUserJoined,
  socketUserLeft
} from "@/redux/slices/room.slice";

import { fetchRoomUsers } from "@/redux/slices/room.slice";

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
    return socket;
  }


  // socket = io("http://192.168.0.100:5000", {
  //   auth: { token },
  //   transports: ["websocket"],
  //   reconnection: true,
 
  // });

    socket = io("https://te-bot.site", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
 
  });

  socket.on("connect", () => {
  });

  socket.on("disconnect", (reason) => {
  });

  socket.on("connect_error", (err) => {
  });

  return socket;
};

/* =====================================================
   ATTACH LISTENERS
===================================================== */

export const attachSocketListeners = (dispatch: any, getState: any) => {
  if (!socket) {
    return;
  }

  if (isListenersAttached) {
    return;
  }

  isListenersAttached = true;

  // ✅ helper: find roomId by messageId if backend doesn't send roomId
  const findRoomIdByMessageId = (messageId: string) => {
    const byRoom = getState().room?.messagesByRoom || {};
    for (const rid of Object.keys(byRoom)) {
      const list = byRoom[rid] || [];
      if (list.some((m: any) => m?._id === messageId)) return rid;
    }
    return undefined;
  };

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
  socket.removeAllListeners("chat:inbox:update");
  // ✅ ROOMS CLEAN
  socket.removeAllListeners("room:user:joined");
  socket.removeAllListeners("room:user:left");
  socket.removeAllListeners("room:message:new");
  socket.removeAllListeners("room:message:edited");
  socket.removeAllListeners("room:message:deleted");
  socket.removeAllListeners("room:message:pinned");
  socket.removeAllListeners("room:message:highlighted");
  socket.removeAllListeners("room:reaction:update");
  socket.removeAllListeners("room:error");
  socket.removeAllListeners("chat:snapshot");
  socket.removeAllListeners("room:activeCount:update");

  socket.removeAllListeners("room:users:update");
  socket.removeAllListeners("room:roles:update");

  socket.removeAllListeners("room:update");
  socket.removeAllListeners("room:type:update");
  socket.removeAllListeners("room:premium:update");
  socket.removeAllListeners("room:antispam:update");
  socket.removeAllListeners("room:lock:update");
  socket.removeAllListeners("room:slowmode:update");
  socket.removeAllListeners("room:boost:update");

  socket.removeAllListeners("room:deleted");

  socket.removeAllListeners("room:kicked");
  socket.removeAllListeners("room:banned");

  /* ================= CHAT NEW MESSAGE ================= */

  socket.on("chat:new", (message) => {

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
    dispatch(markDeliveredFromSocket(data));
  });

  /* ================= SEEN ================= */

  socket.on("chat:seen:update", (data) => {
    dispatch(markSeenFromSocket(data));
  });

  /* ================= UNREAD ================= */

  socket.on("chat:unread:update", (data) => {
    dispatch(setUnreadFromServer(data));
  });

  /* ================= REACTION ================= */

  socket.on("chat:reaction:update", (data) => {
    dispatch(updateReaction(data));
  });

  /* ================= DELETE ================= */

  socket.on("chat:message:deleted", (data) => {
    dispatch(deleteMessageFromSocket(data));
  });

  /* ================= TYPING ================= */

  socket.on("chat:typing", (data) => {

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
    dispatch(addNotificationFromSocket(notification));
  });

  socket.on("notification:sync", (data) => {
    dispatch(syncNotificationsFromSocket(data));
  });

  socket.on("notification:unreadTotal", (total) => {
    dispatch(setUnreadCount(total));
  });
  socket.on("chat:inbox:update", (payload) => {
    const chat = payload?.chat;
    const chatId = chat?._id || payload?.chatId;
    if (!chatId) return;

    const meId = getState().auth.user?._id;

    dispatch(
      socketUpsertChatFromInbox({
        ...payload,
        chatId,
        unreadCount:
          payload?.unreadCount ??
          chat?.unreadCounts?.[meId] ??
          chat?.unreadCount ??
          0,
      })
    );
  });
  // socket.on("chat:inbox:update", (payload) => {
  //   const chatId = payload?.chat?._id || payload?.chatId;
  //   if (!chatId) return;

  //   dispatch(socketUpsertChatFromInbox(payload));
  // });
  socket.on("chat:snapshot", (payload) => {
    const chat = payload?.chat;
    const chatId = chat?._id;
    if (!chatId) return;

    const meId = getState().auth.user?._id;

    dispatch(
      socketUpsertChatFromInbox({
        chat,
        chatId,
        unreadCount: chat?.unreadCounts?.[meId] ?? chat?.unreadCount ?? 0,
      })
    );
  });
  /* ================= PRESENCE ================= */

  socket.on("presence:update", (data) => {

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

  /* ================= ROOMS (CORE) ================= */

  socket.on("room:activeCount:update", (data) => {
    if (!data?.roomId) return;

    dispatch(
      socketRoomActiveCount({
        roomId: data.roomId,
        activeCount: Number(data.activeCount) || 0
      })
    );
  });

  socket.on("room:user:joined", (data) => {
    if (!data?.roomId || !data?.userId) return;
    dispatch(socketUserJoined({ roomId: data.roomId, userId: data.userId }));
  });

  socket.on("room:user:left", (data) => {
    if (!data?.roomId || !data?.userId) return;
    dispatch(socketUserLeft({ roomId: data.roomId, userId: data.userId }));
  });

  socket.on("room:message:new", (message) => {
    if (!message?.room) return;

    const roomId = typeof message.room === "string" ? message.room : String(message.room);
    dispatch(socketNewRoomMessage({ roomId, message }));
  });

  // ✅ FIX: normalize roomId (edited)
  socket.on("room:message:edited", (message) => {
    if (!message?.room) return;

    const roomId = typeof message.room === "string" ? message.room : String(message.room);
    dispatch(socketMessagePinned({ roomId, message }));
  });

  // ✅ FIX: normalize roomId (pinned)
  socket.on("room:message:pinned", (message) => {
    if (!message?.room) return;

    const roomId = typeof message.room === "string" ? message.room : String(message.room);
    dispatch(socketMessagePinned({ roomId, message }));
  });

  // ✅ FIX: normalize roomId (highlighted)
  socket.on("room:message:highlighted", (message) => {
    if (!message?.room) return;

    const roomId = typeof message.room === "string" ? message.room : String(message.room);
    dispatch(socketMessageHighlighted({ roomId, message }));
  });

  // ✅ FIX: do NOT rely only on activeRoomId; fallback to lookup
  socket.on("room:message:deleted", (data) => {

    const messageId = data?.messageId;
    if (!messageId) return;

    const roomId =
      data?.roomId || findRoomIdByMessageId(messageId) || getState().room?.activeRoomId;

    if (!roomId) return;

    dispatch(socketMessageDeleted({ roomId, messageId }));
  });

  // ✅ FIX: do NOT rely only on activeRoomId; fallback to lookup
  socket.on("room:reaction:update", (data) => {

    const messageId = data?.messageId;
    if (!messageId) return;

    const roomId =
      data?.roomId || findRoomIdByMessageId(messageId) || getState().room?.activeRoomId;

    if (!roomId) return;

    dispatch(
      socketReactionUpdate({
        roomId,
        messageId,
        reactions: Array.isArray(data.reactions) ? data.reactions : []
      })
    );
  });

  socket.on("room:error", (err) => {
  });

  /* ================= ROOMS (NEW BACKEND EVENTS) ================= */

  socket.on("room:users:update", (data) => {
    if (!data?.roomId) return;
    dispatch(socketRoomUsersUpdate({ roomId: data.roomId }));
    dispatch(fetchRoomUsers(data.roomId));
  });

  socket.on("room:roles:update", (data) => {
    if (!data?.roomId) return;

    dispatch(
      socketRoomRolesUpdate({
        roomId: data.roomId,
        owners: data.owners || [],
        admins: data.admins || [],
        members: data.members || []
      })
    );
  });

  socket.on("room:update", (room) => {
    if (!room?._id) return;
    dispatch(socketRoomUpdated(room));
  });

  socket.on("room:type:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload && typeof payload === "object" && payload.roomId && payload.type) {
      dispatch(socketRoomTypeUpdate({ roomId: payload.roomId, type: payload.type }));
      return;
    }

    if (activeRoomId && typeof payload === "string") {
      dispatch(socketRoomTypeUpdate({ roomId: activeRoomId, type: payload as any }));
    }
  });

  socket.on("room:premium:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload && typeof payload === "object" && payload.roomId) {
      dispatch(
        socketRoomPremiumUpdate({
          roomId: payload.roomId,
          premiumLevel: payload.level ?? payload.premiumLevel
        })
      );
      return;
    }

    if (activeRoomId) {
      dispatch(
        socketRoomPremiumUpdate({
          roomId: activeRoomId,
          premiumLevel: payload as any
        })
      );
    }
  });

  socket.on("room:antispam:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload?.roomId) {
      dispatch(
        socketRoomAntiSpamUpdate({
          roomId: payload.roomId,
          enabled: payload.enabled,
          max: payload.max
        })
      );
      return;
    }

    if (activeRoomId) {
      dispatch(
        socketRoomAntiSpamUpdate({
          roomId: activeRoomId,
          enabled: payload?.enabled,
          max: payload?.max
        })
      );
    }
  });

  socket.on("room:lock:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload && typeof payload === "object" && payload.roomId) {
      dispatch(socketRoomLockUpdate({ roomId: payload.roomId, isLocked: !!payload.isLocked }));
      return;
    }

    if (activeRoomId && typeof payload === "boolean") {
      dispatch(socketRoomLockUpdate({ roomId: activeRoomId, isLocked: payload }));
    }
  });

  socket.on("room:slowmode:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload && typeof payload === "object" && payload.roomId) {
      dispatch(
        socketRoomSlowModeUpdate({
          roomId: payload.roomId,
          slowModeSeconds: Number(payload.slowModeSeconds) || 0
        })
      );
      return;
    }

    if (activeRoomId && typeof payload === "number") {
      dispatch(socketRoomSlowModeUpdate({ roomId: activeRoomId, slowModeSeconds: payload }));
    }
  });

  socket.on("room:boost:update", (payload) => {
    const activeRoomId = getState().room?.activeRoomId;

    if (payload?.roomId) {
      dispatch(
        socketRoomBoostUpdate({
          roomId: payload.roomId,
          boostLevel: payload.boostLevel,
          boostExpiresAt: payload.boostExpiresAt
        })
      );
      return;
    }

    if (activeRoomId) {
      dispatch(
        socketRoomBoostUpdate({
          roomId: activeRoomId,
          boostLevel: payload?.boostLevel ?? 0,
          boostExpiresAt: payload?.boostExpiresAt
        })
      );
    }
  });

  socket.on("room:deleted", (data) => {
    if (!data?.roomId) return;
    dispatch(socketRoomDeleted({ roomId: data.roomId }));
  });

  socket.on("room:kicked", (data) => {
    if (!data?.roomId) return;
    dispatch(socketRoomKicked({ roomId: data.roomId }));
  });

  socket.on("room:banned", (data) => {
    if (!data?.roomId) return;
    dispatch(socketRoomBanned({ roomId: data.roomId, reason: data.reason }));
  });

};

/* =====================================================
   JOIN CHAT ROOM
===================================================== */

export const joinChatRoom = (chatId: string) => {
  if (!socket) {
    return;
  }

  socket.emit("chat:join", { chatId });
};

/* =====================================================
   LEAVE CHAT ROOM
===================================================== */

export const leaveChatRoom = (chatId: string) => {
  if (!socket) return;
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
    return;
  }



  socket.emit("chat:send", {
    chatId,
    content,
    type,
    media,
    replyTo,
    clientTempId
  });

  
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

  socket.emit("chat:seen", { chatId });
};

/* =====================================================
   ROOMS: JOIN / LEAVE / SEND / ACTIONS
===================================================== */

export const joinRoomSocket = (roomId: string) => {
  if (!socket) {
    return;
  }

  socket.emit("room:join", roomId);
};

export const leaveRoomSocket = (roomId: string) => {
  if (!socket) return;
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
    return;
  }

  socket.emit("room:message:send", payload);
};
export const kickRoomUserSocket = (payload: {
  roomId: string;
  targetId: string;
}) => {
  return new Promise<{ ok: boolean; message?: string }>((resolve) => {
    if (!socket) {
      resolve({ ok: false, message: "Socket not connected" });
      return;
    }

    socket.emit("room:kick", payload, (ack: any) => {
      if (ack?.ok) resolve({ ok: true });
      else resolve({ ok: false, message: ack?.message || "Kick failed" });
    });
  });
};

export const banRoomUserSocket = (payload: {
  roomId: string;
  targetId: string;
  reason?: string;
}) => {
  return new Promise<{ ok: boolean; message?: string }>((resolve) => {
    if (!socket) {
      resolve({ ok: false, message: "Socket not connected" });
      return;
    }

    socket.emit("room:ban", payload, (ack: any) => {
      if (ack?.ok) resolve({ ok: true });
      else resolve({ ok: false, message: ack?.message || "Ban failed" });
    });
  });
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

export const setRoomUserRoleSocket = (payload: {
  roomId: string;
  targetId: string;
  role: "owner" | "admin" | "member";
}) => {
  return new Promise<{ ok: boolean; message?: string }>((resolve) => {
    if (!socket) {
      resolve({ ok: false, message: "Socket not connected" });
      return;
    }

    socket.emit("room:role:set", payload, (ack: any) => {
      if (ack?.ok) resolve({ ok: true });
      else resolve({ ok: false, message: ack?.message || "Set role failed" });
    });
  });
};

/* =====================================================
   ⚠️ NOTE:
   syncRoomUsers / syncRoomMessages غير موجودين في الباك (rooms.socket.ts)
===================================================== */

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


  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  isListenersAttached = false;
};