// import { Colors } from '@/constants/theme';
// import { login } from '@/redux/slices/authSlice';
// import { AppDispatch } from '@/redux/store';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   View
// } from 'react-native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withRepeat,
//   withSequence,
//   withTiming,
// } from 'react-native-reanimated';
// import Toast from 'react-native-toast-message';
// import { useDispatch } from 'react-redux';

// export default function LoginScreen() {
//   const dispatch = useDispatch<AppDispatch>();

//   // const { login } = useAuth();
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

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

// const handleLogin = async () => {

//   if (!username || !password) {
//     Toast.show({
//       type: "error",
//       text1: "خطأ",
//       text2: "يرجى إدخال اسم المستخدم وكلمة المرور",
//     });
//     return;
//   }

//   try {

//     const resultAction = await dispatch(
//       login({
//         username: username.trim().toLowerCase(), // ✅ هنا التحويل
//         password,
//       })
//     );

//     if (login.fulfilled.match(resultAction)) {

//       Toast.show({
//         type: "success",
//         text1: "تم بنجاح",
//         text2: "تم تسجيل الدخول",
//       });

//     } else {

//       Toast.show({
//         type: "error",
//         text1: "فشل تسجيل الدخول",
//         text2: (resultAction.payload as string) || "بيانات غير صحيحة",
//       });

//     }

//   } catch {

//     Toast.show({
//       type: "error",
//       text1: "خطأ",
//       text2: "حدث خطأ غير متوقع",
//     });

//   }
// };




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
//       transform: [
//         { translateY: v.value },
//         ...(r ? [{ rotate: `${rotate.value}deg` }] : []),
//       ],
//     }));

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         {/* ================= Background Shapes ================= */}
//         <Animated.View style={[styles.circle, styles.blue, floating(float1)]} />
//         <Animated.View style={[styles.square, styles.purple, floating(float2, true)]} />
//         <Animated.View style={[styles.triangle, styles.green, floating(float3)]} />
//         <Animated.View style={[styles.line, styles.gray, floating(float1)]} />
//         <Animated.View style={[styles.circle, styles.light, floating(float2)]} />

//         {/* ================= Content ================= */}
//         <View style={styles.content}>
//           <Text style={styles.title}>Welcome Back</Text>
//           <Text style={styles.subtitle}>Login to continue chatting</Text>

//           <Animated.View style={userStyle}>
//             <TextInput
//               placeholder="Username"
//               placeholderTextColor="#94A3B8"
//               value={username}
//               onChangeText={setUsername}
//               style={styles.input}
//             />
//           </Animated.View>

//           <Animated.View style={passStyle}>
//             <TextInput
//               placeholder="Password"
//               placeholderTextColor="#94A3B8"
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//               style={styles.input}
//             />
//           </Animated.View>

//           {!!error && (
//             <Animated.Text style={[styles.error, errorStyle]}>
//               {error}
//             </Animated.Text>
//           )}

//           <Animated.View style={buttonStyle}>
//             <TouchableOpacity style={styles.button} onPress={handleLogin}>
//               <Text style={styles.buttonText}>Login</Text>
//             </TouchableOpacity>
//           </Animated.View>

//           {/* Register */}
//           <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
//             <Text style={styles.registerText}>
//               Don’t have an account? <Text style={styles.link}>Register</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 26,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: 34,
//     fontWeight: '800',
//     color: '#0F172A',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#64748B',
//     marginBottom: 40,
//   },
//   input: {
//     height: 54,
//     borderBottomWidth: 1,
//     borderBottomColor: '#CBD5E1',
//     fontSize: 16,
//     marginBottom: 16,
//     color: '#0F172A',
//   },
//   button: {
//     height: 54,
//     backgroundColor: '#2563EB',
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   error: {
//     color: '#DC2626',
//     fontSize: 13,
//     marginBottom: 12,
//   },
//   registerText: {
//     textAlign: 'center',
//     marginTop: 22,
//     fontSize: 14,
//     color: '#64748B',
//   },
//   link: {
//     color: '#2563EB',
//     fontWeight: '600',
//   },

//   /* ===== Shapes ===== */
//   circle: {
//     position: 'absolute',
//     borderRadius: 999,
//   },
//   square: {
//     position: 'absolute',
//     borderRadius: 16,
//   },
//   triangle: {
//     position: 'absolute',
//     width: 0,
//     height: 0,
//     borderLeftWidth: 30,
//     borderRightWidth: 30,
//     borderBottomWidth: 50,
//     borderStyle: 'solid',
//     backgroundColor: 'transparent',
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderBottomColor: '#34D399',
//     top: 120,
//     right: 40,
//     opacity: 0.4,
//   },
//   line: {
//     position: 'absolute',
//     width: 140,
//     height: 4,
//     top: 200,
//     left: 20,
//     borderRadius: 2,
//   },

//   blue: {
//     width: 220,
//     height: 220,
//     backgroundColor: '#DBEAFE',
//     top: -80,
//     left: -100,
//   },
//   purple: {
//     width: 160,
//     height: 160,
//     backgroundColor: '#EDE9FE',
//     bottom: 80,
//     right: -60,
//   },
//   green: {
//     opacity: 0.5,
//   },
//   gray: {
//     backgroundColor: '#E5E7EB',
//     opacity: 0.6,
//   },
//   light: {
//     width: 120,
//     height: 120,
//     backgroundColor: '#F1F5F9',
//     bottom: -40,
//     left: 40,
//   },
// });
import { Colors } from "@/constants/theme";
import { login } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
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

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

  // ✅ نصوص فقط (عربي)
  const copy = useMemo(
    () => ({
      title: "مرحبًا بعودتك",
      subtitle: "سجّل الدخول للمتابعة",
      usernamePH: "اسم المستخدم",
      passwordPH: "كلمة المرور",
      loginBtn: "تسجيل الدخول",
      registerLine: "ليس لديك حساب؟ ",
      registerLink: "إنشاء حساب",
    }),
    []
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* ================= Inputs Animation ================= */
  const userX = useSharedValue(-320);
  const passX = useSharedValue(320);
  const buttonY = useSharedValue(50);
  const errorOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  /* ================= Background Shapes ================= */
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Entrance
    userX.value = withTiming(0, { duration: 700 });
    passX.value = withTiming(0, { duration: 700 });
    buttonY.value = withTiming(0, { duration: 700 });

    // Background motion
    float1.value = withRepeat(withTiming(30, { duration: 8000 }), -1, true);
    float2.value = withRepeat(withTiming(-25, { duration: 10000 }), -1, true);
    float3.value = withRepeat(withTiming(20, { duration: 9000 }), -1, true);
    rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
  }, []);

  const showError = (msg: string) => {
    setError(msg);
    errorOpacity.value = withTiming(1, { duration: 300 });
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "يرجى إدخال اسم المستخدم وكلمة المرور",
      });
      showError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

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
        setError("");
        errorOpacity.value = withTiming(0, { duration: 200 });
      } else {
        const msg = (resultAction.payload as string) || "بيانات غير صحيحة";
        Toast.show({
          type: "error",
          text1: "فشل تسجيل الدخول",
          text2: msg,
        });
        showError(msg);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: "حدث خطأ غير متوقع",
      });
      showError("حدث خطأ غير متوقع");
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
  }));

  const errorStyle = useAnimatedStyle(() => ({
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
        {/* ================= Background Shapes ================= */}
        <Animated.View style={[s.circle, s.blue, floating(float1)]} />
        <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
        <Animated.View style={[s.triangle, s.green, floating(float3)]} />
        <Animated.View style={[s.line, s.gray, floating(float1)]} />
        <Animated.View style={[s.circle, s.light, floating(float2)]} />

        {/* ================= Content ================= */}
        <View style={s.content}>
          <Text style={s.title}>{copy.title}</Text>
          <Text style={s.subtitle}>{copy.subtitle}</Text>

          <Animated.View style={userStyle}>
            <TextInput
              placeholder={copy.usernamePH}
              placeholderTextColor={theme.subtleText as any}
              value={username}
              onChangeText={setUsername}
              style={s.input}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View style={passStyle}>
            <TextInput
              placeholder={copy.passwordPH}
              placeholderTextColor={theme.subtleText as any}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={s.input}
            />
          </Animated.View>

          {!!error && <Animated.Text style={[s.error, errorStyle]}>{error}</Animated.Text>}

          <Animated.View style={buttonStyle}>
            <TouchableOpacity style={s.button} onPress={handleLogin} activeOpacity={0.9}>
              <Text style={s.buttonText}>{copy.loginBtn}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register */}
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} activeOpacity={0.9}>
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

/* ================= STYLES ================= */

function makeStyles(theme: any, isDark: boolean) {
  // ✅ الحفاظ على نفس التصميم + تطبيق dark mode (ألوان فقط)
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
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
      textAlign: "left",
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
      marginBottom: 16,
      color: theme.text,
    },
    button: {
      height: 54,
      backgroundColor: theme.primary, // ✅ light/dark
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
      fontWeight: "700",
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

    /* ===== Shapes (same positions/sizes — colors become theme-aware) ===== */
    circle: {
      position: "absolute",
      borderRadius: 999,
    },
    square: {
      position: "absolute",
      borderRadius: 16,
    },
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
      // ✅ اللون فقط يتغير
      borderBottomColor: isDark ? "rgba(34, 197, 94, 0.28)" : "#34D399",
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
      // ✅ كان #DBEAFE
      backgroundColor: isDark ? "rgba(96, 165, 250, 0.16)" : "#DBEAFE",
      top: -80,
      left: -100,
    },
    purple: {
      width: 160,
      height: 160,
      // ✅ كان #EDE9FE
      backgroundColor: isDark ? "rgba(167, 139, 250, 0.16)" : "#EDE9FE",
      bottom: 80,
      right: -60,
    },
    green: {
      opacity: 0.5,
    },
    gray: {
      // ✅ كان #E5E7EB
      backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
      opacity: 0.6,
    },
    light: {
      width: 120,
      height: 120,
      // ✅ كان #F1F5F9
      backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9",
      bottom: -40,
      left: 40,
    },
  });
}