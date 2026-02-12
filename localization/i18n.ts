import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { translations } from "./translations";

const i18n = new I18n(translations);

i18n.enableFallback = true;

const deviceLocale =
  Localization.getLocales()[0]?.languageCode || "en";

i18n.locale = deviceLocale;

export default i18n;
