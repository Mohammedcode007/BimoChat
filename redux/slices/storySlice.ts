// redux/slices/storySlice.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   TYPES
===================================================== */

export type StoryType = "image" | "video" | "text";
export type StoryPrivacy = "public" | "followers" | "private";

export type StoryItem = {
  _id: string;
  type: StoryType;
  text?: string;
  mediaUrl?: string;
  thumbUrl?: string;
  durationMs?: number;
  privacy: StoryPrivacy;
  viewsCount: number;
  viewers?: string[]; // قد لا تُرسل في الـ feed
  createdAt: string;
  expiresAt: string;
};

export type StoryOwnerGroup = {
  _id: string; // userId
  username: string;
  atUsername: string;
  avatar?: string;
  isOnline?: boolean;
  stories: StoryItem[];
  latestStoryAt?: string;
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
   LOAD CACHED (اختياري)
===================================================== */

export const loadStoriesCache = createAsyncThunk("stories/loadCache", async () => {
  const feed = await loadCache(FEED_KEY);
  const my = await loadCache(MY_KEY);
  const seen = await loadSeenMap();
  return { feed: feed || [], my: my || null, seen: seen || {} };
});

/* =====================================================
   FETCH FEED
===================================================== */

export const fetchStoriesFeed = createAsyncThunk(
  "stories/fetchFeed",
  async ({ page = 1, limit = 30 }: { page?: number; limit?: number }, thunkAPI) => {
    try {
      const res = await api.get(`/stories/feed?page=${page}&limit=${limit}`);
      const data = res.data?.data || [];
      await saveCache(FEED_KEY, data);
      return { data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load stories feed");
    }
  }
);

/* =====================================================
   FETCH MY STORIES
===================================================== */

export const fetchMyStories = createAsyncThunk("stories/fetchMyStories", async (_, thunkAPI) => {
  try {
    const res = await api.get(`/stories/me`);
    const data = res.data?.data || null;
    await saveCache(MY_KEY, data);
    return { data };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load my stories");
  }
});

/* =====================================================
   CREATE STORY (max 2 active enforced in backend)
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
      return { story: res.data?.data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create story");
    }
  }
);

/* =====================================================
   DELETE STORY
===================================================== */

export const deleteStory = createAsyncThunk("stories/delete", async (storyId: string, thunkAPI) => {
  try {
    await api.delete(`/stories/${storyId}`);
    return { storyId };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete story");
  }
});

/* =====================================================
   VIEW STORY (register view, no duplicates)
   ✅ also updates local seen cache
===================================================== */

export const viewStory = createAsyncThunk("stories/view", async (storyId: string, thunkAPI) => {
  try {
    const res = await api.post(`/stories/${storyId}/view`);
    const viewedNow = Boolean(res.data?.viewedNow);

    // ✅ لو اتسجلت مشاهدة جديدة، خزّنها محلياً
    if (viewedNow) {
      const seen = await loadSeenMap();
      seen[String(storyId)] = true;
      await saveSeenMap(seen);
    }

    return { storyId, viewedNow };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to view story");
  }
});

/* =====================================================
   GET STORY VIEWERS (owner only)
===================================================== */

export const fetchStoryViewers = createAsyncThunk(
  "stories/viewers",
  async ({ storyId, page = 1, limit = 50 }: { storyId: string; page?: number; limit?: number }, thunkAPI) => {
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
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load viewers");
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

    // مفيد لو تحب تعمل Reset عند logout
    resetStoriesState: () => initialState,

    // ✅ مفيد لو حبيت تعلم محلياً بدون API (اختياري)
    markStorySeenLocal: (state, action) => {
      const id = String(action.payload || "");
      if (!id) return;
      state.seenStoryIds[id] = true;
      // ملاحظة: التخزين في AsyncStorage يتم عبر thunk عادة
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

        // ✅ تحديث myStories محليًا
        if (state.myStories) {
          state.myStories.stories = [newStory, ...(state.myStories.stories || [])];
        } else {
          state.myStories = {
            _id: "me",
            username: "",
            atUsername: "",
            stories: [newStory],
          } as any;
        }

        // ✅ تحديث feed: حاول تحديث block خاص بي إن كان موجود
        const meIndex = state.feed.findIndex((g) => g._id === (state.myStories as any)?._id);
        if (meIndex >= 0) {
          const cur = state.feed[meIndex];
          cur.stories = [newStory, ...(cur.stories || [])];
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
        const storyId = action.payload.storyId;

        // ✅ حذف من myStories
        if (state.myStories?.stories?.length) {
          state.myStories.stories = state.myStories.stories.filter((s) => s._id !== storyId);
        }

        // ✅ حذف من feed
        state.feed = state.feed
          .map((g) => ({ ...g, stories: (g.stories || []).filter((s) => s._id !== storyId) }))
          .filter((g) => (g.stories || []).length > 0);

        // ✅ حذف viewers cache
        delete state.viewersByStoryId[storyId];

        // ✅ (اختياري) عدم حذف seen: يمكن تركه لتجنب نمو كبير (لو تحب احذفه: delete state.seenStoryIds[storyId])
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

        // ✅ تحديث UI محليًا
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

export const { clearStoriesError, resetStoriesState, markStorySeenLocal } = storySlice.actions;
export default storySlice.reducer;