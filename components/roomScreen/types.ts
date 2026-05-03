// components/roomScreen/types.ts

export type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "😡";

export type RoomRole = "creator" | "owner" | "admin" | "member";

export type SnapshotRole = string;

export type UserBadgeUI = {
  key: string;
  name?: string;
  lottieUrl?: string;
  iconUrl?: string;
  emoji?: string;
};

export type UserUI = {
  id: string;
  name: string;
  avatar?: string;
  avatarGif?: string;
  usernameColor?: string;
  messageTextColor?: string;

  role?: RoomRole;
  snapshotRole?: SnapshotRole;
  isOnline?: boolean;

  activeBadges?: UserBadgeUI[];

  customEmojiBadge?: {
    emoji: string;
    isActive: boolean;
    expiresAt?: string | null;
  } | null;
};

export type SongMusicUI = {
  title?: string;
  channel?: string;
  audioUrl?: string;
  thumbnail?: string;
  youtubeUrl?: string;

  playedById?: string;
  playedByName?: string;
  playedByAtUsername?: string;

  songCode?: string;
  loveCommand?: string;
};

export type GameUI = {
  gameType?: string;
  gameId?: string;
  title?: string;
  state?: string;
  turnUserId?: string;
  winnerUserId?: string;
  payload?: any;
};

export type MessageReactionUI = {
  emoji: Reaction;
  userId: string;
  username: string;
  avatar?: string;
  avatarGif?: string;
};

export type MessageGiftUI = {
  key: string;
  icon?: string;
  targetId?: string;
  targetName?: string;
  count?: number;
};

export type MessageUI = {
  id: string;

  type:
    | "text"
    | "image"
    | "file"
    | "audio"
    | "video"
    | "system"
    | "gift"
    | "song"
    | "game";

  systemType?:
    | "join"
    | "leave"
    | "announcement"
    | "promotion"
    | "ban"
    | "role"
    | "music";

  text?: string;
  uri?: string;

  mediaMimeType?: string;
  mediaFileName?: string;

  /**
   * clientId: يستخدم مع الرسائل الـ optimistic قبل وصول _id من السيرفر.
   * serverId: اختياري لو أردت حفظ _id الأصلي صراحةً.
   */
  clientId?: string;
  serverId?: string;

  sender?: UserUI;

  time: string;

  replyTo?: MessageUI;

  /**
   * reaction: أول رياكشن أو الرياكشن المختصر القديم.
   * reactions: تفاصيل المستخدمين الذين عملوا رياكشن.
   * reactionCount: العدد الإجمالي.
   */
  reaction?: Reaction;
  reactions?: MessageReactionUI[];
  reactionCount?: number;

  gift?: MessageGiftUI;

  music?: SongMusicUI;

  game?: GameUI;

  deletedForEveryone?: boolean;
};

export type GiftItem = {
  key: string;
  title: string;
  icon?: string;
  lottie?: any;
  price?: number;
};

export type UploadKind = "image" | "gif" | "sticker";

export type BombColor = "red" | "green" | "blue";

export type CricketMessageUI = MessageUI & {
  type: "game";
  game: {
    gameType: "cricket" | string;
    gameId?: string;
    title?: string;
    state?: string;
    turnUserId?: string;
    winnerUserId?: string;
    payload?: any;
  };
};