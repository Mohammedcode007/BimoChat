import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { formatTime } from "@/utils/helpFunctions";
import { styles } from "./styles";
import { SearchResultItem } from "./types";

type SearchResultsCardProps = {
  visible: boolean;
  isDark: boolean;
  searchLoading: boolean;
  searchResults: SearchResultItem[];
  inputSearchValue: string;
  selectedSearchMessageId: string | null;
  onPressResult: (item: SearchResultItem, index: number) => void | Promise<void>;
};

export default function SearchResultsCard({
  visible,
  isDark,
  searchLoading,
  searchResults,
  inputSearchValue,
  selectedSearchMessageId,
  onPressResult,
}: SearchResultsCardProps) {
  if (!visible) return null;

  const renderSearchResultSnippet = (textValue: string, q: string) => {
    const text = String(textValue || "");
    const query = String(q || "").trim();

    if (!query) {
      return (
        <Text
          numberOfLines={1}
          style={{
            color: isDark ? "#CBD5E1" : "#374151",
            fontSize: 13,
          }}
        >
          {text}
        </Text>
      );
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));

    return (
      <Text
        numberOfLines={1}
        style={{
          color: isDark ? "#CBD5E1" : "#374151",
          fontSize: 13,
        }}
      >
        {parts.map((part, index) => {
          const matched = part.toLowerCase() === query.toLowerCase();

          return matched ? (
            <Text key={`${part}-${index}`} style={styles.searchResultHighlight}>
              {part}
            </Text>
          ) : (
            <Text key={`${part}-${index}`}>{part}</Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.searchResultsCard,
        {
          backgroundColor: isDark ? "#0F172A" : "#FFF",
          borderColor: isDark ? "#111827" : "#E5E7EB",
        },
      ]}
    >
      {searchLoading ? (
        <View style={styles.searchLoadingBox}>
          <ActivityIndicator size="small" color="#6D5DF6" />

          <Text
            style={{
              marginTop: 8,
              color: isDark ? "#CBD5E1" : "#374151",
              fontSize: 13,
            }}
          >
            جاري البحث...
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults.slice(0, 8)}
          keyExtractor={(item) => item._id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const active = selectedSearchMessageId === item._id;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPressResult(item, index)}
                style={[
                  styles.searchResultItem,
                  active && {
                    backgroundColor: isDark
                      ? "rgba(109,93,246,0.16)"
                      : "rgba(109,93,246,0.08)",
                  },
                ]}
              >
                <View style={styles.searchResultLeft}>
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </View>

                <View style={styles.searchResultBody}>
                  {renderSearchResultSnippet(item.content, inputSearchValue)}

                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 4,
                      color: isDark ? "#94A3B8" : "#6B7280",
                      fontSize: 11,
                    }}
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}