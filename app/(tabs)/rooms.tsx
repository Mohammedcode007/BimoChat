// rooms.tsx

import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import {
  createRoom as createRoomThunk,
  enterRoomDirect,
  fetchRoomsByType,
  joinRoomAndEnter,
  searchRooms as searchRoomsThunk,
  selectRoomActiveCount,
  selectRoomError,
  selectRoomLoadingRooms,
  selectRooms,
  setCurrentRoomUserId
} from "@/redux/slices/room.slice";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

type RoomUI = {
  id: string;
  name: string;
  members: number;
  maxUsers?: number;
  image: string;
  roomType?: "public" | "private" | "protected" | "subscription";
  isProtected?: boolean;

  isVIP?: boolean;
  isPrivate?: boolean;
  isVoice?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;

  // ✅ NEW
  isActive?: boolean; // هل المستخدم داخل الغرفة حاليًا؟
};

const PAGE_SIZE = 30;

// ✅ NEW TAB
const TABS = ["All", "Active", "Trending", "VIP", "Private"] as const;
type TabType = (typeof TABS)[number];

const Badge = memo(function Badge({
  icon,
  label,
  color
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
});

const mapRoomToUI = (r: any): RoomUI => {
  const id = r._id || r.id;
  const type = r.type as RoomUI["roomType"];
  const maxUsers = typeof r.maxUsers === "number" && r.maxUsers > 0 ? r.maxUsers : 50;

  const isProtected = type === "protected";
  const isPrivate = type === "private"; // ✅ private فقط

  return {
    id,
    name: r.name || "Room",
    members: Number(r.usersCount ?? r.members ?? 0),
    maxUsers,
    image: r.avatar || r.image || `https://picsum.photos/200/200?seed=${id}`,

    roomType: type,
    isProtected,

    isVIP: Boolean(r.isVIP || (typeof r.premiumLevel === "number" && r.premiumLevel > 0)),
    isPrivate: isPrivate, // ✅ private فقط
    isVoice: Boolean(r.isVoice || (typeof r.maxVoiceSeats === "number" && r.maxVoiceSeats > 0)),
    isVerified: Boolean(r.isVerified),
    isTrending: Boolean(r.isTrending || (typeof r.boostLevel === "number" && r.boostLevel > 0)),

    // ✅ NEW: يعتمد على الباك
    isActive: Boolean(r.isActive)
  };
};

/* =====================================================
   ✅ Shimmer Skeleton (بدون مكتبات)
===================================================== */
function ShimmerBar({ style }: { style?: any }) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 240]
  });

  return (
    <View style={[styles.shimmerBase, style]}>
      <Animated.View
        style={[
          styles.shimmerHighlight,
          {
            transform: [{ translateX }]
          }
        ]}
      />
    </View>
  );
}

const SkeletonRoomCard = memo(function SkeletonRoomCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={{ flex: 1 }}>
        <ShimmerBar style={{ height: 14, width: "70%", borderRadius: 8 }} />
        <View style={{ height: 8 }} />
        <ShimmerBar style={{ height: 12, width: "50%", borderRadius: 8 }} />
        <View style={{ height: 10 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <ShimmerBar style={{ height: 18, width: 76, borderRadius: 8 }} />
          <ShimmerBar style={{ height: 18, width: 64, borderRadius: 8 }} />
          <ShimmerBar style={{ height: 18, width: 84, borderRadius: 8 }} />
        </View>
      </View>
    </View>
  );
});

/* =====================================================
   ✅ Overlay Loading (Joining / Creating / Searching ...)
===================================================== */
function LoadingOverlay({
  visible,
  title,
  subtitle
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
}) {
  if (!visible) return null;

  return (
    <View pointerEvents="auto" style={styles.loadingOverlay}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.loadingSub}>{subtitle}</Text>}
      </View>
    </View>
  );
}

/* =====================================================
   ✅ Room Card (Memo) — Hooks بأمان
===================================================== */
const RoomCard = memo(function RoomCard({
  item,
  theme,
  onPress,
  isBanned
}: {
  item: RoomUI;
  theme: any;
  onPress: (id: string) => void;
  isBanned?: boolean;
}) {
  const online = useAppSelector((state) => selectRoomActiveCount(state, item.id));
  const max = item.maxUsers ?? 50;

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={[styles.card, { backgroundColor: theme.background }]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.members}>
            {item.members}/{max} members
          </Text>

          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{Number(online) || 0} online</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {isBanned && <Badge icon="ban" label="Banned" color="#EF4444" />}

          {/* ✅ NEW */}
          {item.isActive && <Badge icon="radio" label="Active" color="#10B981" />}

          {item.isTrending && <Badge icon="flame" label="Trending" color="#F97316" />}
          {item.isVIP && <Badge icon="star" label="VIP" color="#F59E0B" />}
          {item.isVerified && <Badge icon="checkmark-circle" label="Verified" color="#22C55E" />}
          {item.isVoice && <Badge icon="mic" label="Voice" color="#4F46E5" />}
          {item.isProtected && <Badge icon="lock-closed" label="Protected" color="#EF4444" />}
          {item.isPrivate && <Badge icon="eye-off" label="Private" color="#EF4444" />}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function RoomsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const canLoadMoreRef = useRef(false);
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
const didMountSearchRef = useRef(false);
  const reduxRooms = useAppSelector(selectRooms);
  const reduxError = useAppSelector(selectRoomError);
  const loadingRooms = useAppSelector(selectRoomLoadingRooms);

  const [tab, setTab] = useState<TabType>("All");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const accRef = useRef<Map<string, RoomUI>>(new Map());
  const [rooms, setRooms] = useState<RoomUI[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  // ✅ Protected join modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [joining, setJoining] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  // ✅ Creating / searching nice loading
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
const activeRoomId = useSelector(
  (state: RootState) => state.room.activeRoomId
);
const goToRoom = useCallback(
  (roomId: string) => {
    router.push({
      pathname: "/room/[id]",
      params: { id: roomId },
    });
  },
  [router]
);
  // ✅ لو فشل join بسبب ban: نخزنها محليًا ونمنع محاولة الدخول + نظهر Badge
  const [bannedByRoomId, setBannedByRoomId] = useState<Record<string, string>>({});
const myUserId = useAppSelector((state) => state.auth.user?._id);
  // ✅ backendType: كما هو (Private -> private otherwise public)
  const backendType: "public" | "private" = tab === "Private" ? "private" : "public";
useEffect(() => {
  if (myUserId) {
    dispatch(setCurrentRoomUserId(myUserId));
  }
}, [myUserId]);
  const isInitialLoading = useMemo(() => {
    return Boolean(loadingRooms && rooms.length === 0 && !search.trim());
  }, [loadingRooms, rooms.length, search]);

  /* =====================================================
     ✅ Fetch first page when backendType changes
     (ملاحظة: لا نعيد الجلب عند الضغط على تب "Active" فقط لأنه فلترة محلية)
  ===================================================== */
  useEffect(() => {
    setPage(1);
    accRef.current = new Map();
    setRooms([]);
    setError("");

    // ✅ مهم: امنع وميض Loading more
    setIsLoadingMore(false);
    setSearching(false);

    dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE }));
  }, [dispatch, backendType]);
  /* =====================================================
     ✅ Accumulate rooms from redux -> local map (stable)
  ===================================================== */
  useEffect(() => {
    if (!reduxRooms) return;

    for (const r of reduxRooms) {
      const ui = mapRoomToUI(r);
      accRef.current.set(ui.id, ui);
    }
    setRooms(Array.from(accRef.current.values()));
  }, [reduxRooms]);

  /* =====================================================
     ✅ Refresh
  ===================================================== */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");

      // ✅ مهم للـ pagination
      canLoadMoreRef.current = false;

      setPage(1);
      accRef.current = new Map();
      setRooms([]);

      const q = search.trim();
      if (q) {
        setSearching(true);
        await dispatch(searchRoomsThunk({ q, type: backendType, limit: PAGE_SIZE })).unwrap();
      } else {
        await dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE })).unwrap();
      }
    } catch (e: any) {
      setError(e?.message || "Refresh failed");
    } finally {
      setSearching(false);
      setRefreshing(false);
    }
  }, [dispatch, backendType, search]);
  /* =====================================================
     ✅ Load more (pagination)
  ===================================================== */
  const loadMore = useCallback(async () => {
    if (isInitialLoading) return;

    // لا صفحات أثناء البحث
    if (search.trim()) return;

    // لا تكرار
    if (loadingRooms || isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      const next = page + 1;

      await dispatch(
        fetchRoomsByType({ type: backendType, page: next, limit: PAGE_SIZE })
      ).unwrap();

      setPage(next); // ✅ بعد النجاح فقط
    } catch (e: any) {
      setError(e?.message || "Load more failed");
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, backendType, loadingRooms, isLoadingMore, page, search, isInitialLoading]);
  /* =====================================================
     ✅ Debounced search
  ===================================================== */
useEffect(() => {
  if (!didMountSearchRef.current) {
    didMountSearchRef.current = true;
    return;
  }

  const q = search.trim();

  const t = setTimeout(async () => {
    try {
      setError("");
      accRef.current = new Map();
      setRooms([]);
      setPage(1);

      if (!q) {
        setSearching(false);
        dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE }));
        return;
      }

      setSearching(true);
      await dispatch(
        searchRoomsThunk({ q, type: backendType, limit: PAGE_SIZE })
      ).unwrap();
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }, 450);

  return () => clearTimeout(t);
}, [search, backendType, dispatch]);

  /* =====================================================
     ✅ Sort & filter
  ===================================================== */
  const sortRooms = useCallback((list: RoomUI[]) => {
    return [...list].sort((a, b) => {
      const score = (r: RoomUI) =>
        (r.isActive ? 6 : 0) + // ✅ NEW: active أعلى أولوية
        (r.isTrending ? 5 : 0) +
        (r.isVIP ? 4 : 0) +
        (r.isVerified ? 3 : 0) +
        (!r.isPrivate ? 2 : 0) +
        (r.isVoice ? 1 : 0);

      return score(b) - score(a);
    });
  }, []);

  const filteredRooms = useMemo(() => {
    let data = rooms;

    // ✅ NEW TAB FILTER
    if (tab === "Active") data = data.filter((r) => Boolean(r.isActive));

    if (tab === "Trending") data = data.filter((r) => r.isTrending);
    if (tab === "VIP") data = data.filter((r) => r.isVIP);
    // if (tab === "Voice") data = data.filter((r) => r.isVoice);
    if (tab === "Private") data = data.filter((r) => r.isPrivate);

    if (search.trim()) {
      const qq = search.trim().toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(qq));
    }

    return tab === "All" || tab === "Active" ? sortRooms(data) : data;
  }, [rooms, tab, search, sortRooms]);

  /* =====================================================
     ✅ Create Room (nice loading)
  ===================================================== */
  const addRoom = useCallback(async () => {
    const name = roomName.trim();
    if (!name) return setError("Room name is required");

    const exists = rooms.some((r) => r.name.toLowerCase() === name.toLowerCase());
    if (exists) return setError("Room name already exists");

    const tempId = `temp-${Date.now()}`;
    const newRoom: RoomUI = {
      id: tempId,
      name,
      members: 1,
      maxUsers: 50,
      image: `https://picsum.photos/200/200?new=${encodeURIComponent(name)}`,
      isTrending: true,
      isActive: true // غالباً المنشئ يدخلها فوراً
    };

    accRef.current.set(tempId, newRoom);
    setRooms(Array.from(accRef.current.values()));

    setRoomName("");
    setError("");
    setModalVisible(false);

    try {
      setCreating(true);
      const created = await dispatch(createRoomThunk({ name, type: backendType })).unwrap();

      accRef.current.delete(tempId);
      const createdUI = mapRoomToUI(created);
      accRef.current.set(createdUI.id, createdUI);
      setRooms(Array.from(accRef.current.values()));
    } catch (e: any) {
      accRef.current.delete(tempId);
      setRooms(Array.from(accRef.current.values()));
      setError(e?.message || "Create room failed");
      setModalVisible(true);
    } finally {
      setCreating(false);
    }
  }, [dispatch, backendType, roomName, rooms]);

  /* =====================================================
     ✅ Join helpers + Ban detection
  ===================================================== */
  const markRoomBanned = useCallback((roomId: string, message: string) => {
    setBannedByRoomId((prev) => ({ ...prev, [roomId]: message || "You are banned from this room" }));
  }, []);

  const isBanMessage = useCallback((msg: string) => {
    const s = String(msg || "").toLowerCase();
    return s.includes("banned") || s.includes("ban") || s.includes("محظور") || s.includes("حظر");
  }, []);

const enterActiveRoomDirect = useCallback(
  async (roomId: string) => {
    if (joining) return;

    const room = rooms.find((r) => String(r.id) === String(roomId));

    const alreadyInside =
      String(activeRoomId || "") === String(roomId) ||
      Boolean(room?.isActive);

    if (alreadyInside) {
      setJoining(false);
      setError("");
      goToRoom(roomId);
      return;
    }

    try {
      setJoining(true);
      setError("");

      await dispatch(
        enterRoomDirect({ roomId, preload: true })
      ).unwrap();

      setJoining(false);
      goToRoom(roomId);
    } catch (e: any) {
      const msgStr = String(e?.message || e || "Enter room failed");
      setError(msgStr);
      setJoining(false);
    }
  },
  [dispatch, joining, activeRoomId, rooms, goToRoom]
);
const doJoin = useCallback(
  async (roomId: string, password?: string) => {
    if (joining) return;

    const room = rooms.find((r) => String(r.id) === String(roomId));

    const alreadyInside =
      String(activeRoomId || "") === String(roomId) ||
      Boolean(room?.isActive);

    if (alreadyInside) {
      setJoining(false);
      setError("");
      goToRoom(roomId);
      return;
    }

    try {
      setJoining(true);
      setError("");

      await dispatch(
        joinRoomAndEnter({ roomId, preload: true, password })
      ).unwrap();

      setJoining(false);
      goToRoom(roomId);
    } catch (e: any) {
      const msgStr = String(e?.message || e || "Join failed");

      if (isBanMessage(msgStr)) {
        markRoomBanned(roomId, msgStr);
      }

      setError(msgStr);
      setJoining(false);
    }
  },
  [
    dispatch,
    joining,
    activeRoomId,
    rooms,
    goToRoom,
    isBanMessage,
    markRoomBanned,
  ]
);
  const openRoom = useCallback(
    async (roomId: string) => {
      const room = accRef.current.get(roomId);

      if (bannedByRoomId[roomId]) {
        setError("أنت محظور من هذه الغرفة.");
        return;
      }

      // ✅ Active -> دخول مباشر بدون join
      if (room?.isActive) {
        await enterActiveRoomDirect(roomId);
        return;
      }

      if (room?.isProtected) {
        setPendingRoomId(roomId);
        setPasswordInput("");
        setPasswordModalVisible(true);
        setError("");
        return;
      }

      await doJoin(roomId);
    },
    [doJoin, bannedByRoomId, enterActiveRoomDirect]
  );

  const confirmJoinWithPassword = useCallback(async () => {
    const rid = pendingRoomId;
    const pw = passwordInput.trim();

    if (!rid) return;

    if (!pw) {
      setError("Password is required");
      return;
    }

    setPasswordModalVisible(false);
    setPendingRoomId(null);

    await doJoin(rid, pw);
  }, [pendingRoomId, passwordInput, doJoin]);

  const keyExtractor = useCallback((item: RoomUI) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: RoomUI }) => {
      return (
        <RoomCard
          item={item}
          theme={theme}
          onPress={openRoom}
          isBanned={Boolean(bannedByRoomId[item.id])}
        />
      );
    },
    [theme, openRoom, bannedByRoomId]
  );

  const listHeader = useMemo(() => {
    return (
      <>
        <View style={[styles.searchBox, { backgroundColor: theme.background }]}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder="Search rooms"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
            style={styles.searchInput}
          />
          {searching ? (
            <View style={{ marginLeft: 8 }}>
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          ) : null}
        </View>

        <View style={[styles.tabs, { backgroundColor: theme.background }]}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
                style={styles.tabBtn}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>{t}</Text>
                {active && <View style={styles.indicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {!!(error || reduxError) && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.errorBannerText}>{error || reduxError}</Text>
          </View>
        )}

        {isInitialLoading ? (
          <View style={{ paddingTop: 6 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRoomCard key={`sk-${i}`} />
            ))}
          </View>
        ) : null}
      </>
    );
  }, [
    theme.background,
    colorScheme,
    search,
    searching,
    tab,
    error,
    reduxError,
    isInitialLoading
  ]);

  const listEmpty = useMemo(() => {
    if (isInitialLoading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>
          {loadingRooms ? "Loading..." : searching ? "Searching..." : "No rooms found"}
        </Text>
      </View>
    );
  }, [isInitialLoading, loadingRooms, searching]);

  const footer = useMemo(() => {
    if (!isLoadingMore) return <View style={{ height: 16 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  }, [isLoadingMore]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={isInitialLoading ? [] : filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onScroll={onScroll}
      onScrollBeginDrag={(e) => {
    canLoadMoreRef.current = true;
    onScrollBeginDrag(e);
  }}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (onEndReachedCalledDuringMomentum.current) return;
          onEndReachedCalledDuringMomentum.current = true;
          loadMore();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={footer}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={8}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ✅ Create Room Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Room</Text>

            <TextInput
              placeholder="Room name"
              value={roomName}
              onChangeText={(t) => {
                setRoomName(t);
                setError("");
              }}
              style={styles.modalInput}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={creating}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addRoom} disabled={creating}>
                <Text style={styles.confirm}>{creating ? "Creating..." : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Enter Password</Text>

            <TextInput
              placeholder="Room password"
              value={passwordInput}
              onChangeText={(t) => {
                setPasswordInput(t);
                setError("");
              }}
              secureTextEntry
              style={styles.modalInput}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPendingRoomId(null);
                  setPasswordInput("");
                }}
                disabled={joining}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmJoinWithPassword} disabled={joining}>
                <Text style={styles.confirm}>{joining ? "Joining..." : "Join"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Global overlay loaders */}
<LoadingOverlay
  visible={joining}
  title="Entering room..."
  subtitle="Verifying access and loading room data"
/>
      <LoadingOverlay visible={creating} title="جاري إنشاء الغرفة..." subtitle="لحظات من فضلك" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA", padding: 14 },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10
  },
  searchInput: { marginLeft: 8, fontSize: 13, flex: 1 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12
  },
  image: { width: 64, height: 64, borderRadius: 14, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600" },

  members: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  metaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F3F4F6"
  },
  onlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: "#22C55E" },
  onlineText: { fontSize: 11, fontWeight: "600", color: "#374151" },

  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { marginTop: 10, color: "#9CA3AF" },

fab: {
  position: "absolute",
  right: 20,
  bottom: 40, // ✅ كان 20
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#4F46E5",
  alignItems: "center",
  justifyContent: "center",
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
},

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: { width: "85%", backgroundColor: "#FFF", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  modalInput: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 10, fontSize: 13 },
  error: { marginTop: 6, color: "#EF4444", fontSize: 12 },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 16 },
  cancel: { color: "#6B7280" },
  confirm: { color: "#4F46E5", fontWeight: "600" },

  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 6
  },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 12 },
  tabText: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  activeTabText: { color: "#4F46E5", fontWeight: "700" },
  indicator: { marginTop: 6, width: 20, height: 3, borderRadius: 2, backgroundColor: "#4F46E5" },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 10
  },
  errorBannerText: { color: "#B91C1C", fontSize: 12, fontWeight: "600", flex: 1 },

  footerLoading: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  loadingMoreText: { fontSize: 12, color: "#6B7280", fontWeight: "700" },

  // ✅ Skeleton styles
  skeletonCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6"
  },
  skeletonImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#E5E7EB"
  },
  shimmerBase: {
    overflow: "hidden",
    backgroundColor: "#E5E7EB"
  },
  shimmerHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: "rgba(255,255,255,0.45)"
  },

  // ✅ Overlay Loading
  loadingOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  loadingBox: {
    width: "88%",
    maxWidth: 360,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  loadingTitle: { marginTop: 10, fontSize: 14, fontWeight: "900", color: "#111827" },
  loadingSub: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#6B7280", textAlign: "center" }
});