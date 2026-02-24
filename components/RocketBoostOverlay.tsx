import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, useWindowDimensions, View } from "react-native";

type Props = {
  visible: boolean;
  onDone: () => void;
  durationMs?: number;
  size?: number;
};

export function RocketBoostOverlay({
  visible,
  onDone,
  durationMs = 2800,
  size = 86,
}: Props) {
  const { height } = useWindowDimensions();

  // 0 -> 1: مسار الإقلاع
  const t = useRef(new Animated.Value(0)).current;

  // اهتزاز
  const shake = useRef(new Animated.Value(0)).current;

  // دخان: نكرر 4 نفثات
  const smoke = useMemo(
    () =>
      Array.from({ length: 4 }).map(() => ({
        p: new Animated.Value(0),
      })),
    []
  );

  useEffect(() => {
    if (!visible) return;

    // reset
    t.setValue(0);
    shake.setValue(0);
    smoke.forEach((s) => s.p.setValue(0));

    // مسار الإقلاع: بطيء ثم سريع (ease-in)
    const fly = Animated.sequence([
      Animated.timing(t, {
        toValue: 0.35,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(t, {
        toValue: 1,
        duration: 1200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    // اهتزاز: خفيف ثم قوي
    const gentle = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 0.35, duration: 90, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.35, duration: 90, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]),
      { iterations: 7 }
    );

    const strong = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]),
      { iterations: 18 }
    );

    // دخان: 4 نفثات بفواصل
    const smokeAnim = Animated.stagger(
      170,
      smoke.map((s) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(s.p, { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(s.p, { toValue: 0, duration: 10, useNativeDriver: true }),
          ]),
          { iterations: 6 }
        )
      )
    );

    gentle.start();
    smokeAnim.start();
    fly.start();

    const strongTimer = setTimeout(() => {
      gentle.stop();
      strong.start();
    }, 1100);

    const doneTimer = setTimeout(() => {
      strong.stop();
      gentle.stop();
      onDone();
    }, durationMs);

    return () => {
      clearTimeout(strongTimer);
      clearTimeout(doneTimer);
      strong.stop();
      gentle.stop();
      // لا حاجة لإيقاف smokeAnim رسميًا لأنه loops؛ إعادة visible ستعمل reset
    };
  }, [visible, durationMs, onDone, shake, smoke, t]);

  if (!visible) return null;

  // ✅ مسافة صعود كبيرة وواضحة
  const translateY = t.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, -height * 0.18, -height * 0.88],
  });

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-7, 7],
  });

  const rotate = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-3deg", "3deg"],
  });

  const scale = t.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.06],
  });

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 9999,
        elevation: 9999,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 40,
      }}
    >
      <Animated.View style={{ transform: [{ translateY }, { translateX }, { rotate }, { scale }] }}>
        {/* 🔥 دخان تحت الصاروخ */}
        <View style={{ alignItems: "center", marginBottom: 6 }}>
          {smoke.map((s, i) => {
            const rise = s.p.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -18],
            });
            const spread = s.p.interpolate({
              inputRange: [0, 1],
              outputRange: [0, (i - 1.5) * 10],
            });
            const smokeScale = s.p.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1.35],
            });
            const smokeOpacity = s.p.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 0.45, 0],
            });

            return (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: "rgba(0,0,0,0.20)",
                  opacity: smokeOpacity,
                  transform: [{ translateY: rise }, { translateX: spread }, { scale: smokeScale }],
                }}
              />
            );
          })}
        </View>

        {/* 🚀 الصاروخ */}
        <Text style={{ fontSize: size }}>🚀</Text>
      </Animated.View>
    </View>
  );
}