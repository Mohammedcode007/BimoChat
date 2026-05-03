import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export function Action({
  icon,
  value,
  onPress,
  loading,
  s,
  color,
  textColor,
}: {
  icon: any;
  value: number | string;
  onPress?: () => void;
  loading?: boolean;
  s: any;
  color?: string;
  textColor?: string;
}) {
  const finalIconColor = color || s._iconColor;
  const finalTextColor = textColor || s.actionValue.color;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.actionItem}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={finalIconColor} />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={finalIconColor} />

          <Text style={[s.actionValue, { color: finalTextColor }]}>
            {value}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function TabButton({
  title,
  active,
  onPress,
  s,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  s: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={s.tabBtn}
    >
      <Text style={[s.tabText, active && s.tabTextActive]}>
        {title}
      </Text>

      <View style={[s.tabIndicator, active && s.tabIndicatorActive]} />
    </TouchableOpacity>
  );
}