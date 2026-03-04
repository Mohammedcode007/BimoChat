// import { Colors } from '@/constants/theme';
// import {
//   deleteChat,
//   fetchChats,
//   fetchTotalUnread,
//   setActiveChat,
//   setUnreadFromServer
// } from '@/redux/slices/chatSlice';


// import { AppDispatch, RootState } from '@/redux/store';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';

// import {
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';

// import { useHideTabBarOnScroll } from '@/hooks/useHideTabBarOnScroll';
// import { selectSortedChats } from '@/redux/selectors';
// import { truncateText } from '@/utils/helpFunctions';
// import { useDispatch, useSelector } from 'react-redux';

// export default function ChatListScreen() {

//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
//   const [menuOpen, setMenuOpen] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();

//   useEffect(() => {
//     dispatch(fetchChats());
//     dispatch(fetchTotalUnread());
//   }, []);



//   const onRefresh = async () => {

//     setRefreshing(true);

//     try {
//       await dispatch(fetchChats()).unwrap();
//       await dispatch(fetchTotalUnread()).unwrap();
//     } catch (error) {
//     }

//     setRefreshing(false);
//   };

//   const chats = useSelector(selectSortedChats);
//   const typingUsers = useSelector(
//     (state: RootState) => state.chat.typingUsers
//   );



//   const currentUser = useSelector(
//     (state: RootState) => state.auth.user
//   );

//   const [search, setSearch] = useState('');



//   const filteredChats = chats.filter(chat => {



//     if (!currentUser?._id) {
//       return false;
//     }

//     const other = chat.participants?.find(
//       (p: any) => p?._id !== currentUser._id
//     );



//     if (!other?.username) {
//       return false;
//     }

//     const match = other.username
//       .toLowerCase()
//       .includes(search.toLowerCase());


//     return match;

//   });


//   filteredChats.forEach(c => {
//   });

//   /* ================= Format Time ================= */

//   const formatTime = (date?: string) => {

//     if (!date) return "";

//     const d = new Date(date);
//     const now = new Date();

//     if (d.toDateString() === now.toDateString()) {
//       return d.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     }

//     return d.toLocaleDateString();
//   };

//   /* ================= Format Last Message ================= */

//   const formatLastMessage = (chat: any) => {

//     if (!chat.lastMessage) return "Start chatting...";

//     if (chat.lastMessage.deletedForEveryone)
//       return "Message deleted";

//     if (chat.lastMessage.type === "image")
//       return "📷 Photo";

//     if (chat.lastMessage.type === "audio")
//       return "🎙 Voice message";

//     return chat.lastMessage.content;
//   };

//   /* ================= Open Chat ================= */

//   const openChat = (chatId: string) => {

//     dispatch(setActiveChat(chatId));

//     // تصفير unread محليًا
//     dispatch(setUnreadFromServer({
//       chatId,
//       unreadCount: 0
//     }));

//     // إرسال seen للسيرفر
//     // emitMarkAsSeen(chatId);

//     router.push({
//       pathname: "/chat/[id]",
//       params: { id: chatId }
//     });
//   };
//   const handleDelete = (chatId: string) => {
//     setMenuOpen(null);
//     dispatch(deleteChat(chatId));
//   };

//   /* ================= Render ================= */

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>

//       {/* Search */}

//       <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
//         <Ionicons name="search" size={16} color="#9CA3AF" />
//         <TextInput
//           placeholder="Search chats"
//           value={search}
//           onChangeText={setSearch}
//           style={styles.searchInput}
//           placeholderTextColor="#9CA3AF"
//         />
//       </View>

//       {/* List */}

//       <FlatList
//         data={filteredChats}
//         keyExtractor={(item) => item._id}
//         showsVerticalScrollIndicator={false}
//         refreshing={refreshing}
//           onScrollBeginDrag={onScrollBeginDrag}
//       onScroll={onScroll}
//         onRefresh={onRefresh}
//         extraData={{
//           menuOpen,
//           typingUsers,
//           search,
//           chatsLength: filteredChats.length
//         }}
//         ItemSeparatorComponent={() => (
//           <View style={styles.separator} />
//         )}
//         renderItem={({ item }) => {

//           if (!currentUser?._id) return null;

//           const otherUser = item.participants?.find(
//             (p: any) => p?._id !== currentUser._id
//           );


//           if (!otherUser) return null;

//           const isTyping = (
//             (typingUsers[item._id] || [])
//               .filter((id: string) => id !== currentUser?._id)
//               .length > 0
//           );


//           return (
//             <View style={{ position: 'relative' }}>

//               <TouchableOpacity
//                 style={[styles.card, { backgroundColor: theme.card }]}
//                 onPress={() => {
//                   setMenuOpen(null);
//                   openChat(item._id);
//                 }}
//                 activeOpacity={0.85}
//               >

//                 {/* Avatar */}

//                 <View style={styles.avatarWrapper}>
//                   <Image
//                     source={{
//                       uri:
//                         otherUser.avatar ||
//                         `https://i.pravatar.cc/150?u=${otherUser._id}`,
//                     }}
//                     style={styles.avatar}
//                   />
//                   {otherUser.isOnline && (
//                     <View style={styles.onlineDot} />
//                   )}
//                 </View>

//                 {/* Info */}

//                 <View style={{ flex: 1 }}>

//                   {/* Top Row */}

//                   <View style={styles.row}>

//                     <Text
//                       style={[
//                         styles.name,
//                         {
//                           color:
//                             item.unreadCount > 0
//                               ? theme.text
//                               : '#6B7280'
//                         }
//                       ]}
//                       numberOfLines={1}
//                     >
//                       {truncateText(otherUser.username, 18)}
//                     </Text>

//                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>

//                       <Text style={styles.time}>
//                         {otherUser.isOnline
//                           ? "Online"
//                           : otherUser.lastSeen
//                             ? formatTime(otherUser.lastSeen)
//                             : formatTime(item.updatedAt)
//                         }
//                       </Text>


//                       {/* Three Dots */}

//                       <TouchableOpacity
//                         onPress={(e) => {
//                           e.stopPropagation();
//                           setMenuOpen(
//                             menuOpen === item._id
//                               ? null
//                               : item._id
//                           );
//                         }}
//                         style={{ marginLeft: 8, padding: 4 }}
//                       >
//                         <Ionicons
//                           name="ellipsis-vertical"
//                           size={16}
//                           color="#9CA3AF"
//                         />
//                       </TouchableOpacity>

//                     </View>

//                   </View>

//                   {/* Bottom Row */}

//                   <View style={styles.row}>

//                     <Text
//                       numberOfLines={1}
//                       style={[
//                         styles.lastMessage,
//                         {
//                           fontWeight:
//                             item.unreadCount > 0 ? '600' : '400',
//                           color: isTyping ? '#22C55E' : '#6B7280'
//                         }
//                       ]}
//                     >

//                       {isTyping
//                         ? "typing..."
//                         : truncateText(formatLastMessage(item), 28)}



//                     </Text>

//                     {item.unreadCount > 0 && (
//                       <View style={styles.unreadBadge}>
//                         <Text style={styles.unreadText}>
//                           {item.unreadCount}
//                         </Text>
//                       </View>
//                     )}

//                   </View>

//                 </View>

//               </TouchableOpacity>

//               {/* Dropdown */}

//               {menuOpen === item._id && (
//                 <View style={[styles.dropdown, { backgroundColor: theme.card }]}>
//                   <TouchableOpacity
//                     onPress={() => handleDelete(item._id)}
//                     style={styles.dropdownItem}
//                   >
//                     <Text style={styles.deleteText}>
//                       Delete Chat
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//             </View>
//           );
//         }}
//       />


//     </View>
//   );
// }

// /* ================= Styles ================= */

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },

//   searchBox: {
//     flexDirection: 'row',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginBottom: 14,
//     alignItems: 'center',
//   },

//   searchInput: {
//     marginLeft: 8,
//     flex: 1,
//     fontSize: 14,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//   },


//   avatarWrapper: {
//     width: 56,
//     height: 56,
//     marginRight: 14,
//   },

//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//   },
//   name: {
//     fontSize: 15,
//     fontWeight: '600',
//     maxWidth: '65%',
//   },

//   lastMessage: {
//     fontSize: 13,
//     maxWidth: '70%',
//   },

//   onlineDot: {
//     position: 'absolute',
//     bottom: 4,
//     right: 4,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: '#22C55E',
//     borderWidth: 2,
//     borderColor: '#FFF',
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },



//   separator: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//   },

//   dropdown: {
//     position: 'absolute',
//     top: 55,
//     right: 20,
//     borderRadius: 14,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//     zIndex: 999,
//   },

//   dropdownItem: {
//     paddingVertical: 6,
//   },

//   deleteText: {
//     color: '#EF4444',
//     fontWeight: '600',
//     fontSize: 14,
//   },

//   time: {
//     fontSize: 11,
//     color: '#9CA3AF'
//   },

//   unreadBadge: {
//     backgroundColor: '#4F46E5',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     minWidth: 22,
//     alignItems: 'center'
//   },

//   unreadText: {
//     color: '#FFF',
//     fontSize: 11,
//     fontWeight: '600'
//   }

// });

import { Colors } from '@/constants/theme';
import {
  deleteChat,
  fetchChats,
  fetchTotalUnread,
  setActiveChat,
  setUnreadFromServer,
} from '@/redux/slices/chatSlice';

import { AppDispatch, RootState } from '@/redux/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { useHideTabBarOnScroll } from '@/hooks/useHideTabBarOnScroll';
import { selectSortedChats } from '@/redux/selectors';
import { truncateText } from '@/utils/helpFunctions';
import { useDispatch, useSelector } from 'react-redux';

export default function ChatListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();

  useEffect(() => {
    dispatch(fetchChats());
    dispatch(fetchTotalUnread());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchChats()).unwrap();
      await dispatch(fetchTotalUnread()).unwrap();
    } catch (error) { }
    setRefreshing(false);
  };

  const chats = useSelector(selectSortedChats);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [search, setSearch] = useState('');

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chats.filter((chat: any) => {
      if (!currentUser?._id) return false;

      const other = chat.participants?.find((p: any) => p?._id !== currentUser._id);
      if (!other?.username) return false;

      if (!q) return true;
      return other.username.toLowerCase().includes(q);
    });
  }, [chats, search, currentUser?._id]);

  /* ================= Helpers ================= */

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return d.toLocaleDateString();
  };

  const formatLastMessage = (chat: any) => {
    if (!chat.lastMessage) return 'Start chatting...';
    if (chat.lastMessage.deletedForEveryone) return 'Message deleted';
    if (chat.lastMessage.type === 'image') return '📷 Photo';
    if (chat.lastMessage.type === 'audio') return '🎙 Voice message';
    return chat.lastMessage.content;
  };

  const openChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));

    dispatch(setUnreadFromServer({ chatId, unreadCount: 0 }));

    router.push({
      pathname: '/chat/[id]',
      params: { id: chatId },
    });
  };

  const handleDelete = (chatId: string) => {
    setMenuOpen(null);
    dispatch(deleteChat(chatId));
  };

  /* ================= UI ================= */

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      onStartShouldSetResponderCapture={() => {
        // أي لمسة في أي مكان => اقفل القائمة
        if (menuOpen) setMenuOpen(null);
        return false; // مهم: لا تمنع ضغط العناصر الداخلية
      }}
    >
      {/* Search */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.icon} />
        <TextInput
          placeholder="Search chats"
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: theme.text }]}
          placeholderTextColor={theme.mutedText as any}
        />
        {!!search.trim() && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={10}
            style={[styles.clearBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
          >
            <Ionicons name="close" size={16} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        onRefresh={onRefresh}
        extraData={{
          menuOpen,
          typingUsers,
          search,
          chatsLength: filteredChats.length,
        }}
        contentContainerStyle={{ paddingBottom: 12 }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
        renderItem={({ item }: any) => {
          if (!currentUser?._id) return null;

          const otherUser = item.participants?.find((p: any) => p?._id !== currentUser._id);
          if (!otherUser) return null;

          const isTyping =
            ((typingUsers[item._id] || []) as string[])
              .filter((id: string) => id !== currentUser?._id).length > 0;

          const titleColor =
            item.unreadCount > 0 ? theme.text : theme.mutedText;

          const lastColor = isTyping ? theme.success : theme.mutedText;

          const timeText = otherUser.isOnline
            ? 'Online'
            : otherUser.lastSeen
              ? formatTime(otherUser.lastSeen)
              : formatTime(item.updatedAt);

          const activeMenu = menuOpen === item._id;

          return (
            <View style={{ position: 'relative' }}>
              <Pressable
                onPress={() => {
                  setMenuOpen(null);
                  openChat(item._id);
                }}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    opacity: pressed ? 0.96 : 1,
                  },
                ]}
              >
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri: otherUser.avatar || `https://i.pravatar.cc/150?u=${otherUser._id}`,
                    }}
                    style={styles.avatar}
                  />

                  {/* {otherUser.isOnline && (
                    <View
                      style={[
                        styles.onlineDot,
                        { borderColor: theme.card, backgroundColor: theme.success },
                      ]}
                    />
                  )} */}
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  {/* Top row */}
                  <View style={styles.topRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={[styles.name, { color: titleColor }]}
                        numberOfLines={1}
                      >
                        {truncateText(otherUser.username, 22)}
                      </Text>
                    </View>

                    <View style={styles.topRight}>
                      <Text style={[styles.time, { color: theme.subtleText }]}>
                        {timeText}
                      </Text>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setMenuOpen(activeMenu ? null : item._id);
                        }}
                        style={[styles.moreBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
                        hitSlop={10}
                      >
                        <Ionicons name="ellipsis-vertical" size={16} color={theme.icon} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Bottom row */}
                  <View style={styles.bottomRow}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.lastMessage,
                        {
                          fontWeight: item.unreadCount > 0 ? '700' : '500',
                          color: lastColor,
                        },
                      ]}
                    >
                      {isTyping ? 'typing...' : truncateText(formatLastMessage(item), 38)}
                    </Text>

                    {item.unreadCount > 0 ? (
                      <View
                        style={[
                          styles.unreadBadge,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Text style={[styles.unreadText, { color: theme.primaryText }]}>
                          {item.unreadCount > 99 ? '99+' : item.unreadCount}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.unreadSpacer} />
                    )}
                  </View>
                </View>
              </Pressable>

              {/* Dropdown */}
              {activeMenu && (
                <View
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      shadowColor: '#000',
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    style={styles.dropdownItem}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={[styles.deleteText]}>Delete Chat</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12, // ✅ أقل فراغات
    paddingTop: 10,
  },

  /* Search */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // ✅ أقل فراغات
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },

  avatarWrapper: {
    width: 52,
    height: 52,
    marginRight: 10,
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // ✅ كثافة أعلى
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moreBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '800',
  },

  time: {
    fontSize: 11,
    fontWeight: '700',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  lastMessage: {
    flex: 1,
    fontSize: 13,
  },

  unreadBadge: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '900',
  },
  unreadSpacer: {
    width: 22,
    height: 20,
  },

  separator: {
    height: 8, // ✅ بدل خط كبير: مسافة بسيطة بين الكروت
    backgroundColor: 'transparent',
  },

  dropdown: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    }),
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  deleteText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
  },
});
