import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";

import {
    BlockRule,
    BlockScope,
    BlockTargetType,
    clearBlockControlError,
    clearBlockControlSuccess,
    createBlockRule,
    listBlockRules,
    selectBlockControlCreating,
    selectBlockControlError,
    selectBlockControlLoading,
    selectBlockControlSuccess,
    selectBlockControlUnblocking,
    selectBlockScopeFilter,
    selectFilteredBlockRules,
    setBlockScopeFilter,
    unblockRule,
} from "@/redux/slices/blockControl.slice";

const SCOPES: {
  label: string;
  value: BlockScope;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "الغرف", value: "rooms", icon: "chatbubbles-outline" },
  { label: "التويتات", value: "tweets", icon: "newspaper-outline" },
  { label: "التطبيق كله", value: "app", icon: "ban-outline" },
];

const TARGET_TYPES: { label: string; value: BlockTargetType }[] = [
  { label: "الحساب فقط", value: "user" },
  { label: "الهوية", value: "identity" },
  { label: "الجهاز", value: "device" },
  { label: "IP", value: "ip" },
  { label: "مختلط", value: "mixed" },
];

const getCurrentUser = (state: RootState) => {
  return (
    (state as any)?.auth?.user ||
    (state as any)?.user?.user ||
    (state as any)?.user?.currentUser ||
    (state as any)?.auth?.currentUser ||
    null
  );
};

export default function BlockControlScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const currentUser = useSelector(getCurrentUser);

  const role = String(
    currentUser?.role ||
      currentUser?.accountType ||
      currentUser?.type ||
      ""
  ).toLowerCase();

  const isAdmin = role === "admin";

  const items = useAppSelector(selectFilteredBlockRules);
  const scopeFilter = useAppSelector(selectBlockScopeFilter);

  const loading = useAppSelector(selectBlockControlLoading);
  const creating = useAppSelector(selectBlockControlCreating);
  const unblocking = useAppSelector(selectBlockControlUnblocking);
  const error = useAppSelector(selectBlockControlError);
  const success = useAppSelector(selectBlockControlSuccess);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [targetUserId, setTargetUserId] = useState("");
  const [scope, setScope] = useState<BlockScope>("rooms");
  const [targetType, setTargetType] = useState<BlockTargetType>("mixed");
  const [reason, setReason] = useState("");

  const [includeIdentity, setIncludeIdentity] = useState(true);
  const [includeDevice, setIncludeDevice] = useState(true);
  const [includeIp, setIncludeIp] = useState(false);

  const busy = loading || creating || unblocking;

  const loadBlocks = useCallback(async () => {
    if (!isAdmin) return;

    await dispatch(listBlockRules({ scope: scopeFilter })).unwrap();
  }, [dispatch, isAdmin, scopeFilter]);

  useEffect(() => {
    if (!isAdmin) return;

    loadBlocks().catch(() => {});
  }, [isAdmin, loadBlocks]);

  useEffect(() => {
    if (!error) return;

    Alert.alert("خطأ", error);
    dispatch(clearBlockControlError());
  }, [error, dispatch]);

  useEffect(() => {
    if (!success) return;

    Alert.alert("تم", success);
    dispatch(clearBlockControlSuccess());
  }, [success, dispatch]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadBlocks();
    } finally {
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setTargetUserId("");
    setScope("rooms");
    setTargetType("mixed");
    setReason("");
    setIncludeIdentity(true);
    setIncludeDevice(true);
    setIncludeIp(false);
  };

  const createBlock = async () => {
    const cleanTargetUserId = targetUserId.trim();

    if (!cleanTargetUserId) {
      Alert.alert("تنبيه", "اكتب ID المستخدم المراد حظره");
      return;
    }

    try {
      await dispatch(
        createBlockRule({
          scope,
          targetType,
          targetUserId: cleanTargetUserId,
          reason: reason.trim(),
          includeIdentity,
          includeDevice,
          includeIp,
        })
      ).unwrap();

      setModalVisible(false);
      resetForm();

      await dispatch(listBlockRules({ scope: scopeFilter })).unwrap();
    } catch {
      // الخطأ يظهر من useEffect عبر selectBlockControlError
    }
  };

  const unblock = (rule: BlockRule) => {
    Alert.alert("فك الحظر", "هل تريد فك هذا الحظر؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "فك الحظر",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(unblockRule(rule._id)).unwrap();
          } catch {
            // الخطأ يظهر من useEffect عبر selectBlockControlError
          }
        },
      },
    ]);
  };

  const scopeMeta = (value: BlockScope) => {
    return SCOPES.find((x) => x.value === value);
  };

  const renderBlockItem = ({ item }: { item: BlockRule }) => {
    const meta = scopeMeta(item.scope);

    const userObj =
      item.user && typeof item.user === "object" ? item.user : null;

    const username =
      userObj?.username ||
      userObj?.atUsername ||
      "مستخدم غير معروف";

    const userId =
      userObj?._id ||
      (typeof item.user === "string" ? item.user : "") ||
      "لا يوجد userId";

    const createdAt = item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "N/A";

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.scopeBadge}>
            <Ionicons
              name={meta?.icon || "ban-outline"}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.scopeBadgeText}>
              {meta?.label || item.scope}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => unblock(item)}
            disabled={unblocking}
            activeOpacity={0.85}
            style={styles.unblockBtn}
          >
            {unblocking ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="lock-open-outline" size={16} color="#EF4444" />
                <Text style={styles.unblockText}>فك الحظر</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.userRow}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.username} numberOfLines={1}>
              {username}
            </Text>

            <Text style={styles.userId} numberOfLines={1}>
              {String(userId)}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>نوع الحظر</Text>
            <Text style={styles.infoValue}>{item.targetType}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>الحالة</Text>
            <Text
              style={[
                styles.infoValue,
                { color: item.isActive ? "#16A34A" : "#EF4444" },
              ]}
            >
              {item.isActive ? "نشط" : "غير نشط"}
            </Text>
          </View>
        </View>

        {!!item.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>السبب</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        )}

        <Text style={styles.createdAt}>تاريخ الإنشاء: {createdAt}</Text>
      </View>
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.deniedWrap}>
          <View style={styles.deniedIcon}>
            <Ionicons name="shield-outline" size={38} color="#EF4444" />
          </View>

          <Text style={styles.deniedTitle}>غير مسموح</Text>

          <Text style={styles.deniedText}>
            هذه الصفحة متاحة للأدمن فقط.
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.backBtnText}>رجوع</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>لوحة الحظر</Text>
          <Text style={styles.subtitle}>
            إدارة حظر الغرف والتويتات والتطبيق
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            onPress={() => dispatch(setBlockScopeFilter("all"))}
            style={[
              styles.filterChip,
              scopeFilter === "all" && styles.filterChipActive,
            ]}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterChipText,
                scopeFilter === "all" && styles.filterChipTextActive,
              ]}
            >
              الكل
            </Text>
          </TouchableOpacity>

          {SCOPES.map((item) => {
            const active = scopeFilter === item.value;

            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => dispatch(setBlockScopeFilter(item.value))}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={active ? "#FFFFFF" : "#475569"}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing && items.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderBlockItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="ban-outline" size={38} color="#94A3B8" />
              <Text style={styles.emptyTitle}>لا توجد سجلات حظر</Text>
              <Text style={styles.emptyText}>
                اضغط على زر الإضافة لإنشاء حظر جديد.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          style={styles.modalOverlay}
        >
          <Pressable onPress={() => {}} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>إنشاء حظر جديد</Text>
                <Text style={styles.modalSubtitle}>
                  اختر نوع الحظر والنطاق المناسب
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>User ID</Text>
              <TextInput
                value={targetUserId}
                onChangeText={setTargetUserId}
                placeholder="اكتب ID المستخدم"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>نطاق الحظر</Text>
              <View style={styles.optionsRow}>
                {SCOPES.map((item) => {
                  const active = scope === item.value;

                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setScope(item.value)}
                      style={[
                        styles.optionChip,
                        active && styles.optionChipActive,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={item.icon}
                        size={16}
                        color={active ? "#FFFFFF" : "#475569"}
                      />
                      <Text
                        style={[
                          styles.optionChipText,
                          active && styles.optionChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>قوة الحظر</Text>
              <View style={styles.optionsWrap}>
                {TARGET_TYPES.map((item) => {
                  const active = targetType === item.value;

                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setTargetType(item.value)}
                      style={[
                        styles.typeChip,
                        active && styles.typeChipActive,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          active && styles.typeChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.switchBox}>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchTitle}>ربط الحظر بالهوية</Text>
                    <Text style={styles.switchDesc}>
                      مفيد لو عندك email / google / firebase
                    </Text>
                  </View>
                  <Switch
                    value={includeIdentity}
                    onValueChange={setIncludeIdentity}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchTitle}>ربط الحظر بالجهاز</Text>
                    <Text style={styles.switchDesc}>
                      يعتمد على x-device-id من التطبيق
                    </Text>
                  </View>
                  <Switch
                    value={includeDevice}
                    onValueChange={setIncludeDevice}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchTitle}>ربط الحظر بالـ IP</Text>
                    <Text style={styles.switchDesc}>
                      قوي لكنه قد يظلم من يستخدم نفس الشبكة
                    </Text>
                  </View>
                  <Switch value={includeIp} onValueChange={setIncludeIp} />
                </View>
              </View>

              <Text style={styles.inputLabel}>سبب الحظر</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="مثال: سبام في الغرف"
                placeholderTextColor="#94A3B8"
                style={[styles.input, styles.reasonInput]}
                multiline
              />

              <TouchableOpacity
                onPress={createBlock}
                disabled={busy}
                style={[styles.createBtn, busy && { opacity: 0.65 }]}
                activeOpacity={0.85}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="ban-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.createBtnText}>إنشاء الحظر</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  filters: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  filtersContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },

  filterChip: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  listContent: {
    padding: 14,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scopeBadge: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  scopeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  unblockBtn: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  unblockText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "900",
  },

  userRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  username: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
  },

  userId: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  infoLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },

  reasonBox: {
    marginTop: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  reasonLabel: {
    color: "#9A3412",
    fontSize: 11,
    fontWeight: "900",
  },

  reasonText: {
    color: "#7C2D12",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: "700",
  },

  createdAt: {
    marginTop: 10,
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "800",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
    textAlign: "center",
  },

  deniedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  deniedIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  deniedTitle: {
    marginTop: 16,
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },

  deniedText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
  },

  backBtn: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },

  modalCard: {
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },

  reasonInput: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  optionChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  optionChipText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "900",
  },

  optionChipTextActive: {
    color: "#FFFFFF",
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  typeChipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },

  typeChipText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "900",
  },

  typeChipTextActive: {
    color: "#FFFFFF",
  },

  switchBox: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  switchRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "900",
  },

  switchDesc: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    maxWidth: 240,
  },

  createBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  createBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});