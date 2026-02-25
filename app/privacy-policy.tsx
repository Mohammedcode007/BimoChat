import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
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
            <Text style={s.headerTitle}>سياسة الخصوصية</Text>
            <Text style={s.headerSub}>
              كيف نجمع البيانات ونستخدمها ونحميها
            </Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="shield-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>Privacy</Text>
          </View>
        </View>

        {/* Intro */}
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>مقدمة</Text>
            <View style={s.cardLine} />
          </View>

          <Text style={s.text}>
            نحن نحترم خصوصية المستخدمين ونلتزم بحماية البيانات الشخصية. توضح هذه
            السياسة نوع البيانات التي قد نجمعها، وكيف نستخدمها، ومتى يمكن مشاركتها،
            وما هي حقوقك المتعلقة ببياناتك.
          </Text>

          <View style={s.noteBox}>
            <Ionicons name="information-circle-outline" size={18} color={theme.info} />
            <Text style={s.noteText}>
              باستخدامك للتطبيق، فإنك توافق على هذه السياسة. إذا لم توافق، يرجى
              التوقف عن استخدام التطبيق.
            </Text>
          </View>
        </View>

        {/* Sections */}
        <Section theme={theme} title="1) البيانات التي قد نجمعها">
          <Bullet theme={theme} text="بيانات الحساب: مثل الاسم/اسم المستخدم/المعرّف والصورة الشخصية (إن قمت بإضافتها)." />
          <Bullet theme={theme} text="محتوى الاستخدام: مثل الرسائل/المنشورات/التعليقات التي تنشئها داخل التطبيق." />
          <Bullet theme={theme} text="بيانات تقنية: مثل نوع الجهاز، نظام التشغيل، أخطاء التطبيق، وبيانات الأداء لتحسين الخدمة." />
          <Bullet theme={theme} text="بيانات الاستخدام: مثل الصفحات التي تزورها داخل التطبيق ومدة التفاعل (لأغراض التحسين والتحليلات)." />
        </Section>

        <Section theme={theme} title="2) كيف نستخدم البيانات">
          <Bullet theme={theme} text="تشغيل الخدمة وتقديم المزايا الأساسية (إنشاء الحساب، عرض المحتوى، الرسائل...)." />
          <Bullet theme={theme} text="تحسين تجربة المستخدم، والأداء، وإصلاح الأعطال." />
          <Bullet theme={theme} text="الحد من إساءة الاستخدام، ومكافحة السبام، وتعزيز الأمان." />
          <Bullet theme={theme} text="التواصل معك بخصوص تحديثات مهمة أو تغييرات في السياسات عند الحاجة." />
        </Section>

        <Section theme={theme} title="3) مشاركة البيانات مع أطراف أخرى">
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={18} color={theme.warning} />
            <Text style={s.warnText}>
              نحن لا نبيع بياناتك الشخصية. قد تتم مشاركة بيانات محدودة فقط عند
              الضرورة لتشغيل الخدمة أو الالتزام بالقانون.
            </Text>
          </View>

          <Bullet theme={theme} text="مزودو الخدمة: قد نستخدم خدمات استضافة/تحليلات/إرسال إشعارات، مع التزامهم بحماية البيانات." />
          <Bullet theme={theme} text="الالتزام القانوني: قد نشارك بيانات عند وجود طلب رسمي من جهة مختصة أو للامتثال للقانون." />
          <Bullet theme={theme} text="حماية الحقوق: عند الاشتباه بالاحتيال أو إساءة استخدام أو تهديد أمن المستخدمين." />
        </Section>

        <Section theme={theme} title="4) الأمان وحماية البيانات">
          <Bullet theme={theme} text="نستخدم إجراءات أمنية معقولة لحماية البيانات من الوصول غير المصرح به." />
          <Bullet theme={theme} text="لا توجد وسيلة آمنة 100%؛ لذلك لا يمكننا ضمان حماية مطلقة ضد جميع المخاطر." />
          <Bullet theme={theme} text="أنت مسؤول عن حماية حسابك (كلمة المرور/رموز التحقق) وعدم مشاركتها." />
        </Section>

        <Section theme={theme} title="5) الاحتفاظ بالبيانات">
          <Bullet theme={theme} text="نحتفظ بالبيانات للمدة اللازمة لتقديم الخدمة وتحسينها والامتثال للمتطلبات القانونية." />
          <Bullet theme={theme} text="قد يتم الاحتفاظ ببعض السجلات التقنية لفترة محدودة لأسباب أمنية وتشخيصية." />
        </Section>

        <Section theme={theme} title="6) حقوقك">
          <Bullet theme={theme} text="يحق لك تعديل بيانات ملفك الشخصي من داخل التطبيق." />
          <Bullet theme={theme} text="يحق لك طلب حذف حسابك/بياناتك حسب آلية الحذف المتاحة في التطبيق (إن توفرت)." />
          <Bullet theme={theme} text="يمكنك الإبلاغ عن أي محتوى مسيء أو مستخدم مخالف عبر أدوات الإبلاغ/الحظر." />
        </Section>

        <Section theme={theme} title="7) المحتوى والتواصل بين المستخدمين (تطبيق تعارف)">
          <Bullet theme={theme} text="التطبيق يوفّر منصة تواصل، وأي مشاركة لمعلومات شخصية (هاتف/عنوان/صور خاصة) تكون على مسؤوليتك." />
          <Bullet theme={theme} text="ننصح بعدم مشاركة بيانات حساسة أو إرسال أموال لأي مستخدم." />
          <Bullet theme={theme} text="لا نتحمل مسؤولية تصرفات المستخدمين أو صحة بياناتهم أو أي اتفاقات تتم بينهم داخل التطبيق أو خارجه." />
        </Section>

        <Section theme={theme} title="8) تحديثات سياسة الخصوصية">
          <Bullet theme={theme} text="قد نقوم بتحديث هذه السياسة من وقت لآخر. استمرارك في استخدام التطبيق بعد التحديث يعني موافقتك." />
          <Bullet theme={theme} text="سنحاول إظهار إشعار داخل التطبيق عند وجود تحديثات جوهرية." />
        </Section>

        <View style={s.footerCard}>
          <Ionicons name="checkmark-circle-outline" size={18} color={theme.success} />
          <Text style={s.footerText}>
            إذا كان لديك أي استفسار حول الخصوصية، يمكنك التواصل مع دعم التطبيق من
            داخل الإعدادات (إن وُجد).
          </Text>
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
    cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
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