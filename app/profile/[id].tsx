
// app/(tabs)/profile/[id].tsx

import { AppTheme, Colors, ThemeName } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { createChat, setActiveChat } from "@/redux/slices/chatSlice";
import { blockUser, toggleFollow } from "@/redux/slices/followSlice";
import {
  cancelFriendRequest,
  sendFriendRequest,
  unblockUser,
} from "@/redux/slices/friendSlice";
import { setMessages } from "@/redux/slices/messageSlice";
import { clearProfileTweets, getUserTweets, Tweet } from "@/redux/slices/tweetSlice";
import { fetchUserProfile } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import api from "@/services/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  I18nManager,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width: W, height: H } = Dimensions.get("window");
const COVER_H = Math.max(220, Math.round(W * 0.55));
const AVATAR = 108;

type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked_by_me"
  | "blocked_me";

type ProfileUser = {
  _id: string;
  username: string;
  atUsername?: string;
  bio?: string;
  country?: string;
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
};

const formatNum = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n ?? 0);
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

const makeStyles = (theme: any, isRTL: boolean) =>
  StyleSheet.create({
    page: { flex: 1 },

    cover: { width: "100%", height: "100%" },
    coverOverlay: { ...StyleSheet.absoluteFillObject },
    coverOverlayBottom: { position: "absolute", left: 0, right: 0, bottom: 0, height: 90 },

    topBar: {
      position: "absolute",
      top: Platform.select({ ios: 16, android: 16, default: 16 }),
      left: 14,
      right: 14,
      flexDirection: isRTL ? "row-reverse" : "row",
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

    avatar: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },

    avatarWrap: {
      position: "absolute",
      left: isRTL ? undefined : 18,
      right: isRTL ? 18 : undefined,
      bottom: -AVATAR * 0.5,
      zIndex: 999,
      elevation: 999,
    },

    avatarRing: {
      width: AVATAR + 10,
      height: AVATAR + 10,
      borderRadius: (AVATAR + 10) / 2,
      borderWidth: 1,
      padding: 5,
      zIndex: 1000,
      elevation: 1000,
    },

    verified: {
      position: "absolute",
      right: isRTL ? undefined : -6,
      left: isRTL ? -6 : undefined,
      bottom: 6,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      zIndex: 1100,
      elevation: 1100,
    },

    verifiedText: { color: "#fff", fontSize: 12, fontWeight: "700" },

    mainCard: {
      marginTop: -AVATAR * 0.2,
      marginHorizontal: 12,
      borderRadius: 18,
      borderWidth: 1,
      padding: 14,
      zIndex: 1,
      elevation: 1,
    },

    name: { fontSize: 22, fontWeight: "800", textAlign: isRTL ? "right" : "left" },
    sub: { fontSize: 13, fontWeight: "600", textAlign: isRTL ? "right" : "left" },
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
      flexDirection: isRTL ? "row-reverse" : "row",
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
      flexDirection: isRTL ? "row-reverse" : "row",
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
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      maxWidth: "100%",
    },

    chipText: { fontSize: 12, fontWeight: "800" },

    activePill: {
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
      alignSelf: isRTL ? "flex-end" : "flex-start",
    },

    activeDot: { width: 8, height: 8, borderRadius: 4 },
    activeText: { fontSize: 12, fontWeight: "800", textAlign: isRTL ? "right" : "left" },

    sectionCard: { marginTop: 14, borderRadius: 16, borderWidth: 1, padding: 12 },
    segWrap: {
      marginTop: 14,
      borderRadius: 16,
      borderWidth: 1,
      padding: 6,
      flexDirection: isRTL ? "row-reverse" : "row",
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

    block: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 12 },
    blockTitle: { fontSize: 15, fontWeight: "900", marginBottom: 8, textAlign: isRTL ? "right" : "left" },

    row: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      flexDirection: isRTL ? "row-reverse" : "row",
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

    rowLabel: { fontSize: 12.5, fontWeight: "800", textAlign: isRTL ? "right" : "left" },
    rowValue: { flex: 1, textAlign: isRTL ? "left" : "right", fontSize: 13.5, fontWeight: "900" },

    empty: { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center" },
    emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", textAlign: "center" },
    emptySub: { marginTop: 6, fontSize: 13, lineHeight: 18, fontWeight: "700", textAlign: "center" },

    mediaGrid: { flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: 10 },
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
    mediaHint: { marginTop: 10, marginHorizontal: 12, fontSize: 12.5, fontWeight: "700", lineHeight: 18, textAlign: isRTL ? "right" : "left" },

    footer: {
      marginTop: 12,
      marginHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
      alignItems: "flex-start",
    },
    tweetCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      marginBottom: 12,
    },

    tweetHeader: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 10,
    },

    tweetAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },

    tweetUserInfo: {
      flex: 1,
    },

    tweetName: {
      fontSize: 14,
      fontWeight: "900",
      textAlign: isRTL ? "right" : "left",
    },

    tweetMeta: {
      fontSize: 12,
      fontWeight: "700",
      textAlign: isRTL ? "right" : "left",
      marginTop: 2,
    },

    tweetContent: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      textAlign: isRTL ? "right" : "left",
    },

    tweetMediaImage: {
      width: "100%",
      height: 220,
      borderRadius: 14,
      marginTop: 10,
    },

    tweetStatsRow: {
      marginTop: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    tweetStatPill: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 8,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    loadMoreBtn: {
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },

    loadMoreText: {
      fontSize: 14,
      fontWeight: "900",
    },
    footerText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: "700", textAlign: isRTL ? "right" : "left" },

    sheetRoot: { flex: 1, justifyContent: "flex-end" },
    sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },

    sheetCard: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      paddingTop: 8,
      shadowOpacity: 0.25,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: -8 },
      elevation: 14,
    },

    sheetHandle: { width: 44, height: 5, borderRadius: 999, alignSelf: "center", opacity: 0.9, marginBottom: 6 },
    sheetTitle: { fontSize: 16, fontWeight: "900", textAlign: isRTL ? "right" : "left" },
    sheetSub: { marginTop: 6, fontSize: 12.5, lineHeight: 18, fontWeight: "700", textAlign: isRTL ? "right" : "left" },

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
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 12,
      alignItems: "center",
    },

    sheetItemIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    sheetItemTitle: { fontSize: 14, fontWeight: "900", textAlign: isRTL ? "right" : "left" },
    sheetItemSub: { marginTop: 4, fontSize: 12.5, lineHeight: 17, fontWeight: "700", textAlign: isRTL ? "right" : "left" },

    sheetPrimaryBtn: {
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 8,
      paddingHorizontal: 16,
      flex: 1,
    },

    sheetPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "900" },

    sheetGhostBtn: {
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 8,
      paddingHorizontal: 16,
      flex: 1,
    },

    sheetGhostText: { fontSize: 14, fontWeight: "900" },

    sheetNote: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
      alignItems: "center",
    },

    sheetNoteText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800", textAlign: isRTL ? "right" : "left" },

    fakeInput: {
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
      alignItems: "center",
    },

    fakeInputText: { fontSize: 13.5, fontWeight: "800", textAlign: isRTL ? "right" : "left" },

    input: {
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 10,
      alignItems: "center",
    },

    inputText: { flex: 1, fontSize: 13.5, fontWeight: "800", textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" },

    textArea: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
    textAreaText: { minHeight: 86, textAlignVertical: "top", fontSize: 13.5, fontWeight: "800" },
  });

const Chip = ({
  label,
  icon,
  bg,
  fg,
  onPress,
  isRTL,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  bg: string;
  fg: string;
  onPress?: () => void;
  isRTL: boolean;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
    <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", maxWidth: "100%", backgroundColor: bg }}>
      {icon ? <Ionicons name={icon} size={14} color={fg} style={isRTL ? { marginStart: 6 } : { marginEnd: 6 }} /> : null}
      <Text style={{ fontSize: 12, fontWeight: "800", color: fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);

const Stat = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text }}>{value}</Text>
    <Text style={{ fontSize: 12, fontWeight: "700", marginTop: 4, color: theme.textMuted }}>{label}</Text>
  </View>
);

const ActionBtn = ({
  icon,
  label,
  filled,
  theme,
  isDark,
  disabled,
  onPress,
  isRTL,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  filled?: boolean;
  theme: any;
  isDark: boolean;
  disabled?: boolean;
  onPress?: () => void;
  isRTL: boolean;
}) => {
  const bg = filled ? (theme.primary ?? theme.tint) : theme.card;
  const fg = filled ? (theme.primaryText ?? "#FFFFFF") : theme.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.9 : 1, flex: 1 }]}
    >
      <View
        style={{
          height: 44,
          borderRadius: 14,
          borderWidth: 1,
          paddingHorizontal: 12,
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: bg,
          borderColor: filled ? (theme.primary ?? theme.tint) : theme.border,
        }}
      >
        <Ionicons name={icon} size={18} color={fg} />
        <Text style={{ fontSize: 14, fontWeight: "800", color: fg }} numberOfLines={1}>
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
  isRTL,
}: {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
  isRTL: boolean;
}) => (
  <View
    style={{
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surface2,
        }}
      >
        <Ionicons name={icon || "information-circle-outline"} size={18} color={theme.tint} />
      </View>
      <Text style={{ fontSize: 12.5, fontWeight: "800", color: theme.textMuted, textAlign: isRTL ? "right" : "left" }}>
        {label}
      </Text>
    </View>
    <Text
      style={{
        flex: 1,
        textAlign: isRTL ? "left" : "right",
        fontSize: 13.5,
        fontWeight: "900",
        color: theme.text,
      }}
      numberOfLines={2}
    >
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
      style={{
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? "grey" : "transparent",
        borderColor: theme.border,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "900", color: active ? "#FFFFFF" : theme.text }}>{label}</Text>
    </View>
  </Pressable>
);

type SheetKey =
  | null
  | "chat"
  | "friend"
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
  children,
  onClose,
  isRTL,
  closeLabel,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  theme: any;
  children: React.ReactNode;
  onClose: () => void;
  isRTL: boolean;
  closeLabel: string;
}) {
  const insets = useSafeAreaInsets();
  const SHEET_H = Math.min(560, Math.round(H * 0.78));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} />

        <View
          style={{
            height: SHEET_H,
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: "#000",
            paddingBottom: 12 + (insets.bottom || 0),
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            paddingTop: 8,
            shadowOpacity: 0.25,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: -8 },
            elevation: 14,
          }}
        >
          <View style={{ width: 44, height: 5, borderRadius: 999, alignSelf: "center", opacity: 0.9, marginBottom: 6, backgroundColor: theme.border }} />

          <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: isRTL ? "right" : "left" }}>{title}</Text>
            {subtitle ? (
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 12.5,
                  lineHeight: 18,
                  fontWeight: "700",
                  color: theme.textMuted,
                  textAlign: isRTL ? "right" : "left",
                }}
                numberOfLines={3}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <View
                style={{
                  height: 44,
                  borderRadius: 14,
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text }}>{closeLabel}</Text>
              </View>
            </Pressable>
          </View>
        </View>

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
  isRTL,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  theme: any;
  danger?: boolean;
  onPress: () => void;
  isRTL: boolean;
}) {
  const fg = danger ? "#EF4444" : theme.text;
  const iconBg = danger ? "rgba(239,68,68,0.12)" : theme.surface2;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 16,
          padding: 12,
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: 12,
          alignItems: "center",
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconBg,
          }}
        >
          <Ionicons name={icon} size={18} color={danger ? "#EF4444" : theme.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: fg, textAlign: isRTL ? "right" : "left" }}>{title}</Text>
          {subtitle ? (
            <Text
              style={{
                marginTop: 4,
                fontSize: 12.5,
                lineHeight: 17,
                fontWeight: "700",
                color: theme.textMuted,
                textAlign: isRTL ? "right" : "left",
              }}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={theme.textMuted} />
      </View>
    </Pressable>
  );
}

function PrimaryBtn({
  label,
  icon,
  theme,
  onPress,
  isRTL,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
  onPress: () => void;
  isRTL: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}>
      <View
        style={{
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: 8,
          paddingHorizontal: 16,
          flex: 1,
          backgroundColor: theme.primary ?? theme.tint,
          borderWidth: 1,
          borderColor: theme.primary ?? theme.tint,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={theme.primaryText ?? "#FFFFFF"} /> : null}
        <Text style={{ color: theme.primaryText ?? "#FFFFFF", fontSize: 14, fontWeight: "900" }}>
          {label}
        </Text>
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
  isRTL,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
  danger?: boolean;
  onPress: () => void;
  isRTL: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}>
      <View
        style={{
          height: 44,
          borderRadius: 14,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: 8,
          paddingHorizontal: 16,
          flex: 1,
          backgroundColor: theme.surface2,
          borderColor: theme.border,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={danger ? "#EF4444" : theme.text} /> : null}
        <Text style={{ fontSize: 14, fontWeight: "900", color: danger ? "#EF4444" : theme.text }}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const { language, t } = useTranslation();
  const isRTL = language === "ar" || I18nManager.isRTL;

  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === "dark" ? "dark" : "light";
  const themeBase: AppTheme = Colors[themeName];
  const isDark = scheme === "dark";

  const theme = useMemo(() => {
    const background = themeBase.background;
    const card = themeBase.card ?? (isDark ? "#111827" : "#FFFFFF");
    const tint = themeBase.tint ?? themeBase.primary;
    const text = themeBase.text;

    const border =
      themeBase.border ??
      (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)");

    const textMuted =
      themeBase.mutedText ??
      (themeBase.icon
        ? rgba(themeBase.icon, 0.95)
        : isDark
          ? "rgba(234,240,255,0.65)"
          : "rgba(18,24,38,0.62)");

    const surface = themeBase.surface ?? card;
    const surface2 = themeBase.surface2 ?? (isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)");
    const primary = themeBase.primary ?? tint;
    const primaryText = themeBase.primaryText ?? "#FFFFFF";
    const danger = themeBase.danger ?? "#EF4444";

    return {
      background,
      card,
      tint,
      text,
      border,
      textMuted,
      surface,
      surface2,
      primary,
      primaryText,
      danger,
    };
  }, [themeBase, isDark]);
  const styles = useMemo(() => makeStyles(theme, isRTL), [theme, isRTL]);

  const copy = useMemo(
    () => ({
      verified: t("profileScreenLan.verified"),
      activeNow: t("profileScreenLan.activeNow"),
      offline: t("profileScreenLan.offline"),
      unspecified: t("profileScreenLan.unspecified"),
      message: t("profileScreenLan.message"),
      startChat: t("profileScreenLan.startChat"),
      startChatNow: t("profileScreenLan.startChatNow"),
      typeFirstMessage: t("profileScreenLan.typeFirstMessage"),
      close: t("profileScreenLan.close"),
      add: t("profileScreenLan.add"),
      friends: t("profileScreenLan.friends"),
      cancel: t("profileScreenLan.cancel"),
      pending: t("profileScreenLan.pending"),
      unblock: t("profileScreenLan.unblock"),
      blockedYou: t("profileScreenLan.blockedYou"),
      follow: t("profileScreenLan.follow"),
      following: t("profileScreenLan.following"),
      followers: t("profileScreenLan.followers"),
      followingCount: t("profileScreenLan.followingCount"),
      likes: t("profileScreenLan.likes"),
      views: t("profileScreenLan.views"),
      noBioYet: t("profileScreenLan.noBioYet"),
      about: t("profileScreenLan.about"),
      posts: t("profileScreenLan.posts"),
      media: t("profileScreenLan.media"),
      basicInfo: t("profileScreenLan.basicInfo"),
      username: t("profileScreenLan.username"),
      country: t("profileScreenLan.country"),
      noPostsYet: t("profileScreenLan.noPostsYet"),
      postsApiHint: t("profileScreenLan.postsApiHint"),
      mediaLabel: t("profileScreenLan.mediaLabel"),
      mediaPrivacyHint: t("profileScreenLan.mediaPrivacyHint"),
      footerNote: t("profileScreenLan.footerNote"),
      loadingProfile: t("profileScreenLan.loadingProfile"),
      profileLoadFailed: t("profileScreenLan.profileLoadFailed"),
      retry: t("profileScreenLan.retry"),
      noData: t("profileScreenLan.noData"),
      friendSheetAcceptedTitle: t("profileScreenLan.friendSheetAcceptedTitle"),
      friendSheetAcceptedSub: t("profileScreenLan.friendSheetAcceptedSub"),
      friendSheetPendingSentTitle: t("profileScreenLan.friendSheetPendingSentTitle"),
      friendSheetPendingSentSub: t("profileScreenLan.friendSheetPendingSentSub"),
      friendSheetPendingReceivedTitle: t("profileScreenLan.friendSheetPendingReceivedTitle"),
      friendSheetPendingReceivedSub: t("profileScreenLan.friendSheetPendingReceivedSub"),
      friendSheetBlockedByMeTitle: t("profileScreenLan.friendSheetBlockedByMeTitle"),
      friendSheetBlockedByMeSub: t("profileScreenLan.friendSheetBlockedByMeSub"),
      friendSheetBlockedMeTitle: t("profileScreenLan.friendSheetBlockedMeTitle"),
      friendSheetBlockedMeSub: t("profileScreenLan.friendSheetBlockedMeSub"),
      friendSheetAddTitle: t("profileScreenLan.friendSheetAddTitle"),
      friendSheetAddSub: t("profileScreenLan.friendSheetAddSub"),
      followSheetFollowingTitle: t("profileScreenLan.followSheetFollowingTitle"),
      followSheetFollowTitle: t("profileScreenLan.followSheetFollowTitle"),
      followSheetBlockedSub: t("profileScreenLan.followSheetBlockedSub"),
      followSheetFollowingSub: t("profileScreenLan.followSheetFollowingSub"),
      followSheetFollowSub: t("profileScreenLan.followSheetFollowSub"),
      blockSheetBlockedTitle: t("profileScreenLan.blockSheetBlockedTitle"),
      blockSheetUnblockTitle: t("profileScreenLan.blockSheetUnblockTitle"),
      blockSheetBlockTitle: t("profileScreenLan.blockSheetBlockTitle"),
      blockSheetBlockedMeSub: t("profileScreenLan.blockSheetBlockedMeSub"),
      blockSheetUnblockSub: t("profileScreenLan.blockSheetUnblockSub"),
      blockSheetBlockSub: t("profileScreenLan.blockSheetBlockSub"),
      blockNoteBlockedMe: t("profileScreenLan.blockNoteBlockedMe"),
      blockNoteUnblock: t("profileScreenLan.blockNoteUnblock"),
      blockNoteBlock: t("profileScreenLan.blockNoteBlock"),
      confirmBlock: t("profileScreenLan.confirmBlock"),
      reportTitle: t("profileScreenLan.reportTitle"),
      reportSub: t("profileScreenLan.reportSub"),
      reportReason: t("profileScreenLan.reportReason"),
      reportDetails: t("profileScreenLan.reportDetails"),
      send: t("profileScreenLan.send"),
      shareTitle: t("profileScreenLan.shareTitle"),
      shareSub: t("profileScreenLan.shareSub"),
      copyLink: t("profileScreenLan.copyLink"),
      copyLinkSub: t("profileScreenLan.copyLinkSub"),
      sendToFriend: t("profileScreenLan.sendToFriend"),
      sendToFriendSub: t("profileScreenLan.sendToFriendSub"),
      editBioTitle: t("profileScreenLan.editBioTitle"),
      editBioSub: t("profileScreenLan.editBioSub"),
      writeNewBio: t("profileScreenLan.writeNewBio"),
      save: t("profileScreenLan.save"),
      tagTitle: t("profileScreenLan.tagTitle"),
      tagSub: t("profileScreenLan.tagSub"),
      similarProfiles: t("profileScreenLan.similarProfiles"),
      similarProfilesSub: t("profileScreenLan.similarProfilesSub"),
      saveInterest: t("profileScreenLan.saveInterest"),
      saveInterestSub: t("profileScreenLan.saveInterestSub"),
      mediaSheetTitle: t("profileScreenLan.mediaSheetTitle"),
      mediaSheetSub: t("profileScreenLan.mediaSheetSub"),
      mediaSheetNote: t("profileScreenLan.mediaSheetNote"),
      moreTitle: t("profileScreenLan.moreTitle"),
      moreSub: t("profileScreenLan.moreSub"),
      messaging: t("profileScreenLan.messaging"),
      messagingSub: t("profileScreenLan.messagingSub"),
      friendship: t("profileScreenLan.friendship"),
      friendshipSub: t("profileScreenLan.friendshipSub"),
      reportAction: t("profileScreenLan.reportAction"),
      reportActionSub: t("profileScreenLan.reportActionSub"),
      blockActionSub: t("profileScreenLan.blockActionSub"),
      cannotMessageBlockedByThem: t("profileScreenLan.cannotMessageBlockedByThem"),
      cannotMessageBlockedByMe: t("profileScreenLan.cannotMessageBlockedByMe"),
      messageWillSendTo: t("profileScreenLan.messageWillSendTo", { name: "" }),
      cannotCommunicate: t("profileScreenLan.cannotCommunicate"),
      unblockFirstToMessage: t("profileScreenLan.unblockFirstToMessage"),
    }),
    [t]
  );

  const [tab, setTab] = useState<"about" | "posts" | "media">("about");
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [profileTweetsPage, setProfileTweetsPage] = useState(1);
  const profileUser = useSelector((s: RootState) => (s.user as any).profileUser) as ProfileUser | null;
  const loadingProfile = useSelector((s: RootState) => (s.user as any).loadingProfile);
  const errorProfile = useSelector((s: RootState) => (s.user as any).errorProfile);
  const searchResults = useSelector((s: RootState) => (s.friends as any).searchResults) as any[];
  const profileTweets = useSelector((s: RootState) => (s.tweets as any).profileTweets) as Tweet[];
  const loadingProfileTweets = useSelector((s: RootState) => (s.tweets as any).loadingProfileTweets) as boolean;
  const profileTweetsError = useSelector((s: RootState) => (s.tweets as any).profileTweetsError) as string | null;
  const profileTweetsHasMore = useSelector((s: RootState) => (s.tweets as any).profileTweetsHasMore) as boolean;
  const [rel, setRel] = useState<RelationshipStatus>("none");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchUserProfile(String(id)));
  }, [id, dispatch]);
  useEffect(() => {
    return () => {
      dispatch(clearProfileTweets());
    };
  }, [dispatch]);
  useEffect(() => {
    if (!id) return;

    setProfileTweetsPage(1);
    dispatch(clearProfileTweets());
    dispatch(getUserTweets({ userId: String(id), page: 1 }));
  }, [id, dispatch]);
  const loadMoreProfileTweets = () => {
    if (!id || loadingProfileTweets || !profileTweetsHasMore) return;

    const nextPage = profileTweetsPage + 1;
    setProfileTweetsPage(nextPage);
    dispatch(getUserTweets({ userId: String(id), page: nextPage }));
  };
  useEffect(() => {
    if (!profileUser?._id) return;

    const fromProfile = profileUser.relationshipStatus;
    if (fromProfile) {
      setRel(fromProfile);
    } else {
      const found = Array.isArray(searchResults)
        ? searchResults.find((x: any) => String(x?._id) === String(profileUser._id))
        : null;
      setRel((found?.relationshipStatus as RelationshipStatus) || "none");
    }

    setIsFollowing(!!(profileUser as any)?.isFollowing);
  }, [profileUser?._id, profileUser?.relationshipStatus, searchResults]);

  const user = profileUser;
  const closeSheet = () => setSheet(null);

  const blockedByMe = rel === "blocked_by_me";
  const blockedMe = rel === "blocked_me";
  const isBlocked = blockedByMe || blockedMe;
  const verified = Boolean(user?.isVerified);
  const lastActiveText = user?.isOnline ? copy.activeNow : copy.offline;
  const tags = Array.isArray(user?.tags) ? (user?.tags as string[]) : [];

  const openChat = async (targetUserId: string) => {
    if (creatingChatId) return;

    try {
      setCreatingChatId(targetUserId);
      const chat = await dispatch(createChat(targetUserId)).unwrap();
      dispatch(setActiveChat(chat._id));

      const messagesRes = await api.get(`/messages/${chat._id}?page=1`);
      dispatch(
        setMessages({
          chatId: chat._id,
          messages: messagesRes.data,
        })
      );

      router.push(`/chat/${chat._id}`);
    } catch (e: any) {
    } finally {
      setCreatingChatId(null);
    }
  };
  const formatTweetDate = (date?: string) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };
  const bioHtml = useMemo(() => {
    const raw = profileUser?.bio?.trim() ?? "";
    const html = raw
      ? (/<[a-z][\s\S]*>/i.test(raw) ? raw : `<p>${raw.replace(/\n/g, "<br/>")}</p>`)
      : `<p style="color:#94A3B8; font-size:16px; text-align:${isRTL ? "right" : "left"};">${copy.noBioYet}</p>`;

    return { html };
  }, [profileUser?.bio, copy.noBioYet, isRTL]);

  const doToggleFollow = () => {
    if (!user?._id) return;
    if (blockedMe) {
      closeSheet();
      return;
    }
    dispatch(toggleFollow(user._id));
    setIsFollowing((v) => !v);
    closeSheet();
  };

  const doFriendAction = () => {
    if (!user?._id) return;
    if (blockedMe) {
      closeSheet();
      return;
    }

    switch (rel) {
      case "none":
        dispatch(sendFriendRequest(user._id));
        setRel("pending_sent");
        break;
      case "pending_sent":
        dispatch(cancelFriendRequest(user._id));
        setRel("none");
        break;
      case "accepted":
      case "pending_received":
        break;
      case "blocked_by_me":
        dispatch(unblockUser(user._id));
        setRel("none");
        break;
      default:
        break;
    }

    closeSheet();
  };

  const doToggleBlock = () => {
    if (!user?._id) return;

    if (blockedMe) {
      closeSheet();
      return;
    }

    if (blockedByMe) {
      dispatch(unblockUser(user._id));
      setRel("none");
    } else {
      dispatch(blockUser(user._id));
      setRel("blocked_by_me");
    }

    closeSheet();
  };

  const doOpenChat = () => {
    if (!user?._id) return;
    if (isBlocked) {
      closeSheet();
      return;
    }
    openChat(user._id);
    closeSheet();
  };

  const doSubmitReport = () => {
    setReportReason("");
    setReportDetails("");
    closeSheet();
  };

  const doShare = () => closeSheet();

  const friendBtnLabel =
    rel === "accepted"
      ? copy.friends
      : rel === "pending_sent"
        ? copy.cancel
        : rel === "pending_received"
          ? copy.pending
          : rel === "blocked_by_me"
            ? copy.unblock
            : rel === "blocked_me"
              ? copy.blockedYou
              : copy.add;

  const friendBtnIcon: keyof typeof Ionicons.glyphMap =
    rel === "accepted"
      ? "checkmark-circle-outline"
      : rel === "pending_sent"
        ? "close-circle-outline"
        : rel === "pending_received"
          ? "time-outline"
          : rel === "blocked_by_me"
            ? "lock-open-outline"
            : rel === "blocked_me"
              ? "alert-circle-outline"
              : "person-add-outline";

  const friendBtnDisabled =
    rel === "accepted" || rel === "pending_received" || rel === "blocked_me";

  const friendBtnFilled = rel === "none" || rel === "accepted";
  const followLabel = isFollowing ? copy.following : copy.follow;
  const followIcon: keyof typeof Ionicons.glyphMap =
    isFollowing ? "person-remove-outline" : "person-add-outline";

  if (loadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: theme.textMuted, fontWeight: "700" }}>
            {copy.loadingProfile}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Ionicons name="alert-circle-outline" size={34} color="#EF4444" />
          <Text style={{ marginTop: 10, color: theme.text, fontWeight: "900", fontSize: 16 }}>
            {copy.profileLoadFailed}
          </Text>
          <Text style={{ marginTop: 6, color: theme.textMuted, fontWeight: "700", textAlign: "center" }}>
            {String(errorProfile)}
          </Text>

          <Pressable
            onPress={() => id && dispatch(fetchUserProfile(String(id)))}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginTop: 14 }]}
          >
            <View
              style={{
                paddingHorizontal: 14,
                height: 44,
                borderRadius: 14,
                backgroundColor: theme.tint,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>{copy.retry}</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.textMuted, fontWeight: "700" }}>{copy.noData}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.background }]} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ height: COVER_H, overflow: "visible", zIndex: 2, elevation: 2 }}>
          {user.coverImage ? (
            <Image source={{ uri: user.coverImage }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: theme.surface2 }]} />
          )}

          <View style={[styles.coverOverlay, { backgroundColor: "rgba(0,0,0,0.35)" }]} />
          <View style={[styles.coverOverlayBottom, { backgroundColor: "rgba(0,0,0,0.45)" }]} />

          <View style={styles.topBar}>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => router.back()}>
              <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color="#fff" />
              </View>
            </Pressable>

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => setSheet("share")}>
                <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </View>
              </Pressable>

              <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => setSheet("more")}>
                <View style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, { borderColor: theme.border, backgroundColor: theme.card }]}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
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

            {verified ? (
              <View style={[styles.verified, { backgroundColor: theme.tint }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.verifiedText}>{copy.verified}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ marginTop: AVATAR * 0.5 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {user.username}
                </Text>

                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <Text style={[styles.sub, { color: theme.textMuted }]}>{user.atUsername || ""}</Text>
                  <View style={[styles.dot, { backgroundColor: theme.border }]} />
                  <Text style={[styles.sub, { color: theme.textMuted }]}>{user.country || copy.unspecified}</Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <View style={[styles.activePill, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: blockedByMe ? "#EF4444" : user.isOnline ? "#22C55E" : "#94A3B8" },
                      ]}
                    />
                    <Text style={[styles.activeText, { color: theme.text }]}>
                      {blockedByMe ? copy.blockSheetBlockTitle : blockedMe ? copy.blockedYou : lastActiveText}
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

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginTop: 14 }}>
              <ActionBtn
                icon="chatbubble-ellipses-outline"
                label={copy.message}
                filled
                theme={theme}
                isDark={isDark}
                disabled={isBlocked || creatingChatId === user._id}
                onPress={() => setSheet("chat")}
                isRTL={isRTL}
              />
            </View>

            <View style={[styles.stats, { borderColor: theme.border }]}>
              <Stat label={copy.followers} value={formatNum(user.followersCount || 0)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label={copy.followingCount} value={formatNum(user.followingCount || 0)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label={copy.likes} value={formatNum(user.totalLikesReceived || 0)} theme={theme} />
              <View style={[styles.vSep, { backgroundColor: theme.border }]} />
              <Stat label={copy.views} value={formatNum(user.profileViews || 0)} theme={theme} />
            </View>

            {tags.length > 0 ? (
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {tags.slice(0, 10).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    icon="sparkles-outline"
                    bg={theme.surface2}
                    fg={theme.text}
                    onPress={() => setSheet("tag")}
                    isRTL={isRTL}
                  />
                ))}
              </View>
            ) : null}

            <View style={[styles.sectionCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <RenderHtml contentWidth={width - 32} source={bioHtml} enableCSSInlineProcessing />
            </View>

            <View style={[styles.segWrap, { borderColor: theme.border, backgroundColor: theme.surface2 }]}>
              <SegBtn label={copy.about} active={tab === "about"} onPress={() => setTab("about")} theme={theme} />
              <SegBtn label={copy.posts} active={tab === "posts"} onPress={() => setTab("posts")} theme={theme} />
              <SegBtn label={copy.media} active={tab === "media"} onPress={() => setTab("media")} theme={theme} />
            </View>

            {tab === "about" ? (
              <View style={{ marginTop: 12 }}>
                <View style={[styles.block, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>{copy.basicInfo}</Text>
                  <Row label={copy.username} value={user.atUsername || ""} icon="at-outline" theme={theme} isRTL={isRTL} />
                  <Row label={copy.country} value={user.country || copy.unspecified} icon="flag-outline" theme={theme} isRTL={isRTL} />
                </View>
              </View>
            ) : tab === "posts" ? (
              <View style={{ marginTop: 12 }}>
                {loadingProfileTweets && profileTweets.length === 0 ? (
                  <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <ActivityIndicator />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                      {copy.loadingProfile}
                    </Text>
                  </View>
                ) : profileTweetsError ? (
                  <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="alert-circle-outline" size={30} color="#EF4444" />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                      {copy.profileLoadFailed}
                    </Text>
                    <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                      {profileTweetsError}
                    </Text>

                    <Pressable
                      onPress={() => {
                        setProfileTweetsPage(1);
                        dispatch(clearProfileTweets());
                        dispatch(getUserTweets({ userId: String(id), page: 1 }));
                      }}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, marginTop: 12 }]}
                    >
                      <View
                        style={[
                          styles.loadMoreBtn,
                          {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                            paddingHorizontal: 18,
                          },
                        ]}
                      >
                        <Text style={[styles.loadMoreText, { color: theme.primaryText }]}>
                          {copy.retry}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                ) : profileTweets.length === 0 ? (
                  <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="newspaper-outline" size={30} color={theme.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>{copy.noPostsYet}</Text>
                    <Text style={[styles.emptySub, { color: theme.textMuted }]}>{copy.postsApiHint}</Text>
                  </View>
                ) : (
                  <>
                    {profileTweets.map((tweet) => {
                      const firstImage = tweet.media?.find((m) => m.type === "image")?.url;

                      return (
                        <View
                          key={tweet._id}
                          style={[
                            styles.tweetCard,
                            { backgroundColor: theme.card, borderColor: theme.border },
                          ]}
                        >
                          <View style={styles.tweetHeader}>
                            {tweet.author?.avatar ? (
                              <Image source={{ uri: tweet.author.avatar }} style={styles.tweetAvatar} />
                            ) : (
                              <View
                                style={[
                                  styles.tweetAvatar,
                                  {
                                    backgroundColor: theme.surface2,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  },
                                ]}
                              >
                                <Ionicons name="person" size={20} color={theme.textMuted} />
                              </View>
                            )}

                            <View style={styles.tweetUserInfo}>
                              <Text style={[styles.tweetName, { color: theme.text }]} numberOfLines={1}>
                                {tweet.author?.username || user.username}
                              </Text>
                              <Text style={[styles.tweetMeta, { color: theme.textMuted }]} numberOfLines={1}>
                                {tweet.author?.atUsername || ""} {formatTweetDate(tweet.createdAt)}
                              </Text>
                            </View>
                          </View>

                          {!!tweet.content && (
                            <Text style={[styles.tweetContent, { color: theme.text }]}>
                              {tweet.content}
                            </Text>
                          )}

                          {!!firstImage && (
                            <Image source={{ uri: firstImage }} style={styles.tweetMediaImage} resizeMode="cover" />
                          )}

                          <View style={styles.tweetStatsRow}>
                            <View
                              style={[
                                styles.tweetStatPill,
                                { backgroundColor: theme.surface2, borderColor: theme.border },
                              ]}
                            >
                              <Ionicons name="heart-outline" size={16} color={theme.textMuted} />
                              <Text style={{ color: theme.text, fontWeight: "800", fontSize: 12 }}>
                                {formatNum(tweet.likesCount || 0)}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.tweetStatPill,
                                { backgroundColor: theme.surface2, borderColor: theme.border },
                              ]}
                            >
                              <Ionicons name="repeat-outline" size={16} color={theme.textMuted} />
                              <Text style={{ color: theme.text, fontWeight: "800", fontSize: 12 }}>
                                {formatNum(tweet.retweetsCount || 0)}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.tweetStatPill,
                                { backgroundColor: theme.surface2, borderColor: theme.border },
                              ]}
                            >
                              <Ionicons name="chatbubble-outline" size={16} color={theme.textMuted} />
                              <Text style={{ color: theme.text, fontWeight: "800", fontSize: 12 }}>
                                {formatNum(tweet.repliesCount || 0)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}

                    {profileTweetsHasMore ? (
                      <Pressable
                        onPress={loadMoreProfileTweets}
                        disabled={loadingProfileTweets}
                        style={({ pressed }) => [{ opacity: loadingProfileTweets ? 0.6 : pressed ? 0.9 : 1 }]}
                      >
                        <View
                          style={[
                            styles.loadMoreBtn,
                            {
                              backgroundColor: theme.surface2,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          {loadingProfileTweets ? (
                            <ActivityIndicator />
                          ) : (
                            <Text style={[styles.loadMoreText, { color: theme.text }]}>
                              {language === "ar" ? "عرض المزيد" : "Load more"}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    ) : null}
                  </>
                )}
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <View style={styles.mediaGrid}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Pressable key={i} onPress={() => setSheet("media")} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                      <View style={[styles.mediaBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="image-outline" size={22} color={theme.textMuted} />
                        <Text style={[styles.mediaText, { color: theme.textMuted }]}>{copy.mediaLabel}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                <Text style={[styles.mediaHint, { color: theme.textMuted }]}>{copy.mediaPrivacyHint}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.footer, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} />
          <Text style={[styles.footerText, { color: theme.textMuted }]}>{copy.footerNote}</Text>
        </View>
      </ScrollView>

      <Sheet
        visible={sheet === "chat"}
        title={copy.startChat}
        subtitle={
          isBlocked
            ? blockedMe
              ? copy.cannotMessageBlockedByThem
              : copy.cannotMessageBlockedByMe
            : t("profileScreenLan.messageWillSendTo", { name: user.username })
        }
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        {isBlocked ? (
          <View style={{ borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: rgba("#EF4444", 0.10), borderColor: rgba("#EF4444", 0.25) }}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left" }}>
              {blockedMe ? copy.cannotCommunicate : copy.unblockFirstToMessage}
            </Text>
          </View>
        ) : (
          <>
            <View style={{ borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: theme.surface2, borderColor: theme.border }}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.textMuted} />
              <Text style={{ fontSize: 13.5, fontWeight: "800", color: theme.textMuted, textAlign: isRTL ? "right" : "left" }}>{copy.typeFirstMessage}</Text>
            </View>

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginTop: 12 }}>
              <PrimaryBtn label={copy.startChatNow} icon="paper-plane-outline" theme={theme} onPress={doOpenChat} isRTL={isRTL} />
              <GhostBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
            </View>
          </>
        )}
      </Sheet>

      <Sheet
        visible={sheet === "friend"}
        title={
          rel === "accepted"
            ? copy.friendSheetAcceptedTitle
            : rel === "pending_sent"
              ? copy.friendSheetPendingSentTitle
              : rel === "pending_received"
                ? copy.friendSheetPendingReceivedTitle
                : rel === "blocked_by_me"
                  ? copy.friendSheetBlockedByMeTitle
                  : rel === "blocked_me"
                    ? copy.friendSheetBlockedMeTitle
                    : copy.friendSheetAddTitle
        }
        subtitle={
          rel === "accepted"
            ? copy.friendSheetAcceptedSub
            : rel === "pending_sent"
              ? copy.friendSheetPendingSentSub
              : rel === "pending_received"
                ? copy.friendSheetPendingReceivedSub
                : rel === "blocked_by_me"
                  ? copy.friendSheetBlockedByMeSub
                  : rel === "blocked_me"
                    ? copy.friendSheetBlockedMeSub
                    : copy.friendSheetAddSub
        }
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
          <PrimaryBtn label={friendBtnLabel} icon={friendBtnIcon} theme={theme} onPress={doFriendAction} isRTL={isRTL} />
          <GhostBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "follow"}
        title={isFollowing ? copy.followSheetFollowingTitle : copy.followSheetFollowTitle}
        subtitle={
          blockedMe
            ? copy.followSheetBlockedSub
            : isFollowing
              ? copy.followSheetFollowingSub
              : copy.followSheetFollowSub
        }
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
          <PrimaryBtn label={followLabel} icon={followIcon} theme={theme} onPress={doToggleFollow} isRTL={isRTL} />
          <GhostBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "block"}
        title={blockedByMe ? copy.blockSheetUnblockTitle : blockedMe ? copy.blockSheetBlockedTitle : copy.blockSheetBlockTitle}
        subtitle={
          blockedMe
            ? copy.blockSheetBlockedMeSub
            : blockedByMe
              ? copy.blockSheetUnblockSub
              : copy.blockSheetBlockSub
        }
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        {blockedMe ? (
          <View style={{ borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: rgba("#EF4444", 0.08), borderColor: rgba("#EF4444", 0.20) }}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left" }}>
              {copy.blockNoteBlockedMe}
            </Text>
          </View>
        ) : (
          <>
            <View style={{ borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: rgba("#EF4444", 0.08), borderColor: rgba("#EF4444", 0.20) }}>
              <Ionicons name="lock-closed-outline" size={18} color="#EF4444" />
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left" }}>
                {blockedByMe ? copy.blockNoteUnblock : copy.blockNoteBlock}
              </Text>
            </View>

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginTop: 12 }}>
              <PrimaryBtn
                label={blockedByMe ? copy.unblock : copy.confirmBlock}
                icon={blockedByMe ? "lock-open-outline" : "lock-closed-outline"}
                theme={theme}
                onPress={doToggleBlock}
                isRTL={isRTL}
              />
              <GhostBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
            </View>
          </>
        )}
      </Sheet>

      <Sheet
        visible={sheet === "report"}
        title={copy.reportTitle}
        subtitle={copy.reportSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <View style={{ borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: theme.surface2, borderColor: theme.border }}>
            <Ionicons name="warning-outline" size={18} color={theme.textMuted} />
            <TextInput
              placeholder={copy.reportReason}
              placeholderTextColor={theme.textMuted}
              value={reportReason}
              onChangeText={setReportReason}
              style={{ flex: 1, fontSize: 13.5, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }}
            />
          </View>

          <View style={{ borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.surface2, borderColor: theme.border }}>
            <TextInput
              placeholder={copy.reportDetails}
              placeholderTextColor={theme.textMuted}
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              style={{ minHeight: 86, textAlignVertical: "top", fontSize: 13.5, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }}
            />
          </View>

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
            <PrimaryBtn label={copy.send} icon="paper-plane-outline" theme={theme} onPress={doSubmitReport} isRTL={isRTL} />
            <GhostBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
          </View>
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "share"}
        title={copy.shareTitle}
        subtitle={copy.shareSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="link-outline" title={copy.copyLink} subtitle={copy.copyLinkSub} theme={theme} onPress={doShare} isRTL={isRTL} />
          <SheetItem icon="paper-plane-outline" title={copy.sendToFriend} subtitle={copy.sendToFriendSub} theme={theme} onPress={doShare} isRTL={isRTL} />
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "editBio"}
        title={copy.editBioTitle}
        subtitle={copy.editBioSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <View style={{ borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.surface2, borderColor: theme.border }}>
            <TextInput
              placeholder={copy.writeNewBio}
              placeholderTextColor={theme.textMuted}
              multiline
              defaultValue={user.bio || ""}
              style={{ minHeight: 86, textAlignVertical: "top", fontSize: 13.5, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }}
            />
          </View>

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
            <PrimaryBtn label={copy.save} icon="checkmark-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
            <GhostBtn label={copy.cancel} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
          </View>
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "tag"}
        title={copy.tagTitle}
        subtitle={copy.tagSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon="search-outline" title={copy.similarProfiles} subtitle={copy.similarProfilesSub} theme={theme} onPress={closeSheet} isRTL={isRTL} />
          <SheetItem icon="bookmark-outline" title={copy.saveInterest} subtitle={copy.saveInterestSub} theme={theme} onPress={closeSheet} isRTL={isRTL} />
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "media"}
        title={copy.mediaSheetTitle}
        subtitle={copy.mediaSheetSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <View style={{ borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: isRTL ? "row-reverse" : "row", gap: 10, alignItems: "center", backgroundColor: theme.surface2, borderColor: theme.border }}>
            <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800", color: theme.text, textAlign: isRTL ? "right" : "left" }}>
              {copy.mediaSheetNote}
            </Text>
          </View>

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
            <PrimaryBtn label={copy.close} icon="close-outline" theme={theme} onPress={closeSheet} isRTL={isRTL} />
          </View>
        </View>
      </Sheet>

      <Sheet
        visible={sheet === "more"}
        title={copy.moreTitle}
        subtitle={copy.moreSub}
        theme={theme}
        onClose={closeSheet}
        isRTL={isRTL}
        closeLabel={copy.close}
      >
        <View style={{ gap: 10 }}>
          <SheetItem icon={followIcon} title={followLabel} subtitle={copy.followSheetFollowSub} theme={theme} onPress={() => setSheet("follow")} isRTL={isRTL} />
          <SheetItem icon="chatbubble-ellipses-outline" title={copy.messaging} subtitle={copy.messagingSub} theme={theme} onPress={() => setSheet("chat")} isRTL={isRTL} />
          <SheetItem icon="person-add-outline" title={copy.friendship} subtitle={copy.friendshipSub} theme={theme} onPress={() => setSheet("friend")} isRTL={isRTL} />
          <SheetItem icon="flag-outline" title={copy.reportAction} subtitle={copy.reportActionSub} theme={theme} onPress={() => setSheet("report")} isRTL={isRTL} />
          <SheetItem
            icon={blockedByMe ? "lock-open-outline" : "lock-closed-outline"}
            title={blockedByMe ? copy.unblock : blockedMe ? copy.blockedYou : copy.blockSheetBlockTitle}
            subtitle={copy.blockActionSub}
            theme={theme}
            danger={!blockedByMe && !blockedMe}
            onPress={() => setSheet("block")}
            isRTL={isRTL}
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}