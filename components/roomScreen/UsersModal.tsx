// components/roomScreen/UsersModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";

import {
  canManageRoomUser,
  getRoleColor,
  isRoomManagerRole,
  resolveAvatarSource,
  sortUsersByRoleAndName,
} from "./helpers";
import { UserUI } from "./types";

export default function UsersModal({
  visible,
  onClose,
  users,
  myUserId,
  myRole,
  onCopyUser,
  onChangeRole,
  onKickUser,
  onBanUser,
  onOpenGift,
  onAvatarPress,
  onStartChat,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  users: UserUI[];
  myUserId: string;
  myRole?: UserUI["role"];
  onCopyUser: (u: UserUI) => void;
  onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
  onKickUser: (u: UserUI) => void;
  onBanUser: (u: UserUI) => void;
  onOpenGift: (u: UserUI) => void;
  onAvatarPress: (u: UserUI) => void;
  onStartChat: (u: UserUI) => void;
  theme: typeof Colors.light;
}) {
  const canManage = isRoomManagerRole(myRole);
  const s = useMemo(() => makeUsersStyles(theme), [theme]);

  const sortedUsers = useMemo(() => {
    return sortUsersByRoleAndName(users || []);
  }, [users]);

  const RoleChip = ({
    title,
    active,
    onPress,
  }: {
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[s.roleChip, active && s.roleChipActive]}
      activeOpacity={0.85}
    >
      <Text style={[s.roleChipText, active && s.roleChipTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.header}>
            <Text style={s.title}>Users</Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={s.closeBtn}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={s.note}>
            <Text style={s.noteText}>
              اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
              {canManage
                ? "يمكنك تغيير الدور أو الطرد/الحظر من أزرار الإدارة."
                : "ليس لديك صلاحية لتغيير الأدوار."}
            </Text>
          </View>

          <ScrollView
            style={s.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
          >
            {sortedUsers.map((u) => {
              const isMe = String(u.id) === String(myUserId);
              const canManageThisUser = canManageRoomUser({
                myRole,
                isMe,
              });

              return (
                <View key={u.id} style={s.userBlock}>
                  <TouchableOpacity
                    style={s.row}
                    onPress={() => onCopyUser(u)}
                    activeOpacity={0.88}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onAvatarPress(u);
                      }}
                      style={s.avatarBtn}
                    >
                      <Image
                        source={resolveAvatarSource(u)}
                        style={s.usersModalAvatar}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={0}
                      />
                    </TouchableOpacity>

                    <View style={s.userNameBox}>
                      <View style={s.nameLine}>
                        <Text
                          style={[
                            s.name,
                            {
                              color: getRoleColor(u.role),
                            },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {u.name} {isMe ? "(You)" : ""}
                        </Text>

                        {/* <CustomEmojiBadgeView badge={u.customEmojiBadge} /> */}
                        {/* <DynamicUserBadge
                          badge={pickPrimaryBadge(u.activeBadges)}
                        /> */}
                      </View>
                    </View>

                    {!isMe && (
                      <View style={s.trailingActions}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            onClose();

                            requestAnimationFrame(() => {
                              onOpenGift(u);
                            });
                          }}
                          activeOpacity={0.75}
                          style={s.iconBtn}
                        >
                          <Ionicons
                            name="gift-outline"
                            size={21}
                            color={theme.text}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            onStartChat(u);
                          }}
                          activeOpacity={0.75}
                          style={s.iconBtn}
                        >
                          <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={21}
                            color={theme.text}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>

                  {canManageThisUser && (
                    <View style={s.manageArea}>
                      <View style={s.rolesRow}>
                        <RoleChip
                          title="Member"
                          active={(u.role || "member") === "member"}
                          onPress={() => onChangeRole(u, "member")}
                        />

                        <RoleChip
                          title="Admin"
                          active={u.role === "admin"}
                          onPress={() => onChangeRole(u, "admin")}
                        />

                        <RoleChip
                          title="Owner"
                          active={u.role === "owner"}
                          onPress={() => onChangeRole(u, "owner")}
                        />
                      </View>

                      <View style={s.actionsRow}>
                        <TouchableOpacity
                          onPress={() => onKickUser(u)}
                          style={s.kickBtn}
                          activeOpacity={0.85}
                        >
                          <Text style={s.kickText}>Kick</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => onBanUser(u)}
                          style={s.banBtn}
                          activeOpacity={0.85}
                        >
                          <Text style={s.banText}>Ban</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {!sortedUsers.length && (
              <View style={s.emptyBox}>
                <Ionicons
                  name="people-outline"
                  size={32}
                  color={theme.mutedText}
                />

                <Text style={s.emptyText}>لا يوجد مستخدمون حاليًا.</Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeUsersStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },

    sheet: {
      maxHeight: "82%",
      backgroundColor: theme.card,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderColor: theme.border,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
    },

    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    note: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
    },

    noteText: {
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },

    list: {
      width: "100%",
    },

    listContent: {
      paddingBottom: 12,
    },

    userBlock: {
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      paddingVertical: 10,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 44,
    },

    avatarBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    usersModalAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    userNameBox: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
      marginRight: 8,
      justifyContent: "center",
    },

    nameLine: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    name: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      fontWeight: "900",
    },

    trailingActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      flexShrink: 0,
    },

    iconBtn: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },

    manageArea: {
      paddingLeft: 52,
      paddingTop: 8,
    },

    rolesRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },

    roleChip: {
      paddingHorizontal: 9,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface2,
      borderWidth: 1,
      borderColor: theme.border,
    },

    roleChipActive: {
      backgroundColor: theme.tint,
      borderColor: theme.tint,
    },

    roleChipText: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "900",
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
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(245,158,11,0.12)",
      borderWidth: 1,
      borderColor: "rgba(245,158,11,0.28)",
    },

    kickText: {
      color: "#B45309",
      fontSize: 11,
      fontWeight: "900",
    },

    banBtn: {
      paddingHorizontal: 10,
      height: 28,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(239,68,68,0.12)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.28)",
    },

    banText: {
      color: "#DC2626",
      fontSize: 11,
      fontWeight: "900",
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