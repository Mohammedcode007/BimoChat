import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>سياسة الخصوصية</Text>

      <Text style={styles.text}>
        نحن نحترم خصوصية المستخدمين ونلتزم بحماية
        بياناتهم وعدم مشاركتها مع أي طرف ثالث.
        {"\n\n"}
        يتم استخدام البيانات فقط لتحسين تجربة المستخدم
        داخل التطبيق.
      </Text>
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
