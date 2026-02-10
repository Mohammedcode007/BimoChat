import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const COLORS = [
  '#6D5DF6',
  '#22C55E',
  '#F97316',
  '#EF4444',
  '#0EA5E9',
  '#A855F7',
];

export default function ThemeSettingsScreen() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [color, setColor] = useState('#6D5DF6');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>الألوان والثيم</Text>

      {/* ===== Theme Mode ===== */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>وضع الثيم</Text>

        <ThemeOption
          label="فاتح"
          active={theme === 'light'}
          onPress={() => setTheme('light')}
        />
        <ThemeOption
          label="داكن"
          active={theme === 'dark'}
          onPress={() => setTheme('dark')}
        />
        <ThemeOption
          label="تلقائي (حسب النظام)"
          active={theme === 'system'}
          onPress={() => setTheme('system')}
        />
      </View>

      {/* ===== Colors ===== */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>اللون الأساسي</Text>

        <View style={styles.colorsRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                color === c && styles.activeColor,
              ]}
              onPress={() => setColor(c)}
            >
              {color === c && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ===== Preview ===== */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>معاينة</Text>

        <View
          style={[
            styles.previewBox,
            {
              backgroundColor: theme === 'dark' ? '#111827' : '#FFF',
            },
          ]}
        >
          <Text
            style={{
              color: theme === 'dark' ? '#FFF' : '#111827',
              marginBottom: 8,
            }}
          >
            هذا مثال لشكل التطبيق
          </Text>

          <View
            style={[
              styles.previewButton,
              { backgroundColor: color },
            ]}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>
              زر رئيسي
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function ThemeOption({ label, active, onPress }: any) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <Text>{label}</Text>
      {active && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#6D5DF6"
        />
      )}
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeColor: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  previewBox: {
    borderRadius: 14,
    padding: 16,
  },
  previewButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
