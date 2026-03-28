

// import { useLanguage } from '@/context/LanguageContext';
import { toastConfig } from '@/components/AppToastConfig';
import GlobalNotificationListener from '@/components/GlobalNotificationListener';
import ModernDrawer from '@/components/ModernDrawer';
import { LanguageProvider } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkAuth } from '@/redux/slices/authSlice';
import { AppDispatch, RootState, store } from '@/redux/store';
import { injectDispatch } from '@/services/api';
import { initFCMAndSyncToken, registerFCMListeners } from '@/services/fcm';
import "@/services/notificationTasks";
import { registerBackgroundNotificationTask } from '@/services/notificationTasks';
import { attachSocketListeners, connectSocket, disconnectSocket } from '@/services/socket';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch, useSelector } from 'react-redux';
import AuthLoadingScreen from './auth-loading';

function RootStack() {
  // const { language } = useLanguage();

  return (
    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat" />
      <Stack.Screen name="room" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="edit-profile" />

      <Stack.Screen name="create-tweet" />
      <Stack.Screen name="biometric-lock" />
      <Stack.Screen name="suggested-friends" />



      <Stack.Screen name="paymob-checkout" />
      <Stack.Screen name="two-factor" />
      <Stack.Screen name="login-alerts" />
      <Stack.Screen name="verify-account" />
      <Stack.Screen name="theme-settings" />
      <Stack.Screen name="font-settings" />
      <Stack.Screen name="data-usage" />
      <Stack.Screen name="language-settings" />
      <Stack.Screen name="about-app" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-conditions" />
      <Stack.Screen name="blocked" />
      <Stack.Screen name="room-details" />
      <Stack.Screen name="change-email" />


      <Stack.Screen name="add-friend" />
      <Stack.Screen
        name="friend-request-modal"
        options={{ presentation: 'transparentModal' }}
      />

      <Stack.Screen name="force-update" />


    </Stack>
  );
}





/* ============================================= */
/*               INNER APP LAYER                 */
/* ============================================= */
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const token = useSelector((state: RootState) => state.auth.token);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);
  const forceUpdateRequired = useSelector((state: RootState) => state.app.required);
const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /* =========================
     1) Inject dispatch once
  ========================= */
  useEffect(() => {
    injectDispatch(store.dispatch);
  }, []);

  /* =========================
     2) Check auth on app start
  ========================= */
  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  /* =========================
     3) Notifications + FCM
  ========================= */
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const handleNotificationOpen = (data: any) => {
      console.log("🚀 Notification open data:", data);

      // عدّل هذه المسارات حسب ملفات app عندك لو كانت مختلفة
      if (data?.type === "chat" && data?.chatId) {
        router.push(`/chat/${data.chatId}` as any);
        return;
      }

      if (data?.type === "room" && data?.roomId) {
        router.push(`/room/${data.roomId}` as any);
        return;
      }

      if (data?.type === "notification") {
        router.push("/notifications" as any);
        return;
      }
    };

    (async () => {
      try {
        await registerBackgroundNotificationTask();
        await initFCMAndSyncToken();
        cleanup = await registerFCMListeners(handleNotificationOpen);
      } catch (error) {
        console.log("❌ Notifications bootstrap failed:", error);
      }
    })();

    return () => {
      cleanup?.();
    };
  }, [router]);

  /* =========================
     4) Socket only in foreground
  ========================= */
    /* =========================
     4) Socket always connected
  ========================= */
  useEffect(() => {
    if (!hydrated) return;

    const connectIfNeeded = () => {
      if (!token) return;

      console.log("🔌 Ensuring socket is connected...");
      connectSocket(token);
      attachSocketListeners(store.dispatch, store.getState);
    };

    if (!token) {
      console.log("🔴 No token -> disconnect socket");
      disconnectSocket();
      return;
    }

    // ✅ اتصل مرة واحدة طالما يوجد token
    connectIfNeeded();

    const sub = AppState.addEventListener("change", (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      console.log("📱 AppState changed:", prevState, "->", nextState);

      // ✅ لا تفصل في الخلفية نهائيًا
      // فقط لو رجع active وتأكدنا أن السوكيت انقطع لأي سبب، نعيد الاتصال
      if (nextState === "active") {
        console.log("🟢 App active -> ensure socket connected");
        connectIfNeeded();
      }
    });

    return () => {
      sub.remove();

      // ✅ لا تفصل هنا إلا لو token اختفى أو المكون اتفك فعليًا
      // وهذا طبيعي عند logout / reload
      console.log("🧹 AppContent cleanup -> disconnect socket");
      disconnectSocket();
    };
  }, [hydrated, token]);
  // useEffect(() => {
  //   if (!hydrated) return;

  //   const connectIfNeeded = () => {
  //     if (!token) return;

  //     console.log("🔌 Connecting socket because app is active");
  //     connectSocket(token);
  //     attachSocketListeners(store.dispatch, store.getState);
  //   };

  //   const disconnectIfNeeded = () => {
  //     console.log("🔌 Disconnecting socket");
  //     disconnectSocket();
  //   };

  //   if (!token) {
  //     disconnectIfNeeded();
  //     return;
  //   }

  //   // أول تشغيل
  //   if (appStateRef.current === "active") {
  //     connectIfNeeded();
  //   } else {
  //     disconnectIfNeeded();
  //   }

  //   const sub = AppState.addEventListener("change", (nextState) => {
  //     const prevState = appStateRef.current;
  //     appStateRef.current = nextState;

  //     console.log("📱 AppState changed:", prevState, "->", nextState);

  //     // رجع للتطبيق
  //     if (
  //       (prevState === "background" || prevState === "inactive") &&
  //       nextState === "active"
  //     ) {
  //       console.log("🟢 App returned to foreground -> reconnect socket");
  //       connectIfNeeded();

  //       // اختياري: أضف مزامنة هنا لو عندك thunks
  //       // dispatch(fetchNotifications() as any);
  //       // dispatch(fetchChats() as any);
  //     }

  //     // دخل الخلفية
  //     if (nextState === "background" || nextState === "inactive") {
  //       console.log("🌙 App moved to background -> disconnect socket");
  //       disconnectIfNeeded();
  //     }
  //   });

  //   return () => {
  //     sub.remove();
  //     disconnectIfNeeded();
  //   };
  // }, [hydrated, token]);

  /* =========================
     5) Force update navigation
  ========================= */
  useEffect(() => {
    if (forceUpdateRequired) {
      console.log("🚨 Force update required -> navigating");
      router.replace("/force-update" as any);
    }
  }, [forceUpdateRequired, router]);
  if (!hydrated) {
    return <AuthLoadingScreen />;
  }
  return (
    <>
      <ModernDrawer>
    <RootStack />
    <GlobalNotificationListener />
    <Toast config={toastConfig} topOffset={55} />
    <StatusBar style="auto" />
  </ModernDrawer>
    </>
  );
}

/* ============================================= */
/*                 ROOT LAYOUT                   */
/* ============================================= */

export default function RootLayout() {

const { colorScheme } = useColorScheme();

  return (
    <KeyboardProvider>

      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AppContent />
            </ThemeProvider>
            {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AppContent />
            </ThemeProvider> */}
          </LanguageProvider>
        </GestureHandlerRootView>
      </Provider>
    </KeyboardProvider>

  );
}
