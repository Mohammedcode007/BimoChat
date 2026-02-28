import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SupportAction =
  | { type: "email"; title: string; subtitle: string; icon: any; email: string; subject?: string }
  | { type: "chat"; title: string; subtitle: string; icon: any }
  | { type: "faq"; title: string; subtitle: string; icon: any }
  | { type: "report"; title: string; subtitle: string; icon: any }
  | { type: "guidelines"; title: string; subtitle: string; icon: any }
  | { type: "safety"; title: string; subtitle: string; icon: any };

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  // ✅ عدّل الإيميل حسب مشروعك
  const SUPPORT_EMAIL = "support@bimo.app";

  const items: SupportAction[] = [
    {
      type: "email",
      title: "تواصل عبر البريد الإلكتروني",
      subtitle: "ارسل لنا المشكلة وسيتم الرد في أقرب وقت",
      icon: "mail-outline",
      email: SUPPORT_EMAIL,
      subject: "Bimo Support",
    },
    {
      type: "chat",
      title: "الدردشة مع الدعم",
      subtitle: "محادثة مباشرة مع فريق الدعم (إن كانت مفعلة)",
      icon: "chatbubble-ellipses-outline",
    },
    {
      type: "faq",
      title: "الأسئلة الشائعة",
      subtitle: "إجابات سريعة لأكثر الأسئلة تكرارًا",
      icon: "help-buoy-outline",
    },
    {
      type: "report",
      title: "الإبلاغ عن مستخدم أو محتوى",
      subtitle: "الإبلاغ عن إساءة أو مخالفة سياسة الاستخدام",
      icon: "flag-outline",
    },
    {
      type: "guidelines",
      title: "إرشادات الاستخدام",
      subtitle: "نصائح لتجربة أكثر أمانًا واحترامًا",
      icon: "document-text-outline",
    },
    {
      type: "safety",
      title: "السلامة والخصوصية",
      subtitle: "نصائح لحماية بياناتك وحسابك",
      icon: "shield-checkmark-outline",
    },
  ];

  const onPressItem = async (item: SupportAction) => {
    try {
      if (item.type === "email") {
        const subject = encodeURIComponent(item.subject || "Support");
        const body = encodeURIComponent(
          [
            "مرحبًا فريق الدعم،",
            "",
            "أواجه المشكلة التالية:",
            "- وصف المشكلة:",
            "- خطوات إعادة المشكلة:",
            "- لقطة/تفاصيل إن وجدت:",
            "",
            "معلومات الجهاز (اختياري):",
            "- النظام:",
            "- الإصدار:",
            "",
            "شكرًا لكم.",
          ].join("\n")
        );

        const url = `mailto:${item.email}?subject=${subject}&body=${body}`;
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url);
        return;
      }

      if (item.type === "chat") {
        router.push("/support/chat"); // ✅ يفتح صفحة إرسال رسالة للدعم داخل التطبيق
        return;
      }


      // مؤقتًا: لا شيء
      return;
    } catch {
      // تجاهل الأخطاء بهدوء
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="help-circle-outline" size={18} color={theme.tint} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>المساعدة والدعم</Text>
            <Text style={s.headerSub}>
              الدعم الفني، الأسئلة الشائعة، والإبلاغ عن المشاكل
            </Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="sparkles-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>Support</Text>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={s.tipsCard}>
          <View style={s.tipRow}>
            <Ionicons name="information-circle-outline" size={18} color={theme.info} />
            <Text style={s.tipText}>
              قبل التواصل، جرّب تحديث التطبيق وإعادة فتحه، وتأكد من اتصال الإنترنت.
            </Text>
          </View>
          <View style={s.tipRow}>
            <Ionicons name="shield-outline" size={18} color={theme.warning} />
            <Text style={s.tipText}>
              لا تشارك كلمة المرور أو رمز التحقق مع أي شخص—even الدعم.
            </Text>
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
          <Text style={s.footerText}>
            نلتزم بالخصوصية. قد نطلب معلومات تشخيصية غير حساسة فقط لتحسين الخدمة.
          </Text>
        </View>
      </View>
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
    <TouchableOpacity activeOpacity={0.85} style={[s.row, isLast && s.rowLast]} onPress={onPress}>
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
      paddingBottom: 16,
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