import { Colors } from "@/constants/theme";
import { updateMyProfileSettings } from "@/redux/slices/userSlice";
import type { AppDispatch } from "@/redux/store";
import { Picker } from "@react-native-picker/picker";
import { City, Country } from "country-state-city";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

type CountryOption = {
  name: string;
  isoCode: string;
};

type CityOption = {
  name: string;
};

export default function ChooseLocationScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = Colors[isDark ? "dark" : "light"];

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const countries = useMemo<CountryOption[]>(() => {
    return Country.getAllCountries()
      .map((c) => ({
        name: c.name,
        isoCode: c.isoCode,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const cities = useMemo<CityOption[]>(() => {
    if (!countryCode) return [];

    const raw = City.getCitiesOfCountry(countryCode) || [];

    return raw
      .map((c) => ({ name: c.name }))
      .filter((c, index, arr) => arr.findIndex((x) => x.name === c.name) === index)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [countryCode]);

  const selectedCountryName = useMemo(() => {
    return countries.find((c) => c.isoCode === countryCode)?.name || "";
  }, [countries, countryCode]);

  useEffect(() => {
    setCity("");
  }, [countryCode]);

  const onContinue = async () => {
    setError("");

    if (!countryCode) {
      setError("يرجى اختيار الدولة أولًا");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        updateMyProfileSettings({
          country: selectedCountryName,
          city: city || "",
        })
      ).unwrap();

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(typeof e === "string" ? e : "فشل حفظ الموقع");
    } finally {
      setLoading(false);
    }
  };

  const onSkip = async () => {
    setError("");

    if (!countryCode) {
      setError("يجب اختيار الدولة على الأقل");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        updateMyProfileSettings({
          country: selectedCountryName,
          city: city || "",
        })
      ).unwrap();

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(typeof e === "string" ? e : "فشل المتابعة");
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
              يجب اختيار الدولة على الأقل، ويمكنك اختيار المدينة بشكل اختياري.
            </Text>

            <Text style={styles.label}>الدولة *</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={countryCode}
                onValueChange={(value) => setCountryCode(String(value || ""))}
                enabled={!loading}
                dropdownIconColor={theme.text}
                style={styles.picker}
              >
                <Picker.Item label="اختر الدولة" value="" />
                {countries.map((item) => (
                  <Picker.Item
                    key={item.isoCode}
                    label={item.name}
                    value={item.isoCode}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>المدينة (اختياري)</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={city}
                onValueChange={(value) => setCity(String(value || ""))}
                enabled={!loading && !!countryCode}
                dropdownIconColor={theme.text}
                style={styles.picker}
              >
                <Picker.Item
                  label={countryCode ? "اختر المدينة" : "اختر الدولة أولًا"}
                  value=""
                />
                {cities.map((item) => (
                  <Picker.Item key={item.name} label={item.name} value={item.name} />
                ))}
              </Picker>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={onContinue}
              disabled={loading}
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>حفظ ومتابعة</Text>
              )}
            </Pressable>

            <Pressable
              onPress={onSkip}
              disabled={loading}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>متابعة</Text>
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
      color: theme.textMuted || theme.mutedText,
      textAlign: "center",
      marginBottom: 22,
    },
    label: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 10,
      marginTop: 8,
      textAlign: "right",
    },
    pickerWrap: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 14,
      backgroundColor: isDark ? "#151a22" : "#f9fafb",
    },
    picker: {
      color: theme.text,
      backgroundColor: isDark ? "#151a22" : "#f9fafb",
    },
    error: {
      color: "#ef4444",
      marginBottom: 12,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "right",
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
      color: theme.textMuted || theme.mutedText,
      fontSize: 15,
      fontWeight: "700",
    },
    disabledBtn: {
      opacity: 0.7,
    },
  });
}