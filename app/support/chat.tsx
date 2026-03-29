import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  clearContactUsError,
  resetContactUsState,
  sendContactUsMessage,
} from "@/redux/slices/contactUsSlice";
import { AppDispatch, RootState } from "@/redux/store";

export default function SupportChatScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const s = useMemo(() => makeStyles(theme), [theme]);

  const { loading, success, error } = useSelector(
    (st: RootState) => st.contactUs
  );

  const [content, setContent] = useState("");

  const canSend = content.trim().length > 0 && !loading;

  const onSend = () => {
    const text = content.trim();
    if (!text) return;
    dispatch(sendContactUsMessage({ content: text }));
  };

  useEffect(() => {
    if (error) {
      Alert.alert("خطأ", error);
      dispatch(clearContactUsError());
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Alert.alert("تم الإرسال", "تم إرسال رسالتك للدعم بنجاح.");
      setContent("");
      dispatch(resetContactUsState());
      router.back();
    }
  }, [success]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={s.title}>الدعم الفني</Text>
            <Text style={s.subTitle}>اكتب رسالتك وسيتم الرد في أقرب وقت</Text>
          </View>

          <View style={s.badge}>
            <Ionicons name="headset-outline" size={14} color={theme.icon} />
            <Text style={s.badgeText}>Support</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.card}>
          <Text style={s.label}>الرسالة</Text>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="اشرح المشكلة بالتفصيل..."
            placeholderTextColor={theme.mutedText}
            multiline
            maxLength={2000}
            style={s.input}
            textAlignVertical="top"
          />

          <Text style={s.counter}>{content.trim().length}/2000</Text>

          <TouchableOpacity
            onPress={onSend}
            disabled={!canSend}
            activeOpacity={0.85}
            style={[s.sendBtn, { opacity: canSend ? 1 : 0.55 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={s.sendText}>إرسال</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={s.note}>
          <Ionicons name="information-circle-outline" size={16} color={theme.icon} />
          <Text style={s.noteText}>
            لا تشارك كلمة المرور أو رمز التحقق. قد نطلب معلومات تشخيصية غير حساسة فقط.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: theme.background },

    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: { fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right" },
    subTitle: { marginTop: 4, fontSize: 12, fontWeight: "700", color: theme.mutedText, textAlign: "right" },

    badge: {
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
    badgeText: { fontSize: 12, fontWeight: "800", color: theme.mutedText },

    card: {
      marginTop: 14,
      marginHorizontal: 16,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
    },

    label: { fontSize: 13, fontWeight: "900", color: theme.text, marginBottom: 10, textAlign: "right" },

    input: {
      minHeight: 150,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.cardAlt,
      padding: 12,
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      textAlign: "right",
    },

    counter: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
      textAlign: "right",
    },

    sendBtn: {
      marginTop: 12,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.tint,
    },
    sendText: { color: "#fff", fontSize: 14, fontWeight: "900" },

    note: {
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
    noteText: {
      flex: 1,
      fontSize: 12.5,
      lineHeight: 19,
      color: theme.mutedText,
      fontWeight: "800",
      textAlign: "right",
    },
  });
}