import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';


/* =======================
   Types
======================= */
type Comment = {
  id: string;
  user: string;
  text: string;
  time: string;
};

type Tweet = {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
  time: string;
  text: string;
  image?: string;
  video?: string;
  views: number;
  likes: number;
  retweets: number;
  replies: number;
  avatar: string;
  liked?: boolean;
  retweeted?: boolean;
  isRetweet?: boolean;
  originalUser?: string;
  comments?: Comment[];

};

/* =======================
   Initial Data
======================= */

const initialTweets: Tweet[] = [
  {
    id: '1',
    name: 'Thinking Mind',
    username: 'thinkingmind',
    verified: true,
    time: '14س',
    text: 'هكذا يكون الأثر الحقيقي لأجهزة تنقية الهواء على حياتك اليومية',
    image: 'https://picsum.photos/400/300',
    views: 79200,
    likes: 4400,
    retweets: 961,
    replies: 7,
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIN1gwlCld-PW_qX5QxwNMdPUff8gYhTOe8w&s',
  },
  {
    id: '2',
    name: 'Ghada',
    username: 'urfavghada',
    time: '20س',
    text: 'وبعدين بقى ف قلة النوم دي',
    views: 733,
    likes: 65,
    retweets: 15,
    replies: 3,
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIN1gwlCld-PW_qX5QxwNMdPUff8gYhTOe8w&s',
  },
];

/* =======================
   Main Screen
======================= */

export default function TweetsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [feed, setFeed] = useState<Tweet[]>(initialTweets);
  const [showComposer, setShowComposer] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [media, setMedia] = useState<{ image?: string; video?: string }>({});
  const [loadingMedia, setLoadingMedia] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const selectedTweet = feed.find(t => t.id === selectedTweetId) || null;

  const updateComment = (id: string) => {
    if (!commentText.trim() || !selectedTweetId) return;

    setFeed(prev =>
      prev.map(t =>
        t.id === selectedTweetId
          ? {
            ...t,
            comments: t.comments?.map(c =>
              c.id === id ? { ...c, text: commentText } : c
            ),
          }
          : t
      )
    );

    setEditingCommentId(null);
    setCommentText('');
  };
  const deleteComment = (id: string) => {
    if (!selectedTweet) return;

    setFeed(prev =>
      prev.map(t =>
        t.id === selectedTweetId
          ? {
            ...t,
            replies: Math.max(0, t.replies - 1),
            comments: t.comments?.filter(c => c.id !== id),
          }
          : t
      )
    );
  };

  /* ===== Like ===== */
  const toggleLike = (id: string) => {
    setFeed(prev =>
      prev.map(t =>
        t.id === id
          ? {
            ...t,
            liked: !t.liked,
            likes: t.liked ? t.likes - 1 : t.likes + 1,
          }
          : t
      )
    );
  };

  /* ===== Retweet ( يظهر أعلى الشاشة ) ===== */
  const toggleRetweet = (tweet: Tweet) => {
    if (tweet.retweeted) return;

    const retweet: Tweet = {
      ...tweet,
      id: Date.now().toString(),
      name: 'You',
      username: 'you',
      time: 'الآن',
      isRetweet: true,
      originalUser: tweet.username,
      avatar: 'https://picsum.photos/200',
    };

    setFeed(prev => [
      retweet,
      ...prev.map(t =>
        t.id === tweet.id
          ? { ...t, retweeted: true, retweets: t.retweets + 1 }
          : t
      ),
    ]);
  };

  /* ===== Add Tweet ===== */
  const addTweet = () => {
    if (!tweetText.trim() && !media.image && !media.video) return;

    const newTweet: Tweet = {
      id: Date.now().toString(),
      name: 'You',
      username: 'you',
      time: 'الآن',
      text: tweetText,
      image: media.image,
      video: media.video,
      views: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      avatar: 'https://picsum.photos/200',
    };

    setFeed([newTweet, ...feed]);
    setTweetText('');
    setMedia({});
    setShowComposer(false);
  };

  /* ===== Mock Media Pickers ===== */
  const pickImage = async () => {
    setLoadingMedia(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia({ image: result.assets[0].uri });
    }
    setLoadingMedia(false);
  };


  const pickVideo = async () => {
    setLoadingMedia(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled) {
      setMedia({ video: result.assets[0].uri });
    }
    setLoadingMedia(false);
  };
  const addComment = () => {
    if (!selectedTweetId || !commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      text: commentText,
      time: 'الآن',
    };

    setFeed(prev =>
      prev.map(t =>
        t.id === selectedTweetId
          ? {
            ...t,
            replies: t.replies + 1,
            comments: [...(t.comments || []), newComment],
          }
          : t
      )
    );

    setCommentText('');
  };


  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.background,
      },
    ]}>
      {/* Header */}


      {/* Feed */}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tweetCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

            <View style={styles.content}>
              {item.isRetweet && (
                <Text style={styles.retweetLabel}>
                  🔁 أعدت التغريد من @{item.originalUser}
                </Text>
              )}

              <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.text }]}>
                  {item.name}</Text>
                {item.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#1D9BF0"
                  />
                )}
                <Text style={styles.username}>
                  @{item.username} · {item.time}
                </Text>
              </View>

              <Text style={[styles.text, { color: theme.text }]}>
                {item.text}</Text>

              {item.image && (
                <Image source={{ uri: item.image }} style={styles.tweetImage} />
              )}

              {item.video && (
                <Video
                  source={{ uri: item.video }}
                  style={styles.tweetImage}
                  useNativeControls
                />
              )}

              <View style={styles.actions}>
                <Action icon="stats-chart-outline" value={item.views} />

                <Action
                  icon={item.liked ? 'heart' : 'heart-outline'}
                  value={item.likes}
                  color={item.liked ? '#EF4444' : '#6B7280'}
                  onPress={() => toggleLike(item.id)}
                />

                <Action
                  icon="repeat-outline"
                  value={item.retweets}
                  color={item.retweeted ? '#22C55E' : '#6B7280'}
                  onPress={() => toggleRetweet(item)}
                />

                <Action
                  onPress={() => {
                    setSelectedTweetId(item.id);
                    setShowComments(true);

                  }}

                  icon="chatbubble-outline"
                  value={item.replies}
                />

                <Ionicons name="share-outline" size={18} color="#6B7280" />
              </View>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowComposer(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Composer */}
      <Modal visible={showComposer} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity onPress={() => setShowComposer(false)}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '700' }}>إنشاء منشور</Text>

            <TouchableOpacity
              onPress={addTweet}
              style={{
                backgroundColor: tweetText.trim() || media.image || media.video ? '#1D9BF0' : '#93C5FD',
                paddingHorizontal: 18,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              disabled={!tweetText.trim() && !media.image && !media.video}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>نشر</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={{ uri: 'https://picsum.photos/200' }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />

              <TextInput
                placeholder="ماذا يحدث؟"
                multiline
                value={tweetText}
                onChangeText={setTweetText}
                style={{
                  flex: 1,
                  fontSize: 17,
                  lineHeight: 24,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {/* Media Preview */}
            {(media.image || media.video) && (
              <View style={{ marginTop: 14 }}>
                {media.image && (
                  <Image source={{ uri: media.image }} style={styles.previewMedia} />
                )}

                {media.video && (
                  <Video
                    source={{ uri: media.video }}
                    style={styles.previewMedia}
                    useNativeControls
                  />
                )}
              </View>
            )}
          </View>

          {/* Footer Actions */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderTopWidth: 0.5,
              borderColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#1D9BF0" />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickVideo} style={{ marginLeft: 20 }}>
              <Ionicons name="videocam-outline" size={24} color="#1D9BF0" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              {tweetText.length}/280
            </Text>
          </View>
        </View>
      </Modal>

      <Modal visible={showComments} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderBottomWidth: 0.5,
              borderColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 12 }}>
              المنشور
            </Text>
          </View>

          {/* Original Tweet */}
          <View style={{ padding: 14 }}>
            <Text style={{ fontWeight: '700' }}>
              {selectedTweet?.name}{' '}
              <Text style={{ color: '#6B7280', fontWeight: '400' }}>
                @{selectedTweet?.username}
              </Text>
            </Text>
            <Text style={{ marginTop: 6 }}>{selectedTweet?.text}</Text>
          </View>

          {/* Comments */}
          <FlatList
            data={selectedTweet?.comments || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            renderItem={({ item }) => (
              <View
                style={{
                  marginTop: 16,
                  paddingLeft: 12,
                  borderLeftWidth: 2,
                  borderColor: '#E5E7EB',
                }}
              >
                <Text style={{ fontWeight: '700' }}>{item.user}</Text>

                {editingCommentId === item.id ? (
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    autoFocus
                    style={{
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 12,
                      padding: 8,
                      marginTop: 6,
                    }}
                  />
                ) : (
                  <Text style={{ marginTop: 4 }}>{item.text}</Text>
                )}

                <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingCommentId(item.id);
                      setCommentText(item.text);
                    }}
                  >
                    <Text style={{ color: '#1D9BF0', fontSize: 12 }}>تعديل</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteComment(item.id)}>
                    <Text style={{ color: '#EF4444', fontSize: 12 }}>حذف</Text>
                  </TouchableOpacity>

                  {editingCommentId === item.id && (
                    <TouchableOpacity onPress={() => updateComment(item.id)}>
                      <Text style={{ color: '#22C55E', fontSize: 12 }}>حفظ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

          />

          {/* Add Comment */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderTopWidth: 0.5,
              borderColor: '#E5E7EB',
            }}
          >
            <TextInput
              placeholder="اكتب ردك..."
              value={commentText}
              onChangeText={setCommentText}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            />
            <TouchableOpacity onPress={addComment} style={{ marginLeft: 10 }}>
              <Ionicons name="send" size={22} color="#1D9BF0" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
}

/* =======================
   Action Component
======================= */

function Action({
  icon,
  value,
  color = '#6B7280',
  onPress,
}: {
  icon: any;
  value: number;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionItem}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.actionText, { color }]}>
        {value.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  logo: { fontSize: 20, fontWeight: '900' },
  profile: { width: 32, height: 32, borderRadius: 16 },

  tweetCard: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },

  content: { flex: 1 },

  retweetLabel: {
    fontSize: 12,
    color: '#22C55E',
    marginBottom: 4,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },

  name: { fontSize: 14, fontWeight: '700' },
  username: { fontSize: 12, color: '#6B7280' },

  text: { marginTop: 4, fontSize: 14, lineHeight: 20 },

  tweetImage: {
    marginTop: 8,
    width: '100%',
    height: 200,
    borderRadius: 16,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingRight: 20,
  },

  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D9BF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  composer: { flex: 1, padding: 16 },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  composerBody: { flexDirection: 'row', marginTop: 16 },

  inputModern: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    textAlignVertical: 'top',
  },

  publishBtnSmall: {
    backgroundColor: '#1D9BF0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  publishText: { color: '#FFF', fontWeight: '700' },

  previewMedia: {
    marginTop: 12,
    width: '100%',
    height: 200,
    borderRadius: 16,
  },

  mediaActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
  },
});
