
import BadgeLottiePickerModal from "@/components/store/BadgeLottiePickerModal";
import StoreBadgePreview from "@/components/store/StoreBadgePreview";
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
import { debitMyCoinz, registerNoLogin } from "@/redux/slices/userSlice";
import api from "@/services/api";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

/* =========================================================
   HELPERS
========================================================= */

function prettyType(t: string, tr: (key: string) => string) {
  switch (t) {
    case "avatarFrame":
      return tr("storeScreen.prettyType.avatarFrame");
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

function pillTone(
  theme: AppTheme,
  tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning"
) {
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
  tone,
  isRTL,
}: {
  theme: AppTheme;
  text: string;
  tone: "good" | "info" | "neutral" | "gold" | "danger" | "warning";
  isRTL: boolean;
}) {
  const c = pillTone(theme, tone);
  return (
    <View style={[ui.pill, { backgroundColor: c.bg, borderColor: theme.border }]}>
      <Text
        style={[
          ui.pillText,
          {
            color: c.fg,
            textAlign: isRTL ? "right" : "left",
            writingDirection: isRTL ? "rtl" : "ltr",
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function PrimaryButton({
  theme,
  title,
  onPress,
  disabled,
  loading,
  isRTL,
}: {
  theme: AppTheme;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isRTL: boolean;
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
          opacity: isDis ? 0.62 : 1,
        },
      ]}
    >
      <View style={[ui.btnRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {loading ? <ActivityIndicator size="small" color={theme.primaryText} /> : null}
        <Text
          style={[
            ui.btnText,
            {
              color: theme.primaryText,
              textAlign: isRTL ? "right" : "left",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  theme,
  title,
  onPress,
  disabled,
  loading,
  isRTL,
}: {
  theme: AppTheme;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isRTL: boolean;
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
          opacity: isDis ? 0.62 : 1,
        },
      ]}
    >
      <View style={[ui.btnRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {loading ? <ActivityIndicator size="small" color={theme.text} /> : null}
        <Text
          style={[
            ui.btnText,
            {
              color: theme.text,
              textAlign: isRTL ? "right" : "left",
              writingDirection: isRTL ? "rtl" : "ltr",
            },
          ]}
        >
          {title}
        </Text>
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
  editable = true,
  maxLength,
  isRTL,
}: {
  theme: AppTheme;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  maxLength?: number;
  isRTL: boolean;
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
      maxLength={maxLength}
      style={[
        ui.input,
        {
          color: theme.text,
          backgroundColor: theme.surface2,
          borderColor: theme.border,
          opacity: editable ? 1 : 0.7,
          textAlign: isRTL ? "right" : "left",
          writingDirection: isRTL ? "rtl" : "ltr",
        },
      ]}
    />
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function StoreScreen() {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
const { t, isRTL } = useTranslation();
  const row = isRTL ? "row-reverse" : "row";
  const textAlign = isRTL ? "right" : "left";
  const writingDirection = isRTL ? "rtl" : "ltr";
  const alignStart = isRTL ? "flex-end" : "flex-start";
  const alignEnd = isRTL ? "flex-start" : "flex-end";

  const s = useMemo(() => createStyles(theme, isRTL), [theme, isRTL]);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const TYPE_TABS: { key: UiTab; label: string }[] = useMemo(
    () => [
      { key: "all", label: t("storeScreen.tabs.all") },
      { key: "coinz", label: t("storeScreen.tabs.coinz") },
      { key: "avatarFrame", label: t("storeScreen.tabs.avatarFrame") },
      { key: "badge", label: t("storeScreen.tabs.badge") },
      { key: "messageEffect", label: t("storeScreen.tabs.messageEffect") },
      { key: "profileEntryAnimation", label: t("storeScreen.tabs.profileEntryAnimation") },
      { key: "gift", label: t("storeScreen.tabs.gift") },
      { key: "bundles", label: t("storeScreen.tabs.bundles") },
      { key: "limited", label: t("storeScreen.tabs.limited") },
    ],
    [t]
  );

  const COINZ_PACKS: {
    packageId: "p1" | "p2" | "p3";
    title: string;
    subtitle?: string;
    priceEGP: number;
    coinz: number;
  }[] = useMemo(
    () => [
      {
        packageId: "p1",
        title: t("storeScreen.coinzPacks.p1.title"),
        subtitle: t("storeScreen.coinzPacks.p1.subtitle"),
        priceEGP: 10,
        coinz: 100,
      },
      {
        packageId: "p2",
        title: t("storeScreen.coinzPacks.p2.title"),
        subtitle: t("storeScreen.coinzPacks.p2.subtitle"),
        priceEGP: 25,
        coinz: 260,
      },
      {
        packageId: "p3",
        title: t("storeScreen.coinzPacks.p3.title"),
        subtitle: t("storeScreen.coinzPacks.p3.subtitle"),
        priceEGP: 50,
        coinz: 550,
      },
    ],
    [t]
  );

  const CREATE_ACCOUNT_COST = 30000;
  const CUSTOM_EMOJI_BADGE_COST = 2500;

  const items = useAppSelector(selectStoreItems);
  const itemsLoading = useAppSelector(selectStoreItemsLoading);

  const my = useAppSelector(selectMyStore);
  const myLoading = useAppSelector(selectMyStoreLoading);

  const customEmojiBadge = useAppSelector(selectMyCustomEmojiBadge);

  const purchasing = useAppSelector(selectStorePurchasing);
  const activating = useAppSelector(selectStoreActivating);
  const buyingCoinz = useAppSelector(selectStoreBuyingCoinz);
  const buyingCustomEmojiBadge = useAppSelector(selectStoreBuyingCustomEmojiBadge);
  const activatingCustomEmojiBadge = useAppSelector(selectStoreActivatingCustomEmojiBadge);
  const loadingCustomEmojiBadge = useAppSelector(selectStoreLoadingCustomEmojiBadge);
  const error = useAppSelector(selectStoreError);

  const [tab, setTab] = useState<UiTab>("all");
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [tabLoading, setTabLoading] = useState(false);
  const [paymobLoadingPackId, setPaymobLoadingPackId] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [activateKeyLoading, setActivateKeyLoading] = useState<string | null>(null);
  const [buySubmitting, setBuySubmitting] = useState(false);
const [badgePickerOpen, setBadgePickerOpen] = useState(false);
const [badgePickerSubmitting, setBadgePickerSubmitting] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItemId, setBuyItemId] = useState<string>("");
  const [buyQty, setBuyQty] = useState<number>(1);
  const [buySetActive, setBuySetActive] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [createdOpen, setCreatedOpen] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(
    null
  );

  const [emojiBadgeOpen, setEmojiBadgeOpen] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [customEmojiSetActive, setCustomEmojiSetActive] = useState(true);

  const coinz = my?.coinzBalance ?? 0;

  const active = my?.activeCustomization || {
    avatarFrame: "",
    messageEffect: "",
    profileEntryAnimation: "",
    badges: [],
    verificationType: "none",
  };

  const customBadgeExpired = useMemo(() => {
    return !!customEmojiBadge?.expiresAt && isExpired(customEmojiBadge.expiresAt);
  }, [customEmojiBadge?.expiresAt]);

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
    const order = [
      "avatarFrame",
      "badge",
      "messageEffect",
      "profileEntryAnimation",
      "verification",
      "gift",
    ];
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

  const loadAll = useCallback(async () => {
    setTabLoading(true);
    try {
      if (tab === "coinz") {
        await Promise.all([dispatch(getMyInventory() as any), dispatch(getMyCustomEmojiBadge() as any)]);
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
        dispatch(getMyInventory() as any),
        dispatch(getMyCustomEmojiBadge() as any),
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

  const globalBusy =
    tabLoading ||
    refreshing ||
    itemsLoading ||
    myLoading ||
    loadingCustomEmojiBadge ||
    purchasing ||
    activating ||
    buyingCoinz ||
    buyingCustomEmojiBadge ||
    activatingCustomEmojiBadge ||
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
    if (!selectedItem || buySubmitting) return;

    setBuySubmitting(true);
    try {
      const qty = Math.max(1, Number(buyQty || 1));

      const ownedSet = ownedKeysByType[String(selectedItem.type)] || new Set();
      const alreadyOwned = ownedSet.has(String(selectedItem.key));
      const nonRepeatable = !selectedItem.isStackable && !selectedItem.isConsumable;

      if (alreadyOwned && nonRepeatable) {
        Alert.alert(t("storeScreen.alerts.alreadyOwnedTitle"), t("storeScreen.alerts.alreadyOwnedMessage"));
        return;
      }

      const res = await dispatch(
        purchaseStoreItems({
          items: [{ itemId: selectedItem._id, quantity: qty }],
          setActive: buySetActive,
        }) as any
      );

      if (purchaseStoreItems.fulfilled.match(res)) {
        setBuyOpen(false);
        await dispatch(getMyInventory() as any);
      }
    } finally {
      setBuySubmitting(false);
    }
  }, [selectedItem, buySubmitting, buyQty, ownedKeysByType, buySetActive, dispatch, t]);

  const doActivate = useCallback(
    async (type: any, key: string, mode?: "set" | "add" | "remove") => {
      const loadingKey = `${String(type)}:${String(key)}:${String(mode || "set")}`;
      if (activateKeyLoading) return;

      const invKey = `${String(type)}:${String(key)}`;
      const inv = ownedByTypeKey.get(invKey);

      if (inv?.expiresAt && isExpired(inv.expiresAt)) {
        Alert.alert(t("storeScreen.alerts.expiredTitle"), t("storeScreen.alerts.expiredItemMessage"));
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
    [dispatch, ownedByTypeKey, activateKeyLoading, t]
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
      Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.usernameRequired"));
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert(t("storeScreen.createAccount.title"), t("storeScreen.createAccount.passwordMin"));
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
      const debitRes = await dispatch(
        debitMyCoinz({ amount: CREATE_ACCOUNT_COST, reason: "create_account" }) as any
      );

      if (!debitMyCoinz.fulfilled.match(debitRes)) {
        Alert.alert(
          t("storeScreen.createAccount.title"),
          String((debitRes as any).payload || t("storeScreen.createAccount.debitFailed"))
        );
        return;
      }

      const regRes = await dispatch(registerNoLogin({ username, password }) as any);

      if (!registerNoLogin.fulfilled.match(regRes)) {
        Alert.alert(
          t("storeScreen.createAccount.title"),
          String((regRes as any).payload || t("storeScreen.createAccount.registrationFailed"))
        );
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
  }, [createSubmitting, newUsername, newPassword, coinz, dispatch, t]);

  const copyCreatedCreds = useCallback(async () => {
    if (!createdCreds || copyLoading) return;

    setCopyLoading(true);
    try {
      await Clipboard.setStringAsync(
        `${t("storeScreen.createAccount.usernameField")}: ${createdCreds.username}\n${t("storeScreen.createAccount.passwordField")}: ${createdCreds.password}`
      );
      Alert.alert(t("storeScreen.alerts.copiedTitle"), t("storeScreen.alerts.credentialsCopied"));
    } finally {
      setCopyLoading(false);
    }
  }, [createdCreds, copyLoading, t]);

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

        router.push({
          pathname: "/paymob-checkout",
          params: { url: paymentUrl },
        });
      } catch (e: any) {
        Alert.alert(
          t("storeScreen.coinz.buyTitle"),
          e?.response?.data?.message || t("storeScreen.coinz.paymentCreateFailed")
        );
      } finally {
        setPaymobLoadingPackId(null);
      }
    },
    [router, paymobLoadingPackId, t]
  );

  const openCustomEmojiBadge = useCallback(() => {
    setCustomEmojiInput(customEmojiBadge?.emoji || "");
    setCustomEmojiSetActive(true);
    setEmojiBadgeOpen(true);
  }, [customEmojiBadge?.emoji]);

  const doBuyCustomEmojiBadge = useCallback(async () => {
    const emoji = customEmojiInput.trim();

    if (!emoji) {
      Alert.alert(t("storeScreen.customEmoji.title"), t("storeScreen.customEmoji.enterEmoji"));
      return;
    }

    const res = await dispatch(
      buyCustomEmojiBadge({
        emoji,
        setActive: customEmojiSetActive,
      }) as any
    );

    if (buyCustomEmojiBadge.fulfilled.match(res)) {
      setEmojiBadgeOpen(false);
      await dispatch(getMyInventory() as any);
      await dispatch(getMyCustomEmojiBadge() as any);
    }
  }, [customEmojiInput, customEmojiSetActive, dispatch, t]);

  const doToggleCustomEmojiBadge = useCallback(async () => {
    if (!customEmojiBadge?.emoji) {
      Alert.alert(t("storeScreen.customEmoji.title"), t("storeScreen.customEmoji.notOwnedYet"));
      return;
    }

    if (customBadgeExpired) {
      Alert.alert(t("storeScreen.alerts.expiredTitle"), t("storeScreen.customEmoji.expiredBuyAgain"));
      return;
    }

    const res = await dispatch(
      activateCustomEmojiBadge({
        active: !Boolean(customEmojiBadge?.isActive),
      }) as any
    );

    if (activateCustomEmojiBadge.fulfilled.match(res)) {
      await dispatch(getMyCustomEmojiBadge() as any);
      await dispatch(getMyInventory() as any);
    }
  }, [customEmojiBadge?.emoji, customEmojiBadge?.isActive, customBadgeExpired, dispatch, t]);

  const data = tab === "coinz" ? COINZ_PACKS : filtered;
  const buyDisabled = globalBusy || buyOpen || createOpen || badgePickerSubmitting || createdOpen || emojiBadgeOpen;

  const renderHeader = useCallback(() => {
    return (
      <View style={s.headerWrap}>
        <View style={s.heroCard}>
          <View
            style={{
              flexDirection: row,
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.heroKicker, { textAlign, writingDirection }]}>{t("storeScreen.wallet.title")}</Text>
              <Text style={[s.heroBalance, { textAlign, writingDirection }]}>
                {formatCoinz(coinz)} {t("storeScreen.common.coinz")}
              </Text>
              <Text style={[s.heroSub, { textAlign, writingDirection }]}>
                {t("storeScreen.wallet.subtitle")}
              </Text>
            </View>

            <PrimaryButton
              theme={theme}
              title={tab === "coinz" ? t("storeScreen.tabs.coinz") : t("storeScreen.wallet.buyCoinz")}
              onPress={() => setTab("coinz")}
              disabled={tabLoading || buyingCoinz}
              loading={tabLoading || buyingCoinz}
              isRTL={isRTL}
            />
          </View>

          <Spacer h={12} />
          <Hairline theme={theme} />
          <Spacer h={12} />

          <View style={s.activeGrid}>
            <View style={s.activeChip}>
              <Text style={[s.activeLabel, { textAlign, writingDirection }]}>{t("storeScreen.active.frame")}</Text>
              <Text style={[s.activeValue, { textAlign, writingDirection }]} numberOfLines={1}>
                {active.avatarFrame || t("storeScreen.common.none")}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={[s.activeLabel, { textAlign, writingDirection }]}>{t("storeScreen.active.effect")}</Text>
              <Text style={[s.activeValue, { textAlign, writingDirection }]} numberOfLines={1}>
                {active.messageEffect || t("storeScreen.common.none")}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={[s.activeLabel, { textAlign, writingDirection }]}>{t("storeScreen.active.entry")}</Text>
              <Text style={[s.activeValue, { textAlign, writingDirection }]} numberOfLines={1}>
                {active.profileEntryAnimation || t("storeScreen.common.none")}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={[s.activeLabel, { textAlign, writingDirection }]}>{t("storeScreen.active.badges")}</Text>
              <Text style={[s.activeValue, { textAlign, writingDirection }]} numberOfLines={1}>
                {(active.badges || []).length}
              </Text>
            </View>

            <View style={s.activeChip}>
              <Text style={[s.activeLabel, { textAlign, writingDirection }]}>
                {t("storeScreen.active.emojiBadge")}
              </Text>
              <Text style={[s.activeValue, { textAlign, writingDirection }]} numberOfLines={1}>
                {customEmojiBadge?.emoji
                  ? `${customEmojiBadge.emoji} ${
                      customEmojiBadge.isActive && !customBadgeExpired
                        ? t("storeScreen.common.active")
                        : t("storeScreen.common.owned")
                    }`
                  : t("storeScreen.common.none")}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.searchWrap}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={tab === "coinz" ? t("storeScreen.search.coinz") : t("storeScreen.search.store")}
            placeholderTextColor={theme.subtleText}
            style={[s.searchInput, { textAlign, writingDirection }]}
          />
        </View>

        <FlatList
          data={TYPE_TABS}
          horizontal
          inverted={isRTL}
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
                  buyDisabled ? { opacity: 0.65 } : null,
                ]}
              >
                <Text style={[s.tabText, activeTab ? s.tabTextActive : null, { textAlign, writingDirection }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <View style={s.sectionRow}>
          <View style={{ gap: 2, alignItems: alignStart }}>
            <Text style={[s.sectionTitle, { textAlign, writingDirection }]}>
              {tab === "coinz" ? t("storeScreen.sections.coinzPacks") : t("storeScreen.sections.store")}
            </Text>
            <Text style={[s.sectionSub, { textAlign, writingDirection }]}>
              {tab === "coinz" ? t("storeScreen.sections.coinzSub") : t("storeScreen.sections.storeSub")}
            </Text>
          </View>

          {itemsLoading || myLoading || tabLoading || loadingCustomEmojiBadge ? <ActivityIndicator /> : null}
        </View>

        {tab === "coinz" ? (
          <View style={s.noteCard}>
            <Text style={[s.noteText, { textAlign, writingDirection }]}>
              {t("storeScreen.coinz.redirectNote")}
            </Text>
          </View>
        ) : null}

        <View style={s.modernCard}>
          <View style={[s.cardTop, { flexDirection: row }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.cardTitle")}</Text>
              <Text style={[s.cardDesc, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.cardDesc")}</Text>

              <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                <Pill theme={theme} text={t("storeScreen.common.custom")} tone="info" isRTL={isRTL} />
                <Pill theme={theme} text={t("storeScreen.common.days30")} tone="neutral" isRTL={isRTL} />
                <Pill
                  theme={theme}
                  text={`${formatCoinz(CUSTOM_EMOJI_BADGE_COST)} ${t("storeScreen.common.coinz")}`}
                  tone="gold"
                  isRTL={isRTL}
                />
                {customEmojiBadge?.emoji ? (
                  <Pill
                    theme={theme}
                    text={
                      customBadgeExpired
                        ? t("storeScreen.common.expired")
                        : customEmojiBadge.isActive
                          ? t("storeScreen.common.active")
                          : t("storeScreen.common.owned")
                    }
                    tone={customBadgeExpired ? "danger" : customEmojiBadge.isActive ? "good" : "info"}
                    isRTL={isRTL}
                  />
                ) : null}
              </View>

              {customEmojiBadge?.emoji ? (
                <Text style={[s.itemSmall, { textAlign, writingDirection }]}>
                  {t("storeScreen.customEmoji.current")}{" "}
                  <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
                    {customEmojiBadge.emoji}
                  </Text>
                  {customEmojiBadge?.expiresAt ? (
                    <>
                      {"  •  "}
                      {t("storeScreen.common.expires")}{" "}
                      <Text style={{ color: theme.text, fontWeight: "800" }}>
                        {formatDate(customEmojiBadge.expiresAt)}
                      </Text>
                    </>
                  ) : null}
                </Text>
              ) : (
                <Text style={[s.itemSmall, { textAlign, writingDirection }]}>
                  {t("storeScreen.customEmoji.noneOwned")}
                </Text>
              )}
            </View>

            <View style={s.emojiBadgeBox}>
              <Text style={s.emojiBadgePreview}>
                {customEmojiBadge?.emoji && !customBadgeExpired ? customEmojiBadge.emoji : "🙂"}
              </Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={
                customEmojiBadge?.emoji && !customBadgeExpired
                  ? t("storeScreen.customEmoji.replaceBadge")
                  : t("storeScreen.customEmoji.buyBadge")
              }
              onPress={openCustomEmojiBadge}
              disabled={buyDisabled || coinz < CUSTOM_EMOJI_BADGE_COST}
              loading={buyingCustomEmojiBadge}
              isRTL={isRTL}
            />
            <SecondaryButton
              theme={theme}
              title={
                customBadgeExpired
                  ? t("storeScreen.common.expired")
                  : customEmojiBadge?.isActive
                    ? t("storeScreen.common.deactivate")
                    : t("storeScreen.common.activate")
              }
              onPress={doToggleCustomEmojiBadge}
              disabled={!customEmojiBadge?.emoji || customBadgeExpired || buyDisabled}
              loading={activatingCustomEmojiBadge}
              isRTL={isRTL}
            />
          </View>
        </View>
<View style={s.modernCard}>
  <View style={[s.cardTop, { flexDirection: row }]}>
    <View style={{ flex: 1 }}>
      <Text style={[s.cardTitle, { textAlign, writingDirection }]}>
        {t("storeScreen.badgePicker.cardTitle")}
      </Text>

      <Text style={[s.cardDesc, { textAlign, writingDirection }]}>
        {t("storeScreen.badgePicker.cardDesc")}
      </Text>

      <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
        <Pill
          theme={theme}
          text={t("storeScreen.common.animated")}
          tone="info"
          isRTL={isRTL}
        />
        <Pill
          theme={theme}
          text={`2000 ${t("storeScreen.common.coinz")}`}
          tone="gold"
          isRTL={isRTL}
        />
        <Pill
          theme={theme}
          text={`30 ${t("storeScreen.common.daysSuffix")}`}
          tone="neutral"
          isRTL={isRTL}
        />
      </View>

      <Text style={[s.itemSmall, { textAlign, writingDirection }]}>
        {t("storeScreen.badgePicker.chooseFromList")}
      </Text>
    </View>

    <View style={s.emojiBadgeBox}>
      {badgeItems?.[0] ? (
        <StoreBadgePreview
          item={badgeItems[0]}
          size={78}
          borderRadius={22}
          backgroundColor={theme.surface2}
          borderColor={theme.border}
          fallbackText={t("storeScreen.common.img")}
        />
      ) : (
        <Text style={{ color: theme.subtleText, fontWeight: "900" }}>
          {t("storeScreen.common.img")}
        </Text>
      )}
    </View>
  </View>

  <View style={s.actionsRow}>
    <PrimaryButton
      theme={theme}
      title={t("storeScreen.badgePicker.openList")}
      onPress={openBadgePicker}
      disabled={buyDisabled || !badgeItems.length}
      loading={badgePickerSubmitting}
      isRTL={isRTL}
    />
    <SecondaryButton
      theme={theme}
      title={t("storeScreen.tabs.badge")}
      onPress={() => setTab("badge")}
      disabled={buyDisabled}
      isRTL={isRTL}
    />
  </View>
</View>
        <View style={s.modernCard}>
          <View style={[s.cardTop, { flexDirection: row }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { textAlign, writingDirection }]}>{t("storeScreen.createAccount.cardTitle")}</Text>
              <Text style={[s.cardDesc, { textAlign, writingDirection }]}>
                {t("storeScreen.createAccount.cardDescPrefix")} {formatCoinz(CREATE_ACCOUNT_COST)}{" "}
                {t("storeScreen.common.coinz")} {t("storeScreen.createAccount.cardDescSuffix")}
              </Text>

              <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                <Pill theme={theme} text={t("storeScreen.common.service")} tone="info" isRTL={isRTL} />
                <Pill theme={theme} text={t("storeScreen.common.oneTime")} tone="neutral" isRTL={isRTL} />
                <Pill
                  theme={theme}
                  text={`${formatCoinz(CREATE_ACCOUNT_COST)} ${t("storeScreen.common.coinz")}`}
                  tone="gold"
                  isRTL={isRTL}
                />
              </View>
            </View>

            <View style={[s.priceBox, { alignItems: alignEnd }]}>
              <Text style={[s.priceLabel, { textAlign, writingDirection }]}>{t("storeScreen.common.cost")}</Text>
              <Text style={[s.priceValue, { textAlign, writingDirection }]}>{formatCoinz(CREATE_ACCOUNT_COST)}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={
                coinz < CREATE_ACCOUNT_COST
                  ? t("storeScreen.common.insufficient")
                  : t("storeScreen.common.create")
              }
              onPress={openCreateAccount}
              disabled={buyDisabled || coinz < CREATE_ACCOUNT_COST}
              loading={createSubmitting}
              isRTL={isRTL}
            />
            <SecondaryButton
              theme={theme}
              title={t("storeScreen.common.details")}
              onPress={() =>
                Alert.alert(
                  t("storeScreen.createAccount.title"),
                  t("storeScreen.createAccount.detailsMessage")
                )
              }
              disabled={buyDisabled}
              isRTL={isRTL}
            />
          </View>
        </View>
      </View>
    );
  }, [
    s,
    row,
    textAlign,
    writingDirection,
    alignStart,
    alignEnd,
    theme,
    q,
    tab,
    buyDisabled,
    coinz,
    tabLoading,
    buyingCoinz,
    itemsLoading,
    myLoading,
    loadingCustomEmojiBadge,
    active,
    createSubmitting,
    openCreateAccount,
    customEmojiBadge,
    customBadgeExpired,
    buyingCustomEmojiBadge,
    activatingCustomEmojiBadge,
    openCustomEmojiBadge,
    doToggleCustomEmojiBadge,
    TYPE_TABS,
    t,
    isRTL,
  ]);

  const renderStoreItem = useCallback(
    ({ item }: any) => {
      const ownedSet = ownedKeysByType[String(item.type)] || new Set<string>();
      const isOwned = ownedSet.has(String(item.key));

      const inv = ownedByTypeKey.get(`${String(item.type)}:${String(item.key)}`);
      const expired = inv?.expiresAt ? isExpired(inv.expiresAt) : false;

      const days = Number(item.durationDays || 0);
      const durationLabel =
        days > 0 ? `${days} ${t("storeScreen.common.daysSuffix")}` : t("storeScreen.common.permanent");

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

      const activateKey =
        item.type === "verification"
          ? `verification:${String(item.meta?.verificationType || item.key)}:set`
          : `${String(item.type)}:${String(item.key)}:set`;

      const isActivateLoading = activateKeyLoading === activateKey;

      return (
        <View style={s.modernCard}>
          <View style={[s.itemTop, { flexDirection: row }]}>
            <View style={s.thumbWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={s.thumb} resizeMode="cover" />
              ) : (
                <View
                  style={[
                    s.thumb,
                    {
                      backgroundColor: theme.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={{ color: theme.subtleText, fontWeight: "900" }}>{t("storeScreen.common.img")}</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[s.itemTitle, { textAlign, writingDirection }]} numberOfLines={1}>
                {item.name || item.key}
              </Text>
              <Text style={[s.itemMeta, { textAlign, writingDirection }]} numberOfLines={1}>
                {prettyType(item.type, t)} • {item.key}
              </Text>

              <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                <Pill
                  theme={theme}
                  text={days > 0 ? t("storeScreen.common.timed") : t("storeScreen.common.permanent")}
                  tone="neutral"
                  isRTL={isRTL}
                />
                {isOwned ? (
                  <Pill theme={theme} text={t("storeScreen.common.owned")} tone="good" isRTL={isRTL} />
                ) : (
                  <Pill theme={theme} text={t("storeScreen.common.new")} tone="info" isRTL={isRTL} />
                )}
                {isActiveNow ? (
                  <Pill theme={theme} text={t("storeScreen.common.active")} tone="gold" isRTL={isRTL} />
                ) : null}
                {expired ? (
                  <Pill theme={theme} text={t("storeScreen.common.expired")} tone="danger" isRTL={isRTL} />
                ) : null}
                {String(item.meta?.category || "").toLowerCase() === "bundle" ? (
                  <Pill theme={theme} text={t("storeScreen.common.bundle")} tone="info" isRTL={isRTL} />
                ) : null}
                {Boolean(item.meta?.isLimited) ? (
                  <Pill theme={theme} text={t("storeScreen.common.limited")} tone="warning" isRTL={isRTL} />
                ) : null}
              </View>

              <Text style={[s.itemSmall, { textAlign, writingDirection }]}>
                {t("storeScreen.common.duration")}{" "}
                <Text style={{ color: theme.text, fontWeight: "800" }}>{durationLabel}</Text>
                {isOwned && inv?.expiresAt ? (
                  <>
                    {"  •  "}
                    {t("storeScreen.common.expires")}{" "}
                    <Text style={{ color: theme.text, fontWeight: "800" }}>
                      {formatDate(inv.expiresAt)}
                    </Text>
                  </>
                ) : null}
              </Text>

              {!!item.description ? (
                <Text style={[s.itemDesc, { textAlign, writingDirection }]} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>

            <View style={[s.priceBox, { alignItems: alignEnd }]}>
              <Text style={[s.priceLabel, { textAlign, writingDirection }]}>{t("storeScreen.common.price")}</Text>
              <Text style={[s.priceValue, { textAlign, writingDirection }]}>{formatCoinz(Number(item.priceCoinz || 0))}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={t("storeScreen.common.buy")}
              onPress={() => openBuy(item._id)}
              disabled={buyDisabled}
              loading={purchasing && buySubmitting}
              isRTL={isRTL}
            />

            <SecondaryButton
              theme={theme}
              title={
                expired
                  ? t("storeScreen.common.expired")
                  : isActivateLoading
                    ? t("storeScreen.common.activating")
                    : t("storeScreen.common.activate")
              }
              onPress={() => {
                if (item.type === "verification") {
                  const vt = String(item.meta?.verificationType || "").trim();
                  if (!vt) {
                    Alert.alert(
                      t("storeScreen.alerts.invalidItemTitle"),
                      t("storeScreen.alerts.verificationTypeMissing")
                    );
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
              isRTL={isRTL}
            />
          </View>
        </View>
      );
    },
    [
      s,
      row,
      textAlign,
      writingDirection,
      alignEnd,
      theme,
      buyDisabled,
      openBuy,
      ownedByTypeKey,
      ownedKeysByType,
      active,
      doActivate,
      activateKeyLoading,
      purchasing,
      buySubmitting,
      t,
      isRTL,
    ]
  );
const badgeItems = useMemo(() => {
  return (items || []).filter(
    (x: any) =>
      String(x.type) === "badge" &&
      Number(x.priceCoinz || 0) === 2000
  );
}, [items]);

const openBadgePicker = useCallback(() => {
  setBadgePickerOpen(true);
}, []);

const doBuyBadgeFromPicker = useCallback(
  async (item: any, setActive: boolean) => {
    if (!item || badgePickerSubmitting) return;

    setBadgePickerSubmitting(true);
    try {
      const ownedSet = ownedKeysByType[String(item.type)] || new Set();
      const alreadyOwned = ownedSet.has(String(item.key));
      const nonRepeatable = !item.isStackable && !item.isConsumable;

      if (alreadyOwned && nonRepeatable) {
        Alert.alert(
          t("storeScreen.alerts.alreadyOwnedTitle"),
          t("storeScreen.alerts.alreadyOwnedMessage")
        );
        return;
      }

      const res = await dispatch(
        purchaseStoreItems({
          items: [{ itemId: item._id, quantity: 1 }],
          setActive,
        }) as any
      );

      if (purchaseStoreItems.fulfilled.match(res)) {
        setBadgePickerOpen(false);
        await dispatch(getMyInventory() as any);
      }
    } finally {
      setBadgePickerSubmitting(false);
    }
  },
  [badgePickerSubmitting, ownedKeysByType, dispatch, t]
);
  const renderCoinzPack = useCallback(
    ({ item }: any) => {
      const query = q.trim().toLowerCase();
      const hay = `${item.title} ${item.priceEGP} ${item.coinz} ${item.subtitle || ""}`.toLowerCase();
      if (query && !hay.includes(query)) return null;

      const loading = paymobLoadingPackId === String(item.packageId);

      return (
        <View style={s.modernCard}>
          <View style={[s.cardTop, { flexDirection: row }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { textAlign, writingDirection }]}>{item.title}</Text>
              <Text style={[s.cardDesc, { textAlign, writingDirection }]}>{item.subtitle || ""}</Text>

              <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                <Pill theme={theme} text="Paymob" tone="good" isRTL={isRTL} />
                <Pill theme={theme} text={`${item.priceEGP} EGP`} tone="neutral" isRTL={isRTL} />
                <Pill
                  theme={theme}
                  text={`${formatCoinz(item.coinz)} ${t("storeScreen.common.coinz")}`}
                  tone="gold"
                  isRTL={isRTL}
                />
              </View>
            </View>

            <View style={[s.priceBox, { alignItems: alignEnd }]}>
              <Text style={[s.priceLabel, { textAlign, writingDirection }]}>{t("storeScreen.coinz.youGet")}</Text>
              <Text style={[s.priceValue, { textAlign, writingDirection }]}>{formatCoinz(item.coinz)}</Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <PrimaryButton
              theme={theme}
              title={loading ? t("storeScreen.coinz.redirecting") : t("storeScreen.coinz.buyNow")}
              onPress={() => startPaymobCoinz(item.packageId)}
              disabled={buyDisabled || loading}
              loading={loading}
              isRTL={isRTL}
            />
            <SecondaryButton
              theme={theme}
              title={t("storeScreen.common.details")}
              onPress={() => Alert.alert(t("storeScreen.common.info"), t("storeScreen.coinz.redirectDetails"))}
              disabled={buyDisabled}
              isRTL={isRTL}
            />
          </View>
        </View>
      );
    },
    [s, row, textAlign, writingDirection, alignEnd, theme, q, paymobLoadingPackId, startPaymobCoinz, buyDisabled, t, isRTL]
  );

  const renderOwned = useCallback(() => {
    return (
      <View style={s.footerWrap}>
        <View style={s.sectionRow}>
          <View style={{ gap: 2, alignItems: alignStart }}>
            <Text style={[s.sectionTitle, { textAlign, writingDirection }]}>{t("storeScreen.inventory.title")}</Text>
            <Text style={[s.sectionSub, { textAlign, writingDirection }]}>{t("storeScreen.inventory.subtitle")}</Text>
          </View>
          {myLoading || activating || loadingCustomEmojiBadge ? <ActivityIndicator /> : null}
        </View>

        <View style={s.groupCard}>
          <View style={[s.groupHeader, { flexDirection: row }]}>
            <Text style={[s.groupTitle, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.cardTitle")}</Text>
            {customEmojiBadge?.emoji ? (
              <Pill
                theme={theme}
                text={
                  customBadgeExpired
                    ? t("storeScreen.common.expired")
                    : customEmojiBadge.isActive
                      ? t("storeScreen.common.active")
                      : t("storeScreen.common.owned")
                }
                tone={customBadgeExpired ? "danger" : customEmojiBadge.isActive ? "gold" : "info"}
                isRTL={isRTL}
              />
            ) : (
              <Pill theme={theme} text={t("storeScreen.common.none")} tone="neutral" isRTL={isRTL} />
            )}
          </View>

          <Spacer h={8} />
          <Hairline theme={theme} />
          <Spacer h={12} />

          {!customEmojiBadge?.emoji ? (
            <View style={s.emptyBox}>
              <Text style={[s.emptyTitle, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.noBadgeTitle")}</Text>
              <Text style={[s.emptySub, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.noBadgeSub")}</Text>
            </View>
          ) : (
            <View style={[s.customOwnedRow, { flexDirection: row }]}>
              <View style={s.customOwnedEmojiWrap}>
                <Text style={s.customOwnedEmoji}>{customEmojiBadge.emoji}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.ownedTitle, { textAlign, writingDirection }]}>{t("storeScreen.customEmoji.ownedTitle")}</Text>
                <Text style={[s.ownedMeta, { textAlign, writingDirection }]}>
                  {t("storeScreen.customEmoji.emojiLabel")} {customEmojiBadge.emoji}
                  {customEmojiBadge?.expiresAt
                    ? ` • ${t("storeScreen.common.expires")} ${formatDate(customEmojiBadge.expiresAt)}`
                    : ""}
                </Text>

                <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                  {customBadgeExpired ? (
                    <Pill theme={theme} text={t("storeScreen.common.expired")} tone="danger" isRTL={isRTL} />
                  ) : null}
                  {customEmojiBadge.isActive && !customBadgeExpired ? (
                    <Pill theme={theme} text={t("storeScreen.common.active")} tone="gold" isRTL={isRTL} />
                  ) : null}
                </View>
              </View>

              <View style={{ alignItems: alignEnd, gap: 8 }}>
                <SecondaryButton
                  theme={theme}
                  title={
                    customEmojiBadge.isActive
                      ? t("storeScreen.common.deactivate")
                      : t("storeScreen.common.activate")
                  }
                  onPress={doToggleCustomEmojiBadge}
                  disabled={buyDisabled || customBadgeExpired}
                  loading={activatingCustomEmojiBadge}
                  isRTL={isRTL}
                />
              </View>
            </View>
          )}
        </View>

        {!my?.inventory?.length ? (
          <View style={s.emptyBox}>
            <Text style={[s.emptyTitle, { textAlign, writingDirection }]}>{t("storeScreen.inventory.noItemsTitle")}</Text>
            <Text style={[s.emptySub, { textAlign, writingDirection }]}>{t("storeScreen.inventory.noItemsSub")}</Text>
          </View>
        ) : (
          groupedOwned.map((g) => (
            <View key={g.type} style={s.groupCard}>
              <View style={[s.groupHeader, { flexDirection: row }]}>
                <Text style={[s.groupTitle, { textAlign, writingDirection }]}>{prettyType(g.type, t)}</Text>
                <Pill theme={theme} text={`${g.rows.length}`} tone="neutral" isRTL={isRTL} />
              </View>

              <Spacer h={8} />
              <Hairline theme={theme} />
              <Spacer h={8} />

              {g.rows.map((rowItem: any) => {
                const key = String(rowItem.itemKey);
                const qty = Number(rowItem.quantity || 0);
                const item = rowItem.item;
                const expired = rowItem?.expiresAt ? isExpired(rowItem.expiresAt) : false;
                const imageUrl = getItemImageUrl(item);

                const isActiveNow =
                  (g.type === "avatarFrame" && String(active.avatarFrame || "") === key) ||
                  (g.type === "messageEffect" && String(active.messageEffect || "") === key) ||
                  (g.type === "profileEntryAnimation" &&
                    String(active.profileEntryAnimation || "") === key) ||
                  (g.type === "badge" && (active.badges || []).includes(key));

                const useKey = `${String(g.type)}:${String(key)}:set`;
                const useLoading = activateKeyLoading === useKey;

                const canQuickUse =
                  !expired &&
                  (g.type === "avatarFrame" ||
                    g.type === "messageEffect" ||
                    g.type === "profileEntryAnimation");

                return (
                  <View key={rowItem._id} style={[s.ownedRow, { flexDirection: row }]}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={s.ownedThumb} resizeMode="cover" />
                    ) : (
                      <View
                        style={[
                          s.ownedThumb,
                          {
                            backgroundColor: theme.surface2,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <Text style={{ color: theme.subtleText, fontWeight: "900" }}>{t("storeScreen.common.img")}</Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={[s.ownedTitle, { textAlign, writingDirection }]} numberOfLines={1}>
                        {item?.name || key}
                      </Text>
                      <Text style={[s.ownedMeta, { textAlign, writingDirection }]} numberOfLines={2}>
                        {key}
                        {qty > 1 ? ` • ${t("storeScreen.common.qty")} ${qty}` : ""}
                        {rowItem?.expiresAt
                          ? ` • ${t("storeScreen.common.expires")} ${formatDate(rowItem.expiresAt)}`
                          : ` • ${t("storeScreen.common.permanentLower")}`}
                      </Text>

                      <View style={[s.pillsRow, { justifyContent: isRTL ? "flex-end" : "flex-start" }]}>
                        {expired ? (
                          <Pill theme={theme} text={t("storeScreen.common.expired")} tone="danger" isRTL={isRTL} />
                        ) : null}
                        {isActiveNow ? (
                          <Pill theme={theme} text={t("storeScreen.common.active")} tone="gold" isRTL={isRTL} />
                        ) : null}
                      </View>
                    </View>

                    <View style={{ alignItems: alignEnd, gap: 8 }}>
                      {canQuickUse ? (
                        <SecondaryButton
                          theme={theme}
                          title={useLoading ? t("storeScreen.common.applying") : t("storeScreen.common.use")}
                          onPress={() => doActivate(g.type, key, "set")}
                          disabled={buyDisabled || useLoading}
                          loading={useLoading}
                          isRTL={isRTL}
                        />
                      ) : null}

                      {g.type === "badge" ? (
                        <SecondaryButton
                          theme={theme}
                          title={
                            (active.badges || []).includes(key)
                              ? t("storeScreen.common.remove")
                              : t("storeScreen.common.add")
                          }
                          onPress={() =>
                            doActivate(
                              "badge",
                              key,
                              (active.badges || []).includes(key) ? "remove" : "add"
                            )
                          }
                          disabled={buyDisabled || expired}
                          isRTL={isRTL}
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
    row,
    textAlign,
    writingDirection,
    alignStart,
    alignEnd,
    theme,
    my?.inventory?.length,
    myLoading,
    activating,
    loadingCustomEmojiBadge,
    groupedOwned,
    active,
    activateKeyLoading,
    doActivate,
    buyDisabled,
    customEmojiBadge,
    customBadgeExpired,
    doToggleCustomEmojiBadge,
    activatingCustomEmojiBadge,
    t,
    isRTL,
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
              <Text style={[s.emptySub, { textAlign, writingDirection }]}>{t("storeScreen.common.loading")}</Text>
            </View>
          ) : (
            <View style={s.center}>
              <Text style={[s.emptyTitle, { textAlign, writingDirection }]}>
                {tab === "coinz" ? t("storeScreen.empty.noCoinzPacks") : t("storeScreen.empty.noItems")}
              </Text>
              <Text style={[s.emptySub, { textAlign, writingDirection }]}>{t("storeScreen.empty.tryKeyword")}</Text>
            </View>
          )
        }
      />

      {globalBusy ? (
        <View pointerEvents="auto" style={[s.loadingOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[s.loadingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ActivityIndicator />
            <Text style={[s.loadingText, { color: theme.text, textAlign, writingDirection }]}>
              {t("storeScreen.common.pleaseWait")}
            </Text>
          </View>
        </View>
      ) : null}

      <Modal transparent visible={buyOpen} animationType="fade" onRequestClose={() => setBuyOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (buySubmitting ? null : setBuyOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={[s.modalHeader, { flexDirection: row }]}>
              <Text style={[s.modalTitle, { color: theme.text, textAlign, writingDirection }]}>
                {t("storeScreen.purchase.title")}
              </Text>
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
                  <Text style={[s.modalName, { color: theme.text, textAlign, writingDirection }]}>
                    {selectedItem.name || selectedItem.key}
                  </Text>
                  <Text style={[s.modalMeta, { color: theme.mutedText, textAlign, writingDirection }]}>
                    {prettyType(selectedItem.type, t)} • {selectedItem.key}
                  </Text>

                  <Text style={[s.modalMeta, { color: theme.mutedText, textAlign, writingDirection }]}>
                    {t("storeScreen.common.duration")}{" "}
                    <Text style={{ color: theme.text, fontWeight: "800" }}>
                      {Number(selectedItem.durationDays || 0) > 0
                        ? `${Number(selectedItem.durationDays || 0)} ${t("storeScreen.common.daysSuffix")}`
                        : t("storeScreen.common.permanent")}
                    </Text>
                  </Text>
                </View>

                <View style={[s.modalRow, { flexDirection: row }]}>
                  <Text style={[s.modalLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                    {t("storeScreen.common.price")}
                  </Text>
                  <Text style={[s.modalValue, { color: theme.text, textAlign, writingDirection }]}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0))} {t("storeScreen.common.coinz")}
                  </Text>
                </View>

                {selectedItem.isStackable || selectedItem.isConsumable ? (
                  <View style={[s.modalRow, { flexDirection: row }]}>
                    <Text style={[s.modalLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                      {t("storeScreen.purchase.quantity")}
                    </Text>

                    <View style={[s.qtyRow, { flexDirection: row }]}>
                      <TouchableOpacity
                        style={[
                          s.qtyBtn,
                          {
                            backgroundColor: theme.surface2,
                            borderColor: theme.border,
                            opacity: buySubmitting || purchasing ? 0.6 : 1,
                          },
                        ]}
                        disabled={buySubmitting || purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) - 1))}
                      >
                        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>−</Text>
                      </TouchableOpacity>

                      <TextInput
                        editable={!buySubmitting}
                        value={String(buyQty)}
                        onChangeText={(txt) => setBuyQty(Math.max(1, Number(txt.replace(/[^\d]/g, "") || "1")))}
                        keyboardType="number-pad"
                        style={[
                          s.qtyInput,
                          {
                            backgroundColor: theme.surface2,
                            borderColor: theme.border,
                            color: theme.text,
                            writingDirection: "ltr",
                          },
                        ]}
                      />

                      <TouchableOpacity
                        style={[
                          s.qtyBtn,
                          {
                            backgroundColor: theme.surface2,
                            borderColor: theme.border,
                            opacity: buySubmitting || purchasing ? 0.6 : 1,
                          },
                        ]}
                        disabled={buySubmitting || purchasing}
                        onPress={() => setBuyQty((x) => Math.max(1, Number(x || 1) + 1))}
                      >
                        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <View style={[s.modalRow, { flexDirection: row }]}>
                  <Text style={[s.modalLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                    {t("storeScreen.purchase.autoActivate")}
                  </Text>
                  <TouchableOpacity
                    disabled={buySubmitting}
                    onPress={() => setBuySetActive((v) => !v)}
                    style={[
                      s.toggle,
                      {
                        backgroundColor: buySetActive ? theme.primary : theme.disabledBg,
                        opacity: buySubmitting ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.toggleKnob,
                        buySetActive
                          ? isRTL
                            ? s.knobOff
                            : s.knobOn
                          : isRTL
                            ? s.knobOn
                            : s.knobOff,
                        { backgroundColor: theme.primaryText },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={[s.modalRow, { flexDirection: row }]}>
                  <Text style={[s.modalLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                    {t("storeScreen.purchase.total")}
                  </Text>
                  <Text style={[s.modalTotal, { color: theme.text, textAlign, writingDirection }]}>
                    {formatCoinz(Number(selectedItem.priceCoinz || 0) * Math.max(1, Number(buyQty || 1)))}{" "}
                    {t("storeScreen.common.coinz")}
                  </Text>
                </View>

                <View style={s.actionsRow}>
                  <SecondaryButton
                    theme={theme}
                    title={t("storeScreen.common.cancel")}
                    onPress={() => setBuyOpen(false)}
                    disabled={buySubmitting}
                    isRTL={isRTL}
                  />
                  <PrimaryButton
                    theme={theme}
                    title={buySubmitting ? t("storeScreen.purchase.buying") : t("storeScreen.purchase.confirm")}
                    onPress={doBuy}
                    disabled={buySubmitting || purchasing}
                    loading={buySubmitting || purchasing}
                    isRTL={isRTL}
                  />
                </View>

                <Text style={[s.modalHint, { color: theme.subtleText, textAlign, writingDirection }]}>
                  {t("storeScreen.common.yourBalance")} {formatCoinz(coinz)} {t("storeScreen.common.coinz")}
                </Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={emojiBadgeOpen} animationType="fade" onRequestClose={() => setEmojiBadgeOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (buyingCustomEmojiBadge ? null : setEmojiBadgeOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={[s.modalHeader, { flexDirection: row }]}>
              <Text style={[s.modalTitle, { color: theme.text, textAlign, writingDirection }]}>
                {t("storeScreen.customEmoji.title")}
              </Text>
              <TouchableOpacity disabled={buyingCustomEmojiBadge} onPress={() => setEmojiBadgeOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: buyingCustomEmojiBadge ? 0.6 : 1 }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[s.modalMeta, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.customEmoji.enterOneEmoji")}{" "}
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {formatCoinz(CUSTOM_EMOJI_BADGE_COST)} {t("storeScreen.common.coinz")}
                </Text>
              </Text>
            </View>

            <Spacer h={12} />
            <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
              {t("storeScreen.customEmoji.emojiField")}
            </Text>
            <SoftInput
              theme={theme}
              value={customEmojiInput}
              onChangeText={setCustomEmojiInput}
              placeholder="🐉"
              editable={!buyingCustomEmojiBadge}
              maxLength={8}
              isRTL={isRTL}
            />

            <Spacer h={12} />
            <View style={s.emojiPreviewCard}>
              <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.customEmoji.preview")}
              </Text>
              <Text style={s.modalEmojiPreview}>{customEmojiInput.trim() || "🙂"}</Text>
            </View>

            <View style={[s.modalRow, { flexDirection: row }]}>
              <Text style={[s.modalLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.customEmoji.activateNow")}
              </Text>
              <TouchableOpacity
                disabled={buyingCustomEmojiBadge}
                onPress={() => setCustomEmojiSetActive((v) => !v)}
                style={[
                  s.toggle,
                  {
                    backgroundColor: customEmojiSetActive ? theme.primary : theme.disabledBg,
                    opacity: buyingCustomEmojiBadge ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    s.toggleKnob,
                    customEmojiSetActive
                      ? isRTL
                        ? s.knobOff
                        : s.knobOn
                      : isRTL
                        ? s.knobOn
                        : s.knobOff,
                    { backgroundColor: theme.primaryText },
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={s.actionsRow}>
              <SecondaryButton
                theme={theme}
                title={t("storeScreen.common.cancel")}
                onPress={() => setEmojiBadgeOpen(false)}
                disabled={buyingCustomEmojiBadge}
                isRTL={isRTL}
              />
              <PrimaryButton
                theme={theme}
                title={buyingCustomEmojiBadge ? t("storeScreen.customEmoji.saving") : t("storeScreen.purchase.confirm")}
                onPress={doBuyCustomEmojiBadge}
                disabled={buyingCustomEmojiBadge}
                loading={buyingCustomEmojiBadge}
                isRTL={isRTL}
              />
            </View>

            <Text style={[s.modalHint, { color: theme.subtleText, textAlign, writingDirection }]}>
              {t("storeScreen.common.yourBalance")} {formatCoinz(coinz)} {t("storeScreen.common.coinz")}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={createOpen} animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (createSubmitting ? null : setCreateOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={[s.modalHeader, { flexDirection: row }]}>
              <Text style={[s.modalTitle, { color: theme.text, textAlign, writingDirection }]}>
                {t("storeScreen.createAccount.title")}
              </Text>
              <TouchableOpacity disabled={createSubmitting} onPress={() => setCreateOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: createSubmitting ? 0.6 : 1 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={[s.modalMeta, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.common.cost")}{" "}
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {formatCoinz(CREATE_ACCOUNT_COST)} {t("storeScreen.common.coinz")}
                </Text>
              </Text>
            </View>

            <Spacer h={12} />
            <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
              {t("storeScreen.createAccount.usernameField")}
            </Text>
            <SoftInput
              theme={theme}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder={t("storeScreen.createAccount.usernamePlaceholder")}
              editable={!createSubmitting}
              isRTL={isRTL}
            />

            <Spacer h={10} />
            <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
              {t("storeScreen.createAccount.passwordField")}
            </Text>
            <SoftInput
              theme={theme}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("storeScreen.createAccount.passwordPlaceholder")}
              secureTextEntry
              editable={!createSubmitting}
              isRTL={isRTL}
            />

            <Spacer h={14} />
            <View style={s.actionsRow}>
              <SecondaryButton
                theme={theme}
                title={t("storeScreen.common.cancel")}
                onPress={() => setCreateOpen(false)}
                disabled={createSubmitting}
                isRTL={isRTL}
              />
              <PrimaryButton
                theme={theme}
                title={createSubmitting ? t("storeScreen.createAccount.creating") : t("storeScreen.purchase.confirm")}
                onPress={doCreateAccount}
                disabled={createSubmitting}
                loading={createSubmitting}
                isRTL={isRTL}
              />
            </View>

            <Text style={[s.modalHint, { color: theme.subtleText, textAlign, writingDirection }]}>
              {t("storeScreen.common.yourBalance")} {formatCoinz(coinz)} {t("storeScreen.common.coinz")}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={createdOpen} animationType="fade" onRequestClose={() => setCreatedOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => (copyLoading ? null : setCreatedOpen(false))}>
          <Pressable style={[s.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => {}}>
            <View style={[s.modalHeader, { flexDirection: row }]}>
              <Text style={[s.modalTitle, { color: theme.text, textAlign, writingDirection }]}>
                {t("storeScreen.createdAccount.title")}
              </Text>
              <TouchableOpacity disabled={copyLoading} onPress={() => setCreatedOpen(false)}>
                <Text style={[s.modalClose, { color: theme.subtleText, opacity: copyLoading ? 0.6 : 1 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.createAccount.usernameField")}
              </Text>
              <Text style={[s.modalValue, { color: theme.text, textAlign, writingDirection }]}>
                {createdCreds?.username || "-"}
              </Text>

              <Spacer h={10} />

              <Text style={[s.fieldLabel, { color: theme.mutedText, textAlign, writingDirection }]}>
                {t("storeScreen.createAccount.passwordField")}
              </Text>
              <Text style={[s.modalValue, { color: theme.text, textAlign, writingDirection }]}>
                {createdCreds?.password || "-"}
              </Text>
            </View>

            <Spacer h={14} />
            <View style={s.actionsRow}>
              <SecondaryButton
                theme={theme}
                title={t("storeScreen.common.close")}
                onPress={() => setCreatedOpen(false)}
                disabled={copyLoading}
                isRTL={isRTL}
              />
              <PrimaryButton
                theme={theme}
                title={copyLoading ? t("storeScreen.createdAccount.copying") : t("storeScreen.createdAccount.copy")}
                onPress={copyCreatedCreds}
                disabled={copyLoading}
                loading={copyLoading}
                isRTL={isRTL}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <BadgeLottiePickerModal
  visible={badgePickerOpen}
  onClose={() => setBadgePickerOpen(false)}
  items={badgeItems}
  selectedKey=""
  onConfirm={doBuyBadgeFromPicker}
  theme={theme}
  isRTL={isRTL}
  t={t}
  loading={badgePickerSubmitting}
  coinz={coinz}
/>
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
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts?.rounded,
  },

  btn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  btnRow: { alignItems: "center", gap: 10 },
  btnText: { fontWeight: "900", fontSize: 14, fontFamily: Fonts?.rounded },

  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontWeight: "800",
    fontFamily: Fonts?.sans,
  },
});

function createStyles(theme: AppTheme, isRTL: boolean) {
  const shadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
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
      ...shadow,
    },

    heroKicker: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: "800",
      fontFamily: Fonts?.rounded,
    },
    heroBalance: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 4,
      fontFamily: Fonts?.rounded,
    },
    heroSub: {
      color: theme.subtleText,
      fontSize: 12,
      marginTop: 6,
      lineHeight: 16,
      fontFamily: Fonts?.sans,
    },

    activeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    activeChip: {
      flexGrow: 1,
      minWidth: "47%",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 10,
    },
    activeLabel: {
      color: theme.subtleText,
      fontSize: 11,
      fontWeight: "800",
      fontFamily: Fonts?.sans,
    },
    activeValue: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "900",
      marginTop: 4,
      fontFamily: Fonts?.rounded,
    },

    searchWrap: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchInput: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
      fontFamily: Fonts?.sans,
    },

    tabsRow: { gap: 8, paddingVertical: 2 },
    tabPill: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabPillActive: {
      backgroundColor: theme.primarySoft,
      borderColor: theme.primary,
    },
    tabText: {
      color: theme.mutedText,
      fontWeight: "900",
      fontSize: 12,
      fontFamily: Fonts?.rounded,
    },
    tabTextActive: { color: theme.text },

    sectionRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      fontFamily: Fonts?.rounded,
    },
    sectionSub: { color: theme.subtleText, fontSize: 12, fontFamily: Fonts?.sans },

    noteCard: {
      borderRadius: 16,
      padding: 12,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    noteText: {
      color: theme.mutedText,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts?.sans,
    },

    modernCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow,
    },

    groupCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow,
    },

    groupHeader: {
      alignItems: "center",
      justifyContent: "space-between",
    },
    groupTitle: { color: theme.text, fontSize: 14, fontWeight: "900", fontFamily: Fonts?.rounded },

    cardTop: { gap: 12 },
    cardTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    cardDesc: {
      color: theme.mutedText,
      fontSize: 12,
      marginTop: 6,
      lineHeight: 16,
      fontFamily: Fonts?.sans,
    },

    pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

    priceBox: { minWidth: 96, paddingLeft: 8 },
    priceLabel: { color: theme.subtleText, fontSize: 11, fontWeight: "800", fontFamily: Fonts?.sans },
    priceValue: {
      color: theme.pillGoldFg,
      fontSize: 16,
      fontWeight: "900",
      marginTop: 2,
      fontFamily: Fonts?.rounded,
    },

    emojiBadgeBox: {
      width: 86,
      height: 86,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    emojiBadgePreview: {
      fontSize: 40,
      lineHeight: 46,
    },

    itemTop: { gap: 12 },
    thumbWrap: { width: 66 },
    thumb: {
      width: 62,
      height: 62,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },

    itemTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    itemMeta: { color: theme.subtleText, fontSize: 12, marginTop: 2, fontFamily: Fonts?.sans },
    itemSmall: { color: theme.mutedText, fontSize: 12, marginTop: 8, fontFamily: Fonts?.sans },
    itemDesc: {
      color: theme.mutedText,
      fontSize: 12,
      marginTop: 8,
      lineHeight: 16,
      fontFamily: Fonts?.sans,
    },

    actionsRow: { flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginTop: 14 },

    footerWrap: { marginTop: 16, gap: 12 },

    ownedRow: {
      gap: 12,
      paddingVertical: 10,
    },
    customOwnedRow: {
      gap: 12,
      alignItems: "center",
    },
    customOwnedEmojiWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    customOwnedEmoji: {
      fontSize: 28,
      lineHeight: 32,
    },
    ownedThumb: {
      width: 46,
      height: 46,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
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
      ...shadow,
    },
    emptyTitle: { color: theme.text, fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    emptySub: {
      color: theme.subtleText,
      fontSize: 12,
      marginTop: 6,
      fontFamily: Fonts?.sans,
      textAlign: "center",
    },

    center: { paddingVertical: 26, alignItems: "center", gap: 10 },

    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    loadingCard: {
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: "center",
      gap: 10,
      minWidth: 180,
      borderWidth: 1,
    },
    loadingText: { fontWeight: "900", fontFamily: Fonts?.rounded },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 14,
    },
    modalCard: {
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      ...shadow,
    },
    modalHeader: { alignItems: "center", justifyContent: "space-between" },
    modalTitle: { fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    modalClose: { fontSize: 18, padding: 6 },

    modalRow: {
      marginTop: 12,
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalName: { fontSize: 16, fontWeight: "900", fontFamily: Fonts?.rounded },
    modalMeta: { fontSize: 12, marginTop: 4, fontFamily: Fonts?.sans },

    modalLabel: { fontWeight: "800", fontFamily: Fonts?.sans },
    modalValue: { fontWeight: "900", fontFamily: Fonts?.rounded },
    modalTotal: { fontWeight: "900", fontFamily: Fonts?.rounded },

    fieldLabel: { fontSize: 12, fontWeight: "800", fontFamily: Fonts?.sans },

    modalHint: { fontSize: 12, marginTop: 10, fontFamily: Fonts?.sans },

    emojiPreviewCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    modalEmojiPreview: {
      fontSize: 42,
      lineHeight: 48,
    },

    qtyRow: { alignItems: "center", gap: 8 },
    qtyBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    qtyInput: {
      width: 76,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      textAlign: "center",
      fontWeight: "900",
      fontFamily: Fonts?.rounded,
    },

    toggle: { width: 54, height: 30, borderRadius: 999, padding: 3, justifyContent: "center" },
    toggleKnob: { width: 24, height: 24, borderRadius: 999 },
    knobOn: { alignSelf: "flex-end" },
    knobOff: { alignSelf: "flex-start" },
  });
}