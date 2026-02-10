import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export default function RegisterScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  /* ===== Captcha ===== */
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const captchaResult = a + b;

  /* ===== Animations ===== */
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

  const handleRegister = async () => {
    if (!username.trim()) return showError('Username is required');
    if (password.length < 6)
      return showError('Password must be at least 6 characters');
    if (password !== confirm)
      return showError('Passwords do not match');
    if (Number(captchaInput) !== captchaResult)
      return showError('Captcha is incorrect');

    // بعد التسجيل (تجريبي)
    await login('token-123');
  };

  /* ===== Animated Styles ===== */
  const animated = (x: any) =>
    useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
  }));

  const errorStyle = useAnimatedStyle(() => ({
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* ===== Background Shapes ===== */}
        <Animated.View style={[styles.circle, styles.blue, floating(float1)]} />
        <Animated.View style={[styles.square, styles.purple, floating(float2, true)]} />
        <Animated.View style={[styles.triangle, floating(float3)]} />
        <Animated.View style={[styles.line, styles.gray, floating(float1)]} />

        {/* ===== Content ===== */}
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the conversation</Text>

          <Animated.View style={animated(userX)}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View style={animated(passX)}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View style={animated(confirmX)}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View style={animated(captchaX)}>
            <TextInput
              placeholder={`Captcha: ${a} + ${b} = ?`}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={captchaInput}
              onChangeText={setCaptchaInput}
              style={styles.input}
            />
          </Animated.View>

          {!!error && (
            <Animated.Text style={[styles.error, errorStyle]}>
              {error}
            </Animated.Text>
          )}

          <Animated.View style={buttonStyle}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.link}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 36,
  },
  input: {
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    fontSize: 16,
    marginBottom: 16,
    color: '#0F172A',
  },
  button: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 14,
    color: '#64748B',
  },
  link: { color: '#2563EB', fontWeight: '600' },

  /* Shapes */
  circle: { position: 'absolute', borderRadius: 999 },
  square: { position: 'absolute', borderRadius: 18 },
  triangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 48,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#34D399',
    top: 120,
    right: 40,
    opacity: 0.35,
  },
  line: {
    position: 'absolute',
    width: 150,
    height: 4,
    top: 220,
    left: 20,
    borderRadius: 2,
  },
  blue: {
    width: 220,
    height: 220,
    backgroundColor: '#DBEAFE',
    top: -80,
    left: -100,
  },
  purple: {
    width: 160,
    height: 160,
    backgroundColor: '#EDE9FE',
    bottom: 80,
    right: -60,
  },
  gray: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
});
