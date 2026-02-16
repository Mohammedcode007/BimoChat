// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;
// let isListenersAttached = false;

// export const connectSocket = (token: string): Socket => {

//   if (socket) {
//     return socket;
//   }

//   const newSocket = io("http://192.168.1.6:5000", {
//     auth: { token },
//     transports: ["websocket"],
//     reconnection: true,
//   });

//   newSocket.on("connect", () => {
//     console.log("🟢 Socket connected:", newSocket.id);
//   });

//   newSocket.on("disconnect", (reason) => {
//     console.log("🔴 Socket disconnected:", reason);
//   });

//   newSocket.on("connect_error", (err) => {
//     console.log("⚠️ Socket error:", err.message);
//   });

//   socket = newSocket;

//   return newSocket;
// };



// export const attachNotificationListeners = (
//   dispatch: any
// ) => {

//   if (!socket) return;

//   if (isListenersAttached) return;

//   isListenersAttached = true;

//   socket.on("notification:new", (notification) => {
//     dispatch({
//       type: "notifications/addNotificationFromSocket",
//       payload: notification,
//     });
//   });

//   socket.on("notification:sync", (data) => {
//     dispatch({
//       type: "notifications/syncNotificationsFromSocket",
//       payload: data,
//     });
//   });

//   socket.on("notification:count", (count) => {
//     dispatch({
//       type: "notifications/setUnreadCount",
//       payload: count,
//     });
//   });

//   console.log("📡 Notification listeners attached once");
// };

// export const disconnectSocket = () => {

//   if (!socket) return;

//   socket.removeAllListeners();
//   socket.disconnect();

//   socket = null;
//   isListenersAttached = false;
// };

import { io, Socket } from "socket.io-client";

import {
  setUnreadFromServer,
  socketNewMessage,
  updateMessageStatus
} from "@/redux/slices/chatSlice";

import {
  addMessage,
  deleteMessage,
  editMessage,
  markDelivered,
  markSeen
} from "@/redux/slices/messageSlice";

import {
  addNotificationFromSocket,
  setUnreadCount,
  syncNotificationsFromSocket
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

  if (socket) return socket;

  socket = io("http://192.168.0.101:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Socket error:", err.message);
  });

  return socket;
};

/* =====================================================
   ATTACH LISTENERS (ONCE)
===================================================== */

export const attachSocketListeners = (
  dispatch: any,
  getState: any
) => {

  if (!socket) return;
  if (isListenersAttached) return;

  isListenersAttached = true;

  /* ================= NOTIFICATIONS ================= */

  socket.on("notification:new", (notification) => {
    dispatch(addNotificationFromSocket(notification));
  });

  socket.on("notification:sync", (data) => {
    dispatch(syncNotificationsFromSocket(data));
  });

  socket.on("notification:count", (count) => {
    dispatch(setUnreadCount(count));
  });

  /* ================= CHAT ================= */

  socket.on("chat:new", (message) => {

    const activeChatId = getState().chat.activeChatId;

    dispatch(addMessage(message));

    dispatch(socketNewMessage({
      chatId: message.chat,
      message,
      isActive: activeChatId === message.chat
    }));
  });

  socket.on("unread:update", (data) => {
    dispatch(setUnreadFromServer(data));
  });

  /* ================= MESSAGE STATUS ================= */

  socket.on("message:delivered", (data) => {

    dispatch(markDelivered({
      chatId: data.chatId,
      messageId: data.messageId,
      deliveredBy: data.deliveredBy
    }));

    dispatch(updateMessageStatus({
      chatId: data.chatId,
      messageId: data.messageId,
      status: "delivered"
    }));
  });

  socket.on("message:seen", (data) => {

    dispatch(markSeen({
      chatId: data.chatId,
      userId: data.userId
    }));

    dispatch(updateMessageStatus({
      chatId: data.chatId,
      messageId: data.messageId,
      status: "seen"
    }));
  });

  socket.on("message:edited", (data) => {
    dispatch(editMessage(data));
  });

  socket.on("message:deleted", (data) => {
    dispatch(deleteMessage(data));
  });

  /* ================= TYPING ================= */

  socket.on("typing:start", (data) => {
    dispatch({
      type: "chat/setTyping",
      payload: {
        chatId: data.chatId,
        userId: data.userId,
        typing: true
      }
    });
  });

  socket.on("typing:stop", (data) => {
    dispatch({
      type: "chat/setTyping",
      payload: {
        chatId: data.chatId,
        userId: data.userId,
        typing: false
      }
    });
  });

  /* ================= PRESENCE ================= */

  socket.on("presence:update", (data) => {

    const currentUserId = getState().auth.user?._id;

    if (data.userId === currentUserId) return;

    dispatch(updateOnlineStatus({
      userId: data.userId,
      status: data.status,
      lastSeen: data.lastSeen
    }));
  });

  console.log("📡 All socket listeners attached once");
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

  if (!socket) return;

  socket.emit("chat:send", {
    chatId,
    content,
    type,
    media,
    replyTo
  });
};

/* =====================================================
   TYPING
===================================================== */

let typingTimeout: any;

export const emitTyping = (chatId: string) => {

  if (!socket) return;

  socket.emit("typing:start", { chatId });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket?.emit("typing:stop", { chatId });
  }, 2000);
};

/* =====================================================
   MARK AS SEEN
===================================================== */

export const emitMarkAsSeen = (chatId: string) => {

  if (!socket) return;

  socket.emit("message:seen", {
    chatId
  });
};

/* =====================================================
   MARK AS DELIVERED
===================================================== */

export const emitMarkAsDelivered = (
  messageId: string
) => {

  if (!socket) return;

  socket.emit("message:delivered", {
    messageId
  });
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
