import { RootState } from '@/redux/store';
import { Redirect, Stack } from 'expo-router';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
const { isLoggedIn } = useSelector((state: RootState) => state.auth);


  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
