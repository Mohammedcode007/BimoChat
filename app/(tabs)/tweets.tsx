

import { Colors } from '@/constants/theme';
import {
  toggleFollow
} from '@/redux/slices/followSlice';
import {
  deleteTweet,
  getFollowingFeed,
  getForYouFeed,
  toggleLike,
  toggleRetweet
} from '@/redux/slices/tweetSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { timeAgo } from '@/utils/timeAgo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
const renderTweetText = (text: string) => {

  if (!text) return null;

  const regex = /(@[\w_]+|#[\w_]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {

    if (/^@[\w_]+$/.test(part)) {
      return (
        <Text key={index} style={styles.mention}>
          {part}
        </Text>
      );
    }

    if (/^#[\w_]+$/.test(part)) {
      return (
        <Text key={index} style={styles.hashtag}>
          {part}
        </Text>
      );
    }

    return (
      <Text key={index} style={styles.normalText}>
        {part}
      </Text>
    );
  });
};

export default function TweetsScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);

  const openSheet = (author: any) => {
    setSelectedUser(author);
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setSelectedUser(null);
  };

  const { following, forYou, loading } =
    useSelector((state: RootState) => state.tweets);

  const { followingMap } =
    useSelector((state: RootState) => state.follow);

  const { user } =
    useSelector((state: RootState) => state.auth);

  const colorScheme = useColorScheme();
  const theme =
    Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [activeTab, setActiveTab] =
    useState<'following' | 'foryou'>('following');

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const rawFeed =
    activeTab === 'following'
      ? following
      : forYou;

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    dispatch(getFollowingFeed({ page: 1 }));
    dispatch(getForYouFeed({ page: 1 }));
  }, []);

  /* ================= REFRESH ================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    if (activeTab === 'following') {
      await dispatch(getFollowingFeed({ page: 1 }));
    } else {
      await dispatch(getForYouFeed({ page: 1 }));
    }

    setRefreshing(false);
  };

  /* ================= LOAD MORE ================= */

  const handleLoadMore = () => {
    if (loading) return;

    if (activeTab === 'following') {
      dispatch(getFollowingFeed({ page: 2 }));
    } else {
      dispatch(getForYouFeed({ page: 2 }));
    }
  };

  /* ================= OPEN TWEET ================= */

  const openTweet = (tweet: any) => {
    router.push({
      pathname: '/tweet/[id]',
      params: { id: tweet._id },
    });
  };

  /* ================= MEDIA HELPER ================= */

  const isVideo = (url: string) => {
    return /\.(mp4|mov|m4v|webm)$/i.test(url);
  };
  const isValidUrl = (url?: string) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (!url.startsWith('http')) return false;
    return true;
  };
  const uniqueFeed = Array.from(
    new Map(rawFeed.map(item => [item._id, item])).values()
  );

  /* ================= RENDER ================= */

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background }
    ]}>

      {/* ===== Tabs ===== */}

      <View style={styles.tabs}>
        <TabButton
          title="Following"
          active={activeTab === 'following'}
          onPress={() => {
            setActiveTab('following');
            dispatch(getFollowingFeed({ page: 1 }));
          }}
        />
        <TabButton
          title="For You"
          active={activeTab === 'foryou'}
          onPress={() => {
            setActiveTab('foryou');
            dispatch(getForYouFeed({ page: 1 }));
          }}
        />
      </View>

      {/* ===== Feed ===== */}

      <FlatList
        data={uniqueFeed}
        keyExtractor={(item) => item._id}

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ margin: 20 }} />
          ) : null
        }
        renderItem={({ item }) => {
console.log(item,'77777777777777');

          const isOwnTweet =
            item.author._id === user?._id;

          const isFollowing =
            followingMap?.[item.author._id] ??
            item.author.isFollowing ??
            false;

          return (
            <Swipeable
              renderRightActions={() =>
                isOwnTweet ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={async () => {
                      setActionLoading(`delete-${item._id}`);
                      await dispatch(deleteTweet(item._id));
                      setActionLoading(null);
                    }}
                  >
                    {actionLoading === `delete-${item._id}` ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Ionicons
                        name="trash"
                        size={18}
                        color="#FFF"
                      />
                    )}
                  </TouchableOpacity>
                ) : null
              }
            >
              <View style={styles.tweetCard}>

               <TouchableOpacity
  onPress={() =>
    router.push({
      pathname: '/profile',
      params: { userId: item.author._id }
    })
  }
>
  <Image
    source={
      isValidUrl(item.author.avatar)
        ? { uri: item.author.avatar }
        : { uri: 'https://i.pravatar.cc/150?img=3' }
    }
    style={styles.avatar}
  />
</TouchableOpacity>



                <View style={{ flex: 1 }}>

                  <View style={styles.row}>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.name}>
                          {item.author.username}
                        </Text>

                        <Text style={styles.dot}> • </Text>

                        <Text style={styles.time}>
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>

                      <Text style={styles.username}>
                        {item.author.atUsername}
                      </Text>

                    </View>

                    {!isOwnTweet && (
                      <TouchableOpacity
                        style={[
                          styles.followBtn,
                          {
                            backgroundColor:
                              isFollowing
                                ? '#374151'
                                : '#1D9BF0',
                          }
                        ]}
                        onPress={async () => {
                          setActionLoading(`follow-${item.author._id}`);
                          await dispatch(
                            toggleFollow(item.author._id)
                          );
                          setActionLoading(null);
                        }}
                      >
                        {actionLoading === `follow-${item.author._id}` ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={{ color: '#FFF', fontSize: 12 }}>
                            {isFollowing
                              ? 'Following'
                              : 'Follow'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => openSheet(item.author)}
                      style={{ marginLeft: 10 }}
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>

                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openTweet(item)}
                  >
                    <Text style={styles.text}>
                      {renderTweetText(item.content)}
                    </Text>

                  </TouchableOpacity>

                  {/* ===== MEDIA ARRAY SUPPORT ===== */}

                  {item.media &&
                    item.media.length > 0 && (
                      <View style={{ marginTop: 10 }}>
                        {item.media.map((mediaItem: any, index: number) => {

                          const url = mediaItem.url;

                          if (!isValidUrl(url)) return null;

                          if (mediaItem.type === "video") {
                            return (
                              <Video
                                key={index}
                                source={{ uri: url }}
                                style={styles.media}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
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



                  {/* ===== Actions ===== */}

                  <View style={styles.actions}>

                    {/* ===== LIKE ===== */}
                    <Action
                      loading={actionLoading === `like-${item._id}`}
                      icon={
                        item.isLiked
                          ? 'heart'
                          : 'heart-outline'
                      }
                      value={item.likesCount}
                      onPress={async () => {
                        setActionLoading(`like-${item._id}`);
                        await dispatch(toggleLike(item._id));
                        setActionLoading(null);
                      }}
                    />

                    {/* ===== RETWEET ===== */}
                    <Action
                      loading={actionLoading === `retweet-${item._id}`}
                      icon="repeat-outline"
                      value={item.retweetsCount}
                      onPress={async () => {
                        setActionLoading(`retweet-${item._id}`);
                        await dispatch(toggleRetweet(item._id));
                        setActionLoading(null);
                      }}
                    />

                    {/* ===== COMMENT ===== */}
                    <Action
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
      {/* ===== User Bottom Sheet ===== */}

      {showSheet && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSheet}
          />

          <View style={styles.sheet}>
            {selectedUser && (
              <>
                <Text style={styles.sheetTitle}>
                  @{selectedUser.atUsername}
                </Text>

                <TouchableOpacity
                  style={styles.sheetItem}
                  onPress={async () => {
                    await dispatch(
                      toggleFollow(selectedUser._id)
                    );
                    closeSheet();
                  }}
                >
                  <Ionicons
                    name="person-remove-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text style={styles.sheetText}>
                    Unfollow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetItem}
                >
                  <Ionicons
                    name="ban-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text style={styles.sheetText}>
                    Block
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetItem}
                >
                  <Ionicons
                    name="flag-outline"
                    size={20}
                    color="#F59E0B"
                  />
                  <Text style={styles.sheetText}>
                    Report
                  </Text>
                </TouchableOpacity>

              </>
            )}
          </View>
        </View>
      )}
      {/* ===== Floating Create Tweet Button ===== */}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/create-tweet')}
      >
        <Ionicons name="create-outline" size={26} color="#FFF" />
      </TouchableOpacity>

    </View>
  );
}

/* ===== Components ===== */

function Action({ icon, value, onPress, loading }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.actionItem}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Ionicons
            name={icon}
            size={18}
            color="#6B7280"
          />
          <Text style={{ fontSize: 12, marginLeft: 4 }}>
            {value}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function TabButton({ title, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={{
        fontWeight: '700',
        fontSize: 16,
        color: active
          ? '#1D9BF0'
          : '#6B7280'
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ===== Styles ===== */

const styles = StyleSheet.create({
  container: { flex: 1 },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

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

  name: { fontWeight: '700' },

  username: {
    fontSize: 12,
    color: '#6B7280',
  },

  text: {
    marginTop: 6,
    fontSize: 14,
  },
  normalText: {
    color: '#000',
  },

  mention: {
    color: '#1D9BF0',
    fontWeight: '600',
  },

  hashtag: {
    color: '#F59E0B',
    fontWeight: '600',
  },

  media: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },

  dot: {
    marginHorizontal: 6,
    color: '#6B7280',
    fontSize: 12,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1D9BF0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  sheet: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  sheetTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 20,
  },

  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  sheetText: {
    marginLeft: 10,
    fontSize: 14,
  },


  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },

  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  deleteBtn: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    padding: 20,
  },
});
