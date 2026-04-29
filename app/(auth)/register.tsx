
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { register } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
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

  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);
const [showPassword, setShowPassword] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
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
  // const handleRegister = async () => {
  //   if (loading) return;

  //   const v = validate(username, password, confirm, captchaInput);

  //   if (v.captcha) {
  //     refreshCaptcha();
  //   }

  //   if (v.username || v.password || v.confirm || v.captcha) {
  //     setErrors(v);
  //     triggerErrorAnim();
  //     Toast.show({
  //       type: "error",
  //       text1: t("common.error"),
  //       text2: t("registerScreen.toasts.checkInputs"),
  //     });
  //     return;
  //   }

  //   clearErrors();

  //   try {
  //     const result = await dispatch(
  //       register({
  //         username: username.trim().toLowerCase(),
  //         password,
  //       })
  //     );

  //     if (register.fulfilled.match(result)) {
  //       Toast.show({
  //         type: "success",
  //         text1: t("common.success"),
  //         text2: t("registerScreen.toasts.registerSuccess"),
  //       });
  //       router.replace("/(auth)/choose-location");
  //     } else {
  //       const msg =
  //         (result.payload as string) || t("registerScreen.errors.registerFailed");

  //       setErrors({ general: msg });
  //       triggerErrorAnim();

  //       Toast.show({
  //         type: "error",
  //         text1: t("registerScreen.toasts.registerFailedTitle"),
  //         text2: msg,
  //       });

  //       refreshCaptcha();
  //     }
  //   } catch {
  //     setErrors({ general: t("registerScreen.errors.unexpected") });
  //     triggerErrorAnim();

  //     Toast.show({
  //       type: "error",
  //       text1: t("common.error"),
  //       text2: t("registerScreen.errors.unexpected"),
  //     });

  //     refreshCaptcha();
  //   }
  // };

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
        // لا تستخدم toLowerCase هنا حتى لا تكسر العربي/الإيموجي
        username: username.trim(),
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
      return;
    }

    const payload: any = result.payload;

    const isBlocked =
      String(payload?.code || "").toUpperCase() === "BLOCKED";

    if (isBlocked) {
      router.replace({
        pathname: "/(auth)/blocked",
        params: {
          scope: String(payload?.scope || "app"),
          message: String(
            payload?.message ||
              "هذا الحساب أو هذا الجهاز محظور من استخدام التطبيق."
          ),
          reason: String(payload?.reason || ""),
        },
      } as any);

      return;
    }

    const msg =
      typeof payload === "string"
        ? payload
        : payload?.message || t("registerScreen.errors.registerFailed");

    setErrors({ general: msg });
    triggerErrorAnim();

    Toast.show({
      type: "error",
      text1: t("registerScreen.toasts.registerFailedTitle"),
      text2: msg,
    });

    refreshCaptcha();
  } catch (error: any) {
    const data = error?.response?.data || error;

    const isBlocked =
      String(data?.code || "").toUpperCase() === "BLOCKED";

    if (isBlocked) {
      router.replace({
        pathname: "/(auth)/blocked",
        params: {
          scope: String(data?.scope || "app"),
          message: String(
            data?.message_ar ||
              data?.message ||
              "هذا الحساب أو هذا الجهاز محظور من استخدام التطبيق."
          ),
          reason: String(data?.reason || ""),
        },
      } as any);

      return;
    }

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
  const userStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: userX.value }],
  }));

  const passStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passX.value }],
  }));

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: confirmX.value }],
  }));

  const captchaStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: captchaX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: loading ? 0.85 : 1,
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
        <Animated.View style={[s.circle, s.blue, floating1Style]} />
        <Animated.View style={[s.square, s.purple, floating2RotateStyle]} />
        <Animated.View style={[s.triangle, s.green, floating3Style]} />
        <Animated.View style={[s.line, s.gray, floating1Style]} />
        <Animated.View style={[s.circle, s.light, floating2Style]} />

        <View style={s.content}>
          <Text style={s.title}>{t("registerScreen.title")}</Text>
          <Text style={s.subtitle}>{t("registerScreen.subtitle")}</Text>

          <Animated.View style={userStyle}>
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

         <Animated.View style={passStyle}>
  <View style={[s.passwordBox, !!errors.password && s.inputError]}>
    <TextInput
      placeholder={t("registerScreen.passwordPH")}
      placeholderTextColor={theme.subtleText as any}
      secureTextEntry={!showPassword}
      value={password}
      onChangeText={onChangePassword}
      style={s.passwordInput}
      editable={!loading}
      returnKeyType="next"
    />

    <TouchableOpacity
      onPress={() => setShowPassword((v) => !v)}
      disabled={loading}
      activeOpacity={0.7}
      style={s.eyeBtn}
    >
      <Ionicons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={22}
        color={theme.mutedText}
      />
    </TouchableOpacity>
  </View>

  {!!errors.password && (
    <Animated.Text style={[s.fieldError, errorAnimStyle]}>
      {errors.password}
    </Animated.Text>
  )}
</Animated.View>

        <Animated.View style={confirmStyle}>
  <View style={[s.passwordBox, !!errors.confirm && s.inputError]}>
    <TextInput
      placeholder={t("registerScreen.confirmPH")}
      placeholderTextColor={theme.subtleText as any}
      secureTextEntry={!showConfirm}
      value={confirm}
      onChangeText={onChangeConfirm}
      style={s.passwordInput}
      editable={!loading}
      returnKeyType="next"
    />

    <TouchableOpacity
      onPress={() => setShowConfirm((v) => !v)}
      disabled={loading}
      activeOpacity={0.7}
      style={s.eyeBtn}
    >
      <Ionicons
        name={showConfirm ? "eye-off-outline" : "eye-outline"}
        size={22}
        color={theme.mutedText}
      />
    </TouchableOpacity>
  </View>

  {!!errors.confirm && (
    <Animated.Text style={[s.fieldError, errorAnimStyle]}>
      {errors.confirm}
    </Animated.Text>
  )}
</Animated.View>

          <Animated.View style={captchaStyle}>
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
passwordBox: {
  height: 54,
  borderBottomWidth: 1,
  borderBottomColor: theme.border,
  marginBottom: 10,
  flexDirection: "row",
  alignItems: "center",
},

passwordInput: {
  flex: 1,
  height: "100%",
  fontSize: 16,
  color: theme.text,
  paddingRight: 8,
},

eyeBtn: {
  width: 44,
  height: 54,
  alignItems: "center",
  justifyContent: "center",
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