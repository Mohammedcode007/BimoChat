// app/(tabs)/home.tsx
// ✅ Home Screen عصري + يدعم Light/Dark عبر Colors + يعمل مع الباك (Rooms + Tweets + Friends اختياري)
// ✅ يحتوي أعلى الصفحة على "حالات" مثل واتساب (منظر فقط - Mock)
// ✅ Pull to refresh + تحميل المزيد للتغريدات + أقسام واضحة

import { Colors } from "@/constants/theme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import {
  getFriends,
  getPendingRequests
} from "@/redux/slices/friendSlice";
import {
  fetchRoomsByType,
  RoomItem,
  RoomType,
  selectRoomLoadingRooms,
  selectRooms,
} from "@/redux/slices/room.slice";
import {
  getFollowingFeed,
  getForYouFeed,
  toggleLike,
  toggleRetweet,
  Tweet,
} from "@/redux/slices/tweetSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

/* ================= MOCK: حالات (منظر فقط) ================= */

/* ================= MOCK: حالات (منظر فقط) ================= */

type Story = {
  id: string;
  name: string;
  isMe?: boolean;
};

const MOCK_STORIES: Story[] = [
  { id: "me", name: "حالتك", isMe: true },
  { id: "s1", name: "أحمد" },
  { id: "s2", name: "سارة" },
  { id: "s3", name: "محمود" },
  { id: "s4", name: "ليلى" },
  { id: "s5", name: "يوسف" },
];
type FeedTab = "forYou" | "following" | "rooms";

/* ================= Screen ================= */

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();

  // Rooms
  const rooms = useSelector(selectRooms);
  const roomsLoading = useSelector(selectRoomLoadingRooms);

  // Tweets (اعتمادًا على tweetSlice state داخل RootState)
  const tweetsForYou = useSelector((st: RootState) => st.tweets?.forYou || []);
  const tweetsFollowing = useSelector((st: RootState) => st.tweets?.following || []);
  const tweetsLoading = useSelector((st: RootState) => Boolean(st.tweets?.loading));
  const tweetsHasMore = useSelector((st: RootState) => Boolean(st.tweets?.hasMore));

  // Friends (اختياري)
  const friends = useSelector((st: RootState) => st.friends?.friends || []);
  const pending = useSelector((st: RootState) => st.friends?.pendingRequests || []);

  const [tab, setTab] = useState<FeedTab>("forYou");
  const [refreshing, setRefreshing] = useState(false);

  const [pageForYou, setPageForYou] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);

  useEffect(() => {
    // ✅ تحميل أولي
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bootstrap = async () => {
    try {
      await Promise.allSettled([
        dispatch(fetchRoomsByType({ type: "public" as RoomType, page: 1, limit: 30 }) as any),
        dispatch(getForYouFeed({ page: 1 }) as any),
        dispatch(getFollowingFeed({ page: 1 }) as any),
        dispatch(getFriends() as any),
        dispatch(getPendingRequests() as any),
      ]);
      setPageForYou(1);
      setPageFollowing(1);
    } catch {
      // تجاهل
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await bootstrap();
    setRefreshing(false);
  };

  const data = useMemo(() => {
    if (tab === "rooms") return rooms as any[];
    if (tab === "following") return tweetsFollowing as any[];
    return tweetsForYou as any[];
  }, [tab, rooms, tweetsForYou, tweetsFollowing]);

  const listKey = tab; // ✅ يضمن إعادة بناء القائمة عند تغيير التبويب

  const onPressRoom = (r: RoomItem) => {
    router.push({ pathname: "/room/[id]" as any, params: { id: String(r._id) } } as any);
  };

  const onPressTweet = (t: Tweet) => {
    // عدّل المسار حسب شاشاتك
    router.push({ pathname: "/tweet/[id]" as any, params: { id: String(t._id) } } as any);
  };

  const loadMore = async () => {
    if (tab === "rooms") {
      // ✅ (اختياري) لو عندك pagination للغرف في الباك
      return;
    }

    if (!tweetsHasMore || tweetsLoading) return;

    if (tab === "forYou") {
      const next = pageForYou + 1;
      setPageForYou(next);
      await dispatch(getForYouFeed({ page: next }) as any);
      return;
    }

    if (tab === "following") {
      const next = pageFollowing + 1;
      setPageFollowing(next);
      await dispatch(getFollowingFeed({ page: next }) as any);
      return;
    }
  };

  const header = useMemo(() => {
    return (
      <View>
   

        {/* ===== Stories (منظر فقط) ===== */}
        <View style={s.storiesWrap}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>الحالات</Text>
            <Text style={s.sectionHint}>منظر فقط (سيتم تفعيلها لاحقًا)</Text>
          </View>

        <FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={MOCK_STORIES}
  keyExtractor={(it) => it.id}
   onScrollBeginDrag={onScrollBeginDrag}
      onScroll={onScroll}
  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
  renderItem={({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={s.storyItem}>
      <View style={[s.storyRing, item.isMe && s.storyRingMe]}>
        <View style={s.storyAvatar}>
          <Ionicons
            name={item.isMe ? "add" : "person"}
            size={18}
            color={item.isMe ? theme.primary : theme.icon}
          />
        </View>
      </View>
      <Text style={s.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )}
/>
        </View>

        {/* ===== Quick Cards ===== */}
        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <View style={s.quickRow}>
            <QuickCard
              theme={theme}
              title="الغرف"
              sub={`${rooms?.length || 0} غرفة`}
              icon="people-outline"
              onPress={() => setTab("rooms")}
            />
            <QuickCard
              theme={theme}
              title="الأصدقاء"
              sub={`${friends?.length || 0} صديق`}
              icon="person-outline"
              onPress={() => router.push("/(tabs)/friends" as any)}
            />
          </View>
        </View>

        {/* ===== Tabs ===== */}
        <View style={s.tabs}>
          <TabPill theme={theme} active={tab === "forYou"} label="For You" icon="sparkles-outline" onPress={() => setTab("forYou")} />
          <TabPill theme={theme} active={tab === "following"} label="Following" icon="people-outline" onPress={() => setTab("following")} />
          <TabPill theme={theme} active={tab === "rooms"} label="Rooms" icon="chatbubbles-outline" onPress={() => setTab("rooms")} />
        </View>

        {/* ===== Section Title for list ===== */}
        <View style={[s.sectionHead, { paddingHorizontal: 16, paddingTop: 6 }]}>
          <Text style={s.sectionTitle}>
            {tab === "rooms" ? "الغرف المقترحة" : tab === "following" ? "متابعة" : "لك"}
          </Text>
          <Text style={s.sectionHint}>
            {tab === "rooms" ? "اضغط للدخول" : "اسحب للتحديث - واستمر للتحميل"}
          </Text>
        </View>
      </View>
    );
  }, [s, theme, router, tab, rooms?.length, friends?.length, pending?.length]);

  const renderItem = ({ item }: { item: any }) => {
    if (tab === "rooms") {
      return <RoomCard theme={theme} room={item as RoomItem} onPress={() => onPressRoom(item)} />;
    }

    return (
      <TweetCard
        theme={theme}
        tweet={item as Tweet}
        onPress={() => onPressTweet(item)}
        onLike={() => dispatch(toggleLike(String(item._id)) as any)}
        onRetweet={() => dispatch(toggleRetweet(String(item._id)) as any)}
      />
    );
  };

  const footer = () => {
    if (tab === "rooms") {
      if (roomsLoading) return <Loader theme={theme} />;
      return <View style={{ height: 16 }} />;
    }

    if (tweetsLoading) return <Loader theme={theme} />;
    if (!tweetsHasMore) return <EndLine theme={theme} text="لا يوجد المزيد" />;
    return <View style={{ height: 16 }} />;
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <FlatList
        key={listKey}
        data={data}
        keyExtractor={(it: any, idx) => String(it?._id || it?.id || idx)}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint as any}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <EmptyState
              theme={theme}
              title="لا توجد بيانات"
              sub={tab === "rooms" ? "لم يتم العثور على غرف" : "لم يتم العثور على منشورات"}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ================= Components ================= */

function TabPill({
  theme,
  active,
  label,
  icon,
  onPress,
}: {
  theme: any;
  active: boolean;
  label: string;
  icon: any;
  onPress: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[s.tabPill, active && s.tabPillActive]}
    >
      <Ionicons name={icon} size={16} color={active ? theme.primaryText : theme.icon} />
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickCard({
  theme,
  title,
  sub,
  icon,
  onPress,
}: {
  theme: any;
  title: string;
  sub: string;
  icon: any;
  onPress: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.quickCard} onPress={onPress}>
      <View style={s.quickIcon}>
        <Ionicons name={icon} size={18} color={theme.tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.quickTitle}>{title}</Text>
        <Text style={s.quickSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.icon} />
    </TouchableOpacity>
  );
}

function RoomCard({
  theme,
  room,
  onPress,
}: {
  theme: any;
  room: RoomItem;
  onPress: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  const members = Number(room?.usersCount || 0);
  const boost = Number(room?.boostLevel || 0);

  return (
    <TouchableOpacity activeOpacity={0.92} style={s.card} onPress={onPress}>
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Ionicons name="chatbubbles" size={18} color={theme.tint} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {room?.name || "Room"}
            </Text>

            {room?.type === "protected" && (
              <View style={s.pill}>
                <Ionicons name="lock-closed" size={12} color={theme.warning} />
                <Text style={s.pillText}>Protected</Text>
              </View>
            )}

            {boost > 0 && (
              <View style={[s.pill, { backgroundColor: theme.pillHotBg }]}>
                <Ionicons name="flame" size={12} color={theme.pillHotFg} />
                <Text style={[s.pillText, { color: theme.pillHotFg }]}>Boost {boost}</Text>
              </View>
            )}
          </View>

          {!!room?.description && (
            <Text style={s.cardSub} numberOfLines={2}>
              {room.description}
            </Text>
          )}

          <View style={s.metaRow}>
            <View style={s.metaPill}>
              <Ionicons name="people-outline" size={14} color={theme.icon} />
              <Text style={s.metaText}>{members} أعضاء</Text>
            </View>

            <View style={s.metaPill}>
              <Ionicons name="pricetag-outline" size={14} color={theme.icon} />
              <Text style={s.metaText}>{room?.type || "public"}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TweetCard({
  theme,
  tweet,
  onPress,
  onLike,
  onRetweet,
}: {
  theme: any;
  tweet: Tweet;
  onPress: () => void;
  onLike: () => void;
  onRetweet: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  const author = tweet?.author;

  return (
    <TouchableOpacity activeOpacity={0.92} style={s.card} onPress={onPress}>
      <View style={s.cardTop}>
        <View style={s.avatar}>
          <Ionicons name="person" size={18} color={theme.icon} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={s.tweetHeaderRow}>
            <Text style={s.cardTitle} numberOfLines={1}>
              {author?.username || "User"}
            </Text>
            {!!author?.atUsername && <Text style={s.handle} numberOfLines={1}>{author.atUsername}</Text>}
          </View>

          <Text style={s.tweetText} numberOfLines={5}>
            {tweet?.content || ""}
          </Text>

          <View style={s.actionsRow}>
            <ActionBtn
              theme={theme}
              icon={tweet?.isLiked ? "heart" : "heart-outline"}
              label={String(tweet?.likesCount ?? 0)}
              onPress={onLike}
              active={!!tweet?.isLiked}
            />
            <ActionBtn
              theme={theme}
              icon={tweet?.isRetweeted ? "repeat" : "repeat-outline"}
              label={String(tweet?.retweetsCount ?? 0)}
              onPress={onRetweet}
              active={!!tweet?.isRetweeted}
            />
            <View style={s.actionsSpacer} />
            <Ionicons name="chevron-forward" size={18} color={theme.icon} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ActionBtn({
  theme,
  icon,
  label,
  onPress,
  active,
}: {
  theme: any;
  icon: any;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.actionBtn, active && { backgroundColor: theme.primarySoft }]}
    >
      <Ionicons name={icon} size={16} color={active ? theme.tint : theme.icon} />
      <Text style={[s.actionText, active && { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Loader({ theme }: { theme: any }) {
  return (
    <View style={{ paddingVertical: 16, alignItems: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8, color: theme.mutedText, fontWeight: "700", fontSize: 12 }}>
        جاري التحميل...
      </Text>
    </View>
  );
}

function EndLine({ theme, text }: { theme: any; text: string }) {
  return (
    <View style={{ paddingVertical: 18, alignItems: "center" }}>
      <Text style={{ color: theme.subtleText, fontWeight: "800", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function EmptyState({ theme, title, sub }: { theme: any; title: string; sub: string }) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={s.emptyBox}>
      <View style={s.emptyIcon}>
        <Ionicons name="alert-circle-outline" size={18} color={theme.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.emptyTitle}>{title}</Text>
        <Text style={s.emptySub}>{sub}</Text>
      </View>
    </View>
  );
}

/* ================= Styles ================= */

function makeStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    topBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: theme.background,
    },
    topTitle: { fontSize: 20, fontWeight: "900", color: theme.text },
    topSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: theme.mutedText },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
        android: { elevation: 1 },
      }),
    },
    dot: {
      position: "absolute",
      top: 10,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: 99,
      backgroundColor: theme.danger,
      borderWidth: 2,
      borderColor: theme.background,
    },

    storiesWrap: { paddingTop: 12 },
    sectionHead: {
      paddingHorizontal: 16,
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

    card: {
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
        android: { elevation: 1 },
      }),
    },
    cardTop: { flexDirection: "row", gap: 10 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 14, fontWeight: "900", color: theme.text, maxWidth: 220 },
    cardSub: { marginTop: 6, fontSize: 12, fontWeight: "800", color: theme.mutedText, lineHeight: 18 },

    metaRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
    metaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    metaText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },

    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pillText: { fontSize: 11, fontWeight: "900", color: theme.text },

    tweetHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    handle: { fontSize: 12, fontWeight: "800", color: theme.mutedText, maxWidth: 140 },
    tweetText: { marginTop: 8, fontSize: 14, fontWeight: "800", color: theme.text, lineHeight: 20 },

    actionsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },
    actionsSpacer: { flex: 1 },

    emptyBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
    emptySub: { marginTop: 2, fontSize: 12, fontWeight: "800", color: theme.mutedText },
  });
}