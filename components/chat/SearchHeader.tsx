import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";

type SearchHeaderProps = {
  isDark: boolean;

  inputSearchValue: string;
  searchLoading: boolean;
  searchResultsLength: number;
  selectedSearchIndex: number;

  onClose: () => void;
  onChangeText: (value: string) => void;
  onClear: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function SearchHeader({
  isDark,
  inputSearchValue,
  searchLoading,
  searchResultsLength,
  selectedSearchIndex,
  onClose,
  onChangeText,
  onClear,
  onPrev,
  onNext,
}: SearchHeaderProps) {
  const hasResults = searchResultsLength > 0;

  return (
    <View
      style={[
        styles.searchHeader,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFF",
          borderColor: isDark ? "#111827" : "#E5E7EB",
        },
      ]}
    >
      <TouchableOpacity style={styles.searchBackBtn} onPress={onClose}>
        <Ionicons
          name="arrow-back"
          size={22}
          color={isDark ? "#E5E7EB" : "#111827"}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.searchInputWrap,
          {
            backgroundColor: isDark ? "#111827" : "#F3F4F6",
            borderColor: isDark ? "#1F2937" : "#E5E7EB",
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />

        <TextInput
          autoFocus
          value={inputSearchValue}
          onChangeText={onChangeText}
          placeholder="ابحث داخل المحادثة"
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          style={[
            styles.searchInput,
            { color: isDark ? "#E5E7EB" : "#111827" },
          ]}
          returnKeyType="search"
        />

        {!!inputSearchValue.trim() && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchNav}>
        <Text
          style={[
            styles.searchCounter,
            { color: isDark ? "#CBD5E1" : "#374151" },
          ]}
        >
          {searchLoading
            ? "..."
            : hasResults
              ? `${selectedSearchIndex + 1}/${searchResultsLength}`
              : "0/0"}
        </Text>

        <TouchableOpacity
          style={styles.searchNavBtn}
          onPress={onPrev}
          disabled={!hasResults}
          activeOpacity={0.75}
        >
          <Ionicons
            name="chevron-up"
            size={20}
            color={
              hasResults
                ? isDark
                  ? "#E5E7EB"
                  : "#111827"
                : "#9CA3AF"
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchNavBtn}
          onPress={onNext}
          disabled={!hasResults}
          activeOpacity={0.75}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={
              hasResults
                ? isDark
                  ? "#E5E7EB"
                  : "#111827"
                : "#9CA3AF"
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}