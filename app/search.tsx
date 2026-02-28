// app/(tabs)/search.tsx  (أو المسار الذي تستخدمه)
// ✅ بحث فعلي يعتمد على الـ Redux slices التي أرسلتها سابقًا:
// - Users: friends/searchUsers
// - Rooms: room/searchRooms
// - Tweets: فلترة محلية من tweets.forYou + tweets.following (لأنك لم ترسل Endpoint بحث)
// - Store: listStoreItems ثم فلترة محلية بالاسم/الوصف/key
// ✅ يدعم Light/Dark عبر Colors + نفس theme
// ✅ Debounce للبحث + Tabs + تصميم عصري

import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { searchUsers } from "@/redux/slices/friendSlice";
import { searchRooms } from "@/redux/slices/room.slice";
import { listStoreItems } from "@/redux/slices/storeControl.slice";
import type { AppDispatch, RootState } from "@/redux/store";

const TABS = ["All", "Users", "Rooms", "Tweets", "Store"] as const;
type Tab = (typeof TABS)[number];

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const q = query.trim();
  const debouncedQ = useDebouncedValue(q, 350);
  const isSearching = debouncedQ.length > 0;

  // ===== Redux sources =====
  const friendsState = useSelector((st: RootState) => st.friends);
  const roomState = useSelector((st: RootState) => st.room);
  const tweetsState = useSelector((st: RootState) => st.tweets); // tweetSlice name = "tweets"
  const storeState = useSelector((st: RootState) => st.storeControl);

  const users = friendsState.searchResults || [];
  const rooms = useMemo(() => {
    // searchRooms عندك يرجع items ويكتب في state.rooms مباشرة
    // ملاحظة: لو تريد عدم كسر قائمة الغرف العامة، الأفضل تعمل state.searchResults منفصل.
    return roomState.rooms || [];
  }, [roomState.rooms]);

  const allTweets = useMemo(() => {
    const arr = [
      ...(tweetsState?.forYou || []),
      ...(tweetsState?.following || [])
    ];
    // إزالة التكرارات
    const seen = new Set<string>();
    const out: any[] = [];
    for (const t of arr) {
      const id = String(t?._id || "");
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(t);
    }
    return out;
  }, [tweetsState?.forYou, tweetsState?.following]);

  const storeItems = storeState.items || [];

  // ===== Local filtering helpers =====
  const norm = (x: any) => String(x || "").toLowerCase();

  const filteredTweets = useMemo(() => {
    if (!debouncedQ) return [];
    const qq = norm(debouncedQ);
    return allTweets.filter((t) => {
      const c = norm(t?.content);
      const author = norm(t?.author?.username) + " " + norm(t?.author?.atUsername);
      return c.includes(qq) || author.includes(qq);
    });
  }, [allTweets, debouncedQ]);

  const filteredStore = useMemo(() => {
    if (!debouncedQ) return [];
    const qq = norm(debouncedQ);
    return storeItems.filter((it: any) => {
      const hay =
        `${it?.name || ""} ${it?.description || ""} ${it?.key || ""} ${it?.type || ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [storeItems, debouncedQ]);

  // ===== Loading =====
  const loadingUsers = Boolean(friendsState.loading);
  const loadingRooms = Boolean(roomState.loadingRooms);
  const loadingStore = Boolean(storeState.loadingItems);

  const anyLoading = loadingUsers || loadingRooms || loadingStore;

  // ===== Prevent dispatch spam on same query =====
  const lastQRef = useRef<string>("");

  useEffect(() => {
    if (!debouncedQ) return;

    // لا تعيد نفس البحث
    if (lastQRef.current === debouncedQ) return;
    lastQRef.current = debouncedQ;

    // 1) Users
    dispatch(searchUsers(debouncedQ));

    // 2) Rooms
    dispatch(searchRooms({ q: debouncedQ, limit: 25 }));

    // 3) Store (تحميل العناصر ثم فلترة محليًا)
    //    إن كان عندك endpoint بحث للمتجر، استبدلها بنداء search server-side.
    dispatch(listStoreItems({ type: "", active: true }));

    // 4) Tweets: فلترة محلية من الـ feed الحالي
    //    إن أردت بحث فعلي من السيرفر، أضف thunk: searchTweets(query)
  }, [debouncedQ, dispatch]);

const onPressUser = (u: any) => {
  router.push({
    pathname: "/profile/[id]" as any,
    params: {
      id: String(u._id),
      userId: String(u._id), // ✅ إضافة userId
    },
  } as any);
};

  const onPressRoom = (r: any) => {
    router.push({ pathname: "/room/[id]" as any, params: { id: String(r._id) } } as any);
  };

  const onPressTweet = (t: any) => {
    router.push({ pathname: "/tweet/[id]" as any, params: { id: String(t._id) } } as any);
  };

  const onPressStoreItem = (it: any) => {
    // عدّل حسب شاشة المتجر/تفاصيل العنصر
    router.push({ pathname: "/store" as any } as any);
  };

  const renderHeader = () => (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle}>البحث</Text>
        <Text style={s.headerSub}>ابحث في المستخدمين والغرف والتغريدات والمتجر</Text>
      </View>

      <View style={s.headerChip}>
        <Ionicons name="sparkles" size={14} color={theme.tint} />
        <Text style={s.headerChipText}>Bimo</Text>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={s.searchWrap}>
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={20} color={theme.icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث..."
          placeholderTextColor={theme.subtleText as any}
          style={s.input}
          autoCorrect={false}
          returnKeyType="search"
          textAlign="right"
        />
        {!!query.trim() && (
          <TouchableOpacity onPress={() => setQuery("")} style={s.clearBtn} hitSlop={10}>
            <Ionicons name="close" size={18} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabsRow}>
        {TABS.map((t) => {
          const active = activeTab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.85}
              style={[s.tab, active && s.tabActive]}
            >
              <Text style={[s.tabText, active && s.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        <View style={s.sectionLine} />
      </View>
      <View style={s.card}>{children}</View>
    </View>
  );

  const EmptyLine = ({ text }: { text: string }) => (
    <View style={s.emptyLine}>
      <Ionicons name="alert-circle-outline" size={16} color={theme.icon} />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );

  const Row = ({
    icon,
    title,
    subtitle,
    onPress,
    right,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity activeOpacity={0.85} style={s.row} onPress={onPress}>
      <View style={s.rowLeft}>
        <View style={s.rowIconBox}>
          <Ionicons name={icon} size={18} color={theme.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={s.rowSub} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {right ?? <Ionicons name="chevron-forward" size={18} color={theme.icon} />}
    </TouchableOpacity>
  );

  const TweetCard = ({ t }: { t: any }) => (
    <TouchableOpacity activeOpacity={0.85} style={s.tweetCard} onPress={() => onPressTweet(t)}>
      <View style={s.tweetTop}>
        <View style={s.tweetAvatar} />
        <View style={{ flex: 1 }}>
          <View style={s.tweetMetaRow}>
            <Text style={s.tweetName} numberOfLines={1}>
              {String(t?.author?.username || "User")}
            </Text>
            <Text style={s.tweetHandle} numberOfLines={1}>
              {String(t?.author?.atUsername || "")}
            </Text>
          </View>
          <Text style={s.tweetText} numberOfLines={3}>
            {String(t?.content || "")}
          </Text>
          <View style={s.tweetBadgesRow}>
            <View style={s.smallPill}>
              <Ionicons name="heart-outline" size={14} color={theme.icon} />
              <Text style={s.smallPillText}>{Number(t?.likesCount || 0)}</Text>
            </View>
            <View style={s.smallPill}>
              <Ionicons name="chatbubble-outline" size={14} color={theme.icon} />
              <Text style={s.smallPillText}>{Number(t?.repliesCount || 0)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderResults = () => {
    if (!isSearching) {
      return (
        <View style={{ padding: 16 }}>
          <View style={s.discoverCard}>
            <View style={s.discoverTop}>
              <View>
                <Text style={s.discoverTitle}>Discover</Text>
                <Text style={s.discoverSub}>ابدأ بكتابة كلمة للبحث</Text>
              </View>
              <View style={s.discoverChip}>
                <Ionicons name="flash" size={14} color={theme.warning} />
                <Text style={s.discoverChipText}>Quick</Text>
              </View>
            </View>

            <View style={s.grid}>
              <View style={s.tile}>
                <Ionicons name="people-outline" size={18} color={theme.tint} />
                <Text style={s.tileTitle}>Users</Text>
                <Text style={s.tileSub}>ابحث عن أشخاص</Text>
              </View>

              <View style={s.tile}>
                <Ionicons name="home-outline" size={18} color={theme.tint} />
                <Text style={s.tileTitle}>Rooms</Text>
                <Text style={s.tileSub}>ابحث عن غرف</Text>
              </View>

              <View style={s.tile}>
                <Ionicons name="chatbox-ellipses-outline" size={18} color={theme.tint} />
                <Text style={s.tileTitle}>Tweets</Text>
                <Text style={s.tileSub}>فلترة من الـ Feed</Text>
              </View>

              <View style={s.tile}>
                <Ionicons name="bag-handle-outline" size={18} color={theme.tint} />
                <Text style={s.tileTitle}>Store</Text>
                <Text style={s.tileSub}>عناصر المتجر</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // شريط تحميل صغير أعلى النتائج
    const LoadingLine = () =>
      anyLoading ? (
        <View style={s.loadingLine}>
          <ActivityIndicator />
          <Text style={s.loadingText}>جاري البحث...</Text>
        </View>
      ) : null;

    return (
      <View style={{ paddingTop: 8, paddingBottom: 18 }}>
        <LoadingLine />

        {(activeTab === "All" || activeTab === "Users") && (
          <Section title="Users">
            {loadingUsers ? (
              <View style={s.centerPad}>
                <ActivityIndicator />
              </View>
            ) : users.length ? (
              users.slice(0, activeTab === "Users" ? 50 : 6).map((u: any) => (
                <Row
                  key={String(u._id)}
                  icon="person-circle-outline"
                  title={String(u.username || "User")}
                  subtitle={String(u.atUsername || "")}
                  onPress={() => onPressUser(u)}
                  right={
                    <View style={s.rightPill}>
                      <Text style={s.rightPillText}>
                        {u.isOnline ? "Online" : "Offline"}
                      </Text>
                    </View>
                  }
                />
              ))
            ) : (
              <EmptyLine text="لا توجد نتائج للمستخدمين" />
            )}
          </Section>
        )}

        {(activeTab === "All" || activeTab === "Rooms") && (
          <Section title="Rooms">
            {loadingRooms ? (
              <View style={s.centerPad}>
                <ActivityIndicator />
              </View>
            ) : rooms.length ? (
              rooms.slice(0, activeTab === "Rooms" ? 50 : 6).map((r: any) => (
                <Row
                  key={String(r._id)}
                  icon="people-outline"
                  title={String(r.name || "Room")}
                  subtitle={`${Number(r.usersCount || 0)} users • ${String(r.type || "")}`}
                  onPress={() => onPressRoom(r)}
                />
              ))
            ) : (
              <EmptyLine text="لا توجد نتائج للغرف" />
            )}
          </Section>
        )}

        {(activeTab === "All" || activeTab === "Tweets") && (
          <Section title="Tweets">
            {filteredTweets.length ? (
              filteredTweets
                .slice(0, activeTab === "Tweets" ? 50 : 4)
                .map((t: any) => <TweetCard key={String(t._id)} t={t} />)
            ) : (
              <EmptyLine text="لا توجد نتائج للتغريدات (تحتاج أن يكون الـ Feed محمّل مسبقًا)" />
            )}
          </Section>
        )}

        {(activeTab === "All" || activeTab === "Store") && (
          <Section title="Store">
            {loadingStore ? (
              <View style={s.centerPad}>
                <ActivityIndicator />
              </View>
            ) : filteredStore.length ? (
              filteredStore
                .slice(0, activeTab === "Store" ? 80 : 6)
                .map((it: any) => (
                  <Row
                    key={String(it._id)}
                    icon="bag-outline"
                    title={String(it.name || it.key || "Item")}
                    subtitle={`${String(it.type || "")} • ${Number(it.priceCoinz || 0)} Coinz`}
                    onPress={() => onPressStoreItem(it)}
                    right={
                      <View style={s.pricePill}>
                        <Ionicons name="logo-bitcoin" size={14} color={theme.warning} />
                        <Text style={s.priceText}>{Number(it.priceCoinz || 0)}</Text>
                      </View>
                    }
                  />
                ))
            ) : (
              <EmptyLine text="لا توجد نتائج للمتجر" />
            )}
          </Section>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={[1]}
        keyExtractor={() => "k"}
        renderItem={null}
        contentContainerStyle={{ paddingBottom: 18 }}
        ListHeaderComponent={renderResults()}
      />
    </SafeAreaView>
  );
}

/* ================= Styles (Theme) ================= */

function makeStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    header: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },
    headerSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
    },
    headerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerChipText: { fontSize: 12, fontWeight: "900", color: theme.text },

    searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.cardAlt,
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 46,
      borderWidth: 1,
      borderColor: theme.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 2 },
      }),
    },
    input: {
      flex: 1,
      marginLeft: 8,
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
      textAlign: "right",
    },
    clearBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    tabsRow: {
      flexDirection: "row",
      gap: 8,
      paddingTop: 12,
      paddingBottom: 12,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.mutedText,
    },
    tabTextActive: {
      color: theme.primaryText,
    },

    loadingLine: {
      marginHorizontal: 16,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.separator,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      justifyContent: "flex-end",
    },
    loadingText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
    },

    section: { paddingHorizontal: 16, marginBottom: 16 },
    sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: "900", color: theme.text },
    sectionLine: { flex: 1, height: 1, backgroundColor: theme.separator },

    card: {
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 10 },
    rowIconBox: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    rowTitle: { fontSize: 14, fontWeight: "900", color: theme.text },
    rowSub: { marginTop: 2, fontSize: 12, fontWeight: "800", color: theme.mutedText },

    rightPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    rightPillText: { fontSize: 11, fontWeight: "900", color: theme.text },

    pricePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.pillGoldBg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    priceText: { fontSize: 11, fontWeight: "900", color: theme.pillGoldFg },

    emptyLine: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    emptyText: { fontSize: 12, fontWeight: "800", color: theme.mutedText },

    centerPad: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },

    tweetCard: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    tweetTop: { flexDirection: "row", gap: 10 },
    tweetAvatar: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tweetMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    tweetName: { fontSize: 13, fontWeight: "900", color: theme.text, maxWidth: 140 },
    tweetHandle: { fontSize: 12, fontWeight: "800", color: theme.mutedText, maxWidth: 140 },
    tweetText: { fontSize: 14, fontWeight: "700", color: theme.text, lineHeight: 20 },

    tweetBadgesRow: { flexDirection: "row", gap: 8, marginTop: 10, justifyContent: "flex-end" },
    smallPill: {
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
    smallPillText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },

    discoverCard: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 2 },
      }),
    },
    discoverTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    discoverTitle: { fontSize: 18, fontWeight: "900", color: theme.text },
    discoverSub: { marginTop: 4, fontSize: 12, fontWeight: "800", color: theme.mutedText },
    discoverChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    discoverChipText: { fontSize: 12, fontWeight: "900", color: theme.text },

    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    tile: {
      width: "48%",
      minHeight: 92,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      justifyContent: "center",
      gap: 6,
    },
    tileTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
    tileSub: { fontSize: 12, fontWeight: "800", color: theme.mutedText },
  });
}