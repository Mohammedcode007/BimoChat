

// app/(tabs)/room/[id].tsx
// ✅ نسخة مُنقّحة كاملة + داعمة Light/Dark عبر Colors + إزالة الألوان الصلبة قدر الإمكان
// ✅ دمج الستايلات إلى factories تعتمد على theme
// ✅ إصلاح تكرار useEffect الخاص بـ roomId (كان مكرر) + إزالة تكرار مودال pinPreviewFull
// ✅ الإبقاء على كل المنطق الذي وضعته (UsersModal / Gifts / Boost / Pin / Voice / Reactions ...)

import { getMyInventory, selectMyStore } from "@/redux/slices/storeControl.slice";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio, ResizeMode, Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,

  FlatList,
  Image,
  ImageSourcePropType,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import RenderHTML from "react-native-render-html";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearBannedFlag,
  clearKickedFlag,
  fetchRoomMessages,
  fetchRoomStats,
  fetchRoomUsers,
  leaveAndRefreshRooms,
  leaveRoomAndExit,
  optimisticAddRoomMessage,
  pinRoomMessage,
  selectBannedFlag,
  selectKickedFlag,
  selectRoomActiveCount,
  selectRoomAvatarById,
  selectRoomLoadingMessages,
  selectRoomMessages,
  selectRoomNameById,
  selectRoomUsers,
  sendRoomMessage,
  socketRoleSetFailed,
  socketRoleSetRequested,
  socketRoleSetSucceeded
} from "@/redux/slices/room.slice";

import { boostRoom } from "@/redux/slices/roomControl.slice";

import { stripHtmlToText } from "@/components/stripHtmlToText";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import VoiceRecorderPreview from "@/components/VoiceRecorderPreview";

import {
  banRoomUserSocket,
  deleteRoomSocketMessage,
  joinRoomSocket,
  kickRoomUserSocket,
  leaveRoomSocket,
  setRoomUserRoleSocket,
  toggleRoomReaction as toggleRoomReactionSocket
} from "@/services/socket";

import BoostLottieOverlay from "@/components/BoostLottieOverlay";
import { debitMyCoinz } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import { uploadToCloudinary } from "@/services/upload.service";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";

/* ================= TYPES ================= */
type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";
type RoomRole = "creator" | "owner" | "admin" | "member";
type SnapshotRole = string;

type UserUI = {
  id: string;
  name: string;
  avatar?: string;
  role?: RoomRole;
  activeBadges?: string[];
  customEmojiBadge?: {
    emoji: string;
    isActive: boolean;
    expiresAt?: string | null;
  } | null;
  snapshotRole?: SnapshotRole;
  isOnline?: boolean;
};
type MessageUI = {
  id: string;
  type: "text" | "image" | "file" | "audio" | "video" | "system" | "gift";
  systemType?: "join" | "leave" | "announcement" | "promotion" | "ban" | "role";
  text?: string;
  uri?: string;
  clientId?: string;       // ✅ للـ optimistic
  serverId?: string;       // ✅ اختياري لو تحب تمييز _id صراحةً

  sender?: UserUI;
  time: string;
  replyTo?: MessageUI;
  reaction?: Reaction;
  gift?: {
    key: string;
    icon?: string;
    targetId?: string;
    targetName?: string;
    count?: number;
  };
  deletedForEveryone?: boolean;
};

const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

/* ================= BADGES ================= */
type BadgeKey = string;

const BADGE_META: Record<BadgeKey, { label: string; icon?: string; bg: string; fg: string }> = {
  gold: { label: "GOLD", icon: "🏅", bg: "#FEF3C7", fg: "#92400E" },
  blue: { label: "", icon: "twitter-verified", bg: "transparent", fg: "#1DA1F2" },
  business: { label: "BUSINESS", icon: "🏢", bg: "#E5E7EB", fg: "#111827" },
  vip: { label: "VIP", icon: "💎", bg: "#EDE9FE", fg: "#5B21B6" },
  pro: { label: "PRO", icon: "⚡", bg: "#DCFCE7", fg: "#166534" }
};
const getGiftPrice = (giftKey: string) => {
  const tempGift = TEMP_GIFTS.find((g) => g.key === giftKey);
  if (typeof tempGift?.price === "number") return tempGift.price;

  // fallback لو حبيت تضيف أسعار مستقبلاً داخل meta
  const meta = GIFT_META[giftKey] as any;
  if (typeof meta?.price === "number") return meta.price;

  return 0;
};
const BADGE_ORDER: BadgeKey[] = ["gold", "blue", "business", "vip", "pro"];

const normalizeBadges = (badges?: string[]) => {
  const arr = Array.isArray(badges) ? badges : [];
  const cleaned = arr.map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of cleaned) {
    if (!seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out;
};

const verificationToBadge = (verificationType?: string) => {
  const v = String(verificationType || "").trim().toLowerCase();
  if (!v || v === "none") return null;
  return v;
};

const pickPrimaryBadge = (badges?: string[]) => {
  const list = normalizeBadges(badges);
  if (!list.length) return null;
  for (const key of BADGE_ORDER) {
    if (list.includes(key)) return key;
  }
  return list[0];
};
const isCustomEmojiBadgeActive = (
  badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null
) => {
  if (!badge?.emoji) return false;
  if (!badge?.isActive) return false;
  if (badge?.expiresAt) {
    const t = new Date(badge.expiresAt).getTime();
    if (Number.isFinite(t) && t <= Date.now()) return false;
  }
  return true;
};
const NameBadge = ({ badgeKey }: { badgeKey?: string | null }) => {
  if (!badgeKey) return null;
  const meta = BADGE_META[badgeKey];
  if (!meta) return null;

  if (badgeKey === "blue") {
    return <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" style={{ marginLeft: 6 }} />;
  }

  return (
    <View style={[nameBadgeStyles.badge, { backgroundColor: meta.bg }]}>
      {!!meta.icon && (
        <Text style={[nameBadgeStyles.icon, { color: meta.fg }]}>{meta.icon}</Text>
      )}
    </View>
  );
};
const CustomEmojiBadgeView = ({
  badge
}: {
  badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null;
}) => {
  if (!isCustomEmojiBadgeActive(badge)) return null;

  return (
    <View
      style={{
        marginLeft: 6,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text style={{ fontSize: 15 }}>{badge?.emoji}</Text>
    </View>
  );
};
const nameBadgeStyles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", borderRadius: 999 },
  icon: { fontSize: 14 }
});

/* ================= GIFTS ================= */
type GiftItem = {
  key: string;
  title: string;
  icon?: string;
  lottie?: any;
  price?: number;
};
const TEMP_GIFTS: GiftItem[] = [
  {
    key: "gift_rose",
    title: "Rose",
    lottie: require("@/assets/lottie/rose.json"),
    price: 10
  },
  {
    key: "gift_tea",
    title: "tea",
    lottie: require("@/assets/lottie/tea.json"),
    price: 5
  },
  {
    key: "gift_bird",
    title: "bird",
    lottie: require("@/assets/lottie/bird.json"),
    price: 15
  },
  {
    key: "gift_cat",
    title: "cat",
    lottie: require("@/assets/lottie/cat.json"),
    price: 25
  },
  {
    key: "gift_hearts",
    title: "Hearts",
    lottie: require("@/assets/lottie/hearts.json"),
    price: 50
  }
];

const GIFT_META: Record<
  string,
  { icon: string; count: number; lottie?: any }
> = {
  gift_rose: {
    icon: "🌹",
    count: 40,
    lottie: require("@/assets/lottie/rose.json")
  },
  gift_tea: {
    icon: "👍",
    count: 55,
    lottie: require("@/assets/lottie/tea.json")
  },
  gift_bird: {
    icon: "🔥",
    count: 60,
    lottie: require("@/assets/lottie/bird.json")
  },
  gift_cat: {
    icon: "👑",
    count: 35,
    lottie: require("@/assets/lottie/cat.json")
  },
  gift_hearts: {
    icon: "🚀",
    count: 45,
    lottie: require("@/assets/lottie/hearts.json")
  },
  boost_rocket: {
    icon: "🚀",
    count: 55,
    lottie: require("@/assets/lottie/rocket2.json")
  }
};
function GiftPickerModal({
  visible,
  onClose,
  target,
  onPick,
  theme
}: {
  visible: boolean;
  onClose: () => void;
  target?: UserUI | null;
  onPick: (gift: { key: string }) => void;
  theme: typeof Colors.light;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 18,
            borderTopWidth: 1,
            borderColor: theme.border
          }}
          onPress={() => { }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text }}>Send a Gift</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: theme.mutedText }} numberOfLines={1}>
                To: {target?.name || "User"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: theme.surface2,
                borderWidth: 1,
                borderColor: theme.border
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: theme.separator, marginVertical: 12 }} />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {TEMP_GIFTS.map((g) => (
              <TouchableOpacity
                key={g.key}
                activeOpacity={0.85}
                onPress={() => onPick({ key: g.key })}
                style={{
                  width: "30%",
                  minWidth: 95,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface2,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center"
                }}
              >
                {g.lottie ? (
                  <LottieView
                    source={g.lottie}
                    autoPlay
                    loop
                    style={{ width: 56, height: 56 }}
                  />
                ) : (
                  <Text style={{ fontSize: 24 }}>{g.icon}</Text>
                )}
                <Text style={{ marginTop: 6, fontSize: 12, fontWeight: "800", color: theme.text }} numberOfLines={1}>
                  {g.title}
                </Text>
                {!!g.price && (
                  <Text style={{ marginTop: 4, fontSize: 11, color: theme.mutedText, fontWeight: "700" }}>
                    {g.price} Coinz
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ marginTop: 12, fontSize: 12, color: theme.mutedText, lineHeight: 18 }}>
            (مؤقتًا) اختيار الهدية فقط بدون إرسال.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function GiftBurstOverlay({
  visible,
  icon,
  count = 45,
  fromName,
  toName,
  durationMs = 2600,
  onDone
}: {
  visible: boolean;
  icon: string;
  count?: number;
  fromName?: string;
  toName?: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({ length: Math.max(12, Math.min(count, 90)) }).map(() => ({
      x: Math.random(),
      delay: Math.floor(Math.random() * 260),
      dur: 1400 + Math.floor(Math.random() * 900),
      startY: 0.25 + Math.random() * 0.6,
      endY: 0.05 + Math.random() * 0.25,
      size: 18 + Math.floor(Math.random() * 18),
      spin: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 25),
      t: new Animated.Value(0)
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    particles.forEach((p) => p.t.setValue(0));

    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();

    const anims = particles.map((p) =>
      Animated.timing(p.t, { toValue: 1, duration: p.dur, delay: p.delay, useNativeDriver: true })
    );
    Animated.parallel(anims).start();

    const fadeOutAt = Math.max(500, durationMs - 450);
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    }, fadeOutAt);

    const doneTimer = setTimeout(() => onDone(), durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Animated.View style={{ opacity, width: "100%", height: "100%" }}>
        <View style={{ position: "absolute", top: 70, left: 16, right: 16, alignItems: "center" }}>
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)"
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
              {fromName ? `${fromName} → ` : ""}
              {toName ? toName : "Someone"}
            </Text>
          </View>
        </View>

        {particles.map((p, idx) => {
          const xPx = 12 + p.x * (width - 24);
          const startY = height * p.startY;
          const endY = height * p.endY;

          const translateY = p.t.interpolate({ inputRange: [0, 1], outputRange: [startY, endY] });
          const scale = p.t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.7, 1.1, 0.95] });
          const rotate = p.t.interpolate({ inputRange: [0, 1], outputRange: [`${-p.spin}deg`, `${p.spin}deg`] });
          const particleOpacity = p.t.interpolate({ inputRange: [0, 0.15, 0.9, 1], outputRange: [0, 1, 1, 0] });

          return (
            <Animated.View
              key={idx}
              style={{
                position: "absolute",
                left: xPx,
                transform: [{ translateY }, { scale }, { rotate }],
                opacity: particleOpacity
              }}
            >
              <Text style={{ fontSize: p.size, color: "#FFF" }}>{icon}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}
function GiftLottieOverlay({
  visible,
  source,
  fromName,
  toName,
  durationMs = 2600,
  onDone
}: {
  visible: boolean;
  source?: any;
  fromName?: string;
  toName?: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(0);
    scale.setValue(0.85);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true
      })
    ]).start();

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true
      }).start();
    }, Math.max(500, durationMs - 400));

    const doneTimer = setTimeout(() => onDone(), durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, durationMs, onDone, opacity, scale]);

  if (!visible || !source) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -90,
            left: -120,
            right: -120,
            alignItems: "center"
          }}
        >
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)"
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
              {fromName ? `${fromName} → ` : ""}
              {toName || "Someone"}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 260,
            height: 260,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <LottieView
            source={source}
            autoPlay
            loop
            style={{ width: 260, height: 260 }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
/* ================= ROLE STAR ================= */
const ROLE_STAR_COLOR: Record<string, string> = {
  creator: "#F59E0B",
  owner: "#8B5CF6",
  admin: "#3B82F6"
};

const shouldShowStar = (role?: RoomRole) => role === "creator" || role === "owner" || role === "admin";
const getStarColor = (role?: RoomRole) => (role ? ROLE_STAR_COLOR[role] || "#111827" : "#111827");

/* ================= USERS MODAL (Themed) ================= */
function UsersModal({
  visible,
  onClose,
  users,
  myUserId,
  myRole,
  onCopyUser,
  onChangeRole,
  onKickUser,
  onBanUser,
  theme
}: {
  visible: boolean;
  onClose: () => void;
  users: UserUI[];
  myUserId: string;
  myRole?: UserUI["role"];
  onCopyUser: (u: UserUI) => void;
  onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
  onKickUser: (u: UserUI) => void;
  onBanUser: (u: UserUI) => void;
  theme: typeof Colors.light;
}) {
  const canManage = myRole === "creator" || myRole === "owner" || myRole === "admin";
  const s = useMemo(() => makeUsersStyles(theme), [theme]);

  const roleLabel = (r?: string) => {
    if (r === "creator") return "Creator";
    if (r === "owner") return "Owner";
    if (r === "admin") return "Admin";
    return "Member";
  };

  const RoleChip = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[s.roleChip, active && s.roleChipActive]} activeOpacity={0.85}>
      <Text style={[s.roleChipText, active && s.roleChipTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => { }}>
          <View style={s.header}>
            <Text style={s.title}>Users</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={s.note}>
            <Text style={s.noteText}>
              اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
              {canManage ? "يمكنك أيضًا تغيير الدور." : "ليس لديك صلاحية لتغيير الأدوار."}
            </Text>
          </View>

          <View style={s.list}>
            {users.map((u) => {
              const isMe = u.id === myUserId;
              return (
                <TouchableOpacity key={u.id} style={s.row} onPress={() => onCopyUser(u)} activeOpacity={0.88}>
                  <Image source={{ uri: u.avatar || "https://i.pravatar.cc/150?img=12" }} style={s.avatar} />

                  <View style={{ flex: 1 }}>
                    <View style={s.rowTop}>
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                        <Text style={s.name} numberOfLines={1}>
                          {u.name} {isMe ? "(You)" : ""}
                        </Text>

                        <CustomEmojiBadgeView badge={u.customEmojiBadge} />

                        <NameBadge badgeKey={pickPrimaryBadge(u.activeBadges)} />
                      </View>
                      <View style={s.badge}>
                        <Text style={s.badgeText}>{roleLabel(u.role)}</Text>
                      </View>
                    </View>

                    <Text style={s.sub} numberOfLines={1}>
                      ID: {u.id}
                    </Text>

                    {canManage && !isMe && (
                      <View style={s.rolesRow}>
                        <RoleChip title="Member" active={(u.role || "member") === "member"} onPress={() => onChangeRole(u, "member")} />
                        <RoleChip title="Admin" active={u.role === "admin"} onPress={() => onChangeRole(u, "admin")} />
                        <RoleChip title="Owner" active={u.role === "owner"} onPress={() => onChangeRole(u, "owner")} />
                      </View>
                    )}

                    {canManage && !isMe && (
                      <View style={s.actionsRow}>
                        <TouchableOpacity onPress={() => onKickUser(u)} style={s.kickBtn} activeOpacity={0.85}>
                          <Text style={s.kickText}>Kick</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onBanUser(u)} style={s.banBtn} activeOpacity={0.85}>
                          <Text style={s.banText}>Ban</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Ionicons name="copy-outline" size={18} color={theme.icon} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ================= MESSAGE ITEM (Themed) ================= */
function MessageItem({
  item,
  isMe,
  showName,
  onLongPress,
  onPressImage,
  onTogglePlay,
  playingId,
  progressAnim,
  onGiftDone,
  onAvatarLongPress,
  theme,
  bubble
}: {
  item: MessageUI;
  isMe: boolean;
  showName: boolean;
  onLongPress: () => void;
  onPressImage: (uri: string) => void;
  onTogglePlay: (uri: string, id: string) => void;
  playingId: string | null;
  progressAnim: Animated.Value;
  onGiftDone?: () => void;
  onAvatarLongPress: (u?: UserUI) => void;
  theme: typeof Colors.light;
  bubble: ReturnType<typeof makeBubbleStyles>;
}) {
  const { width } = useWindowDimensions();

  const copyMessageContent = async () => {
    if (item.type === "system") return;
    if (item.deletedForEveryone) return;

    const value =
      item.type === "text"
        ? item.text || ""
        : item.type === "file"
          ? item.text || item.uri || ""
          : item.type === "image" || item.type === "video" || item.type === "audio"
            ? item.uri || ""
            : "";

    const v = String(value || "").trim();
    if (!v) return;

    await Clipboard.setStringAsync(v);
    Alert.alert("Copied", "تم نسخ محتوى الرسالة");
  };

  if (item.type === "system") {
    return (
      <View style={bubble.sysWrap}>
        <View style={bubble.sysBubble}>
          <RenderHTML
            contentWidth={width - 40}
            source={{ html: String(item.text || "") }}
            baseStyle={{ fontSize: 13, color: theme.text, textAlign: "center", fontWeight: "700", lineHeight: 18 }}
          />
          <Text style={bubble.sysTime}>{item.time}</Text>
        </View>
      </View>
    );
  }

  const senderRole = item.sender?.role;
  const starColor = getStarColor(senderRole);

  return (
    <View style={[bubble.row, isMe ? bubble.rowMe : bubble.rowOther]}>
      {!isMe && (
        <Pressable style={bubble.avatarWrapLeft} onLongPress={() => onAvatarLongPress(item.sender)} delayLongPress={350}>
          <Image source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }} style={bubble.avatar} />
          {shouldShowStar(senderRole) && <Text style={[bubble.avatarStarLeft, { color: starColor }]}>★</Text>}
        </Pressable>
      )}

      <TouchableOpacity
        activeOpacity={0.88}
        onLongPress={onLongPress}
        onPress={() => {
          if (item.type === "text" || item.type === "file") copyMessageContent();
        }}
        style={[bubble.bubble, isMe ? bubble.bubbleMe : bubble.bubbleOther]}
      >
        {showName && !!item.sender?.name && (
          <View style={bubble.nameWrap}>
            <View style={bubble.nameRow}>
              <Text style={bubble.senderName} numberOfLines={1}>
                {item.sender.name}
              </Text>

              <CustomEmojiBadgeView badge={item.sender?.customEmojiBadge} />

              <NameBadge badgeKey={pickPrimaryBadge(item.sender?.activeBadges)} />
            </View>
            <View style={bubble.nameUnderline} />
          </View>
        )}

        {!!item.deletedForEveryone ? (
          <Text style={bubble.msgTextMuted}>🚫 تم حذف الرسالة</Text>
        ) : (
          <>
            {!item.deletedForEveryone && item.replyTo && (
              <View style={bubble.replyBox}>
                <View style={bubble.replyTop}>
                  <Text style={bubble.replyName} numberOfLines={1}>
                    {item.replyTo.sender?.name || "User"}
                  </Text>
                  <Text style={bubble.replyTag}>Reply</Text>
                </View>

                {item.replyTo.type !== "text" ? (
                  <Text style={bubble.replyText} numberOfLines={1}>
                    {item.replyTo.type === "image"
                      ? "📷 Image"
                      : item.replyTo.type === "video"
                        ? "🎬 Video"
                        : item.replyTo.type === "audio"
                          ? "🎤 Voice"
                          : item.replyTo.type === "file"
                            ? "📄 File"
                            : "Message"}
                  </Text>
                ) : (
                  <Text style={bubble.replyText} numberOfLines={2}>
                    {stripHtmlToText(String(item.replyTo.text || "")) || "—"}
                  </Text>
                )}
              </View>
            )}

            {item.type === "text" && (
              <Text
                style={[
                  bubble.msgText,
                  isMe && {
                    textAlign: "right",
                    writingDirection: "rtl"
                  }
                ]}
              >
                {item.text}
              </Text>
            )}

            {item.type === "gift" ? (
              (() => {
                const key = item.gift?.key || "";
                const senderName = item.sender?.name || "Someone";
                if (key.startsWith("boost")) {
                  return (
                    <Text style={[bubble.msgTextMuted, { fontWeight: "900", color: theme.warning }]}>
                      🚀 {senderName} Boosted the Room
                    </Text>
                  );
                }
                return (
                  <Text style={bubble.msgTextMuted}>
                    🎁 {senderName} → {item.gift?.targetName || "Someone"} {item.gift?.icon || "🎁"}
                  </Text>
                );
              })()
            ) : null}

            {item.type === "image" && item.uri ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => onPressImage(item.uri!)}>
                <Image source={{ uri: item.uri }} style={bubble.media} />
              </TouchableOpacity>
            ) : null}

            {item.type === "video" && item.uri ? (
              <View style={bubble.videoWrapper}>
                <Video source={{ uri: item.uri }} style={bubble.video} useNativeControls resizeMode={ResizeMode.CONTAIN} isLooping={false} />
              </View>
            ) : null}

            {item.type === "file" ? (
              <View style={bubble.fileRow}>
                <Text style={bubble.fileIcon}>📄</Text>
                <Text style={bubble.fileName} numberOfLines={1}>
                  {item.text || "File"}
                </Text>
              </View>
            ) : null}

            {item.type === "audio" && item.uri ? (
              <VoiceMessagePlayer uri={item.uri} isMe={isMe} />
            ) : null}
          </>
        )}

        {item.reaction && (
          <View style={bubble.reaction}>
            <Text>{item.reaction}</Text>
          </View>
        )}
      </TouchableOpacity>

      {isMe && (
        <Pressable style={bubble.avatarWrapRight} onLongPress={() => onAvatarLongPress(item.sender)} delayLongPress={350}>
          <Image source={{ uri: item.sender?.avatar || "https://i.pravatar.cc/150?img=12" }} style={bubble.avatar} />
          {shouldShowStar(senderRole) && <Text style={[bubble.avatarStarRight, { color: starColor }]}>★</Text>}
        </Pressable>
      )}
    </View>
  );
}

/* ================= MAIN SCREEN ================= */
export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const styles = useMemo(() => makeScreenStyles(theme, insets.bottom), [theme, insets.bottom]);
  const bubbleStyles = useMemo(() => makeBubbleStyles(theme), [theme]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id || "");

  const flatListRef = useRef<any>(null);
  const keyboardHeight = useSharedValue(0);
  const [inputBarHeight, setInputBarHeight] = useState(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        keyboardHeight.value = Math.max(0, e.height);
      },
      onEnd: (e) => {
        "worklet";
        keyboardHeight.value = Math.max(0, e.height);
      },
    },
    []
  );
  const inputBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -keyboardHeight.value,
        },
      ],
    };
  });

  const listSpacerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: keyboardHeight.value,
    };
  });
  const authUser = useAppSelector((state) => state.auth.user);
  const myUserId = String((authUser as any)?._id || (authUser as any)?.id || "");
  const myName = String((authUser as any)?.username || (authUser as any)?.name || "Me");
  const myAvatar = String((authUser as any)?.avatar || "https://i.pravatar.cc/150?img=32");

  const reduxMessages = useAppSelector((state) => selectRoomMessages(state, roomId));
  const loadingMessages = useAppSelector(selectRoomLoadingMessages);
  const roomUsers = useAppSelector((state) => selectRoomUsers(state, roomId));
  const roomName = useAppSelector((state) => selectRoomNameById(state, roomId));
  const roomAvatar = useAppSelector((state) => selectRoomAvatarById(state, roomId));
  const activeCount = useAppSelector((state) => selectRoomActiveCount(state, roomId));

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MessageUI | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pendingVoiceUri, setPendingVoiceUri] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [uploading, setUploading] = useState<{ visible: boolean; title: string; sub?: string }>({
    visible: false,
    title: "Uploading…",
    sub: undefined
  });

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [activeAudio, setActiveAudio] = useState<MessageUI | null>(null);

  const [previewImage, setPreviewImage] = useState<string | ImageSourcePropType | null>(null);

  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageUI | null>(null);

  const [pinHtml, setPinHtml] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState(false);

  const [pinPreviewFull, setPinPreviewFull] = useState(false);

  const [giftPicker, setGiftPicker] = useState<{ visible: boolean; target?: UserUI | null }>({ visible: false, target: null });

  const [giftDoneById, setGiftDoneById] = useState<Record<string, boolean>>({});
  const markGiftDone = (id: string) => setGiftDoneById((prev) => ({ ...prev, [id]: true }));

  const [giftOverlay, setGiftOverlay] = useState<{
    visible: boolean;
    messageId: string | null;
    giftKey: string | null;
    icon: string;
    count: number;
    lottie?: any;
    fromName?: string;
    toName?: string;
  }>({
    visible: false,
    messageId: null,
    giftKey: null,
    icon: "🎁",
    count: 45,
    lottie: undefined,
    fromName: undefined,
    toName: undefined
  });

  // ✅ لمنع leave مرتين
  const didLeaveRef = useRef(false);
  const kicked = useAppSelector((state) => selectKickedFlag(state, roomId));
  const banned = useAppSelector((state) => selectBannedFlag(state, roomId));

  const myRole = useMemo<UserUI["role"]>(() => {
    const me = (roomUsers || []).find((u: any) => String(u?._id) === myUserId);
    return me?.role;
  }, [roomUsers, myUserId]);

  const canModerate = useMemo(() => myRole === "creator" || myRole === "owner" || myRole === "admin", [myRole]);

  const usersMap = useMemo(() => {
    const map = new Map<
      string,
      {
        username?: string;
        avatar?: string;
        role?: any;
        customEmojiBadge?: {
          emoji?: string;
          isActive?: boolean;
          expiresAt?: string | null;
        } | null;
      }
    >();

    for (const u of roomUsers || []) {
      if (u?._id) {
        map.set(String(u._id), {
          username: u.username,
          avatar: u.avatar,
          role: u.role,
          customEmojiBadge:
            u?.customEmojiBadge && typeof u.customEmojiBadge === "object"
              ? {
                emoji: String(u.customEmojiBadge.emoji || ""),
                isActive: Boolean(u.customEmojiBadge.isActive),
                expiresAt: u.customEmojiBadge.expiresAt
                  ? String(u.customEmojiBadge.expiresAt)
                  : null
              }
              : null
        });
      }
    }

    if (myUserId) {
      map.set(myUserId, {
        username: myName,
        avatar: myAvatar,
        role: myRole,
        customEmojiBadge:
          (authUser as any)?.customEmojiBadge && typeof (authUser as any).customEmojiBadge === "object"
            ? {
              emoji: String((authUser as any).customEmojiBadge.emoji || ""),
              isActive: Boolean((authUser as any).customEmojiBadge.isActive),
              expiresAt: (authUser as any).customEmojiBadge.expiresAt
                ? String((authUser as any).customEmojiBadge.expiresAt)
                : null
            }
            : null
      });
    }

    return map;
  }, [roomUsers, myUserId, myName, myAvatar, myRole, authUser]);
  const resolveUserNameById = (id?: string) => {
    if (!id) return "";
    const v = usersMap.get(String(id));
    return String(v?.username || "");
  };

  const normalizeRoleLabelAr = (role?: string) => {
    if (!role) return "عضو";
    if (role === "creator") return "منشئ";
    if (role === "owner") return "مالك";
    if (role === "admin") return "مشرف";
    return "عضو";
  };

  const clipText = (s: string, max = 120) => {
    const t = String(s || "");
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + "…";
  };

  const safeDisplayText = (content: string) => stripHtmlToText(content) || "—";

  const scrollToBottom = () => {
    try {
      flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    } catch { }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  /* ================= MIC PERMISSION ================= */
  const ensureMicPermission = async () => {
    try {
      const perm = await Audio.getPermissionsAsync();
      if (perm.granted) return true;

      const req = await Audio.requestPermissionsAsync();
      if (req.granted) return true;

      Alert.alert(
        "Microphone Permission",
        "لا يمكن تسجيل الصوت بدون إذن الميكروفون. افتح الإعدادات ثم فعّل Microphone.",
        [
          { text: "إلغاء", style: "cancel" },
          { text: "فتح الإعدادات", onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    } catch {
      Alert.alert("Error", "تعذر طلب إذن الميكروفون.");
      return false;
    }
  };

  /* ================= FETCH + SOCKET (مرة واحدة فقط) ================= */
  useEffect(() => {
    if (!roomId) return;

    dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false }));
    dispatch(fetchRoomUsers(roomId));
    dispatch(fetchRoomStats(roomId));
  dispatch(getMyInventory() as any);

    joinRoomSocket(roomId);
    ensureMicPermission();

    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /* ================= KICK/BAN HANDLERS ================= */
  useEffect(() => {
    if (!roomId || !kicked) return;
    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const msg = (kicked as any)?.message || "تم طردك من الغرفة.";
    Alert.alert("تم الطرد", msg, [
      {
        text: "حسناً",
        onPress: async () => {
          try {
            await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
          } catch { }
          dispatch(clearKickedFlag({ roomId }));
          router.back();
        }
      }
    ]);
  }, [kicked, roomId, dispatch, router]);

  useEffect(() => {
    if (!roomId || !banned) return;
    if (didLeaveRef.current) return;
    didLeaveRef.current = true;

    const reason = (banned as any)?.reason ? `السبب: ${(banned as any).reason}` : "";
    const msg = reason || "تم حظرك من الغرفة.";

    Alert.alert("تم الحظر", msg, [
      {
        text: "حسناً",
        onPress: async () => {
          try {
            await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
          } catch { }
          dispatch(clearBannedFlag({ roomId }));
          router.back();
        }
      }
    ]);
  }, [banned, roomId, dispatch, router]);

  /* ================= CLEANUP SOUND/TIMERS ================= */
  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }
        } catch { }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= KEYBOARD FIX (inverted) ================= */
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      try {
        flatListRef.current?.scrollToOffset?.({ offset: 0, animated: false });
      } catch { }
    });
    return () => sub.remove();
  }, []);

  /* ================= USERS UI ================= */
  const usersUI: UserUI[] = useMemo(() => {
    return (roomUsers || []).map((u: any) => ({
      id: String(u?._id),
      name: String(u?.username || "User"),
      avatar: String(u?.avatar || ""),
      role: u?.role,
      activeBadges: Array.isArray(u?.activeCustomization?.badges)
        ? u.activeCustomization.badges
        : [],
      customEmojiBadge:
        u?.customEmojiBadge && typeof u.customEmojiBadge === "object"
          ? {
            emoji: String(u.customEmojiBadge.emoji || ""),
            isActive: Boolean(u.customEmojiBadge.isActive),
            expiresAt: u.customEmojiBadge.expiresAt
              ? String(u.customEmojiBadge.expiresAt)
              : null
          }
          : null,
      isOnline: Boolean(u?.isOnline)
    }));
  }, [roomUsers]);

  /* ================= messagesById (for reply preview) ================= */
  const messagesById = useMemo(() => {
    const mp = new Map<string, any>();
    for (const m of reduxMessages || []) {
      if (m?._id) mp.set(String(m._id), m);
    }
    return mp;
  }, [reduxMessages]);

  /* ================= SENDER PICKING ================= */
  const DEBUG_USER = false;

  const logSenderFromMessage = (m: any, tag = "SENDER_DUMP") => {
    if (!DEBUG_USER) return;
    try {
      const snap = m?.senderSnapshot;
      const active = snap?.activeCustomization;
      const dump = {
        tag,
        messageId: String(m?._id || ""),
        backendType: String(m?.type || ""),
        senderRaw: m?.sender,
        senderSnapshot: snap
          ? {
            _id: String(snap?._id || ""),
            username: String(snap?.username || ""),
            avatar: String(snap?.avatar || ""),
            verificationType: String(snap?.verificationType || ""),
            badgesRoot: Array.isArray(snap?.badges) ? snap.badges : [],
            activeCustomization: active
              ? {
                badges: Array.isArray(active?.badges) ? active.badges : [],
                verificationType: String(active?.verificationType || "")
              }
              : null
          }
          : null
      };
      console.log(`[${tag}]`, dump);
    } catch (e) {
      console.log(`[${tag}] FAILED`, e);
    }
  };

  const pickSenderFromMessage = (m: any) => {
    const senderObj =
      typeof m?.sender === "object" && m?.sender
        ? m.sender
        : m?.sender
          ? { _id: String(m.sender), username: "", avatar: "" }
          : null;

    const snap = m?.senderSnapshot || null;

    const senderId = String(snap?._id || senderObj?._id || m?.senderId || "").trim();

    const username = String(
      snap?.username ||
      senderObj?.username ||
      m?.senderUsername ||
      m?.actorName ||
      m?.username ||
      ""
    ).trim();

    const avatar = String(snap?.avatar || senderObj?.avatar || "").trim();

    const snapshotRole = String(snap?.role || senderObj?.role || "").trim();
    const verificationType = String(snap?.verificationType || senderObj?.verificationType || "").trim();

    const activeBadges: string[] =
      Array.isArray(snap?.activeCustomization?.badges) && snap.activeCustomization.badges.length
        ? snap.activeCustomization.badges
        : Array.isArray(snap?.badges) && snap.badges.length
          ? snap.badges
          : [];

    const customEmojiBadge =
      snap?.customEmojiBadge && typeof snap.customEmojiBadge === "object"
        ? {
          emoji: String(snap.customEmojiBadge.emoji || ""),
          isActive: Boolean(snap.customEmojiBadge.isActive),
          expiresAt: snap.customEmojiBadge.expiresAt
            ? String(snap.customEmojiBadge.expiresAt)
            : null
        }
        : senderObj?.customEmojiBadge && typeof senderObj.customEmojiBadge === "object"
          ? {
            emoji: String(senderObj.customEmojiBadge.emoji || ""),
            isActive: Boolean(senderObj.customEmojiBadge.isActive),
            expiresAt: senderObj.customEmojiBadge.expiresAt
              ? String(senderObj.customEmojiBadge.expiresAt)
              : null
          }
          : null;

    return {
      senderId,
      username,
      avatar,
      snapshotRole: snapshotRole || undefined,
      activeBadges,
      verificationType,
      customEmojiBadge
    };
  };

  /* ================= mapReduxToUIMessage ================= */
  // ✅ mapReduxToUIMessage كاملة (مُهيّأة للـ Optimistic بدون “فلاش”)
  // - تعتمد على clientId كـ key ثابت للـ FlatList
  // - تملأ serverId عند وجود _id
  // - لا تستخدم m?._id كـ id للواجهة حتى لا يتغير المفتاح عند وصول السيرفر

  const mapReduxToUIMessage = (m: any): MessageUI => {
    logSenderFromMessage(m, "MAP_MESSAGE_USER_DUMP");

    const backendType = String(m?.type || "text");

    const isSystem =
      backendType === "system" ||
      backendType === "announcement" ||
      backendType === "join" ||
      backendType === "leave" ||
      backendType === "promotion" ||
      backendType === "ban" ||
      backendType === "role";

    // ✅ IDs
    const serverId = m?._id ? String(m._id) : undefined;
    const clientId = m?.clientId ? String(m.clientId) : undefined;

    // ✅ المفتاح الثابت للـ FlatList: لا يتغير عند وصول _id
    // إذا عندك clientId استخدمه دائمًا، وإلا استخدم serverId
    const stableId =
      clientId ||
      serverId ||
      `tmp:${String(m?.createdAt || Date.now())}:${Math.random().toString(16).slice(2)}`;

    const picked = pickSenderFromMessage(m);
    const senderId = String(picked.senderId || "").trim();

    const extraBadge = verificationToBadge((picked as any)?.verificationType);
    const mergedBadges = normalizeBadges([...(picked.activeBadges || []), ...(extraBadge ? [extraBadge] : [])]);

    // اسم المستخدم في رسائل السيستم
    let systemUserName = String(picked.username || "").trim();
    if (!systemUserName && senderId) systemUserName = String(resolveUserNameById(senderId) || "").trim();
    if (!systemUserName && senderId && myUserId && senderId === myUserId) systemUserName = myName;
    if (!systemUserName) systemUserName = "مستخدم";

    // نص السيستم
    let systemText = String(m?.content || "");

    if (backendType === "join") systemText = `✅ ${systemUserName} Join`;
    else if (backendType === "leave") systemText = `🚪 ${systemUserName} Left`;
    else if (backendType === "promotion") {
      const action = String(m?.action || m?.meta?.action || "");
      const actor = String(m?.actorName || m?.meta?.actorName || "").trim() || systemUserName || "مشرف";
      const target = String(m?.targetName || m?.meta?.targetName || "").trim();
      const roleRaw = String(m?.role || m?.meta?.role || "").trim();

      const isRoleChange =
        action === "role:set" ||
        Boolean(m?.actorName || m?.targetName || m?.role || m?.meta?.actorName || m?.meta?.targetName || m?.meta?.role);

      if (isRoleChange) {
        const targetName = target || "مستخدم";
        const roleAr = roleRaw ? normalizeRoleLabelAr(roleRaw) : "";
        systemText = `⭐ تم ترقية ${targetName}${roleAr ? ` إلى ${roleAr}` : ""} بواسطة ${actor}`;
      } else {
        systemText = `⭐ تمت ترقية ${systemUserName}`;
      }
    } else if (backendType === "ban") systemText = `⛔ تم حظر ${systemUserName}`;
    else if (backendType === "announcement") systemText = `📢 ${m?.content || ""}`;
    else if (backendType === "role") {
      const actor = String(m?.actorName || systemUserName || "مشرف");
      const target = String(m?.targetName || "مستخدم");
      const r = normalizeRoleLabelAr(String(m?.role || ""));
      systemText = `⭐ تم ترقية ${target}${r ? ` إلى ${r}` : ""} بواسطة ${actor}`;
    }

    // ✅ replyTo preview
    const replyRaw = m?.replyTo || m?.replyToId || m?.meta?.replyTo || m?.meta?.replyToId || null;

    const buildReplyPreview = (raw: any): MessageUI | undefined => {
      if (!raw) return undefined;

      // لو السيرفر بعت object كامل
      if (typeof raw === "object") {
        const rid = String(raw?._id || raw?.clientId || "reply");
        const rType = String(raw?.type || "text");

        const uiT: MessageUI["type"] =
          rType === "image"
            ? "image"
            : rType === "video"
              ? "video"
              : rType === "audio"
                ? "audio"
                : rType === "file"
                  ? "file"
                  : "text";

        return {
          id: rid,
          clientId: raw?.clientId ? String(raw.clientId) : undefined,
          serverId: raw?._id ? String(raw._id) : undefined,
          type: uiT,
          text: String(raw?.content || "Media message"),
          uri: raw?.media?.url,
          sender: {
            id: String(raw?.sender?._id || raw?.senderId || "unknown"),
            name: String(raw?.sender?.username || raw?.senderUsername || "User"),
            avatar: String(raw?.sender?.avatar || "")
          },
          time: ""
        };
      }

      // لو replyTo عبارة عن id string
      if (typeof raw === "string") {
        const rid = String(raw);
        const ref = messagesById.get(rid);

        if (!ref) {
          return { id: rid, type: "text", text: "Replying to a message…", time: "" } as any;
        }

        const refType = String(ref?.type || "text");
        const uiT: MessageUI["type"] =
          refType === "image"
            ? "image"
            : refType === "video"
              ? "video"
              : refType === "audio"
                ? "audio"
                : refType === "file"
                  ? "file"
                  : "text";

        const pickedRef = pickSenderFromMessage(ref);
        const refSenderId = String(pickedRef?.senderId || "").trim();
        const refSenderName =
          String(pickedRef?.username || "").trim() ||
          (refSenderId === myUserId ? myName : String(resolveUserNameById(refSenderId) || "").trim()) ||
          "User";

        return {
          id: String(ref?.clientId || ref?._id || rid),
          clientId: ref?.clientId ? String(ref.clientId) : undefined,
          serverId: ref?._id ? String(ref._id) : undefined,
          type: uiT,
          text: String(ref?.content || "Media message"),
          uri: ref?.media?.url,
          sender: {
            id: refSenderId || "unknown",
            name: refSenderName,
            avatar: String(pickedRef?.avatar || "")
          },
          time: ""
        };
      }

      return undefined;
    };

    const uiReplyTo = buildReplyPreview(replyRaw);

    // ✅ uiType
    let uiType: MessageUI["type"] = "text";
    if (isSystem) uiType = "system";
    else if (backendType === "gift") uiType = "gift";
    else if (backendType === "image") uiType = "image";
    else if (backendType === "video") uiType = "video";
    else if (backendType === "audio") uiType = "audio";
    else if (backendType === "file") uiType = "file";

    // ✅ time (يفضل تثبيت createdAt في optimistic لتقليل الحركة)
    const time = new Date(m?.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // ✅ reaction (أول reaction فقط)
    const firstReactionEmoji =
      Array.isArray(m?.reactions) && m.reactions.length ? String(m.reactions[0]?.emoji || "") : "";
    const uiReaction = REACTIONS.includes(firstReactionEmoji as any) ? (firstReactionEmoji as Reaction) : undefined;

    // ✅ sender role من usersMap
    const roomRole = usersMap.get(senderId)?.role as RoomRole | undefined;

    const senderUI: UserUI = {
      id: String(senderId || "unknown"),
      name: picked.username || (senderId && senderId === myUserId ? myName : "User"),
      avatar: picked.avatar || (senderId && senderId === myUserId ? myAvatar : ""),
      role: roomRole,
      snapshotRole: picked.snapshotRole,
      activeBadges: mergedBadges,
      customEmojiBadge: (picked as any).customEmojiBadge || null
    };

    const messageText = isSystem ? systemText : String(m?.content || "");

    // ✅ gift payload
    const giftPayload = m?.gift || m?.meta?.gift || null;
    const giftKey = backendType === "gift" ? String(giftPayload?.key || m?.content || "") : "";
    const giftIcon = String(giftPayload?.icon || "") || (GIFT_META[giftKey]?.icon || "🎁");
    const giftCount = Number(giftPayload?.count || 0) || (GIFT_META[giftKey]?.count || 45);

    const giftTargetId = giftPayload?.targetId ? String(giftPayload.targetId) : undefined;
    const giftTargetName = giftPayload?.targetName ? String(giftPayload.targetName) : undefined;

    return {
      // ✅ أهم سطر: id ثابت للـ FlatList
      id: stableId,

      // ✅ احتفظ بالاثنين للاستخدام في socket actions (reaction/delete) وفي replace بالريدكس
      clientId,
      serverId,

      type: uiType,
      systemType: isSystem ? (backendType as any) : undefined,

      text: messageText,
      uri: m?.media?.url,

      // في announcement كنت تخفي sender عندك — نفس السلوك
      sender: backendType === "announcement" ? senderUI : isSystem ? undefined : senderUI,

      gift:
        uiType === "gift"
          ? { key: giftKey, icon: giftIcon, count: giftCount, targetId: giftTargetId, targetName: giftTargetName }
          : undefined,

      replyTo: uiReplyTo,
      reaction: uiReaction,
      deletedForEveryone: Boolean(m?.deletedForEveryone),
      time
    };
  };

  const uiMessages: MessageUI[] = useMemo(() => {
    if (!reduxMessages) return [];
    return reduxMessages.map(mapReduxToUIMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, roomUsers, myUserId, myName, myAvatar, myRole]);

  /* ================= latestPinned ================= */
  const latestPinned = useMemo(() => {
    const list = reduxMessages || [];
    const pinned = list.filter((m: any) => Boolean(m?.isPinned) && !m?.deletedForEveryone);
    if (!pinned.length) return null;

    pinned.sort((a: any, b: any) => {
      const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return tb - ta;
    });

    return mapReduxToUIMessage(pinned[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxMessages, roomUsers, myUserId, myName, myAvatar, myRole]);

  /* ================= GIFT OVERLAY AUTO ================= */
  useEffect(() => {
    const latestGift = [...uiMessages].find((m) => m.type === "gift" && !giftDoneById[m.id] && !m.deletedForEveryone);
    if (!latestGift) return;

    if (giftOverlay.visible && giftOverlay.messageId === latestGift.id) return;

    const key = String(latestGift.gift?.key || latestGift.text || "");
    const meta = GIFT_META[key] || { icon: "🎁", count: 45, lottie: undefined };
    const fromName = latestGift.sender?.name || "Someone";
    const isBoost = key.startsWith("boost");
    const toName = isBoost ? "Room" : latestGift.gift?.targetName || "Someone";

    setGiftOverlay({
      visible: true,
      messageId: latestGift.id,
      giftKey: key,
      icon: latestGift.gift?.icon || meta.icon,
      count: latestGift.gift?.count || meta.count,
      lottie: meta.lottie,
      fromName,
      toName
    });
  }, [uiMessages, giftDoneById, giftOverlay.visible, giftOverlay.messageId]);

  /* ================= AUDIO (GLOBAL BAR anim) ================= */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: playbackDuration ? playbackProgress / playbackDuration : 0,
      duration: 120,
      useNativeDriver: false
    }).start();
  }, [playbackProgress, playbackDuration, progressAnim]);

  const togglePlay = async (uri: string, id: string) => {
    if (recording) return;

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

    if (playingId === id && sound) {
      await sound.pauseAsync();
      setPlayingId(null);
      return;
    }

    if (activeAudio?.id === id && sound) {
      await sound.playAsync();
      setPlayingId(id);
      return;
    }

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    setPlayingId(id);
    setActiveAudio({ id, uri, type: "audio", time: "" } as any);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      setPlaybackProgress(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 1);

      if (status.didJustFinish) {
        setPlayingId(null);
        setActiveAudio(null);
        setPlaybackProgress(0);
      }
    });

    await newSound.playAsync();
  };
  const currentUserId = useSelector((s: RootState) => s.auth.user?._id);
  // اختياري لو عندك بيانات المستخدم كاملة
  const me = useSelector((s: RootState) => s.auth.user);
const myStore = useAppSelector(selectMyStore);
const myCoinz = myStore?.coinzBalance ?? 0;
  const sendText = async () => {
    const content = text.trim();
    if (!content || !roomId) return;

    // مهم: لا ترسل لو المستخدم غير معروف
    if (!currentUserId) {
      Alert.alert("Error", "Missing current user");
      return;
    }

    const clientId = `c:${Date.now()}:${Math.random().toString(16).slice(2)}`;

    // 1) optimistic قبل API
    dispatch(
      optimisticAddRoomMessage({
        roomId,
        message: {
          clientId,
          type: "text",
          content,
          replyTo: replyTo?.id,
          mentions: [],
          sender: currentUserId,          // ✅ هنا
          senderSnapshot: me
            ? {
              _id: me._id,
              username: me.username,
              atUsername: me.atUsername,
              avatar: me.avatar,
              coverImage: me.coverImage,
              isOnline: true,
              verificationType: me.verificationType,
              activeCustomization: me.activeCustomization,
              customEmojiBadge: me.customEmojiBadge
            }
            : undefined,
        },
      })
    );

    // 2) تحديث UI فوراً
    setText("");
    setReplyTo(null);
    scrollToBottom();

    // 3) API بنفس clientId
    try {
      await dispatch(
        sendRoomMessage({
          roomId,
          clientId, // ✅ نفس clientId عشان يحصل replace
          content,
          type: "text",
          replyTo: replyTo?.id,
        })
      ).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Send failed");

      // (اختياري قوي) علّم الرسالة أنها فشلت بدل ما تفضل optimistic للأبد
      // dispatch(optimisticMarkRoomMessageFailed({ roomId, clientId }));
    }
  };
  /* ================= SEND TEXT ================= */
  // const sendText = async () => {
  //   const content = text.trim();
  //   if (!content || !roomId) return;

  //   try {
  //     await dispatch(sendRoomMessage({ roomId, content, type: "text", replyTo: replyTo?.id })).unwrap();
  //     setText("");
  //     setReplyTo(null);
  //     scrollToBottom();
  //   } catch (e: any) {
  //     Alert.alert("Error", e?.message || "Send failed");
  //   }
  // };

  /* ================= MEDIA UPLOAD ================= */
  const sendImage = async () => {
    if (!roomId) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (res.canceled) return;
    const localUri = res.assets?.[0]?.uri;
    if (!localUri) return;

    try {
      setUploading({ visible: true, title: "جاري رفع الصورة…", sub: "يرجى الانتظار" });
      const secureUrl = await uploadToCloudinary(localUri, "image");

      await dispatch(
        sendRoomMessage({
          roomId,
          content: "📷 Image",
          type: "image",
          media: { url: secureUrl }
        })
      ).unwrap();

      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Upload failed");
    } finally {
      setUploading({ visible: false, title: "Uploading…", sub: undefined });
    }
  };




  /* ================= RECORDING ================= */
  const startRecording = async () => {
    try {
      if (pendingVoiceUri) return;
      if (recording) return;

      const ok = await ensureMicPermission();
      if (!ok) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Record failed");
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) setPendingVoiceUri(uri);
    } catch {
      setRecording(null);
    }
  };

  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recording, pulseAnim]);

  /* ================= ACTIONS ================= */
  const addReaction = (msg: MessageUI, emoji: Reaction) => {
    // ممنوع إرسال reaction قبل وصول _id الحقيقي من السيرفر
    if (!msg?.serverId) {
      Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
      return;
    }

    toggleRoomReactionSocket({ roomId, messageId: msg.serverId, emoji });
    setShowActions(false);
  };

  const deleteMessage = (msg: MessageUI) => {
    if (!msg?.serverId) {
      Alert.alert("انتظر قليلاً", "الرسالة لم تُرسل للسيرفر بعد.");
      return;
    }

    deleteRoomSocketMessage({ roomId, messageId: msg.serverId });
    setShowActions(false);
  };
  /* ================= MENU ACTIONS ================= */
  const onRefreshRoom = async () => {
    try {
      setShowRoomMenu(false);
      await dispatch(fetchRoomMessages({ roomId, pagination: { limit: 50 }, append: false })).unwrap();
      await dispatch(fetchRoomUsers(roomId)).unwrap();
      await dispatch(fetchRoomStats(roomId)).unwrap();
      scrollToBottom();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Refresh failed");
    }
  };

  const onOpenUsers = async () => {
    try {
      setShowRoomMenu(false);
      await dispatch(fetchRoomUsers(roomId)).unwrap();
      setShowUsersModal(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load users");
    }
  };

  const onOpenStats = async () => {
    try {
      setShowRoomMenu(false);
      const stats: any = await dispatch(fetchRoomStats(roomId)).unwrap();
      Alert.alert(
        "Room Stats",
        `Active: ${stats?.activeCount ?? "-"}\nTotal: ${stats?.totalUsersCount ?? "-"}\nMessages: ${stats?.messagesCount ?? "-"}\nLevel: ${stats?.level ?? "-"}`
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load stats");
    }
  };

  const onLeaveRoom = async () => {
    if (!roomId) return;
    if (didLeaveRef.current) return;

    try {
      setShowRoomMenu(false);
      didLeaveRef.current = true;

      leaveRoomSocket(roomId);
      await dispatch(leaveRoomAndExit({ roomId, cleanup: true })).unwrap();
      await dispatch(leaveAndRefreshRooms({ roomId, type: "public" })).unwrap();

      router.back();
    } catch (e: any) {
      didLeaveRef.current = false;
      Alert.alert("Error", e?.message || "Failed to leave room");
    }
  };

  /* ================= USERS: COPY/ROLE/KICK/BAN ================= */
  const onCopyUser = async (u: UserUI) => {
    await Clipboard.setStringAsync(`${u.name} (${u.id})`);
    Alert.alert("Copied", `Copied: ${u.name}`);
  };

  const onChangeRole = async (u: UserUI, newRole: UserUI["role"]) => {
    try {
      if (!canModerate) {
        Alert.alert("No permission", "ليس لديك صلاحية لتغيير الدور");
        return;
      }
      if (!u?.id || u.id === myUserId) return;
      if (!roomId) return;

      dispatch(socketRoleSetRequested({ roomId, targetId: u.id, role: newRole as any }));

      const ack = await setRoomUserRoleSocket({ roomId, targetId: u.id, role: newRole as any });

      if (ack?.ok) {
        dispatch(socketRoleSetSucceeded());
        Alert.alert("Success", `${u.name} => ${newRole}`);
      } else {
        dispatch(socketRoleSetFailed({ message: ack?.message || "Set role failed" }));
        Alert.alert("Error", ack?.message || "Failed to change role");
      }
    } catch (e: any) {
      dispatch(socketRoleSetFailed({ message: e?.message || "Set role failed" }));
      Alert.alert("Error", e?.message || "Failed to change role");
    }
  };

  const onKickUser = (u: UserUI) => {
    if (!canModerate) return;
    if (!u?.id || u.id === myUserId) return;
    if (!roomId) return;

    Alert.alert("Kick user", `Kick ${u.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Kick",
        style: "destructive",
        onPress: async () => {
          try {
            const ack = await kickRoomUserSocket({ roomId, targetId: u.id });
            if (!ack?.ok) {
              Alert.alert("Error", ack?.message || "Kick failed");
              return;
            }
            Alert.alert("Done", `${u.name} kicked`);
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Kick failed");
          }
        }
      }
    ]);
  };

  const onBanUser = (u: UserUI) => {
    if (!canModerate) return;
    if (!u?.id || u.id === myUserId) return;
    if (!roomId) return;

    Alert.alert("Ban user", `Ban ${u.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Ban",
        style: "destructive",
        onPress: async () => {
          try {
            const reason = "Violation";
            const ack = await banRoomUserSocket({ roomId, targetId: u.id, reason });
            if (!ack?.ok) {
              Alert.alert("Error", ack?.message || "Ban failed");
              return;
            }
            Alert.alert("Done", `${u.name} banned`);
            dispatch(fetchRoomUsers(roomId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Ban failed");
          }
        }
      }
    ]);
  };

  /* ================= BOOST ================= */
  const onBoostRoom = async () => {
    try {
      // if (!canModerate) {
      //   Alert.alert("No permission", "You don't have permission to boost this room.");
      //   return;
      // }
      if (!roomId) return;

      const level = 1;
      const hours = 24;

      const r = await dispatch(boostRoom({ roomId, level, hours })).unwrap();

      if (!r?.boostExpiresAt && typeof r?.boostLevel !== "number") {
        Alert.alert("Error", "Boost did not succeed.");
        return;
      }

      await dispatch(
        sendRoomMessage({
          roomId,
          type: "gift",
          content: "boost_rocket",
          gift: {
            key: "boost_rocket",
            name: "boost",
            value: level,
            icon: "🚀",
            animation: "rocket"
          }
        } as any)
      ).unwrap();

      const content = `🚀 <b>${myName}</b> boosted the room!`;
      await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message || String(e) || "Boost failed");
    }
  };

  const goDetails = () => {
    router.push({ pathname: "/room-details", params: { roomId } });
  };

  /* ================= PIN ================= */
  const unpinMessage = async (messageId: string) => {
    try {
      await dispatch(pinRoomMessage({ roomId, messageId, pinned: false })).unwrap();
      Alert.alert("Done", "تم إلغاء التثبيت");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Unpin failed");
    }
  };

  /* ================= RENDER ================= */
  return (
    <SafeAreaView style={styles.root}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={goDetails}>
            <Image source={{ uri: roomAvatar || "https://i.pravatar.cc/150?img=12" }} style={styles.roomAvatar} />
          </TouchableOpacity>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomName}
            </Text>
            <Text style={styles.roomMeta}>
              {loadingMessages ? "Loading..." : `Online: ${activeCount} • ${uiMessages.length} Messages`}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onBoostRoom} hitSlop={10} style={{ marginRight: 10 }} activeOpacity={0.85}>
            <Ionicons name="rocket-outline" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowRoomMenu(true)} hitSlop={10} activeOpacity={0.85}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= ROOM MENU ================= */}
      <Modal transparent visible={showRoomMenu} animationType="fade" onRequestClose={() => setShowRoomMenu(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.menuOverlay} onPress={() => setShowRoomMenu(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={onRefreshRoom} activeOpacity={0.85}>
              <Ionicons name="refresh" size={18} color={theme.text} />
              <Text style={styles.menuText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onOpenUsers} activeOpacity={0.85}>
              <Ionicons name="people" size={18} color={theme.text} />
              <Text style={styles.menuText}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onOpenStats} activeOpacity={0.85}>
              <Ionicons name="stats-chart" size={18} color={theme.text} />
              <Text style={styles.menuText}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowRoomMenu(false);
                setShowPinModal(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="pin" size={18} color={theme.text} />
              <Text style={styles.menuText}>Pin Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowRoomMenu(false);
                router.push({ pathname: "/room/[id]/settings", params: { id: roomId } });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="settings-outline" size={18} color={theme.text} />
              <Text style={styles.menuText}>Setting Room</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={onLeaveRoom} activeOpacity={0.85}>
              <Ionicons name="exit-outline" size={18} color={theme.danger} />
              <Text style={[styles.menuText, { color: theme.danger }]}>Leave Room</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= USERS MODAL ================= */}
      <UsersModal
        visible={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        users={usersUI}
        myUserId={myUserId}
        myRole={myRole}
        onCopyUser={onCopyUser}
        onChangeRole={onChangeRole}
        onKickUser={onKickUser}
        onBanUser={onBanUser}
        theme={theme}
      />

      {/* ================= GLOBAL AUDIO BAR ================= */}
      {activeAudio && (
        <View style={styles.globalAudioPlayer}>
          <View style={styles.audioIcon}>
            <Ionicons name="musical-notes" size={18} color={theme.primaryText} />
          </View>

          <View style={styles.audioCenter}>
            <Text style={styles.audioNow}>Playing voice…</Text>

            <View style={styles.globalProgressBg}>
              <Animated.View
                style={[
                  styles.globalProgressFill,
                  {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                  }
                ]}
              />
            </View>

            <View style={styles.audioTimes}>
              <Text style={styles.timeText}>{formatTime(playbackProgress)}</Text>
              <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={async () => {
              try {
                if (sound) {
                  await sound.stopAsync();
                  await sound.unloadAsync();
                }
              } catch { }
              setSound(null);
              setPlayingId(null);
              setActiveAudio(null);
              setPlaybackProgress(0);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>
      )}

      {/* ================= PINNED BAR ================= */}
      {latestPinned && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.pinnedBar}
          onPress={() => setPinPreviewFull(true)}
        >
          <View style={styles.pinnedLeft}>
            <Ionicons name="pin" size={18} color={theme.primary} />
            <Text style={styles.pinnedTitle}>Pinned</Text>
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.pinnedText} numberOfLines={1}>
              {clipText(safeDisplayText(latestPinned.text || ""), 80)}
            </Text>
            <Text style={styles.pinnedMeta} numberOfLines={1}>
              {latestPinned.sender?.name ? `${latestPinned.sender.name} • ` : ""}
              {latestPinned.time}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </TouchableOpacity>
      )}

      {/* ================= CHAT ================= */}
      <FlatList
        ref={flatListRef}
        data={uiMessages}
        inverted
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Reanimated.View style={listSpacerAnimatedStyle} />}
        contentContainerStyle={{ padding: 14, paddingTop: 14 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isMe = Boolean(myUserId) && item.sender?.id === myUserId;
          const previousMessage = uiMessages[index + 1];
          const showName =
            !previousMessage || previousMessage.type === "system" || previousMessage.sender?.id !== item.sender?.id;

          return (
            <MessageItem
              item={item}
              isMe={isMe}
              showName={showName}
              onAvatarLongPress={(u) => {
                if (!u?.id) return;
                setGiftPicker({ visible: true, target: u });
              }}
              onPressImage={(payload) => setPreviewImage(payload)}
              onTogglePlay={togglePlay}
              playingId={playingId}
              progressAnim={progressAnim}
              onLongPress={() => {
                setSelectedMessage(item);
                setShowActions(true);
              }}
              onGiftDone={() => markGiftDone(item.id)}
              theme={theme}
              bubble={bubbleStyles}
            />
          );
        }}
      />

      {/* ================= REPLY PREVIEW ================= */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <Text style={{ color: theme.text, fontWeight: "700" }} numberOfLines={1}>
            Replying to: {replyTo.text || "Media"}
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)} activeOpacity={0.85}>
            <Ionicons name="close" size={18} color={theme.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* ================= VOICE PREVIEW ================= */}
      {!!pendingVoiceUri && (
        <VoiceRecorderPreview
          uri={pendingVoiceUri}
          onCancel={() => setPendingVoiceUri(null)}
          onSend={async () => {
            if (!roomId || !pendingVoiceUri) return;
            try {
              setUploading({ visible: true, title: "جاري رفع الصوت…", sub: "يرجى الانتظار" });

              const secureUrl = await uploadToCloudinary(pendingVoiceUri, "raw");

              await dispatch(
                sendRoomMessage({
                  roomId,
                  content: "🎤 Voice message",
                  type: "audio",
                  media: { url: secureUrl }
                })
              ).unwrap();

              try {
                await FileSystem.deleteAsync(pendingVoiceUri, { idempotent: true });
              } catch { }

              setPendingVoiceUri(null);
              scrollToBottom();
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to send voice");
            } finally {
              setUploading({ visible: false, title: "Uploading…", sub: undefined });
            }
          }}
        />
      )}

      {/* ================= INPUT ================= */}
      <Reanimated.View
        onLayout={(e) => {
          setInputBarHeight(e.nativeEvent.layout.height);
        }}
        style={[
          styles.inputBarWrap,
          inputBarAnimatedStyle,
        ]}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={sendImage} disabled={uploading.visible} activeOpacity={0.85}>
            <Ionicons name="image-outline" size={24} color={theme.text} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={theme.subtleText}
            value={text}
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
              }, 50);
            }}
            onChangeText={setText}
            multiline
          />

          {text ? (
            <TouchableOpacity onPress={sendText} disabled={uploading.visible} activeOpacity={0.85}>
              <Ionicons name="send" size={22} color={theme.primary} />
            </TouchableOpacity>
          ) : (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPressIn={startRecording}
                onPressOut={stopRecording}
                disabled={uploading.visible || !!pendingVoiceUri}
                activeOpacity={0.85}
              >
                <Ionicons name="mic" size={26} color={recording ? theme.danger : theme.text} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Reanimated.View>

      {/* ================= ACTIONS MODAL ================= */}
      <Modal transparent visible={showActions} animationType="fade" onRequestClose={() => setShowActions(false)}>
        <View style={styles.actionsOverlay}>
          <View style={styles.actionsBox}>
            <View style={styles.reactionsRow}>
              {REACTIONS.map((r) => (
                <TouchableOpacity key={r} onPress={() => selectedMessage && addReaction(selectedMessage, r)}
                  activeOpacity={0.85}>
                  <Text style={{ fontSize: 22 }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                setReplyTo(selectedMessage);
                setShowActions(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.action}>Reply</Text>
            </TouchableOpacity>

            {(selectedMessage?.sender?.id === myUserId || canModerate) &&
              selectedMessage?.type !== "system" &&
              !selectedMessage?.deletedForEveryone && (
                <TouchableOpacity onPress={() => selectedMessage && deleteMessage(selectedMessage)}
                  activeOpacity={0.85}>
                  <Text style={[styles.action, { color: theme.danger }]}>Delete</Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity onPress={() => setShowActions(false)} activeOpacity={0.85}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= IMAGE PREVIEW ================= */}
      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity style={styles.imagePreviewClose} onPress={() => setPreviewImage(null)} activeOpacity={0.85}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <Image
            source={typeof previewImage === "string" ? { uri: previewImage } : previewImage!}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* ================= PIN MODAL ================= */}
      <Modal transparent visible={showPinModal} animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <Pressable style={styles.pinOverlay} onPress={() => setShowPinModal(false)}>
          <Pressable style={styles.pinSheet} onPress={() => { }}>
            <View style={styles.pinHeader}>
              <Text style={styles.pinTitle}>Pin a message</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)} style={styles.pinCloseBtn} activeOpacity={0.85}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.pinList}>
              <Text style={styles.pinLabel}>رسالة التثبيت</Text>

              <View style={styles.pinInputWrap}>
                <Ionicons name="text-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.pinInput}
                  placeholder="اكتب رسالة التثبيت (تقبل HTML مثل <b>...</b> و <br /> )"
                  placeholderTextColor={theme.subtleText}
                  value={pinHtml}
                  onChangeText={setPinHtml}
                  multiline
                />
              </View>

              {!!pinHtml.trim() && (
                <View style={styles.pinPreviewBox}>
                  <Text style={styles.pinPreviewTitle}>معاينة</Text>
                  <RenderHTML
                    contentWidth={width - 60}
                    source={{ html: String(pinHtml) }}
                    baseStyle={{ fontSize: 13, color: theme.text, lineHeight: 20 }}
                  />
                </View>
              )}
            </View>

            <View style={styles.pinActions}>
              <TouchableOpacity style={[styles.pinBtn, styles.pinBtnCancel]} onPress={() => setShowPinModal(false)} activeOpacity={0.85}>
                <Text style={styles.pinBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pinBtn, !pinHtml.trim() && styles.pinBtnDisabled]}
                disabled={!pinHtml.trim()}
                activeOpacity={0.85}
                onPress={async () => {
                  try {
                    const content = pinHtml.trim();
                    if (!content) return;

                    const created = await dispatch(sendRoomMessage({ roomId, content, type: "announcement" })).unwrap();
                    const messageId = created?.message?._id;

                    if (!messageId) {
                      Alert.alert("Error", "لم يتم الحصول على id للرسالة الجديدة.");
                      return;
                    }

                    await dispatch(pinRoomMessage({ roomId, messageId, pinned: true })).unwrap();
                    setShowPinModal(false);
                    setPinHtml("");
                    Alert.alert("Done", "تم إرسال الرسالة وتثبيتها");
                  } catch (e: any) {
                    Alert.alert("Error", e?.message || "Pin failed");
                  }
                }}
              >
                <Ionicons name="pin" size={16} color={theme.primaryText} />
                <Text style={styles.pinBtnText}>Pin</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ================= PIN PREVIEW FULL ================= */}
      <Modal transparent visible={pinPreviewFull} animationType="fade" onRequestClose={() => setPinPreviewFull(false)}>
        <Pressable style={styles.fullOverlay} onPress={() => setPinPreviewFull(false)}>
          <Pressable style={styles.fullBox} onPress={() => { }}>
            <View style={styles.fullHeader}>
              <Text style={styles.fullTitle}>Pinned message</Text>

              {latestPinned && canModerate && (
                <TouchableOpacity onPress={() => unpinMessage(latestPinned.id)} activeOpacity={0.85}>
                  <Text style={{ color: theme.danger, fontWeight: "900" }}>Unpin</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setPinPreviewFull(false)} activeOpacity={0.85}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {(() => {
              const msg = latestPinned;
              const raw = msg?.text || "";
              return (
                <>
                  <Text style={styles.fullMeta}>
                    {msg?.sender?.name ? `${msg.sender.name} • ` : ""}
                    {msg?.time || ""}
                  </Text>

                  <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: String(raw || "") }}
                    baseStyle={{ fontSize: 13, color: theme.text, lineHeight: 20 }}
                  />
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ================= GIFT FULLSCREEN OVERLAY ================= */}
      {String(giftOverlay.giftKey || "").startsWith("boost") ? (
        <BoostLottieOverlay
          visible={giftOverlay.visible}
          title="🚀 Room Boosted!"
          subtitle={`${giftOverlay.fromName || "Someone"} boosted the room`}
          onDone={() => {
            if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
            setGiftOverlay({
              visible: false,
              messageId: null,
              giftKey: null,
              icon: "🎁",
              count: 45,
              lottie: undefined,
              fromName: undefined,
              toName: undefined,
            });
          }}
        />
      ) : giftOverlay.lottie ? (
        <GiftLottieOverlay
          visible={giftOverlay.visible}
          source={giftOverlay.lottie}
          fromName={giftOverlay.fromName}
          toName={giftOverlay.toName}
          durationMs={2600}
          onDone={() => {
            if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
            setGiftOverlay({
              visible: false,
              messageId: null,
              giftKey: null,
              icon: "🎁",
              count: 45,
              lottie: undefined,
              fromName: undefined,
              toName: undefined,
            });
          }}
        />
      ) : (
        <GiftBurstOverlay
          visible={giftOverlay.visible}
          icon={giftOverlay.icon}
          count={giftOverlay.count}
          fromName={giftOverlay.fromName}
          toName={giftOverlay.toName}
          durationMs={2600}
          onDone={() => {
            if (giftOverlay.messageId) markGiftDone(giftOverlay.messageId);
            setGiftOverlay({
              visible: false,
              messageId: null,
              giftKey: null,
              icon: "🎁",
              count: 45,
              lottie: undefined,
              fromName: undefined,
              toName: undefined,
            });
          }}
        />
      )}

      {/* ================= GIFT PICKER ================= */}
      <GiftPickerModal
        visible={giftPicker.visible}
        target={giftPicker.target}
        onClose={() => setGiftPicker({ visible: false, target: null })}
        theme={theme}
     onPick={async (g) => {
  try {
    const target = giftPicker.target;
    setGiftPicker({ visible: false, target: null });

    if (!roomId) return;

    const isBoost = String(g.key || "").startsWith("boost");

    if (!isBoost && !target?.id) {
      Alert.alert("Error", "Target user not found");
      return;
    }

    const tempGift = TEMP_GIFTS.find((x) => x.key === g.key);
    const giftPrice = Number(tempGift?.price || 0);

    if (myCoinz < giftPrice) {
      Alert.alert(
        "رصيد غير كافٍ",
        `هذه الهدية تحتاج ${giftPrice} Coinz، بينما رصيدك الحالي ${myCoinz} Coinz.`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "الذهاب إلى المتجر",
            onPress: () => router.push("/store")
          }
        ]
      );
      return;
    }

    if (giftPrice > 0) {
      const debitRes = await dispatch(
        debitMyCoinz({
          amount: giftPrice,
          reason: `gift:${g.key}`
        }) as any
      );

      if (!debitMyCoinz.fulfilled.match(debitRes)) {
        Alert.alert(
          "تعذر الخصم",
          String((debitRes as any)?.payload || "فشل خصم الرصيد")
        );
        await dispatch(getMyInventory() as any);
        return;
      }

      await dispatch(getMyInventory() as any);
    }

    const meta = GIFT_META[g.key] || { icon: "🎁", count: 45, lottie: undefined };

    await dispatch(
      sendRoomMessage({
        roomId,
        type: "gift",
        content: g.key,
        gift: {
          key: g.key,
          icon: meta.icon,
          targetId: isBoost ? undefined : target!.id,
          targetName: isBoost ? undefined : target!.name,
          count: meta.count
        }
      } as any)
    ).unwrap();

    const toLabel = isBoost ? "Room" : target?.name || "Someone";
    const announce = `🎁 <b>${myName}</b> sent ${meta.icon} to <b>${toLabel}</b>`;

    await dispatch(
      sendRoomMessage({
        roomId,
        content: announce,
        type: "announcement"
      })
    ).unwrap();

    await dispatch(getMyInventory() as any);
  } catch (e: any) {
    Alert.alert("Error", e?.message || "Failed to send gift");
    await dispatch(getMyInventory() as any);
  }
}}
      />
    </SafeAreaView>
  );
}

/* ================= STYLES FACTORIES ================= */
function makeBubbleStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    row: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
    rowOther: { justifyContent: "flex-start" },
    rowMe: { justifyContent: "flex-end" },

    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface2 },

    avatarWrapLeft: { width: 40, height: 40, marginRight: 8, position: "relative" },
    avatarWrapRight: { width: 40, height: 40, marginLeft: 8, position: "relative" },

    avatarStarLeft: {
      position: "absolute",
      top: -6,
      right: -10,
      fontSize: 14,
      fontWeight: "900",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },
    avatarStarRight: {
      position: "absolute",
      top: -6,
      right: -10,
      fontSize: 14,
      fontWeight: "900",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },

    bubble: {
      maxWidth: "78%",
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface
    },
    bubbleOther: { borderTopLeftRadius: 6 },
    bubbleMe: { borderTopRightRadius: 6 },

    senderName: { fontSize: 12, fontWeight: "900", color: theme.primary, marginBottom: 4 },
    msgText: { fontSize: 15, color: theme.text, lineHeight: 20 },
    msgTextMuted: { fontSize: 14, color: theme.mutedText },

    nameWrap: { marginBottom: 6 },
    nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, flexWrap: "wrap" },
    nameUnderline: { marginTop: 4, height: 1, backgroundColor: theme.separator, width: "100%" },

    media: { width: 220, height: 220, borderRadius: 12, marginTop: 4 },
    videoWrapper: { width: 240, height: 170, borderRadius: 12, overflow: "hidden", backgroundColor: "#000", marginTop: 6 },
    video: { width: "100%", height: "100%" },

    fileRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    fileIcon: { fontSize: 18 },
    fileName: { maxWidth: 200, fontSize: 14, color: theme.text },

    replyBox: {
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      backgroundColor: theme.surface2,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginBottom: 8
    },
    replyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    replyName: { fontSize: 12, fontWeight: "900", color: theme.text, maxWidth: "78%" },
    replyTag: { fontSize: 11, fontWeight: "800", color: theme.mutedText },
    replyText: { fontSize: 12, color: theme.mutedText, lineHeight: 16 },

    reaction: {
      position: "absolute",
      bottom: -10,
      right: 10,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: theme.border
    },

    sysWrap: { width: "100%", alignItems: "center", marginVertical: 6 },
    sysBubble: {
      backgroundColor: theme.primarySoft,
      borderColor: theme.border,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 14
    },
    sysTime: { fontSize: 11, color: theme.mutedText, textAlign: "center", marginTop: 4 }
  });
}

function makeUsersStyles(theme: typeof Colors.light) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 18,
      maxHeight: "80%",
      borderTopWidth: 1,
      borderColor: theme.border
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 16, fontWeight: "900", color: theme.text },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border
    },
    note: { marginTop: 10, backgroundColor: theme.cardAlt, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
    noteText: { fontSize: 12, color: theme.mutedText, lineHeight: 18 },
    list: { marginTop: 12, gap: 10 },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border
    },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface2 },
    rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    name: { flex: 1, fontSize: 14, fontWeight: "900", color: theme.text },
    sub: { fontSize: 12, color: theme.mutedText, marginTop: 2 },

    badge: { backgroundColor: theme.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.border },
    badgeText: { fontSize: 11, color: theme.primary, fontWeight: "900" },

    rolesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
    roleChip: { borderWidth: 1, borderColor: theme.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.surface2 },
    roleChipActive: { backgroundColor: theme.primarySoft, borderColor: theme.primary },
    roleChipText: { fontSize: 12, fontWeight: "800", color: theme.mutedText },
    roleChipTextActive: { color: theme.primary },

    actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
    kickBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(245, 158, 11, 0.16)", borderWidth: 1, borderColor: theme.warning },
    kickText: { fontWeight: "900", color: theme.warning },
    banBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(239, 68, 68, 0.14)", borderWidth: 1, borderColor: theme.danger },
    banText: { fontWeight: "900", color: theme.danger }
  });
}

function makeScreenStyles(theme: typeof Colors.light, bottomInset: number) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },

    header: {
      height: 56,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.card
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },

    roomAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.surface2 },
    roomName: { fontSize: 16, fontWeight: "900", color: theme.text },
    roomMeta: { fontSize: 12, color: theme.mutedText },

    pinnedBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderColor: theme.separator,
      paddingHorizontal: 12,
      paddingVertical: 10
    },
    pinnedLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    pinnedTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
    pinnedText: { fontSize: 13, fontWeight: "700", color: theme.mutedText },
    pinnedMeta: { marginTop: 2, fontSize: 11, color: theme.subtleText },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 10 + Math.max(0, bottomInset * 0.2),
      backgroundColor: theme.card
    },
    inputBarWrap: {
      borderTopWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.card
    },
    input: {
      flex: 1,
      backgroundColor: theme.surface2,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      maxHeight: 120,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border
    },

    replyPreview: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.cardAlt,
      borderTopWidth: 1,
      borderColor: theme.separator
    },

    actionsOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
    actionsBox: { backgroundColor: theme.card, width: "80%", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
    reactionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    action: { fontSize: 16, paddingVertical: 10, fontWeight: "800", color: theme.text },
    cancel: { textAlign: "center", marginTop: 8, color: theme.mutedText, fontWeight: "800" },

    imagePreviewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
    fullImage: { width: "100%", height: "100%" },
    imagePreviewClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },

    menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.12)" },
    menuBox: {
      position: "absolute",
      top: 60,
      right: 12,
      width: 200,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6
    },
    menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
    menuText: { fontSize: 14, color: theme.text, fontWeight: "900" },
    menuDivider: { height: 1, backgroundColor: theme.separator, marginVertical: 6 },

    globalAudioPlayer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderColor: theme.separator
    },
    audioIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
    audioCenter: { flex: 1 },
    audioNow: { fontSize: 12, color: theme.text, fontWeight: "900", marginBottom: 6 },
    globalProgressBg: { width: "100%", height: 3, backgroundColor: theme.separator, borderRadius: 2, overflow: "hidden" },
    globalProgressFill: { height: "100%", backgroundColor: theme.primary },
    audioTimes: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    timeText: { fontSize: 11, color: theme.mutedText },

    pinOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    pinSheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
      maxHeight: "80%",
      borderTopWidth: 1,
      borderColor: theme.border
    },
    pinHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    pinTitle: { fontSize: 16, fontWeight: "900", color: theme.text },
    pinCloseBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },

    pinList: { marginTop: 12 },
    pinLabel: { marginTop: 6, fontSize: 12, fontWeight: "900", color: theme.text },

    pinInputWrap: {
      marginTop: 8,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2
    },
    pinInput: { flex: 1, minHeight: 110, maxHeight: 180, fontSize: 13, color: theme.text, lineHeight: 18 },

    pinPreviewBox: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.border },
    pinPreviewTitle: { fontSize: 12, fontWeight: "900", color: theme.text },

    pinActions: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
    pinBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: theme.primary },
    pinBtnText: { color: theme.primaryText, fontWeight: "900" },
    pinBtnCancel: { backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border },
    pinBtnCancelText: { color: theme.text, fontWeight: "900" },
    pinBtnDisabled: { opacity: 0.5 },

    fullOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 },
    fullBox: { width: "100%", maxHeight: "70%", backgroundColor: theme.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border },
    fullHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    fullTitle: { fontSize: 14, fontWeight: "900", color: theme.text },
    fullMeta: { fontSize: 12, color: theme.mutedText, marginBottom: 10, fontWeight: "800" }
  });
}