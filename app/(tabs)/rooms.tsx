import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/* =======================
   Types
======================= */

type Room = {
  id: string;
  name: string;
  members: number;
  image: string;

  isVIP?: boolean;
  isPrivate?: boolean;
  isVoice?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
};

/* =======================
   Constants
======================= */

const PAGE_SIZE = 6;

const TABS = ['All', 'Trending', 'VIP', 'Voice', 'Private'] as const;
type TabType = (typeof TABS)[number];

/* =======================
   Mock Generator
======================= */

const generateRooms = (count: number): Room[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `${Date.now()}-${i}`;
    return {
      id,
      name: `Room ${id.slice(-3)}`,
      members: Math.floor(Math.random() * 50) + 1,
      image: `https://picsum.photos/200/200?random=${id}`,
      isVIP: Math.random() > 0.75,
      isPrivate: Math.random() > 0.8,
      isVoice: Math.random() > 0.6,
      isVerified: Math.random() > 0.7,
      isTrending: Math.random() > 0.65,
    };
  });
};

/* =======================
   Badge Component
======================= */

const Badge = ({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) => (
  <View style={[styles.badge, { borderColor: color }]}>
    <Ionicons name={icon} size={12} color={color} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

/* =======================
   Screen
======================= */

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [page, setPage] = useState(1);

  const [tab, setTab] = useState<TabType>('All');
  const [search, setSearch] = useState('');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  /* =======================
     Load Rooms
  ======================= */

  useEffect(() => {
    setRooms((prev) => [...prev, ...generateRooms(PAGE_SIZE)]);
  }, [page]);

  /* =======================
     Sorting (Smart Order)
  ======================= */

  const sortRooms = (list: Room[]) => {
    return [...list].sort((a, b) => {
      const score = (r: Room) =>
        (r.isTrending ? 5 : 0) +
        (r.isVIP ? 4 : 0) +
        (r.isVerified ? 3 : 0) +
        (!r.isPrivate ? 2 : 0) +
        (r.isVoice ? 1 : 0);

      return score(b) - score(a);
    });
  };

  /* =======================
     Filtering
  ======================= */

  const filteredRooms = useMemo(() => {
    let data = rooms;

    if (tab === 'Trending') data = data.filter((r) => r.isTrending);
    if (tab === 'VIP') data = data.filter((r) => r.isVIP);
    if (tab === 'Voice') data = data.filter((r) => r.isVoice);
    if (tab === 'Private') data = data.filter((r) => r.isPrivate);

    if (search.trim()) {
      data = data.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return tab === 'All' ? sortRooms(data) : data;
  }, [rooms, tab, search]);

  /* =======================
     Add Room
  ======================= */

  const addRoom = () => {
    const name = roomName.trim();

    if (!name) {
      setError('Room name is required');
      return;
    }

    const exists = rooms.some(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setError('Room name already exists');
      return;
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      members: 1,
      image: `https://picsum.photos/200/200?new=${name}`,
      isTrending: true,
    };

    setRooms((prev) => [newRoom, ...prev]);
    setRoomName('');
    setError('');
    setModalVisible(false);
  };

  /* =======================
     Render
  ======================= */

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          placeholder="Search rooms"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Tabs */}
    <View style={styles.tabs}>
  {TABS.map((t) => {
    const active = tab === t;
    return (
      <TouchableOpacity
        key={t}
        onPress={() => setTab(t)}
        activeOpacity={0.7}
        style={styles.tabBtn}
      >
        <Text
          style={[
            styles.tabText,
            active && styles.activeTabText,
          ]}
        >
          {t}
        </Text>

        {active && <View style={styles.indicator} />}
      </TouchableOpacity>
    );
  })}
</View>


      {/* Rooms */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No rooms found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.members}>{item.members}/50 members</Text>

              <View style={styles.badges}>
                {item.isTrending && (
                  <Badge icon="flame" label="Trending" color="#F97316" />
                )}
                {item.isVIP && (
                  <Badge icon="star" label="VIP" color="#F59E0B" />
                )}
                {item.isVerified && (
                  <Badge icon="checkmark-circle" label="Verified" color="#22C55E" />
                )}
                {item.isVoice && (
                  <Badge icon="mic" label="Voice" color="#4F46E5" />
                )}
                {item.isPrivate && (
                  <Badge icon="lock-closed" label="Private" color="#EF4444" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Room Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Room Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Room</Text>

            <TextInput
              placeholder="Room name"
              value={roomName}
              onChangeText={(t) => {
                setRoomName(t);
                setError('');
              }}
              style={styles.modalInput}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addRoom}>
                <Text style={styles.confirm}>Create</Text>
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

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
  },



  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },

  activeTab: {
    backgroundColor: '#4F46E5',
  },




  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
  },

  members: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  empty: {
    marginTop: 80,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 10,
    color: '#9CA3AF',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 10,
  },

  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
  },

  error: {
    marginTop: 6,
    color: '#EF4444',
    fontSize: 12,
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
  tabs: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 6,
},

tabBtn: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 8,
  borderRadius: 12,
},

tabText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#6B7280',
},

activeTabText: {
  color: '#4F46E5',
  fontWeight: '700',
},

indicator: {
  marginTop: 6,
  width: 20,
  height: 3,
  borderRadius: 2,
  backgroundColor: '#4F46E5',
},

});
