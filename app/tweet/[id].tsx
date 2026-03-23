
// import { AppTheme, Colors } from '@/constants/theme';
// import {
//   addComment,
//   deleteTweet,
//   getComments,
//   getSingleTweet,
//   toggleBookmark,
//   toggleLike,
//   toggleRetweet,
// } from '@/redux/slices/tweetSlice';

// import { AppDispatch, RootState } from '@/redux/store';
// import { Ionicons } from '@expo/vector-icons';
// import { ResizeMode, Video } from 'expo-av';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Image,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   Share,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from 'react-native';

// import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';

// export default function TweetDetailsScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const flatListRef = useRef<any>(null);

// const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

//   const { currentTweet, comments, loading } = useSelector(
//     (state: RootState) => state.tweets
//   );

//   const { user } = useSelector((state: RootState) => state.auth);

//   const [commentText, setCommentText] = useState('');
//   const [sending, setSending] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     if (id) {
//       dispatch(getSingleTweet(id as string));
//       dispatch(getComments(id as string));
//     }
//   }, [id]);

//   const isOwnTweet = currentTweet?.author?._id === user?._id;

//   const handleAddComment = async () => {
//     if (!commentText.trim()) return;

//     setSending(true);

//     await dispatch(
//       addComment({
//         tweetId: id as string,
//         content: commentText,
//       })
//     );

//     setCommentText('');
//     setSending(false);
//   };

//   const handleShare = async () => {
//     await Share.share({
//       message: currentTweet?.content || '',
//     });
//   };

//   const handleDelete = async () => {
//     if (!currentTweet) return;
//     await dispatch(deleteTweet(currentTweet._id));
//     setShowMenu(false);
//     router.back();
//   };

//   const isValidUrl = (url?: string) =>
//     !!url && typeof url === 'string' && url.startsWith('http');

//   const headerIconColor = theme.icon;
// const subtle = theme.subtleText ?? theme.mutedText; // ✅ يعمل بدون خطأ
//   if (loading) {
//     return (
//       <View style={[styles.center, { backgroundColor: theme.background }]}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!currentTweet) {
//     return (
//       <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
//         <Text style={{ fontSize: 16, color: theme.text }}>Post not available</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior="padding"
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//     >
//       <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
//         {/* ================= HEADER ================= */}
//         <View
//           style={[
//             styles.header,
//             {
//               backgroundColor: theme.background,
//               borderColor: theme.separator,
//             },
//           ]}
//         >
//           <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
//             <Ionicons name="arrow-back" size={22} color={headerIconColor} />
//           </TouchableOpacity>

//           <Text style={[styles.headerTitle, { color: theme.text }]}>Post</Text>

//           <TouchableOpacity onPress={() => setShowMenu(true)} hitSlop={10} style={styles.headerBtn}>
//             <Ionicons name="ellipsis-horizontal" size={20} color={headerIconColor} />
//           </TouchableOpacity>
//         </View>

//         {/* ================= TWEET ================= */}
//         <View
//           style={[
//             styles.tweetBox,
//             {
//               borderColor: theme.separator,
//               backgroundColor: theme.card,
//             },
//           ]}
//         >
//           <View style={styles.authorRow}>
//             <View style={styles.authorLeft}>
//               <View
//                 style={[
//                   styles.avatarPlaceholder,
//                   { backgroundColor: theme.primarySoft, borderColor: theme.border },
//                 ]}
//               >
//                 <Ionicons name="person" size={16} color={theme.icon} />
//               </View>

//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
//                   {currentTweet.author?.username}
//                 </Text>
//                 {!!currentTweet.author?.atUsername && (
//                   <Text style={[styles.handle, { color: subtle as any }]} numberOfLines={1}>
//                     {currentTweet.author?.atUsername}
//                   </Text>
//                 )}
//               </View>
//             </View>

//             <View style={styles.rightMeta}>
//               {isOwnTweet ? (
//                 <View style={[styles.ownerPill, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
//                   <Text style={[styles.ownerPillText, { color: theme.text }]}>You</Text>
//                 </View>
//               ) : null}
//             </View>
//           </View>

//           <Text style={[styles.content, { color: theme.text }]}>
//             {currentTweet?.content}
//           </Text>

//           {/* Media */}
//           {currentTweet.media &&
//             Array.isArray(currentTweet.media) &&
//             currentTweet.media.length > 0 && (
//               <View style={{ marginTop: 10 }}>
//                 {currentTweet.media.map((mediaItem: any, index: number) => {
//                   const url = mediaItem?.url;
//                   if (!isValidUrl(url)) return null;

//                   if (mediaItem.type === 'video') {
//                     return (
//                       <Video
//                         key={`${currentTweet._id}-media-${index}`}
//                         source={{ uri: url }}
//                         style={[styles.media, { backgroundColor: theme.surface2 }]}
//                         resizeMode={ResizeMode.CONTAIN}
//                         useNativeControls
//                       />
//                     );
//                   }

//                   return (
//                     <Image
//                       key={`${currentTweet._id}-media-${index}`}
//                       source={{ uri: url }}
//                       style={styles.media}
//                     />
//                   );
//                 })}
//               </View>
//             )}

//           {/* Actions */}
//           <View style={styles.actions}>
//             <Action
//               theme={theme}
//               icon="chatbubble-outline"
//               value={currentTweet.repliesCount}
//               onPress={() => {
//                 // مجرد عرض الرقم هنا
//               }}
//             />

//             <Action
//               theme={theme}
//               icon="repeat-outline"
//               value={currentTweet.retweetsCount}
//               onPress={() => dispatch(toggleRetweet(currentTweet._id))}
//             />

//             <Action
//               theme={theme}
//               icon={currentTweet.isLiked ? 'heart' : 'heart-outline'}
//               value={currentTweet.likesCount}
//               iconColor={currentTweet.isLiked ? '#EF4444' : theme.icon}
//               onPress={() => dispatch(toggleLike(currentTweet._id))}
//             />

//             <TouchableOpacity
//               style={[styles.iconOnly, { backgroundColor: theme.surface2, borderColor: theme.border }]}
//               onPress={() => dispatch(toggleBookmark(currentTweet._id))}
//               activeOpacity={0.85}
//             >
//               <Ionicons
//                 name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
//                 size={20}
//                 color={theme.icon}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.iconOnly, { backgroundColor: theme.surface2, borderColor: theme.border }]}
//               onPress={handleShare}
//               activeOpacity={0.85}
//             >
//               <Ionicons name="share-outline" size={20} color={theme.icon} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ================= COMMENTS ================= */}
//         <KeyboardAwareFlatList
//           ref={flatListRef}
//           data={comments}
//           inverted
//           keyExtractor={(item: any) => item._id}
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={{ padding: 12 }}
//           ListEmptyComponent={
//             <View style={[styles.empty, { backgroundColor: theme.background }]}>
//               <Ionicons name="chatbubble-ellipses-outline" size={34} color={theme.icon} />
//               <Text style={[styles.emptyTitle, { color: theme.text }]}>No replies yet</Text>
//               <Text style={[styles.emptySub, { color: subtle as any }]}>Be the first to reply.</Text>
//             </View>
//           }
//           renderItem={({ item }: any) => (
//             <View
//               style={[
//                 styles.comment,
//                 {
//                   backgroundColor: theme.card,
//                   borderColor: theme.border,
//                 },
//               ]}
//             >
//               <View style={styles.commentTop}>
//                 <Text style={[styles.commentUser, { color: theme.text }]} numberOfLines={1}>
//                   {item.user?.username || 'User'}
//                 </Text>
//                 {!!item.createdAt && (
//                   <Text style={[styles.commentTime, { color: subtle as any }]} numberOfLines={1}>
//                     {/* لو عندك timeAgo استخدمه هنا - بدون تغيير لوجيك */}
//                   </Text>
//                 )}
//               </View>

//               <Text style={[styles.commentText, { color: theme.text }]}>
//                 {item.content}
//               </Text>
//             </View>
//           )}
//         />

//         {/* ================= INPUT ================= */}
//         <View
//           style={[
//             styles.inputBar,
//             {
//               backgroundColor: theme.background,
//               borderColor: theme.separator,
//             },
//           ]}
//         >
//           <View
//             style={[
//               styles.inputWrap,
//               { backgroundColor: theme.surface2, borderColor: theme.border },
//             ]}
//           >
//             <TextInput
//               style={[styles.input, { color: theme.text }]}
//               placeholder="Post your reply"
//               placeholderTextColor={subtle as any}
//               value={commentText}
//               onChangeText={setCommentText}
//               multiline
//             />

//             {sending ? (
//               <ActivityIndicator />
//             ) : (
//               <TouchableOpacity
//                 onPress={handleAddComment}
//                 activeOpacity={0.85}
//                 style={[
//                   styles.sendBtn,
//                   {
//                     backgroundColor: commentText.trim() ? theme.primary : theme.cardAlt,
//                     borderColor: theme.border,
//                   },
//                 ]}
//                 disabled={!commentText.trim()}
//               >
//                 <Ionicons
//                   name="send"
//                   size={18}
//                   color={commentText.trim() ? theme.primaryText : theme.mutedText}
//                 />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* ================= MENU MODAL ================= */}
//         <Modal visible={showMenu} transparent animationType="fade">
//           <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
//             <Pressable
//               style={[
//                 styles.modalBox,
//                 { backgroundColor: theme.card, borderColor: theme.border },
//               ]}
//               onPress={(e) => e.stopPropagation()}
//             >
//               {isOwnTweet ? (
//                 <TouchableOpacity onPress={handleDelete} style={styles.modalItemRow} activeOpacity={0.85}>
//                   <Ionicons name="trash-outline" size={18} color="#EF4444" />
//                   <Text style={[styles.modalItem, { color: '#EF4444' }]}>Delete Post</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity style={styles.modalItemRow} activeOpacity={0.85}>
//                   <Ionicons name="flag-outline" size={18} color={theme.icon} />
//                   <Text style={[styles.modalItem, { color: theme.text }]}>Report</Text>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity onPress={handleShare} style={styles.modalItemRow} activeOpacity={0.85}>
//                 <Ionicons name="share-outline" size={18} color={theme.icon} />
//                 <Text style={[styles.modalItem, { color: theme.text }]}>Share</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => dispatch(toggleBookmark(currentTweet._id))}
//                 style={styles.modalItemRow}
//                 activeOpacity={0.85}
//               >
//                 <Ionicons
//                   name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
//                   size={18}
//                   color={theme.icon}
//                 />
//                 <Text style={[styles.modalItem, { color: theme.text }]}>
//                   {currentTweet.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setShowMenu(false)}
//                 style={[styles.modalCancel, { backgroundColor: theme.surface2, borderColor: theme.border }]}
//                 activeOpacity={0.85}
//               >
//                 <Text style={[styles.cancel, { color: theme.text }]}>Cancel</Text>
//               </TouchableOpacity>
//             </Pressable>
//           </Pressable>
//         </Modal>
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );
// }

// /* ================= COMPONENT ================= */

// function Action({
//   theme,
//   icon,
//   value,
//   onPress,
//   iconColor,
// }: {
//   theme: AppTheme;
//   icon: any;
//   value: any;
//   onPress?: () => void;
//   iconColor?: string;
// }) {
//   return (
//     <TouchableOpacity
//       style={[styles.actionBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
//       onPress={onPress}
//       activeOpacity={0.85}
//     >
//       <Ionicons name={icon} size={20} color={iconColor || theme.icon} />
//       <Text style={[styles.actionText, { color: theme.mutedText }]}>{value}</Text>
//     </TouchableOpacity>
//   );
// }
// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   safe: { flex: 1 },

//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   header: {
//     height: 56,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//   },

//   headerBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   headerTitle: {
//     fontSize: 16,
//     fontWeight: '900',
//   },

//   tweetBox: {
//     marginHorizontal: 12,
//     marginTop: 10,
//     padding: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//   },

//   authorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },

//   authorLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     flex: 1,
//   },

//   avatarPlaceholder: {
//     width: 34,
//     height: 34,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },

//   name: {
//     fontWeight: '900',
//     fontSize: 15,
//   },

//   handle: {
//     marginTop: 2,
//     fontSize: 12,
//     fontWeight: '700',
//   },

//   rightMeta: { marginLeft: 10 },

//   ownerPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 999,
//     borderWidth: 1,
//   },
//   ownerPillText: {
//     fontSize: 12,
//     fontWeight: '900',
//   },

//   content: {
//     marginTop: 6,
//     fontSize: 15,
//     lineHeight: 22,
//     fontWeight: '700',
//   },

//   media: {
//     width: '100%',
//     height: 240,
//     borderRadius: 14,
//     marginTop: 8,
//   },

//   actions: {
//     flexDirection: 'row',
//     marginTop: 12,
//     justifyContent: 'space-between',
//     gap: 8,
//   },

//   actionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderRadius: 999,
//     borderWidth: 1,
//   },

//   iconOnly: {
//     width: 44,
//     height: 38,
//     borderRadius: 14,
//     borderWidth: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   actionText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },

//   comment: {
//     borderWidth: 1,
//     borderRadius: 14,
//     padding: 10,
//     marginBottom: 8, // ✅ كثافة أعلى بدون فراغات كبيرة
//   },

//   commentTop: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },

//   commentUser: {
//     fontWeight: '900',
//     fontSize: 13,
//     maxWidth: '80%',
//   },

//   commentTime: {
//     fontSize: 11,
//     fontWeight: '700',
//   },

//   commentText: {
//     fontSize: 13,
//     lineHeight: 20,
//     fontWeight: '600',
//   },

//   empty: {
//     paddingTop: 60,
//     alignItems: 'center',
//     gap: 8,
//   },
//   emptyTitle: { fontSize: 16, fontWeight: '900' },
//   emptySub: { fontSize: 12, fontWeight: '700' },

//   inputBar: {
//     borderTopWidth: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },

//   inputWrap: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     borderRadius: 18,
//     borderWidth: 1,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     gap: 10,
//   },

//   input: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '700',
//     maxHeight: 120,
//     paddingVertical: 0,
//   },

//   sendBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 14,
//     borderWidth: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },

//   modalBox: {
//     width: '100%',
//     maxWidth: 420,
//     borderRadius: 18,
//     padding: 14,
//     borderWidth: 1,
//   },

//   modalItemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     paddingVertical: 12,
//     paddingHorizontal: 6,
//   },

//   modalItem: {
//     fontSize: 15,
//     fontWeight: '800',
//   },

//   modalCancel: {
//     marginTop: 8,
//     borderRadius: 14,
//     borderWidth: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },

//   cancel: {
//     fontWeight: '900',
//   },
// });
import { AppTheme, Colors } from '@/constants/theme';
import {
  addComment,
  deleteTweet,
  getComments,
  getSingleTweet,
  toggleBookmark,
  toggleLike,
  toggleRetweet,
} from '@/redux/slices/tweetSlice';

import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';

export default function TweetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<any>(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { currentTweet, comments, loading } = useSelector(
    (state: RootState) => state.tweets
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getSingleTweet(id as string));
      dispatch(getComments(id as string));
    }
  }, [id]);

  const isOwnTweet = currentTweet?.author?._id === user?._id;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setSending(true);

    await dispatch(
      addComment({
        tweetId: id as string,
        content: commentText,
      })
    );

    setCommentText('');
    setSending(false);
  };

  const handleShare = async () => {
    await Share.share({
      message: currentTweet?.content || '',
    });
  };

  const handleDelete = async () => {
    if (!currentTweet) return;
    await dispatch(deleteTweet(currentTweet._id));
    setShowMenu(false);
    router.back();
  };

  const isValidUrl = (url?: string) =>
    !!url && typeof url === 'string' && /^https?:\/\//i.test(url);

  const extractFirstUrl = (text?: string): string | null => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const isDirectVideoUrl = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|m3u8|mov|webm)(\?.*)?$/i.test(url);
  };

  const getYoutubeVideoId = (url?: string): string | null => {
    if (!url) return null;

    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/i,
      /youtube\.com\/shorts\/([^?&/]+)/i,
      /youtu\.be\/([^?&/]+)/i,
      /youtube\.com\/embed\/([^?&/]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  };

  const getYoutubeEmbedUrl = (url?: string): string | null => {
    const id = getYoutubeVideoId(url);
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?playsinline=1&autoplay=0&rel=0`;
  };

  const getVimeoVideoId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/i);
    return match?.[1] || null;
  };

  const getVimeoEmbedUrl = (url?: string): string | null => {
    const id = getVimeoVideoId(url);
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  };

  const linkPreview = currentTweet?.linkPreview ?? null;
  const detectedUrl = linkPreview?.url || extractFirstUrl(currentTweet?.content);

  const embeddedYoutubeUrl = getYoutubeEmbedUrl(detectedUrl || undefined);
  const embeddedVimeoUrl = getVimeoEmbedUrl(detectedUrl || undefined);
  const canPlayDirectVideo = isDirectVideoUrl(detectedUrl || undefined);

  const headerIconColor = theme.icon;
  const subtle = theme.subtleText ?? theme.mutedText;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentTweet) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 16, color: theme.text }}>Post not available</Text>
      </SafeAreaView>
    );
  }

  const hasNativeMedia =
    Array.isArray(currentTweet.media) && currentTweet.media.length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        {/* ================= HEADER ================= */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.background,
              borderColor: theme.separator,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={headerIconColor} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Post</Text>

          <TouchableOpacity onPress={() => setShowMenu(true)} hitSlop={10} style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={headerIconColor} />
          </TouchableOpacity>
        </View>

        {/* ================= TWEET ================= */}
        <View
          style={[
            styles.tweetBox,
            {
              borderColor: theme.separator,
              backgroundColor: theme.card,
            },
          ]}
        >
          <View style={styles.authorRow}>
            <View style={styles.authorLeft}>
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.primarySoft, borderColor: theme.border },
                ]}
              >
                <Ionicons name="person" size={16} color={theme.icon} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {currentTweet.author?.username}
                </Text>
                {!!currentTweet.author?.atUsername && (
                  <Text style={[styles.handle, { color: subtle as any }]} numberOfLines={1}>
                    {currentTweet.author?.atUsername}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rightMeta}>
              {isOwnTweet ? (
                <View style={[styles.ownerPill, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Text style={[styles.ownerPillText, { color: theme.text }]}>You</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={[styles.content, { color: theme.text }]}>
            {currentTweet?.content}
          </Text>

          {/* Native uploaded media from your backend */}
          {hasNativeMedia && (
            <View style={{ marginTop: 10 }}>
              {currentTweet.media?.map((mediaItem: any, index: number) => {
                const url = mediaItem?.url;
                if (!isValidUrl(url)) return null;

                if (mediaItem.type === 'video') {
                  return (
                    <Video
                      key={`${currentTweet._id}-media-${index}`}
                      source={{ uri: url }}
                      style={[styles.media, { backgroundColor: theme.surface2 }]}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      shouldPlay={false}
                    />
                  );
                }

                return (
                  <Image
                    key={`${currentTweet._id}-media-${index}`}
                    source={{ uri: url }}
                    style={styles.media}
                  />
                );
              })}
            </View>
          )}

          {/* External link preview / external video embed */}
          {!hasNativeMedia && detectedUrl ? (
            <View style={{ marginTop: 12 }}>
              {canPlayDirectVideo ? (
                <View style={[styles.previewCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <Video
                    source={{ uri: detectedUrl }}
                    style={[styles.media, { marginTop: 0, backgroundColor: theme.surface2 }]}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={false}
                  />
                  <View style={styles.previewContent}>
                    <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={2}>
                      {linkPreview?.title || 'Video'}
                    </Text>
                    {!!linkPreview?.description && (
                      <Text style={[styles.previewDesc, { color: subtle as any }]} numberOfLines={3}>
                        {linkPreview.description}
                      </Text>
                    )}
                    <TouchableOpacity onPress={() => Linking.openURL(detectedUrl)}>
                      <Text style={[styles.previewUrl, { color: theme.primary }]} numberOfLines={1}>
                        {detectedUrl}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : embeddedYoutubeUrl || embeddedVimeoUrl ? (
                <View style={[styles.previewCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                  <View style={styles.webVideoWrap}>
                    <WebView
                      source={{ uri: embeddedYoutubeUrl || embeddedVimeoUrl || '' }}
                      style={styles.webVideo}
                      javaScriptEnabled
                      domStorageEnabled
                      allowsFullscreenVideo
                    />
                  </View>

                  <View style={styles.previewContent}>
                    <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={2}>
                      {linkPreview?.title || 'Embedded video'}
                    </Text>

                    {!!linkPreview?.description && (
                      <Text style={[styles.previewDesc, { color: subtle as any }]} numberOfLines={3}>
                        {linkPreview.description}
                      </Text>
                    )}

                    <Text style={[styles.previewSite, { color: subtle as any }]} numberOfLines={1}>
                      {linkPreview?.siteName || detectedUrl}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => Linking.openURL(detectedUrl)}
                  style={[
                    styles.previewCard,
                    { backgroundColor: theme.surface2, borderColor: theme.border }
                  ]}
                >
                  {!!linkPreview?.image && isValidUrl(linkPreview.image) && (
                    <Image source={{ uri: linkPreview.image }} style={styles.previewImage} />
                  )}

                  <View style={styles.previewContent}>
                    <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={2}>
                      {linkPreview?.title || detectedUrl}
                    </Text>

                    {!!linkPreview?.description && (
                      <Text style={[styles.previewDesc, { color: subtle as any }]} numberOfLines={3}>
                        {linkPreview.description}
                      </Text>
                    )}

                    <Text style={[styles.previewSite, { color: subtle as any }]} numberOfLines={1}>
                      {linkPreview?.siteName || detectedUrl}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <Action
              theme={theme}
              icon="chatbubble-outline"
              value={currentTweet.repliesCount}
              onPress={() => {}}
            />

            <Action
              theme={theme}
              icon="repeat-outline"
              value={currentTweet.retweetsCount}
              onPress={() => dispatch(toggleRetweet(currentTweet._id))}
            />

            <Action
              theme={theme}
              icon={currentTweet.isLiked ? 'heart' : 'heart-outline'}
              value={currentTweet.likesCount}
              iconColor={currentTweet.isLiked ? '#EF4444' : theme.icon}
              onPress={() => dispatch(toggleLike(currentTweet._id))}
            />

            <TouchableOpacity
              style={[styles.iconOnly, { backgroundColor: theme.surface2, borderColor: theme.border }]}
              onPress={() => dispatch(toggleBookmark(currentTweet._id))}
              activeOpacity={0.85}
            >
              <Ionicons
                name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={theme.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconOnly, { backgroundColor: theme.surface2, borderColor: theme.border }]}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= COMMENTS ================= */}
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={comments}
          inverted
          keyExtractor={(item: any) => item._id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: theme.background }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={34} color={theme.icon} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No replies yet</Text>
              <Text style={[styles.emptySub, { color: subtle as any }]}>Be the first to reply.</Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <View
              style={[
                styles.comment,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.commentTop}>
                <Text style={[styles.commentUser, { color: theme.text }]} numberOfLines={1}>
                  {item.user?.username || 'User'}
                </Text>
                {!!item.createdAt && (
                  <Text style={[styles.commentTime, { color: subtle as any }]} numberOfLines={1}>
                  </Text>
                )}
              </View>

              <Text style={[styles.commentText, { color: theme.text }]}>
                {item.content}
              </Text>
            </View>
          )}
        />

        {/* ================= INPUT ================= */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.background,
              borderColor: theme.separator,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Post your reply"
              placeholderTextColor={subtle as any}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />

            {sending ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                onPress={handleAddComment}
                activeOpacity={0.85}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: commentText.trim() ? theme.primary : theme.cardAlt,
                    borderColor: theme.border,
                  },
                ]}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={commentText.trim() ? theme.primaryText : theme.mutedText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ================= MENU MODAL ================= */}
        <Modal visible={showMenu} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
            <Pressable
              style={[
                styles.modalBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {isOwnTweet ? (
                <TouchableOpacity onPress={handleDelete} style={styles.modalItemRow} activeOpacity={0.85}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={[styles.modalItem, { color: '#EF4444' }]}>Delete Post</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.modalItemRow} activeOpacity={0.85}>
                  <Ionicons name="flag-outline" size={18} color={theme.icon} />
                  <Text style={[styles.modalItem, { color: theme.text }]}>Report</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleShare} style={styles.modalItemRow} activeOpacity={0.85}>
                <Ionicons name="share-outline" size={18} color={theme.icon} />
                <Text style={[styles.modalItem, { color: theme.text }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => dispatch(toggleBookmark(currentTweet._id))}
                style={styles.modalItemRow}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={theme.icon}
                />
                <Text style={[styles.modalItem, { color: theme.text }]}>
                  {currentTweet.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                style={[styles.modalCancel, { backgroundColor: theme.surface2, borderColor: theme.border }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.cancel, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ================= COMPONENT ================= */

function Action({
  theme,
  icon,
  value,
  onPress,
  iconColor,
}: {
  theme: AppTheme;
  icon: any;
  value: any;
  onPress?: () => void;
  iconColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={20} color={iconColor || theme.icon} />
      <Text style={[styles.actionText, { color: theme.mutedText }]}>{value}</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },

  tweetBox: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  name: {
    fontWeight: '900',
    fontSize: 15,
  },

  handle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
  },

  rightMeta: { marginLeft: 10 },

  ownerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  ownerPillText: {
    fontSize: 12,
    fontWeight: '900',
  },

  content: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },

  media: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    marginTop: 8,
  },

  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },

  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
  },

  previewContent: {
    padding: 12,
  },

  previewTitle: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },

  previewDesc: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  previewSite: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  previewUrl: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  webVideoWrap: {
    width: '100%',
    height: 230,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  webVideo: {
    flex: 1,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    gap: 8,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  iconOnly: {
    width: 44,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },

  comment: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },

  commentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  commentUser: {
    fontWeight: '900',
    fontSize: 13,
    maxWidth: '80%',
  },

  commentTime: {
    fontSize: 11,
    fontWeight: '700',
  },

  commentText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },

  empty: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
  },

  emptyTitle: { fontSize: 16, fontWeight: '900' },
  emptySub: { fontSize: 12, fontWeight: '700' },

  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    maxHeight: 120,
    paddingVertical: 0,
  },

  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  modalBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },

  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },

  modalItem: {
    fontSize: 15,
    fontWeight: '800',
  },

  modalCancel: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancel: {
    fontWeight: '900',
  },
});