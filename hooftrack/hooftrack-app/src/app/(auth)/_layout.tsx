import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@features/auth/AuthProvider';
import { COLORS } from '@shared/constants/theme';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
      }}
    />
  );
}
