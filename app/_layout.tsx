

import SocketListener from '@/components/SocketListener';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/redux/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

function RootStack() {
  const { language } = useLanguage();

  return (
    <Stack key={language} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat" />
      <Stack.Screen name="room" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="edit-profile" />
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
      <Stack.Screen name="add-friend" />
      <Stack.Screen
        name="friend-request-modal"
        options={{ presentation: 'transparentModal' }}
      />



    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootStack />
            {/* 🔥 SOCKET LISTENER HERE */}
            <SocketListener />
            <Toast />
            <StatusBar style="auto" />
          </ThemeProvider>
        </GestureHandlerRootView>
      </Provider>
    </LanguageProvider>
  );
}
