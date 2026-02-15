// import {
//   markNotificationAsRead
// } from '@/redux/slices/notificationSlice';
// import { AppDispatch, RootState } from '@/redux/store';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// export default function NotificationsScreen() {

//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { notifications, loading } = useSelector(
//     (state: RootState) => state.notification
//   );

//   /* ================= FETCH ON MOUNT ================= */

//   // useEffect(() => {
//   //   dispatch(fetchNotifications());
//   // }, []);

//   /* ================= HANDLE PRESS ================= */

//   const onPressNotification = (item: any) => {

//     if (!item.isRead) {
//       dispatch(markNotificationAsRead(item._id));
//     }

//     switch (item.type) {

//       case 'message':
//         if (item.relatedChat)
//           router.push(`/chat/${item.relatedChat}`);
//         break;

//       case 'friend_request':
//         router.push({
//           pathname: '/friend-request-modal',
//           params: {
//             notificationId: item._id,
//             senderId: item.sender?._id
//           }
//         });
//         break;


//       case 'room_invite':
//         router.push({
//           pathname: '/room-invite-modal',
//           params: { roomId: item.relatedRoom },
//         });
//         break;

//       case 'tweet_like':
//       case 'tweet_reply':
//         router.push('/interactions');
//         break;

//       default:
//         break;
//     }
//   };

//   /* ================= RENDER ================= */

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>الإشعارات</Text>
//       </View>

//       <FlatList
//         data={notifications}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={{ padding: 16 }}
//         refreshing={loading}
//         // onRefresh={() => dispatch(fetchNotifications())}
//         renderItem={({ item, index }) => (

//           <Animated.View entering={FadeInDown.delay(index * 80)}>

//             <TouchableOpacity
//               onPress={() => onPressNotification(item)}
//               style={[styles.item, !item.isRead && styles.unread]}
//             >

//               <View style={styles.icon}>
//                 <Ionicons name="notifications" size={20} color="#2563EB" />
//               </View>

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.title}>{item.body}</Text>
//                 <Text style={styles.time}>
//                   {new Date(item.createdAt).toLocaleString()}
//                 </Text>
//               </View>

//               {!item.isRead && <View style={styles.dot} />}

//             </TouchableOpacity>

//           </Animated.View>

//         )}
//       />

//     </SafeAreaView>
//   );
// }

// /* =====================================================
//    STYLES
// ===================================================== */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#fff' },

//   header: {
//     height: 56,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },

//   headerTitle: { fontSize: 18, fontWeight: '600' },

//   item: {
//     flexDirection: 'row',
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: '#F8FAFC',
//     marginBottom: 12,
//     alignItems: 'center',
//   },

//   unread: { backgroundColor: '#EEF2FF' },

//   icon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#DBEAFE',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   title: { fontSize: 14, fontWeight: '600' },

//   time: { fontSize: 11, color: '#94A3B8' },

//   dot: {
//     width: 8,
//     height: 8,
//     backgroundColor: '#2563EB',
//     borderRadius: 4,
//   },
// });


import {
  deleteNotification,
  markNotificationAsRead,
} from '@/redux/slices/notificationSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

/* ================= TYPES ================= */

interface NotificationItem {
  _id: string;
  type: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedTweet?: string;
  relatedChat?: string;
  relatedRoom?: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

/* ================= SCREEN ================= */

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { notifications, loading } = useSelector(
    (state: RootState) => state.notification
  );

  /* ================= GROUPING ================= */

  const groupedNotifications = useMemo(() => {
    const map: Record<string, any> = {};

    notifications.forEach((item: NotificationItem) => {

      // لا نقوم بتجميع طلبات الصداقة
      if (item.type === 'friend_request') {
        map[item._id] = { ...item, count: 1, users: [item.sender] };
        return;
      }

      const key =
        `${item.sender?._id}-${item.type}-${item.relatedTweet || ''}`;

      if (!map[key]) {
        map[key] = {
          ...item,
          count: 1,
          users: [item.sender],
        };
      } else {
        map[key].count += 1;
        map[key].users.push(item.sender);
      }
    });

    return Object.values(map);
  }, [notifications]);

  /* ================= ICONS ================= */

  const getIcon = (type: string) => {
    switch (type) {
      case 'tweet_like':
        return { name: 'heart', color: '#EF4444' };

      case 'tweet_reply':
        return { name: 'chatbubble', color: '#10B981' };

      case 'follow':
        return { name: 'person-add', color: '#2563EB' };

      case 'friend_request':
        return { name: 'person-add-outline', color: '#2563EB' };

      case 'message':
        return { name: 'mail', color: '#7C3AED' };

      default:
        return { name: 'notifications', color: '#6B7280' };
    }
  };

  /* ================= PRESS HANDLER ================= */

  const handlePress = (item: NotificationItem) => {

    if (!item.isRead) {
      dispatch(markNotificationAsRead(item._id));
    }

    switch (item.type) {

      case 'friend_request':
        router.push({
          pathname: '/friend-request-modal',
          params: {
            notificationId: item._id,
            senderId: item.sender?._id
          }
        });
        break;

      case 'tweet_like':
      case 'tweet_reply':
        if (item.relatedTweet) {
          router.push(`/tweet/${item.relatedTweet}`);
        }
        break;

      case 'message':
        if (item.relatedChat) {
          router.push(`/chat/${item.relatedChat}`);
        }
        break;

      case 'room_invite':
        if (item.relatedRoom) {
          router.push(`/room/${item.relatedRoom}`);
        }
        break;

      default:
        break;
    }
  };

  /* ================= SWIPE DELETE ================= */

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => dispatch(deleteNotification(id))}
    >
      <Ionicons name="trash" size={20} color="#FFF" />
    </TouchableOpacity>
  );

  /* ================= RENDER ================= */

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
      </View>

      <FlatList
        data={groupedNotifications}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>
              لا توجد إشعارات
            </Text>
          )
        }
        renderItem={({ item, index }) => {

          const icon = getIcon(item.type);

          return (
            <Animated.View entering={FadeInDown.delay(index * 60)}>

              <Swipeable
                renderRightActions={() =>
                  renderRightActions(item._id)
                }
              >

                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  style={[
                    styles.item,
                    !item.isRead && styles.unread,
                  ]}
                >

                  <View style={styles.iconBox}>
                    <Ionicons
                      name={icon.name as any}
                      size={18}
                      color={icon.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>

                    <Text style={styles.title}>
                      {item.count > 1
                        ? `${item.users[0]?.username} و ${item.count - 1} آخرين`
                        : item.sender?.username}
                    </Text>

                    <Text style={styles.body}>
                      {item.body}
                    </Text>

                    <Text style={styles.time}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>

                  </View>

                  {!item.isRead && <View style={styles.dot} />}

                </TouchableOpacity>

              </Swipeable>

            </Animated.View>
          );
        }}
      />

    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: '#FFF' },

  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  item: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    alignItems: 'center',
  },

  unread: {
    backgroundColor: '#EEF2FF',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
  },

  body: {
    fontSize: 13,
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },

  deleteBtn: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    borderRadius: 14,
    marginBottom: 12,
  },

});
