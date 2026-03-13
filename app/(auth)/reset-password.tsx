// import { Colors } from "@/constants/theme";
// import { useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//     ActivityIndicator,
//     KeyboardAvoidingView,
//     Platform,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     useColorScheme,
//     View,
// } from "react-native";
// import Animated, {
//     useAnimatedStyle,
//     useSharedValue,
//     withRepeat,
//     withSequence,
//     withTiming,
// } from "react-native-reanimated";
// import Toast from "react-native-toast-message";

// type FieldErrors = {
//   password?: string;
//   confirmPassword?: string;
//   general?: string;
// };

// export default function ResetPasswordScreen() {
//   const router = useRouter();

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const isDark = colorScheme === "dark";
//   const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

//   const copy = useMemo(
//     () => ({
//       title: "تعيين كلمة مرور جديدة",
//       subtitle: "أدخل كلمة المرور الجديدة ثم أكدها للمتابعة",
//       passwordPH: "كلمة المرور الجديدة",
//       confirmPasswordPH: "تأكيد كلمة المرور الجديدة",
//       saveBtn: "حفظ كلمة المرور",
//       savingBtn: "جارٍ الحفظ...",
//       backLogin: "العودة لتسجيل الدخول",
//     }),
//     []
//   );

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [loading, setLoading] = useState(false);

//   const passX = useSharedValue(-320);
//   const confirmX = useSharedValue(320);
//   const buttonY = useSharedValue(50);
//   const errorOpacity = useSharedValue(0);
//   const shakeX = useSharedValue(0);

//   const float1 = useSharedValue(0);
//   const float2 = useSharedValue(0);
//   const float3 = useSharedValue(0);
//   const rotate = useSharedValue(0);

//   useEffect(() => {
//     passX.value = withTiming(0, { duration: 700 });
//     confirmX.value = withTiming(0, { duration: 700 });
//     buttonY.value = withTiming(0, { duration: 700 });

//     float1.value = withRepeat(withTiming(30, { duration: 8000 }), -1, true);
//     float2.value = withRepeat(withTiming(-25, { duration: 10000 }), -1, true);
//     float3.value = withRepeat(withTiming(20, { duration: 9000 }), -1, true);
//     rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
//   }, []);

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
//   };

//   const PASS_ALLOWED =
//     /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

//   const validate = (p: string, cp: string): FieldErrors => {
//     const next: FieldErrors = {};

//     if (!p) {
//       next.password = "يرجى إدخال كلمة المرور الجديدة";
//     } else if (/\s/.test(p)) {
//       next.password = "كلمة المرور لا يجب أن تحتوي على مسافات";
//     } else if (!PASS_ALLOWED.test(p)) {
//       next.password =
//         "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64";
//     }

//     if (!cp) {
//       next.confirmPassword = "يرجى تأكيد كلمة المرور";
//     } else if (p !== cp) {
//       next.confirmPassword = "كلمتا المرور غير متطابقتين";
//     }

//     return next;
//   };

//   const handleResetPassword = async () => {
//     if (loading) return;

//     const v = validate(password, confirmPassword);

//     if (v.password || v.confirmPassword) {
//       setErrors(v);
//       triggerErrorAnim();
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "تحقق من كلمة المرور الجديدة",
//       });
//       return;
//     }

//     setLoading(true);
//     clearErrors();

//     try {
//       // اربط هنا API الحقيقي
//       // مثال:
//       // await api.post("/auth/reset-password", {
//       //   password,
//       //   confirmPassword,
//       // });

//       await new Promise((resolve) => setTimeout(resolve, 1200));

//       Toast.show({
//         type: "success",
//         text1: "تم بنجاح",
//         text2: "تم تغيير كلمة المرور بنجاح",
//       });

//       router.replace("/(auth)/login");
//     } catch {
//       setErrors({ general: "تعذر تغيير كلمة المرور، حاول مرة أخرى" });
//       triggerErrorAnim();
//       Toast.show({
//         type: "error",
//         text1: "فشل العملية",
//         text2: "حدث خطأ أثناء تغيير كلمة المرور",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const passStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: passX.value }],
//   }));

//   const confirmStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: confirmX.value }],
//   }));

//   const buttonStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: buttonY.value }],
//     opacity: loading ? 0.85 : 1,
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

//           <Animated.View style={passStyle}>
//             <TextInput
//               placeholder={copy.passwordPH}
//               placeholderTextColor={theme.subtleText as any}
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//               style={[s.input, !!errors.password && s.inputError]}
//               editable={!loading}
//             />
//             {!!errors.password && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.password}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           <Animated.View style={confirmStyle}>
//             <TextInput
//               placeholder={copy.confirmPasswordPH}
//               placeholderTextColor={theme.subtleText as any}
//               secureTextEntry
//               value={confirmPassword}
//               onChangeText={setConfirmPassword}
//               style={[s.input, !!errors.confirmPassword && s.inputError]}
//               editable={!loading}
//               onSubmitEditing={handleResetPassword}
//             />
//             {!!errors.confirmPassword && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.confirmPassword}
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
//               style={[s.button, loading && { opacity: 0.8 }]}
//               onPress={handleResetPassword}
//               disabled={loading}
//               activeOpacity={0.9}
//             >
//               {loading ? (
//                 <View style={s.rowCenter}>
//                   <ActivityIndicator />
//                   <Text style={s.buttonText}>{copy.savingBtn}</Text>
//                 </View>
//               ) : (
//                 <Text style={s.buttonText}>{copy.saveBtn}</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() => !loading && router.replace("/(auth)/login")}
//             disabled={loading}
//             activeOpacity={0.8}
//           >
//             <Text style={s.backText}>{copy.backLogin}</Text>
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
//     rowCenter: {
//       flexDirection: "row",
//       gap: 10,
//       alignItems: "center",
//       justifyContent: "center",
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
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();

  const emailFromParams =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
  const otpFromParams =
    typeof params.otp === "string" ? params.otp.trim() : "";

  const { resetPasswordLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const copy = useMemo(
    () => ({
      title: "تعيين كلمة مرور جديدة",
      subtitle: "أدخل كلمة المرور الجديدة ثم أكدها للمتابعة",
      passwordPH: "كلمة المرور الجديدة",
      confirmPasswordPH: "تأكيد كلمة المرور الجديدة",
      saveBtn: "حفظ كلمة المرور",
      savingBtn: "جارٍ الحفظ...",
      backLogin: "العودة لتسجيل الدخول",
      missingData: "بيانات إعادة التعيين غير مكتملة، أعد طلب كود التحقق أولًا",
    }),
    []
  );

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
      next.password = "يرجى إدخال كلمة المرور الجديدة";
    } else if (/\s/.test(p)) {
      next.password = "كلمة المرور لا يجب أن تحتوي على مسافات";
    } else if (!PASS_ALLOWED.test(p)) {
      next.password =
        "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64";
    }

    if (!cp) {
      next.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (p !== cp) {
      next.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    return next;
  };

  const handleResetPassword = async () => {
    if (resetPasswordLoading) return;

    if (!emailFromParams || !otpFromParams) {
      setErrors({ general: copy.missingData });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: copy.missingData,
      });
      return;
    }

    const v = validate(password, confirmPassword);

    if (v.password || v.confirmPassword) {
      setErrors(v);
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "تحقق من كلمة المرور الجديدة",
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
          text1: "تم بنجاح",
          text2: "تم تغيير كلمة المرور بنجاح",
        });

        router.replace("/(auth)/login");
      } else {
        const msg =
          (resultAction.payload as string) ||
          "تعذر تغيير كلمة المرور، حاول مرة أخرى";

        setErrors({ general: msg });
        triggerErrorAnim();

        Toast.show({
          type: "error",
          text1: "فشل العملية",
          text2: msg,
        });
      }
    } catch {
      setErrors({ general: "تعذر تغيير كلمة المرور، حاول مرة أخرى" });
      triggerErrorAnim();

      Toast.show({
        type: "error",
        text1: "فشل العملية",
        text2: "حدث خطأ أثناء تغيير كلمة المرور",
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
          <Text style={s.title}>{copy.title}</Text>
          <Text style={s.subtitle}>{copy.subtitle}</Text>

          {!!emailFromParams && <Text style={s.emailHint}>{emailFromParams}</Text>}

          <Animated.View style={passStyle}>
            <TextInput
              placeholder={copy.passwordPH}
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
              placeholder={copy.confirmPasswordPH}
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
                  <Text style={s.buttonText}>{copy.savingBtn}</Text>
                </View>
              ) : (
                <Text style={s.buttonText}>{copy.saveBtn}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => !resetPasswordLoading && router.replace("/(auth)/login")}
            disabled={resetPasswordLoading}
            activeOpacity={0.8}
          >
            <Text style={s.backText}>{copy.backLogin}</Text>
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