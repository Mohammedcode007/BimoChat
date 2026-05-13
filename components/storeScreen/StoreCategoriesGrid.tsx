import { AppTheme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getCategoryVisual, getStoreToneColors } from "./helpers";
import { styles } from "./styles";
import { CategoryCard, StoreType } from "./types";

type Props = {
  theme: AppTheme;
  categories: CategoryCard[];
  onPressCategory: (type: StoreType) => void;
};

export default function StoreCategoriesGrid({
  theme,
  categories,
  onPressCategory,
}: Props) {
  return (
    <View style={styles.categoriesGrid}>
      {categories.map((item) => {
        const visual = getCategoryVisual(item.key);
        const tone = getStoreToneColors(theme, visual.tone);

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.9}
            onPress={() => onPressCategory(item.key)}
            style={[
              styles.categoryCard,
              {
                backgroundColor: theme.surface2,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: tone.soft }]}>
              <Ionicons name={visual.icon} size={22} color={tone.fg} />
            </View>

            <Text numberOfLines={1} style={[styles.categoryTitle, { color: theme.text }]}>
              {item.title}
            </Text>

            <Text numberOfLines={1} style={[styles.categorySub, { color: theme.mutedText }]}>
              {item.subtitle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}