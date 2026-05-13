
// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "../../services/api";
// import { RootState } from "../store";

// /* =====================================================
//    TYPES
// ===================================================== */

// export type VerificationType = "none" | "blue" | "gold" | "business";

// export type StoreItemType =
//   | "avatarFrame"
//   | "avatarGif"
//   | "usernameColor"
//   | "messageTextColor"
//   | "badge"
//   | "messageEffect"
//   | "gift"
//   | "profileEntryAnimation"
//   | "verification";
// export type StoreItem = {
//   _id: string;
//   type: StoreItemType;
//   key: string;
//   name: string;
//   description?: string;
//   priceCoinz: number;
//   isActive: boolean;
//   isConsumable?: boolean;
//   isStackable?: boolean;
//   durationDays?: number; // 0 = دائم
//   meta?: Record<string, any>;
// };

// export type InventoryEntry = {
//   _id: string;
//   user: string;
//   itemType: StoreItemType;
//   itemKey: string;
//   quantity: number;
//   acquiredAt?: string;
//   expiresAt?: string | null;
//   item?: StoreItem; // populate("item")
// };

// export type ActiveCustomization = {
//   avatarFrame?: string;
//   avatarGif?: string;
//   usernameColor?: string;
//   messageTextColor?: string;
//   messageEffect?: string;
//   profileEntryAnimation?: string;
//   badges: string[];
//   verificationType: VerificationType;
// };

// export type CustomEmojiBadge = {
//   emoji: string;
//   isActive: boolean;
//   purchasedAt?: string | null;
//   expiresAt?: string | null;
// };

// export type MyInventoryResponse = {
//   coinzBalance: number;
//   activeCustomization: ActiveCustomization;
//   customEmojiBadge: CustomEmojiBadge;
//   inventory: InventoryEntry[];
// };

// export type InventoryUpdate = {
//   itemId: string;
//   key: string;
//   type: StoreItemType;
//   quantity: number;
//   expiresAt: string | null;
// };

// export type PurchaseResult = {
//   totalCost: number;
//   coinzBalance: number;
//   activeCustomization: ActiveCustomization;
//   inventoryUpdates?: InventoryUpdate[];
// };

// export type PurchaseInput = {
//   items: { itemId: string; quantity?: number }[];
//   setActive?: boolean;
// };

// export type ActivateInput = {
//   type:
//     | "avatarFrame"
//     | "avatarGif"
//     | "usernameColor"
//     | "messageTextColor"
//     | "messageEffect"
//     | "profileEntryAnimation"
//     | "badge"
//     | "verification";
//   key: string;
//   mode?: "set" | "add" | "remove";
// };

// export type AdminCoinzInput = {
//   userId: string;
//   amount: number;
//   reason?: string;
// };

// export type BuyCoinzInput = {
//   amount: number;
// };

// export type BuyCustomEmojiBadgeInput = {
//   emoji: string;
//   setActive?: boolean;
// };

// export type ActivateCustomEmojiBadgeInput = {
//   active: boolean;
// };

// export type BuyCustomEmojiBadgeResult = {
//   coinzBalance: number;
//   customEmojiBadge: CustomEmojiBadge;
// };

// /* =====================================================
//    HELPERS
// ===================================================== */

// const errMsg = (err: any, fallback: string) =>
//   err?.response?.data?.message || err?.message || fallback;

// const BASE = "/store";

// const defaultActiveCustomization: ActiveCustomization = {
//   avatarFrame: "",
//   avatarGif: "",
//   usernameColor: "",
//   messageTextColor: "",
//   messageEffect: "",
//   profileEntryAnimation: "",
//   badges: [],
//   verificationType: "none"
// };
// const defaultCustomEmojiBadge: CustomEmojiBadge = {
//   emoji: "",
//   isActive: false,
//   purchasedAt: null,
//   expiresAt: null
// };

// /* =====================================================
//    THUNKS
// ===================================================== */

// /** GET /store/items?type=...&active=true */
// export const listStoreItems = createAsyncThunk<
//   { items: StoreItem[] },
//   { type?: StoreItemType | ""; active?: boolean } | void,
//   { rejectValue: string }
// >("storeControl/listItems", async (args, thunkAPI) => {
//   try {
//     const type = (args as any)?.type ? String((args as any).type) : "";
//     const active = (args as any)?.active ?? true;

//     const params: any = {};
//     if (type) params.type = type;
//     params.active = String(Boolean(active));

//     const res = await api.get(`${BASE}/items`, { params });

//     return { items: res.data.items || [] };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to load store items"));
//   }
// });

// /** GET /store/me/inventory */
// export const getMyInventory = createAsyncThunk<
//   { data: MyInventoryResponse },
//   void,
//   { rejectValue: string }
// >("storeControl/myInventory", async (_, thunkAPI) => {
//   try {
//     const res = await api.get(`${BASE}/me/inventory`);
//     return {
//       data: {
//         coinzBalance: Number(res.data.coinzBalance) || 0,
//         activeCustomization: res.data.activeCustomization || defaultActiveCustomization,
//         customEmojiBadge: res.data.customEmojiBadge || defaultCustomEmojiBadge,
//         inventory: res.data.inventory || []
//       }
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to load inventory"));
//   }
// });

// /** POST /store/coinz/buy */
// export const buyCoinz = createAsyncThunk<
//   { coinzBalance: number; added: number },
//   BuyCoinzInput,
//   { rejectValue: string }
// >("storeControl/buyCoinz", async (body, thunkAPI) => {
//   try {
//     const res = await api.post(`${BASE}/coinz/buy`, body);
//     return {
//       coinzBalance: Number(res.data.coinzBalance) || 0,
//       added: Number(res.data.added) || 0
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to buy coinz"));
//   }
// });

// /** POST /store/custom-emoji-badge/buy */
// export const buyCustomEmojiBadge = createAsyncThunk<
//   BuyCustomEmojiBadgeResult,
//   BuyCustomEmojiBadgeInput,
//   { rejectValue: string }
// >("storeControl/buyCustomEmojiBadge", async (body, thunkAPI) => {
//   try {
//     const res = await api.post(`${BASE}/custom-emoji-badge/buy`, body);

//     return {
//       coinzBalance: Number(res.data.coinzBalance) || 0,
//       customEmojiBadge: res.data.customEmojiBadge || defaultCustomEmojiBadge
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to buy custom emoji badge"));
//   }
// });

// /** GET /store/custom-emoji-badge/me */
// export const getMyCustomEmojiBadge = createAsyncThunk<
//   { coinzBalance: number; customEmojiBadge: CustomEmojiBadge },
//   void,
//   { rejectValue: string }
// >("storeControl/getMyCustomEmojiBadge", async (_, thunkAPI) => {
//   try {
//     const res = await api.get(`${BASE}/custom-emoji-badge/me`);

//     return {
//       coinzBalance: Number(res.data.coinzBalance) || 0,
//       customEmojiBadge: res.data.customEmojiBadge || defaultCustomEmojiBadge
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to load custom emoji badge"));
//   }
// });

// /** PATCH /store/custom-emoji-badge/activate */
// export const activateCustomEmojiBadge = createAsyncThunk<
//   { customEmojiBadge: CustomEmojiBadge },
//   ActivateCustomEmojiBadgeInput,
//   { rejectValue: string }
// >("storeControl/activateCustomEmojiBadge", async (body, thunkAPI) => {
//   try {
//     const res = await api.patch(`${BASE}/custom-emoji-badge/activate`, body);

//     return {
//       customEmojiBadge: res.data.customEmojiBadge || defaultCustomEmojiBadge
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to activate custom emoji badge"));
//   }
// });

// /** POST /store/purchase */
// export const purchaseStoreItems = createAsyncThunk<
//   { result: PurchaseResult },
//   PurchaseInput,
//   { rejectValue: string }
// >("storeControl/purchase", async (body, thunkAPI) => {
//   try {
//     const res = await api.post(`${BASE}/purchase`, body);

//     return {
//       result: {
//         totalCost: Number(res.data.totalCost) || 0,
//         coinzBalance: Number(res.data.coinzBalance) || 0,
//         activeCustomization: res.data.activeCustomization || defaultActiveCustomization,
//         inventoryUpdates: Array.isArray(res.data.inventoryUpdates) ? res.data.inventoryUpdates : []
//       }
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Purchase failed"));
//   }
// });

// /** PATCH /store/activate */
// export const activateStoreItem = createAsyncThunk<
//   { activeCustomization: ActiveCustomization },
//   ActivateInput,
//   { rejectValue: string }
// >("storeControl/activate", async (body, thunkAPI) => {
//   try {
//     const res = await api.patch(`${BASE}/activate`, body);
//     return {
//       activeCustomization: res.data.activeCustomization || defaultActiveCustomization
//     };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to activate item"));
//   }
// });

// /** PATCH /store/coinz/credit (Admin) */
// export const adminCreditCoinz = createAsyncThunk<
//   { coinzBalance: number },
//   AdminCoinzInput,
//   { rejectValue: string }
// >("storeControl/adminCreditCoinz", async (body, thunkAPI) => {
//   try {
//     const res = await api.patch(`${BASE}/coinz/credit`, body);
//     return { coinzBalance: Number(res.data.coinzBalance) || 0 };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to credit coinz"));
//   }
// });

// /** PATCH /store/coinz/debit (Admin) */
// export const adminDebitCoinz = createAsyncThunk<
//   { coinzBalance: number },
//   AdminCoinzInput,
//   { rejectValue: string }
// >("storeControl/adminDebitCoinz", async (body, thunkAPI) => {
//   try {
//     const res = await api.patch(`${BASE}/coinz/debit`, body);
//     return { coinzBalance: Number(res.data.coinzBalance) || 0 };
//   } catch (e: any) {
//     return thunkAPI.rejectWithValue(errMsg(e, "Failed to debit coinz"));
//   }
// });

// /* =====================================================
//    SLICE
// ===================================================== */

// type StoreControlState = {
//   items: StoreItem[];
//   loadingItems: boolean;

//   my: MyInventoryResponse | null;
//   loadingMy: boolean;

//   purchasing: boolean;
//   activating: boolean;
//   buyingCoinz: boolean;
//   buyingCustomEmojiBadge: boolean;
//   activatingCustomEmojiBadge: boolean;
//   loadingCustomEmojiBadge: boolean;
//   adminUpdatingCoinz: boolean;

//   lastPurchase?: PurchaseResult | null;

//   error: string | null;
// };

// const initialState: StoreControlState = {
//   items: [],
//   loadingItems: false,

//   my: null,
//   loadingMy: false,

//   purchasing: false,
//   activating: false,
//   buyingCoinz: false,
//   buyingCustomEmojiBadge: false,
//   activatingCustomEmojiBadge: false,
//   loadingCustomEmojiBadge: false,
//   adminUpdatingCoinz: false,

//   lastPurchase: null,

//   error: null
// };

// function upsertInventoryByUpdates(
//   current: InventoryEntry[],
//   updates: InventoryUpdate[]
// ): InventoryEntry[] {
//   if (!Array.isArray(current)) return current;

//   const byKey = new Map<string, InventoryEntry>();
//   for (const it of current) {
//     const k = `${it.itemType}:${it.itemKey}`;
//     byKey.set(k, it);
//   }

//   for (const u of updates) {
//     const k = `${u.type}:${u.key}`;
//     const prev = byKey.get(k);

//     if (prev) {
//       byKey.set(k, {
//         ...prev,
//         quantity: Number(u.quantity) || prev.quantity,
//         expiresAt: u.expiresAt ?? prev.expiresAt
//       });
//     } else {
//       byKey.set(k, {
//         _id: `tmp_${u.itemId}`,
//         user: "",
//         itemType: u.type,
//         itemKey: u.key,
//         quantity: Number(u.quantity) || 1,
//         expiresAt: u.expiresAt ?? null
//       });
//     }
//   }

//   return Array.from(byKey.values());
// }

// const storeControlSlice = createSlice({
//   name: "storeControl",
//   initialState,
//   reducers: {
//     clearStoreError: (state) => {
//       state.error = null;
//     },
//     resetStoreControl: (state) => {
//       state.items = [];
//       state.loadingItems = false;

//       state.my = null;
//       state.loadingMy = false;

//       state.purchasing = false;
//       state.activating = false;
//       state.buyingCoinz = false;
//       state.buyingCustomEmojiBadge = false;
//       state.activatingCustomEmojiBadge = false;
//       state.loadingCustomEmojiBadge = false;
//       state.adminUpdatingCoinz = false;

//       state.lastPurchase = null;

//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       /* ========== listStoreItems ========== */
//       .addCase(listStoreItems.pending, (state) => {
//         state.loadingItems = true;
//         state.error = null;
//       })
//       .addCase(listStoreItems.fulfilled, (state, action) => {
//         state.loadingItems = false;
//         state.items = action.payload.items;
//       })
//       .addCase(listStoreItems.rejected, (state, action) => {
//         state.loadingItems = false;
//         state.error = action.payload || "Failed to load store items";
//       })

//       /* ========== getMyInventory ========== */
//       .addCase(getMyInventory.pending, (state) => {
//         state.loadingMy = true;
//         state.error = null;
//       })
//       .addCase(getMyInventory.fulfilled, (state, action) => {
//         state.loadingMy = false;
//         state.my = {
//           ...action.payload.data,
//           customEmojiBadge: action.payload.data.customEmojiBadge || defaultCustomEmojiBadge
//         };
//       })
//       .addCase(getMyInventory.rejected, (state, action) => {
//         state.loadingMy = false;
//         state.error = action.payload || "Failed to load inventory";
//       })

//       /* ========== buyCoinz ========== */
//       .addCase(buyCoinz.pending, (state) => {
//         state.buyingCoinz = true;
//         state.error = null;
//       })
//       .addCase(buyCoinz.fulfilled, (state, action) => {
//         state.buyingCoinz = false;

//         if (state.my) {
//           state.my.coinzBalance = action.payload.coinzBalance;
//         }
//       })
//       .addCase(buyCoinz.rejected, (state, action) => {
//         state.buyingCoinz = false;
//         state.error = action.payload || "Failed to buy coinz";
//       })

//       /* ========== buyCustomEmojiBadge ========== */
//       .addCase(buyCustomEmojiBadge.pending, (state) => {
//         state.buyingCustomEmojiBadge = true;
//         state.error = null;
//       })
//       .addCase(buyCustomEmojiBadge.fulfilled, (state, action) => {
//         state.buyingCustomEmojiBadge = false;

//         if (state.my) {
//           state.my.coinzBalance = action.payload.coinzBalance;
//           state.my.customEmojiBadge = action.payload.customEmojiBadge;
//         } else {
//           state.my = {
//             coinzBalance: action.payload.coinzBalance,
//             activeCustomization: defaultActiveCustomization,
//             customEmojiBadge: action.payload.customEmojiBadge,
//             inventory: []
//           };
//         }
//       })
//       .addCase(buyCustomEmojiBadge.rejected, (state, action) => {
//         state.buyingCustomEmojiBadge = false;
//         state.error = action.payload || "Failed to buy custom emoji badge";
//       })

//       /* ========== getMyCustomEmojiBadge ========== */
//       .addCase(getMyCustomEmojiBadge.pending, (state) => {
//         state.loadingCustomEmojiBadge = true;
//         state.error = null;
//       })
//       .addCase(getMyCustomEmojiBadge.fulfilled, (state, action) => {
//         state.loadingCustomEmojiBadge = false;

//         if (state.my) {
//           state.my.coinzBalance = action.payload.coinzBalance;
//           state.my.customEmojiBadge = action.payload.customEmojiBadge;
//         } else {
//           state.my = {
//             coinzBalance: action.payload.coinzBalance,
//             activeCustomization: defaultActiveCustomization,
//             customEmojiBadge: action.payload.customEmojiBadge,
//             inventory: []
//           };
//         }
//       })
//       .addCase(getMyCustomEmojiBadge.rejected, (state, action) => {
//         state.loadingCustomEmojiBadge = false;
//         state.error = action.payload || "Failed to load custom emoji badge";
//       })

//       /* ========== purchaseStoreItems ========== */
//       .addCase(purchaseStoreItems.pending, (state) => {
//         state.purchasing = true;
//         state.error = null;
//       })
//       .addCase(purchaseStoreItems.fulfilled, (state, action) => {
//         state.purchasing = false;
//         state.lastPurchase = action.payload.result;

//         if (state.my) {
//           state.my.coinzBalance = action.payload.result.coinzBalance;
//           state.my.activeCustomization = action.payload.result.activeCustomization;

//           const updates = action.payload.result.inventoryUpdates || [];
//           if (updates.length) {
//             state.my.inventory = upsertInventoryByUpdates(state.my.inventory, updates);
//           }
//         }
//       })
//       .addCase(purchaseStoreItems.rejected, (state, action) => {
//         state.purchasing = false;
//         state.error = action.payload || "Purchase failed";
//       })

//       /* ========== activateStoreItem ========== */
//       .addCase(activateStoreItem.pending, (state) => {
//         state.activating = true;
//         state.error = null;
//       })
//       .addCase(activateStoreItem.fulfilled, (state, action) => {
//         state.activating = false;
//         if (state.my) state.my.activeCustomization = action.payload.activeCustomization;
//       })
//       .addCase(activateStoreItem.rejected, (state, action) => {
//         state.activating = false;
//         state.error = action.payload || "Failed to activate item";
//       })

//       /* ========== activateCustomEmojiBadge ========== */
//       .addCase(activateCustomEmojiBadge.pending, (state) => {
//         state.activatingCustomEmojiBadge = true;
//         state.error = null;
//       })
//       .addCase(activateCustomEmojiBadge.fulfilled, (state, action) => {
//         state.activatingCustomEmojiBadge = false;

//         if (state.my) {
//           state.my.customEmojiBadge = action.payload.customEmojiBadge;
//         } else {
//           state.my = {
//             coinzBalance: 0,
//             activeCustomization: defaultActiveCustomization,
//             customEmojiBadge: action.payload.customEmojiBadge,
//             inventory: []
//           };
//         }
//       })
//       .addCase(activateCustomEmojiBadge.rejected, (state, action) => {
//         state.activatingCustomEmojiBadge = false;
//         state.error = action.payload || "Failed to activate custom emoji badge";
//       })

//       /* ========== Admin coinz ========== */
//       .addCase(adminCreditCoinz.pending, (state) => {
//         state.adminUpdatingCoinz = true;
//         state.error = null;
//       })
//       .addCase(adminCreditCoinz.fulfilled, (state, action) => {
//         state.adminUpdatingCoinz = false;
//         if (state.my) state.my.coinzBalance = action.payload.coinzBalance;
//       })
//       .addCase(adminCreditCoinz.rejected, (state, action) => {
//         state.adminUpdatingCoinz = false;
//         state.error = action.payload || "Failed to credit coinz";
//       })

//       .addCase(adminDebitCoinz.pending, (state) => {
//         state.adminUpdatingCoinz = true;
//         state.error = null;
//       })
//       .addCase(adminDebitCoinz.fulfilled, (state, action) => {
//         state.adminUpdatingCoinz = false;
//         if (state.my) state.my.coinzBalance = action.payload.coinzBalance;
//       })
//       .addCase(adminDebitCoinz.rejected, (state, action) => {
//         state.adminUpdatingCoinz = false;
//         state.error = action.payload || "Failed to debit coinz";
//       });
//   }
// });

// export const { clearStoreError, resetStoreControl } = storeControlSlice.actions;
// export default storeControlSlice.reducer;

// /* =====================================================
//    SELECTORS
// ===================================================== */

// export const selectStoreItems = (s: RootState) => s.storeControl.items;
// export const selectStoreItemsLoading = (s: RootState) => s.storeControl.loadingItems;

// export const selectMyStore = (s: RootState) => s.storeControl.my;
// export const selectMyStoreLoading = (s: RootState) => s.storeControl.loadingMy;

// export const selectMyCustomEmojiBadge = (s: RootState) =>
//   s.storeControl.my?.customEmojiBadge || defaultCustomEmojiBadge;

// export const selectStorePurchasing = (s: RootState) => s.storeControl.purchasing;
// export const selectStoreActivating = (s: RootState) => s.storeControl.activating;
// export const selectStoreBuyingCoinz = (s: RootState) => s.storeControl.buyingCoinz;
// export const selectStoreBuyingCustomEmojiBadge = (s: RootState) =>
//   s.storeControl.buyingCustomEmojiBadge;
// export const selectStoreActivatingCustomEmojiBadge = (s: RootState) =>
//   s.storeControl.activatingCustomEmojiBadge;
// export const selectStoreLoadingCustomEmojiBadge = (s: RootState) =>
//   s.storeControl.loadingCustomEmojiBadge;
// export const selectStoreAdminUpdatingCoinz = (s: RootState) =>
//   s.storeControl.adminUpdatingCoinz;

// export const selectStoreLastPurchase = (s: RootState) => s.storeControl.lastPurchase;
// export const selectStoreError = (s: RootState) => s.storeControl.error;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { RootState } from "../store";

/* =====================================================
   TYPES
===================================================== */

export type VerificationType = "none" | "blue" | "gold" | "business";

export type StoreItemType =
  | "avatarFrame"
  | "avatarGif"
  | "usernameColor"
  | "messageTextColor"
  | "badge"
  | "messageEffect"
  | "gift"
  | "profileEntryAnimation"
  | "verification";
  export type BadgeKind = "static" | "animated";
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
  durationDays?: number; // 0 = دائم
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
  item?: StoreItem; // populate("item")
};

export type ActiveCustomization = {
  avatarFrame?: string;
  avatarGif?: string;
  usernameColor?: string;
  messageTextColor?: string;
  messageEffect?: string;
  profileEntryAnimation?: string;
  badges: string[];
  verificationType: VerificationType;
};

export type CustomEmojiBadge = {
  emoji: string;
  isActive: boolean;
  purchasedAt?: string | null;
  expiresAt?: string | null;
};

export type MyInventoryResponse = {
  coinzBalance: number;
  activeCustomization: ActiveCustomization;
  customEmojiBadge: CustomEmojiBadge;
  inventory: InventoryEntry[];
};

export type InventoryUpdate = {
  itemId: string;
  key: string;
  type: StoreItemType;
  quantity: number;
  expiresAt: string | null;
};

export type PurchaseResult = {
  totalCost: number;
  coinzBalance: number;
  activeCustomization: ActiveCustomization;
  inventoryUpdates?: InventoryUpdate[];
};

export type PurchaseInput = {
  items: { itemId: string; quantity?: number }[];
  setActive?: boolean;
};

export type ActivateInput = {
  type:
    | "avatarFrame"
    | "avatarGif"
    | "usernameColor"
    | "messageTextColor"
    | "messageEffect"
    | "profileEntryAnimation"
    | "badge"
    | "verification";
  key: string;
  mode?: "set" | "add" | "remove";
};

export type AdminCoinzInput = {
  userId: string;
  amount: number;
  reason?: string;
};

export type BuyCoinzInput = {
  amount: number;
};

export type BuyCustomEmojiBadgeInput = {
  emoji: string;
  setActive?: boolean;
};

export type ActivateCustomEmojiBadgeInput = {
  active: boolean;
};

export type BuyCustomEmojiBadgeResult = {
  coinzBalance: number;
  customEmojiBadge: CustomEmojiBadge;
};

export type CleanupExpiredStoreResult = {
  deletedCount?: number;
  activeCustomization?: ActiveCustomization;
  customEmojiBadge?: CustomEmojiBadge;
};

/* =====================================================
   HELPERS
===================================================== */

const errMsg = (err: any, fallback: string) =>
  err?.response?.data?.message || err?.message || fallback;

const BASE = "/store";

function isExpiredDate(value?: string | Date | null) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time <= Date.now();
}

function filterActiveInventory(inventory?: InventoryEntry[]) {
  if (!Array.isArray(inventory)) return [];
  return inventory.filter((row) => !isExpiredDate(row?.expiresAt));
}

function sanitizeCustomEmojiBadge(value?: CustomEmojiBadge | null): CustomEmojiBadge {
  const badge = value || defaultCustomEmojiBadge;

  if (isExpiredDate(badge.expiresAt)) {
    return defaultCustomEmojiBadge;
  }

  return badge;
}

const defaultActiveCustomization: ActiveCustomization = {
  avatarFrame: "",
  avatarGif: "",
  usernameColor: "",
  messageTextColor: "",
  messageEffect: "",
  profileEntryAnimation: "",
  badges: [],
  verificationType: "none"
};
const defaultCustomEmojiBadge: CustomEmojiBadge = {
  emoji: "",
  isActive: false,
  purchasedAt: null,
  expiresAt: null
};

/* =====================================================
   THUNKS
===================================================== */
/** GET /store/items?type=...&active=true&badgeKind=animated */
export const listStoreItems = createAsyncThunk<
  { items: StoreItem[] },
  {
    type?: StoreItemType | "";
    active?: boolean;
    badgeKind?: BadgeKind | "";
  } | void,
  { rejectValue: string }
>("storeControl/listItems", async (args, thunkAPI) => {
  try {
    const type = (args as any)?.type ? String((args as any).type) : "";
    const active = (args as any)?.active ?? true;
    const badgeKind = (args as any)?.badgeKind
      ? String((args as any).badgeKind)
      : "";

    const params: any = {};

    if (type) {
      params.type = type;
    }

    params.active = String(Boolean(active));

    if (
      type === "badge" &&
      (badgeKind === "animated" || badgeKind === "static")
    ) {
      params.badgeKind = badgeKind;
    }

    const res = await api.get(`${BASE}/items`, { params });

    return {
      items: res.data.items || [],
    };
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
        activeCustomization: res.data.activeCustomization || defaultActiveCustomization,
        customEmojiBadge: sanitizeCustomEmojiBadge(res.data.customEmojiBadge),
        inventory: filterActiveInventory(res.data.inventory || [])
      }
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to load inventory"));
  }
});

/** POST /store/cleanup-expired */
export const cleanupExpiredStoreItems = createAsyncThunk<
  { result: CleanupExpiredStoreResult },
  void,
  { rejectValue: string }
>("storeControl/cleanupExpired", async (_, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/cleanup-expired`);

    return {
      result: res.data?.result || {}
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to cleanup expired store items"));
  }
});

/** POST /store/coinz/buy */
export const buyCoinz = createAsyncThunk<
  { coinzBalance: number; added: number },
  BuyCoinzInput,
  { rejectValue: string }
>("storeControl/buyCoinz", async (body, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/coinz/buy`, body);
    return {
      coinzBalance: Number(res.data.coinzBalance) || 0,
      added: Number(res.data.added) || 0
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to buy coinz"));
  }
});

/** POST /store/custom-emoji-badge/buy */
export const buyCustomEmojiBadge = createAsyncThunk<
  BuyCustomEmojiBadgeResult,
  BuyCustomEmojiBadgeInput,
  { rejectValue: string }
>("storeControl/buyCustomEmojiBadge", async (body, thunkAPI) => {
  try {
    const res = await api.post(`${BASE}/custom-emoji-badge/buy`, body);

    return {
      coinzBalance: Number(res.data.coinzBalance) || 0,
      customEmojiBadge: sanitizeCustomEmojiBadge(res.data.customEmojiBadge)
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to buy custom emoji badge"));
  }
});

/** GET /store/custom-emoji-badge/me */
export const getMyCustomEmojiBadge = createAsyncThunk<
  { coinzBalance: number; customEmojiBadge: CustomEmojiBadge },
  void,
  { rejectValue: string }
>("storeControl/getMyCustomEmojiBadge", async (_, thunkAPI) => {
  try {
    const res = await api.get(`${BASE}/custom-emoji-badge/me`);

    return {
      coinzBalance: Number(res.data.coinzBalance) || 0,
      customEmojiBadge: sanitizeCustomEmojiBadge(res.data.customEmojiBadge)
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to load custom emoji badge"));
  }
});

/** PATCH /store/custom-emoji-badge/activate */
export const activateCustomEmojiBadge = createAsyncThunk<
  { customEmojiBadge: CustomEmojiBadge },
  ActivateCustomEmojiBadgeInput,
  { rejectValue: string }
>("storeControl/activateCustomEmojiBadge", async (body, thunkAPI) => {
  try {
    const res = await api.patch(`${BASE}/custom-emoji-badge/activate`, body);

    return {
      customEmojiBadge: sanitizeCustomEmojiBadge(res.data.customEmojiBadge)
    };
  } catch (e: any) {
    return thunkAPI.rejectWithValue(errMsg(e, "Failed to activate custom emoji badge"));
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
        activeCustomization: res.data.activeCustomization || defaultActiveCustomization,
        inventoryUpdates: Array.isArray(res.data.inventoryUpdates) ? res.data.inventoryUpdates : []
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
      activeCustomization: res.data.activeCustomization || defaultActiveCustomization
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
  items: StoreItem[];
  loadingItems: boolean;

  my: MyInventoryResponse | null;
  loadingMy: boolean;

  purchasing: boolean;
  activating: boolean;
  buyingCoinz: boolean;
  buyingCustomEmojiBadge: boolean;
  activatingCustomEmojiBadge: boolean;
  loadingCustomEmojiBadge: boolean;
  adminUpdatingCoinz: boolean;
  cleaningExpired: boolean;

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
  buyingCoinz: false,
  buyingCustomEmojiBadge: false,
  activatingCustomEmojiBadge: false,
  loadingCustomEmojiBadge: false,
  adminUpdatingCoinz: false,
  cleaningExpired: false,

  lastPurchase: null,

  error: null
};

function upsertInventoryByUpdates(
  current: InventoryEntry[],
  updates: InventoryUpdate[]
): InventoryEntry[] {
  if (!Array.isArray(current)) return current;

  const byKey = new Map<string, InventoryEntry>();
  for (const it of current) {
    const k = `${it.itemType}:${it.itemKey}`;
    byKey.set(k, it);
  }

  for (const u of updates) {
    const k = `${u.type}:${u.key}`;
    const prev = byKey.get(k);

    if (prev) {
      byKey.set(k, {
        ...prev,
        quantity: Number(u.quantity) || prev.quantity,
        expiresAt: u.expiresAt ?? prev.expiresAt
      });
    } else {
      byKey.set(k, {
        _id: `tmp_${u.itemId}`,
        user: "",
        itemType: u.type,
        itemKey: u.key,
        quantity: Number(u.quantity) || 1,
        expiresAt: u.expiresAt ?? null
      });
    }
  }

  return filterActiveInventory(Array.from(byKey.values()));
}

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
      state.buyingCoinz = false;
      state.buyingCustomEmojiBadge = false;
      state.activatingCustomEmojiBadge = false;
      state.loadingCustomEmojiBadge = false;
      state.adminUpdatingCoinz = false;
      state.cleaningExpired = false;

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
        state.my = {
          ...action.payload.data,
          customEmojiBadge: sanitizeCustomEmojiBadge(action.payload.data.customEmojiBadge),
          inventory: filterActiveInventory(action.payload.data.inventory)
        };
      })
      .addCase(getMyInventory.rejected, (state, action) => {
        state.loadingMy = false;
        state.error = action.payload || "Failed to load inventory";
      })

      /* ========== cleanupExpiredStoreItems ========== */
      .addCase(cleanupExpiredStoreItems.pending, (state) => {
        state.cleaningExpired = true;
        state.error = null;
      })
      .addCase(cleanupExpiredStoreItems.fulfilled, (state, action) => {
        state.cleaningExpired = false;

        if (state.my) {
          state.my.inventory = filterActiveInventory(state.my.inventory);

          if (action.payload.result.activeCustomization) {
            state.my.activeCustomization = action.payload.result.activeCustomization;
          }

          if (action.payload.result.customEmojiBadge) {
            state.my.customEmojiBadge = sanitizeCustomEmojiBadge(
              action.payload.result.customEmojiBadge
            );
          } else {
            state.my.customEmojiBadge = sanitizeCustomEmojiBadge(state.my.customEmojiBadge);
          }
        }
      })
      .addCase(cleanupExpiredStoreItems.rejected, (state, action) => {
        state.cleaningExpired = false;
        state.error = action.payload || "Failed to cleanup expired store items";
      })

      /* ========== buyCoinz ========== */
      .addCase(buyCoinz.pending, (state) => {
        state.buyingCoinz = true;
        state.error = null;
      })
      .addCase(buyCoinz.fulfilled, (state, action) => {
        state.buyingCoinz = false;

        if (state.my) {
          state.my.coinzBalance = action.payload.coinzBalance;
        }
      })
      .addCase(buyCoinz.rejected, (state, action) => {
        state.buyingCoinz = false;
        state.error = action.payload || "Failed to buy coinz";
      })

      /* ========== buyCustomEmojiBadge ========== */
      .addCase(buyCustomEmojiBadge.pending, (state) => {
        state.buyingCustomEmojiBadge = true;
        state.error = null;
      })
      .addCase(buyCustomEmojiBadge.fulfilled, (state, action) => {
        state.buyingCustomEmojiBadge = false;

        if (state.my) {
          state.my.coinzBalance = action.payload.coinzBalance;
          state.my.customEmojiBadge = action.payload.customEmojiBadge;
        } else {
          state.my = {
            coinzBalance: action.payload.coinzBalance,
            activeCustomization: defaultActiveCustomization,
            customEmojiBadge: action.payload.customEmojiBadge,
            inventory: []
          };
        }
      })
      .addCase(buyCustomEmojiBadge.rejected, (state, action) => {
        state.buyingCustomEmojiBadge = false;
        state.error = action.payload || "Failed to buy custom emoji badge";
      })

      /* ========== getMyCustomEmojiBadge ========== */
      .addCase(getMyCustomEmojiBadge.pending, (state) => {
        state.loadingCustomEmojiBadge = true;
        state.error = null;
      })
      .addCase(getMyCustomEmojiBadge.fulfilled, (state, action) => {
        state.loadingCustomEmojiBadge = false;

        if (state.my) {
          state.my.coinzBalance = action.payload.coinzBalance;
          state.my.customEmojiBadge = action.payload.customEmojiBadge;
        } else {
          state.my = {
            coinzBalance: action.payload.coinzBalance,
            activeCustomization: defaultActiveCustomization,
            customEmojiBadge: action.payload.customEmojiBadge,
            inventory: []
          };
        }
      })
      .addCase(getMyCustomEmojiBadge.rejected, (state, action) => {
        state.loadingCustomEmojiBadge = false;
        state.error = action.payload || "Failed to load custom emoji badge";
      })

      /* ========== purchaseStoreItems ========== */
      .addCase(purchaseStoreItems.pending, (state) => {
        state.purchasing = true;
        state.error = null;
      })
      .addCase(purchaseStoreItems.fulfilled, (state, action) => {
        state.purchasing = false;
        state.lastPurchase = action.payload.result;

        if (state.my) {
          state.my.coinzBalance = action.payload.result.coinzBalance;
          state.my.activeCustomization = action.payload.result.activeCustomization;

          const updates = action.payload.result.inventoryUpdates || [];
          if (updates.length) {
            state.my.inventory = upsertInventoryByUpdates(state.my.inventory, updates);
          }
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

      /* ========== activateCustomEmojiBadge ========== */
      .addCase(activateCustomEmojiBadge.pending, (state) => {
        state.activatingCustomEmojiBadge = true;
        state.error = null;
      })
      .addCase(activateCustomEmojiBadge.fulfilled, (state, action) => {
        state.activatingCustomEmojiBadge = false;

        if (state.my) {
          state.my.customEmojiBadge = action.payload.customEmojiBadge;
        } else {
          state.my = {
            coinzBalance: 0,
            activeCustomization: defaultActiveCustomization,
            customEmojiBadge: action.payload.customEmojiBadge,
            inventory: []
          };
        }
      })
      .addCase(activateCustomEmojiBadge.rejected, (state, action) => {
        state.activatingCustomEmojiBadge = false;
        state.error = action.payload || "Failed to activate custom emoji badge";
      })

      /* ========== Admin coinz ========== */
      .addCase(adminCreditCoinz.pending, (state) => {
        state.adminUpdatingCoinz = true;
        state.error = null;
      })
      .addCase(adminCreditCoinz.fulfilled, (state, action) => {
        state.adminUpdatingCoinz = false;
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

export const selectMyCustomEmojiBadge = (s: RootState) =>
  s.storeControl.my?.customEmojiBadge || defaultCustomEmojiBadge;

export const selectStorePurchasing = (s: RootState) => s.storeControl.purchasing;
export const selectStoreActivating = (s: RootState) => s.storeControl.activating;
export const selectStoreBuyingCoinz = (s: RootState) => s.storeControl.buyingCoinz;
export const selectStoreBuyingCustomEmojiBadge = (s: RootState) =>
  s.storeControl.buyingCustomEmojiBadge;
export const selectStoreActivatingCustomEmojiBadge = (s: RootState) =>
  s.storeControl.activatingCustomEmojiBadge;
export const selectStoreLoadingCustomEmojiBadge = (s: RootState) =>
  s.storeControl.loadingCustomEmojiBadge;
export const selectStoreAdminUpdatingCoinz = (s: RootState) =>
  s.storeControl.adminUpdatingCoinz;
export const selectStoreCleaningExpired = (s: RootState) =>
  s.storeControl.cleaningExpired;

export const selectMyActiveInventory = (s: RootState) =>
  filterActiveInventory(s.storeControl.my?.inventory || []);

export const selectStoreLastPurchase = (s: RootState) => s.storeControl.lastPurchase;
export const selectStoreError = (s: RootState) => s.storeControl.error;