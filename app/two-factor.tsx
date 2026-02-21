import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TwoFactorScreen() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<'idle' | 'verify'>('idle');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  /* ===== Load saved state ===== */
  useEffect(() => {
    AsyncStorage.getItem('twoFactorEnabled').then(v => {
      if (v === '1') setEnabled(true);
    });
  }, []);

  /* ===== Generate OTP ===== */
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(otp);

    // محاكاة إرسال الكود
    Alert.alert(
      'رمز التحقق',
      'تم إرسال رمز التحقق (محاكاة – راجع Console)'
    );

    setStep('verify');
  };

  /* ===== Toggle 2FA ===== */
  const toggle2FA = async (value: boolean) => {
    if (value) {
      generateOTP();
    } else {
      await AsyncStorage.setItem('twoFactorEnabled', '0');
      setEnabled(false);
      setStep('idle');
    }
  };

  /* ===== Verify OTP ===== */
  const verifyCode = async () => {
    if (code === generatedCode) {
      await AsyncStorage.setItem('twoFactorEnabled', '1');
      setEnabled(true);
      setStep('idle');
      setCode('');
      Alert.alert('تم التفعيل', 'تم تفعيل التحقق بخطوتين بنجاح');
    } else {
      Alert.alert('خطأ', 'رمز التحقق غير صحيح');
    }
  };

  return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    
    <View style={styles.container}>
      <Text style={styles.header}>التحقق بخطوتين</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>تفعيل التحقق بخطوتين</Text>
          <Switch value={enabled} onValueChange={toggle2FA} />
        </View>

        <Text style={styles.note}>
          عند التفعيل، سيُطلب رمز تحقق إضافي عند تسجيل الدخول
        </Text>
      </View>

      {step === 'verify' && (
        <View style={styles.card}>
          <Text style={styles.verifyTitle}>
            أدخل رمز التحقق
          </Text>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            placeholder="******"
          />

          <TouchableOpacity style={styles.btn} onPress={verifyCode}>
            <Text style={styles.btnText}>تأكيد الرمز</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },
  verifyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 6,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#6D5DF6',
    padding: 14,
    borderRadius: 14,
  },
  btnText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
