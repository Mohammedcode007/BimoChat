import { Colors } from "@/constants/theme";
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
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);
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
      Alert.alert("تنبيه", "يجب الموافقة على اتفاقية المستخدم وسياسة الخصوصية أولًا");
      return;
    }

    const userCredential = await signInWithGoogle();
    const user = userCredential.user;

    // مهم: هذا هو التوكن الذي سترسله للباك
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
      (resultAction.payload as string) || "فشل تسجيل الدخول بواسطة Google";
    Alert.alert("خطأ", message);
  } catch (error: any) {
    console.log("❌ Google login error:", error);

    const errorCode = error?.code || "";

    if (
      errorCode === "SIGN_IN_CANCELLED" ||
      errorCode === "12501" ||
      errorCode === "cancelled"
    ) {
      return;
    }

    if (errorCode === "PLAY_SERVICES_NOT_AVAILABLE") {
      Alert.alert("خطأ", "خدمات Google Play غير متاحة على هذا الجهاز");
      return;
    }

    if (errorCode === "DEVELOPER_ERROR") {
      Alert.alert(
        "خطأ",
        "يوجد خطأ في إعداد Google Sign-In. تأكد من SHA-1 و webClientId و google-services.json"
      );
      return;
    }

    Alert.alert("خطأ", error?.message || "فشل تسجيل الدخول بواسطة Google");
  }
};
  const goToPhone = () => {
    if (!acceptedPrivacy) {
      Alert.alert("تنبيه", "يجب الموافقة على اتفاقية المستخدم وسياسة الخصوصية أولًا");
      return;
    }
    router.push("/(auth)/register");
  };

  const goToTikTok = () => {
    if (!acceptedPrivacy) {
      Alert.alert("تنبيه", "يجب الموافقة على اتفاقية المستخدم وسياسة الخصوصية أولًا");
      return;
    }
    Alert.alert("قريبًا", "يمكنك ربط تسجيل TikTok لاحقًا");
  };

  const openPrivacy = async () => {
    const url = "https://api.te-bot.site/privacy";
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("خطأ", "تعذر فتح سياسة الخصوصية");
      return;
    }

    await Linking.openURL(url);
  };

  const openTerms = async () => {
    const url = "https://api.te-bot.site/terms";
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("خطأ", "تعذر فتح اتفاقية المستخدم");
      return;
    }

    await Linking.openURL(url);
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
        
          </View>

          <View style={styles.centerArea}>
            <Text style={styles.logoText}>BIMO</Text>
            <Text style={styles.counterText}>46,023 شخص وجدوا مجتمعهم</Text>
          </View>

          <View style={styles.bottomArea}>
            <Pressable style={styles.mainButton} onPress={goToGoogle}>
              <View style={styles.buttonRightIcon}>
                <AntDesign name="google" size={22} color="#4285F4" />
              </View>
              <Text style={styles.mainButtonText}>تسجيل الدخول إلى Google</Text>
            </Pressable>

            <Pressable style={styles.mainButton} onPress={goToPhone}>
              <View style={styles.buttonRightIcon}>
                <Feather name="smartphone" size={22} color="#4A7DFF" />
              </View>
              <Text style={styles.mainButtonText}>تسجيل الدخول باستخدام الهاتف</Text>
            </Pressable>

            <View style={styles.orWrap}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable style={styles.tiktokButton} onPress={goToTikTok}>
              <FontAwesome5 name="tiktok" size={28} color="#fff" />
            </Pressable>

            <Pressable
              style={styles.privacyRow}
              onPress={() => setAcceptedPrivacy((prev) => !prev)}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedPrivacy && { backgroundColor: "#fff", borderColor: "#fff" },
                ]}
              >
                {acceptedPrivacy ? (
                  <Ionicons name="checkmark" size={16} color="#111" />
                ) : null}
              </View>

              <Text style={styles.privacyText}>
                يعني النقر لتسجيل الدخول أنك قرأت ووافقت{" "}
                <Text onPress={openTerms} style={styles.linkText}>
                  اتفاقية المستخدم
                </Text>{" "}
                و{" "}
                <Text onPress={openPrivacy} style={styles.linkText}>
                  اتفاقية الخصوصية
                </Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
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
    alignItems: "flex-start",
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
    textAlign: "right",
  },
  linkText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    fontWeight: "700",
  },
});