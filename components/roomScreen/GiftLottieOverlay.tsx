// components/roomScreen/GiftLottieOverlay.tsx

import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Text,
    View,
} from "react-native";

export default function GiftLottieOverlay({
  visible,
  source,
  fromName,
  toName,
  durationMs = 2600,
  onDone,
}: {
  visible: boolean;
  source?: any;
  fromName?: string;
  toName?: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(1);
    scale.setValue(1);

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }, Math.max(500, durationMs - 400));

    const doneTimer = setTimeout(() => {
      onDone();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, durationMs, onDone, opacity, scale]);

  if (!visible || !source) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -90,
            left: -120,
            right: -120,
            alignItems: "center",
          }}
        >
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontWeight: "900",
                fontSize: 14,
              }}
              numberOfLines={1}
            >
              {fromName ? `${fromName} → ` : ""}
              {toName || "Someone"}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 260,
            height: 260,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LottieView
            source={source}
            autoPlay
            loop
            style={{
              width: 260,
              height: 260,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}