
// RoomsScreen.tsx (or the same file you pasted)
// ✅ تم دمج room.slice.ts (الذي أرسلته) داخل الصفحة بدون تغيير الشكل العام (UI/Styles)

// =======================
// Imports (UNCHANGED UI)
// =======================
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

// ✅ Redux hooks
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// ✅ Room Slice: selectors + actions + thunks (من السلايس الذي أرسلته)
import {
  createRoom as createRoomThunk,
  // thunks
  fetchRoomsByType,
  joinRoomAndEnter,
  // selectors
  selectRoomError,
  selectRoomLoadingRooms,
  selectRooms
} from "@/redux/slices/room.slice";

/* =======================
   Types (UI only)
======================= */

type RoomUI = {
  id: string;
  name: string;
  members: number;
  image: string;

  isVIP?: boolean;
  isPrivate?: boolean;
  isVoice?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
};

/* =======================
   Constants
======================= */

const PAGE_SIZE = 6;

const TABS = ["All", "Trending", "VIP", "Voice", "Private"] as const;
type TabType = (typeof TABS)[number];

/* =======================
   Mock Generator (Fallback)
   - سيستخدم فقط لو قائمة Redux فاضية
======================= */

const generateRooms = (count: number): RoomUI[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `${Date.now()}-${i}`;
    return {
      id,
      name: `Room ${id.slice(-3)}`,
      members: Math.floor(Math.random() * 50) + 1,
      image: `https://picsum.photos/200/200?random=${id}`,
      isVIP: Math.random() > 0.75,
      isPrivate: Math.random() > 0.8,
      isVoice: Math.random() > 0.6,
      isVerified: Math.random() > 0.7,
      isTrending: Math.random() > 0.65
    };
  });
};

/* =======================
   Badge Component
======================= */

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

/* =======================
   Helpers (Redux -> UI mapping)
======================= */

const mapRoomToUI = (r: any): RoomUI => {
  const id = r._id || r.id;
  const type = r.type;

  return {
    id,
    name: r.name || "Room",
    members: Number(r.usersCount ?? r.members ?? 0),
    image: r.avatar || r.image || `https://picsum.photos/200/200?seed=${id}`,

    // UI flags derived من الباك
    isVIP: Boolean(r.isVIP || (typeof r.premiumLevel === "number" && r.premiumLevel > 0)),
    isPrivate: type === "private" || type === "protected",
    // ملاحظة: الباك عندك "voice seats" في endpoint منفصل، لذلك هنا نحاول أفضل تقدير
    isVoice: Boolean(r.isVoice || (typeof r.maxVoiceSeats === "number" && r.maxVoiceSeats > 0)),
    isVerified: Boolean(r.isVerified),
    isTrending: Boolean(r.isTrending || (typeof r.boostLevel === "number" && r.boostLevel > 0))
  };
};

export default function RoomsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  // ✅ Rooms from Redux
  const reduxRooms = useAppSelector(selectRooms);
  const reduxError = useAppSelector(selectRoomError);
  const loadingRooms = useAppSelector(selectRoomLoadingRooms);

  // ✅ Local UI state (لا نغير الشكل)
  const [rooms, setRooms] = useState<RoomUI[]>([]);
  const [page, setPage] = useState(1);

  const [tab, setTab] = useState<TabType>("All");
  const [search, setSearch] = useState("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  /* =======================
     Initial Fetch (from backend)
     - بدون تغيير الشكل: نجلب قائمة أولية
     - لأن الباك يحتاج type، سنستخدم "public" كافتراضي لـ All
  ======================= */

  useEffect(() => {
    dispatch(fetchRoomsByType({ type: "public", page: 1, limit: 30 }));
  }, [dispatch]);

  /* =======================
     Optional: Fetch on Tab change (بدون تغيير الشكل)
     - Private tab: نجيب private
     - باقي التابات: نخليها على public ونفلتر محلياً (Trending/VIP/Voice)
  ======================= */

  useEffect(() => {
    // إعادة الصفحة UI
    setPage(1);

    if (tab === "Private") {
      dispatch(fetchRoomsByType({ type: "private", page: 1, limit: 30 }));
      return;
    }

    // All/Trending/VIP/Voice: نخلي المصدر public (ثم فلترة محلية)
    dispatch(fetchRoomsByType({ type: "public", page: 1, limit: 30 }));
  }, [tab, dispatch]);

  /* =======================
     Map Redux -> UI rooms (بدون تغيير الشكل)
     - لو reduxRooms فيها بيانات فعلية: نعرضها
     - لو فاضية: نكمل mock زي ما كنت تعمل
  ======================= */

  useEffect(() => {
    if (reduxRooms && reduxRooms.length > 0) {
      const mapped: RoomUI[] = reduxRooms.map(mapRoomToUI);
      setRooms(mapped);
      return;
    }

    // fallback (mock)
    setRooms((prev) => (prev.length ? prev : generateRooms(PAGE_SIZE)));
  }, [reduxRooms]);

  /* =======================
     Load More (Pagination UI)
     - في حالة redux: UI فقط (نفس الشكل)؛ لو تريد Pagination حقيقي،
       وفّر page/limit من الباك ثم استعمل append في السلايس (حالياً السلايس يستبدل)
  ======================= */

  useEffect(() => {
    // لو ما عندك reduxRooms أو فاضية، استمر في mock pagination
    if (!reduxRooms || reduxRooms.length === 0) {
      if (page === 1) return;
      setRooms((prev) => [...prev, ...generateRooms(PAGE_SIZE)]);
    }
  }, [page, reduxRooms]);

  /* =======================
     Sorting (Smart Order)
  ======================= */

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

  /* =======================
     Filtering
  ======================= */

  const filteredRooms = useMemo(() => {
    let data = rooms;

    if (tab === "Trending") data = data.filter((r) => r.isTrending);
    if (tab === "VIP") data = data.filter((r) => r.isVIP);
    if (tab === "Voice") data = data.filter((r) => r.isVoice);
    if (tab === "Private") data = data.filter((r) => r.isPrivate);

    if (search.trim()) {
      data = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    }

    return tab === "All" ? sortRooms(data) : data;
  }, [rooms, tab, search]);

  /* =======================
     Add Room (UI + Backend)
     - بدون تغيير الشكل: نفس المودال ونفس UI
     - لكن الآن: dispatch(createRoomThunk) مع optimistic UI
  ======================= */

  const addRoom = async () => {
    const name = roomName.trim();

    if (!name) {
      setError("Room name is required");
      return;
    }

    const exists = rooms.some((r) => r.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setError("Room name already exists");
      return;
    }

    // ✅ Optimistic UI (نفس الشكل)
    const tempId = `temp-${Date.now()}`;
    const newRoom: RoomUI = {
      id: tempId,
      name,
      members: 1,
      image: `https://picsum.photos/200/200?new=${encodeURIComponent(name)}`,
      isTrending: true
    };

    setRooms((prev) => [newRoom, ...prev]);
    setRoomName("");
    setError("");
    setModalVisible(false);

    try {
      // ✅ Backend create
      // (اختر type الافتراضي public حتى لا يتغير الشكل/التدفق)
      const created = await dispatch(
        createRoomThunk({
          name,
          type: "public"
        })
      ).unwrap();

      // ✅ استبدال المؤقت بالفعلي
      const createdUI = mapRoomToUI(created);
      setRooms((prev) => {
        // احذف temp وأضف الحقيقي في نفس المكان تقريباً
        const withoutTemp = prev.filter((x) => x.id !== tempId);
        return [createdUI, ...withoutTemp];
      });
    } catch (e: any) {
      // ✅ Rollback
      setRooms((prev) => prev.filter((x) => x.id !== tempId));
      setError(e?.message || "Create room failed");
      setModalVisible(true);
    }
  };

  /* =======================
     Open Room
  ======================= */


const openRoom = async (roomId: string) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🟦 openRoom START");
  console.log("roomId:", roomId);
  console.log("thunk typePrefix:", joinRoomAndEnter.typePrefix);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // dispatch يرجّع action فيه meta / payload
    const action = await dispatch(joinRoomAndEnter({ roomId, preload: true }));

    console.log("➡️ dispatched meta:", action.meta);

    // لو حصل رفض
    if (joinRoomAndEnter.rejected.match(action)) {
      // في حالة rejectWithValue: payload غالبًا string
      const msg =
        (action.payload as any) ||
        (action.error?.message as any) ||
        "Join failed";

      console.log("❌ joinRoomAndEnter REJECTED:", msg);
      setError(String(msg));
      return;
    }

    // نجاح
    console.log("✅ joinRoomAndEnter FULFILLED:", action.payload);

    router.push({
      pathname: "/room/[id]",
      params: { id: roomId }
    });

    console.log("🟩 openRoom DONE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (e: any) {
    // هذا نادر مع RTK إلا لو حصل runtime crash خارج thunk
    const msg = e?.message || "Join failed";
    console.log("🟥 openRoom CATCH:", msg);
    setError(msg);
  }
};

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search */}
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

      {/* Tabs */}
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

      {/* Rooms */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={() => setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {reduxError
                ? reduxError
                : loadingRooms
                  ? "Loading..."
                  : "No rooms found"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openRoom(item.id)}
            style={[styles.card, { backgroundColor: theme.background }]}
          >
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={styles.members}>{item.members}/50 members</Text>

              <View style={styles.badges}>
                {item.isTrending && <Badge icon="flame" label="Trending" color="#F97316" />}
                {item.isVIP && <Badge icon="star" label="VIP" color="#F59E0B" />}
                {item.isVerified && (
                  <Badge icon="checkmark-circle" label="Verified" color="#22C55E" />
                )}
                {item.isVoice && <Badge icon="mic" label="Voice" color="#4F46E5" />}
                {item.isPrivate && (
                  <Badge icon="lock-closed" label="Private" color="#EF4444" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Room Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Room Modal */}
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

/* =======================
   Styles (UNCHANGED)
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    padding: 14
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 13,
    flex: 1
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E5E7EB"
  },

  activeTab: {
    backgroundColor: "#4F46E5"
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 12
  },

  info: {
    flex: 1
  },

  name: {
    fontSize: 15,
    fontWeight: "600"
  },

  members: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600"
  },

  empty: {
    marginTop: 80,
    alignItems: "center"
  },

  emptyText: {
    marginTop: 10,
    color: "#9CA3AF"
  },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center"
  },

  modal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10
  },

  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    fontSize: 13
  },

  error: {
    marginTop: 6,
    color: "#EF4444",
    fontSize: 12
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 16
  },

  cancel: {
    color: "#6B7280"
  },

  confirm: {
    color: "#4F46E5",
    fontWeight: "600"
  },

  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 6
  },

  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12
  },

  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280"
  },

  activeTabText: {
    color: "#4F46E5",
    fontWeight: "700"
  },

  indicator: {
    marginTop: 6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#4F46E5"
  }
});