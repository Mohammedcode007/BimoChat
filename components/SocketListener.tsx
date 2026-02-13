import {
    addNotificationFromSocket,
    setUnreadCount,
    syncNotificationsFromSocket
} from "@/redux/slices/notificationSlice";
import { RootState } from "@/redux/store";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SocketListener() {

  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {

    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    /* 🛑 منع التكرار */
    socket.off("notification:new");
    socket.off("notification:sync");
    socket.off("notification:count");

    /* ================= NOTIFICATION EVENTS ================= */

    socket.on("notification:new", (notification) => {
      dispatch(addNotificationFromSocket(notification));
    });

    socket.on("notification:sync", (data) => {
      dispatch(syncNotificationsFromSocket(data));
    });

    socket.on("notification:count", (count) => {
      dispatch(setUnreadCount(count));
    });

  }, [token]);

  return null;
}

