import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PaymobCheckout() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string }>();
  const url = useMemo(() => (params.url ? String(params.url) : ""), [params.url]);

  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [handledResult, setHandledResult] = useState(false);


  const SUCCESS_URL_PART = "/payments/paymob/success";
  const FAIL_URL_PART = "/payments/paymob/fail";

  const close = () => router.back();

  if (!url) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1220" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
          <Text style={{ color: "#E5E7EB", fontWeight: "700", marginBottom: 8 }}>رابط الدفع غير موجود</Text>
          <Pressable
            onPress={close}
            style={{ paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderRadius: 10, borderColor: "#243253" }}
          >
            <Text style={{ color: "#E5E7EB" }}>رجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1220" }}>
      {/* Header داخل SafeArea */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2A44",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0B1220",
        }}
      >
        <Pressable
          onPress={close}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: "#243253",
            backgroundColor: "#0F172A",
          }}
        >
          <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>إغلاق</Text>
        </Pressable>

        <Text style={{ color: "#E5E7EB", fontWeight: "900" }}>Paymob Checkout</Text>

        <Pressable
          onPress={() => webRef.current?.reload()}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 12,
            borderColor: "#243253",
            backgroundColor: "#0F172A",
          }}
        >
          <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>تحديث</Text>
        </Pressable>
      </View>

      <WebView
        ref={webRef}
        source={{ uri: url }}
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => Alert.alert("خطأ", "فشل تحميل صفحة الدفع")}
        onNavigationStateChange={(nav) => {
          const currentUrl = String(nav.url || "");

          if (handledResult) return;

          if (currentUrl.includes(SUCCESS_URL_PART)) {
            setHandledResult(true);
            Alert.alert("تم الدفع", "تمت عملية الدفع بنجاح.", [
              {
                text: "حسناً",
                onPress: () => {
                  router.back();
                },
              },
            ]);
            return;
          }

          if (currentUrl.includes(FAIL_URL_PART)) {
            setHandledResult(true);
            Alert.alert("لم يكتمل الدفع", "تم إلغاء العملية أو فشلت.", [
              {
                text: "حسناً",
                onPress: () => {
                  router.back();
                },
              },
            ]);
            return;
          }
        }}
      />

      {/* Loading overlay بسيط */}
      {loading ? (
        <View
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            paddingTop: 14,
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      ) : null}
    </SafeAreaView>
  );
}