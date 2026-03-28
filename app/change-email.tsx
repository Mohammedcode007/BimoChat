
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  changeMyEmail,
  clearUserErrors,
  selectMe,
  selectUserErrorUpdate,
  selectUserUpdating,
} from "@/redux/slices/userSlice";
import { AppDispatch } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const me = useSelector(selectMe);
  const updating = useSelector(selectUserUpdating);
  const errorUpdate = useSelector(selectUserErrorUpdate);

  const [email, setEmail] = useState(me?.email || "");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearUserErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    if (errorUpdate) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: errorUpdate,
      });
    }
  }, [errorUpdate, t]);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    setEmailError("");

    if (!trimmedEmail) {
      setEmailError(t("changeEmail.errors.required"));
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError(t("changeEmail.errors.invalid"));
      return;
    }

    if (trimmedEmail === (me?.email || "").trim().toLowerCase()) {
      setEmailError(t("changeEmail.errors.sameAsCurrent"));
      return;
    }

    try {
      const resultAction = await dispatch(changeMyEmail({ email: trimmedEmail }));

      if (changeMyEmail.fulfilled.match(resultAction)) {
        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("changeEmail.toasts.success"),
        });

        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2:
            (typeof resultAction.payload === "string" && resultAction.payload) ||
            t("changeEmail.toasts.failed"),
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("changeEmail.toasts.unexpected"),
      });
    }
  };

  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.container}>
          <View style={s.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={s.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </TouchableOpacity>

            <Text style={s.headerTitle}>{t("changeEmail.title")}</Text>

            <View style={s.headerPlaceholder} />
          </View>

          <View style={s.card}>
            <Text style={s.label}>{t("changeEmail.currentEmailLabel")}</Text>
            <View style={s.currentEmailBox}>
              <Text style={s.currentEmailText}>
                {me?.email || t("changeEmail.unavailable")}
              </Text>
            </View>

            <Text style={[s.label, { marginTop: 18 }]}>
              {t("changeEmail.newEmailLabel")}
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              placeholder={t("changeEmail.newEmailPlaceholder")}
              placeholderTextColor={theme.mutedText || "#999"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[s.input, emailError ? s.inputError : null]}
              editable={!updating}
            />

            {!!emailError && <Text style={s.errorText}>{emailError}</Text>}

            <Text style={s.note}>{t("changeEmail.note")}</Text>

            <TouchableOpacity
              style={[s.button, updating ? s.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={updating}
              activeOpacity={0.9}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.buttonText}>{t("changeEmail.saveButton")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },

    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    },

    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6",
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },

    headerPlaceholder: {
      width: 40,
      height: 40,
    },

    card: {
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#ECECEC",
    },

    label: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },

    currentEmailBox: {
      minHeight: 52,
      borderRadius: 14,
      paddingHorizontal: 14,
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB",
    },

    currentEmailText: {
      color: theme.text,
      fontSize: 15,
    },

    input: {
      minHeight: 54,
      borderRadius: 14,
      paddingHorizontal: 14,
      color: theme.text,
      fontSize: 15,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#D1D5DB",
    },

    inputError: {
      borderColor: "#E53935",
    },

    errorText: {
      marginTop: 8,
      fontSize: 13,
      color: "#E53935",
      fontWeight: "600",
    },

    note: {
      marginTop: 14,
      fontSize: 13,
      lineHeight: 21,
      color: theme.mutedText || "#6B7280",
    },

    button: {
      marginTop: 22,
      height: 54,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary || "#4F46E5",
    },

    buttonDisabled: {
      opacity: 0.7,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
}