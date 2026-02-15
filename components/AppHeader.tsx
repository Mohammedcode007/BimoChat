import { Colors } from '@/constants/theme';
import { RootState } from '@/redux/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function AppHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
const unreadCount = useSelector(
  (state: RootState) => state.notification.unreadCount
);

  const user = useSelector((state: RootState) => state.auth.user);

  const getTitle = () => {
    if (pathname === '/') return 'Bimo';
    if (pathname.includes('chats')) return 'Chats';
    if (pathname.includes('rooms')) return 'Rooms';
    if (pathname.includes('friends')) return 'Friends';
    if (pathname.includes('tweets')) return 'Tweets';
    if (pathname.includes('settings')) return 'Settings';
    return '';
  };

  if (pathname.includes('chat/room')) return null;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.background,
          borderBottomColor: colorScheme === 'dark' ? '#222' : '#EEE',
        },
      ]}
    >
      {/* Left */}
     
   
    
        <TouchableOpacity
          style={styles.userContainer}
          onPress={() => router.push('/profile')}
        >
          <Image
            source={{
              uri:
                user.avatar ||
                'https://i.pravatar.cc/150?img=3',
            }}
            style={styles.avatar}
          />
          <Text style={[styles.username, { color: theme.text }]}>
            {user.username}
          </Text>
        </TouchableOpacity>
    



      {/* Right */}
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={22} color={theme.icon} />
        </TouchableOpacity>

       <TouchableOpacity
  onPress={() => router.push('/notifications')}
  style={styles.notificationContainer}
>
  <Ionicons name="notifications-outline" size={22} color={theme.icon} />

  {unreadCount > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  )}
</TouchableOpacity>


        <TouchableOpacity onPress={() => router.push('/store')}>
          <Ionicons name="storefront-outline" size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  notificationContainer: {
  position: 'relative',
},

badge: {
  position: 'absolute',
  top: -6,
  right: -8,
  backgroundColor: '#FF3B30',
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},

badgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '700',
},

  username: {
    fontSize: 14,
    fontWeight: '600',
  },
});
