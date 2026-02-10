import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyAccountScreen() {
  const [sent, setSent] = useState(false);

  return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

    <View style={styles.container}>
      <Text style={styles.header}>تأكيد الحساب</Text>

      <View style={styles.card}>
        <Ionicons
          name="shield-checkmark-outline"
          size={48}
          color="#6D5DF6"
        />

        <Text style={styles.title}>
          توثيق الحساب
        </Text>

        <Text style={styles.desc}>
          يمكنك إرسال طلب لتوثيق حسابك.
          سيتم مراجعة الطلب من فريق الدعم.
        </Text>

        {!sent ? (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => setSent(true)}
          >
            <Text style={styles.sendText}>
              إرسال طلب التوثيق
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sentBox}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#16A34A"
            />
            <Text style={styles.sentText}>
              تم إرسال طلب التوثيق
            </Text>
          </View>
        )}
      </View>
    </View>
        </SafeAreaView>

  );
}
const styles = StyleSheet.create({
      safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
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
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },
  desc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  sendBtn: {
    backgroundColor: '#6D5DF6',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  sendText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 14,
  },
  sentText: {
    color: '#16A34A',
    fontWeight: '700',
  },
});
