import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FontOption = {
  id: string;
  label: string;
  fontFamily: string;
};

const FONTS: FontOption[] = [
  { id: '1', label: 'افتراضي', fontFamily: 'System' },
  { id: '2', label: 'Sans', fontFamily: 'sans-serif' },
  { id: '3', label: 'Serif', fontFamily: 'serif' },
  { id: '4', label: 'Monospace', fontFamily: 'monospace' },
];

export default function FontSettingsScreen() {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>حجم ونوع الخط</Text>

      {/* Preview */}
      <View style={styles.previewCard}>
        <Text
          style={[
            styles.previewText,
            { fontSize, fontFamily },
          ]}
        >
          هذه معاينة للنص حسب الإعدادات المختارة
        </Text>
      </View>

      {/* Font Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>حجم الخط</Text>
        <View style={styles.sizeRow}>
          <Text style={styles.sizeLabel}>صغير</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={12}
            maximumValue={26}
            step={1}
            value={fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor="#6D5DF6"
            maximumTrackTintColor="#DDD"
          />
          <Text style={styles.sizeLabel}>كبير</Text>
        </View>
        <Text style={styles.sizeValue}>{fontSize}px</Text>
      </View>

      {/* Font Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نوع الخط</Text>

        {FONTS.map((font) => (
          <TouchableOpacity
            key={font.id}
            style={[
              styles.fontRow,
              fontFamily === font.fontFamily && styles.activeFont,
            ]}
            onPress={() => setFontFamily(font.fontFamily)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.fontText,
                { fontFamily: font.fontFamily },
              ]}
            >
              {font.label}
            </Text>

            {fontFamily === font.fontFamily && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#6D5DF6"
              />
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

  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  previewText: {
    textAlign: 'center',
    lineHeight: 28,
  },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
  },

  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sizeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  sizeValue: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '700',
  },

  fontRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  activeFont: {
    backgroundColor: '#F4F3FF',
    borderRadius: 12,
    paddingHorizontal: 10,
  },

  fontText: {
    fontSize: 16,
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
