// import { RootState } from '@/redux/store';
// import { Redirect, Stack } from 'expo-router';
// import { useSelector } from 'react-redux';

// export default function AuthLayout() {
// const { isLoggedIn } = useSelector((state: RootState) => state.auth);


//   if (isLoggedIn) {
//     return <Redirect href="/(tabs)" />;
//   }

//   return <Stack screenOptions={{ headerShown: false }} />;
// }


// app/(auth)/_layout.tsx
// import { Colors } from "@/constants/theme";
// import { RootState } from "@/redux/store";
// import { Redirect, Stack } from "expo-router";
// import { ActivityIndicator, useColorScheme, View } from "react-native";
// import { useSelector } from "react-redux";

// export default function AuthLayout() {
//   const { isLoggedIn, hydrated } = useSelector((state: RootState) => state.auth);

//   const cs = useColorScheme();
//   const theme = Colors[cs === "dark" ? "dark" : "light"];

//   // ✅ انتظر تحميل AsyncStorage
//   if (!hydrated) {
//     return (
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background }}>
//         <ActivityIndicator size="large" color={theme.tint} />
//       </View>
//     );
//   }

//   if (isLoggedIn) {
//     return <Redirect href="/(tabs)" />;
//   }

//   return <Stack screenOptions={{ headerShown: false }} />;
// }

// app/(auth)/_layout.tsx
import { Colors } from "@/constants/theme";
import { RootState } from "@/redux/store";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { useSelector } from "react-redux";

export default function AuthLayout() {
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

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}