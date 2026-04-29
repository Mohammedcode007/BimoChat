
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { logout } from "@/redux/slices/authSlice";
import { resetChatState } from "@/redux/slices/chatSlice";
import { resetUserState } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { disconnectSocket } from "@/services/socket";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  Alert,
  I18nManager,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

type DrawerContentProps = {
  onClose: () => void;
};

type ItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  screen: any;
  badge?: string | number;
  danger?: boolean;
};

export default function DrawerContent({ onClose }: DrawerContentProps) {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isDark = colorScheme === "dark";
  const isRTL = I18nManager.isRTL;
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const me = useSelector((state: RootState) => state.user.me);

  const user = me || authUser; const unreadCount = useSelector(
    (state: RootState) => state.notification.unreadCount
  );

  const goTo = (screen: any) => {
    onClose();
    requestAnimationFrame(() => {
      setTimeout(() => {
        router.push(screen);
      }, 120);
    });
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  const handleLogout = () => {
    Alert.alert(
      t("drawer.logout.alertTitle"),
      t("drawer.logout.alertMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("drawer.logout.alertConfirm"),
          style: "destructive",
          onPress: () => {
            onClose();

            setTimeout(() => {
              try {
                disconnectSocket();
                dispatch(logout());
                dispatch(resetUserState());

                // ✅ امسح بيانات الشات القديمة
                dispatch(resetChatState());
                router.replace("/login");
              } catch (e) {
              }
            }, 180);
          },
        },
      ]
    );
  };

  const DrawerItem = ({
    icon,
    label,
    subtitle,
    screen,
    badge,
    danger = false,
  }: ItemProps) => {
    const active = typeof screen === "string" ? isActive(screen) : false;

    return (
      <Pressable
        onPress={() => goTo(screen)}
        style={({ pressed }) => [
          styles.item,
          {
            flexDirection: isRTL ? "row-reverse" : "row",
            backgroundColor: active
              ? isDark
                ? "rgba(255,215,0,0.10)"
                : "rgba(212,175,55,0.12)"
              : pressed
                ? isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)"
                : "transparent",
            borderColor: active
              ? isDark
                ? "rgba(255,215,0,0.30)"
                : "rgba(212,175,55,0.28)"
              : "transparent",
          },
        ]}
      >
        <View
          style={[
            styles.itemIconWrap,
            {
              backgroundColor: active
                ? isDark
                  ? "rgba(255,215,0,0.16)"
                  : "rgba(212,175,55,0.14)"
                : theme.cardAlt,
              borderColor: active
                ? isDark
                  ? "rgba(255,215,0,0.32)"
                  : "rgba(212,175,55,0.28)"
                : theme.border,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={danger ? "#EF4444" : active ? "#D4AF37" : theme.icon}
          />
        </View>

        <View style={styles.itemTextWrap}>
          <Text
            style={[
              styles.itemLabel,
              {
                color: danger ? "#EF4444" : theme.text,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>

          {!!subtitle && (
            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: theme.mutedText,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {Number(badge) > 99 ? "99+" : String(badge)}
            </Text>
          </View>
        ) : (
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={18}
            color={theme.mutedText}
            style={{ opacity: 0.7 }}
          />
        )}
      </Pressable>
    );
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.mutedText,
            textAlign: isRTL ? "right" : "left",
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          paddingTop: Math.max(insets.top, 10),
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: isDark
                ? "rgba(255,215,0,0.06)"
                : "rgba(212,175,55,0.08)",
              borderColor: isDark
                ? "rgba(255,215,0,0.18)"
                : "rgba(212,175,55,0.20)",
            },
          ]}
        >
          <View
            style={[
              styles.userTopRow,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri: user?.avatar || "https://i.pravatar.cc/150?img=3",
                }}
                style={styles.avatar}
              />
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: theme.success ?? "#22C55E",
                  },
                ]}
              />
            </View>

            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.username,
                  {
                    color: theme.text,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
                numberOfLines={1}
              >
                {user?.username || t("drawer.user.defaultName")}
              </Text>
              <Text
                style={[
                  styles.handle,
                  {
                    color: theme.mutedText,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
                numberOfLines={1}
              >
                @{user?.atUsername || "bimo_user"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              goTo({
                pathname: "/profile/[id]" as any,
                params: { id: user?._id },
              } as any)
            }
            style={[
              styles.profileBtn,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
                backgroundColor: theme.cardAlt,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="person-circle-outline" size={18} color="#D4AF37" />
            <Text style={[styles.profileBtnText, { color: theme.text }]}>
              {t("drawer.user.viewProfile")}
            </Text>
          </Pressable>
        </View>

        <Section title={t("drawer.sections.quickAccess")}>
          <DrawerItem
            icon="search-outline"
            label={t("drawer.quickAccess.search")}
            subtitle={t("drawer.quickAccess.searchSubtitle")}
            screen="/search"
          />
          <DrawerItem
            icon="notifications-outline"
            label={t("drawer.quickAccess.notifications")}
            subtitle={t("drawer.quickAccess.notificationsSubtitle")}
            screen="/notifications"
            badge={Number(unreadCount) > 0 ? unreadCount : undefined}
          />
          <DrawerItem
            icon="storefront-outline"
            label={t("drawer.quickAccess.store")}
            subtitle={t("drawer.quickAccess.storeSubtitle")}
            screen="/store"
          />
          <DrawerItem
            icon="settings-outline"
            label={t("drawer.quickAccess.settings")}
            subtitle={t("drawer.quickAccess.settingsSubtitle")}
            screen="/settings"
          />
        </Section>

        <Section title={t("drawer.sections.navigation")}>
          <DrawerItem
            icon="home-outline"
            label={t("drawer.navigation.home")}
            subtitle={t("drawer.navigation.homeSubtitle")}
            screen="/"
          />
          <DrawerItem
            icon="megaphone-outline"
            label={t("drawer.navigation.tweets")}
            subtitle={t("drawer.navigation.tweetsSubtitle")}
            screen="/tweets"
          />
          <DrawerItem
            icon="people-outline"
            label={t("drawer.navigation.friends")}
            subtitle={t("drawer.navigation.friendsSubtitle")}
            screen="/friends"
          />
          <DrawerItem
            icon="radio-outline"
            label={t("drawer.navigation.rooms")}
            subtitle={t("drawer.navigation.roomsSubtitle")}
            screen="/rooms"
          />
        </Section>

        <Section title={t("drawer.sections.settingsShortcuts")}>
          <DrawerItem
            icon="create-outline"
            label={t("drawer.shortcuts.editProfile")}
            subtitle={t("drawer.shortcuts.editProfileSubtitle")}
            screen="/profile/settings"
          />
          <DrawerItem
            icon="shield-checkmark-outline"
            label={t("drawer.shortcuts.privacy")}
            subtitle={t("drawer.shortcuts.privacySubtitle")}
            screen="/blocked"
          />
          <DrawerItem
            icon="help-circle-outline"
            label={t("drawer.shortcuts.help")}
            subtitle={t("drawer.shortcuts.helpSubtitle")}
            screen="/help-support"
          />
          <DrawerItem
            icon="information-circle-outline"
            label={t("drawer.shortcuts.about")}
            subtitle={t("drawer.shortcuts.aboutSubtitle")}
            screen="/about-app"
          />
        </Section>

        <View
          style={[
            styles.logoutCard,
            {
              backgroundColor: isDark
                ? "rgba(239,68,68,0.08)"
                : "rgba(239,68,68,0.06)",
              borderColor: isDark
                ? "rgba(239,68,68,0.18)"
                : "rgba(239,68,68,0.16)",
            },
          ]}
        >
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                flexDirection: isRTL ? "row-reverse" : "row",
                backgroundColor: pressed
                  ? isDark
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(239,68,68,0.10)"
                  : "transparent",
              },
            ]}
          >
            <View
              style={[
                styles.itemIconWrap,
                {
                  backgroundColor: isDark
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(239,68,68,0.10)",
                  borderColor: isDark
                    ? "rgba(239,68,68,0.20)"
                    : "rgba(239,68,68,0.18)",
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>

            <View style={styles.itemTextWrap}>
              <Text
                style={[
                  styles.itemLabel,
                  { color: "#EF4444", textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t("drawer.logout.title")}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  {
                    color: theme.mutedText,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("drawer.logout.subtitle")}
              </Text>
            </View>

            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={18}
              color="#EF4444"
              style={{ opacity: 0.7 }}
            />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 22,
  },

  userCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },

  userTopRow: {
    alignItems: "center",
    gap: 12,
  },

  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    padding: 3,
    backgroundColor: "rgba(212,175,55,0.16)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 18,
  },

  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#fff",
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  username: {
    fontSize: 17,
    fontWeight: "900",
  },

  handle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
  },

  profileBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  profileBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    paddingHorizontal: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 6,
    overflow: "hidden",
  },

  item: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  itemIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 1,
      },
    }),
  },

  itemTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  itemLabel: {
    fontSize: 14,
    fontWeight: "800",
  },

  itemSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "600",
  },

  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },

  logoutCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 8,
    marginTop: 2,
  },

  logoutBtn: {
    alignItems: "center",
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
});