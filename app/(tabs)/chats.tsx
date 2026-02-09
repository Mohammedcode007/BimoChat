import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

/* =======================
   Types
======================= */

type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: number;
  avatar: string;
  online: boolean;
  unread?: number;
  muted?: boolean;
  isTyping?: boolean;
  isRecording?: boolean;
  status?: 'sent' | 'delivered' | 'seen';
};

/* =======================
   Helpers
======================= */

const timeAgo = (timestamp: number) => {
  const diff = Math.floor((Date.now() - timestamp) / 60000);
  if (diff < 1) return 'now';
  if (diff < 60) return `${diff}m`;
  const h = Math.floor(diff / 60);
  return `${h}h`;
};

/* =======================
   Mock Generator
======================= */

const PAGE_SIZE = 10;

const generateChats = (size: number): Chat[] => {
  return Array.from({ length: size }).map(() => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const typing = Math.random() > 0.7;
    const recording = !typing && Math.random() > 0.85;

    return {
      id,
      name: `User ${id.slice(-4)}`,
      lastMessage: recording
        ? ''
        : typing
          ? ''
          : 'Hey! Are you available?',
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      online: true,
      unread: typing || recording ? 0 : Math.random() > 0.6 ? 2 : 0,
      muted: false,
      isTyping: typing,
      isRecording: recording,
      status: ['sent', 'delivered', 'seen'][
        Math.floor(Math.random() * 3)
      ] as 'sent' | 'delivered' | 'seen',
    };
  });
};

/* =======================
   Typing Dots Component
======================= */

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const animate = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    animate();
  }, []);

  return (
    <View style={styles.typingDots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

/* =======================
   Screen
======================= */

export default function ChatScreen() {
  const router = useRouter();

  const [data, setData] = useState<Chat[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchChats = async () => {
    if (loading) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));
    setData((prev) => [...prev, ...generateChats(PAGE_SIZE)]);
    setLoading(false);
  };

  useEffect(() => {
    fetchChats();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const filteredData = data.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const deleteChat = (id: string) => {
    setData((prev) => prev.filter((c) => c.id !== id));
  };

  const muteChat = (id: string) => {
    setData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c))
    );
  };

  const renderRightActions = (item: Chat) => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.mute]}
        onPress={() => muteChat(item.id)}
      >
        <Ionicons name="volume-mute" size={18} color="#FFF" />
        <Text style={styles.actionText}>Mute</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.delete]}
        onPress={() => deleteChat(item.id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          placeholder="Search chats"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: item.id },
                })
              }
            >
              <View
                style={[
                  styles.card,
                  item.unread ? styles.unreadCard : null,
                ]}
              >
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  {item.online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.info}>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.name,
                        item.unread ? styles.unreadName : null,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
                  </View>

                  <View style={styles.row}>
                    {/* Last message / Typing / Recording */}
                    {item.isTyping ? (
                      <TypingDots />
                    ) : item.isRecording ? (
                      <View style={styles.recordingRow}>
                        <Ionicons name="mic" size={14} color="#EF4444" />
                        <Text style={styles.recordingText}>Recording…</Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.message,
                          item.unread ? styles.unreadMessage : null,
                        ]}
                        numberOfLines={1}
                      >
                        {item.lastMessage}
                      </Text>
                    )}

                    {/* ✅ unread badge أو seen/delivered */}
                    {item.unread && item.unread > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {item.unread}
                        </Text>
                      </View>
                    ) : (
                      <Ionicons
                        name={
                          item.status === 'seen'
                            ? 'checkmark-done'
                            : item.status === 'delivered'
                              ? 'checkmark'
                              : 'time-outline'
                        }
                        size={14}
                        color={
                          item.status === 'seen'
                            ? '#4F46E5'
                            : '#9CA3AF'
                        }
                      />
                    )}
                  </View>

                </View>
              </View>
            </TouchableOpacity>

          </Swipeable>
        )}
      />
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

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },

  card: {
    flexDirection: 'row',
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
  },
  unreadCard: {
    backgroundColor: '#EEF2FF', // أزرق فاتح جدًا
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadName: {
    fontSize: 15, // أكبر قليلًا
    fontWeight: '700',
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
    maxWidth: '85%',
  },

  typingDots: {
    flexDirection: 'row',
    marginTop: 4,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
    marginHorizontal: 2,
  },

  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  recordingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#EF4444',
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
  unreadBadge: {
    backgroundColor: '#4F46E5',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  unreadMessage: {
    fontWeight: '600',
    color: '#111827',
  },

});
