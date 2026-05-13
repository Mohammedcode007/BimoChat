import { CategoryCard } from "./types";

export const CREATE_ACCOUNT_COST = 30000;
export const CUSTOM_EMOJI_BADGE_COST = 2500;

export function buildCategoryCards(t: (key: string) => string): CategoryCard[] {
  return [
    {
      key: "avatarFrame",
      title: t("storeScreen.tabs.avatarFrame"),
      subtitle: t("storeScreen.prettyType.avatarFrame"),
    },
    {
      key: "usernameColor",
      title: t("storeScreen.tabs.usernameColor"),
      subtitle: t("storeScreen.prettyType.usernameColor"),
    },
    {
      key: "messageTextColor",
      title: t("storeScreen.tabs.messageTextColor"),
      subtitle: t("storeScreen.prettyType.messageTextColor"),
    },
    {
      key: "badge",
      title: t("storeScreen.tabs.badge"),
      subtitle: t("storeScreen.prettyType.badge"),
    },
    {
      key: "messageEffect",
      title: t("storeScreen.tabs.messageEffect"),
      subtitle: t("storeScreen.prettyType.messageEffect"),
    },
    {
      key: "profileEntryAnimation",
      title: t("storeScreen.tabs.profileEntryAnimation"),
      subtitle: t("storeScreen.prettyType.profileEntryAnimation"),
    },
    {
      key: "verification",
      title: t("storeScreen.tabs.verification"),
      subtitle: t("storeScreen.prettyType.verification"),
    },
    {
      key: "gift",
      title: t("storeScreen.tabs.gift"),
      subtitle: t("storeScreen.prettyType.gift"),
    },
  ];
}