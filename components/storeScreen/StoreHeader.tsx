import { AppTheme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  theme: AppTheme;
  title?: string;
  avatar?: string;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
};

export default function StoreHeader({
  theme,
  title = "Store",
  avatar,
  onNotificationsPress,
  onMenuPress,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.avatarWrap, { backgroundColor: theme.surface2 }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={22} color={theme.subtleText} />
          )}
        </View>

        <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onNotificationsPress} style={styles.headerIconBtn}>
          <Ionicons name="notifications" size={23} color={theme.mutedText} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onMenuPress} style={styles.headerIconBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={theme.mutedText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}