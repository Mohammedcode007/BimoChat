// components/LottieBadge.tsx

import LottieView from "lottie-react-native";
import React from "react";
import { View } from "react-native";

export default function LottieBadge({ url, size = 60 }: { url: string; size?: number }) {
  if (!url) return null;

  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        source={{ uri: url }}
        autoPlay
        loop
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}