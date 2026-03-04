// // app/(tabs)/store.tsx
// // ✅ نسخة مرتّبة + إضافة Loading “في كل شيء” قدر الإمكان:
// // 1) Loading عام عند التحميل/تغيير التبويب/السحب للتحديث (Overlay + تعطيل التفاعلات الأساسية)
// // 2) Loading على الأزرار: Buy / Activate / Create Account / Paymob Buy Now / Copy
// // 3) منع الضغط المتكرر أثناء التنفيذ + نصوص واضحة
// // 4) لا يوجد Coinz Modal قديم، والانتقال لتبويب coinz فقط

// import { useFocusEffect } from "@react-navigation/native";
// import * as Clipboard from "expo-clipboard";
// import { useRouter } from "expo-router";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   Modal,
//   Pressable,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import api from "@/services/api";

// import {
//   activateStoreItem,
//   clearStoreError,
//   getMyInventory,
//   listStoreItems,
//   purchaseStoreItems,
//   selectMyStore,
//   selectMyStoreLoading,
//   selectStoreActivating,
//   selectStoreBuyingCoinz,
//   selectStoreError,
//   selectStoreItems,
//   selectStoreItemsLoading,
//   selectStorePurchasing
// } from "@/redux/slices/storeControl.slice";

// import { debitMyCoinz, registerNoLogin } from "@/redux/slices/userSlice";

// /* =========================================================
//    TYPES & CONSTANTS
// ========================================================= */

// type UiTab =
//   | "all"
//   | "coinz"
//   | "avatarFrame"
//   | "badge"
//   | "messageEffect"
//   | "profileEntryAnimation"
//   | "verification"
//   | "gift"
//   | "bundles"
//   | "limited";

// const TYPE_TABS: { key: UiTab; label: string }[] = [
//   { key: "all", label: "All" },
//   { key: "coinz", label: "Coinz" },
//   { key: "avatarFrame", label: "Frames" },
//   { key: "badge", label: "Badges" },
//   { key: "messageEffect", label: "Effects" },
//   { key: "profileEntryAnimation", label: "Entry" },
//   { key: "gift", label: "Gifts" },
//   { key: "bundles", label: "Bundles" },
//   { key: "limited", label: "Limited" }
// ];

// // ✅ باقات شراء Coinz (Paymob)
// const COINZ_PACKS: {
//   packageId: "p1" | "p2" | "p3";
//   title: string;
//   subtitle?: string;
//   priceEGP: number;
//   coinz: number;
// }[] = [
//   { packageId: "p1", title: "Starter", subtitle: "100 Coinz", priceEGP: 10, coinz: 100 },
//   { packageId: "p2", title: "Popular", subtitle: "260 Coinz", priceEGP: 25, coinz: 260 },
//   { packageId: "p3", title: "Pro", subtitle: "550 Coinz", priceEGP: 50, coinz: 550 }
// ];

// const CREATE_ACCOUNT_COST = 30000;

// /* =========================================================
//    HELPERS
// ========================================================= */

// function prettyType(t: string) {
//   switch (t) {
//     case "avatarFrame":
//       return "Avatar Frame";
//     case "badge":
//       return "Badge";
//     case "messageEffect":
//       return "Message Effect";
//     case "gift":
//       return "Gift";
//     case "profileEntryAnimation":
//       return "Profile Entry";
//     case "verification":
//       return "Verification";
//     default:
//       return t || "Item";
//   }
// }

// function formatCoinz(n: number) {
//   const x = Number.isFinite(n) ? n : 0;
//   return Math.round(x).toLocaleString();
// }

// function isExpired(expiresAt: string) {
//   const t = new Date(expiresAt).getTime();
//   if (!Number.isFinite(t)) return false;
//   return t <= Date.now();
// }

// function formatDate(iso: string) {
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return iso;
//   return d.toLocaleDateString();
// }

// function getItemImageUrl(item: any): string {
//   const direct =
//     String(item?.iconUrl || "") ||
//     String(item?.coverUrl || "") ||
//     String(item?.previewUrl || "");

//   if (direct) return direct;

//   const meta = item?.meta || {};
//   return (
//     String(meta?.iconUrl || "") ||
//     String(meta?.coverUrl || "") ||
//     String(meta?.previewUrl || "")
//   );
// }

// /* =========================================================
//    SMALL UI COMPONENTS
// ========================================================= */

// function Chip({
//   text,
//   tone
// }: {
//   text: string;
//   tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning";
// }) {
//   const bg =
//     tone === "good"
//       ? "#0F766E"
//       : tone === "info"
//         ? "#1D4ED8"
//         : tone === "gold"
//           ? "#A16207"
//           : tone === "danger"
//             ? "#B91C1C"
//             : tone === "warning"
//               ? "#B45309"
//               : "#334155";

//   return (
//     <View style={[styles.chip, { backgroundColor: bg }]}>
//       <Text style={styles.chipText}>{text}</Text>
//     </View>
//   );
// }

// function Tag({ label }: { label: string }) {
//   return (
//     <View style={styles.tag}>
//       <Text style={styles.tagText} numberOfLines={1}>
//         {label}
//       </Text>
//     </View>
//   );
// }

// function InlineSpinner({ size = 16 }: { size?: number }) {
//   return <ActivityIndicator size={size as any} />;
// }

// /* =========================================================
//    MAIN SCREEN
// ========================================================= */

// export default function StoreScreen() {
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   // Store items + inventory
//   const items = useAppSelector(selectStoreItems);
//   const itemsLoading = useAppSelector(selectStoreItemsLoading);

//   const my = useAppSelector(selectMyStore);
//   const myLoading = useAppSelector(selectMyStoreLoading);

//   const purchasing = useAppSelector(selectStorePurchasing);
//   const activating = useAppSelector(selectStoreActivating);
//   const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
//   const error = useAppSelector(selectStoreError);

//   // UI state
//   const [tab, setTab] = useState<UiTab>("all");
//   const [q, setQ] = useState("");
//   const [refreshing, setRefreshing] = useState(false);

//   // Loading local (لكل شيء)
//   const [tabLoading, setTabLoading] = useState(false); // تغيير تبويب / تحميل
//   const [paymobLoadingPackId, setPaymobLoadingPackId] = useState<string | null>(null); // زر Buy Now للباقات
//   const [createSubmitting, setCreateSubmitting] = useState(false); // Confirm create account
//   const [copyLoading, setCopyLoading] = useState(false); // Copy credentials
//   const [activateKeyLoading, setActivateKeyLoading] = useState<string | null>(null); // Activate/Use لكل عنصر
//   const [buySubmitting, setBuySubmitting] = useState(false); // Confirm purchase modal

//   // Purchase item modal
//   const [buyOpen, setBuyOpen] = useState(false);
//   const [buyItemId, setBuyItemId] = useState<string>("");
//   const [buyQty, setBuyQty] = useState<number>(1);
//   const [buySetActive, setBuySetActive] = useState(true);

//   // Create account modal
//   const [createOpen, setCreateOpen] = useState(false);
//   const [newUsername, setNewUsername] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   // Created account modal
//   const [createdOpen, setCreatedOpen] = useState(false);
//   const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(
//     null
//   );

//   const coinz = my?.coinzBalance ?? 0;

//   const active = my?.activeCustomization || {
//     avatarFrame: "",
//     messageEffect: "",
//     profileEntryAnimation: "",
//     badges: [],
//     verificationType: "none"
//   };

//   const selectedItem = useMemo(() => {
//     return items.find((x: any) => String(x._id) === String(buyItemId)) || null;
//   }, [items, buyItemId]);

//   const ownedByTypeKey = useMemo(() => {
//     const inv = my?.inventory || [];
//     const map = new Map<string, any>();
//     for (const it of inv) {
//       const t = String((it as any).itemType || "");
//       const k = String((it as any).itemKey || "");
//       map.set(`${t}:${k}`, it);
//     }
//     return map;
//   }, [my?.inventory]);

//   const ownedKeysByType = useMemo(() => {
//     const inv = my?.inventory || [];
//     const map: Record<string, Set<string>> = {};
//     for (const it of inv) {
//       const t = String((it as any).itemType || "");
//       const k = String((it as any).itemKey || "");
//       if (!map[t]) map[t] = new Set();
//       map[t].add(k);
//     }
//     return map;
//   }, [my?.inventory]);

//   const groupedOwned = useMemo(() => {
//     const inv = my?.inventory || [];
//     const byType: Record<string, any[]> = {};
//     for (const row of inv) {
//       const t = String((row as any).itemType || "");
//       if (!byType[t]) byType[t] = [];
//       byType[t].push(row);
//     }
//     const order = ["avatarFrame", "badge", "messageEffect", "profileEntryAnimation", "verification", "gift"];
//     return order.filter((k) => byType[k]?.length).map((k) => ({ type: k, rows: byType[k] }));
//   }, [my?.inventory]);

//   // Filter store items based on tab + query
//   const filtered = useMemo(() => {
//     if (tab === "coinz") return [];

//     const query = q.trim().toLowerCase();

//     return (items || []).filter((it: any) => {
//       const type = String(it.type || "");
//       const meta = it.meta || {};

//       const okTab =
//         tab === "all"
//           ? true
//           : tab === "bundles"
//             ? String(meta.category || "").toLowerCase() === "bundle"
//             : tab === "limited"
//               ? Boolean(meta.isLimited) === true
//               : type === tab;

//       if (!okTab) return false;

//       if (!query) return true;
//       const hay = `${it.name || ""} ${it.key || ""} ${it.description || ""}`.toLowerCase();
//       return hay.includes(query);
//     });
//   }, [items, tab, q]);

//   /* =========================================================
//      LOADERS
//   ========================================================= */

//   const loadAll = useCallback(async () => {
//     setTabLoading(true);
//     try {
//       // ✅ في coinz لا داعي لطلب listStoreItems
//       if (tab === "coinz") {
//         await dispatch(getMyInventory() as any);
//         return;
//       }

//       const typeParam =
//         tab === "avatarFrame" ||
//         tab === "badge" ||
//         tab === "messageEffect" ||
//         tab === "profileEntryAnimation" ||
//         tab === "verification" ||
//         tab === "gift"
//           ? tab
//           : "";

//       await Promise.all([
//         dispatch(listStoreItems({ type: typeParam as any, active: true }) as any),
//         dispatch(getMyInventory() as any)
//       ]);
//     } finally {
//       setTabLoading(false);
//     }
//   }, [dispatch, tab]);

//   useEffect(() => {
//     loadAll();
//   }, [loadAll]);

//   useFocusEffect(
//     useCallback(() => {
//       dispatch(getMyInventory() as any);
//     }, [dispatch])
//   );

//   useEffect(() => {
//     if (!error) return;
//     Alert.alert("Store", error, [
//       { text: "OK", onPress: () => dispatch(clearStoreError()) }
//     ]);
//   }, [error, dispatch]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await loadAll();
//     } finally {
//       setRefreshing(false);
//     }
//   }, [loadAll]);

//   /* =========================================================
//      ACTIONS
//   ========================================================= */

//   const globalBusy =
//     tabLoading ||
//     refreshing ||
//     itemsLoading ||
//     myLoading ||
//     purchasing ||
//     activating ||
//     buyingCoinz ||
//     buySubmitting ||
//     createSubmitting ||
//     !!paymobLoadingPackId ||
//     !!activateKeyLoading ||
//     copyLoading;

//   const openBuy = useCallback((itemId: string) => {
//     setBuyItemId(itemId);
//     setBuyQty(1);
//     setBuySetActive(true);
//     setBuyOpen(true);
//   }, []);

//   const doBuy = useCallback(async () => {
//     if (!selectedItem) return;
//     if (buySubmitting) return;

//     setBuySubmitting(true);
//     try {
//       const qty = Math.max(1, Number(buyQty || 1));

//       const ownedSet = ownedKeysByType[String(selectedItem.type)] || new Set();
//       const alreadyOwned = ownedSet.has(String(selectedItem.key));
//       const nonRepeatable = !selectedItem.isStackable && !selectedItem.isConsumable;

//       if (alreadyOwned && nonRepeatable) {
//         Alert.alert("Already owned", "You already own this item.");
//         return;
//       }

//       const res = await dispatch(
//         purchaseStoreItems({
//           items: [{ itemId: selectedItem._id, quantity: qty }],
//           setActive: buySetActive
//         }) as any
//       );

//       if (purchaseStoreItems.fulfilled.match(res)) {
//         setBuyOpen(false);
//         await dispatch(getMyInventory() as any);
//       }
//     } finally {
//       setBuySubmitting(false);
//     }
//   }, [selectedItem, buyQty, ownedKeysByType, buySetActive, dispatch, buySubmitting]);

//   const doActivate = useCallback(
//     async (type: any, key: string, mode?: "set" | "add" | "remove") => {
//       const loadingKey = `${String(type)}:${String(key)}:${String(mode || "set")}`;
//       if (activateKeyLoading) return;

//       const invKey = `${String(type)}:${String(key)}`;
//       const inv = ownedByTypeKey.get(invKey);

//       if (inv?.expiresAt && isExpired(inv.expiresAt)) {
//         Alert.alert("Expired", "This item has expired. Please renew/buy again.");
//         return;
//       }

//       setActivateKeyLoading(loadingKey);
//       try {
//         await dispatch(activateStoreItem({ type, key, mode } as any) as any);
//         await dispatch(getMyInventory() as any);
//       } finally {
//         setActivateKeyLoading(null);
//       }
//     },
//     [dispatch, ownedByTypeKey, activateKeyLoading]
//   );

//   const openCreateAccount = useCallback(() => {
//     setNewUsername("");
//     setNewPassword("");
//     setCreateOpen(true);
//   }, []);

//   const doCreateAccount = useCallback(async () => {
//     if (createSubmitting) return;

//     const username = newUsername.trim();
//     const password = newPassword.trim();

//     if (!username) {
//       Alert.alert("Create Account", "Username is required");
//       return;
//     }
//     if (!password || password.length < 6) {
//       Alert.alert("Create Account", "Password must be at least 6 characters");
//       return;
//     }
//     if (coinz < CREATE_ACCOUNT_COST) {
//       Alert.alert("Create Account", "Insufficient Coinz balance");
//       return;
//     }

//     setCreateSubmitting(true);
//     try {
//       const debitRes = await dispatch(
//         debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any
//       );

//       if (!debitMyCoinz.fulfilled.match(debitRes)) {
//         Alert.alert("Create Account", String((debitRes as any).payload || "Failed to debit coinz"));
//         return;
//       }

//       const regRes = await dispatch(registerNoLogin({ username, password }) as any);

//       if (!registerNoLogin.fulfilled.match(regRes)) {
//         Alert.alert("Create Account", String((regRes as any).payload || "Registration failed"));
//         await dispatch(getMyInventory() as any);
//         return;
//       }

//       await dispatch(getMyInventory() as any);

//       setCreateOpen(false);
//       setCreatedCreds({ username, password });
//       setCreatedOpen(true);
//     } finally {
//       setCreateSubmitting(false);
//     }
//   }, [newUsername, newPassword, coinz, dispatch, createSubmitting]);

//   const copyCreatedCreds = useCallback(async () => {
//     if (!createdCreds) return;
//     if (copyLoading) return;

//     setCopyLoading(true);
//     try {
//       await Clipboard.setStringAsync(
//         `Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`
//       );
//       Alert.alert("Copied", "Credentials copied to clipboard");
//     } finally {
//       setCopyLoading(false);
//     }
//   }, [createdCreds, copyLoading]);

//   const startPaymobCoinz = useCallback(
//     async (packageId: "p1" | "p2" | "p3") => {
//       if (paymobLoadingPackId) return;

//       setPaymobLoadingPackId(packageId);
//       try {
//         const { data } = await api.post("/payments/paymob/create", { packageId });

//         const paymentUrl = data?.paymentUrl;
//         if (!paymentUrl) {
//           Alert.alert("Buy Coinz", "Payment URL not returned.");
//           return;
//         }

//         router.push({
//           pathname: "/paymob-checkout",
//           params: { url: paymentUrl }
//         });
//       } catch (e: any) {
//         Alert.alert("Buy Coinz", e?.response?.data?.message || "Failed to create payment");
//       } finally {
//         setPaymobLoadingPackId(null);
//       }
//     },
//     [router, paymobLoadingPackId]
//   );

//   /* =========================================================
//      RENDER HELPERS
//   ========================================================= */

//   const buyDisabled =
//     purchasing ||
//     activating ||
//     buyingCoinz ||
//     tabLoading ||
//     refreshing ||
//     buySubmitting ||
//     createSubmitting ||
//     !!paymobLoadingPackId ||
//     !!activateKeyLoading;

//   const canChangeTabs = !buyDisabled && !buyOpen && !createOpen && !createdOpen;

//   const renderHeader = useCallback(() => {
//     return (
//       <View style={styles.headerWrap}>
//         <View style={styles.balanceCard}>
//           <View style={styles.balanceTopRow}>
//             <View>
//               <Text style={styles.balanceTitle}>Your Balance</Text>
//               <Text style={styles.balanceValue}>{formatCoinz(coinz)} Coinz</Text>
//             </View>

//             {/* ✅ الانتقال لتبويب coinz بدل فتح modal */}
//             <TouchableOpacity
//               style={[styles.buyCoinzBtn, (buyingCoinz || tabLoading) ? styles.btnDisabled : null]}
//               onPress={() => setTab("coinz")}
//               disabled={buyingCoinz || tabLoading}
//             >
//               <View style={styles.btnRow}>
//                 {(buyingCoinz || tabLoading) ? <InlineSpinner /> : null}
//                 <Text style={styles.buyCoinzBtnText}>
//                   {buyingCoinz ? "Processing..." : tabLoading ? "Loading..." : "Buy Coinz"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.activeBox}>
//             <Text style={styles.activeTitle}>Active</Text>
//             <View style={styles.activeRow}>
//               <Tag label={`Frame: ${active.avatarFrame || "none"}`} />
//               <Tag label={`Effect: ${active.messageEffect || "none"}`} />
//             </View>
//             <View style={styles.activeRow}>
//               <Tag label={`Entry: ${active.profileEntryAnimation || "none"}`} />
//             </View>
//             <View style={styles.activeRow}>
//               <Tag label={`Badges: ${(active.badges || []).length}`} />
//             </View>
//           </View>
//         </View>

//         {/* Tabs */}
//         <FlatList
//           data={TYPE_TABS}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabsRow}
//           keyExtractor={(x) => x.key}
//           renderItem={({ item }) => {
//             const activeTab = item.key === tab;
//             return (
//               <TouchableOpacity
//                 style={[
//                   styles.tabPill,
//                   activeTab ? styles.tabPillActive : null,
//                   !canChangeTabs ? styles.btnDisabled : null
//                 ]}
//                 onPress={() => setTab(item.key)}
//                 disabled={!canChangeTabs}
//               >
//                 <Text style={[styles.tabText, activeTab ? styles.tabTextActive : null]}>
//                   {item.label}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//         />

//         <View style={styles.sectionTitleRow}>
//           <Text style={styles.sectionTitle}>{tab === "coinz" ? "Coinz Packs" : "Store Items"}</Text>
//           {(itemsLoading || myLoading || tabLoading) && <ActivityIndicator />}
//         </View>

//         {tab === "coinz" && (
//           <View style={styles.noteCard}>
//             <Text style={styles.noteText}>
//               You will be redirected to Paymob checkout to complete your payment.
//             </Text>
//           </View>
//         )}

//         {/* ✅ Create Account (30,000 Coinz) */}
//         <View style={styles.card}>
//           <View style={styles.cardTop}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardName}>Create Account</Text>
//               <Text style={styles.cardDesc} numberOfLines={2}>
//                 Create a new account and pay {formatCoinz(CREATE_ACCOUNT_COST)} Coinz from your balance.
//               </Text>
//             </View>

//             <View style={styles.priceBox}>
//               <Text style={styles.priceLabel}>Cost</Text>
//               <Text style={styles.priceValue}>{formatCoinz(CREATE_ACCOUNT_COST)}</Text>
//             </View>
//           </View>

//           <View style={styles.badgeRow}>
//             <Chip text="Service" tone="info" />
//             <Chip text="One-time" tone="neutral" />
//           </View>

//           <View style={styles.cardActions}>
//             <TouchableOpacity
//               style={[
//                 styles.btn,
//                 styles.btnPrimary,
//                 (coinz < CREATE_ACCOUNT_COST || buyDisabled) ? styles.btnDisabled : null
//               ]}
//               onPress={openCreateAccount}
//               disabled={coinz < CREATE_ACCOUNT_COST || buyDisabled}
//             >
//               <View style={styles.btnRow}>
//                 {createSubmitting ? <InlineSpinner /> : null}
//                 <Text style={styles.btnPrimaryText}>
//                   {coinz < CREATE_ACCOUNT_COST
//                     ? "Insufficient Coinz"
//                     : createSubmitting
//                       ? "Creating..."
//                       : "Create"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.btn, styles.btnSecondary, buyDisabled ? styles.btnDisabled : null]}
//               onPress={() => Alert.alert("Create Account", "After success you can copy username and password.")}
//               disabled={buyDisabled}
//             >
//               <Text style={styles.btnSecondaryText}>Details</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   }, [
//     active,
//     buyingCoinz,
//     canChangeTabs,
//     coinz,
//     createSubmitting,
//     itemsLoading,
//     myLoading,
//     openCreateAccount,
//     tab,
//     tabLoading,
//     buyDisabled
//   ]);

//   const renderStoreItem = useCallback(
//     ({ item }: any) => {
//       const ownedSet = ownedKeysByType[String(item.type)] || new Set<string>();
//       const isOwned = ownedSet.has(String(item.key));

//       const isActiveNow =
//         (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
//         (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
//         (item.type === "profileEntryAnimation" &&
//           String(active.profileEntryAnimation || "") === String(item.key)) ||
//         (item.type === "badge" && (active.badges || []).includes(String(item.key))) ||
//         (item.type === "verification" &&
//           String(active.verificationType || "none") ===
//             String(item.meta?.verificationType || item.key));

//       const canActivate =
//         isOwned &&
//         (item.type === "avatarFrame" ||
//           item.type === "messageEffect" ||
//           item.type === "profileEntryAnimation" ||
//           item.type === "badge" ||
//           item.type === "verification");

//       const days = Number(item.durationDays || 0);
//       const durationLabel = days > 0 ? `${days} day(s)` : "Permanent";

//       const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
//       const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;

//       const imageUrl = getItemImageUrl(item);

//       // per-item loading keys
//       const activateThisKey = `${String(item.type)}:${String(
//         item.type === "verification"
//           ? String(item.meta?.verificationType || item.key)
//           : String(item.key)
//       )}:set`;

//       const isActivateLoading = activateKeyLoading === activateThisKey;

//       return (
//         <View style={styles.card}>
//           <View style={styles.cardTop}>
//             {imageUrl ? (
//               <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
//             ) : (
//               <View style={styles.itemImagePlaceholder}>
//                 <Text style={styles.itemImagePlaceholderText}>IMG</Text>
//               </View>
//             )}

//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardName} numberOfLines={1}>
//                 {item.name || item.key}
//               </Text>
//               <Text style={styles.cardMeta} numberOfLines={1}>
//                 {prettyType(item.type)} • {item.key}
//               </Text>

//               <View style={{ marginTop: 6 }}>
//                 <Text style={styles.cardSmall} numberOfLines={1}>
//                   Duration: <Text style={styles.cardSmallEm}>{durationLabel}</Text>
//                 </Text>

//                 {isOwned && inv?.expiresAt ? (
//                   <Text style={styles.cardSmall} numberOfLines={1}>
//                     Expires: <Text style={styles.cardSmallEm}>{formatDate(inv.expiresAt)}</Text>
//                   </Text>
//                 ) : null}
//               </View>

//               {!!item.description && (
//                 <Text style={styles.cardDesc} numberOfLines={2}>
//                   {item.description}
//                 </Text>
//               )}
//             </View>

//             <View style={styles.priceBox}>
//               <Text style={styles.priceLabel}>Price</Text>
//               <Text style={styles.priceValue}>{formatCoinz(Number(item.priceCoinz || 0))}</Text>
//             </View>
//           </View>

//           <View style={styles.badgeRow}>
//             {isOwned ? <Chip text="Owned" tone="good" /> : <Chip text="New" tone="info" />}
//             {item.isConsumable ? <Chip text="Consumable" tone="neutral" /> : null}
//             {item.isStackable ? <Chip text="Stackable" tone="neutral" /> : null}
//             {days > 0 ? <Chip text="Timed" tone="neutral" /> : <Chip text="Permanent" tone="neutral" />}
//             {expired ? <Chip text="Expired" tone="danger" /> : null}
//             {isActiveNow ? <Chip text="Active" tone="gold" /> : null}
//             {String(item.meta?.category || "").toLowerCase() === "bundle" ? (
//               <Chip text="Bundle" tone="info" />
//             ) : null}
//             {Boolean(item.meta?.isLimited) ? <Chip text="Limited" tone="warning" /> : null}
//           </View>

//           <View style={styles.cardActions}>
//             <TouchableOpacity
//               style={[styles.btn, styles.btnPrimary, buyDisabled ? styles.btnDisabled : null]}
//               onPress={() => openBuy(item._id)}
//               disabled={buyDisabled}
//             >
//               <View style={styles.btnRow}>
//                 {buyDisabled && purchasing ? <InlineSpinner /> : null}
//                 <Text style={styles.btnPrimaryText}>{purchasing ? "Buying..." : "Buy"}</Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.btn,
//                 styles.btnSecondary,
//                 !canActivate || buyDisabled || expired || isActivateLoading ? styles.btnDisabled : null
//               ]}
//               onPress={() => {
//                 if (item.type === "verification") {
//                   const vt = String(item.meta?.verificationType || "").trim();
//                   if (!vt) {
//                     Alert.alert("Invalid item", "verificationType is missing in item.meta");
//                     return;
//                   }
//                   doActivate("verification", vt, "set");
//                   return;
//                 }

//                 if (item.type === "badge") {
//                   const has = (active.badges || []).includes(String(item.key));
//                   const mode = has ? "remove" : "add";
//                   const k = `${String("badge")}:${String(item.key)}:${String(mode)}`;
//                   // لو شغال على badge بتبديل add/remove، نخلي التحميل يعتمد على key/ mode
//                   if (!activateKeyLoading) setActivateKeyLoading(k);
//                   doActivate("badge", String(item.key), mode);
//                 } else {
//                   doActivate(item.type, String(item.key), "set");
//                 }
//               }}
//               disabled={!canActivate || buyDisabled || expired || isActivateLoading}
//             >
//               <View style={styles.btnRow}>
//                 {isActivateLoading ? <InlineSpinner /> : null}
//                 <Text style={styles.btnSecondaryText}>
//                   {expired ? "Expired" : isActivateLoading ? "Activating..." : "Activate"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [
//       active,
//       activateKeyLoading,
//       buyDisabled,
//       doActivate,
//       openBuy,
//       ownedByTypeKey,
//       ownedKeysByType,
//       purchasing
//     ]
//   );

//   const renderCoinzPack = useCallback(
//     ({ item }: any) => {
//       const query = q.trim().toLowerCase();
//       const hay = `${item.title} ${item.priceEGP} ${item.coinz} ${item.subtitle || ""}`.toLowerCase();
//       if (query && !hay.includes(query)) return null;

//       const thisLoading = paymobLoadingPackId === String(item.packageId);

//       return (
//         <View style={styles.card}>
//           <View style={styles.cardTop}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardName} numberOfLines={1}>
//                 {item.title}
//               </Text>
//               {!!item.subtitle && (
//                 <Text style={styles.cardDesc} numberOfLines={2}>
//                   {item.subtitle}
//                 </Text>
//               )}
//               <Text style={[styles.cardMeta, { marginTop: 6 }]}>Price: {item.priceEGP} EGP</Text>
//             </View>

//             <View style={styles.priceBox}>
//               <Text style={styles.priceLabel}>You get</Text>
//               <Text style={styles.priceValue}>{formatCoinz(item.coinz)}</Text>
//             </View>
//           </View>

//           <View style={styles.badgeRow}>
//             <Chip text="Coinz" tone="info" />
//             <Chip text="Paymob" tone="good" />
//           </View>

//           <View style={styles.cardActions}>
//             <TouchableOpacity
//               style={[styles.btn, styles.btnPrimary, (thisLoading || buyDisabled) ? styles.btnDisabled : null]}
//               onPress={() => startPaymobCoinz(item.packageId)}
//               disabled={thisLoading || buyDisabled}
//             >
//               <View style={styles.btnRow}>
//                 {thisLoading ? <InlineSpinner /> : null}
//                 <Text style={styles.btnPrimaryText}>{thisLoading ? "Redirecting..." : "Buy Now"}</Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.btn, styles.btnSecondary, buyDisabled ? styles.btnDisabled : null]}
//               onPress={() =>
//                 Alert.alert("Info", "You will be redirected to Paymob checkout to complete payment.")
//               }
//               disabled={buyDisabled}
//             >
//               <Text style={styles.btnSecondaryText}>Details</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [buyDisabled, paymobLoadingPackId, q, startPaymobCoinz]
//   );

//   const renderOwned = useCallback(() => {
//     return (
//       <View style={styles.ownedWrap}>
//         <View style={styles.sectionTitleRow}>
//           <Text style={styles.sectionTitle}>Your Inventory</Text>
//           {(myLoading || activating || tabLoading) && <ActivityIndicator />}
//         </View>

//         {!my?.inventory?.length ? (
//           <Text style={styles.emptyText}>No items yet. Buy something from the store.</Text>
//         ) : (
//           groupedOwned.map((g) => (
//             <View key={g.type} style={styles.ownedSection}>
//               <Text style={styles.ownedTitle}>{prettyType(g.type)}</Text>

//               {g.rows.map((row: any) => {
//                 const key = String(row.itemKey);
//                 const qty = Number(row.quantity || 0);
//                 const item = row.item;
//                 const expired = row?.expiresAt ? isExpired(row.expiresAt) : false;
//                 const imageUrl = getItemImageUrl(item);

//                 const isActiveNow =
//                   (g.type === "avatarFrame" && String(active.avatarFrame || "") === key) ||
//                   (g.type === "messageEffect" && String(active.messageEffect || "") === key) ||
//                   (g.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === key) ||
//                   (g.type === "badge" && (active.badges || []).includes(key));

//                 const loadingUseKey = `${String(g.type)}:${String(key)}:set`;
//                 const isUseLoading = activateKeyLoading === loadingUseKey;

//                 return (
//                   <View key={row._id} style={styles.ownedRow}>
//                     {imageUrl ? (
//                       <Image source={{ uri: imageUrl }} style={styles.ownedImage} resizeMode="cover" />
//                     ) : (
//                       <View style={styles.ownedImagePlaceholder}>
//                         <Text style={styles.itemImagePlaceholderText}>IMG</Text>
//                       </View>
//                     )}

//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.ownedName} numberOfLines={1}>
//                         {item?.name || key}
//                       </Text>
//                       <Text style={styles.ownedMeta} numberOfLines={2}>
//                         {key}
//                         {qty > 1 ? ` • qty: ${qty}` : ""}
//                         {row?.expiresAt ? ` • expires: ${formatDate(row.expiresAt)}` : " • permanent"}
//                       </Text>
//                     </View>

//                     <View style={styles.ownedRight}>
//                       {expired ? <Chip text="Expired" tone="danger" /> : null}
//                       {isActiveNow ? <Chip text="Active" tone="gold" /> : null}

//                       {(g.type === "avatarFrame" ||
//                         g.type === "messageEffect" ||
//                         g.type === "profileEntryAnimation") && (
//                         <TouchableOpacity
//                           style={[
//                             styles.miniBtn,
//                             (activating || expired || buyDisabled || isUseLoading) ? styles.btnDisabled : null
//                           ]}
//                           onPress={() => doActivate(g.type, key, "set")}
//                           disabled={activating || expired || buyDisabled || isUseLoading}
//                         >
//                           <View style={styles.btnRow}>
//                             {isUseLoading ? <InlineSpinner size={14} /> : null}
//                             <Text style={styles.miniBtnText}>
//                               {expired ? "Expired" : isUseLoading ? "Applying..." : "Use"}
//                             </Text>
//                           </View>
//                         </TouchableOpacity>
//                       )}

//                       {g.type === "badge" && (
//                         <TouchableOpacity
//                           style={[
//                             styles.miniBtn,
//                             (activating || expired || buyDisabled) ? styles.btnDisabled : null
//                           ]}
//                           onPress={() =>
//                             doActivate(
//                               "badge",
//                               key,
//                               (active.badges || []).includes(key) ? "remove" : "add"
//                             )
//                           }
//                           disabled={activating || expired || buyDisabled}
//                         >
//                           <Text style={styles.miniBtnText}>
//                             {expired
//                               ? "Expired"
//                               : (active.badges || []).includes(key)
//                                 ? "Remove"
//                                 : "Add"}
//                           </Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           ))
//         )}
//       </View>
//     );
//   }, [activating, active, activateKeyLoading, buyDisabled, doActivate, groupedOwned, my?.inventory?.length, myLoading, tabLoading]);

//   /* =========================================================
//      LIST DATA
//   ========================================================= */

//   const data = tab === "coinz" ? COINZ_PACKS : filtered;

//   return (
//     <SafeAreaView style={styles.safe}>
//       <FlatList
//         data={data as any}
//         keyExtractor={(x: any) => (tab === "coinz" ? String(x.packageId) : String(x._id))}
//         renderItem={tab === "coinz" ? renderCoinzPack : renderStoreItem}
//         numColumns={1}
//         ListHeaderComponent={renderHeader}
//         ListFooterComponent={renderOwned}
//         contentContainerStyle={styles.listContent}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         ListEmptyComponent={
//           itemsLoading || tabLoading ? (
//             <View style={styles.center}>
//               <ActivityIndicator />
//               <Text style={styles.emptyText}>Loading...</Text>
//             </View>
//           ) : (
//             <View style={styles.center}>
//               <Text style={styles.emptyText}>
//                 {tab === "coinz" ? "No coinz packs match your search." : "No items match your search."}
//               </Text>
//             </View>
//           )
//         }
//       />

//       {/* ✅ Overlay Loading عام */}
//       {globalBusy && (
//         <View pointerEvents="auto" style={styles.loadingOverlay}>
//           <View style={styles.loadingCard}>
//             <ActivityIndicator />
//             <Text style={styles.loadingText}>Please wait...</Text>
//           </View>
//         </View>
//       )}

//       {/* =========================
//           Purchase Item Modal
//       ========================= */}
//       <Modal transparent visible={buyOpen} animationType="fade" onRequestClose={() => setBuyOpen(false)}>
//         <Pressable style={styles.modalOverlay} onPress={() => (buySubmitting ? null : setBuyOpen(false))}>
//           <Pressable style={styles.modalCard} onPress={() => {}}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Purchase</Text>
//               <TouchableOpacity disabled={buySubmitting} onPress={() => setBuyOpen(false)}>
//                 <Text style={[styles.modalClose, buySubmitting ? { opacity: 0.6 } : null]}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             {!selectedItem ? (
//               <View style={styles.center}>
//                 <ActivityIndicator />
//               </View>
//             ) : (
//               <>
//                 <View style={styles.modalInfo}>
//                   <Text style={styles.modalName}>{selectedItem.name || selectedItem.key}</Text>
//                   <Text style={styles.modalMeta}>
//                     {prettyType(selectedItem.type)} • {selectedItem.key}
//                   </Text>

//                   <Text style={styles.modalMeta}>
//                     Duration:{" "}
//                     <Text style={{ color: "#E2E8F0", fontWeight: "900" }}>
//                       {Number(selectedItem.durationDays || 0) > 0
//                         ? `${Number(selectedItem.durationDays || 0)} day(s)`
//                         : "Permanent"}
//                     </Text>
//                   </Text>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalLabel}>Price</Text>
//                   <Text style={styles.modalValue}>
//                     {formatCoinz(Number(selectedItem.priceCoinz || 0))} Coinz
//                   </Text>
//                 </View>

//                 {(selectedItem.isStackable || selectedItem.isConsumable) && (
//                   <View style={styles.modalRow}>
//                     <Text style={styles.modalLabel}>Quantity</Text>
//                     <View style={styles.qtyRow}>
//                       <TouchableOpacity
//                         style={[styles.qtyBtn, (buySubmitting || purchasing) ? styles.btnDisabled : null]}
//                         disabled={buySubmitting || purchasing}
//                         onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) - 1))}
//                       >
//                         <Text style={styles.qtyBtnText}>−</Text>
//                       </TouchableOpacity>

//                       <TextInput
//                         editable={!buySubmitting}
//                         value={String(buyQty)}
//                         onChangeText={(t) =>
//                           setBuyQty(Math.max(1, Number(t.replace(/[^\d]/g, "") || "1")))
//                         }
//                         keyboardType="number-pad"
//                         style={[styles.qtyInput, buySubmitting ? { opacity: 0.7 } : null]}
//                       />

//                       <TouchableOpacity
//                         style={[styles.qtyBtn, (buySubmitting || purchasing) ? styles.btnDisabled : null]}
//                         disabled={buySubmitting || purchasing}
//                         onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) + 1))}
//                       >
//                         <Text style={styles.qtyBtnText}>+</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 )}

//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalLabel}>Auto-activate</Text>
//                   <TouchableOpacity
//                     disabled={buySubmitting}
//                     onPress={() => setBuySetActive((v) => !v)}
//                     style={[
//                       styles.toggle,
//                       buySetActive ? styles.toggleOn : styles.toggleOff,
//                       buySubmitting ? { opacity: 0.7 } : null
//                     ]}
//                   >
//                     <View style={[styles.toggleKnob, buySetActive ? styles.knobOn : styles.knobOff]} />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalLabel}>Total</Text>
//                   <Text style={styles.modalTotal}>
//                     {formatCoinz(Number(selectedItem.priceCoinz || 0) * Math.max(1, Number(buyQty || 1)))}{" "}
//                     Coinz
//                   </Text>
//                 </View>

//                 <View style={styles.modalActions}>
//                   <TouchableOpacity
//                     style={[styles.btn, styles.btnSecondary, buySubmitting ? styles.btnDisabled : null]}
//                     onPress={() => setBuyOpen(false)}
//                     disabled={buySubmitting}
//                   >
//                     <Text style={styles.btnSecondaryText}>Cancel</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.btn, styles.btnPrimary, (buySubmitting || purchasing) ? styles.btnDisabled : null]}
//                     onPress={doBuy}
//                     disabled={buySubmitting || purchasing}
//                   >
//                     <View style={styles.btnRow}>
//                       {buySubmitting || purchasing ? <InlineSpinner /> : null}
//                       <Text style={styles.btnPrimaryText}>
//                         {buySubmitting || purchasing ? "Buying..." : "Confirm"}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.modalHint}>Your balance: {formatCoinz(coinz)} Coinz</Text>
//               </>
//             )}
//           </Pressable>
//         </Pressable>
//       </Modal>

//       {/* =========================
//           Create Account Modal
//       ========================= */}
//       <Modal transparent visible={createOpen} animationType="fade" onRequestClose={() => setCreateOpen(false)}>
//         <Pressable style={styles.modalOverlay} onPress={() => (createSubmitting ? null : setCreateOpen(false))}>
//           <Pressable style={styles.modalCard} onPress={() => {}}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Create Account</Text>
//               <TouchableOpacity disabled={createSubmitting} onPress={() => setCreateOpen(false)}>
//                 <Text style={[styles.modalClose, createSubmitting ? { opacity: 0.6 } : null]}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalInfo}>
//               <Text style={styles.modalMeta}>
//                 Cost:{" "}
//                 <Text style={{ color: "#E2E8F0", fontWeight: "900" }}>
//                   {formatCoinz(CREATE_ACCOUNT_COST)} Coinz
//                 </Text>
//               </Text>
//             </View>

//             <View style={styles.modalRow}>
//               <Text style={styles.modalLabel}>Username</Text>
//             </View>
//             <TextInput
//               editable={!createSubmitting}
//               value={newUsername}
//               onChangeText={setNewUsername}
//               placeholder="username"
//               placeholderTextColor="#94A3B8"
//               style={[styles.qtyInput, { width: "100%", textAlign: "left", paddingHorizontal: 12 }]}
//               autoCapitalize="none"
//             />

//             <View style={[styles.modalRow, { marginTop: 12 }]}>
//               <Text style={styles.modalLabel}>Password</Text>
//             </View>
//             <TextInput
//               editable={!createSubmitting}
//               value={newPassword}
//               onChangeText={setNewPassword}
//               placeholder="password"
//               placeholderTextColor="#94A3B8"
//               style={[styles.qtyInput, { width: "100%", textAlign: "left", paddingHorizontal: 12 }]}
//               secureTextEntry
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.btn, styles.btnSecondary, createSubmitting ? styles.btnDisabled : null]}
//                 onPress={() => setCreateOpen(false)}
//                 disabled={createSubmitting}
//               >
//                 <Text style={styles.btnSecondaryText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.btn, styles.btnPrimary, createSubmitting ? styles.btnDisabled : null]}
//                 onPress={doCreateAccount}
//                 disabled={createSubmitting}
//               >
//                 <View style={styles.btnRow}>
//                   {createSubmitting ? <InlineSpinner /> : null}
//                   <Text style={styles.btnPrimaryText}>{createSubmitting ? "Creating..." : "Confirm"}</Text>
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.modalHint}>Your balance: {formatCoinz(coinz)} Coinz</Text>
//           </Pressable>
//         </Pressable>
//       </Modal>

//       {/* =========================
//           Created Account Modal
//       ========================= */}
//       <Modal transparent visible={createdOpen} animationType="fade" onRequestClose={() => setCreatedOpen(false)}>
//         <Pressable style={styles.modalOverlay} onPress={() => (copyLoading ? null : setCreatedOpen(false))}>
//           <Pressable style={styles.modalCard} onPress={() => {}}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Account Created</Text>
//               <TouchableOpacity disabled={copyLoading} onPress={() => setCreatedOpen(false)}>
//                 <Text style={[styles.modalClose, copyLoading ? { opacity: 0.6 } : null]}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalInfo}>
//               <Text style={styles.modalMeta}>Username</Text>
//               <Text style={styles.modalValue}>{createdCreds?.username || "-"}</Text>

//               <Text style={[styles.modalMeta, { marginTop: 10 }]}>Password</Text>
//               <Text style={styles.modalValue}>{createdCreds?.password || "-"}</Text>
//             </View>

//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={[styles.btn, styles.btnSecondary, copyLoading ? styles.btnDisabled : null]}
//                 onPress={() => setCreatedOpen(false)}
//                 disabled={copyLoading}
//               >
//                 <Text style={styles.btnSecondaryText}>Close</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.btn, styles.btnPrimary, copyLoading ? styles.btnDisabled : null]}
//                 onPress={copyCreatedCreds}
//                 disabled={copyLoading}
//               >
//                 <View style={styles.btnRow}>
//                   {copyLoading ? <InlineSpinner /> : null}
//                   <Text style={styles.btnPrimaryText}>{copyLoading ? "Copying..." : "Copy"}</Text>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           </Pressable>
//         </Pressable>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// /* =========================================================
//    STYLES
// ========================================================= */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0B1220" },

//   listContent: { padding: 12, paddingBottom: 24 },
//   headerWrap: { gap: 10, paddingBottom: 10 },

//   balanceCard: {
//     borderRadius: 18,
//     padding: 14,
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     gap: 10
//   },

//   balanceTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10
//   },

//   balanceTitle: { color: "#94A3B8", fontSize: 12, marginBottom: 4 },
//   balanceValue: { color: "#E2E8F0", fontSize: 22, fontWeight: "800" },

//   buyCoinzBtn: {
//     backgroundColor: "#2563EB",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 14
//   },
//   buyCoinzBtnText: { color: "#FFFFFF", fontWeight: "900" },

//   activeBox: {
//     marginTop: 6,
//     borderRadius: 14,
//     padding: 10,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   activeTitle: { color: "#94A3B8", fontSize: 12, marginBottom: 8, fontWeight: "700" },
//   activeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },

//   tag: {
//     backgroundColor: "#0F1B33",
//     borderWidth: 1,
//     borderColor: "#243253",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999
//   },
//   tagText: { color: "#CBD5E1", fontSize: 12, maxWidth: 220 },

//   tabsRow: { gap: 8, paddingVertical: 4 },
//   tabPill: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   tabPillActive: { backgroundColor: "#111D3A", borderColor: "#3B82F6" },
//   tabText: { color: "#CBD5E1", fontWeight: "700", fontSize: 12 },
//   tabTextActive: { color: "#E2E8F0" },

//   sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   sectionTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },

//   noteCard: {
//     borderRadius: 14,
//     padding: 10,
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   noteText: { color: "#94A3B8", fontSize: 12, lineHeight: 16 },

//   card: {
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     borderRadius: 18,
//     padding: 14,
//     marginTop: 10
//   },

//   cardTop: { flexDirection: "row", gap: 12 },
//   cardName: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
//   cardMeta: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
//   cardDesc: { color: "#CBD5E1", fontSize: 12, marginTop: 8, lineHeight: 16 },

//   cardSmall: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
//   cardSmallEm: { color: "#E2E8F0", fontWeight: "900" },

//   itemImage: {
//     width: 62,
//     height: 62,
//     borderRadius: 14,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   itemImagePlaceholder: {
//     width: 62,
//     height: 62,
//     borderRadius: 14,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     alignItems: "center",
//     justifyContent: "center"
//   },
//   itemImagePlaceholderText: { color: "#94A3B8", fontWeight: "900", fontSize: 12 },

//   priceBox: { minWidth: 96, alignItems: "flex-end", paddingLeft: 8 },
//   priceLabel: { color: "#94A3B8", fontSize: 11 },
//   priceValue: { color: "#FBBF24", fontSize: 16, fontWeight: "900", marginTop: 2 },

//   badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
//   chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
//   chipText: { color: "#E2E8F0", fontSize: 11, fontWeight: "800" },

//   cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },

//   btn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center"
//   },

//   btnPrimary: { backgroundColor: "#2563EB" },
//   btnPrimaryText: { color: "#FFFFFF", fontWeight: "900" },

//   btnSecondary: { backgroundColor: "#0B1326", borderWidth: 1, borderColor: "#1F2A44" },
//   btnSecondaryText: { color: "#E2E8F0", fontWeight: "900" },

//   btnDisabled: { opacity: 0.55 },

//   btnRow: { flexDirection: "row", alignItems: "center", gap: 8 },

//   ownedWrap: { marginTop: 18, gap: 10 },
//   ownedSection: {
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     borderRadius: 18,
//     padding: 12
//   },
//   ownedTitle: { color: "#E2E8F0", fontSize: 14, fontWeight: "900", marginBottom: 8 },
//   ownedRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#1A2440"
//   },
//   ownedName: { color: "#E2E8F0", fontWeight: "900" },
//   ownedMeta: { color: "#94A3B8", fontSize: 12, marginTop: 3 },
//   ownedRight: { flexDirection: "row", alignItems: "center", gap: 10 },

//   ownedImage: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   ownedImagePlaceholder: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     alignItems: "center",
//     justifyContent: "center"
//   },

//   miniBtn: {
//     backgroundColor: "#111D3A",
//     borderWidth: 1,
//     borderColor: "#243253",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     borderRadius: 12
//   },
//   miniBtnText: { color: "#E2E8F0", fontWeight: "900", fontSize: 12 },

//   center: { paddingVertical: 24, alignItems: "center", gap: 10 },
//   emptyText: { color: "#94A3B8", textAlign: "center" },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     padding: 14
//   },
//   modalCard: {
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     borderRadius: 18,
//     padding: 14
//   },
//   modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   modalTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
//   modalClose: { color: "#94A3B8", fontSize: 18, padding: 6 },

//   modalInfo: { marginTop: 10 },
//   modalName: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
//   modalMeta: { color: "#94A3B8", fontSize: 12, marginTop: 4 },

//   modalRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   modalLabel: { color: "#94A3B8", fontWeight: "800" },
//   modalValue: { color: "#E2E8F0", fontWeight: "900" },
//   modalTotal: { color: "#FBBF24", fontWeight: "900" },

//   qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   qtyBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44"
//   },
//   qtyBtnText: { color: "#E2E8F0", fontSize: 18, fontWeight: "900" },
//   qtyInput: {
//     width: 70,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: "#0B1326",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     color: "#E2E8F0",
//     textAlign: "center",
//     fontWeight: "900"
//   },

//   toggle: { width: 54, height: 30, borderRadius: 999, padding: 3, justifyContent: "center" },
//   toggleOn: { backgroundColor: "#2563EB" },
//   toggleOff: { backgroundColor: "#334155" },
//   toggleKnob: { width: 24, height: 24, borderRadius: 999, backgroundColor: "#E2E8F0" },
//   knobOn: { alignSelf: "flex-end" },
//   knobOff: { alignSelf: "flex-start" },

//   modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
//   modalHint: { color: "#94A3B8", fontSize: 12, marginTop: 10 },

//   // Overlay Loading
//   loadingOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16
//   },
//   loadingCard: {
//     backgroundColor: "#0F172A",
//     borderWidth: 1,
//     borderColor: "#1F2A44",
//     borderRadius: 16,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     alignItems: "center",
//     gap: 10,
//     minWidth: 180
//   },
//   loadingText: { color: "#E2E8F0", fontWeight: "900" }
// });


// app/(tabs)/store.tsx
// ✅ تصميم جديد بالكامل (حديث/راقي) + دعم Light/Dark عبر:
// const colorScheme = useColorScheme();
// const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
//
// ✅ مميزات التصميم:
// - Header عصري ببطاقة رصيد + CTA واضح لشراء Coinz
// - تبويبات “Pills” أنيقة
// - Cards حديثة مع ظلال ناعمة + حدود subtle
// - أزرار Primary/Secondary موحدة + Loading داخل الأزرار
// - Overlay Loading عام اختياري (موجود)
// - الاعتماد على theme بالكامل (بدون ألوان صلبة تقريباً)
//
// ملاحظة: يفترض وجود Colors/Fonts في: "@/constants/Colors"

import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTheme, Colors, Fonts } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import api from "@/services/api";

import {
  activateStoreItem,
  clearStoreError,
  getMyInventory,
  listStoreItems,
  purchaseStoreItems,
  selectMyStore,
  selectMyStoreLoading,
  selectStoreActivating,
  selectStoreBuyingCoinz,
  selectStoreError,
  selectStoreItems,
  selectStoreItemsLoading,
  selectStorePurchasing
} from "@/redux/slices/storeControl.slice";

import { debitMyCoinz, registerNoLogin } from "@/redux/slices/userSlice";

/* =========================================================
   TYPES & CONSTANTS
========================================================= */

type UiTab =
  | "all"
  | "coinz"
  | "avatarFrame"
  | "badge"
  | "messageEffect"
  | "profileEntryAnimation"
  | "verification"
  | "gift"
  | "bundles"
  | "limited";

const TYPE_TABS: { key: UiTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coinz", label: "Coinz" },
  { key: "avatarFrame", label: "Frames" },
  { key: "badge", label: "Badges" },
  { key: "messageEffect", label: "Effects" },
  { key: "profileEntryAnimation", label: "Entry" },
  { key: "gift", label: "Gifts" },
  { key: "bundles", label: "Bundles" },
  { key: "limited", label: "Limited" }
];

// ✅ Paymob coinz packs
const COINZ_PACKS: {
  packageId: "p1" | "p2" | "p3";
  title: string;
  subtitle?: string;
  priceEGP: number;
  coinz: number;
}[] = [
  { packageId: "p1", title: "Starter", subtitle: "100 Coinz", priceEGP: 10, coinz: 100 },
  { packageId: "p2", title: "Popular", subtitle: "260 Coinz", priceEGP: 25, coinz: 260 },
  { packageId: "p3", title: "Pro", subtitle: "550 Coinz", priceEGP: 50, coinz: 550 }
];

const CREATE_ACCOUNT_COST = 30000;

/* =========================================================
   HELPERS
========================================================= */

function prettyType(t: string) {
  switch (t) {
    case "avatarFrame":
      return "Avatar Frame";
    case "badge":
      return "Badge";
    case "messageEffect":
      return "Message Effect";
    case "gift":
      return "Gift";
    case "profileEntryAnimation":
      return "Profile Entry";
    case "verification":
      return "Verification";
    default:
      return t || "Item";
  }
}

function formatCoinz(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.round(x).toLocaleString();
}

function isExpired(expiresAt: string) {
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return false;
  return t <= Date.now();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

function getItemImageUrl(item: any): string {
  const direct =
    String(item?.iconUrl || "") ||
    String(item?.coverUrl || "") ||
    String(item?.previewUrl || "");
  if (direct) return direct;

  const meta = item?.meta || {};
  return (
    String(meta?.iconUrl || "") ||
    String(meta?.coverUrl || "") ||
    String(meta?.previewUrl || "")
  );
}

function pillTone(theme: AppTheme, tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning") {
  if (tone === "good") return { bg: `${theme.success}22`, fg: theme.success };
  if (tone === "info") return { bg: `${theme.info}22`, fg: theme.info };
  if (tone === "danger") return { bg: `${theme.danger}22`, fg: theme.danger };
  if (tone === "warning") return { bg: `${theme.warning}22`, fg: theme.warning };
  if (tone === "gold") return { bg: theme.pillGoldBg, fg: theme.pillGoldFg };
  return { bg: theme.disabledBg, fg: theme.mutedText };
}

/* =========================================================
   SMALL UI
========================================================= */

function Spacer({ h = 10 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

function Hairline({ theme }: { theme: AppTheme }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.separator }} />;
}

function Pill({
  theme,
  text,
  tone
}: {
  theme: AppTheme;
  text: string;
  tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning";
}) {
  const c = pillTone(theme, tone);
  return (
    <View style={[ui.pill, { backgroundColor: c.bg, borderColor: theme.border }]}>
      <Text style={[ui.pillText, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

function PrimaryButton({
  theme,
  title,
  onPress,
  disabled,
  loading
}: {
  theme: AppTheme;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDis = !!disabled || !!loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDis}
      style={[
        ui.btn,
        {
          backgroundColor: theme.primary,
          borderColor: "transparent",
          opacity: isDis ? 0.62 : 1
        }
      ]}
    >
      <View style={ui.btnRow}>
        {loading ? <ActivityIndicator size="small" color={theme.primaryText} /> : null}
        <Text style={[ui.btnText, { color: theme.primaryText }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  theme,
  title,
  onPress,
  disabled,
  loading
}: {
  theme: AppTheme;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDis = !!disabled || !!loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDis}
      style={[
        ui.btn,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.border,
          opacity: isDis ? 0.62 : 1
        }
      ]}
    >
      <View style={ui.btnRow}>
        {loading ? <ActivityIndicator size="small" color={theme.text} /> : null}
        <Text style={[ui.btnText, { color: theme.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SoftInput({
  theme,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  editable = true
}: {
  theme: AppTheme;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  editable?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.subtleText}
      secureTextEntry={secureTextEntry}
      editable={editable}
      autoCapitalize="none"
      style={[
        ui.input,
        {
          color: theme.text,
          backgroundColor: theme.surface2,
          borderColor: theme.border,
          opacity: editable ? 1 : 0.7
        }
      ]}
    />
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function StoreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const s = useMemo(() => createStyles(theme), [theme]);

  const dispatch = useAppDispatch();
  const router = useRouter();

  // Store items + inventory
  const items = useAppSelector(selectStoreItems);
  const itemsLoading = useAppSelector(selectStoreItemsLoading);

  const my = useAppSelector(selectMyStore);
  const myLoading = useAppSelector(selectMyStoreLoading);

  const purchasing = useAppSelector(selectStorePurchasing);
  const activating = useAppSelector(selectStoreActivating);
  const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
  const error = useAppSelector(selectStoreError);

  // UI state
  const [tab, setTab] = useState<UiTab>("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Loading local
  const [tabLoading, setTabLoading] = useState(false);
  const [paymobLoadingPackId, setPaymobLoadingPackId] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [activateKeyLoading, setActivateKeyLoading] = useState<string | null>(null);
  const [buySubmitting, setBuySubmitting] = useState(false);

  // Purchase item modal
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItemId, setBuyItemId] = useState<string>("");
  const [buyQty, setBuyQty] = useState<number>(1);
  const [buySetActive, setBuySetActive] = useState(true);

  // Create account modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Created account modal
  const [createdOpen, setCreatedOpen] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(
    null
  );

  const coinz = my?.coinzBalance ?? 0;

  const active = my?.activeCustomization || {
    avatarFrame: "",
    messageEffect: "",
    profileEntryAnimation: "",
    badges: [],
    verificationType: "none"
  };

  const selectedItem = useMemo(() => {
    return items.find((x: any) => String(x._id) === String(buyItemId)) || null;
  }, [items, buyItemId]);

  const ownedByTypeKey = useMemo(() => {
    const inv = my?.inventory || [];
    const map = new Map<string, any>();
    for (const it of inv) {
      const t = String((it as any).itemType || "");
      const k = String((it as any).itemKey || "");
      map.set(`${t}:${k}`, it);
    }
    return map;
  }, [my?.inventory]);

  const ownedKeysByType = useMemo(() => {
    const inv = my?.inventory || [];
    const map: Record<string, Set<string>> = {};
    for (const it of inv) {
      const t = String((it as any).itemType || "");
      const k = String((it as any).itemKey || "");
      if (!map[t]) map[t] = new Set();
      map[t].add(k);
    }
    return map;
  }, [my?.inventory]);

  const groupedOwned = useMemo(() => {
    const inv = my?.inventory || [];
    const byType: Record<string, any[]> = {};
    for (const row of inv) {
      const t = String((row as any).itemType || "");
      if (!byType[t]) byType[t] = [];
      byType[t].push(row);
    }
    const order = ["avatarFrame", "badge", "messageEffect", "profileEntryAnimation", "verification", "gift"];
    return order.filter((k) => byType[k]?.length).map((k) => ({ type: k, rows: byType[k] }));
  }, [my?.inventory]);

  const filtered = useMemo(() => {
    if (tab === "coinz") return [];

    const query = q.trim().toLowerCase();

    return (items || []).filter((it: any) => {
      const type = String(it.type || "");
      const meta = it.meta || {};

      const okTab =
        tab === "all"
          ? true
          : tab === "bundles"
            ? String(meta.category || "").toLowerCase() === "bundle"
            : tab === "limited"
              ? Boolean(meta.isLimited) === true
              : type === tab;

      if (!okTab) return false;

      if (!query) return true;
      const hay = `${it.name || ""} ${it.key || ""} ${it.description || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, tab, q]);

  /* ---------------------------
     LOAD
  --------------------------- */

  const loadAll = useCallback(async () => {
    setTabLoading(true);
    try {
      if (tab === "coinz") {
        await dispatch(getMyInventory() as any);
        return;
      }

      const typeParam =
        tab === "avatarFrame" ||
        tab === "badge" ||
        tab === "messageEffect" ||
        tab === "profileEntryAnimation" ||
        tab === "verification" ||
        tab === "gift"
          ? tab
          : "";

      await Promise.all([
        dispatch(listStoreItems({ type: typeParam as any, active: true }) as any),
        dispatch(getMyInventory() as any)
      ]);
    } finally {
      setTabLoading(false);
    }
  }, [dispatch, tab]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getMyInventory() as any);
    }, [dispatch])
  );

  useEffect(() => {
    if (!error) return;
    Alert.alert("Store", error, [{ text: "OK", onPress: () => dispatch(clearStoreError()) }]);
  }, [error, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  /* ---------------------------
     ACTIONS
  --------------------------- */

  const globalBusy =
    tabLoading ||
    refreshing ||
    itemsLoading ||
    myLoading ||
    purchasing ||
    activating ||
    buyingCoinz ||
    buySubmitting ||
    createSubmitting ||
    !!paymobLoadingPackId ||
    !!activateKeyLoading ||
    copyLoading;

  const openBuy = useCallback((itemId: string) => {
    setBuyItemId(itemId);
    setBuyQty(1);
    setBuySetActive(true);
    setBuyOpen(true);
  }, []);

  const doBuy = useCallback(async () => {
    if (!selectedItem) return;
    if (buySubmitting) return;

    setBuySubmitting(true);
    try {
      const qty = Math.max(1, Number(buyQty || 1));

      const ownedSet = ownedKeysByType[String(selectedItem.type)] || new Set();
      const alreadyOwned = ownedSet.has(String(selectedItem.key));
      const nonRepeatable = !selectedItem.isStackable && !selectedItem.isConsumable;

      if (alreadyOwned && nonRepeatable) {
        Alert.alert("Already owned", "You already own this item.");
        return;
      }

      const res = await dispatch(
        purchaseStoreItems({
          items: [{ itemId: selectedItem._id, quantity: qty }],
          setActive: buySetActive
        }) as any
      );

      if (purchaseStoreItems.fulfilled.match(res)) {
        setBuyOpen(false);
        await dispatch(getMyInventory() as any);
      }
    } finally {
      setBuySubmitting(false);
    }
  }, [selectedItem, buySubmitting, buyQty, ownedKeysByType, buySetActive, dispatch]);

  const doActivate = useCallback(
    async (type: any, key: string, mode?: "set" | "add" | "remove") => {
      const loadingKey = `${String(type)}:${String(key)}:${String(mode || "set")}`;
      if (activateKeyLoading) return;

      const invKey = `${String(type)}:${String(key)}`;
      const inv = ownedByTypeKey.get(invKey);

      if (inv?.expiresAt && isExpired(inv.expiresAt)) {
        Alert.alert("Expired", "This item has expired. Please renew/buy again.");
        return;
      }

      setActivateKeyLoading(loadingKey);
      try {
        await dispatch(activateStoreItem({ type, key, mode } as any) as any);
        await dispatch(getMyInventory() as any);
      } finally {
        setActivateKeyLoading(null);
      }
    },
    [dispatch, ownedByTypeKey, activateKeyLoading]
  );

  const openCreateAccount = useCallback(() => {
    setNewUsername("");
    setNewPassword("");
    setCreateOpen(true);
  }, []);

  const doCreateAccount = useCallback(async () => {
    if (createSubmitting) return;

    const username = newUsername.trim();
    const password = newPassword.trim();

    if (!username) {
      Alert.alert("Create Account", "Username is required");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Create Account", "Password must be at least 6 characters");
      return;
    }
    if (coinz < CREATE_ACCOUNT_COST) {
      Alert.alert("Create Account", "Insufficient Coinz balance");
      return;
    }

    setCreateSubmitting(true);
    try {
      const debitRes = await dispatch(
        debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any
      );

      if (!debitMyCoinz.fulfilled.match(debitRes)) {
        Alert.alert("Create Account", String((debitRes as any).payload || "Failed to debit coinz"));
        return;
      }

      const regRes = await dispatch(registerNoLogin({ username, password }) as any);

      if (!registerNoLogin.fulfilled.match(regRes)) {
        Alert.alert("Create Account", String((regRes as any).payload || "Registration failed"));
        await dispatch(getMyInventory() as any);
        return;
      }

      await dispatch(getMyInventory() as any);

      setCreateOpen(false);
      setCreatedCreds({ username, password });
      setCreatedOpen(true);
    } finally {
      setCreateSubmitting(false);
    }
  }, [createSubmitting, newUsername, newPassword, coinz, dispatch]);

  const copyCreatedCreds = useCallback(async () => {
    if (!createdCreds) return;
    if (copyLoading) return;

    setCopyLoading(true);
    try {
      await Clipboard.setStringAsync(
        `Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`
      );
      Alert.alert("Copied", "Credentials copied to clipboard");
    } finally {
      setCopyLoading(false);
    }
  }, [createdCreds, copyLoading]);

  const startPaymobCoinz = useCallback(
    async (packageId: "p1" | "p2" | "p3") => {
      if (paymobLoadingPackId) return;

      setPaymobLoadingPackId(packageId);
      try {
        const { data } = await api.post("/payments/paymob/create", { packageId });

        const paymentUrl = data?.paymentUrl;
        if (!paymentUrl) {
          Alert.alert("Buy Coinz", "Payment URL not returned.");
          return;
        }

        router.push({
          pathname: "/paymob-checkout",
          params: { url: paymentUrl }
        });
      } catch (e: any) {
        Alert.alert("Buy Coinz", e?.response?.data?.message || "Failed to create payment");
      } finally {
        setPaymobLoadingPackId(null);
      }
    },
    [router, paymobLoadingPackId]
  );

  /* ---------------------------
     RENDER
  --------------------------- */

  const data = tab === "coinz" ? COINZ_PACKS : filtered;

  const buyDisabled =
    globalBusy || buyOpen || createOpen || createdOpen; // منع ضغط متداخل

  const renderHeader = useCallback(() => {
    return (
      <View style={s.headerWrap}>
        {/* HERO CARD */}
        <View style={s.heroCard}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroKicker}>Wallet</Text>
              <Text style={s.heroBalance}>{formatCoinz(coinz)} Coinz</Text>
              <Text style={s.heroSub}>
                Use Coinz to unlock frames, badges, effects and more.
              </Text>
            </View>

            <PrimaryButton
              theme={theme}
              title={tab === "coinz" ? "Coinz" : "Buy Coinz"}
              onPress={() => setTab("coinz")}
              disabled={tabLoading || buyingCoinz}
              loading={tabLoading || buyingCoinz}
            />
          </View>

          <Spacer h={12} />
          <Hairline theme={theme} />
          <Spacer h={12} />

          <View style={s.activeGrid}>
            <View style={s.activeChip}>
              <Text style={s.activeLabel}>Frame</Text>
              <Text style={s.activeValue} numberOfLines={1}>
                {active.avatarFrame || "none"}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={s.activeLabel}>Effect</Text>
              <Text style={s.activeValue} numberOfLines={1}>
                {active.messageEffect || "none"}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={s.activeLabel}>Entry</Text>
              <Text style={s.activeValue} numberOfLines={1}>
                {active.profileEntryAnimation || "none"}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={s.activeLabel}>Badges</Text>
              <Text style={s.activeValue} numberOfLines={1}>
                {(active.badges || []).length}
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH (اختياري) */}
        <View style={s.searchWrap}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={tab === "coinz" ? "Search coinz packs..." : "Search store items..."}
            placeholderTextColor={theme.subtleText}
            style={s.searchInput}
          />
        </View>

        {/* TABS */}
        <FlatList
          data={TYPE_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsRow}
          keyExtractor={(x) => x.key}
          renderItem={({ item }) => {
            const activeTab = item.key === tab;

            return (
              <TouchableOpacity
                onPress={() => setTab(item.key)}
                disabled={buyDisabled}
                style={[
                  s.tabPill,
                  activeTab ? s.tabPillActive : null,
                  buyDisabled ? { opacity: 0.65 } : null
                ]}
              >
                <Text style={[s.tabText, activeTab ? s.tabTextActive : null]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* SECTION TITLE */}
        <View style={s.sectionRow}>
          <View style={{ gap: 2 }}>
            <Text style={s.sectionTitle}>{tab === "coinz" ? "Coinz Packs" : "Store"}</Text>
            <Text style={s.sectionSub}>
              {tab === "coinz" ? "Secure checkout via Paymob." : "Pick something and personalize your profile."}
            </Text>
          </View>

          {(itemsLoading || myLoading || tabLoading) ? <ActivityIndicator /> : null}
        </View>

        {/* NOTE for coinz */}
        {tab === "coinz" ? (
          <View style={s.noteCard}>
            <Text style={s.noteText}>
              You will be redirected to Paymob checkout to complete your payment.
            </Text>
          </View>
        ) : null}

        {/* CREATE ACCOUNT CARD */}
        <View style={s.modernCard}>
          <View style={s.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>Create Account</Text>
              <Text style={s.cardDesc}>
                Create a new account and pay {formatCoinz(CREATE_ACCOUNT_COST)} Coinz from your balance.
              </Text>

              <View style={s.pillsRow}>
                <Pill theme={theme} text="Service" tone="info" />
                <Pill theme={theme} text="One-time" tone="neutral" />
                <Pill theme={theme} text={`${formatCoinz(CREATE_ACCOUNT_COST)} Coinz`} tone="gold" />
              </View>
            </View>

            <View style={s.priceBox}>
              <Text style={s.priceLabel}>Cost</Text>
              <Text style={s.priceValue}>{formatCoinz(CREATE_ACCOUNT_COST)}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={coinz < CREATE_ACCOUNT_COST ? "Insufficient" : "Create"}
              onPress={openCreateAccount}
              disabled={buyDisabled || coinz < CREATE_ACCOUNT_COST}
              loading={createSubmitting}
            />
            <SecondaryButton
              theme={theme}
              title="Details"
              onPress={() => Alert.alert("Create Account", "After success you can copy username and password.")}
              disabled={buyDisabled}
            />
          </View>
        </View>
      </View>
    );
  }, [
    s,
    theme,
    q,
    tab,
    buyDisabled,
    coinz,
    tabLoading,
    buyingCoinz,
    itemsLoading,
    myLoading,
    active,
    createSubmitting,
    openCreateAccount
  ]);

  const renderStoreItem = useCallback(
    ({ item }: any) => {
      const ownedSet = ownedKeysByType[String(item.type)] || new Set<string>();
      const isOwned = ownedSet.has(String(item.key));

      const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
      const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;

      const days = Number(item.durationDays || 0);
      const durationLabel = days > 0 ? `${days} day(s)` : "Permanent";

      const isActiveNow =
        (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
        (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
        (item.type === "profileEntryAnimation" &&
          String(active.profileEntryAnimation || "") === String(item.key)) ||
        (item.type === "badge" && (active.badges || []).includes(String(item.key))) ||
        (item.type === "verification" &&
          String(active.verificationType || "none") ===
            String(item.meta?.verificationType || item.key));

      const canActivate =
        isOwned &&
        (item.type === "avatarFrame" ||
          item.type === "messageEffect" ||
          item.type === "profileEntryAnimation" ||
          item.type === "badge" ||
          item.type === "verification");

      const imageUrl = getItemImageUrl(item);

      // loading key
      const activateKey =
        item.type === "verification"
          ? `verification:${String(item.meta?.verificationType || item.key)}:set`
          : `${String(item.type)}:${String(item.key)}:set`;

      const isActivateLoading = activateKeyLoading === activateKey;

      return (
        <View style={s.modernCard}>
          <View style={s.itemTop}>
            <View style={s.thumbWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={s.thumb} resizeMode="cover" />
              ) : (
                <View style={[s.thumb, { backgroundColor: theme.surface2, alignItems: "center", justifyContent: "center" }]}>
                  <Text style={{ color: theme.subtleText, fontWeight: "900" }}>IMG</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.itemTitle} numberOfLines={1}>
                {item.name || item.key}
              </Text>
              <Text style={s.itemMeta} numberOfLines={1}>
                {prettyType(item.type)} • {item.key}
              </Text>

              <View style={s.pillsRow}>
                <Pill theme={theme} text={days > 0 ? "Timed" : "Permanent"} tone="neutral" />
                {isOwned ? <Pill theme={theme} text="Owned" tone="good" /> : <Pill theme={theme} text="New" tone="info" />}
                {isActiveNow ? <Pill theme={theme} text="Active" tone="gold" /> : null}
                {expired ? <Pill theme={theme} text="Expired" tone="danger" /> : null}
                {String(item.meta?.category || "").toLowerCase() === "bundle" ? <Pill theme={theme} text="Bundle" tone="info" /> : null}
                {Boolean(item.meta?.isLimited) ? <Pill theme={theme} text="Limited" tone="warning" /> : null}
              </View>

              <Text style={s.itemSmall}>
                Duration: <Text style={{ color: theme.text, fontWeight: "800" }}>{durationLabel}</Text>
                {isOwned && inv?.expiresAt ? (
                  <>
                    {"  •  "}
                    Expires: <Text style={{ color: theme.text, fontWeight: "800" }}>{formatDate(inv.expiresAt)}</Text>
                  </>
                ) : null}
              </Text>

              {!!item.description ? (
                <Text style={s.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>

            <View style={s.priceBox}>
              <Text style={s.priceLabel}>Price</Text>
              <Text style={s.priceValue}>{formatCoinz(Number(item.priceCoinz || 0))}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title="Buy"
              onPress={() => openBuy(item._id)}
              disabled={buyDisabled}
              loading={purchasing && buySubmitting}
            />

            <SecondaryButton
              theme={theme}
              title={expired ? "Expired" : isActivateLoading ? "Activating..." : "Activate"}
              onPress={() => {
                if (item.type === "verification") {
                  const vt = String(item.meta?.verificationType || "").trim();
                  if (!vt) {
                    Alert.alert("Invalid item", "verificationType is missing in item.meta");
                    return;
                  }
                  doActivate("verification", vt, "set");
                  return;
                }

                if (item.type === "badge") {
                  const has = (active.badges || []).includes(String(item.key));
                  doActivate("badge", String(item.key), has ? "remove" : "add");
                } else {
                  doActivate(item.type, String(item.key), "set");
                }
              }}
              disabled={!canActivate || buyDisabled || expired || isActivateLoading}
              loading={isActivateLoading}
            />
          </View>
        </View>
      );
    },
    [
      s,
      theme,
      buyDisabled,
      openBuy,
      ownedByTypeKey,
      ownedKeysByType,
      active,
      doActivate,
      activateKeyLoading,
      purchasing,
      buySubmitting
    ]
  );

  const renderCoinzPack = useCallback(
    ({ item }: any) => {
      const query = q.trim().toLowerCase();
      const hay = `${item.title} ${item.priceEGP} ${item.coinz} ${item.subtitle || ""}`.toLowerCase();
      if (query && !hay.includes(query)) return null;

      const loading = paymobLoadingPackId === String(item.packageId);

      return (
        <View style={s.modernCard}>
          <View style={s.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardDesc}>{item.subtitle || ""}</Text>

              <View style={s.pillsRow}>
                <Pill theme={theme} text="Paymob" tone="good" />
                <Pill theme={theme} text={`${item.priceEGP} EGP`} tone="neutral" />
                <Pill theme={theme} text={`${formatCoinz(item.coinz)} Coinz`} tone="gold" />
              </View>
            </View>

            <View style={s.priceBox}>
              <Text style={s.priceLabel}>You get</Text>
              <Text style={s.priceValue}>{formatCoinz(item.coinz)}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={loading ? "Redirecting..." : "Buy Now"}
              onPress={() => startPaymobCoinz(item.packageId)}
              disabled={buyDisabled || loading}
              loading={loading}
            />
            <SecondaryButton
              theme={theme}
              title="Details"
              onPress={() =>
                Alert.alert("Info", "You will be redirected to Paymob checkout to complete payment.")
              }
              disabled={buyDisabled}
            />
          </View>
        </View>
      );
    },
    [s, theme, q, paymobLoadingPackId, startPaymobCoinz, buyDisabled]
  );

  const renderOwned = useCallback(() => {
    return (
      <View style={s.footerWrap}>
        <View style={s.sectionRow}>
          <View style={{ gap: 2 }}>
            <Text style={s.sectionTitle}>Your Inventory</Text>
            <Text style={s.sectionSub}>Manage items you already own.</Text>
          </View>
          {(myLoading || activating) ? <ActivityIndicator /> : null}
        </View>

        {!my?.inventory?.length ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>No items yet</Text>
            <Text style={s.emptySub}>Buy something from the store to see it here.</Text>
          </View>
        ) : (
          groupedOwned.map((g) => (
            <View key={g.type} style={s.groupCard}>
              <View style={s.groupHeader}>
                <Text style={s.groupTitle}>{prettyType(g.type)}</Text>
                <Pill theme={theme} text={`${g.rows.length}`} tone="neutral" />
              </View>

              <Spacer h={8} />
              <Hairline theme={theme} />
              <Spacer h={8} />

              {g.rows.map((row: any) => {
                const key = String(row.itemKey);
                const qty = Number(row.quantity || 0);
                const item = row.item;
                const expired = row?.expiresAt ? isExpired(row.expiresAt) : false;
                const imageUrl = getItemImageUrl(item);

                const isActiveNow =
                  (g.type === "avatarFrame" && String(active.avatarFrame || "") === key) ||
                  (g.type === "messageEffect" && String(active.messageEffect || "") === key) ||
                  (g.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === key) ||
                  (g.type === "badge" && (active.badges || []).includes(key));

                const useKey = `${String(g.type)}:${String(key)}:set`;
                const useLoading = activateKeyLoading === useKey;

                const canQuickUse =
                  !expired &&
                  (g.type === "avatarFrame" || g.type === "messageEffect" || g.type === "profileEntryAnimation");

                return (
                  <View key={row._id} style={s.ownedRow}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={s.ownedThumb} resizeMode="cover" />
                    ) : (
                      <View style={[s.ownedThumb, { backgroundColor: theme.surface2, alignItems: "center", justifyContent: "center" }]}>
                        <Text style={{ color: theme.subtleText, fontWeight: "900" }}>IMG</Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={s.ownedTitle} numberOfLines={1}>
                        {item?.name || key}
                      </Text>
                      <Text style={s.ownedMeta} numberOfLines={2}>
                        {key}
                        {qty > 1 ? ` • qty: ${qty}` : ""}
                        {row?.expiresAt ? ` • expires: ${formatDate(row.expiresAt)}` : " • permanent"}
                      </Text>

                      <View style={s.pillsRow}>
                        {expired ? <Pill theme={theme} text="Expired" tone="danger" /> : null}
                        {isActiveNow ? <Pill theme={theme} text="Active" tone="gold" /> : null}
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end", gap: 8 }}>
                      {canQuickUse ? (
                        <SecondaryButton
                          theme={theme}
                          title={useLoading ? "Applying..." : "Use"}
                          onPress={() => doActivate(g.type, key, "set")}
                          disabled={buyDisabled || useLoading}
                          loading={useLoading}
                        />
                      ) : null}

                      {g.type === "badge" ? (
                        <SecondaryButton
                          theme={theme}
                          title={(active.badges || []).includes(key) ? "Remove" : "Add"}
                          onPress={() =>
                            doActivate("badge", key, (active.badges || []).includes(key) ? "remove" : "add")
                          }
                          disabled={buyDisabled || expired}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </View>
    );
  }, [
    s,
    theme,
    my?.inventory?.length,
    myLoading,
    activating,
    groupedOwned,
    active,
    activateKeyLoading,
    doActivate,
    buyDisabled
  ]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={data as any}
        keyExtractor={(x: any) => (tab === "coinz" ? String(x.packageId) : String(x._id))}
        renderItem={tab === "coinz" ? renderCoinzPack : renderStoreItem}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderOwned}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />}
        ListEmptyComponent={
          itemsLoading || tabLoading ? (
            <View style={s.center}>
              <ActivityIndicator />
              <Text style={s.emptySub}>Loading...</Text>
            </View>
          ) : (
            <View style={s.center}>
              <Text style={s.emptyTitle}>
                {tab === "coinz" ? "No coinz packs found" : "No items match your search"}
              </Text>
              <Text style={s.emptySub}>Try a different keyword.</Text>
            </View>
          )
        }
      />

      {/* ✅ Overlay Loading عام */}
      {globalBusy ? (
        <View pointerEvents="auto" style={[s.loadingOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[s.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ActivityIndicator />
            <Text style={[s.loadingText, { color: theme.text }]}>Please wait...</Text>
          </View>
        </View>
      ) : null}

      {/* =========================
          Purchase Item Modal
      ========================= */}
      <Modal transparent visible={buyOpen} animationType="fade" onRequestClose={() => setBuyOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (buySubmitting ? null : setBuyOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: theme.text }]}>Purchase</Text>
              <TouchableOpacity disabled={buySubmitting} onPress={() => setBuyOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: buySubmitting ? 0.6 : 1 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {!selectedItem ? (
              <View style={s.center}>
                <ActivityIndicator />
              </View>
            ) : (
              <>
                <View style={{ marginTop: 10 }}>
                  <Text style={[s.modalName, { color: theme.text }]}>{selectedItem.name || selectedItem.key}</Text>
                  <Text style={[s.modalMeta, { color: theme.mutedText }]}>
                    {prettyType(selectedItem.type)} • {selectedItem.key}
                  </Text>

                  <Text style={[s.modalMeta, { color: theme.mutedText }]}>
                    Duration:{" "}
                    <Text style={{ color: theme.text, fontWeight: "800" }}>
                      {Number(selectedItem.durationDays || 0) > 0
                        ? `${Number(selectedItem.durationDays || 0)} day(s)`
                        : "Permanent"}
                    </Text>
                  </Text>
                </View>

                <View style={s.modalRow}>
                  <Text style={[s.modalLabel, { color: theme.mutedText }]}>Price</Text>
                  <Text style={[s.modalValue, { color: theme.text }]}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0))} Coinz
                  </Text>
                </View>

                {(selectedItem.isStackable || selectedItem.isConsumable) ? (
                  <View style={s.modalRow}>
                    <Text style={[s.modalLabel, { color: theme.mutedText }]}>Quantity</Text>

                    <View style={s.qtyRow}>
                      <TouchableOpacity
                        style={[s.qtyBtn, { backgroundColor: theme.surface2, borderColor: theme.border, opacity: (buySubmitting || purchasing) ? 0.6 : 1 }]}
                        disabled={buySubmitting || purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) - 1))}
                      >
                        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>−</Text>
                      </TouchableOpacity>

                      <TextInput
                        editable={!buySubmitting}
                        value={String(buyQty)}
                        onChangeText={(t) => setBuyQty(Math.max(1, Number(t.replace(/[^\d]/g, "") || "1")))}
                        keyboardType="number-pad"
                        style={[s.qtyInput, { backgroundColor: theme.surface2, borderColor: theme.border, color: theme.text }]}
                      />

                      <TouchableOpacity
                        style={[s.qtyBtn, { backgroundColor: theme.surface2, borderColor: theme.border, opacity: (buySubmitting || purchasing) ? 0.6 : 1 }]}
                        disabled={buySubmitting || purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) + 1))}
                      >
                        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <View style={s.modalRow}>
                  <Text style={[s.modalLabel, { color: theme.mutedText }]}>Auto-activate</Text>
                  <TouchableOpacity
                    disabled={buySubmitting}
                    onPress={() => setBuySetActive((v) => !v)}
                    style={[
                      s.toggle,
                      {
                        backgroundColor: buySetActive ? theme.primary : theme.disabledBg,
                        opacity: buySubmitting ? 0.7 : 1
                      }
                    ]}
                  >
                    <View style={[s.toggleKnob, buySetActive ? s.knobOn : s.knobOff, { backgroundColor: theme.primaryText }]} />
                  </TouchableOpacity>
                </View>

                <View style={s.modalRow}>
                  <Text style={[s.modalLabel, { color: theme.mutedText }]}>Total</Text>
                  <Text style={[s.modalTotal, { color: theme.text }]}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0) * Math.max(1, Number(buyQty || 1)))} Coinz
                  </Text>
                </View>

                <View style={s.actionsRow}>
                  <SecondaryButton theme={theme} title="Cancel" onPress={() => setBuyOpen(false)} disabled={buySubmitting} />
                  <PrimaryButton
                    theme={theme}
                    title={buySubmitting ? "Buying..." : "Confirm"}
                    onPress={doBuy}
                    disabled={buySubmitting || purchasing}
                    loading={buySubmitting || purchasing}
                  />
                </View>

                <Text style={[s.modalHint, { color: theme.subtleText }]}>
                  Your balance: {formatCoinz(coinz)} Coinz
                </Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          Create Account Modal
      ========================= */}
      <Modal transparent visible={createOpen} animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (createSubmitting ? null : setCreateOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: theme.text }]}>Create Account</Text>
              <TouchableOpacity disabled={createSubmitting} onPress={() => setCreateOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: createSubmitting ? 0.6 : 1 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={[s.modalMeta, { color: theme.mutedText }]}>
                Cost: <Text style={{ color: theme.text, fontWeight: "900" }}>{formatCoinz(CREATE_ACCOUNT_COST)} Coinz</Text>
              </Text>
            </View>

            <Spacer h={12} />
            <Text style={[s.fieldLabel, { color: theme.mutedText }]}>Username</Text>
            <SoftInput theme={theme} value={newUsername} onChangeText={setNewUsername} placeholder="username" editable={!createSubmitting} />

            <Spacer h={10} />
            <Text style={[s.fieldLabel, { color: theme.mutedText }]}>Password</Text>
            <SoftInput theme={theme} value={newPassword} onChangeText={setNewPassword} placeholder="password" secureTextEntry editable={!createSubmitting} />

            <Spacer h={14} />
            <View style={s.actionsRow}>
              <SecondaryButton theme={theme} title="Cancel" onPress={() => setCreateOpen(false)} disabled={createSubmitting} />
              <PrimaryButton
                theme={theme}
                title={createSubmitting ? "Creating..." : "Confirm"}
                onPress={doCreateAccount}
                disabled={createSubmitting}
                loading={createSubmitting}
              />
            </View>

            <Text style={[s.modalHint, { color: theme.subtleText }]}>
              Your balance: {formatCoinz(coinz)} Coinz
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          Created Account Modal
      ========================= */}
      <Modal transparent visible={createdOpen} animationType="fade" onRequestClose={() => setCreatedOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (copyLoading ? null : setCreatedOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: theme.text }]}>Account Created</Text>
              <TouchableOpacity disabled={copyLoading} onPress={() => setCreatedOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: copyLoading ? 0.6 : 1 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={[s.fieldLabel, { color: theme.mutedText }]}>Username</Text>
              <Text style={[s.modalValue, { color: theme.text }]}>{createdCreds?.username || "-"}</Text>

              <Spacer h={10} />

              <Text style={[s.fieldLabel, { color: theme.mutedText }]}>Password</Text>
              <Text style={[s.modalValue, { color: theme.text }]}>{createdCreds?.password || "-"}</Text>
            </View>

            <Spacer h={14} />
            <View style={s.actionsRow}>
              <SecondaryButton theme={theme} title="Close" onPress={() => setCreatedOpen(false)} disabled={copyLoading} />
              <PrimaryButton theme={theme} title={copyLoading ? "Copying..." : "Copy"} onPress={copyCreatedCreds} disabled={copyLoading} loading={copyLoading} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES (Theme-based)
========================================================= */

const ui = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts?.rounded
  },

  btn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnText: { fontWeight: "900", fontSize: 14, fontFamily: Fonts?.rounded },

  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontWeight: "800",
    fontFamily: Fonts?.sans
  }
});

function createStyles(theme: AppTheme) {
  const shadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 }
        }
      : { elevation: 3 };

  return StyleSheet.create({
    safe: { flex: 1 },

    listContent: { padding: 14, paddingBottom: 22 },

    headerWrap: { gap: 12, paddingBottom: 10 },

    heroCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    heroKicker: { color: theme.mutedText, fontSize: 12, fontWeight: "800", fontFamily: Fonts?.rounded },
    heroBalance: { color: theme.text, fontSize: 28, fontWeight: "900", marginTop: 4, fontFamily: Fonts?.rounded },
    heroSub: { color: theme.subtleText, fontSize: 12, marginTop: 6, lineHeight: 16, fontFamily: Fonts?.sans },

    activeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    activeChip: {
      flexGrow: 1,
      minWidth: "47%",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 10
    },
    activeLabel: { color: theme.subtleText, fontSize: 11, fontWeight: "800", fontFamily: Fonts?.sans },
    activeValue: { color: theme.text, fontSize: 13, fontWeight: "900", marginTop: 4, fontFamily: Fonts?.rounded },

    searchWrap: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10
    },
    searchInput: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
      fontFamily: Fonts?.sans
    },

    tabsRow: { gap: 8, paddingVertical: 2 },
    tabPill: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border
    },
    tabPillActive: {
      backgroundColor: theme.primarySoft,
      borderColor: theme.primary
    },
    tabText: { color: theme.mutedText, fontWeight: "900", fontSize: 12, fontFamily: Fonts?.rounded },
    tabTextActive: { color: theme.text },

    sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { color: theme.text, fontSize: 18, fontWeight: "900", fontFamily: Fonts?.rounded },
    sectionSub: { color: theme.subtleText, fontSize: 12, fontFamily: Fonts?.sans },

    noteCard: {
      borderRadius: 16,
      padding: 12,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border
    },
    noteText: { color: theme.mutedText, fontSize: 12, lineHeight: 16, fontFamily: Fonts?.sans },

    modernCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    groupCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    groupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    groupTitle: { color: theme.text, fontSize: 14, fontWeight: "900", fontFamily: Fonts?.rounded },

    cardTop: { flexDirection: "row", gap: 12 },
    cardTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    cardDesc: { color: theme.mutedText, fontSize: 12, marginTop: 6, lineHeight: 16, fontFamily: Fonts?.sans },

    pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

    priceBox: { minWidth: 96, alignItems: "flex-end", paddingLeft: 8 },
    priceLabel: { color: theme.subtleText, fontSize: 11, fontWeight: "800", fontFamily: Fonts?.sans },
    priceValue: { color: theme.pillGoldFg, fontSize: 16, fontWeight: "900", marginTop: 2, fontFamily: Fonts?.rounded },

    itemTop: { flexDirection: "row", gap: 12 },
    thumbWrap: { width: 66 },
    thumb: {
      width: 62,
      height: 62,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border
    },

    itemTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    itemMeta: { color: theme.subtleText, fontSize: 12, marginTop: 2, fontFamily: Fonts?.sans },
    itemSmall: { color: theme.mutedText, fontSize: 12, marginTop: 8, fontFamily: Fonts?.sans },
    itemDesc: { color: theme.mutedText, fontSize: 12, marginTop: 8, lineHeight: 16, fontFamily: Fonts?.sans },

    actionsRow: { flexDirection: "row", gap: 10, marginTop: 14 },

    footerWrap: { marginTop: 16, gap: 12 },

    ownedRow: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 10
    },
    ownedThumb: {
      width: 46,
      height: 46,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border
    },
    ownedTitle: { color: theme.text, fontWeight: "900", fontFamily: Fonts?.rounded },
    ownedMeta: { color: theme.subtleText, fontSize: 12, marginTop: 4, fontFamily: Fonts?.sans },

    emptyBox: {
      borderRadius: 20,
      padding: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      ...shadow
    },
    emptyTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    emptySub: { color: theme.subtleText, fontSize: 12, marginTop: 6, fontFamily: Fonts?.sans, textAlign: "center" },

    center: { paddingVertical: 26, alignItems: "center", gap: 10 },

    // Loading Overlay
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    },
    loadingCard: {
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: "center",
      gap: 10,
      minWidth: 180,
      borderWidth: 1
    },
    loadingText: { fontWeight: "900", fontFamily: Fonts?.rounded },

    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 14
    },
    modalCard: {
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      ...shadow
    },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    modalTitle: { fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    modalClose: { fontSize: 18, padding: 6 },

    modalRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    modalName: { fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    modalMeta: { fontSize: 12, marginTop: 4, fontFamily: Fonts?.sans },

    modalLabel: { fontWeight: "800", fontFamily: Fonts?.sans },
    modalValue: { fontWeight: "900", fontFamily: Fonts?.rounded },
    modalTotal: { fontWeight: "900", fontFamily: Fonts?.rounded },

    fieldLabel: { fontSize: 12, fontWeight: "800", fontFamily: Fonts?.sans },

    modalHint: { fontSize: 12, marginTop: 10, fontFamily: Fonts?.sans },

    qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    qtyBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1
    },
    qtyInput: {
      width: 76,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      textAlign: "center",
      fontWeight: "900",
      fontFamily: Fonts?.rounded
    },

    toggle: { width: 54, height: 30, borderRadius: 999, padding: 3, justifyContent: "center" },
    toggleKnob: { width: 24, height: 24, borderRadius: 999 },
    knobOn: { alignSelf: "flex-end" },
    knobOff: { alignSelf: "flex-start" }
  });
}