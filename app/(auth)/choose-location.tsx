import { Colors } from "@/constants/theme";
import { updateMyProfileSettings } from "@/redux/slices/userSlice";
import type { AppDispatch } from "@/redux/store";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const COUNTRIES = [
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Iraq",
  "Morocco",
  "Algeria",
  "Tunisia",
  "Libya",
  "Sudan",
  "Yemen",
  "Palestine",
  "Syria",
];

export default function ChooseLocationScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const onContinue = async () => {
    setError("");

    if (!country.trim()) {
      setError("يرجى اختيار الدولة أولًا");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        updateMyProfileSettings({
          country: country.trim(),
          city: city.trim() || "",
        })
      ).unwrap();

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e || "فشل حفظ الموقع");
    } finally {
      setLoading(false);
    }
  };

  const onSkip = async () => {
    try {
      setLoading(true);

      if (country.trim()) {
        await dispatch(
          updateMyProfileSettings({
            country: country.trim(),
            city: city.trim() || "",
          })
        ).unwrap();
      }

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e || "فشل المتابعة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>اختر موقعك</Text>
            <Text style={styles.subtitle}>
              أضف الدولة لتخصيص التجربة بشكل أفضل، ويمكنك إضافة المدينة بشكل اختياري.
            </Text>

            <Text style={styles.label}>الدولة *</Text>
            <View style={styles.countryWrap}>
              {COUNTRIES.map((item) => {
                const active = country === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCountry(item)}
                    style={[styles.countryItem, active && styles.countryItemActive]}
                  >
                    <Text
                      style={[
                        styles.countryText,
                        active && styles.countryTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>المدينة (اختياري)</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="مثال: Cairo"
              placeholderTextColor={theme.mutedText}
              style={styles.input}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={onContinue}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.primaryBtnText}>حفظ ومتابعة</Text>
              )}
            </Pressable>

            <Pressable onPress={onSkip} disabled={loading} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>تخطي الآن</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textMuted,
      textAlign: "center",
      marginBottom: 22,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 10,
      marginTop: 8,
    },
    countryWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 18,
    },
    countryItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: isDark ? "#151a22" : "#f3f4f6",
      borderWidth: 1,
      borderColor: theme.border,
    },
    countryItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    countryText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    countryTextActive: {
      color: "#fff",
    },
    input: {
      backgroundColor: isDark ? "#151a22" : "#f9fafb",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: theme.text,
      fontSize: 15,
      marginBottom: 14,
    },
    error: {
      color: "#ef4444",
      marginBottom: 12,
      fontSize: 14,
      fontWeight: "600",
    },
    primaryBtn: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    primaryBtnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    secondaryBtn: {
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 10,
    },
    secondaryBtnText: {
      color: theme.textMuted,
      fontSize: 15,
      fontWeight: "700",
    },
    disabledBtn: {
      opacity: 0.7,
    },
  });
}