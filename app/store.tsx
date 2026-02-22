// app/(tabs)/store.tsx
// صفحة Store كاملة (Expo Router + React Native) متوافقة مع storeControl.slice.ts
// - عرض عناصر المتجر + فلترة حسب النوع + بحث
// - عرض الرصيد + العناصر المفعّلة
// - شراء عنصر (مع quantity للهدايا/stackable) + خيار setActive
// - تفعيل/تبديل العناصر المملوكة (Activate)
// - تحديث (Pull to refresh)
// ملاحظة: إذا عندك مسارات مختلفة أو hooks مختلفة عدّل الاستيرادات فقط.

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  activateStoreItem,
  clearStoreError,
  getMyInventory,
  listStoreItems,
  purchaseStoreItems,
  selectMyStore,
  selectMyStoreLoading,
  selectStoreActivating,
  selectStoreError,
  selectStoreItems,
  selectStoreItemsLoading,
  selectStoreLastPurchase,
  selectStorePurchasing
} from "@/redux/slices/storeControl.slice";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type StoreItemType =
  | "all"
  | "avatarFrame"
  | "badge"
  | "messageEffect"
  | "gift"
  | "profileEntryAnimation"
  | "verification";

const TYPE_TABS: { key: StoreItemType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "avatarFrame", label: "Frames" },
  { key: "badge", label: "Badges" },
  { key: "messageEffect", label: "Effects" },
  { key: "profileEntryAnimation", label: "Entry" },
  { key: "verification", label: "Verify" },
  { key: "gift", label: "Gifts" }
];

export default function StoreScreen() {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectStoreItems);
  const itemsLoading = useAppSelector(selectStoreItemsLoading);

  const my = useAppSelector(selectMyStore);
  const myLoading = useAppSelector(selectMyStoreLoading);

  const purchasing = useAppSelector(selectStorePurchasing);
  const activating = useAppSelector(selectStoreActivating);
  const error = useAppSelector(selectStoreError);
  const lastPurchase = useAppSelector(selectStoreLastPurchase);

  const [tab, setTab] = useState<StoreItemType>("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Purchase modal
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItemId, setBuyItemId] = useState<string>("");
  const [buyQty, setBuyQty] = useState<number>(1);
  const [buySetActive, setBuySetActive] = useState(true);

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
    const query = q.trim().toLowerCase();
    return (items || []).filter((it: any) => {
      const okType = tab === "all" ? true : String(it.type) === tab;
      if (!okType) return false;
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
    return order
      .filter((k) => byType[k]?.length)
      .map((k) => ({ type: k, rows: byType[k] }));
  }, [my?.inventory]);

  async function loadAll() {
    const typeParam = tab === "all" ? "" : tab;
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

  useEffect(() => {
    // إشعار بسيط بعد الشراء
    if (lastPurchase?.totalCost) {
      // لا نُظهر Alert متكرر بدون تحكم؛ هذه مجرد لمسة UX.
    }
  }, [lastPurchase]);

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

    // لو العنصر غير stackable وغير consumable وتمتلكه، امنع الشراء
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
      // تحديث المخزون لضمان ظهور العنصر فورًا
      dispatch(getMyInventory() as any);
    }
  };

  const doActivate = async (type: any, key: string) => {
    const res = await dispatch(activateStoreItem({ type, key }) as any);
    if (activateStoreItem.fulfilled.match(res)) {
      // OK
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerWrap}>
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <Text style={styles.balanceValue}>{formatCoinz(coinz)} Coinz</Text>
          </View>

          <View style={styles.activeBox}>
            <Text style={styles.activeTitle}>Active</Text>
            <View style={styles.activeRow}>
              <Tag label={`Frame: ${active.avatarFrame || "none"}`} />
              <Tag label={`Effect: ${active.messageEffect || "none"}`} />
            </View>
            <View style={styles.activeRow}>
              <Tag label={`Entry: ${active.profileEntryAnimation || "none"}`} />
              <Tag label={`Verify: ${active.verificationType || "none"}`} />
            </View>
            <View style={styles.activeRow}>
              <Tag label={`Badges: ${(active.badges || []).length}`} />
            </View>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search items..."
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
          <Text style={styles.sectionTitle}>Store Items</Text>
          {(itemsLoading || myLoading) && <ActivityIndicator />}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const ownedSet = ownedKeysByType[String(item.type)] || new Set<string>();
    const isOwned = ownedSet.has(String(item.key));

    const isActive =
      (item.type === "avatarFrame" && String(active.avatarFrame || "") === String(item.key)) ||
      (item.type === "messageEffect" && String(active.messageEffect || "") === String(item.key)) ||
      (item.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === String(item.key)) ||
      (item.type === "badge" && (active.badges || []).includes(String(item.key))) ||
      (item.type === "verification" && String(active.verificationType || "none") === String(item.meta?.verificationType || item.key));

    const canActivate =
      isOwned &&
      (item.type === "avatarFrame" ||
        item.type === "messageEffect" ||
        item.type === "profileEntryAnimation" ||
        item.type === "badge" ||
        item.type === "verification");

    const buyDisabled = purchasing || activating;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name || item.key}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {prettyType(item.type)} • {item.key}
            </Text>
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
          {isActive ? <Chip text="Active" tone="gold" /> : null}
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
              !canActivate || buyDisabled ? styles.btnDisabled : null
            ]}
            onPress={() => {
              // تفعيل verification: الأفضل أن يكون key هو verificationType من meta
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
                // toggle badge add/remove
                const has = (active.badges || []).includes(String(item.key));
                doActivate("badge", String(item.key));
                // ملاحظة: controller الحالي badge يعمل set/add/remove حسب mode
                // هنا سنرسل add/remove لو تحب:
                // dispatch(activateStoreItem({type:"badge", key:item.key, mode: has ? "remove" : "add"}))
              } else {
                doActivate(item.type, String(item.key));
              }
            }}
            disabled={!canActivate || buyDisabled}
          >
            <Text style={styles.btnSecondaryText}>Activate</Text>
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

                const isActive =
                  (g.type === "avatarFrame" && String(active.avatarFrame || "") === key) ||
                  (g.type === "messageEffect" && String(active.messageEffect || "") === key) ||
                  (g.type === "profileEntryAnimation" && String(active.profileEntryAnimation || "") === key) ||
                  (g.type === "badge" && (active.badges || []).includes(key));

                return (
                  <View key={row._id} style={styles.ownedRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ownedName} numberOfLines={1}>
                        {item?.name || key}
                      </Text>
                      <Text style={styles.ownedMeta} numberOfLines={1}>
                        {key}
                        {qty > 1 ? ` • qty: ${qty}` : ""}
                      </Text>
                    </View>

                    <View style={styles.ownedRight}>
                      {isActive ? <Chip text="Active" tone="gold" /> : null}
                      {(g.type === "avatarFrame" ||
                        g.type === "messageEffect" ||
                        g.type === "profileEntryAnimation") && (
                        <TouchableOpacity
                          style={[styles.miniBtn, activating ? styles.btnDisabled : null]}
                          onPress={() => doActivate(g.type, key)}
                          disabled={activating}
                        >
                          <Text style={styles.miniBtnText}>Use</Text>
                        </TouchableOpacity>
                      )}
                      {g.type === "badge" && (
                        <TouchableOpacity
                          style={[styles.miniBtn, activating ? styles.btnDisabled : null]}
                          onPress={() =>
                            dispatch(
                              activateStoreItem({
                                type: "badge",
                                key,
                                mode: (active.badges || []).includes(key) ? "remove" : "add"
                              }) as any
                            )
                          }
                          disabled={activating}
                        >
                          <Text style={styles.miniBtnText}>
                            {(active.badges || []).includes(key) ? "Remove" : "Add"}
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

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(x: any) => String(x._id)}
        renderItem={renderItem}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderOwned}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          itemsLoading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.emptyText}>Loading items...</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No items match your search.</Text>
            </View>
          )
        }
      />

      {/* Purchase Modal */}
      <Modal transparent visible={buyOpen} animationType="fade" onRequestClose={() => setBuyOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBuyOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
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
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Price</Text>
                  <Text style={styles.modalValue}>{formatCoinz(Number(selectedItem.priceCoinz || 0))} Coinz</Text>
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

                <Text style={styles.modalHint}>
                  Your balance: {formatCoinz(coinz)} Coinz
                </Text>
              </>
            )}
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
  // عرض 1,234,567 بدون كسور
  return Math.round(x).toLocaleString();
}

function Chip({ text, tone }: { text: string; tone: "good" | "info" | "neutral" | "gold" }) {
  const bg =
    tone === "good"
      ? "#0F766E"
      : tone === "info"
      ? "#1D4ED8"
      : tone === "gold"
      ? "#A16207"
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

  listContent: {
    padding: 12,
    paddingBottom: 24
  },

  headerWrap: {
    gap: 10,
    paddingBottom: 10
  },

  balanceCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2A44",
    gap: 10
  },

  balanceTitle: { color: "#94A3B8", fontSize: 12, marginBottom: 4 },
  balanceValue: { color: "#E2E8F0", fontSize: 22, fontWeight: "800" },

  activeBox: {
    marginTop: 6,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#0B1326",
    borderWidth: 1,
    borderColor: "#1F2A44"
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
  tabPillActive: {
    backgroundColor: "#111D3A",
    borderColor: "#3B82F6"
  },
  tabText: { color: "#CBD5E1", fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#E2E8F0" },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#E2E8F0", fontSize: 16, fontWeight: "900" },

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

  priceBox: {
    minWidth: 96,
    alignItems: "flex-end",
    paddingLeft: 8
  },
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

  toggle: {
    width: 54,
    height: 30,
    borderRadius: 999,
    padding: 3,
    justifyContent: "center"
  },
  toggleOn: { backgroundColor: "#2563EB" },
  toggleOff: { backgroundColor: "#334155" },
  toggleKnob: { width: 24, height: 24, borderRadius: 999, backgroundColor: "#E2E8F0" },
  knobOn: { alignSelf: "flex-end" },
  knobOff: { alignSelf: "flex-start" },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  modalHint: { color: "#94A3B8", fontSize: 12, marginTop: 10 }
});