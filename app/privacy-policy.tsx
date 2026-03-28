
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.tint} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("privacy.headerTitle")}</Text>
            <Text style={s.headerSub}>{t("privacy.headerSub")}</Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="shield-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>{t("privacy.pill")}</Text>
          </View>
        </View>

        {/* Intro */}
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>{t("privacy.intro.title")}</Text>
            <View style={s.cardLine} />
          </View>

          <Text style={s.text}>{t("privacy.intro.body")}</Text>

          <View style={s.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={theme.info}
            />
            <Text style={s.noteText}>{t("privacy.intro.note")}</Text>
          </View>
        </View>

        <Section theme={theme} title={t("privacy.sections.dataCollected.title")}>
          <Bullet theme={theme} text={t("privacy.sections.dataCollected.items.account")} />
          <Bullet theme={theme} text={t("privacy.sections.dataCollected.items.content")} />
          <Bullet theme={theme} text={t("privacy.sections.dataCollected.items.technical")} />
          <Bullet theme={theme} text={t("privacy.sections.dataCollected.items.usage")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.dataUsage.title")}>
          <Bullet theme={theme} text={t("privacy.sections.dataUsage.items.service")} />
          <Bullet theme={theme} text={t("privacy.sections.dataUsage.items.improvement")} />
          <Bullet theme={theme} text={t("privacy.sections.dataUsage.items.safety")} />
          <Bullet theme={theme} text={t("privacy.sections.dataUsage.items.communication")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.dataSharing.title")}>
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={18} color={theme.warning} />
            <Text style={s.warnText}>{t("privacy.sections.dataSharing.warning")}</Text>
          </View>

          <Bullet theme={theme} text={t("privacy.sections.dataSharing.items.providers")} />
          <Bullet theme={theme} text={t("privacy.sections.dataSharing.items.legal")} />
          <Bullet theme={theme} text={t("privacy.sections.dataSharing.items.rights")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.security.title")}>
          <Bullet theme={theme} text={t("privacy.sections.security.items.measures")} />
          <Bullet theme={theme} text={t("privacy.sections.security.items.noGuarantee")} />
          <Bullet theme={theme} text={t("privacy.sections.security.items.userResponsibility")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.retention.title")}>
          <Bullet theme={theme} text={t("privacy.sections.retention.items.duration")} />
          <Bullet theme={theme} text={t("privacy.sections.retention.items.logs")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.rights.title")}>
          <Bullet theme={theme} text={t("privacy.sections.rights.items.edit")} />
          <Bullet theme={theme} text={t("privacy.sections.rights.items.delete")} />
          <Bullet theme={theme} text={t("privacy.sections.rights.items.report")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.userContent.title")}>
          <Bullet theme={theme} text={t("privacy.sections.userContent.items.responsibility")} />
          <Bullet theme={theme} text={t("privacy.sections.userContent.items.sensitive")} />
          <Bullet theme={theme} text={t("privacy.sections.userContent.items.noLiability")} />
        </Section>

        <Section theme={theme} title={t("privacy.sections.updates.title")}>
          <Bullet theme={theme} text={t("privacy.sections.updates.items.change")} />
          <Bullet theme={theme} text={t("privacy.sections.updates.items.notice")} />
        </Section>

        <View style={s.footerCard}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={theme.success}
          />
          <Text style={s.footerText}>{t("privacy.footer")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= Components ================= */

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: any;
  children: React.ReactNode;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        <View style={s.sectionLine} />
      </View>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

function Bullet({ text, theme }: { text: string; theme: any }) {
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={s.bulletRow}>
      <View style={s.bulletDot} />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

/* ================= Styles ================= */

function makeStyles(theme: any) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },
    headerSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pillText: { fontSize: 12, fontWeight: "800", color: theme.mutedText },

    card: {
      marginTop: 14,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 2 },
      }),
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    cardTitle: { fontSize: 15, fontWeight: "900", color: theme.text },
    cardLine: { flex: 1, height: 1, backgroundColor: theme.separator },

    text: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.text,
      fontWeight: "700",
      textAlign: "right",
    },

    noteBox: {
      marginTop: 12,
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.separator,
      alignItems: "flex-start",
    },
    noteText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
    },

    section: {
      paddingHorizontal: 16,
      marginTop: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    sectionTitle: { fontSize: 14, fontWeight: "900", color: theme.text },
    sectionLine: { flex: 1, height: 1, backgroundColor: theme.separator },

    sectionCard: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      overflow: "hidden",
    },

    bulletRow: {
      flexDirection: "row-reverse",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    bulletDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.tint,
      marginTop: 6,
    },
    bulletText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
    },

    warnBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: theme.pillGoldBg,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    warnText: {
      flex: 1,
      fontSize: 12.5,
      lineHeight: 19,
      color: theme.text,
      fontWeight: "900",
      textAlign: "right",
    },

    footerCard: {
      marginTop: 16,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.primarySoft,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    footerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      color: theme.text,
      fontWeight: "900",
      textAlign: "right",
    },
  });
}