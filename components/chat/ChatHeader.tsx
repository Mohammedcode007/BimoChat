import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { formatLastSeen } from "@/utils/helpFunctions";
import { styles } from "./styles";

type ChatHeaderProps = {
  isDark: boolean;
  otherUser: any;
  typingUsers: any[];
  blockedByMe: boolean;
  blockedMe: boolean;
  onBack: () => void;
  onSearchPress: () => void;
  onMenuPress: () => void;
  onProfilePress: () => void;
};

export default function ChatHeader({
  isDark,
  otherUser,
  typingUsers,
  blockedByMe,
  blockedMe,
  onBack,
  onSearchPress,
  onMenuPress,
  onProfilePress,
}: ChatHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFF",
          borderColor: isDark ? "#111827" : "#E5E7EB",
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onProfilePress}
          disabled={!otherUser?._id}
        >
          {otherUser?.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={18} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onProfilePress}
          disabled={!otherUser?._id}
          style={styles.userInfo}
        >
          <Text
            style={[
              styles.username,
              { color: isDark ? "#E5E7EB" : "#111827" },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {otherUser?.username || "User"}
          </Text>

          {!!typingUsers?.length ? (
            <Text
              style={[
                styles.typing,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Typing...
            </Text>
          ) : blockedByMe ? (
            <Text
              style={[styles.lastSeen, { color: "#EF4444" }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              تم حظر هذا الحساب
            </Text>
          ) : blockedMe ? (
            <Text
              style={[styles.lastSeen, { color: "#EF4444" }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              هذا الحساب حظرك
            </Text>
          ) : otherUser?.isOnline ? (
            <Text
              style={styles.onlineText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Online
            </Text>
          ) : otherUser?.lastSeen ? (
            <Text
              style={[
                styles.lastSeen,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Last seen {formatLastSeen(otherUser.lastSeen)}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
          <Ionicons
            name="search-outline"
            size={21}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={isDark ? "#E5E7EB" : "#111827"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}