// app/(tabs)/profile/settings.tsx
// ✅ صفحة إعدادات الملف الشخصي
// ✅ تصميم عصري
// ✅ تستخدم Colors + useColorScheme
// ✅ بدون مكتبات خارجية

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    useColorScheme,
    View,
} from "react-native";

function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ProfileSettingsScreen() {
  const colorScheme = useColorScheme();
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
      (isDark ? "rgba(234,240,255,0.65)" : "rgba(18,24,38,0.62)");
    const surface2 = isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(17,24,39,0.06)";

    return { background, card, tint, text, border, textMuted, surface2 };
  }, [themeBase, isDark]);

  // =========================
  // حالات (اربطها لاحقًا بالباك)
  // =========================
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showMedia, setShowMedia] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [muteFollowers, setMuteFollowers] = useState(false);

  const handleSave = () => {
    Alert.alert("تم الحفظ", "تم حفظ إعدادات الملف بنجاح.");
    // لاحقًا: dispatch(saveSettings(...)) أو call API
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const SettingRow = ({
    icon,
    label,
    description,
    value,
    onChange,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.surface2 },
          ]}
        >
          <Ionicons name={icon} size={18} color={theme.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: theme.text }]}>
            {label}
          </Text>
          {description ? (
            <Text
              style={[
                styles.rowDesc,
                { color: theme.textMuted },
              ]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: rgba(theme.border, 0.6),
          true: theme.tint,
        }}
        thumbColor={
          Platform.OS === "android"
            ? value
              ? "#fff"
              : "#f4f4f4"
            : undefined
        }
      />
    </View>
  );

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          إعدادات الملف الشخصي
        </Text>

        {/* =========================
           الخصوصية
        ========================= */}
        <Section title="الخصوصية">
          <SettingRow
            icon="lock-closed-outline"
            label="حساب خاص"
            description="الموافقة على طلبات المتابعة قبل عرض الملف."
            value={isPrivate}
            onChange={setIsPrivate}
          />
          <SettingRow
            icon="eye-outline"
            label="إظهار آخر ظهور"
            description="السماح للآخرين برؤية وقت نشاطك."
            value={showLastSeen}
            onChange={setShowLastSeen}
          />
          <SettingRow
            icon="images-outline"
            label="عرض الوسائط"
            description="السماح بعرض الصور والوسائط."
            value={showMedia}
            onChange={setShowMedia}
          />
        </Section>

        {/* =========================
           التفاعل
        ========================= */}
        <Section title="التفاعل">
          <SettingRow
            icon="chatbubble-ellipses-outline"
            label="السماح بالرسائل"
            description="يمكن للآخرين مراسلتك."
            value={allowMessages}
            onChange={setAllowMessages}
          />
          <SettingRow
            icon="person-add-outline"
            label="السماح بالمتابعة"
            description="يمكن للآخرين متابعتك."
            value={allowFollow}
            onChange={setAllowFollow}
          />
          <SettingRow
            icon="volume-mute-outline"
            label="كتم إشعارات المتابعين"
            description="عدم استقبال إشعارات المتابعة."
            value={muteFollowers}
            onChange={setMuteFollowers}
          />
        </Section>

        {/* =========================
           الإشعارات
        ========================= */}
        <Section title="الإشعارات">
          <SettingRow
            icon="notifications-outline"
            label="تفعيل الإشعارات"
            description="استقبال تنبيهات عن الإعجابات والرسائل."
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
        </Section>

        {/* =========================
           زر حفظ
        ========================= */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View
            style={[
              styles.saveBtn,
              { backgroundColor: theme.tint },
            ]}
          >
            <Ionicons
              name="checkmark-outline"
              size={18}
              color="#fff"
            />
            <Text style={styles.saveText}>
              حفظ التغييرات
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  header: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },

  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },

  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  rowDesc: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
  },

  saveBtn: {
    height: 48,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});