

// import LottieBadge from "@/components/LottieBadge";
// import BadgeLottiePickerModal from "@/components/store/BadgeLottiePickerModal";
// import { AppTheme, Colors, Fonts } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { useTranslation } from "@/hooks/useTranslation";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import {
//   activateCustomEmojiBadge,
//   activateStoreItem,
//   buyCustomEmojiBadge,
//   clearStoreError,
//   getMyCustomEmojiBadge,
//   getMyInventory,
//   listStoreItems,
//   purchaseStoreItems,
//   selectMyCustomEmojiBadge,
//   selectMyStore,
//   selectMyStoreLoading,
//   selectStoreActivating,
//   selectStoreActivatingCustomEmojiBadge,
//   selectStoreBuyingCoinz,
//   selectStoreBuyingCustomEmojiBadge,
//   selectStoreError,
//   selectStoreItems,
//   selectStoreItemsLoading,
//   selectStoreLoadingCustomEmojiBadge,
//   selectStorePurchasing,
// } from "@/redux/slices/storeControl.slice";
// import { createPaidAccount } from "@/redux/slices/userSlice";
// import api from "@/services/api";
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
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// type StoreType =
//   | "avatarFrame"
//   | "avatarGif"
//   | "usernameColor"
//   | "messageTextColor"
//   | "badge"
//   | "messageEffect"
//   | "profileEntryAnimation"
//   | "verification"
//   | "gift";

// type SectionKey =
//   | "wallet"
//   | "customEmoji"
//   | "badgePicker"
//   | "createAccount"
//   | "storeCategory"
//   | "inventory";

// type CategoryCard = {
//   key: StoreType;
//   title: string;
//   subtitle: string;
// };

// type ModalState = {
//   wallet: boolean;
//   customEmoji: boolean;
//   badgePicker: boolean;
//   createAccount: boolean;
//   category: boolean;
//   inventory: boolean;
//   buy: boolean;
//   created: boolean;
// };

// type CoinzPack = {
//   packageId: "p1" | "p2" | "p3";
//   title: string;
//   subtitle?: string;
//   priceEGP: number;
//   coinz: number;
// };

// function formatCoinz(n: number) {
//   return Math.round(Number.isFinite(n) ? n : 0).toLocaleString();
// }

// function isExpired(expiresAt?: string | null) {
//   if (!expiresAt) return false;
//   const t = new Date(expiresAt).getTime();
//   return Number.isFinite(t) && t <= Date.now();
// }

// function formatDate(iso?: string | null) {
//   if (!iso) return "-";
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return String(iso);
//   return d.toLocaleDateString();
// }

// function getItemImageUrl(item: any): string {
//   const meta = item?.meta || {};

//   const imageUrl =
//     String(item?.iconUrl || "").trim() ||
//     String(item?.coverUrl || "").trim() ||
//     String(item?.previewUrl || "").trim() ||
//     String(meta?.iconUrl || "").trim() ||
//     String(meta?.coverUrl || "").trim() ||
//     String(meta?.previewUrl || "").trim();

//   return imageUrl;
// }

// function prettyType(t: string, tr: (key: string) => string) {
//   switch (t) {
//     case "avatarFrame":
//       return tr("storeScreen.prettyType.avatarFrame");
//     case "avatarGif":
//       return tr("storeScreen.prettyType.avatarGif");
//     case "usernameColor":
//       return tr("storeScreen.prettyType.usernameColor");
//     case "messageTextColor":
//       return tr("storeScreen.prettyType.messageTextColor");
//     case "badge":
//       return tr("storeScreen.prettyType.badge");
//     case "messageEffect":
//       return tr("storeScreen.prettyType.messageEffect");
//     case "gift":
//       return tr("storeScreen.prettyType.gift");
//     case "profileEntryAnimation":
//       return tr("storeScreen.prettyType.profileEntryAnimation");
//     case "verification":
//       return tr("storeScreen.prettyType.verification");
//     default:
//       return t || tr("storeScreen.prettyType.item");
//   }
// }

// function pillTone(theme: AppTheme, tone: "gold" | "good" | "info" | "danger" | "neutral") {
//   switch (tone) {
//     case "gold":
//       return { bg: theme.pillGoldBg, fg: theme.pillGoldFg };
//     case "good":
//       return { bg: `${theme.success}22`, fg: theme.success };
//     case "info":
//       return { bg: `${theme.info}22`, fg: theme.info };
//     case "danger":
//       return { bg: `${theme.danger}22`, fg: theme.danger };
//     default:
//       return { bg: theme.surface2, fg: theme.mutedText };
//   }
// }

// function Pill({ theme, text, tone }: { theme: AppTheme; text: string; tone: "gold" | "good" | "info" | "danger" | "neutral" }) {
//   const c = pillTone(theme, tone);
//   return (
//     <View style={[styles.pill, { backgroundColor: c.bg, borderColor: theme.border }]}> 
//       <Text style={[styles.pillText, { color: c.fg }]}>{text}</Text>
//     </View>
//   );
// }

// function ModalShell({
//   visible,
//   onClose,
//   title,
//   theme,
//   children,
//   scrollable = true,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   title: string;
//   theme: AppTheme;
//   children: React.ReactNode;
//   scrollable?: boolean;
// }) {
//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="fade"
//       onRequestClose={onClose}
//       statusBarTranslucent
//     >
//       <View style={styles.modalRoot}>
//         <Pressable style={styles.modalBackdrop} onPress={onClose} />

//         <View
//           style={[
//             styles.modalCard,
//             {
//               backgroundColor: theme.surface,
//               borderColor: theme.border,
//             },
//           ]}
//         >
//           <View style={styles.modalHeader}>
//             <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
//               <Text style={[styles.closeBtnText, { color: theme.subtleText }]}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           {scrollable ? (
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               nestedScrollEnabled
//               keyboardShouldPersistTaps="handled"
//               contentContainerStyle={styles.modalScrollContent}
//             >
//               {children}
//             </ScrollView>
//           ) : (
//             <View style={styles.modalScrollContent}>{children}</View>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }
// function SectionCard({
//   theme,
//   title,
//   subtitle,
//   right,
//   onPress,
// }: {
//   theme: AppTheme;
//   title: string;
//   subtitle: string;
//   right?: React.ReactNode;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={onPress}
//       style={[
//         styles.sectionCard,
//         {
//           backgroundColor: theme.surface,
//           borderColor: theme.border,
//         },
//       ]}
//     >
//       <View style={{ flex: 1 }}>
//         <Text style={[styles.sectionCardTitle, { color: theme.text }]}>{title}</Text>
//         <Text style={[styles.sectionCardSub, { color: theme.mutedText }]}>{subtitle}</Text>
//       </View>
//       {right}
//     </TouchableOpacity>
//   );
// }

// function ActionButton({
//   theme,
//   title,
//   onPress,
//   secondary,
//   disabled,
//   loading,
// }: {
//   theme: AppTheme;
//   title: string;
//   onPress: () => void;
//   secondary?: boolean;
//   disabled?: boolean;
//   loading?: boolean;
// }) {
//   const bg = secondary ? theme.surface2 : theme.primary;
//   const fg = secondary ? theme.text : theme.primaryText;
//   return (
//     <TouchableOpacity
//       activeOpacity={0.88}
//       disabled={disabled || loading}
//       onPress={onPress}
//       style={[
//         styles.actionBtn,
//         {
//           backgroundColor: bg,
//           borderColor: secondary ? theme.border : "transparent",
//           opacity: disabled || loading ? 0.6 : 1,
//         },
//       ]}
//     >
//       {loading ? <ActivityIndicator size="small" color={fg} /> : <Text style={[styles.actionBtnText, { color: fg }]}>{title}</Text>}
//     </TouchableOpacity>
//   );
// }

// export default function StoreScreen() {
//   const { colorScheme } = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const { t, isRTL } = useTranslation();
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   const items = useAppSelector(selectStoreItems);
//   const itemsLoading = useAppSelector(selectStoreItemsLoading);
//   const my = useAppSelector(selectMyStore);
//   const myLoading = useAppSelector(selectMyStoreLoading);
//   const customEmojiBadge = useAppSelector(selectMyCustomEmojiBadge);
//   const error = useAppSelector(selectStoreError);
//   const purchasing = useAppSelector(selectStorePurchasing);
//   const activating = useAppSelector(selectStoreActivating);
//   const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
//   const buyingCustomEmojiBadge = useAppSelector(selectStoreBuyingCustomEmojiBadge);
//   const activatingCustomEmojiBadge = useAppSelector(selectStoreActivatingCustomEmojiBadge);
//   const loadingCustomEmojiBadge = useAppSelector(selectStoreLoadingCustomEmojiBadge);
// const [badgePickerType, setBadgePickerType] = useState<"lottie" | "image">("lottie");
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeCategory, setActiveCategory] = useState<StoreType | null>(null);
//   const [search, setSearch] = useState("");
//   const [buyItemId, setBuyItemId] = useState("");
//   const [buyQty, setBuyQty] = useState(1);
//   const [buySetActive, setBuySetActive] = useState(true);
//   const [newUsername, setNewUsername] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
//   const [customEmojiInput, setCustomEmojiInput] = useState("");
//   const [customEmojiSetActive, setCustomEmojiSetActive] = useState(true);
//   const [paymobLoadingPackId, setPaymobLoadingPackId] = useState<string | null>(null);
//   const [buySubmitting, setBuySubmitting] = useState(false);
//   const [createSubmitting, setCreateSubmitting] = useState(false);
//   const [copyLoading, setCopyLoading] = useState(false);
//   const [activateKeyLoading, setActivateKeyLoading] = useState<string | null>(null);
//   const [badgePickerSubmitting, setBadgePickerSubmitting] = useState(false);
//   const [modal, setModal] = useState<ModalState>({
//     wallet: false,
//     customEmoji: false,
//     badgePicker: false,
//     createAccount: false,
//     category: false,
//     inventory: false,
//     buy: false,
//     created: false,
//   });

//   const coinz = my?.coinzBalance ?? 0;
//   const CREATE_ACCOUNT_COST = 30000;
//   const CUSTOM_EMOJI_BADGE_COST = 2500;
//   const active = my?.activeCustomization || {
//     avatarFrame: "",
//     avatarGif: "",
//     usernameColor: "",
//     messageTextColor: "",
//     messageEffect: "",
//     profileEntryAnimation: "",
//     badges: [],
//     verificationType: "none",
//   };

//   const coinzPacks: CoinzPack[] = useMemo(
//     () => [
//       { packageId: "p1", title: t("storeScreen.coinzPacks.p1.title"), subtitle: t("storeScreen.coinzPacks.p1.subtitle"), priceEGP: 10, coinz: 100 },
//       { packageId: "p2", title: t("storeScreen.coinzPacks.p2.title"), subtitle: t("storeScreen.coinzPacks.p2.subtitle"), priceEGP: 25, coinz: 260 },
//       { packageId: "p3", title: t("storeScreen.coinzPacks.p3.title"), subtitle: t("storeScreen.coinzPacks.p3.subtitle"), priceEGP: 50, coinz: 550 },
//     ],
//     [t]
//   );

//   const categoryCards: CategoryCard[] = useMemo(
//     () => [
//       { key: "avatarFrame", title: t("storeScreen.tabs.avatarFrame"), subtitle: t("storeScreen.prettyType.avatarFrame") },
//       // { key: "avatarGif", title: t("storeScreen.tabs.avatarGif"), subtitle: t("storeScreen.prettyType.avatarGif") },
//       { key: "usernameColor", title: t("storeScreen.tabs.usernameColor"), subtitle: t("storeScreen.prettyType.usernameColor") },
//       { key: "messageTextColor", title: t("storeScreen.tabs.messageTextColor"), subtitle: t("storeScreen.prettyType.messageTextColor") },
//       { key: "badge", title: t("storeScreen.tabs.badge"), subtitle: t("storeScreen.prettyType.badge") },
//       { key: "messageEffect", title: t("storeScreen.tabs.messageEffect"), subtitle: t("storeScreen.prettyType.messageEffect") },
//       { key: "profileEntryAnimation", title: t("storeScreen.tabs.profileEntryAnimation"), subtitle: t("storeScreen.prettyType.profileEntryAnimation") },
//       { key: "verification", title: t("storeScreen.tabs.verification"), subtitle: t("storeScreen.prettyType.verification") },
//       { key: "gift", title: t("storeScreen.tabs.gift"), subtitle: t("storeScreen.prettyType.gift") },
//     ],
//     [t]
//   );

//   // const badgeItems = useMemo(() => (items || []).filter((x: any) => x.type === "badge"), [items]);
// const badgeItems = useMemo(() => {
//   return (items || []).filter((x: any) => x.type === "badge");
// }, [items]);

// const lottieBadgeItems = useMemo(() => {
//   const list = (badgeItems || []).filter((x: any) => {
//     const meta = x?.meta || {};
//     return !!String(meta?.lottieUrl || "").trim();
//   });



//   return list;
// }, [badgeItems]);

// const imageBadgeItems = useMemo(() => {
//   const list = (badgeItems || []).filter((x: any) => {
//     const meta = x?.meta || {};
//     const hasLottie = !!String(meta?.lottieUrl || "").trim();

//     const hasImage =
//       !!String(x?.iconUrl || "").trim() ||
//       !!String(x?.previewUrl || "").trim() ||
//       !!String(meta?.iconUrl || "").trim() ||
//       !!String(meta?.previewUrl || "").trim();

//     return !hasLottie && hasImage;
//   });



//   return list;
// }, [badgeItems]);
// useEffect(() => {
//   console.log(
//     "ALL_BADGE_ITEMS_RAW",
//     (badgeItems || []).map((x: any) => ({
//       id: String(x?._id || ""),
//       key: String(x?.key || ""),
//       name: String(x?.name || ""),
//       type: String(x?.type || ""),
//       meta: x?.meta || {},
//       imageUrl: getItemImageUrl(x),
//     }))
//   );
// }, [badgeItems]);
//   const ownedByTypeKey = useMemo(() => {
//     const inv = my?.inventory || [];
//     const map = new Map<string, any>();
//     for (const it of inv) map.set(`${String(it?.itemType || "")}:${String(it?.itemKey || "")}`, it);
//     return map;
//   }, [my?.inventory]);

//   const filteredCategoryItems = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return (items || []).filter((it: any) => {
//       if (!activeCategory) return false;
//       if (String(it?.type || "") !== activeCategory) return false;
//       const hay = `${it?.name || ""} ${it?.key || ""} ${it?.description || ""}`.toLowerCase();
//       return !q || hay.includes(q);
//     });
//   }, [items, activeCategory, search]);

//   const groupedOwned = useMemo(() => {
//     const inv = my?.inventory || [];
//     const byType: Record<string, any[]> = {};
//     for (const row of inv) {
//       const t = String(row?.itemType || "");
//       if (!byType[t]) byType[t] = [];
//       byType[t].push(row);
//     }
//     return Object.keys(byType).map((type) => ({ type, rows: byType[type] }));
//   }, [my?.inventory]);

//   const selectedItem = useMemo(() => items.find((x: any) => String(x._id) === String(buyItemId)) || null, [items, buyItemId]);
//   const customBadgeExpired = useMemo(() => !!customEmojiBadge?.expiresAt && isExpired(customEmojiBadge.expiresAt), [customEmojiBadge?.expiresAt]);

//   const loadAll = useCallback(async () => {
//     await Promise.all([
//       dispatch(listStoreItems({ active: true }) as any),
//       dispatch(getMyInventory() as any),
//       dispatch(getMyCustomEmojiBadge() as any),
//     ]);
//   }, [dispatch]);

//   useEffect(() => {
//     loadAll();
//   }, [loadAll]);

//   useFocusEffect(
//     useCallback(() => {
//       dispatch(getMyInventory() as any);
//       dispatch(getMyCustomEmojiBadge() as any);
//     }, [dispatch])
//   );

//   useEffect(() => {
//     if (!error) return;
//     Alert.alert(t("storeScreen.alerts.storeTitle"), error, [
//       { text: t("storeScreen.common.ok"), onPress: () => dispatch(clearStoreError()) },
//     ]);
//   }, [error, dispatch, t]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await loadAll();
//     } finally {
//       setRefreshing(false);
//     }
//   }, [loadAll]);

//   const openCategoryModal = useCallback((key: StoreType) => {
//     setActiveCategory(key);
//     setSearch("");
//     setModal((s) => ({ ...s, category: true }));
//   }, []);

//   const openBuy = useCallback((itemId: string) => {
//     setBuyItemId(itemId);
//     setBuyQty(1);
//     setBuySetActive(true);
//     setModal((s) => ({ ...s, buy: true }));
//   }, []);

//   const doBuy = useCallback(async () => {
//     if (!selectedItem || buySubmitting) return;
//     setBuySubmitting(true);
//     try {
//       const qty = Math.max(1, Number(buyQty || 1));
//       const res = await dispatch(
//         purchaseStoreItems({ items: [{ itemId: selectedItem._id, quantity: qty }], setActive: buySetActive }) as any
//       );
//       if (purchaseStoreItems.fulfilled.match(res)) {
//         setModal((s) => ({ ...s, buy: false }));
//         await dispatch(getMyInventory() as any);
//       }
//     } finally {
//       setBuySubmitting(false);
//     }
//   }, [selectedItem, buySubmitting, buyQty, buySetActive, dispatch]);

//   const doActivate = useCallback(
//     async (type: any, key: string, mode?: "set" | "add" | "remove") => {
//       const loadingKey = `${String(type)}:${String(key)}:${String(mode || "set")}`;
//       if (activateKeyLoading) return;
//       setActivateKeyLoading(loadingKey);
//       try {
//         await dispatch(activateStoreItem({ type, key, mode } as any) as any);
//         await dispatch(getMyInventory() as any);
//       } finally {
//         setActivateKeyLoading(null);
//       }
//     },
//     [dispatch, activateKeyLoading]
//   );

//   const startPaymobCoinz = useCallback(
//     async (packageId: "p1" | "p2" | "p3") => {
//       if (paymobLoadingPackId) return;
//       setPaymobLoadingPackId(packageId);
//       try {
//         const { data } = await api.post("/payments/paymob/create", { packageId });
//         const paymentUrl = data?.paymentUrl;
//         if (!paymentUrl) {
//           Alert.alert(t("storeScreen.coinz.buyTitle"), t("storeScreen.coinz.paymentUrlMissing"));
//           return;
//         }
//         router.push({ pathname: "/paymob-checkout", params: { url: paymentUrl } });
//       } catch (e: any) {
//         Alert.alert(t("storeScreen.coinz.buyTitle"), e?.response?.data?.message || t("storeScreen.coinz.paymentCreateFailed"));
//       } finally {
//         setPaymobLoadingPackId(null);
//       }
//     },
//     [router, paymobLoadingPackId, t]
//   );
// const doCreateAccount = useCallback(async () => {
//   if (createSubmitting) return;

//   const username = newUsername.trim();
//   const password = newPassword.trim();

//   if (!username) {
//     Alert.alert(
//       t("storeScreen.createAccount.title"),
//       t("storeScreen.createAccount.usernameRequired")
//     );
//     return;
//   }

//   if (!password || password.length < 6) {
//     Alert.alert(
//       t("storeScreen.createAccount.title"),
//       t("storeScreen.createAccount.passwordMin")
//     );
//     return;
//   }

//   if (coinz < CREATE_ACCOUNT_COST) {
//     Alert.alert(
//       t("storeScreen.createAccount.title"),
//       t("storeScreen.createAccount.insufficientBalance")
//     );
//     return;
//   }

//   setCreateSubmitting(true);

//   try {
//     console.log("🟡 [doCreateAccount] before createPaidAccount", {
//       username,
//       passwordLength: password.length,
//       cost: CREATE_ACCOUNT_COST,
//       currentCoinz: coinz,
//     });

//     const result = await dispatch(
//       createPaidAccount({ username, password }) as any
//     );

//     console.log("🟣 [doCreateAccount] createPaidAccount result", {
//       type: result?.type,
//       payload: result?.payload,
//       error: result?.error,
//     });

//     if (!createPaidAccount.fulfilled.match(result)) {
//       const message =
//         typeof result?.payload === "string"
//           ? result.payload
//           : result?.error?.message || "فشل إنشاء الحساب";

//       Alert.alert(t("storeScreen.createAccount.title"), message);
//       return;
//     }

//     await dispatch(getMyInventory() as any);

//     setCreatedCreds({
//       username: result.payload?.credentials?.username || username,
//       password: result.payload?.credentials?.password || password,
//     });

//     setNewUsername("");
//     setNewPassword("");

//     setModal((s) => ({
//       ...s,
//       createAccount: false,
//       created: true,
//     }));
//   } finally {
//     setCreateSubmitting(false);
//   }
// }, [
//   createSubmitting,
//   newUsername,
//   newPassword,
//   coinz,
//   dispatch,
//   t,
// ]);
//   // const doCreateAccount = useCallback(async () => {
//   //   if (createSubmitting) return;
//   //   const username = newUsername.trim();
//   //   const password = newPassword.trim();
//   //   if (!username) {
//   //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.usernameRequired"));
//   //     return;
//   //   }
//   //   if (!password || password.length < 6) {
//   //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.passwordMin"));
//   //     return;
//   //   }
//   //   if (coinz < CREATE_ACCOUNT_COST) {
//   //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.insufficientBalance"));
//   //     return;
//   //   }
//   //   setCreateSubmitting(true);
//   //   try {
//   //     const debitRes = await dispatch(debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any);
//   //     if (!debitMyCoinz.fulfilled.match(debitRes)) return;
//   //     const regRes = await dispatch(registerNoLogin({ username, password }) as any);
//   //     if (!registerNoLogin.fulfilled.match(regRes)) return;
//   //     await dispatch(getMyInventory() as any);
//   //     setModal((s) => ({ ...s, createAccount: false, created: true }));
//   //     setCreatedCreds({ username, password });
//   //   } finally {
//   //     setCreateSubmitting(false);
//   //   }
//   // }, [createSubmitting, newUsername, newPassword, coinz, dispatch, t]);

//   const copyCreatedCreds = useCallback(async () => {
//     if (!createdCreds || copyLoading) return;
//     setCopyLoading(true);
//     try {
//       await Clipboard.setStringAsync(`Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`);
//       Alert.alert(t("storeScreen.alerts.copiedTitle"), t("storeScreen.alerts.credentialsCopied"));
//     } finally {
//       setCopyLoading(false);
//     }
//   }, [createdCreds, copyLoading, t]);

//   const doBuyCustomEmojiBadge = useCallback(async () => {
//     const emoji = customEmojiInput.trim();
//     if (!emoji) {
//       Alert.alert(t("storeScreen.customEmoji.title"), t("storeScreen.customEmoji.enterEmoji"));
//       return;
//     }
//     const res = await dispatch(buyCustomEmojiBadge({ emoji, setActive: customEmojiSetActive }) as any);
//     if (buyCustomEmojiBadge.fulfilled.match(res)) {
//       setModal((s) => ({ ...s, customEmoji: false }));
//       await dispatch(getMyInventory() as any);
//       await dispatch(getMyCustomEmojiBadge() as any);
//     }
//   }, [customEmojiInput, customEmojiSetActive, dispatch, t]);

//   const doToggleCustomEmojiBadge = useCallback(async () => {
//     if (!customEmojiBadge?.emoji || customBadgeExpired) return;
//     const res = await dispatch(activateCustomEmojiBadge({ active: !Boolean(customEmojiBadge?.isActive) }) as any);
//     if (activateCustomEmojiBadge.fulfilled.match(res)) {
//       await dispatch(getMyCustomEmojiBadge() as any);
//       await dispatch(getMyInventory() as any);
//     }
//   }, [customEmojiBadge?.emoji, customEmojiBadge?.isActive, customBadgeExpired, dispatch]);

//   const doBuyBadgeFromPicker = useCallback(
//     async (item: any, setActive: boolean) => {
//       if (!item || badgePickerSubmitting) return;
//       setBadgePickerSubmitting(true);
//       try {
//         const res = await dispatch(
//           purchaseStoreItems({ items: [{ itemId: item._id, quantity: 1 }], setActive }) as any
//         );
//         if (purchaseStoreItems.fulfilled.match(res)) {
//           setModal((s) => ({ ...s, badgePicker: false }));
//           await dispatch(getMyInventory() as any);
//         }
//       } finally {
//         setBadgePickerSubmitting(false);
//       }
//     },
//     [badgePickerSubmitting, dispatch]
//   );
//     const isItemActive = useCallback(
//     (type: string, key: string) => {
//       if (type === "avatarFrame") return String(active.avatarFrame || "") === String(key);
//       if (type === "avatarGif") return String(active.avatarGif || "") === String(key);
//       if (type === "usernameColor") return String(active.usernameColor || "") === String(key);
//       if (type === "messageTextColor") return String(active.messageTextColor || "") === String(key);
//       if (type === "messageEffect") return String(active.messageEffect || "") === String(key);
//       if (type === "profileEntryAnimation") return String(active.profileEntryAnimation || "") === String(key);
//       if (type === "verification") return String(active.verificationType || "") === String(key);
//       if (type === "badge") {
//         const badges = Array.isArray(active?.badges) ? active.badges : [];
//         return badges.includes(String(key));
//       }
//       return false;
//     },
//     [active]
//   );

//   const getInventoryActionMode = useCallback(
//     (type: string, key: string): "set" | "add" | "remove" => {
//       const activeNow = isItemActive(type, key);

//       if (type === "badge") {
//         return activeNow ? "remove" : "add";
//       }

//       return activeNow ? "remove" : "set";
//     },
//     [isItemActive]
//   );

//   const getInventoryActionLabel = useCallback(
//     (type: string, key: string) => {
//       const activeNow = isItemActive(type, key);
//       return activeNow ? t("storeScreen.common.remove") : t("storeScreen.common.activate");
//     },
//     [isItemActive, t]
//   );

//   return (
//     <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
//       <FlatList
//         data={categoryCards}
//         keyExtractor={(item) => item.key}
//         numColumns={2}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />}
//         columnWrapperStyle={styles.gridRow}
//         contentContainerStyle={styles.listContent}
//         ListHeaderComponent={
//           <View style={{ gap: 12, marginBottom: 12 }}>
//             <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
//               <Text style={[styles.heroLabel, { color: theme.mutedText }]}>{t("storeScreen.wallet.title")}</Text>
//               <Text style={[styles.heroBalance, { color: theme.text }]}>{formatCoinz(coinz)} {t("storeScreen.common.coinz")}</Text>
//               <Text style={[styles.heroSub, { color: theme.subtleText }]}>{t("storeScreen.wallet.subtitle")}</Text>
//             </View>

//             <SectionCard
//               theme={theme}
//               title={t("storeScreen.wallet.buyCoinz")}
//               subtitle={t("storeScreen.sections.coinzSub")}
//               onPress={() => setModal((s) => ({ ...s, wallet: true }))}
//               right={<Pill theme={theme} text={`${coinz} ${t("storeScreen.common.coinz")}`} tone="gold" />}
//             />

//             <SectionCard
//               theme={theme}
//               title={t("storeScreen.customEmoji.cardTitle")}
//               subtitle={customEmojiBadge?.emoji ? `${t("storeScreen.customEmoji.current")} ${customEmojiBadge.emoji}` : t("storeScreen.customEmoji.cardDesc")}
//               onPress={() => {
//                 setCustomEmojiInput(customEmojiBadge?.emoji || "");
//                 setCustomEmojiSetActive(true);
//                 setModal((s) => ({ ...s, customEmoji: true }));
//               }}
//               right={<Text style={styles.bigEmoji}>{customEmojiBadge?.emoji || "🙂"}</Text>}
//             />

//           <View style={{ gap: 10 }}>
//   <SectionCard
//     theme={theme}
//     title="Lottie Badges"
//     subtitle={`Animated JSON badges (${lottieBadgeItems.length})`}
//     onPress={() => {
//       setBadgePickerType("lottie");
//       setModal((s) => ({ ...s, badgePicker: true }));
//     }}
//     right={<Pill theme={theme} text="Lottie" tone="info" />}
//   />

//   <SectionCard
//     theme={theme}
//     title="Image Badges"
//     subtitle={`Static image badges (${imageBadgeItems.length})`}
//     onPress={() => {
//       setBadgePickerType("image");
//       setModal((s) => ({ ...s, badgePicker: true }));
//     }}
//     right={<Pill theme={theme} text="Image" tone="gold" />}
//   />
// </View>
//             <SectionCard
//               theme={theme}
//               title={t("storeScreen.createAccount.cardTitle")}
//               subtitle={`${formatCoinz(CREATE_ACCOUNT_COST)} ${t("storeScreen.common.coinz")}`}
//               onPress={() => setModal((s) => ({ ...s, createAccount: true }))}
//               right={<Pill theme={theme} text={t("storeScreen.common.service")} tone="neutral" />}
//             />

//             <SectionCard
//               theme={theme}
//               title={t("storeScreen.inventory.title")}
//               subtitle={t("storeScreen.inventory.subtitle")}
//               onPress={() => setModal((s) => ({ ...s, inventory: true }))}
//               right={<Pill theme={theme} text={`${my?.inventory?.length || 0}`} tone="good" />}
//             />

//             <View style={styles.sectionHeader}>
//               <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>{t("storeScreen.sections.store")}</Text>
//               {(itemsLoading || myLoading || loadingCustomEmojiBadge) ? <ActivityIndicator /> : null}
//             </View>
//           </View>
//         }
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => openCategoryModal(item.key)}
//             style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
//           >
//             <Text style={[styles.categoryTitle, { color: theme.text }]}>{item.title}</Text>
//             <Text style={[styles.categorySub, { color: theme.mutedText }]}>{item.subtitle}</Text>
//             <View style={{ marginTop: 10 }}>
//               <Pill theme={theme} text={prettyType(item.key, t)} tone="info" />
//             </View>
//           </TouchableOpacity>
//         )}
//       />

//       <ModalShell visible={modal.wallet} onClose={() => setModal((s) => ({ ...s, wallet: false }))} title={t("storeScreen.wallet.title")} theme={theme}>
//         <View style={styles.modalBody}>
//           {coinzPacks.map((pack) => {
//             const loading = paymobLoadingPackId === pack.packageId;
//             return (
//               <View key={pack.packageId} style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
//                 <Text style={[styles.innerTitle, { color: theme.text }]}>{pack.title}</Text>
//                 <Text style={[styles.innerSub, { color: theme.mutedText }]}>{pack.subtitle}</Text>
//                 <View style={styles.pillRow}>
//                   <Pill theme={theme} text={`${pack.priceEGP} EGP`} tone="neutral" />
//                   <Pill theme={theme} text={`${pack.coinz} Coinz`} tone="gold" />
//                 </View>
//                 <View style={styles.actionRow}>
//                   <ActionButton theme={theme} title={t("storeScreen.coinz.buyNow")} onPress={() => startPaymobCoinz(pack.packageId)} loading={loading} />
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       </ModalShell>

//       <ModalShell visible={modal.customEmoji} onClose={() => setModal((s) => ({ ...s, customEmoji: false }))} title={t("storeScreen.customEmoji.title")} theme={theme}>
//         <View style={styles.modalBody}>
//           <TextInput
//             value={customEmojiInput}
//             onChangeText={setCustomEmojiInput}
//             placeholder="🐉"
//             placeholderTextColor={theme.subtleText}
//             style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
//           />
//           <View style={[styles.previewBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
//             <Text style={styles.previewEmoji}>{customEmojiInput.trim() || "🙂"}</Text>
//           </View>
//           <View style={styles.pillRow}>
//             <Pill theme={theme} text={`${CUSTOM_EMOJI_BADGE_COST} Coinz`} tone="gold" />
//             {customEmojiBadge?.emoji ? <Pill theme={theme} text={customEmojiBadge.isActive ? t("storeScreen.common.active") : t("storeScreen.common.owned")} tone="good" /> : null}
//           </View>
//           <View style={styles.actionRow}>
//             <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doBuyCustomEmojiBadge} loading={buyingCustomEmojiBadge} />
//             <ActionButton theme={theme} title={customEmojiBadge?.isActive ? t("storeScreen.common.deactivate") : t("storeScreen.common.activate")} onPress={doToggleCustomEmojiBadge} secondary disabled={!customEmojiBadge?.emoji || customBadgeExpired} loading={activatingCustomEmojiBadge} />
//           </View>
//         </View>
//       </ModalShell>

//       <ModalShell visible={modal.createAccount} onClose={() => setModal((s) => ({ ...s, createAccount: false }))} title={t("storeScreen.createAccount.title")} theme={theme}>
//         <View style={styles.modalBody}>
//           <TextInput
//             value={newUsername}
//             onChangeText={setNewUsername}
//             placeholder={t("storeScreen.createAccount.usernamePlaceholder")}
//             placeholderTextColor={theme.subtleText}
//             style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
//           />
//           <TextInput
//             value={newPassword}
//             onChangeText={setNewPassword}
//             placeholder={t("storeScreen.createAccount.passwordPlaceholder")}
//             placeholderTextColor={theme.subtleText}
//             secureTextEntry
//             style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
//           />
//           <View style={styles.pillRow}>
//             <Pill theme={theme} text={`${CREATE_ACCOUNT_COST} Coinz`} tone="gold" />
//           </View>
//           <View style={styles.actionRow}>
//             <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doCreateAccount} loading={createSubmitting} disabled={coinz < CREATE_ACCOUNT_COST} />
//           </View>
//         </View>
//       </ModalShell>

//       <ModalShell visible={modal.created} onClose={() => setModal((s) => ({ ...s, created: false }))} title={t("storeScreen.createdAccount.title")} theme={theme}>
//         <View style={styles.modalBody}>
//           <View style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
//             <Text style={[styles.innerSub, { color: theme.mutedText }]}>Username</Text>
//             <Text style={[styles.innerTitle, { color: theme.text }]}>{createdCreds?.username || "-"}</Text>
//             <Text style={[styles.innerSub, { color: theme.mutedText, marginTop: 10 }]}>Password</Text>
//             <Text style={[styles.innerTitle, { color: theme.text }]}>{createdCreds?.password || "-"}</Text>
//           </View>
//           <View style={styles.actionRow}>
//             <ActionButton theme={theme} title={t("storeScreen.createdAccount.copy")} onPress={copyCreatedCreds} loading={copyLoading} />
//           </View>
//         </View>
//       </ModalShell>

//       <ModalShell visible={modal.category} onClose={() => setModal((s) => ({ ...s, category: false }))} title={activeCategory ? prettyType(activeCategory, t) : t("storeScreen.sections.store")} theme={theme}>
//         <View style={styles.modalBody}>
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder={t("storeScreen.search.store")}
//             placeholderTextColor={theme.subtleText}
//             style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
//           />
//           {filteredCategoryItems.map((item: any) => {
//             const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
//             const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;
//             const imageUrl = getItemImageUrl(item);
//             const isActiveNow =
//               (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
//               (item.type === "avatarGif" && String(active.avatarGif || "") === String(item.key)) ||
//               (item.type === "usernameColor" && String(active.usernameColor || "") === String(item.key)) ||
//               (item.type === "messageTextColor" && String(active.messageTextColor || "") === String(item.key)) ||
//               (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
//               (item.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === String(item.key));
//             return (
//               <View key={item._id} style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
//                 <View style={styles.storeRow}>
//                   <View style={[styles.thumb, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
//                 {item.type === "usernameColor" || item.type === "messageTextColor" ? (
//   <View style={[styles.colorThumb, { backgroundColor: String(item?.meta?.previewColor || item?.key || "#ccc") }]}>
//     <Text style={styles.colorThumbText}>Aa</Text>
//   </View>
// ) : item?.meta?.lottieUrl ? (
//   <View style={styles.lottieThumbWrap}>
//     <LottieBadge url={item.meta.lottieUrl} size={56} />
//   </View>
// ) : imageUrl ? (
//   <Image source={{ uri: imageUrl }} style={styles.thumbImg} resizeMode="cover" />
// ) : (
//   <Text style={{ color: theme.subtleText }}>IMG</Text>
// )}
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={[styles.innerTitle, { color: theme.text }]}>{item.name || item.key}</Text>
//                     <Text style={[styles.innerSub, { color: theme.mutedText }]}>{item.description || item.key}</Text>
//                     <View style={styles.pillRow}>
//                       <Pill theme={theme} text={`${formatCoinz(item.priceCoinz)} Coinz`} tone="gold" />
//                       {isActiveNow ? <Pill theme={theme} text={t("storeScreen.common.active")} tone="good" /> : null}
//                       {expired ? <Pill theme={theme} text={t("storeScreen.common.expired")} tone="danger" /> : null}
//                     </View>
//                   </View>
//                 </View>
//                 <View style={styles.actionRow}>
//                   <ActionButton theme={theme} title={t("storeScreen.common.buy")} onPress={() => openBuy(item._id)} />
//                   <ActionButton
//                     theme={theme}
//                     secondary
//                     title={isActiveNow ? t("storeScreen.common.remove") : t("storeScreen.common.activate")}
//                     onPress={() => doActivate(item.type, String(item.key), isActiveNow ? "remove" : "set")}
//                     disabled={expired}
//                     loading={activateKeyLoading === `${String(item.type)}:${String(item.key)}:${isActiveNow ? "remove" : "set"}`}
//                   />
//                 </View>
//               </View>
//             );
//           })}
//           {!filteredCategoryItems.length ? (
//             <View style={styles.emptyWrap}>
//               <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("storeScreen.empty.noItems")}</Text>
//               <Text style={[styles.emptySub, { color: theme.subtleText }]}>{t("storeScreen.empty.tryKeyword")}</Text>
//             </View>
//           ) : null}
//         </View>
//       </ModalShell>

//       <ModalShell
//         visible={modal.inventory}
//         onClose={() => setModal((s) => ({ ...s, inventory: false }))}
//         title={t("storeScreen.inventory.title")}
//         theme={theme}
//       >
//         <View style={styles.modalBody}>
//           {groupedOwned.map((group) => (
//             <View
//               key={group.type}
//               style={[
//                 styles.innerCard,
//                 {
//                   backgroundColor: theme.surface2,
//                   borderColor: theme.border,
//                 },
//               ]}
//             >
//               <View style={styles.inventoryGroupHeader}>
//                 <Text style={[styles.innerTitle, { color: theme.text }]}>
//                   {prettyType(group.type, t)}
//                 </Text>
//                 <Pill
//                   theme={theme}
//                   text={`${group.rows.length}`}
//                   tone="info"
//                 />
//               </View>

//               {group.rows.map((row: any) => {
//                 const item = row.item;
//                 const itemKey = String(row.itemKey || "");
//                 const imageUrl = getItemImageUrl(item);
//                 const expired = isExpired(row.expiresAt);
//                 const activeNow = isItemActive(group.type, itemKey);
//                 const mode = getInventoryActionMode(group.type, itemKey);
//                 const loadingKey = `${String(group.type)}:${String(itemKey)}:${String(mode)}`;

//                 return (
//                   <View
//                     key={row._id}
//                     style={[
//                       styles.inventoryCard,
//                       {
//                         backgroundColor: theme.surface,
//                         borderColor: theme.border,
//                       },
//                     ]}
//                   >
//                <View style={styles.storeRow}>
//   <View
//     style={[
//       styles.thumb,
//       {
//         borderColor: theme.border,
//         backgroundColor: theme.surface2,
//       },
//     ]}
//   >
//     {group.type === "usernameColor" || group.type === "messageTextColor" ? (
//       <View
//         style={[
//           styles.colorThumb,
//           {
//             backgroundColor: String(item?.meta?.previewColor || "#ccc"),
//           },
//         ]}
//       >
//         <Text style={styles.colorThumbText}>Aa</Text>
//       </View>
//     ) : item?.meta?.lottieUrl ? (
//   <View style={styles.lottieThumbWrap}>
//     <LottieBadge url={item.meta.lottieUrl} size={56} />
//   </View>
// ) : imageUrl ? (
//   <Image source={{ uri: imageUrl }} style={styles.thumbImg} resizeMode="cover" />
// ) : (
//       <Text style={{ color: theme.subtleText }}>IMG</Text>
//     )}
//   </View>

//   <View style={{ flex: 1 }}>
//     <Text style={[styles.innerTitle, { color: theme.text }]}>
//       {item?.name || prettyType(group.type, t)}
//     </Text>

//     {!!item?.description ? (
//       <Text
//         numberOfLines={2}
//         style={[styles.innerSub, { color: theme.mutedText }]}
//       >
//         {item.description}
//       </Text>
//     ) : null}

//     <View style={styles.pillRow}>
//       <Pill
//         theme={theme}
//         text={activeNow ? t("storeScreen.common.active") : t("storeScreen.common.owned")}
//         tone={activeNow ? "good" : "neutral"}
//       />

//       <Pill
//         theme={theme}
//         text={row?.expiresAt ? formatDate(row.expiresAt) : t("storeScreen.common.permanent")}
//         tone={row?.expiresAt ? "info" : "neutral"}
//       />

//       {expired ? (
//         <Pill
//           theme={theme}
//           text={t("storeScreen.common.expired")}
//           tone="danger"
//         />
//       ) : null}
//     </View>
//   </View>
// </View>

//                     <View style={styles.actionRow}>
//                       <ActionButton
//                         theme={theme}
//                         title={getInventoryActionLabel(group.type, itemKey)}
//                         onPress={() => doActivate(group.type, itemKey, mode)}
//                         disabled={expired}
//                         loading={activateKeyLoading === loadingKey}
//                       />
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           ))}

//           {!groupedOwned.length ? (
//             <View style={styles.emptyWrap}>
//               <Text style={[styles.emptyTitle, { color: theme.text }]}>
//                 {t("storeScreen.inventory.noItemsTitle")}
//               </Text>
//               <Text style={[styles.emptySub, { color: theme.subtleText }]}>
//                 {t("storeScreen.inventory.noItemsSub")}
//               </Text>
//             </View>
//           ) : null}
//         </View>
//       </ModalShell>

//       <ModalShell visible={modal.buy} onClose={() => setModal((s) => ({ ...s, buy: false }))} title={t("storeScreen.purchase.title")} theme={theme}>
//         <View style={styles.modalBody}>
//           {selectedItem ? (
//             <>
//               <Text style={[styles.innerTitle, { color: theme.text }]}>{selectedItem.name || selectedItem.key}</Text>
//               <Text style={[styles.innerSub, { color: theme.mutedText }]}>{prettyType(selectedItem.type, t)} • {selectedItem.key}</Text>
//               <View style={styles.pillRow}>
//                 <Pill theme={theme} text={`${formatCoinz(selectedItem.priceCoinz)} Coinz`} tone="gold" />
//                 <Pill
//                   theme={theme}
//                   text={Number(selectedItem.durationDays || 0) > 0 ? `${selectedItem.durationDays} ${t("storeScreen.common.daysSuffix")}` : t("storeScreen.common.permanent")}
//                   tone="neutral"
//                 />
//               </View>
//               {(selectedItem.isStackable || selectedItem.isConsumable) ? (
//                 <TextInput
//                   value={String(buyQty)}
//                   onChangeText={(txt) => setBuyQty(Math.max(1, Number(txt.replace(/[^\d]/g, "") || "1")))}
//                   keyboardType="number-pad"
//                   style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
//                 />
//               ) : null}
//               <View style={styles.actionRow}>
//                 <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doBuy} loading={buySubmitting || purchasing} />
//               </View>
//             </>
//           ) : <ActivityIndicator />}
//         </View>
//       </ModalShell>

// <BadgeLottiePickerModal
//   visible={modal.badgePicker}
//   onClose={() => setModal((s) => ({ ...s, badgePicker: false }))}
//   items={badgePickerType === "lottie" ? lottieBadgeItems : imageBadgeItems}
//   selectedKey=""
//   onConfirm={doBuyBadgeFromPicker}
//   theme={theme}
//   isRTL={isRTL}
//   t={t}
//   loading={badgePickerSubmitting}
//   coinz={coinz}
//   pickerTitle={badgePickerType === "lottie" ? "Lottie Badges" : "Image Badges"}
// />

//       {(buyingCoinz || purchasing || activating || myLoading || itemsLoading || loadingCustomEmojiBadge) ? (
//         <View style={[styles.overlayLoader, { backgroundColor: theme.overlay }]}> 
//           <View style={[styles.overlayLoaderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
//             <ActivityIndicator />
//             <Text style={[styles.overlayLoaderText, { color: theme.text }]}>{t("storeScreen.common.pleaseWait")}</Text>
//           </View>
//         </View>
//       ) : null}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1 },
//   listContent: { padding: 14, paddingBottom: 24 },
//   hero: {
//     borderWidth: 1,
//     borderRadius: 22,
//     padding: 16,
//   },
//   heroLabel: {
//     fontSize: 12,
//     fontWeight: "800",
//     fontFamily: Fonts?.rounded,
//   },
//   heroBalance: {
//     fontSize: 28,
//     fontWeight: "900",
//     marginTop: 6,
//     fontFamily: Fonts?.rounded,
//   },
//   heroSub: {
//     fontSize: 12,
//     marginTop: 6,
//     lineHeight: 17,
//     fontFamily: Fonts?.sans,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 4,
//   },
//   sectionHeaderTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },

//   inventoryGroupHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   inventoryCard: {
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 12,
//     marginTop: 10,
//   },
//   sectionCard: {
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   sectionCardTitle: {
//     fontSize: 15,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   sectionCardSub: {
//     fontSize: 12,
//     marginTop: 4,
//     lineHeight: 16,
//     fontFamily: Fonts?.sans,
//   },
//   bigEmoji: {
//     fontSize: 28,
//     lineHeight: 32,
//   },
//   gridRow: {
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   categoryCard: {
//     width: "48%",
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 14,
//     minHeight: 118,
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   categoryTitle: {
//     fontSize: 14,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   categorySub: {
//     fontSize: 12,
//     marginTop: 6,
//     lineHeight: 16,
//     fontFamily: Fonts?.sans,
//   },
// modalRoot: {
//   flex: 1,
//   justifyContent: "center",
//   padding: 14,
// },
// modalBackdrop: {
//   ...StyleSheet.absoluteFillObject,
//   backgroundColor: "rgba(0,0,0,0.45)",
// },
// modalCard: {
//   maxHeight: "84%",
//   borderRadius: 22,
//   borderWidth: 1,
//   padding: 14,
// },
// modalScrollContent: {
//   paddingBottom: 10,
//   flexGrow: 1,
// },

//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   modalTitle: {
//     fontSize: 17,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   closeBtn: {
//     width: 34,
//     height: 34,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   closeBtnText: {
//     fontSize: 18,
//     fontWeight: "900",
//   },
//   modalBody: {
//     gap: 12,
//     paddingBottom: 8,
//   },
//   innerCard: {
//     borderWidth: 1,
//     borderRadius: 18,
//     padding: 12,
//   },
//   innerTitle: {
//     fontSize: 14,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   innerSub: {
//     fontSize: 12,
//     marginTop: 4,
//     lineHeight: 16,
//     fontFamily: Fonts?.sans,
//   },
//   pillRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginTop: 10,
//   },
//   actionRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 12,
//   },
//   actionBtn: {
//     flex: 1,
//     minHeight: 46,
//     borderRadius: 14,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   actionBtnText: {
//     fontSize: 14,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   input: {
//     minHeight: 48,
//     borderRadius: 14,
//     borderWidth: 1,
//     paddingHorizontal: 12,
//     fontWeight: "800",
//     fontFamily: Fonts?.sans,
//   },
//   previewBox: {
//     minHeight: 90,
//     borderRadius: 18,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   previewEmoji: {
//     fontSize: 42,
//     lineHeight: 48,
//   },
//   storeRow: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   thumb: {
//     width: 62,
//     height: 62,
//     borderRadius: 18,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   thumbImg: {
//     width: "100%",
//     height: "100%",
//   },
//   colorThumb: {
//     width: "100%",
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   colorThumbText: {
//     color: "#fff",
//     fontWeight: "900",
//     fontSize: 12,
//   },
//   inventoryRow: {
//     flexDirection: "row",
//     gap: 12,
//     alignItems: "center",
//     paddingTop: 12,
//     marginTop: 12,
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   inventoryThumb: {
//     width: 46,
//     height: 46,
//     borderRadius: 14,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   inventoryName: {
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   inventoryMeta: {
//     fontSize: 12,
//     marginTop: 4,
//     fontFamily: Fonts?.sans,
//   },
//   emptyWrap: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 22,
//   },
//   emptyTitle: {
//     fontSize: 15,
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
//   emptySub: {
//     fontSize: 12,
//     marginTop: 6,
//     textAlign: "center",
//     fontFamily: Fonts?.sans,
//   },
//   pill: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 999,
//     borderWidth: 1,
//   },
//   lottieThumbWrap: {
//   width: "100%",
//   height: "100%",
//   alignItems: "center",
//   justifyContent: "center",
// },
//   pillText: {
//     fontSize: 12,
//     fontWeight: "800",
//     fontFamily: Fonts?.rounded,
//   },
//   overlayLoader: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16,
//   },
//   overlayLoaderCard: {
//     minWidth: 180,
//     borderRadius: 18,
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     alignItems: "center",
//     gap: 10,
//   },
//   overlayLoaderText: {
//     fontWeight: "900",
//     fontFamily: Fonts?.rounded,
//   },
// });



import LottieBadge from "@/components/LottieBadge";
import BadgeLottiePickerModal from "@/components/store/BadgeLottiePickerModal";
import { AppTheme, Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  activateCustomEmojiBadge,
  activateStoreItem,
  buyCustomEmojiBadge,
  clearStoreError,
  getMyCustomEmojiBadge,
  getMyInventory,
  listStoreItems,
  purchaseStoreItems,
  selectMyCustomEmojiBadge,
  selectMyStore,
  selectMyStoreLoading,
  selectStoreActivating,
  selectStoreActivatingCustomEmojiBadge,
  selectStoreBuyingCoinz,
  selectStoreBuyingCustomEmojiBadge,
  selectStoreError,
  selectStoreItems,
  selectStoreItemsLoading,
  selectStoreLoadingCustomEmojiBadge,
  selectStorePurchasing,
} from "@/redux/slices/storeControl.slice";
import { createPaidAccount } from "@/redux/slices/userSlice";
import api from "@/services/api";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StoreType =
  | "avatarFrame"
  | "avatarGif"
  | "usernameColor"
  | "messageTextColor"
  | "badge"
  | "messageEffect"
  | "profileEntryAnimation"
  | "verification"
  | "gift";

type SectionKey =
  | "wallet"
  | "customEmoji"
  | "badgePicker"
  | "createAccount"
  | "storeCategory"
  | "inventory";

type CategoryCard = {
  key: StoreType;
  title: string;
  subtitle: string;
};

type ModalState = {
  wallet: boolean;
  customEmoji: boolean;
  badgePicker: boolean;
  createAccount: boolean;
  category: boolean;
  inventory: boolean;
  buy: boolean;
  created: boolean;
};

type CoinzPack = {
  packageId: "p1" | "p2" | "p3";
  title: string;
  subtitle?: string;
  priceEGP: number;
  coinz: number;
};

function formatCoinz(n: number) {
  return Math.round(Number.isFinite(n) ? n : 0).toLocaleString();
}

function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString();
}

function getItemImageUrl(item: any): string {
  const meta = item?.meta || {};

  const imageUrl =
    String(item?.iconUrl || "").trim() ||
    String(item?.coverUrl || "").trim() ||
    String(item?.previewUrl || "").trim() ||
    String(meta?.iconUrl || "").trim() ||
    String(meta?.coverUrl || "").trim() ||
    String(meta?.previewUrl || "").trim();

  return imageUrl;
}

function prettyType(t: string, tr: (key: string) => string) {
  switch (t) {
    case "avatarFrame":
      return tr("storeScreen.prettyType.avatarFrame");
    case "avatarGif":
      return tr("storeScreen.prettyType.avatarGif");
    case "usernameColor":
      return tr("storeScreen.prettyType.usernameColor");
    case "messageTextColor":
      return tr("storeScreen.prettyType.messageTextColor");
    case "badge":
      return tr("storeScreen.prettyType.badge");
    case "messageEffect":
      return tr("storeScreen.prettyType.messageEffect");
    case "gift":
      return tr("storeScreen.prettyType.gift");
    case "profileEntryAnimation":
      return tr("storeScreen.prettyType.profileEntryAnimation");
    case "verification":
      return tr("storeScreen.prettyType.verification");
    default:
      return t || tr("storeScreen.prettyType.item");
  }
}

function pillTone(theme: AppTheme, tone: "gold" | "good" | "info" | "danger" | "neutral") {
  switch (tone) {
    case "gold":
      return { bg: theme.pillGoldBg, fg: theme.pillGoldFg };
    case "good":
      return { bg: `${theme.success}22`, fg: theme.success };
    case "info":
      return { bg: `${theme.info}22`, fg: theme.info };
    case "danger":
      return { bg: `${theme.danger}22`, fg: theme.danger };
    default:
      return { bg: theme.surface2, fg: theme.mutedText };
  }
}

function Pill({ theme, text, tone }: { theme: AppTheme; text: string; tone: "gold" | "good" | "info" | "danger" | "neutral" }) {
  const c = pillTone(theme, tone);
  return (
    <View style={[styles.pill, { backgroundColor: c.bg, borderColor: theme.border }]}> 
      <Text style={[styles.pillText, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

function ModalShell({
  visible,
  onClose,
  title,
  theme,
  children,
  scrollable = true,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  theme: AppTheme;
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: theme.subtleText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.modalScrollContent}>{children}</View>
          )}
        </View>
      </View>
    </Modal>
  );
}
function SectionCard({
  theme,
  title,
  subtitle,
  right,
  onPress,
}: {
  theme: AppTheme;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionCardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.sectionCardSub, { color: theme.mutedText }]}>{subtitle}</Text>
      </View>
      {right}
    </TouchableOpacity>
  );
}

function ActionButton({
  theme,
  title,
  onPress,
  secondary,
  disabled,
  loading,
}: {
  theme: AppTheme;
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  const bg = secondary ? theme.surface2 : theme.primary;
  const fg = secondary ? theme.text : theme.primaryText;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.actionBtn,
        {
          backgroundColor: bg,
          borderColor: secondary ? theme.border : "transparent",
          opacity: disabled || loading ? 0.6 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : <Text style={[styles.actionBtnText, { color: fg }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

type StoreVisualTone =
  | "gold"
  | "violet"
  | "blue"
  | "green"
  | "rose"
  | "cyan"
  | "orange"
  | "neutral";

function getStoreToneColors(theme: AppTheme, tone: StoreVisualTone) {
  const map: Record<StoreVisualTone, { bg: string; soft: string; fg: string }> = {
    gold: { bg: "#F59E0B", soft: "#F59E0B22", fg: "#F59E0B" },
    violet: { bg: "#8B5CF6", soft: "#8B5CF622", fg: "#8B5CF6" },
    blue: { bg: "#3B82F6", soft: "#3B82F622", fg: "#3B82F6" },
    green: { bg: "#10B981", soft: "#10B98122", fg: "#10B981" },
    rose: { bg: "#F43F5E", soft: "#F43F5E22", fg: "#F43F5E" },
    cyan: { bg: "#06B6D4", soft: "#06B6D422", fg: "#06B6D4" },
    orange: { bg: "#F97316", soft: "#F9731622", fg: "#F97316" },
    neutral: { bg: theme.primary, soft: theme.surface2, fg: theme.text },
  };

  return map[tone] || map.neutral;
}

function getCategoryVisual(type: StoreType): {
  icon: keyof typeof Ionicons.glyphMap;
  tone: StoreVisualTone;
} {
  switch (type) {
    case "avatarFrame":
      return { icon: "sparkles", tone: "violet" };
    case "avatarGif":
      return { icon: "image", tone: "cyan" };
    case "usernameColor":
      return { icon: "color-palette", tone: "blue" };
    case "messageTextColor":
      return { icon: "chatbubble-ellipses", tone: "green" };
    case "badge":
      return { icon: "ribbon", tone: "gold" };
    case "messageEffect":
      return { icon: "flash", tone: "orange" };
    case "profileEntryAnimation":
      return { icon: "planet", tone: "rose" };
    case "verification":
      return { icon: "shield-checkmark", tone: "blue" };
    case "gift":
      return { icon: "gift", tone: "rose" };
    default:
      return { icon: "bag", tone: "neutral" };
  }
}

function StoreHero({
  theme,
  coinz,
  coinzText,
  subtitle,
  onWalletPress,
}: {
  theme: AppTheme;
  coinz: number;
  coinzText: string;
  subtitle: string;
  onWalletPress: () => void;
}) {
  return (
    <View style={styles.modernHeroWrap}>
      <View style={[styles.modernHeroGlow, { backgroundColor: `${theme.primary}24` }]} />

      <View
        style={[
          styles.modernHero,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.modernHeroTop}>
          <View style={[styles.heroIconBox, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="storefront" size={24} color={theme.primary} />
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onWalletPress}
            style={[styles.walletButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add" size={16} color={theme.primaryText} />
            <Text style={[styles.walletButtonText, { color: theme.primaryText }]}>شحن</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.modernHeroTitle, { color: theme.text }]}>Bimo Store</Text>

        <Text style={[styles.modernHeroSub, { color: theme.mutedText }]}>{subtitle}</Text>

        <View style={styles.coinBalanceRow}>
          <View style={[styles.coinBadge, { backgroundColor: theme.pillGoldBg }]}> 
            <Ionicons name="diamond" size={18} color={theme.pillGoldFg} />
            <Text style={[styles.coinBadgeText, { color: theme.pillGoldFg }]}> 
              {formatCoinz(coinz)} {coinzText}
            </Text>
          </View>

          <View style={[styles.heroMiniBadge, { backgroundColor: theme.surface2 }]}> 
            <Text style={[styles.heroMiniBadgeText, { color: theme.mutedText }]}>Premium Items</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function QuickStoreAction({
  theme,
  title,
  subtitle,
  icon,
  tone,
  right,
  onPress,
}: {
  theme: AppTheme;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: StoreVisualTone;
  right?: React.ReactNode;
  onPress: () => void;
}) {
  const c = getStoreToneColors(theme, tone);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: c.soft }]}> 
        <Ionicons name={icon} size={22} color={c.fg} />
      </View>

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[styles.quickTitle, { color: theme.text }]}> 
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.quickSub, { color: theme.mutedText }]}> 
          {subtitle}
        </Text>
      </View>

      {right || <Ionicons name="chevron-forward" size={18} color={theme.subtleText} />}
    </TouchableOpacity>
  );
}

function ModernCategoryCard({
  theme,
  item,
  onPress,
  label,
}: {
  theme: AppTheme;
  item: CategoryCard;
  onPress: () => void;
  label: string;
}) {
  const visual = getCategoryVisual(item.key);
  const c = getStoreToneColors(theme, visual.tone);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.modernCategoryCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.categoryDecorWrap}>
        <View style={[styles.categoryDecor, { backgroundColor: c.soft }]} />
      </View>

      <View style={[styles.categoryIconBox, { backgroundColor: c.soft }]}> 
        <Ionicons name={visual.icon} size={24} color={c.fg} />
      </View>

      <Text numberOfLines={1} style={[styles.modernCategoryTitle, { color: theme.text }]}> 
        {item.title}
      </Text>

      <Text numberOfLines={2} style={[styles.modernCategorySub, { color: theme.mutedText }]}> 
        {item.subtitle}
      </Text>

      <View style={[styles.categoryFooter, { borderColor: theme.border }]}> 
        <Text style={[styles.categoryFooterText, { color: c.fg }]}>{label}</Text>
        <Ionicons name="arrow-forward" size={14} color={c.fg} />
      </View>
    </TouchableOpacity>
  );
}

export default function StoreScreen() {
  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { t, isRTL } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const items = useAppSelector(selectStoreItems);
  const itemsLoading = useAppSelector(selectStoreItemsLoading);
  const my = useAppSelector(selectMyStore);
  const myLoading = useAppSelector(selectMyStoreLoading);
  const customEmojiBadge = useAppSelector(selectMyCustomEmojiBadge);
  const error = useAppSelector(selectStoreError);
  const purchasing = useAppSelector(selectStorePurchasing);
  const activating = useAppSelector(selectStoreActivating);
  const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
  const buyingCustomEmojiBadge = useAppSelector(selectStoreBuyingCustomEmojiBadge);
  const activatingCustomEmojiBadge = useAppSelector(selectStoreActivatingCustomEmojiBadge);
  const loadingCustomEmojiBadge = useAppSelector(selectStoreLoadingCustomEmojiBadge);
const [badgePickerType, setBadgePickerType] = useState<"lottie" | "image">("lottie");
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StoreType | null>(null);
  const [search, setSearch] = useState("");
  const [buyItemId, setBuyItemId] = useState("");
  const [buyQty, setBuyQty] = useState(1);
  const [buySetActive, setBuySetActive] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [customEmojiSetActive, setCustomEmojiSetActive] = useState(true);
  const [paymobLoadingPackId, setPaymobLoadingPackId] = useState<string | null>(null);
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [activateKeyLoading, setActivateKeyLoading] = useState<string | null>(null);
  const [badgePickerSubmitting, setBadgePickerSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    wallet: false,
    customEmoji: false,
    badgePicker: false,
    createAccount: false,
    category: false,
    inventory: false,
    buy: false,
    created: false,
  });

  const coinz = my?.coinzBalance ?? 0;
  const CREATE_ACCOUNT_COST = 30000;
  const CUSTOM_EMOJI_BADGE_COST = 2500;
  const active = my?.activeCustomization || {
    avatarFrame: "",
    avatarGif: "",
    usernameColor: "",
    messageTextColor: "",
    messageEffect: "",
    profileEntryAnimation: "",
    badges: [],
    verificationType: "none",
  };

  const coinzPacks: CoinzPack[] = useMemo(
    () => [
      { packageId: "p1", title: t("storeScreen.coinzPacks.p1.title"), subtitle: t("storeScreen.coinzPacks.p1.subtitle"), priceEGP: 10, coinz: 100 },
      { packageId: "p2", title: t("storeScreen.coinzPacks.p2.title"), subtitle: t("storeScreen.coinzPacks.p2.subtitle"), priceEGP: 25, coinz: 260 },
      { packageId: "p3", title: t("storeScreen.coinzPacks.p3.title"), subtitle: t("storeScreen.coinzPacks.p3.subtitle"), priceEGP: 50, coinz: 550 },
    ],
    [t]
  );

  const categoryCards: CategoryCard[] = useMemo(
    () => [
      { key: "avatarFrame", title: t("storeScreen.tabs.avatarFrame"), subtitle: t("storeScreen.prettyType.avatarFrame") },
      // { key: "avatarGif", title: t("storeScreen.tabs.avatarGif"), subtitle: t("storeScreen.prettyType.avatarGif") },
      { key: "usernameColor", title: t("storeScreen.tabs.usernameColor"), subtitle: t("storeScreen.prettyType.usernameColor") },
      { key: "messageTextColor", title: t("storeScreen.tabs.messageTextColor"), subtitle: t("storeScreen.prettyType.messageTextColor") },
      { key: "badge", title: t("storeScreen.tabs.badge"), subtitle: t("storeScreen.prettyType.badge") },
      { key: "messageEffect", title: t("storeScreen.tabs.messageEffect"), subtitle: t("storeScreen.prettyType.messageEffect") },
      { key: "profileEntryAnimation", title: t("storeScreen.tabs.profileEntryAnimation"), subtitle: t("storeScreen.prettyType.profileEntryAnimation") },
      { key: "verification", title: t("storeScreen.tabs.verification"), subtitle: t("storeScreen.prettyType.verification") },
      { key: "gift", title: t("storeScreen.tabs.gift"), subtitle: t("storeScreen.prettyType.gift") },
    ],
    [t]
  );

  // const badgeItems = useMemo(() => (items || []).filter((x: any) => x.type === "badge"), [items]);
const badgeItems = useMemo(() => {
  return (items || []).filter((x: any) => x.type === "badge");
}, [items]);

const lottieBadgeItems = useMemo(() => {
  const list = (badgeItems || []).filter((x: any) => {
    const meta = x?.meta || {};
    return !!String(meta?.lottieUrl || "").trim();
  });



  return list;
}, [badgeItems]);

const imageBadgeItems = useMemo(() => {
  const list = (badgeItems || []).filter((x: any) => {
    const meta = x?.meta || {};
    const hasLottie = !!String(meta?.lottieUrl || "").trim();

    const hasImage =
      !!String(x?.iconUrl || "").trim() ||
      !!String(x?.previewUrl || "").trim() ||
      !!String(meta?.iconUrl || "").trim() ||
      !!String(meta?.previewUrl || "").trim();

    return !hasLottie && hasImage;
  });



  return list;
}, [badgeItems]);

  const ownedByTypeKey = useMemo(() => {
    const inv = my?.inventory || [];
    const map = new Map<string, any>();
    for (const it of inv) map.set(`${String(it?.itemType || "")}:${String(it?.itemKey || "")}`, it);
    return map;
  }, [my?.inventory]);

  const filteredCategoryItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || []).filter((it: any) => {
      if (!activeCategory) return false;
      if (String(it?.type || "") !== activeCategory) return false;
      const hay = `${it?.name || ""} ${it?.key || ""} ${it?.description || ""}`.toLowerCase();
      return !q || hay.includes(q);
    });
  }, [items, activeCategory, search]);

  const groupedOwned = useMemo(() => {
    const inv = my?.inventory || [];
    const byType: Record<string, any[]> = {};
    for (const row of inv) {
      const t = String(row?.itemType || "");
      if (!byType[t]) byType[t] = [];
      byType[t].push(row);
    }
    return Object.keys(byType).map((type) => ({ type, rows: byType[type] }));
  }, [my?.inventory]);

  const selectedItem = useMemo(() => items.find((x: any) => String(x._id) === String(buyItemId)) || null, [items, buyItemId]);
  const customBadgeExpired = useMemo(() => !!customEmojiBadge?.expiresAt && isExpired(customEmojiBadge.expiresAt), [customEmojiBadge?.expiresAt]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      dispatch(listStoreItems({ active: true }) as any),
      dispatch(getMyInventory() as any),
      dispatch(getMyCustomEmojiBadge() as any),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getMyInventory() as any);
      dispatch(getMyCustomEmojiBadge() as any);
    }, [dispatch])
  );

  useEffect(() => {
    if (!error) return;
    Alert.alert(t("storeScreen.alerts.storeTitle"), error, [
      { text: t("storeScreen.common.ok"), onPress: () => dispatch(clearStoreError()) },
    ]);
  }, [error, dispatch, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  const openCategoryModal = useCallback((key: StoreType) => {
    setActiveCategory(key);
    setSearch("");
    setModal((s) => ({ ...s, category: true }));
  }, []);

  const openBuy = useCallback((itemId: string) => {
    setBuyItemId(itemId);
    setBuyQty(1);
    setBuySetActive(true);
    setModal((s) => ({ ...s, buy: true }));
  }, []);

  const doBuy = useCallback(async () => {
    if (!selectedItem || buySubmitting) return;
    setBuySubmitting(true);
    try {
      const qty = Math.max(1, Number(buyQty || 1));
      const res = await dispatch(
        purchaseStoreItems({ items: [{ itemId: selectedItem._id, quantity: qty }], setActive: buySetActive }) as any
      );
      if (purchaseStoreItems.fulfilled.match(res)) {
        setModal((s) => ({ ...s, buy: false }));
        await dispatch(getMyInventory() as any);
      }
    } finally {
      setBuySubmitting(false);
    }
  }, [selectedItem, buySubmitting, buyQty, buySetActive, dispatch]);

  const doActivate = useCallback(
    async (type: any, key: string, mode?: "set" | "add" | "remove") => {
      const loadingKey = `${String(type)}:${String(key)}:${String(mode || "set")}`;
      if (activateKeyLoading) return;
      setActivateKeyLoading(loadingKey);
      try {
        await dispatch(activateStoreItem({ type, key, mode } as any) as any);
        await dispatch(getMyInventory() as any);
      } finally {
        setActivateKeyLoading(null);
      }
    },
    [dispatch, activateKeyLoading]
  );

  const startPaymobCoinz = useCallback(
    async (packageId: "p1" | "p2" | "p3") => {
      if (paymobLoadingPackId) return;
      setPaymobLoadingPackId(packageId);
      try {
        const { data } = await api.post("/payments/paymob/create", { packageId });
        const paymentUrl = data?.paymentUrl;
        if (!paymentUrl) {
          Alert.alert(t("storeScreen.coinz.buyTitle"), t("storeScreen.coinz.paymentUrlMissing"));
          return;
        }
        router.push({ pathname: "/paymob-checkout", params: { url: paymentUrl } });
      } catch (e: any) {
        Alert.alert(t("storeScreen.coinz.buyTitle"), e?.response?.data?.message || t("storeScreen.coinz.paymentCreateFailed"));
      } finally {
        setPaymobLoadingPackId(null);
      }
    },
    [router, paymobLoadingPackId, t]
  );
const doCreateAccount = useCallback(async () => {
  if (createSubmitting) return;

  const username = newUsername.trim();
  const password = newPassword.trim();

  if (!username) {
    Alert.alert(
      t("storeScreen.createAccount.title"),
      t("storeScreen.createAccount.usernameRequired")
    );
    return;
  }

  if (!password || password.length < 6) {
    Alert.alert(
      t("storeScreen.createAccount.title"),
      t("storeScreen.createAccount.passwordMin")
    );
    return;
  }

  if (coinz < CREATE_ACCOUNT_COST) {
    Alert.alert(
      t("storeScreen.createAccount.title"),
      t("storeScreen.createAccount.insufficientBalance")
    );
    return;
  }

  setCreateSubmitting(true);

  try {
    console.log("🟡 [doCreateAccount] before createPaidAccount", {
      username,
      passwordLength: password.length,
      cost: CREATE_ACCOUNT_COST,
      currentCoinz: coinz,
    });

    const result = await dispatch(
      createPaidAccount({ username, password }) as any
    );

    console.log("🟣 [doCreateAccount] createPaidAccount result", {
      type: result?.type,
      payload: result?.payload,
      error: result?.error,
    });

    if (!createPaidAccount.fulfilled.match(result)) {
      const message =
        typeof result?.payload === "string"
          ? result.payload
          : result?.error?.message || "فشل إنشاء الحساب";

      Alert.alert(t("storeScreen.createAccount.title"), message);
      return;
    }

    await dispatch(getMyInventory() as any);

    setCreatedCreds({
      username: result.payload?.credentials?.username || username,
      password: result.payload?.credentials?.password || password,
    });

    setNewUsername("");
    setNewPassword("");

    setModal((s) => ({
      ...s,
      createAccount: false,
      created: true,
    }));
  } finally {
    setCreateSubmitting(false);
  }
}, [
  createSubmitting,
  newUsername,
  newPassword,
  coinz,
  dispatch,
  t,
]);
  // const doCreateAccount = useCallback(async () => {
  //   if (createSubmitting) return;
  //   const username = newUsername.trim();
  //   const password = newPassword.trim();
  //   if (!username) {
  //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.usernameRequired"));
  //     return;
  //   }
  //   if (!password || password.length < 6) {
  //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.passwordMin"));
  //     return;
  //   }
  //   if (coinz < CREATE_ACCOUNT_COST) {
  //     Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.insufficientBalance"));
  //     return;
  //   }
  //   setCreateSubmitting(true);
  //   try {
  //     const debitRes = await dispatch(debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any);
  //     if (!debitMyCoinz.fulfilled.match(debitRes)) return;
  //     const regRes = await dispatch(registerNoLogin({ username, password }) as any);
  //     if (!registerNoLogin.fulfilled.match(regRes)) return;
  //     await dispatch(getMyInventory() as any);
  //     setModal((s) => ({ ...s, createAccount: false, created: true }));
  //     setCreatedCreds({ username, password });
  //   } finally {
  //     setCreateSubmitting(false);
  //   }
  // }, [createSubmitting, newUsername, newPassword, coinz, dispatch, t]);

  const copyCreatedCreds = useCallback(async () => {
    if (!createdCreds || copyLoading) return;
    setCopyLoading(true);
    try {
      await Clipboard.setStringAsync(`Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`);
      Alert.alert(t("storeScreen.alerts.copiedTitle"), t("storeScreen.alerts.credentialsCopied"));
    } finally {
      setCopyLoading(false);
    }
  }, [createdCreds, copyLoading, t]);

  const doBuyCustomEmojiBadge = useCallback(async () => {
    const emoji = customEmojiInput.trim();
    if (!emoji) {
      Alert.alert(t("storeScreen.customEmoji.title"), t("storeScreen.customEmoji.enterEmoji"));
      return;
    }
    const res = await dispatch(buyCustomEmojiBadge({ emoji, setActive: customEmojiSetActive }) as any);
    if (buyCustomEmojiBadge.fulfilled.match(res)) {
      setModal((s) => ({ ...s, customEmoji: false }));
      await dispatch(getMyInventory() as any);
      await dispatch(getMyCustomEmojiBadge() as any);
    }
  }, [customEmojiInput, customEmojiSetActive, dispatch, t]);

  const doToggleCustomEmojiBadge = useCallback(async () => {
    if (!customEmojiBadge?.emoji || customBadgeExpired) return;
    const res = await dispatch(activateCustomEmojiBadge({ active: !Boolean(customEmojiBadge?.isActive) }) as any);
    if (activateCustomEmojiBadge.fulfilled.match(res)) {
      await dispatch(getMyCustomEmojiBadge() as any);
      await dispatch(getMyInventory() as any);
    }
  }, [customEmojiBadge?.emoji, customEmojiBadge?.isActive, customBadgeExpired, dispatch]);

  const doBuyBadgeFromPicker = useCallback(
    async (item: any, setActive: boolean) => {
      if (!item || badgePickerSubmitting) return;
      setBadgePickerSubmitting(true);
      try {
        const res = await dispatch(
          purchaseStoreItems({ items: [{ itemId: item._id, quantity: 1 }], setActive }) as any
        );
        if (purchaseStoreItems.fulfilled.match(res)) {
          setModal((s) => ({ ...s, badgePicker: false }));
          await dispatch(getMyInventory() as any);
        }
      } finally {
        setBadgePickerSubmitting(false);
      }
    },
    [badgePickerSubmitting, dispatch]
  );
    const isItemActive = useCallback(
    (type: string, key: string) => {
      if (type === "avatarFrame") return String(active.avatarFrame || "") === String(key);
      if (type === "avatarGif") return String(active.avatarGif || "") === String(key);
      if (type === "usernameColor") return String(active.usernameColor || "") === String(key);
      if (type === "messageTextColor") return String(active.messageTextColor || "") === String(key);
      if (type === "messageEffect") return String(active.messageEffect || "") === String(key);
      if (type === "profileEntryAnimation") return String(active.profileEntryAnimation || "") === String(key);
      if (type === "verification") return String(active.verificationType || "") === String(key);
      if (type === "badge") {
        const badges = Array.isArray(active?.badges) ? active.badges : [];
        return badges.includes(String(key));
      }
      return false;
    },
    [active]
  );

  const getInventoryActionMode = useCallback(
    (type: string, key: string): "set" | "add" | "remove" => {
      const activeNow = isItemActive(type, key);

      if (type === "badge") {
        return activeNow ? "remove" : "add";
      }

      return activeNow ? "remove" : "set";
    },
    [isItemActive]
  );

  const getInventoryActionLabel = useCallback(
    (type: string, key: string) => {
      const activeNow = isItemActive(type, key);
      return activeNow ? t("storeScreen.common.remove") : t("storeScreen.common.activate");
    },
    [isItemActive, t]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <FlatList
        data={categoryCards}
        keyExtractor={(item) => item.key}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
        columnWrapperStyle={styles.modernGridRow}
        contentContainerStyle={styles.modernListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.modernHeaderContent}>
            <StoreHero
              theme={theme}
              coinz={coinz}
              coinzText={t("storeScreen.common.coinz")}
              subtitle={t("storeScreen.wallet.subtitle")}
              onWalletPress={() => setModal((s) => ({ ...s, wallet: true }))}
            />

            <View style={styles.quickGrid}>
              <QuickStoreAction
                theme={theme}
                title={t("storeScreen.wallet.buyCoinz")}
                subtitle={t("storeScreen.sections.coinzSub")}
                icon="diamond"
                tone="gold"
                onPress={() => setModal((s) => ({ ...s, wallet: true }))}
                right={
                  <View style={[styles.smallCountBadge, { backgroundColor: theme.pillGoldBg }]}> 
                    <Text style={[styles.smallCountText, { color: theme.pillGoldFg }]}> 
                      {formatCoinz(coinz)}
                    </Text>
                  </View>
                }
              />

              <QuickStoreAction
                theme={theme}
                title={t("storeScreen.customEmoji.cardTitle")}
                subtitle={
                  customEmojiBadge?.emoji
                    ? `${t("storeScreen.customEmoji.current")} ${customEmojiBadge.emoji}`
                    : t("storeScreen.customEmoji.cardDesc")
                }
                icon="happy"
                tone="violet"
                onPress={() => {
                  setCustomEmojiInput(customEmojiBadge?.emoji || "");
                  setCustomEmojiSetActive(true);
                  setModal((s) => ({ ...s, customEmoji: true }));
                }}
                right={<Text style={styles.quickEmoji}>{customEmojiBadge?.emoji || "🙂"}</Text>}
              />

              <QuickStoreAction
                theme={theme}
                title="Lottie Badges"
                subtitle={`Animated badges (${lottieBadgeItems.length})`}
                icon="sparkles"
                tone="cyan"
                onPress={() => {
                  setBadgePickerType("lottie");
                  setModal((s) => ({ ...s, badgePicker: true }));
                }}
                right={<Pill theme={theme} text="Lottie" tone="info" />}
              />

              <QuickStoreAction
                theme={theme}
                title="Image Badges"
                subtitle={`Static badges (${imageBadgeItems.length})`}
                icon="ribbon"
                tone="gold"
                onPress={() => {
                  setBadgePickerType("image");
                  setModal((s) => ({ ...s, badgePicker: true }));
                }}
                right={<Pill theme={theme} text="Image" tone="gold" />}
              />

              <QuickStoreAction
                theme={theme}
                title={t("storeScreen.createAccount.cardTitle")}
                subtitle={`${formatCoinz(CREATE_ACCOUNT_COST)} ${t("storeScreen.common.coinz")}`}
                icon="person-add"
                tone="green"
                onPress={() => setModal((s) => ({ ...s, createAccount: true }))}
              />

              <QuickStoreAction
                theme={theme}
                title={t("storeScreen.inventory.title")}
                subtitle={t("storeScreen.inventory.subtitle")}
                icon="briefcase"
                tone="blue"
                onPress={() => setModal((s) => ({ ...s, inventory: true }))}
                right={
                  <View style={[styles.smallCountBadge, { backgroundColor: `${theme.success}22` }]}> 
                    <Text style={[styles.smallCountText, { color: theme.success }]}> 
                      {my?.inventory?.length || 0}
                    </Text>
                  </View>
                }
              />
            </View>

            <View style={styles.modernSectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modernSectionTitle, { color: theme.text }]}> 
                  {t("storeScreen.sections.store")}
                </Text>
                <Text style={[styles.modernSectionSub, { color: theme.mutedText }]}> 
                  اختر القسم الذي تريد شراءه أو تفعيله
                </Text>
              </View>

              {itemsLoading || myLoading || loadingCustomEmojiBadge ? (
                <ActivityIndicator />
              ) : (
                <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ModernCategoryCard
            theme={theme}
            item={item}
            label={prettyType(item.key, t)}
            onPress={() => openCategoryModal(item.key)}
          />
        )}
      />

      <ModalShell visible={modal.wallet} onClose={() => setModal((s) => ({ ...s, wallet: false }))} title={t("storeScreen.wallet.title")} theme={theme}>
        <View style={styles.modalBody}>
          {coinzPacks.map((pack) => {
            const loading = paymobLoadingPackId === pack.packageId;
            return (
              <View key={pack.packageId} style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
                <Text style={[styles.innerTitle, { color: theme.text }]}>{pack.title}</Text>
                <Text style={[styles.innerSub, { color: theme.mutedText }]}>{pack.subtitle}</Text>
                <View style={styles.pillRow}>
                  <Pill theme={theme} text={`${pack.priceEGP} EGP`} tone="neutral" />
                  <Pill theme={theme} text={`${pack.coinz} Coinz`} tone="gold" />
                </View>
                <View style={styles.actionRow}>
                  <ActionButton theme={theme} title={t("storeScreen.coinz.buyNow")} onPress={() => startPaymobCoinz(pack.packageId)} loading={loading} />
                </View>
              </View>
            );
          })}
        </View>
      </ModalShell>

      <ModalShell visible={modal.customEmoji} onClose={() => setModal((s) => ({ ...s, customEmoji: false }))} title={t("storeScreen.customEmoji.title")} theme={theme}>
        <View style={styles.modalBody}>
          <TextInput
            value={customEmojiInput}
            onChangeText={setCustomEmojiInput}
            placeholder="🐉"
            placeholderTextColor={theme.subtleText}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
          />
          <View style={[styles.previewBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
            <Text style={styles.previewEmoji}>{customEmojiInput.trim() || "🙂"}</Text>
          </View>
          <View style={styles.pillRow}>
            <Pill theme={theme} text={`${CUSTOM_EMOJI_BADGE_COST} Coinz`} tone="gold" />
            {customEmojiBadge?.emoji ? <Pill theme={theme} text={customEmojiBadge.isActive ? t("storeScreen.common.active") : t("storeScreen.common.owned")} tone="good" /> : null}
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doBuyCustomEmojiBadge} loading={buyingCustomEmojiBadge} />
            <ActionButton theme={theme} title={customEmojiBadge?.isActive ? t("storeScreen.common.deactivate") : t("storeScreen.common.activate")} onPress={doToggleCustomEmojiBadge} secondary disabled={!customEmojiBadge?.emoji || customBadgeExpired} loading={activatingCustomEmojiBadge} />
          </View>
        </View>
      </ModalShell>

      <ModalShell visible={modal.createAccount} onClose={() => setModal((s) => ({ ...s, createAccount: false }))} title={t("storeScreen.createAccount.title")} theme={theme}>
        <View style={styles.modalBody}>
          <TextInput
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder={t("storeScreen.createAccount.usernamePlaceholder")}
            placeholderTextColor={theme.subtleText}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("storeScreen.createAccount.passwordPlaceholder")}
            placeholderTextColor={theme.subtleText}
            secureTextEntry
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
          />
          <View style={styles.pillRow}>
            <Pill theme={theme} text={`${CREATE_ACCOUNT_COST} Coinz`} tone="gold" />
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doCreateAccount} loading={createSubmitting} disabled={coinz < CREATE_ACCOUNT_COST} />
          </View>
        </View>
      </ModalShell>

      <ModalShell visible={modal.created} onClose={() => setModal((s) => ({ ...s, created: false }))} title={t("storeScreen.createdAccount.title")} theme={theme}>
        <View style={styles.modalBody}>
          <View style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
            <Text style={[styles.innerSub, { color: theme.mutedText }]}>Username</Text>
            <Text style={[styles.innerTitle, { color: theme.text }]}>{createdCreds?.username || "-"}</Text>
            <Text style={[styles.innerSub, { color: theme.mutedText, marginTop: 10 }]}>Password</Text>
            <Text style={[styles.innerTitle, { color: theme.text }]}>{createdCreds?.password || "-"}</Text>
          </View>
          <View style={styles.actionRow}>
            <ActionButton theme={theme} title={t("storeScreen.createdAccount.copy")} onPress={copyCreatedCreds} loading={copyLoading} />
          </View>
        </View>
      </ModalShell>

      <ModalShell visible={modal.category} onClose={() => setModal((s) => ({ ...s, category: false }))} title={activeCategory ? prettyType(activeCategory, t) : t("storeScreen.sections.store")} theme={theme}>
        <View style={styles.modalBody}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("storeScreen.search.store")}
            placeholderTextColor={theme.subtleText}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
          />
          {filteredCategoryItems.map((item: any) => {
            const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
            const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;
            const imageUrl = getItemImageUrl(item);
            const isActiveNow =
              (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
              (item.type === "avatarGif" && String(active.avatarGif || "") === String(item.key)) ||
              (item.type === "usernameColor" && String(active.usernameColor || "") === String(item.key)) ||
              (item.type === "messageTextColor" && String(active.messageTextColor || "") === String(item.key)) ||
              (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
              (item.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === String(item.key));
            return (
              <View key={item._id} style={[styles.innerCard, { backgroundColor: theme.surface2, borderColor: theme.border }]}> 
                <View style={styles.storeRow}>
                  <View style={[styles.thumb, { borderColor: theme.border, backgroundColor: theme.surface }]}> 
                {item.type === "usernameColor" || item.type === "messageTextColor" ? (
  <View style={[styles.colorThumb, { backgroundColor: String(item?.meta?.previewColor || item?.key || "#ccc") }]}>
    <Text style={styles.colorThumbText}>Aa</Text>
  </View>
) : item?.meta?.lottieUrl ? (
  <View style={styles.lottieThumbWrap}>
    <LottieBadge url={item.meta.lottieUrl} size={56} />
  </View>
) : imageUrl ? (
  <Image source={{ uri: imageUrl }} style={styles.thumbImg} resizeMode="cover" />
) : (
  <Text style={{ color: theme.subtleText }}>IMG</Text>
)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.innerTitle, { color: theme.text }]}>{item.name || item.key}</Text>
                    <Text style={[styles.innerSub, { color: theme.mutedText }]}>{item.description || item.key}</Text>
                    <View style={styles.pillRow}>
                      <Pill theme={theme} text={`${formatCoinz(item.priceCoinz)} Coinz`} tone="gold" />
                      {isActiveNow ? <Pill theme={theme} text={t("storeScreen.common.active")} tone="good" /> : null}
                      {expired ? <Pill theme={theme} text={t("storeScreen.common.expired")} tone="danger" /> : null}
                    </View>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <ActionButton theme={theme} title={t("storeScreen.common.buy")} onPress={() => openBuy(item._id)} />
                  <ActionButton
                    theme={theme}
                    secondary
                    title={isActiveNow ? t("storeScreen.common.remove") : t("storeScreen.common.activate")}
                    onPress={() => doActivate(item.type, String(item.key), isActiveNow ? "remove" : "set")}
                    disabled={expired}
                    loading={activateKeyLoading === `${String(item.type)}:${String(item.key)}:${isActiveNow ? "remove" : "set"}`}
                  />
                </View>
              </View>
            );
          })}
          {!filteredCategoryItems.length ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("storeScreen.empty.noItems")}</Text>
              <Text style={[styles.emptySub, { color: theme.subtleText }]}>{t("storeScreen.empty.tryKeyword")}</Text>
            </View>
          ) : null}
        </View>
      </ModalShell>

      <ModalShell
        visible={modal.inventory}
        onClose={() => setModal((s) => ({ ...s, inventory: false }))}
        title={t("storeScreen.inventory.title")}
        theme={theme}
      >
        <View style={styles.modalBody}>
          {groupedOwned.map((group) => (
            <View
              key={group.type}
              style={[
                styles.innerCard,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.inventoryGroupHeader}>
                <Text style={[styles.innerTitle, { color: theme.text }]}>
                  {prettyType(group.type, t)}
                </Text>
                <Pill
                  theme={theme}
                  text={`${group.rows.length}`}
                  tone="info"
                />
              </View>

              {group.rows.map((row: any) => {
                const item = row.item;
                const itemKey = String(row.itemKey || "");
                const imageUrl = getItemImageUrl(item);
                const expired = isExpired(row.expiresAt);
                const activeNow = isItemActive(group.type, itemKey);
                const mode = getInventoryActionMode(group.type, itemKey);
                const loadingKey = `${String(group.type)}:${String(itemKey)}:${String(mode)}`;

                return (
                  <View
                    key={row._id}
                    style={[
                      styles.inventoryCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
               <View style={styles.storeRow}>
  <View
    style={[
      styles.thumb,
      {
        borderColor: theme.border,
        backgroundColor: theme.surface2,
      },
    ]}
  >
    {group.type === "usernameColor" || group.type === "messageTextColor" ? (
      <View
        style={[
          styles.colorThumb,
          {
            backgroundColor: String(item?.meta?.previewColor || "#ccc"),
          },
        ]}
      >
        <Text style={styles.colorThumbText}>Aa</Text>
      </View>
    ) : item?.meta?.lottieUrl ? (
  <View style={styles.lottieThumbWrap}>
    <LottieBadge url={item.meta.lottieUrl} size={56} />
  </View>
) : imageUrl ? (
  <Image source={{ uri: imageUrl }} style={styles.thumbImg} resizeMode="cover" />
) : (
      <Text style={{ color: theme.subtleText }}>IMG</Text>
    )}
  </View>

  <View style={{ flex: 1 }}>
    <Text style={[styles.innerTitle, { color: theme.text }]}>
      {item?.name || prettyType(group.type, t)}
    </Text>

    {!!item?.description ? (
      <Text
        numberOfLines={2}
        style={[styles.innerSub, { color: theme.mutedText }]}
      >
        {item.description}
      </Text>
    ) : null}

    <View style={styles.pillRow}>
      <Pill
        theme={theme}
        text={activeNow ? t("storeScreen.common.active") : t("storeScreen.common.owned")}
        tone={activeNow ? "good" : "neutral"}
      />

      <Pill
        theme={theme}
        text={row?.expiresAt ? formatDate(row.expiresAt) : t("storeScreen.common.permanent")}
        tone={row?.expiresAt ? "info" : "neutral"}
      />

      {expired ? (
        <Pill
          theme={theme}
          text={t("storeScreen.common.expired")}
          tone="danger"
        />
      ) : null}
    </View>
  </View>
</View>

                    <View style={styles.actionRow}>
                      <ActionButton
                        theme={theme}
                        title={getInventoryActionLabel(group.type, itemKey)}
                        onPress={() => doActivate(group.type, itemKey, mode)}
                        disabled={expired}
                        loading={activateKeyLoading === loadingKey}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {!groupedOwned.length ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t("storeScreen.inventory.noItemsTitle")}
              </Text>
              <Text style={[styles.emptySub, { color: theme.subtleText }]}>
                {t("storeScreen.inventory.noItemsSub")}
              </Text>
            </View>
          ) : null}
        </View>
      </ModalShell>

      <ModalShell visible={modal.buy} onClose={() => setModal((s) => ({ ...s, buy: false }))} title={t("storeScreen.purchase.title")} theme={theme}>
        <View style={styles.modalBody}>
          {selectedItem ? (
            <>
              <Text style={[styles.innerTitle, { color: theme.text }]}>{selectedItem.name || selectedItem.key}</Text>
              <Text style={[styles.innerSub, { color: theme.mutedText }]}>{prettyType(selectedItem.type, t)} • {selectedItem.key}</Text>
              <View style={styles.pillRow}>
                <Pill theme={theme} text={`${formatCoinz(selectedItem.priceCoinz)} Coinz`} tone="gold" />
                <Pill
                  theme={theme}
                  text={Number(selectedItem.durationDays || 0) > 0 ? `${selectedItem.durationDays} ${t("storeScreen.common.daysSuffix")}` : t("storeScreen.common.permanent")}
                  tone="neutral"
                />
              </View>
              {(selectedItem.isStackable || selectedItem.isConsumable) ? (
                <TextInput
                  value={String(buyQty)}
                  onChangeText={(txt) => setBuyQty(Math.max(1, Number(txt.replace(/[^\d]/g, "") || "1")))}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
                />
              ) : null}
              <View style={styles.actionRow}>
                <ActionButton theme={theme} title={t("storeScreen.purchase.confirm")} onPress={doBuy} loading={buySubmitting || purchasing} />
              </View>
            </>
          ) : <ActivityIndicator />}
        </View>
      </ModalShell>

<BadgeLottiePickerModal
  visible={modal.badgePicker}
  onClose={() => setModal((s) => ({ ...s, badgePicker: false }))}
  items={badgePickerType === "lottie" ? lottieBadgeItems : imageBadgeItems}
  selectedKey=""
  onConfirm={doBuyBadgeFromPicker}
  theme={theme}
  isRTL={isRTL}
  t={t}
  loading={badgePickerSubmitting}
  coinz={coinz}
  pickerTitle={badgePickerType === "lottie" ? "Lottie Badges" : "Image Badges"}
/>

      {(buyingCoinz || purchasing || activating || myLoading || itemsLoading || loadingCustomEmojiBadge) ? (
        <View style={[styles.overlayLoader, { backgroundColor: theme.overlay }]}> 
          <View style={[styles.overlayLoaderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
            <ActivityIndicator />
            <Text style={[styles.overlayLoaderText, { color: theme.text }]}>{t("storeScreen.common.pleaseWait")}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  modernListContent: {
    padding: 14,
    paddingBottom: 28,
  },
  modernHeaderContent: {
    gap: 14,
    marginBottom: 14,
  },
  modernHeroWrap: {
    position: "relative",
  },
  modernHeroGlow: {
    position: "absolute",
    top: 16,
    left: 18,
    right: 18,
    bottom: -8,
    borderRadius: 30,
    transform: [{ scaleX: 0.96 }],
  },
  modernHero: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    minHeight: 188,
    overflow: "hidden",
  },
  modernHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  walletButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  walletButtonText: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  modernHeroTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 18,
    letterSpacing: 0.3,
    fontFamily: Fonts?.rounded,
  },
  modernHeroSub: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
    fontFamily: Fonts?.sans,
  },
  coinBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  coinBadge: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coinBadgeText: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  heroMiniBadge: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  heroMiniBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts?.rounded,
  },
  quickGrid: {
    gap: 10,
  },
  quickAction: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  quickSub: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts?.sans,
  },
  quickEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  smallCountBadge: {
    minWidth: 42,
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  smallCountText: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  modernSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  modernSectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  modernSectionSub: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts?.sans,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  modernGridRow: {
    justifyContent: "space-between",
    gap: 12,
  },
  modernCategoryCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    minHeight: 166,
    marginBottom: 12,
    overflow: "hidden",
  },
  categoryDecorWrap: {
    position: "absolute",
    top: -26,
    right: -24,
    width: 96,
    height: 96,
  },
  categoryDecor: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modernCategoryTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  modernCategorySub: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
    minHeight: 34,
    fontFamily: Fonts?.sans,
  },
  categoryFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryFooterText: {
    fontSize: 11,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },

  listContent: { padding: 14, paddingBottom: 24 },
  hero: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts?.rounded,
  },
  heroBalance: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
    fontFamily: Fonts?.rounded,
  },
  heroSub: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
    fontFamily: Fonts?.sans,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  inventoryGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  inventoryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  sectionCardSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    fontFamily: Fonts?.sans,
  },
  bigEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  gridRow: {
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 118,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  categorySub: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Fonts?.sans,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    padding: 14,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    maxHeight: "84%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  modalScrollContent: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  closeBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalBody: {
    gap: 12,
    paddingBottom: 8,
  },
  innerCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  innerTitle: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  innerSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    fontFamily: Fonts?.sans,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontWeight: "800",
    fontFamily: Fonts?.sans,
  },
  previewBox: {
    minHeight: 90,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewEmoji: {
    fontSize: 42,
    lineHeight: 48,
  },
  storeRow: {
    flexDirection: "row",
    gap: 12,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  colorThumb: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  colorThumbText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  inventoryRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inventoryThumb: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  inventoryName: {
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  inventoryMeta: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts?.sans,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    fontFamily: Fonts?.sans,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  lottieThumbWrap: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts?.rounded,
  },
  overlayLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  overlayLoaderCard: {
    minWidth: 180,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 10,
  },
  overlayLoaderText: {
    fontWeight: "900",
    fontFamily: Fonts?.rounded,
  },
});
