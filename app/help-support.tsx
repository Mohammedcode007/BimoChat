import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>المساعدة والدعم</Text>

      <View style={styles.card}>
        <SupportItem icon="mail-outline" text="تواصل عبر البريد الإلكتروني" />
        <SupportItem icon="chatbox-outline" text="الدردشة مع الدعم" />
        <SupportItem icon="help-buoy-outline" text="الأسئلة الشائعة" />
      </View>
    </View>
  );
}

function SupportItem({ icon, text }: any) {
  return (
    <TouchableOpacity style={styles.row}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} />
        <Text>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
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
});
