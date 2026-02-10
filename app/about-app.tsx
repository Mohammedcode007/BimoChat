import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AboutAppScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>حول التطبيق</Text>

      <View style={styles.card}>
        <Ionicons name="chatbubble-ellipses-outline" size={60} color="#6D5DF6" />
        <Text style={styles.appName}>Bimo</Text>
        <Text style={styles.version}>الإصدار 1.0.0</Text>

        <Text style={styles.desc}>
          تطبيق دردشة حديث يهدف إلى توفير تجربة تواصل
          بسيطة وآمنة وسريعة للمستخدمين.
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
  },
  version: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
