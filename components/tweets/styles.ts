import { Platform, StyleSheet } from "react-native";

export function makeTweetsStyles(theme: any, isDark: boolean) {
  const cardBg = theme.surface ?? theme.background;
  const surface2 =
    theme.surface2 ?? theme.cardAlt ?? (isDark ? "#14141A" : "#F3F4F6");

  return StyleSheet.create({
    _iconColor: theme.icon,

    container: {
      flex: 1,
    },

    tabsWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingTop: 6,
    },

    reportOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    reportHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    reportBackBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reportSheet: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      paddingBottom: 22,
      maxHeight: "78%",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -8 },
        },
        android: {
          elevation: 10,
        },
      }),
    },

    reportTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 6,
    },

    reportSubtitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.mutedText,
      marginBottom: 14,
    },

    reportSectionTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 10,
      marginTop: 4,
    },

    reportReasonsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },

    reportReasonChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reportReasonChipActive: {
      backgroundColor: theme.tint,
      borderColor: theme.tint,
    },

    reportReasonText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
    },

    reportReasonTextActive: {
      color: "#FFF",
    },

    reportInput: {
      minHeight: 110,
      maxHeight: 180,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 16,
    },

    reportActionsRow: {
      flexDirection: "row",
      gap: 10,
    },

    reportCancelBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reportCancelText: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    reportSubmitBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EF4444",
      borderWidth: 1,
      borderColor: "#EF4444",
    },

    reportSubmitText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFF",
    },

    imageModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.96)",
    },

    imageModalBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    imageModalHeader: {
      position: "absolute",
      top: 50,
      right: 16,
      zIndex: 5,
    },

    imageModalCloseBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },

    imageModalContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 40,
    },

    imageModalImage: {
      width: "100%",
      height: "85%",
    },

    tabBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      paddingBottom: 8,
    },

    tabText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.mutedText,
    },

    tabTextActive: {
      color: theme.text,
      fontWeight: "900",
    },

    tabIndicator: {
      marginTop: 8,
      width: 32,
      height: 3,
      borderRadius: 999,
      backgroundColor: "transparent",
    },

    tabIndicatorActive: {
      backgroundColor: theme.tint,
    },

    card: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: theme.background,
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: surface2,
    },

    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },

    name: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      maxWidth: 230,
    },

    handle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
    },

    time: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.subtleText,
    },

    dot: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.subtleText,
      marginHorizontal: 2,
    },

    text: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text,
      fontWeight: "700",
    },

    normalText: {
      color: theme.text,
      fontWeight: "700",
    },

    mention: {
      color: "#2563EB",
      fontWeight: "900",
    },

    hashtag: {
      color: theme.warning ?? "#F59E0B",
      fontWeight: "900",
    },

    link: {
      color: "#0EA5E9",
      fontWeight: "900",
      textDecorationLine: "underline",
    },

    readMoreBtn: {
      marginTop: 6,
    },

    readMoreText: {
      color: theme.tint,
      fontSize: 13,
      fontWeight: "900",
    },

    mediaSection: {
      marginTop: 10,
      gap: 10,
    },

    singleMedia: {
      width: "100%",
      height: 240,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid2: {
      marginTop: 10,
      flexDirection: "row",
      gap: 8,
    },

    cardWrap: {
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      backgroundColor: theme.background,
    },

    retweetHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingLeft: 66,
      paddingRight: 12,
      paddingTop: 10,
      paddingBottom: 2,
      backgroundColor: theme.background,
    },

    retweetHeaderText: {
      flex: 1,
      fontSize: 12,
      fontWeight: "900",
      color: theme.mutedText,
    },

    grid2Item: {
      flex: 1,
      height: 220,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid3: {
      marginTop: 10,
      flexDirection: "row",
      gap: 8,
      height: 240,
    },

    grid3Left: {
      flex: 1.2,
      height: "100%",
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid3Right: {
      flex: 0.8,
      gap: 8,
    },

    grid3Small: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid4: {
      marginTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    grid4ItemWrap: {
      width: "48.8%",
      aspectRatio: 1,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    grid4Item: {
      width: "100%",
      height: "100%",
    },

    moreOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.42)",
      alignItems: "center",
      justifyContent: "center",
    },

    moreOverlayText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
    },

    linkCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    linkCardImage: {
      width: "100%",
      height: 180,
      backgroundColor: surface2,
    },

    linkCardImagePlaceholder: {
      width: "100%",
      height: 110,
      backgroundColor: surface2,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    linkCardBody: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    linkCardSite: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.mutedText,
      marginBottom: 4,
    },

    linkCardTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      lineHeight: 20,
    },

    linkCardDesc: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      color: theme.mutedText,
      fontWeight: "600",
    },

    linkCardUrl: {
      marginTop: 8,
      fontSize: 12,
      color: theme.tint,
      fontWeight: "800",
    },

    actions: {
      flexDirection: "row",
      gap: 14,
      marginTop: 10,
      alignItems: "center",
    },

    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
    },

    actionValue: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.mutedText,
    },

    followBtn: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },

    followBtnOff: {
      borderColor: theme.tint,
    },

    followBtnOn: {
      borderColor: theme.border,
    },

    followText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "900",
    },

    moreBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    badgesWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 4,
      flexWrap: "wrap",
    },

    badgePill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      marginLeft: 6,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.06)",
    },

    badgeText: {
      fontSize: 10,
      fontWeight: "900",
    },

    deleteBtn: {
      width: 96,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginVertical: 6,
      borderRadius: 16,
    },

    deleteText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "900",
    },

    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    sheet: {
      backgroundColor: cardBg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      paddingBottom: 18,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -8 },
        },
        android: {
          elevation: 10,
        },
      }),
    },

    sheetTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 12,
    },

    sheetItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderRadius: 14,
    },

    sheetIcon: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },

    sheetText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
    },

    fab: {
      position: "absolute",
      right: 18,
      bottom: 40,
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: "#4F46E5",
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
}