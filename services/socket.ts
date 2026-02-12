import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  socket = io("http://192.168.0.101:5000", {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", reason => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", err => {
    console.log("⚠️ Socket error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
