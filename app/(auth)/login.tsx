
// import { Colors } from "@/constants/theme";
// import { login } from "@/redux/slices/authSlice";
// import { AppDispatch } from "@/redux/store";
// import { useRouter } from "expo-router";
// import { useEffect, useMemo, useState } from "react";
// import {
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
// import { useDispatch } from "react-redux";

// export default function LoginScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const isDark = colorScheme === "dark";
//   const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

//   // ✅ نصوص فقط (عربي)
//   const copy = useMemo(
//     () => ({
//       title: "مرحبًا بعودتك",
//       subtitle: "سجّل الدخول للمتابعة",
//       usernamePH: "اسم المستخدم",
//       passwordPH: "كلمة المرور",
//       loginBtn: "تسجيل الدخول",
//       registerLine: "ليس لديك حساب؟ ",
//       registerLink: "إنشاء حساب",
//     }),
//     []
//   );

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   /* ================= Inputs Animation ================= */
//   const userX = useSharedValue(-320);
//   const passX = useSharedValue(320);
//   const buttonY = useSharedValue(50);
//   const errorOpacity = useSharedValue(0);
//   const shakeX = useSharedValue(0);

//   /* ================= Background Shapes ================= */
//   const float1 = useSharedValue(0);
//   const float2 = useSharedValue(0);
//   const float3 = useSharedValue(0);
//   const rotate = useSharedValue(0);

//   useEffect(() => {
//     // Entrance
//     userX.value = withTiming(0, { duration: 700 });
//     passX.value = withTiming(0, { duration: 700 });
//     buttonY.value = withTiming(0, { duration: 700 });

//     // Background motion
//     float1.value = withRepeat(withTiming(30, { duration: 8000 }), -1, true);
//     float2.value = withRepeat(withTiming(-25, { duration: 10000 }), -1, true);
//     float3.value = withRepeat(withTiming(20, { duration: 9000 }), -1, true);
//     rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
//   }, []);

//   const showError = (msg: string) => {
//     setError(msg);
//     errorOpacity.value = withTiming(1, { duration: 300 });
//     shakeX.value = withSequence(
//       withTiming(-8, { duration: 50 }),
//       withTiming(8, { duration: 50 }),
//       withTiming(-6, { duration: 50 }),
//       withTiming(6, { duration: 50 }),
//       withTiming(0, { duration: 50 })
//     );
//   };

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "يرجى إدخال اسم المستخدم وكلمة المرور",
//       });
//       showError("يرجى إدخال اسم المستخدم وكلمة المرور");
//       return;
//     }

//     try {
//       const resultAction = await dispatch(
//         login({
//           username: username.trim().toLowerCase(),
//           password,
//         })
//       );

//       if (login.fulfilled.match(resultAction)) {
//         Toast.show({
//           type: "success",
//           text1: "تم بنجاح",
//           text2: "تم تسجيل الدخول",
//         });
//         setError("");
//         errorOpacity.value = withTiming(0, { duration: 200 });
//       } else {
//         const msg = (resultAction.payload as string) || "بيانات غير صحيحة";
//         Toast.show({
//           type: "error",
//           text1: "فشل تسجيل الدخول",
//           text2: msg,
//         });
//         showError(msg);
//       }
//     } catch {
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "حدث خطأ غير متوقع",
//       });
//       showError("حدث خطأ غير متوقع");
//     }
//   };

//   /* ================= Animated Styles ================= */
//   const userStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: userX.value }],
//   }));

//   const passStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: passX.value }],
//   }));

//   const buttonStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: buttonY.value }],
//   }));

//   const errorStyle = useAnimatedStyle(() => ({
//     opacity: errorOpacity.value,
//     transform: [{ translateX: shakeX.value }],
//   }));

//   const floating = (v: any, r = false) =>
//     useAnimatedStyle(() => ({
//       transform: [{ translateY: v.value }, ...(r ? [{ rotate: `${rotate.value}deg` }] : [])],
//     }));

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: theme.background }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <View style={s.container}>
//         {/* ================= Background Shapes ================= */}
//         <Animated.View style={[s.circle, s.blue, floating(float1)]} />
//         <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
//         <Animated.View style={[s.triangle, s.green, floating(float3)]} />
//         <Animated.View style={[s.line, s.gray, floating(float1)]} />
//         <Animated.View style={[s.circle, s.light, floating(float2)]} />

//         {/* ================= Content ================= */}
//         <View style={s.content}>
//           <Text style={s.title}>{copy.title}</Text>
//           <Text style={s.subtitle}>{copy.subtitle}</Text>

//           <Animated.View style={userStyle}>
//             <TextInput
//               placeholder={copy.usernamePH}
//               placeholderTextColor={theme.subtleText as any}
//               value={username}
//               onChangeText={setUsername}
//               style={s.input}
//               autoCorrect={false}
//               autoCapitalize="none"
//             />
//           </Animated.View>

//           <Animated.View style={passStyle}>
//             <TextInput
//               placeholder={copy.passwordPH}
//               placeholderTextColor={theme.subtleText as any}
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//               style={s.input}
//             />
//           </Animated.View>

//           {!!error && <Animated.Text style={[s.error, errorStyle]}>{error}</Animated.Text>}

//           <Animated.View style={buttonStyle}>
//             <TouchableOpacity style={s.button} onPress={handleLogin} activeOpacity={0.9}>
//               <Text style={s.buttonText}>{copy.loginBtn}</Text>
//             </TouchableOpacity>
//           </Animated.View>

//           {/* Register */}
//           <TouchableOpacity onPress={() => router.push("/(auth)/register")} activeOpacity={0.9}>
//             <Text style={s.registerText}>
//               {copy.registerLine}
//               <Text style={s.link}>{copy.registerLink}</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// /* ================= STYLES ================= */

// function makeStyles(theme: any, isDark: boolean) {
//   // ✅ الحفاظ على نفس التصميم + تطبيق dark mode (ألوان فقط)
//   return StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: theme.background,
//     },
//     content: {
//       flex: 1,
//       justifyContent: "center",
//       paddingHorizontal: 26,
//       zIndex: 10,
//     },
//     title: {
//       fontSize: 34,
//       fontWeight: "800",
//       color: theme.text,
//       textAlign: "left",
//     },
//     subtitle: {
//       fontSize: 14,
//       color: theme.mutedText,
//       marginBottom: 40,
//     },
//     input: {
//       height: 54,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.border,
//       fontSize: 16,
//       marginBottom: 16,
//       color: theme.text,
//     },
//     button: {
//       height: 54,
//       backgroundColor: theme.primary, // ✅ light/dark
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
//       fontWeight: "700",
//     },
//     registerText: {
//       textAlign: "center",
//       marginTop: 22,
//       fontSize: 14,
//       color: theme.mutedText,
//       fontWeight: "700",
//     },
//     link: {
//       color: theme.tint,
//       fontWeight: "900",
//     },

//     /* ===== Shapes (same positions/sizes — colors become theme-aware) ===== */
//     circle: {
//       position: "absolute",
//       borderRadius: 999,
//     },
//     square: {
//       position: "absolute",
//       borderRadius: 16,
//     },
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
//       // ✅ اللون فقط يتغير
//       borderBottomColor: isDark ? "rgba(34, 197, 94, 0.28)" : "#34D399",
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
//       // ✅ كان #DBEAFE
//       backgroundColor: isDark ? "rgba(96, 165, 250, 0.16)" : "#DBEAFE",
//       top: -80,
//       left: -100,
//     },
//     purple: {
//       width: 160,
//       height: 160,
//       // ✅ كان #EDE9FE
//       backgroundColor: isDark ? "rgba(167, 139, 250, 0.16)" : "#EDE9FE",
//       bottom: 80,
//       right: -60,
//     },
//     green: {
//       opacity: 0.5,
//     },
//     gray: {
//       // ✅ كان #E5E7EB
//       backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
//       opacity: 0.6,
//     },
//     light: {
//       width: 120,
//       height: 120,
//       // ✅ كان #F1F5F9
//       backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9",
//       bottom: -40,
//       left: 40,
//     },
//   });
// }

// app/(auth)/login.tsx
// ✅ Login Screen (Expo + RN + Reanimated)
// ✅ Dark/Light via Colors
// ✅ Validation: يقبل العربي/الإنجليزي + رموز محددة فقط
// ✅ اسم المستخدم حتى 64 حرف
// ✅ إظهار أخطاء لكل حقل + خطأ عام
// ✅ Loading أثناء تسجيل الدخول

import { Colors } from "@/constants/theme";
import { login } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
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
import { useDispatch } from "react-redux";

type FieldErrors = {
  username?: string;
  password?: string;
  general?: string;
};

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  const copy = useMemo(
    () => ({
      title: "مرحبًا بعودتك",
      subtitle: "سجّل الدخول للمتابعة",
      usernamePH: "اسم المستخدم",
      passwordPH: "كلمة المرور",
      loginBtn: "تسجيل الدخول",
      loadingBtn: "جارٍ تسجيل الدخول...",
      registerLine: "ليس لديك حساب؟ ",
      registerLink: "إنشاء حساب",
    }),
    []
  );

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
  const USER_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF._-]{2,63}$/;

  // كلمة المرور: عربي/إنجليزي/أرقام + رموز محددة
  // طول من 6 إلى 64
  const PASS_ALLOWED =
    /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

  const validate = (u: string, p: string): FieldErrors => {
    const next: FieldErrors = {};
    const uTrim = u.trim();

    if (!uTrim) {
      next.username = "يرجى إدخال اسم المستخدم";
    } else if (/\s/.test(uTrim)) {
      next.username = "اسم المستخدم لا يجب أن يحتوي على مسافات";
    }

    if (!p) {
      next.password = "يرجى إدخال كلمة المرور";
    } else if (/\s/.test(p)) {
      next.password = "كلمة المرور لا يجب أن تحتوي على مسافات";
    } else if (!PASS_ALLOWED.test(p)) {
      next.password =
        "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64";
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
        text1: "خطأ",
        text2: "تحقق من البيانات المدخلة",
      });
      return;
    }

    setLoading(true);
    clearErrors();

    try {
      const resultAction = await dispatch(
        login({
          username: username.trim().toLowerCase(),
          password,
        })
      );

      if (login.fulfilled.match(resultAction)) {
        Toast.show({
          type: "success",
          text1: "تم بنجاح",
          text2: "تم تسجيل الدخول",
        });
      } else {
        const msg = (resultAction.payload as string) || "بيانات غير صحيحة";
        setErrors({ general: msg });
        triggerErrorAnim();
        Toast.show({
          type: "error",
          text1: "فشل تسجيل الدخول",
          text2: msg,
        });
      }
    } catch {
      setErrors({ general: "حدث خطأ غير متوقع" });
      triggerErrorAnim();
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const floating = (v: any, r = false) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: v.value }, ...(r ? [{ rotate: `${rotate.value}deg` }] : [])],
    }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        {/* Background Shapes */}
        <Animated.View style={[s.circle, s.blue, floating(float1)]} />
        <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
        <Animated.View style={[s.triangle, s.green, floating(float3)]} />
        <Animated.View style={[s.line, s.gray, floating(float1)]} />
        <Animated.View style={[s.circle, s.light, floating(float2)]} />

        <View style={s.content}>
          <Text style={s.title}>{copy.title}</Text>
          <Text style={s.subtitle}>{copy.subtitle}</Text>

          <Animated.View style={userStyle}>
            <TextInput
              placeholder={copy.usernamePH}
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
            <TextInput
              placeholder={copy.passwordPH}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[s.input, !!errors.password && s.inputError]}
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
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
                  <Text style={s.buttonText}>{copy.loadingBtn}</Text>
                </View>
              ) : (
                <Text style={s.buttonText}>{copy.loginBtn}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => !loading && router.push("/(auth)/register")}
            disabled={loading}
          >
            <Text style={s.registerText}>
              {copy.registerLine}
              <Text style={s.link}>{copy.registerLink}</Text>
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