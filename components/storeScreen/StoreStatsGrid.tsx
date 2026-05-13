import { AppTheme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, View } from "react-native";
import { formatCoinz } from "./helpers";
import { styles } from "./styles";
import { StoreStats } from "./types";

type Props = {
  theme: AppTheme;
  stats: StoreStats;
};

function StatBox({
  theme,
  value,
  label,
  icon,
}: {
  theme: AppTheme;
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={[
        styles.statBox,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.statValueRow}>
        {icon ? <Ionicons name={icon} size={23} color={theme.mutedText} /> : null}

        <Text numberOfLines={1} style={[styles.statValue, { color: theme.text }]}>
          {value}
        </Text>
      </View>

      <Text numberOfLines={1} style={[styles.statLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StoreStatsGrid({ theme, stats }: Props) {
  return (
    <View style={styles.statsGrid}>
      <StatBox
        theme={theme}
        value={`${formatCoinz(stats.monthReceivedCoinz)} TC`}
        label="Received"
      />

      <StatBox
        theme={theme}
        value={`${formatCoinz(stats.monthSpentCoinz)} TC`}
        label="Spent"
      />

      <StatBox
        theme={theme}
        icon="gift-outline"
        value={formatCoinz(stats.monthReceivedGifts)}
        label="Received"
      />

      <StatBox
        theme={theme}
        icon="gift-outline"
        value={formatCoinz(stats.monthSentGifts)}
        label="Sent"
      />
    </View>
  );
}