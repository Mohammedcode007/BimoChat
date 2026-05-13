import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
  muted?: boolean;
  noBorder?: boolean;
  style?: ViewStyle;
};

export default function SettingsRow({
  title,
  subtitle,
  icon,
  rightIcon,
  onPress,
  switchValue,
  onSwitchChange,
  danger,
  muted,
  noBorder,
  style,
}: SettingsRowProps) {
  const hasSwitch = typeof switchValue === "boolean" && !!onSwitchChange;
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.row, noBorder && styles.noBorder, style]}
    >
      {!!icon && (
        <View style={styles.leftIconBox}>
          <Ionicons name={icon} size={18} color={danger ? "#DC2626" : "#444"} />
        </View>
      )}

      <View style={styles.textBox}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            danger && styles.dangerText,
            muted && styles.mutedText,
          ]}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            numberOfLines={2}
            style={[
              styles.subtitle,
              isArabicText(subtitle) && styles.rtlText,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightBox}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#2F3735", true: "#111827" }}
            thumbColor="#111"
            ios_backgroundColor="#2F3735"
            style={styles.switch}
          />
        ) : rightIcon ? (
          <Ionicons
            name={rightIcon}
            size={21}
            color={danger ? "#DC2626" : "#444"}
          />
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        ) : null}
      </View>
    </Wrapper>
  );
}

function isArabicText(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D5D5D5",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  leftIconBox: {
    width: 30,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  textBox: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 15.5,
    color: "#222",
    fontWeight: "400",
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#555",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  mutedText: {
    color: "#8B8B8B",
  },
  dangerText: {
    color: "#DC2626",
  },
  rightBox: {
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  switch: {
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
  },
});