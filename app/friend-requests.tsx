import { Ionicons } from '@expo/vector-icons';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FriendRequest = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

const DATA: FriendRequest[] = [
  {
    id: '1',
    name: 'Mohamed Hassan',
    username: '@mohamed',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '2',
    name: 'Ahmed Ali',
    username: '@ahmed',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
];

export default function FriendRequestsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>طلبات الصداقة</Text>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Avatar */}
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.accept}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.reject}>
                <Ionicons name="close" size={18} color="#475569" />
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  username: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accept: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  reject: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
