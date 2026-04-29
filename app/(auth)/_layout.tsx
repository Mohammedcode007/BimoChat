
// app/(auth)/_layout.tsx
import { Colors } from "@/constants/theme";
import { RootState } from "@/redux/store";
import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { useSelector } from "react-redux";

export default function AuthLayout() {
   const segments = useSegments();
const currentScreen = segments[segments.length - 1];

  const { isLoggedIn, hydrated } = useSelector((state: RootState) => state.auth);

  const cs = useColorScheme();
  const theme = Colors[cs === "dark" ? "dark" : "light"];

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }


if (isLoggedIn && currentScreen !== "choose-location") {
  return <Redirect href="/(tabs)" />;
}

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
            <Stack.Screen name="choose-location" />
            <Stack.Screen name="blocked" options={{ headerShown: false }} />
                        <Stack.Screen name="forgot-password" />


    </Stack>
  );
}