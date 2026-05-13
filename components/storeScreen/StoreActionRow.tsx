import { AppTheme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getStoreToneColors } from "./helpers";
import { styles } from "./styles";
import { StoreActionItem } from "./types";

type Props = {
  theme: AppTheme;
  item: StoreActionItem;
  loading?: boolean;
};

export default function StoreActionRow({ theme, item, loading }: Props) {
  const tone = getStoreToneColors(theme, item.tone || "neutral");

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={item.onPress}
      style={[
        styles.actionRowCard,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.actionLeft}>
        <Ionicons
          name={item.icon}
          size={25}
          color={item.danger ? theme.danger : tone.fg}
        />

        <View style={styles.actionTextWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.actionTitle,
              {
                color: item.danger ? theme.danger : theme.text,
              },
            ]}
          >
            {item.title}
          </Text>

          {!!item.subtitle && (
            <Text numberOfLines={1} style={[styles.actionSub, { color: theme.mutedText }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : item.value ? (
        <Text numberOfLines={1} style={[styles.actionValue, { color: theme.text }]}>
          {item.value}
        </Text>
      ) : item.danger ? (
        <Ionicons name="trash" size={23} color={theme.danger} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.subtleText} />
      )}
    </TouchableOpacity>
  );
}