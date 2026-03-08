// components/BoostLottieOverlay.tsx

import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onDone?: () => void;
  title?: string;
  subtitle?: string;
};

const { width, height } = Dimensions.get("window");

type Particle = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
};

export default function BoostLottieOverlay({
  visible,
  onDone,
  title = "🚀 Room Boosted!",
  subtitle = "Your room is now highlighted",
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: 20 + Math.random() * (width - 40),
        size: 10 + Math.random() * 16,
        delay: Math.floor(Math.random() * 500),
        duration: 1800 + Math.floor(Math.random() * 1200),
        drift: -40 + Math.random() * 80,
        rotate: -25 + Math.random() * 50,
      })),
    []
  );

  const particleAnims = useRef(
    particles.map(() => ({
      progress: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const stopAndUnloadSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}
  };

  const playRocketSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/rocket-launch.mp3"),
        { shouldPlay: true, volume: 1.0 }
      );

      soundRef.current = sound;
    } catch {}
  };

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    (async () => {
      try {
        Vibration.vibrate(120);
      } catch {}

      flashAnim.setValue(0);
      titleScale.setValue(0.8);
      titleOpacity.setValue(0);
      glowAnim.setValue(0.7);

      particleAnims.forEach((p) => {
        p.progress.setValue(0);
        p.opacity.setValue(0);
      });

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.9,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 260,
            delay: 120,
            useNativeDriver: true,
          }),
          Animated.spring(titleScale, {
            toValue: 1,
            friction: 6,
            tension: 70,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.7,
              duration: 700,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      particleAnims.forEach((anim, index) => {
        const p = particles[index];

        Animated.sequence([
          Animated.delay(p.delay),
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(anim.progress, {
              toValue: 1,
              duration: p.duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });

      await stopAndUnloadSound();
      if (isMounted) {
        await playRocketSound();
      }
    })();

    return () => {
      isMounted = false;
      stopAndUnloadSound();
    };
  }, [
    visible,
    flashAnim,
    glowAnim,
    particleAnims,
    particles,
    titleOpacity,
    titleScale,
  ]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.flash, { opacity: flashAnim }]} />

        {particleAnims.map((anim, index) => {
          const p = particles[index];

          const translateY = anim.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [height * 0.82, height * 0.12],
          });

          const translateX = anim.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, p.drift],
          });

          const scale = anim.progress.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0.6, 1.15, 0.9],
          });

          const rotate = anim.progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", `${p.rotate}deg`],
          });

          return (
            <Animated.View
              key={`spark-${p.id}`}
              style={[
                styles.particle,
                {
                  left: p.left,
                  opacity: anim.opacity,
                  transform: [{ translateY }, { translateX }, { scale }, { rotate }],
                },
              ]}
            >
              <Text style={{ fontSize: p.size }}>
                {index % 3 === 0 ? "✨" : index % 3 === 1 ? "⭐" : "💫"}
              </Text>
            </Animated.View>
          );
        })}

        <LottieView
          source={require("@/assets/lottie/rocket2.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
          resizeMode="cover"
          onAnimationFinish={async () => {
            await stopAndUnloadSound();
            onDone?.();
          }}
        />

        <Animated.View
          style={[
            styles.textWrap,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          <Animated.View style={[styles.glowPill, { opacity: glowAnim }]} />
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
  },

  flash: {
    position: "absolute",
    width,
    height,
    backgroundColor: "#FFFFFF",
  },

  lottie: {
    position: "absolute",
    width,
    height,
  },

  textWrap: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 95,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  glowPill: {
    position: "absolute",
    top: -8,
    width: 220,
    height: 80,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.6,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  particle: {
    position: "absolute",
    top: 0,
  },
});