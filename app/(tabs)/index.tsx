
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import { selectSortedChats } from "@/redux/selectors";
import {
  deleteChat,
  fetchChats,
  fetchTotalUnread,
  hydrateChatsFromCache,
  setActiveChat,
  setUnreadFromServer,
} from "@/redux/slices/chatSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { loadChatsFromCache } from "@/storage/chatCache";
import { truncateText } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  I18nManager,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function ChatListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
  const { language, t } = useTranslation();

  const isRTL = language === "ar" || I18nManager.isRTL;

  const [menuOpen, setMenuOpen] = useState<{
    chatId: string;
    x?: number;
    y?: number;
  } | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const chats = useSelector(selectSortedChats);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);

  const copy = useMemo(
    () => ({
      searchPlaceholder:
        t("chatssCREENlAN.searchPlaceholder") ||
        (isRTL ? "ابحث في المحادثات" : "Search chats"),
      startChatting:
        t("chatssCREENlAN.startChatting") ||
        (isRTL ? "ابدأ المحادثة..." : "Start chatting..."),
      messageDeleted:
        t("chatssCREENlAN.messageDeleted") ||
        (isRTL ? "تم حذف الرسالة" : "Message deleted"),
      photo:
        t("chatssCREENlAN.photo") ||
        (isRTL ? "📷 صورة" : "📷 Photo"),
      voiceMessage:
        t("chatssCREENlAN.voiceMessage") ||
        (isRTL ? "🎙 رسالة صوتية" : "🎙 Voice message"),
      online:
        t("chatssCREENlAN.online") ||
        (isRTL ? "متصل" : "Online"),
      typing:
        t("chatssCREENlAN.typing") ||
        (isRTL ? "يكتب..." : "typing..."),
      deleteChat:
        t("chatssCREENlAN.deleteChat") ||
        (isRTL ? "حذف المحادثة" : "Delete Chat"),
    }),
    [t, isRTL]
  );
  useEffect(() => {
    if (!currentUser?._id) return;

    const initChats = async () => {
      try {
        // 1) عرض الكاش فورًا
        const cachedChats = await loadChatsFromCache(currentUser._id);
        if (cachedChats.length) {
          dispatch(hydrateChatsFromCache(cachedChats));
        }

        // 2) مزامنة الخلفية من السيرفر
        dispatch(fetchChats());
        dispatch(fetchTotalUnread());
      } catch (error) {
        console.log("initChats error:", error);
      }
    };

    initChats();
  }, [dispatch, currentUser?._id]);

  // useEffect(() => {
  //   if (!currentUser?._id) return;

  //   // 1) عرض الكاش فورًا
  //   const cachedChats = loadChatsFromCache(currentUser._id);
  //   if (cachedChats.length) {
  //     dispatch(hydrateChatsFromCache(cachedChats));
  //   }

  //   // 2) مزامنة الخلفية من السيرفر
  //   dispatch(fetchChats());
  //   dispatch(fetchTotalUnread());
  // }, [dispatch, currentUser?._id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchChats()).unwrap();
      await dispatch(fetchTotalUnread()).unwrap();
    } catch (error) {
      console.log("refresh chats error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();

    return chats.filter((chat: any) => {
      if (!currentUser?._id) return false;

      const other = chat.participants?.find(
        (p: any) => p?._id !== currentUser._id
      );

      if (!other?.username) return false;

      if (!q) return true;
      return other.username.toLowerCase().includes(q);
    });
  }, [chats, search, currentUser?._id]);

  const formatTime = (date?: string) => {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleDateString();
  };

  const formatLastMessage = (chat: any) => {
    if (!chat.lastMessage) return copy.startChatting;
    if (chat.lastMessage.deletedForEveryone) return copy.messageDeleted;
    if (chat.lastMessage.type === "image") return copy.photo;
    if (chat.lastMessage.type === "audio") return copy.voiceMessage;
    return chat.lastMessage.content;
  };

  const openChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));
    dispatch(setUnreadFromServer({ chatId, unreadCount: 0 }));

    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };

  const handleDelete = async (chatId: string) => {
    setMenuOpen(null);

    try {
      await dispatch(deleteChat(chatId)).unwrap();
    } catch (err) {
      console.log("deleteChat error:", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.icon} />

        <TextInput
          placeholder={copy.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              color: theme.text,
              textAlign: isRTL ? "right" : "left",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
          placeholderTextColor={theme.mutedText as any}
        />

        {!!search.trim() && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            hitSlop={10}
            style={[
              styles.clearBtn,
              {
                backgroundColor: theme.surface2,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="close" size={16} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredChats}
        ListEmptyComponent={
  <View style={{ marginTop: 80, alignItems: "center" }}>
    <Ionicons name="chatbubble-ellipses-outline" size={40} color={theme.icon} />

    <Text
      style={{
        marginTop: 12,
        fontSize: 16,
        fontWeight: "800",
        color: theme.text,
      }}
    >
      {isRTL ? "لا توجد محادثات" : "No chats yet"}
    </Text>

    <Text
      style={{
        marginTop: 6,
        fontSize: 13,
        color: theme.mutedText,
      }}
    >
      {copy.startChatting}
    </Text>
  </View>
}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        onRefresh={onRefresh}
        extraData={{
          menuOpen,
          typingUsers,
          search,
          chatsLength: filteredChats.length,
          isRTL,
        }}
        contentContainerStyle={{ paddingBottom: 12 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }: any) => {
          if (!currentUser?._id) return null;

          const otherUser = item.participants?.find(
            (p: any) => p?._id !== currentUser._id
          );

          if (!otherUser) return null;

          const isTyping =
            ((typingUsers[item._id] || []) as string[]).filter(
              (id: string) => id !== currentUser?._id
            ).length > 0;

          const titleColor =
            item.unreadCount > 0 ? theme.text : theme.mutedText;
          const lastColor = isTyping ? theme.success : theme.mutedText;

          const timeText = otherUser.isOnline
            ? copy.online
            : otherUser.lastSeen
              ? formatTime(otherUser.lastSeen)
              : formatTime(item.updatedAt);

          return (
            <View style={{ position: "relative" }}>
              <Pressable
                onPress={() => {
                  setMenuOpen(null);
                  openChat(item._id);
                }}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    opacity: pressed ? 0.96 : 1,
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarWrapper,
                    isRTL
                      ? { marginLeft: 10, marginRight: 0 }
                      : { marginRight: 10, marginLeft: 0 },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        otherUser.avatar ||
                        `https://i.pravatar.cc/150?u=${otherUser._id}`,
                    }}
                    style={styles.avatar}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={[
                      styles.topRow,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingRight: isRTL ? 0 : 8,
                        paddingLeft: isRTL ? 8 : 0,
                      }}
                    >
                      <Text
                        style={[
                          styles.name,
                          {
                            color: titleColor,
                            textAlign: isRTL ? "right" : "left",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {truncateText(otherUser.username, 22)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.topRight,
                        { flexDirection: isRTL ? "row-reverse" : "row" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.time,
                          {
                            color: theme.subtleText,
                            textAlign: isRTL ? "left" : "right",
                          },
                        ]}
                      >
                        {timeText}
                      </Text>

                      <TouchableOpacity
                        onPress={(e: any) => {
                          e.stopPropagation();
                          const { pageX, pageY } = e.nativeEvent;

                          setMenuOpen({
                            chatId: item._id,
                            x: pageX,
                            y: pageY,
                          });
                        }}
                        style={[
                          styles.moreBtn,
                          {
                            backgroundColor: theme.surface2,
                            borderColor: theme.border,
                          },
                        ]}
                        hitSlop={10}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={16}
                          color={theme.icon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.bottomRow,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.lastMessage,
                        {
                          fontWeight: item.unreadCount > 0 ? "700" : "500",
                          color: lastColor,
                          textAlign: isRTL ? "right" : "left",
                        },
                      ]}
                    >
                      {isTyping
                        ? copy.typing
                        : truncateText(formatLastMessage(item), 38)}
                    </Text>

                    {item.unreadCount > 0 ? (
                      <View
                        style={[
                          styles.unreadBadge,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.unreadText,
                            { color: theme.primaryText },
                          ]}
                        >
                          {item.unreadCount > 99 ? "99+" : item.unreadCount}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.unreadSpacer} />
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          );
        }}
      />

      <Modal
        visible={!!menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuOpen(null)}
        >
          <View
            style={[
              styles.modalMenu,
              {
                top: menuOpen?.y ? menuOpen.y + 8 : 80,
                right: isRTL ? undefined : 16,
                left: isRTL ? 16 : undefined,
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                if (!menuOpen?.chatId) return;
                handleDelete(menuOpen.chatId);
              }}
              style={[
                styles.dropdownItem,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text
                style={[
                  styles.deleteText,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {copy.deleteChat}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    position: "relative",
  },

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  modalMenu: {
    position: "absolute",
    minWidth: 150,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 20,
      },
    }),
  },

  searchBox: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
    }),
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },

  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  card: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },

  avatarWrapper: {
    width: 52,
    height: 52,
    position: "relative",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },

  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },

  topRow: {
    alignItems: "center",
    marginBottom: 2,
  },

  topRight: {
    alignItems: "center",
    gap: 6,
  },

  moreBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "800",
  },

  time: {
    fontSize: 11,
    fontWeight: "700",
  },

  bottomRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  lastMessage: {
    flex: 1,
    fontSize: 13,
  },

  unreadBadge: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  unreadText: {
    fontSize: 11,
    fontWeight: "900",
  },

  unreadSpacer: {
    width: 22,
    height: 20,
  },

  separator: {
    height: 8,
    backgroundColor: "transparent",
  },

  dropdown: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 200,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 20 },
    }),
  },

  dropdownItem: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  deleteText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 14,
  },
});