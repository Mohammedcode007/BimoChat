import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

type FieldErrors = {
  otp?: string;
  general?: string;
};

export default function VerifyResetCodeScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const copy = useMemo(
    () => ({
      title: "إدخال كود التحقق",
      subtitle: "أدخل كود OTP المرسل إلى بريدك الإلكتروني أو رقمك",
      otpPH: "أدخل الكود",
      verifyBtn: "تأكيد الكود",
      verifyingBtn: "جارٍ التحقق...",
      resendBtn: "إعادة إرسال الكود",
      resendingBtn: "جارٍ إعادة الإرسال...",
      loginBack: "العودة لتسجيل الدخول",
    }),
    []
  );

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputX = useSharedValue(-320);
  const buttonY = useSharedValue(50);
  const errorOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    inputX.value = withTiming(0, { duration: 700 });
    buttonY.value = withTiming(0, { duration: 700 });

    float1.value = withRepeat(withTiming(30, { duration: 8000 }), -1, true);
    float2.value = withRepeat(withTiming(-25, { duration: 10000 }), -1, true);
    float3.value = withRepeat(withTiming(20, { duration: 9000 }), -1, true);
    rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
  }, []);

  const triggerErrorAnim = () => {
    errorOpacity.value = withTiming(1, { duration: 200 });
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const clearErrors = () => {
    setErrors({});
    errorOpacity.value = withTiming(0, { duration: 150 });
  };

  const validate = (value: string): FieldErrors => {
    const next: FieldErrors = {};
    const clean = value.trim();

    if (!clean) {
      next.otp = "يرجى إدخال كود التحقق";
    } else if (!/^\d{4,8}$/.test(clean)) {
      next.otp = "كود التحقق يجب أن يكون أرقامًا فقط من 4 إلى 8 خانات";
    }

    return next;
  };

  const handleVerify = async () => {
    if (loading) return;

    const v = validate(otp);
    if (v.otp) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "تحقق من كود التحقق",
      });
      return;
    }

    setLoading(true);
    clearErrors();

    try {
      // اربط هنا API الحقيقي
      // مثال:
      // await api.post("/auth/verify-reset-code", { otp: otp.trim() });

      await new Promise((resolve) => setTimeout(resolve, 1200));

      Toast.show({
        type: "success",
        text1: "تم التحقق",
        text2: "يمكنك الآن تعيين كلمة مرور جديدة",
      });

      router.push("/(auth)/reset-password");
    } catch {
      setErrors({ general: "كود التحقق غير صحيح أو منتهي الصلاحية" });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "فشل التحقق",
        text2: "كود التحقق غير صحيح أو منتهي الصلاحية",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;

    setResending(true);
    clearErrors();

    try {
      // اربط هنا API إعادة الإرسال
      // مثال:
      // await api.post("/auth/resend-reset-code");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      Toast.show({
        type: "success",
        text1: "تم الإرسال",
        text2: "تمت إعادة إرسال كود التحقق",
      });
    } catch {
      setErrors({ general: "تعذر إعادة إرسال الكود" });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "تعذر إعادة إرسال الكود",
      });
    } finally {
      setResending(false);
    }
  };

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inputX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: loading ? 0.85 : 1,
  }));

  const errorAnimStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ translateX: shakeX.value }],
  }));

  const floating = (v: any, r = false) =>
    useAnimatedStyle(() => ({
      transform: [
        { translateY: v.value },
        ...(r ? [{ rotate: `${rotate.value}deg` }] : []),
      ],
    }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        <Animated.View style={[s.circle, s.blue, floating(float1)]} />
        <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
        <Animated.View style={[s.triangle, s.green, floating(float3)]} />
        <Animated.View style={[s.line, s.gray, floating(float1)]} />
        <Animated.View style={[s.circle, s.light, floating(float2)]} />

        <View style={s.content}>
          <Text style={s.title}>{copy.title}</Text>
          <Text style={s.subtitle}>{copy.subtitle}</Text>

          <Animated.View style={inputStyle}>
            <TextInput
              placeholder={copy.otpPH}
              placeholderTextColor={theme.subtleText as any}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^\d]/g, ""))}
              style={[s.input, !!errors.otp && s.inputError]}
              keyboardType="number-pad"
              editable={!loading && !resending}
              maxLength={8}
            />
            {!!errors.otp && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.otp}
              </Animated.Text>
            )}
          </Animated.View>

          {!!errors.general && (
            <Animated.Text style={[s.error, errorAnimStyle]}>
              {errors.general}
            </Animated.Text>
          )}

          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={[s.button, loading && { opacity: 0.8 }]}
              onPress={handleVerify}
              disabled={loading || resending}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={s.rowCenter}>
                  <ActivityIndicator />
                  <Text style={s.buttonText}>{copy.verifyingBtn}</Text>
                </View>
              ) : (
                <Text style={s.buttonText}>{copy.verifyBtn}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[s.secondaryButton, resending && { opacity: 0.8 }]}
            onPress={handleResend}
            disabled={resending || loading}
            activeOpacity={0.9}
          >
            {resending ? (
              <View style={s.rowCenter}>
                <ActivityIndicator />
                <Text style={s.secondaryButtonText}>{copy.resendingBtn}</Text>
              </View>
            ) : (
              <Text style={s.secondaryButtonText}>{copy.resendBtn}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => !loading && !resending && router.push("/(auth)/login")}
            disabled={loading || resending}
            activeOpacity={0.8}
          >
            <Text style={s.backText}>{copy.loginBack}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 26,
      zIndex: 10,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.mutedText,
      marginBottom: 40,
      lineHeight: 22,
    },
    input: {
      height: 54,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      fontSize: 18,
      letterSpacing: 4,
      marginBottom: 10,
      color: theme.text,
      textAlign: "center",
    },
    inputError: {
      borderBottomColor: theme.danger,
    },
    fieldError: {
      color: theme.danger,
      fontSize: 12,
      marginBottom: 10,
      fontWeight: "700",
    },
    button: {
      height: 54,
      backgroundColor: theme.primary,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    buttonText: {
      color: theme.primaryText,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: "transparent",
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
    },
    error: {
      color: theme.danger,
      fontSize: 13,
      marginBottom: 12,
      fontWeight: "800",
    },
    backText: {
      textAlign: "center",
      marginTop: 22,
      fontSize: 14,
      color: theme.tint,
      fontWeight: "800",
    },
    rowCenter: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    circle: { position: "absolute", borderRadius: 999 },
    square: { position: "absolute", borderRadius: 16 },
    triangle: {
      position: "absolute",
      width: 0,
      height: 0,
      borderLeftWidth: 30,
      borderRightWidth: 30,
      borderBottomWidth: 50,
      borderStyle: "solid",
      backgroundColor: "transparent",
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: isDark
        ? "rgba(34, 197, 94, 0.28)"
        : "#34D399",
      top: 120,
      right: 40,
      opacity: 0.4,
    },
    line: {
      position: "absolute",
      width: 140,
      height: 4,
      top: 200,
      left: 20,
      borderRadius: 2,
    },
    blue: {
      width: 220,
      height: 220,
      backgroundColor: isDark
        ? "rgba(96, 165, 250, 0.16)"
        : "#DBEAFE",
      top: -80,
      left: -100,
    },
    purple: {
      width: 160,
      height: 160,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.16)"
        : "#EDE9FE",
      bottom: 80,
      right: -60,
    },
    green: { opacity: 0.5 },
    gray: {
      backgroundColor: isDark
        ? "rgba(255,255,255,0.10)"
        : "#E5E7EB",
      opacity: 0.6,
    },
    light: {
      width: 120,
      height: 120,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.07)"
        : "#F1F5F9",
      bottom: -40,
      left: 40,
    },
  });
}