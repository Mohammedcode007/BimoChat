
// export default tweetSlice.reducer;
import api from "@/services/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toggleFollow } from "./followSlice";

/* =========================================================
   TYPES
========================================================= */

export interface Author {
  _id: string;
  username: string;
  atUsername: string;
  avatar?: string;
  isVerified?: boolean;
  isFollowing?: boolean;

  displayBadges?: string[];
  displayVerificationType?: "none" | "blue" | "gold" | "business";

  badges?: string[];
  verificationType?: "none" | "blue" | "gold" | "business";
  activeCustomization?: {
    badges?: string[];
    verificationType?: "none" | "blue" | "gold" | "business";
  };
}
export interface LikeUser {
  _id: string;
  username: string;
  atUsername: string;
  avatar?: string;
  isVerified?: boolean;
  displayBadges?: string[];
  displayVerificationType?: "none" | "blue" | "gold" | "business";
  badges?: string[];
  verificationType?: "none" | "blue" | "gold" | "business";
  activeCustomization?: {
    badges?: string[];
    verificationType?: "none" | "blue" | "gold" | "business";
  };
}
export interface TweetMediaItem {
  url: string;
  publicId?: string;
  type: "image" | "video";
}

export interface TweetLinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface Tweet {
  _id: string;

  /**
   * tweet = تويتة عادية
   * retweet = عنصر ريتويت في التايملاين
   */
  feedType?: "tweet" | "retweet";

  /**
   * خاص بالريتويت
   */
  retweetId?: string;
  retweetedAt?: string;
  feedCreatedAt?: string;
  retweetedBy?: Author | null;
  originalAuthor?: Author | null;

  author: Author;
  content: string;
  media?: TweetMediaItem[];
  linkPreview?: TweetLinkPreview;

  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  viewsCount?: number;

  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;

  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  tweet?: string;
  user: Author;
  content: string;
  createdAt: string;
  updatedAt?: string;

  parentComment?: string | null;
  mentions?: string[];

  likesCount: number;
  repliesCount: number;

  isLiked?: boolean;
  isHidden?: boolean;

  replies?: Comment[];
}

interface TweetState {
  forYou: Tweet[];
  following: Tweet[];
  profileTweets: Tweet[];
  currentTweet: Tweet | null;
  comments: Comment[];
  loading: boolean;
  loadingProfileTweets: boolean;
  likesUsers: LikeUser[];
  likesUsersLoading: boolean;
  error: string | null;
  profileTweetsError: string | null;
  hasMore: boolean;
  profileTweetsHasMore: boolean;
}

const initialState: TweetState = {
  forYou: [],
  following: [],
  profileTweets: [],
  currentTweet: null,
  comments: [],
  loading: false,
  loadingProfileTweets: false,
  likesUsers: [],
  likesUsersLoading: false,
  error: null,
  profileTweetsError: null,
  hasMore: true,
  profileTweetsHasMore: true,
};

/* =========================================================
   HELPERS
========================================================= */

function updateCommentInTree(
  comments: Comment[],
  commentId: string,
  updater: (comment: Comment) => void
): boolean {
  for (const comment of comments) {
    if (comment._id === commentId) {
      updater(comment);
      return true;
    }

    if (comment.replies?.length) {
      const found = updateCommentInTree(comment.replies, commentId, updater);
      if (found) return true;
    }
  }

  return false;
}

function appendReplyToTree(
  comments: Comment[],
  parentCommentId: string,
  reply: Comment
): boolean {
  for (const comment of comments) {
    if (comment._id === parentCommentId) {
      if (!comment.replies) comment.replies = [];
      comment.replies.unshift(reply);
      comment.repliesCount = (comment.repliesCount || 0) + 1;
      return true;
    }

    if (comment.replies?.length) {
      const found = appendReplyToTree(comment.replies, parentCommentId, reply);
      if (found) return true;
    }
  }

  return false;
}

function ensureCommentDefaults(comment: Comment): Comment {
  return {
    ...comment,
    likesCount: comment.likesCount ?? 0,
    repliesCount: comment.repliesCount ?? 0,
    isLiked: comment.isLiked ?? false,
    replies: (comment.replies ?? []).map(ensureCommentDefaults),
  };
}
function normalizeCommentResponse(data: any): Comment {
  const rawComment = data?.comment || data?.reply || data;

  const user = rawComment?.user;

  return ensureCommentDefaults({
    ...rawComment,

    user:
      user && typeof user === "object"
        ? {
          ...user,

          username:
            user.username ||
            user.displayName ||
            user.atUsername ||
            "user",

          atUsername:
            user.atUsername ||
            user.username ||
            "",

          avatar:
            user.avatar ||
            user.avatarUrl ||
            user.profileImage ||
            "",

          displayBadges:
            Array.isArray(user.displayBadges) && user.displayBadges.length > 0
              ? user.displayBadges
              : Array.isArray(user.activeCustomization?.badges) &&
                user.activeCustomization.badges.length > 0
                ? user.activeCustomization.badges
                : user.badges || [],

          displayVerificationType:
            user.displayVerificationType ||
            user.activeCustomization?.verificationType ||
            user.verificationType ||
            "none",
        }
        : {
          _id: typeof user === "string" ? user : "",
          username: "user",
          atUsername: "",
          avatar: "",
          isVerified: false,
          displayBadges: [],
          displayVerificationType: "none",
        },
  } as Comment);
}
function normalizeAuthor(user: any): Author {
  if (!user || typeof user !== "object") {
    return {
      _id: "",
      username: "user",
      atUsername: "",
      avatar: "",
      isVerified: false,
      displayBadges: [],
      displayVerificationType: "none",
    };
  }

  return {
    ...user,

    _id: String(user._id || ""),

    username:
      user.username ||
      user.displayName ||
      user.name ||
      user.atUsername ||
      "user",

    atUsername:
      user.atUsername ||
      user.username ||
      "",

    avatar:
      user.avatar ||
      user.avatarUrl ||
      user.profileImage ||
      "",

    isVerified: user.isVerified ?? false,

    displayBadges:
      Array.isArray(user.displayBadges) && user.displayBadges.length > 0
        ? user.displayBadges
        : Array.isArray(user.activeCustomization?.badges) &&
          user.activeCustomization.badges.length > 0
          ? user.activeCustomization.badges
          : user.badges || [],

    displayVerificationType:
      user.displayVerificationType ||
      user.activeCustomization?.verificationType ||
      user.verificationType ||
      "none",

    badges: user.badges || [],
    verificationType: user.verificationType || "none",
    activeCustomization: user.activeCustomization || {},
  };
}

function normalizeTweetResponse(item: any): Tweet {
  return {
    ...item,

    _id: String(item?._id || ""),

    feedType: item?.feedType || "tweet",

    retweetId: item?.retweetId ? String(item.retweetId) : undefined,
    retweetedAt: item?.retweetedAt,
    feedCreatedAt: item?.feedCreatedAt,

    retweetedBy: item?.retweetedBy
      ? normalizeAuthor(item.retweetedBy)
      : null,

    originalAuthor: item?.originalAuthor
      ? normalizeAuthor(item.originalAuthor)
      : item?.author
        ? normalizeAuthor(item.author)
        : null,

    author: normalizeAuthor(item?.author),

    content: String(item?.content || ""),

    media: Array.isArray(item?.media) ? item.media : [],

    likesCount: item?.likesCount ?? 0,
    retweetsCount: item?.retweetsCount ?? 0,
    repliesCount: item?.repliesCount ?? 0,
    viewsCount: item?.viewsCount ?? 0,

    isLiked: item?.isLiked ?? false,
    isRetweeted: item?.isRetweeted ?? false,
    isBookmarked: item?.isBookmarked ?? false,

    createdAt: item?.createdAt || item?.feedCreatedAt || new Date().toISOString(),
    updatedAt: item?.updatedAt,
  };
}

function normalizeFeedResponse(data: any): Tweet[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.tweets)
        ? data.tweets
        : [];

  return list.map(normalizeTweetResponse).filter((tweet: { _id: any; }) => !!tweet._id);
}
function updateTweetInArray(
  arr: Tweet[],
  tweetId: string,
  updater: (tweet: Tweet) => void
) {
  arr.forEach((tweet) => {
    if (tweet._id === tweetId) {
      updater(tweet);
    }
  });
}
/* =========================================================
   ASYNC ACTIONS
========================================================= */

export const createTweet = createAsyncThunk(
  "tweets/create",
  async (data: any) => {
    const res = await api.post("/tweets", data);

    const tweet = res.data?.tweet || res.data;

    return normalizeTweetResponse({
      ...tweet,
      feedType: "tweet",
    });
  }
);

export const getForYouFeed = createAsyncThunk(
  "tweets/getForYou",
  async ({ page = 1 }: { page?: number }) => {
    const res = await api.get(`/tweets/feed/foryou?page=${page}&limit=10`);

    return {
      tweets: normalizeFeedResponse(res.data),
      page,
    };
  }
);
export const getUserTweets = createAsyncThunk(
  "tweets/getUserTweets",
  async (
    { userId, page = 1 }: { userId: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(`/tweets/user/${userId}?page=${page}&limit=10`);

      const data = res.data;

      const tweets = normalizeFeedResponse(data);

      return {
        tweets,
        page: data?.page ?? page,
        hasMore:
          typeof data?.hasMore === "boolean"
            ? data.hasMore
            : tweets.length === 10,
      };
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load user tweets"
      );
    }
  }
);
export const getFollowingFeed = createAsyncThunk(
  "tweets/getFollowing",
  async ({ page = 1 }: { page?: number }) => {
    const res = await api.get(`/tweets/feed/following?page=${page}&limit=10`);

    return {
      tweets: normalizeFeedResponse(res.data),
      page,
    };
  }
);
export const getTweetLikesUsers = createAsyncThunk(
  "tweets/getTweetLikesUsers",
  async (tweetId: string) => {
    const res = await api.get(`/tweets/${tweetId}/likes`);
    return res.data as LikeUser[];
  }
);

export const getCommentLikesUsers = createAsyncThunk(
  "tweets/getCommentLikesUsers",
  async (commentId: string) => {
    const res = await api.get(`/tweets/comments/${commentId}/likes`);
    return res.data as LikeUser[];
  }
);

export const getSingleTweet = createAsyncThunk(
  "tweets/getSingle",
  async (tweetId: string) => {
    const res = await api.get(`/tweets/${tweetId}`);
    return normalizeTweetResponse(res.data?.tweet || res.data);
  }
);
export const toggleLike = createAsyncThunk(
  "tweets/toggleLike",
  async (tweetId: string) => {
    const res = await api.post(`/tweets/${tweetId}/like`);
    return { tweetId, ...res.data };
  }
);

export const toggleRetweet = createAsyncThunk(
  "tweets/toggleRetweet",
  async (tweetId: string) => {
    const res = await api.post(`/tweets/${tweetId}/retweet`);
    return { tweetId, ...res.data };
  }
);

export const toggleBookmark = createAsyncThunk(
  "tweets/toggleBookmark",
  async (tweetId: string) => {
    const res = await api.post(`/tweets/${tweetId}/bookmark`);
    return { tweetId, ...res.data };
  }
);

export const addComment = createAsyncThunk(
  "tweets/comment",
  async ({ tweetId, content }: { tweetId: string; content: string }) => {
    const res = await api.post(`/tweets/${tweetId}/comment`, { content });

    const comment = normalizeCommentResponse(res.data);

    return {
      tweetId,
      comment,
    };
  }
);

export const getComments = createAsyncThunk(
  "tweets/getComments",
  async (tweetId: string) => {
    const res = await api.get(`/tweets/${tweetId}/comments`);
    return res.data as Comment[];
  }
);

export const toggleCommentLike = createAsyncThunk(
  "tweets/toggleCommentLike",
  async (commentId: string) => {
    const res = await api.post(`/tweets/comments/${commentId}/like`);
    return { commentId, ...res.data };
  }
);

export const replyToComment = createAsyncThunk(
  "tweets/replyToComment",
  async ({
    commentId,
    content,
  }: {
    commentId: string;
    content: string;
  }) => {
    const res = await api.post(`/tweets/comments/${commentId}/reply`, {
      content,
    });

    const reply = normalizeCommentResponse(res.data);

    return {
      commentId,
      reply,
    };
  }
);

export const getCommentReplies = createAsyncThunk(
  "tweets/getCommentReplies",
  async (commentId: string) => {
    const res = await api.get(`/tweets/comments/${commentId}/replies`);
    return {
      commentId,
      replies: res.data as Comment[],
    };
  }
);

export const deleteTweet = createAsyncThunk(
  "tweets/delete",
  async (tweetId: string) => {
    await api.delete(`/tweets/${tweetId}`);
    return tweetId;
  }
);

/* =========================================================
   SLICE
========================================================= */

const tweetSlice = createSlice({
  name: "tweets",
  initialState,
  reducers: {
    resetTweets: (state) => {
      state.forYou = [];
      state.following = [];
      state.hasMore = true;
    },
    addOptimisticComment: (state, action) => {
      const comment = ensureCommentDefaults(action.payload);

      const exists = state.comments.some((c) => c._id === comment._id);
      if (!exists) {
        state.comments.unshift(comment);
      }

      if (state.currentTweet) {
        state.currentTweet.repliesCount = (state.currentTweet.repliesCount || 0) + 1;
      }

      updateTweetInArray(state.forYou, comment.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });

      updateTweetInArray(state.following, comment.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });

      updateTweetInArray(state.profileTweets, comment.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });
    },

    addOptimisticReply: (state, action) => {
      const { parentCommentId, reply } = action.payload;
      const safeReply = ensureCommentDefaults(reply);

      appendReplyToTree(state.comments, parentCommentId, safeReply);

      if (state.currentTweet) {
        state.currentTweet.repliesCount = (state.currentTweet.repliesCount || 0) + 1;
      }

      updateTweetInArray(state.forYou, safeReply.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });

      updateTweetInArray(state.following, safeReply.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });

      updateTweetInArray(state.profileTweets, safeReply.tweet || '', (tweet) => {
        tweet.repliesCount = (tweet.repliesCount || 0) + 1;
      });
    },

    removeOptimisticComment: (state, action) => {
      const tempId = action.payload;

      const removeFromTree = (arr: Comment[]): boolean => {
        const index = arr.findIndex((c) => c._id === tempId);

        if (index !== -1) {
          const removed = arr[index];
          arr.splice(index, 1);

          if (removed?.parentComment) {
            updateCommentInTree(state.comments, removed.parentComment, (parent) => {
              parent.repliesCount = Math.max(0, (parent.repliesCount || 0) - 1);
            });
          }

          if (state.currentTweet) {
            state.currentTweet.repliesCount = Math.max(
              0,
              (state.currentTweet.repliesCount || 0) - 1
            );
          }

          updateTweetInArray(state.forYou, removed.tweet || '', (tweet) => {
            tweet.repliesCount = Math.max(0, (tweet.repliesCount || 0) - 1);
          });

          updateTweetInArray(state.following, removed.tweet || '', (tweet) => {
            tweet.repliesCount = Math.max(0, (tweet.repliesCount || 0) - 1);
          });

          updateTweetInArray(state.profileTweets, removed.tweet || '', (tweet) => {
            tweet.repliesCount = Math.max(0, (tweet.repliesCount || 0) - 1);
          });

          return true;
        }

        for (const comment of arr) {
          if (comment.replies?.length) {
            const found = removeFromTree(comment.replies);
            if (found) return true;
          }
        }

        return false;
      };

      removeFromTree(state.comments);
    },

    replaceOptimisticComment: (state, action) => {
      const { tempId, realComment } = action.payload;
      const safeRealComment = ensureCommentDefaults(realComment);

      const replaceInTree = (arr: Comment[]): boolean => {
        const index = arr.findIndex((c) => c._id === tempId);

        if (index !== -1) {
          arr[index] = {
            ...safeRealComment,
            replies: arr[index].replies || safeRealComment.replies || [],
          };
          return true;
        }

        for (const comment of arr) {
          if (comment.replies?.length) {
            const found = replaceInTree(comment.replies);
            if (found) return true;
          }
        }

        return false;
      };

      replaceInTree(state.comments);
    },
    clearProfileTweets: (state) => {
      state.profileTweets = [];
      state.loadingProfileTweets = false;
      state.profileTweetsError = null;
      state.profileTweetsHasMore = true;
    },
    clearLikesUsers: (state) => {
      state.likesUsers = [];
      state.likesUsersLoading = false;
    },
    clearCurrentTweet: (state) => {
      state.currentTweet = null;
    },
    clearComments: (state) => {
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    /* ================= CREATE ================= */

    builder.addCase(createTweet.fulfilled, (state, action) => {
      const tweet = action.payload;

      if (!tweet?._id) return;

      const authorIsReady =
        tweet.author &&
        typeof tweet.author === "object" &&
        String(tweet.author.username || "").trim();

      if (!authorIsReady) {
        return;
      }

      const existsForYou = state.forYou.some((t) => t._id === tweet._id);
      if (!existsForYou) {
        state.forYou.unshift(tweet);
      }

      const existsFollowing = state.following.some((t) => t._id === tweet._id);
      if (!existsFollowing) {
        state.following.unshift(tweet);
      }

      const existsProfile = state.profileTweets.some((t) => t._id === tweet._id);
      if (!existsProfile) {
        state.profileTweets.unshift(tweet);
      }
    });
    builder.addCase(getTweetLikesUsers.pending, (state) => {
      state.likesUsersLoading = true;
      state.likesUsers = [];
    });

    builder.addCase(getTweetLikesUsers.fulfilled, (state, action) => {
      state.likesUsersLoading = false;
      state.likesUsers = action.payload;
    });

    builder.addCase(getTweetLikesUsers.rejected, (state) => {
      state.likesUsersLoading = false;
    });

    builder.addCase(getCommentLikesUsers.pending, (state) => {
      state.likesUsersLoading = true;
      state.likesUsers = [];
    });

    builder.addCase(getCommentLikesUsers.fulfilled, (state, action) => {
      state.likesUsersLoading = false;
      state.likesUsers = action.payload;
    });

    builder.addCase(getCommentLikesUsers.rejected, (state) => {
      state.likesUsersLoading = false;
    });

    /* ================= FOR YOU ================= */

    builder.addCase(getForYouFeed.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getForYouFeed.fulfilled, (state, action) => {
      const { tweets, page } = action.payload;
      state.loading = false;

      if (page === 1) state.forYou = tweets;
      else state.forYou.push(...tweets);

      state.hasMore = tweets.length === 10;
    });

    builder.addCase(getForYouFeed.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to load for you feed";
    });

    /* ================= FOLLOWING ================= */

    builder.addCase(getFollowingFeed.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getFollowingFeed.fulfilled, (state, action) => {
      const { tweets, page } = action.payload;
      state.loading = false;

      if (page === 1) state.following = tweets;
      else state.following.push(...tweets);
    });

    builder.addCase(getFollowingFeed.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to load following feed";
    });
    /* ================= PROFILE TWEETS ================= */

    builder.addCase(getUserTweets.pending, (state) => {
      state.loadingProfileTweets = true;
      state.profileTweetsError = null;
    });

    builder.addCase(getUserTweets.fulfilled, (state, action) => {
      const { tweets, page, hasMore } = action.payload;
      state.loadingProfileTweets = false;

      if (page === 1) state.profileTweets = tweets;
      else state.profileTweets.push(...tweets);

      state.profileTweetsHasMore = hasMore;
    });

    builder.addCase(getUserTweets.rejected, (state, action: any) => {
      state.loadingProfileTweets = false;
      state.profileTweetsError =
        action.payload || action.error?.message || "Failed to load user tweets";
    });
    /* ================= SINGLE TWEET ================= */

    builder.addCase(getSingleTweet.pending, (state) => {
      state.loading = true;
      state.currentTweet = null;
      state.error = null;
    });

    builder.addCase(getSingleTweet.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTweet = action.payload;
    });

    builder.addCase(getSingleTweet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to load tweet";
    });

    /* ================= LIKE ================= */

    builder.addCase(toggleLike.fulfilled, (state, action) => {
      const { tweetId, liked } = action.payload;

      updateTweetInArray(state.forYou, tweetId, (tweet) => {
        tweet.isLiked = liked;
        tweet.likesCount = Math.max(
          0,
          tweet.likesCount + (liked ? 1 : -1)
        );
      });

      updateTweetInArray(state.following, tweetId, (tweet) => {
        tweet.isLiked = liked;
        tweet.likesCount = Math.max(
          0,
          tweet.likesCount + (liked ? 1 : -1)
        );
      });

      updateTweetInArray(state.profileTweets, tweetId, (tweet) => {
        tweet.isLiked = liked;
        tweet.likesCount = Math.max(
          0,
          tweet.likesCount + (liked ? 1 : -1)
        );
      });

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isLiked = liked;
        state.currentTweet.likesCount = Math.max(
          0,
          state.currentTweet.likesCount + (liked ? 1 : -1)
        );
      }
    });

    /* ================= RETWEET ================= */

    builder.addCase(toggleRetweet.fulfilled, (state, action) => {
      const { tweetId, retweeted } = action.payload;

      updateTweetInArray(state.forYou, tweetId, (tweet) => {
        tweet.isRetweeted = retweeted;
        tweet.retweetsCount = Math.max(
          0,
          tweet.retweetsCount + (retweeted ? 1 : -1)
        );
      });
      updateTweetInArray(state.profileTweets, tweetId, (tweet) => {
        tweet.isRetweeted = retweeted;
        tweet.retweetsCount = Math.max(
          0,
          tweet.retweetsCount + (retweeted ? 1 : -1)
        );
      });
      updateTweetInArray(state.following, tweetId, (tweet) => {
        tweet.isRetweeted = retweeted;
        tweet.retweetsCount = Math.max(
          0,
          tweet.retweetsCount + (retweeted ? 1 : -1)
        );
      });

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isRetweeted = retweeted;
        state.currentTweet.retweetsCount = Math.max(
          0,
          state.currentTweet.retweetsCount + (retweeted ? 1 : -1)
        );
      }
    });

    /* ================= BOOKMARK ================= */

    builder.addCase(toggleBookmark.fulfilled, (state, action) => {
      const { tweetId, bookmarked } = action.payload;

      updateTweetInArray(state.forYou, tweetId, (tweet) => {
        tweet.isBookmarked = bookmarked;
      });
      updateTweetInArray(state.profileTweets, tweetId, (tweet) => {
        tweet.isBookmarked = bookmarked;
      });
      updateTweetInArray(state.following, tweetId, (tweet) => {
        tweet.isBookmarked = bookmarked;
      });

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isBookmarked = bookmarked;
      }
    });

    /* ================= COMMENTS ================= */

    builder.addCase(getComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getComments.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = action.payload.map(ensureCommentDefaults);
    });

    builder.addCase(getComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to load comments";
    });

    builder.addCase(addComment.fulfilled, (state, action) => {
      const safeComment = normalizeCommentResponse(action.payload.comment);

      if (!safeComment?._id) return;

      const exists = state.comments.some((c) => c._id === safeComment._id);

      if (!exists) {
        state.comments.unshift(safeComment);
      }
    });

    /* ================= COMMENT LIKE ================= */

    builder.addCase(toggleCommentLike.fulfilled, (state, action) => {
      const { commentId, liked } = action.payload;

      updateCommentInTree(state.comments, commentId, (comment) => {
        comment.isLiked = liked;
        comment.likesCount = Math.max(
          0,
          (comment.likesCount || 0) + (liked ? 1 : -1)
        );
      });
    });

    /* ================= GET COMMENT REPLIES ================= */

    builder.addCase(getCommentReplies.fulfilled, (state, action) => {
      const { commentId, replies } = action.payload;

      updateCommentInTree(state.comments, commentId, (comment) => {
        comment.replies = replies.map(ensureCommentDefaults);
      });
    });

    /* ================= REPLY TO COMMENT ================= */

    builder.addCase(replyToComment.fulfilled, (state, action) => {
      const { commentId, reply } = action.payload;
      const safeReply = normalizeCommentResponse(reply);

      if (!safeReply?._id) return;

      const alreadyExists = (() => {
        let found = false;

        const search = (arr: Comment[]) => {
          for (const c of arr) {
            if (c._id === safeReply._id) {
              found = true;
              return;
            }

            if (c.replies?.length) {
              search(c.replies);
              if (found) return;
            }
          }
        };

        search(state.comments);
        return found;
      })();

      if (!alreadyExists) {
        appendReplyToTree(state.comments, commentId, safeReply);
      }
    });
    /* ================= DELETE ================= */

    builder.addCase(deleteTweet.fulfilled, (state, action) => {
      state.forYou = state.forYou.filter((t) => t._id !== action.payload);
      state.following = state.following.filter((t) => t._id !== action.payload);
      state.profileTweets = state.profileTweets.filter((t) => t._id !== action.payload);

      if (state.currentTweet && state.currentTweet._id === action.payload) {
        state.currentTweet = null;
      }
    });
    /* ================= FOLLOW SYNC ================= */

    builder.addCase(toggleFollow.pending, (state, action) => {
      const targetId = action.meta.arg;

      const update = (arr: Tweet[]) => {
        arr.forEach((tweet) => {
          if (tweet.author._id === targetId) {
            const current = tweet.author.isFollowing ?? false;
            tweet.author.isFollowing = !current;
          }
        });
      };

      update(state.forYou);
      update(state.following);
      update(state.profileTweets);

      if (state.currentTweet && state.currentTweet.author._id === targetId) {
        const current = state.currentTweet.author.isFollowing ?? false;
        state.currentTweet.author.isFollowing = !current;
      }
    });

    builder.addCase(toggleFollow.fulfilled, (state, action) => {
      const { targetId, following } = action.payload;

      const sync = (arr: Tweet[]) => {
        arr.forEach((tweet) => {
          if (tweet.author._id === targetId) {
            tweet.author.isFollowing = following;
          }
        });
      };

      sync(state.forYou);
      sync(state.following);
      sync(state.profileTweets);
      if (state.currentTweet && state.currentTweet.author._id === targetId) {
        state.currentTweet.author.isFollowing = following;
      }

      if (!following) {
        state.following = state.following.filter(
          (tweet) => tweet.author._id !== targetId
        );
      }
    });
  },
});

export const {
  resetTweets,
  clearCurrentTweet,
  clearComments,
  addOptimisticComment,
  addOptimisticReply,
  removeOptimisticComment,
  replaceOptimisticComment,
  clearLikesUsers,
  clearProfileTweets,
} = tweetSlice.actions;
export default tweetSlice.reducer;