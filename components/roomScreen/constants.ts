// components/roomScreen/constants.ts

import { Reaction, RoomRole } from "./types";

export const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export const ROLE_STAR_COLOR: Record<RoomRole, string> = {
  creator: "#F59E0B", // منشئ الغرفة - ذهبي/برتقالي
  owner: "#EF4444", // Owner - أحمر
  admin: "#2563EB", // Admin - أزرق
  member: "#16A34A", // Member - أخضر
};

export const BADGE_ORDER: string[] = ["gold", "blue", "business", "vip", "pro"];

export const BADGE_META: Record<
  string,
  {
    label: string;
    icon?: string;
    bg: string;
    fg: string;
  }
> = {
  gold: {
    label: "GOLD",
    icon: "🏅",
    bg: "#FEF3C7",
    fg: "#92400E",
  },

  blue: {
    label: "",
    icon: "twitter-verified",
    bg: "transparent",
    fg: "#1DA1F2",
  },

  business: {
    label: "BUSINESS",
    icon: "🏢",
    bg: "#E5E7EB",
    fg: "#111827",
  },

  vip: {
    label: "VIP",
    icon: "💎",
    bg: "#EDE9FE",
    fg: "#5B21B6",
  },

  pro: {
    label: "PRO",
    icon: "⚡",
    bg: "#DCFCE7",
    fg: "#166534",
  },
};

export const DEFAULT_AVATAR_URL =
  "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg";

export const ROLE_ORDER: Record<string, number> = {
  creator: 0,
  owner: 1,
  admin: 2,
  member: 3,
};

export const ROOM_MESSAGE_PAGE_SIZE = 50;

export const UPLOAD_OVERLAY_SECONDS = 3;

export const PRIVATE_MENTION_SUCCESS_TEXT = "Private message sent";

export const PRIVATE_MENTION_FAILED_TEXT = "Private message failed";

export const BOMB_COLORS = ["red", "green", "blue"] as const;

export const BOMB_COLOR_LABELS: Record<
  "red" | "green" | "blue",
  {
    label: string;
    ar: string;
    emoji: string;
    color: string;
  }
> = {
  red: {
    label: "Red",
    ar: "أحمر",
    emoji: "🔴",
    color: "#EF4444",
  },

  green: {
    label: "Green",
    ar: "أخضر",
    emoji: "🟢",
    color: "#22C55E",
  },

  blue: {
    label: "Blue",
    ar: "أزرق",
    emoji: "🔵",
    color: "#2563EB",
  },
};

export const GAME_TYPES = {
  CRICKET: "cricket",
  LUCK: "luck",
  DUEL: "duel",
  BOMB: "bomb",
} as const;

export const SYSTEM_TYPES = {
  JOIN: "join",
  LEAVE: "leave",
  ANNOUNCEMENT: "announcement",
  PROMOTION: "promotion",
  BAN: "ban",
  ROLE: "role",
  MUSIC: "music",
} as const;

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  AUDIO: "audio",
  VIDEO: "video",
  SYSTEM: "system",
  GIFT: "gift",
  SONG: "song",
  GAME: "game",
} as const;