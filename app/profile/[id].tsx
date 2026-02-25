// app/(tabs)/profile/[id].tsx
// ✅ Profile Screen (Expo + React Native)
// ✅ يستخدم: useColorScheme + Colors (theme)
// ✅ بدون theme.card2
// ✅ بدون expo-linear-gradient
// ✅ إضافة: متابعة + حظر
// ✅ تفعيل كل الأزرار لفتح مودال عصري (Bottom Sheet) وكأنه حقيقي

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const COVER_H = Math.max(220, Math.round(W * 0.55));
const AVATAR = 108;

type ProfileUser = {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: "male" | "female";
  country: string;
  city: string;
  bio: string;
  lookingFor: string;
  maritalStatus: string;
  children: string;
  education: string;
  work: string;
  heightCm?: number;
  bodyType?: string;

  religiosity: {
    level: string;
    praying: string;
    hijabOrBeard?: string;
    smoking: string;
  };

  preferences: {
    ageRange: string;
    location: string;
    maritalStatus: string;
    religiosity: string;
  };

  stats: {
    followers: number;
    following: number;
    likes: number;
    profileViews: number;
  };

  verified: boolean;
  lastActiveText: string;
  images: { cover?: string; avatar?: string };
  tags: string[];
};

const formatNum = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

// ✅ color helpers (بدون card2)
function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const Chip = ({
  label,
  icon,
  bg,
  fg,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  bg: string;
  fg: string;
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={14} color={fg} style={{ marginEnd: 6 }} /> : null}
      <Text style={[styles.chipText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);

const Stat = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
  </View>
);

const ActionBtn = ({
  icon,
  label,
  filled,
  theme,
  isDark,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  filled?: boolean;
  theme: any;
  isDark: boolean;
  onPress?: () => void;
}) => {
  const bg = filled ? theme.tint : theme.card;
  const fg = filled ? (isDark ? "#0B1020" : "#FFFFFF") : theme.text;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}>
      <View style={[styles.actionBtn, { backgroundColor: bg, borderColor: theme.border }]}>
        <Ionicons name={icon} size={18} color={fg} />
        <Text style={[styles.actionText, { color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const Row = ({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
}) => (
  <View style={[styles.row, { borderBottomColor: theme.border }]}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={[styles.rowIcon, { backgroundColor: theme.surface2 }]}>
        <Ionicons name={icon || "information-circle-outline"} size={18} color={theme.tint} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
    <Text style={[styles.rowValue, { color: theme.text }]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const SegBtn = ({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}>
    <View
      style={[
        styles.segBtn,
        {
          backgroundColor: active ? theme.tint : "transparent",
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.segText, { color: active ? "#FFFFFF" : theme.text }]}>{label}</Text>
    </View>
  </Pressable>
);

/* =========================
   ✅ مودال عصري (Bottom Sheet)
========================= */

type SheetKey =
  | null
  | "chat"
  | "like"
  | "follow"
  | "block"
  | "report"
  | "share"
   | "media"
  | "settings"
  | "more"
  | "editBio"
  | "tag";

function Sheet({
  visible,
  title,
  subtitle,
  theme,
  isDark,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  theme: any;
  isDark: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={[styles.sheetBackdrop]} onPress={onClose} />
        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: "#000",
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12 }}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.sheetSub, { color: theme.textMuted }]} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View>

          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <View
                style={[
                  styles.sheetCloseBtn,
                  {
                    backgroundColor: theme.surface2,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.sheetCloseText, { color: theme.text }]}>إغلاق</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ✅ safe bottom space */}
        <View style={{ height: Platform.OS === "ios" ? 10 : 8 }} />
      </View>
    </Modal>
  );
}

function SheetItem({
  icon,
  title,
  subtitle,
  theme,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  theme: any;
  danger?: boolean;
  onPress: () => void;
}) {
  const fg = danger ? "#EF4444" : theme.text;
  const iconBg = danger ? "rgba(239,68,68,0.12)" : theme.surface2;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.sheetItem, { borderColor: theme.border }]}>
        <View style={[styles.sheetItemIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={danger ? "#EF4444" : theme.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sheetItemTitle, { color: fg }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sheetItemSub, { color: theme.textMuted }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </View>
    </Pressable>
  );
}

function PrimaryBtn({
  label,
  icon,
  theme,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.sheetPrimaryBtn, { backgroundColor: theme.tint }]}>
        {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
        <Text style={styles.sheetPrimaryText}>{label}</Text>
      </View>
    </Pressable>
  );
}

function GhostBtn({
  label,
  icon,
  theme,
  danger,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <View
        style={[
          styles.sheetGhostBtn,
          { backgroundColor: theme.surface2, borderColor: theme.border },
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={18} color={danger ? "#EF4444" : theme.text} />
        ) : null}
        <Text style={[styles.sheetGhostText, { color: danger ? "#EF4444" : theme.text }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  // ✅ كما طلبت
  const colorScheme = useColorScheme();
  const themeBase = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  // ✅ theme محسن داخليًا بدون card2
  const theme = useMemo(() => {
    const background = themeBase.background;
    const card = (themeBase as any).card ?? (isDark ? "#111827" : "#FFFFFF");
    const tint = themeBase.tint;
    const text = themeBase.text;
    const border =
      (themeBase as any).border ?? (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)");
    const textMuted =
      (themeBase as any).textMuted ??
      ((themeBase as any).icon
        ? rgba((themeBase as any).icon, 0.95)
        : isDark
        ? "rgba(234,240,255,0.65)"
        : "rgba(18,24,38,0.62)");

    // ✅ surface2 بديل card2
    const surface2 = isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)";

    return { background, card, tint, text, border, textMuted, surface2 };
  }, [themeBase, isDark]);

  const [tab, setTab] = useState<"about" | "posts" | "media">("about");

  // ✅ حالات حقيقية (محاكاة)
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [following, setFollowing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [liked, setLiked] = useState(false);

  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const user: ProfileUser = useMemo(
    () => ({
      id: "u_1001",
      name: "مريم أحمد",
      username: "@maryam",
      age: 26,
      gender: "female",
      country: "مصر",
      city: "القاهرة",
      bio:
        "أبحث عن زواج جاد وتعارف محترم. أحب القراءة والعمل التطوعي، وأقدّر الحوار الهادئ والالتزام بالقيم.",
      lookingFor: "زواج جاد خلال 6–12 شهر",
      maritalStatus: "آنسة",
      children: "لا يوجد",
      education: "بكالوريوس",
      work: "مصممة UI/UX",
      heightCm: 165,
      bodyType: "متوسط",
      religiosity: {
        level: "ملتزمة",
        praying: "محافظة على الصلوات",
        hijabOrBeard: "محجبة",
        smoking: "لا",
      },
      preferences: {
        ageRange: "27–35",
        location: "داخل مصر (يفضل القاهرة/الجيزة)",
        maritalStatus: "أعزب",
        religiosity: "ملتزم أو متوسط الالتزام",
      },
      stats: { followers: 1240, following: 180, likes: 9800, profileViews: 45210 },
      verified: true,
      lastActiveText: "نشطة منذ 12 دقيقة",
      images: {
        cover:
          "https://images.unsplash.com/photo-1520975958225-1a9b1f0d3f4a?auto=format&fit=crop&w=1600&q=80",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=512&q=80",
      },
      tags: ["حياة أسرية", "تعليم", "هدوء", "احترام", "قراءة", "رياضة خفيفة"],
    }),
    []
  );

  const closeSheet = () => setSheet(null);

  // ✅ دوال محاكاة “حقيقية”
  const doFollowToggle = () => {
    setFollowing((v) => !v);
    closeSheet();
  };

  const doBlockToggle = () => {
    setBlocked((v) => !v);
    closeSheet();
  };

  const doLikeToggle = () => {
    setLiked((v) => !v);
    closeSheet();
  };

  const doOpenChat = () => {
    // هنا لاحقًا تربط navigation أو createConversation
    closeSheet();
  };

  const doShare = () => {
    // لاحقًا: Share API
    closeSheet();
  };

  const doSaveSettings = () => {
    closeSheet();
  };

  const doSubmitReport = () => {
    // لاحقًا: call API /report
    setReportReason("");
    setReportDetails("");
    closeSheet();
  };

  const disabledByBlock = blocked;

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* ===== Cover ===== */}
        <View style={{ height: COVER_H }}>
          {user.images.cover ? (
            <Image source={{ uri: user.images.cover }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: theme.surface2 }]} />
          )}

          {/* ✅ Overlay بديل LinearGradient */}
          <View style={[styles.coverOverlay, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
          <View style={[styles.coverOverlayBottom, { backgroundColor: "rgba(0,0,0,0.45)" }]} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              onPress={() => setSheet("more")}
            >
              <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </View>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setSheet("share")}
              >
                <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setSheet("settings")}
              >
                <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                  <Ionicons name="settings-outline" size={18} color="#fff" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, { borderColor: theme.border, backgroundColor: theme.card }]}>
              {user.images.avatar ? (
                <Image source={{ uri: user.images.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Ionicons name="person" size={44} color={theme.textMuted} />
                </View>
              )}
            </View>

            {user.verified ? (
              <View style={[styles.verified, { backgroundColor: theme.tint }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.verifiedText}>موثّق</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ===== Main Card ===== */}
        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ marginTop: AVATAR * 0.25 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {user.name}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <Text style={[styles.sub, { color: theme.textMuted }]}>{user.username}</Text>
                  <View style={[styles.dot, { backgroundColor: theme.border }]} />
                  <Text style={[styles.sub, { color: theme.textMuted }]}>{user.age} سنة</Text>
                  <View style={[styles.dot, { backgroundColor: theme.border }]} />
                  <Text style={[styles.sub, { color: theme.textMuted }]}>
                    {user.city} • {user.country}
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <View style={[styles.activePill, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                    <View style={[styles.activeDot, { backgroundColor: blocked ? "#EF4444" : "#22C55E" }]} />
                    <Text style={[styles.activeText, { color: theme.text }]}>
                      {blocked ? "تم حظر هذا الحساب" : user.lastActiveText}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]} onPress={() => setSheet("more")}>
                <View style={[styles.moreBtn, { borderColor: theme.border }]}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={theme.text} />
                </View>
              </Pressable>
            </View>

            {/* Actions (✅ كلها تفتح مودال) */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <ActionBtn
                icon="chatbubble-ellipses-outline"
                label="رسالة"
                filled
                theme={theme}
                isDark={isDark}
                onPress={() => setSheet("chat")}
              />
              <ActionBtn
                icon={liked ? "heart" : "heart-outline"}
                label={liked ? "تم الإعجاب" : "إعجاب"}
                theme={theme}
                isDark={isDark}
                onPress={() => setSheet("like")}
              />
              <ActionBtn
                icon="flag-outline"
                label="إبلاغ"
                theme={theme}
                isDark={isDark}
                onPress={() => setSheet("report")}
              />
            </View>

            {/* ✅ أزرار سريعة: متابعة + حظر */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <ActionBtn
                icon={following ? "person-remove-outline" : "person-add-outline"}
                label={following ? "إلغاء المتابعة" : "متابعة"}
                filled={following}
                theme={theme}
                isDark={isDark}
                onPress={() => setSheet("follow")}
              />
              <ActionBtn
                icon={blocked ? "lock-open-outline" : "lock-closed-outline"}
                label={blocked ? "إلغاء الحظر" : "حظر"}
                theme={theme}
                isDark={isDark}
                onPress={() => setSheet("block")}
              />
            </View>

            {/* Stats */}
            <View style={[styles.stats, { borderColor: theme.border }]}>
              <Stat label="متابعون" value={formatNum(user.stats.followers)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label="يتابع" value={formatNum(user.stats.following)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label="إعجابات" value={formatNum(user.stats.likes)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label="مشاهدات" value={formatNum(user.stats.profileViews)} theme={theme} />
            </View>

            {/* Tags (✅ تفتح مودال) */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {user.tags.slice(0, 10).map((t) => (
                <Chip key={t} label={t} icon="sparkles-outline" bg={theme.surface2} fg={theme.text} onPress={() => setSheet("tag")} />
              ))}
            </View>

            {/* Bio */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>نبذة</Text>
                <Pressable onPress={() => setSheet("editBio")} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                  <Ionicons name="create-outline" size={18} color={theme.textMuted} />
                </Pressable>
              </View>
              <Text style={[styles.bio, { color: theme.textMuted }]}>{user.bio}</Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <Chip label={user.lookingFor} icon="calendar-outline" bg={theme.card} fg={theme.text} onPress={() => setSheet("more")} />
                <Chip label="تعارف محترم" icon="shield-checkmark-outline" bg={theme.card} fg={theme.text} onPress={() => setSheet("more")} />
                <Chip label="خصوصية عالية" icon="lock-closed-outline" bg={theme.card} fg={theme.text} onPress={() => setSheet("more")} />
              </View>
            </View>

            {/* Segments */}
            <View style={[styles.segWrap, { borderColor: theme.border, backgroundColor: theme.surface2 }]}>
              <SegBtn label="حول" active={tab === "about"} onPress={() => setTab("about")} theme={theme} />
              <SegBtn label="منشورات" active={tab === "posts"} onPress={() => setTab("posts")} theme={theme} />
              <SegBtn label="وسائط" active={tab === "media"} onPress={() => setTab("media")} theme={theme} />
            </View>

            {/* Content */}
            {tab === "about" ? (
              <View style={{ marginTop: 12 }}>
                <View style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>البيانات الأساسية</Text>
                  <Row label="الحالة الاجتماعية" value={user.maritalStatus} icon="people-outline" theme={theme} />
                  <Row label="الأطفال" value={user.children} icon="happy-outline" theme={theme} />
                  <Row label="التعليم" value={user.education} icon="school-outline" theme={theme} />
                  <Row label="العمل" value={user.work} icon="briefcase-outline" theme={theme} />
                  <Row label="الطول" value={user.heightCm ? `${user.heightCm} سم` : "غير محدد"} icon="resize-outline" theme={theme} />
                  <Row label="البنية" value={user.bodyType || "غير محدد"} icon="body-outline" theme={theme} />
                  <Row label="الموقع التقريبي" value={`${user.city}، ${user.country}`} icon="location-outline" theme={theme} />
                </View>

                <View style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>الالتزام والقيم</Text>
                  <Row label="درجة الالتزام" value={user.religiosity.level} icon="moon-outline" theme={theme} />
                  <Row label="الصلاة" value={user.religiosity.praying} icon="alarm-outline" theme={theme} />
                  <Row
                    label={user.gender === "female" ? "الحجاب" : "اللحية"}
                    value={user.religiosity.hijabOrBeard || "غير محدد"}
                    icon="leaf-outline"
                    theme={theme}
                  />
                  <Row label="التدخين" value={user.religiosity.smoking} icon="ban-outline" theme={theme} />
                </View>

                <View style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>تفضيلات شريك الحياة</Text>
                  <Row label="العمر" value={user.preferences.ageRange} icon="time-outline" theme={theme} />
                  <Row label="المكان" value={user.preferences.location} icon="map-outline" theme={theme} />
                  <Row label="الحالة الاجتماعية" value={user.preferences.maritalStatus} icon="person-outline" theme={theme} />
                  <Row label="الالتزام" value={user.preferences.religiosity} icon="shield-outline" theme={theme} />
                </View>
              </View>
            ) : tab === "posts" ? (
              <View style={{ marginTop: 12 }}>
                <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="newspaper-outline" size={30} color={theme.textMuted} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد منشورات بعد</Text>
                  <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                    يمكن عرض منشورات عامة فقط، مع إمكانية إخفائها بالكامل من الإعدادات.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <View style={styles.mediaGrid}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => setSheet("media")}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <View style={[styles.mediaBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="image-outline" size={22} color={theme.textMuted} />
                        <Text style={[styles.mediaText, { color: theme.textMuted }]}>وسائط</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.mediaHint, { color: theme.textMuted }]}>يتم التحكم في عرض الوسائط وفق إعدادات الخصوصية.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.footer, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            تواصل محترم فقط. أي إساءة أو طلب غير لائق يتم الإبلاغ عنه وحظر الحساب وفق سياسة المنصة.
          </Text>
        </View>
      </ScrollView>

      {/* =========================
          ✅ Sheets
      ========================== */}

      {/* Chat */}
      <Sheet
        visible={sheet === "chat"}
        title="بدء محادثة"
        subtitle={disabledByBlock ? "لا يمكنك مراسلة هذا الحساب لأنه محظور." : `سيتم إرسال رسالة إلى ${user.name}`}
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        {disabledByBlock ? (
          <View style={[styles.sheetNote, { backgroundColor: rgba("#EF4444", 0.10), borderColor: rgba("#EF4444", 0.25) }]}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.sheetNoteText, { color: theme.text }]}>قم بإلغاء الحظر أولاً لإرسال رسالة.</Text>
          </View>
        ) : (
          <>
            <View style={[styles.fakeInput, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.fakeInputText, { color: theme.textMuted }]}>اكتب أول رسالة…</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <PrimaryBtn label="بدء الآن" icon="paper-plane-outline" theme={theme} onPress={doOpenChat} />
              <GhostBtn label="نسخ اسم المستخدم" icon="copy-outline" theme={theme} onPress={closeSheet} />
            </View>
          </>
        )}
      </Sheet>

      {/* Like */}
      <Sheet
        visible={sheet === "like"}
        title={liked ? "إزالة الإعجاب؟" : "إضافة إعجاب"}
        subtitle={liked ? "سيتم إزالة الإعجاب من هذا الحساب." : "سيظهر الإعجاب لصاحب الحساب حسب إعدادات الخصوصية."}
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <PrimaryBtn label={liked ? "إزالة الإعجاب" : "إعجاب"} icon={liked ? "heart-dislike-outline" : "heart-outline"} theme={theme} onPress={doLikeToggle} />
          <GhostBtn label="إغلاق" icon="close-outline" theme={theme} onPress={closeSheet} />
        </View>
      </Sheet>

      {/* Follow */}
      <Sheet
        visible={sheet === "follow"}
        title={following ? "إلغاء المتابعة؟" : "متابعة الحساب"}
        subtitle={following ? "لن ترى هذا الحساب في المتابعة بعد الآن." : "ستصلك تحديثات هذا الحساب حسب إعداداتك."}
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={[styles.sheetInfoRow, { borderColor: theme.border, backgroundColor: theme.surface2 }]}>
          <Ionicons name="person-circle-outline" size={22} color={theme.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetInfoTitle, { color: theme.text }]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.sheetInfoSub, { color: theme.textMuted }]} numberOfLines={1}>
              {user.username} • {user.city}
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: following ? rgba(theme.tint, 0.18) : theme.card, borderColor: theme.border }]}>
            <Ionicons name={following ? "checkmark-circle-outline" : "add-circle-outline"} size={16} color={following ? theme.tint : theme.textMuted} />
            <Text style={[styles.badgePillText, { color: following ? theme.tint : theme.textMuted }]}>
              {following ? "تتابعه" : "غير متابع"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <PrimaryBtn
            label={following ? "إلغاء المتابعة" : "متابعة"}
            icon={following ? "person-remove-outline" : "person-add-outline"}
            theme={theme}
            onPress={doFollowToggle}
          />
          <GhostBtn label="كتم الحساب" icon="volume-mute-outline" theme={theme} onPress={closeSheet} />
        </View>
      </Sheet>

      {/* Block */}
      <Sheet
        visible={sheet === "block"}
        title={blocked ? "إلغاء الحظر" : "حظر الحساب"}
        subtitle={
          blocked
            ? "سيصبح بإمكان هذا الحساب التفاعل معك حسب الإعدادات."
            : "لن يتمكن هذا الحساب من مراسلتك أو التفاعل معك. يمكنك إلغاء الحظر لاحقًا."
        }
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={[styles.sheetNote, { backgroundColor: rgba("#EF4444", 0.08), borderColor: rgba("#EF4444", 0.20) }]}>
          <Ionicons name="lock-closed-outline" size={18} color="#EF4444" />
          <Text style={[styles.sheetNoteText, { color: theme.text }]}>
            {blocked ? "أنت على وشك إلغاء الحظر." : "الحظر إجراء قوي لحماية خصوصيتك."}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <PrimaryBtn
            label={blocked ? "إلغاء الحظر" : "تأكيد الحظر"}
            icon={blocked ? "lock-open-outline" : "lock-closed-outline"}
            theme={theme}
            onPress={doBlockToggle}
          />
          <GhostBtn label="إبلاغ بدلًا من ذلك" icon="flag-outline" theme={theme} danger onPress={() => setSheet("report")} />
        </View>
      </Sheet>

      {/* Report */}
      <Sheet
        visible={sheet === "report"}
        title="إبلاغ عن الحساب"
        subtitle="اختر سبب الإبلاغ وأضف تفاصيل إن لزم. سيتم التعامل بسرية."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <View style={[styles.input, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Ionicons name="warning-outline" size={18} color={theme.textMuted} />
            <TextInput
              placeholder="سبب الإبلاغ (مثال: إساءة/ابتزاز/محتوى غير لائق)"
              placeholderTextColor={theme.textMuted}
              value={reportReason}
              onChangeText={setReportReason}
              style={[styles.inputText, { color: theme.text }]}
            />
          </View>

          <View style={[styles.textArea, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <TextInput
              placeholder="تفاصيل إضافية (اختياري)"
              placeholderTextColor={theme.textMuted}
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              style={[styles.textAreaText, { color: theme.text }]}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryBtn label="إرسال الإبلاغ" icon="paper-plane-outline" theme={theme} onPress={doSubmitReport} />
            <GhostBtn label="حظر فورًا" icon="lock-closed-outline" theme={theme} danger onPress={() => setSheet("block")} />
          </View>

          <View style={[styles.miniHint, { borderColor: theme.border, backgroundColor: theme.surface2 }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.textMuted} />
            <Text style={[styles.miniHintText, { color: theme.textMuted }]}>
              لن يتم إشعار الطرف الآخر بتفاصيل الإبلاغ، وقد نطلب معلومات إضافية لاحقًا.
            </Text>
          </View>
        </View>
      </Sheet>

      {/* Share */}
      <Sheet
        visible={sheet === "share"}
        title="مشاركة الملف"
        subtitle="اختر طريقة المشاركة أو نسخ رابط الملف."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="link-outline" title="نسخ الرابط" subtitle="نسخ رابط الملف الشخصي إلى الحافظة." theme={theme} onPress={doShare} />
          <SheetItem icon="paper-plane-outline" title="إرسال إلى صديق" subtitle="اختر محادثة لإرسال الرابط." theme={theme} onPress={doShare} />
          <SheetItem icon="qr-code-outline" title="رمز QR" subtitle="عرض QR لمشاركة سريعة." theme={theme} onPress={doShare} />
        </View>
      </Sheet>

      {/* Settings */}
      <Sheet
        visible={sheet === "settings"}
        title="إعدادات الملف"
        subtitle="خيارات سريعة للتحكم في الظهور والخصوصية."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="eye-outline" title="الظهور" subtitle="التحكم في من يرى ملفك." theme={theme} onPress={doSaveSettings} />
          <SheetItem icon="images-outline" title="الوسائط" subtitle="السماح بعرض الصور/الوسائط." theme={theme} onPress={doSaveSettings} />
          <SheetItem icon="notifications-outline" title="الإشعارات" subtitle="إعدادات التنبيهات لهذا الحساب." theme={theme} onPress={doSaveSettings} />
        </View>
      </Sheet>

      {/* More */}
      <Sheet
        visible={sheet === "more"}
        title="خيارات إضافية"
        subtitle="إجراءات سريعة على الحساب."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="person-add-outline" title={following ? "إلغاء المتابعة" : "متابعة"} subtitle="إظهار/إخفاء التحديثات." theme={theme} onPress={() => setSheet("follow")} />
          <SheetItem icon="chatbubble-ellipses-outline" title="مراسلة" subtitle="بدء محادثة مباشرة." theme={theme} onPress={() => setSheet("chat")} />
          <SheetItem icon="flag-outline" title="إبلاغ" subtitle="الإبلاغ عن سلوك غير مناسب." theme={theme} onPress={() => setSheet("report")} />
          <SheetItem
            icon={blocked ? "lock-open-outline" : "lock-closed-outline"}
            title={blocked ? "إلغاء الحظر" : "حظر"}
            subtitle="منع التفاعل معك."
            theme={theme}
            danger={!blocked}
            onPress={() => setSheet("block")}
          />
        </View>
      </Sheet>

      {/* Edit Bio */}
      <Sheet
        visible={sheet === "editBio"}
        title="تعديل النبذة"
        subtitle="تحديث سريع (محاكاة). اربطه لاحقًا بـ API."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <View style={[styles.textArea, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <TextInput
              placeholder="اكتب نبذة جديدة…"
              placeholderTextColor={theme.textMuted}
              multiline
              defaultValue={user.bio}
              style={[styles.textAreaText, { color: theme.text }]}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryBtn label="حفظ" icon="checkmark-outline" theme={theme} onPress={closeSheet} />
            <GhostBtn label="إلغاء" icon="close-outline" theme={theme} onPress={closeSheet} />
          </View>
        </View>
      </Sheet>

      {/* Tag */}
      <Sheet
        visible={sheet === "tag"}
        title="اهتمام / وسم"
        subtitle="مثال تفاعلي (محاكاة): يمكنك عرض نتائج مشابهة أو اقتراحات."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="search-outline" title="عرض ملفات مشابهة" subtitle="اقتراحات حسب هذا الوسم." theme={theme} onPress={closeSheet} />
          <SheetItem icon="bookmark-outline" title="حفظ كاهتمام" subtitle="إضافة هذا الوسم لاهتماماتك." theme={theme} onPress={closeSheet} />
        </View>
      </Sheet>

      {/* Media (tap any tile) */}
      <Sheet
        visible={sheet === "media"}
        title="الوسائط"
        subtitle="عرض الوسائط يعتمد على الخصوصية (محاكاة)."
        theme={theme}
        isDark={isDark}
        onClose={closeSheet}
      >
        <View style={{ gap: 10 }}>
          <View style={[styles.sheetNote, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.sheetNoteText, { color: theme.text }]}>
              لعرض الوسائط فعليًا: اربط Grid ببيانات الصور وافتح شاشة Viewer.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryBtn label="فتح العارض" icon="expand-outline" theme={theme} onPress={closeSheet} />
            <GhostBtn label="إخفاء الوسائط" icon="eye-off-outline" theme={theme} onPress={closeSheet} />
          </View>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  cover: { width: "100%", height: "100%" },

  // ✅ Overlay بديل gradient
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  coverOverlayBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },

  topBar: {
    position: "absolute",
    top: Platform.select({ ios: 54, android: 16, default: 16 }),
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarWrap: {
    position: "absolute",
    left: 18,
    bottom: -AVATAR * 0.5,
  },
  avatarRing: {
    width: AVATAR + 10,
    height: AVATAR + 10,
    borderRadius: (AVATAR + 10) / 2,
    borderWidth: 1,
    padding: 5,
  },
  avatar: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },

  verified: {
    position: "absolute",
    right: -6,
    bottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  mainCard: {
    marginTop: -AVATAR * 0.38,
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },

  name: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, fontWeight: "600" },
  dot: { width: 4, height: 4, borderRadius: 2 },

  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  actionBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: { fontSize: 14, fontWeight: "800" },

  stats: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  vSep: { width: 1, height: 34, opacity: 0.9 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },
  chipText: { fontSize: 12, fontWeight: "800" },

  activePill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeText: { fontSize: 12, fontWeight: "800" },

  sectionCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900" },
  bio: { marginTop: 10, fontSize: 13.5, lineHeight: 20, fontWeight: "600" },

  segWrap: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    flexDirection: "row",
    gap: 8,
  },
  segBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segText: { fontSize: 13, fontWeight: "900" },

  block: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  blockTitle: { fontSize: 15, fontWeight: "900", marginBottom: 8 },

  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 12.5, fontWeight: "800" },
  rowValue: { flex: 1, textAlign: "right", fontSize: 13.5, fontWeight: "900" },

  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900" },
  emptySub: { marginTop: 6, fontSize: 13, lineHeight: 18, fontWeight: "700", textAlign: "center" },

  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mediaBox: {
    width: (W - 12 * 2 - 10 * 2) / 3,
    height: (W - 12 * 2 - 10 * 2) / 3,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mediaText: { fontSize: 12, fontWeight: "800" },
  mediaHint: { marginTop: 10, marginHorizontal: 12, fontSize: 12.5, fontWeight: "700", lineHeight: 18 },

  footer: {
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  footerText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: "700" },

  /* =========================
     ✅ Bottom Sheet styles
  ========================= */
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingTop: 8,
    maxHeight: Math.min(520, Math.round(H * 0.72)),
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 14,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    opacity: 0.9,
    marginBottom: 6,
  },
  sheetTitle: { fontSize: 16, fontWeight: "900" },
  sheetSub: { marginTop: 6, fontSize: 12.5, lineHeight: 18, fontWeight: "700" },

  sheetCloseBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: { fontSize: 14, fontWeight: "900" },

  sheetItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  sheetItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetItemTitle: { fontSize: 14, fontWeight: "900" },
  sheetItemSub: { marginTop: 4, fontSize: 12.5, lineHeight: 17, fontWeight: "700" },

  sheetPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  sheetPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  sheetGhostBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  sheetGhostText: { fontSize: 14, fontWeight: "900" },

  sheetNote: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  sheetNoteText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800" },

  fakeInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  fakeInputText: { fontSize: 13.5, fontWeight: "800" },

  sheetInfoRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  sheetInfoTitle: { fontSize: 14, fontWeight: "900" },
  sheetInfoSub: { marginTop: 3, fontSize: 12.5, fontWeight: "700" },

  badgePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  badgePillText: { fontSize: 12, fontWeight: "900" },

  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputText: { flex: 1, fontSize: 13.5, fontWeight: "800" },

  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textAreaText: { minHeight: 86, textAlignVertical: "top", fontSize: 13.5, fontWeight: "800" },

  miniHint: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  miniHintText: { flex: 1, fontSize: 12.5, lineHeight: 17, fontWeight: "700" },
});