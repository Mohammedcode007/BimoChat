
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { register } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
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
  username?: string;
  password?: string;
  confirm?: string;
  captcha?: string;
  general?: string;
};

export default function RegisterScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { t } = useTranslation();

  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  /* ================= CAPTCHA ================= */
  const generateCaptcha = () => {
    const x = Math.floor(Math.random() * 9) + 1;
    const y = Math.floor(Math.random() * 9) + 1;
    return { a: x, b: y, result: x + y };
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  /* ================= ANIMATIONS ================= */
  const userX = useSharedValue(-320);
  const passX = useSharedValue(320);
  const confirmX = useSharedValue(-320);
  const captchaX = useSharedValue(320);
  const buttonY = useSharedValue(50);

  const errorOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    userX.value = withTiming(0, { duration: 700 });
    passX.value = withTiming(0, { duration: 700 });
    confirmX.value = withTiming(0, { duration: 700 });
    captchaX.value = withTiming(0, { duration: 700 });
    buttonY.value = withTiming(0, { duration: 700 });

    float1.value = withRepeat(withTiming(30, { duration: 9000 }), -1, true);
    float2.value = withRepeat(withTiming(-25, { duration: 11000 }), -1, true);
    float3.value = withRepeat(withTiming(20, { duration: 10000 }), -1, true);
    rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
  }, []);

  const triggerErrorAnim = () => {
    errorOpacity.value = withTiming(1, { duration: 220 });
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

  /* ================= Validation ================= */
  const USER_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF._-]{2,63}$/;

  const PASS_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

  const validate = (
    u: string,
    p: string,
    c: string,
    cap: string
  ): FieldErrors => {
    const next: FieldErrors = {};
    const uTrim = u.trim();

    if (!uTrim) {
      next.username = t("registerScreen.errors.usernameRequired");
    } else if (/\s/.test(uTrim)) {
      next.username = t("registerScreen.errors.usernameNoSpaces");
    } else if (!USER_ALLOWED.test(uTrim)) {
      next.username = t("registerScreen.errors.usernameInvalid");
    }

    if (!p) {
      next.password = t("registerScreen.errors.passwordRequired");
    } else if (/\s/.test(p)) {
      next.password = t("registerScreen.errors.passwordNoSpaces");
    } else if (!PASS_ALLOWED.test(p)) {
      next.password = t("registerScreen.errors.passwordInvalid");
    }

    if (!c) {
      next.confirm = t("registerScreen.errors.confirmRequired");
    } else if (p && c && p !== c) {
      next.confirm = t("registerScreen.errors.passwordsMismatch");
    }

    if (!cap) {
      next.captcha = t("registerScreen.errors.captchaRequired");
    } else if (Number(cap) !== captcha.result) {
      next.captcha = t("registerScreen.errors.captchaInvalid");
    }

    return next;
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    if (loading) return;

    const v = validate(username, password, confirm, captchaInput);

    if (v.captcha) {
      refreshCaptcha();
    }

    if (v.username || v.password || v.confirm || v.captcha) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("registerScreen.toasts.checkInputs"),
      });
      return;
    }

    clearErrors();

    try {
      const result = await dispatch(
        register({
          username: username.trim().toLowerCase(),
          password,
        })
      );

      if (register.fulfilled.match(result)) {
        Toast.show({
          type: "success",
          text1: t("common.success"),
          text2: t("registerScreen.toasts.registerSuccess"),
        });
        router.replace("/(auth)/choose-location");
      } else {
        const msg =
          (result.payload as string) || t("registerScreen.errors.registerFailed");

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: t("registerScreen.toasts.registerFailedTitle"),
          text2: msg,
        });

        refreshCaptcha();
      }
    } catch {
      setErrors({ general: t("registerScreen.errors.unexpected") });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("registerScreen.errors.unexpected"),
      });

      refreshCaptcha();
    }
  };

  /* ================= Animated Styles ================= */
  const slideX = (x: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateX: x.value }],
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

  const onChangeUsername = (value: string) => {
    setUsername(value);
    if (errors.username || errors.general) {
      setErrors((p) => ({ ...p, username: undefined, general: undefined }));
      errorOpacity.value = withTiming(0, { duration: 120 });
    }
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    if (errors.password || errors.general) {
      setErrors((p) => ({ ...p, password: undefined, general: undefined }));
      errorOpacity.value = withTiming(0, { duration: 120 });
    }
  };

  const onChangeConfirm = (value: string) => {
    setConfirm(value);
    if (errors.confirm || errors.general) {
      setErrors((p) => ({ ...p, confirm: undefined, general: undefined }));
      errorOpacity.value = withTiming(0, { duration: 120 });
    }
  };

  const onChangeCaptcha = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    setCaptchaInput(cleaned);
    if (errors.captcha || errors.general) {
      setErrors((p) => ({ ...p, captcha: undefined, general: undefined }));
      errorOpacity.value = withTiming(0, { duration: 120 });
    }
  };

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
          <Text style={s.title}>{t("registerScreen.title")}</Text>
          <Text style={s.subtitle}>{t("registerScreen.subtitle")}</Text>

          <Animated.View style={slideX(userX)}>
            <TextInput
              placeholder={t("registerScreen.usernamePH")}
              placeholderTextColor={theme.subtleText as any}
              value={username}
              onChangeText={onChangeUsername}
              style={[s.input, !!errors.username && s.inputError]}
              editable={!loading}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="next"
            />
            {!!errors.username && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.username}
              </Animated.Text>
            )}
          </Animated.View>

          <Animated.View style={slideX(passX)}>
            <TextInput
              placeholder={t("registerScreen.passwordPH")}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={password}
              onChangeText={onChangePassword}
              style={[s.input, !!errors.password && s.inputError]}
              editable={!loading}
              returnKeyType="next"
            />
            {!!errors.password && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.password}
              </Animated.Text>
            )}
          </Animated.View>

          <Animated.View style={slideX(confirmX)}>
            <TextInput
              placeholder={t("registerScreen.confirmPH")}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={confirm}
              onChangeText={onChangeConfirm}
              style={[s.input, !!errors.confirm && s.inputError]}
              editable={!loading}
              returnKeyType="next"
            />
            {!!errors.confirm && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.confirm}
              </Animated.Text>
            )}
          </Animated.View>

          <Animated.View style={slideX(captchaX)}>
            <TextInput
              placeholder={t("registerScreen.captchaPH", {
                a: captcha.a,
                b: captcha.b,
              })}
              placeholderTextColor={theme.subtleText as any}
              keyboardType="numeric"
              value={captchaInput}
              onChangeText={onChangeCaptcha}
              style={[s.input, !!errors.captcha && s.inputError]}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
            {!!errors.captcha && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.captcha}
              </Animated.Text>
            )}
          </Animated.View>

          <TouchableOpacity
            onPress={() => !loading && refreshCaptcha()}
            disabled={loading}
          >
            <Text style={[s.refreshCaptcha, loading && { opacity: 0.6 }]}>
              {t("registerScreen.refreshCaptcha")}
            </Text>
          </TouchableOpacity>

          {!!errors.general && (
            <Animated.Text style={[s.error, errorAnimStyle]}>
              {errors.general}
            </Animated.Text>
          )}

          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={[s.button, loading && s.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={s.loadingRow}>
                  <ActivityIndicator />
                  <Text style={s.buttonText}>
                    {t("registerScreen.loadingBtn")}
                  </Text>
                </View>
              ) : (
                <Text style={s.buttonText}>{t("registerScreen.registerBtn")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => !loading && router.replace("/(auth)/login")}
            disabled={loading}
          >
            <Text style={[s.loginText, loading && { opacity: 0.6 }]}>
              {t("registerScreen.loginLine")}
              <Text style={s.link}>{t("registerScreen.loginLink")}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
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
      marginBottom: 36,
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
      fontSize: 12.5,
      marginBottom: 10,
      fontWeight: "700",
    },

    refreshCaptcha: {
      color: theme.tint,
      fontSize: 13,
      marginBottom: 12,
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
    buttonDisabled: {
      opacity: 0.8,
    },

    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
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

    loginText: {
      textAlign: "center",
      marginTop: 22,
      fontSize: 14,
      color: theme.mutedText,
      fontWeight: "700",
    },
    link: {
      color: theme.tint,
      fontWeight: "900",
    },

    circle: {
      position: "absolute",
      borderRadius: 999,
    },
    square: {
      position: "absolute",
      borderRadius: 18,
    },

    triangle: {
      position: "absolute",
      width: 0,
      height: 0,
      borderLeftWidth: 28,
      borderRightWidth: 28,
      borderBottomWidth: 48,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: isDark ? "rgba(34, 197, 94, 0.28)" : "#34D399",
      top: 120,
      right: 40,
      opacity: 0.35,
    },

    line: {
      position: "absolute",
      width: 150,
      height: 4,
      top: 220,
      left: 20,
      borderRadius: 2,
    },

    blue: {
      width: 220,
      height: 220,
      backgroundColor: isDark ? "rgba(96, 165, 250, 0.16)" : "#DBEAFE",
      top: -80,
      left: -100,
    },

    purple: {
      width: 160,
      height: 160,
      backgroundColor: isDark ? "rgba(167, 139, 250, 0.16)" : "#EDE9FE",
      bottom: 80,
      right: -60,
    },

    gray: {
      backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
      opacity: 0.6,
    },

    light: {
      width: 120,
      height: 120,
      backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9",
      bottom: -40,
      left: 40,
    },

    green: {
      opacity: 0.5,
    },
  });
}