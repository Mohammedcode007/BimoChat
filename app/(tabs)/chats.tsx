import { Colors } from '@/constants/theme';
import {
  deleteChat,
  fetchChats,
  fetchTotalUnread,
  setActiveChat,
  setUnreadFromServer
} from '@/redux/slices/chatSlice';

import { emitMarkAsSeen } from '@/services/socket';

import { AppDispatch, RootState } from '@/redux/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

export default function ChatListScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
const [menuOpen, setMenuOpen] = useState<string | null>(null);
const [refreshing, setRefreshing] = useState(false);

useEffect(() => {
  dispatch(fetchChats());
  dispatch(fetchTotalUnread());
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchChats());
  }, 60000); // كل دقيقة

  return () => clearInterval(interval);
}, []);


const onRefresh = async () => {

  setRefreshing(true);

  try {
    await dispatch(fetchChats()).unwrap();
    await dispatch(fetchTotalUnread()).unwrap();
  } catch (error) {
    console.log("Refresh failed");
  }

  setRefreshing(false);
};

  const { chats, typingUsers } = useSelector(
    (state: RootState) => state.chat
  );
  console.log(chats,'465465465465');
  

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const [search, setSearch] = useState('');

  /* ================= Filter ================= */

  const filteredChats = useMemo(() => {

    if (!currentUser?._id) return [];

    return chats.filter(chat => {

      const other = chat.participants?.find(
        (p: any) => p?._id !== currentUser._id
      );

      if (!other?.username) return false;

      return other.username
        .toLowerCase()
        .includes(search.toLowerCase());
    });

  }, [chats, search, currentUser]);

  /* ================= Format Time ================= */

  const formatTime = (date?: string) => {

    if (!date) return "";

    const d = new Date(date);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return d.toLocaleDateString();
  };

  /* ================= Format Last Message ================= */

  const formatLastMessage = (chat: any) => {

    if (!chat.lastMessage) return "Start chatting...";

    if (chat.lastMessage.deletedForEveryone)
      return "Message deleted";

    if (chat.lastMessage.type === "image")
      return "📷 Photo";

    if (chat.lastMessage.type === "audio")
      return "🎙 Voice message";

    return chat.lastMessage.content;
  };

  /* ================= Open Chat ================= */

  const openChat = (chatId: string) => {

    dispatch(setActiveChat(chatId));

    // تصفير unread محليًا
    dispatch(setUnreadFromServer({
      chatId,
      unreadCount: 0
    }));

    // إرسال seen للسيرفر
    emitMarkAsSeen(chatId);

    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId }
    });
  };
const handleDelete = (chatId: string) => {
  setMenuOpen(null);
  dispatch(deleteChat(chatId));
};

  /* ================= Render ================= */

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Search */}

      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          placeholder="Search chats"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* List */}

    <FlatList
  data={filteredChats}
  keyExtractor={(item) => item._id}
  showsVerticalScrollIndicator={false}
    refreshing={refreshing}
  onRefresh={onRefresh}
extraData={[menuOpen, typingUsers]}
  renderItem={({ item }) => {

    if (!currentUser?._id) return null;

    const otherUser = item.participants?.find(
      (p: any) => p?._id !== currentUser._id
    );

    if (!otherUser) return null;

    const isTyping =
      typingUsers[item._id]?.length > 0;

    return (
      <View style={{ position: 'relative' }}>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {
            setMenuOpen(null);
            openChat(item._id);
          }}
          activeOpacity={0.85}
        >

          {/* Avatar */}

          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  otherUser.avatar ||
                  `https://i.pravatar.cc/150?u=${otherUser._id}`,
              }}
              style={styles.avatar}
            />
            {otherUser.isOnline && (
              <View style={styles.onlineDot} />
            )}
          </View>

          {/* Info */}

          <View style={{ flex: 1 }}>

            {/* Top Row */}

            <View style={styles.row}>

              <Text
                style={[
                  styles.name,
                  {
                    color:
                      item.unreadCount > 0
                        ? theme.text
                        : '#6B7280'
                  }
                ]}
                numberOfLines={1}
              >
                {otherUser.username}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Text style={styles.time}>
  {otherUser.isOnline
    ? "Online"
    : otherUser.lastSeen
      ? formatTime(otherUser.lastSeen)
      : formatTime(item.updatedAt)
  }
</Text>


                {/* Three Dots */}

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setMenuOpen(
                      menuOpen === item._id
                        ? null
                        : item._id
                    );
                  }}
                  style={{ marginLeft: 8, padding: 4 }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

              </View>

            </View>

            {/* Bottom Row */}

            <View style={styles.row}>

              <Text
                numberOfLines={1}
                style={[
                  styles.lastMessage,
                  {
                    fontWeight:
                      item.unreadCount > 0 ? '600' : '400',
                    color: isTyping ? '#22C55E' : '#6B7280'
                  }
                ]}
              >
             {isTyping
  ? "Typing..."
  : otherUser.isOnline
    ? formatLastMessage(item)
    : formatLastMessage(item)}

              </Text>

              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}

            </View>

          </View>

        </TouchableOpacity>

        {/* Dropdown */}

        {menuOpen === item._id && (
          <View style={[styles.dropdown, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.dropdownItem}
            >
              <Text style={styles.deleteText}>
                Delete Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    );
  }}
/>


    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  searchBox: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 14,
    alignItems: 'center',
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  avatarWrapper: {
    width: 56,
    height: 56,
    marginRight: 14,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '70%'
  },

  lastMessage: {
    fontSize: 13,
    maxWidth: '75%'
  },
dropdown: {
  position: 'absolute',
  top: 55,
  right: 20,
  borderRadius: 14,
  paddingVertical: 8,
  paddingHorizontal: 14,
  elevation: 8,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  zIndex: 999,
},

dropdownItem: {
  paddingVertical: 6,
},

deleteText: {
  color: '#EF4444',
  fontWeight: '600',
  fontSize: 14,
},

  time: {
    fontSize: 11,
    color: '#9CA3AF'
  },

  unreadBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 22,
    alignItems: 'center'
  },

  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600'
  }

});
