

import { AppTheme, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/useTranslation';
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Image,
  Linking,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';

type CommentItem = {
  _id: string;
  content: string;
  createdAt?: string;
  user?: {
    _id?: string;
    username?: string;
    atUsername?: string;
    avatar?: string;
  };
};

export default function TweetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList<CommentItem>>(null);

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar' || I18nManager.isRTL;

  const { currentTweet, comments, loading } = useSelector(
    (state: RootState) => state.tweets
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        keyboardHeight.value = Math.max(0, e.height);
      },
      onEnd: (e) => {
        'worklet';
        keyboardHeight.value = Math.max(0, e.height);
      },
    },
    []
  );

  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboardHeight.value }],
    };
  });

  const listSpacerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: keyboardHeight.value,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getSingleTweet(id as string));
      dispatch(getComments(id as string));
    }
  }, [id, dispatch]);

  const isOwnTweet = currentTweet?.author?._id === user?._id;

  const formatCount = (value: number | undefined) => {
    const num = Number(value || 0);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return `${num}`;
  };

  const tweetStats = currentTweet as any;

  const viewsCount = useMemo(
    () => Number(tweetStats?.viewsCount ?? tweetStats?.impressionsCount ?? 9800),
    [tweetStats?.viewsCount, tweetStats?.impressionsCount]
  );

  const quotesCount = useMemo(
    () => Number(tweetStats?.quotesCount ?? 4),
    [tweetStats?.quotesCount]
  );

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSending(true);

      await dispatch(
        addComment({
          tweetId: id as string,
          content: commentText.trim(),
        })
      );

      setCommentText('');

      setTimeout(() => {
        flatListRef.current?.scrollToOffset?.({
          offset: 0,
          animated: true,
        });
      }, 150);
    } finally {
      setSending(false);
    }
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
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0&rel=0`;
  };

  const getVimeoVideoId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/i);
    return match?.[1] || null;
  };

  const getVimeoEmbedUrl = (url?: string): string | null => {
    const videoId = getVimeoVideoId(url);
    if (!videoId) return null;
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const linkPreview = currentTweet?.linkPreview ?? null;
  const detectedUrl = linkPreview?.url || extractFirstUrl(currentTweet?.content);

  const embeddedYoutubeUrl = getYoutubeEmbedUrl(detectedUrl || undefined);
  const embeddedVimeoUrl = getVimeoEmbedUrl(detectedUrl || undefined);
  const canPlayDirectVideo = isDirectVideoUrl(detectedUrl || undefined);

  const hasNativeMedia =
    Array.isArray(currentTweet?.media) && currentTweet.media.length > 0;

  const subtle = theme.subtleText ?? theme.mutedText;

  const renderComment = ({ item }: { item: CommentItem }) => (
    <View
      style={[
        styles.replyRow,
        {
          borderBottomColor: theme.separator,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={styles.replyAvatarWrap}>
        {item.user?.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.replyAvatar} />
        ) : (
          <View
            style={[
              styles.replyAvatarPlaceholder,
              {
                backgroundColor: theme.primarySoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="person" size={14} color={theme.icon} />
          </View>
        )}
      </View>

      <View style={styles.replyBody}>
        <View
          style={[
            styles.replyHeaderRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text
            style={[
              styles.replyName,
              { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {item.user?.username || t('tweetDetailsScreen.user')}
          </Text>

          {!!item.user?.atUsername && (
            <Text
              style={[
                styles.replyHandle,
                { color: subtle as any, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {item.user.atUsername}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.replyText,
            { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {item.content}
        </Text>

        <View
          style={[
            styles.replyActionsRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <ReplyMiniAction icon="chatbubble-outline" value={0} theme={theme} />
          <ReplyMiniAction icon="repeat-outline" value={0} theme={theme} />
          <ReplyMiniAction icon="heart-outline" value={0} theme={theme} />
          <ReplyMiniAction icon="share-social-outline" value={0} theme={theme} />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!currentTweet) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 16, color: theme.text }}>
          {t('tweetDetailsScreen.notAvailable')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderColor: theme.separator,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.headerBtn}
        >
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={22}
            color={theme.icon}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('tweetDetailsScreen.title')}
        </Text>

        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          hitSlop={10}
          style={styles.headerBtn}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={comments as CommentItem[]}
          inverted
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Animated.View style={listSpacerAnimatedStyle} />}
          ListFooterComponent={
            <View
              style={[
                styles.postSection,
                { borderBottomColor: theme.separator },
              ]}
            >
              <View
                style={[
                  styles.postTop,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.postAvatarWrap}>
                  {currentTweet.author?.avatar ? (
                    <Image
                      source={{ uri: currentTweet.author.avatar }}
                      style={styles.postAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.postAvatarPlaceholder,
                        {
                          backgroundColor: theme.primarySoft,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Ionicons name="person" size={16} color={theme.icon} />
                    </View>
                  )}
                </View>

                <View style={styles.postMain}>
                  <View
                    style={[
                      styles.postNameRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.postName,
                        { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                      ]}
                      numberOfLines={1}
                    >
                      {currentTweet.author?.username || t('tweetDetailsScreen.user')}
                    </Text>

                    {!!currentTweet.author?.atUsername && (
                      <Text
                        style={[
                          styles.postHandle,
                          { color: subtle as any, textAlign: isRTL ? 'right' : 'left' },
                        ]}
                        numberOfLines={1}
                      >
                        {currentTweet.author?.atUsername}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.postContent,
                      { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {currentTweet?.content}
                  </Text>

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

                  {!hasNativeMedia && detectedUrl ? (
                    <View style={{ marginTop: 12 }}>
                      {canPlayDirectVideo ? (
                        <View
                          style={[
                            styles.previewCard,
                            {
                              backgroundColor: theme.surface2,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Video
                            source={{ uri: detectedUrl }}
                            style={[
                              styles.media,
                              { marginTop: 0, backgroundColor: theme.surface2 },
                            ]}
                            resizeMode={ResizeMode.CONTAIN}
                            useNativeControls
                            shouldPlay={false}
                          />

                          <View style={styles.previewContent}>
                            <Text
                              style={[
                                styles.previewTitle,
                                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                              ]}
                              numberOfLines={2}
                            >
                              {linkPreview?.title || t('tweetDetailsScreen.video')}
                            </Text>

                            {!!linkPreview?.description && (
                              <Text
                                style={[
                                  styles.previewDesc,
                                  { color: subtle as any, textAlign: isRTL ? 'right' : 'left' },
                                ]}
                                numberOfLines={3}
                              >
                                {linkPreview.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      ) : embeddedYoutubeUrl || embeddedVimeoUrl ? (
                        <View
                          style={[
                            styles.previewCard,
                            {
                              backgroundColor: theme.surface2,
                              borderColor: theme.border,
                            },
                          ]}
                        >
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
                            <Text
                              style={[
                                styles.previewTitle,
                                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                              ]}
                              numberOfLines={2}
                            >
                              {linkPreview?.title || t('tweetDetailsScreen.embeddedVideo')}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => Linking.openURL(detectedUrl)}
                          style={[
                            styles.previewCard,
                            {
                              backgroundColor: theme.surface2,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          {!!linkPreview?.image && isValidUrl(linkPreview.image) && (
                            <Image source={{ uri: linkPreview.image }} style={styles.previewImage} />
                          )}

                          <View style={styles.previewContent}>
                            <Text
                              style={[
                                styles.previewTitle,
                                { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
                              ]}
                              numberOfLines={2}
                            >
                              {linkPreview?.title || detectedUrl}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null}

                  <Text
                    style={[
                      styles.postMetaLine,
                      { color: subtle as any, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {language === 'ar'
                      ? `٣:٥٨ م · ٢٣ مارس ٢٠٢٥ · ${formatCount(viewsCount)} ${t('tweetDetailsScreen.views')}`
                      : `3:58 PM · Mar 23, 2025 · ${formatCount(viewsCount)} ${t('tweetDetailsScreen.views')}`}
                  </Text>

                  <View
                    style={[
                      styles.statsLine,
                      {
                        borderTopColor: theme.separator,
                        borderBottomColor: theme.separator,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Text style={[styles.statsText, { color: theme.text }]}>
                      {formatCount(currentTweet.retweetsCount)} {t('tweetDetailsScreen.reposts')}
                    </Text>
                    <Text style={[styles.statsText, { color: theme.text }]}>
                      {formatCount(quotesCount)} {t('tweetDetailsScreen.quotes')}
                    </Text>
                    <Text style={[styles.statsText, { color: theme.text }]}>
                      {formatCount(currentTweet.likesCount)} {t('tweetDetailsScreen.likes')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.actionsRow,
                      {
                        borderBottomColor: theme.separator,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.actionCircle} activeOpacity={0.85}>
                      <Ionicons name="chatbubble-outline" size={21} color={theme.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCircle}
                      activeOpacity={0.85}
                      onPress={() => dispatch(toggleRetweet(currentTweet._id))}
                    >
                      <Ionicons name="repeat-outline" size={21} color={theme.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCircle}
                      activeOpacity={0.85}
                      onPress={() => dispatch(toggleLike(currentTweet._id))}
                    >
                      <Ionicons
                        name={currentTweet.isLiked ? 'heart' : 'heart-outline'}
                        size={21}
                        color={currentTweet.isLiked ? '#EF4444' : theme.icon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCircle}
                      activeOpacity={0.85}
                      onPress={() => dispatch(toggleBookmark(currentTweet._id))}
                    >
                      <Ionicons
                        name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={21}
                        color={theme.icon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCircle}
                      activeOpacity={0.85}
                      onPress={handleShare}
                    >
                      <Ionicons name="share-social-outline" size={21} color={theme.icon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.repliesTitleRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.repliesTitleText, { color: theme.text }]}>
                  {t('tweetDetailsScreen.mostRelevantReplies')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.icon} />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: theme.background }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={theme.icon} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t('tweetDetailsScreen.noReplies')}
              </Text>
              <Text style={[styles.emptySub, { color: subtle as any }]}>
                {t('tweetDetailsScreen.beFirstToReply')}
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingBottom: 12,
          }}
        />

  
        <Animated.View
style={[
            styles.inputBarWrap,
            inputBarAnimatedStyle,
            {
              paddingBottom: Math.max(insets.bottom, 8),
              backgroundColor: theme.background,
              borderTopColor: theme.separator,
            },
          ]}
        >
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: theme.background,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
             style={[
             styles.inputWrap,
             {
               backgroundColor: theme.card,
               borderColor: theme.border,
               flexDirection: isRTL ? 'row-reverse' : 'row',
             },
           ]}
           >
      <TextInput
 style={[
  styles.input,
   {
     color: theme.text,
     textAlign: isRTL ? 'right' : 'left',
   },
 ]}
  placeholder="انشر ردك"
  placeholderTextColor={subtle as any}
  value={commentText}
  onChangeText={setCommentText}
  multiline
  textAlignVertical="center"
  scrollEnabled
  onFocus={() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset?.({
        offset: 0,
        animated: true,
      });
    }, 100);
  }}
/>

             {sending ? (
               <ActivityIndicator color={theme.primary} />
             ) : (
               <TouchableOpacity
                 onPress={handleAddComment}
                 activeOpacity={0.85}
                 style={[
                   styles.sendBtn,
                   {
                     backgroundColor: commentText.trim()
                       ? theme.primary
                       : theme.surface2,
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
        </Animated.View>
      </View>

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
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.modalItemRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                activeOpacity={0.85}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={[styles.modalItem, { color: '#EF4444' }]}>
                  {t('tweetDetailsScreen.deletePost')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.modalItemRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                activeOpacity={0.85}
              >
                <Ionicons name="flag-outline" size={18} color={theme.icon} />
                <Text style={[styles.modalItem, { color: theme.text }]}>
                  {t('tweetDetailsScreen.report')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleShare}
              style={[
                styles.modalItemRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={18} color={theme.icon} />
              <Text style={[styles.modalItem, { color: theme.text }]}>
                {t('tweetDetailsScreen.share')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => dispatch(toggleBookmark(currentTweet._id))}
              style={[
                styles.modalItemRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons
                name={currentTweet.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={theme.icon}
              />
              <Text style={[styles.modalItem, { color: theme.text }]}>
                {currentTweet.isBookmarked
                  ? t('tweetDetailsScreen.removeBookmark')
                  : t('tweetDetailsScreen.bookmark')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowMenu(false)}
              style={[
                styles.modalCancel,
                { backgroundColor: theme.surface2, borderColor: theme.border },
              ]}
              activeOpacity={0.85}
            >
              <Text style={[styles.cancel, { color: theme.text }]}>
                {t('tweetDetailsScreen.cancel')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ReplyMiniAction({
  icon,
  value,
  theme,
}: {
  icon: any;
  value: number;
  theme: AppTheme;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.replyMiniBtn}>
      <Ionicons name={icon} size={16} color={theme.mutedText} />
      <Text style={[styles.replyMiniText, { color: theme.mutedText }]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentContainer: {
    flex: 1,
  },

  header: {
    height: 56,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  postSection: {
    borderBottomWidth: 1,
    paddingTop: 8,
  },

  postTop: {
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },

  postAvatarWrap: {
    marginTop: 2,
    marginHorizontal: 8,
  },

  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  postMain: {
    flex: 1,
  },

  postNameRow: {
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  postName: {
    fontSize: 15,
    fontWeight: '800',
  },

  postHandle: {
    fontSize: 13,
    fontWeight: '600',
  },

  postContent: {
    marginTop: 8,
    fontSize: 19,
    lineHeight: 28,
    fontWeight: '500',
  },

  media: {
    width: '100%',
    height: 285,
    borderRadius: 16,
    marginTop: 12,
  },

  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },

  previewImage: {
    width: '100%',
    height: 210,
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

  webVideoWrap: {
    width: '100%',
    height: 230,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  webVideo: {
    flex: 1,
  },

  postMetaLine: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },

  statsLine: {
    marginTop: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: 14,
    flexWrap: 'wrap',
  },

  statsText: {
    fontSize: 13,
    fontWeight: '700',
  },

  actionsRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  repliesTitleRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  repliesTitleText: {
    fontSize: 15,
    fontWeight: '800',
  },

  replyRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },

  replyAvatarWrap: {
    marginHorizontal: 8,
    marginTop: 2,
  },

  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  replyAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  replyBody: {
    flex: 1,
  },

  replyHeaderRow: {
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  replyName: {
    fontSize: 14,
    fontWeight: '800',
  },

  replyHandle: {
    fontSize: 12,
    fontWeight: '600',
  },

  replyText: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  replyActionsRow: {
    marginTop: 8,
    alignItems: 'center',
    gap: 18,
  },

  replyMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  replyMiniText: {
    fontSize: 11,
    fontWeight: '700',
  },

  inputBarWrap: {
    borderTopWidth: 1,
  },

  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },

  inputWrap: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  empty: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
  },

  emptySub: {
    fontSize: 12,
    fontWeight: '700',
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