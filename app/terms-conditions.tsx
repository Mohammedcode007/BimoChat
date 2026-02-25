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

export default function TermsConditionsScreen() {
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
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>الشروط والأحكام</Text>
            <Text style={s.headerSub}>
              يرجى القراءة بعناية قبل استخدام التطبيق
            </Text>
          </View>

          <View style={s.pill}>
            <Ionicons name="moon-outline" size={14} color={theme.icon} />
            <Text style={s.pillText}>
              {colorScheme === "dark" ? "Dark" : "Light"}
            </Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>مقدمة</Text>
            <View style={s.cardLine} />
          </View>

          <Text style={s.text}>
            هذا التطبيق مخصص للتعارف الإسلامي وفق الضوابط الشرعية والأخلاقية، ويهدف إلى
            توفير بيئة محترمة تساعد المستخدمين على التواصل بشكل جاد وبنية واضحة.
            باستخدامك للتطبيق فأنت تقرّ بأنك قرأت هذه الشروط وفهمتها ووافقت عليها كاملة.
          </Text>

          <View style={s.noteBox}>
            <Ionicons name="information-circle-outline" size={18} color={theme.info} />
            <Text style={s.noteText}>
              في حال عدم موافقتك على أي بند، يرجى التوقف عن استخدام التطبيق فورًا.
            </Text>
          </View>
        </View>

        {/* Sections */}
        <Section theme={theme} title="1) الأهلية وحسن الاستخدام">
          <Bullet theme={theme} text="يلزم أن يكون المستخدم مؤهلًا قانونيًا لاستخدام التطبيق وفق قوانين دولته." />
          <Bullet theme={theme} text="يلتزم المستخدم باستخدام التطبيق للتعارف الجاد فقط وبأسلوب محترم." />
          <Bullet theme={theme} text="يُحظر استخدام التطبيق لأي أغراض غير أخلاقية أو للتسلية أو الابتزاز أو الإساءة." />
          <Bullet theme={theme} text="يُحظر انتحال شخصية الغير أو تقديم معلومات مضللة." />
        </Section>

        <Section theme={theme} title="2) ضوابط التعرّف الإسلامي">
          <Bullet theme={theme} text="يلتزم المستخدم باحترام القيم الإسلامية والآداب العامة أثناء المحادثة." />
          <Bullet theme={theme} text="يُمنع تبادل محتوى خادش للحياء أو مخالف للشرع (صور/فيديو/نصوص/روابط)." />
          <Bullet theme={theme} text="يُفضّل أن يكون التواصل بنية الزواج وبشفافية، مع تجنب العلاقات غير الجادة." />
          <Bullet theme={theme} text="أي تواصل خارج التطبيق أو مشاركة بيانات شخصية يتم على مسؤولية المستخدم بالكامل." />
        </Section>

        <Section theme={theme} title="3) المحتوى الممنوع والسياسات">
          <Bullet theme={theme} text="يُمنع نشر أو إرسال: تهديدات، كراهية، تحرش، ابتزاز، تشهير، أو سباب." />
          <Bullet theme={theme} text="يُمنع نشر الروابط الضارة أو محاولات الاختراق أو طلب البيانات الحساسة." />
          <Bullet theme={theme} text="يُمنع بيع أو شراء خدمات/منتجات غير مصرّح بها عبر المنصة." />
          <Bullet theme={theme} text="يُمنع استخدام التطبيق بطريقة تؤثر على أداء الخدمة أو تعطلها." />
        </Section>

        <Section theme={theme} title="4) الخصوصية والبيانات">
          <Bullet theme={theme} text="قد نجمع بيانات تشغيلية أساسية لتحسين الخدمة (مثل الأعطال والأداء) وفق سياسة الخصوصية." />
          <Bullet theme={theme} text="أنت مسؤول عن حماية حسابك وكلمة المرور وأي نشاط يتم عبر حسابك." />
          <Bullet theme={theme} text="لا ننصح بمشاركة معلومات حساسة (العنوان، الحسابات البنكية، كلمات المرور، رموز التحقق)." />
        </Section>

        <Section theme={theme} title="5) إخلاء المسؤولية (مهم جدًا)">
          <View style={s.warnBox}>
            <Ionicons name="warning-outline" size={18} color={theme.warning} />
            <Text style={s.warnText}>
              التطبيق يوفّر منصة تواصل فقط، ولا نتحمل مسؤولية تصرفات المستخدمين أو صحة معلوماتهم
              أو أي اتفاقات أو تواصل يتم بينهم داخل التطبيق أو خارجه.
            </Text>
          </View>

          <Bullet theme={theme} text="لا نضمن هوية المستخدمين أو نواياهم أو صدق بياناتهم." />
          <Bullet theme={theme} text="أي ضرر أو خسارة أو نزاع ينتج عن التواصل بين المستخدمين يقع على مسؤوليتهم الشخصية." />
          <Bullet theme={theme} text="ننصح دائمًا بالتريث، والتحقق، وعدم إرسال أموال، وتجنب مشاركة معلومات خاصة." />
          <Bullet theme={theme} text="في حال الاشتباه بسلوك مسيء، استخدم خاصية الإبلاغ/الحظر فورًا." />
        </Section>

        <Section theme={theme} title="6) الإبلاغ والحظر والإشراف">
          <Bullet theme={theme} text="نحتفظ بحقنا في اتخاذ إجراءات عند البلاغات (تحذير/تقييد/حظر) حسب تقديرنا." />
          <Bullet theme={theme} text="قد يتم تعطيل الحساب عند تكرار المخالفات أو الإضرار بالمجتمع." />
          <Bullet theme={theme} text="قد نطلب معلومات إضافية للتحقق عند الاشتباه بانتحال أو إساءة استخدام." />
        </Section>

        <Section theme={theme} title="7) التعديلات وإنهاء الخدمة">
          <Bullet theme={theme} text="قد نقوم بتحديث هذه الشروط من وقت لآخر، ويعد استمرارك في الاستخدام موافقة على التحديث." />
          <Bullet theme={theme} text="يجوز لنا إيقاف أو تعديل أو إنهاء الخدمة أو بعض المزايا دون إشعار مسبق عند الحاجة." />
        </Section>

        <View style={s.footerCard}>
          <Ionicons name="checkmark-done-outline" size={18} color={theme.success} />
          <Text style={s.footerText}>
            باستخدامك للتطبيق، أنت توافق على جميع البنود المذكورة أعلاه.
          </Text>
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