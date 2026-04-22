import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchMyFullUser,
  selectMe,
  selectUserErrorMe,
  selectUserErrorUpdate,
  selectUserLoading,
  selectUserUpdating,
  updateMyProfileSettings,
} from "@/redux/slices/userSlice";
import type { AppDispatch } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { City, Country } from "country-state-city";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const COUNTRY_OPTIONS = Country.getAllCountries().map((country) => ({
  label: country.name,
  value: country.isoCode,
}));

const GENDER_OPTIONS = [
  { label: "ذكر", value: "male" },
  { label: "أنثى", value: "female" },
];

function Card({
  theme,
  children,
}: {
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {children}
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle?: string;
  theme: any;
}) {
  return (
    <View>
      <Text style={[styles.h2, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.h2Sub, { color: theme.textMuted }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  icon,
  multiline,
  keyboardType,
  rightHint,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  rightHint?: string;
  maxLength?: number;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
        {rightHint ? (
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            {rightHint}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: theme.surface2,
            borderColor: theme.border,
            alignItems: multiline ? "flex-start" : "center",
          },
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={theme.textMuted}
            style={{ marginTop: multiline ? 10 : 0 }}
          />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          multiline={multiline}
          keyboardType={keyboardType || "default"}
          maxLength={maxLength ?? (multiline ? 2000 : 120)}
          style={[
            styles.input,
            {
              color: theme.text,
              minHeight: multiline ? 110 : 44,
              textAlignVertical: multiline ? "top" : "center",
              textAlign: "right",
              writingDirection: "rtl",
            },
          ]}
        />
      </View>
    </View>
  );
}

function PickerField({
  label,
  value,
  onValueChange,
  items,
  theme,
  enabled = true,
  placeholder,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  theme: any;
  enabled?: boolean;
  placeholder: string;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={[styles.label, { color: theme.textMuted, marginBottom: 8 }]}>
        {label}
      </Text>

      <View
        style={[
          styles.pickerWrap,
          {
            backgroundColor: theme.surface2,
            borderColor: theme.border,
            opacity: enabled ? 1 : 0.6,
          },
        ]}
      >
        <Picker
          enabled={enabled}
          selectedValue={value}
          onValueChange={(itemValue) => onValueChange(String(itemValue))}
          style={{ color: theme.text }}
          dropdownIconColor={theme.text}
        >
          <Picker.Item label={placeholder} value="" />
          {items.map((item) => (
            <Picker.Item
              key={`${item.value}-${item.label}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  theme,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { opacity: disabled ? 0.55 : pressed ? 0.9 : 1, flex: 1 },
      ]}
    >
      <View style={[styles.primaryBtn, { backgroundColor: theme.tint }]}>
        {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
        <Text style={styles.primaryText}>{label}</Text>
      </View>
    </Pressable>
  );
}

function GhostButton({
  label,
  theme,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        { opacity: disabled ? 0.55 : pressed ? 0.9 : 1, flex: 1 },
      ]}
    >
      <View
        style={[
          styles.ghostBtn,
          { backgroundColor: theme.surface2, borderColor: theme.border },
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={theme.text} /> : null}
        <Text style={[styles.ghostText, { color: theme.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const me = useSelector(selectMe);
  const loadingMe = useSelector(selectUserLoading);
  const updating = useSelector(selectUserUpdating);
  const errorMe = useSelector(selectUserErrorMe);
  const errorUpdate = useSelector(selectUserErrorUpdate);

  const { colorScheme } = useColorScheme();
  const themeBase = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const theme = useMemo(() => {
    const background = themeBase.background;
    const card = (themeBase as any).card ?? (isDark ? "#111827" : "#FFFFFF");
    const tint = themeBase.tint;
    const text = themeBase.text;
    const border =
      (themeBase as any).border ??
      (isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.10)");

    const textMuted =
      (themeBase as any).textMuted ??
      ((themeBase as any).icon
        ? rgba((themeBase as any).icon, 0.95)
        : isDark
        ? "rgba(234,240,255,0.65)"
        : "rgba(18,24,38,0.62)");

    const surface2 =
      isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)";

    return { background, card, tint, text, border, textMuted, surface2 };
  }, [themeBase, isDark]);

  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    dispatch(fetchMyFullUser());
  }, [dispatch]);

  useEffect(() => {
    if (!me) return;

    const savedCountryName = me.country || "";
    const matchedCountry = Country.getAllCountries().find(
      (item) =>
        item.name === savedCountryName ||
        item.isoCode === savedCountryName
    );

    setBio(me.bio || "");
    setCountry(matchedCountry?.name || savedCountryName || "");
    setCountryCode(matchedCountry?.isoCode || "");
    setCity(me.city || "");
    setAge(me.age ? String(me.age) : "");
    setGender((me as any)?.gender || "");
  }, [me]);

const cityOptions = useMemo(() => {
  if (!countryCode) return [];

  const cities = City.getCitiesOfCountry(countryCode) || [];

  return cities.map((item) => ({
    label: item.name,
    value: item.name,
  }));
}, [countryCode]);
  const onChangeCountry = (value: string) => {
    setCountryCode(value);
    setCity("");

    const selectedCountry = Country.getAllCountries().find(
      (item) => item.isoCode === value
    );

    setCountry(selectedCountry?.name || "");
  };

  const onSave = async () => {
    const normalizedAge = Number(age);

    const payload: {
      bio?: string;
      country?: string;
      city?: string;
      age?: number;
      gender?: string;
    } = {
      bio,
      country,
      city,
      gender: gender || undefined,
      age:
        Number.isFinite(normalizedAge) && normalizedAge > 0
          ? normalizedAge
          : undefined,
    };

    try {
      await dispatch(updateMyProfileSettings(payload as any)).unwrap();
      router.back();
    } catch {}
  };

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <View
            style={[
              styles.topIconBtn,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </View>
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[styles.topTitle, { color: theme.text }]}>
            {t("profileSettings.headerTitle")}
          </Text>
          <Text
            style={[styles.topSub, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {loadingMe ? t("profileSettings.loading") : "تعديل البيانات الأساسية"}
          </Text>
        </View>

        <Pressable
          onPress={onSave}
          style={({ pressed }) => [
            { opacity: updating ? 0.6 : pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.topSaveBtn, { backgroundColor: theme.tint }]}>
            <Ionicons
              name={updating ? "sync-outline" : "checkmark"}
              size={18}
              color="#fff"
            />
            <Text style={styles.topSaveText}>
              {updating ? "جارٍ الحفظ" : "حفظ"}
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {errorMe ? (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: rgba("#EF4444", 0.08),
                borderColor: rgba("#EF4444", 0.2),
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.bannerText, { color: theme.text }]}>
              {errorMe}
            </Text>
          </View>
        ) : null}

        {errorUpdate ? (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: rgba("#EF4444", 0.08),
                borderColor: rgba("#EF4444", 0.2),
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={[styles.bannerText, { color: theme.text }]}>
              {errorUpdate}
            </Text>
          </View>
        ) : null}

        <Card theme={theme}>
          <SectionHeader
            title="البيانات الأساسية"
            subtitle="يمكنك تعديل النوع، العمر، الدولة، المدينة، والبايو فقط"
            theme={theme}
          />

          <PickerField
            label="النوع"
            value={gender}
            onValueChange={setGender}
            items={GENDER_OPTIONS}
            theme={theme}
            placeholder="اختر النوع"
          />

          <Field
            label="العمر"
            value={age}
            onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
            placeholder="أدخل العمر"
            theme={theme}
            icon="calendar-outline"
            keyboardType="numeric"
            maxLength={3}
          />

          <PickerField
            label="الدولة"
            value={countryCode}
            onValueChange={onChangeCountry}
            items={COUNTRY_OPTIONS}
            theme={theme}
            placeholder="اختر الدولة"
          />

          <PickerField
            label="المدينة"
            value={city}
            onValueChange={setCity}
            items={cityOptions}
            theme={theme}
            enabled={!!countryCode}
            placeholder={countryCode ? "اختر المدينة" : "اختر الدولة أولاً"}
          />

          <Field
            label="البايو"
            value={bio}
            onChangeText={setBio}
            placeholder="اكتب نبذة مختصرة عنك"
            theme={theme}
            icon="create-outline"
            multiline
            rightHint={`${bio.length}/2000`}
            maxLength={2000}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            <PrimaryButton
              label={updating ? "جارٍ الحفظ" : "حفظ"}
              icon="checkmark-outline"
              theme={theme}
              onPress={onSave}
              disabled={updating}
            />
            <GhostButton
              label="رجوع"
              icon="arrow-back-outline"
              theme={theme}
              onPress={() => router.back()}
              disabled={updating}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  topBar: {
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 16, fontWeight: "900" },
  topSub: { marginTop: 2, fontSize: 12.5, fontWeight: "700" },
  topSaveBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  topSaveText: { color: "#fff", fontSize: 13.5, fontWeight: "900" },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  h2: { fontSize: 15.5, fontWeight: "900", textAlign: "right" },
  h2Sub: {
    marginTop: 6,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "right",
  },

  label: { fontSize: 12.5, fontWeight: "800", textAlign: "right" },
  hint: { fontSize: 12, fontWeight: "800", textAlign: "right" },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
  },
  input: { flex: 1, fontSize: 13.5, fontWeight: "800" },

  pickerWrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 54,
    justifyContent: "center",
  },

  primaryBtn: {
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  ghostBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostText: { fontSize: 14, fontWeight: "900" },

  banner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "right",
  },
});