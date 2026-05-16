// components/roomScreen/styles/bubbleStyles.ts

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

export function makeBubbleStyles(theme: typeof Colors.light) {
  const primary = pickThemeColor(theme, ["primary", "tint"], "#2563EB");
  const primarySoft = pickThemeColor(
    theme,
    ["primarySoft", "surface2", "surface"],
    "rgba(37,99,235,0.10)"
  );

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      marginBottom: 5,
      alignItems: "flex-start",
      position: "relative",
    },

    rowOther: {
      justifyContent: "flex-start",
    },

    rowMe: {
      justifyContent: "flex-end",
    },

    avatarSpacerLeft: {
      width: 48,
      height: 20,
      marginRight: 8,
      flexShrink: 0,
    },

    avatarSpacerRight: {
      width: 48,
      height: 20,
      marginLeft: 8,
      flexShrink: 0,
    },

    avatarWrapLeft: {
      width: 48,
      height: 48,
      marginRight: 8,
      position: "relative",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarWrapRight: {
      width: 48,
      height: 48,
      marginLeft: 8,
      position: "relative",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    avatarStarLeft: {
      position: "absolute",
      top: -6,
      left: -2,
      fontSize: 14,
      fontWeight: "900",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
      zIndex: 5,
    },

    avatarStarRight: {
      position: "absolute",
      top: -6,
      right: -2,
      fontSize: 14,
      fontWeight: "900",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
      zIndex: 5,
    },

    bubble: {
      maxWidth: "78%",
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: theme.surface,
      flexShrink: 1,
      position: "relative",
    },

    bubbleOther: {
      borderTopLeftRadius: 6,
    },

    bubbleMe: {
      borderTopRightRadius: 6,
    },

    nameWrap: {
      marginBottom: 4,
      maxWidth: "100%",
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "100%",
    },

    senderName: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
      maxWidth: 250,
    },

    nameUnderline: {
      height: 1,
      backgroundColor: theme.separator,
      marginTop: 3,
      opacity: 0.7,
    },

    msgText: {
      fontSize: 13,
      lineHeight: 21,
      color: theme.text,
      fontWeight: "600",
    },

    msgTextMuted: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.mutedText,
      fontWeight: "700",
    },

    media: {
      width: 220,
      height: 220,
      borderRadius: 14,
      backgroundColor: theme.surface2,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
    },

    stickerMedia: {
      width: 190,
      height: 190,
      borderRadius: 16,
      backgroundColor: "transparent",
      overflow: "hidden",
    },

    videoWrapper: {
      width: 230,
      height: 230,
      borderRadius: 14,
      backgroundColor: "#000000",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },

    video: {
      width: "100%",
      height: "100%",
      backgroundColor: "#000000",
    },

    fileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    fileIcon: {
      fontSize: 18,
    },

    fileName: {
      maxWidth: 200,
      fontSize: 14,
      color: theme.text,
      fontWeight: "700",
    },

    replyBox: {
      borderLeftWidth: 3,
      borderLeftColor: primary,
      backgroundColor: theme.surface2,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginBottom: 8,
    },

    replyTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },

    replyName: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.text,
      maxWidth: "78%",
    },

    replyTag: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.mutedText,
    },

    replyText: {
      fontSize: 12,
      color: theme.mutedText,
      lineHeight: 16,
    },

    reactionOutside: {
      position: "absolute",
      bottom: -13,
      minWidth: 30,
      height: 24,
      borderRadius: 999,
      paddingHorizontal: 8,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 4,
      zIndex: 20,
    },

    reactionOutsideMe: {
      right: 54,
    },

    reactionOutsideOther: {
      left: 54,
    },

    reactionEmoji: {
      fontSize: 14,
      marginRight: 4,
    },

    reactionCount: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.text,
    },

    sysWrap: {
      width: "100%",
      alignItems: "center",
      marginVertical: 6,
    },

    sysBubble: {
      backgroundColor: primarySoft,
      borderColor: theme.border,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 14,
    },

    privateMentionBubble: {
      maxWidth: "88%",
      minHeight: 34,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    privateMentionText: {
      flexShrink: 1,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 18,
      writingDirection: "ltr",
      textAlign: "left",
    },

    sysTime: {
      fontSize: 11,
      color: theme.mutedText,
      textAlign: "center",
      marginTop: 4,
    },
  });
}

export type BubbleStyles = ReturnType<typeof makeBubbleStyles>;