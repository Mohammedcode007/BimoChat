// src/redux/slices/storeControl.slice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export type VerificationType = "none" | "blue" | "gold" | "business";

export type StoreItemType =
  | "avatarFrame"
  | "badge"
  | "messageEffect"
  | "gift"
  | "profileEntryAnimation"
  | "verification";

export type StoreItem = {
  _id: string;
  type: StoreItemType;
  key: string;
  name: string;
  description?: string;
  priceCoinz: number;
  isActive: boolean;
  isConsumable?: boolean;
  isStackable?: boolean;
  meta?: Record<string, any>;
};

export type InventoryEntry = {
  _id: string;
  user: string;
  itemType: StoreItemType;
  itemKey: string;
  quantity: number;
  acquiredAt?: string;
  expiresAt?: string | null;
  // populate("item")
  item?: StoreItem;
};

export type ActiveCustomization = {
  avatarFrame?: string;
  messageEffect?: string;
  profileEntryAnimation?: string;
  badges: string[];
  verificationType: VerificationType;
};

export type MyInventoryResponse = {
  coinzBalance: number;
  activeCustomization: ActiveCustomization;
  inventory: InventoryEntry[];
};

export type PurchaseResult = {
  totalCost: number;
  coinzBalance: number;
  activeCustomization: ActiveCustomization;
};

export type PurchaseInput = {
  items: { itemId: string; quantity?: number }[];
  setActive?: boolean;
};

export type ActivateInput = {
  type: "avatarFrame" | "messageEffect" | "profileEntryAnimation" | "badge" | "verification";
  key: string; // itemKey (أو verificationType لو type=verification)
  mode?: "set" | "add" | "remove"; // للـ badge
};

export type AdminCoinzInput = {
  userId: string;
  amount: number;
  reason?: string;
};

/* =====================================================
   HELPERS
===================================================== */

const errMsg = (err: any, fallback: string) =>
  err?.response?.data?.message ||
  err?.message ||
  fallback;

/**
 * api عندك غالباً baseURL = "/api"
 * routes:
 * app.use("/api/store", storeRoutes)
 * => BASE = "/store"
 */
const BASE = "/store";

/* =====================================================
   THUNKS
===================================================== */

/** GET /store/items?type=...&active=true */
export const listStoreItems = createAsyncThunk<
  { items: StoreItem[] },
  { type?: StoreItemType | ""; active?: boolean } | void,
  { rejectValue: string }
>("storeControl/listItems", async (args, thunkAPI) => {
  try {
    const type = (args as any)?.type ? String((args as any).type) : "";
    const active = (args as any)?.active ?? true;

    const params: any = {};
    if (type) params.type = type;
    params.active = String(Boolean(active));

    const res = await api.get(`${BASE}/items`, { params });
    return { items: res.data.items || [] };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to load store items"));
  }
});

/** GET /store/me/inventory */
export const getMyInventory = createAsyncThunk<
  { data: MyInventoryResponse },
  void,
  { rejectValue: string }
>("storeControl/myInventory", async (_, thunkAPI) => {
  try {
    const res = await api.get(`${BASE}/me/inventory`);
    return {
      data: {
        coinzBalance: Number(res.data.coinzBalance) || 0,
        activeCustomization: res.data.activeCustomization || {
          avatarFrame: "",
          messageEffect: "",
          profileEntryAnimation: "",
          badges: [],
          verificationType: "none"
        },
        inventory: res.data.inventory || []
      }
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to load inventory"));
  }
});

/** POST /store/purchase */
export const purchaseStoreItems = createAsyncThunk<
  { result: PurchaseResult },
  PurchaseInput,
  { rejectValue: string }
>("storeControl/purchase", async (body, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/purchase`, body);
    return {
      result: {
        totalCost: Number(res.data.totalCost) || 0,
        coinzBalance: Number(res.data.coinzBalance) || 0,
        activeCustomization: res.data.activeCustomization || {
          avatarFrame: "",
          messageEffect: "",
          profileEntryAnimation: "",
          badges: [],
          verificationType: "none"
        }
      }
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Purchase failed"));
  }
});

/** PATCH /store/activate */
export const activateStoreItem = createAsyncThunk<
  { activeCustomization: ActiveCustomization },
  ActivateInput,
  { rejectValue: string }
>("storeControl/activate", async (body, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/activate`, body);
    return {
      activeCustomization: res.data.activeCustomization || {
        avatarFrame: "",
        messageEffect: "",
        profileEntryAnimation: "",
        badges: [],
        verificationType: "none"
      }
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to activate item"));
  }
});

/** PATCH /store/coinz/credit (Admin) */
export const adminCreditCoinz = createAsyncThunk<
  { coinzBalance: number },
  AdminCoinzInput,
  { rejectValue: string }
>("storeControl/adminCreditCoinz", async (body, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/coinz/credit`, body);
    return { coinzBalance: Number(res.data.coinzBalance) || 0 };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to credit coinz"));
  }
});

/** PATCH /store/coinz/debit (Admin) */
export const adminDebitCoinz = createAsyncThunk<
  { coinzBalance: number },
  AdminCoinzInput,
  { rejectValue: string }
>("storeControl/adminDebitCoinz", async (body, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/coinz/debit`, body);
    return { coinzBalance: Number(res.data.coinzBalance) || 0 };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to debit coinz"));
  }
});

/* =====================================================
   SLICE
===================================================== */

type StoreControlState = {
  // بيانات المتجر
  items: StoreItem[];
  loadingItems: boolean;

  // بيانات المستخدم (المخزون/الرصيد/التفعيل)
  my: MyInventoryResponse | null;
  loadingMy: boolean;

  // عمليات
  purchasing: boolean;
  activating: boolean;
  adminUpdatingCoinz: boolean;

  // نتائج آخر عملية شراء (اختياري)
  lastPurchase?: PurchaseResult | null;

  error: string | null;
};

const initialState: StoreControlState = {
  items: [],
  loadingItems: false,

  my: null,
  loadingMy: false,

  purchasing: false,
  activating: false,
  adminUpdatingCoinz: false,

  lastPurchase: null,

  error: null
};

const storeControlSlice = createSlice({
  name: "storeControl",
  initialState,
  reducers: {
    clearStoreError: (state) => {
      state.error = null;
    },
    resetStoreControl: (state) => {
      state.items = [];
      state.loadingItems = false;

      state.my = null;
      state.loadingMy = false;

      state.purchasing = false;
      state.activating = false;
      state.adminUpdatingCoinz = false;

      state.lastPurchase = null;

      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* ========== listStoreItems ========== */
      .addCase(listStoreItems.pending, (state) => {
        state.loadingItems = true;
        state.error = null;
      })
      .addCase(listStoreItems.fulfilled, (state, action) => {
        state.loadingItems = false;
        state.items = action.payload.items;
      })
      .addCase(listStoreItems.rejected, (state, action) => {
        state.loadingItems = false;
        state.error = action.payload || "Failed to load store items";
      })

      /* ========== getMyInventory ========== */
      .addCase(getMyInventory.pending, (state) => {
        state.loadingMy = true;
        state.error = null;
      })
      .addCase(getMyInventory.fulfilled, (state, action) => {
        state.loadingMy = false;
        state.my = action.payload.data;
      })
      .addCase(getMyInventory.rejected, (state, action) => {
        state.loadingMy = false;
        state.error = action.payload || "Failed to load inventory";
      })

      /* ========== purchaseStoreItems ========== */
      .addCase(purchaseStoreItems.pending, (state) => {
        state.purchasing = true;
        state.error = null;
      })
      .addCase(purchaseStoreItems.fulfilled, (state, action) => {
        state.purchasing = false;
        state.lastPurchase = action.payload.result;

        // تحديث سريع للرصيد/التفعيل داخل my لو موجود
        if (state.my) {
          state.my.coinzBalance = action.payload.result.coinzBalance;
          state.my.activeCustomization = action.payload.result.activeCustomization;
        }
      })
      .addCase(purchaseStoreItems.rejected, (state, action) => {
        state.purchasing = false;
        state.error = action.payload || "Purchase failed";
      })

      /* ========== activateStoreItem ========== */
      .addCase(activateStoreItem.pending, (state) => {
        state.activating = true;
        state.error = null;
      })
      .addCase(activateStoreItem.fulfilled, (state, action) => {
        state.activating = false;
        if (state.my) state.my.activeCustomization = action.payload.activeCustomization;
      })
      .addCase(activateStoreItem.rejected, (state, action) => {
        state.activating = false;
        state.error = action.payload || "Failed to activate item";
      })

      /* ========== Admin coinz ========== */
      .addCase(adminCreditCoinz.pending, (state) => {
        state.adminUpdatingCoinz = true;
        state.error = null;
      })
      .addCase(adminCreditCoinz.fulfilled, (state, action) => {
        state.adminUpdatingCoinz = false;
        // هذه القيمة تخص مستخدم مُحدد، غالباً ستعرضها في شاشة Admin
        // لا نعدل state.my هنا إلا إذا كان admin يعدّل لنفسه
        if (state.my) state.my.coinzBalance = action.payload.coinzBalance;
      })
      .addCase(adminCreditCoinz.rejected, (state, action) => {
        state.adminUpdatingCoinz = false;
        state.error = action.payload || "Failed to credit coinz";
      })

      .addCase(adminDebitCoinz.pending, (state) => {
        state.adminUpdatingCoinz = true;
        state.error = null;
      })
      .addCase(adminDebitCoinz.fulfilled, (state, action) => {
        state.adminUpdatingCoinz = false;
        if (state.my) state.my.coinzBalance = action.payload.coinzBalance;
      })
      .addCase(adminDebitCoinz.rejected, (state, action) => {
        state.adminUpdatingCoinz = false;
        state.error = action.payload || "Failed to debit coinz";
      });
  }
});

export const { clearStoreError, resetStoreControl } = storeControlSlice.actions;
export default storeControlSlice.reducer;

/* =====================================================
   SELECTORS
===================================================== */

export const selectStoreItems = (s: RootState) => s.storeControl.items;
export const selectStoreItemsLoading = (s: RootState) => s.storeControl.loadingItems;

export const selectMyStore = (s: RootState) => s.storeControl.my;
export const selectMyStoreLoading = (s: RootState) => s.storeControl.loadingMy;

export const selectStorePurchasing = (s: RootState) => s.storeControl.purchasing;
export const selectStoreActivating = (s: RootState) => s.storeControl.activating;
export const selectStoreAdminUpdatingCoinz = (s: RootState) => s.storeControl.adminUpdatingCoinz;

export const selectStoreLastPurchase = (s: RootState) => s.storeControl.lastPurchase;

export const selectStoreError = (s: RootState) => s.storeControl.error;