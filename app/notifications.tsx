import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = 'message' | 'friend' | 'room' | 'like';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  refId?: string; // chatId | roomId
};

const DATA: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'رسالة جديدة',
    description: 'Ahmed أرسل لك رسالة',
    time: 'الآن',
    read: false,
    refId: '123',
  },
  {
    id: '2',
    type: 'friend',
    title: 'طلب صداقة',
    description: 'Mohamed أرسل طلب صداقة',
    time: 'منذ 10 دقائق',
    read: false,
  },
  {
    id: '3',
    type: 'room',
    title: 'دعوة لغرفة',
    description: 'دعوة للانضمام لغرفة Tech Talk',
    time: 'منذ ساعة',
    read: true,
    refId: 'room-55',
  },
  {
    id: '4',
    type: 'like',
    title: 'تفاعل جديد',
    description: 'Someone liked your message',
    time: 'أمس',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const onPressNotification = (item: Notification) => {
    switch (item.type) {
      case 'message':
        router.push(`/chat/${item.refId}`);
        break;
      case 'friend':
        router.push('/friend-requests');
        break;
      case 'room':
        router.push({
          pathname: '/room-invite-modal',
          params: { roomId: item.refId },
        });
        break;
      case 'like':
        router.push('/interactions');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80)}>
            <TouchableOpacity
              onPress={() => onPressNotification(item)}
              style={[styles.item, !item.read && styles.unread]}
            >
              <View style={styles.icon}>
                <Ionicons name="notifications" size={20} color="#2563EB" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

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
  title: { fontSize: 15, fontWeight: '600' },
  desc: { fontSize: 13, color: '#475569' },
  time: { fontSize: 11, color: '#94A3B8' },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
