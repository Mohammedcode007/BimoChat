import { timeAgo } from "@/utils/helpFunctions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { UserBadges } from "./badges";
import { extractFirstUrl, isValidUrl } from "./helpers";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { Action } from "./TweetActions";
import { TweetMediaGrid } from "./TweetMediaGrid";
import { ExpandableTweetText } from "./TweetText";

type TweetCardProps = {
  item: any;
  s: any;
  theme: any;
  isDark: boolean;
  user: any;
  isAdmin: boolean;
  followingMap: Record<string, boolean>;
  actionLoading: string | null;
  optimisticLike?: {
    isLiked: boolean;
    likesCount: number;
  };
  t: any;

  onOpenTweet: (tweet: any) => void;
  onOpenSheet: (tweet: any) => void;
  onOpenImagePreview: (url: string) => void;

  onToggleFollow: (userId: string) => void | Promise<void>;
  onDeleteTweet: (tweetId: string) => void | Promise<void>;
  onToggleLike: (tweet: any) => void;
  onToggleRetweet: (tweetId: string) => void | Promise<void>;

  onPressMention: (mention: string) => void;
  onPressHashtag: (hashtag: string) => void;
};

export function TweetCard({
  item,
  s,
  theme,
  isDark,
  user,
  isAdmin,
  followingMap,
  actionLoading,
  optimisticLike,
  t,
  onOpenTweet,
  onOpenSheet,
  onOpenImagePreview,
  onToggleFollow,
  onDeleteTweet,
  onToggleLike,
  onToggleRetweet,
  onPressMention,
  onPressHashtag,
}: TweetCardProps) {
  const router = useRouter();

  const isOwnTweet = item?.author?._id === user?._id;
  const canDeleteTweet = isOwnTweet || isAdmin;

  const displayIsLiked = optimisticLike?.isLiked ?? Boolean(item?.isLiked);

  const displayLikesCount =
    optimisticLike?.likesCount ?? Number(item?.likesCount || 0);

  const isFollowing =
    followingMap?.[item?.author?._id] ??
    item?.author?.isFollowing ??
    false;


  const avatarUri = isValidUrl(item?.author?.avatar)
    ? item.author.avatar
    : "https://i.pinimg.com/736x/a9/5e/7a/a95e7a415633a614613e757bac4246ed.jpg";

  const linkPreview = item?.linkPreview ?? null;

  const detectedUrl =
    linkPreview?.url || extractFirstUrl(item?.content || "");

  const isRetweetItem = item?.feedType === "retweet";

  const retweetedByName =
    item?.retweetedBy?.username ||
    item?.retweetedBy?.displayName ||
    item?.retweetedBy?.atUsername ||
    "Someone";

  const originalAuthorName =
    item?.originalAuthor?.username ||
    item?.author?.username ||
    item?.originalAuthor?.displayName ||
    "Someone";

  return (
    <Swipeable
      renderRightActions={() =>
        canDeleteTweet ? (
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => onDeleteTweet(item._id)}
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
      <View style={s.cardWrap}>
        {isRetweetItem && (
          <View style={s.retweetHeader}>
            <Ionicons
              name="repeat-outline"
              size={14}
              color={theme.mutedText}
            />

            <Text style={s.retweetHeaderText} numberOfLines={1}>
              {retweetedByName} retweeted {originalAuthorName}
            </Text>
          </View>
        )}

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

                  <Text style={s.time}>
                    {timeAgo(
                      item.feedType === "retweet"
                        ? item.retweetedAt ||
                            item.feedCreatedAt ||
                            item.createdAt
                        : item.createdAt
                    )}
                  </Text>
                </View>
              </View>

              {/* {!isOwnTweet && (
                <TouchableOpacity
                  style={[
                    s.followBtn,
                    isFollowing ? s.followBtnOn : s.followBtnOff,
                  ]}
                  onPress={() => onToggleFollow(item.author._id)}
                  activeOpacity={0.9}
                >
                  {actionLoading === `follow-${item.author._id}` ? (
                    <ActivityIndicator
                      color={isFollowing ? theme.text : theme.tint}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name={
                        isFollowing
                          ? "checkmark-circle-outline"
                          : "person-add-outline"
                      }
                      size={18}
                      color={
                        isFollowing
                          ? isDark
                            ? "#FFFFFF"
                            : "#111827"
                          : theme.tint
                      }
                    />
                  )}
                </TouchableOpacity>
              )} */}

              <TouchableOpacity
                onPress={() => onOpenSheet(item)}
                style={s.moreBtn}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onOpenTweet(item)}
            >
              <ExpandableTweetText
                text={item.content}
                s={s}
                onPressMention={onPressMention}
                onPressHashtag={onPressHashtag}
              />
            </TouchableOpacity>

            {Array.isArray(item.media) && item.media.length > 0 && (
              <TweetMediaGrid
                media={item.media}
                s={s}
                onPressImage={onOpenImagePreview}
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
                loading={false}
                icon={displayIsLiked ? "heart" : "heart-outline"}
                value={displayLikesCount}
                color={displayIsLiked ? "#EF4444" : s._iconColor}
                textColor={displayIsLiked ? "#EF4444" : undefined}
                onPress={() => onToggleLike(item)}
              />

              <Action
                s={s}
                loading={actionLoading === `retweet-${item._id}`}
                icon="repeat-outline"
                value={item.retweetsCount}
                color={item.isRetweeted ? "#22C55E" : s._iconColor}
                textColor={item.isRetweeted ? "#22C55E" : undefined}
                onPress={() => onToggleRetweet(item._id)}
              />

              <Action
                s={s}
                loading={false}
                icon="chatbubble-outline"
                value={item.repliesCount}
                onPress={() => onOpenTweet(item)}
              />
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}