import { router } from "expo-router";
import Toast from "react-native-toast-message";

type NotificationItem = {
  _id: string;
  type: string;
  body: string;
  relatedTweet?: string;
  relatedChat?: string;
  relatedRoom?: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
};

const buildSubtitleAr = (type: string) => {
  switch (type) {
    case "tweet_like":
      return "أُعجب بتغريدتك";
    case "tweet_reply":
      return "رد على تغريدتك";
    case "follow":
      return "بدأ يتابعك";
    case "friend_request":
      return "أرسل طلب صداقة";
    case "message":
      return "أرسل رسالة";
    case "room_invite":
      return "دعوة لغرفة";
    default:
      return "إشعار جديد";
  }
};

const getIconName = (type: string) => {
  switch (type) {
    case "tweet_like":
      return "heart";
    case "tweet_reply":
      return "chatbubble-ellipses";
    case "follow":
      return "person-add";
    case "friend_request":
      return "people";
    case "message":
      return "mail";
    case "room_invite":
      return "door-open";
    default:
      return "notifications";
  }
};

const openNotificationTarget = (item: NotificationItem) => {
  switch (item.type) {
    case "friend_request":
      router.push({
        pathname: "/friend-request-modal",
        params: {
          notificationId: item._id,
          senderId: item.sender?._id,
        },
      });
      break;

    case "tweet_like":
    case "tweet_reply":
      if (item.relatedTweet) router.push(`/tweet/${item.relatedTweet}`);
      break;

    case "message":
      if (item.relatedChat) router.push(`/chat/${item.relatedChat}`);
      break;

    case "room_invite":
      if (item.relatedRoom) router.push(`/room/${item.relatedRoom}`);
      break;
  }
};

export const showNotificationToast = (item: NotificationItem) => {
  Toast.show({
    type: "notify",
    position: "top",
    visibilityTime: 3500,
    autoHide: true,
    props: {
      title: item.sender?.username || "إشعار جديد",
      subtitle: item.body || buildSubtitleAr(item.type),
      avatar: item.sender?.avatar,
      iconName: getIconName(item.type),
      onPress: () => {
        Toast.hide();
        openNotificationTarget(item);
      },
    },
  });
};