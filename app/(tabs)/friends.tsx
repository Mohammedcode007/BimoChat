
import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { getFriends, removeFriend } from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { StoryOwnerGroup } from "@/redux/slices/storySlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";
import { formatLastSeenListFriend } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const me = useSelector((st: RootState) => st.auth?.user);

  const { friends, loading } = useSelector((state: RootState) => state.friends);
  const storiesFeed = useSelector((st: RootState) => st.stories?.feed || []);
  const myStories = useSelector((st: RootState) => st.stories?.myStories || null);
  const storiesLoading = useSelector((st: RootState) => Boolean(st.stories?.loadingFeed));
  const myStoriesLoading = useSelector((st: RootState) => Boolean(st.stories?.loadingMy));
  const [search, setSearch] = useState("");
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const seenStoryIds = useSelector((st: RootState) => (st as any).stories?.seenStoryIds || {});

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
  const isSeen = useCallback(
    (storyId?: string) => {
      if (!storyId) return false;
      return Boolean((seenStoryIds as any)[String(storyId)]);
    },
    [seenStoryIds]
  );
  const getBubbleRings = useCallback(
    (group: any) => {
      const stories = Array.isArray(group?.stories) ? group.stories : [];
      const a = stories[0];
      const b = stories[1];

      const count = Math.min(stories.length, 2);

      const activeColor = theme.tint; // لون "غير مشاهد"
      const normalColor = theme.border; // لون "مشاهد"

      const aSeen = a?._id ? isSeen(String(a._id)) : true;
      const bSeen = b?._id ? isSeen(String(b._id)) : true;

      const ring1Color = aSeen ? normalColor : activeColor;
      const ring2Color = bSeen ? normalColor : activeColor;

      // لو قصة واحدة فقط، نستخدم ring1Color
      // لو قصتين، نعرض الحلقتين
      return { count, ring1Color, ring2Color };
    },
    [isSeen, theme.tint, theme.border]
  );
  function StoryRing({
    theme,
    count,
    ring1Color,
    ring2Color,
    avatarStyle,
    children,
  }: {
    theme: any;
    count: number; // 0..2
    ring1Color: string;
    ring2Color: string;
    avatarStyle: any;
    children: React.ReactNode;
  }) {
    const OUT = 56;
    const IN = 50;

    if (count >= 2) {
      return (
        <View style={{ width: OUT, height: OUT, alignItems: "center", justifyContent: "center" }}>
          {/* Outer ring */}
          <View
            style={{
              position: "absolute",
              width: OUT,
              height: OUT,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: ring1Color,
              backgroundColor: theme.surface,
            }}
          />
          {/* Inner ring */}
          <View
            style={{
              position: "absolute",
              width: IN,
              height: IN,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: ring2Color,
              backgroundColor: "transparent",
            }}
          />
          <View style={avatarStyle}>{children}</View>
        </View>
      );
    }

    // Single ring (حتى لو count=0)
    return (
      <View
        style={{
          width: OUT,
          height: OUT,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: ring1Color,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface,
        }}
      >
        <View style={avatarStyle}>{children}</View>
      </View>
    );
  }
  const storyBubbles = useMemo(() => {
    const myId = String(me?._id || "me");

    const myStoriesArr = Array.isArray(myStories?.stories) ? myStories.stories : [];
    const myLatest = myStoriesArr.length ? myStoriesArr[0]?.createdAt : undefined;

    const myGroup: StoryOwnerGroup = {
      _id: myId,
      username: me?.username || "حالتك",
      atUsername: me?.atUsername || "",
      avatar: me?.avatar || "",
      isOnline: true,
      stories: myStoriesArr,
      latestStoryAt: myLatest,
    } as any;

    const others = (storiesFeed || []).filter((g: any) => String(g?._id) !== myId);

    const bubbles: any[] = [];

    // ✅ لو عندي حالات → اعرض فقاعتي
    if (myStoriesArr.length > 0) bubbles.push(myGroup);

    // ✅ فقاعة الإضافة دائمًا
    bubbles.push({
      _id: "add_story",
      isAddBubble: true,
    });

    return [...bubbles, ...others];
  }, [storiesFeed, myStories, me]);

  const onPressStoryBubble = (g: StoryOwnerGroup) => {
    const isMeBubble = String(g._id) === String(me?._id);
    const hasStories = (g?.stories?.length || 0) > 0;

    // ✅ لو أنا ومفيش قصص → افتح create
    if (isMeBubble && !hasStories) {
      router.push("/story/create" as any);
      return;
    }

    // ✅ لو أنا وعندي قصص → افتح Viewer بحالة خاصة me
    if (isMeBubble && hasStories) {
      router.push({
        pathname: "/story/[id]" as any,
        params: { id: "me" },
      } as any);
      return;
    }

    // ✅ أصدقاء: افتح أول قصة عندهم
    const first = (g as any)?.stories?.[0];
    if (!first?._id) return;

    router.push({
      pathname: "/story/[id]" as any,
      params: { id: String(first._id) },
    } as any);
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
      <View style={s.storiesWrap}>
        <View style={s.sectionHead}>
          {/* <Text style={s.sectionTitle}>الحالات</Text> */}
          {/* <Text style={s.sectionHint}>{storiesHint}</Text> */}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={storyBubbles}
          keyExtractor={(it: any, idx) => String(it?._id || idx)}
          // onScrollBeginDrag={onScrollBeginDrag}
          // onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ color: theme.subtleText, fontWeight: "800" }}>
                لا توجد حالات
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            // ✅ فقاعة الإضافة
            if (item?.isAddBubble) {
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={s.storyItem}
                  onPress={() => router.push("/story/create" as any)}
                >
                  <View style={[s.storyRing, s.storyRingMe]}>
                    <View style={s.storyAvatar}>
                      <Ionicons name="add" size={20} color={theme.primary} />
                    </View>
                  </View>
                  <Text style={s.storyName}>إضافة</Text>
                </TouchableOpacity>
              );
            }

            const isMeBubble = String(item._id) === String(me?._id);
            const rings = getBubbleRings(item);

            // ✅ أنا: لو عندي قصص نخلي الإطار tint (زي واتساب)
            // (ولو حابب تخليه يعتمد على seen برضه، احذف السطر التالي)
            const ring1 = isMeBubble ? theme.tint : rings.ring1Color;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={s.storyItem}
                onPress={() => onPressStoryBubble(item)}
              >
                <StoryRing
                  theme={theme}
                  count={rings.count}
                  ring1Color={ring1}
                  ring2Color={rings.ring2Color}
                  avatarStyle={s.storyAvatar}
                >
                  <Ionicons name="person" size={18} color={theme.icon} />
                </StoryRing>

                <Text style={s.storyName} numberOfLines={1}>
                  {isMeBubble ? "حالتك" : item.username || "User"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
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
                      <Text
                        style={s.name}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.username}
                      </Text>
                      {/* {!!item.atUsername && (
                        <Text style={s.handle} numberOfLines={1}>
                          {item.atUsername}
                        </Text>
                      )} */}
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

    storiesWrap: {},
    sectionHead: {
      paddingHorizontal: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    sectionTitle: { fontSize: 14, fontWeight: "900", color: theme.text },
    sectionHint: { fontSize: 12, fontWeight: "800", color: theme.subtleText },

    storyItem: { width: 70, alignItems: "center", marginRight: 10 },
    storyRing: {
      width: 56,
      height: 56,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
    },
    storyRingMe: { borderColor: theme.tint },
    storyAvatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    storyName: { marginTop: 6, fontSize: 12, fontWeight: "800", color: theme.mutedText },

    quickRow: { flexDirection: "row", gap: 10 },
    quickCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
        android: { elevation: 1 },
      }),
    },
    quickIcon: {
      width: 40,
      height: 40,
      borderRadius: 16,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    quickTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
    quickSub: { marginTop: 2, fontSize: 12, fontWeight: "800", color: theme.mutedText },

    tabs: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    tabPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabPillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    tabText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },
    tabTextActive: { color: theme.primaryText },

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