import i18n from "@/localization/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "appLanguage";

export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState(i18n.locale);

  /* ===== Load Saved Language On App Start ===== */
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLanguage) {
          i18n.locale = savedLanguage;
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.log("Error loading language:", error);
      }
    };

    loadLanguage();
  }, []);

  /* ===== Change Language ===== */
  const changeLanguage = async (lang: string) => {
    try {
      i18n.locale = lang;
      setLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside provider");
  return context;
};
