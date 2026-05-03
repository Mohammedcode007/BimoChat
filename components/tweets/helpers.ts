import { Linking } from "react-native";

export const RICH_TOKEN_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+|@[\u0600-\u06FF\w_]+|#[\u0600-\u06FF\w_]+)/g;

export const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

export const isValidUrl = (url?: string) => {
  if (!url) return false;
  if (typeof url !== "string") return false;

  return /^https?:\/\//i.test(url);
};

export const getSafeLink = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;

  return value;
};

export function extractFirstUrl(text?: string) {
  if (!text) return null;

  const match = text.match(URL_REGEX);

  if (!match?.[0]) return null;

  return getSafeLink(match[0]);
}

export function getHostName(url?: string) {
  if (!url) return "";

  try {
    const parsed = new URL(getSafeLink(url));
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function openExternalLink(url: string) {
  try {
    const safeUrl = getSafeLink(url);
    const supported = await Linking.canOpenURL(safeUrl);

    if (supported) {
      await Linking.openURL(safeUrl);
    }
  } catch (error) {}
}

export function parseRichText(text: string) {
  const result: Array<{
    type: "text" | "link" | "mention" | "hashtag";
    value: string;
  }> = [];

  if (!text) return result;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(RICH_TOKEN_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const matchText = match[0];
    const start = match.index;

    if (start > lastIndex) {
      result.push({
        type: "text",
        value: text.slice(lastIndex, start),
      });
    }

    if (/^(https?:\/\/|www\.)/i.test(matchText)) {
      result.push({
        type: "link",
        value: matchText,
      });
    } else if (matchText.startsWith("@")) {
      result.push({
        type: "mention",
        value: matchText,
      });
    } else if (matchText.startsWith("#")) {
      result.push({
        type: "hashtag",
        value: matchText,
      });
    } else {
      result.push({
        type: "text",
        value: matchText,
      });
    }

    lastIndex = start + matchText.length;
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return result;
}

export const getFeedItemKey = (item: any) => {
  if (item?.feedType === "retweet") {
    return `retweet-${item?.retweetId || item?._id}-${item?.retweetedBy?._id || ""}`;
  }

  return `tweet-${item?._id}`;
};