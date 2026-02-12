
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import 'react-native-reanimated';
// import Toast from 'react-native-toast-message';

// import { AuthProvider } from '@/context/AuthContext';
// import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { AppDispatch, RootState, store } from '@/redux/store';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Provider, useDispatch, useSelector } from 'react-redux';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// function RootNavigation() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { isLoggedIn, loading } = useSelector(
//     (state: RootState) => state.auth
//   );
//   const { language } = useLanguage(); // 🔥 مهم جداً

//   const router = useRouter();

//   useEffect(() => {
//     if (!loading) {
//       if (isLoggedIn) {
//         router.replace('/(tabs)');
//       } else {
//         router.replace('/(auth)/login');
//       }
//     }
//   }, [loading, isLoggedIn]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <Stack key={language}>  {/* 🔥 هذا هو الحل */}
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//       <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//       <Stack.Screen name="chat" options={{ headerShown: false }} />
//       <Stack.Screen name="room" options={{ headerShown: false }} />

//       <Stack.Screen
//         name="notifications"
//         options={{ headerShown: false }}
//       />
//       {/* Profile */}
//       <Stack.Screen name="edit-profile" options={{ headerShown: false }} />

//       {/* Security */}
//       <Stack.Screen name="biometric-lock" options={{ headerShown: false }} />
//       <Stack.Screen name="two-factor" options={{ headerShown: false }} />
//       <Stack.Screen name="login-alerts" options={{ headerShown: false }} />
//       <Stack.Screen name="verify-account" options={{ headerShown: false }} />

//       {/* Appearance */}
//       <Stack.Screen name="theme-settings" options={{ headerShown: false }} />
//       <Stack.Screen name="font-settings" options={{ headerShown: false }} />

//       {/* Media & Data */}
//       <Stack.Screen name="data-usage" options={{ headerShown: false }} />

//       {/* App Section */}
//       <Stack.Screen name="language-settings" options={{ headerShown: false }} />
//       <Stack.Screen name="about-app" options={{ headerShown: false }} />
//       <Stack.Screen name="help-support" options={{ headerShown: false }} />
//       <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
//       <Stack.Screen name="terms-conditions" options={{ headerShown: false }} />

//       {/* Blocked Users */}
//       <Stack.Screen name="blocked" options={{ headerShown: false }} />
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <LanguageProvider>
//       <Provider store={store}>

//         <GestureHandlerRootView style={{ flex: 1 }}>
//           <AuthProvider>
//             <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//               <RootNavigation />
//               <Toast />

//               <StatusBar style="auto" />
//             </ThemeProvider>
//           </AuthProvider>
//         </GestureHandlerRootView>
//       </Provider>

//     </LanguageProvider>

//   );
// }

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
            <Toast />
            <StatusBar style="auto" />
          </ThemeProvider>
        </GestureHandlerRootView>
      </Provider>
    </LanguageProvider>
  );
}
