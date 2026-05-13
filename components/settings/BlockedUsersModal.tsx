import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type BlockedUserItem = {
  _id: string;
  username: string;
  atUsername?: string;
  avatar?: string;
};

type Props = {
  visible: boolean;
  users: BlockedUserItem[];
  loading?: boolean;
  refreshing?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onUnblock: (userId: string) => void;
};

export default function BlockedUsersSettingsModal({
  visible,
  users,
  loading,
  refreshing,
  onClose,
  onRefresh,
  onUnblock,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users || [];

    return (users || []).filter((u) => {
      const username = String(u.username || "").toLowerCase();
      const atUsername = String(u.atUsername || "").toLowerCase();
      return username.includes(q) || atUsername.includes(q);
    });
  }, [users, search]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="ban-outline" size={18} color="#111827" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Blocked users</Text>
              <Text style={styles.subtitle}>{filteredUsers.length} blocked</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search blocked users"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />

            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading blocked users...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 22 }}
              refreshControl={
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="shield-checkmark-outline" size={44} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No blocked users</Text>
                  <Text style={styles.emptyText}>Your blocked list is empty.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <Image
                    source={{
                      uri:
                        item.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.username || "User"
                        )}&background=111827&color=fff`,
                    }}
                    style={styles.avatar}
                  />

                  <View style={styles.userInfo}>
                    <Text numberOfLines={1} style={styles.username}>
                      {item.username}
                    </Text>

                    {!!item.atUsername && (
                      <Text numberOfLines={1} style={styles.atUsername}>
                        @{item.atUsername}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onUnblock(item._id)}
                    style={styles.unblockBtn}
                  >
                    <Ionicons name="lock-open-outline" size={15} color="#FFF" />
                    <Text style={styles.unblockText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    maxHeight: "82%",
    minHeight: "55%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  userRow: {
    minHeight: 70,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5E7EB",
  },
  userInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  username: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  atUsername: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  unblockBtn: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  unblockText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },
  emptyBox: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  emptyText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
});