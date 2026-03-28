
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  clearError,
  clearForgotPasswordState,
  resetPassword,
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
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();

  const emailFromParams =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  const otpFromParams =
    typeof params.otp === "string" ? params.otp.trim() : "";

  const { resetPasswordLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const passX = useSharedValue(-320);
  const confirmX = useSharedValue(320);
  const buttonY = useSharedValue(50);
  const errorOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    passX.value = withTiming(0, { duration: 700 });
    confirmX.value = withTiming(0, { duration: 700 });
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

  const PASS_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

  const validate = (p: string, cp: string): FieldErrors => {
    const next: FieldErrors = {};

    if (!p) {
      next.password = t("resetPasswordScreen.errors.passwordRequired");
    } else if (/\s/.test(p)) {
      next.password = t("resetPasswordScreen.errors.passwordNoSpaces");
    } else if (!PASS_ALLOWED.test(p)) {
      next.password = t("resetPasswordScreen.errors.passwordInvalid");
    }

    if (!cp) {
      next.confirmPassword = t("resetPasswordScreen.errors.confirmPasswordRequired");
    } else if (p !== cp) {
      next.confirmPassword = t("resetPasswordScreen.errors.passwordsMismatch");
    }

    return next;
  };

  const handleResetPassword = async () => {
    if (resetPasswordLoading) return;

    if (!emailFromParams || !otpFromParams) {
      setErrors({ general: t("resetPasswordScreen.errors.missingData") });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("resetPasswordScreen.errors.missingData"),
      });
      return;
    }

    const v = validate(password, confirmPassword);

    if (v.password || v.confirmPassword) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("resetPasswordScreen.toasts.checkPassword"),
      });
      return;
    }

    clearErrors();

    try {
      const resultAction = await dispatch(
        resetPassword({
          email: emailFromParams,
          otp: otpFromParams,
          newPassword: password,
        })
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        dispatch(clearForgotPasswordState());

        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("resetPasswordScreen.toasts.resetSuccess"),
        });

        router.replace("/(auth)/login");
      } else {
        const msg =
          (resultAction.payload as string) ||
          t("resetPasswordScreen.errors.resetFailed");

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: t("resetPasswordScreen.toasts.operationFailedTitle"),
          text2: msg,
        });
      }
    } catch {
      setErrors({ general: t("resetPasswordScreen.errors.resetFailed") });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: t("resetPasswordScreen.toasts.operationFailedTitle"),
        text2: t("resetPasswordScreen.toasts.requestError"),
      });
    }
  };

  const passStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passX.value }],
  }));

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: confirmX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: resetPasswordLoading ? 0.85 : 1,
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
          <Text style={s.title}>{t("resetPasswordScreen.title")}</Text>
          <Text style={s.subtitle}>{t("resetPasswordScreen.subtitle")}</Text>

          {!!emailFromParams && <Text style={s.emailHint}>{emailFromParams}</Text>}

          <Animated.View style={passStyle}>
            <TextInput
              placeholder={t("resetPasswordScreen.passwordPH")}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password || errors.general || error) {
                  clearErrors();
                }
              }}
              style={[s.input, !!errors.password && s.inputError]}
              editable={!resetPasswordLoading}
            />
            {!!errors.password && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.password}
              </Animated.Text>
            )}
          </Animated.View>

          <Animated.View style={confirmStyle}>
            <TextInput
              placeholder={t("resetPasswordScreen.confirmPasswordPH")}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword || errors.general || error) {
                  clearErrors();
                }
              }}
              style={[s.input, !!errors.confirmPassword && s.inputError]}
              editable={!resetPasswordLoading}
              onSubmitEditing={handleResetPassword}
            />
            {!!errors.confirmPassword && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.confirmPassword}
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
              style={[s.button, resetPasswordLoading && { opacity: 0.8 }]}
              onPress={handleResetPassword}
              disabled={resetPasswordLoading}
              activeOpacity={0.9}
            >
              {resetPasswordLoading ? (
                <View style={s.rowCenter}>
                  <ActivityIndicator />
                  <Text style={s.buttonText}>
                    {t("resetPasswordScreen.savingBtn")}
                  </Text>
                </View>
              ) : (
                <Text style={s.buttonText}>
                  {t("resetPasswordScreen.saveBtn")}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => !resetPasswordLoading && router.replace("/(auth)/login")}
            disabled={resetPasswordLoading}
            activeOpacity={0.8}
          >
            <Text style={s.backText}>{t("resetPasswordScreen.backLogin")}</Text>
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
      marginBottom: 26,
      fontWeight: "700",
    },
    input: {
      height: 54,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      fontSize: 16,
      marginBottom: 10,
      color: theme.text,
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