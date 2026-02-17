
import { io, Socket } from "socket.io-client";

import {
  setTyping,
  setUnreadFromServer,
  socketNewMessage
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
  setUnreadCount
} from "@/redux/slices/notificationSlice";

import { updateOnlineStatus } from "@/redux/slices/friendSlice";

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

  socket = io("http://192.168.1.6:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
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

export const attachSocketListeners = (
  dispatch: any,
  getState: any
) => {

  if (!socket) {
    console.log("❌ No socket instance");
    return;
  }

  if (isListenersAttached) {
    console.log("⚠️ Listeners already attached");
    return;
  }

  console.log("📡 Attaching socket listeners...");
  isListenersAttached = true;

  /* ================= NEW MESSAGE ================= */

  socket.on("chat:new", (message) => {

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 chat:new RECEIVED");
    console.log("MessageId:", message._id);
    console.log("Chat:", message.chat);

    const activeChatId = getState().chat.activeChatId;
    console.log("Active Chat:", activeChatId);

    dispatch(addMessage(message));

    dispatch(socketNewMessage({
      chatId: message.chat,
      message,
    }));

    console.log("✅ Message dispatched to redux");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  /* ================= DELIVERY ================= */

  socket.on("chat:delivery:update", (data) => {
    console.log("📬 DELIVERY UPDATE:", data);
    dispatch(markDeliveredFromSocket(data));
  });

  /* ================= SEEN ================= */

  socket.on("chat:seen:update", (data) => {

    console.log("👁 SEEN UPDATE:", data);

    dispatch(markSeenFromSocket(data));

    dispatch(setUnreadFromServer({
      chatId: data.chatId,
      unreadCount: 0
    }));
  });

  /* ================= UNREAD ================= */

  socket.on("chat:unread:update", (data) => {
    console.log("🔢 UNREAD UPDATE FROM SERVER:", data);
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

  console.log("⌨️ CHAT TYPING RECEIVED:", data);

  dispatch(setTyping({
    chatId: data.chatId,
    userId: data.userId,
    typing: data.typing
  }));

});

  /* ================= NOTIFICATIONS ================= */

  socket.on("notification:new", (notification) => {
    console.log("🔔 NEW NOTIFICATION:", notification._id);
    dispatch(addNotificationFromSocket(notification));
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

    dispatch(updateOnlineStatus({
      userId: data.userId,
      status: data.status,
      lastSeen: data.lastSeen
    }));
  });

  console.log("✅ All socket listeners attached");
};

/* =====================================================
   JOIN ROOM
===================================================== */

export const joinChatRoom = (chatId: string) => {

  if (!socket) {
    console.log("❌ Cannot join — socket not ready");
    return;
  }

  console.log("🏠 Joining room:", chatId);
  socket.emit("chat:join", { chatId });
};

/* =====================================================
   LEAVE ROOM
===================================================== */

export const leaveChatRoom = (chatId: string) => {

  if (!socket) return;

  console.log("🚪 Leaving room:", chatId);
  socket.emit("chat:leave", { chatId });
};

/* =====================================================
   SEND MESSAGE
===================================================== */

export const sendSocketMessage = (
  chatId: string,
  content: string,
  type: string,
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

  socket.emit("chat:send", {
    chatId,
    content,
    type,
    media,
    replyTo
  });

  console.log("✅ chat:send emitted");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};

/* =====================================================
   TYPING
===================================================== */

const typingTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>();
const typingStateMap = new Map<string, boolean>();

export const emitTyping = (
  chatId: string,
  isTyping: boolean
) => {

  if (!socket) return;

  /* ================= START TYPING ================= */

  if (isTyping) {

    // لو كان بالفعل في حالة typing لا نعيد الإرسال
    if (typingStateMap.get(chatId)) return;

    typingStateMap.set(chatId, true);

    socket.emit("chat:typing", {
      chatId,
      typing: true
    });

    // تنظيف أي timeout سابق
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
  }

  /* ================= STOP TYPING ================= */

  else {

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
   MARK AS SEEN
===================================================== */

export const emitMarkAsSeen = (chatId: string) => {

  if (!socket) return;

  console.log("👁 EMIT chat:seen:", chatId);
  socket.emit("chat:seen", { chatId });
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
