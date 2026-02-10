import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getTitle = () => {
    if (pathname === '/') return 'Bimo';
    if (pathname.includes('chats')) return 'Chats';
    if (pathname.includes('rooms')) return 'Rooms';
    if (pathname.includes('friends')) return 'Friends';
    if (pathname.includes('tweets')) return 'Tweets';
    if (pathname.includes('settings')) return 'Settings';
    return '';
  };

  // مثال: إخفاء الهيدر في صفحة معينة
  if (pathname.includes('chat/room')) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top }, // 🔥 Safe Area هنا
      ]}
    >
      {/* Left */}
      {pathname !== '/' ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {/* Center */}
      <Text style={styles.title}>{getTitle()}</Text>
      <View style={{ flexDirection: 'row', gap: 14 }}>
     <TouchableOpacity onPress={() =>
          router.push({
            pathname: '/search'
          })

        }>
        <Ionicons name="search-outline" size={22} />

        </TouchableOpacity>
        <TouchableOpacity onPress={() =>
          router.push({
            pathname: '/notifications'
          })

        }>
          <Ionicons name="notifications-outline" size={22} />

        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/store',
            })
          }
        >
          <Ionicons name="storefront-outline" size={22} />
        </TouchableOpacity>

      </View>

      {/* Right */}
      {/* {pathname === '/' ? (
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )} */}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

