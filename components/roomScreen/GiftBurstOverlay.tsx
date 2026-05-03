// components/roomScreen/GiftBurstOverlay.tsx

import React, { useEffect, useRef } from "react";
import {
    Animated,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

export default function GiftBurstOverlay({
  visible,
  icon,
  count = 45,
  fromName,
  toName,
  durationMs = 2600,
  onDone,
}: {
  visible: boolean;
  icon: string;
  count?: number;
  fromName?: string;
  toName?: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const { width, height } = useWindowDimensions();

  const opacity = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({
      length: Math.max(12, Math.min(count, 90)),
    }).map(() => ({
      x: Math.random(),
      delay: Math.floor(Math.random() * 260),
      dur: 1400 + Math.floor(Math.random() * 900),
      startY: 0.25 + Math.random() * 0.6,
      endY: 0.05 + Math.random() * 0.25,
      size: 18 + Math.floor(Math.random() * 18),
      spin: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 25),
      t: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    opacity.setValue(1);

    particles.forEach((particle) => {
      particle.t.setValue(0);
    });

    const animations = particles.map((particle) =>
      Animated.timing(particle.t, {
        toValue: 1,
        duration: particle.dur,
        delay: particle.delay,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();

    const fadeOutAt = Math.max(500, durationMs - 450);

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }, fadeOutAt);

    const doneTimer = setTimeout(() => {
      onDone();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, durationMs, onDone, opacity, particles]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
      }}
    >
      <Animated.View
        style={{
          opacity,
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 70,
            left: 16,
            right: 16,
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
              {toName ? toName : "Someone"}
            </Text>
          </View>
        </View>

        {particles.map((particle, index) => {
          const xPx = 12 + particle.x * Math.max(1, width - 24);
          const startY = height * particle.startY;
          const endY = height * particle.endY;

          const translateY = particle.t.interpolate({
            inputRange: [0, 1],
            outputRange: [startY, endY],
          });

          const scale = particle.t.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0.7, 1.1, 0.95],
          });

          const rotate = particle.t.interpolate({
            inputRange: [0, 1],
            outputRange: [`${-particle.spin}deg`, `${particle.spin}deg`],
          });

          const particleOpacity = particle.t.interpolate({
            inputRange: [0, 0.15, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          });

          return (
            <Animated.View
              key={`${index}-${particle.delay}-${particle.dur}`}
              style={{
                position: "absolute",
                left: xPx,
                transform: [
                  { translateY },
                  { scale },
                  { rotate },
                ],
                opacity: particleOpacity,
              }}
            >
              <Text
                style={{
                  fontSize: particle.size,
                  color: "#FFF",
                }}
              >
                {icon || "🎁"}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}