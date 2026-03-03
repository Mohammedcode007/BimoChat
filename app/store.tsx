// app/(tabs)/store.tsx
// ✅ تحديث شامل ليتوافق مع الباك الجديد + السلايس الجديد
// الجديد:
// 1) إضافة شراء Coinz فعليًا عبر POST /store/coinz/buy (thunk: buyCoinz)
// 2) دعم مدة العناصر: durationDays (0 = دائم) + عرض expiresAt + منع التفعيل إذا منتهي
// 3) إضافة 9 أقسام (Tabs) بدون كسر الباك:
//    - 6 أصناف أصلية من الباك: frames, badges, effects, entry, verify, gifts
//    - + Coinz (شراء Coinz)
//    - + Bundles (حِزم) تعتمد على meta.category="bundle" (فلترة Front فقط)
//    - + Limited (عروض) تعتمد على meta.isLimited=true (فلترة Front فقط)
// ملاحظة: الباك لا يعرف نوع bundle/limited كـ type؛ لذلك نعرضها كتقسيم UI فقط.

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  activateStoreItem,
  buyCoinz,
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
import * as Clipboard from "expo-clipboard";

import { debitMyCoinz, registerNoLogin } from "@/redux/slices/userSlice";
// لو أنت وضعتهما في ملفات أخرى عدّل المسار
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

// ✅ باقات شراء Coinz (فعليًا تستدعي buyCoinz)
const COINZ_PACKS: { amount: number; title: string; subtitle?: string }[] = [
  { amount: 1000, title: "Starter Pack", subtitle: "Good for trying the store" },
  { amount: 5000, title: "Basic Pack", subtitle: "Most common purchases" },
  { amount: 10000, title: "Plus Pack", subtitle: "Great value for upgrades" },
  { amount: 25000, title: "Power Pack", subtitle: "For frequent buyers" },
  { amount: 50000, title: "Mega Pack", subtitle: "Best for gifting" },
  { amount: 100000, title: "Ultra Pack", subtitle: "Top-up for everything" }
];
function getItemImageUrl(item: any): string {
  // يدعم: item.iconUrl (لو رجعته صريح من الباك)
  // أو: item.meta.iconUrl (لو داخل meta)
  // أو: coverUrl/previewUrl كبدائل
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
export default function StoreScreen() {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectStoreItems);
  const itemsLoading = useAppSelector(selectStoreItemsLoading);

  const my = useAppSelector(selectMyStore);
  const myLoading = useAppSelector(selectMyStoreLoading);

  const purchasing = useAppSelector(selectStorePurchasing);
  const activating = useAppSelector(selectStoreActivating);
  const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
  const error = useAppSelector(selectStoreError);

  const [tab, setTab] = useState<UiTab>("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Purchase modal
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItemId, setBuyItemId] = useState<string>("");
  const [buyQty, setBuyQty] = useState<number>(1);
  const [buySetActive, setBuySetActive] = useState(true);

  // Coinz modal
  const [coinzOpen, setCoinzOpen] = useState(false);
  const [coinzAmount, setCoinzAmount] = useState<number>(5000);
  const CREATE_ACCOUNT_COST = 30000;

  // Create account modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Success modal (copy)
  const [createdOpen, setCreatedOpen] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const selectedItem = useMemo(() => {
    return items.find((x: any) => String(x._id) === String(buyItemId)) || null;
  }, [items, buyItemId]);

  const active = my?.activeCustomization || {
    avatarFrame: "",
    messageEffect: "",
    profileEntryAnimation: "",
    badges: [],
    verificationType: "none"
  };

  const coinz = my?.coinzBalance ?? 0;

  const ownedByTypeKey = useMemo(() => {
    const inv = my?.inventory || [];
    const map = new Map<string, any>(); // key: `${type}:${itemKey}` => inventory entry
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

  const filtered = useMemo(() => {
    if (tab === "coinz") return [];

    const query = q.trim().toLowerCase();

    // فلترة حسب التاب (Front) + دعم bundle/limited من meta
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

  async function loadAll() {
    // الباك يدعم type filter فقط للأنواع الأصلية
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
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (error) {
      Alert.alert("Store", error, [{ text: "OK", onPress: () => dispatch(clearStoreError()) }]);
    }
  }, [error, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  const openBuy = (itemId: string) => {
    setBuyItemId(itemId);
    setBuyQty(1);
    setBuySetActive(true);
    setBuyOpen(true);
  };

  const doBuy = async () => {
    if (!selectedItem) return;

    const qty = Math.max(1, Number(buyQty || 1));

    // منع شراء غير قابل للتكرار إذا مملوك
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
      // لضمان ظهور expiry/id الحقيقيين
      dispatch(getMyInventory() as any);
    }
  };
  const openCreateAccount = () => {
    setNewUsername("");
    setNewPassword("");
    setCreateOpen(true);
  };

  const doCreateAccount = async () => {
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

    // 1) خصم 30000
    const debitRes = await dispatch(
      debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any
    );

    if (!debitMyCoinz.fulfilled.match(debitRes)) {
      Alert.alert("Create Account", String((debitRes as any).payload || "Failed to debit coinz"));
      return;
    }

    // 2) إنشاء الحساب بدون تسجيل دخول
    const regRes = await dispatch(registerNoLogin({ username, password }) as any);

    if (!registerNoLogin.fulfilled.match(regRes)) {
      // ⚠️ هنا الأفضل أن تعمل Refund في الباك (إن أمكن).
      Alert.alert("Create Account", String((regRes as any).payload || "Registration failed"));
      // تحديث الرصيد على أي حال
      dispatch(getMyInventory() as any);
      return;
    }

    // 3) تحديث الرصيد الظاهر في المتجر
    dispatch(getMyInventory() as any);

    // 4) إظهار بيانات النسخ
    setCreateOpen(false);
    setCreatedCreds({ username, password });
    setCreatedOpen(true);
  };

  const copyCreatedCreds = async () => {
    if (!createdCreds) return;
    await Clipboard.setStringAsync(
      `Username: ${createdCreds.username}\nPassword: ${createdCreds.password}`
    );
    Alert.alert("Copied", "Credentials copied to clipboard");
  };
  const doActivate = async (type: any, key: string, mode?: "set" | "add" | "remove") => {
    // منع تفعيل عنصر منتهي — اعتمادًا على بيانات المخزون
    const invKey = `${String(type)}:${String(key)}`;
    const inv = ownedByTypeKey.get(invKey);

    if (inv?.expiresAt && isExpired(inv.expiresAt)) {
      Alert.alert("Expired", "This item has expired. Please renew/buy again.");
      return;
    }

    const res = await dispatch(activateStoreItem({ type, key, mode } as any) as any);
    if (activateStoreItem.fulfilled.match(res)) {
      // OK
    }
  };

  const openCoinz = (amount?: number) => {
    setCoinzAmount(amount ?? 5000);
    setCoinzOpen(true);
  };

  const doBuyCoinz = async () => {
    const amount = Math.max(1, Number(coinzAmount || 1));

    const res = await dispatch(buyCoinz({ amount }) as any);
    if (buyCoinz.fulfilled.match(res)) {
      setCoinzOpen(false);
      // تحديث المخزون/الرصيد
      dispatch(getMyInventory() as any);
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerWrap}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceTitle}>Your Balance</Text>
              <Text style={styles.balanceValue}>{formatCoinz(coinz)} Coinz</Text>
            </View>

            <TouchableOpacity
              style={[styles.buyCoinzBtn, buyingCoinz ? styles.btnDisabled : null]}
              onPress={() => openCoinz(5000)}
              disabled={buyingCoinz}
            >
              <Text style={styles.buyCoinzBtnText}>{buyingCoinz ? "Processing..." : "Buy Coinz"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activeBox}>
            <Text style={styles.activeTitle}>Active</Text>
            <View style={styles.activeRow}>
              <Tag label={`Frame: ${active.avatarFrame || "none"}`} />
              <Tag label={`Effect: ${active.messageEffect || "none"}`} />
            </View>
            <View style={styles.activeRow}>
              <Tag label={`Entry: ${active.profileEntryAnimation || "none"}`} />
            </View>
            <View style={styles.activeRow}>
              <Tag label={`Badges: ${(active.badges || []).length}`} />
            </View>
          </View>
        </View>
        {/* ✅ Create Account (30,000 Coinz) */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>Create Account</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                Create a new account and pay {formatCoinz(CREATE_ACCOUNT_COST)} Coinz from your balance.
              </Text>
            </View>

            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Cost</Text>
              <Text style={styles.priceValue}>{formatCoinz(CREATE_ACCOUNT_COST)}</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <Chip text="Service" tone="info" />
            <Chip text="One-time" tone="neutral" />
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                (coinz < CREATE_ACCOUNT_COST || purchasing || activating || buyingCoinz) ? styles.btnDisabled : null
              ]}
              onPress={openCreateAccount}
              disabled={coinz < CREATE_ACCOUNT_COST || purchasing || activating || buyingCoinz}
            >
              <Text style={styles.btnPrimaryText}>
                {coinz < CREATE_ACCOUNT_COST ? "Insufficient Coinz" : "Create"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => Alert.alert("Create Account", "After success you can copy username and password.")}
            >
              <Text style={styles.btnSecondaryText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={tab === "coinz" ? "Search coinz packs..." : "Search items..."}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={TYPE_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          keyExtractor={(x) => x.key}
          renderItem={({ item }) => {
            const activeTab = item.key === tab;
            return (
              <TouchableOpacity
                style={[styles.tabPill, activeTab ? styles.tabPillActive : null]}
                onPress={() => setTab(item.key)}
              >
                <Text style={[styles.tabText, activeTab ? styles.tabTextActive : null]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{tab === "coinz" ? "Coinz Packs" : "Store Items"}</Text>
          {(itemsLoading || myLoading) && <ActivityIndicator />}
        </View>

        {tab === "coinz" && (
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Coinz purchase is currently <Text style={styles.noteEm}>mock</Text> (no payment gateway). You can adjust
              limits in the backend.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStoreItem = ({ item }: any) => {
    const ownedSet = ownedKeysByType[String(item.type)] || new Set<string>();
    const isOwned = ownedSet.has(String(item.key));

    const isActiveNow =
      (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
      (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
      (item.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === String(item.key)) ||
      (item.type === "badge" && (active.badges || []).includes(String(item.key))) ||
      (item.type === "verification" &&
        String(active.verificationType || "none") === String(item.meta?.verificationType || item.key));

    const canActivate =
      isOwned &&
      (item.type === "avatarFrame" ||
        item.type === "messageEffect" ||
        item.type === "profileEntryAnimation" ||
        item.type === "badge" ||
        item.type === "verification");

    const buyDisabled = purchasing || activating || buyingCoinz;

    // مدة العنصر (0 = دائم)
    const days = Number(item.durationDays || 0);
    const durationLabel = days > 0 ? `${days} day(s)` : "Permanent";

    // حالة انتهاء الصلاحية من المخزون (إن كان مملوكًا)
    const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
    const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;
    const imageUrl = getItemImageUrl(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Text style={styles.itemImagePlaceholderText}>IMG</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name || item.key}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {prettyType(item.type)} • {item.key}
            </Text>

            <View style={{ marginTop: 6 }}>
              <Text style={styles.cardSmall} numberOfLines={1}>
                Duration: <Text style={styles.cardSmallEm}>{durationLabel}</Text>
              </Text>

              {isOwned && inv?.expiresAt ? (
                <Text style={styles.cardSmall} numberOfLines={1}>
                  Expires: <Text style={styles.cardSmallEm}>{formatDate(inv.expiresAt)}</Text>
                </Text>
              ) : null}
            </View>

            {!!item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{formatCoinz(Number(item.priceCoinz || 0))}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          {isOwned ? <Chip text="Owned" tone="good" /> : <Chip text="New" tone="info" />}
          {item.isConsumable ? <Chip text="Consumable" tone="neutral" /> : null}
          {item.isStackable ? <Chip text="Stackable" tone="neutral" /> : null}
          {days > 0 ? <Chip text="Timed" tone="neutral" /> : <Chip text="Permanent" tone="neutral" />}
          {expired ? <Chip text="Expired" tone="danger" /> : null}
          {isActiveNow ? <Chip text="Active" tone="gold" /> : null}
          {String(item.meta?.category || "").toLowerCase() === "bundle" ? <Chip text="Bundle" tone="info" /> : null}
          {Boolean(item.meta?.isLimited) ? <Chip text="Limited" tone="warning" /> : null}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, buyDisabled ? styles.btnDisabled : null]}
            onPress={() => openBuy(item._id)}
            disabled={buyDisabled}
          >
            <Text style={styles.btnPrimaryText}>Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnSecondary,
              !canActivate || buyDisabled || expired ? styles.btnDisabled : null
            ]}
            onPress={() => {
              if (item.type === "verification") {
                const vt = String(item.meta?.verificationType || "").trim();
                if (!vt) {
                  Alert.alert("Invalid item", "verificationType is missing in item.meta");
                  return;
                }
                doActivate("verification", vt);
                return;
              }

              if (item.type === "badge") {
                const has = (active.badges || []).includes(String(item.key));
                doActivate("badge", String(item.key), has ? "remove" : "add");
              } else {
                doActivate(item.type, String(item.key));
              }
            }}
            disabled={!canActivate || buyDisabled || expired}
          >
            <Text style={styles.btnSecondaryText}>{expired ? "Expired" : "Activate"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCoinzPack = ({ item }: any) => {
    const query = q.trim().toLowerCase();
    const hay = `${item.title} ${item.amount} ${item.subtitle || ""}`.toLowerCase();
    if (query && !hay.includes(query)) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.title}
            </Text>
            {!!item.subtitle && (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.subtitle}
              </Text>
            )}
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>You get</Text>
            <Text style={styles.priceValue}>{formatCoinz(item.amount)}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <Chip text="Coinz" tone="info" />
          <Chip text="Instant" tone="good" />
          <Chip text="Mock" tone="neutral" />
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, buyingCoinz ? styles.btnDisabled : null]}
            onPress={() => openCoinz(item.amount)}
            disabled={buyingCoinz}
          >
            <Text style={styles.btnPrimaryText}>{buyingCoinz ? "Processing..." : "Buy Coinz"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => Alert.alert("Info", "This is a mock purchase endpoint. Integrate payment later.")}
          >
            <Text style={styles.btnSecondaryText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOwned = () => {

    return (
      <View style={styles.ownedWrap}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Your Inventory</Text>
          {(myLoading || activating) && <ActivityIndicator />}
        </View>

        {!my?.inventory?.length ? (
          <Text style={styles.emptyText}>No items yet. Buy something from the store.</Text>
        ) : (
          groupedOwned.map((g) => (
            <View key={g.type} style={styles.ownedSection}>
              <Text style={styles.ownedTitle}>{prettyType(g.type)}</Text>

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

                return (
                  <View key={row._id} style={styles.ownedRow}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.ownedImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.ownedImagePlaceholder}>
                        <Text style={styles.itemImagePlaceholderText}>IMG</Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={styles.ownedName} numberOfLines={1}>
                        {item?.name || key}
                      </Text>
                      <Text style={styles.ownedMeta} numberOfLines={2}>
                        {key}
                        {qty > 1 ? ` • qty: ${qty}` : ""}
                        {row?.expiresAt ? ` • expires: ${formatDate(row.expiresAt)}` : " • permanent"}
                      </Text>
                    </View>

                    <View style={styles.ownedRight}>
                      {expired ? <Chip text="Expired" tone="danger" /> : null}
                      {isActiveNow ? <Chip text="Active" tone="gold" /> : null}

                      {(g.type === "avatarFrame" ||
                        g.type === "messageEffect" ||
                        g.type === "profileEntryAnimation") && (
                          <TouchableOpacity
                            style={[styles.miniBtn, (activating || expired) ? styles.btnDisabled : null]}
                            onPress={() => doActivate(g.type, key)}
                            disabled={activating || expired}
                          >
                            <Text style={styles.miniBtnText}>{expired ? "Expired" : "Use"}</Text>
                          </TouchableOpacity>
                        )}

                      {g.type === "badge" && (
                        <TouchableOpacity
                          style={[styles.miniBtn, (activating || expired) ? styles.btnDisabled : null]}
                          onPress={() =>
                            doActivate(
                              "badge",
                              key,
                              (active.badges || []).includes(key) ? "remove" : "add"
                            )
                          }
                          disabled={activating || expired}
                        >
                          <Text style={styles.miniBtnText}>
                            {expired ? "Expired" : (active.badges || []).includes(key) ? "Remove" : "Add"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </View>
    );
  };

  const data = tab === "coinz" ? COINZ_PACKS : filtered;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={data as any}
        keyExtractor={(x: any) => (tab === "coinz" ? String(x.amount) : String(x._id))}
        renderItem={tab === "coinz" ? renderCoinzPack : renderStoreItem}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderOwned}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          itemsLoading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {tab === "coinz" ? "No coinz packs match your search." : "No items match your search."}
              </Text>
            </View>
          )
        }
      />

      {/* =========================
          Purchase Item Modal
      ========================= */}
      <Modal transparent visible={buyOpen} animationType="fade" onRequestClose={() => setBuyOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBuyOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Purchase</Text>
              <TouchableOpacity onPress={() => setBuyOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {!selectedItem ? (
              <View style={styles.center}>
                <ActivityIndicator />
              </View>
            ) : (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalName}>{selectedItem.name || selectedItem.key}</Text>
                  <Text style={styles.modalMeta}>
                    {prettyType(selectedItem.type)} • {selectedItem.key}
                  </Text>

                  <Text style={styles.modalMeta}>
                    Duration:{" "}
                    <Text style={{ color: "#E2E8F0", fontWeight: "900" }}>
                      {Number(selectedItem.durationDays || 0) > 0
                        ? `${Number(selectedItem.durationDays || 0)} day(s)`
                        : "Permanent"}
                    </Text>
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Price</Text>
                  <Text style={styles.modalValue}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0))} Coinz
                  </Text>
                </View>

                {(selectedItem.isStackable || selectedItem.isConsumable) && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Quantity</Text>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, purchasing ? styles.btnDisabled : null]}
                        disabled={purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) - 1))}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>

                      <TextInput
                        value={String(buyQty)}
                        onChangeText={(t) => setBuyQty(Math.max(1, Number(t.replace(/[^\d]/g, "") || "1")))}
                        keyboardType="number-pad"
                        style={styles.qtyInput}
                      />

                      <TouchableOpacity
                        style={[styles.qtyBtn, purchasing ? styles.btnDisabled : null]}
                        disabled={purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) + 1))}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Auto-activate</Text>
                  <TouchableOpacity
                    onPress={() => setBuySetActive((v) => !v)}
                    style={[styles.toggle, buySetActive ? styles.toggleOn : styles.toggleOff]}
                  >
                    <View style={[styles.toggleKnob, buySetActive ? styles.knobOn : styles.knobOff]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Total</Text>
                  <Text style={styles.modalTotal}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0) * Math.max(1, Number(buyQty || 1)))} Coinz
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary, purchasing ? styles.btnDisabled : null]}
                    onPress={() => setBuyOpen(false)}
                    disabled={purchasing}
                  >
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary, purchasing ? styles.btnDisabled : null]}
                    onPress={doBuy}
                    disabled={purchasing}
                  >
                    <Text style={styles.btnPrimaryText}>{purchasing ? "Buying..." : "Confirm"}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalHint}>Your balance: {formatCoinz(coinz)} Coinz</Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          Coinz Modal
      ========================= */}
      <Modal transparent visible={coinzOpen} animationType="fade" onRequestClose={() => setCoinzOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCoinzOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buy Coinz</Text>
              <TouchableOpacity onPress={() => setCoinzOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalName}>Top up your balance</Text>
              <Text style={styles.modalMeta}>Mock purchase endpoint (no payment gateway)</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Amount</Text>
              <TextInput
                value={String(coinzAmount)}
                onChangeText={(t) => setCoinzAmount(Math.max(1, Number(t.replace(/[^\d]/g, "") || "1")))}
                keyboardType="number-pad"
                style={[styles.qtyInput, { width: 120 }]}
              />
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>After</Text>
              <Text style={styles.modalTotal}>{formatCoinz(coinz + Math.max(1, Number(coinzAmount || 1)))} Coinz</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary, buyingCoinz ? styles.btnDisabled : null]}
                onPress={() => setCoinzOpen(false)}
                disabled={buyingCoinz}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, buyingCoinz ? styles.btnDisabled : null]}
                onPress={doBuyCoinz}
                disabled={buyingCoinz}
              >
                <Text style={styles.btnPrimaryText}>{buyingCoinz ? "Processing..." : "Confirm"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>Current balance: {formatCoinz(coinz)} Coinz</Text>
          </Pressable>
        </Pressable>
      </Modal>
            {/* =========================
          Create Account Modal
      ========================= */}
      <Modal transparent visible={createOpen} animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCreateOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Account</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalMeta}>
                Cost: <Text style={{ color: "#E2E8F0", fontWeight: "900" }}>{formatCoinz(CREATE_ACCOUNT_COST)} Coinz</Text>
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Username</Text>
            </View>
            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="username"
              placeholderTextColor="#94A3B8"
              style={[styles.qtyInput, { width: "100%", textAlign: "left", paddingHorizontal: 12 }]}
              autoCapitalize="none"
            />

            <View style={[styles.modalRow, { marginTop: 12 }]}>
              <Text style={styles.modalLabel}>Password</Text>
            </View>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="password"
              placeholderTextColor="#94A3B8"
              style={[styles.qtyInput, { width: "100%", textAlign: "left", paddingHorizontal: 12 }]}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setCreateOpen(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={doCreateAccount}>
                <Text style={styles.btnPrimaryText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>Your balance: {formatCoinz(coinz)} Coinz</Text>
          </Pressable>
        </Pressable>
      </Modal>
            {/* =========================
          Created Account Modal
      ========================= */}
      <Modal transparent visible={createdOpen} animationType="fade" onRequestClose={() => setCreatedOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCreatedOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Created</Text>
              <TouchableOpacity onPress={() => setCreatedOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalMeta}>Username</Text>
              <Text style={styles.modalValue}>{createdCreds?.username || "-"}</Text>

              <Text style={[styles.modalMeta, { marginTop: 10 }]}>Password</Text>
              <Text style={styles.modalValue}>{createdCreds?.password || "-"}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setCreatedOpen(false)}>
                <Text style={styles.btnSecondaryText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={copyCreatedCreds}>
                <Text style={styles.btnPrimaryText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================
   UI Helpers
========================= */

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

function Chip({
  text,
  tone
}: {
  text: string;
  tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning";
}) {
  const bg =
    tone === "good"
      ? "#0F766E"
      : tone === "info"
        ? "#1D4ED8"
        : tone === "gold"
          ? "#A16207"
          : tone === "danger"
            ? "#B91C1C"
            : tone === "warning"
              ? "#B45309"
              : "#334155";

  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* =========================
   Styles
========================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },

  listContent: { padding: 12, paddingBottom: 24 },

  headerWrap: { gap: 10, paddingBottom: 10 },

  balanceCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    gap: 10
  },

  balanceTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },

  balanceTitle: { color: "#94A3B8", fontSize: 12, marginBottom: 4 },
  balanceValue: { color: "#E2E8F0", fontSize: 22, fontWeight: "800" },

  buyCoinzBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14
  },
  buyCoinzBtnText: { color: "#FFFFFF", fontWeight: "900" },

  activeBox: {
    marginTop: 6,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#0B1326",
    borderWidth: 1,
    borderColor: "#1F2A44"
  },
  itemImage: {
  width: 62,
  height: 62,
  borderRadius: 14,
  backgroundColor: "#0B1326",
  borderWidth: 1,
  borderColor: "#1F2A44"
},
itemImagePlaceholder: {
  width: 62,
  height: 62,
  borderRadius: 14,
  backgroundColor: "#0B1326",
  borderWidth: 1,
  borderColor: "#1F2A44",
  alignItems: "center",
  justifyContent: "center"
},
itemImagePlaceholderText: {
  color: "#94A3B8",
  fontWeight: "900",
  fontSize: 12
},

ownedImage: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#0B1326",
  borderWidth: 1,
  borderColor: "#1F2A44"
},
ownedImagePlaceholder: {
  width: 44,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#0B1326",
  borderWidth: 1,
  borderColor: "#1F2A44",
  alignItems: "center",
  justifyContent: "center"
},

  activeTitle: { color: "#94A3B8", fontSize: 12, marginBottom: 8, fontWeight: "700" },
  activeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },

  tag: {
    backgroundColor: "#0F1B33",
    borderWidth: 1,
    borderColor: "#243253",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  tagText: { color: "#CBD5E1", fontSize: 12, maxWidth: 220 },

  searchRow: {
    borderRadius: 14,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  searchInput: { color: "#E2E8F0", fontSize: 14 },

  tabsRow: { gap: 8, paddingVertical: 4 },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44"
  },
  tabPillActive: { backgroundColor: "#111D3A", borderColor: "#3B82F6" },
  tabText: { color: "#CBD5E1", fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#E2E8F0" },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },

  noteCard: {
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44"
  },
  noteText: { color: "#94A3B8", fontSize: 12, lineHeight: 16 },
  noteEm: { color: "#E2E8F0", fontWeight: "900" },

  card: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    borderRadius: 18,
    padding: 14,
    marginTop: 10
  },

  cardTop: { flexDirection: "row", gap: 12 },
  cardName: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
  cardMeta: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  cardDesc: { color: "#CBD5E1", fontSize: 12, marginTop: 8, lineHeight: 16 },

  cardSmall: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  cardSmallEm: { color: "#E2E8F0", fontWeight: "900" },

  priceBox: { minWidth: 96, alignItems: "flex-end", paddingLeft: 8 },
  priceLabel: { color: "#94A3B8", fontSize: 11 },
  priceValue: { color: "#FBBF24", fontSize: 16, fontWeight: "900", marginTop: 2 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: "#E2E8F0", fontSize: 11, fontWeight: "800" },

  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },

  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },

  btnPrimary: { backgroundColor: "#2563EB" },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "900" },

  btnSecondary: { backgroundColor: "#0B1326", borderWidth: 1, borderColor: "#1F2A44" },
  btnSecondaryText: { color: "#E2E8F0", fontWeight: "900" },

  btnDisabled: { opacity: 0.55 },

  ownedWrap: { marginTop: 18, gap: 10 },
  ownedSection: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    borderRadius: 18,
    padding: 12
  },
  ownedTitle: { color: "#E2E8F0", fontSize: 14, fontWeight: "900", marginBottom: 8 },
  ownedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1A2440"
  },
  ownedName: { color: "#E2E8F0", fontWeight: "900" },
  ownedMeta: { color: "#94A3B8", fontSize: 12, marginTop: 3 },
  ownedRight: { flexDirection: "row", alignItems: "center", gap: 10 },

  miniBtn: {
    backgroundColor: "#111D3A",
    borderWidth: 1,
    borderColor: "#243253",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12
  },
  miniBtnText: { color: "#E2E8F0", fontWeight: "900", fontSize: 12 },

  center: { paddingVertical: 24, alignItems: "center", gap: 10 },
  emptyText: { color: "#94A3B8", textAlign: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 14
  },
  modalCard: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    borderRadius: 18,
    padding: 14
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
  modalClose: { color: "#94A3B8", fontSize: 18, padding: 6 },

  modalInfo: { marginTop: 10 },
  modalName: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },
  modalMeta: { color: "#94A3B8", fontSize: 12, marginTop: 4 },

  modalRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalLabel: { color: "#94A3B8", fontWeight: "800" },
  modalValue: { color: "#E2E8F0", fontWeight: "900" },
  modalTotal: { color: "#FBBF24", fontWeight: "900" },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B1326",
    borderWidth: 1,
    borderColor: "#1F2A44"
  },
  qtyBtnText: { color: "#E2E8F0", fontSize: 18, fontWeight: "900" },
  qtyInput: {
    width: 70,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#0B1326",
    borderWidth: 1,
    borderColor: "#1F2A44",
    color: "#E2E8F0",
    textAlign: "center",
    fontWeight: "900"
  },

  toggle: { width: 54, height: 30, borderRadius: 999, padding: 3, justifyContent: "center" },
  toggleOn: { backgroundColor: "#2563EB" },
  toggleOff: { backgroundColor: "#334155" },
  toggleKnob: { width: 24, height: 24, borderRadius: 999, backgroundColor: "#E2E8F0" },
  knobOn: { alignSelf: "flex-end" },
  knobOff: { alignSelf: "flex-start" },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalHint: { color: "#94A3B8", fontSize: 12, marginTop: 10 }
});