

// import { Colors } from '@/constants/theme';
// import {
//   toggleFollow
// } from '@/redux/slices/followSlice';
// import {
//   deleteTweet,
//   getFollowingFeed,
//   getForYouFeed,
//   toggleLike,
//   toggleRetweet
// } from '@/redux/slices/tweetSlice';
// import { AppDispatch, RootState } from '@/redux/store';
// import { timeAgo } from '@/utils/helpFunctions';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { ResizeMode, Video } from 'expo-av';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';
// import { Swipeable } from 'react-native-gesture-handler';
// import { useDispatch, useSelector } from 'react-redux';
// const renderTweetText = (text: string) => {

//   if (!text) return null;

//   const regex = /(@[\w_]+|#[\w_]+)/g;
//   const parts = text.split(regex);

//   return parts.map((part, index) => {

//     if (/^@[\w_]+$/.test(part)) {
//       return (
//         <Text key={index} style={styles.mention}>
//           {part}
//         </Text>
//       );
//     }

//     if (/^#[\w_]+$/.test(part)) {
//       return (
//         <Text key={index} style={styles.hashtag}>
//           {part}
//         </Text>
//       );
//     }

//     return (
//       <Text key={index} style={styles.normalText}>
//         {part}
//       </Text>
//     );
//   });
// };
// type BadgeKey = string;

// const BADGE_META: Record<
//   BadgeKey,
//   { label?: string; iconType?: "emoji" | "ion"; icon?: string; bg: string; fg: string }
// > = {
//   gold: { label: "GOLD", iconType: "emoji", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
//   blue: { label: "", iconType: "ion", icon: "checkmark-circle", bg: "transparent", fg: "#1DA1F2" },
//   business: { label: "BUSINESS", iconType: "emoji", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },

//   vip: { label: "VIP", iconType: "emoji", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
//   pro: { label: "PRO", iconType: "emoji", icon: "⚡", bg: "#DCFCE7", fg: "#166534" },
// };

// function UserBadges({ author }: { author: any }) {
//   // ✅ أولوية العرض: display* ثم activeCustomization ثم badges
//   const badges: string[] =
//     author?.displayBadges ??
//     author?.activeCustomization?.badges ??
//     author?.badges ??
//     [];

//   const verificationType: string =
//     author?.displayVerificationType ??
//     author?.activeCustomization?.verificationType ??
//     author?.verificationType ??
//     "none";

//   // ✅ دمج verificationType كبادج (لو ليس none)
//   const merged: string[] = [
//     ...(verificationType && verificationType !== "none" ? [verificationType] : []),
//     ...badges,
//   ];

//   // ✅ إزالة التكرار + فلترة غير المعروف
//   const unique = Array.from(new Set(merged)).filter((k) => BADGE_META[k]);

//   if (!unique.length) return null;

//   return (
//     <View style={styles.badgesWrap}>
//       {unique.map((key) => {
//         const meta = BADGE_META[key];

//         // 🔵 Blue verification: أيقونة فقط بدون خلفية
//         if (key === "blue") {
//           return (
//             <Ionicons
//               key={key}
//               name={meta.icon as any}
//               size={14}
//               color={meta.fg}
//               style={{ marginLeft: 6 }}
//             />
//           );
//         }

//         return (
//           <View
//             key={key}
//             style={[
//               styles.badgePill,
//               { backgroundColor: meta.bg }
//             ]}
//           >
//             {meta.iconType === "ion" && meta.icon ? (
//               <Ionicons
//                 name={meta.icon as any}
//                 size={12}
//                 color={meta.fg}
//                 style={{ marginRight: meta.label ? 4 : 0 }}
//               />
//             ) : meta.icon ? (
//               <Text style={{ marginRight: meta.label ? 4 : 0 }}>
//                 {meta.icon}
//               </Text>
//             ) : null}

//             {meta.label ? (
//               <Text style={[styles.badgeText, { color: meta.fg }]}>
//                 {meta.label}
//               </Text>
//             ) : null}
//           </View>
//         );
//       })}
//     </View>
//   );
// }
// export default function TweetsScreen() {

//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const [selectedUser, setSelectedUser] = useState<any>(null);
//   const [showSheet, setShowSheet] = useState(false);

//   const openSheet = (author: any) => {
//     setSelectedUser(author);
//     setShowSheet(true);
//   };

//   const closeSheet = () => {
//     setShowSheet(false);
//     setSelectedUser(null);
//   };

//   const { following, forYou, loading } =
//     useSelector((state: RootState) => state.tweets);

//   const { followingMap } =
//     useSelector((state: RootState) => state.follow);

//   const { user } =
//     useSelector((state: RootState) => state.auth);

//   const colorScheme = useColorScheme();
//   const theme =
//     Colors[colorScheme === 'dark' ? 'dark' : 'light'];

//   const [activeTab, setActiveTab] =
//     useState<'following' | 'foryou'>('following');

//   const [refreshing, setRefreshing] =
//     useState(false);

//   const [actionLoading, setActionLoading] =
//     useState<string | null>(null);

//   const rawFeed =
//     activeTab === 'following'
//       ? following
//       : forYou;

//   /* ================= INITIAL LOAD ================= */

//   useEffect(() => {
//     dispatch(getFollowingFeed({ page: 1 }));
//     dispatch(getForYouFeed({ page: 1 }));
//   }, []);

//   /* ================= REFRESH ================= */

//   const handleRefresh = async () => {
//     setRefreshing(true);

//     if (activeTab === 'following') {
//       await dispatch(getFollowingFeed({ page: 1 }));
//     } else {
//       await dispatch(getForYouFeed({ page: 1 }));
//     }

//     setRefreshing(false);
//   };

//   /* ================= LOAD MORE ================= */

//   const handleLoadMore = () => {
//     if (loading) return;

//     if (activeTab === 'following') {
//       dispatch(getFollowingFeed({ page: 2 }));
//     } else {
//       dispatch(getForYouFeed({ page: 2 }));
//     }
//   };

//   /* ================= OPEN TWEET ================= */

//   const openTweet = (tweet: any) => {
//     router.push({
//       pathname: '/tweet/[id]',
//       params: { id: tweet._id },
//     });
//   };

//   /* ================= MEDIA HELPER ================= */

//   const isVideo = (url: string) => {
//     return /\.(mp4|mov|m4v|webm)$/i.test(url);
//   };
//   const isValidUrl = (url?: string) => {
//     if (!url) return false;
//     if (typeof url !== 'string') return false;
//     if (!url.startsWith('http')) return false;
//     return true;
//   };
//   const uniqueFeed = Array.from(
//     new Map(rawFeed.map(item => [item._id, item])).values()
//   );

//   /* ================= RENDER ================= */

//   return (
//     <View style={[
//       styles.container,
//       { backgroundColor: theme.background }
//     ]}>

//       {/* ===== Tabs ===== */}

//       <View style={styles.tabs}>
//         <TabButton
//           title="Following"
//           active={activeTab === 'following'}
//           onPress={() => {
//             setActiveTab('following');
//             dispatch(getFollowingFeed({ page: 1 }));
//           }}
//         />
//         <TabButton
//           title="For You"
//           active={activeTab === 'foryou'}
//           onPress={() => {
//             setActiveTab('foryou');
//             dispatch(getForYouFeed({ page: 1 }));
//           }}
//         />
//       </View>

//       {/* ===== Feed ===== */}

//       <FlatList
//         data={uniqueFeed}
//         keyExtractor={(item) => item._id}

//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.5}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//           />
//         }
//         ListFooterComponent={
//           loading ? (
//             <ActivityIndicator style={{ margin: 20 }} />
//           ) : null
//         }
//         renderItem={({ item }) => {

//           const isOwnTweet =
//             item.author._id === user?._id;

//           const isFollowing =
//             followingMap?.[item.author._id] ??
//             item.author.isFollowing ??
//             false;

//           return (
//             <Swipeable
//               renderRightActions={() =>
//                 isOwnTweet ? (
//                   <TouchableOpacity
//                     style={styles.deleteBtn}
//                     onPress={async () => {
//                       setActionLoading(`delete-${item._id}`);
//                       await dispatch(deleteTweet(item._id));
//                       setActionLoading(null);
//                     }}
//                   >
//                     {actionLoading === `delete-${item._id}` ? (
//                       <ActivityIndicator color="#FFF" />
//                     ) : (
//                       <Ionicons
//                         name="trash"
//                         size={18}
//                         color="#FFF"
//                       />
//                     )}
//                   </TouchableOpacity>
//                 ) : null
//               }
//             >
//               <View style={styles.tweetCard}>

//                <TouchableOpacity
//   onPress={() =>
//     router.push({
//       pathname: '/profile',
//       params: { userId: item.author._id }
//     })
//   }
// >
//   <Image
//     source={
//       isValidUrl(item.author.avatar)
//         ? { uri: item.author.avatar }
//         : { uri: 'https://i.pravatar.cc/150?img=3' }
//     }
//     style={styles.avatar}
//   />
// </TouchableOpacity>



//                 <View style={{ flex: 1 }}>

//                   <View style={styles.row}>

//                     <View style={{ flex: 1 }}>
//                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
//   <Text style={styles.name}>
//     {item.author.username}
//   </Text>

//   {/* ✅ البادجات بجانب الاسم */}
//   <UserBadges author={item.author} />

//   <Text style={styles.dot}> • </Text>

//   <Text style={styles.time}>
//     {timeAgo(item.createdAt)}
//   </Text>
// </View>

//                       <Text style={styles.username}>
//                         {item.author.atUsername}
//                       </Text>

//                     </View>

//                     {!isOwnTweet && (
//                       <TouchableOpacity
//                         style={[
//                           styles.followBtn,
//                           {
//                             backgroundColor:
//                               isFollowing
//                                 ? '#374151'
//                                 : '#1D9BF0',
//                           }
//                         ]}
//                         onPress={async () => {
//                           setActionLoading(`follow-${item.author._id}`);
//                           await dispatch(
//                             toggleFollow(item.author._id)
//                           );
//                           setActionLoading(null);
//                         }}
//                       >
//                         {actionLoading === `follow-${item.author._id}` ? (
//                           <ActivityIndicator color="#FFF" size="small" />
//                         ) : (
//                           <Text style={{ color: '#FFF', fontSize: 12 }}>
//                             {isFollowing
//                               ? 'Following'
//                               : 'Follow'}
//                           </Text>
//                         )}
//                       </TouchableOpacity>
//                     )}
//                     <TouchableOpacity
//                       onPress={() => openSheet(item.author)}
//                       style={{ marginLeft: 10 }}
//                     >
//                       <Ionicons
//                         name="ellipsis-horizontal"
//                         size={20}
//                         color="#6B7280"
//                       />
//                     </TouchableOpacity>

//                   </View>

//                   <TouchableOpacity
//                     activeOpacity={0.9}
//                     onPress={() => openTweet(item)}
//                   >
//                     <Text style={styles.text}>
//                       {renderTweetText(item.content)}
//                     </Text>

//                   </TouchableOpacity>

//                   {/* ===== MEDIA ARRAY SUPPORT ===== */}

//                   {item.media &&
//                     item.media.length > 0 && (
//                       <View style={{ marginTop: 10 }}>
//                         {item.media.map((mediaItem: any, index: number) => {

//                           const url = mediaItem.url;

//                           if (!isValidUrl(url)) return null;

//                           if (mediaItem.type === "video") {
//                             return (
//                               <Video
//                                 key={index}
//                                 source={{ uri: url }}
//                                 style={styles.media}
//                                 useNativeControls
//                                 resizeMode={ResizeMode.CONTAIN}
//                                 isLooping
//                               />
//                             );
//                           }

//                           return (
//                             <Image
//                               key={index}
//                               source={{ uri: url }}
//                               style={styles.media}
//                             />
//                           );
//                         })}
//                       </View>
//                     )}



//                   {/* ===== Actions ===== */}

//                   <View style={styles.actions}>

//                     {/* ===== LIKE ===== */}
//                     <Action
//                       loading={actionLoading === `like-${item._id}`}
//                       icon={
//                         item.isLiked
//                           ? 'heart'
//                           : 'heart-outline'
//                       }
//                       value={item.likesCount}
//                       onPress={async () => {
//                         setActionLoading(`like-${item._id}`);
//                         await dispatch(toggleLike(item._id));
//                         setActionLoading(null);
//                       }}
//                     />

//                     {/* ===== RETWEET ===== */}
//                     <Action
//                       loading={actionLoading === `retweet-${item._id}`}
//                       icon="repeat-outline"
//                       value={item.retweetsCount}
//                       onPress={async () => {
//                         setActionLoading(`retweet-${item._id}`);
//                         await dispatch(toggleRetweet(item._id));
//                         setActionLoading(null);
//                       }}
//                     />

//                     {/* ===== COMMENT ===== */}
//                     <Action
//                       loading={false}
//                       icon="chatbubble-outline"
//                       value={item.repliesCount}
//                       onPress={() => openTweet(item)}
//                     />

//                   </View>


//                 </View>
//               </View>
//             </Swipeable>
//           );
//         }}
//       />
//       {/* ===== User Bottom Sheet ===== */}

//       {showSheet && (
//         <View style={styles.overlay}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSheet}
//           />

//           <View style={styles.sheet}>
//             {selectedUser && (
//               <>
//                 <Text style={styles.sheetTitle}>
//                   @{selectedUser.atUsername}
//                 </Text>

//                 <TouchableOpacity
//                   style={styles.sheetItem}
//                   onPress={async () => {
//                     await dispatch(
//                       toggleFollow(selectedUser._id)
//                     );
//                     closeSheet();
//                   }}
//                 >
//                   <Ionicons
//                     name="person-remove-outline"
//                     size={20}
//                     color="#EF4444"
//                   />
//                   <Text style={styles.sheetText}>
//                     Unfollow
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.sheetItem}
//                 >
//                   <Ionicons
//                     name="ban-outline"
//                     size={20}
//                     color="#EF4444"
//                   />
//                   <Text style={styles.sheetText}>
//                     Block
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.sheetItem}
//                 >
//                   <Ionicons
//                     name="flag-outline"
//                     size={20}
//                     color="#F59E0B"
//                   />
//                   <Text style={styles.sheetText}>
//                     Report
//                   </Text>
//                 </TouchableOpacity>

//               </>
//             )}
//           </View>
//         </View>
//       )}
//       {/* ===== Floating Create Tweet Button ===== */}

//       <TouchableOpacity
//         style={styles.fab}
//         activeOpacity={0.8}
//         onPress={() => router.push('/create-tweet')}
//       >
//         <Ionicons name="create-outline" size={26} color="#FFF" />
//       </TouchableOpacity>

//     </View>
//   );
// }

// /* ===== Components ===== */

// function Action({ icon, value, onPress, loading }: any) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={styles.actionItem}
//       disabled={loading}
//     >
//       {loading ? (
//         <ActivityIndicator size="small" />
//       ) : (
//         <>
//           <Ionicons
//             name={icon}
//             size={18}
//             color="#6B7280"
//           />
//           <Text style={{ fontSize: 12, marginLeft: 4 }}>
//             {value}
//           </Text>
//         </>
//       )}
//     </TouchableOpacity>
//   );
// }

// function TabButton({ title, active, onPress }: any) {
//   return (
//     <TouchableOpacity onPress={onPress}>
//       <Text style={{
//         fontWeight: '700',
//         fontSize: 16,
//         color: active
//           ? '#1D9BF0'
//           : '#6B7280'
//       }}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// /* ===== Styles ===== */

// const styles = StyleSheet.create({
//   container: { flex: 1 },

//   tabs: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 10,
//   },

//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   tweetCard: {
//     flexDirection: 'row',
//     padding: 14,
//     borderBottomWidth: 0.5,
//     borderColor: '#E5E7EB',
//   },

//   avatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     marginRight: 10,
//   },

//   name: { fontWeight: '700' },

//   username: {
//     fontSize: 12,
//     color: '#6B7280',
//   },

//   text: {
//     marginTop: 6,
//     fontSize: 14,
//   },
//   normalText: {
//     color: '#000',
//   },

//   mention: {
//     color: '#1D9BF0',
//     fontWeight: '600',
//   },

//   hashtag: {
//     color: '#F59E0B',
//     fontWeight: '600',
//   },

//   media: {
//     width: '100%',
//     height: 220,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   time: {
//     fontSize: 12,
//     color: '#6B7280',
//   },

//   dot: {
//     marginHorizontal: 6,
//     color: '#6B7280',
//     fontSize: 12,
//   },

//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   fab: {
//     position: 'absolute',
//     right: 20,
//     bottom: 30,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#1D9BF0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 3 },
//   },

//   sheet: {
//     backgroundColor: '#FFF',
//     padding: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },

//   sheetTitle: {
//     fontWeight: '700',
//     fontSize: 16,
//     marginBottom: 20,
//   },

//   sheetItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//   },

//   sheetText: {
//     marginLeft: 10,
//     fontSize: 14,
//   },


//   actions: {
//     flexDirection: 'row',
//     marginTop: 10,
//   },

//   actionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 15,
//   },

//   followBtn: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
// badgesWrap: {
//   flexDirection: "row",
//   alignItems: "center",
//   marginLeft: 6,
// },

// badgePill: {
//   flexDirection: "row",
//   alignItems: "center",
//   paddingHorizontal: 6,
//   paddingVertical: 2,
//   borderRadius: 999,
//   marginLeft: 6,
// },

// badgeText: {
//   fontSize: 10,
//   fontWeight: "700",
// },
//   deleteBtn: {
//     backgroundColor: '#EF4444',
//     justifyContent: 'center',
//     padding: 20,
//   },
// });
import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { toggleFollow } from "@/redux/slices/followSlice";
import {
  deleteTweet,
  getFollowingFeed,
  getForYouFeed,
  toggleLike,
  toggleRetweet,
} from "@/redux/slices/tweetSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { timeAgo } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
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
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

/* ================= Helpers ================= */

const renderTweetText = (text: string, s: any) => {
  if (!text) return null;

  const regex = /(@[\w_]+|#[\w_]+)/g;
  const parts = text.split(regex);

  return (
    <Text style={s.text}>
      {parts.map((part, index) => {
        if (/^@[\w_]+$/.test(part)) {
          return (
            <Text key={index} style={s.mention}>
              {part}
            </Text>
          );
        }
        if (/^#[\w_]+$/.test(part)) {
          return (
            <Text key={index} style={s.hashtag}>
              {part}
            </Text>
          );
        }
        return (
          <Text key={index} style={s.normalText}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

const isValidUrl = (url?: string) => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  return url.startsWith("http");
};

/* ================= Badges ================= */

type BadgeKey = string;

const BADGE_META: Record<
  BadgeKey,
  { label?: string; iconType?: "emoji" | "ion"; icon?: string; bg: string; fg: string }
> = {
  gold: { label: "GOLD", iconType: "emoji", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
  blue: { label: "", iconType: "ion", icon: "checkmark-circle", bg: "transparent", fg: "#1DA1F2" },
  business: { label: "BUSINESS", iconType: "emoji", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },
  vip: { label: "VIP", iconType: "emoji", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
  pro: { label: "PRO", iconType: "emoji", icon: "⚡", bg: "#DCFCE7", fg: "#166534" },
};

function UserBadges({ author, s }: { author: any; s: any }) {
  const badges: string[] =
    author?.displayBadges ?? author?.activeCustomization?.badges ?? author?.badges ?? [];

  const verificationType: string =
    author?.displayVerificationType ??
    author?.activeCustomization?.verificationType ??
    author?.verificationType ??
    "none";

  const merged: string[] = [
    ...(verificationType && verificationType !== "none" ? [verificationType] : []),
    ...badges,
  ];

  const unique = Array.from(new Set(merged)).filter((k) => BADGE_META[k]);
  if (!unique.length) return null;

  return (
    <View style={s.badgesWrap}>
      {unique.map((key) => {
        const meta = BADGE_META[key];

        if (key === "blue") {
          return (
            <Ionicons
              key={key}
              name={meta.icon as any}
              size={14}
              color={meta.fg}
              style={{ marginLeft: 6 }}
            />
          );
        }

        return (
          <View key={key} style={[s.badgePill, { backgroundColor: meta.bg }]}>
            {meta.iconType === "ion" && meta.icon ? (
              <Ionicons
                name={meta.icon as any}
                size={12}
                color={meta.fg}
                style={{ marginRight: meta.label ? 4 : 0 }}
              />
            ) : meta.icon ? (
              <Text style={{ marginRight: meta.label ? 4 : 0 }}>{meta.icon}</Text>
            ) : null}

            {meta.label ? <Text style={[s.badgeText, { color: meta.fg }]}>{meta.label}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

/* ================= Screen ================= */

export default function TweetsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);

  const { following, forYou, loading } = useSelector((state: RootState) => state.tweets);
  const { followingMap } = useSelector((state: RootState) => state.follow);
  const { user } = useSelector((state: RootState) => state.auth);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [activeTab, setActiveTab] = useState<"following" | "foryou">("following");
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const rawFeed = activeTab === "following" ? following : forYou;

  const uniqueFeed = useMemo(
    () => Array.from(new Map((rawFeed || []).map((item: any) => [item._id, item])).values()),
    [rawFeed]
  );

  useEffect(() => {
    dispatch(getFollowingFeed({ page: 1 }));
    dispatch(getForYouFeed({ page: 1 }));
  }, [dispatch]);

  const openSheet = (author: any) => {
    setSelectedUser(author);
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setSelectedUser(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "following") await dispatch(getFollowingFeed({ page: 1 }));
    else await dispatch(getForYouFeed({ page: 1 }));
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (loading) return;
    // ملاحظة: هنا أنت تستخدم page=2 ثابتة سابقًا. اتركها كما هي، أو اربطها بـ pagination عندك.
    if (activeTab === "following") dispatch(getFollowingFeed({ page: 2 }));
    else dispatch(getForYouFeed({ page: 2 }));
  };

  const openTweet = (tweet: any) => {
    router.push({ pathname: "/tweet/[id]", params: { id: tweet._id } });
  };

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      {/* ===== Tabs (Modern Pills) ===== */}
      <View style={s.tabsWrap}>
        <View style={s.tabsCard}>
          <TabButton
            title="Following"
            active={activeTab === "following"}
            onPress={() => {
              setActiveTab("following");
              dispatch(getFollowingFeed({ page: 1 }));
            }}
            s={s}
          />
          <TabButton
            title="For You"
            active={activeTab === "foryou"}
            onPress={() => {
              setActiveTab("foryou");
              dispatch(getForYouFeed({ page: 1 }));
            }}
            s={s}
          />
        </View>
      </View>

      {/* ===== Feed ===== */}
      <FlatList
        data={uniqueFeed}
        keyExtractor={(item: any, index: number) => {
          const id = item?._id ?? item?.id ?? "item";
          return `${String(id)}-${index}`; // ✅ يضمن عدم تكرار الـ key
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={theme.tint} /> : null}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }: any) => {
          const isOwnTweet = item?.author?._id === user?._id;

          const isFollowing =
            followingMap?.[item?.author?._id] ?? item?.author?.isFollowing ?? false;

          const avatarUri = isValidUrl(item?.author?.avatar)
            ? item.author.avatar
            : "https://i.pravatar.cc/150?img=3";

          return (
            <Swipeable
              renderRightActions={() =>
                isOwnTweet ? (
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={async () => {
                      setActionLoading(`delete-${item._id}`);
                      await dispatch(deleteTweet(item._id));
                      setActionLoading(null);
                    }}
                    activeOpacity={0.9}
                  >
                    {actionLoading === `delete-${item._id}` ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Ionicons name="trash" size={18} color="#FFF" />
                    )}
                    <Text style={s.deleteText}>Delete</Text>
                  </TouchableOpacity>
                ) : null
              }
            >
              <View style={s.card}>
                {/* Avatar */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/profile/[id]",
                      params: { id: item.author._id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: avatarUri }} style={s.avatar} />
                </TouchableOpacity>

                {/* Body */}
                <View style={{ flex: 1 }}>
                  {/* Header row */}
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <View style={s.nameRow}>
                        <Text style={s.name} numberOfLines={1}>
                          {item.author.username}
                        </Text>

                        <UserBadges author={item.author} s={s} />

                        <Text style={s.dot}>•</Text>
                        <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
                      </View>

                      <Text style={s.handle} numberOfLines={1}>
                        {item.author.atUsername}
                      </Text>
                    </View>

                    {!isOwnTweet && (
                      <TouchableOpacity
                        style={[s.followBtn, isFollowing ? s.followBtnOn : s.followBtnOff]}
                        onPress={async () => {
                          setActionLoading(`follow-${item.author._id}`);
                          await dispatch(toggleFollow(item.author._id));
                          setActionLoading(null);
                        }}
                        activeOpacity={0.9}
                      >
                        {actionLoading === `follow-${item.author._id}` ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={s.followText}>{isFollowing ? "Following" : "Follow"}</Text>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => openSheet(item.author)}
                      style={s.moreBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color={theme.icon} />
                    </TouchableOpacity>
                  </View>

                  {/* Content */}
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openTweet(item)}>
                    {renderTweetText(item.content, s)}
                  </TouchableOpacity>

                  {/* Media */}
                  {Array.isArray(item.media) && item.media.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      {item.media.map((mediaItem: any, index: number) => {
                        const url = mediaItem?.url;
                        if (!isValidUrl(url)) return null;

                        if (mediaItem.type === "video") {
                          return (
                            <Video
                              key={index}
                              source={{ uri: url }}
                              style={s.media}
                              useNativeControls
                              resizeMode={ResizeMode.CONTAIN}
                              isLooping
                            />
                          );
                        }

                        return <Image key={index} source={{ uri: url }} style={s.media} />;
                      })}
                    </View>
                  )}

                  {/* Actions */}
                  <View style={s.actions}>
                    <Action
                      s={s}
                      loading={actionLoading === `like-${item._id}`}
                      icon={item.isLiked ? "heart" : "heart-outline"}
                      value={item.likesCount}
                      onPress={async () => {
                        setActionLoading(`like-${item._id}`);
                        await dispatch(toggleLike(item._id));
                        setActionLoading(null);
                      }}
                    />

                    <Action
                      s={s}
                      loading={actionLoading === `retweet-${item._id}`}
                      icon="repeat-outline"
                      value={item.retweetsCount}
                      onPress={async () => {
                        setActionLoading(`retweet-${item._id}`);
                        await dispatch(toggleRetweet(item._id));
                        setActionLoading(null);
                      }}
                    />

                    <Action
                      s={s}
                      loading={false}
                      icon="chatbubble-outline"
                      value={item.repliesCount}
                      onPress={() => openTweet(item)}
                    />
                  </View>
                </View>
              </View>
            </Swipeable>
          );
        }}
      />

      {/* ===== Bottom Sheet ===== */}
      {showSheet && (
        <View style={s.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeSheet} />

          <View style={s.sheet}>
            {selectedUser && (
              <>
                <Text style={s.sheetTitle}>{selectedUser.atUsername?.startsWith("@") ? selectedUser.atUsername : `@${selectedUser.atUsername}`}</Text>

                <TouchableOpacity
                  style={s.sheetItem}
                  onPress={async () => {
                    await dispatch(toggleFollow(selectedUser._id));
                    closeSheet();
                  }}
                  activeOpacity={0.9}
                >
                  <View style={[s.sheetIcon, { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)" }]}>
                    <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={s.sheetText}>Unfollow</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.sheetItem} activeOpacity={0.9}>
                  <View style={[s.sheetIcon, { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)" }]}>
                    <Ionicons name="ban-outline" size={18} color="#EF4444" />
                  </View>
                  <Text style={s.sheetText}>Block</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.sheetItem} activeOpacity={0.9}>
                  <View style={[s.sheetIcon, { backgroundColor: isDark ? "rgba(245,158,11,0.14)" : "rgba(245,158,11,0.10)" }]}>
                    <Ionicons name="flag-outline" size={18} color="#F59E0B" />
                  </View>
                  <Text style={s.sheetText}>Report</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* ===== FAB ===== */}
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/create-tweet")}
      >
        <Ionicons name="create-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

/* ================= Components ================= */

function Action({ icon, value, onPress, loading, s }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={s.actionItem} disabled={loading} activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={s._iconColor} />
          <Text style={s.actionValue}>{value}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function TabButton({ title, active, onPress, s }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[s.tabBtn, active && s.tabBtnActive]}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ================= Styles ================= */

function makeStyles(theme: any, isDark: boolean) {
  const cardBg = theme.surface ?? theme.background;
  const surface2 = theme.surface2 ?? theme.cardAlt ?? (isDark ? "#14141A" : "#F3F4F6");

  return StyleSheet.create({
    _iconColor: theme.icon,

    container: { flex: 1 },

    tabsWrap: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
    },

    tabsCard: {
      flexDirection: "row",
      gap: 8,
      padding: 6,
      borderRadius: 18,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    tabBtn: {
      flex: 1,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    tabBtnActive: {
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
    },

    tabText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.mutedText,
    },

    tabTextActive: {
      color: theme.primaryText,
      fontWeight: "900",
    },

    card: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 12, // أقل من السابق = قائمة “مليانة”
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: theme.background,
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: surface2,
    },

    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      maxWidth: 190,
    },

    handle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
    },

    time: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.subtleText,
    },

    dot: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.subtleText,
      marginHorizontal: 2,
    },

    text: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
      fontWeight: "700",
    },

    normalText: {
      color: theme.text,
      fontWeight: "700",
    },

    mention: {
      color: theme.tint,
      fontWeight: "900",
    },

    hashtag: {
      color: theme.warning ?? "#F59E0B",
      fontWeight: "900",
    },

    media: {
      width: "100%",
      height: 220,
      borderRadius: 14,
      marginTop: 8,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    actions: {
      flexDirection: "row",
      gap: 14,
      marginTop: 10,
      alignItems: "center",
    },

    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    actionValue: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.mutedText,
    },

    followBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
    },

    followBtnOff: {
      backgroundColor: theme.surface2,
      borderColor: theme.tint,
    },

    followBtnOn: {
      backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#111827",
      borderColor: theme.border,
    },

    followText: { color: "#FFF", fontSize: 12, fontWeight: "900" },

    moreBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    /* Badges */
    badgesWrap: { flexDirection: "row", alignItems: "center", marginLeft: 6 },
    badgePill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      marginLeft: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
    },
    badgeText: { fontSize: 10, fontWeight: "900" },

    /* Swipe delete */
    deleteBtn: {
      width: 96,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginVertical: 6,
      borderRadius: 16,
    },
    deleteText: { color: "#FFF", fontSize: 12, fontWeight: "900" },

    /* Bottom sheet */
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      paddingBottom: 18,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: -8 } },
        android: { elevation: 10 },
      }),
    },
    sheetTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 12,
    },
    sheetItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderRadius: 14,
    },
    sheetIcon: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    sheetText: { fontSize: 14, fontWeight: "800", color: theme.text },

    /* FAB */
    fab: {
      position: "absolute",
      right: 18,
      bottom: 28,
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: theme.tint,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
        android: { elevation: 8 },
      }),
    },
  });
}