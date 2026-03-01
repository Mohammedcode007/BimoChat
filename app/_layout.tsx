

import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkAuth } from '@/redux/slices/authSlice';
import { AppDispatch, RootState, store } from '@/redux/store';
import { injectDispatch } from '@/services/api';
import { checkAppConfig } from '@/services/appConfig.service';
import { attachSocketListeners, connectSocket, disconnectSocket } from '@/services/socket';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch, useSelector } from 'react-redux';

function RootStack() {
  const { language } = useLanguage();

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

  const pathname = usePathname();

  const token = useSelector((state: RootState) => state.auth.token);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);

  // ✅ خذ السلايس كاملة (ليس required فقط)
  const appState = useSelector((st: RootState) => st.app);

  /* =========================
     1) اطبع المسار الحالي دائمًا
  ========================= */
 

  /* =========================
     2) اطبع حالة Force Update كاملة
  ========================= */
  useEffect(() => {
    console.log("🧩 APP STATE:", appState);
  }, [appState]);

  /* =========================
     3) اطبع مرة واحدة عند تشغيل التطبيق
        (لتعرف الحالة الابتدائية قبل أي شيء)
  ========================= */
  useEffect(() => {
    console.log("🚀 APP START STATE:", store.getState().app);
  }, []);


  useEffect(() => {
    injectDispatch(store.dispatch);
  }, []);

  useEffect(() => {
    checkAppConfig().catch(() => {});
  }, []);

  /* =========================
     5) سجل قبل التحويل
  ========================= */
  useEffect(() => {
    if (appState.required) {
      console.log("🚨 NAVIGATE TO FORCE UPDATE because required=true");
      console.log("🧾 ForceUpdate payload:", appState);
      router.replace("/force-update" as any);
    }
  }, [appState.required, router]); // أو [appState, router] لو تريد كل التفاصيل

  useEffect(() => {
    dispatch(checkAuth() as any);
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      disconnectSocket();
      return;
    }

    connectSocket(token);
    attachSocketListeners(store.dispatch, store.getState);

    return () => disconnectSocket();
  }, [hydrated, token]);

  return (
    <>
      <RootStack />
      <Toast />
      <StatusBar style="auto" />
    </>
  );
}

/* ============================================= */
/*                 ROOT LAYOUT                   */
/* ============================================= */

export default function RootLayout() {

  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppContent />
          </ThemeProvider>
        </GestureHandlerRootView>
      </Provider>
    </LanguageProvider>
  );
}
