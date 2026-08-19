import { Redirect } from 'expo-router';
import { useBuyerStore } from '../src/stores/buyer';

export default function Index() {
  const { isOnboarded } = useBuyerStore();
  return <Redirect href={isOnboarded ? '/(tabs)' : '/(auth)/welcome'} />;
}
