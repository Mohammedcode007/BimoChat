import LottieView from "lottie-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

type Props = {
  item: any;
  size?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  fallbackText?: string;
};

function isLottieItem(item: any) {
  return Boolean(item?.meta?.isLottie && item?.meta?.lottieUrl);
}

function getItemLottieUrl(item: any): string {
  return String(item?.meta?.lottieUrl || "");
}

function getItemImageUrl(item: any): string {
  const direct =
    String(item?.iconUrl || "") ||
    String(item?.coverUrl || "") ||
    String(item?.previewUrl || "");

  if (direct) return direct;

  const meta = item?.meta || {};
  return (
    String(meta?.iconUrl || "") ||
    String(meta?.coverUrl || "") ||
    String(meta?.previewUrl || "")
  );
}

export default function StoreBadgePreview({
  item,
  size = 62,
  borderRadius = 18,
  backgroundColor = "#f3f4f6",
  borderColor = "#e5e7eb",
  fallbackText = "IMG",
}: Props) {
  const isLottie = isLottieItem(item);
  const lottieUrl = getItemLottieUrl(item);
  const imageUrl = getItemImageUrl(item);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {isLottie ? (
        <LottieView
          source={{ uri: lottieUrl }}
          autoPlay
          loop
          style={{ width: size - 8, height: size - 8 }}
        />
      ) : imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          resizeMode="cover"
          style={{
            width: size,
            height: size,
            borderRadius,
          }}
        />
      ) : (
        <Text style={{ fontWeight: "900", fontSize: 11, color: "#9ca3af" }}>
          {fallbackText}
        </Text>
      )}
    </View>
  );
}