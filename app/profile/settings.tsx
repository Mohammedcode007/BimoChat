
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
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width: W } = Dimensions.get("window");

function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function Divider({ theme }: { theme: any }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.border,
        opacity: 0.9,
        marginVertical: 12,
      }}
    />
  );
}

function SectionHeader({
  title,
  subtitle,
  theme,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.h2, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text
            style={[styles.h2Sub, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {icon ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <View
            style={[
              styles.iconPill,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <Ionicons name={icon} size={18} color={theme.text} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

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

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  icon,
  multiline,
  rightHint,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  rightHint?: string;
  editable?: boolean;
}) {
  return (
    <View style={{ marginTop: 12 }}>
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
            opacity: editable ? 1 : 0.7,
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
          editable={editable}
          style={[
            styles.input,
            {
              color: theme.text,
              minHeight: multiline ? 90 : 44,
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

function Chip({
  label,
  active,
  theme,
  onPress,
}: {
  label: string;
  active?: boolean;
  theme: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View
        style={[
          styles.chip,
          {
            backgroundColor: active ? rgba(theme.tint, 0.18) : theme.surface2,
            borderColor: active ? rgba(theme.tint, 0.35) : theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? theme.tint : theme.text },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
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
  danger,
  onPress,
  disabled,
}: {
  label: string;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
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
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={danger ? "#EF4444" : theme.text}
          />
        ) : null}
        <Text
          style={[
            styles.ghostText,
            { color: danger ? "#EF4444" : theme.text },
          ]}
        >
          {label}
        </Text>
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

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

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

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [privacyProfileVisible, setPrivacyProfileVisible] = useState(true);
  const [privacyShowLastActive, setPrivacyShowLastActive] = useState(true);
  const [privacyShowMedia, setPrivacyShowMedia] = useState(true);
  const [privacyAllowMessages, setPrivacyAllowMessages] = useState(true);

  const [notifMessages, setNotifMessages] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);

  const [partnerAgeRange, setPartnerAgeRange] = useState("");
  const [partnerLocation, setPartnerLocation] = useState("");
  const [partnerMarital, setPartnerMarital] = useState("");
  const [partnerReligiosity, setPartnerReligiosity] = useState("");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = [
    t("profileSettings.tags.calm"),
    t("profileSettings.tags.respect"),
    t("profileSettings.tags.reading"),
    t("profileSettings.tags.education"),
    t("profileSettings.tags.lightSports"),
    t("profileSettings.tags.familyLife"),
    t("profileSettings.tags.travel"),
    t("profileSettings.tags.volunteering"),
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  useEffect(() => {
    dispatch(fetchMyFullUser());
  }, [dispatch]);

  useEffect(() => {
    if (!me) return;

    setDisplayName(me.displayName || "");
    setUsername(me.atUsername || "");
    setBio(me.bio || "");
    setCity(me.city || "");
    setCountry(me.country || "");

    setPrivacyProfileVisible(me.privacy?.profileVisible ?? true);
    setPrivacyShowLastActive(me.privacy?.showLastActive ?? true);
    setPrivacyShowMedia(me.privacy?.showMedia ?? true);
    setPrivacyAllowMessages(me.privacy?.allowMessages ?? true);

    setNotifMessages(me.notifications?.messages ?? true);
    setNotifLikes(me.notifications?.likes ?? true);
    setNotifFollows(me.notifications?.follows ?? true);

    setPartnerAgeRange(me.partnerPreferences?.ageRange || "");
    setPartnerLocation(me.partnerPreferences?.location || "");
    setPartnerMarital(me.partnerPreferences?.maritalStatus || "");
    setPartnerReligiosity(me.partnerPreferences?.religiosity || "");

    setSelectedTags(Array.isArray(me.tags) ? me.tags : []);
  }, [me]);

  const onSave = async () => {
    const payload = {
      displayName,
      bio,
      city,
      country,
      tags: selectedTags,

      privacy: {
        profileVisible: privacyProfileVisible,
        showLastActive: privacyShowLastActive,
        showMedia: privacyShowMedia,
        allowMessages: privacyAllowMessages,
      },

      notifications: {
        messages: notifMessages,
        likes: notifLikes,
        follows: notifFollows,
      },

      partnerPreferences: {
        ageRange: partnerAgeRange,
        location: partnerLocation,
        maritalStatus: partnerMarital,
        religiosity: partnerReligiosity,
      },
    };

    try {
      await dispatch(updateMyProfileSettings(payload)).unwrap();
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
            {loadingMe
              ? t("profileSettings.loading")
              : t("profileSettings.headerSub")}
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
              {updating
                ? t("profileSettings.actions.saving")
                : t("profileSettings.actions.save")}
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
            title={t("profileSettings.quickSummary.title")}
            subtitle={t("profileSettings.quickSummary.subtitle")}
            theme={theme}
            icon="refresh-outline"
            onPress={() => dispatch(fetchMyFullUser())}
          />

          <View
            style={[
              styles.preview,
              { backgroundColor: theme.surface2, borderColor: theme.border },
            ]}
          >
            <View style={styles.previewLeft}>
              <View
                style={[
                  styles.avatarWrap,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}
              >
                <Image
                  source={{
                    uri:
                      me?.avatar ||
                      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
                  }}
                  style={styles.avatar}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.previewName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {displayName || "—"}
                </Text>
                <Text
                  style={[styles.previewUser, { color: theme.textMuted }]}
                  numberOfLines={1}
                >
                  {username || "—"} • {city || "—"}، {country || "—"}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.previewPill,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={16}
                color={theme.textMuted}
              />
              <Text
                style={[styles.previewPillText, { color: theme.textMuted }]}
              >
                {isDark
                  ? t("profileSettings.theme.dark")
                  : t("profileSettings.theme.light")}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <PrimaryButton
              label={t("profileSettings.actions.save")}
              icon="checkmark-outline"
              theme={theme}
              onPress={onSave}
              disabled={updating}
            />
            <GhostButton
              label={t("profileSettings.actions.back")}
              icon="arrow-back-outline"
              theme={theme}
              onPress={() => router.back()}
              disabled={updating}
            />
          </View>
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.basic.title")}
            subtitle={t("profileSettings.basic.subtitle")}
            theme={theme}
          />

          <Field
            label={t("profileSettings.basic.fields.displayName")}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("profileSettings.basic.placeholders.displayName")}
            theme={theme}
            icon="person-outline"
          />

          <Field
            label={t("profileSettings.basic.fields.username")}
            value={username}
            onChangeText={() => {}}
            placeholder={t("profileSettings.basic.placeholders.username")}
            theme={theme}
            icon="at-outline"
            rightHint={t("profileSettings.basic.readOnly")}
            editable={false}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field
                label={t("profileSettings.basic.fields.city")}
                value={city}
                onChangeText={setCity}
                placeholder={t("profileSettings.basic.placeholders.city")}
                theme={theme}
                icon="location-outline"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Field
                label={t("profileSettings.basic.fields.country")}
                value={country}
                onChangeText={setCountry}
                placeholder={t("profileSettings.basic.placeholders.country")}
                theme={theme}
                icon="flag-outline"
              />
            </View>
          </View>

          <Field
            label={t("profileSettings.basic.fields.bio")}
            value={bio}
            onChangeText={setBio}
            placeholder={t("profileSettings.basic.placeholders.bio")}
            theme={theme}
            icon="create-outline"
            multiline
            rightHint={`${bio.length}/2000`}
          />
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.media.title")}
            subtitle={t("profileSettings.media.subtitle")}
            theme={theme}
          />

          <View
            style={[
              styles.switchRow,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface2,
                marginTop: 12,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                {t("profileSettings.media.allowMedia.title")}
              </Text>
              <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                {t("profileSettings.media.allowMedia.subtitle")}
              </Text>
            </View>

            <Switch
              value={privacyShowMedia}
              onValueChange={setPrivacyShowMedia}
              trackColor={{
                false: rgba(theme.textMuted, 0.25),
                true: rgba(theme.tint, 0.35),
              }}
              thumbColor={privacyShowMedia ? theme.tint : theme.textMuted}
            />
          </View>
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.partner.title")}
            subtitle={t("profileSettings.partner.subtitle")}
            theme={theme}
          />

          <Field
            label={t("profileSettings.partner.fields.ageRange")}
            value={partnerAgeRange}
            onChangeText={setPartnerAgeRange}
            placeholder={t("profileSettings.partner.placeholders.ageRange")}
            theme={theme}
            icon="time-outline"
          />

          <Field
            label={t("profileSettings.partner.fields.location")}
            value={partnerLocation}
            onChangeText={setPartnerLocation}
            placeholder={t("profileSettings.partner.placeholders.location")}
            theme={theme}
            icon="map-outline"
          />

          <Field
            label={t("profileSettings.partner.fields.maritalStatus")}
            value={partnerMarital}
            onChangeText={setPartnerMarital}
            placeholder={t("profileSettings.partner.placeholders.maritalStatus")}
            theme={theme}
            icon="people-outline"
          />

          <Field
            label={t("profileSettings.partner.fields.religiosity")}
            value={partnerReligiosity}
            onChangeText={setPartnerReligiosity}
            placeholder={t("profileSettings.partner.placeholders.religiosity")}
            theme={theme}
            icon="shield-outline"
          />
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.interests.title")}
            subtitle={t("profileSettings.interests.subtitle")}
            theme={theme}
          />

          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}
          >
            {allTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                active={selectedTags.includes(tag)}
                theme={theme}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.privacy.title")}
            subtitle={t("profileSettings.privacy.subtitle")}
            theme={theme}
          />

          <View style={{ gap: 10, marginTop: 12 }}>
            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.privacy.profileVisible.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.privacy.profileVisible.subtitle")}
                </Text>
              </View>

              <Switch
                value={privacyProfileVisible}
                onValueChange={setPrivacyProfileVisible}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={privacyProfileVisible ? theme.tint : theme.textMuted}
              />
            </View>

            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.privacy.lastActive.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.privacy.lastActive.subtitle")}
                </Text>
              </View>

              <Switch
                value={privacyShowLastActive}
                onValueChange={setPrivacyShowLastActive}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={privacyShowLastActive ? theme.tint : theme.textMuted}
              />
            </View>

            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.privacy.allowMessages.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.privacy.allowMessages.subtitle")}
                </Text>
              </View>

              <Switch
                value={privacyAllowMessages}
                onValueChange={setPrivacyAllowMessages}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={privacyAllowMessages ? theme.tint : theme.textMuted}
              />
            </View>
          </View>
        </Card>

        <Card theme={theme}>
          <SectionHeader
            title={t("profileSettings.notifications.title")}
            subtitle={t("profileSettings.notifications.subtitle")}
            theme={theme}
          />

          <View style={{ gap: 10, marginTop: 12 }}>
            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.notifications.messages.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.notifications.messages.subtitle")}
                </Text>
              </View>

              <Switch
                value={notifMessages}
                onValueChange={setNotifMessages}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={notifMessages ? theme.tint : theme.textMuted}
              />
            </View>

            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.notifications.likes.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.notifications.likes.subtitle")}
                </Text>
              </View>

              <Switch
                value={notifLikes}
                onValueChange={setNotifLikes}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={notifLikes ? theme.tint : theme.textMuted}
              />
            </View>

            <View
              style={[
                styles.switchRow,
                { borderColor: theme.border, backgroundColor: theme.surface2 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  {t("profileSettings.notifications.follows.title")}
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  {t("profileSettings.notifications.follows.subtitle")}
                </Text>
              </View>

              <Switch
                value={notifFollows}
                onValueChange={setNotifFollows}
                trackColor={{
                  false: rgba(theme.textMuted, 0.25),
                  true: rgba(theme.tint, 0.35),
                }}
                thumbColor={notifFollows ? theme.tint : theme.textMuted}
              />
            </View>
          </View>

          <Divider theme={theme} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <PrimaryButton
              label={
                updating
                  ? t("profileSettings.actions.saving")
                  : t("profileSettings.actions.save")
              }
              icon="checkmark-outline"
              theme={theme}
              onPress={onSave}
              disabled={updating}
            />
            <GhostButton
              label={t("profileSettings.actions.back")}
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

  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  preview: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    padding: 3,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 14 },
  previewName: { fontSize: 14.5, fontWeight: "900", textAlign: "right" },
  previewUser: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "right",
  },
  previewPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewPillText: { fontSize: 12.5, fontWeight: "800" },

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

  switchRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  switchTitle: { fontSize: 13.5, fontWeight: "900", textAlign: "right" },
  switchSub: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 17,
    textAlign: "right",
  },

  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: W - 24,
  },
  chipText: { fontSize: 12.5, fontWeight: "900" },

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