

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
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function TweetDetailsScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<any>(null);

  const { currentTweet, comments, loading } =
    useSelector((state: RootState) => state.tweets);

  const { user } =
    useSelector((state: RootState) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getSingleTweet(id as string));
      dispatch(getComments(id as string));
    }
  }, [id]);

  const isOwnTweet = currentTweet?.author._id === user?._id;

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

  const isVideo = (url: string) =>
    /\.(mp4|mov|m4v|webm)$/i.test(url);

  const isValidUrl = (url?: string) =>
    !!url && typeof url === 'string' && url.startsWith('http');

 if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );
}

if (!currentTweet) {
  return (
    <SafeAreaView style={styles.center}>
      <Text style={{ fontSize: 16 }}>
        Post not available
      </Text>
    </SafeAreaView>
  );
}


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>

        {/* ================= HEADER ================= */}
        <View style={styles.header}>

          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Post</Text>

          {/* THREE DOTS */}
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} />
          </TouchableOpacity>

        </View>

        {/* ================= TWEET ================= */}
        <View style={styles.tweetBox}>

          <Text style={styles.name}>
            {currentTweet.author.username}
          </Text>

          <Text style={styles.content}>
            {currentTweet?.content}
          </Text>

     {currentTweet.media &&
  Array.isArray(currentTweet.media) &&
  currentTweet.media.length > 0 && (
    <View style={{ marginTop: 10 }}>
      {currentTweet.media.map((mediaItem: any, index: number) => {

        const url = mediaItem?.url;

        if (!url || typeof url !== 'string') return null;

        if (mediaItem.type === "video") {
          return (
            <Video
              key={index}
              source={{ uri: url }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
            />
          );
        }

        return (
          <Image
            key={index}
            source={{ uri: url }}
            style={styles.media}
          />
        );
      })}
    </View>
)}


          {/* ================= STATS ================= */}
          {/* <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {currentTweet.viewsCount ?? 0} Views
            </Text>
          </View> */}

          {/* ================= ACTIONS ================= */}
          <View style={styles.actions}>

            <Action
              icon="chatbubble-outline"
              value={currentTweet.repliesCount}
            />

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                dispatch(toggleRetweet(currentTweet._id))
              }
            >
              <Ionicons
                name="repeat-outline"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.actionText}>
                {currentTweet.retweetsCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                dispatch(toggleLike(currentTweet._id))
              }
            >
              <Ionicons
                name={
                  currentTweet.isLiked
                    ? 'heart'
                    : 'heart-outline'
                }
                size={20}
                color={
                  currentTweet.isLiked
                    ? 'red'
                    : '#6B7280'
                }
              />
              <Text style={styles.actionText}>
                {currentTweet.likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                dispatch(toggleBookmark(currentTweet._id))
              }
            >
              <Ionicons
                name={
                  currentTweet.isBookmarked
                    ? 'bookmark'
                    : 'bookmark-outline'
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

          </View>
        </View>

        {/* ================= COMMENTS ================= */}
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={comments}
          inverted
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.commentUser}>
                {item.user?.username}
              </Text>
              <Text>{item.content}</Text>
            </View>
          )}
        />

        {/* ================= INPUT ================= */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Post your reply"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />

          {sending ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons
                name="send"
                size={22}
                color="#1D9BF0"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ================= MENU MODAL ================= */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>

              {isOwnTweet ? (
                <TouchableOpacity onPress={handleDelete}>
                  <Text style={[styles.modalItem, { color: 'red' }]}>
                    Delete Post
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity>
                  <Text style={styles.modalItem}>
                    Report
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleShare}>
                <Text style={styles.modalItem}>
                  Share
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  dispatch(toggleBookmark(currentTweet._id))
                }
              >
                <Text style={styles.modalItem}>
                  {currentTweet.isBookmarked
                    ? 'Remove Bookmark'
                    : 'Bookmark'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={styles.cancel}>
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* ================= COMPONENT ================= */

function Action({ icon, value }: any) {
  return (
    <View style={styles.actionBtn}>
      <Ionicons
        name={icon}
        size={20}
        color="#6B7280"
      />
      <Text style={styles.actionText}>
        {value}
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  center: {
    flex: 1,
    justifyContent: 'center',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  tweetBox: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  name: {
    fontWeight: '700',
    fontSize: 16,
  },

  content: {
    marginVertical: 8,
    fontSize: 15,
  },

  media: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 8,
  },

  statsRow: {
    marginTop: 10,
  },

  statText: {
    fontSize: 13,
    color: '#6B7280',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 14,
    justifyContent: 'space-between',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
  },

  comment: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  commentUser: {
    fontWeight: '600',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 120,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 16,
    padding: 16,
  },

  modalItem: {
    fontSize: 16,
    paddingVertical: 12,
  },

  cancel: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6B7280',
  },

});
