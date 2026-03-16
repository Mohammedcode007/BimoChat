// // import { register } from '@/redux/slices/authSlice';
// // import { AppDispatch, RootState } from '@/redux/store';
// // import { useRouter } from 'expo-router';
// // import { useEffect, useState } from 'react';
// // import {
// //   KeyboardAvoidingView,
// //   Platform,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View,
// // } from 'react-native';
// // import Animated, {
// //   useAnimatedStyle,
// //   useSharedValue,
// //   withRepeat,
// //   withSequence,
// //   withTiming,
// // } from 'react-native-reanimated';
// // import { useDispatch, useSelector } from 'react-redux';

// // export default function RegisterScreen() {
// //   const dispatch = useDispatch<AppDispatch>();
// //   const { loading } = useSelector((state: RootState) => state.auth);
// //   const router = useRouter();

// //   const [username, setUsername] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [confirm, setConfirm] = useState('');
// //   const [captchaInput, setCaptchaInput] = useState('');
// //   const [error, setError] = useState('');

// //   /* ================= CAPTCHA ================= */

// //   const generateCaptcha = () => {
// //     const x = Math.floor(Math.random() * 9) + 1;
// //     const y = Math.floor(Math.random() * 9) + 1;
// //     return { a: x, b: y, result: x + y };
// //   };

// //   const [captcha, setCaptcha] = useState(generateCaptcha());

// //   /* ================= ANIMATIONS ================= */

// //   const userX = useSharedValue(-320);
// //   const passX = useSharedValue(320);
// //   const confirmX = useSharedValue(-320);
// //   const captchaX = useSharedValue(320);
// //   const buttonY = useSharedValue(50);

// //   const errorOpacity = useSharedValue(0);
// //   const shakeX = useSharedValue(0);

// //   const float1 = useSharedValue(0);
// //   const float2 = useSharedValue(0);
// //   const float3 = useSharedValue(0);
// //   const rotate = useSharedValue(0);

// //   useEffect(() => {
// //     userX.value = withTiming(0, { duration: 700 });
// //     passX.value = withTiming(0, { duration: 700 });
// //     confirmX.value = withTiming(0, { duration: 700 });
// //     captchaX.value = withTiming(0, { duration: 700 });
// //     buttonY.value = withTiming(0, { duration: 700 });

// //     float1.value = withRepeat(withTiming(30, { duration: 9000 }), -1, true);
// //     float2.value = withRepeat(withTiming(-25, { duration: 11000 }), -1, true);
// //     float3.value = withRepeat(withTiming(20, { duration: 10000 }), -1, true);
// //     rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
// //   }, []);

// //   const showError = (msg: string) => {
// //     setError(msg);
// //     errorOpacity.value = withTiming(1, { duration: 300 });
// //     shakeX.value = withSequence(
// //       withTiming(-8, { duration: 50 }),
// //       withTiming(8, { duration: 50 }),
// //       withTiming(-6, { duration: 50 }),
// //       withTiming(6, { duration: 50 }),
// //       withTiming(0, { duration: 50 })
// //     );
// //   };

// //   /* ================= REGISTER ================= */

// //   const handleRegister = async () => {
// //     if (!username.trim()) return showError('Username is required');

// //     if (password.length < 6)
// //       return showError('Password must be at least 6 characters');

// //     if (password !== confirm)
// //       return showError('Passwords do not match');

// //     if (Number(captchaInput) !== captcha.result) {
// //       setCaptcha(generateCaptcha()); // تحديث الكابتشا عند الخطأ
// //       setCaptchaInput('');
// //       return showError('Captcha is incorrect');
// //     }

// //     const result = await dispatch(register({
// //       username: username.trim().toLowerCase()
// //       , password
// //     }));

// //     if (register.fulfilled.match(result)) {
// //       router.replace('/(tabs)');
// //     } else {
// //       showError(result.payload as string);
// //       setCaptcha(generateCaptcha());
// //       setCaptchaInput('');
// //     }
// //   };

// //   /* ================= ANIMATED STYLES ================= */

// //   const animated = (x: any) =>
// //     useAnimatedStyle(() => ({
// //       transform: [{ translateX: x.value }],
// //     }));

// //   const buttonStyle = useAnimatedStyle(() => ({
// //     transform: [{ translateY: buttonY.value }],
// //   }));

// //   const errorStyle = useAnimatedStyle(() => ({
// //     opacity: errorOpacity.value,
// //     transform: [{ translateX: shakeX.value }],
// //   }));

// //   const floating = (v: any, r = false) =>
// //     useAnimatedStyle(() => ({
// //       transform: [
// //         { translateY: v.value },
// //         ...(r ? [{ rotate: `${rotate.value}deg` }] : []),
// //       ],
// //     }));

// //   return (
// //     <KeyboardAvoidingView
// //       style={{ flex: 1 }}
// //       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //     >
// //       <View style={styles.container}>
// //         {/* ===== Background Shapes ===== */}
// //         <Animated.View style={[styles.circle, styles.blue, floating(float1)]} />
// //         <Animated.View style={[styles.square, styles.purple, floating(float2, true)]} />
// //         <Animated.View style={[styles.triangle, floating(float3)]} />
// //         <Animated.View style={[styles.line, styles.gray, floating(float1)]} />

// //         {/* ===== Content ===== */}
// //         <View style={styles.content}>
// //           <Text style={styles.title}>Create Account</Text>
// //           <Text style={styles.subtitle}>Join the conversation</Text>

// //           <Animated.View style={animated(userX)}>
// //             <TextInput
// //               placeholder="Username"
// //               placeholderTextColor="#94A3B8"
// //               value={username}
// //               onChangeText={setUsername}
// //               style={styles.input}
// //             />
// //           </Animated.View>

// //           <Animated.View style={animated(passX)}>
// //             <TextInput
// //               placeholder="Password"
// //               placeholderTextColor="#94A3B8"
// //               secureTextEntry
// //               value={password}
// //               onChangeText={setPassword}
// //               style={styles.input}
// //             />
// //           </Animated.View>

// //           <Animated.View style={animated(confirmX)}>
// //             <TextInput
// //               placeholder="Confirm Password"
// //               placeholderTextColor="#94A3B8"
// //               secureTextEntry
// //               value={confirm}
// //               onChangeText={setConfirm}
// //               style={styles.input}
// //             />
// //           </Animated.View>

// //           <Animated.View style={animated(captchaX)}>
// //             <TextInput
// //               placeholder={`Captcha: ${captcha.a} + ${captcha.b} = ?`}
// //               placeholderTextColor="#94A3B8"
// //               keyboardType="numeric"
// //               value={captchaInput}
// //               onChangeText={setCaptchaInput}
// //               style={styles.input}
// //             />
// //           </Animated.View>

// //           {/* زر تحديث الكابتشا */}
// //           <TouchableOpacity
// //             onPress={() => {
// //               setCaptcha(generateCaptcha());
// //               setCaptchaInput('');
// //             }}
// //           >
// //             <Text style={styles.refreshCaptcha}>Refresh Captcha</Text>
// //           </TouchableOpacity>

// //           {!!error && (
// //             <Animated.Text style={[styles.error, errorStyle]}>
// //               {error}
// //             </Animated.Text>
// //           )}

// //           <Animated.View style={buttonStyle}>
// //             <TouchableOpacity
// //               style={styles.button}
// //               onPress={handleRegister}
// //               disabled={loading}
// //             >
// //               <Text style={styles.buttonText}>
// //                 {loading ? 'Creating...' : 'Register'}
// //               </Text>
// //             </TouchableOpacity>
// //           </Animated.View>

// //           <TouchableOpacity onPress={() => router.back()}>
// //             <Text style={styles.loginText}>
// //               Already have an account? <Text style={styles.link}>Login</Text>
// //             </Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     </KeyboardAvoidingView>
// //   );
// // }

// // /* ================= STYLES ================= */

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#FFFFFF' },
// //   content: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     paddingHorizontal: 26,
// //     zIndex: 10,
// //   },
// //   title: {
// //     fontSize: 32,
// //     fontWeight: '800',
// //     color: '#0F172A',
// //   },
// //   subtitle: {
// //     fontSize: 14,
// //     color: '#64748B',
// //     marginBottom: 36,
// //   },
// //   input: {
// //     height: 54,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#CBD5E1',
// //     fontSize: 16,
// //     marginBottom: 16,
// //     color: '#0F172A',
// //   },
// //   refreshCaptcha: {
// //     color: '#2563EB',
// //     fontSize: 13,
// //     marginBottom: 12,
// //     fontWeight: '600',
// //   },
// //   button: {
// //     height: 54,
// //     backgroundColor: '#2563EB',
// //     borderRadius: 14,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginTop: 10,
// //   },
// //   buttonText: {
// //     color: '#FFFFFF',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   error: {
// //     color: '#DC2626',
// //     fontSize: 13,
// //     marginBottom: 12,
// //   },
// //   loginText: {
// //     textAlign: 'center',
// //     marginTop: 22,
// //     fontSize: 14,
// //     color: '#64748B',
// //   },
// //   link: { color: '#2563EB', fontWeight: '600' },

// //   circle: { position: 'absolute', borderRadius: 999 },
// //   square: { position: 'absolute', borderRadius: 18 },
// //   triangle: {
// //     position: 'absolute',
// //     width: 0,
// //     height: 0,
// //     borderLeftWidth: 28,
// //     borderRightWidth: 28,
// //     borderBottomWidth: 48,
// //     borderLeftColor: 'transparent',
// //     borderRightColor: 'transparent',
// //     borderBottomColor: '#34D399',
// //     top: 120,
// //     right: 40,
// //     opacity: 0.35,
// //   },
// //   line: {
// //     position: 'absolute',
// //     width: 150,
// //     height: 4,
// //     top: 220,
// //     left: 20,
// //     borderRadius: 2,
// //   },
// //   blue: {
// //     width: 220,
// //     height: 220,
// //     backgroundColor: '#DBEAFE',
// //     top: -80,
// //     left: -100,
// //   },
// //   purple: {
// //     width: 160,
// //     height: 160,
// //     backgroundColor: '#EDE9FE',
// //     bottom: 80,
// //     right: -60,
// //   },
// //   gray: {
// //     backgroundColor: '#E5E7EB',
// //     opacity: 0.6,
// //   },
// // });
// // app/(auth)/register.tsx
// // ✅ Register Screen (Expo + RN + Reanimated)
// // ✅ نفس أفكار Login:
// //   - Colors theme (Light/Dark)
// //   - Validation: عربي/إنجليزي فقط + رموز محددة
// //   - Username حتى 64
// //   - أخطاء لكل حقل + خطأ عام
// //   - Loading حقيقي (من Redux) + تعطيل الأزرار
// //   - CAPTCHA مع Refresh + إعادة توليد عند الخطأ

// import { Colors } from "@/constants/theme";
// import { register } from "@/redux/slices/authSlice";
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
//   username?: string;
//   password?: string;
//   confirm?: string;
//   captcha?: string;
//   general?: string;
// };

// export default function RegisterScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { loading } = useSelector((state: RootState) => state.auth);
//   const router = useRouter();

//   const colorScheme = useColorScheme();
//   const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
//   const isDark = colorScheme === "dark";
//   const s = useMemo(() => makeStyles(theme, isDark), [theme, isDark]);

//   const copy = useMemo(
//     () => ({
//       title: "إنشاء حساب",
//       subtitle: "انضم إلى المحادثة",
//       usernamePH: "اسم المستخدم",
//       passwordPH: "كلمة المرور",
//       confirmPH: "تأكيد كلمة المرور",
//       captchaPH: (a: number, b: number) => `كابتشا: ${a} + ${b} = ؟`,
//       refreshCaptcha: "تحديث الكابتشا",
//       registerBtn: "إنشاء حساب",
//       loadingBtn: "جارٍ الإنشاء...",
//       loginLine: "لديك حساب بالفعل؟ ",
//       loginLink: "تسجيل الدخول",
//     }),
//     []
//   );

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [captchaInput, setCaptchaInput] = useState("");
//   const [errors, setErrors] = useState<FieldErrors>({});

//   /* ================= CAPTCHA ================= */
//   const generateCaptcha = () => {
//     const x = Math.floor(Math.random() * 9) + 1;
//     const y = Math.floor(Math.random() * 9) + 1;
//     return { a: x, b: y, result: x + y };
//   };
//   const [captcha, setCaptcha] = useState(generateCaptcha());

//   const refreshCaptcha = () => {
//     setCaptcha(generateCaptcha());
//     setCaptchaInput("");
//   };

//   /* ================= ANIMATIONS ================= */
//   const userX = useSharedValue(-320);
//   const passX = useSharedValue(320);
//   const confirmX = useSharedValue(-320);
//   const captchaX = useSharedValue(320);
//   const buttonY = useSharedValue(50);

//   const errorOpacity = useSharedValue(0);
//   const shakeX = useSharedValue(0);

//   const float1 = useSharedValue(0);
//   const float2 = useSharedValue(0);
//   const float3 = useSharedValue(0);
//   const rotate = useSharedValue(0);

//   useEffect(() => {
//     userX.value = withTiming(0, { duration: 700 });
//     passX.value = withTiming(0, { duration: 700 });
//     confirmX.value = withTiming(0, { duration: 700 });
//     captchaX.value = withTiming(0, { duration: 700 });
//     buttonY.value = withTiming(0, { duration: 700 });

//     float1.value = withRepeat(withTiming(30, { duration: 9000 }), -1, true);
//     float2.value = withRepeat(withTiming(-25, { duration: 11000 }), -1, true);
//     float3.value = withRepeat(withTiming(20, { duration: 10000 }), -1, true);
//     rotate.value = withRepeat(withTiming(360, { duration: 30000 }), -1);
//   }, []);

//   const triggerErrorAnim = () => {
//     errorOpacity.value = withTiming(1, { duration: 220 });
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

//   /* ================= Validation ================= */
//   // Username: عربي/إنجليزي/أرقام + . _ -
//   // طول 3..64، يبدأ بحرف/رقم
//   const USER_ALLOWED =
//     /^[A-Za-z0-9\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF._-]{2,63}$/;

//   // Password: عربي/إنجليزي/أرقام + رموز محددة
//   // طول 6..64، بدون مسافات
//   const PASS_ALLOWED =
//     /^[A-Za-z0-9\u0600-\u06FF!@#$%^&*()_+\-=.,?\/\\:;'"[\]{}<>]{6,64}$/;

//   const validate = (u: string, p: string, c: string, cap: string): FieldErrors => {
//     const next: FieldErrors = {};
//     const uTrim = u.trim();

//     if (!uTrim) {
//       next.username = "يرجى إدخال اسم المستخدم";
//     } else if (/\s/.test(uTrim)) {
//       next.username = "اسم المستخدم لا يجب أن يحتوي على مسافات";
//     } else if (!USER_ALLOWED.test(uTrim)) {
//       next.username =
//         "اسم المستخدم غير صالح. مسموح: عربي/إنجليزي/أرقام + الرموز ( . _ - ) وطول من 3 إلى 64";
//     }

//     if (!p) {
//       next.password = "يرجى إدخال كلمة المرور";
//     } else if (/\s/.test(p)) {
//       next.password = "كلمة المرور لا يجب أن تحتوي على مسافات";
//     } else if (!PASS_ALLOWED.test(p)) {
//       next.password =
//         "كلمة المرور غير صالحة. مسموح: عربي/إنجليزي/أرقام + رموز محددة وطول من 6 إلى 64";
//     }

//     if (!c) {
//       next.confirm = "يرجى تأكيد كلمة المرور";
//     } else if (p && c && p !== c) {
//       next.confirm = "كلمتا المرور غير متطابقتين";
//     }

//     if (!cap) {
//       next.captcha = "يرجى إدخال ناتج الكابتشا";
//     } else if (Number(cap) !== captcha.result) {
//       next.captcha = "الكابتشا غير صحيحة";
//     }

//     return next;
//   };

//   /* ================= REGISTER ================= */
//   const handleRegister = async () => {
//     if (loading) return;

//     const v = validate(username, password, confirm, captchaInput);

//     // لو الكابتشا غلط: نحدثها فورًا (نفس منطقك)
//     if (v.captcha) {
//       refreshCaptcha();
//     }

//     if (v.username || v.password || v.confirm || v.captcha) {
//       setErrors(v);
//       triggerErrorAnim();
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "تحقق من البيانات المدخلة",
//       });
//       return;
//     }

//     clearErrors();

//     try {
//       const result = await dispatch(
//         register({
//           username: username.trim().toLowerCase(),
//           password,
//         })
//       );

//       if (register.fulfilled.match(result)) {
//         Toast.show({
//           type: "success",
//           text1: "تم بنجاح",
//           text2: "تم إنشاء الحساب",
//         });
//         router.replace("/(auth)/choose-location");
//         // router.replace("/(tabs)");
//       } else {
//         const msg = (result.payload as string) || "تعذر إنشاء الحساب";
//         setErrors({ general: msg });
//         triggerErrorAnim();
//         Toast.show({
//           type: "error",
//           text1: "فشل إنشاء الحساب",
//           text2: msg,
//         });
//         refreshCaptcha();
//       }
//     } catch {
//       setErrors({ general: "حدث خطأ غير متوقع" });
//       triggerErrorAnim();
//       Toast.show({
//         type: "error",
//         text1: "خطأ",
//         text2: "حدث خطأ غير متوقع",
//       });
//       refreshCaptcha();
//     }
//   };

//   /* ================= Animated Styles ================= */
//   const slideX = (x: any) =>
//     useAnimatedStyle(() => ({
//       transform: [{ translateX: x.value }],
//     }));

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
//       transform: [{ translateY: v.value }, ...(r ? [{ rotate: `${rotate.value}deg` }] : [])],
//     }));

//   // إزالة أخطاء كل حقل أثناء الكتابة
//   const onChangeUsername = (t: string) => {
//     setUsername(t);
//     if (errors.username || errors.general) {
//       setErrors((p) => ({ ...p, username: undefined, general: undefined }));
//       errorOpacity.value = withTiming(0, { duration: 120 });
//     }
//   };
//   const onChangePassword = (t: string) => {
//     setPassword(t);
//     if (errors.password || errors.general) {
//       setErrors((p) => ({ ...p, password: undefined, general: undefined }));
//       errorOpacity.value = withTiming(0, { duration: 120 });
//     }
//   };
//   const onChangeConfirm = (t: string) => {
//     setConfirm(t);
//     if (errors.confirm || errors.general) {
//       setErrors((p) => ({ ...p, confirm: undefined, general: undefined }));
//       errorOpacity.value = withTiming(0, { duration: 120 });
//     }
//   };
//   const onChangeCaptcha = (t: string) => {
//     // ✅ نقبل أرقام فقط
//     const cleaned = t.replace(/[^\d]/g, "");
//     setCaptchaInput(cleaned);
//     if (errors.captcha || errors.general) {
//       setErrors((p) => ({ ...p, captcha: undefined, general: undefined }));
//       errorOpacity.value = withTiming(0, { duration: 120 });
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: theme.background }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <View style={s.container}>
//         {/* ===== Background Shapes ===== */}
//         <Animated.View style={[s.circle, s.blue, floating(float1)]} />
//         <Animated.View style={[s.square, s.purple, floating(float2, true)]} />
//         <Animated.View style={[s.triangle, s.green, floating(float3)]} />
//         <Animated.View style={[s.line, s.gray, floating(float1)]} />
//         <Animated.View style={[s.circle, s.light, floating(float2)]} />

//         {/* ===== Content ===== */}
//         <View style={s.content}>
//           <Text style={s.title}>{copy.title}</Text>
//           <Text style={s.subtitle}>{copy.subtitle}</Text>

//           {/* Username */}
//           <Animated.View style={slideX(userX)}>
//             <TextInput
//               placeholder={copy.usernamePH}
//               placeholderTextColor={theme.subtleText as any}
//               value={username}
//               onChangeText={onChangeUsername}
//               style={[s.input, !!errors.username && s.inputError]}
//               editable={!loading}
//               autoCorrect={false}
//               autoCapitalize="none"
//               returnKeyType="next"
//             />
//             {!!errors.username && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.username}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           {/* Password */}
//           <Animated.View style={slideX(passX)}>
//             <TextInput
//               placeholder={copy.passwordPH}
//               placeholderTextColor={theme.subtleText as any}
//               secureTextEntry
//               value={password}
//               onChangeText={onChangePassword}
//               style={[s.input, !!errors.password && s.inputError]}
//               editable={!loading}
//               returnKeyType="next"
//             />
//             {!!errors.password && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.password}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           {/* Confirm */}
//           <Animated.View style={slideX(confirmX)}>
//             <TextInput
//               placeholder={copy.confirmPH}
//               placeholderTextColor={theme.subtleText as any}
//               secureTextEntry
//               value={confirm}
//               onChangeText={onChangeConfirm}
//               style={[s.input, !!errors.confirm && s.inputError]}
//               editable={!loading}
//               returnKeyType="next"
//             />
//             {!!errors.confirm && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.confirm}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           {/* Captcha */}
//           <Animated.View style={slideX(captchaX)}>
//             <TextInput
//               placeholder={copy.captchaPH(captcha.a, captcha.b)}
//               placeholderTextColor={theme.subtleText as any}
//               keyboardType="numeric"
//               value={captchaInput}
//               onChangeText={onChangeCaptcha}
//               style={[s.input, !!errors.captcha && s.inputError]}
//               editable={!loading}
//               returnKeyType="done"
//               onSubmitEditing={handleRegister}
//             />
//             {!!errors.captcha && (
//               <Animated.Text style={[s.fieldError, errorAnimStyle]}>
//                 {errors.captcha}
//               </Animated.Text>
//             )}
//           </Animated.View>

//           {/* Refresh Captcha */}
//           <TouchableOpacity onPress={() => !loading && refreshCaptcha()} disabled={loading}>
//             <Text style={[s.refreshCaptcha, loading && { opacity: 0.6 }]}>
//               {copy.refreshCaptcha}
//             </Text>
//           </TouchableOpacity>

//           {/* General error */}
//           {!!errors.general && (
//             <Animated.Text style={[s.error, errorAnimStyle]}>{errors.general}</Animated.Text>
//           )}

//           {/* Button */}
//           <Animated.View style={buttonStyle}>
//             <TouchableOpacity
//               style={[s.button, loading && s.buttonDisabled]}
//               onPress={handleRegister}
//               disabled={loading}
//               activeOpacity={0.9}
//             >
//               {loading ? (
//                 <View style={s.loadingRow}>
//                   <ActivityIndicator />
//                   <Text style={s.buttonText}>{copy.loadingBtn}</Text>
//                 </View>
//               ) : (
//                 <Text style={s.buttonText}>{copy.registerBtn}</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() => !loading && router.replace("/(auth)/login")}
//             disabled={loading}
//           >
//             <Text style={[s.loginText, loading && { opacity: 0.6 }]}>
//               {copy.loginLine}
//               <Text style={s.link}>{copy.loginLink}</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// /* ================= STYLES ================= */
// function makeStyles(theme: any, isDark: boolean) {
//   return StyleSheet.create({
//     container: { flex: 1, backgroundColor: theme.background },
//     content: {
//       flex: 1,
//       justifyContent: "center",
//       paddingHorizontal: 26,
//       zIndex: 10,
//     },
//     title: { fontSize: 32, fontWeight: "800", color: theme.text },
//     subtitle: { fontSize: 14, color: theme.mutedText, marginBottom: 36 },

//     input: {
//       height: 54,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.border,
//       fontSize: 16,
//       marginBottom: 10,
//       color: theme.text,
//     },
//     inputError: { borderBottomColor: theme.danger },

//     fieldError: {
//       color: theme.danger,
//       fontSize: 12.5,
//       marginBottom: 10,
//       fontWeight: "700",
//     },

//     refreshCaptcha: {
//       color: theme.tint,
//       fontSize: 13,
//       marginBottom: 12,
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
//     buttonDisabled: { opacity: 0.8 },

//     loadingRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 10,
//     },

//     buttonText: { color: theme.primaryText, fontSize: 16, fontWeight: "600" },

//     error: {
//       color: theme.danger,
//       fontSize: 13,
//       marginBottom: 12,
//       fontWeight: "800",
//     },

//     loginText: {
//       textAlign: "center",
//       marginTop: 22,
//       fontSize: 14,
//       color: theme.mutedText,
//       fontWeight: "700",
//     },
//     link: { color: theme.tint, fontWeight: "900" },

//     /* ===== Shapes ===== */
//     circle: { position: "absolute", borderRadius: 999 },
//     square: { position: "absolute", borderRadius: 18 },

//     triangle: {
//       position: "absolute",
//       width: 0,
//       height: 0,
//       borderLeftWidth: 28,
//       borderRightWidth: 28,
//       borderBottomWidth: 48,
//       borderLeftColor: "transparent",
//       borderRightColor: "transparent",
//       borderBottomColor: isDark ? "rgba(34, 197, 94, 0.28)" : "#34D399",
//       top: 120,
//       right: 40,
//       opacity: 0.35,
//     },

//     line: {
//       position: "absolute",
//       width: 150,
//       height: 4,
//       top: 220,
//       left: 20,
//       borderRadius: 2,
//     },

//     blue: {
//       width: 220,
//       height: 220,
//       backgroundColor: isDark ? "rgba(96, 165, 250, 0.16)" : "#DBEAFE",
//       top: -80,
//       left: -100,
//     },

//     purple: {
//       width: 160,
//       height: 160,
//       backgroundColor: isDark ? "rgba(167, 139, 250, 0.16)" : "#EDE9FE",
//       bottom: 80,
//       right: -60,
//     },

//     gray: {
//       backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB",
//       opacity: 0.6,
//     },

//     light: {
//       width: 120,
//       height: 120,
//       backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9",
//       bottom: -40,
//       left: 40,
//     },

//     green: { opacity: 0.5 },
//   });
// }

// app/(auth)/register.tsx
// ✅ Register Screen (Expo + RN + Reanimated)
// ✅ نفس أفكار Login:
//   - Colors theme (Light/Dark)
//   - Validation: عربي/إنجليزي فقط + رموز محددة
//   - Username حتى 64
//   - أخطاء لكل حقل + خطأ عام
//   - Loading حقيقي (من Redux) + تعطيل الأزرار
//   - CAPTCHA مع Refresh + إعادة توليد عند الخطأ

import { Colors } from "@/constants/theme";
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

  const colorScheme = useColorScheme();
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