import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

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
      {pathname !== '/' ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {/* Center */}
      <Text style={[styles.title, { color: theme.text }]}>
        {getTitle()}
      </Text>

      {/* Right */}
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={22} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color={theme.icon} />
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
});
