import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { translations } from "./translations";

const i18n = new I18n(translations);

i18n.enableFallback = true;
i18n.defaultLocale = "ar";

const deviceLocale = Localization.getLocales()[0]?.languageCode || "ar";
i18n.locale = deviceLocale;

export default i18n;