import {
  acceptFriendRequest,
  rejectFriendRequest
} from '@/redux/slices/friendSlice';

import {
  deleteNotification,
  markNotificationAsRead
} from '@/redux/slices/notificationSlice';

import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

export default function FriendRequestModal() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { notificationId, senderId } = useLocalSearchParams();

  const { notifications } = useSelector(
    (state: RootState) => state.notification
  );

  const notification = notifications.find(
    n => n._id === notificationId
  );

  const [loading, setLoading] = useState(false);

  /* ================= AUTO CLOSE IF REQUEST DISAPPEARS ================= */

  useEffect(() => {
    if (!notification) {
      router.back();
    }
  }, [notification]);

  if (!notification) return null;

  const sender = notification.sender;

  /* ================= HANDLE ACCEPT ================= */

  const handleAccept = async () => {

    if (loading) return;

    setLoading(true);

    await dispatch(acceptFriendRequest(senderId as string));
    await dispatch(markNotificationAsRead(notificationId as string));
    await dispatch(deleteNotification(notificationId as string));

    setLoading(false);
    router.back();
  };

  /* ================= HANDLE REJECT ================= */

  const handleReject = async () => {

    if (loading) return;

    setLoading(true);

    await dispatch(rejectFriendRequest(senderId as string));
    await dispatch(markNotificationAsRead(notificationId as string));
    await dispatch(deleteNotification(notificationId as string));

    setLoading(false);
    router.back();
  };

  return (

    <View style={styles.overlay}>

      <Animated.View
        entering={FadeInDown.springify()}
        style={styles.sheet}
      >

        {/* Avatar */}
        <Image
          source={{
            uri: sender?.avatar ||
              'https://i.pravatar.cc/150'
          }}
          style={styles.avatar}
        />

        {/* Username */}
        <View style={styles.nameRow}>
          <Text style={styles.username}>
            {sender?.username}
          </Text>

          {sender?.isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#2563EB"
            />
          )}
        </View>

        <Text style={styles.subtitle}>
          أرسل لك طلب صداقة
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>

          <TouchableOpacity
            disabled={loading}
            style={[styles.button, styles.accept]}
            onPress={handleAccept}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>قبول</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            style={[styles.button, styles.reject]}
            onPress={handleReject}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>رفض</Text>}
          </TouchableOpacity>

        </View>

      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  sheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center'
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },

  username: {
    fontSize: 18,
    fontWeight: '700'
  },

  subtitle: {
    marginTop: 6,
    color: '#64748B',
    marginBottom: 24
  },

  buttons: {
    flexDirection: 'row',
    gap: 16
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center'
  },

  accept: {
    backgroundColor: '#16A34A'
  },

  reject: {
    backgroundColor: '#DC2626'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }

});
