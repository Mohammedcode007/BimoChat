import LottieBadge from "@/components/LottieBadge";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { UserBadgeUI } from "./types";

type BadgeKey = string;

const BADGE_META: Record<
  BadgeKey,
  {
    label?: string;
    iconType?: "emoji" | "ion";
    icon?: string;
    bg: string;
    fg: string;
  }
> = {
  gold: {
    label: "GOLD",
    iconType: "emoji",
    icon: "🏅",
    bg: "#FEF3C7",
    fg: "#92400E",
  },
  blue: {
    label: "",
    iconType: "ion",
    icon: "checkmark-circle",
    bg: "transparent",
    fg: "#1DA1F2",
  },
  business: {
    label: "BUSINESS",
    iconType: "emoji",
    icon: "🏢",
    bg: "#E5E7EB",
    fg: "#111827",
  },
  vip: {
    label: "VIP",
    iconType: "emoji",
    icon: "💎",
    bg: "#EDE9FE",
    fg: "#5B21B6",
  },
  pro: {
    label: "PRO",
    iconType: "emoji",
    icon: "⚡",
    bg: "#DCFCE7",
    fg: "#166534",
  },
};

const sStatic = StyleSheet.create({
  badgePillStatic: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 6,
  },
});

const getItemImageUrl = (item: any): string => {
  const direct =
    String(item?.iconUrl || "") ||
    String(item?.coverUrl || "") ||
    String(item?.previewUrl || "");

  if (direct) return direct;

  const meta = item?.meta || {};

  return (
    String(meta?.iconUrl || "") ||
    String(meta?.coverUrl || "") ||
    String(meta?.previewUrl || "")
  );
};

const normalizeBadgeKey = (v: any) => String(v || "").trim().toLowerCase();

const dedupeBadges = (badges?: UserBadgeUI[]) => {
  const arr = Array.isArray(badges) ? badges : [];
  const out: UserBadgeUI[] = [];
  const seen = new Set<string>();

  for (const b of arr) {
    const key = normalizeBadgeKey(b?.key);

    if (!key || seen.has(key)) continue;

    seen.add(key);

    out.push({
      key,
      name: b?.name,
      lottieUrl: b?.lottieUrl,
      iconUrl: b?.iconUrl,
      emoji: b?.emoji,
    });
  }

  return out;
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

const buildTweetBadgesFromAuthor = (author: any): UserBadgeUI[] => {
  const rawBadges =
    author?.displayBadgesDetailed ||
    author?.activeBadgesDetailed ||
    author?.activeCustomization?.badgesDetailed ||
    author?.badgesDetailed ||
    [];

  if (Array.isArray(rawBadges) && rawBadges.length) {
    return dedupeBadges(
      rawBadges.map((b: any) => ({
        key: String(b?.key || b?.itemKey || "").trim(),
        name: b?.name,
        lottieUrl: String(b?.lottieUrl || b?.meta?.lottieUrl || ""),
        iconUrl: getItemImageUrl(b),
        emoji: String(b?.emoji || b?.meta?.emoji || ""),
      }))
    );
  }

  const plainKeys =
    author?.displayBadges ??
    author?.activeCustomization?.badges ??
    author?.badges ??
    [];

  return dedupeBadges(
    (Array.isArray(plainKeys) ? plainKeys : []).map((key: string) => ({
      key: String(key || "").trim(),
    }))
  );
};

function DynamicUserBadge({
  badge,
  size = 16,
}: {
  badge?: UserBadgeUI | null;
  size?: number;
}) {
  if (!badge?.key) return null;

  if (badge.lottieUrl) {
    return (
      <View
        style={{
          marginLeft: 6,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieBadge url={badge.lottieUrl} size={size} />
      </View>
    );
  }

  if (badge.iconUrl) {
    return (
      <Image
        source={{ uri: badge.iconUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: 6,
        }}
        resizeMode="contain"
      />
    );
  }

  if (badge.emoji) {
    return (
      <View style={{ marginLeft: 6 }}>
        <Text style={{ fontSize: size - 1 }}>{badge.emoji}</Text>
      </View>
    );
  }

  const meta = BADGE_META[badge.key];

  if (!meta) return null;

  if (badge.key === "blue") {
    return (
      <Ionicons
        name="checkmark-circle"
        size={14}
        color="#1DA1F2"
        style={{ marginLeft: 6 }}
      />
    );
  }

  return (
    <View
      style={[
        sStatic.badgePillStatic,
        {
          backgroundColor: meta.bg,
          borderColor: "rgba(0,0,0,0.06)",
        },
      ]}
    >
      {!!meta.icon && (
        <Text style={{ marginRight: meta.label ? 4 : 0 }}>{meta.icon}</Text>
      )}

      {!!meta.label && (
        <Text style={{ fontSize: 10, fontWeight: "900", color: meta.fg }}>
          {meta.label}
        </Text>
      )}
    </View>
  );
}

function CustomEmojiBadgeView({
  badge,
}: {
  badge?: { emoji?: string; isActive?: boolean; expiresAt?: string | null } | null;
}) {
  if (!isCustomEmojiBadgeActive(badge)) return null;

  return (
    <View style={{ marginLeft: 6, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22 }}>{badge?.emoji}</Text>
    </View>
  );
}

export function UserBadges({ author, s }: { author: any; s: any }) {
  const verificationType: string =
    author?.displayVerificationType ??
    author?.activeCustomization?.verificationType ??
    author?.verificationType ??
    "none";

  const dynamicBadges = buildTweetBadgesFromAuthor(author);

  const verificationBadge =
    verificationType && verificationType !== "none"
      ? [{ key: verificationType }]
      : [];

  const merged = dedupeBadges([...verificationBadge, ...dynamicBadges]);

  const customEmojiBadge =
    author?.customEmojiBadge ||
    author?.displayCustomEmojiBadge ||
    null;

  if (!merged.length && !isCustomEmojiBadgeActive(customEmojiBadge)) return null;

  return (
    <View style={s.badgesWrap}>
      <CustomEmojiBadgeView badge={customEmojiBadge} />

      {merged.map((badge) => (
        <DynamicUserBadge
          key={badge.key}
          badge={badge}
          size={25}
        />
      ))}
    </View>
  );
}