// components/roomScreen/helpers.ts

import { DEFAULT_AVATAR_URL, ROLE_STAR_COLOR } from "./constants";
import { RoomRole, UserUI } from "./types";

export const normalizeString = (value: any) => {
  return String(value || "").trim();
};

export const normalizeLowerString = (value: any) => {
  return String(value || "").trim().toLowerCase();
};

export const resolveUsernameColor = (
  u?: Partial<UserUI> & { activeCustomization?: any } | null
) => {
  const color = normalizeString(
    (u as any)?.usernameColor ||
      (u as any)?.activeCustomization?.usernameColor ||
      ""
  );

  return color || undefined;
};

export const resolveMessageTextColor = (
  u?: Partial<UserUI> & { activeCustomization?: any } | null
) => {
  const color = normalizeString(
    (u as any)?.messageTextColor ||
      (u as any)?.activeCustomization?.messageTextColor ||
      ""
  );

  return color || undefined;
};

export const resolveAvatarSource = (
  u?: Partial<UserUI> & { activeCustomization?: any } | null
) => {
  const gif = normalizeString(
    (u as any)?.avatarGif ||
      (u as any)?.activeCustomization?.avatarGif ||
      ""
  );

  const avatar = normalizeString((u as any)?.avatar || "");

  return gif || avatar || DEFAULT_AVATAR_URL;
};

export const shouldShowStar = (role?: RoomRole) => {
  return (
    role === "creator" ||
    role === "owner" ||
    role === "admin" ||
    role === "member"
  );
};

export const getStarColor = (role?: RoomRole) => {
  if (!role) return "#16A34A";
  return ROLE_STAR_COLOR[role] || "#16A34A";
};

export const getRoleColor = (role?: RoomRole) => {
  if (role === "creator") return "#FF8C00";
  if (role === "owner") return "#FF0000";
  if (role === "admin") return "#1D4ED8";
  return "#16A34A";
};

export const isSameId = (a?: any, b?: any) => {
  const aa = normalizeString(a);
  const bb = normalizeString(b);

  if (!aa || !bb) return false;

  return aa === bb;
};

export const getSafeUserName = (u?: Partial<UserUI> | null) => {
  return normalizeString(
    (u as any)?.name ||
      (u as any)?.username ||
      (u as any)?.displayName ||
      (u as any)?.atUsername ||
      "مستخدم"
  );
};

export const getSafeUserId = (u?: Partial<UserUI> | any) => {
  return normalizeString(
    (u as any)?.id ||
      (u as any)?._id ||
      (u as any)?.userId ||
      (u as any)?.senderId ||
      ""
  );
};

export const normalizeUserRole = (role?: any): RoomRole => {
  const r = normalizeLowerString(role);

  if (r === "creator") return "creator";
  if (r === "owner") return "owner";
  if (r === "admin") return "admin";

  return "member";
};

export const isRoomManagerRole = (role?: RoomRole) => {
  return role === "creator" || role === "owner" || role === "admin";
};

export const canManageRoomUser = ({
  myRole,
  isMe,
}: {
  myRole?: RoomRole;
  isMe?: boolean;
}) => {
  if (isMe) return false;
  return isRoomManagerRole(myRole);
};

export const getFileNameFromUri = (uri?: string) => {
  const value = normalizeString(uri);

  if (!value) return "file";

  try {
    const clean = value.split("?")[0] || value;
    const parts = clean.split("/");
    return parts[parts.length - 1] || "file";
  } catch {
    return "file";
  }
};

export const isImageMime = (mime?: string) => {
  return normalizeLowerString(mime).startsWith("image/");
};

export const isVideoMime = (mime?: string) => {
  return normalizeLowerString(mime).startsWith("video/");
};

export const isAudioMime = (mime?: string) => {
  return normalizeLowerString(mime).startsWith("audio/");
};

export const isGifMime = (mime?: string) => {
  const m = normalizeLowerString(mime);
  return m === "image/gif" || m.includes("gif");
};

export const isGifUri = (uri?: string) => {
  const value = normalizeLowerString(uri);
  return value.includes(".gif") || value.includes("image/gif");
};

export const isProbablyGif = ({
  uri,
  mime,
}: {
  uri?: string;
  mime?: string;
}) => {
  return isGifMime(mime) || isGifUri(uri);
};

export const clampNumber = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
};

export const formatCount = (value?: number) => {
  const n = Number(value || 0);

  if (!Number.isFinite(n)) return "0";
  if (n < 1000) return String(n);

  if (n < 1_000_000) {
    const v = n / 1000;
    return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}K`;
  }

  const v = n / 1_000_000;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}M`;
};

export const safeJsonParse = <T = any>(value: any, fallback: T): T => {
  try {
    if (typeof value !== "string") return fallback;
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch {
    return fallback;
  }
};

export const uniqueBy = <T>(
  arr: T[],
  getKey: (item: T) => string
): T[] => {
  const out: T[] = [];
  const seen = new Set<string>();

  for (const item of Array.isArray(arr) ? arr : []) {
    const key = normalizeString(getKey(item));
    if (!key || seen.has(key)) continue;

    seen.add(key);
    out.push(item);
  }

  return out;
};

export const sortUsersByRoleAndName = <T extends Partial<UserUI>>(users: T[]) => {
  const roleOrder: Record<string, number> = {
    creator: 0,
    owner: 1,
    admin: 2,
    member: 3,
  };

  return [...(Array.isArray(users) ? users : [])].sort((a, b) => {
    const aRank = roleOrder[String(a.role || "member")] ?? 99;
    const bRank = roleOrder[String(b.role || "member")] ?? 99;

    if (aRank !== bRank) return aRank - bRank;

    return String(a.name || "").localeCompare(String(b.name || ""));
  });
};

export const isPrivateMentionStatusText = (text?: string) => {
  const systemText = normalizeString(text);

  return (
    systemText.includes("Private message sent") ||
    systemText.includes("Private message failed") ||
    systemText.includes("User @") ||
    systemText.includes("You cannot send a private mention message")
  );
};

export const cleanPrivateMentionStatusText = (text?: string) => {
  return normalizeString(text)
    .replace(/^✅\s*/, "")
    .replace(/^❌\s*/, "")
    .trim();
};

export const isPrivateMentionSuccessText = (text?: string) => {
  return normalizeString(text).includes("Private message sent");
};

export const isCricketGameType = (gameType?: string) => {
  return normalizeLowerString(gameType) === "cricket";
};

export const isSugarLuckGameType = (gameType?: string) => {
  return normalizeLowerString(gameType) === "luck";
};

export const isDuelGameType = (gameType?: string) => {
  return normalizeLowerString(gameType) === "duel";
};

export const isBombGameType = (gameType?: string) => {
  return normalizeLowerString(gameType) === "bomb";
};

export const isBombColorPayload = (payload?: any) => {
  return normalizeLowerString(payload?.game) === "bomb_color";
};

export const getBombChallengeId = (payload?: any) => {
  return normalizeString(
    payload?.challengeId ||
      payload?.id ||
      payload?._id ||
      payload?.bombId ||
      ""
  );
};

export const getDisplayTime = (value?: any) => {
  const text = normalizeString(value);

  if (text) return text;

  const d = new Date();

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};