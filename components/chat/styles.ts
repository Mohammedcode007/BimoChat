import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
    zIndex: 20,
  },
actionsOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.25)",
  justifyContent: "flex-end",
  paddingHorizontal: 12,
  paddingBottom: 20,
},

actionsBox: {
  width: "100%",
  borderWidth: 1,
  borderRadius: 22,
  paddingVertical: 8,
  overflow: "hidden",
  elevation: 10,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.18,
  shadowRadius: 16,
},

actionsItem: {
  minHeight: 52,
  paddingHorizontal: 16,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

actionsText: {
  fontSize: 15,
  fontWeight: "800",
},

actionsCancel: {
  minHeight: 48,
  marginTop: 4,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: "rgba(148,163,184,0.25)",
  alignItems: "center",
  justifyContent: "center",
},
inlineAudioBtn: {
  minWidth: 150,
  height: 38,
  borderRadius: 19,
  paddingHorizontal: 8,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

inlineAudioIcon: {
  width: 26,
  height: 26,
  borderRadius: 13,
  alignItems: "center",
  justifyContent: "center",
},
actionsCancelText: {
  fontSize: 15,
  fontWeight: "900",
},
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    marginRight: 8,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6D5DF6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  userInfo: {
    justifyContent: "center",
  },

  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  onlineText: {
    fontSize: 12,
    color: "#22C55E",
    marginTop: 2,
  },

  lastSeen: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  typing: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    zIndex: 30,
  },

  searchBackBtn: {
    paddingHorizontal: 6,
    marginRight: 4,
  },

  searchInputWrap: {
    flex: 1,
    height: 42,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 8,
  },

  searchNav: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchCounter: {
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
    minWidth: 38,
    textAlign: "center",
  },

  searchNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  searchResultsCard: {
    position: "absolute",
    top: 120,
    left: 12,
    right: 12,
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 25,
    maxHeight: 195,
    overflow: "hidden",
  },

  searchLoadingBox: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  searchResultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchResultLeft: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },

  searchResultBody: {
    flex: 1,
    marginTop: 50,
  },

  searchResultHighlight: {
    backgroundColor: "#FDE68A",
    color: "#111827",
    fontWeight: "700",
  },

  paginationLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },

  iconBtn: {
    paddingHorizontal: 6,
  },

  replyComposer: {
    marginHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  replyComposerLine: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 8,
    backgroundColor: "#6D5DF6",
  },

  replyComposerTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  inputBarWrap: {
    borderTopWidth: 1,
  },

  inputBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: "center",
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },

  sendBtn: {
    backgroundColor: "#6D5DF6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  micBtn: {
    padding: 6,
  },

  bottomQuickActions: {
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: "row",
  },

  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },

  quickBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },

  messageContainer: {
    marginVertical: 4,
  },

  mediaLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mediaLoadingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  audioLoadingBox: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  rowMe: {
    alignItems: "flex-end",
  },

  rowOther: {
    alignItems: "flex-start",
  },

bubble: {
  maxWidth: "78%",
  minWidth: 42,
  paddingVertical: 9,
  paddingHorizontal: 12,
  borderRadius: 16,
  overflow: "visible",
  flexShrink: 1,
},

  me: {
    backgroundColor: "#5fc4e8",
    borderBottomRightRadius: 4,
  },

  inviteCard: {
    minWidth: 220,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },

  inviteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inviteAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },

  inviteAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#6D5DF6",
    alignItems: "center",
    justifyContent: "center",
  },

  inviteRoomName: {
    fontSize: 14,
    fontWeight: "800",
  },

  inviteMetaText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
  },

inviteMessageText: {
  marginTop: 10,
  fontSize: 13,
  lineHeight: 20,
  fontWeight: "400",
  includeFontPadding: false,
},

  joinRoomBtn: {
    marginTop: 12,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#6D5DF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  joinRoomBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },

  other: {
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 4,
  },

  otherDark: {
    backgroundColor: "#111827",
  },

meText: {
  color: "#FFF",
  fontSize: 15,
  lineHeight: 22,
  fontWeight: "400",
  includeFontPadding: false,
  textAlignVertical: "center",
  flexShrink: 1,
},

 otherText: {
  color: "#111827",
  fontSize: 15,
  lineHeight: 22,
  fontWeight: "400",
  includeFontPadding: false,
  textAlignVertical: "center",
  flexShrink: 1,
},

  replyPreviewBox: {
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },

  replyPreviewTitle: {
    fontSize: 12,
    fontWeight: "700",
  },

replyPreviewText: {
  fontSize: 12,
  lineHeight: 18,
  marginTop: 2,
  fontWeight: "400",
  includeFontPadding: false,
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
  zIndex: 100,
  elevation: 8,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
},
highlightText: {
  backgroundColor: "#FDE68A",
  color: "#111827",
  fontWeight: "400",
  borderRadius: 4,
  includeFontPadding: false,
},
  highlightTextActive: {
    backgroundColor: "#F59E0B",
    color: "#111827",
  },

  searchMatchedBubble: {
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
  },

  searchActiveBubble: {
    borderWidth: 2,
    borderColor: "#F59E0B",
  },

  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  timeRight: {
    justifyContent: "flex-end",
  },

  timeLeft: {
    justifyContent: "flex-start",
  },

  timeText: {
    fontSize: 10,
  },

  timeMe: {
    color: "#83858a",
  },

  timeOther: {
    color: "#6B7280",
  },

  statusIcon: {
    marginLeft: 2,
  },

  deletedBubble: {
    alignSelf: "center",
    marginVertical: 8,
  },

  deletedText: {
    fontStyle: "italic",
    color: "#6B7280",
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },

  previewCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },

  previewHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  previewCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  previewBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  previewImage: {
    width: "100%",
    height: "80%",
  },

  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },

  menuBox: {
    position: "absolute",
    top: 56,
    right: 12,
    minWidth: 160,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "600",
  },
});