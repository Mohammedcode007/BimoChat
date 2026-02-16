import { Colors } from '@/constants/theme';
import {
  fetchChats,
  resetUnread,
  setActiveChat
} from '@/redux/slices/chatSlice';

import { AppDispatch, RootState } from '@/redux/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
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

  const { chats, loading } = useSelector(
    (state: RootState) => state.chat
  );
/* ================= Debug Chats ================= */

useEffect(() => {

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 CHAT LIST UPDATED");
  console.log("📊 Total Chats:", chats.length);

  chats.forEach((chat, index) => {

    const other = chat.participants?.find(
      p => p._id !== currentUser?._id
    );

    console.log("──────────────────────────────");
    console.log(`💬 Chat #${index + 1}`);
    console.log("🆔 Chat ID:", chat._id);
    console.log("👤 With:", other?.username);
    console.log("📨 Last Message:", chat.lastMessage?.content);
    console.log("📌 Last Type:", chat.lastMessage?.type);
    console.log("🕒 Updated At:", chat.updatedAt);
    console.log("🔔 Unread:", chat.unreadCount);
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

}, [chats]);

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /* ================= Fetch ================= */

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchChats());
    setRefreshing(false);
  };

  /* ================= Time Formatter ================= */

  const formatTime = (date: string) => {

    const messageDate = new Date(date);
    const now = new Date();

    const isToday =
      messageDate.toDateString() === now.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return messageDate.toLocaleDateString();
  };

  /* ================= Filter ================= */

  const filteredChats = useMemo(() => {

    if (!currentUser?._id) return [];

    return chats.filter(chat => {

      const other = chat.participants.find(
        p => p._id !== currentUser._id
      );

      if (!other?.username) return false;

      return other.username
        .toLowerCase()
        .includes(search.toLowerCase());
    });

  }, [chats, search, currentUser]);

  /* ================= Open Chat ================= */

  const openChat = (chatId: string) => {

    dispatch(setActiveChat(chatId));
    dispatch(resetUnread(chatId));

    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId }
    });
  };

  /* ================= Render ================= */

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ================= Search ================= */}

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

      {/* ================= List ================= */}

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View style={styles.empty}>
              <Ionicons
                name="chatbubbles-outline"
                size={60}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>
                No conversations yet
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {

          if (!currentUser?._id) return null;

          const otherUser = item.participants.find(
            p => p._id !== currentUser._id
          );

          if (!otherUser) return null;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => openChat(item._id)}
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

                  {item.updatedAt && (
                    <Text style={styles.time}>
                      {formatTime(item.updatedAt)}
                    </Text>
                  )}
                </View>

                <View style={styles.row}>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.lastMessage,
                      {
                        fontWeight:
                          item.unreadCount > 0 ? '600' : '400'
                      }
                    ]}
                  >
                    {item.lastMessage?.content || 'Start chatting...'}
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#6B7280',
    maxWidth: '75%'
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
  },

  empty: {
    marginTop: 120,
    alignItems: 'center'
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF'
  }

});
