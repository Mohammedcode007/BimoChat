
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHideTabBarOnScroll } from "@/hooks/useHideTabBarOnScroll";
import { useTranslation } from "@/hooks/useTranslation";
import { selectAccountType } from "@/redux/slices/authSlice";
import { blockUser, toggleFollow } from "@/redux/slices/followSlice";
import { unblockUser } from "@/redux/slices/friendSlice";
import {
  clearReportError,
  clearReportSuccess,
  ReportReason,
  resetReportForm,
  selectReportError,
  selectReportSubmitting,
  selectReportSuccess,
  submitReport,
} from "@/redux/slices/reportSlice";
import {
  deleteTweet,
  getFollowingFeed,
  getForYouFeed,
  toggleLike,
  toggleRetweet,
} from "@/redux/slices/tweetSlice";
import { AppDispatch, RootState } from "@/redux/store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { PAGE_SIZE } from "@/components/tweets/constants";
import { getFeedItemKey } from "@/components/tweets/helpers";
import { ImagePreviewModal } from "@/components/tweets/ImagePreviewModal";
import { makeTweetsStyles } from "@/components/tweets/styles";
import { TabButton } from "@/components/tweets/TweetActions";
import { TweetCard } from "@/components/tweets/TweetCard";
import { TweetOptionsSheet } from "@/components/tweets/TweetOptionsSheet";
import { ActiveTweetTab, ReportTarget, SheetMode } from "@/components/tweets/types";

export default function TweetsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { onScroll, onScrollBeginDrag } = useHideTabBarOnScroll();
  const { t, language } = useTranslation();

  const { colorScheme } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const s = useMemo(() => makeTweetsStyles(theme, isDark), [theme, isDark]);

  const following = useSelector((state: RootState) => state.tweets.following);
  const forYou = useSelector((state: RootState) => state.tweets.forYou);
  const loading = useSelector((state: RootState) => state.tweets.loading);

  const { followingMap } = useSelector((state: RootState) => state.follow);
  const { user } = useSelector((state: RootState) => state.auth);

  const accountType = useSelector(selectAccountType);
  const isAdmin = accountType === "admin";

  const reportSubmitting = useSelector(selectReportSubmitting);
  const reportSuccess = useSelector(selectReportSuccess);
  const reportError = useSelector(selectReportError);

  const [activeTab, setActiveTab] = useState<ActiveTweetTab>("foryou");

  const [followingPage, setFollowingPage] = useState(1);
  const [forYouPage, setForYouPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] =
    useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTweet, setSelectedTweet] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("menu");

  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [selectedReason, setSelectedReasonLocal] =
    useState<ReportReason | null>(null);
  const [reportDetails, setReportDetailsLocal] = useState("");

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [optimisticLikes, setOptimisticLikes] = useState<
    Record<string, { isLiked: boolean; likesCount: number }>
  >({});

  const pendingLikesRef = useRef<Record<string, boolean>>({});

  const selectedUserId = String(selectedUser?._id || "");

  const selectedUserIsFollowing = selectedUserId
    ? Boolean(
        followingMap?.[selectedUserId] ??
          selectedUser?.isFollowing ??
          false
      )
    : false;

  const selectedUserIsMe =
    !!selectedUserId && String(selectedUserId) === String(user?._id);

  const rawFeed = activeTab === "following" ? following : forYou;

  const uniqueFeed = useMemo(
    () =>
      Array.from(
        new Map(
          (rawFeed || []).map((item: any) => [getFeedItemKey(item), item])
        ).values()
      ),
    [rawFeed]
  );

  useEffect(() => {
    if (activeTab === "following") {
      setFollowingPage(1);
      dispatch(getFollowingFeed({ page: 1 }));
    } else {
      setForYouPage(1);
      dispatch(getForYouFeed({ page: 1 }));
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (reportSuccess) {
      Alert.alert("تم", "تم إرسال البلاغ بنجاح");
      closeSheet();
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

  const openSheet = (tweet: any) => {
    setSelectedTweet(tweet);
    setSelectedUser(tweet?.author || null);
    setSheetMode("menu");
    setShowSheet(true);
  };

  const closeSheet = () => {
    setShowSheet(false);
    setSheetMode("menu");
    setSelectedUser(null);
    setSelectedTweet(null);
    setReportTarget(null);
    setSelectedReasonLocal(null);
    setReportDetailsLocal("");
  };

  const openReportInSheet = (target: ReportTarget) => {
    setReportTarget(target);
    setSelectedReasonLocal(null);
    setReportDetailsLocal("");
    setSheetMode("report");
  };

  const backToMenu = () => {
    setSheetMode("menu");
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    if (activeTab === "following") {
      setFollowingPage(1);
      await dispatch(getFollowingFeed({ page: 1 }));
    } else {
      setForYouPage(1);
      await dispatch(getForYouFeed({ page: 1 }));
    }

    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loading || loadingMore) return;

    if ((uniqueFeed?.length || 0) < PAGE_SIZE) return;

    try {
      setLoadingMore(true);

      if (activeTab === "following") {
        const nextPage = followingPage + 1;
        const resultAction = await dispatch(getFollowingFeed({ page: nextPage }));

        if (getFollowingFeed.fulfilled.match(resultAction)) {
          const newItems = resultAction.payload?.tweets || [];

          if (Array.isArray(newItems) && newItems.length > 0) {
            setFollowingPage(nextPage);
          }
        }
      } else {
        const nextPage = forYouPage + 1;
        const resultAction = await dispatch(getForYouFeed({ page: nextPage }));

        if (getForYouFeed.fulfilled.match(resultAction)) {
          const newItems = resultAction.payload?.tweets || [];

          if (Array.isArray(newItems) && newItems.length > 0) {
            setForYouPage(nextPage);
          }
        }
      }
    } catch (error) {
    } finally {
      setLoadingMore(false);
    }
  };

  const openTweet = (tweet: any) => {
    router.push({
      pathname: "/tweet/[id]",
      params: { id: tweet._id },
    });
  };

  const openImagePreview = (url: string) => {
    setPreviewImage(url);
    setShowImageModal(true);
  };

  const closeImagePreview = () => {
    setShowImageModal(false);
    setPreviewImage(null);
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

  const handleOptimisticLike = (tweet: any) => {
    const tweetId = String(tweet?._id || "");

    if (!tweetId) return;

    if (pendingLikesRef.current[tweetId]) return;

    const currentOptimistic = optimisticLikes[tweetId];

    const currentIsLiked =
      currentOptimistic?.isLiked ?? Boolean(tweet?.isLiked);

    const currentLikesCount =
      currentOptimistic?.likesCount ?? Number(tweet?.likesCount || 0);

    const nextIsLiked = !currentIsLiked;

    const nextLikesCount = Math.max(
      0,
      currentLikesCount + (nextIsLiked ? 1 : -1)
    );

    setOptimisticLikes((prev) => ({
      ...prev,
      [tweetId]: {
        isLiked: nextIsLiked,
        likesCount: nextLikesCount,
      },
    }));

    pendingLikesRef.current[tweetId] = true;

    dispatch(toggleLike(tweetId))
      .then((resultAction: any) => {
        if (toggleLike.rejected.match(resultAction)) {
          throw new Error("LIKE_FAILED");
        }
      })
      .catch(() => {
        setOptimisticLikes((prev) => ({
          ...prev,
          [tweetId]: {
            isLiked: currentIsLiked,
            likesCount: currentLikesCount,
          },
        }));
      })
      .finally(() => {
        delete pendingLikesRef.current[tweetId];
      });
  };

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <View key={language} style={s.tabsWrap}>
        <TabButton
          title={t("tweetsScreen.followingTab")}
          active={activeTab === "following"}
          onPress={() => setActiveTab("following")}
          s={s}
        />

        <TabButton
          title={t("tweetsScreen.forYouTab")}
          active={activeTab === "foryou"}
          onPress={() => setActiveTab("foryou")}
          s={s}
        />
      </View>

      <FlatList
        data={uniqueFeed}
        extraData={{
          language,
          actionLoading,
          optimisticLikes,
          followingMap,
        }}
        keyExtractor={(item: any) => getFeedItemKey(item)}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum) {
            handleLoadMore();
            setOnEndReachedCalledDuringMomentum(true);
          }
        }}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ margin: 16 }} color={theme.tint} />
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }: any) => {
          const tweetId = String(item?._id || "");
          const optimisticLike = optimisticLikes[tweetId];

          return (
            <TweetCard
              item={item}
              s={s}
              theme={theme}
              isDark={isDark}
              user={user}
              isAdmin={isAdmin}
              followingMap={followingMap}
              actionLoading={actionLoading}
              optimisticLike={optimisticLike}
              t={t}
              onOpenTweet={openTweet}
              onOpenSheet={openSheet}
              onOpenImagePreview={openImagePreview}
              onToggleLike={handleOptimisticLike}
              onPressMention={handleMentionPress}
              onPressHashtag={handleHashtagPress}
              onToggleFollow={async (userId) => {
                try {
                  setActionLoading(`follow-${userId}`);
                  await dispatch(toggleFollow(userId));
                } finally {
                  setActionLoading(null);
                }
              }}
              onDeleteTweet={async (tweetId) => {
                try {
                  setActionLoading(`delete-${tweetId}`);
                  await dispatch(deleteTweet(tweetId));
                } finally {
                  setActionLoading(null);
                }
              }}
              onToggleRetweet={async (tweetId) => {
                try {
                  setActionLoading(`retweet-${tweetId}`);
                  await dispatch(toggleRetweet(tweetId));
                } finally {
                  setActionLoading(null);
                }
              }}
            />
          );
        }}
      />

      <TweetOptionsSheet
        visible={showSheet}
        s={s}
        theme={theme}
        isDark={isDark}
        t={t}
        sheetMode={sheetMode}
        selectedUser={selectedUser}
        selectedTweet={selectedTweet}
        selectedUserIsMe={Boolean(selectedUserIsMe)}
        selectedUserIsFollowing={selectedUserIsFollowing}
        isAdmin={isAdmin}
        currentUser={user}
        actionLoading={actionLoading}
        reportSubmitting={reportSubmitting}
        reportTarget={reportTarget}
        selectedReason={selectedReason}
        reportDetails={reportDetails}
        onClose={closeSheet}
        onViewTweet={() => {
          if (!selectedTweet?._id) return;

          closeSheet();

          router.push({
            pathname: "/tweet/[id]",
            params: { id: selectedTweet._id },
          });
        }}
        onToggleFollow={async () => {
          if (!selectedUser?._id) return;

          try {
            setActionLoading(`sheet-follow-${selectedUser._id}`);

            await dispatch(toggleFollow(selectedUser._id));

            closeSheet();

            if (activeTab === "following") {
              setFollowingPage(1);
              await dispatch(getFollowingFeed({ page: 1 }));
            } else {
              setForYouPage(1);
              await dispatch(getForYouFeed({ page: 1 }));
            }
          } finally {
            setActionLoading(null);
          }
        }}
        onToggleBlock={handleToggleBlock}
        onDeleteTweet={async () => {
          if (!selectedTweet?._id) return;

          try {
            setActionLoading(`delete-${selectedTweet._id}`);
            await dispatch(deleteTweet(selectedTweet._id));
            closeSheet();
          } finally {
            setActionLoading(null);
          }
        }}
        onOpenReport={openReportInSheet}
        onBackToMenu={backToMenu}
        onSelectReason={setSelectedReasonLocal}
        onChangeReportDetails={setReportDetailsLocal}
        onSubmitReport={handleSubmitReport}
      />

      <ImagePreviewModal
        visible={showImageModal}
        imageUrl={previewImage}
        onClose={closeImagePreview}
        s={s}
      />

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