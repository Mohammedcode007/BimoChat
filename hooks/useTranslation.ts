import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/localization/i18n";

export const useTranslation = () => {
  const { language } = useLanguage();

  return {
    language,
    t: (key: string, options?: any) => i18n.t(key, options),
  };
};