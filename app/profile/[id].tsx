// app/(tabs)/profile/[id].tsx

import { AppTheme, Colors, ThemeName } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { getFriends } from "@/redux/slices/friendSlice";
import { fetchUserProfile } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Country } from "country-state-city";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";

const { width: W, height: H } = Dimensions.get("window");
const COVER_H = Math.max(260, Math.round(W * 0.64));
const AVATAR = 148;

type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked_by_me"
  | "blocked_me";

type ProfileBadge = {
  key?: string;
  name?: string;
  iconUrl?: string;
  lottieUrl?: string;
  emoji?: string;
};

type ProfileUser = {
  _id: string;
  username: string;
  atUsername?: string;
  bio?: string;
  country?: string;
  countryCode?: string;
  countryFlag?: string;
  city?: string;
  avatar?: string;
  coverImage?: string;
  dateOfBirth?: string;
  followersCount?: number;
  followingCount?: number;
  totalLikesReceived?: number;
  profileViews?: number;
  isOnline?: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  tags?: string[];
  relationshipStatus?: RelationshipStatus;
  isFollowing?: boolean;

  giftsSentCount?: number;
  giftsReceivedCount?: number;
  friendsCount?: number;
  gender?: string;
  age?: number | string;
  createdAt?: string;
  note?: string;

  verificationType?: string;
  activeBadges?: ProfileBadge[];
  customEmojiBadge?: {
    emoji?: string;
    isActive?: boolean;
    expiresAt?: string | null;
  } | null;
};

function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function toDisplay(value: any) {
  if (value === null || value === undefined) return "N/A";
  const s = String(value).trim();
  return s ? s : "N/A";
}

function formatSince(value?: string) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return toDisplay(value);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function computeAge(dateOfBirth?: string, directAge?: string | number) {
  if (directAge !== undefined && directAge !== null && String(directAge).trim() !== "") {
    return String(directAge);
  }

  if (!dateOfBirth) return "N/A";

  const d = new Date(dateOfBirth);
  if (Number.isNaN(d.getTime())) return "N/A";

  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age--;
  }

  return age >= 0 ? String(age) : "N/A";
}

function codeToFlag(code?: string) {
  const clean = String(code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(clean)) return "";
  return [...clean].map((c) => String.fromCodePoint(127397 + c.charCodeAt(0))).join("");
}

const countryNameToCode: Record<string, string> = {
  egypt: "EG",
  مصر: "EG",
  saudi: "SA",
  "saudi arabia": "SA",
  السعودية: "SA",
  uae: "AE",
  "united arab emirates": "AE",
  الامارات: "AE",
  "الإمارات": "AE",
  kuwait: "KW",
  الكويت: "KW",
  qatar: "QA",
  قطر: "QA",
  bahrain: "BH",
  البحرين: "BH",
  oman: "OM",
  عمان: "OM",
  jordan: "JO",
  الاردن: "JO",
  الأردن: "JO",
  iraq: "IQ",
  العراق: "IQ",
  syria: "SY",
  سوريا: "SY",
  lebanon: "LB",
  لبنان: "LB",
  libya: "LY",
  ليبيا: "LY",
  tunisia: "TN",
  تونس: "TN",
  algeria: "DZ",
  الجزائر: "DZ",
  morocco: "MA",
  المغرب: "MA",
  sudan: "SD",
  السودان: "SD",
  yemen: "YE",
  اليمن: "YE",
  palestine: "PS",
  فلسطين: "PS",
};

function getCountryFlag(user?: Partial<ProfileUser> | null) {

  const direct =
    String((user as any)?.countryFlag || "").trim() ||
    String((user as any)?.flag || "").trim() ||
    String((user as any)?.countryEmoji || "").trim();


  if (direct) {
    console.log("✅ returning direct flag:", direct);
    return direct;
  }

  const fromCode =
    String((user as any)?.countryCode || "").trim() ||
    String((user as any)?.country_code || "").trim();


  if (fromCode) {
    const flag = codeToFlag(fromCode);

    if (flag) {
      return flag;
    }
  }

  const rawCountry = String((user as any)?.country || "").trim();
  const normalizedCountry = rawCountry.toLowerCase();


  const matchedCountry = Country.getAllCountries().find(
    (item) =>
      item.name.trim().toLowerCase() === normalizedCountry ||
      item.isoCode.trim().toLowerCase() === normalizedCountry
  );


  if (matchedCountry?.isoCode) {
    const flag = codeToFlag(matchedCountry.isoCode);

    if (flag) {
      return flag;
    }
  }

  return "🏳️";
}

function isCustomEmojiBadgeActive(
  badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null
) {
  if (!badge?.emoji) return false;
  if (!badge?.isActive) return false;
  if (badge?.expiresAt) {
    const t = new Date(badge.expiresAt).getTime();
    if (Number.isFinite(t) && t <= Date.now()) return false;
  }
  return true;
}

function getPrimaryBadge(user?: Partial<ProfileUser> | null) {
  const badges = Array.isArray((user as any)?.activeBadges) ? (user as any).activeBadges : [];
  return badges.length ? badges[0] : null;
}

function getVerificationBadge(user?: Partial<ProfileUser> | null) {
  const v = String((user as any)?.verificationType || "").trim().toLowerCase();
  if (!v || v === "none") return null;

  if (v === "blue") {
    return { type: "blue", icon: "checkmark-circle", color: "#1d9bf0", label: "" };
  }
  if (v === "gold") {
    return { type: "gold", icon: "shield-checkmark", color: "#d4a017", label: "GOLD" };
  }
  if (v === "business") {
    return { type: "business", icon: "briefcase", color: "#374151", label: "BIZ" };
  }

  return { type: v, icon: "checkmark-circle", color: "#1d9bf0", label: "" };
}

const makeStyles = () =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: "#efefef",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
    },

    heroWrap: {
      width: "100%",
      height: COVER_H,
      position: "relative",
      backgroundColor: "#d8d8d8",
    },

    heroCover: {
      width: "100%",
      height: "100%",
    },

    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.18)",
    },

    heroTopBar: {
      position: "absolute",
      top: 14,
      left: 14,
      right: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    heroTopBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.30)",
    },

    heroActions: {
      position: "absolute",
      right: 14,
      bottom: 18,
      flexDirection: "row",
      gap: 10,
    },

    imageActionBtn: {
      height: 34,
      borderRadius: 18,
      paddingHorizontal: 12,
      backgroundColor: "rgba(0,0,0,0.48)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    imageActionText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "800",
    },

    centerHeader: {
      alignItems: "center",
      marginTop: -24,
      paddingHorizontal: 16,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },

    profileNameCentered: {
      fontSize: 20,
      fontWeight: "700",
      color: "#2d2d2d",
      textAlign: "center",
    },

    copyableNameWrap: {
      marginTop: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    copyableNameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
    },

    copyHintText: {
      fontSize: 11.5,
      color: "#7a7a7a",
      fontWeight: "700",
      textAlign: "center",
    },

    badgePill: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      paddingHorizontal: 7,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 4,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#d8d8d8",
    },

    badgePillText: {
      fontSize: 10,
      fontWeight: "900",
    },

    customEmojiText: {
      fontSize: 18,
      lineHeight: 22,
    },

    profileAvatarWrap: {
      width: AVATAR,
      height: AVATAR,
      borderRadius: AVATAR / 2,
      overflow: "hidden",
      backgroundColor: "#dadada",
      borderWidth: 4,
      borderColor: "#efefef",
    },

    profileAvatarLarge: {
      width: "100%",
      height: "100%",
      borderRadius: AVATAR / 2,
    },

    profileAvatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },

    verifiedBadge: {
      position: "absolute",
      bottom: 6,
      right: 6,
      minWidth: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#1d9bf0",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#efefef",
      paddingHorizontal: 6,
      flexDirection: "row",
      gap: 4,
    },

    verifiedLabel: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "900",
    },

    profileIdText: {
      marginTop: 8,
      fontSize: 10,
      fontWeight: "700",
      color: "#404040",
      textAlign: "center",
    },

    profileStatsBox: {
      marginTop: 18,
      backgroundColor: "#f5f5f5",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#dddddd",
      paddingVertical: 12,
    },

    profileStatsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    profileStatsRowBottom: {
      marginTop: 14,
    },

    profileBioWrap: {
      backgroundColor: "#e7e7e7",
      minHeight: 230,
      paddingHorizontal: 18,
      paddingVertical: 26,
      alignItems: "center",
      justifyContent: "center",
    },

    profileNoteText: {
      marginTop: 24,
      fontSize: 16,
      color: "#d77d1f",
      lineHeight: 29,
      textAlign: "center",
      fontWeight: "700",
    },

    floatingMicBtn: {
      position: "absolute",
      left: 22,
      bottom: 28,
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: "#000",
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.24,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },

    errorTitle: {
      marginTop: 10,
      color: "#111",
      fontWeight: "900",
      fontSize: 16,
      textAlign: "center",
    },

    errorSub: {
      marginTop: 6,
      color: "#666",
      fontWeight: "700",
      textAlign: "center",
    },

    retryBtn: {
      marginTop: 14,
      paddingHorizontal: 16,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#111",
      alignItems: "center",
      justifyContent: "center",
    },

    retryText: {
      color: "#fff",
      fontWeight: "900",
      fontSize: 14,
    },

    previewRoot: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.94)",
      justifyContent: "center",
      alignItems: "center",
    },

    previewClose: {
      position: "absolute",
      top: 52,
      right: 18,
      zIndex: 5,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },

    previewImage: {
      width: W,
      height: H,
    },
  });

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={{ width: "25%", alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
      <Text
        style={{
          fontSize: 14,
          color: "#474747",
          textAlign: "center",
          lineHeight: 20,
          fontWeight: "500",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: "#68737d",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function BadgeView({ user }: { user: ProfileUser }) {
  const primaryBadge = getPrimaryBadge(user);
  const verificationBadge = getVerificationBadge(user);
  const customEmojiActive = isCustomEmojiBadgeActive(user.customEmojiBadge);

  if (!primaryBadge && !verificationBadge && !customEmojiActive) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {customEmojiActive ? (
        <View style={stylesRef.badgePill}>
          <Text style={stylesRef.customEmojiText}>{user.customEmojiBadge?.emoji}</Text>
        </View>
      ) : null}

      {primaryBadge?.emoji ? (
        <View style={stylesRef.badgePill}>
          <Text style={stylesRef.customEmojiText}>{primaryBadge.emoji}</Text>
        </View>
      ) : null}

      {primaryBadge?.iconUrl ? (
        <View style={stylesRef.badgePill}>
          <Image
            source={{ uri: primaryBadge.iconUrl }}
            style={{ width: 18, height: 18, borderRadius: 9 }}
            contentFit="contain"
          />
        </View>
      ) : null}

      {primaryBadge?.name && !primaryBadge?.iconUrl && !primaryBadge?.emoji ? (
        <View style={stylesRef.badgePill}>
          <Text style={[stylesRef.badgePillText, { color: "#444" }]}>{primaryBadge.name}</Text>
        </View>
      ) : null}

      {verificationBadge ? (
        <View style={stylesRef.badgePill}>
          <Ionicons name={verificationBadge.icon as any} size={15} color={verificationBadge.color} />
          {!!verificationBadge.label && (
            <Text style={[stylesRef.badgePillText, { color: verificationBadge.color }]}>
              {verificationBadge.label}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

let stylesRef = makeStyles();

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { language, t } = useTranslation();
  const isRTL = language === "ar" || I18nManager.isRTL;

  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === "dark" ? "dark" : "light";
  const themeBase: AppTheme = Colors[themeName];
  useMemo(() => {
    const background = themeBase.background;
    const card = themeBase.card ?? "#FFFFFF";
    const tint = themeBase.tint ?? themeBase.primary;
    const text = themeBase.text;
    const border =
      themeBase.border ??
      (scheme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)");
    const textMuted =
      themeBase.mutedText ??
      (themeBase.icon
        ? rgba(themeBase.icon, 0.95)
        : scheme === "dark"
          ? "rgba(234,240,255,0.65)"
          : "rgba(18,24,38,0.62)");

    return {
      background,
      card,
      tint,
      text,
      border,
      textMuted,
    };
  }, [themeBase, scheme]);

  const styles = useMemo(() => makeStyles(), []);
  stylesRef = styles;

  const copy = useMemo(
    () => ({
      loadingProfile: t("profileScreenLan.loadingProfile"),
      profileLoadFailed: t("profileScreenLan.profileLoadFailed"),
      retry: t("profileScreenLan.retry"),
      noData: t("profileScreenLan.noData"),
      noBioYet: t("profileScreenLan.noBioYet"),
      unspecified: t("profileScreenLan.unspecified"),
    }),
    [t]
  );

  const profileUser = useSelector((s: RootState) => (s.user as any).profileUser) as ProfileUser | null;
  const loadingProfile = useSelector((s: RootState) => (s.user as any).loadingProfile);
  const errorProfile = useSelector((s: RootState) => (s.user as any).errorProfile);

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(String(id)));
    }
  }, [id, dispatch]);

  const user = profileUser;

  const handleCopy = async (value: string) => {
    const clean = String(value || "").trim();
    if (!clean) return;
    await Clipboard.setStringAsync(clean);
  };
  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([
          dispatch(getFriends()).unwrap(),
        ]);
      } catch (e) {
      }
    };

    loadAll();
  }, [dispatch]);

  const displayCountryName = toDisplay(user?.country || copy.unspecified);
  const displayCountryFlag = getCountryFlag(user);
  const displayGender = toDisplay((user as any)?.gender);
  const displayAge = computeAge(user?.dateOfBirth, (user as any)?.age);
  const displaySince = formatSince((user as any)?.createdAt);
  const displayViews = toDisplay(user?.profileViews);
  const displayFriends = String(
    useSelector((state: RootState) => state.friends.friends)?.length || 0
  );
  const displayFollowers = toDisplay(user?.followersCount);
  const displayFollowing = toDisplay(user?.followingCount);
  const displayGiftIn = toDisplay((user as any)?.giftsReceivedCount);
  const displayGiftOut = toDisplay((user as any)?.giftsSentCount);
  const displayBioRaw = user?.bio?.trim() || copy.noBioYet || "N/A";
  const displayNote = String((user as any)?.note || "").trim();
  const verificationBadge = getVerificationBadge(user);
  const displayName = toDisplay(user?.username);
  const displayId = toDisplay(user?._id);

  const bioHtml = useMemo(() => {
    const raw = String(displayBioRaw || "").trim();


    const html = /<[a-z][\s\S]*>/i.test(raw)
      ? raw
      : `<div style="text-align:center; color:#333333; font-size:17px; line-height:33px; font-weight:500;">${raw.replace(/\n/g, "<br/>")}</div>`;



    return { html };
  }, [displayBioRaw]);

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: "#666", fontWeight: "700" }}>
            {copy.loadingProfile}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorProfile) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={34} color="#EF4444" />
          <Text style={styles.errorTitle}>{copy.profileLoadFailed}</Text>
          <Text style={styles.errorSub}>{String(errorProfile)}</Text>

          <Pressable
            onPress={() => id && dispatch(fetchUserProfile(String(id)))}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={styles.retryBtn}>
              <Text style={styles.retryText}>{copy.retry}</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <Text style={{ color: "#666", fontWeight: "700" }}>{copy.noData}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.heroWrap}>
            {user.coverImage ? (
              <Image source={{ uri: user.coverImage }} style={styles.heroCover} contentFit="cover" />
            ) : (
              <View style={[styles.heroCover, { backgroundColor: "#d9d9d9" }]} />
            )}

            <View style={styles.heroOverlay} />

            <View style={styles.heroTopBar}>
              <Pressable onPress={() => router.back()} style={styles.heroTopBtn}>
                <Ionicons
                  name={isRTL ? "chevron-forward" : "chevron-back"}
                  size={22}
                  color="#fff"
                />
              </Pressable>
            </View>

            <View style={styles.heroActions}>
              <Pressable
                onPress={() => setPreviewUri(user.coverImage || null)}
                style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
              >
                <View style={styles.imageActionBtn}>
                  <Ionicons name="image-outline" size={15} color="#fff" />
                  <Text style={styles.imageActionText}>Cover</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setPreviewUri(user.avatar || null)}
                style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
              >
                <View style={styles.imageActionBtn}>
                  <Ionicons name="person-circle-outline" size={15} color="#fff" />
                  <Text style={styles.imageActionText}>Avatar</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.centerHeader}>
            <View style={styles.profileAvatarWrap}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileAvatarLarge} contentFit="cover" />
              ) : (
                <View style={[styles.profileAvatarLarge, styles.profileAvatarFallback]}>
                  <Ionicons name="person" size={52} color="#777" />
                </View>
              )}

              {verificationBadge ? (
                <View style={[styles.verifiedBadge, { backgroundColor: verificationBadge.color }]}>
                  <Ionicons name={verificationBadge.icon as any} size={16} color="#fff" />
                  {!!verificationBadge.label && (
                    <Text style={styles.verifiedLabel}>{verificationBadge.label}</Text>
                  )}
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={() => handleCopy(displayName)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={styles.copyableNameWrap}>
                <View style={styles.copyableNameRow}>
                  <Text style={styles.profileNameCentered} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <BadgeView user={user} />
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleCopy(displayId)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={styles.profileIdText}>{displayId}</Text>
            </Pressable>
          </View>

          <View style={styles.profileStatsBox}>
            <View style={styles.profileStatsRow}>
              <StatItem label="Gifts ↙" value={displayGiftIn} />
              <StatItem label="Gifts ↗" value={displayGiftOut} />
              <StatItem label="Followers" value={displayFollowers} />
              <StatItem label="Following" value={displayFollowing} />
            </View>

            <View style={[styles.profileStatsRow, styles.profileStatsRowBottom]}>
              <StatItem label="Views" value={displayViews} />
              <StatItem label="Friends" value={displayFriends} />
              <StatItem
                label="Country"
                value={
                  displayCountryFlag !== "N/A"
                    ? `${displayCountryFlag}`
                    : displayCountryName
                }
              />
              <StatItem label="Since" value={displaySince} />
            </View>

            <View style={[styles.profileStatsRow, styles.profileStatsRowBottom]}>
              <StatItem label="Gender" value={displayGender} />
              <StatItem label="Age" value={displayAge} />
              <StatItem label="City" value={toDisplay(user.city)} />
              {/* <StatItem label="ID" value={displayId} /> */}
            </View>
          </View>

          <View style={styles.profileBioWrap}>
            <WebView
              originWhitelist={["*"]}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              source={{
                html: `
        <!DOCTYPE html>
        <html dir="rtl">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: transparent;
                color: #333333;
                text-align: center;
                font-size: 17px;
                line-height: 33px;
                font-weight: 500;
                overflow: hidden;
                word-break: break-word;
              }
              * {
                max-width: 100%;
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${String(user?.bio || "").trim() || "N/A"}
          </body>
        </html>
      `,
              }}
              style={{
                width: W - 36,
                height: 230,
                backgroundColor: "transparent",
              }}
            />

            {!!displayNote && (
              <Text style={styles.profileNoteText}>{displayNote}</Text>
            )}
          </View>
        </ScrollView>

        <Pressable style={styles.floatingMicBtn}>
          <Ionicons name="mic-outline" size={30} color="#fff" />
        </Pressable>

        <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
          <View style={styles.previewRoot}>
            <Pressable style={styles.previewClose} onPress={() => setPreviewUri(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>

            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : null}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}