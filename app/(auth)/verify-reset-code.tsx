
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  clearError,
  forgotPassword,
  verifyResetOtp,
} from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useDispatch, useSelector } from "react-redux";

type FieldErrors = {
  otp?: string;
  general?: string;
};

const OTP_EXPIRE_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyResetCodeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string }>();

  const emailFromParams =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";

  const { verifyOtpLoading, forgotPasswordLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const { colorScheme } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [otpRemaining, setOtpRemaining] = useState(OTP_EXPIRE_SECONDS);
  const [resendRemaining, setResendRemaining] = useState(RESEND_COOLDOWN_SECONDS);

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

  useEffect(() => {
    if (error) {
      setErrors((prev) => ({ ...prev, general: error }));
      triggerErrorAnim();
    }
  }, [error]);

  useEffect(() => {
    if (otpRemaining <= 0) return;

    const timer = setInterval(() => {
      setOtpRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpRemaining]);

  useEffect(() => {
    if (resendRemaining <= 0) return;

    const timer = setInterval(() => {
      setResendRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendRemaining]);

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
    dispatch(clearError());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const validate = (value: string): FieldErrors => {
    const next: FieldErrors = {};
    const clean = value.trim();

    if (!clean) {
      next.otp = t("verifyResetCodeScreen.errors.otpRequired");
    } else if (!/^\d{4,8}$/.test(clean)) {
      next.otp = t("verifyResetCodeScreen.errors.otpInvalid");
    }

    return next;
  };

  const handleVerify = async () => {
    if (verifyOtpLoading || forgotPasswordLoading) return;

    if (!emailFromParams) {
      setErrors({ general: t("verifyResetCodeScreen.errors.missingEmail") });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("verifyResetCodeScreen.errors.missingEmail"),
      });
      return;
    }

    if (otpRemaining <= 0) {
      setErrors({ general: t("verifyResetCodeScreen.errors.otpExpired") });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("verifyResetCodeScreen.toasts.expiredTitle"),
        text2: t("verifyResetCodeScreen.errors.otpExpired"),
      });
      return;
    }

    const v = validate(otp);
    if (v.otp) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("verifyResetCodeScreen.toasts.checkOtp"),
      });
      return;
    }

    clearErrors();

    try {
      const resultAction = await dispatch(
        verifyResetOtp({
          email: emailFromParams,
          otp: otp.trim(),
        })
      );

      if (verifyResetOtp.fulfilled.match(resultAction)) {
        Toast.show({
          type: "success",
          text1: t("verifyResetCodeScreen.toasts.verifiedTitle"),
          text2: t("verifyResetCodeScreen.toasts.verifiedMessage"),
        });

        router.push({
          pathname: "/(auth)/reset-password",
          params: {
            email: emailFromParams,
            otp: otp.trim(),
          },
        });
      } else {
        const msg =
          (resultAction.payload as string) ||
          t("verifyResetCodeScreen.errors.verifyFailed");

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: t("verifyResetCodeScreen.toasts.verifyFailedTitle"),
          text2: msg,
        });
      }
    } catch {
      setErrors({ general: t("verifyResetCodeScreen.errors.verifyFailed") });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: t("verifyResetCodeScreen.toasts.verifyFailedTitle"),
        text2: t("verifyResetCodeScreen.errors.verifyFailed"),
      });
    }
  };

  const handleResend = async () => {
    if (forgotPasswordLoading || verifyOtpLoading) return;

    if (resendRemaining > 0) {
      Toast.show({
        type: "info",
        text1: t("verifyResetCodeScreen.toasts.waitTitle"),
        text2: t("verifyResetCodeScreen.toasts.resendAfter", {
          seconds: resendRemaining,
        }),
      });
      return;
    }

    if (!emailFromParams) {
      setErrors({ general: t("verifyResetCodeScreen.errors.missingEmail") });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("verifyResetCodeScreen.errors.missingEmail"),
      });
      return;
    }

    clearErrors();

    try {
      const resultAction = await dispatch(
        forgotPassword({ email: emailFromParams })
      );

      if (forgotPassword.fulfilled.match(resultAction)) {
        setOtpRemaining(OTP_EXPIRE_SECONDS);
        setResendRemaining(RESEND_COOLDOWN_SECONDS);
        setOtp("");

        Toast.show({
          type: "success",
          text1: t("verifyResetCodeScreen.toasts.sentTitle"),
          text2: t("verifyResetCodeScreen.toasts.resentMessage"),
        });
      } else {
        const msg =
          (resultAction.payload as string) ||
          t("verifyResetCodeScreen.errors.resendFailed");

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: msg,
        });
      }
    } catch {
      setErrors({ general: t("verifyResetCodeScreen.errors.resendFailed") });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("verifyResetCodeScreen.errors.resendFailed"),
      });
    }
  };

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inputX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: verifyOtpLoading ? 0.85 : 1,
  }));

  const errorAnimStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ translateX: shakeX.value }],
  }));

  const floating1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }],
  }));

  const floating2RotateStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float2.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const floating3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }],
  }));

  const floating2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }],
  }));
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
           <Animated.View style={[s.circle, s.blue, floating1Style]} />
        <Animated.View style={[s.square, s.purple, floating2RotateStyle]} />
        <Animated.View style={[s.triangle, s.green, floating3Style]} />
        <Animated.View style={[s.line, s.gray, floating1Style]} />
        <Animated.View style={[s.circle, s.light, floating2Style]} />

        <View style={s.content}>
          <Text style={s.title}>{t("verifyResetCodeScreen.title")}</Text>
          <Text style={s.subtitle}>{t("verifyResetCodeScreen.subtitle")}</Text>

          {!!emailFromParams && <Text style={s.emailHint}>{emailFromParams}</Text>}

          <View style={s.timersBox}>
            <View style={s.timerItem}>
              <Text style={s.timerLabel}>
                {t("verifyResetCodeScreen.codeValidity")}
              </Text>
              <Text
                style={[
                  s.timerValue,
                  otpRemaining <= 60 && { color: theme.danger },
                ]}
              >
                {formatTime(otpRemaining)}
              </Text>
            </View>

            <View style={s.timerDivider} />

            <View style={s.timerItem}>
              <Text style={s.timerLabel}>
                {t("verifyResetCodeScreen.resendLabel")}
              </Text>
              <Text
                style={[
                  s.timerValue,
                  resendRemaining === 0 && { color: theme.tint },
                ]}
              >
                {resendRemaining > 0
                  ? t("verifyResetCodeScreen.secondsShort", {
                      seconds: resendRemaining,
                    })
                  : t("verifyResetCodeScreen.availableNow")}
              </Text>
            </View>
          </View>

          <Animated.View style={inputStyle}>
            <TextInput
              placeholder={t("verifyResetCodeScreen.otpPH")}
              placeholderTextColor={theme.subtleText as any}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^\d]/g, ""));
                if (errors.otp || errors.general || error) {
                  clearErrors();
                }
              }}
              style={[s.input, !!errors.otp && s.inputError]}
              keyboardType="number-pad"
              editable={!verifyOtpLoading && !forgotPasswordLoading && otpRemaining > 0}
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
              style={[
                s.button,
                (verifyOtpLoading || otpRemaining <= 0) && { opacity: 0.8 },
              ]}
              onPress={handleVerify}
              disabled={verifyOtpLoading || forgotPasswordLoading || otpRemaining <= 0}
              activeOpacity={0.9}
            >
              {verifyOtpLoading ? (
                <View style={s.rowCenter}>
                  <ActivityIndicator />
                  <Text style={s.buttonText}>
                    {t("verifyResetCodeScreen.verifyingBtn")}
                  </Text>
                </View>
              ) : (
                <Text style={s.buttonText}>
                  {t("verifyResetCodeScreen.verifyBtn")}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[
              s.secondaryButton,
              (forgotPasswordLoading || resendRemaining > 0) && { opacity: 0.6 },
            ]}
            onPress={handleResend}
            disabled={forgotPasswordLoading || verifyOtpLoading || resendRemaining > 0}
            activeOpacity={0.9}
          >
            {forgotPasswordLoading ? (
              <View style={s.rowCenter}>
                <ActivityIndicator />
                <Text style={s.secondaryButtonText}>
                  {t("verifyResetCodeScreen.resendingBtn")}
                </Text>
              </View>
            ) : (
              <Text style={s.secondaryButtonText}>
                {resendRemaining > 0
                  ? t("verifyResetCodeScreen.resendIn", {
                      seconds: resendRemaining,
                    })
                  : t("verifyResetCodeScreen.resendBtn")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              !verifyOtpLoading &&
              !forgotPasswordLoading &&
              router.push("/(auth)/login")
            }
            disabled={verifyOtpLoading || forgotPasswordLoading}
            activeOpacity={0.8}
          >
            <Text style={s.backText}>{t("verifyResetCodeScreen.loginBack")}</Text>
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
      marginBottom: 14,
      lineHeight: 22,
    },
    emailHint: {
      fontSize: 13,
      color: theme.tint,
      marginBottom: 18,
      fontWeight: "700",
    },
    timersBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
    },
    timerItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    timerDivider: {
      width: 1,
      alignSelf: "stretch",
      backgroundColor: theme.border,
      marginHorizontal: 10,
    },
    timerLabel: {
      fontSize: 12,
      color: theme.mutedText,
      marginBottom: 4,
      fontWeight: "700",
    },
    timerValue: {
      fontSize: 18,
      color: theme.text,
      fontWeight: "800",
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