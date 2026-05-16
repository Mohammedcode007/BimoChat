import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RoomInvite = {
  id: string;
  roomName: string;
  invitedBy: string;
  time: string;
};

const DATA: RoomInvite[] = [
  {
    id: 'room-1',
    roomName: 'Tech Talk',
    invitedBy: 'Ahmed',
    time: 'منذ 5 دقائق',
  },
  {
    id: 'room-2',
    roomName: 'Design Lovers',
    invitedBy: 'Mohamed',
    time: 'منذ ساعة',
  },
];

export default function RoomInviteModal() {
  const router = useRouter();

  const joinRoom = (roomId: string) => {
    // router.replace(`/rooms/${roomId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>دعوات الغرف</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {/* Icon */}
            <View style={styles.iconWrap}>
              <Ionicons name="people" size={22} color="#2563EB" />
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.roomName}>{item.roomName}</Text>
              <Text style={styles.meta}>
                بواسطة <Text style={styles.bold}>{item.invitedBy}</Text> • {item.time}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.join}
                onPress={() => joinRoom(item.id)}
              >
                <Text style={styles.joinText}>دخول</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  roomName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  meta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  bold: {
    fontWeight: '600',
    color: '#0F172A',
  },

  actions: {
    alignItems: 'flex-end',
  },

  join: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },

  joinText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
