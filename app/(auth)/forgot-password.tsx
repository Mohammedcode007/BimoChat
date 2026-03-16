

// import { Colors } from "@/constants/theme";
// import { clearError, forgotPassword } from "@/redux/slices/authSlice";
// import { AppDispatch, RootState } from "@/redux/store";
// import { useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withRepeat,
//   withSequence,
//   withTiming,
// } from "react-native-reanimated";
// import Toast from "react-native-toast-message";
// import { useDispatch, useSelector } from "react-redux";

// type FieldErrors = {
//   email?: string;
//   general?: string;
// };

// export default function ForgotPasswordScreen() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();

//   const { forgotPasswordLoading, error } = useSelector(
//     (state: RootState) => state.auth
//   );

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const isDark = colorScheme === "dark";
//   const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

//   const copy = useMemo(
//     () => ({
//       title: "استعادة كلمة المرور",
//       subtitle: "أدخل بريدك الإلكتروني لإرسال كود التحقق",
//       inputPH: "البريد الإلكتروني",
//       sendBtn: "إرسال الكود",
//       sendingBtn: "جارٍ الإرسال...",
//       backBtn: "العودة لتسجيل الدخول",
//     }),
//     []
//   );

//   const [email, setEmail] = useState("");
//   const [errors, setErrors] = useState<FieldErrors>({});

//   const inputX = useSharedValue(-320);
//   const buttonY = useSharedValue(50);
//   const errorOpacity = useSharedValue(0);
//   const shakeX = useSharedValue(0);

//   const float1 = useSharedValue(0);
//   const float2 = useSharedValue(0);
//   const float3 = useSharedValue(0);
//   const rotate = useSharedValue(0);

//   useEffect(() => {
//     inputX.value = withTiming(0, { duration: 700 });
//     buttonY.value = withTiming(0, { duration: 700 });

//     float1.value = withRepeat(withTiming(30, { duration: 8000 }), -1, true);
//     float2.value = withRepeat(withTiming(-25, { duration: 10000 }), -1, true);
//     float3.value = withRepeat(withTiming(20, { duration: 9000 }), -1, true);
//     rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
//   }, []);

//   useEffect(() => {
//     if (error) {
//       setErrors((prev) => ({ ...prev, general: error }));
//       triggerErrorAnim();
//     }
//   }, [error]);

//   const triggerErrorAnim = () => {
//     errorOpacity.value = withTiming(1, { duration: 200 });
//     shakeX.value = withSequence(
//       withTiming(-8, { duration: 50 }),
//       withTiming(8, { duration: 50 }),
//       withTiming(-6, { duration: 50 }),
//       withTiming(6, { duration: 50 }),
//       withTiming(0, { duration: 50 })
//     );
//   };

//   const clearErrors = () => {
//     setErrors({});
//     errorOpacity.value = withTiming(0, { duration: 150 });
//     dispatch(clearError());
//   };

//   const validate = (value: string): FieldErrors => {
//     const next: FieldErrors = {};
//     const v = value.trim().toLowerCase();

//     if (!v) {
//       next.email = "يرجى إدخال البريد الإلكتروني";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
//       next.email = "يرجى إدخال بريد إلكتروني صحيح";
//     }

//     return next;
//   };

//   const handleSend = async () => {
//     if (forgotPasswordLoading) return;

//     const v = validate(email);
//     if (v.email) {
//       setErrors(v);
//       triggerErrorAnim();
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "تحقق من البريد الإلكتروني",
//       });
//       return;
//     }

//     clearErrors();

//     try {
//       const normalizedEmail = email.trim().toLowerCase();

//       const resultAction = await dispatch(
//         forgotPassword({ email: normalizedEmail })
//       );

//       if (forgotPassword.fulfilled.match(resultAction)) {
//         Toast.show({
//           type: "success",
//           text1: "تم الإرسال",
//           text2: "إذا كان البريد موجودًا فسيصلك كود التحقق",
//         });

//         router.push({
//           pathname: "/(auth)/verify-reset-code",
//           params: { email: normalizedEmail },
//         });
//       } else {
//         const msg =
//           (resultAction.payload as string) ||
//           "تعذر إرسال كود التحقق، حاول مرة أخرى";

//         setErrors({ general: msg });
//         triggerErrorAnim();

//         Toast.show({
//           type: "error",
//           text1: "فشل الإرسال",
//           text2: msg,
//         });
//       }
//     } catch {
//       setErrors({
//         general: "تعذر إرسال كود التحقق، حاول مرة أخرى",
//       });
//       triggerErrorAnim();

//       Toast.show({
//         type: "error",
//         text1: "فشل الإرسال",
//         text2: "حدث خطأ أثناء إرسال الطلب",
//       });
//     }
//   };

//   const inputStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: inputX.value }],
//   }));

//   const buttonStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: buttonY.value }],
//     opacity: forgotPasswordLoading ? 0.85 : 1,
//   }));

//   const errorAnimStyle = useAnimatedStyle(() => ({
//     opacity: errorOpacity.value,
//     transform: [{ translateX: shakeX.value }],
//   }));

//   const floating = (v: any, r = false) =>
//     useAnimatedStyle(() => ({
//       transform: [
//         { translateY: v.value },
//         ...(r ? [{ rotate: `${rotate.value}deg` }] : []),
//       ],
//     }));

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: theme.background }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <View style={s.container}>
//         <Animated.View style={[s.circle, s.blue, floating(float1)]} />
//         <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
//         <Animated.View style={[s.triangle, s.green, floating(float3)]} />
//         <Animated.View style={[s.line, s.gray, floating(float1)]} />
//         <Animated.View style={[s.circle, s.light, floating(float2)]} />

//         <View style={s.content}>
//           <Text style={s.title}>{copy.title}</Text>
//           <Text style={s.subtitle}>{copy.subtitle}</Text>

//           <Animated.View style={inputStyle}>
//             <TextInput
//               placeholder={copy.inputPH}
//               placeholderTextColor={theme.subtleText as any}
//               value={email}
//               onChangeText={(text) => {
//                 setEmail(text);
//                 if (errors.email || errors.general || error) {
//                   clearErrors();
//                 }
//               }}
//               style={[s.input, !!errors.email && s.inputError]}
//               autoCorrect={false}
//               autoCapitalize="none"
//               keyboardType="email-address"
//               editable={!forgotPasswordLoading}
//             />

//             {!!errors.email && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.email}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           {!!errors.general && (
//             <Animated.Text style={[s.error, errorAnimStyle]}>
//               {errors.general}
//             </Animated.Text>
//           )}

//           <Animated.View style={buttonStyle}>
//             <TouchableOpacity
//               style={[s.button, forgotPasswordLoading && { opacity: 0.8 }]}
//               onPress={handleSend}
//               disabled={forgotPasswordLoading}
//               activeOpacity={0.9}
//             >
//               {forgotPasswordLoading ? (
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     gap: 10,
//                     alignItems: "center",
//                   }}
//                 >
//                   <ActivityIndicator />
//                   <Text style={s.buttonText}>{copy.sendingBtn}</Text>
//                 </View>
//               ) : (
//                 <Text style={s.buttonText}>{copy.sendBtn}</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() =>
//               !forgotPasswordLoading && router.push("/(auth)/login")
//             }
//             disabled={forgotPasswordLoading}
//             activeOpacity={0.8}
//           >
//             <Text style={s.backText}>{copy.backBtn}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// function makeStyles(theme: any, isDark: boolean) {
//   return StyleSheet.create({
//     container: { flex: 1, backgroundColor: theme.background },
//     content: {
//       flex: 1,
//       justifyContent: "center",
//       paddingHorizontal: 26,
//       zIndex: 10,
//     },
//     title: {
//       fontSize: 32,
//       fontWeight: "800",
//       color: theme.text,
//     },
//     subtitle: {
//       fontSize: 14,
//       color: theme.mutedText,
//       marginBottom: 40,
//       lineHeight: 22,
//     },
//     input: {
//       height: 54,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.border,
//       fontSize: 16,
//       marginBottom: 10,
//       color: theme.text,
//       textAlign: "left",
//     },
//     inputError: {
//       borderBottomColor: theme.danger,
//     },
//     fieldError: {
//       color: theme.danger,
//       fontSize: 12,
//       marginBottom: 10,
//       fontWeight: "700",
//     },
//     button: {
//       height: 54,
//       backgroundColor: theme.primary,
//       borderRadius: 14,
//       justifyContent: "center",
//       alignItems: "center",
//       marginTop: 10,
//       borderWidth: 1,
//       borderColor: theme.border,
//     },
//     buttonText: {
//       color: theme.primaryText,
//       fontSize: 16,
//       fontWeight: "600",
//     },
//     error: {
//       color: theme.danger,
//       fontSize: 13,
//       marginBottom: 12,
//       fontWeight: "800",
//     },
//     backText: {
//       textAlign: "center",
//       marginTop: 22,
//       fontSize: 14,
//       color: theme.tint,
//       fontWeight: "800",
//     },

//     circle: { position: "absolute", borderRadius: 999 },
//     square: { position: "absolute", borderRadius: 16 },
//     triangle: {
//       position: "absolute",
//       width: 0,
//       height: 0,
//       borderLeftWidth: 30,
//       borderRightWidth: 30,
//       borderBottomWidth: 50,
//       borderStyle: "solid",
//       backgroundColor: "transparent",
//       borderLeftColor: "transparent",
//       borderRightColor: "transparent",
//       borderBottomColor: isDark
//         ? "rgba(34, 197, 94, 0.28)"
//         : "#34D399",
//       top: 120,
//       right: 40,
//       opacity: 0.4,
//     },
//     line: {
//       position: "absolute",
//       width: 140,
//       height: 4,
//       top: 200,
//       left: 20,
//       borderRadius: 2,
//     },
//     blue: {
//       width: 220,
//       height: 220,
//       backgroundColor: isDark
//         ? "rgba(96, 165, 250, 0.16)"
//         : "#DBEAFE",
//       top: -80,
//       left: -100,
//     },
//     purple: {
//       width: 160,
//       height: 160,
//       backgroundColor: isDark
//         ? "rgba(167, 139, 250, 0.16)"
//         : "#EDE9FE",
//       bottom: 80,
//       right: -60,
//     },
//     green: { opacity: 0.5 },
//     gray: {
//       backgroundColor: isDark
//         ? "rgba(255,255,255,0.10)"
//         : "#E5E7EB",
//       opacity: 0.6,
//     },
//     light: {
//       width: 120,
//       height: 120,
//       backgroundColor: isDark
//         ? "rgba(255,255,255,0.07)"
//         : "#F1F5F9",
//       bottom: -40,
//       left: 40,
//     },
//   });
// }

import { Colors } from "@/constants/theme";
import { useTranslation } from "@/hooks/useTranslation";
import { clearError, forgotPassword } from "@/redux/slices/authSlice";
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
import { useDispatch, useSelector } from "react-redux";

type FieldErrors = {
  email?: string;
  general?: string;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { forgotPasswordLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

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

  const validate = (value: string): FieldErrors => {
    const next: FieldErrors = {};
    const v = value.trim().toLowerCase();

    if (!v) {
      next.email = t("forgotPasswordScreen.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      next.email = t("forgotPasswordScreen.errors.emailInvalid");
    }

    return next;
  };

  const handleSend = async () => {
    if (forgotPasswordLoading) return;

    const v = validate(email);
    if (v.email) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("forgotPasswordScreen.toasts.checkEmail"),
      });
      return;
    }

    clearErrors();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const resultAction = await dispatch(
        forgotPassword({ email: normalizedEmail })
      );

      if (forgotPassword.fulfilled.match(resultAction)) {
        Toast.show({
          type: "success",
          text1: t("forgotPasswordScreen.toasts.sentTitle"),
          text2: t("forgotPasswordScreen.toasts.sentMessage"),
        });

        router.push({
          pathname: "/(auth)/verify-reset-code",
          params: { email: normalizedEmail },
        });
      } else {
        const msg =
          (resultAction.payload as string) ||
          t("forgotPasswordScreen.errors.sendFailed");

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: t("forgotPasswordScreen.toasts.sendFailedTitle"),
          text2: msg,
        });
      }
    } catch {
      setErrors({
        general: t("forgotPasswordScreen.errors.sendFailed"),
      });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: t("forgotPasswordScreen.toasts.sendFailedTitle"),
        text2: t("forgotPasswordScreen.toasts.requestError"),
      });
    }
  };

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inputX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    opacity: forgotPasswordLoading ? 0.85 : 1,
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
          <Text style={s.title}>{t("forgotPasswordScreen.title")}</Text>
          <Text style={s.subtitle}>{t("forgotPasswordScreen.subtitle")}</Text>

          <Animated.View style={inputStyle}>
            <TextInput
              placeholder={t("forgotPasswordScreen.inputPH")}
              placeholderTextColor={theme.subtleText as any}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email || errors.general || error) {
                  clearErrors();
                }
              }}
              style={[s.input, !!errors.email && s.inputError]}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!forgotPasswordLoading}
            />

            {!!errors.email && (
              <Animated.Text style={[s.fieldError, errorAnimStyle]}>
                {errors.email}
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
              style={[s.button, forgotPasswordLoading && { opacity: 0.8 }]}
              onPress={handleSend}
              disabled={forgotPasswordLoading}
              activeOpacity={0.9}
            >
              {forgotPasswordLoading ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator />
                  <Text style={s.buttonText}>
                    {t("forgotPasswordScreen.sendingBtn")}
                  </Text>
                </View>
              ) : (
                <Text style={s.buttonText}>
                  {t("forgotPasswordScreen.sendBtn")}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() =>
              !forgotPasswordLoading && router.push("/(auth)/login")
            }
            disabled={forgotPasswordLoading}
            activeOpacity={0.8}
          >
            <Text style={s.backText}>{t("forgotPasswordScreen.backBtn")}</Text>
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
      fontSize: 16,
      marginBottom: 10,
      color: theme.text,
      textAlign: "left",
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