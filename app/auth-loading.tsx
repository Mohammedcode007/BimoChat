import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

export default function AuthLoadingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const makeDotLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );

    makeDotLoop(dot1, 0).start();
    makeDotLoop(dot2, 180).start();
    makeDotLoop(dot3, 360).start();
  }, [scaleAnim, glowAnim, floatAnim, dot1, dot2, dot3]);

  const styles = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <View style={styles.heroWrap}>
          <Animated.View
            style={[
              styles.glowCircle,
              {
                opacity: glowAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.iconCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="chatbubbles-outline" size={34} color={theme.primary} />
          </Animated.View>
        </View>

        <Text style={styles.title}>جارٍ تسجيل الدخول</Text>

        <Text style={styles.subtitle}>
          يتم الدخول باستخدام البيانات المحفوظة
        </Text>

        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={theme.primary} />
          <View style={styles.dotsWrap}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </View>

        <View style={styles.bottomPill}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.primary} />
          <Text style={styles.bottomPillText}>يتم التحقق من الجلسة المحفوظة</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: theme.background,
    },

    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 30,
      paddingVertical: 30,
      paddingHorizontal: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface || theme.background,
      borderWidth: 1,
      borderColor: theme.border || (isDark ? "rgba(255,255,255,0.08)" : "#EAEAEA"),
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.24 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },

    heroWrap: {
      width: 110,
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    glowCircle: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.primary,
      opacity: 0.14,
    },

    iconCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: theme.cardAlt || theme.background,
      borderWidth: 1,
      borderColor: theme.border || (isDark ? "rgba(255,255,255,0.08)" : "#ECECEC"),
      alignItems: "center",
      justifyContent: "center",
    },

    title: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: "900",
      color: theme.text,
      textAlign: "center",
    },

    subtitle: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "600",
      color: theme.mutedText || theme.text,
      textAlign: "center",
      lineHeight: 23,
      paddingHorizontal: 10,
    },

    loaderRow: {
      marginTop: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    dotsWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: theme.primary,
    },

    bottomPill: {
      marginTop: 22,
      minHeight: 38,
      borderRadius: 20,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.cardAlt || theme.background,
      borderWidth: 1,
      borderColor: theme.border || (isDark ? "rgba(255,255,255,0.08)" : "#ECECEC"),
    },

    bottomPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.mutedText || theme.text,
      textAlign: "center",
    },
  });
}