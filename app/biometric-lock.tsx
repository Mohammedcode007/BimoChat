import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

export default function BiometricLockScreen() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);

  /* ===== Check device support ===== */
  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setSupported(hasHardware && isEnrolled);
    })();
  }, []);

  /* ===== Toggle biometric ===== */
  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تأكيد البصمة لتفعيل القفل',
        cancelLabel: 'إلغاء',
      });

      if (!auth.success) {
        Alert.alert('فشل التحقق', 'لم يتم تفعيل القفل');
        return;
      }
    }

    setEnabled(value);
  };

  if (!supported) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>قفل التطبيق</Text>
        <Text style={styles.warning}>
          جهازك لا يدعم البصمة أو لم يتم إعدادها
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>قفل التطبيق بالبصمة</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.text}>تفعيل القفل بالبصمة</Text>
          <Switch value={enabled} onValueChange={toggleBiometric} />
        </View>

        <Text style={styles.note}>
          عند التفعيل، سيُطلب التحقق بالبصمة عند فتح التطبيق
        </Text>
      </View>
    </View>
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },
  warning: {
    fontSize: 15,
    color: '#E53935',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
