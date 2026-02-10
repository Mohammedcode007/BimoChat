// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//         <GestureHandlerRootView style={{ flex: 1 }}>

//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//           <Stack.Screen
//     name="chat"
//     options={{ headerShown: false }}
//   />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//         </GestureHandlerRootView>

//   );
// }

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [loading, isLoggedIn]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="room" options={{ headerShown: false }} />

      <Stack.Screen
        name="notifications"
        options={{ headerShown: false }}
      />
      {/* Profile */}
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />

      {/* Security */}
      <Stack.Screen name="biometric-lock" options={{ headerShown: false }} />
      <Stack.Screen name="two-factor" options={{ headerShown: false }} />
      <Stack.Screen name="login-alerts" options={{ headerShown: false }} />
      <Stack.Screen name="verify-account" options={{ headerShown: false }} />

      {/* Appearance */}
      <Stack.Screen name="theme-settings" options={{ headerShown: false }} />
      <Stack.Screen name="font-settings" options={{ headerShown: false }} />

      {/* Media & Data */}
      <Stack.Screen name="data-usage" options={{ headerShown: false }} />

      {/* App Section */}
      <Stack.Screen name="language-settings" options={{ headerShown: false }} />
      <Stack.Screen name="about-app" options={{ headerShown: false }} />
      <Stack.Screen name="help-support" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="terms-conditions" options={{ headerShown: false }} />

      {/* Blocked Users */}
      <Stack.Screen name="blocked" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
