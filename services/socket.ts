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

import { updateOnlineStatus } from "@/redux/slices/friendSlice";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let isListenersAttached = false;

export const connectSocket = (token: string): Socket => {

  if (socket) {
    return socket;
  }

  const newSocket = io("http://192.168.1.6:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
  });

  newSocket.on("connect", () => {
    console.log("🟢 Socket connected:", newSocket.id);
  });

  newSocket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  newSocket.on("connect_error", (err) => {
    console.log("⚠️ Socket error:", err.message);
  });

  socket = newSocket;

  return newSocket;
};


/* =====================================================
   ATTACH ALL SOCKET LISTENERS (ONCE ONLY)
===================================================== */

export const attachSocketListeners = (dispatch: any, getState: any) => {

  if (!socket) return;
  if (isListenersAttached) return;

  isListenersAttached = true;

  /* ================= Notifications ================= */

  socket.on("notification:new", (notification) => {
    dispatch({
      type: "notifications/addNotificationFromSocket",
      payload: notification,
    });
  });

  socket.on("notification:sync", (data) => {
    dispatch({
      type: "notifications/syncNotificationsFromSocket",
      payload: data,
    });
  });

  socket.on("notification:count", (count) => {
    dispatch({
      type: "notifications/setUnreadCount",
      payload: count,
    });
  });

  /* ================= Presence ================= */

  socket.on("presence:update", (data) => {

    const currentUserId = getState().auth.user?._id;

    // لا نحدث نفسك
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
   DISCONNECT
===================================================== */

export const disconnectSocket = () => {

  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  isListenersAttached = false;
};
