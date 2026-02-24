
// constants/theme.ts
// ✅ تحديث ملف الألوان ليتوافق مع صفحة Room Details + يدعم Light/Dark بشكل عصري
// ✅ يحافظ على المفاتيح القديمة (text/background/tint/icon/tab...) ويضيف المفاتيح الناقصة دون كسر أي شاشة أخرى

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

export const Colors = {
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
    // Text tones
    mutedText: "rgba(17, 24, 28, 0.62)",
    subtleText: "rgba(17, 24, 28, 0.46)",

    // Surfaces
    cardAlt: "#F5F7FB",          // خلفية ثانوية للكروت/الأقسام
    surface: "#FFFFFF",          // سطح أساسي
    surface2: "#F2F4F8",         // سطح بديل

    // Borders / separators
    separator: "rgba(17, 24, 28, 0.08)",
    border: "rgba(17, 24, 28, 0.10)",

    // Overlays / disabled
    overlay: "rgba(255, 255, 255, 0.78)", // زر فوق الكفر (Blur-like)
    disabledBg: "rgba(17, 24, 28, 0.10)",

    // Primary button helpers
    primary: tintColorLight,
    primaryText: "#FFFFFF",
    primarySoft: "rgba(10, 126, 164, 0.14)",
    primarySubText: "rgba(255,255,255,0.86)",

    // Verification (badge)
    verifyBg: "rgba(10, 126, 164, 0.14)",
    verifyFg: tintColorLight,

    // Pills (levels)
    pillGoldBg: "#FEF3C7",
    pillGoldFg: "#92400E",
    pillHotBg: "#FFE4E6",
    pillHotFg: "#9F1239",

    // Status (optional useful across app)
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB"
  },

  dark: {
    /* ===== Existing keys (KEEP) ===== */
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    card: "#1C1C1E",
    unreadCard: "#1E293B",

    /* ===== Added keys (NEW) ===== */
    // Text tones
    mutedText: "rgba(236, 237, 238, 0.70)",
    subtleText: "rgba(236, 237, 238, 0.52)",

    // Surfaces
    cardAlt: "#1F2430",          // خلفية ثانوية أغمق/أنعم
    surface: "#1C1C1E",
    surface2: "#111318",

    // Borders / separators
    separator: "rgba(255,255,255,0.10)",
    border: "rgba(255,255,255,0.12)",

    // Overlays / disabled
    overlay: "rgba(21, 23, 24, 0.74)",
    disabledBg: "rgba(236, 237, 238, 0.12)",

    // Primary button helpers
    primary: "#2DD4BF",          // Tint أبيض عندك، لكن Primary عملي أكثر للزرار
    primaryText: "#071314",
    primarySoft: "rgba(45, 212, 191, 0.16)",
    primarySubText: "rgba(7,19,20,0.82)",

    // Verification (badge)
    verifyBg: "rgba(45, 212, 191, 0.16)",
    verifyFg: "#2DD4BF",

    // Pills (levels)
    pillGoldBg: "rgba(245, 158, 11, 0.18)",
    pillGoldFg: "#FBBF24",
    pillHotBg: "rgba(244, 63, 94, 0.18)",
    pillHotFg: "#FB7185",

    // Status (optional useful across app)
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#60A5FA"
  }
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace"
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace"
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  }
});