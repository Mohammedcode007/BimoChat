
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SupportAction =
  | {
      type: "email";
      title: string;
      subtitle: string;
      icon: any;
      email: string;
      subject?: string;
    }
  | { type: "chat"; title: string; subtitle: string; icon: any }
  | { type: "faq"; title: string; subtitle: string; icon: any }
  | { type: "report"; title: string; subtitle: string; icon: any }
  | { type: "guidelines"; title: string; subtitle: string; icon: any }
  | { type: "safety"; title: string; subtitle: string; icon: any };

export default function HelpSupportScreen() {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();

  const SUPPORT_EMAIL = "support@bimo.app";

  const items: SupportAction[] = [
    {
      type: "email",
      title: t("helpSupport.items.email.title"),
      subtitle: t("helpSupport.items.email.subtitle"),
      icon: "mail-outline",
      email: SUPPORT_EMAIL,
      subject: t("helpSupport.emailSubject"),
    },
    {
      type: "chat",
      title: t("helpSupport.items.chat.title"),
      subtitle: t("helpSupport.items.chat.subtitle"),
      icon: "chatbubble-ellipses-outline",
    },
    {
      type: "faq",
      title: t("helpSupport.items.faq.title"),
      subtitle: t("helpSupport.items.faq.subtitle"),
      icon: "help-buoy-outline",
    },
    {
      type: "report",
      title: t("helpSupport.items.report.title"),
      subtitle: t("helpSupport.items.report.subtitle"),
      icon: "flag-outline",
    },
    {
      type: "guidelines",
      title: t("helpSupport.items.guidelines.title"),
      subtitle: t("helpSupport.items.guidelines.subtitle"),
      icon: "document-text-outline",
    },
    {
      type: "safety",
      title: t("helpSupport.items.safety.title"),
      subtitle: t("helpSupport.items.safety.subtitle"),
      icon: "shield-checkmark-outline",
    },
  ];

  const onPressItem = async (item: SupportAction) => {
    try {
      if (item.type === "email") {
        const subject = encodeURIComponent(item.subject || t("helpSupport.fallbackSubject"));
        const body = encodeURIComponent(
          [
            t("helpSupport.emailTemplate.greeting"),
            "",
            t("helpSupport.emailTemplate.problemIntro"),
            t("helpSupport.emailTemplate.problemDescription"),
            t("helpSupport.emailTemplate.problemSteps"),
            t("helpSupport.emailTemplate.problemAttachment"),
            "",
            t("helpSupport.emailTemplate.deviceInfoTitle"),
            t("helpSupport.emailTemplate.deviceSystem"),
            t("helpSupport.emailTemplate.deviceVersion"),
            "",
            t("helpSupport.emailTemplate.thanks"),
          ].join("\n")
        );

        const url = `mailto:${item.email}?subject=${subject}&body=${body}`;
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url);
        return;
      }

      if (item.type === "chat") {
        router.push("/support/chat");
        return;
      }

      return;
    } catch {
      return;
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
  <ScrollView
    style={s.container}
    contentContainerStyle={{ paddingBottom: 24 }}
    showsVerticalScrollIndicator={false}
  >     
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="help-circle-outline" size={18} color={theme.tint} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("helpSupport.headerTitle")}</Text>
            <Text style={s.headerSub}>{t("helpSupport.headerSub")}</Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="sparkles-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>{t("helpSupport.pill")}</Text>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={s.tipsCard}>
          <View style={s.tipRow}>
            <Ionicons name="information-circle-outline" size={18} color={theme.info} />
            <Text style={s.tipText}>{t("helpSupport.tips.updateApp")}</Text>
          </View>
          <View style={s.tipRow}>
            <Ionicons name="shield-outline" size={18} color={theme.warning} />
            <Text style={s.tipText}>{t("helpSupport.tips.passwordWarning")}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={s.card}>
          {items.map((it, idx) => (
            <SupportItem
              key={`${it.type}-${idx}`}
              theme={theme}
              title={it.title}
              subtitle={it.subtitle}
              icon={it.icon}
              isLast={idx === items.length - 1}
              onPress={() => onPressItem(it)}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Ionicons name="lock-closed-outline" size={16} color={theme.icon} />
          <Text style={s.footerText}>{t("helpSupport.footer")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SupportItem({
  icon,
  title,
  subtitle,
  onPress,
  theme,
  isLast,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: any;
  isLast?: boolean;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[s.row, isLast && s.rowLast]}
      onPress={onPress}
    >
      <View style={s.left}>
        <View style={s.iconBox}>
          <Ionicons name={icon} size={18} color={theme.tint} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={s.rowSub} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.icon} />
    </TouchableOpacity>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },

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
      backgroundColor: theme.background,
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

    tipsCard: {
      marginTop: 14,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
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
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    tipText: {
      flex: 1,
      fontSize: 12.5,
      lineHeight: 19,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
    },

    card: {
      marginTop: 14,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: "transparent",
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      paddingRight: 10,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      textAlign: "right",
    },
    rowSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "right",
    },

    footer: {
      marginTop: 14,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    
    footerText: {
      flex: 1,
      fontSize: 12.5,
      lineHeight: 19,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
    },
  });
}