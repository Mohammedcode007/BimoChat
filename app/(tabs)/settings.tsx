import { Colors } from '@/constants/theme';
import { useHideTabBarOnScroll } from '@/hooks/useHideTabBarOnScroll';
import i18n from '@/localization/i18n';
import { logout, toggleInvisible } from '@/redux/slices/authSlice';
import { resetChatState } from '@/redux/slices/chatSlice';
import { setTabBarHidden } from '@/redux/slices/ui.slice';
import { AppDispatch, RootState } from '@/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useSelector((state: RootState) => state.auth);
  const { onScroll, onScrollBeginDrag, showTabBar } = useHideTabBarOnScroll();

  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [onlineStatus, setOnlineStatus] = React.useState(true);
  const [readReceipts, setReadReceipts] = React.useState(true);
  const [location, setLocation] = React.useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = React.useState(true);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handleToggleOnline = (value: boolean) => {
    // إذا السويتش ON → يعني يريد الظهور Online
    // إذن invisible = false
    dispatch(toggleInvisible(!value));
  };

  const handleLogout = async () => {
    // ✅ أظهر التاب بار فورًا قبل تغيير الحساب
    showTabBar(); // أو dispatch(setTabBarHidden(false))

    await dispatch(logout());
    dispatch(resetChatState());

    // ✅ (اختياري) تأكيد إضافي بعد logout
    dispatch(setTabBarHidden(false));
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={onScrollBeginDrag}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >


      {/* Profile */}
      {/* Profile */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.background }]}
        activeOpacity={0.8}
        onPress={() => {
          const myId = user?._id || user?.id; // حسب شكل authSlice عندك
          if (!myId) return;
          router.push({ pathname: "/profile/[id]", params: { id: String(myId) } });
        }}
      >
        <Ionicons name="person-circle-outline" size={52} color="#555" />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.username || user?.displayName || "—"}
          </Text>
          <Text style={[styles.email, { color: theme.text }]}>
            {user?.email || user?.atUsername || "—"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ===== Account ===== */}
      <Section title={i18n.t("settingsScreen.account")}>
        <Row
          icon="person-outline"
          text={i18n.t("settingsScreen.editProfile")}
          arrow
          onPress={() => router.push("/profile/settings")}

        // onPress={() => router.push("/edit-profile")}
        />
          <Row
    icon="key-outline"
    text="Change Password"
    arrow
    onPress={() => router.push("/change-password")}
  />
        <Row
          icon="shield-checkmark-outline"
          text={i18n.t("settingsScreen.verifyAccount")}
          arrow
          onPress={() => router.push("/verify-account")}
        />
      </Section>

      {/* ===== Privacy ===== */}
      <Section title={i18n.t("settingsScreen.privacy")}>
        <Row
          icon="eye-outline"
          text={i18n.t("settingsScreen.onlineStatus")}
          switcher
          value={!user?.isInvisible}
          onChange={handleToggleOnline}
        />

        <Row
          icon="checkmark-done-outline"
          text={i18n.t("settingsScreen.readReceipts")}
          switcher
          value={readReceipts}
          onChange={setReadReceipts}
        />
        <Row
          icon="location-outline"
          text={i18n.t("settingsScreen.locationSharing")}
          switcher
          value={location}
          onChange={setLocation}
        />
        <Row
          icon="lock-closed-outline"
          text={i18n.t("settingsScreen.blockedAccounts")}
          arrow
          onPress={() => router.push("/blocked")}
        />
      </Section>

      {/* ===== Notifications ===== */}
      <Section title={i18n.t("settingsScreen.notifications")}>
        <Row
          icon="notifications-outline"
          text={i18n.t("settingsScreen.notificationToggle")}
          switcher
          value={notifications}
          onChange={setNotifications}
        />
        <Row
          icon="volume-high-outline"
          text={i18n.t("settingsScreen.notificationSounds")}
          switcher
          value={sounds}
          onChange={setSounds}
        />
      </Section>

      {/* ===== Appearance ===== */}
      <Section title={i18n.t("settingsScreen.appearance")}>
        <Row
          icon="moon-outline"
          text={i18n.t("settingsScreen.darkMode")}
          switcher
          value={darkMode}
          onChange={setDarkMode}
        />
        <Row
          icon="color-palette-outline"
          text={i18n.t("settingsScreen.theme")}
          arrow
          onPress={() => router.push("/theme-settings")}
        />
        <Row
          icon="text-outline"
          text={i18n.t("settingsScreen.fontSize")}
          arrow
          onPress={() => router.push("/font-settings")}
        />
      </Section>

      {/* ===== Media ===== */}
      <Section title={i18n.t("settingsScreen.media")}>
        <Row
          icon="play-outline"
          text={i18n.t("settingsScreen.autoPlayVideos")}
          switcher
          value={autoPlayVideos}
          onChange={setAutoPlayVideos}
        />
        <Row
          icon="cloud-download-outline"
          text={i18n.t("settingsScreen.dataUsage")}
          arrow
          onPress={() => router.push("/data-usage")}
        />
      </Section>

      {/* ===== Security ===== */}
      <Section title={i18n.t("settingsScreen.security")}>
        <Row
          icon="finger-print-outline"
          text={i18n.t("settingsScreen.biometricLock")}
          arrow
          onPress={() => router.push("/biometric-lock")}
        />
        <Row
          icon="shield-outline"
          text={i18n.t("settingsScreen.twoFactor")}
          arrow
          onPress={() => router.push("/two-factor")}
        />
        <Row
          icon="alert-circle-outline"
          text={i18n.t("settingsScreen.loginAlerts")}
          arrow
          onPress={() => router.push("/login-alerts")}
        />
      </Section>

      {/* ===== App ===== */}
      <Section title={i18n.t("settingsScreen.app")}>
        <Row
          icon="language-outline"
          text={i18n.t("settingsScreen.language")}
          arrow
          onPress={() => router.push("/language-settings")}
        />
        <Row
          icon="information-circle-outline"
          text={i18n.t("settingsScreen.aboutApp")}
          arrow
          onPress={() => router.push("/about-app")}
        />
        <Row
          icon="help-circle-outline"
          text={i18n.t("settingsScreen.helpSupport")}
          arrow
          onPress={() => router.push("/help-support")}
        />
        <Row
          icon="document-text-outline"
          text={i18n.t("settingsScreen.privacyPolicy")}
          arrow
          onPress={() => router.push("/privacy-policy")}
        />
        <Row
          icon="document-outline"
          text={i18n.t("settingsScreen.termsConditions")}
          arrow
          onPress={() => router.push("/terms-conditions")}
        />
      </Section>

      {/* ===== Logout ===== */}
      <View style={styles.logoutBox}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={styles.logoutText}>
            {i18n.t("settingsScreen.logout")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>
        {i18n.t("settingsScreen.version")}
      </Text>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
        {children}</View>
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={styles.row}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={theme.icon} />
        <Text style={[styles.rowText, { color: theme.text }]} >{text}</Text>
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
