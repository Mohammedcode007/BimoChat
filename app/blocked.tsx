import {
  getBlockedUsers,
  unblockUser,
} from '@/redux/slices/friendSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function BlockedScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const { blockedUsers, loading } = useSelector(
    (state: RootState) => state.friends
  );

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

useEffect(() => {
  dispatch(getBlockedUsers());
}, []);



  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getBlockedUsers());
    setRefreshing(false);
  };

  const filteredList = useMemo(() => {
    return blockedUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.atUsername?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, blockedUsers]);

  const confirmUnblock = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleUnblock = () => {
    if (selectedUser) {
      dispatch(unblockUser(selectedUser));
      setSelectedUser(null);
    }
  };

  /* ================= Skeleton Loader ================= */

  const renderSkeleton = () => {
    return (
      <View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonText} />
          </View>
        ))}
      </View>
    );
  };

  /* ================= Swipe Action ================= */

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.swipeUnblock}
      onPress={() => confirmUnblock(id)}
    >
      <Ionicons name="lock-open-outline" size={22} color="#FFF" />
      <Text style={styles.swipeText}>إلغاء</Text>
    </TouchableOpacity>
  );

  return (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <View style={styles.container}>
      <Text style={styles.header}>الحسابات المحظورة</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#777" />
        <TextInput
          placeholder="ابحث عن حساب..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              لا توجد حسابات محظورة
            </Text>
          }
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() =>
                renderRightActions(item._id)
              }
            >
              <View style={styles.card}>

                <View style={styles.leftSection}>
                  <Image
                    source={{
                      uri:
                        item.avatar ||
                        'https://picsum.photos/200'
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.name}>
                      {item.username}
                    </Text>
                    {item.atUsername && (
                      <Text style={styles.username}>
                        {item.atUsername}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() =>
                    confirmUnblock(item._id)
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#E53935"
                  />
                  <Text style={styles.unblockText}>
                    إلغاء الحظر
                  </Text>
                </TouchableOpacity>

              </View>
            </Swipeable>
          )}
        />
      )}

      {/* ================= Confirmation Modal ================= */}

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              هل تريد إلغاء الحظر؟
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.cancelText}>
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleUnblock}
              >
                <Text style={styles.confirmText}>
                  نعم
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  </SafeAreaView>

  );
}

/* ================= STYLES ================= */

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
safeArea: {
  flex: 1,
  backgroundColor: '#F7F7F7',
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

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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

  swipeUnblock: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 16,
    marginBottom: 12,
  },

  swipeText: {
    color: '#FFF',
    fontWeight: '700',
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    padding: 10,
  },

  cancelText: {
    fontSize: 15,
    color: '#6B7280',
  },

  confirmBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  confirmText: {
    color: '#FFF',
    fontWeight: '700',
  },

  skeletonCard: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    height: 70,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },

  skeletonText: {
    height: 14,
    width: '50%',
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
  },

});
