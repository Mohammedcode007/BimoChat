// // components/roomScreen/UsersModal.tsx

// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Image } from "expo-image";
// import React, { useMemo } from "react";
// import {
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { Colors } from "@/constants/theme";

// import {
//   canManageRoomUser,
//   getRoleColor,
//   isRoomManagerRole,
//   resolveAvatarSource,
//   sortUsersByRoleAndName,
// } from "./helpers";
// import { UserUI } from "./types";

// export default function UsersModal({
//   visible,
//   onClose,
//   users,
//   myUserId,
//   myRole,
//   onCopyUser,
//   onChangeRole,
//   onKickUser,
//   onBanUser,
//   onOpenGift,
//   onAvatarPress,
//   onStartChat,
//   theme,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   users: UserUI[];
//   myUserId: string;
//   myRole?: UserUI["role"];
//   onCopyUser: (u: UserUI) => void;
//   onChangeRole: (u: UserUI, newRole: UserUI["role"]) => void;
//   onKickUser: (u: UserUI) => void;
//   onBanUser: (u: UserUI) => void;
//   onOpenGift: (u: UserUI) => void;
//   onAvatarPress: (u: UserUI) => void;
//   onStartChat: (u: UserUI) => void;
//   theme: typeof Colors.light;
// }) {
//   const canManage = isRoomManagerRole(myRole);
//   const s = useMemo(() => makeUsersStyles(theme), [theme]);

//   const sortedUsers = useMemo(() => {
//     return sortUsersByRoleAndName(users || []);
//   }, [users]);

//   const RoleChip = ({
//     title,
//     active,
//     onPress,
//   }: {
//     title: string;
//     active: boolean;
//     onPress: () => void;
//   }) => (
//     <TouchableOpacity
//       onPress={onPress}
//       style={[s.roleChip, active && s.roleChipActive]}
//       activeOpacity={0.85}
//     >
//       <Text style={[s.roleChipText, active && s.roleChipTextActive]}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="none"
//       onRequestClose={onClose}
//     >
//       <Pressable style={s.overlay} onPress={onClose}>
//         <Pressable style={s.sheet} onPress={() => {}}>
//           <View style={s.header}>
//             <Text style={s.title}>Users</Text>

//             <TouchableOpacity
//               onPress={onClose}
//               activeOpacity={0.85}
//               style={s.closeBtn}
//             >
//               <Ionicons name="close" size={22} color={theme.text} />
//             </TouchableOpacity>
//           </View>

//           <View style={s.note}>
//             <Text style={s.noteText}>
//               اضغط على المستخدم لنسخ الاسم/المعرف.{" "}
//               {canManage
//                 ? "يمكنك تغيير الدور أو الطرد/الحظر من أزرار الإدارة."
//                 : "ليس لديك صلاحية لتغيير الأدوار."}
//             </Text>
//           </View>

//           <ScrollView
//             style={s.list}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={s.listContent}
//           >
//             {sortedUsers.map((u) => {
//               const isMe = String(u.id) === String(myUserId);
//               const canManageThisUser = canManageRoomUser({
//                 myRole,
//                 isMe,
//               });

//               return (
//                 <View key={u.id} style={s.userBlock}>
//                   <TouchableOpacity
//                     style={s.row}
//                     onPress={() => onCopyUser(u)}
//                     activeOpacity={0.88}
//                   >
//                     <TouchableOpacity
//                       activeOpacity={0.85}
//                       onPress={(e) => {
//                         e.stopPropagation?.();
//                         onAvatarPress(u);
//                       }}
//                       style={s.avatarBtn}
//                     >
//                       <Image
//                         source={resolveAvatarSource(u)}
//                         style={s.usersModalAvatar}
//                         contentFit="cover"
//                         cachePolicy="memory-disk"
//                         transition={0}
//                       />
//                     </TouchableOpacity>

//                     <View style={s.userNameBox}>
//                       <View style={s.nameLine}>
//                         <Text
//                           style={[
//                             s.name,
//                             {
//                               color: getRoleColor(u.role),
//                             },
//                           ]}
//                           numberOfLines={1}
//                           ellipsizeMode="tail"
//                         >
//                           {u.name} {isMe ? "(You)" : ""}
//                         </Text>

//                         {/* <CustomEmojiBadgeView badge={u.customEmojiBadge} /> */}
//                         {/* <DynamicUserBadge
//                           badge={pickPrimaryBadge(u.activeBadges)}
//                         /> */}
//                       </View>
//                     </View>

//                     {!isMe && (
//                       <View style={s.trailingActions}>
//                         <TouchableOpacity
//                           onPress={(e) => {
//                             e.stopPropagation?.();
//                             onClose();

//                             requestAnimationFrame(() => {
//                               onOpenGift(u);
//                             });
//                           }}
//                           activeOpacity={0.75}
//                           style={s.iconBtn}
//                         >
//                           <Ionicons
//                             name="gift-outline"
//                             size={21}
//                             color={theme.text}
//                           />
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           onPress={(e) => {
//                             e.stopPropagation?.();
//                             onStartChat(u);
//                           }}
//                           activeOpacity={0.75}
//                           style={s.iconBtn}
//                         >
//                           <Ionicons
//                             name="chatbubble-ellipses-outline"
//                             size={21}
//                             color={theme.text}
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </TouchableOpacity>

//                   {canManageThisUser && (
//                     <View style={s.manageArea}>
//                       <View style={s.rolesRow}>
//                         <RoleChip
//                           title="Member"
//                           active={(u.role || "member") === "member"}
//                           onPress={() => onChangeRole(u, "member")}
//                         />

//                         <RoleChip
//                           title="Admin"
//                           active={u.role === "admin"}
//                           onPress={() => onChangeRole(u, "admin")}
//                         />

//                         <RoleChip
//                           title="Owner"
//                           active={u.role === "owner"}
//                           onPress={() => onChangeRole(u, "owner")}
//                         />
//                       </View>

//                       <View style={s.actionsRow}>
//                         <TouchableOpacity
//                           onPress={() => onKickUser(u)}
//                           style={s.kickBtn}
//                           activeOpacity={0.85}
//                         >
//                           <Text style={s.kickText}>Kick</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                           onPress={() => onBanUser(u)}
//                           style={s.banBtn}
//                           activeOpacity={0.85}
//                         >
//                           <Text style={s.banText}>Ban</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   )}
//                 </View>
//               );
//             })}

//             {!sortedUsers.length && (
//               <View style={s.emptyBox}>
//                 <Ionicons
//                   name="people-outline"
//                   size={32}
//                   color={theme.mutedText}
//                 />

//                 <Text style={s.emptyText}>لا يوجد مستخدمون حاليًا.</Text>
//               </View>
//             )}
//           </ScrollView>
//         </Pressable>
//       </Pressable>
//     </Modal>
//   );
// }

// const makeUsersStyles = (theme: typeof Colors.light) =>
//   StyleSheet.create({
//     overlay: {
//       flex: 1,
//       backgroundColor: "rgba(0,0,0,0.35)",
//       justifyContent: "flex-end",
//     },

//     sheet: {
//       maxHeight: "82%",
//       backgroundColor: theme.card,
//       borderTopLeftRadius: 22,
//       borderTopRightRadius: 22,
//       paddingHorizontal: 14,
//       paddingTop: 12,
//       paddingBottom: 18,
//       borderTopWidth: 1,
//       borderColor: theme.border,
//     },

//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: 10,
//     },

//     title: {
//       color: theme.text,
//       fontSize: 18,
//       fontWeight: "900",
//     },

//     closeBtn: {
//       width: 38,
//       height: 38,
//       borderRadius: 14,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     note: {
//       borderRadius: 14,
//       paddingHorizontal: 12,
//       paddingVertical: 10,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//       marginBottom: 10,
//     },

//     noteText: {
//       color: theme.mutedText,
//       fontSize: 12,
//       fontWeight: "700",
//       lineHeight: 18,
//     },

//     list: {
//       width: "100%",
//     },

//     listContent: {
//       paddingBottom: 12,
//     },

//     userBlock: {
//       borderBottomWidth: 1,
//       borderBottomColor: theme.separator,
//       paddingVertical: 10,
//     },

//     row: {
//       flexDirection: "row",
//       alignItems: "center",
//       minHeight: 44,
//     },

//     avatarBtn: {
//       width: 42,
//       height: 42,
//       borderRadius: 21,
//       alignItems: "center",
//       justifyContent: "center",
//       flexShrink: 0,
//     },

//     usersModalAvatar: {
//       width: 42,
//       height: 42,
//       borderRadius: 21,
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     userNameBox: {
//       flex: 1,
//       minWidth: 0,
//       marginLeft: 10,
//       marginRight: 8,
//       justifyContent: "center",
//     },

//     nameLine: {
//       flexDirection: "row",
//       alignItems: "center",
//       minWidth: 0,
//     },

//     name: {
//       flex: 1,
//       minWidth: 0,
//       fontSize: 14,
//       fontWeight: "900",
//     },

//     trailingActions: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 12,
//       flexShrink: 0,
//     },

//     iconBtn: {
//       width: 28,
//       height: 28,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "transparent",
//       borderWidth: 0,
//       padding: 0,
//       margin: 0,
//     },

//     manageArea: {
//       paddingLeft: 52,
//       paddingTop: 8,
//     },

//     rolesRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       flexWrap: "wrap",
//       gap: 6,
//     },

//     roleChip: {
//       paddingHorizontal: 9,
//       height: 28,
//       borderRadius: 999,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: theme.surface2,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },

//     roleChipActive: {
//       backgroundColor: theme.tint,
//       borderColor: theme.tint,
//     },

//     roleChipText: {
//       color: theme.text,
//       fontSize: 11,
//       fontWeight: "900",
//     },

//     roleChipTextActive: {
//       color: "#FFFFFF",
//     },

//     actionsRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//       marginTop: 8,
//     },

//     kickBtn: {
//       paddingHorizontal: 10,
//       height: 28,
//       borderRadius: 999,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "rgba(245,158,11,0.12)",
//       borderWidth: 1,
//       borderColor: "rgba(245,158,11,0.28)",
//     },

//     kickText: {
//       color: "#B45309",
//       fontSize: 11,
//       fontWeight: "900",
//     },

//     banBtn: {
//       paddingHorizontal: 10,
//       height: 28,
//       borderRadius: 999,
//       alignItems: "center",
//       justifyContent: "center",
//       backgroundColor: "rgba(239,68,68,0.12)",
//       borderWidth: 1,
//       borderColor: "rgba(239,68,68,0.28)",
//     },

//     banText: {
//       color: "#DC2626",
//       fontSize: 11,
//       fontWeight: "900",
//     },

//     emptyBox: {
//       paddingVertical: 34,
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     emptyText: {
//       marginTop: 10,
//       color: theme.mutedText,
//       fontSize: 13,
//       fontWeight: "800",
//       textAlign: "center",
//     },
//   });
// components/roomScreen/UsersModal.tsx
// components/roomScreen/UsersModal.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
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
  isRoomManagerRole,
  resolveAvatarSource,
} from "./helpers";
import { UserUI } from "./types";

type RoleGroup = {
  key: "creator" | "owner" | "admin" | "member";
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  users: UserUI[];
};

const getSafeRole = (role?: UserUI["role"]) => {
  const r = String(role || "member");

  if (r === "creator") return "creator";
  if (r === "owner") return "owner";
  if (r === "admin") return "admin";

  return "member";
};

const getUserRoleColor = (role?: UserUI["role"]) => {
  const r = getSafeRole(role);

  if (r === "creator") return "#DC2626";
  if (r === "owner") return "#EF4444";
  if (r === "admin") return "#2563EB";

  return "#6B7280";
};

const getUserRoleLabel = (role?: UserUI["role"]) => {
  const r = getSafeRole(role);

  if (r === "creator") return "Creator";
  if (r === "owner") return "Owner";
  if (r === "admin") return "Admin";

  return "Member";
};

const sortInsideGroup = (a: UserUI, b: UserUI) => {
  return String(a.name || "").localeCompare(String(b.name || ""), "ar");
};

export default function UsersModal({
  visible,
  onClose,
  users,
  loading = false,
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
  loading?: boolean;
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

  const groups = useMemo<RoleGroup[]>(() => {
    const list = Array.isArray(users) ? users : [];

    const creators = list
      .filter((u) => getSafeRole(u.role) === "creator")
      .sort(sortInsideGroup);

    const owners = list
      .filter((u) => getSafeRole(u.role) === "owner")
      .sort(sortInsideGroup);

    const admins = list
      .filter((u) => getSafeRole(u.role) === "admin")
      .sort(sortInsideGroup);

    const members = list
      .filter((u) => getSafeRole(u.role) === "member")
      .sort(sortInsideGroup);

    return [
      {
        key: "creator",
        title: "Creator",
        icon: "diamond",
        color: "#DC2626",
        bg: "rgba(220,38,38,0.10)",
        users: creators,
      },
      {
        key: "owner",
        title: "Owners",
        icon: "shield-checkmark",
        color: "#EF4444",
        bg: "rgba(239,68,68,0.10)",
        users: owners,
      },
      {
        key: "admin",
        title: "Admins",
        icon: "star",
        color: "#2563EB",
        bg: "rgba(37,99,235,0.10)",
        users: admins,
      },
      {
        key: "member",
        title: "Members",
        icon: "people",
        color: theme.mutedText,
        bg: theme.surface2,
        users: members,
      },
    ];
  }, [users, theme.mutedText, theme.surface2]);

  const totalUsers = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.users.length, 0);
  }, [groups]);

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

  const renderUser = (u: UserUI) => {
    const isMe = String(u.id) === String(myUserId);
    const role = getSafeRole(u.role);
    const roleColor = getUserRoleColor(u.role);
    const roleLabel = getUserRoleLabel(u.role);

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
            style={[
              s.avatarBtn,
              {
                borderColor: roleColor,
                backgroundColor:
                  role === "member" ? theme.surface2 : `${roleColor}18`,
              },
            ]}
          >
            <Image
              source={resolveAvatarSource(u)}
              style={s.usersModalAvatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
            />

            <View
              style={[
                s.roleMiniBadge,
                {
                  backgroundColor: roleColor,
                  borderColor: theme.card,
                },
              ]}
            >
              <Ionicons
                name={
                  role === "creator"
                    ? "diamond"
                    : role === "owner"
                      ? "shield-checkmark"
                      : role === "admin"
                        ? "star"
                        : "person"
                }
                size={9}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          <View style={s.userNameBox}>
            <View style={s.nameLine}>
              <Text
                style={[
                  s.name,
                  {
                    color: roleColor,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {u.name} {isMe ? "(You)" : ""}
              </Text>
            </View>

            <View style={s.metaLine}>
              <View
                style={[
                  s.roleLabelPill,
                  {
                    backgroundColor:
                      role === "member" ? theme.surface2 : `${roleColor}14`,
                    borderColor:
                      role === "member" ? theme.border : `${roleColor}33`,
                  },
                ]}
              >
                <Text
                  style={[
                    s.roleLabelText,
                    {
                      color: roleColor,
                    },
                  ]}
                >
                  {roleLabel}
                </Text>
              </View>

              {!!u.isOnline && (
                <View style={s.onlinePill}>
                  <View style={s.onlineDot} />
                  <Text style={s.onlineText}>Online</Text>
                </View>
              )}
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
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />

          <View style={s.header}>
            <View style={s.headerTitleBox}>
              <View style={s.headerIcon}>
                <Ionicons name="people" size={19} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.title}>Users</Text>
                <Text style={s.subTitle}>
                  {loading ? "Loading users..." : `${totalUsers} members`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={s.closeBtn}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
          >
            {loading && (
              <View style={s.loadingBox}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={s.loadingText}>Loading users...</Text>
              </View>
            )}

            {!loading &&
              groups.map((group) => {
                if (!group.users.length) return null;

                return (
                  <View key={group.key} style={s.section}>
                    <View
                      style={[
                        s.sectionHeader,
                        {
                          backgroundColor: group.bg,
                          borderColor:
                            group.key === "member"
                              ? theme.border
                              : `${group.color}33`,
                        },
                      ]}
                    >
                      <View style={s.sectionTitleLeft}>
                        <Ionicons
                          name={group.icon}
                          size={15}
                          color={group.color}
                        />

                        <Text
                          style={[
                            s.sectionTitle,
                            {
                              color: group.color,
                            },
                          ]}
                        >
                          {group.title}
                        </Text>
                      </View>

                      <View
                        style={[
                          s.countPill,
                          {
                            backgroundColor:
                              group.key === "member"
                                ? theme.card
                                : `${group.color}16`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.countText,
                            {
                              color: group.color,
                            },
                          ]}
                        >
                          {group.users.length}
                        </Text>
                      </View>
                    </View>

                    <View style={s.sectionBody}>
                      {group.users.map((u) => renderUser(u))}
                    </View>
                  </View>
                );
              })}

            {!loading && !totalUsers && (
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
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },

    sheet: {
      maxHeight: "86%",
      backgroundColor: theme.card,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 14,
      paddingTop: 8,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderColor: theme.border,
    },

    handle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.border,
      alignSelf: "center",
      marginBottom: 12,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    headerTitleBox: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },

    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      marginRight: 10,
    },

    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
    },

    subTitle: {
      marginTop: 2,
      color: theme.mutedText,
      fontSize: 12,
      fontWeight: "700",
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
      marginLeft: 10,
    },

    list: {
      width: "100%",
    },

    listContent: {
      paddingBottom: 14,
    },

    loadingBox: {
      minHeight: 150,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },

    loadingText: {
      marginTop: 10,
      color: theme.mutedText,
      fontSize: 13,
      fontWeight: "800",
    },

    section: {
      marginBottom: 12,
    },

    sectionHeader: {
      height: 38,
      borderRadius: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    sectionTitleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: "900",
      letterSpacing: 0.2,
    },

    countPill: {
      minWidth: 28,
      height: 22,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    countText: {
      fontSize: 11,
      fontWeight: "900",
    },

    sectionBody: {
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },

    userBlock: {
      borderBottomWidth: 1,
      borderBottomColor: theme.separator,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 48,
    },

    avatarBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderWidth: 2,
      position: "relative",
    },

    usersModalAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface2,
    },

    roleMiniBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      width: 17,
      height: 17,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
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

    metaLine: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    roleLabelPill: {
      height: 22,
      borderRadius: 999,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    roleLabelText: {
      fontSize: 10,
      fontWeight: "900",
    },

    onlinePill: {
      height: 22,
      borderRadius: 999,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      backgroundColor: "rgba(34,197,94,0.12)",
    },

    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#22C55E",
      marginRight: 5,
    },

    onlineText: {
      color: "#16A34A",
      fontSize: 10,
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
      paddingLeft: 56,
      paddingTop: 9,
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
      backgroundColor: theme.primary,
      borderColor: theme.primary,
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