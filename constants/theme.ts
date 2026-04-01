
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
textSecondary: string;
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
textSecondary: "#334155",
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
  text: "#F3F4F6",
  background: "#0B1220",
  tint: tintColorDark,
  icon: "#E5E7EB",
  tabIconDefault: "#A7B0C0",
  tabIconSelected: tintColorDark,
  card: "#111827",
  unreadCard: "#162033",

  /* ===== Added keys (NEW) ===== */
  mutedText: "rgba(243, 244, 246, 0.82)",
  subtleText: "rgba(243, 244, 246, 0.68)",

  cardAlt: "#162033",
  surface: "#111827",
  surface2: "#1A2438",

  separator: "rgba(255,255,255,0.16)",
  border: "rgba(255,255,255,0.18)",

  overlay: "rgba(11, 18, 32, 0.72)",
  disabledBg: "rgba(243, 244, 246, 0.12)",

  primary: "#7C6BFF",
  primaryText: "#FFFFFF",
  primarySoft: "rgba(124, 107, 255, 0.24)",
  primarySubText: "rgba(255,255,255,0.90)",

  verifyBg: "rgba(124, 107, 255, 0.22)",
  verifyFg: "#8B7CFF",
textSecondary: "#E5E7EB",
  pillGoldBg: "rgba(245, 158, 11, 0.22)",
  pillGoldFg: "#FCD34D",
  pillHotBg: "rgba(244, 63, 94, 0.22)",
  pillHotFg: "#FB7185", 

  muted: "rgba(243, 244, 246, 0.82)",
  subtle: "rgba(243, 244, 246, 0.68)",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#60A5FA",
},
  // dark: {
  //   /* ===== Existing keys (KEEP) ===== */
  //   text: "#E5E7EB",
  //   background: "#0B1220",
  //   tint: tintColorDark,
  //   icon: "#CBD5E1",
  //   tabIconDefault: "#94A3B8",
  //   tabIconSelected: tintColorDark,
  //   card: "#0F172A",
  //   unreadCard: "#111C34",

  //   /* ===== Added keys (NEW) ===== */
  //   mutedText: "rgba(229, 231, 235, 0.74)",
  //   subtleText: "rgba(229, 231, 235, 0.56)",

  //   cardAlt: "#111C34",
  //   surface: "#0F172A",
  //   surface2: "#0B1326",

  //   separator: "rgba(255,255,255,0.18)",
  //   border: "rgba(255,255,255,0.22)",

  //   overlay: "rgba(11, 18, 32, 0.72)",
  //   disabledBg: "rgba(229, 231, 235, 0.14)",

  //   primary: "#6D5DF6",
  //   primaryText: "#FFFFFF",
  //   primarySoft: "rgba(109, 93, 246, 0.18)",
  //   primarySubText: "rgba(255,255,255,0.86)",

  //   verifyBg: "rgba(109, 93, 246, 0.18)",
  //   verifyFg: "#6D5DF6",

  //   pillGoldBg: "rgba(245, 158, 11, 0.20)",
  //   pillGoldFg: "#FBBF24",
  //   pillHotBg: "rgba(244, 63, 94, 0.20)",
  //   pillHotFg: "#FB7185",

  //   muted: "rgba(229, 231, 235, 0.74)",
  //   subtle: "rgba(229, 231, 235, 0.56)",

  //   success: "#22C55E",
  //   warning: "#F59E0B",
  //   danger: "#EF4444",
  //   info: "#60A5FA",
  // },
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