
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { loginWithGoogle } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { signInWithGoogle } from "@/services/googleAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ImageSourcePropType,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

const COLUMN_GAP = 6;
const IMAGE_HEIGHTS = [220, 280, 240, 300, 230, 260];
const SCROLL_DISTANCE = height * 0.9;

type BgItem = {
  id: string;
  source: ImageSourcePropType;
  height: number;
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { colorScheme, themePreference, setThemePreference } = useColorScheme();

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const acceptedPrivacy = true;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -SCROLL_DISTANCE,
          duration: 18000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [translateY]);

  const allImages = useMemo<BgItem[]>(
    () => [
      { id: "1", source: require("@/assets/images/welcome/1.jpg"), height: IMAGE_HEIGHTS[0] },
      { id: "2", source: require("@/assets/images/welcome/2.jpg"), height: IMAGE_HEIGHTS[1] },
      { id: "3", source: require("@/assets/images/welcome/3.jpg"), height: IMAGE_HEIGHTS[2] },
      { id: "4", source: require("@/assets/images/welcome/4.jpg"), height: IMAGE_HEIGHTS[3] },
      { id: "5", source: require("@/assets/images/welcome/5.jpg"), height: IMAGE_HEIGHTS[4] },
      { id: "6", source: require("@/assets/images/welcome/6.jpg"), height: IMAGE_HEIGHTS[5] },
      { id: "7", source: require("@/assets/images/welcome/7.jpg"), height: IMAGE_HEIGHTS[2] },
      { id: "8", source: require("@/assets/images/welcome/8.jpg"), height: IMAGE_HEIGHTS[3] },
      { id: "9", source: require("@/assets/images/welcome/9.jpg"), height: IMAGE_HEIGHTS[1] },
      { id: "10", source: require("@/assets/images/welcome/10.jpg"), height: IMAGE_HEIGHTS[0] },
      { id: "11", source: require("@/assets/images/welcome/11.jpg"), height: IMAGE_HEIGHTS[5] },
      { id: "12", source: require("@/assets/images/welcome/12.jpg"), height: IMAGE_HEIGHTS[4] },
      { id: "13", source: require("@/assets/images/welcome/13.jpg"), height: IMAGE_HEIGHTS[3] },
      { id: "14", source: require("@/assets/images/welcome/14.jpg"), height: IMAGE_HEIGHTS[2] },
      { id: "15", source: require("@/assets/images/welcome/15.jpg"), height: IMAGE_HEIGHTS[1] },
    ],
    []
  );

  const column1 = allImages.filter((_, index) => index % 3 === 0);
  const column2 = allImages.filter((_, index) => index % 3 === 1);
  const column3 = allImages.filter((_, index) => index % 3 === 2);

  const goToGoogle = async () => {
    try {
      if (!acceptedPrivacy) {
        Alert.alert(
          t("welcomeScreen.alerts.noticeTitle"),
          t("welcomeScreen.alerts.acceptPrivacyFirst")
        );
        return;
      }

      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const resultAction = await dispatch(
        loginWithGoogle({
          idToken,
          username: user.displayName || undefined,
          email: user.email || undefined,
          photo: user.photoURL || undefined,
        })
      );

      if (loginWithGoogle.fulfilled.match(resultAction)) {
        router.replace("/(tabs)");
        return;
      }

      const message =
        (resultAction.payload as string) ||
        t("welcomeScreen.alerts.googleLoginFailed");

      Alert.alert(t("common.error"), message);
    } catch (error: any) {

      const errorCode = error?.code || "";

      if (
        errorCode === "SIGN_IN_CANCELLED" ||
        errorCode === "12501" ||
        errorCode === "cancelled"
      ) {
        return;
      }

      if (errorCode === "PLAY_SERVICES_NOT_AVAILABLE") {
        Alert.alert(
          t("common.error"),
          t("welcomeScreen.alerts.playServicesUnavailable")
        );
        return;
      }

      if (errorCode === "DEVELOPER_ERROR") {
        Alert.alert(
          t("common.error"),
          t("welcomeScreen.alerts.googleConfigError")
        );
        return;
      }

      Alert.alert(
        t("common.error"),
        error?.message || t("welcomeScreen.alerts.googleLoginFailed")
      );
    }
  };

  const goToPhone = () => {
    if (!acceptedPrivacy) {
      Alert.alert(
        t("welcomeScreen.alerts.noticeTitle"),
        t("welcomeScreen.alerts.acceptPrivacyFirst")
      );
      return;
    }
    router.push("/(auth)/register");
  };

  const goToTikTok = () => {
    if (!acceptedPrivacy) {
      Alert.alert(
        t("welcomeScreen.alerts.noticeTitle"),
        t("welcomeScreen.alerts.acceptPrivacyFirst")
      );
      return;
    }
    Alert.alert(
      t("welcomeScreen.alerts.comingSoonTitle"),
      t("welcomeScreen.alerts.tiktokSoon")
    );
  };

  const openPrivacy = async () => {
    const url = "https://te-bot.site/privacy";
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        t("common.error"),
        t("welcomeScreen.alerts.openPrivacyFailed")
      );
      return;
    }

    await Linking.openURL(url);
  };

  const openTerms = async () => {
    const url = "https://te-bot.site/terms";
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        t("common.error"),
        t("welcomeScreen.alerts.openTermsFailed")
      );
      return;
    }

    await Linking.openURL(url);
  };

  const handleSelectLanguage = async (lang: "ar" | "en") => {
    try {
      await changeLanguage(lang);
      setLanguageModalVisible(false);
    } catch (e) {
      setLanguageModalVisible(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <AnimatedBackground
        translateY={translateY}
        column1={column1}
        column2={column2}
        column3={column3}
      />

      <View style={styles.darkOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topArea}>
            <Pressable
              style={styles.languageChip}
              onPress={() => setLanguageModalVisible(true)}
            >
              <Ionicons name="globe-outline" size={15} color="#FFFFFF" />
              <Text style={styles.languageChipText}>{language.toUpperCase()}</Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.centerArea}>
            <Text style={styles.logoText}>BIMO</Text>
            <Text style={styles.counterText}>
              {t("welcomeScreen.counterText")}
            </Text>
          </View>

          <View style={styles.bottomArea}>
            <Pressable
              style={[styles.mainButton, loading && { opacity: 0.8 }]}
              onPress={goToGoogle}
              disabled={loading}
            >
              <View style={styles.buttonRightIcon}>
                <AntDesign name="google" size={22} color="#4285F4" />
              </View>
              <Text style={styles.mainButtonText}>
                {t("welcomeScreen.googleLogin")}
              </Text>
            </Pressable>

            <Pressable style={styles.mainButton} onPress={goToPhone}>
              <View style={styles.buttonRightIcon}>
                <Feather name="smartphone" size={22} color="#4A7DFF" />
              </View>
              <Text style={styles.mainButtonText}>
                {t("welcomeScreen.phoneLogin")}
              </Text>
            </Pressable>

            <View style={styles.orWrap}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t("welcomeScreen.or")}</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable style={styles.tiktokButton} onPress={goToTikTok}>
              <FontAwesome5 name="tiktok" size={28} color="#fff" />
            </Pressable>

            <View
              style={[
                styles.privacyRow,
                { flexDirection: language === "ar" ? "row-reverse" : "row" },
              ]}
            >
           <View
  style={[
    styles.checkbox,
    styles.checkboxDisabled,
    {
      backgroundColor: "#fff",
      borderColor: "#fff",
    },
  ]}
>
  <Ionicons name="checkmark" size={16} color="#111" />
</View>
              <Text
                style={[
                  styles.privacyText,
                  { textAlign: language === "ar" ? "right" : "left" },
                ]}
              >
                {t("welcomeScreen.privacyPrefix")}{" "}
                <Text onPress={openTerms} style={styles.linkText}>
                  {t("welcomeScreen.userAgreement")}
                </Text>{" "}
                {t("welcomeScreen.and")}{" "}
                <Text onPress={openPrivacy} style={styles.linkText}>
                  {t("welcomeScreen.privacyPolicy")}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        transparent
        visible={languageModalVisible}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Language</Text>
                  <Pressable onPress={() => setLanguageModalVisible(false)}>
                    <Ionicons name="close" size={22} color="#111" />
                  </Pressable>
                </View>

                <Pressable
                  style={[
                    styles.languageOption,
                    language === "ar" && styles.languageOptionActive,
                  ]}
                  onPress={() => handleSelectLanguage("ar")}
                >
                  <View style={styles.languageOptionLeft}>
                    <Text style={styles.languageOptionTitle}>AR</Text>
                    <Text style={styles.languageOptionSub}>العربية</Text>
                  </View>

                  {language === "ar" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color="#A1A1AA" />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.languageOption,
                    language === "en" && styles.languageOptionActive,
                  ]}
                  onPress={() => handleSelectLanguage("en")}
                >
                  <View style={styles.languageOptionLeft}>
                    <Text style={styles.languageOptionTitle}>EN</Text>
                    <Text style={styles.languageOptionSub}>English</Text>
                  </View>

                  {language === "en" ? (
                    <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color="#A1A1AA" />
                  )}
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function AnimatedBackground({
  translateY,
  column1,
  column2,
  column3,
}: {
  translateY: Animated.Value;
  column1: BgItem[];
  column2: BgItem[];
  column3: BgItem[];
}) {
  return (
    <View style={styles.bgContainer}>
      <Animated.View
        style={[
          styles.bgAnimatedLayer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.columnsRow}>
          <ImageColumn items={[...column1, ...column1, ...column1]} />
          <ImageColumn items={[...column2, ...column2, ...column2]} />
          <ImageColumn items={[...column3, ...column3, ...column3]} />
        </View>
      </Animated.View>
    </View>
  );
}

function ImageColumn({ items }: { items: BgItem[] }) {
  return (
    <View style={styles.column}>
      {items.map((item, index) => (
        <Animated.Image
          key={`${item.id}-${index}`}
          source={item.source}
          resizeMode="cover"
          style={[
            styles.bgImage,
            {
              height: item.height,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgAnimatedLayer: {
    width: "100%",
    height: height * 3.2,
  },
  columnsRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 0,
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
    gap: COLUMN_GAP,
  },
  bgImage: {
    width: "100%",
    borderRadius: 0,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "space-between",
  },
  topArea: {
    paddingTop: 8,
    alignItems: "flex-end",
  },
  languageChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  languageChipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginLinkWrap: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  loginLinkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  centerArea: {
    alignItems: "center",
    marginTop: 40,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "500",
  },
  bottomArea: {
    paddingBottom: 18,
  },
  mainButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 20,
  },
  mainButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonRightIcon: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  tiktokButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  orWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  orLine: {
    height: 1,
    width: 56,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  orText: {
    color: "#FFFFFF",
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "400",
  },
  checkboxDisabled: {
    opacity: 0.95,
  },
  privacyRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  privacyText: {
    flex: 1,
    color: "#F3F3F3",
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111111",
  },
  languageOption: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F6F7FB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },
  languageOptionActive: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  languageOptionLeft: {
    flexDirection: "column",
  },
  languageOptionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },
  languageOptionSub: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
});