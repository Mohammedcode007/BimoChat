// app/(tabs)/profile/[id].tsx
// ✅ Profile Screen (Expo + React Native)
// ✅ يستخدم: useColorScheme + Colors (theme)
// ✅ بدون theme.card2
// ✅ بدون expo-linear-gradient

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

const { width: W } = Dimensions.get("window");
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
    const border = (themeBase as any).border ?? (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)");
    const textMuted =
      (themeBase as any).textMuted ??
      ((themeBase as any).icon ? rgba((themeBase as any).icon, 0.95) : (isDark ? "rgba(234,240,255,0.65)" : "rgba(18,24,38,0.62)"));

    // ✅ surface2 بديل card2
    const surface2 = isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)";

    return { background, card, tint, text, border, textMuted, surface2 };
  }, [themeBase, isDark]);

  const [tab, setTab] = useState<"about" | "posts" | "media">("about");

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
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => {}}>
              <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </View>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => {}}>
                <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </View>
              </Pressable>

              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => {}}>
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
                    <View style={[styles.activeDot, { backgroundColor: "#22C55E" }]} />
                    <Text style={[styles.activeText, { color: theme.text }]}>{user.lastActiveText}</Text>
                  </View>
                </View>
              </View>

              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]} onPress={() => {}}>
                <View style={[styles.moreBtn, { borderColor: theme.border }]}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={theme.text} />
                </View>
              </Pressable>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <ActionBtn icon="chatbubble-ellipses-outline" label="رسالة" filled theme={theme} isDark={isDark} />
              <ActionBtn icon="heart-outline" label="إعجاب" theme={theme} isDark={isDark} />
              <ActionBtn icon="flag-outline" label="إبلاغ" theme={theme} isDark={isDark} />
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

            {/* Tags */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {user.tags.slice(0, 10).map((t) => (
                <Chip key={t} label={t} icon="sparkles-outline" bg={theme.surface2} fg={theme.text} />
              ))}
            </View>

            {/* Bio */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>نبذة</Text>
                <Ionicons name="create-outline" size={18} color={theme.textMuted} />
              </View>
              <Text style={[styles.bio, { color: theme.textMuted }]}>{user.bio}</Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <Chip label={user.lookingFor} icon="calendar-outline" bg={theme.card} fg={theme.text} />
                <Chip label="تعارف محترم" icon="shield-checkmark-outline" bg={theme.card} fg={theme.text} />
                <Chip label="خصوصية عالية" icon="lock-closed-outline" bg={theme.card} fg={theme.text} />
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
                    <View key={i} style={[styles.mediaBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <Ionicons name="image-outline" size={22} color={theme.textMuted} />
                      <Text style={[styles.mediaText, { color: theme.textMuted }]}>وسائط</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.mediaHint, { color: theme.textMuted }]}>
                  يتم التحكم في عرض الوسائط وفق إعدادات الخصوصية.
                </Text>
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
});