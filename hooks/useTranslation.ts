import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/localization/i18n";

export const useTranslation = () => {
  const { language } = useLanguage();

  i18n.locale = language;

  const isRTL = language === "ar";

  return {
    language,
    isRTL,
    t: (key: string, options?: any) => i18n.t(key, options),
  };
};