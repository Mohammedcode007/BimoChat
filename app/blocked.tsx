// import {
//   getBlockedUsers,
//   unblockUser,
// } from '@/redux/slices/friendSlice';
// import { AppDispatch, RootState } from '@/redux/store';
// import { Ionicons } from '@expo/vector-icons';
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   FlatList,
//   Image,
//   Modal,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// export default function BlockedScreen() {

//   const dispatch = useDispatch<AppDispatch>();
//   const { blockedUsers, loading } = useSelector(
//     (state: RootState) => state.friends
//   );

//   const [search, setSearch] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<string | null>(null);

// useEffect(() => {
//   dispatch(getBlockedUsers());
// }, []);



//   const onRefresh = async () => {
//     setRefreshing(true);
//     await dispatch(getBlockedUsers());
//     setRefreshing(false);
//   };

//   const filteredList = useMemo(() => {
//     return blockedUsers.filter(
//       (u) =>
//         u.username.toLowerCase().includes(search.toLowerCase()) ||
//         u.atUsername?.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search, blockedUsers]);

//   const confirmUnblock = (userId: string) => {
//     setSelectedUser(userId);
//   };

//   const handleUnblock = () => {
//     if (selectedUser) {
//       dispatch(unblockUser(selectedUser));
//       setSelectedUser(null);
//     }
//   };

//   /* ================= Skeleton Loader ================= */

//   const renderSkeleton = () => {
//     return (
//       <View>
//         {[1, 2, 3].map((i) => (
//           <View key={i} style={styles.skeletonCard}>
//             <View style={styles.skeletonAvatar} />
//             <View style={styles.skeletonText} />
//           </View>
//         ))}
//       </View>
//     );
//   };

//   /* ================= Swipe Action ================= */

//   const renderRightActions = (id: string) => (
//     <TouchableOpacity
//       style={styles.swipeUnblock}
//       onPress={() => confirmUnblock(id)}
//     >
//       <Ionicons name="lock-open-outline" size={22} color="#FFF" />
//       <Text style={styles.swipeText}>إلغاء</Text>
//     </TouchableOpacity>
//   );

//   return (
//   <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
//     <View style={styles.container}>
//       <Text style={styles.header}>الحسابات المحظورة</Text>

//       <View style={styles.searchBox}>
//         <Ionicons name="search-outline" size={20} color="#777" />
//         <TextInput
//           placeholder="ابحث عن حساب..."
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {loading ? (
//         renderSkeleton()
//       ) : (
//         <FlatList
//           data={filteredList}
//           keyExtractor={(item) => item._id}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//             />
//           }
//           ListEmptyComponent={
//             <Text style={styles.empty}>
//               لا توجد حسابات محظورة
//             </Text>
//           }
//           renderItem={({ item }) => (
//             <Swipeable
//               renderRightActions={() =>
//                 renderRightActions(item._id)
//               }
//             >
//               <View style={styles.card}>

//                 <View style={styles.leftSection}>
//                   <Image
//                     source={{
//                       uri:
//                         item.avatar ||
//                         'https://picsum.photos/200'
//                     }}
//                     style={styles.avatar}
//                   />
//                   <View>
//                     <Text style={styles.name}>
//                       {item.username}
//                     </Text>
//                     {item.atUsername && (
//                       <Text style={styles.username}>
//                         {item.atUsername}
//                       </Text>
//                     )}
//                   </View>
//                 </View>

//                 <TouchableOpacity
//                   style={styles.unblockBtn}
//                   onPress={() =>
//                     confirmUnblock(item._id)
//                   }
//                 >
//                   <Ionicons
//                     name="close-circle-outline"
//                     size={22}
//                     color="#E53935"
//                   />
//                   <Text style={styles.unblockText}>
//                     إلغاء الحظر
//                   </Text>
//                 </TouchableOpacity>

//               </View>
//             </Swipeable>
//           )}
//         />
//       )}

//       {/* ================= Confirmation Modal ================= */}

//       <Modal
//         visible={!!selectedUser}
//         transparent
//         animationType="fade"
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>
//               هل تريد إلغاء الحظر؟
//             </Text>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setSelectedUser(null)}
//               >
//                 <Text style={styles.cancelText}>
//                   إلغاء
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.confirmBtn}
//                 onPress={handleUnblock}
//               >
//                 <Text style={styles.confirmText}>
//                   نعم
//                 </Text>
//               </TouchableOpacity>
//             </View>

//           </View>
//         </View>
//       </Modal>

//     </View>
//   </SafeAreaView>

//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: '#F7F7F7',
//     padding: 16,
//   },

//   header: {
//     fontSize: 24,
//     fontWeight: '900',
//     marginBottom: 14,
//   },
// safeArea: {
//   flex: 1,
//   backgroundColor: '#F7F7F7',
// },

//   searchBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     marginBottom: 16,
//     gap: 8,
//   },

//   input: {
//     flex: 1,
//     fontSize: 15,
//   },

//   card: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },

//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: '700',
//   },

//   username: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 2,
//   },

//   unblockBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },

//   unblockText: {
//     color: '#E53935',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   empty: {
//     textAlign: 'center',
//     marginTop: 40,
//     color: '#9CA3AF',
//     fontSize: 14,
//   },

//   swipeUnblock: {
//     backgroundColor: '#E53935',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 100,
//     borderRadius: 16,
//     marginBottom: 12,
//   },

//   swipeText: {
//     color: '#FFF',
//     fontWeight: '700',
//     marginTop: 4,
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   modalCard: {
//     backgroundColor: '#FFF',
//     width: '85%',
//     borderRadius: 18,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 20,
//     textAlign: 'center',
//   },

//   modalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },

//   cancelBtn: {
//     padding: 10,
//   },

//   cancelText: {
//     fontSize: 15,
//     color: '#6B7280',
//   },

//   confirmBtn: {
//     backgroundColor: '#E53935',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 12,
//   },

//   confirmText: {
//     color: '#FFF',
//     fontWeight: '700',
//   },

//   skeletonCard: {
//     backgroundColor: '#E5E7EB',
//     borderRadius: 16,
//     height: 70,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },

//   skeletonAvatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#D1D5DB',
//     marginRight: 12,
//   },

//   skeletonText: {
//     height: 14,
//     width: '50%',
//     backgroundColor: '#D1D5DB',
//     borderRadius: 6,
//   },

// });

// app/(tabs)/settings/blocked.tsx (مثال)
// ✅ Dark/Light عبر Colors
// ✅ SafeArea + StatusBar
// ✅ تصميم عصري: Search Card + List Cards + Swipe + Modal + Skeleton
// ✅ تحسينات: فلترة آمنة، غلق السوايب/القائمة، Refresh مضبوط

import { Colors } from "@/constants/theme";
import { getBlockedUsers, unblockUser } from "@/redux/slices/friendSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type BlockedUser = {
  _id: string;
  username: string;
  atUsername?: string;
  avatar?: string;
};

export default function BlockedScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { blockedUsers, loading } = useSelector((state: RootState) => state.friends);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // لإغلاق أي Swipe مفتوح عند فتح واحد جديد
  const openSwipeRef = useRef<Swipeable | null>(null);

  useEffect(() => {
    dispatch(getBlockedUsers());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // لو thunk بيرجع promise عادي
      await dispatch(getBlockedUsers() as any);
    } finally {
      setRefreshing(false);
    }
  };

  const list = (blockedUsers || []) as BlockedUser[];

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((u) => {
      const n = String(u?.username || "").toLowerCase();
      const a = String(u?.atUsername || "").toLowerCase();
      return n.includes(q) || a.includes(q);
    });
  }, [search, list]);

  const confirmUnblock = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleUnblock = async () => {
    if (!selectedUser) return;
    try {
      await dispatch(unblockUser(selectedUser) as any);
      setSelectedUser(null);
      openSwipeRef.current?.close();
    } catch {
      setSelectedUser(null);
    }
  };

  /* ================= Skeleton Loader ================= */

  const renderSkeleton = () => {
    return (
      <View style={{ paddingTop: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.skeletonCard,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <View style={[styles.skeletonAvatar, { backgroundColor: theme.separator }]} />
            <View style={{ flex: 1 }}>
              <View style={[styles.skeletonLine, { backgroundColor: theme.separator, width: "62%" }]} />
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.separator, width: "40%", marginTop: 10, height: 10 },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  /* ================= Swipe Action ================= */

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={[styles.swipeUnblock, { backgroundColor: theme.danger }]}
      onPress={() => confirmUnblock(id)}
      activeOpacity={0.9}
    >
      <Ionicons name="lock-open-outline" size={20} color="#FFF" />
      <Text style={styles.swipeText}>إلغاء</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.headerIcon, { backgroundColor: theme.primarySoft as any }]}>
            <Ionicons name="ban-outline" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.header, { color: theme.text }]}>الحسابات المحظورة</Text>
            <Text style={[styles.subHeader, { color: theme.mutedText as any }]}>
              العدد: {filteredList.length}
            </Text>
          </View>
        </View>

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
          <Ionicons name="search-outline" size={18} color={theme.icon} />
          <TextInput
            placeholder="ابحث عن حساب..."
            value={search}
            onChangeText={setSearch}
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.mutedText as any}
          />

          {!!search.trim() && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={10}
              style={[styles.clearBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
            >
              <Ionicons name="close" size={16} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.icon as any}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.surface2 }]}>
                  <Ionicons name="checkmark-circle-outline" size={26} color={theme.success} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد حسابات محظورة</Text>
                <Text style={[styles.emptyText, { color: theme.mutedText as any }]}>
                  عند حظر أي حساب سيظهر هنا ويمكنك إلغاء الحظر.
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Swipeable
                ref={(ref) => {
                  // احتفظ بآخر Swipe مفتوح
                  // ملاحظة: ref هنا بيتغير أثناء render، كفاية لإغلاق السابق عند فتح جديد
                  // سنغلق السابق عند onSwipeableOpen
                }}
                renderRightActions={() => renderRightActions(item._id)}
                onSwipeableOpen={(direction, swipeable) => {
                  // @ts-ignore
                  if (openSwipeRef.current && openSwipeRef.current !== swipeable) {
                    openSwipeRef.current.close();
                  }
                  // @ts-ignore
                  openSwipeRef.current = swipeable;
                }}
              >
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.leftSection}>
                    <View style={[styles.avatarRing, { borderColor: theme.border }]}>
                      <Image
                        source={{
                          uri: item.avatar || `https://i.pravatar.cc/150?u=${item._id}`,
                        }}
                        style={styles.avatar}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                        {item.username}
                      </Text>
                      {!!item.atUsername && (
                        <Text style={[styles.username, { color: theme.mutedText as any }]} numberOfLines={1}>
                          @{item.atUsername}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.unblockBtn, { backgroundColor: theme.primarySoft as any }]}
                    onPress={() => confirmUnblock(item._id)}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="lock-open-outline" size={18} color={theme.danger} />
                    <Text style={[styles.unblockText, { color: theme.danger }]}>إلغاء الحظر</Text>
                  </TouchableOpacity>
                </View>
              </Swipeable>
            )}
          />
        )}

        {/* ================= Confirmation Modal ================= */}
        <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.modalIcon, { backgroundColor: theme.primarySoft as any }]}>
                <Ionicons name="help-circle-outline" size={22} color={theme.primary} />
              </View>

              <Text style={[styles.modalTitle, { color: theme.text }]}>هل تريد إلغاء الحظر؟</Text>
              <Text style={[styles.modalHint, { color: theme.mutedText as any }]}>
                سيصبح المستخدم قادرًا على التفاعل معك مجددًا.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
                  onPress={() => setSelectedUser(null)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.cancelText, { color: theme.text }]}>إلغاء</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: theme.danger }]}
                  onPress={handleUnblock}
                  activeOpacity={0.9}
                >
                  <Text style={styles.confirmText}>نعم، إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { fontSize: 18, fontWeight: "900" },
  subHeader: { marginTop: 2, fontSize: 12, fontWeight: "800" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 0,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },

  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },

  name: { fontSize: 15, fontWeight: "900" },
  username: { fontSize: 12, fontWeight: "800", marginTop: 2 },

  unblockBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unblockText: { fontSize: 13, fontWeight: "900" },

  swipeUnblock: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    borderRadius: 18,
  },
  swipeText: { color: "#FFF", fontWeight: "900", marginTop: 4 },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: "900" },
  emptyText: { marginTop: 6, textAlign: "center", fontSize: 12, fontWeight: "700", lineHeight: 17 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", textAlign: "center" },
  modalHint: { marginTop: 6, fontSize: 12, fontWeight: "700", textAlign: "center" },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "900" },

  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#FFF", fontWeight: "900", fontSize: 14 },

  /* Skeleton */
  skeletonCard: {
    borderRadius: 18,
    height: 78,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  skeletonAvatar: { width: 52, height: 52, borderRadius: 18 },
  skeletonLine: { height: 12, borderRadius: 8 },
});