// components/roomScreen/badgeHelpers.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import LottieBadge from "@/components/LottieBadge";

import { BADGE_META } from "./constants";
import { UserBadgeUI } from "./types";

/**
 * استخراج صورة العنصر من بيانات المتجر.
 * يدعم:
 * - iconUrl
 * - coverUrl
 * - previewUrl
 * - meta.iconUrl
 * - meta.coverUrl
 * - meta.previewUrl
 */
export const getItemImageUrl = (item: any): string => {
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

export const normalizeBadgeKey = (value: any) => {
  return String(value || "").trim().toLowerCase();
};

/**
 * تنظيف قائمة البادجات ومنع التكرار.
 */
export const dedupeBadges = (badges?: UserBadgeUI[]) => {
  const arr = Array.isArray(badges) ? badges : [];
  const out: UserBadgeUI[] = [];
  const seen = new Set<string>();

  for (const badge of arr) {
    const key = normalizeBadgeKey(badge?.key);

    if (!key || seen.has(key)) continue;

    seen.add(key);

    out.push({
      key,
      name: badge?.name,
      lottieUrl: badge?.lottieUrl,
      iconUrl: badge?.iconUrl,
      emoji: badge?.emoji,
    });
  }

  return out;
};

/**
 * اختيار أول بادج فعّال لعرضه بجانب الاسم.
 */
export const pickPrimaryBadge = (badges?: UserBadgeUI[]) => {
  const list = dedupeBadges(badges);

  if (!list.length) return null;

  return list[0];
};

/**
 * تحويل نوع التوثيق إلى badge key.
 */
export const verificationToBadge = (verificationType?: string) => {
  const value = String(verificationType || "").trim().toLowerCase();

  if (!value || value === "none") return null;

  return value;
};

/**
 * بناء activeBadges من بيانات المستخدم أو inventory.
 */
export const buildActiveBadgesFromUser = (
  user: any,
  fallbackInventory?: any[]
): UserBadgeUI[] => {
  if (Array.isArray(user?.activeBadges) && user.activeBadges.length) {
    return dedupeBadges(user.activeBadges);
  }

  const activeKeys = Array.isArray(user?.activeCustomization?.badges)
    ? user.activeCustomization.badges
        .map((x: any) => String(x || "").trim())
        .filter(Boolean)
    : [];

  const verificationBadge = verificationToBadge(
    user?.verificationType || user?.activeCustomization?.verificationType
  );

  if (verificationBadge && !activeKeys.includes(verificationBadge)) {
    activeKeys.unshift(verificationBadge);
  }

  const inventory = Array.isArray(user?.inventory)
    ? user.inventory
    : Array.isArray(fallbackInventory)
      ? fallbackInventory
      : [];

  const out: UserBadgeUI[] = [];

  for (const key of activeKeys) {
    const normalizedKey = String(key || "").trim();

    if (!normalizedKey) continue;

    const invRow = inventory.find((row: any) => {
      const itemType = String(row?.itemType || "").trim();
      const itemKey = String(row?.itemKey || "").trim();

      return itemType === "badge" && itemKey === normalizedKey;
    });

    const item = invRow?.item || invRow?.storeItem || null;
    const meta = item?.meta || invRow?.meta || {};

    const fallbackMeta = BADGE_META[normalizedKey];

    out.push({
      key: normalizedKey,
      name: item?.name || fallbackMeta?.label || normalizedKey,
      lottieUrl: String(meta?.lottieUrl || item?.lottieUrl || ""),
      iconUrl: getItemImageUrl(item) || String(meta?.iconUrl || ""),
      emoji: String(meta?.emoji || fallbackMeta?.icon || ""),
    });
  }

  return dedupeBadges(out);
};

/**
 * فحص بادج الإيموجي المخصص.
 */
export const isCustomEmojiBadgeActive = (
  badge?: {
    emoji?: string;
    isActive?: boolean;
    expiresAt?: string | null;
  } | null
) => {
  if (!badge?.emoji) return false;

  if (!badge?.isActive) return false;

  if (badge?.expiresAt) {
    const expiresAt = new Date(badge.expiresAt).getTime();

    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      return false;
    }
  }

  return true;
};

/**
 * عرض بادج ديناميكي:
 * - Lottie
 * - صورة
 * - Emoji
 */
export function DynamicUserBadge({
  badge,
  size = 35,
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
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    );
  }

  if (badge.emoji) {
    return (
      <View
        style={{
          marginLeft: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: Math.max(10, size - 2) }}>{badge.emoji}</Text>
      </View>
    );
  }

  return null;
}

/**
 * بادج الاسم القديم.
 * مهم: blue يعرض علامة التوثيق Ionicons.
 */
export function NameBadge({ badgeKey }: { badgeKey?: string | null }) {
  if (!badgeKey) return null;

  const key = normalizeBadgeKey(badgeKey);
  const meta = BADGE_META[key];

  if (!meta) return null;

  if (key === "blue") {
    return (
      <Ionicons
        name="checkmark-circle"
        size={16}
        color="#1DA1F2"
        style={{ marginLeft: 6 }}
      />
    );
  }

  return (
    <View
      style={[
        nameBadgeStyles.badge,
        {
          backgroundColor: meta.bg,
        },
      ]}
    >
      {!!meta.icon && (
        <Text
          style={[
            nameBadgeStyles.icon,
            {
              color: meta.fg,
            },
          ]}
        >
          {meta.icon}
        </Text>
      )}
    </View>
  );
}

/**
 * عرض بادج الإيموجي المخصص.
 */
export function CustomEmojiBadgeView({
  badge,
}: {
  badge?: {
    emoji?: string;
    isActive?: boolean;
    expiresAt?: string | null;
  } | null;
}) {
  if (!isCustomEmojiBadgeActive(badge)) return null;

  return (
    <View
      style={{
        marginLeft: 3,
        marginRight:6,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 25 }}>{badge?.emoji}</Text>
    </View>
  );
}

/**
 * عرض أكثر من بادج بجانب الاسم.
 */
export function UserBadgesRow({
  badges,
  customEmojiBadge,
  max = 3,
  size = 22,
}: {
  badges?: UserBadgeUI[];
  customEmojiBadge?: {
    emoji?: string;
    isActive?: boolean;
    expiresAt?: string | null;
  } | null;
  max?: number;
  size?: number;
}) {
  const list = dedupeBadges(badges).slice(0, max);

  if (!list.length && !isCustomEmojiBadgeActive(customEmojiBadge)) {
    return null;
  }

  return (
    <View style={nameBadgeStyles.row}>
      <CustomEmojiBadgeView badge={customEmojiBadge} />

      {list.map((badge) => (
        <DynamicUserBadge key={badge.key} badge={badge} size={size} />
      ))}
    </View>
  );
}

const nameBadgeStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
  },

  icon: {
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});