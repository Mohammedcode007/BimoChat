import Ionicons from "@expo/vector-icons/Ionicons";
import { City, Country } from "country-state-city";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type CountryPickerValue = {
  name: string;
  isoCode: string;
  flag?: string;
};

export type CityPickerValue = {
  name: string;
};

type Props = {
  visible: boolean;
  mode: "country" | "city";
  selectedCountryCode?: string;
  title?: string;
  onClose: () => void;
  onSelectCountry?: (country: CountryPickerValue) => void;
  onSelectCity?: (city: CityPickerValue) => void;
};

export default function CountryCityPickerModal({
  visible,
  mode,
  selectedCountryCode,
  title,
  onClose,
  onSelectCountry,
  onSelectCity,
}: Props) {
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (mode === "country") {
      const countries = Country.getAllCountries().map((item) => ({
        type: "country" as const,
        name: item.name,
        isoCode: item.isoCode,
        flag: item.flag,
      }));

      if (!q) return countries;

      return countries.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.isoCode.toLowerCase().includes(q)
        );
      });
    }

    const cities = City.getCitiesOfCountry(selectedCountryCode || "") || [];

    const mappedCities = cities.map((item, index) => ({
      type: "city" as const,
      id: `${item.name}-${index}`,
      name: item.name,
    }));

    if (!q) return mappedCities;

    return mappedCities.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [mode, search, selectedCountryCode]);

  function handleClose() {
    setSearch("");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name={mode === "country" ? "flag-outline" : "location-outline"}
                size={18}
                color="#111827"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {title || (mode === "country" ? "Select Country" : "Select City")}
              </Text>

              <Text style={styles.subtitle}>
                {mode === "country"
                  ? "Choose your country"
                  : selectedCountryCode
                  ? "Choose your city"
                  : "Choose country first"}
              </Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={mode === "country" ? "Search country" : "Search city"}
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />

            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {mode === "city" && !selectedCountryCode ? (
            <View style={styles.emptyBox}>
              <Ionicons name="flag-outline" size={44} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Choose country first</Text>
              <Text style={styles.emptyText}>
                Please select your country before selecting city.
              </Text>
            </View>
          ) : (
            <FlatList
              data={data as any[]}
              keyExtractor={(item, index) =>
                mode === "country"
                  ? String(item.isoCode)
                  : String(item.id || `${item.name}-${index}`)
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={44} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No results</Text>
                  <Text style={styles.emptyText}>Try another search.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isCountry = mode === "country";

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.itemRow}
                    onPress={() => {
                      if (isCountry) {
                        onSelectCountry?.({
                          name: item.name,
                          isoCode: item.isoCode,
                          flag: item.flag,
                        });
                      } else {
                        onSelectCity?.({
                          name: item.name,
                        });
                      }

                      setSearch("");
                    }}
                  >
                    <View style={styles.itemIcon}>
                      <Text style={styles.flagText}>
                        {isCountry ? item.flag || "🏳️" : "📍"}
                      </Text>
                    </View>

                    <View style={styles.itemTextBox}>
                      <Text numberOfLines={1} style={styles.itemTitle}>
                        {item.name}
                      </Text>

                      {isCountry && (
                        <Text style={styles.itemSub}>{item.isoCode}</Text>
                      )}
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    height: "82%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  itemRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  flagText: {
    fontSize: 21,
  },
  itemTextBox: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  itemSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  emptyText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
  },
});