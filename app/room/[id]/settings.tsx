// app/(tabs)/room/[id]/settings.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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
  updateRoomInfo
} from "@/redux/slices/roomControl.slice";
import { uploadToCloudinary } from "@/services/upload.service";

// ✅ استيراد دالة الرفع (ضعها في مكان مناسب عندك)
// مثال: src/services/cloudinary.ts أو src/utils/uploadToCloudinary.ts

type RoomType = "public" | "private" | "protected" | "subscription";
type RoomPremiumLevel = 0 | 1 | 2 | 3 | 4;

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
};

const premiumLabel = (p: RoomPremiumLevel) =>
  p === 0 ? "FREE" : p === 1 ? "SILVER" : p === 2 ? "GOLD" : p === 3 ? "PLATINUM" : "ELITE";

export default function RoomSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const roomId = String(params?.id || "");

  const dispatch = useAppDispatch();

  // ✅ Redux state
  const roomControl = useAppSelector(selectRoomControl) as unknown as RoomDTO | null;
  const loading = useAppSelector(selectRoomControlLoading);
  const saving = useAppSelector(selectRoomControlSaving);
  const deleting = useAppSelector(selectRoomControlDeleting);
  const error = useAppSelector(selectRoomControlError);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cover, setCover] = useState("");
  const [tags, setTags] = useState(""); // comma separated

  const [type, setType] = useState<RoomType>("public");
  const [protectedPassword, setProtectedPassword] = useState("");
  const [premiumLevel, setPremiumLevel] = useState<RoomPremiumLevel>(0);

  const [maxUsers, setMaxUsers] = useState("50");
  const [subscriptionPrice, setSubscriptionPrice] = useState("0");

  const [isLocked, setIsLocked] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState("0");

  const [antiSpamEnabled, setAntiSpamEnabled] = useState(false);
  const [maxMessagesPerMinute, setMaxMessagesPerMinute] = useState("10");

  // Boost UI inputs
  const [boostLevel, setBoostLevel] = useState("0");
  const [boostHours, setBoostHours] = useState("1");

  // ✅ Uploading states (Avatar/Cover)
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    dispatch(getRoomControl({ roomId }));
  }, [roomId]);

  useEffect(() => {
    if (!error) return;
    Alert.alert("خطأ", error);
    dispatch(clearRoomControlError());
  }, [error]);

  // ✅ sync local form
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
  }, [roomControl?._id]);

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
      JSON.stringify(t) !== JSON.stringify(roomControl.tags || [])
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
    maxMessagesPerMinute
  ]);

  const reload = () => {
    if (!roomId) return;
    dispatch(getRoomControl({ roomId }));
  };

  // =========================
  // ✅ Image Picker + Cloudinary Upload
  // =========================
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

  /**
   * ✅ الحفظ الصحيح حسب endpoints في الباك
   */
  const saveAll = async () => {
    if (!roomControl) return;

    // منع الحفظ أثناء رفع الصور
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
      // 1) info
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

      // 2) type
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

      // 3) premium
      if (premiumLevel !== roomControl.premiumLevel) {
        await dispatch(changeRoomPremiumLevel({ roomId, premiumLevel })).unwrap();
      }

      // 4) lock
      if (isLocked !== !!roomControl.isLocked) {
        await dispatch(setRoomLock({ roomId, locked: isLocked })).unwrap();
      }

      // 5) antispam
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

      // 6) slowmode endpoint
      if (nextSlow !== Number(roomControl.slowModeSeconds ?? 0)) {
        await dispatch(setRoomSlowMode({ roomId, seconds: nextSlow })).unwrap();
      }

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!roomControl) {
    return (
      <View style={styles.center}>
        <Text>تعذر تحميل الغرفة</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={reload}>
          <Text style={styles.primaryBtnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const r = roomControl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>ضبط الغرفة</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Room card */}
      <View style={styles.card}>
        <View style={styles.roomRow}>
          <View style={styles.roomThumb}>
            {r.avatar ? (
              <Image source={{ uri: r.avatar }} style={styles.thumbImg} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6b7280" />
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
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Basic Info */}
      <Section title="البيانات الأساسية" icon="create-outline">
        <Field label="اسم الغرفة" value={name} onChange={setName} placeholder="اسم الغرفة" />
        <Field
          label="وصف الغرفة"
          value={description}
          onChange={setDescription}
          placeholder="وصف مختصر"
          multiline
        />

        {/* ✅ Avatar Upload */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Avatar</Text>

          <View style={styles.imageRow}>
            <View style={styles.imagePreviewBox}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={22} color="#6b7280" />
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
                  <ActivityIndicator />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#111827" />
                    <Text style={styles.secondaryBtnText}>اختيار ورفع Avatar</Text>
                  </>
                )}
              </TouchableOpacity>

              <Field
                label="Avatar URL"
                value={avatar}
                onChange={setAvatar}
                placeholder="https://..."
                hint="يمكنك تركه أو تعديله يدويًا"
              />
            </View>
          </View>
        </View>

        {/* ✅ Cover Upload */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Cover</Text>

          <View style={styles.imageRow}>
            <View style={[styles.imagePreviewBox, styles.coverPreviewBox]}>
              {cover ? (
                <Image source={{ uri: cover }} style={styles.coverPreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={22} color="#6b7280" />
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
                  <ActivityIndicator />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#111827" />
                    <Text style={styles.secondaryBtnText}>اختيار ورفع Cover</Text>
                  </>
                )}
              </TouchableOpacity>

              <Field
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
          label="Tags"
          value={tags}
          onChange={setTags}
          placeholder="مثال: music, sports, fun"
          hint="افصل بين التاجات بفاصلة"
        />
      </Section>

      {/* Access & Limits */}
      <Section title="التحكم في الوصول والحدود" icon="lock-closed-outline">
        <Row>
          <Text style={styles.rowLabel}>قفل الغرفة (منع الدخول مؤقتًا)</Text>
          <Switch value={isLocked} onValueChange={toggleLockRemote} />
        </Row>

   <Field
  label="الحد الأقصى للمستخدمين"
  value={maxUsers}
  onChange={(v) => {
    // ✅ اقبل فقط أرقام
    const digits = String(v || "").replace(/[^\d]/g, "");

    // ✅ اسمح بالفراغ (حتى يقدر يمسح)
    if (!digits) {
      setMaxUsers("");
      return;
    }

    // ✅ حد أقصى 100
    const n = Math.min(100, Math.max(1, Number(digits) || 1));
    setMaxUsers(String(n));
  }}
  keyboard="numeric"
  placeholder="50"
/>

        <Field
          label="Slow Mode (ثواني)"
          value={slowModeSeconds}
          onChange={setSlowModeSeconds}
          keyboard="numeric"
          placeholder="0"
          hint="0 لإيقافه، الحد الأقصى 3600"
        />
      </Section>

      {/* Type / Premium */}
      <Section title="نوع الغرفة والاشتراك" icon="options-outline">
        <Segment
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
            label="Protected Password"
            value={protectedPassword}
            onChange={setProtectedPassword}
            placeholder="كلمة المرور"
            hint="مطلوبة عند اختيار Protected"
          />
        ) : null}

        {type === "subscription" ? (
          <Field
            label="Subscription Price"
            value={subscriptionPrice}
            onChange={setSubscriptionPrice}
            keyboard="numeric"
            placeholder="0"
          />
        ) : null}

        <Segment
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

      {/* Anti Spam */}
      <Section title="مكافحة السبام" icon="shield-checkmark-outline">
        <Row>
          <Text style={styles.rowLabel}>تفعيل Anti-Spam</Text>
          <Switch value={antiSpamEnabled} onValueChange={setAntiSpamEnabled} />
        </Row>

        <Field
          label="Max Messages / Minute"
          value={maxMessagesPerMinute}
          onChange={setMaxMessagesPerMinute}
          keyboard="numeric"
          placeholder="10"
          hint="من 1 إلى 1000"
        />
      </Section>

      {/* Boost */}
      <Section title="Boost" icon="flash-outline">
        <Field
          label="Boost Level (0-10)"
          value={boostLevel}
          onChange={setBoostLevel}
          keyboard="numeric"
          placeholder="0"
        />
        <Field
          label="Boost Hours (1-720)"
          value={boostHours}
          onChange={setBoostHours}
          keyboard="numeric"
          placeholder="1"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, (saving || deleting) && { opacity: 0.6 }]}
          disabled={saving || deleting}
          onPress={doBoost}
        >
          {saving ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>تنفيذ Boost</Text>}
        </TouchableOpacity>
      </Section>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!dirty || saving || deleting || uploadingAvatar || uploadingCover) && { opacity: 0.6 }
          ]}
          disabled={!dirty || saving || deleting || uploadingAvatar || uploadingCover}
          onPress={saveAll}
        >
          {saving ? <ActivityIndicator /> : <Text style={styles.primaryBtnText}>حفظ التغييرات</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerBtn, (saving || deleting) && { opacity: 0.6 }]}
          disabled={saving || deleting}
          onPress={deleteRoom}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.dangerBtnText}>حذف الغرفة</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =========================
   UI Helpers
========================= */

function Section({
  title,
  icon,
  children
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color="#111827" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  multiline,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: any;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
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
  onChange
}: {
  label: string;
  value: string;
  items: { key: string; title: string }[];
  onChange: (key: string) => void;
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

/* =========================
   Utils
========================= */

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

/* =========================
   Styles
========================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 14 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },

  section: { marginTop: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },

  roomRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  roomThumb: { width: 54, height: 54, borderRadius: 16, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center"
  },
  roomName: { fontSize: 16, fontWeight: "900", color: "#111827" },
  roomMeta: { color: "#6b7280", marginTop: 2, fontSize: 12 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ecfdf5",
    borderRadius: 999
  },
  badgeText: { fontSize: 12, fontWeight: "800", color: "#16a34a" },

  label: { fontSize: 12, fontWeight: "800", color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827"
  },
  hint: { marginTop: 6, color: "#6b7280", fontSize: 11 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginBottom: 10
  },
  rowLabel: { color: "#111827", fontWeight: "700" },

  segmentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  segmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  segmentActive: {
    backgroundColor: "#111827",
    borderColor: "#111827"
  },
  segmentText: { color: "#111827", fontWeight: "800", fontSize: 12 },
  segmentTextActive: { color: "#fff" },

  actions: { marginTop: 16, gap: 10 },
  primaryBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  // ✅ زر ثانوي لرفع الصور
  secondaryBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  secondaryBtnText: { color: "#111827", fontWeight: "900" },

  // ✅ معاينة الصور
  imageRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  imagePreviewBox: {
    width: 86,
    height: 86,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  coverPreviewBox: {
    width: 130,
    height: 86
  },
  imagePreview: { width: "100%", height: "100%" },
  coverPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  imagePlaceholderText: { fontSize: 11, color: "#6b7280", fontWeight: "800" },

  dangerBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  dangerBtnText: { color: "#fff", fontWeight: "900" }
});