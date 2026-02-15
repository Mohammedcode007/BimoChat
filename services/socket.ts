import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let isListenersAttached = false;

export const connectSocket = (token: string): Socket => {

  if (socket) {
    return socket;
  }

  const newSocket = io("http://192.168.0.101:5000", {
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



export const attachNotificationListeners = (
  dispatch: any
) => {

  if (!socket) return;

  if (isListenersAttached) return;

  isListenersAttached = true;

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

  console.log("📡 Notification listeners attached once");
};

export const disconnectSocket = () => {

  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();

  socket = null;
  isListenersAttached = false;
};
