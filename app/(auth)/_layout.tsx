import { Stack } from 'expo-router';
import { Colors } from '../../src/design-system';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.backgroundPrimary },
        animation: 'slide_from_right',
      }}
    />
  );
}
