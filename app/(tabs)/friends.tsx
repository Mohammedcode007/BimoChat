import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

/* =======================
   Types + Mock Generator
======================= */

type Friend = {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  online: boolean;
  muted?: boolean;
};

const PAGE_SIZE = 10;

const generateFriends = (size: number): Friend[] => {
  return Array.from({ length: size }).map(() => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      id,
      name: `User ${id.slice(-4)}`,
      message: 'Hey! Are you available to chat?',
      time: `${Math.floor(Math.random() * 59) + 1}m`,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      online: Math.random() > 0.5,
      muted: false,
    };
  });
};

/* =======================
   Screen
======================= */

export default function FriendsScreen() {
  const [data, setData] = useState<Friend[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
const [newFriendId, setNewFriendId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteValue, setInviteValue] = useState('');

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  /* =======================
     Pagination Fetch
  ======================= */

  const fetchFriends = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    setData((prev) => [...prev, ...generateFriends(PAGE_SIZE)]);
    setHasMore(page < 5);
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, [page]);

  /* =======================
     Search Debounce
  ======================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredData = data.filter(
    (f) =>
      f.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      f.message.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  /* =======================
     Actions
  ======================= */

 const addFriend = () => {
  if (!inviteValue.trim()) return;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const newFriend: Friend = {
    id,
    name: inviteValue,
    message: 'New friend 👋',
    time: 'now',
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    online: true,
  };

  setNewFriendId(id); // ✅ تحديد الصديق الجديد
  scaleAnim.setValue(0.8);

  setData((prev) => [newFriend, ...prev]);
  setInviteValue('');
  setModalVisible(false);

  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start(() => {
    setNewFriendId(null); // تنظيف
  });
};


  const deleteFriend = (id: string) => {
    setData((prev) => prev.filter((f) => f.id !== id));
  };

  const muteFriend = (id: string) => {
    setData((prev) =>
      prev.map((f) => (f.id === id ? { ...f, muted: !f.muted } : f))
    );
  };

  const renderRightActions = (item: Friend) => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.mute]}
        onPress={() => muteFriend(item.id)}
      >
        <Ionicons
          name={item.muted ? 'volume-mute' : 'volume-high'}
          size={18}
          color="#FFF"
        />
        <Text style={styles.actionText}>
          {item.muted ? 'Unmute' : 'Mute'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.delete]}
        onPress={() => deleteFriend(item.id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  /* =======================
     Render
  ======================= */

  return (
    <View style={styles.container}>
      {/* Search + Add */}
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
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" /> : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No friends found</Text>
          </View>
        }
        renderItem={({ item, index }) => (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
  <Animated.View
    style={[
      styles.card,
      item.id === newFriendId && {
        transform: [{ scale: scaleAnim }],
      },
    ]}
  >

              <View style={styles.avatarWrapper}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.message} numberOfLines={1}>
                    {item.message}
                  </Text>
                  {item.muted && (
                    <Ionicons name="volume-mute" size={14} color="#9CA3AF" />
                  )}
                </View>
              </View>

              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="#6B7280"
              />
            </Animated.View>
          </Swipeable>
        )}
      />

      {/* Add Friend Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Friend</Text>

            <TextInput
              placeholder="Username or phone number"
              value={inviteValue}
              onChangeText={setInviteValue}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addFriend}>
                <Text style={styles.confirm}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: 14,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },

  avatarWrapper: {
    width: 52,
    height: 52,
    marginRight: 12,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  info: {
    flex: 1,
    marginRight: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
  },

  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  message: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    height: '100%',
  },

  actionBtn: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mute: {
    backgroundColor: '#F59E0B',
  },

  delete: {
    backgroundColor: '#EF4444',
  },

  actionText: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
  },

  empty: {
    marginTop: 80,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modal: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 16,
  },

  cancel: {
    color: '#6B7280',
  },

  confirm: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
