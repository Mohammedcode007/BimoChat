import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français' },
];

export default function LanguageSettingsScreen() {
  const [selected, setSelected] = useState('ar');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>اللغة</Text>

      <View style={styles.card}>
        {LANGUAGES.map(l => (
          <TouchableOpacity
            key={l.id}
            style={styles.row}
            onPress={() => setSelected(l.id)}
          >
            <Text>{l.name}</Text>
            {selected === l.id && (
              <Ionicons name="checkmark" size={20} color="#6D5DF6" />
            )}
          </TouchableOpacity>
        ))}
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
