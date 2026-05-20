
// app/(auth)/login.tsx
// ✅ Login Screen (Expo + RN + Reanimated)
// ✅ Dark/Light via Colors
// ✅ Validation: يقبل العربي/الإنجليزي + رموز محددة فقط
// ✅ اسم المستخدم حتى 64 حرف
// ✅ إظهار أخطاء لكل حقل + خطأ عام
// ✅ Loading أثناء تسجيل الدخول

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { login } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
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
import { useDispatch } from "react-redux";

type FieldErrors = {
  username?: string;
  password?: string;
  general?: string;
};

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();

  const { colorScheme } = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);
const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  /* ================= Animations ================= */
  const userX = useSharedValue(-320);
  const passX = useSharedValue(320);
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

  /* ================= Validation ================= */

  // اسم المستخدم: عربي/إنجليزي/أرقام + . _ -
  // طول من 3 إلى 64
const USER_ALLOWED = /^[^\s]{1,64}$/;
  // كلمة المرور: عربي/إنجليزي/أرقام + رموز محددة
  // طول من 6 إلى 64
  const PASS_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

  const validate = (u: string, p: string): FieldErrors => {
    const next: FieldErrors = {};
    const uTrim = u.trim();

    if (!uTrim) {
      next.username = t("loginScreen.errors.usernameRequired");
    } else if (/\s/.test(uTrim)) {
      next.username = t("loginScreen.errors.usernameNoSpaces");
    } else if (!USER_ALLOWED.test(uTrim)) {
      next.username = t("loginScreen.errors.usernameInvalid");
    }

    if (!p) {
      next.password = t("loginScreen.errors.passwordRequired");
    } else if (/\s/.test(p)) {
      next.password = t("loginScreen.errors.passwordNoSpaces");
    } else if (!PASS_ALLOWED.test(p)) {
      next.password = t("loginScreen.errors.passwordInvalid");
    }

    return next;
  };
const handleLogin = async () => {
  if (loading) return;

  const v = validate(username, password);

  if (v.username || v.password) {
    setErrors(v);
    triggerErrorAnim();

    Toast.show({
      type: "error",
      text1: t("common.error"),
      text2: t("loginScreen.toasts.checkInputs"),
    });

    return;
  }

  setLoading(true);
  clearErrors();

  try {
    const resultAction = await dispatch(
      login({
        // الأفضل لا تستخدم toLowerCase هنا حتى لا تكسر الأسماء العربية/الإيموجي
        username: username.trim(),
        password,
      })
    );

    if (login.fulfilled.match(resultAction)) {
      Toast.show({
        type: "success",
        text1: t("common.success"),
        text2: t("loginScreen.toasts.loginSuccess"),
      });

      return;
    }

    const payload: any = resultAction.payload;

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
        : payload?.message || t("loginScreen.errors.invalidCredentials");

    setErrors({ general: msg });
    triggerErrorAnim();

    Toast.show({
      type: "error",
      text1: t("loginScreen.toasts.loginFailed"),
      text2: msg,
    });
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

    setErrors({ general: t("loginScreen.errors.unexpected") });
    triggerErrorAnim();

    Toast.show({
      type: "error",
      text1: t("common.error"),
      text2: t("loginScreen.errors.unexpected"),
    });
  } finally {
    setLoading(false);
  }
};
  // const handleLogin = async () => {
  //   if (loading) return;

  //   const v = validate(username, password);

  //   if (v.username || v.password) {
  //     setErrors(v);
  //     triggerErrorAnim();
  //     Toast.show({
  //       type: "error",
  //       text1: t("common.error"),
  //       text2: t("loginScreen.toasts.checkInputs"),
  //     });
  //     return;
  //   }

  //   setLoading(true);
  //   clearErrors();

  //   try {
  //     const resultAction = await dispatch(
  //       login({
  //         username: username.trim().toLowerCase(),
  //         password,
  //       })
  //     );

  //     if (login.fulfilled.match(resultAction)) {
  //       Toast.show({
  //         type: "success",
  //         text1: t("common.success"),
  //         text2: t("loginScreen.toasts.loginSuccess"),
  //       });
  //     } else {
  //       const msg =
  //         (resultAction.payload as string) || t("loginScreen.errors.invalidCredentials");

  //       setErrors({ general: msg });
  //       triggerErrorAnim();

  //       Toast.show({
  //         type: "error",
  //         text1: t("loginScreen.toasts.loginFailed"),
  //         text2: msg,
  //       });
  //     }
  //   } catch {
  //     setErrors({ general: t("loginScreen.errors.unexpected") });
  //     triggerErrorAnim();

  //     Toast.show({
  //       type: "error",
  //       text1: t("common.error"),
  //       text2: t("loginScreen.errors.unexpected"),
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /* ================= Animated Styles ================= */

  const userStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: userX.value }],
  }));

  const passStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passX.value }],
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
          <Text style={s.title}>{t("loginScreen.title")}</Text>
          <Text style={s.subtitle}>{t("loginScreen.subtitle")}</Text>

          <Animated.View style={userStyle}>
            <TextInput
              placeholder={t("loginScreen.usernamePH")}
              placeholderTextColor={theme.subtleText as any}
              value={username}
              onChangeText={setUsername}
              style={[s.input, !!errors.username && s.inputError]}
              autoCorrect={false}
              autoCapitalize="none"
              editable={!loading}
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
  placeholder={t("loginScreen.passwordPH")}
  placeholderTextColor={theme.subtleText as any}
  secureTextEntry={!showPassword}
  value={password}
  onChangeText={setPassword}
  style={s.passwordInput}
  editable={!loading}
  onSubmitEditing={handleLogin}
  returnKeyType="done"

  // السماح بظهور الحافظة / Paste
  contextMenuHidden={false}
  selectTextOnFocus={false}

  // تحسين ظهور اقتراحات كلمة المرور والحفظ
  textContentType="password"
  autoComplete="password"
  importantForAutofill="yes"

  // منع التصحيح فقط، وليس منع اللصق
  autoCorrect={false}
  autoCapitalize="none"
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

          {!!errors.general && (
            <Animated.Text style={[s.error, errorAnimStyle]}>
              {errors.general}
            </Animated.Text>
          )}

          <TouchableOpacity
            onPress={() => !loading && router.push("/(auth)/forgot-password")}
            disabled={loading}
            activeOpacity={0.8}
            style={s.forgotWrap}
          >
            <Text style={s.forgotText}>{t("loginScreen.forgotPassword")}</Text>
          </TouchableOpacity>

          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={[s.button, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <ActivityIndicator />
                  <Text style={s.buttonText}>{t("loginScreen.loadingBtn")}</Text>
                </View>
              ) : (
                <Text style={s.buttonText}>{t("loginScreen.loginBtn")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => !loading && router.push("/(auth)/register")}
            disabled={loading}
          >
            <Text style={s.registerText}>
              {t("loginScreen.registerLine")}
              <Text style={s.link}>{t("loginScreen.registerLink")}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= Styles ================= */

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
      fontSize: 34,
      fontWeight: "800",
      color: theme.text,
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
    subtitle: {
      fontSize: 14,
      color: theme.mutedText,
      marginBottom: 40,
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
    forgotWrap: {
      alignSelf: "flex-end",
      marginTop: 4,
      marginBottom: 16,
    },
    forgotText: {
      color: theme.tint,
      fontSize: 13,
      fontWeight: "800",
    },
    error: {
      color: theme.danger,
      fontSize: 13,
      marginBottom: 12,
      fontWeight: "800",
    },
    registerText: {
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