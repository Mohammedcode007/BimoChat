
// app/(tabs)/room/[id]/settings.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppTheme, Colors } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  boostRoom,
  changeRoomPremiumLevel,
  changeRoomType,
  clearRoomControlError,
  deleteRoomControl,
  getRoomControl,
  selectRoomControl,
  selectRoomControlDeleting,
  selectRoomControlError,
  selectRoomControlLoading,
  selectRoomControlSaving,
  setRoomAntiSpam,
  setRoomLock,
  setRoomSlowMode,
  updateRoomInfo,
  updateRoomWelcome,
} from "@/redux/slices/roomControl.slice";

import {
  fetchBannedUsers,
  selectBannedUsers,
  unbanAll,
  unbanMany,
  unbanOne
} from "@/redux/slices/room.slice";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { uploadToCloudinary } from "@/services/upload.service";

type RoomType = "public" | "private" | "protected" | "subscription";
type RoomPremiumLevel = 0 | 1 | 2 | 3 | 4;
type RoomBotLanguage = "ar" | "en";

type RoomBotConfig = {
  enabled: boolean;
  welcomeEnabled: boolean;
  language: RoomBotLanguage;
  welcomeMessage?: string | null;
};

type RoomDTO = {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;

  type: RoomType;
  premiumLevel: RoomPremiumLevel;

  maxUsers?: number;
  subscriptionPrice?: number;

  isLocked?: boolean;
  slowModeSeconds?: number;

  antiSpamEnabled?: boolean;
  maxMessagesPerMinute?: number;

  boostLevel?: number;
  boostExpiresAt?: string;

  tags?: string[];
  isVerified?: boolean;

  usersCount?: number;
  messagesCount?: number;

  roomBot?: RoomBotConfig;
};

type UserPublicSnapshot = {
  _id: string;
  username: string;
  atUsername?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string | null;
};

type RoomBannedEntry = {
  user: UserPublicSnapshot;
  reason?: string;
  bannedAt?: string;
  until?: string | null;
};

const premiumLabel = (p: RoomPremiumLevel) =>
  p === 0 ? "FREE" : p === 1 ? "SILVER" : p === 2 ? "GOLD" : p === 3 ? "PLATINUM" : "ELITE";

export default function RoomSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const roomId = String(params?.id || "");

  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  const roomControl = useAppSelector(selectRoomControl) as unknown as RoomDTO | null;
  const loading = useAppSelector(selectRoomControlLoading);
  const saving = useAppSelector(selectRoomControlSaving);
  const deleting = useAppSelector(selectRoomControlDeleting);
  const error = useAppSelector(selectRoomControlError);

  const bannedList = useAppSelector((s) => selectBannedUsers(s as any, roomId)) as RoomBannedEntry[];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cover, setCover] = useState("");
  const [tags, setTags] = useState("");

  const [type, setType] = useState<RoomType>("public");
  const [protectedPassword, setProtectedPassword] = useState("");
  const [premiumLevel, setPremiumLevel] = useState<RoomPremiumLevel>(0);

  const [maxUsers, setMaxUsers] = useState("50");
  const [subscriptionPrice, setSubscriptionPrice] = useState("0");

  const [isLocked, setIsLocked] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState("0");

  const [antiSpamEnabled, setAntiSpamEnabled] = useState(false);
  const [maxMessagesPerMinute, setMaxMessagesPerMinute] = useState("10");

  const [boostLevel, setBoostLevel] = useState("0");
  const [boostHours, setBoostHours] = useState("1");

  const [roomBotEnabled, setRoomBotEnabled] = useState(false);
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeLanguage, setWelcomeLanguage] = useState<RoomBotLanguage>("ar");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [bannedModalOpen, setBannedModalOpen] = useState(false);
  const [bannedLoading, setBannedLoading] = useState(false);
  const [bannedRefreshing, setBannedRefreshing] = useState(false);
  const [bannedQuery, setBannedQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!roomId) return;
    dispatch(getRoomControl({ roomId }));
  }, [roomId, dispatch]);

  useEffect(() => {
    if (!error) return;
    Alert.alert("خطأ", error);
    dispatch(clearRoomControlError());
  }, [error, dispatch]);

  useEffect(() => {
    if (!roomControl) return;

    setName(roomControl.name || "");
    setDescription(roomControl.description || "");
    setAvatar(roomControl.avatar || "");
    setCover(roomControl.cover || "");
    setTags((roomControl.tags || []).join(", "));

    setType((roomControl.type || "public") as RoomType);
    setPremiumLevel((roomControl.premiumLevel ?? 0) as RoomPremiumLevel);

    setMaxUsers(String(roomControl.maxUsers ?? 50));
    setSubscriptionPrice(String(roomControl.subscriptionPrice ?? 0));

    setIsLocked(!!roomControl.isLocked);
    setSlowModeSeconds(String(roomControl.slowModeSeconds ?? 0));

    setAntiSpamEnabled(!!roomControl.antiSpamEnabled);
    setMaxMessagesPerMinute(String(roomControl.maxMessagesPerMinute ?? 10));

    setBoostLevel(String(roomControl.boostLevel ?? 0));

    setRoomBotEnabled(!!roomControl.roomBot?.enabled);
    setWelcomeEnabled(!!roomControl.roomBot?.welcomeEnabled);
    setWelcomeLanguage((roomControl.roomBot?.language || "ar") as RoomBotLanguage);
    setWelcomeMessage(String(roomControl.roomBot?.welcomeMessage || ""));
  }, [roomControl?._id, roomControl]);

  const dirty = useMemo(() => {
    if (!roomControl) return false;
    const t = tagsToArray(tags);

    return (
      name.trim() !== (roomControl.name || "").trim() ||
      description.trim() !== (roomControl.description || "").trim() ||
      (avatar || "").trim() !== (roomControl.avatar || "").trim() ||
      (cover || "").trim() !== (roomControl.cover || "").trim() ||
      type !== roomControl.type ||
      premiumLevel !== roomControl.premiumLevel ||
      Number(maxUsers) !== Number(roomControl.maxUsers ?? 50) ||
      Number(subscriptionPrice) !== Number(roomControl.subscriptionPrice ?? 0) ||
      isLocked !== !!roomControl.isLocked ||
      Number(slowModeSeconds) !== Number(roomControl.slowModeSeconds ?? 0) ||
      antiSpamEnabled !== !!roomControl.antiSpamEnabled ||
      Number(maxMessagesPerMinute) !== Number(roomControl.maxMessagesPerMinute ?? 10) ||
      JSON.stringify(t) !== JSON.stringify(roomControl.tags || []) ||
      roomBotEnabled !== !!roomControl.roomBot?.enabled ||
      welcomeEnabled !== !!roomControl.roomBot?.welcomeEnabled ||
      welcomeLanguage !== (roomControl.roomBot?.language || "ar") ||
      welcomeMessage.trim() !== String(roomControl.roomBot?.welcomeMessage || "").trim()
    );
  }, [
    roomControl,
    name,
    description,
    avatar,
    cover,
    tags,
    type,
    premiumLevel,
    maxUsers,
    subscriptionPrice,
    isLocked,
    slowModeSeconds,
    antiSpamEnabled,
    maxMessagesPerMinute,
    roomBotEnabled,
    welcomeEnabled,
    welcomeLanguage,
    welcomeMessage
  ]);

  const reload = () => {
    if (!roomId) return;
    dispatch(getRoomControl({ roomId }));
  };

  const ensureMediaPermission = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("تنبيه", "يجب السماح بالوصول للصور لاختيار صورة.");
      return false;
    }
    return true;
  };

  const pickAndUploadImage = async (kind: "avatar" | "cover") => {
    const ok = await ensureMediaPermission();
    if (!ok) return;

    try {
      kind === "avatar" ? setUploadingAvatar(true) : setUploadingCover(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: kind === "cover" ? [16, 9] : [1, 1],
        quality: 0.85
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert("خطأ", "لم يتم الحصول على مسار الصورة.");
        return;
      }

      const url = await uploadToCloudinary(uri, "image");

      if (kind === "avatar") setAvatar(url);
      else setCover(url);

      Alert.alert("تم", `تم رفع صورة ${kind === "avatar" ? "الأفاتار" : "الكفر"} بنجاح`);
    } catch (e: any) {
      Alert.alert("خطأ", String(e?.message || e || "فشل رفع الصورة"));
    } finally {
      kind === "avatar" ? setUploadingAvatar(false) : setUploadingCover(false);
    }
  };

  const saveAll = async () => {
    if (!roomControl) return;

    if (uploadingAvatar || uploadingCover) {
      Alert.alert("تنبيه", "انتظر حتى يكتمل رفع الصور أولاً.");
      return;
    }

    const nextTags = tagsToArray(tags);
    const nextMaxUsers = clampInt(maxUsers, 1, 100, 50);
    const nextSlow = clampInt(slowModeSeconds, 0, 3600, 0);
    const nextMPM = clampInt(maxMessagesPerMinute, 1, 1000, 10);
    const nextSubPrice = Math.max(0, Number(subscriptionPrice) || 0);

    try {
      await dispatch(
        updateRoomInfo({
          roomId,
          name: name.trim(),
          description: description.trim(),
          avatar: avatar.trim(),
          cover: cover.trim(),
          tags: nextTags,
          maxUsers: nextMaxUsers,
          slowModeSeconds: nextSlow
        })
      ).unwrap();

      if (
        type !== roomControl.type ||
        (type === "subscription" && nextSubPrice !== (roomControl.subscriptionPrice ?? 0))
      ) {
        const payload: any = { roomId, type };

        if (type === "protected") {
          const pass = protectedPassword.trim();
          if (!pass) {
            Alert.alert("تنبيه", "يجب إدخال كلمة مرور عند اختيار Protected.");
            return;
          }
          payload.password = pass;
        }

        if (type === "subscription") {
          payload.subscriptionPrice = nextSubPrice;
        }

        await dispatch(changeRoomType(payload)).unwrap();
      }

      if (premiumLevel !== roomControl.premiumLevel) {
        await dispatch(changeRoomPremiumLevel({ roomId, premiumLevel })).unwrap();
      }

      if (isLocked !== !!roomControl.isLocked) {
        await dispatch(setRoomLock({ roomId, locked: isLocked })).unwrap();
      }

      if (
        antiSpamEnabled !== !!roomControl.antiSpamEnabled ||
        nextMPM !== Number(roomControl.maxMessagesPerMinute ?? 10)
      ) {
        await dispatch(
          setRoomAntiSpam({
            roomId,
            enabled: antiSpamEnabled,
            maxMessagesPerMinute: nextMPM
          })
        ).unwrap();
      }

      if (nextSlow !== Number(roomControl.slowModeSeconds ?? 0)) {
        await dispatch(setRoomSlowMode({ roomId, seconds: nextSlow })).unwrap();
      }

      await dispatch(
        updateRoomWelcome({
          roomId,
          enabled: roomBotEnabled,
          welcomeEnabled,
          language: welcomeLanguage,
          welcomeMessage: welcomeMessage.trim()
        })
      ).unwrap();

      Alert.alert("تم", "تم حفظ إعدادات الغرفة بنجاح");
      reload();
    } catch (e: any) {
      Alert.alert("خطأ", String(e || "فشل الحفظ"));
    }
  };

  const toggleLockRemote = async (next: boolean) => {
    setIsLocked(next);
    try {
      await dispatch(setRoomLock({ roomId, locked: next })).unwrap();
    } catch (e: any) {
      setIsLocked(!next);
      Alert.alert("خطأ", String(e || "فشل تحديث القفل"));
    }
  };

  const doBoost = async () => {
    const level = clampInt(boostLevel, 0, 10, 0);
    const hours = clampInt(boostHours, 1, 720, 1);

    try {
      await dispatch(boostRoom({ roomId, level, hours })).unwrap();
      Alert.alert("تم", "تم تنفيذ Boost بنجاح");
      reload();
    } catch (e: any) {
      Alert.alert("خطأ", String(e || "فشل boost"));
    }
  };

  const deleteRoom = async () => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد؟ سيتم حذف الغرفة نهائيًا.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteRoomControl({ roomId })).unwrap();
            Alert.alert("تم", "تم حذف الغرفة");
            router.back();
          } catch (e: any) {
            Alert.alert("خطأ", String(e || "فشل حذف الغرفة"));
          }
        }
      }
    ]);
  };

  const openBannedModal = async () => {
    setBannedModalOpen(true);
    setVisibleCount(25);
    setSelectedIds({});
    setBannedQuery("");
    await loadBannedOnce();
  };

  const loadBannedOnce = async () => {
    if (!roomId) return;
    try {
      setBannedLoading(true);
      await dispatch(fetchBannedUsers({ roomId })).unwrap();
    } catch (e: any) {
      Alert.alert("خطأ", String(e || "فشل تحميل المحظورين"));
    } finally {
      setBannedLoading(false);
    }
  };

  const refreshBanned = async () => {
    if (!roomId) return;
    try {
      setBannedRefreshing(true);
      await dispatch(fetchBannedUsers({ roomId })).unwrap();
    } catch (e: any) {
      Alert.alert("خطأ", String(e || "فشل تحديث المحظورين"));
    } finally {
      setBannedRefreshing(false);
    }
  };

  const filteredBanned = useMemo(() => {
    const q = String(bannedQuery || "").trim().toLowerCase();
    const list = Array.isArray(bannedList) ? bannedList : [];
    if (!q) return list;

    return list.filter((x) => {
      const u = x?.user;
      const a = String(u?.atUsername || "").toLowerCase();
      const n = String(u?.username || "").toLowerCase();
      const id = String(u?._id || "").toLowerCase();
      const r = String(x?.reason || "").toLowerCase();
      return a.includes(q) || n.includes(q) || id.includes(q) || r.includes(q);
    });
  }, [bannedList, bannedQuery]);

  const visibleBanned = useMemo(() => {
    const list = filteredBanned;
    return list.slice(0, Math.max(0, visibleCount));
  }, [filteredBanned, visibleCount]);

  const selectedCount = useMemo(() => {
    let c = 0;
    for (const k of Object.keys(selectedIds)) if (selectedIds[k]) c++;
    return c;
  }, [selectedIds]);

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const clearSelection = () => setSelectedIds({});

  const unbanSingle = async (targetId: string) => {
    Alert.alert("تأكيد", "إزالة الحظر عن هذا المستخدم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(unbanOne({ roomId, targetId })).unwrap();
          } catch (e: any) {
            Alert.alert("خطأ", String(e || "فشل إزالة الحظر"));
          }
        }
      }
    ]);
  };

  const unbanSelected = async () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      Alert.alert("تنبيه", "لم يتم تحديد أي مستخدم.");
      return;
    }

    Alert.alert("تأكيد", `إزالة الحظر عن (${ids.length}) مستخدم؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(unbanMany({ roomId, targetIds: ids })).unwrap();
            clearSelection();
          } catch (e: any) {
            Alert.alert("خطأ", String(e || "فشل إزالة الحظر للمجموعة"));
          }
        }
      }
    ]);
  };

  const unbanAllUsers = async () => {
    Alert.alert("تأكيد قوي", "إزالة الحظر عن جميع المستخدمين؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة الكل",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(unbanAll({ roomId })).unwrap();
            clearSelection();
          } catch (e: any) {
            Alert.alert("خطأ", String(e || "فشل إزالة الحظر عن الجميع"));
          }
        }
      }
    ]);
  };

  const renderBannedItem = ({ item }: { item: RoomBannedEntry }) => {
    const u = item?.user;
    const uid = String(u?._id || "");
    const checked = !!selectedIds[uid];

    return (
      <View style={styles.bannedItem}>
        <TouchableOpacity
          style={[styles.checkBox, checked && styles.checkBoxOn]}
          onPress={() => toggleSelect(uid)}
        >
          {checked ? <Ionicons name="checkmark" size={16} color={theme.primaryText} /> : null}
        </TouchableOpacity>

        <View style={styles.bannedAvatarBox}>
          {u?.avatar ? (
            <Image source={{ uri: u.avatar }} style={styles.bannedAvatar} />
          ) : (
            <View style={styles.bannedAvatarPlaceholder}>
              <Ionicons name="person-outline" size={18} color={theme.mutedText} />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.bannedName} numberOfLines={1}>
            {u?.username || "User"}
            {u?.atUsername ? <Text style={styles.bannedAt}>  @{u.atUsername}</Text> : null}
          </Text>

          {!!item?.reason ? (
            <Text style={styles.bannedReason} numberOfLines={2}>
              السبب: {String(item.reason)}
            </Text>
          ) : (
            <Text style={styles.bannedReasonMuted} numberOfLines={1}>
              لا يوجد سبب مسجّل
            </Text>
          )}

          {!!item?.bannedAt ? (
            <Text style={styles.bannedMeta} numberOfLines={1}>
              تاريخ الحظر: {formatDate(item.bannedAt)}
            </Text>
          ) : null}

          {item?.until ? (
            <Text style={styles.bannedMeta} numberOfLines={1}>
              ينتهي: {formatDate(item.until)}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.unbanBtn} onPress={() => unbanSingle(uid)}>
          <Ionicons name="lock-open-outline" size={18} color={theme.text} />
          <Text style={styles.unbanBtnText}>إزالة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.tint} />
          <Text style={styles.centerText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!roomControl) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.centerText}>تعذر تحميل الغرفة</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={reload}>
            <Text style={styles.primaryBtnText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const r = roomControl;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>ضبط الغرفة</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.roomRow}>
            <View style={styles.roomThumb}>
              {r.avatar ? (
                <Image source={{ uri: r.avatar }} style={styles.thumbImg} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.mutedText} />
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{r.name}</Text>
              <Text style={styles.roomMeta}>
                النوع: {String(r.type || "").toUpperCase()} • Premium:{" "}
                {premiumLabel((r.premiumLevel ?? 0) as RoomPremiumLevel)}
              </Text>

              {(typeof r.usersCount === "number" || typeof r.messagesCount === "number") && (
                <Text style={styles.roomMeta}>
                  Online: {r.usersCount ?? 0} • Messages: {r.messagesCount ?? 0}
                </Text>
              )}
            </View>

            {r.isVerified ? (
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Section theme={theme} styles={styles} title="البيانات الأساسية" icon="create-outline">
          <Field theme={theme} styles={styles} label="اسم الغرفة" value={name} onChange={setName} placeholder="اسم الغرفة" />
          <Field
            theme={theme}
            styles={styles}
            label="وصف الغرفة"
            value={description}
            onChange={setDescription}
            placeholder="وصف مختصر"
            multiline
          />

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Avatar</Text>

            <View style={styles.imageRow}>
              <View style={styles.imagePreviewBox}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={22} color={theme.mutedText} />
                    <Text style={styles.imagePlaceholderText}>لا يوجد</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, gap: 10 }}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, uploadingAvatar && { opacity: 0.6 }]}
                  disabled={uploadingAvatar || saving || deleting}
                  onPress={() => pickAndUploadImage("avatar")}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator color={theme.tint} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color={theme.text} />
                      <Text style={styles.secondaryBtnText}>اختيار ورفع Avatar</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Field
                  theme={theme}
                  styles={styles}
                  label="Avatar URL"
                  value={avatar}
                  onChange={setAvatar}
                  placeholder="https://..."
                  hint="يمكنك تركه أو تعديله يدويًا"
                />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Cover</Text>

            <View style={styles.imageRow}>
              <View style={[styles.imagePreviewBox, styles.coverPreviewBox]}>
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.coverPreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={22} color={theme.mutedText} />
                    <Text style={styles.imagePlaceholderText}>لا يوجد</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, gap: 10 }}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, uploadingCover && { opacity: 0.6 }]}
                  disabled={uploadingCover || saving || deleting}
                  onPress={() => pickAndUploadImage("cover")}
                >
                  {uploadingCover ? (
                    <ActivityIndicator color={theme.tint} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color={theme.text} />
                      <Text style={styles.secondaryBtnText}>اختيار ورفع Cover</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Field
                  theme={theme}
                  styles={styles}
                  label="Cover URL"
                  value={cover}
                  onChange={setCover}
                  placeholder="https://..."
                  hint="يمكنك تركه أو تعديله يدويًا"
                />
              </View>
            </View>
          </View>

          <Field
            theme={theme}
            styles={styles}
            label="Tags"
            value={tags}
            onChange={setTags}
            placeholder="مثال: music, sports, fun"
            hint="افصل بين التاجات بفاصلة"
          />
        </Section>

        <Section theme={theme} styles={styles} title="التحكم في الوصول والحدود" icon="lock-closed-outline">
          <Row styles={styles}>
            <Text style={styles.rowLabel}>قفل الغرفة (منع الدخول مؤقتًا)</Text>
            <Switch
              value={isLocked}
              onValueChange={toggleLockRemote}
              thumbColor={isLocked ? theme.tint : undefined}
              trackColor={{ false: theme.border, true: theme.primarySoft }}
            />
          </Row>

          <Field
            theme={theme}
            styles={styles}
            label="الحد الأقصى للمستخدمين"
            value={maxUsers}
            onChange={(v) => {
              const digits = String(v || "").replace(/[^\d]/g, "");
              if (!digits) {
                setMaxUsers("");
                return;
              }
              const n = Math.min(100, Math.max(1, Number(digits) || 1));
              setMaxUsers(String(n));
            }}
            keyboard="numeric"
            placeholder="50"
          />

          <Field
            theme={theme}
            styles={styles}
            label="Slow Mode (ثواني)"
            value={slowModeSeconds}
            onChange={setSlowModeSeconds}
            keyboard="numeric"
            placeholder="0"
            hint="0 لإيقافه، الحد الأقصى 3600"
          />
        </Section>

        <Section theme={theme} styles={styles} title="نوع الغرفة والاشتراك" icon="options-outline">
          <Segment
            theme={theme}
            styles={styles}
            label="نوع الغرفة"
            value={type}
            items={[
              { key: "public", title: "Public" },
              { key: "private", title: "Private" },
              { key: "protected", title: "Protected" },
              { key: "subscription", title: "Subscription" }
            ]}
            onChange={(v) => setType(v as RoomType)}
          />

          {type === "protected" ? (
            <Field
              theme={theme}
              styles={styles}
              label="Protected Password"
              value={protectedPassword}
              onChange={setProtectedPassword}
              placeholder="كلمة المرور"
              hint="مطلوبة عند اختيار Protected"
            />
          ) : null}

          {type === "subscription" ? (
            <Field
              theme={theme}
              styles={styles}
              label="Subscription Price"
              value={subscriptionPrice}
              onChange={setSubscriptionPrice}
              keyboard="numeric"
              placeholder="0"
            />
          ) : null}

          <Segment
            theme={theme}
            styles={styles}
            label="Premium Level"
            value={String(premiumLevel)}
            items={[
              { key: "0", title: "FREE" },
              { key: "1", title: "SILVER" },
              { key: "2", title: "GOLD" },
              { key: "3", title: "PLATINUM" },
              { key: "4", title: "ELITE" }
            ]}
            onChange={(v) => setPremiumLevel(Number(v) as RoomPremiumLevel)}
          />
        </Section>

        <Section theme={theme} styles={styles} title="مكافحة السبام" icon="shield-checkmark-outline">
          <Row styles={styles}>
            <Text style={styles.rowLabel}>تفعيل Anti-Spam</Text>
            <Switch
              value={antiSpamEnabled}
              onValueChange={setAntiSpamEnabled}
              thumbColor={antiSpamEnabled ? theme.tint : undefined}
              trackColor={{ false: theme.border, true: theme.primarySoft }}
            />
          </Row>

          <Field
            theme={theme}
            styles={styles}
            label="Max Messages / Minute"
            value={maxMessagesPerMinute}
            onChange={setMaxMessagesPerMinute}
            keyboard="numeric"
            placeholder="10"
            hint="من 1 إلى 1000"
          />
        </Section>

        <Section theme={theme} styles={styles} title="رسالة الترحيب والبوت" icon="happy-outline">
          <Row styles={styles}>
            <Text style={styles.rowLabel}>تفعيل البوت</Text>
            <Switch
              value={roomBotEnabled}
              onValueChange={setRoomBotEnabled}
              thumbColor={roomBotEnabled ? theme.tint : undefined}
              trackColor={{ false: theme.border, true: theme.primarySoft }}
            />
          </Row>

          <Row styles={styles}>
            <Text style={styles.rowLabel}>تفعيل رسالة الترحيب</Text>
            <Switch
              value={welcomeEnabled}
              onValueChange={setWelcomeEnabled}
              thumbColor={welcomeEnabled ? theme.tint : undefined}
              trackColor={{ false: theme.border, true: theme.primarySoft }}
            />
          </Row>

          <Segment
            theme={theme}
            styles={styles}
            label="لغة الترحيب"
            value={welcomeLanguage}
            items={[
              { key: "ar", title: "العربية" },
              { key: "en", title: "English" }
            ]}
            onChange={(v) => setWelcomeLanguage(v as RoomBotLanguage)}
          />

          <Field
            theme={theme}
            styles={styles}
            label="رسالة الترحيب المخصصة"
            value={welcomeMessage}
            onChange={setWelcomeMessage}
            placeholder={
              welcomeLanguage === "en"
                ? "Welcome to the room 🌟"
                : "أهلًا بك في الغرفة 🌟"
            }
            multiline
            hint="إذا تركتها فارغة سيتم استخدام الرسالة الافتراضية."
          />
        </Section>

       

        <Section theme={theme} styles={styles} title="المحظورون" icon="ban-outline">
          <View style={styles.bannedSummary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannedSummaryTitle}>قائمة المحظورين</Text>
              <Text style={styles.bannedSummaryMeta}>
                العدد الحالي: {Array.isArray(bannedList) ? bannedList.length : 0}
              </Text>
              <Text style={styles.hint}>
                يتم عرضهم داخل نافذة منفصلة مع بحث وتحميل تدريجي (مناسب للقوائم الكبيرة).
              </Text>
            </View>

            <TouchableOpacity
              style={styles.openBannedBtn}
              disabled={saving || deleting}
              onPress={openBannedModal}
            >
              <Ionicons name="list-outline" size={18} color={theme.text} />
              <Text style={styles.openBannedBtnText}>عرض</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!dirty || saving || deleting || uploadingAvatar || uploadingCover) && { opacity: 0.6 }
            ]}
            disabled={!dirty || saving || deleting || uploadingAvatar || uploadingCover}
            onPress={saveAll}
          >
            {saving ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <Text style={styles.primaryBtnText}>حفظ التغييرات</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerBtn, (saving || deleting) && { opacity: 0.6 }]}
            disabled={saving || deleting}
            onPress={deleteRoom}
          >
            {deleting ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={theme.primaryText} />
                <Text style={styles.dangerBtnText}>حذف الغرفة</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={bannedModalOpen} animationType="slide" onRequestClose={() => setBannedModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setBannedModalOpen(false)}>
                <Ionicons name="close" size={18} color={theme.text} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>المحظورون</Text>
                <Text style={styles.modalSubTitle}>
                  الإجمالي: {filteredBanned.length} • المعروض: {visibleBanned.length}
                </Text>
              </View>

              <TouchableOpacity style={styles.iconBtn} onPress={refreshBanned} disabled={bannedRefreshing}>
                {bannedRefreshing ? (
                  <ActivityIndicator color={theme.tint} />
                ) : (
                  <Ionicons name="refresh" size={18} color={theme.text} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchWrap}>
              <Ionicons name="search-outline" size={18} color={theme.mutedText} />
              <TextInput
                value={bannedQuery}
                onChangeText={(t) => {
                  setBannedQuery(t);
                  setVisibleCount(25);
                  setSelectedIds({});
                }}
                placeholder="ابحث بالاسم أو @ أو السبب..."
                placeholderTextColor={theme.subtleText}
                style={styles.modalSearchInput}
              />
              {!!bannedQuery ? (
                <TouchableOpacity
                  onPress={() => {
                    setBannedQuery("");
                    setVisibleCount(25);
                    setSelectedIds({});
                  }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.mutedText} />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.bulkBar}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bulkTitle}>التحديد: {selectedCount}</Text>
                <Text style={styles.bulkHint} numberOfLines={1}>
                  اضغط على المربع لتحديد مستخدم/إلغاء تحديده.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.bulkBtn, selectedCount === 0 && { opacity: 0.5 }]}
                disabled={selectedCount === 0}
                onPress={unbanSelected}
              >
                <Ionicons name="lock-open-outline" size={18} color={theme.text} />
                <Text style={styles.bulkBtnText}>إزالة المحدد</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bulkDangerBtn} onPress={unbanAllUsers}>
                <Ionicons name="trash-outline" size={18} color={theme.primaryText} />
                <Text style={styles.bulkDangerText}>إزالة الكل</Text>
              </TouchableOpacity>
            </View>

            {bannedLoading ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator color={theme.tint} />
                <Text style={styles.centerText}>جاري تحميل المحظورين...</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={visibleBanned}
                  keyExtractor={(it, idx) => String(it?.user?._id || idx)}
                  renderItem={renderBannedItem}
                  contentContainerStyle={styles.listContent}
                  refreshControl={<RefreshControl refreshing={bannedRefreshing} onRefresh={refreshBanned} />}
                  ListEmptyComponent={
                    <View style={styles.modalCenter}>
                      <Ionicons name="checkmark-circle-outline" size={26} color={theme.success} />
                      <Text style={styles.emptyTitle}>لا يوجد مستخدمون محظورون</Text>
                      <Text style={styles.emptySub}>القائمة فارغة حاليًا.</Text>
                    </View>
                  }
                  ListFooterComponent={
                    filteredBanned.length > visibleBanned.length ? (
                      <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setVisibleCount((x) => x + 25)}>
                        <Ionicons name="add-circle-outline" size={18} color={theme.text} />
                        <Text style={styles.loadMoreText}>تحميل المزيد</Text>
                        <Text style={styles.loadMoreMeta}>
                          ({visibleBanned.length}/{filteredBanned.length})
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ height: 24 }} />
                    )
                  }
                />

                <View style={styles.modalBottomBar}>
                  <TouchableOpacity
                    style={[styles.bottomMiniBtn, selectedCount === 0 && { opacity: 0.5 }]}
                    disabled={selectedCount === 0}
                    onPress={clearSelection}
                  >
                    <Ionicons name="close-outline" size={18} color={theme.text} />
                    <Text style={styles.bottomMiniBtnText}>مسح التحديد</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bottomMiniBtn}
                    onPress={() => {
                      const next: Record<string, boolean> = {};
                      for (const it of visibleBanned) {
                        const id = String(it?.user?._id || "");
                        if (id) next[id] = true;
                      }
                      setSelectedIds(next);
                    }}
                  >
                    <Ionicons name="checkbox-outline" size={18} color={theme.text} />
                    <Text style={styles.bottomMiniBtnText}>تحديد المعروض</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Section({
  title,
  icon,
  children,
  theme,
  styles
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color={theme.text} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ children, styles }: { children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.row}>{children}</View>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  multiline,
  hint,
  theme,
  styles
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: any;
  multiline?: boolean;
  hint?: string;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.subtleText}
        keyboardType={keyboard}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 90, textAlignVertical: "top" }]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function Segment({
  label,
  value,
  items,
  onChange,
  theme,
  styles
}: {
  label: string;
  value: string;
  items: { key: string; title: string }[];
  onChange: (key: string) => void;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentWrap}>
        {items.map((it) => {
          const active = String(value) === String(it.key);
          return (
            <TouchableOpacity
              key={it.key}
              style={[styles.segmentItem, active && styles.segmentActive]}
              onPress={() => onChange(it.key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{it.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function tagsToArray(s: string) {
  const arr = String(s || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
  return Array.from(new Set(arr));
}

function clampInt(v: string, min: number, max: number, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

function createStyles(theme: AppTheme, safeTop: number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },

    container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 14 },
    containerContent: { paddingTop: 8, paddingBottom: 36 },

    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    centerText: { marginTop: 10, color: theme.text, fontWeight: "800" },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    },
    title: { fontSize: 18, fontWeight: "900", color: theme.text },

    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center"
    },

    section: { marginTop: 10 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    sectionIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center"
    },
    sectionTitle: { fontSize: 15, fontWeight: "900", color: theme.text },

    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border
    },

    roomRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    roomThumb: { width: 54, height: 54, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: theme.border },
    thumbImg: { width: "100%", height: "100%" },
    thumbPlaceholder: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center"
    },
    roomName: { fontSize: 16, fontWeight: "900", color: theme.text },
    roomMeta: { color: theme.mutedText, marginTop: 2, fontSize: 12, fontWeight: "700" },

    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.primarySoft,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border
    },
    badgeText: { fontSize: 12, fontWeight: "900", color: theme.text },

    label: { fontSize: 12, fontWeight: "900", color: theme.mutedText, marginBottom: 6 },
    input: {
      backgroundColor: theme.surface2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      fontWeight: "800"
    },
    hint: { marginTop: 6, color: theme.subtleText, fontSize: 11, fontWeight: "700" },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
      marginBottom: 10
    },
    rowLabel: { color: theme.text, fontWeight: "800" },

    segmentWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    segmentItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border
    },
    segmentActive: {
      backgroundColor: theme.text,
      borderColor: theme.text
    },
    segmentText: { color: theme.text, fontWeight: "900", fontSize: 12 },
    segmentTextActive: { color: theme.background },

    actions: { marginTop: 16, gap: 10 },
    primaryBtn: {
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center"
    },
    primaryBtnText: { color: theme.primaryText, fontWeight: "900" },

    secondaryBtn: {
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    secondaryBtnText: { color: theme.text, fontWeight: "900" },

    imageRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    imagePreviewBox: {
      width: 86,
      height: 86,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border
    },
    coverPreviewBox: { width: 130, height: 86 },
    imagePreview: { width: "100%", height: "100%" },
    coverPreview: { width: "100%", height: "100%", resizeMode: "cover" },
    imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
    imagePlaceholderText: { fontSize: 11, color: theme.mutedText, fontWeight: "900" },

    dangerBtn: {
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.danger,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    dangerBtnText: { color: theme.primaryText, fontWeight: "900" },

    bannedSummary: { flexDirection: "row", alignItems: "center", gap: 12 },
    bannedSummaryTitle: { fontSize: 13, fontWeight: "900", color: theme.text },
    bannedSummaryMeta: { marginTop: 4, color: theme.mutedText, fontSize: 12, fontWeight: "800" },

    openBannedBtn: {
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    openBannedBtnText: { color: theme.text, fontWeight: "900" },

    modalSafe: { flex: 1, backgroundColor: theme.background },
    modalRoot: { flex: 1, backgroundColor: theme.background },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.background
    },
    modalTitle: { fontSize: 16, fontWeight: "900", color: theme.text },
    modalSubTitle: { marginTop: 2, fontSize: 12, color: theme.mutedText, fontWeight: "800" },

    modalSearchWrap: {
      marginHorizontal: 14,
      marginBottom: 10,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    modalSearchInput: { flex: 1, color: theme.text, fontWeight: "900" },

    modalCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },

    listContent: { padding: 14, paddingBottom: 120 },

    bulkBar: {
      marginHorizontal: 14,
      marginBottom: 10,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    bulkTitle: { fontWeight: "900", color: theme.text },
    bulkHint: { marginTop: 2, color: theme.mutedText, fontSize: 11, fontWeight: "800" },

    bulkBtn: {
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    bulkBtnText: { fontWeight: "900", color: theme.text },

    bulkDangerBtn: {
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.danger,
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    bulkDangerText: { fontWeight: "900", color: theme.primaryText },

    bannedItem: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10
    },
    checkBox: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center"
    },
    checkBoxOn: { backgroundColor: theme.text, borderColor: theme.text },

    bannedAvatarBox: { width: 44, height: 44, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: theme.border },
    bannedAvatar: { width: "100%", height: "100%" },
    bannedAvatarPlaceholder: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center"
    },

    bannedName: { fontWeight: "900", color: theme.text },
    bannedAt: { color: theme.mutedText, fontWeight: "900" },
    bannedReason: { marginTop: 4, color: theme.text, fontWeight: "800", fontSize: 12 },
    bannedReasonMuted: { marginTop: 4, color: theme.mutedText, fontWeight: "800", fontSize: 12 },
    bannedMeta: { marginTop: 4, color: theme.subtleText, fontSize: 11, fontWeight: "800" },

    unbanBtn: {
      height: 38,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    unbanBtnText: { fontWeight: "900", color: theme.text },

    loadMoreBtn: {
      marginTop: 6,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      marginHorizontal: 14
    },
    loadMoreText: { fontWeight: "900", color: theme.text },
    loadMoreMeta: { color: theme.mutedText, fontWeight: "900" },

    modalBottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      backgroundColor: theme.overlay,
      borderTopWidth: 1,
      borderTopColor: theme.border
    },
    bottomMiniBtn: {
      flex: 1,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8
    },
    bottomMiniBtnText: { fontWeight: "900", color: theme.text },

    emptyTitle: { marginTop: 8, fontWeight: "900", color: theme.text },
    emptySub: { marginTop: 6, color: theme.mutedText, fontWeight: "800" }
  });
}