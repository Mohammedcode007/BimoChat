// export { useColorScheme } from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme_preference";

export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          mounted &&
          (saved === "light" || saved === "dark" || saved === "system")
        ) {
          setThemePreferenceState(saved);
        }
      } catch (error) {
      } finally {
        if (mounted) {
          setHasHydrated(true);
        }
      }
    };

    loadThemePreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    try {
      setThemePreferenceState(value);
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
    }
  }, []);

  const colorScheme = useMemo<"light" | "dark">(() => {
    if (themePreference === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }

    return themePreference;
  }, [themePreference, systemScheme]);

  return {
    colorScheme,
    themePreference,
    setThemePreference,
    hasHydrated,
    isSystemTheme: themePreference === "system",
  };
}