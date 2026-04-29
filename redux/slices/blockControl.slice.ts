import type { RootState } from "@/redux/store";
import api from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BlockScope = "rooms" | "tweets" | "app";
export type BlockTargetType = "user" | "identity" | "device" | "ip" | "mixed";

export type BlockUser = {
  _id?: string;
  username?: string;
  atUsername?: string;
  avatar?: string;
  avatarGif?: string;
};

export type BlockRule = {
  _id: string;

  scope: BlockScope;
  targetType: BlockTargetType;

  user?: BlockUser | string | null;

  identityKey?: string;
  deviceId?: string;
  ipHash?: string;
  userAgentHash?: string;

  reason?: string;

  createdBy?: BlockUser | string | null;

  isActive: boolean;

  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CreateBlockPayload = {
  scope: BlockScope;
  targetType: BlockTargetType;
  targetUserId: string;
  reason?: string;
  expiresAt?: string | null;

  includeIdentity?: boolean;
  includeDevice?: boolean;
  includeIp?: boolean;
};

type ListBlocksPayload = {
  scope?: BlockScope | "all";
};

type BlockControlState = {
  items: BlockRule[];

  selectedScope: BlockScope | "all";

  loading: boolean;
  creating: boolean;
  unblocking: boolean;

  error: string | null;
  successMessage: string | null;

  lastCreatedRule: BlockRule | null;
};

const initialState: BlockControlState = {
  items: [],

  selectedScope: "all",

  loading: false,
  creating: false,
  unblocking: false,

  error: null,
  successMessage: null,

  lastCreatedRule: null,
};

const getErrorMessage = (error: any, fallback: string) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/* =====================================================
   LIST BLOCKS
===================================================== */

export const listBlockRules = createAsyncThunk<
  BlockRule[],
  ListBlocksPayload | undefined,
  { rejectValue: string }
>("blockControl/listBlockRules", async (payload, { rejectWithValue }) => {
  try {
    const scope = payload?.scope || "all";

    const url =
      scope && scope !== "all"
        ? `/blocks?scope=${encodeURIComponent(scope)}`
        : "/blocks";

    const res = await api.get(url);

    return Array.isArray(res.data?.items) ? res.data.items : [];
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to load block rules")
    );
  }
});

/* =====================================================
   CREATE BLOCK
===================================================== */

export const createBlockRule = createAsyncThunk<
  BlockRule,
  CreateBlockPayload,
  { rejectValue: string }
>("blockControl/createBlockRule", async (payload, { rejectWithValue }) => {
  try {
    const body = {
      scope: payload.scope,
      targetType: payload.targetType,
      targetUserId: payload.targetUserId,
      reason: payload.reason || "",
      expiresAt: payload.expiresAt || null,

      includeIdentity: payload.includeIdentity !== false,
      includeDevice: payload.includeDevice !== false,
      includeIp: payload.includeIp === true,
    };

    const res = await api.post("/blocks", body);

    const rule = res.data?.rule;

    if (!rule?._id) {
      throw new Error("Invalid block response");
    }

    return rule;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to create block rule")
    );
  }
});

/* =====================================================
   UNBLOCK
===================================================== */

export const unblockRule = createAsyncThunk<
  { ruleId: string },
  string,
  { rejectValue: string }
>("blockControl/unblockRule", async (ruleId, { rejectWithValue }) => {
  try {
    const cleanRuleId = String(ruleId || "").trim();

    if (!cleanRuleId) {
      throw new Error("ruleId is required");
    }

    await api.patch(`/blocks/${cleanRuleId}/unblock`);

    return { ruleId: cleanRuleId };
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error, "Failed to unblock rule"));
  }
});

/* =====================================================
   SLICE
===================================================== */

const blockControlSlice = createSlice({
  name: "blockControl",
  initialState,
  reducers: {
    clearBlockControlError(state) {
      state.error = null;
    },

    clearBlockControlSuccess(state) {
      state.successMessage = null;
    },

    resetBlockControlMessages(state) {
      state.error = null;
      state.successMessage = null;
    },

    setBlockScopeFilter(state, action: PayloadAction<BlockScope | "all">) {
      state.selectedScope = action.payload;
    },

    resetBlockControlState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ================= LIST ================= */

      .addCase(listBlockRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listBlockRules.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(listBlockRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load block rules";
      })

      /* ================= CREATE ================= */

      .addCase(createBlockRule.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBlockRule.fulfilled, (state, action) => {
        state.creating = false;
        state.lastCreatedRule = action.payload;
        state.successMessage = "تم إنشاء الحظر بنجاح";

        const exists = state.items.some((item) => item._id === action.payload._id);

        if (!exists) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createBlockRule.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create block rule";
      })

      /* ================= UNBLOCK ================= */

      .addCase(unblockRule.pending, (state) => {
        state.unblocking = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(unblockRule.fulfilled, (state, action) => {
        state.unblocking = false;
        state.successMessage = "تم فك الحظر بنجاح";

        // نحذفها من القائمة لأنها أصبحت غير نشطة
        state.items = state.items.filter(
          (item) => item._id !== action.payload.ruleId
        );
      })
      .addCase(unblockRule.rejected, (state, action) => {
        state.unblocking = false;
        state.error = action.payload || "Failed to unblock rule";
      });
  },
});

export const {
  clearBlockControlError,
  clearBlockControlSuccess,
  resetBlockControlMessages,
  setBlockScopeFilter,
  resetBlockControlState,
} = blockControlSlice.actions;

/* =====================================================
   SELECTORS
===================================================== */

export const selectBlockControl = (state: RootState) => state.blockControl;

export const selectBlockRules = (state: RootState) =>
  state.blockControl.items;

export const selectBlockScopeFilter = (state: RootState) =>
  state.blockControl.selectedScope;

export const selectFilteredBlockRules = (state: RootState) => {
  const selectedScope = state.blockControl.selectedScope;
  const items = state.blockControl.items;

  if (selectedScope === "all") return items;

  return items.filter((item) => item.scope === selectedScope);
};

export const selectBlockControlLoading = (state: RootState) =>
  state.blockControl.loading;

export const selectBlockControlCreating = (state: RootState) =>
  state.blockControl.creating;

export const selectBlockControlUnblocking = (state: RootState) =>
  state.blockControl.unblocking;

export const selectBlockControlError = (state: RootState) =>
  state.blockControl.error;

export const selectBlockControlSuccess = (state: RootState) =>
  state.blockControl.successMessage;

export default blockControlSlice.reducer;