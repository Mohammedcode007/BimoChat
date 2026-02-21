// rooms.tsx

import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  createRoom as createRoomThunk,
  fetchRoomsByType,
  joinRoomAndEnter,
  searchRooms as searchRoomsThunk,
  selectRoomActiveCount,
  selectRoomError,
  selectRoomLoadingRooms,
  selectRooms
} from "@/redux/slices/room.slice";

type RoomUI = {
  id: string;
  name: string;
  members: number;
  maxUsers?: number;
  image: string;

  isVIP?: boolean;
  isPrivate?: boolean;
  isVoice?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
};

const PAGE_SIZE = 30;

const TABS = ["All", "Trending", "VIP", "Voice", "Private"] as const;
type TabType = (typeof TABS)[number];

const Badge = ({
  icon,
  label,
  color
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) => (
  <View style={[styles.badge, { borderColor: color }]}>
    <Ionicons name={icon} size={12} color={color} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const mapRoomToUI = (r: any): RoomUI => {
  const id = r._id || r.id;
  const type = r.type;
  const maxUsers = typeof r.maxUsers === "number" && r.maxUsers > 0 ? r.maxUsers : 50;

  return {
    id,
    name: r.name || "Room",
    members: Number(r.usersCount ?? r.members ?? 0),
    maxUsers,
    image: r.avatar || r.image || `https://picsum.photos/200/200?seed=${id}`,

    isVIP: Boolean(r.isVIP || (typeof r.premiumLevel === "number" && r.premiumLevel > 0)),
    isPrivate: type === "private" || type === "protected",
    isVoice: Boolean(r.isVoice || (typeof r.maxVoiceSeats === "number" && r.maxVoiceSeats > 0)),
    isVerified: Boolean(r.isVerified),
    isTrending: Boolean(r.isTrending || (typeof r.boostLevel === "number" && r.boostLevel > 0))
  };
};

/* =====================================================
   ✅ Room Card (Component مستقل) — هنا نستخدم Hooks بأمان
===================================================== */
function RoomCard({
  item,
  theme,
  onPress
}: {
  item: RoomUI;
  theme: any;
  onPress: (id: string) => void;
}) {
  const online = useAppSelector((state) => selectRoomActiveCount(state, item.id));
  const max = item.maxUsers ?? 50;

  return (
    <TouchableOpacity onPress={() => onPress(item.id)} style={[styles.card, { backgroundColor: theme.background }]}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.members}>
            {item.members}/{max} members
          </Text>

          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{online} online</Text>
          </View>
        </View>

        <View style={styles.badges}>
          {item.isTrending && <Badge icon="flame" label="Trending" color="#F97316" />}
          {item.isVIP && <Badge icon="star" label="VIP" color="#F59E0B" />}
          {item.isVerified && <Badge icon="checkmark-circle" label="Verified" color="#22C55E" />}
          {item.isVoice && <Badge icon="mic" label="Voice" color="#4F46E5" />}
          {item.isPrivate && <Badge icon="lock-closed" label="Private" color="#EF4444" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RoomsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

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

  const backendType: "public" | "private" = tab === "Private" ? "private" : "public";

  useEffect(() => {
    setPage(1);
    accRef.current = new Map();
    setRooms([]);

    dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE }));
  }, [dispatch, backendType]);

  useEffect(() => {
    if (!reduxRooms) return;

    for (const r of reduxRooms) {
      const ui = mapRoomToUI(r);
      accRef.current.set(ui.id, ui);
    }
    setRooms(Array.from(accRef.current.values()));
  }, [reduxRooms]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      setPage(1);
      accRef.current = new Map();
      setRooms([]);

      if (search.trim()) {
        await dispatch(searchRoomsThunk({ q: search.trim(), type: backendType, limit: PAGE_SIZE })).unwrap();
      } else {
        await dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE })).unwrap();
      }
    } catch (e: any) {
      setError(e?.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingRooms || isLoadingMore) return;
    if (search.trim()) return;

    try {
      setIsLoadingMore(true);
      const next = page + 1;
      setPage(next);
      await dispatch(fetchRoomsByType({ type: backendType, page: next, limit: PAGE_SIZE })).unwrap();
    } catch (e: any) {
      setError(e?.message || "Load more failed");
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const q = search.trim();
    const t = setTimeout(async () => {
      try {
        setError("");
        accRef.current = new Map();
        setRooms([]);
        setPage(1);

        if (!q) {
          dispatch(fetchRoomsByType({ type: backendType, page: 1, limit: PAGE_SIZE }));
          return;
        }

        await dispatch(searchRoomsThunk({ q, type: backendType, limit: PAGE_SIZE })).unwrap();
      } catch (e: any) {
        setError(e?.message || "Search failed");
      }
    }, 450);

    return () => clearTimeout(t);
  }, [search, backendType, dispatch]);

  const sortRooms = (list: RoomUI[]) => {
    return [...list].sort((a, b) => {
      const score = (r: RoomUI) =>
        (r.isTrending ? 5 : 0) +
        (r.isVIP ? 4 : 0) +
        (r.isVerified ? 3 : 0) +
        (!r.isPrivate ? 2 : 0) +
        (r.isVoice ? 1 : 0);

      return score(b) - score(a);
    });
  };

  const filteredRooms = useMemo(() => {
    let data = rooms;

    if (tab === "Trending") data = data.filter((r) => r.isTrending);
    if (tab === "VIP") data = data.filter((r) => r.isVIP);
    if (tab === "Voice") data = data.filter((r) => r.isVoice);
    if (tab === "Private") data = data.filter((r) => r.isPrivate);

    if (search.trim()) {
      const qq = search.trim().toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(qq));
    }

    return tab === "All" ? sortRooms(data) : data;
  }, [rooms, tab, search]);

  const addRoom = async () => {
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
      isTrending: true
    };

    accRef.current.set(tempId, newRoom);
    setRooms(Array.from(accRef.current.values()));

    setRoomName("");
    setError("");
    setModalVisible(false);

    try {
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
    }
  };

  const openRoom = async (roomId: string) => {
    try {
      const action = await dispatch(joinRoomAndEnter({ roomId, preload: true }));
      if (joinRoomAndEnter.rejected.match(action)) {
        const msg = (action.payload as any) || (action.error?.message as any) || "Join failed";
        setError(String(msg));
        return;
      }

      router.push({ pathname: "/room/[id]", params: { id: roomId } });
    } catch (e: any) {
      setError(e?.message || "Join failed");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBox, { backgroundColor: theme.background }]}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          placeholder="Search rooms"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"}
          style={styles.searchInput}
        />
      </View>

      <View style={[styles.tabs, { backgroundColor: theme.background }]}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity key={t} onPress={() => setTab(t)} activeOpacity={0.7} style={styles.tabBtn}>
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

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>{loadingRooms ? "Loading..." : "No rooms found"}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RoomCard item={item} theme={theme} onPress={openRoom} />
        )}
        ListFooterComponent={
          isLoadingMore ? <Text style={styles.loadingMoreText}>Loading more...</Text> : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
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
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addRoom}>
                <Text style={styles.confirm}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  card: { flexDirection: "row", backgroundColor: "#FFF", padding: 12, borderRadius: 18, marginBottom: 12 },
  image: { width: 64, height: 64, borderRadius: 14, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600" },

  members: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  metaRow: { marginTop: 2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

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
  badge: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: "600" },

  empty: { marginTop: 80, alignItems: "center" },
  emptyText: { marginTop: 10, color: "#9CA3AF" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center"
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  modal: { width: "85%", backgroundColor: "#FFF", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  modalInput: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 10, fontSize: 13 },
  error: { marginTop: 6, color: "#EF4444", fontSize: 12 },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 16 },
  cancel: { color: "#6B7280" },
  confirm: { color: "#4F46E5", fontWeight: "600" },

  tabs: { flexDirection: "row", alignItems: "center", marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 6 },
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

  loadingMoreText: { textAlign: "center", marginBottom: 16, fontSize: 11, color: "#9CA3AF" }
});