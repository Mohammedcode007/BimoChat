import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, View } from "react-native";

type BlockBannerProps = {
  isDark: boolean;
  blockedMe: boolean;
};

export default function BlockBanner({
  isDark,
  blockedMe,
}: BlockBannerProps) {
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 10,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: "rgba(239,68,68,0.08)",
        borderColor: "rgba(239,68,68,0.25)",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />

      <Text
        style={{
          flex: 1,
          fontWeight: "800",
          color: isDark ? "#E5E7EB" : "#111827",
        }}
      >
        {blockedMe
          ? "هذا الحساب قام بحظرك، لا يمكنك إرسال رسائل."
          : "لقد قمت بحظر هذا الحساب، قم بفك الحظر لإرسال رسائل."}
      </Text>
    </View>
  );
}