import {
  markNotificationAsRead
} from '@/redux/slices/notificationSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function NotificationsScreen() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, loading } = useSelector(
    (state: RootState) => state.notification
  );

  /* ================= FETCH ON MOUNT ================= */

  // useEffect(() => {
  //   dispatch(fetchNotifications());
  // }, []);

  /* ================= HANDLE PRESS ================= */

  const onPressNotification = (item: any) => {

    if (!item.isRead) {
      dispatch(markNotificationAsRead(item._id));
    }

    switch (item.type) {

      case 'message':
        if (item.relatedChat)
          router.push(`/chat/${item.relatedChat}`);
        break;

      case 'friend_request':
        router.push({
          pathname: '/friend-request-modal',
          params: {
            notificationId: item._id,
            senderId: item.sender?._id
          }
        });
        break;


      case 'room_invite':
        router.push({
          pathname: '/room-invite-modal',
          params: { roomId: item.relatedRoom },
        });
        break;

      case 'tweet_like':
      case 'tweet_reply':
        router.push('/interactions');
        break;

      default:
        break;
    }
  };

  /* ================= RENDER ================= */

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        // onRefresh={() => dispatch(fetchNotifications())}
        renderItem={({ item, index }) => (

          <Animated.View entering={FadeInDown.delay(index * 80)}>

            <TouchableOpacity
              onPress={() => onPressNotification(item)}
              style={[styles.item, !item.isRead && styles.unread]}
            >

              <View style={styles.icon}>
                <Ionicons name="notifications" size={20} color="#2563EB" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.body}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>

              {!item.isRead && <View style={styles.dot} />}

            </TouchableOpacity>

          </Animated.View>

        )}
      />

    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerTitle: { fontSize: 18, fontWeight: '600' },

  item: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    alignItems: 'center',
  },

  unread: { backgroundColor: '#EEF2FF' },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: { fontSize: 14, fontWeight: '600' },

  time: { fontSize: 11, color: '#94A3B8' },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
});
