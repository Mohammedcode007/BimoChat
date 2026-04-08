
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHideTabBarOnScroll } from '@/hooks/useHideTabBarOnScroll';
import { useTranslation } from '@/hooks/useTranslation';
import { logout, toggleInvisible } from '@/redux/slices/authSlice';
import { resetChatState } from '@/redux/slices/chatSlice';
import { setTabBarHidden } from '@/redux/slices/ui.slice';
import { AppDispatch, RootState } from '@/redux/store';
import {
  getNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from '@/services/localSettings.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function SettingsScreen() {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useSelector((state: RootState) => state.auth);
  const { onScroll, onScrollBeginDrag, showTabBar } = useHideTabBarOnScroll();
  const { t, isRTL } = useTranslation();

  const [notifications, setNotifications] = React.useState(true);
  const [sounds, setSounds] = React.useState(true);
  const [loadingSoundSetting, setLoadingSoundSetting] = React.useState(true);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    loadLocalSettings();
  }, []);

  const loadLocalSettings = async () => {
    try {
      setLoadingSoundSetting(true);
      const savedSound = await getNotificationSoundEnabled();
      setSounds(savedSound);
    } catch (error) {
    } finally {
      setLoadingSoundSetting(false);
    }
  };

  const handleToggleOnline = (value: boolean) => {
    dispatch(toggleInvisible(!value));
  };

  const handleToggleSound = async (value: boolean) => {
    setSounds(value);
    await setNotificationSoundEnabled(value);
  };

  const handleLogout = async () => {
    showTabBar();
    await dispatch(logout());
    dispatch(resetChatState());
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


      {/* ===== Account ===== */}
      <Section title={t('settingsScreen.account')}>
        <Row
          icon="person-outline"
          text={t('settingsScreen.editProfile')}
          arrow
          onPress={() => router.push('/profile/settings')}
        />
        <Row
          icon="mail-outline"
          text={t('settingsScreen.changeEmail')}
          arrow
          onPress={() => router.push('/change-email')}
        />
        <Row
          icon="image-outline"
          text={t('settingsScreen.profilePhotoCover')}
          arrow
          onPress={() => router.push('/edit-profile')}
        />

        <Row
          icon="key-outline"
          text={t('settingsScreen.changePassword')}
          arrow
          onPress={() => router.push('/change-password')}
        />
      </Section>

      {/* ===== Privacy ===== */}
      <Section title={t('settingsScreen.privacy')}>
        <Row
          icon="eye-outline"
          text={t('settingsScreen.onlineStatus')}
          switcher
          value={!user?.isInvisible}
          onChange={handleToggleOnline}
        />
        <Row
          icon="lock-closed-outline"
          text={t('settingsScreen.blockedAccounts')}
          arrow
          onPress={() => router.push('/blocked')}
        />
      </Section>

      {/* ===== Notifications ===== */}
      <Section title={t('settingsScreen.notifications')}>
        <Row
          icon="notifications-outline"
          text={t('settingsScreen.notificationToggle')}
          switcher
          value={notifications}
          onChange={setNotifications}
        />

        {loadingSoundSetting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.icon} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              جارٍ تحميل الإعدادات...
            </Text>
          </View>
        ) : (
          <Row
            icon="volume-high-outline"
            text={t('settingsScreen.notificationSounds')}
            switcher
            value={sounds}
            onChange={handleToggleSound}
          />
        )}
      </Section>

      {/* ===== App ===== */}
      <Section title={t('settingsScreen.app')}>
        <Row
          icon="language-outline"
          text={t('settingsScreen.language')}
          arrow
          onPress={() => router.push('/language-settings')}
        />
        <Row
          icon="information-circle-outline"
          text={t('settingsScreen.aboutApp')}
          arrow
          onPress={() => router.push('/about-app')}
        />
        <Row
          icon="help-circle-outline"
          text={t('settingsScreen.helpSupport')}
          arrow
          onPress={() => router.push('/help-support')}
        />
        <Row
          icon="document-text-outline"
          text={t('settingsScreen.privacyPolicy')}
          arrow
          onPress={() => router.push('/privacy-policy')}
        />
        <Row
          icon="document-outline"
          text={t('settingsScreen.termsConditions')}
          arrow
          onPress={() => router.push('/terms-conditions')}
        />
      </Section>

      {/* ===== Logout ===== */}
      <View style={styles.logoutBox}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#E53935" />
          <Text style={styles.logoutText}>{t('settingsScreen.logout')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>{t('settingsScreen.version')}</Text>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, children }: any) {
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.background }]}>
        {children}
      </View>
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
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { isRTL } = useTranslation();

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.row,
        { flexDirection: isRTL ? "row-reverse" : "row" },
      ]}
      activeOpacity={0.7}
    >

      <View
        style={[
          styles.rowLeft,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
              <Ionicons name={icon} size={22} color={theme.icon} />

        <Text
          style={[
            styles.rowText,
            {
              color: theme.text,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
        >
          {text}
        </Text>

      </View>
            {arrow && (
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={20}
          color="#999"
        />
      )}

      {switcher && <Switch value={value} onValueChange={onChange} />}

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
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#EEE",
},

rowLeft: {
  alignItems: "center",
  gap: 12,
  flex: 1,
},

rowText: {
  flex: 1,
  fontSize: 16,
},

  loadingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },

  loadingText: {
    fontSize: 14,
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