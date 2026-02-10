import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type BlockedUser = {
  id: string;
  name: string;
  username: string;
};

const INITIAL_BLOCKED: BlockedUser[] = [
  { id: '1', name: 'Ahmed Ali', username: '@ahmed' },
  { id: '2', name: 'Sara Mohamed', username: '@sara' },
  { id: '3', name: 'Omar Hassan', username: '@omar' },
];

export default function BlockedScreen() {
  const [search, setSearch] = useState('');
  const [blocked, setBlocked] = useState<BlockedUser[]>(INITIAL_BLOCKED);

  const filteredList = useMemo(() => {
    return blocked.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, blocked]);

  const unblockUser = (id: string) => {
    setBlocked((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>الحسابات المحظورة</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#777" />
        <TextInput
          placeholder="ابحث عن حساب..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>لا توجد حسابات محظورة</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
            </View>

            <TouchableOpacity
              style={styles.unblockBtn}
              onPress={() => unblockUser(item.id)}
            >
              <Ionicons name="close-circle-outline" size={22} color="#E53935" />
              <Text style={styles.unblockText}>إلغاء الحظر</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
  },

  username: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  unblockText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '600',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
    fontSize: 14,
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
