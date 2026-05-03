// components/roomScreen/styles/usersStyles.ts

import { StyleSheet } from "react-native";

import { Colors } from "@/constants/theme";

const pickThemeColor = (
  theme: typeof Colors.light,
  keys: string[],
  fallback: string
) => {
  for (const key of keys) {
    const value = String((theme as any)?.[key] || "").trim();

    if (value) return value;
  }

  return fallback;
};

export function makeUsersStyles(theme: typeof Colors.light) {
  const cardAlt = pickThemeColor(
    theme,
    ["cardAlt", "surface2", "surface"],
    "rgba(0,0,0,0.04)"
  );

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },

    sheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 18,
      maxHeight: "80%",
      borderTopWidth: 1,
      borderColor: theme.border,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    title: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
    },

    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    note: {
      marginTop: 10,
      backgroundColor: cardAlt,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },

    noteText: {
      fontSize: 12,
      color: theme.mutedText,
      lineHeight: 18,
    },

    list: {
      marginTop: 12,
      gap: 10,
    },

    listContent: {
      paddingBottom: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 1,
      paddingHorizontal: 0,
      marginVertical: 0,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface2,
    },

    usersModalAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    centerContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    inlineBadges: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
      minHeight: 20,
    },

    rolesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },

    roleChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    roleChipActive: {
      backgroundColor: theme.tint,
      borderColor: theme.tint,
    },

    roleChipText: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.text,
    },

    roleChipTextActive: {
      color: "#FFFFFF",
    },

    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },

    kickBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(245,158,11,0.10)",
      borderWidth: 1,
      borderColor: "rgba(245,158,11,0.25)",
    },

    kickText: {
      fontSize: 11,
      fontWeight: "900",
      color: "#D97706",
    },

    banBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(239,68,68,0.10)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.25)",
    },

    banText: {
      fontSize: 11,
      fontWeight: "900",
      color: "#EF4444",
    },

    trailingActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginLeft: 8,
    },

    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    emptyBox: {
      paddingVertical: 34,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyText: {
      marginTop: 10,
      color: theme.mutedText,
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
    },
  });
}

export type UsersStyles = ReturnType<typeof makeUsersStyles>;