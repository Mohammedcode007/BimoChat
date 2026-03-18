// import { Colors } from "@/constants/theme";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import React, { useMemo } from "react";
// import {
//   Platform,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function AboutAppScreen() {
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   // ✅ عدّلها حسب مشروعك
//   const APP_NAME = "Bimo";
//   const VERSION = "1.0.0";

//   return (
//     <SafeAreaView style={s.safeArea} edges={["top"]}>
//       <View style={s.container}>
//         {/* Header */}
//         <View style={s.header}>
//           <View style={s.headerIcon}>
//             <Ionicons name="information-circle-outline" size={18} color={theme.tint} />
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text style={s.headerTitle}>حول التطبيق</Text>
//             <Text style={s.headerSub}>معلومات عامة عن {APP_NAME}</Text>
//           </View>

//           <View style={s.versionPill}>
//             <Ionicons name="git-branch-outline" size={14} color={theme.icon} />
//             <Text style={s.versionPillText}>v{VERSION}</Text>
//           </View>
//         </View>

//         {/* Main Card */}
//         <View style={s.card}>
//           <View style={s.brandRow}>
//             <View style={s.logoBox}>
//               <Ionicons name="chatbubble-ellipses-outline" size={44} color={theme.tint} />
//             </View>

//             <View style={{ flex: 1, alignItems: "flex-end" }}>
//               <Text style={s.appName}>{APP_NAME}</Text>
//               <Text style={s.version}>الإصدار {VERSION}</Text>
//             </View>
//           </View>

//           <Text style={s.desc}>
//             {APP_NAME} تطبيق اجتماعي حديث يهدف إلى توفير تجربة تواصل{" "}
//             <Text style={s.descStrong}>بسيطة</Text> و{" "}
//             <Text style={s.descStrong}>آمنة</Text> و{" "}
//             <Text style={s.descStrong}>سريعة</Text> للمستخدمين، مع تحسينات مستمرة
//             على الأداء والخصوصية وتجربة الاستخدام.
//           </Text>

//           {/* Highlights */}
//           <View style={s.grid}>
//             <FeatureCard
//               theme={theme}
//               icon="shield-checkmark-outline"
//               title="خصوصية"
//               sub="تحكم أعلى في بياناتك"
//             />
//             <FeatureCard
//               theme={theme}
//               icon="flash-outline"
//               title="أداء"
//               sub="واجهة سلسة واستجابة سريعة"
//             />
//             <FeatureCard
//               theme={theme}
//               icon="people-outline"
//               title="مجتمع"
//               sub="غرف ودردشة وتفاعل"
//             />
//             <FeatureCard
//               theme={theme}
//               icon="sparkles-outline"
//               title="تجربة"
//               sub="تصميم عصري ومريح"
//             />
//           </View>

//           {/* Info rows */}
//           <View style={s.infoCard}>
//             <InfoRow theme={theme} icon="code-slash-outline" label="المنصة" value="React Native" />
//             <InfoRow theme={theme} icon="server-outline" label="الخدمة" value="Realtime + API" />
//             <InfoRow theme={theme} icon="lock-closed-outline" label="الأمان" value="Token / Permissions" />
//           </View>

//           <View style={s.footerNote}>
//             <Ionicons name="heart-outline" size={16} color={theme.icon} />
//             <Text style={s.footerText}>
//               شكرًا لاستخدامك {APP_NAME}. نحن نعمل دائمًا على تطوير التطبيق وتحسينه.
//             </Text>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* ================= Components ================= */

// function FeatureCard({
//   theme,
//   icon,
//   title,
//   sub,
// }: {
//   theme: any;
//   icon: any;
//   title: string;
//   sub: string;
// }) {
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   return (
//     <View style={s.feature}>
//       <View style={s.featureIcon}>
//         <Ionicons name={icon} size={18} color={theme.tint} />
//       </View>
//       <Text style={s.featureTitle} numberOfLines={1}>
//         {title}
//       </Text>
//       <Text style={s.featureSub} numberOfLines={1}>
//         {sub}
//       </Text>
//     </View>
//   );
// }

// function InfoRow({
//   theme,
//   icon,
//   label,
//   value,
// }: {
//   theme: any;
//   icon: any;
//   label: string;
//   value: string;
// }) {
//   const s = useMemo(() => makeStyles(theme), [theme]);

//   return (
//     <View style={s.infoRow}>
//       <View style={s.infoLeft}>
//         <View style={s.infoIcon}>
//           <Ionicons name={icon} size={16} color={theme.tint} />
//         </View>
//         <Text style={s.infoLabel}>{label}</Text>
//       </View>

//       <Text style={s.infoValue}>{value}</Text>
//     </View>
//   );
// }

// /* ================= STYLES ================= */

// function makeStyles(theme: any) {
//   return StyleSheet.create({
//     safeArea: { flex: 1, backgroundColor: theme.background },

//     container: { flex: 1, backgroundColor: theme.background },

//     header: {
//       paddingHorizontal: 16,
//       paddingTop: 10,
//       paddingBottom: 12,
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 12,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.separator,
//       backgroundColor: theme.background,
//     },
//     headerIcon: {
//       width: 40,
//       height: 40,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.primarySoft,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     headerTitle: { fontSize: 18, fontWeight: "900", color: theme.text },
//     headerSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: theme.mutedText },

//     versionPill: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 6,
//       paddingHorizontal: 10,
//       paddingVertical: 6,
//       borderRadius: 999,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     versionPillText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },

//     card: {
//       margin: 16,
//       borderRadius: 18,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 14,
//       ...Platform.select({
//         ios: {
//           shadowColor: "#000",
//           shadowOpacity: 0.06,
//           shadowRadius: 16,
//           shadowOffset: { width: 0, height: 8 },
//         },
//         android: { elevation: 2 },
//       }),
//     },

//     brandRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 12,
//       marginBottom: 12,
//     },
//     logoBox: {
//       width: 64,
//       height: 64,
//       borderRadius: 22,
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     appName: { fontSize: 22, fontWeight: "900", color: theme.text, textAlign: "right" },
//     version: { marginTop: 4, fontSize: 12, fontWeight: "800", color: theme.mutedText, textAlign: "right" },

//     desc: {
//       fontSize: 13.5,
//       lineHeight: 21,
//       color: theme.mutedText,
//       fontWeight: "800",
//       textAlign: "right",
//       marginBottom: 14,
//     },
//     descStrong: { color: theme.text, fontWeight: "900" },

//     grid: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       gap: 10,
//       marginBottom: 14,
//     },
//     feature: {
//       width: "48%",
//       minHeight: 92,
//       borderRadius: 16,
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 12,
//       justifyContent: "center",
//       alignItems: "flex-end",
//     },
//     featureIcon: {
//       width: 36,
//       height: 36,
//       borderRadius: 14,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//       marginBottom: 10,
//       alignSelf: "flex-start",
//     },
//     featureTitle: { fontSize: 13, fontWeight: "900", color: theme.text, textAlign: "right" },
//     featureSub: { marginTop: 4, fontSize: 12, fontWeight: "700", color: theme.mutedText, textAlign: "right" },

//     infoCard: {
//       borderRadius: 16,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//       overflow: "hidden",
//     },
//     infoRow: {
//       paddingHorizontal: 12,
//       paddingVertical: 12,
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       borderBottomWidth: 1,
//       borderBottomColor: theme.separator,
//     },
//     infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
//     infoIcon: {
//       width: 34,
//       height: 34,
//       borderRadius: 14,
//       backgroundColor: theme.surface,
//       borderWidth: 1,
//       borderColor: theme.border,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     infoLabel: { fontSize: 12.5, fontWeight: "900", color: theme.text },
//     infoValue: { fontSize: 12.5, fontWeight: "800", color: theme.mutedText },

//     footerNote: {
//       marginTop: 12,
//       borderRadius: 16,
//       backgroundColor: theme.cardAlt,
//       borderWidth: 1,
//       borderColor: theme.border,
//       padding: 12,
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//     },
//     footerText: {
//       flex: 1,
//       fontSize: 12.5,
//       lineHeight: 19,
//       fontWeight: "800",
//       color: theme.mutedText,
//       textAlign: "right",
//     },
//   });
// }
import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
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

export default function AboutAppScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(theme), [theme]);

  const APP_NAME = "Bimo";
  const VERSION = "1.0.0";

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
              name="information-circle-outline"
              size={18}
              color={theme.tint}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t("about.headerTitle")}</Text>
            <Text style={s.headerSub}>
              {t("about.headerSub", { appName: APP_NAME })}
            </Text>
          </View>

          <View style={s.versionPill}>
            <Ionicons name="git-branch-outline" size={14} color={theme.icon} />
            <Text style={s.versionPillText}>v{VERSION}</Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={s.card}>
          <View style={s.brandRow}>
            <View style={s.logoBox}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={44}
                color={theme.tint}
              />
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={s.appName}>{APP_NAME}</Text>
              <Text style={s.version}>
                {t("about.versionLabel", { version: VERSION })}
              </Text>
            </View>
          </View>

          <Text style={s.desc}>
            {t("about.descPrefix", { appName: APP_NAME })}{" "}
            <Text style={s.descStrong}>{t("about.simple")}</Text>{" "}
            {t("about.and")}{" "}
            <Text style={s.descStrong}>{t("about.safe")}</Text>{" "}
            {t("about.and")}{" "}
            <Text style={s.descStrong}>{t("about.fast")}</Text>{" "}
            {t("about.descSuffix")}
          </Text>

          {/* Highlights */}
          <View style={s.grid}>
            <FeatureCard
              theme={theme}
              icon="shield-checkmark-outline"
              title={t("about.features.privacy.title")}
              sub={t("about.features.privacy.sub")}
            />
            <FeatureCard
              theme={theme}
              icon="flash-outline"
              title={t("about.features.performance.title")}
              sub={t("about.features.performance.sub")}
            />
            <FeatureCard
              theme={theme}
              icon="people-outline"
              title={t("about.features.community.title")}
              sub={t("about.features.community.sub")}
            />
            <FeatureCard
              theme={theme}
              icon="sparkles-outline"
              title={t("about.features.experience.title")}
              sub={t("about.features.experience.sub")}
            />
          </View>

          {/* Info rows */}
          <View style={s.infoCard}>
            <InfoRow
              theme={theme}
              icon="code-slash-outline"
              label={t("about.info.platform")}
              value="React Native"
            />
            <InfoRow
              theme={theme}
              icon="server-outline"
              label={t("about.info.service")}
              value="Realtime + API"
            />
            <InfoRow
              theme={theme}
              icon="lock-closed-outline"
              label={t("about.info.security")}
              value="Token / Permissions"
            />
          </View>

          <View style={s.footerNote}>
            <Ionicons name="heart-outline" size={16} color={theme.icon} />
            <Text style={s.footerText}>
              {t("about.footer", { appName: APP_NAME })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= Components ================= */

function FeatureCard({
  theme,
  icon,
  title,
  sub,
}: {
  theme: any;
  icon: any;
  title: string;
  sub: string;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={s.feature}>
      <View style={s.featureIcon}>
        <Ionicons name={icon} size={18} color={theme.tint} />
      </View>
      <Text style={s.featureTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={s.featureSub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function InfoRow({
  theme,
  icon,
  label,
  value,
}: {
  theme: any;
  icon: any;
  label: string;
  value: string;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={s.infoRow}>
      <View style={s.infoLeft}>
        <View style={s.infoIcon}>
          <Ionicons name={icon} size={16} color={theme.tint} />
        </View>
        <Text style={s.infoLabel}>{label}</Text>
      </View>

      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

function makeStyles(theme: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },

    container: { flex: 1, backgroundColor: theme.background },

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
    headerTitle: { fontSize: 18, fontWeight: "900", color: theme.text },
    headerSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
    },

    versionPill: {
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
    versionPillText: { fontSize: 12, fontWeight: "900", color: theme.mutedText },

    card: {
      margin: 16,
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

    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 22,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.text,
      textAlign: "right",
    },
    version: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: "right",
    },

    desc: {
      fontSize: 13.5,
      lineHeight: 21,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
      marginBottom: 14,
    },
    descStrong: { color: theme.text, fontWeight: "900" },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },
    feature: {
      width: "48%",
      minHeight: 92,
      borderRadius: 16,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      justifyContent: "center",
      alignItems: "flex-end",
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      alignSelf: "flex-start",
    },
    featureTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
      textAlign: "right",
    },
    featureSub: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText,
      textAlign: "right",
    },

    infoCard: {
      borderRadius: 16,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    infoRow: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    infoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    infoIcon: {
      width: 34,
      height: 34,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    infoLabel: { fontSize: 12.5, fontWeight: "900", color: theme.text },
    infoValue: { fontSize: 12.5, fontWeight: "800", color: theme.mutedText },

    footerNote: {
      marginTop: 12,
      borderRadius: 16,
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
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: "right",
    },
  });
}