// // constants/theme.ts
// // ✅ تحديث ملف الألوان ليتوافق مع صفحة Room Details + يدعم Light/Dark بشكل عصري
// // ✅ يحافظ على المفاتيح القديمة (text/background/tint/icon/tab...) ويضيف المفاتيح الناقصة دون كسر أي شاشة أخرى

// import { Platform } from "react-native";

// const tintColorLight = "#0a7ea4";
// const tintColorDark = "#ffffff";

// export const Colors = {
//   light: {
//     /* ===== Existing keys (KEEP) ===== */
//     text: "#11181C",
//     background: "#FFFFFF",
//     tint: tintColorLight,
//     icon: "#687076",
//     tabIconDefault: "#687076",
//     tabIconSelected: tintColorLight,
//     card: "#FFFFFF",
//     unreadCard: "#EEF2FF",

//     /* ===== Added keys (NEW) ===== */
//     // Text tones
//     mutedText: "rgba(17, 24, 28, 0.62)",
//     subtleText: "rgba(17, 24, 28, 0.46)",

//     // Surfaces
//     cardAlt: "#F5F7FB", // خلفية ثانوية للكروت/الأقسام
//     surface: "#FFFFFF", // سطح أساسي
//     surface2: "#F2F4F8", // سطح بديل

//     // Borders / separators
//     separator: "rgba(17, 24, 28, 0.08)",
//     border: "rgba(17, 24, 28, 0.10)",

//     // Overlays / disabled
//     overlay: "rgba(255, 255, 255, 0.78)", // زر فوق الكفر (Blur-like)
//     disabledBg: "rgba(17, 24, 28, 0.10)",

//     // Primary button helpers
//     primary: tintColorLight,
//     primaryText: "#FFFFFF",
//     primarySoft: "rgba(10, 126, 164, 0.14)",
//     primarySubText: "rgba(255,255,255,0.86)",

//     // Verification (badge)
//     verifyBg: "rgba(10, 126, 164, 0.14)",
//     verifyFg: tintColorLight,

//     // Pills (levels)
//     pillGoldBg: "#FEF3C7",
//     pillGoldFg: "#92400E",
//     pillHotBg: "#FFE4E6",
//     pillHotFg: "#9F1239",
// // داخل Colors.light
// muted: "rgba(17, 24, 28, 0.62)",   // alias لـ mutedText
// subtle: "rgba(17, 24, 28, 0.46)",  // alias لـ subtleText
//     // Status (optional useful across app)
//     success: "#16A34A",
//     warning: "#F59E0B",
//     danger: "#DC2626",
//     info: "#2563EB",
//   },

//   dark: {
//     /* ===== Existing keys (KEEP) ===== */
//     // ✅ Dark أعمق + خطوط أوضح (حل مشكلة “الخطوط ليس واضحه”)
//     text: "#E5E7EB",
//     background: "#0B1220", // كان: #151718
//     tint: tintColorDark,
//     icon: "#CBD5E1", // كان: #9BA1A6 (رفعنا الوضوح)
//     tabIconDefault: "#94A3B8",
//     tabIconSelected: tintColorDark,
//     card: "#0F172A", // كان: #1C1C1E
//     unreadCard: "#111C34", // كان: #1E293B

//     /* ===== Added keys (NEW) ===== */
//     // Text tones
//     mutedText: "rgba(229, 231, 235, 0.74)", // أوضح قليلًا
//     subtleText: "rgba(229, 231, 235, 0.56)",

//     // Surfaces
//     cardAlt: "#111C34", // كان: #1F2430
//     surface: "#0F172A", // كان: #1C1C1E
//     surface2: "#0B1326", // كان: #111318 (أغمق/أنعم)

//     // Borders / separators
//     // ✅ زوّدنا الـ alpha عشان الخطوط تظهر بوضوح
//     separator: "rgba(255,255,255,0.18)", // كان: 0.10
//     border: "rgba(255,255,255,0.22)", // كان: 0.12

//     // Overlays / disabled
//     overlay: "rgba(11, 18, 32, 0.72)", // مناسب للخلفية الجديدة
//     disabledBg: "rgba(229, 231, 235, 0.14)",

//     // Primary button helpers
//     // ✅ قريب من لونك السابق داخل الشات (بنفسجي)
//     primary: "#6D5DF6", // كان: #2DD4BF
//     primaryText: "#FFFFFF",
//     primarySoft: "rgba(109, 93, 246, 0.18)",
//     primarySubText: "rgba(255,255,255,0.86)",

//     // Verification (badge)
//     verifyBg: "rgba(109, 93, 246, 0.18)",
//     verifyFg: "#6D5DF6",// داخل Colors.dark
// muted: "rgba(229, 231, 235, 0.74)",  // alias لـ mutedText
// subtle: "rgba(229, 231, 235, 0.56)", // alias لـ subtleText

//     // Pills (levels)
//     pillGoldBg: "rgba(245, 158, 11, 0.20)",
//     pillGoldFg: "#FBBF24",
//     pillHotBg: "rgba(244, 63, 94, 0.20)",
//     pillHotFg: "#FB7185",

//     // Status (optional useful across app)
//     success: "#22C55E",
//     warning: "#F59E0B",
//     danger: "#EF4444",
//     info: "#60A5FA",
//   },
// } as const;

// export const Fonts = Platform.select({
//   ios: {
//     sans: "system-ui",
//     serif: "ui-serif",
//     rounded: "ui-rounded",
//     mono: "ui-monospace",
//   },
//   default: {
//     sans: "normal",
//     serif: "serif",
//     rounded: "normal",
//     mono: "monospace",
//   },
//   web: {
//     sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//     serif: "Georgia, 'Times New Roman', serif",
//     rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
//     mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
//   },
// });
// export type ThemeName = keyof typeof Colors;          // "light" | "dark"
// export type AppTheme = (typeof Colors)[ThemeName];    // union: light | dark

// constants/theme.ts
// ✅ يدعم Light/Dark بدون مشاكل TypeScript (بدون literal types)
// ✅ يحافظ على نفس المفاتيح + aliases muted/subtle

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

/** ✅ نوع موحّد للثيم (كل القيم string لتفادي مشكلة "#11181C" literal) */
export type AppTheme = {
  /* Existing keys */
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  unreadCard: string;

  /* Added keys */
  mutedText: string;
  subtleText: string;

  cardAlt: string;
  surface: string;
  surface2: string;

  separator: string;
  border: string;

  overlay: string;
  disabledBg: string;

  primary: string;
  primaryText: string;
  primarySoft: string;
  primarySubText: string;

  verifyBg: string;
  verifyFg: string;

  pillGoldBg: string;
  pillGoldFg: string;
  pillHotBg: string;
  pillHotFg: string;

  // aliases
  muted: string;
  subtle: string;

  // status
  success: string;
  warning: string;
  danger: string;
  info: string;
};

export type ThemeName = "light" | "dark";

export const Colors: Record<ThemeName, AppTheme> = {
  light: {
    /* ===== Existing keys (KEEP) ===== */
    text: "#11181C",
    background: "#FFFFFF",

    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    card: "#FFFFFF",
    unreadCard: "#EEF2FF",

    /* ===== Added keys (NEW) ===== */
    mutedText: "rgba(17, 24, 28, 0.62)",
    subtleText: "rgba(17, 24, 28, 0.46)",

    cardAlt: "#F5F7FB",
    surface: "#FFFFFF",
    surface2: "#F2F4F8",

    separator: "rgba(17, 24, 28, 0.08)",
    border: "rgba(17, 24, 28, 0.10)",

    overlay: "rgba(255, 255, 255, 0.78)",
    disabledBg: "rgba(17, 24, 28, 0.10)",

    primary: tintColorLight,
    primaryText: "#FFFFFF",
    primarySoft: "rgba(10, 126, 164, 0.14)",
    primarySubText: "rgba(255,255,255,0.86)",

    verifyBg: "rgba(10, 126, 164, 0.14)",
    verifyFg: tintColorLight,

    pillGoldBg: "#FEF3C7",
    pillGoldFg: "#92400E",
    pillHotBg: "#FFE4E6",
    pillHotFg: "#9F1239",

    muted: "rgba(17, 24, 28, 0.62)",
    subtle: "rgba(17, 24, 28, 0.46)",

    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB",
  },

  dark: {
    /* ===== Existing keys (KEEP) ===== */
    text: "#E5E7EB",
    background: "#0B1220",
    tint: tintColorDark,
    icon: "#CBD5E1",
    tabIconDefault: "#94A3B8",
    tabIconSelected: tintColorDark,
    card: "#0F172A",
    unreadCard: "#111C34",

    /* ===== Added keys (NEW) ===== */
    mutedText: "rgba(229, 231, 235, 0.74)",
    subtleText: "rgba(229, 231, 235, 0.56)",

    cardAlt: "#111C34",
    surface: "#0F172A",
    surface2: "#0B1326",

    separator: "rgba(255,255,255,0.18)",
    border: "rgba(255,255,255,0.22)",

    overlay: "rgba(11, 18, 32, 0.72)",
    disabledBg: "rgba(229, 231, 235, 0.14)",

    primary: "#6D5DF6",
    primaryText: "#FFFFFF",
    primarySoft: "rgba(109, 93, 246, 0.18)",
    primarySubText: "rgba(255,255,255,0.86)",

    verifyBg: "rgba(109, 93, 246, 0.18)",
    verifyFg: "#6D5DF6",

    pillGoldBg: "rgba(245, 158, 11, 0.20)",
    pillGoldFg: "#FBBF24",
    pillHotBg: "rgba(244, 63, 94, 0.20)",
    pillHotFg: "#FB7185",

    muted: "rgba(229, 231, 235, 0.74)",
    subtle: "rgba(229, 231, 235, 0.56)",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#60A5FA",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});