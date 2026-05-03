// components/roomScreen/giftHelpers.ts

import { GiftItem } from "./types";

export const TEMP_GIFTS: GiftItem[] = [
  {
    key: "gift_rose",
    title: "Rose",
    lottie: require("@/assets/lottie/rose.json"),
    price: 10,
  },
  {
    key: "gift_tea",
    title: "tea",
    lottie: require("@/assets/lottie/tea.json"),
    price: 5,
  },
  {
    key: "gift_bird",
    title: "bird",
    lottie: require("@/assets/lottie/bird.json"),
    price: 15,
  },
  {
    key: "gift_cat",
    title: "cat",
    lottie: require("@/assets/lottie/cat.json"),
    price: 25,
  },
  {
    key: "gift_hearts",
    title: "Hearts",
    lottie: require("@/assets/lottie/hearts.json"),
    price: 50,
  },
];

export const GIFT_META: Record<
  string,
  {
    icon: string;
    count: number;
    lottie?: any;
    price?: number;
  }
> = {
  gift_rose: {
    icon: "🌹",
    count: 40,
    lottie: require("@/assets/lottie/rose.json"),
    price: 10,
  },

  gift_tea: {
    icon: "👍",
    count: 55,
    lottie: require("@/assets/lottie/tea.json"),
    price: 5,
  },

  gift_bird: {
    icon: "🔥",
    count: 60,
    lottie: require("@/assets/lottie/bird.json"),
    price: 15,
  },

  gift_cat: {
    icon: "👑",
    count: 35,
    lottie: require("@/assets/lottie/cat.json"),
    price: 25,
  },

  gift_hearts: {
    icon: "🚀",
    count: 45,
    lottie: require("@/assets/lottie/hearts.json"),
    price: 50,
  },

  boost_rocket: {
    icon: "🚀",
    count: 55,
    lottie: require("@/assets/lottie/rocket2.json"),
    price: 0,
  },
};

export const getGiftMeta = (giftKey?: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return null;

  return GIFT_META[key] || null;
};

export const getGiftIcon = (giftKey?: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return "🎁";

  const tempGift = TEMP_GIFTS.find((gift) => gift.key === key);

  if (tempGift?.icon) return tempGift.icon;

  const meta = GIFT_META[key];

  return meta?.icon || "🎁";
};

export const getGiftLottie = (giftKey?: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return null;

  const tempGift = TEMP_GIFTS.find((gift) => gift.key === key);

  if (tempGift?.lottie) return tempGift.lottie;

  const meta = GIFT_META[key];

  return meta?.lottie || null;
};

export const getGiftCount = (giftKey?: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return 45;

  const meta = GIFT_META[key];

  if (typeof meta?.count === "number") return meta.count;

  return 45;
};

export const getGiftPrice = (giftKey: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return 0;

  const tempGift = TEMP_GIFTS.find((gift) => gift.key === key);

  if (typeof tempGift?.price === "number") {
    return tempGift.price;
  }

  const meta = GIFT_META[key];

  if (typeof meta?.price === "number") {
    return meta.price;
  }

  return 0;
};

export const isValidGiftKey = (giftKey?: string) => {
  const key = String(giftKey || "").trim();

  if (!key) return false;

  return Boolean(TEMP_GIFTS.some((gift) => gift.key === key) || GIFT_META[key]);
};

export const normalizeGiftKey = (giftKey?: string) => {
  return String(giftKey || "").trim();
};

export const getGiftTitle = (giftKey?: string) => {
  const key = normalizeGiftKey(giftKey);

  if (!key) return "Gift";

  const tempGift = TEMP_GIFTS.find((gift) => gift.key === key);

  if (tempGift?.title) return tempGift.title;

  if (key === "boost_rocket") return "Rocket Boost";

  return key
    .replace(/^gift_/, "")
    .replace(/^boost_/, "")
    .replace(/_/g, " ")
    .trim() || "Gift";
};

export const getGiftDisplayData = (giftKey?: string) => {
  const key = normalizeGiftKey(giftKey);

  return {
    key,
    title: getGiftTitle(key),
    icon: getGiftIcon(key),
    lottie: getGiftLottie(key),
    count: getGiftCount(key),
    price: getGiftPrice(key),
    valid: isValidGiftKey(key),
  };
};