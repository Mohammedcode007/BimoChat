import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

/* ================= TYPES ================= */

type LoginSession = {
  id: string;
  country: string;
  device: string;
  time: string;
};

/* ================= SCREEN ================= */

export default function LoginAlertsScreen() {
  const [sessions, setSessions] = useState<LoginSession[]>([]);

  /* ===== Load sessions ===== */
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('loginSessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    })();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>تنبيهات تسجيل الدخول</Text>

      {sessions.length === 0 && (
        <Text style={styles.empty}>
          لا توجد محاولات تسجيل دخول مسجلة
        </Text>
      )}

      {sessions.map(item => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="phone-portrait-outline" size={22} />
            <View>
              <Text style={styles.mainText}>
                {item.device}
              </Text>
              <Text style={styles.subText}>
                {item.country}
              </Text>
            </View>
          </View>

          <Text style={styles.time}>
            {item.time}
          </Text>
        </View>
      ))}
    </ScrollView>
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
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  mainText: {
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
