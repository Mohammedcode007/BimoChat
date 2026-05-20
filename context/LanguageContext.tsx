import i18n from "@/localization/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type AppLanguage = "ar" | "en";

type LanguageContextType = {
  language: AppLanguage;
  changeLanguage: (lang: AppLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "appLanguage";
const DEFAULT_LANGUAGE: AppLanguage = "ar";

const isValidLanguage = (value: string | null): value is AppLanguage => {
  return value === "ar" || value === "en";
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

        let lang: AppLanguage = DEFAULT_LANGUAGE;

        if (isValidLanguage(savedLanguage)) {
          lang = savedLanguage;
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
        }

        i18n.locale = lang;
        setLanguage(lang);
      } catch (error) {
        i18n.locale = DEFAULT_LANGUAGE;
        setLanguage(DEFAULT_LANGUAGE);
      } finally {
        setReady(true);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = async (lang: AppLanguage) => {
    try {
      if (!isValidLanguage(lang)) return;

      i18n.locale = lang;
      setLanguage(lang);

      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.log("changeLanguage error:", error);
    }
  };

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside provider");
  }

  return context;
};