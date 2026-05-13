import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },

  headerTitle: {
    flex: 1,
    fontSize: 28,
    letterSpacing: 0.3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceCard: {
    minHeight: 122,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 22,
    paddingHorizontal: 16,
  },

  balanceValue: {
    fontSize: 28,
    letterSpacing: 0.5,
  },

  balanceLabel: {
    marginTop: 6,
    fontSize: 17,
  },

  sectionTitleWrap: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 20,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 13,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  statBox: {
    width: "48.5%",
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  statValue: {
    fontSize: 25,
  },

  statLabel: {
    marginTop: 4,
    fontSize: 18,
  },

  actionRowCard: {
    minHeight: 70,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  actionTextWrap: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 21,
  },

  actionSub: {
    marginTop: 3,
    fontSize: 13,
  },

  actionValue: {
    maxWidth: 110,
    fontSize: 22,
  },

  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },

  categoryCard: {
    width: "48.5%",
    minHeight: 118,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  categoryTitle: {
    fontSize: 15,
  },

  categorySub: {
    marginTop: 4,
    fontSize: 12,
  },
});