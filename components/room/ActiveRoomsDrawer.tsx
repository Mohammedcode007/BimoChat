import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    enterRoomDirect,
    fetchRoomsByType,
    selectRoomActiveCount,
} from "@/redux/slices/room.slice";

type ActiveRoomUI = {
  id: string;
  name: string;
  image: string;
  type?: string;
  members: number;
  maxUsers: number;
  isActive: boolean;
  isVIP?: boolean;
  isPrivate?: boolean;
  isProtected?: boolean;
  isVoice?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
  boostLevel?: number;
  premiumLevel?: number;
};

const DEFAULT_ROOM_IMAGE =
  "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg";

const PAGE_SIZE = 80;

const mapRoomToActiveUI = (r: any): ActiveRoomUI => {
  const id = String(r?._id || r?.id || "").trim();
  const type = String(r?.type || "").trim();

  return {
    id,
    name: String(r?.name || r?.title || "Room"),
    image: String(r?.avatar || r?.image || DEFAULT_ROOM_IMAGE),
    type,
    members: Number(r?.usersCount ?? r?.members ?? 0) || 0,
    maxUsers: Number(r?.maxUsers || 50) || 50,

    // ✅ المهم: هذا هو الحقيقي القادم من الباك
    isActive: Boolean(r?.isActive),

    isVIP: Boolean(r?.isVIP || (typeof r?.premiumLevel === "number" && r.premiumLevel > 0)),
    isPrivate: type === "private",
    isProtected: type === "protected",
    isVoice: Boolean(r?.isVoice || (typeof r?.maxVoiceSeats === "number" && r.maxVoiceSeats > 0)),
    isVerified: Boolean(r?.isVerified),
    isTrending: Boolean(r?.isTrending || (typeof r?.boostLevel === "number" && r.boostLevel > 0)),
    boostLevel: Number(r?.boostLevel || 0) || 0,
    premiumLevel: Number(r?.premiumLevel || 0) || 0,
  };
};

const sortActiveRooms = (list: ActiveRoomUI[]) => {
  return [...list].sort((a, b) => {
    const score = (r: ActiveRoomUI) =>
      (r.isActive ? 100 : 0) +
      (r.isTrending ? 20 : 0) +
      (r.isVIP ? 15 : 0) +
      (r.isVerified ? 10 : 0) +
      (r.isVoice ? 5 : 0);

    return score(b) - score(a);
  });
};

const Badge = memo(function Badge({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={[badgeStyles.badge, { borderColor: color }]}>
      <Ionicons name={icon} size={11} color={color} />
      <Text style={[badgeStyles.badgeText, { color }]}>{label}</Text>
    </View>
  );
});

const badgeStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 5,
    marginTop: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
});

const ActiveRoomRow = memo(function ActiveRoomRow({
  item,
  theme,
  currentRoomId,
  onPress,
}: {
  item: ActiveRoomUI;
  theme: typeof Colors.light;
  currentRoomId?: string;
  onPress: (room: ActiveRoomUI) => void;
}) {
  const online = useAppSelector((state) => selectRoomActiveCount(state, item.id));
  const isCurrent = String(item.id) === String(currentRoomId || "");

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={() => onPress(item)}
      style={[
        rowStyles.roomRow,
        {
          borderColor: theme.separator,
        },
        isCurrent && {
          backgroundColor: theme.primarySoft,
          borderBottomWidth: 0,
          borderRadius: 16,
          paddingHorizontal: 8,
          marginBottom: 6,
        },
      ]}
    >
      <Image
        source={{ uri: item.image || DEFAULT_ROOM_IMAGE }}
        style={[rowStyles.roomAvatar, { backgroundColor: theme.surface2 }]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />

      <View style={rowStyles.roomCenter}>
        <Text style={[rowStyles.roomName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={rowStyles.metaLine}>
          <View style={rowStyles.onlineDot} />
          <Text style={[rowStyles.metaText, { color: theme.mutedText }]} numberOfLines={1}>
            {Number(online) || 0} online • {item.members}/{item.maxUsers} members
          </Text>
        </View>

        <View style={rowStyles.badgesRow}>
          <Badge icon="radio" label="Active" color="#10B981" />

          {item.isTrending ? <Badge icon="flame" label="Trending" color="#F97316" /> : null}
          {item.isVIP ? <Badge icon="star" label="VIP" color="#F59E0B" /> : null}
          {item.isVerified ? <Badge icon="checkmark-circle" label="Verified" color="#22C55E" /> : null}
          {item.isVoice ? <Badge icon="mic" label="Voice" color="#4F46E5" /> : null}
          {item.isProtected ? <Badge icon="lock-closed" label="Protected" color="#EF4444" /> : null}
          {item.isPrivate ? <Badge icon="eye-off" label="Private" color="#EF4444" /> : null}
        </View>
      </View>

      {isCurrent ? (
        <View style={[rowStyles.nowBadge, { backgroundColor: theme.primary }]}>
          <Text style={[rowStyles.nowText, { color: theme.primaryText }]}>Now</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={theme.icon} />
      )}
    </TouchableOpacity>
  );
});

const rowStyles = StyleSheet.create({
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  roomAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  roomCenter: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  roomName: {
    fontSize: 14,
    fontWeight: "900",
  },
  metaLine: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 1,
  },
  nowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  nowText: {
    fontSize: 11,
    fontWeight: "900",
  },
});

export default function ActiveRoomsDrawer({
  visible,
  onClose,
  currentRoomId,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  currentRoomId?: string;
  theme: typeof Colors.light;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const drawerWidth = Math.min(width * 0.84, 360);
  const translateX = useRef(new Animated.Value(drawerWidth)).current;

  const [rooms, setRooms] = useState<ActiveRoomUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(
    () => makeStyles(theme, drawerWidth, insets.top, insets.bottom),
    [theme, drawerWidth, insets.top, insets.bottom]
  );

  const extractRoomsPayload = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.rooms)) return payload.rooms;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
  };

  const loadActiveRooms = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      try {
        if (mode === "refresh") setRefreshing(true);
        else setLoading(true);

        setError("");

        const [publicRes, privateRes] = await Promise.allSettled([
          dispatch(fetchRoomsByType({ type: "public", page: 1, limit: PAGE_SIZE })).unwrap(),
          dispatch(fetchRoomsByType({ type: "private", page: 1, limit: PAGE_SIZE })).unwrap(),
        ]);

        const allRaw: any[] = [];

        if (publicRes.status === "fulfilled") {
          allRaw.push(...extractRoomsPayload(publicRes.value));
        }

        if (privateRes.status === "fulfilled") {
          allRaw.push(...extractRoomsPayload(privateRes.value));
        }

        if (publicRes.status === "rejected" && privateRes.status === "rejected") {
          throw publicRes.reason || privateRes.reason || new Error("Failed to load rooms");
        }

        const map = new Map<string, ActiveRoomUI>();

        for (const raw of allRaw) {
          const ui = mapRoomToActiveUI(raw);
          if (!ui.id) continue;

          // ✅ نعرض الحقيقي فقط: الغرف التي أنت Active فيها حسب الباك
          if (!ui.isActive) continue;

          map.set(ui.id, ui);
        }

        setRooms(sortActiveRooms(Array.from(map.values())));
      } catch (e: any) {
        setError(e?.message || "Failed to load active rooms");
        setRooms([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!visible) return;

    translateX.setValue(drawerWidth);

    loadActiveRooms("initial");

    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, drawerWidth, loadActiveRooms, translateX]);

  const closeDrawer = useCallback(() => {
    Animated.timing(translateX, {
      toValue: drawerWidth,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [drawerWidth, onClose, translateX]);

  const openRoom = useCallback(
    (room: ActiveRoomUI) => {
      const roomId = String(room?.id || "").trim();
      if (!roomId) return;

      closeDrawer();

      if (roomId === String(currentRoomId || "")) return;

      setTimeout(() => {
        router.replace({
          pathname: "/room/[id]",
          params: { id: roomId },
        });

        // ✅ لأن الغرفة Active بالفعل، دخول مباشر بدون join
        dispatch(enterRoomDirect({ roomId, preload: true }))
          .unwrap()
          .catch(() => {});
      }, 190);
    },
    [closeDrawer, currentRoomId, dispatch, router]
  );

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.overlay} onPress={closeDrawer} />

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>Active Rooms</Text>
          </View>

          <TouchableOpacity
            onPress={closeDrawer}
            activeOpacity={0.85}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => loadActiveRooms("refresh")}
          style={styles.refreshBtn}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Ionicons name="refresh" size={17} color={theme.text} />
          )}

          <Text style={styles.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>

        {loading && rooms.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Loading active rooms...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="warning-outline" size={28} color={theme.danger} />

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              onPress={() => loadActiveRooms("refresh")}
              activeOpacity={0.85}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="radio-outline" size={32} color={theme.icon} />

            <Text style={styles.emptyTitle}>No active rooms</Text>
            <Text style={styles.emptyText}>
              لا توجد غرف نشطة حاليًا لهذا المستخدم.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ActiveRoomRow
                item={item}
                theme={theme}
                currentRoomId={currentRoomId}
                onPress={openRoom}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </Animated.View>
    </View>
  );
}

function makeStyles(
  theme: typeof Colors.light,
  drawerWidth: number,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.30)",
    },

    drawer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: drawerWidth,
      backgroundColor: theme.card,
      borderLeftWidth: 1,
      borderColor: theme.border,

      // ✅ Safe Area
      paddingTop: Math.max(14, topInset + 10),
      paddingBottom: Math.max(14, bottomInset + 10),

      paddingHorizontal: 14,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: -4, height: 0 },
      elevation: 14,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 10,
    },

    title: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },

    subtitle: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
    },

    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    refreshBtn: {
      height: 40,
      borderRadius: 13,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },

    refreshText: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
    },

    listContent: {
      paddingBottom: Math.max(24, bottomInset + 18),
    },

    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },

    stateText: {
      marginTop: 10,
      color: theme.mutedText,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
    },

    emptyTitle: {
      marginTop: 10,
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      color: theme.mutedText,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 20,
      textAlign: "center",
    },

    errorText: {
      marginTop: 10,
      color: theme.danger,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: 20,
    },

    retryBtn: {
      marginTop: 14,
      height: 40,
      paddingHorizontal: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
    },

    retryText: {
      color: theme.primaryText,
      fontWeight: "900",
    },
  });
}