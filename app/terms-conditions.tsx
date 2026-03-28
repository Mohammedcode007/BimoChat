
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

export default function TermsConditionsScreen() {
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
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={theme.tint}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("terms.headerTitle")}</Text>
            <Text style={s.headerSub}>{t("terms.headerSub")}</Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="document-text-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>{t("terms.pill")}</Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>{t("terms.intro.title")}</Text>
            <View style={s.cardLine} />
          </View>

          <Text style={s.text}>{t("terms.intro.body")}</Text>

          <View style={s.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={theme.info}
            />
            <Text style={s.noteText}>{t("terms.intro.note")}</Text>
          </View>
        </View>

        <Section theme={theme} title={t("terms.sections.eligibility.title")}>
          <Bullet theme={theme} text={t("terms.sections.eligibility.items.legal")} />
          <Bullet theme={theme} text={t("terms.sections.eligibility.items.serious")} />
          <Bullet theme={theme} text={t("terms.sections.eligibility.items.prohibited")} />
          <Bullet theme={theme} text={t("terms.sections.eligibility.items.impersonation")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.islamicGuidelines.title")}>
          <Bullet theme={theme} text={t("terms.sections.islamicGuidelines.items.values")} />
          <Bullet theme={theme} text={t("terms.sections.islamicGuidelines.items.indecent")} />
          <Bullet theme={theme} text={t("terms.sections.islamicGuidelines.items.marriage")} />
          <Bullet theme={theme} text={t("terms.sections.islamicGuidelines.items.personalData")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.prohibitedContent.title")}>
          <Bullet theme={theme} text={t("terms.sections.prohibitedContent.items.abuse")} />
          <Bullet theme={theme} text={t("terms.sections.prohibitedContent.items.links")} />
          <Bullet theme={theme} text={t("terms.sections.prohibitedContent.items.sales")} />
          <Bullet theme={theme} text={t("terms.sections.prohibitedContent.items.performance")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.privacyData.title")}>
          <Bullet theme={theme} text={t("terms.sections.privacyData.items.operational")} />
          <Bullet theme={theme} text={t("terms.sections.privacyData.items.account")} />
          <Bullet theme={theme} text={t("terms.sections.privacyData.items.sensitive")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.disclaimer.title")}>
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={18} color={theme.warning} />
            <Text style={s.warnText}>{t("terms.sections.disclaimer.warning")}</Text>
          </View>

          <Bullet theme={theme} text={t("terms.sections.disclaimer.items.identity")} />
          <Bullet theme={theme} text={t("terms.sections.disclaimer.items.loss")} />
          <Bullet theme={theme} text={t("terms.sections.disclaimer.items.caution")} />
          <Bullet theme={theme} text={t("terms.sections.disclaimer.items.report")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.reporting.title")}>
          <Bullet theme={theme} text={t("terms.sections.reporting.items.actions")} />
          <Bullet theme={theme} text={t("terms.sections.reporting.items.disable")} />
          <Bullet theme={theme} text={t("terms.sections.reporting.items.verify")} />
        </Section>

        <Section theme={theme} title={t("terms.sections.updates.title")}>
          <Bullet theme={theme} text={t("terms.sections.updates.items.terms")} />
          <Bullet theme={theme} text={t("terms.sections.updates.items.service")} />
        </Section>

        <View style={s.footerCard}>
          <Ionicons
            name="checkmark-done-outline"
            size={18}
            color={theme.success}
          />
          <Text style={s.footerText}>{t("terms.footer")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= Small Components ================= */

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