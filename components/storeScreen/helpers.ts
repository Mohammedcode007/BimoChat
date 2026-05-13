import { AppTheme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoreType, StoreVisualTone } from "./types";

export function formatCoinz(value: number) {
  const n = Number(value || 0);
  return Math.round(Number.isFinite(n) ? n : 0).toLocaleString();
}

export function formatMoney(value: number) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

export function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString();
}

export function getItemImageUrl(item: any): string {
  const meta = item?.meta || {};

  return (
    String(item?.iconUrl || "").trim() ||
    String(item?.coverUrl || "").trim() ||
    String(item?.previewUrl || "").trim() ||
    String(meta?.iconUrl || "").trim() ||
    String(meta?.coverUrl || "").trim() ||
    String(meta?.previewUrl || "").trim()
  );
}

export function prettyType(type: string, tr: (key: string) => string) {
  switch (type) {
    case "avatarFrame":
      return tr("storeScreen.prettyType.avatarFrame");
    case "avatarGif":
      return tr("storeScreen.prettyType.avatarGif");
    case "usernameColor":
      return tr("storeScreen.prettyType.usernameColor");
    case "messageTextColor":
      return tr("storeScreen.prettyType.messageTextColor");
    case "badge":
      return tr("storeScreen.prettyType.badge");
    case "messageEffect":
      return tr("storeScreen.prettyType.messageEffect");
    case "gift":
      return tr("storeScreen.prettyType.gift");
    case "profileEntryAnimation":
      return tr("storeScreen.prettyType.profileEntryAnimation");
    case "verification":
      return tr("storeScreen.prettyType.verification");
    default:
      return type || tr("storeScreen.prettyType.item");
  }
}

export function getStoreToneColors(theme: AppTheme, tone: StoreVisualTone) {
  const map: Record<StoreVisualTone, { bg: string; soft: string; fg: string }> = {
    gold: { bg: "#F59E0B", soft: "#F59E0B22", fg: "#F59E0B" },
    violet: { bg: "#8B5CF6", soft: "#8B5CF622", fg: "#8B5CF6" },
    blue: { bg: "#3B82F6", soft: "#3B82F622", fg: "#3B82F6" },
    green: { bg: "#10B981", soft: "#10B98122", fg: "#10B981" },
    rose: { bg: "#F43F5E", soft: "#F43F5E22", fg: "#F43F5E" },
    cyan: { bg: "#06B6D4", soft: "#06B6D422", fg: "#06B6D4" },
    orange: { bg: "#F97316", soft: "#F9731622", fg: "#F97316" },
    neutral: { bg: theme.primary, soft: theme.surface2, fg: theme.text },
  };

  return map[tone] || map.neutral;
}

export function getCategoryVisual(type: StoreType): {
  icon: keyof typeof Ionicons.glyphMap;
  tone: StoreVisualTone;
} {
  switch (type) {
    case "avatarFrame":
      return { icon: "sparkles", tone: "violet" };
    case "avatarGif":
      return { icon: "image", tone: "cyan" };
    case "usernameColor":
      return { icon: "color-palette", tone: "blue" };
    case "messageTextColor":
      return { icon: "chatbubble-ellipses", tone: "green" };
    case "badge":
      return { icon: "ribbon", tone: "gold" };
    case "messageEffect":
      return { icon: "flash", tone: "orange" };
    case "profileEntryAnimation":
      return { icon: "planet", tone: "rose" };
    case "verification":
      return { icon: "shield-checkmark", tone: "blue" };
    case "gift":
      return { icon: "gift", tone: "rose" };
    default:
      return { icon: "bag", tone: "neutral" };
  }
}

export function getStoreStats(my: any): {
  balance: number;
  monthReceivedCoinz: number;
  monthSpentCoinz: number;
  monthReceivedGifts: number;
  monthSentGifts: number;
  earningsUsd: number;
} {
  return {
    balance: Number(my?.coinzBalance || 0),

    monthReceivedCoinz: Number(
      my?.monthlyStats?.receivedCoinz ??
        my?.stats?.monthReceivedCoinz ??
        my?.receivedCoinzThisMonth ??
        0
    ),

    monthSpentCoinz: Number(
      my?.monthlyStats?.spentCoinz ??
        my?.stats?.monthSpentCoinz ??
        my?.spentCoinzThisMonth ??
        0
    ),

    monthReceivedGifts: Number(
      my?.monthlyStats?.receivedGifts ??
        my?.stats?.monthReceivedGifts ??
        my?.receivedGiftsThisMonth ??
        0
    ),

    monthSentGifts: Number(
      my?.monthlyStats?.sentGifts ??
        my?.stats?.monthSentGifts ??
        my?.sentGiftsThisMonth ??
        0
    ),

    earningsUsd: Number(
      my?.earnings?.usd ??
        my?.stats?.earningsUsd ??
        my?.earningsUsd ??
        0
    ),
  };
}