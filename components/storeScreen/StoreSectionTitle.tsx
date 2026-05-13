import { AppTheme } from "@/constants/theme";
import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  theme: AppTheme;
  title: string;
  subtitle?: string;
};

export default function StoreSectionTitle({ theme, title, subtitle }: Props) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.mutedText }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}