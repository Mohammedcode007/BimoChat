// import api from "@/services/api";
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { toggleFollow } from "./followSlice";

// /* =========================================================
//    TYPES
// ========================================================= */

// export interface Author {
//   _id: string;
//   username: string;
//   atUsername: string;
//   avatar?: string;
//   isVerified?: boolean;
//   isFollowing?: boolean;
// }

// export interface Tweet {
//   _id: string;
//   author: Author;
//   content: string;
//   media?: string[];
//   likesCount: number;
//   retweetsCount: number;
//   repliesCount: number;
//   isLiked?: boolean;
//   isRetweeted?: boolean;
//   isBookmarked?: boolean;
//   createdAt: string;
// }

// export interface Comment {
//   _id: string;
//   user: Author;
//   content: string;
//   createdAt: string;
// }

// interface TweetState {
//   forYou: Tweet[];
//   following: Tweet[];
//   currentTweet: Tweet | null;
//   comments: Comment[];
//   loading: boolean;
//   error: string | null;
//   hasMore: boolean;
// }

// const initialState: TweetState = {
//   forYou: [],
//   following: [],
//   currentTweet: null,
//   comments: [],
//   loading: false,
//   error: null,
//   hasMore: true
// };

// /* =========================================================
//    ASYNC ACTIONS
// ========================================================= */

// export const createTweet = createAsyncThunk(
//   "tweets/create",
//   async (data: any) => {
//     const res = await api.post("/tweets", data);
//     return res.data;
//   }
// );

// export const getForYouFeed = createAsyncThunk(
//   "tweets/getForYou",
//   async ({ page = 1 }: { page?: number }) => {
//     const res = await api.get(`/tweets/feed/foryou?page=${page}&limit=10`);
//     return { tweets: res.data, page };
//   }
// );

// export const getFollowingFeed = createAsyncThunk(
//   "tweets/getFollowing",
//   async ({ page = 1 }: { page?: number }) => {
//     const res = await api.get(`/tweets/feed/following?page=${page}&limit=10`);
//     return { tweets: res.data, page };
//   }
// );

// export const toggleLike = createAsyncThunk(
//   "tweets/toggleLike",
//   async (tweetId: string) => {
//     const res = await api.post(`/tweets/${tweetId}/like`);
//     return { tweetId, ...res.data };
//   }
// );

// export const toggleRetweet = createAsyncThunk(
//   "tweets/toggleRetweet",
//   async (tweetId: string) => {
//     const res = await api.post(`/tweets/${tweetId}/retweet`);
//     return { tweetId, ...res.data };
//   }
// );

// export const toggleBookmark = createAsyncThunk(
//   "tweets/toggleBookmark",
//   async (tweetId: string) => {
//     const res = await api.post(`/tweets/${tweetId}/bookmark`);
//     return { tweetId, ...res.data };
//   }
// );

// export const addComment = createAsyncThunk(
//   "tweets/comment",
//   async ({ tweetId, content }: { tweetId: string; content: string }) => {
//     const res = await api.post(`/tweets/${tweetId}/comment`, { content });
//     return { tweetId, comment: res.data };
//   }
// );

// export const getComments = createAsyncThunk(
//   "tweets/getComments",
//   async (tweetId: string) => {
//     const res = await api.get(`/tweets/${tweetId}/comments`);
//     return res.data;
//   }
// );

// export const deleteTweet = createAsyncThunk(
//   "tweets/delete",
//   async (tweetId: string) => {
//     await api.delete(`/tweets/${tweetId}`);
//     return tweetId;
//   }
// );

// /* =========================================================
//    SLICE
// ========================================================= */

// const tweetSlice = createSlice({
//   name: "tweets",
//   initialState,
//   reducers: {
//     resetTweets: (state) => {
//       state.forYou = [];
//       state.following = [];
//       state.hasMore = true;
//     }
//   },
//   extraReducers: (builder) => {

//     /* ================= CREATE ================= */

//     builder.addCase(createTweet.fulfilled, (state, action) => {
//       state.forYou.unshift(action.payload);
//       state.following.unshift(action.payload);
//     });

//     /* ================= FOR YOU ================= */

//     builder.addCase(getForYouFeed.fulfilled, (state, action) => {
//       const { tweets, page } = action.payload;
//       if (page === 1) state.forYou = tweets;
//       else state.forYou.push(...tweets);
//       state.hasMore = tweets.length === 10;
//     });

//     /* ================= FOLLOWING ================= */

//     builder.addCase(getFollowingFeed.fulfilled, (state, action) => {
//       const { tweets, page } = action.payload;
//       if (page === 1) state.following = tweets;
//       else state.following.push(...tweets);
//     });

//     /* ================= LIKE ================= */

//     builder.addCase(toggleLike.fulfilled, (state, action) => {
//       const { tweetId, liked } = action.payload;

//       const update = (arr: Tweet[]) => {
//         const tweet = arr.find(t => t._id === tweetId);
//         if (!tweet) return;
//         tweet.isLiked = liked;
//         tweet.likesCount += liked ? 1 : -1;
//       };

//       update(state.forYou);
//       update(state.following);
//     });

//     /* ================= RETWEET ================= */

//     builder.addCase(toggleRetweet.fulfilled, (state, action) => {
//       const { tweetId, retweeted } = action.payload;

//       const update = (arr: Tweet[]) => {
//         const tweet = arr.find(t => t._id === tweetId);
//         if (!tweet) return;
//         tweet.isRetweeted = retweeted;
//         tweet.retweetsCount += retweeted ? 1 : -1;
//       };

//       update(state.forYou);
//       update(state.following);
//     });

//     /* ================= BOOKMARK ================= */

//     builder.addCase(toggleBookmark.fulfilled, (state, action) => {
//       const { tweetId, bookmarked } = action.payload;

//       const update = (arr: Tweet[]) => {
//         const tweet = arr.find(t => t._id === tweetId);
//         if (!tweet) return;
//         tweet.isBookmarked = bookmarked;
//       };

//       update(state.forYou);
//       update(state.following);
//     });

//     /* ================= COMMENTS ================= */

//     builder.addCase(getComments.fulfilled, (state, action) => {
//       state.comments = action.payload;
//     });

//     builder.addCase(addComment.fulfilled, (state, action) => {
//       state.comments.unshift(action.payload.comment);

//       const updateReplies = (arr: Tweet[]) => {
//         const tweet = arr.find(t => t._id === action.payload.tweetId);
//         if (tweet) tweet.repliesCount += 1;
//       };

//       updateReplies(state.forYou);
//       updateReplies(state.following);
//     });

//     /* ================= DELETE ================= */

//     builder.addCase(deleteTweet.fulfilled, (state, action) => {
//       state.forYou = state.forYou.filter(t => t._id !== action.payload);
//       state.following = state.following.filter(t => t._id !== action.payload);
//     });

//     /* ================= FOLLOW SYNC ================= */

//     builder.addCase(toggleFollow.pending, (state, action) => {
//       const targetId = action.meta.arg;

//       const update = (arr: Tweet[]) => {
//         arr.forEach(tweet => {
//           if (tweet.author._id === targetId) {
//             const current = tweet.author.isFollowing ?? false;
//             tweet.author.isFollowing = !current;
//           }
//         });
//       };

//       update(state.forYou);
//       update(state.following);
//     });

//     builder.addCase(toggleFollow.rejected, (state, action) => {
//       const targetId = action.meta.arg;

//       const rollback = (arr: Tweet[]) => {
//         arr.forEach(tweet => {
//           if (tweet.author._id === targetId) {
//             const current = tweet.author.isFollowing ?? false;
//             tweet.author.isFollowing = !current;
//           }
//         });
//       };

//       rollback(state.forYou);
//       rollback(state.following);
//     });

//     builder.addCase(toggleFollow.fulfilled, (state, action) => {
//       const { targetId, following } = action.payload;

//       const sync = (arr: Tweet[]) => {
//         arr.forEach(tweet => {
//           if (tweet.author._id === targetId) {
//             tweet.author.isFollowing = following;
//           }
//         });
//       };

//       sync(state.forYou);
//       sync(state.following);

//       // 🔥 إزالة التويتات من following عند Unfollow
//       if (!following) {
//         state.following = state.following.filter(
//           tweet => tweet.author._id !== targetId
//         );
//       }
//     });

//   }
// });

// export const { resetTweets } = tweetSlice.actions;
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
}

export interface Tweet {
  _id: string;
  author: Author;
  content: string;
  media?: string[];
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: Author;
  content: string;
  createdAt: string;
}

interface TweetState {
  forYou: Tweet[];
  following: Tweet[];
  currentTweet: Tweet | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: TweetState = {
  forYou: [],
  following: [],
  currentTweet: null,
  comments: [],
  loading: false,
  error: null,
  hasMore: true
};

/* =========================================================
   ASYNC ACTIONS
========================================================= */

export const createTweet = createAsyncThunk(
  "tweets/create",
  async (data: any) => {
    const res = await api.post("/tweets", data);
    return res.data;
  }
);

export const getForYouFeed = createAsyncThunk(
  "tweets/getForYou",
  async ({ page = 1 }: { page?: number }) => {
    const res = await api.get(`/tweets/feed/foryou?page=${page}&limit=10`);
    return { tweets: res.data, page };
  }
);

export const getFollowingFeed = createAsyncThunk(
  "tweets/getFollowing",
  async ({ page = 1 }: { page?: number }) => {
    const res = await api.get(`/tweets/feed/following?page=${page}&limit=10`);
    return { tweets: res.data, page };
  }
);

/* 🔥 GET SINGLE TWEET */

export const getSingleTweet = createAsyncThunk(
  "tweets/getSingle",
  async (tweetId: string) => {
    const res = await api.get(`/tweets/${tweetId}`);
    return res.data;
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
    return { tweetId, comment: res.data };
  }
);

export const getComments = createAsyncThunk(
  "tweets/getComments",
  async (tweetId: string) => {
    const res = await api.get(`/tweets/${tweetId}/comments`);
    return res.data;
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
    }
  },
  extraReducers: (builder) => {

    /* ================= CREATE ================= */

    builder.addCase(createTweet.fulfilled, (state, action) => {
      state.forYou.unshift(action.payload);
      state.following.unshift(action.payload);
    });

    /* ================= FOR YOU ================= */

    builder.addCase(getForYouFeed.fulfilled, (state, action) => {
      const { tweets, page } = action.payload;
      if (page === 1) state.forYou = tweets;
      else state.forYou.push(...tweets);
      state.hasMore = tweets.length === 10;
    });

    /* ================= FOLLOWING ================= */

    builder.addCase(getFollowingFeed.fulfilled, (state, action) => {
      const { tweets, page } = action.payload;
      if (page === 1) state.following = tweets;
      else state.following.push(...tweets);
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

      const update = (arr: Tweet[]) => {
        const tweet = arr.find(t => t._id === tweetId);
        if (!tweet) return;
        tweet.isLiked = liked;
        tweet.likesCount += liked ? 1 : -1;
      };

      update(state.forYou);
      update(state.following);

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isLiked = liked;
        state.currentTweet.likesCount += liked ? 1 : -1;
      }
    });

    /* ================= RETWEET ================= */

    builder.addCase(toggleRetweet.fulfilled, (state, action) => {
      const { tweetId, retweeted } = action.payload;

      const update = (arr: Tweet[]) => {
        const tweet = arr.find(t => t._id === tweetId);
        if (!tweet) return;
        tweet.isRetweeted = retweeted;
        tweet.retweetsCount += retweeted ? 1 : -1;
      };

      update(state.forYou);
      update(state.following);

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isRetweeted = retweeted;
        state.currentTweet.retweetsCount += retweeted ? 1 : -1;
      }
    });

    /* ================= BOOKMARK ================= */

    builder.addCase(toggleBookmark.fulfilled, (state, action) => {
      const { tweetId, bookmarked } = action.payload;

      const update = (arr: Tweet[]) => {
        const tweet = arr.find(t => t._id === tweetId);
        if (!tweet) return;
        tweet.isBookmarked = bookmarked;
      };

      update(state.forYou);
      update(state.following);

      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet.isBookmarked = bookmarked;
      }
    });

    /* ================= COMMENTS ================= */

    builder.addCase(getComments.fulfilled, (state, action) => {
      state.comments = action.payload;
    });

    builder.addCase(addComment.fulfilled, (state, action) => {
      state.comments.unshift(action.payload.comment);

      const updateReplies = (arr: Tweet[]) => {
        const tweet = arr.find(t => t._id === action.payload.tweetId);
        if (tweet) tweet.repliesCount += 1;
      };

      updateReplies(state.forYou);
      updateReplies(state.following);

      if (
        state.currentTweet &&
        state.currentTweet._id === action.payload.tweetId
      ) {
        state.currentTweet.repliesCount += 1;
      }
    });

    /* ================= DELETE ================= */

    builder.addCase(deleteTweet.fulfilled, (state, action) => {
      state.forYou = state.forYou.filter(t => t._id !== action.payload);
      state.following = state.following.filter(t => t._id !== action.payload);

      if (state.currentTweet && state.currentTweet._id === action.payload) {
        state.currentTweet = null;
      }
    });

    /* ================= FOLLOW SYNC ================= */

    builder.addCase(toggleFollow.pending, (state, action) => {
      const targetId = action.meta.arg;

      const update = (arr: Tweet[]) => {
        arr.forEach(tweet => {
          if (tweet.author._id === targetId) {
            const current = tweet.author.isFollowing ?? false;
            tweet.author.isFollowing = !current;
          }
        });
      };

      update(state.forYou);
      update(state.following);

      if (
        state.currentTweet &&
        state.currentTweet.author._id === targetId
      ) {
        const current = state.currentTweet.author.isFollowing ?? false;
        state.currentTweet.author.isFollowing = !current;
      }
    });

    builder.addCase(toggleFollow.fulfilled, (state, action) => {
      const { targetId, following } = action.payload;

      const sync = (arr: Tweet[]) => {
        arr.forEach(tweet => {
          if (tweet.author._id === targetId) {
            tweet.author.isFollowing = following;
          }
        });
      };

      sync(state.forYou);
      sync(state.following);

      if (
        state.currentTweet &&
        state.currentTweet.author._id === targetId
      ) {
        state.currentTweet.author.isFollowing = following;
      }

      if (!following) {
        state.following = state.following.filter(
          tweet => tweet.author._id !== targetId
        );
      }
    });

  }
});

export const { resetTweets } = tweetSlice.actions;
export default tweetSlice.reducer;
