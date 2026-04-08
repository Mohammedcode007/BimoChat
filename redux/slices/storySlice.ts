
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

export type StoryType = "image" | "video" | "text";
export type StoryPrivacy = "public" | "followers" | "private";
export type StoryPreviewType = "image" | "video" | "text";

export type StoryItem = {
  _id: string;
  type: StoryType;
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  durationMs?: number;
  privacy: StoryPrivacy;
  viewsCount: number;
  viewers?: string[];
  createdAt: string;
  expiresAt: string;
  isArchived?: boolean;

  // ✅ حقول جديدة من الباك
  previewType?: StoryPreviewType;
  previewImage?: string;
  previewText?: string;
  hasPreviewImage?: boolean;
};

export type LatestStoryPreview = {
  storyId: string;
  type: StoryPreviewType;
  image?: string;
  text?: string;
  createdAt?: string;
};

export type StoryOwnerGroup = {
  _id: string;
  username: string;
  atUsername: string;
  avatar?: string;
  isOnline?: boolean;
  stories: StoryItem[];
  latestStoryAt?: string;

  // ✅ جديد
  latestPreview?: LatestStoryPreview | null;
};

export type StoryViewerUser = {
  _id: string;
  username: string;
  atUsername: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  verificationType?: string;
};

type ViewersResponse = {
  page: number;
  limit: number;
  total: number;
  count: number;
  viewers: StoryViewerUser[];
};

interface StoryState {
  feed: StoryOwnerGroup[];
  myStories: StoryOwnerGroup | null;

  viewersByStoryId: Record<string, ViewersResponse>;
  loadingFeed: boolean;
  loadingMy: boolean;
  loadingCreate: boolean;
  loadingDelete: boolean;
  loadingView: boolean;
  loadingViewers: boolean;

  error: string | null;

  // caching
  lastFeedFetchedAt?: number;

  // ✅ local seen cache
  seenStoryIds: Record<string, true>;
}

const initialState: StoryState = {
  feed: [],
  myStories: null,
  viewersByStoryId: {},
  loadingFeed: false,
  loadingMy: false,
  loadingCreate: false,
  loadingDelete: false,
  loadingView: false,
  loadingViewers: false,
  error: null,
  lastFeedFetchedAt: undefined,
  seenStoryIds: {},
};

/* =====================================================
   STORAGE KEYS
===================================================== */

const FEED_KEY = "storiesFeedCache";
const MY_KEY = "myStoriesCache";
const SEEN_KEY = "storiesSeenCache";

/* =====================================================
   HELPERS
===================================================== */

const saveCache = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const loadCache = async (key: string) => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

const loadSeenMap = async (): Promise<Record<string, true>> => {
  const v = await loadCache(SEEN_KEY);
  if (v && typeof v === "object") return v as Record<string, true>;
  return {};
};

const saveSeenMap = async (seen: Record<string, true>) => {
  await saveCache(SEEN_KEY, seen);
};

/* =====================================================
   NORMALIZERS
===================================================== */

const normalizeStoryItem = (story: any): StoryItem => {
  const type: StoryType = story?.type || "text";

  const previewType: StoryPreviewType =
    story?.previewType ||
    (type === "video" ? "video" : type === "image" ? "image" : "text");

  const previewImage =
    typeof story?.previewImage === "string"
      ? story.previewImage
      : type === "video"
      ? story?.thumbUrl || ""
      : type === "image"
      ? story?.mediaUrl || ""
      : "";

  const previewText =
    typeof story?.previewText === "string"
      ? story.previewText
      : type === "text"
      ? String(story?.text || "")
      : "";

  return {
    _id: String(story?._id || ""),
    type,
    text: story?.text || "",
    mediaUrl: story?.mediaUrl || "",
    thumbUrl: story?.thumbUrl || "",
    durationMs: Number(story?.durationMs || 6000),
    privacy: (story?.privacy || "public") as StoryPrivacy,
    viewsCount: Number(story?.viewsCount || 0),
    viewers: Array.isArray(story?.viewers) ? story.viewers : [],
    createdAt: String(story?.createdAt || ""),
    expiresAt: String(story?.expiresAt || ""),
    isArchived: !!story?.isArchived,

    previewType,
    previewImage,
    previewText,
    hasPreviewImage:
      typeof story?.hasPreviewImage === "boolean"
        ? story.hasPreviewImage
        : !!previewImage,
  };
};

const buildLatestPreviewFromStories = (
  stories: StoryItem[] | undefined
): LatestStoryPreview | null => {
  const first = Array.isArray(stories) ? stories[0] : null;
  if (!first?._id) return null;

  return {
    storyId: first._id,
    type: (first.previewType || first.type || "text") as StoryPreviewType,
    image: first.previewImage || "",
    text: first.previewText || "",
    createdAt: first.createdAt,
  };
};

const normalizeOwnerGroup = (group: any): StoryOwnerGroup => {
  const normalizedStories: StoryItem[] = Array.isArray(group?.stories)
    ? group.stories.map(normalizeStoryItem)
    : [];

  return {
    _id: String(group?._id || ""),
    username: group?.username || "",
    atUsername: group?.atUsername || "",
    avatar: group?.avatar || "",
    isOnline: !!group?.isOnline,
    latestStoryAt: group?.latestStoryAt || "",
    stories: normalizedStories,
    latestPreview:
      group?.latestPreview && typeof group.latestPreview === "object"
        ? {
            storyId: String(group.latestPreview.storyId || ""),
            type: (group.latestPreview.type || "text") as StoryPreviewType,
            image: group.latestPreview.image || "",
            text: group.latestPreview.text || "",
            createdAt: group.latestPreview.createdAt || "",
          }
        : buildLatestPreviewFromStories(normalizedStories),
  };
};

const refreshOwnerGroupPreview = (group: StoryOwnerGroup | null) => {
  if (!group) return;
  group.latestPreview = buildLatestPreviewFromStories(group.stories || []);
  group.latestStoryAt = group.stories?.[0]?.createdAt || group.latestStoryAt || "";
};

/* =====================================================
   LOAD CACHED
===================================================== */

export const loadStoriesCache = createAsyncThunk("stories/loadCache", async () => {
  const feedRaw = await loadCache(FEED_KEY);
  const myRaw = await loadCache(MY_KEY);
  const seen = await loadSeenMap();

  const feed = Array.isArray(feedRaw) ? feedRaw.map(normalizeOwnerGroup) : [];
  const my = myRaw ? normalizeOwnerGroup(myRaw) : null;

  return { feed, my, seen: seen || {} };
});

/* =====================================================
   FETCH FEED
===================================================== */

export const fetchStoriesFeed = createAsyncThunk(
  "stories/fetchFeed",
  async ({ page = 1, limit = 30 }: { page?: number; limit?: number }, thunkAPI) => {
    try {
      const res = await api.get(`/stories/feed?page=${page}&limit=${limit}`);
      const raw = res.data?.data || [];
      const data = Array.isArray(raw) ? raw.map(normalizeOwnerGroup) : [];
      await saveCache(FEED_KEY, data);
      return { data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load stories feed"
      );
    }
  }
);

/* =====================================================
   FETCH MY STORIES
===================================================== */

export const fetchMyStories = createAsyncThunk(
  "stories/fetchMyStories",
  async (_, thunkAPI) => {
    try {
      const res = await api.get(`/stories/me`);
      const raw = res.data?.data || null;
      const data = raw ? normalizeOwnerGroup(raw) : null;
      await saveCache(MY_KEY, data);
      return { data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load my stories"
      );
    }
  }
);

/* =====================================================
   CREATE STORY
===================================================== */

export const createStory = createAsyncThunk(
  "stories/create",
  async (
    payload: {
      type: StoryType;
      text?: string;
      mediaUrl?: string;
      privacy?: StoryPrivacy;
      durationMs?: number;
      thumbUrl?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await api.post(`/stories`, payload);
      const rawStory = res.data?.data || null;
      const story = rawStory ? normalizeStoryItem(rawStory) : null;
      return { story };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create story"
      );
    }
  }
);

/* =====================================================
   DELETE STORY
===================================================== */

export const deleteStory = createAsyncThunk(
  "stories/delete",
  async (storyId: string, thunkAPI) => {
    try {
      await api.delete(`/stories/${storyId}`);
      return { storyId };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete story"
      );
    }
  }
);

/* =====================================================
   VIEW STORY
===================================================== */

export const viewStory = createAsyncThunk(
  "stories/view",
  async (storyId: string, thunkAPI) => {
    try {
      const res = await api.post(`/stories/${storyId}/view`);
      const viewedNow = Boolean(res.data?.viewedNow);

      if (viewedNow) {
        const seen = await loadSeenMap();
        seen[String(storyId)] = true;
        await saveSeenMap(seen);
      }

      return { storyId, viewedNow };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to view story"
      );
    }
  }
);

/* =====================================================
   GET STORY VIEWERS
===================================================== */

export const fetchStoryViewers = createAsyncThunk(
  "stories/viewers",
  async (
    { storyId, page = 1, limit = 50 }: { storyId: string; page?: number; limit?: number },
    thunkAPI
  ) => {
    try {
      const res = await api.get(`/stories/${storyId}/viewers?page=${page}&limit=${limit}`);
      const payload = {
        storyId,
        data: {
          page: res.data?.page ?? page,
          limit: res.data?.limit ?? limit,
          total: res.data?.total ?? 0,
          count: res.data?.count ?? 0,
          viewers: res.data?.viewers ?? [],
        } as ViewersResponse,
      };
      return payload;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load viewers"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const storySlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    clearStoriesError: (state) => {
      state.error = null;
    },

    resetStoriesState: () => initialState,

    markStorySeenLocal: (state, action) => {
      const id = String(action.payload || "");
      if (!id) return;
      state.seenStoryIds[id] = true;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== Load Cache ===== */
      .addCase(loadStoriesCache.fulfilled, (state, action) => {
        state.feed = action.payload.feed || [];
        state.myStories = action.payload.my || null;
        state.seenStoryIds = action.payload.seen || {};
      })

      /* ===== Feed ===== */
      .addCase(fetchStoriesFeed.pending, (state) => {
        state.loadingFeed = true;
        state.error = null;
      })
      .addCase(fetchStoriesFeed.fulfilled, (state, action) => {
        state.loadingFeed = false;
        state.feed = action.payload.data || [];
        state.lastFeedFetchedAt = Date.now();
      })
      .addCase(fetchStoriesFeed.rejected, (state, action: any) => {
        state.loadingFeed = false;
        state.error = action.payload || "Failed to load stories feed";
      })

      /* ===== My Stories ===== */
      .addCase(fetchMyStories.pending, (state) => {
        state.loadingMy = true;
        state.error = null;
      })
      .addCase(fetchMyStories.fulfilled, (state, action) => {
        state.loadingMy = false;
        state.myStories = action.payload.data || null;
      })
      .addCase(fetchMyStories.rejected, (state, action: any) => {
        state.loadingMy = false;
        state.error = action.payload || "Failed to load my stories";
      })

      /* ===== Create ===== */
      .addCase(createStory.pending, (state) => {
        state.loadingCreate = true;
        state.error = null;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loadingCreate = false;

        const newStory: StoryItem | null = action.payload.story || null;
        if (!newStory) return;

        if (state.myStories) {
          state.myStories.stories = [newStory, ...(state.myStories.stories || [])];
          refreshOwnerGroupPreview(state.myStories);
        } else {
          state.myStories = {
            _id: "me",
            username: "",
            atUsername: "",
            avatar: "",
            isOnline: false,
            stories: [newStory],
            latestStoryAt: newStory.createdAt,
            latestPreview: buildLatestPreviewFromStories([newStory]),
          };
        }

        const myId = state.myStories?._id;
        const meIndex = state.feed.findIndex((g) => g._id === myId);

        if (meIndex >= 0) {
          const cur = state.feed[meIndex];
          cur.stories = [newStory, ...(cur.stories || [])];
          refreshOwnerGroupPreview(cur);
        }
      })
      .addCase(createStory.rejected, (state, action: any) => {
        state.loadingCreate = false;
        state.error = action.payload || "Failed to create story";
      })

      /* ===== Delete ===== */
      .addCase(deleteStory.pending, (state) => {
        state.loadingDelete = true;
        state.error = null;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loadingDelete = false;
        const storyId = String(action.payload.storyId || "");

        if (state.myStories?.stories?.length) {
          state.myStories.stories = state.myStories.stories.filter((s) => s._id !== storyId);

          if (state.myStories.stories.length > 0) {
            refreshOwnerGroupPreview(state.myStories);
          } else {
            state.myStories.latestPreview = null;
            state.myStories.latestStoryAt = "";
          }
        }

        state.feed = state.feed
          .map((g) => {
            const nextStories = (g.stories || []).filter((s) => s._id !== storyId);
            const nextGroup: StoryOwnerGroup = {
              ...g,
              stories: nextStories,
              latestPreview: g.latestPreview,
              latestStoryAt: g.latestStoryAt,
            };

            if (nextStories.length > 0) {
              nextGroup.latestPreview = buildLatestPreviewFromStories(nextStories);
              nextGroup.latestStoryAt = nextStories[0]?.createdAt || g.latestStoryAt || "";
            } else {
              nextGroup.latestPreview = null;
              nextGroup.latestStoryAt = "";
            }

            return nextGroup;
          })
          .filter((g) => (g.stories || []).length > 0);

        delete state.viewersByStoryId[storyId];
      })
      .addCase(deleteStory.rejected, (state, action: any) => {
        state.loadingDelete = false;
        state.error = action.payload || "Failed to delete story";
      })

      /* ===== View ===== */
      .addCase(viewStory.pending, (state) => {
        state.loadingView = true;
        state.error = null;
      })
      .addCase(viewStory.fulfilled, (state, action) => {
        state.loadingView = false;

        const storyId = String(action.payload.storyId || "");
        const viewedNow = Boolean(action.payload.viewedNow);

        if (viewedNow && storyId) {
          state.seenStoryIds[storyId] = true;
        }
      })
      .addCase(viewStory.rejected, (state, action: any) => {
        state.loadingView = false;
        state.error = action.payload || "Failed to view story";
      })

      /* ===== Viewers ===== */
      .addCase(fetchStoryViewers.pending, (state) => {
        state.loadingViewers = true;
        state.error = null;
      })
      .addCase(fetchStoryViewers.fulfilled, (state, action) => {
        state.loadingViewers = false;
        state.viewersByStoryId[action.payload.storyId] = action.payload.data;
      })
      .addCase(fetchStoryViewers.rejected, (state, action: any) => {
        state.loadingViewers = false;
        state.error = action.payload || "Failed to load viewers";
      });
  },
});

export const { clearStoriesError, resetStoriesState, markStorySeenLocal } =
  storySlice.actions;

export default storySlice.reducer;