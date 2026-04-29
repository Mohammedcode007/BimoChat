import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type BlockScope = "app" | "rooms" | "tweets" | string;

export default function BlockedScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    scope?: string;
    message?: string;
    reason?: string;
    title?: string;
    ruleId?: string;
    expiresAt?: string;
  }>();

  const scope = String(params.scope || "app") as BlockScope;

  const message = String(
    params.message ||
      "هذا الحساب أو هذا الجهاز محظور من استخدام التطبيق."
  );

  const reason = String(params.reason || "").trim();
  const ruleId = String(params.ruleId || "").trim();
  const expiresAt = String(params.expiresAt || "").trim();

  const meta = useMemo(() => {
    if (scope === "rooms") {
      return {
        title: String(params.title || "أنت محظور من الغرف"),
        subtitle:
          "لا يمكنك دخول الغرف أو إرسال رسائل داخلها في الوقت الحالي.",
        typeText: "الغرف",
        icon: "chatbubbles-outline" as const,
        color: "#F59E0B",
        bg: "#FFFBEB",
        border: "#FDE68A",
      };
    }

    if (scope === "tweets") {
      return {
        title: String(params.title || "أنت محظور من التويتات"),
        subtitle:
          "لا يمكنك نشر التويتات أو التفاعل معها في الوقت الحالي.",
        typeText: "التويتات",
        icon: "newspaper-outline" as const,
        color: "#7C3AED",
        bg: "#F5F3FF",
        border: "#DDD6FE",
      };
    }

    return {
      title: String(params.title || "تم حظرك من التطبيق"),
      subtitle:
        "لا يمكنك استخدام هذا الحساب أو هذا الجهاز داخل التطبيق.",
      typeText: "التطبيق بالكامل",
      icon: "ban-outline" as const,
      color: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
    };
  }, [scope, params.title]);

  const formattedExpiresAt = useMemo(() => {
    if (!expiresAt) return "غير محدد";

    const d = new Date(expiresAt);

    if (Number.isNaN(d.getTime())) return "غير محدد";

    return d.toLocaleString();
  }, [expiresAt]);

  const handleSupport = async () => {
    const email = "support@bimo.app";
    const subject = encodeURIComponent("طلب مراجعة حظر");
    const body = encodeURIComponent(
      [
        "مرحبًا،",
        "",
        "أريد مراجعة حالة الحظر الخاصة بي.",
        "",
        `نوع الحظر: ${meta.typeText}`,
        `الرسالة: ${message}`,
        `السبب: ${reason || "غير مذكور"}`,
        `رقم القاعدة: ${ruleId || "غير متاح"}`,
        `ينتهي في: ${formattedExpiresAt}`,
        "",
        "شكرًا.",
      ].join("\n")
    );

    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: meta.bg,
              borderColor: meta.border,
            },
          ]}
        >
          <Ionicons name={meta.icon} size={54} color={meta.color} />
        </View>

        <Text style={styles.title}>{meta.title}</Text>

        <Text style={styles.subtitle}>{meta.subtitle}</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={meta.color}
            />
            <Text style={styles.cardTitle}>تفاصيل الحظر</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نوع الحظر</Text>
            <Text style={[styles.infoValue, { color: meta.color }]}>
              {meta.typeText}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الحالة</Text>
            <Text style={styles.infoValue}>نشط</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ينتهي في</Text>
            <Text style={styles.infoValue}>{formattedExpiresAt}</Text>
          </View>

          {!!ruleId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>رقم القاعدة</Text>
              <Text style={styles.ruleIdText} numberOfLines={1}>
                {ruleId}
              </Text>
            </View>
          )}

          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>الرسالة</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          {!!reason && (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>السبب</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}
        </View>

        <View style={styles.noteBox}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#64748B"
            style={{ marginTop: 1 }}
          />
          <Text style={styles.noteText}>
            إذا كنت تعتقد أن الحظر تم بالخطأ، يمكنك التواصل مع الدعم وطلب
            مراجعة الحالة.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.supportBtn}
          onPress={handleSupport}
        >
          <Ionicons name="mail-outline" size={19} color="#FFFFFF" />
          <Text style={styles.supportText}>التواصل مع الدعم</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.backBtn}
          onPress={() => router.replace("/(auth)/login" as any)}
        >
          <Text style={styles.backText}>العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  iconCircle: {
    width: 118,
    height: 118,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 22,
  },

  title: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 330,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    marginLeft: 8,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
  },

  line: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 13,
  },

  infoRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
    maxWidth: "58%",
  },

  ruleIdText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    maxWidth: "58%",
    textAlign: "right",
  },

  messageBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  messageLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },

  messageText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },

  reasonBox: {
    marginTop: 10,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  reasonLabel: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },

  reasonText: {
    color: "#7C2D12",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },

  noteBox: {
    width: "100%",
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteText: {
    flex: 1,
    marginLeft: 8,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
  },

  supportBtn: {
    width: "100%",
    height: 50,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 18,
  },

  supportText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  backBtn: {
    marginTop: 10,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "900",
  },
});