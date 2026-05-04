// components/roomScreen/styles/roomStyles.ts

import { StyleSheet } from "react-native";

import { Colors } from "@/constants/theme";

export function makeScreenStyles(
  theme: typeof Colors.light,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.backgroundChat,
    },

    contentSafe: {
      flex: 1,
      backgroundColor: theme.backgroundChat,
    },

    stickerMedia: {
      width: 150,
      height: 150,
      borderRadius: 14,
      backgroundColor: "transparent",
      marginTop: 6,
    },

    header: {
      height: 54 + topInset,
      paddingTop: topInset,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.card,
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      minWidth: 0,
    },

    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },

    headerIconBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: -1,
    },

    roomAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.surface2,
    },

    roomName: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
    },

    roomMeta: {
      fontSize: 12,
      color: theme.mutedText,
    },

    voiceInlineRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },

    voiceInlineText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },

    voiceInlinePlay: {
      fontSize: 14,
      color: "#2563EB",
      fontWeight: "800",
    },

    audioModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.18)",
      justifyContent: "flex-start",
    },

    audioModalCard: {
      marginTop: 88,
      marginHorizontal: 12,
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 6,
    },

    audioModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    audioModalTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: theme.text,
    },

    audioModalSender: {
      marginTop: 4,
      fontSize: 12,
      color: theme.mutedText,
      fontWeight: "600",
    },

    pinnedBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "rgba(0,0,0,0.0)",
      borderBottomWidth: 1,
      borderColor: theme.separator,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    pinnedLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
scrollToBottomBtn: {
  position: "absolute",
  right: 18,
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  zIndex: 999,
  elevation: 10,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
},
    pinnedTitle: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.text,
    },

    pinnedText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.mutedText,
    },

    pinnedMeta: {
      marginTop: 2,
      fontSize: 11,
      color: theme.subtleText,
    },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 10 + Math.max(0, bottomInset * 0.2),
      backgroundColor: theme.card,
    },

    inputBarWrap: {
      borderTopWidth: 1,
      borderColor: theme.separator,
      backgroundColor: theme.card,
    },

    input: {
      flex: 1,
      backgroundColor: theme.surface2,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      maxHeight: 120,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },

    replyPreview: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.cardAlt,
      borderTopWidth: 1,
      borderColor: theme.separator,
    },

    actionsOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      alignItems: "center",
    },

    actionsBox: {
      backgroundColor: theme.card,
      width: "80%",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },

    reactionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    action: {
      fontSize: 16,
      paddingVertical: 10,
      fontWeight: "800",
      color: theme.text,
    },

    cancel: {
      textAlign: "center",
      marginTop: 8,
      color: theme.mutedText,
      fontWeight: "800",
    },

    imagePreviewOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.95)",
      justifyContent: "center",
      alignItems: "center",
    },

    fullImage: {
      width: "100%",
      height: "100%",
    },

    imagePreviewClose: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 10,
    },

    menuOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.12)",
    },

    menuBox: {
      position: "absolute",
      top: 60,
      right: 12,
      width: 200,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    menuText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "900",
    },

    menuDivider: {
      height: 1,
      backgroundColor: theme.separator,
      marginVertical: 6,
    },

    fixedReplyLayer: {
      position: "absolute",
      top: 8,
      left: 0,
      right: 0,
      zIndex: 950,
      elevation: 950,
      alignItems: "center",
      pointerEvents: "box-none",
    },

    fixedReplyCard: {
      width: "92%",
      minHeight: 52,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 7,
    },

    fixedReplyIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    fixedReplyTitle: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "900",
    },

    fixedReplyText: {
      marginTop: 2,
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: "700",
    },

    fixedReplyClose: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      marginLeft: 8,
    },

    globalAudioPlayer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderColor: theme.separator,
    },

    audioIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    audioCenter: {
      flex: 1,
    },

    audioNow: {
      fontSize: 12,
      color: theme.text,
      fontWeight: "900",
      marginBottom: 6,
    },

    globalProgressBg: {
      width: "100%",
      height: 3,
      backgroundColor: theme.separator,
      borderRadius: 2,
      overflow: "hidden",
    },

    globalProgressFill: {
      height: "100%",
      backgroundColor: theme.primary,
    },

    audioTimes: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 6,
    },

    timeText: {
      fontSize: 11,
      color: theme.mutedText,
    },

    pinOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },

    pinSheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
      maxHeight: "80%",
      borderTopWidth: 1,
      borderColor: theme.border,
    },

    pinHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    pinTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
    },

    pinCloseBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    pinList: {
      marginTop: 12,
    },

    pinLabel: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "900",
      color: theme.text,
    },

    pinInputWrap: {
      marginTop: 8,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
    },

    pinInput: {
      flex: 1,
      minHeight: 110,
      maxHeight: 180,
      fontSize: 13,
      color: theme.text,
      lineHeight: 18,
    },

    pinPreviewBox: {
      marginTop: 12,
      padding: 12,
      borderRadius: 14,
      backgroundColor: theme.cardAlt,
      borderWidth: 1,
      borderColor: theme.border,
    },

    pinPreviewTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.text,
    },

    pinActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 10,
    },

    pinBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.primary,
    },

    pinBtnText: {
      color: theme.primaryText,
      fontWeight: "900",
    },

    pinBtnCancel: {
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    pinBtnCancelText: {
      color: theme.text,
      fontWeight: "900",
    },

    pinBtnDisabled: {
      opacity: 0.5,
    },

    inviteModalBox: {
      marginHorizontal: 20,
      marginTop: "45%",
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },

    inviteModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    inviteModalTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
    },

    inviteModalCloseBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    inviteModalHint: {
      fontSize: 13,
      color: theme.mutedText,
      marginBottom: 12,
      lineHeight: 20,
    },

    inviteInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      borderRadius: 14,
      paddingHorizontal: 12,
      minHeight: 48,
    },

    inviteInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
      paddingVertical: 10,
    },

    inviteActionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },

    inviteCancelBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface2,
      alignItems: "center",
      justifyContent: "center",
    },

    inviteCancelText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },

    inviteSendBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    inviteSendText: {
      color: theme.primaryText,
      fontSize: 14,
      fontWeight: "800",
    },

    fixedAudioLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      elevation: 999,
      alignItems: "center",
      pointerEvents: "box-none",
    },

    fixedAudioCard: {
      width: "92%",
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOpacity: 0.14,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 8,
    },

    fixedAudioHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    fixedAudioIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    fixedAudioTitle: {
      flex: 1,
      color: theme.text,
      fontSize: 13,
      fontWeight: "900",
    },

    fixedAudioClose: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
    },

    fixedAudioPlayer: {
      width: "100%",
    },

    fullOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },

    fullBox: {
      width: "100%",
      maxHeight: "70%",
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },

    fullHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },

    fullTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },

    fullMeta: {
      fontSize: 12,
      color: theme.mutedText,
      marginBottom: 10,
      fontWeight: "800",
    },
  });
}

export type RoomStyles = ReturnType<typeof makeScreenStyles>;