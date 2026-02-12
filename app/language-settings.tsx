import { useLanguage } from '@/context/LanguageContext';
import i18n from '@/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
];

export default function LanguageSettingsScreen() {
  const { language, changeLanguage } = useLanguage();

  return (
                <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t("language")}</Text>

      <View style={styles.card}>
        {LANGUAGES.map(l => (
          <TouchableOpacity
            key={l.id}
            style={styles.row}
            onPress={() => changeLanguage(l.id)}
          >
            <Text>{l.name}</Text>
            {language === l.id && (
              <Ionicons name="checkmark" size={20} color="#6D5DF6" />
            )}
          </TouchableOpacity>
        ))}
      </View>
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
