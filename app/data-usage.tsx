import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import {
    AppState,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/* ================= SCREEN ================= */

export default function DataUsageScreen() {
  const [dataSaver, setDataSaver] = useState(false);
  const [wifiOnlyImages, setWifiOnlyImages] = useState(true);
  const [wifiOnlyVideos, setWifiOnlyVideos] = useState(true);
  const [backgroundData, setBackgroundData] = useState(true);

  // Data usage (MB)
  const [imageData, setImageData] = useState(120);
  const [videoData, setVideoData] = useState(180);
  const [messageData, setMessageData] = useState(20);

  const totalData = imageData + videoData + messageData;

  /* ===== Background control ===== */
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active' && !backgroundData) {
        console.log('Background data blocked');
      }
    });

    return () => sub.remove();
  }, [backgroundData]);

  /* ===== Reset ===== */
  const resetStats = () => {
    setImageData(0);
    setVideoData(0);
    setMessageData(0);
  };

  /* ===== Example: image download with real check ===== */
  const downloadImage = async (url: string) => {
    const net = await NetInfo.fetch();

    if (wifiOnlyImages && net.type !== 'wifi') {
      alert('تحميل الصور مسموح عبر Wi-Fi فقط');
      return;
    }

    const res = await fetch(url);
    const blob = await res.blob();
    const sizeMB = blob.size / (1024 * 1024);

    setImageData(prev => prev + sizeMB);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>استخدام البيانات</Text>

      {/* ===== Summary ===== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>الاستخدام هذا الشهر</Text>

        <Row label="الإجمالي" value={`${totalData.toFixed(1)} MB`} />
        <Row label="الصور" value={`${imageData.toFixed(1)} MB`} />
        <Row label="الفيديو" value={`${videoData.toFixed(1)} MB`} />
        <Row label="الرسائل" value={`${messageData.toFixed(1)} MB`} />
      </View>

      {/* ===== Data Saver ===== */}
      <Section title="توفير البيانات">
        <SwitchRow
          icon="speedometer-outline"
          text="وضع توفير البيانات"
          value={dataSaver}
          onChange={setDataSaver}
        />
      </Section>

      {/* ===== Media ===== */}
      <Section title="تنزيل الوسائط">
        <SwitchRow
          icon="image-outline"
          text="تحميل الصور عبر Wi-Fi فقط"
          value={wifiOnlyImages}
          onChange={setWifiOnlyImages}
        />
        <SwitchRow
          icon="videocam-outline"
          text="تحميل الفيديو عبر Wi-Fi فقط"
          value={wifiOnlyVideos}
          onChange={setWifiOnlyVideos}
        />
      </Section>

      {/* ===== Background ===== */}
      <Section title="البيانات في الخلفية">
        <SwitchRow
          icon="cloud-outline"
          text="السماح باستخدام البيانات في الخلفية"
          value={backgroundData}
          onChange={setBackgroundData}
        />
      </Section>

      {/* ===== Reset ===== */}
      <TouchableOpacity style={styles.resetBtn} onPress={resetStats}>
        <Ionicons name="refresh-outline" size={20} color="#E53935" />
        <Text style={styles.resetText}>إعادة تعيين الإحصائيات</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        * يتم احتساب البيانات بناءً على التحميل داخل التطبيق
      </Text>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      <Text style={styles.bold}>{value}</Text>
    </View>
  );
}

function SwitchRow({ icon, text, value, onChange }: any) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color="#333" />
        <Text>{text}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
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
    marginBottom: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  left: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  resetText: {
    color: '#E53935',
    fontWeight: '700',
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
  },
    safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
});
