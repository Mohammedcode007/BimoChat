import { Colors } from '@/constants/theme';
import {
  createChat,
  fetchChats,
  setActiveChat
} from '@/redux/slices/chatSlice';

import {
  getFriends,
  removeFriend
} from '@/redux/slices/friendSlice';

import {
  setMessages
} from '@/redux/slices/messageSlice';

import { AppDispatch, RootState } from '@/redux/store';
import api from '@/services/api';

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

import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

export default function FriendsScreen() {

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { friends, loading } = useSelector(
    (state: RootState) => state.friends
  );

  const [search, setSearch] = useState('');
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= Fetch Friends ================= */

  useEffect(() => {
    dispatch(getFriends());
  }, [dispatch]);

  /* ================= Filter ================= */

  const filteredFriends = useMemo(() => {
    return friends.filter((f) =>
      f.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [friends, search]);

  /* ================= Format Last Seen ================= */

  const formatLastSeen = (date?: string) => {

    if (!date) return "Offline";

    const last = new Date(date).getTime();
    const now = Date.now();

    const diff = Math.floor((now - last) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
  };

  /* ================= Pull To Refresh ================= */

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getFriends());
    setRefreshing(false);
  };

  /* ================= Remove Friend ================= */

  const deleteFriendHandler = (id: string) => {
    dispatch(removeFriend(id));
  };

  /* ================= Open Chat (Updated) ================= */

  const openChat = async (targetUserId: string) => {

    if (creatingChatId) return;

    try {

      setCreatingChatId(targetUserId);

      // 🔥 استخدم thunk بدلاً من axios مباشر
      const chat = await dispatch(
        createChat(targetUserId)
      ).unwrap();

      dispatch(setActiveChat(chat._id));

      // تحديث قائمة الشات لضمان الظهور
      dispatch(fetchChats());

      // جلب الرسائل
      const messagesRes = await api.get(
        `/messages/${chat._id}?page=1`
      );

      dispatch(setMessages({
        chatId: chat._id,
        messages: messagesRes.data
      }));

      router.push(`/chat/${chat._id}`);

    } catch (error) {
      console.log(error);
    } finally {
      setCreatingChatId(null);
    }
  };

  /* ================= Swipe ================= */

  const renderRightActions = (item: any) => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.delete]}
        onPress={() => deleteFriendHandler(item._id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={styles.actionText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  /* ================= Render ================= */

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={styles.topBar}>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder="Search friends"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-friend')}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
        </TouchableOpacity>

      </View>

      <FlatList
        data={filteredFriends}
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
              <Ionicons name="people-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                {search ? "No matching friends" : "No friends yet"}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (

          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openChat(item._id)}
            >
              <View style={[styles.card, { backgroundColor: theme.card }]}>

                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri:
                        item.avatar ||
                        `https://i.pravatar.cc/150?u=${item._id}`,
                    }}
                    style={styles.avatar}
                  />
                  {item.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.info}>
                  <Text
                    style={[styles.name, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.username}
                  </Text>

                  <Text style={styles.message}>
                    {item.isOnline
                      ? "Online"
                      : formatLastSeen(item.lastSeen)}
                  </Text>
                </View>

                {creatingChatId === item._id && (
                  <ActivityIndicator size="small" />
                )}

              </View>
            </TouchableOpacity>
          </Swipeable>

        )}
      />

    </View>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },

  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    height: '100%',
  },

  actionBtn: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  delete: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    marginVertical: 6,
  },

  actionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },

  empty: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#374151',
  },

  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    color: '#9CA3AF',
    textAlign: 'center',
  },

});
