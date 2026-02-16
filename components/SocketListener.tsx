// import {
//     addNotificationFromSocket,
//     setUnreadCount,
//     syncNotificationsFromSocket
// } from "@/redux/slices/notificationSlice";
// import { RootState } from "@/redux/store";
// import { connectSocket, disconnectSocket } from "@/services/socket";
// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";

// export default function SocketListener() {

//   const dispatch = useDispatch();
//   const { token } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {

//     if (!token) {
//       disconnectSocket();
//       return;
//     }

//     const socket = connectSocket(token);

//     /* 🛑 منع التكرار */
//     socket.off("notification:new");
//     socket.off("notification:sync");
//     socket.off("notification:count");

//     /* ================= NOTIFICATION EVENTS ================= */

//     socket.on("notification:new", (notification) => {
//       dispatch(addNotificationFromSocket(notification));
//     });

//     socket.on("notification:sync", (data) => {
//       dispatch(syncNotificationsFromSocket(data));
//     });

//     socket.on("notification:count", (count) => {
//       dispatch(setUnreadCount(count));
//     });

//   }, [token]);

//   return null;
// }

import {
  addNotificationFromSocket,
  setUnreadCount,
  syncNotificationsFromSocket
} from "@/redux/slices/notificationSlice";

import {
  setUnreadFromServer,
  socketNewMessage,
  updateMessageStatus
} from "@/redux/slices/chatSlice";

import { RootState } from "@/redux/store";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SocketListener() {

  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { activeChatId } = useSelector((state: RootState) => state.chat);

  useEffect(() => {

    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    socket.off("notification:new");
    socket.off("notification:sync");
    socket.off("notification:count");

    socket.off("chat:new");
    socket.off("unread:update");
    socket.off("message:delivered");
    socket.off("message:seen");

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

      dispatch(socketNewMessage({
        chatId: message.chat,
        message,
        isActive: activeChatId === message.chat
      }));

    });

    socket.on("unread:update", (data) => {
      dispatch(setUnreadFromServer(data));
    });

    socket.on("message:delivered", (data) => {
      dispatch(updateMessageStatus({
        chatId: data.chatId,
        messageId: data.messageId,
        status: "delivered"
      }));
    });

    socket.on("message:seen", (data) => {
      dispatch(updateMessageStatus({
        chatId: data.chatId,
        messageId: data.messageId,
        status: "seen"
      }));
    });

  }, [token, activeChatId]);

  return null;
}
