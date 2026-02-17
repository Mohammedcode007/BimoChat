
import {
  addNotificationFromSocket,
  setUnreadCount,
  syncNotificationsFromSocket
} from "@/redux/slices/notificationSlice";

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

import { RootState } from "@/redux/store";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SocketListener() {

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {

    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    console.log("📡 Attaching socket listeners...");

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

    /* ================= NEW MESSAGE ================= */

    socket.on("chat:new", (message) => {

      console.log("📥 chat:new RECEIVED:", message._id);

      // 1️⃣ أضف الرسالة في messageSlice
      dispatch(addMessage(message));

      // 2️⃣ حدث chatSlice (unread + lastMessage)
      dispatch(socketNewMessage({
        chatId: message.chat,
        message
      }));

    });

    /* ================= DELIVERY UPDATE ================= */

    socket.on("chat:delivery:update", (data) => {
      console.log("📬 DELIVERY UPDATE:", data);
      dispatch(markDeliveredFromSocket(data));
    });

    /* ================= SEEN UPDATE ================= */

    socket.on("chat:seen:update", (data) => {
      console.log("👁 SEEN UPDATE:", data);

      dispatch(markSeenFromSocket(data));

      dispatch(setUnreadFromServer({
        chatId: data.chatId,
        unreadCount: 0
      }));
    });

    /* ================= UNREAD SYNC ================= */

    socket.on("chat:unread:update", (data) => {
      console.log("🔢 UNREAD UPDATE:", data);
      dispatch(setUnreadFromServer(data));
    });

    /* ================= REACTIONS ================= */

    socket.on("chat:reaction:update", (data) => {
      dispatch(updateReaction(data));
    });

    /* ================= DELETE MESSAGE ================= */

    socket.on("chat:message:deleted", (data) => {
      dispatch(deleteMessageFromSocket(data));
    });

    /* ================= TYPING ================= */

 socket.on("chat:typing", (data) => {

  console.log("⌨️ CHAT TYPING RECEIVED:", data);

  dispatch(setTyping({
    chatId: data.chatId,
    userId: data.userId,
    typing: data.typing  // 🔥 مهم جدًا
  }));

});


    console.log("✅ Socket listeners attached");

    return () => {
      console.log("🛑 Removing socket listeners");
      socket.removeAllListeners();
    };

  }, [token]); // ✅ فقط token

  return null;
}
