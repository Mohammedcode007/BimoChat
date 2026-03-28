

import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { getFriends, removeFriend } from "@/redux/slices/friendSlice";
import {
    fetchMyStories,
    fetchStoriesFeed,
    StoryOwnerGroup,
} from "@/redux/slices/storySlice";
import { AppDispatch, RootState } from "@/redux/store";
import { formatLastSeenListFriend } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    FlatList,
    I18nManager,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

export default function FriendsScreen() {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
  const { language, t } = useTranslation();

  const isRTL = language === "ar" || I18nManager.isRTL;

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector((st: RootState) => st.auth?.user);
const chats = useSelector((state: RootState) => state.chat?.chats || []);
  const { friends, loading } = useSelector((state: RootState) => state.friends);
  const storiesFeed = useSelector((st: RootState) => st.stories?.feed || []);
  const myStories = useSelector((st: RootState) => st.stories?.myStories || null);
  const seenStoryIds = useSelector(
    (st: RootState) => (st as any).stories?.seenStoryIds || {}
  );

  const [search, setSearch] = useState("");
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [renderFabMenu, setRenderFabMenu] = useState(false);
  const [renderSearch, setRenderSearch] = useState(false);

  const fabAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const s = useMemo(
    () => makeStyles(theme, colorScheme === "dark", isRTL),
    [theme, colorScheme, isRTL]
  );

  const copy = useMemo(
    () => ({
      searchPlaceholder:
        t("friendsScreenLAN.searchPlaceholder") ||
        (isRTL ? "ابحث عن الأصدقاء" : "Search friends"),
      suggested:
        t("friendsScreenLAN.suggested") ||
        (isRTL ? "المقترحون" : "Suggested"),
      add:
        t("friendsScreenLAN.add") ||
        (isRTL ? "إضافة" : "Add"),
      remove:
        t("friendsScreenLAN.remove") ||
        (isRTL ? "إزالة" : "Remove"),
      deleteTitle:
        t("friendsScreenLAN.deleteTitle") ||
        (isRTL ? "تأكيد الحذف" : "Confirm removal"),
      deleteMessage:
        t("friendsScreenLAN.deleteMessage") ||
        (isRTL
          ? "هل أنت متأكد أنك تريد إزالة هذا الصديق؟"
          : "Are you sure you want to remove this friend?"),
      cancel: t("common.cancel") || (isRTL ? "إلغاء" : "Cancel"),
      confirmRemove:
        t("friendsScreenLAN.confirmRemove") ||
        (isRTL ? "إزالة" : "Remove"),
      myStory: t("stories.myStory") || (isRTL ? "حالتك" : "Your story"),
      addStory: t("stories.add") || (isRTL ? "إضافة" : "Add"),
      noStories: t("stories.noStories") || (isRTL ? "لا توجد حالات" : "No stories"),
      noMatchingFriends:
        t("friendsScreenLAN.noMatching") ||
        (isRTL ? "لا يوجد أصدقاء مطابقون" : "No matching friends"),
      noFriendsYet:
        t("friendsScreenLAN.noFriendsYet") ||
        (isRTL ? "لا يوجد أصدقاء بعد" : "No friends yet"),
      tryAnotherName:
        t("friendsScreenLAN.tryAnother") ||
        (isRTL ? "جرّب اسمًا آخر." : "Try another name."),
      addFriendsHint:
        t("friendsScreenLAN.addFriendsHint") ||
        (isRTL
          ? "أضف أصدقاء لبدء المحادثة فورًا."
          : "Add friends to start chatting instantly."),
      addFriend:
        t("friendsScreenLAN.addFriend") ||
        (isRTL ? "إضافة صديق" : "Add friend"),
      noBio: t("friendsScreenLAN.noBio") || (isRTL ? "لا توجد نبذة" : "No bio"),
      now: t("status.now") || (isRTL ? "الآن" : "Now"),
      user: t("common.user") || (isRTL ? "مستخدم" : "User"),
      searchAction: isRTL ? "بحث" : "Search",
      addFriendAction: isRTL ? "إضافة صديق" : "Add friend",
      suggestedAction: isRTL ? "أصدقاء مقترحون" : "Suggested friends",
    }),
    [t, isRTL]
  );

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([
          dispatch(getFriends()).unwrap(),
          dispatch(fetchMyStories()).unwrap(),
          dispatch(fetchStoriesFeed({ page: 1, limit: 30 })).unwrap(),
        ]);
      } catch (e) {
        console.log("Failed to load friends/stories:", e);
      }
    };

    loadAll();
  }, [dispatch]);

  useEffect(() => {
    if (showFabMenu) {
      setRenderFabMenu(true);
      Animated.spring(fabAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRenderFabMenu(false);
      });
    }
  }, [showFabMenu, fabAnim]);

  useEffect(() => {
    if (showSearch) {
      setRenderSearch(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTimeout(() => inputRef.current?.focus(), 30);
        }
      });
    } else {
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRenderSearch(false);
      });
    }
  }, [showSearch, searchAnim]);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => {
      const username = String(f.username || "").toLowerCase();
      const atUsername = String((f as any).atUsername || "").toLowerCase();
      return username.includes(q) || atUsername.includes(q);
    });
  }, [friends, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getFriends()).unwrap(),
        dispatch(fetchMyStories()).unwrap(),
        dispatch(fetchStoriesFeed({ page: 1, limit: 30 })).unwrap(),
      ]);
    } catch (e) {
      console.log("Refresh failed:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const closeFloatingUI = useCallback(() => {
    setShowFabMenu(false);
    setShowSearch(false);
  }, []);

  const openSearchPanel = useCallback(() => {
    setShowFabMenu(false);
    setShowSearch(true);
  }, []);

  const deleteFriendHandler = (id: string) => {
    Alert.alert(copy.deleteTitle, copy.deleteMessage, [
      { text: copy.cancel, style: "cancel" },
      {
        text: copy.confirmRemove,
        style: "destructive",
        onPress: () => dispatch(removeFriend(id)),
      },
    ]);
  };

  const findExistingChatId = useCallback(
  (targetUserId: string) => {
    const foundChat = chats.find((chat: any) => {
      const participants = Array.isArray(chat?.participants)
        ? chat.participants
        : [];

      return participants.some((p: any) => {
        const participantId = typeof p === "string" ? p : p?._id;
        return String(participantId) === String(targetUserId);
      });
    });

    return foundChat?._id || null;
  },
  [chats]
);

const openChat = async (targetUserId: string) => {
  if (creatingChatId) return;

  const existingChatId = findExistingChatId(targetUserId);

  if (existingChatId) {
    dispatch(setActiveChat(existingChatId));
    router.push(`/chat/${existingChatId}`);
    return;
  }

  try {
    setCreatingChatId(targetUserId);

    const chat = await dispatch(createChat(targetUserId)).unwrap();
    dispatch(setActiveChat(chat._id));
    router.push(`/chat/${chat._id}`);
  } catch (e) {
    console.log("openChat error:", e);
  } finally {
    setCreatingChatId(null);
  }
};
  // const openChat = async (targetUserId: string) => {
  //   if (creatingChatId) return;

  //   try {
  //     setCreatingChatId(targetUserId);

  //     const chat = await dispatch(createChat(targetUserId)).unwrap();
  //     dispatch(setActiveChat(chat._id));

  //     const messagesRes = await api.get(`/messages/${chat._id}?page=1`);
  //     dispatch(
  //       setMessages({
  //         chatId: chat._id,
  //         messages: messagesRes.data,
  //       })
  //     );

  //     router.push(`/chat/${chat._id}`);
  //   } catch (e) {
  //     console.log("openChat error:", e);
  //   } finally {
  //     setCreatingChatId(null);
  //   }
  // };

  const isSeen = useCallback(
    (storyId?: string) => {
      if (!storyId) return false;
      return Boolean((seenStoryIds as any)[String(storyId)]);
    },
    [seenStoryIds]
  );

  const getBubbleRingState = useCallback(
    (group: any) => {
      const stories = Array.isArray(group?.stories) ? group.stories : [];
      if (!stories.length) return { allSeen: true, hasStories: false };

      const unseenCount = stories.filter((x: any) => !isSeen(String(x?._id))).length;
      return {
        allSeen: unseenCount === 0,
        hasStories: true,
      };
    },
    [isSeen]
  );

  const getStoryVisual = useCallback((group: any) => {
    const latestPreview = group?.latestPreview || null;
    const firstStory = Array.isArray(group?.stories) ? group.stories[0] : null;

    const previewType =
      latestPreview?.type ||
      firstStory?.previewType ||
      firstStory?.type ||
      "text";

    const previewImage =
      latestPreview?.image ||
      firstStory?.previewImage ||
      firstStory?.thumbUrl ||
      firstStory?.mediaUrl ||
      "";

    const previewText =
      latestPreview?.text ||
      firstStory?.previewText ||
      firstStory?.text ||
      "";

    return {
      type: previewType,
      image: previewImage,
      text: typeof previewText === "string" ? previewText.trim() : "",
    };
  }, []);

  const storyBubbles = useMemo(() => {
    const myId = String(me?._id || "me");
    const myStoriesArr = Array.isArray(myStories?.stories) ? myStories.stories : [];
    const myLatest = myStoriesArr.length ? myStoriesArr[0]?.createdAt : undefined;

    const myGroup: StoryOwnerGroup = {
      _id: myId,
      username: me?.username || copy.myStory,
      atUsername: (me as any)?.atUsername || "",
      avatar: me?.avatar || "",
      isOnline: true,
      stories: myStoriesArr,
      latestStoryAt: myLatest,
      latestPreview: (myStories as any)?.latestPreview || null,
    } as any;

    const others = (storiesFeed || []).filter((g: any) => String(g?._id) !== myId);
    return [myGroup, ...others];
  }, [storiesFeed, myStories, me, copy.myStory]);

  const onPressStoryBubble = (g: StoryOwnerGroup) => {
    const isMeBubble = String(g._id) === String(me?._id);
    const hasStories = (g?.stories?.length || 0) > 0;

    if (isMeBubble && !hasStories) {
      router.push("/story/create" as any);
      return;
    }

    if (isMeBubble && hasStories) {
      router.push({
        pathname: "/story/[id]" as any,
        params: { id: "me" },
      } as any);
      return;
    }

    const first = (g as any)?.stories?.[0];
    if (!first?._id) return;

    router.push({
      pathname: "/story/[id]" as any,
      params: { id: String(first._id) },
    } as any);
  };

  const renderRightActions = (item: any) => (
    <View style={s.actionsWrap}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={s.deleteBtn}
        onPress={() => deleteFriendHandler(item._id)}
      >
        <Ionicons name="trash" size={18} color="#FFF" />
        <Text style={s.deleteText}>{copy.remove}</Text>
      </TouchableOpacity>
    </View>
  );

  const overlayVisible = renderFabMenu || renderSearch;

  const searchTranslateY = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  const searchScale = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const menuTranslateY1 = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const menuTranslateY2 = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  const menuTranslateY3 = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [26, 0],
  });

  const menuScale = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const menuOpacity = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const mainFabRotate = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  function StoryRing({
    seen,
    children,
  }: {
    seen: boolean;
    children: React.ReactNode;
  }) {
    if (seen) {
      return (
        <View style={s.storySeenRing}>
          <View style={s.storyInnerFrame}>{children}</View>
        </View>
      );
    }

    return (
      <LinearGradient
        colors={["#FEDA75", "#FA7E1E", "#D62976", "#962FBF", "#4F5BD5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.storyGradientRing}
      >
        <View style={s.storyInnerFrame}>{children}</View>
      </LinearGradient>
    );
  }

  function StoryPreviewContent({
    item,
    isMeBubble,
  }: {
    item: any;
    isMeBubble: boolean;
  }) {
    const visual = getStoryVisual(item);
    const fallbackAvatar = item?.avatar || (isMeBubble ? me?.avatar || "" : "");

    if (visual.image) {
      return (
        <View style={s.storyPreviewWrap}>
          <Image
            source={{ uri: visual.image }}
            style={s.storyPreviewImage}
            resizeMode="cover"
          />
          {visual.type === "video" && (
            <View style={s.storyPreviewBadge}>
              <Ionicons name="play" size={10} color="#FFF" />
            </View>
          )}
        </View>
      );
    }

    if (visual.type === "text" && visual.text) {
      return (
        <View style={[s.storyPreviewWrap, s.storyTextPreview]}>
          <Text style={s.storyTextPreviewText} numberOfLines={3}>
            {visual.text}
          </Text>
        </View>
      );
    }

    if (fallbackAvatar) {
      return (
        <Image
          source={{ uri: fallbackAvatar }}
          style={s.storyPreviewImage}
          resizeMode="cover"
        />
      );
    }

    return <Ionicons name="person" size={18} color={theme.icon} />;
  }

  return (
    <View style={s.container}>
      {(renderSearch || showSearch) && (
        <Animated.View
          pointerEvents={renderSearch ? "auto" : "none"}
          style={[
            s.searchTopWrap,
            {
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslateY }, { scale: searchScale }],
            },
          ]}
        >
          <View style={s.searchBox}>
            <View style={s.searchIconWrap}>
              <Ionicons name="search-outline" size={18} color={theme.icon} />
            </View>

            <TextInput
              ref={inputRef}
              placeholder={copy.searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              style={s.searchInput}
              placeholderTextColor={theme.mutedText}
              autoCorrect={false}
              returnKeyType="search"
            />

            {!!search.trim() ? (
              <TouchableOpacity
                onPress={() => setSearch("")}
                style={s.clearBtn}
                hitSlop={10}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle" size={18} color={theme.icon} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowSearch(false)}
                style={s.clearBtn}
                hitSlop={10}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={18} color={theme.icon} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <View style={[s.storiesWrap, renderSearch ? { marginTop: 74 } : null]}>
        <FlatList
          horizontal
          inverted={isRTL}
          showsHorizontalScrollIndicator={false}
          data={storyBubbles}
          keyExtractor={(it: any, idx) => String(it?._id || idx)}
          contentContainerStyle={s.storyListContent}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ color: theme.subtleText, fontWeight: "800" }}>
                {copy.noStories}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMeBubble = String(item._id) === String(me?._id);
            const hasStories = (item?.stories?.length || 0) > 0;
            const ringState = getBubbleRingState(item);

            if (isMeBubble && !hasStories) {
              return (
                <TouchableOpacity
                  activeOpacity={0.92}
                  style={s.storyItem}
                  onPress={() => onPressStoryBubble(item)}
                >
                  <View style={{ position: "relative" }}>
                    <View style={s.storyAddRing}>
                      <View style={s.storyInnerFrame}>
                        <View style={s.storyAddInner}>
                          <Ionicons name="add" size={20} color={theme.primary} />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push("/story/create" as any)}
                      style={s.addStoryMiniBtn}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="add" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <Text style={s.storyName} numberOfLines={1}>
                    {copy.addStory}
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                activeOpacity={0.92}
                style={s.storyItem}
                onPress={() => onPressStoryBubble(item)}
              >
                <View style={{ position: "relative" }}>
                  <StoryRing seen={ringState.allSeen}>
                    <StoryPreviewContent item={item} isMeBubble={isMeBubble} />
                  </StoryRing>

                  {isMeBubble && (
                    <TouchableOpacity
                      onPress={() => router.push("/story/create" as any)}
                      style={s.addStoryMiniBtn}
                      activeOpacity={0.9}
                    >
                      <Ionicons name="add" size={14} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={s.storyName} numberOfLines={1}>
                  {isMeBubble ? copy.myStory : item.username || copy.user}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
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
                {search.trim() ? copy.noMatchingFriends : copy.noFriendsYet}
              </Text>
              <Text style={s.emptySub}>
                {search.trim() ? copy.tryAnotherName : copy.addFriendsHint}
              </Text>
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
                activeOpacity={0.92}
                onPress={() => openChat(item._id)}
                style={s.rowPress}
              >
                <View style={s.row}>
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

                  <View style={s.info}>
                    <View style={s.nameLine}>
                      <Text style={s.name} numberOfLines={1} ellipsizeMode="tail">
                        {item.username}
                      </Text>
                    </View>

                    <Text style={s.bio} numberOfLines={1}>
                      {cleanBio || copy.noBio}
                    </Text>
                  </View>

                  <View style={s.right}>
                    <Text style={s.time} numberOfLines={1}>
                      {item.isOnline ? copy.now : formatLastSeenListFriend(item.lastSeen)}
                    </Text>

                    {creatingChatId === item._id && (
                      <ActivityIndicator
                        size="small"
                        color={theme.primary}
                        style={{ marginTop: 6 }}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />

      {overlayVisible && <Pressable style={s.overlay} onPress={closeFloatingUI} />}

      <View style={s.fabArea} pointerEvents="box-none">
        {(renderFabMenu || showFabMenu) && (
          <>
            <Animated.View
              pointerEvents={renderFabMenu ? "auto" : "none"}
              style={[
                s.menuItemWrap,
                {
                  opacity: menuOpacity,
                  transform: [{ translateY: menuTranslateY1 }, { scale: menuScale }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                style={s.miniFabRow}
                onPress={openSearchPanel}
              >
                <View style={s.miniFabLabel}>
                  <Text style={s.miniFabLabelText}>{copy.searchAction}</Text>
                </View>
                <View style={s.miniFabIcon}>
                  <Ionicons name="search-outline" size={18} color={theme.primaryText} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              pointerEvents={renderFabMenu ? "auto" : "none"}
              style={[
                s.menuItemWrap,
                {
                  opacity: menuOpacity,
                  transform: [{ translateY: menuTranslateY2 }, { scale: menuScale }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                style={s.miniFabRow}
                onPress={() => {
                  setShowFabMenu(false);
                  router.push("/add-friend");
                }}
              >
                <View style={s.miniFabLabel}>
                  <Text style={s.miniFabLabelText}>{copy.addFriendAction}</Text>
                </View>
                <View style={s.miniFabIcon}>
                  <Ionicons name="person-add-outline" size={18} color={theme.primaryText} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              pointerEvents={renderFabMenu ? "auto" : "none"}
              style={[
                s.menuItemWrap,
                {
                  opacity: menuOpacity,
                  transform: [{ translateY: menuTranslateY3 }, { scale: menuScale }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                style={s.miniFabRow}
                onPress={() => {
                  setShowFabMenu(false);
                  router.push("/suggested-friends");
                }}
              >
                <View style={s.miniFabLabel}>
                  <Text style={s.miniFabLabelText}>{copy.suggestedAction}</Text>
                </View>
                <View style={s.miniFabIcon}>
                  <Ionicons name="people-outline" size={18} color={theme.primaryText} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.95}
          style={s.mainFab}
          onPress={() => {
            setShowSearch(false);
            setShowFabMenu((prev) => !prev);
          }}
        >
          <Animated.View style={{ transform: [{ rotate: mainFabRotate }] }}>
            <Ionicons name="add" size={28} color={theme.primaryText} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 12,
      paddingTop: 8,
    },

    searchTopWrap: {
      position: "absolute",
      top: 8,
      left: 12,
      right: 12,
      zIndex: 30,
    },

    searchBox: {
      minHeight: 56,
      borderRadius: 20,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.18 : 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 6 },
      }),
    },

    searchIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      fontWeight: "700",
      marginHorizontal: 10,
      textAlign: isRTL ? "right" : "left",
      writingDirection: isRTL ? "rtl" : "ltr",
    },

    clearBtn: {
      width: 32,
      height: 32,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    storiesWrap: {
      marginBottom: 8,
    },

    storyListContent: {
      paddingHorizontal: 2,
      paddingVertical: 6,
    },

    storyItem: {
      width: 72,
      alignItems: "center",
      marginHorizontal: 4,
    },

    storyGradientRing: {
      width: 62,
      height: 62,
      borderRadius: 31,
      padding: 2.5,
      alignItems: "center",
      justifyContent: "center",
    },

    storySeenRing: {
      width: 62,
      height: 62,
      borderRadius: 31,
      padding: 2.5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.border,
    },

    storyAddRing: {
      width: 62,
      height: 62,
      borderRadius: 31,
      padding: 2.5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.border,
    },

    storyInnerFrame: {
      width: "100%",
      height: "100%",
      borderRadius: 30,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    addStoryMiniBtn: {
      position: "absolute",
      bottom: 0,
      right: isRTL ? undefined : 0,
      left: isRTL ? 0 : undefined,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.background,
    },
    storyAddInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },

    storyPreviewWrap: {
      width: 54,
      height: 54,
      borderRadius: 27,
      overflow: "hidden",
      backgroundColor: theme.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },

    storyPreviewImage: {
      width: "100%",
      height: "100%",
    },

    storyPreviewBadge: {
      position: "absolute",
      bottom: 3,
      right: 3,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },

    storyTextPreview: {
      paddingHorizontal: 5,
      paddingVertical: 5,
      backgroundColor: theme.surface2,
    },

    storyTextPreviewText: {
      fontSize: 8,
      fontWeight: "900",
      lineHeight: 10,
      color: theme.text,
      textAlign: "center",
    },

    storyName: {
      marginTop: 6,
      fontSize: 11,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: "center",
      maxWidth: 68,
    },

    rowPress: {
      borderRadius: 16,
      overflow: "hidden",
    },

    row: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
    },

    sep: {
      height: 8,
    },

    avatarWrap: {
      width: 46,
      height: 46,
      borderRadius: 16,
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
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
      right: isRTL ? undefined : -2,
      left: isRTL ? -2 : undefined,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.background,
    },

    onlineDot: {
      backgroundColor: theme.success ?? "#22C55E",
    },

    offlineDot: {
      backgroundColor: theme.mutedText ?? "#9CA3AF",
    },

    info: {
      flex: 1,
      paddingRight: isRTL ? 0 : 10,
      paddingLeft: isRTL ? 10 : 0,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },

    nameLine: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      maxWidth: 170,
      textAlign: isRTL ? "right" : "left",
    },

    bio: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: isRTL ? "right" : "left",
    },

    right: {
      alignItems: isRTL ? "flex-start" : "flex-end",
      justifyContent: "center",
      minWidth: 86,
    },

    time: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: isRTL ? "left" : "right",
    },

    actionsWrap: {
      justifyContent: "center",
      alignItems: "flex-end",
      paddingLeft: 10,
    },

    deleteBtn: {
      width: 96,
      height: "88%",
      borderRadius: 16,
      backgroundColor: theme.danger ?? "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
    },

    deleteText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "900",
    },

    centerPad: {
      paddingTop: 60,
    },

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
      textAlign: "center",
    },

    emptySub: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "center",
      marginBottom: 14,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.08)",
      zIndex: 20,
    },

  fabArea: {
  position: "absolute",
  bottom: 90, // ✅ بدل 24
  right: isRTL ? undefined : 18,
  left: isRTL ? 18 : undefined,
  zIndex: 40,
  alignItems: isRTL ? "flex-start" : "flex-end",
},

    menuItemWrap: {
      marginBottom: 10,
    },

    miniFabRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },

    miniFabLabel: {
      paddingHorizontal: 14,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.16 : 0.07,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 3 },
      }),
    },

    miniFabLabelText: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 12,
    },

    miniFabIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 4 },
      }),
    },

    mainFab: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.primary,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 12 },
        },
        android: { elevation: 7 },
      }),
    },
  });
}