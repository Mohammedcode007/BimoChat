
// import { Colors } from '@/constants/theme';
// import {
//   createChat,
//   setActiveChat
// } from '@/redux/slices/chatSlice';

// import {
//   getFriends,
//   removeFriend
// } from '@/redux/slices/friendSlice';

// import {
//   setMessages
// } from '@/redux/slices/messageSlice';

// import { AppDispatch, RootState } from '@/redux/store';
// import api from '@/services/api';
// import { formatLastSeenListFriend } from '@/utils/helpFunctions';

// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useRouter } from 'expo-router';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';

// import { Swipeable } from 'react-native-gesture-handler';
// import { useDispatch, useSelector } from 'react-redux';

// export default function FriendsScreen() {

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { friends, loading } = useSelector(
//     (state: RootState) => state.friends
//   );

//   const [search, setSearch] = useState('');
//   const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   /* ================= Fetch Friends ================= */

//   useEffect(() => {
//     dispatch(getFriends());
//   }, [dispatch]);

//   /* ================= Filter ================= */

//   const filteredFriends = useMemo(() => {
//     return friends.filter((f) =>
//       f.username.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [friends, search]);

//   /* ================= Pull To Refresh ================= */

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await dispatch(getFriends());
//     setRefreshing(false);
//   };

//   /* ================= Remove Friend ================= */

//   const deleteFriendHandler = (id: string) => {
//     dispatch(removeFriend(id));
//   };

//   /* ================= Open Chat ================= */

//   const openChat = async (targetUserId: string) => {

//     if (creatingChatId) return;

//     try {

//       setCreatingChatId(targetUserId);

//       const chat = await dispatch(
//         createChat(targetUserId)
//       ).unwrap();

//       dispatch(setActiveChat(chat._id));
//       // dispatch(fetchChats());

//       const messagesRes = await api.get(
//         `/messages/${chat._id}?page=1`
//       );

//       dispatch(setMessages({
//         chatId: chat._id,
//         messages: messagesRes.data
//       }));

//       router.push(`/chat/${chat._id}`);

//     } catch (error) {
//     } finally {
//       setCreatingChatId(null);
//     }
//   };

//   /* ================= Swipe ================= */

//   const renderRightActions = (item: any) => (
//     <View style={styles.actions}>
//       <TouchableOpacity
//         style={[styles.actionBtn, styles.delete]}
//         onPress={() => deleteFriendHandler(item._id)}
//       >
//         <Ionicons name="trash" size={18} color="#FFF" />
//         <Text style={styles.actionText}>Remove</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   /* ================= Render ================= */

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>

//       {/* 🔍 Top Bar */}

//       <View style={styles.topBar}>

//         <View style={styles.searchBox}>
//           <Ionicons name="search" size={16} color="#9CA3AF" />
//           <TextInput
//             placeholder="Search friends"
//             value={search}
//             onChangeText={setSearch}
//             style={styles.searchInput}
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.addBtn}
//           onPress={() => router.push('/add-friend')}
//         >
//           <Ionicons name="person-add" size={20} color="#FFF" />
//         </TouchableOpacity>

//       </View>

//       {/* 📋 List */}

//       <FlatList
//         data={filteredFriends}
//         keyExtractor={(item) => item._id}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         ListEmptyComponent={
//           loading ? (
//             <ActivityIndicator size="large" />
//           ) : (
//             <View style={styles.empty}>
//               <Ionicons name="people-outline" size={60} color="#CBD5E1" />
//               <Text style={styles.emptyTitle}>
//                 {search ? "No matching friends" : "No friends yet"}
//               </Text>
//             </View>
//           )
//         }
//         renderItem={({ item }) => {

//           const cleanBio = item.bio
//             ? item.bio.replace(/<[^>]+>/g, '')
//             : "No bio available";

//           return (

//             <Swipeable renderRightActions={() => renderRightActions(item)}>

//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 onPress={() => openChat(item._id)}
//               >

//                 <View style={styles.card}>

//                   {/* Avatar */}

//                   <View style={styles.avatarWrapper}>
//                     <Image
//                       source={{
//                         uri:
//                           item.avatar ||
//                           `https://i.pravatar.cc/150?u=${item._id}`,
//                       }}
//                       style={styles.avatar}
//                     />
//                     <View
//                       style={[
//                         styles.statusDot,
//                         item.isOnline
//                           ? styles.onlineDot
//                           : styles.offlineDot
//                       ]}
//                     />

                    
//                   </View>

//                   {/* Info */}

//                   <View style={styles.info}>
//                     <Text
//                       style={[styles.name, { color: theme.text }]}
//                       numberOfLines={1}
//                     >
//                       {item.username}
//                     </Text>

//                     <Text
//                       style={styles.bio}
//                       numberOfLines={1}
//                     >
//                       {cleanBio}
//                     </Text>
//                   </View>

//                   {/* Right Side (Time) */}

//                   <View style={styles.rightSide}>
//                     <Text style={styles.time}>
//                       {item.isOnline
//                         ? "Online"
//                         : formatLastSeenListFriend(item.lastSeen)}
//                     </Text>

//                     {creatingChatId === item._id && (
//                       <ActivityIndicator
//                         size="small"
//                         style={{ marginTop: 6 }}
//                       />
//                     )}
//                   </View>

//                 </View>

//               </TouchableOpacity>

//             </Swipeable>

//           );
//         }}
//       />

//     </View>
//   );
// }

// /* ======================= STYLES ======================= */

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },

//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 12,
//   },

//   searchBox: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     alignItems: 'center',
//   },

//   searchInput: {
//     marginLeft: 8,
//     fontSize: 14,
//     flex: 1,
//   },

//   addBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 14,
//     backgroundColor: '#4F46E5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#E5E7EB',
//   },

//   avatarWrapper: {
//     width: 56,
//     height: 56,
//     marginRight: 12,
//      position: 'relative',
//   },

//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//   },

//   statusDot: {
//     position: 'absolute',
//     bottom: 4,
//     right: 4,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: '#FFF',
//   },

//   onlineDot: {
//     backgroundColor: '#22C55E', // أخضر
//   },

//   offlineDot: {
//     backgroundColor: '#9CA3AF', // رمادي
//   },


//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 15,
//     fontWeight: '600',
//   },

//   bio: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 4,
//   },

//   rightSide: {
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//     minWidth: 80,
//   },

//   time: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },

//   actions: {
//     flexDirection: 'row',
//     height: '100%',
//   },

//   actionBtn: {
//     width: 90,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   delete: {
//     backgroundColor: '#EF4444',
//     borderRadius: 20,
//     marginVertical: 6,
//   },

//   actionText: {
//     color: '#FFF',
//     fontSize: 12,
//     marginTop: 4,
//   },

//   empty: {
//     marginTop: 100,
//     alignItems: 'center',
//   },

//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 12,
//     color: '#374151',
//   },

// });

import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { getFriends, removeFriend } from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";
import { formatLastSeenListFriend } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { friends, loading } = useSelector((state: RootState) => state.friends);

  const [search, setSearch] = useState("");
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const s = useMemo(() => makeStyles(theme, colorScheme === "dark"), [theme, colorScheme]);

  /* ================= Fetch Friends ================= */
  useEffect(() => {
    dispatch(getFriends());
  }, [dispatch]);

  /* ================= Filter ================= */
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => (f.username || "").toLowerCase().includes(q));
  }, [friends, search]);

  /* ================= Pull To Refresh ================= */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getFriends()).unwrap();
    } finally {
      setRefreshing(false);
    }
  };

  /* ================= Remove Friend ================= */
  const deleteFriendHandler = (id: string) => {
    dispatch(removeFriend(id));
  };

  /* ================= Open Chat ================= */
  const openChat = async (targetUserId: string) => {
    if (creatingChatId) return;

    try {
      setCreatingChatId(targetUserId);

      const chat = await dispatch(createChat(targetUserId)).unwrap();
      dispatch(setActiveChat(chat._id));

      const messagesRes = await api.get(`/messages/${chat._id}?page=1`);
      dispatch(
        setMessages({
          chatId: chat._id,
          messages: messagesRes.data,
        })
      );

      router.push(`/chat/${chat._id}`);
    } catch (e) {
      // اختياري: Toast/Alert
    } finally {
      setCreatingChatId(null);
    }
  };

  /* ================= Swipe Right Action ================= */
  const renderRightActions = (item: any) => (
    <View style={s.actionsWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={s.deleteBtn}
        onPress={() => deleteFriendHandler(item._id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={s.deleteText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      {/* ===== Compact Top Bar (Dense) ===== */}
      <View style={s.topBar}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={16} color={theme.icon} />
          <TextInput
            placeholder="Search friends"
            value={search}
            onChangeText={setSearch}
            style={s.searchInput}
            placeholderTextColor={theme.mutedText}
            autoCorrect={false}
            returnKeyType="search"
          />
          {!!search.trim() && (
            <TouchableOpacity onPress={() => setSearch("")} style={s.clearBtn} hitSlop={10}>
              <Ionicons name="close" size={16} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={s.addBtn}
          onPress={() => router.push("/add-friend")}
        >
          <Ionicons name="person-add" size={20} color={theme.primaryText} />
        </TouchableOpacity>
      </View>

      {/* ===== List ===== */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
           onScrollBeginDrag={onScrollBeginDrag}
      onScroll={onScroll}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <View style={s.centerPad}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Ionicons name="people-outline" size={26} color={theme.icon} />
              </View>
              <Text style={s.emptyTitle}>
                {search.trim() ? "No matching friends" : "No friends yet"}
              </Text>
              <Text style={s.emptySub}>
                {search.trim()
                  ? "Try another name."
                  : "Add friends to start chatting instantly."}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/add-friend")}
                style={s.emptyCta}
              >
                <Ionicons name="person-add-outline" size={18} color={theme.primaryText} />
                <Text style={s.emptyCtaText}>Add friend</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => {
          const cleanBio = item.bio ? String(item.bio).replace(/<[^>]+>/g, "") : "";

          return (
            <Swipeable
              overshootRight={false}
              renderRightActions={() => renderRightActions(item)}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openChat(item._id)}
                style={s.rowPress}
              >
                <View style={s.row}>
                  {/* Avatar */}
                  <View style={s.avatarWrap}>
                    <Image
                      source={{
                        uri: item.avatar || `https://i.pravatar.cc/150?u=${item._id}`,
                      }}
                      style={s.avatar}
                    />
                    <View
                      style={[
                        s.statusDot,
                        item.isOnline ? s.onlineDot : s.offlineDot,
                      ]}
                    />
                  </View>

                  {/* Info */}
                  <View style={s.info}>
                    <View style={s.nameLine}>
                      <Text style={s.name} numberOfLines={1}>
                        {item.username}
                      </Text>
                      {!!item.atUsername && (
                        <Text style={s.handle} numberOfLines={1}>
                          {item.atUsername}
                        </Text>
                      )}
                    </View>

                    <Text style={s.bio} numberOfLines={1}>
                      {cleanBio || "No bio"}
                    </Text>
                  </View>

                  {/* Right */}
                  <View style={s.right}>
                    <View
                      style={[
                        s.pill,
                        item.isOnline ? s.pillOnline : s.pillOffline,
                      ]}
                    >
                      <Text style={s.pillText}>
                        {item.isOnline ? "Online" : "Last seen"}
                      </Text>
                    </View>

                    <Text style={s.time} numberOfLines={1}>
                      {item.isOnline ? "Now" : formatLastSeenListFriend(item.lastSeen)}
                    </Text>

                    {creatingChatId === item._id && (
                      <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 6 }} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />
    </View>
  );
}

/* ======================= STYLES ======================= */

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 12, // أقل لتكون القائمة "مليانة" بصريًا
      paddingTop: 10,
    },

    /* Top Bar (compact) */
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 42, // أقل
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.16 : 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 1 },
      }),
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      fontWeight: "700",
    },
    clearBtn: {
      width: 28,
      height: 28,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    addBtn: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.22 : 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 2 },
      }),
    },

    /* Rows (dense) */
    rowPress: { borderRadius: 16, overflow: "hidden" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10, // أقل مسافة
      paddingHorizontal: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
    },

    sep: { height: 8 }, // فصل بسيط بدون فراغات كبيرة

    avatarWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      marginRight: 10,
      position: "relative",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 15,
      backgroundColor: theme.surface2,
    },

    statusDot: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.background,
    },
    onlineDot: { backgroundColor: theme.success ?? "#22C55E" },
    offlineDot: { backgroundColor: theme.mutedText ?? "#9CA3AF" },

    info: { flex: 1, paddingRight: 10 },
    nameLine: { flexDirection: "row", alignItems: "center", gap: 8 },
    name: { fontSize: 14, fontWeight: "900", color: theme.text, maxWidth: 170 },
    handle: { fontSize: 12, fontWeight: "800", color: theme.mutedText, maxWidth: 120 },
    bio: { marginTop: 3, fontSize: 12, fontWeight: "700", color: theme.mutedText },

    right: { alignItems: "flex-end", justifyContent: "center", minWidth: 86 },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 4,
    },
    pillOnline: { backgroundColor: theme.primarySoft },
    pillOffline: { backgroundColor: theme.surface2 },
    pillText: { fontSize: 10, fontWeight: "900", color: theme.text },

    time: { fontSize: 11, fontWeight: "800", color: theme.mutedText },

    /* Swipe Actions */
    actionsWrap: {
      justifyContent: "center",
      alignItems: "flex-end",
      paddingLeft: 10,
    },
    deleteBtn: {
      width: 92,
      height: "88%",
      borderRadius: 16,
      backgroundColor: theme.danger ?? "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
    },
    deleteText: { color: "#fff", fontSize: 12, fontWeight: "900" },

    /* Empty */
    centerPad: { paddingTop: 60 },
    empty: {
      marginTop: 70,
      alignItems: "center",
      paddingHorizontal: 16,
    },
    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "center",
      marginBottom: 14,
    },
    emptyCta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    emptyCtaText: { color: theme.primaryText, fontWeight: "900" },
  });
}