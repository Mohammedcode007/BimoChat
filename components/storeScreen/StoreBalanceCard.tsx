import { AppTheme } from "@/constants/theme";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { formatCoinz } from "./helpers";
import { styles } from "./styles";

type Props = {
  theme: AppTheme;
  balance: number;
  onPress?: () => void;
};

export default function StoreBalanceCard({ theme, balance, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.balanceCard,
        {
          backgroundColor: theme.primary,
        },
      ]}
    >
      <Text style={[styles.balanceValue, { color: theme.primaryText }]}>
        {formatCoinz(balance)} TCoins
      </Text>

      <Text style={[styles.balanceLabel, { color: `${theme.primaryText}DD` }]}>
        Current Balance
      </Text>
    </TouchableOpacity>
  );
}