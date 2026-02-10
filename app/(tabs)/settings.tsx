import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [onlineStatus, setOnlineStatus] = React.useState(true);
  const [readReceipts, setReadReceipts] = React.useState(true);
  const [location, setLocation] = React.useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = React.useState(true);
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Text style={styles.header}>الإعدادات</Text>

      {/* Profile */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="person-circle-outline" size={52} color="#555" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>Mohammed</Text>
          <Text style={styles.email}>mohammed@email.com</Text>
        </View>
      </TouchableOpacity>


      {/* ===== Account ===== */}
      <Section title="الحساب">
<Row
  icon="person-outline"
  text="تعديل الملف الشخصي"
  arrow
  onPress={() => router.push('/edit-profile')}
/>
<Row
  icon="shield-checkmark-outline"
  text="تأكيد الحساب"
  arrow
  onPress={() => router.push('/verify-account')}
/>
      </Section>

      {/* ===== Privacy ===== */}
      <Section title="الخصوصية">
        <Row icon="eye-outline" text="الحالة متصل الآن" switcher value={onlineStatus} onChange={setOnlineStatus} />
        <Row icon="checkmark-done-outline" text="إيصالات القراءة" switcher value={readReceipts} onChange={setReadReceipts} />
        <Row icon="location-outline" text="مشاركة الموقع" switcher value={location} onChange={setLocation} />
        <Row
          icon="lock-closed-outline"
          text="الحسابات المحظورة"
          arrow
          onPress={() => router.push('/blocked')}
        />
      </Section>

      {/* ===== Notifications ===== */}
      <Section title="الإشعارات">
        <Row icon="notifications-outline" text="الإشعارات" switcher value={notifications} onChange={setNotifications} />
        <Row icon="volume-high-outline" text="أصوات الإشعارات" switcher value={sounds} onChange={setSounds} />
      </Section>

      {/* ===== Appearance ===== */}
      <Section title="المظهر">
        <Row icon="moon-outline" text="الوضع الليلي" switcher value={darkMode} onChange={setDarkMode} />
<Row
  icon="color-palette-outline"
  text="الألوان والثيم"
  arrow
  onPress={() => router.push('/theme-settings')}
/>
        <Row
          icon="text-outline"
          text="حجم الخط"
          arrow
          onPress={() => router.push('/font-settings')}
        />
      </Section>

      {/* ===== Media ===== */}
      <Section title="الوسائط">
        <Row icon="play-outline" text="تشغيل الفيديو تلقائيًا" switcher value={autoPlayVideos} onChange={setAutoPlayVideos} />
        <Row
          Row icon="cloud-download-outline" text="استخدام البيانات" arrow
          onPress={() => router.push('/data-usage')}
        />
      </Section>

      {/* ===== Security ===== */}
      <Section title="الأمان">
        <Row
          icon="finger-print-outline"
          text="قفل التطبيق بالبصمة"
          arrow
          onPress={() => router.push('/biometric-lock')}
        />
        <Row
          icon="shield-outline"
          text="التحقق بخطوتين"
          arrow
          onPress={() => router.push('/two-factor')}
        />
        <Row
          icon="alert-circle-outline"
          text="تنبيهات تسجيل الدخول"
          arrow
          onPress={() => router.push('/login-alerts')}
        />
      </Section>

      {/* ===== App ===== */}
      <Section title="التطبيق">
<Row
  icon="language-outline"
  text="اللغة"
  arrow
  onPress={() => router.push('/language-settings')}
/>
<Row
  icon="information-circle-outline"
  text="حول التطبيق"
  arrow
  onPress={() => router.push('/about-app')}
/>
<Row
  icon="help-circle-outline"
  text="المساعدة والدعم"
  arrow
  onPress={() => router.push('/help-support')}
/>
<Row
  icon="document-text-outline"
  text="سياسة الخصوصية"
  arrow
  onPress={() => router.push('/privacy-policy')}
/>
<Row
  icon="document-outline"
  text="الشروط والأحكام"
  arrow
  onPress={() => router.push('/terms-conditions')}
/>
      </Section>

      {/* ===== Logout ===== */}
      <View style={styles.logoutBox}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Bimo v1.0.0</Text>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  text,
  arrow,
  switcher,
  value,
  onChange,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={styles.row}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color="#333" />
        <Text style={styles.rowText}>{text}</Text>
      </View>

      {switcher && <Switch value={value} onValueChange={onChange} />}
      {arrow && <Ionicons name="chevron-forward" size={20} color="#999" />}
    </TouchableOpacity>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },

  header: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
  },

  email: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },

  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rowText: {
    fontSize: 16,
  },

  logoutBox: {
    marginTop: 10,
    alignItems: 'center',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },

  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
  },

  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
