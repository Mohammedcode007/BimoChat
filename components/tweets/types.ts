export type UserBadgeUI = {
  key: string;
  name?: string;
  lottieUrl?: string;
  iconUrl?: string;
  emoji?: string;
};

export type SheetMode = "menu" | "report";

export type ReportTarget = {
  targetType: "user" | "tweet";
  targetId: string;
  label?: string;
};

export type TweetMediaItem = {
  url: string;
  type?: string;
};

export type LinkPreview = {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
} | null;

export type OptimisticLikeState = {
  isLiked: boolean;
  likesCount: number;
};

export type OptimisticLikesMap = Record<string, OptimisticLikeState>;

export type ActiveTweetTab = "following" | "foryou";

export type TweetReportTargetType = "user" | "tweet";