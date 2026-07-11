import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@features/auth/AuthProvider';
import { COLORS } from '@shared/constants/theme';

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.SURFACE },
        headerTintColor: COLORS.TEXT_PRIMARY,
        tabBarStyle: { backgroundColor: COLORS.SURFACE, borderTopColor: COLORS.BORDER },
        tabBarActiveTintColor: COLORS.PRIMARY_LIGHT,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        sceneStyle: { backgroundColor: COLORS.BACKGROUND },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="horses"
        options={{
          title: 'Horses',
          tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
