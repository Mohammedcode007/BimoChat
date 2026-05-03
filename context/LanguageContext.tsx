// import i18n from "@/localization/i18n";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useState } from "react";

// export type AppLanguage = "ar" | "en";

// type LanguageContextType = {
//   language: AppLanguage;
//   changeLanguage: (lang: AppLanguage) => Promise<void>;
// };

// const LanguageContext = createContext<LanguageContextType | null>(null);

// const STORAGE_KEY = "appLanguage";

// export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
//   const [language, setLanguage] = useState<AppLanguage>(
//     (i18n.locale as AppLanguage) || "ar"
//   );
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     const loadLanguage = async () => {
//       try {
//         const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
//         const lang = (savedLanguage as AppLanguage) || (i18n.locale as AppLanguage) || "ar";

//         i18n.locale = lang;
//         setLanguage(lang);
//       } catch (error) {
//       } finally {
//         setReady(true);
//       }
//     };

//     loadLanguage();
//   }, []);

//   const changeLanguage = async (lang: AppLanguage) => {
//     try {
//       i18n.locale = lang;
//       setLanguage(lang);
//       await AsyncStorage.setItem(STORAGE_KEY, lang);
//     } catch (error) {
//     }
//   };

//   if (!ready) return null;

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (!context) {
//     throw new Error("useLanguage must be used inside provider");
//   }
//   return context;
// };
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
const DEFAULT_LANGUAGE: AppLanguage = "en";

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

        const lang: AppLanguage = isValidLanguage(savedLanguage)
          ? savedLanguage
          : DEFAULT_LANGUAGE;

        i18n.locale = lang;
        setLanguage(lang);

        if (!savedLanguage) {
          await AsyncStorage.setItem(STORAGE_KEY, lang);
        }
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