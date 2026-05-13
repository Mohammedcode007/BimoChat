import Ionicons from "@expo/vector-icons/Ionicons";

export type StoreType =
  | "avatarFrame"
  | "avatarGif"
  | "usernameColor"
  | "messageTextColor"
  | "badge"
  | "messageEffect"
  | "profileEntryAnimation"
  | "verification"
  | "gift";

export type ModalState = {
  wallet: boolean;
  customEmoji: boolean;
  badgePicker: boolean;
  createAccount: boolean;
  category: boolean;
  inventory: boolean;
  buy: boolean;
  created: boolean;
  transactions: boolean;
  earnings: boolean;
};

export type CoinzPack = {
  packageId: "p1" | "p2" | "p3";
  title: string;
  subtitle?: string;
  priceEGP: number;
  coinz: number;
};

export type CategoryCard = {
  key: StoreType;
  title: string;
  subtitle: string;
};

export type StoreStats = {
  balance: number;
  monthReceivedCoinz: number;
  monthSpentCoinz: number;
  monthReceivedGifts: number;
  monthSentGifts: number;
  earningsUsd: number;
};

export type StoreVisualTone =
  | "gold"
  | "violet"
  | "blue"
  | "green"
  | "rose"
  | "cyan"
  | "orange"
  | "neutral";

export type StoreActionItem = {
  key: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: StoreVisualTone;
  value?: string;
  danger?: boolean;
  onPress: () => void;
};