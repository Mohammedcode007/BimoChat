// components/roomScreen/UploadingOverlay.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React from "react";
import {
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { UploadKind } from "./types";

export default function UploadingOverlay({
  visible,
  title,
  sub,
  seconds,
  previewUri,
  kind,
  theme,
}: {
  visible: boolean;
  title: string;
  sub?: string;
  seconds: number;
  previewUri?: string;
  kind?: UploadKind;
  theme: typeof Colors.light;
}) {
  if (!visible) return null;

  const label =
    kind === "gif" ? "GIF" : kind === "sticker" ? "Sticker" : "Image";

  const iconName =
    kind === "gif"
      ? "film-outline"
      : kind === "sticker"
        ? "happy-outline"
        : "image-outline";

  return (
    <View
      pointerEvents="auto"
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.34)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 320,
          borderRadius: 24,
          padding: 16,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: "center",
        }}
      >
        {!!previewUri ? (
          <View
            style={{
              width: 128,
              height: 128,
              borderRadius: 22,
              overflow: "hidden",
              backgroundColor: theme.surface2,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{ uri: previewUri }}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit={kind === "image" ? "cover" : "contain"}
              cachePolicy="memory-disk"
              transition={0}
            />
          </View>
        ) : (
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: 24,
              backgroundColor: theme.surface2,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons
              name={iconName}
              size={34}
              color={theme.text}
            />
          </View>
        )}

        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.mutedText,
            fontSize: 12,
            fontWeight: "800",
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {sub || `Uploading ${label}...`}
        </Text>

        <Text
          style={{
            color: theme.tint,
            fontSize: 13,
            fontWeight: "900",
            marginTop: 10,
          }}
        >
          {seconds} ثانية
        </Text>

        <View
          style={{
            width: "100%",
            height: 5,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: theme.surface2,
            marginTop: 14,
          }}
        >
          <Animated.View
            style={{
              width: "55%",
              height: "100%",
              borderRadius: 999,
              backgroundColor: theme.tint,
            }}
          />
        </View>
      </View>
    </View>
  );
}