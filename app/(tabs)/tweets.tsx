
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import { blockUser, toggleFollow } from "@/redux/slices/followSlice";
import { unblockUser } from "@/redux/slices/friendSlice";
import { clearReportError, clearReportSuccess, ReportReason, resetReportForm, selectReportError, selectReportSubmitting, selectReportSuccess, submitReport } from "@/redux/slices/reportSlice";
import {
  deleteTweet,
  getFollowingFeed,
  getForYouFeed,
  toggleLike,
  toggleRetweet,
} from "@/redux/slices/tweetSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { timeAgo } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

/* ================= Constants ================= */

const TWEET_PREVIEW_LENGTH = 160;

/* ================= Helpers ================= */

const RICH_TOKEN_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+|@[\u0600-\u06FF\w_]+|#[\u0600-\u06FF\w_]+)/g;

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/i;

const isValidUrl = (url?: string) => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  return /^https?:\/\//i.test(url);
};

const getSafeLink = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return value;
};

function extractFirstUrl(text?: string) {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  if (!match?.[0]) return null;
  return getSafeLink(match[0]);
}

function getHostName(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(getSafeLink(url));
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function openExternalLink(url: string) {
  try {
    const safeUrl = getSafeLink(url);
    const supported = await Linking.canOpenURL(safeUrl);
    if (supported) {
      await Linking.openURL(safeUrl);
    }
  } catch (error) {
    console.log("openExternalLink error", error);
  }
}

function parseRichText(text: string) {
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
      result.push({ type: "link", value: matchText });
    } else if (matchText.startsWith("@")) {
      result.push({ type: "mention", value: matchText });
    } else if (matchText.startsWith("#")) {
      result.push({ type: "hashtag", value: matchText });
    } else {
      result.push({ type: "text", value: matchText });
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

function renderTweetRichText(
  text: string,
  s: any,
  onPressMention?: (mention: string) => void,
  onPressHashtag?: (hashtag: string) => void
) {
  if (!text) return null;

  const parts = parseRichText(text);

  return (
    <Text style={s.text}>
      {parts.map((part, index) => {
        if (!part.value) return null;

        if (part.type === "link") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.link}
              onPress={() => openExternalLink(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "mention") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.mention}
              onPress={() => onPressMention?.(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        if (part.type === "hashtag") {
          return (
            <Text
              key={`${part.type}-${index}`}
              style={s.hashtag}
              onPress={() => onPressHashtag?.(part.value)}
            >
              {part.value}
            </Text>
          );
        }

        return (
          <Text key={`${part.type}-${index}`} style={s.normalText}>
            {part.value}
          </Text>
        );
      })}
    </Text>
  );
}

function ExpandableTweetText({
  text,
  s,
  previewLength = TWEET_PREVIEW_LENGTH,
  onPressMention,
  onPressHashtag,
}: {
  text: string;
  s: any;
  previewLength?: number;
  onPressMention?: (mention: string) => void;
  onPressHashtag?: (hashtag: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > previewLength;
  const displayedText =
    shouldTruncate && !expanded
      ? `${text.slice(0, previewLength).trim()}...`
      : text;

  return (
    <View style={{ marginTop: 8 }}>
      {renderTweetRichText(displayedText, s, onPressMention, onPressHashtag)}

      {shouldTruncate && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setExpanded((prev) => !prev)}
          style={s.readMoreBtn}
        >
          <Text style={s.readMoreText}>
            {expanded ? "عرض أقل" : "عرض المزيد"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================= Link Preview ================= */

function LinkPreviewCard({
  url,
  preview,
  s,
}: {
  url: string;
  preview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  } | null;
  s: any;
}) {
  const siteName = preview?.siteName || getHostName(url) || "Link";
  const title = preview?.title || url;
  const description = preview?.description || "";
  const image = preview?.image && isValidUrl(preview.image) ? preview.image : null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => openExternalLink(url)}
      style={s.linkCard}
    >
      {image ? (
        <Image source={{ uri: image }} style={s.linkCardImage} />
      ) : (
        <View style={s.linkCardImagePlaceholder}>
          <Ionicons name="link-outline" size={28} color={s._iconColor} />
        </View>
      )}

      <View style={s.linkCardBody}>
        <Text style={s.linkCardSite} numberOfLines={1}>
          {siteName}
        </Text>

        <Text style={s.linkCardTitle} numberOfLines={2}>
          {title}
        </Text>

        {!!description && (
          <Text style={s.linkCardDesc} numberOfLines={2}>
            {description}
          </Text>
        )}

        <Text style={s.linkCardUrl} numberOfLines={1}>
          {url}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ================= Media Grid ================= */

function TweetMediaGrid({
  media,
  s,
  onPressImage,
}: {
  media: Array<{ url: string; type?: string }>;
  s: any;
  onPressImage?: (url: string) => void;
}) {
  const validMedia = (media || []).filter((m) => isValidUrl(m?.url));

  if (!validMedia.length) return null;

  const videos = validMedia.filter((m) => m.type === "video");
  const images = validMedia.filter((m) => m.type !== "video");

  if (videos.length > 0) {
    return (
      <View style={s.mediaSection}>
        {videos.map((mediaItem, index) => (
          <Video
            key={`${mediaItem.url}-${index}`}
            source={{ uri: mediaItem.url }}
            style={s.singleMedia}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        ))}
      </View>
    );
  }

  if (images.length === 1) {
    return (
      <View style={s.mediaSection}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onPressImage?.(images[0].url)}
        >
          <Image source={{ uri: images[0].url }} style={s.singleMedia} />
        </TouchableOpacity>
      </View>
    );
  }

  if (images.length === 2) {
    return (
      <View style={s.grid2}>
        {images.slice(0, 2).map((mediaItem, index) => (
          <TouchableOpacity
            key={`${mediaItem.url}-${index}`}
            style={{ flex: 1 }}
            activeOpacity={0.92}
            onPress={() => onPressImage?.(mediaItem.url)}
          >
            <Image source={{ uri: mediaItem.url }} style={s.grid2Item} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (images.length === 3) {
    return (
      <View style={s.grid3}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={{ flex: 1.2 }}
          onPress={() => onPressImage?.(images[0].url)}
        >
          <Image source={{ uri: images[0].url }} style={s.grid3Left} />
        </TouchableOpacity>

        <View style={s.grid3Right}>
          <TouchableOpacity
            activeOpacity={0.92}
            style={{ flex: 1 }}
            onPress={() => onPressImage?.(images[1].url)}
          >
            <Image source={{ uri: images[1].url }} style={s.grid3Small} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            style={{ flex: 1 }}
            onPress={() => onPressImage?.(images[2].url)}
          >
            <Image source={{ uri: images[2].url }} style={s.grid3Small} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.grid4}>
      {images.slice(0, 4).map((mediaItem, index) => (
        <TouchableOpacity
          key={`${mediaItem.url}-${index}`}
          style={s.grid4ItemWrap}
          activeOpacity={0.92}
          onPress={() => onPressImage?.(mediaItem.url)}
        >
          <Image source={{ uri: mediaItem.url }} style={s.grid4Item} />

          {index === 3 && images.length > 4 && (
            <View style={s.moreOverlay}>
              <Text style={s.moreOverlayText}>+{images.length - 4}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ================= Badges ================= */

type BadgeKey = string;

const BADGE_META: Record<
  BadgeKey,
  {
    label?: string;
    iconType?: "emoji" | "ion";
    icon?: string;
    bg: string;
    fg: string;
  }
> = {
  gold: {
    label: "GOLD",
    iconType: "emoji",
    icon: "🏅",
    bg: "#FEF3C7",
    fg: "#92400E",
  },
  blue: {
    label: "",
    iconType: "ion",
    icon: "checkmark-circle",
    bg: "transparent",
    fg: "#1DA1F2",
  },
  business: {
    label: "BUSINESS",
    iconType: "emoji",
    icon: "🏢",
    bg: "#E5E7EB",
    fg: "#111827",
  },
  vip: {
    label: "VIP",
    iconType: "emoji",
    icon: "💎",
    bg: "#EDE9FE",
    fg: "#5B21B6",
  },
  pro: {
    label: "PRO",
    iconType: "emoji",
    icon: "⚡",
    bg: "#DCFCE7",
    fg: "#166534",
  },
};

function UserBadges({ author, s }: { author: any; s: any }) {
  const badges: string[] =
    author?.displayBadges ??
    author?.activeCustomization?.badges ??
    author?.badges ??
    [];

  const verificationType: string =
    author?.displayVerificationType ??
    author?.activeCustomization?.verificationType ??
    author?.verificationType ??
    "none";

  const merged: string[] = [
    ...(verificationType && verificationType !== "none"
      ? [verificationType]
      : []),
    ...badges,
  ];

  const unique = Array.from(new Set(merged)).filter((k) => BADGE_META[k]);
  if (!unique.length) return null;

  return (
    <View style={s.badgesWrap}>
      {unique.map((key) => {
        const meta = BADGE_META[key];

        if (key === "blue") {
          return (
            <Ionicons
              key={key}
              name={meta.icon as any}
              size={14}
              color={meta.fg}
              style={{ marginLeft: 6 }}
            />
          );
        }

        return (
          <View key={key} style={[s.badgePill, { backgroundColor: meta.bg }]}>
            {meta.iconType === "ion" && meta.icon ? (
              <Ionicons
                name={meta.icon as any}
                size={12}
                color={meta.fg}
                style={{ marginRight: meta.label ? 4 : 0 }}
              />
            ) : meta.icon ? (
              <Text style={{ marginRight: meta.label ? 4 : 0 }}>
                {meta.icon}
              </Text>
            ) : null}

            {meta.label ? (
              <Text style={[s.badgeText, { color: meta.fg }]}>
                {meta.label}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
function ImagePreviewModal({
  visible,
  imageUrl,
  onClose,
  s,
}: {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
  s: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.imageModalOverlay}>
        <Pressable style={s.imageModalBackdrop} onPress={onClose} />

        <View style={s.imageModalHeader}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={s.imageModalCloseBtn}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={s.imageModalContent}>
          {!!imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={s.imageModalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
const REPORT_REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: "رسائل مزعجة", value: "spam" },
  { label: "تحرش أو إساءة", value: "harassment" },
  { label: "محتوى جنسي", value: "sexual" },
  { label: "عنف", value: "violence" },
  { label: "كراهية", value: "hate" },
  { label: "حساب مزيف", value: "fake_account" },
  { label: "احتيال", value: "scam" },
  { label: "أخرى", value: "other" },
];
/* ================= Screen ================= */

export default function TweetsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
  const { t, language } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [reportTarget, setReportTarget] = useState<{
    targetType: "user" | "tweet";
    targetId: string;
    label?: string;
  } | null>(null);
  const [selectedReason, setSelectedReasonLocal] = useState<ReportReason | null>(null);
  const [reportDetails, setReportDetailsLocal] = useState("");
  const reportSubmitting = useSelector(selectReportSubmitting);
  const reportSuccess = useSelector(selectReportSuccess);
  const reportError = useSelector(selectReportError);
  const { following, forYou, loading } = useSelector(
    (state: RootState) => state.tweets
  );
  const { followingMap } = useSelector((state: RootState) => state.follow);
  const { user } = useSelector((state: RootState) => state.auth);

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const handleToggleBlock = async () => {
    if (!selectedUser?._id) return;

    try {
      setActionLoading(`block-${selectedUser._id}`);

      const relationshipStatus = selectedUser?.relationshipStatus;

      if (relationshipStatus === "blocked_by_me") {
        await dispatch(unblockUser(selectedUser._id));
      } else {
        await dispatch(blockUser(selectedUser._id));
      }

      closeSheet();

      await dispatch(getFollowingFeed({ page: 1 }));
      await dispatch(getForYouFeed({ page: 1 }));
    } catch (error) {
      console.log("handleToggleBlock error", error);
    } finally {
      setActionLoading(null);
    }
  };
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [activeTab, setActiveTab] = useState<"following" | "foryou">(
    "following"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const rawFeed = activeTab === "following" ? following : forYou;

  const uniqueFeed = useMemo(
    () =>
      Array.from(
        new Map((rawFeed || []).map((item: any) => [item._id, item])).values()
      ),
    [rawFeed]
  );

  useEffect(() => {
    dispatch(getFollowingFeed({ page: 1 }));
    dispatch(getForYouFeed({ page: 1 }));
  }, [dispatch]);
  useEffect(() => {
    if (reportSuccess) {
      Alert.alert("تم", "تم إرسال البلاغ بنجاح");
      setShowReportModal(false);
      setReportTarget(null);
      setSelectedReasonLocal(null);
      setReportDetailsLocal("");
      dispatch(clearReportSuccess());
      dispatch(resetReportForm());
    }
  }, [reportSuccess, dispatch]);

  useEffect(() => {
    if (reportError) {
      Alert.alert("خطأ", reportError);
      dispatch(clearReportError());
    }
  }, [reportError, dispatch]);
  const openReportModal = (target: {
    targetType: "user" | "tweet";
    targetId: string;
    label?: string;
  }) => {
    setReportTarget(target);
    setSelectedReasonLocal(null);
    setReportDetailsLocal("");
    setShowReportModal(true);
    closeSheet();
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportTarget(null);
    setSelectedReasonLocal(null);
    setReportDetailsLocal("");
  };

  const handleSubmitReport = async () => {
    if (!reportTarget) return;

    if (!selectedReason) {
      Alert.alert("تنبيه", "اختر سبب البلاغ أولاً");
      return;
    }

    const resultAction = await dispatch(
      submitReport({
        targetType: reportTarget.targetType,
        targetId: reportTarget.targetId,
        reason: selectedReason,
        details: reportDetails,
      })
    );

    if (submitReport.rejected.match(resultAction)) {
      return;
    }
  };
  const openSheet = (author: any) => {
    setSelectedUser(author);
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setSelectedUser(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "following") {
      await dispatch(getFollowingFeed({ page: 1 }));
    } else {
      await dispatch(getForYouFeed({ page: 1 }));
    }
    setRefreshing(false);
  };
  const openImagePreview = (url: string) => {
    setPreviewImage(url);
    setShowImageModal(true);
  };

  const closeImagePreview = () => {
    setShowImageModal(false);
    setPreviewImage(null);
  };
  const handleLoadMore = () => {
    if (loading) return;

    if (activeTab === "following") {
      dispatch(getFollowingFeed({ page: 2 }));
    } else {
      dispatch(getForYouFeed({ page: 2 }));
    }
  };

  const openTweet = (tweet: any) => {
    router.push({ pathname: "/tweet/[id]", params: { id: tweet._id } });
  };

  const handleMentionPress = (mention: string) => {
    const cleanMention = mention.replace(/^@/, "");
    router.push({
      pathname: "/search",
      params: { q: cleanMention, type: "users" },
    });
  };

  const handleHashtagPress = (hashtag: string) => {
    const cleanHashtag = hashtag.replace(/^#/, "");
    router.push({
      pathname: "/search",
      params: { q: cleanHashtag, type: "hashtags" },
    });
  };

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <View key={language} style={s.tabsWrap}>
        <TabButton
          title={t("tweetsScreen.followingTab")}
          active={activeTab === "following"}
          onPress={() => {
            setActiveTab("following");
            dispatch(getFollowingFeed({ page: 1 }));
          }}
          s={s}
        />
        <TabButton
          title={t("tweetsScreen.forYouTab")}
          active={activeTab === "foryou"}
          onPress={() => {
            setActiveTab("foryou");
            dispatch(getForYouFeed({ page: 1 }));
          }}
          s={s}
        />
      </View>

      <FlatList
        data={uniqueFeed}
        extraData={language}
        keyExtractor={(item: any, index: number) => {
          const id = item?._id ?? item?.id ?? "item";
          return `${String(id)}-${index}`;
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ margin: 16 }} color={theme.tint} />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }: any) => {
          const isOwnTweet = item?.author?._id === user?._id;

          const isFollowing =
            followingMap?.[item?.author?._id] ??
            item?.author?.isFollowing ??
            false;

          const avatarUri = isValidUrl(item?.author?.avatar)
            ? item.author.avatar
            : "https://i.pravatar.cc/150?img=3";

          const linkPreview = item?.linkPreview ?? null;
          const detectedUrl =
            linkPreview?.url || extractFirstUrl(item?.content || "");
          const isBlockedByMe = item?.author?.relationshipStatus === "blocked_by_me";
          const blockedMe = item?.author?.relationshipStatus === "blocked_me";
          const isBlocked = isBlockedByMe || blockedMe;

          return (
            <Swipeable
              renderRightActions={() =>
                isOwnTweet ? (
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={async () => {
                      setActionLoading(`delete-${item._id}`);
                      await dispatch(deleteTweet(item._id));
                      setActionLoading(null);
                    }}
                    activeOpacity={0.9}
                  >
                    {actionLoading === `delete-${item._id}` ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Ionicons name="trash" size={18} color="#FFF" />
                    )}
                    <Text style={s.deleteText}>
                      {t("tweetsScreen.delete")}
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            >
              <View style={s.card}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/profile/[id]",
                      params: { id: item.author._id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: avatarUri }} style={s.avatar} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <View style={s.nameRow}>
                        <Text style={s.name} numberOfLines={1}>
                          {item.author.username}
                        </Text>

                        <UserBadges author={item.author} s={s} />

                        <Text style={s.dot}>•</Text>
                        <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
                      </View>

                      {/* <Text style={s.handle} numberOfLines={1}>
                        {item.author.atUsername}
                      </Text> */}
                    </View>

                    {!isOwnTweet && (
                      <TouchableOpacity
                        style={[
                          s.followBtn,
                          isFollowing ? s.followBtnOn : s.followBtnOff,
                        ]}
                        onPress={async () => {
                          setActionLoading(`follow-${item.author._id}`);
                          await dispatch(toggleFollow(item.author._id));
                          setActionLoading(null);
                        }}
                        activeOpacity={0.9}
                      >
                        {actionLoading === `follow-${item.author._id}` ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text
                            style={[
                              s.followText,
                              {
                                color: isFollowing
                                  ? isDark
                                    ? "#FFFFFF"
                                    : "#111827"
                                  : theme.tint,
                              },
                            ]}
                          >
                            {isFollowing
                              ? t("tweetsScreen.following")
                              : t("tweetsScreen.follow")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* {!isOwnTweet && !isBlocked && (
                      <TouchableOpacity
                        style={[
                          s.followBtn,
                          isFollowing ? s.followBtnOn : s.followBtnOff,
                        ]}
                        onPress={async () => {
                          setActionLoading(`follow-${item.author._id}`);
                          await dispatch(toggleFollow(item.author._id));
                          setActionLoading(null);
                        }}
                        activeOpacity={0.9}
                      >
                        ...
                      </TouchableOpacity>
                    )} */}
                    <TouchableOpacity
                      onPress={() => openSheet(item.author)}
                      style={s.moreBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color={theme.icon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        openReportModal({
                          targetType: "tweet",
                          targetId: item._id,
                          label: "تويت",
                        })
                      }
                      style={s.moreBtn}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="flag-outline" size={18} color={theme.icon} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openTweet(item)}
                  >
                    <ExpandableTweetText
                      text={item.content}
                      s={s}
                      onPressMention={handleMentionPress}
                      onPressHashtag={handleHashtagPress}
                    />
                  </TouchableOpacity>

                  {Array.isArray(item.media) && item.media.length > 0 && (
                    <TweetMediaGrid
                      media={item.media}
                      s={s}
                      onPressImage={openImagePreview}
                    />
                  )}

                  {!Array.isArray(item.media) || item.media.length === 0 ? (
                    detectedUrl ? (
                      <View style={{ marginTop: 10 }}>
                        <LinkPreviewCard
                          url={detectedUrl}
                          preview={linkPreview}
                          s={s}
                        />
                      </View>
                    ) : null
                  ) : detectedUrl ? (
                    <View style={{ marginTop: 10 }}>
                      <LinkPreviewCard
                        url={detectedUrl}
                        preview={linkPreview}
                        s={s}
                      />
                    </View>
                  ) : null}

                  <View style={s.actions}>
                    <Action
                      s={s}
                      loading={actionLoading === `like-${item._id}`}
                      icon={item.isLiked ? "heart" : "heart-outline"}
                      value={item.likesCount}
                      onPress={async () => {
                        setActionLoading(`like-${item._id}`);
                        await dispatch(toggleLike(item._id));
                        setActionLoading(null);
                      }}
                    />

                    <Action
                      s={s}
                      loading={actionLoading === `retweet-${item._id}`}
                      icon="repeat-outline"
                      value={item.retweetsCount}
                      onPress={async () => {
                        setActionLoading(`retweet-${item._id}`);
                        await dispatch(toggleRetweet(item._id));
                        setActionLoading(null);
                      }}
                    />

                    <Action
                      s={s}
                      loading={false}
                      icon="chatbubble-outline"
                      value={item.repliesCount}
                      onPress={() => openTweet(item)}
                    />
                  </View>
                </View>
              </View>
            </Swipeable>
          );
        }}
      />

      {showSheet && (
        <View style={s.overlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSheet}
          />

          <View style={s.sheet}>
            {selectedUser && (
              <>
                <Text style={s.sheetTitle}>
                  {selectedUser.atUsername?.startsWith("@")
                    ? selectedUser.atUsername
                    : `@${selectedUser.atUsername}`}
                </Text>

                <TouchableOpacity
                  style={s.sheetItem}
                  onPress={async () => {
                    await dispatch(toggleFollow(selectedUser._id));
                    closeSheet();
                  }}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(239,68,68,0.10)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="person-remove-outline"
                      size={18}
                      color="#EF4444"
                    />
                  </View>
                  <Text style={s.sheetText}>
                    {t("tweetsScreen.unfollow")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.sheetItem}
                  activeOpacity={0.9}
                  onPress={handleToggleBlock}
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(239,68,68,0.10)",
                      },
                    ]}
                  >
                    {actionLoading === `block-${selectedUser?._id}` ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons
                        name={
                          selectedUser?.relationshipStatus === "blocked_by_me"
                            ? "lock-open-outline"
                            : "ban-outline"
                        }
                        size={18}
                        color="#EF4444"
                      />
                    )}
                  </View>

                  <Text style={s.sheetText}>
                    {selectedUser?.relationshipStatus === "blocked_by_me"
                      ? "إلغاء الحظر"
                      : t("tweetsScreen.block")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.sheetItem}
                  activeOpacity={0.9}
                  onPress={() =>
                    openReportModal({
                      targetType: "user",
                      targetId: selectedUser._id,
                      label: selectedUser.atUsername,
                    })
                  }
                >
                  <View
                    style={[
                      s.sheetIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(245,158,11,0.14)"
                          : "rgba(245,158,11,0.10)",
                      },
                    ]}
                  >
                    <Ionicons name="flag-outline" size={18} color="#F59E0B" />
                  </View>
                  <Text style={s.sheetText}>{t("tweetsScreen.report")}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <ImagePreviewModal
        visible={showImageModal}
        imageUrl={previewImage}
        onClose={closeImagePreview}
        s={s}
      />
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={closeReportModal}
      >
        <View style={s.reportOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeReportModal}
          />

          <View style={s.reportSheet}>
            <Text style={s.reportTitle}>إرسال بلاغ</Text>

            {!!reportTarget?.label && (
              <Text style={s.reportSubtitle}>
                الهدف: {reportTarget.label}
              </Text>
            )}

            <Text style={s.reportSectionTitle}>اختر السبب</Text>

            <View style={s.reportReasonsWrap}>
              {REPORT_REASON_OPTIONS.map((reasonItem) => {
                const active = selectedReason === reasonItem.value;

                return (
                  <TouchableOpacity
                    key={reasonItem.value}
                    activeOpacity={0.9}
                    onPress={() => setSelectedReasonLocal(reasonItem.value)}
                    style={[
                      s.reportReasonChip,
                      active && s.reportReasonChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.reportReasonText,
                        active && s.reportReasonTextActive,
                      ]}
                    >
                      {reasonItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.reportSectionTitle}>تفاصيل إضافية</Text>

            <TextInput
              value={reportDetails}
              onChangeText={setReportDetailsLocal}
              placeholder="اكتب تفاصيل البلاغ هنا"
              placeholderTextColor={theme.mutedText}
              multiline
              style={s.reportInput}
              textAlignVertical="top"
              maxLength={1000}
            />

            <View style={s.reportActionsRow}>
              <TouchableOpacity
                style={s.reportCancelBtn}
                onPress={closeReportModal}
                activeOpacity={0.9}
                disabled={reportSubmitting}
              >
                <Text style={s.reportCancelText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.reportSubmitBtn}
                onPress={handleSubmitReport}
                activeOpacity={0.9}
                disabled={reportSubmitting}
              >
                {reportSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={s.reportSubmitText}>إرسال البلاغ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/create-tweet")}
      >
        <Ionicons name="create-outline" size={24} color="#FFF" />
      </TouchableOpacity>

    </View>
  );
}

/* ================= Components ================= */

function Action({ icon, value, onPress, loading, s }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.actionItem}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={s._iconColor} />
          <Text style={s.actionValue}>{value}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function TabButton({ title, active, onPress, s }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={s.tabBtn}
    >
      <Text style={[s.tabText, active && s.tabTextActive]}>{title}</Text>
      <View style={[s.tabIndicator, active && s.tabIndicatorActive]} />
    </TouchableOpacity>
  );
}
/* ================= Styles ================= */

function makeStyles(theme: any, isDark: boolean) {
  const cardBg = theme.surface ?? theme.background;
  const surface2 =
    theme.surface2 ?? theme.cardAlt ?? (isDark ? "#14141A" : "#F3F4F6");

  return StyleSheet.create({
    _iconColor: theme.icon,

    container: { flex: 1 },
    tabsWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingTop: 6,
      // borderBottomWidth: 1,
      // borderBottomColor: theme.separator,
      // backgroundColor: theme.background,
    },
    reportOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    reportSheet: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      paddingBottom: 22,
      maxHeight: "78%",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -8 },
        },
        android: { elevation: 10 },
      }),
    },

    reportTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 6,
    },

    reportSubtitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.mutedText,
      marginBottom: 14,
    },

    reportSectionTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 10,
      marginTop: 4,
    },

    reportReasonsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },

    reportReasonChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reportReasonChipActive: {
      backgroundColor: theme.tint,
      borderColor: theme.tint,
    },

    reportReasonText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
    },

    reportReasonTextActive: {
      color: "#FFF",
    },

    reportInput: {
      minHeight: 110,
      maxHeight: 180,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 16,
    },

    reportActionsRow: {
      flexDirection: "row",
      gap: 10,
    },

    reportCancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reportCancelText: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    reportSubmitBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EF4444",
      borderWidth: 1,
      borderColor: "#EF4444",
    },

    reportSubmitText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFF",
    },

    imageModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.96)",
    },

    imageModalBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    imageModalHeader: {
      position: "absolute",
      top: 50,
      right: 16,
      zIndex: 5,
    },

    imageModalCloseBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },

    imageModalContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 40,
    },

    imageModalImage: {
      width: "100%",
      height: "85%",
    },
    tabBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      paddingBottom: 8,
    },

    tabText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.mutedText,
    },

    tabTextActive: {
      color: theme.text,
      fontWeight: "900",
    },

    tabIndicator: {
      marginTop: 8,
      width: 32,
      height: 3,
      borderRadius: 999,
      backgroundColor: "transparent",
    },

    tabIndicatorActive: {
      backgroundColor: theme.tint,
    },

    card: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: theme.background,
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: surface2,
    },

    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      maxWidth: 190,
    },

    handle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
    },

    time: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.subtleText,
    },

    dot: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.subtleText,
      marginHorizontal: 2,
    },

    text: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.text,
      fontWeight: "700",
    },

    normalText: {
      color: theme.text,
      fontWeight: "700",
    },

    mention: {
      color: "#2563EB",
      fontWeight: "900",
    },

    hashtag: {
      color: theme.warning ?? "#F59E0B",
      fontWeight: "900",
    },

    link: {
      color: "#0EA5E9",
      fontWeight: "900",
      textDecorationLine: "underline",
    },

    readMoreBtn: {
      marginTop: 6,
      alignSelf: "flex-start",
    },

    readMoreText: {
      color: theme.tint,
      fontSize: 13,
      fontWeight: "900",
    },

    mediaSection: {
      marginTop: 10,
      gap: 10,
    },

    singleMedia: {
      width: "100%",
      height: 240,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid2: {
      marginTop: 10,
      flexDirection: "row",
      gap: 8,
    },

    grid2Item: {
      flex: 1,
      height: 220,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid3: {
      marginTop: 10,
      flexDirection: "row",
      gap: 8,
      height: 240,
    },

    grid3Left: {
      flex: 1.2,
      height: "100%",
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid3Right: {
      flex: 0.8,
      gap: 8,
    },

    grid3Small: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid4: {
      marginTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    grid4ItemWrap: {
      width: "48.8%",
      aspectRatio: 1,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid4Item: {
      width: "100%",
      height: "100%",
    },

    moreOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.42)",
      alignItems: "center",
      justifyContent: "center",
    },

    moreOverlayText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
    },

    linkCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    linkCardImage: {
      width: "100%",
      height: 180,
      backgroundColor: surface2,
    },

    linkCardImagePlaceholder: {
      width: "100%",
      height: 110,
      backgroundColor: surface2,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    linkCardBody: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    linkCardSite: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
      marginBottom: 4,
    },

    linkCardTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      lineHeight: 20,
    },

    linkCardDesc: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      color: theme.mutedText,
      fontWeight: "600",
    },

    linkCardUrl: {
      marginTop: 8,
      fontSize: 12,
      color: theme.tint,
      fontWeight: "800",
    },

    actions: {
      flexDirection: "row",
      gap: 14,
      marginTop: 10,
      alignItems: "center",
    },

    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      // backgroundColor: surface2,
      // borderWidth: 1,
      // borderColor: theme.border,
    },

    actionValue: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.mutedText,
    },

    followBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
    },

    followBtnOff: {
      backgroundColor: theme.surface2,
      borderColor: theme.tint,
    },

    followBtnOn: {
      backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#dbdfe8",
      borderColor: theme.border,
    },

    followText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "900",
    },

    moreBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      // backgroundColor: surface2,
      // borderWidth: 1,
      // borderColor: theme.border,
    },

    badgesWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 6,
    },

    badgePill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      marginLeft: 6,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.06)",
    },

    badgeText: {
      fontSize: 10,
      fontWeight: "900",
    },

    deleteBtn: {
      width: 96,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginVertical: 6,
      borderRadius: 16,
    },

    deleteText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "900",
    },

    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    sheet: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      paddingBottom: 18,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -8 },
        },
        android: { elevation: 10 },
      }),
    },

    sheetTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 12,
    },

    sheetItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderRadius: 14,
    },

    sheetIcon: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },

    sheetText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
    },

    fab: {
      position: "absolute",
      right: 18,
      bottom: 40,
      width: 58,
      height: 58,
      borderRadius: 18,
  backgroundColor: "#4F46E5",
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 8 },
      }),
    },
  });
}