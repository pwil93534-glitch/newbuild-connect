import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { ToastContainer } from '../src/components';
import { useBuyerStore } from '../src/stores/buyer';
import { useAppStore } from '../src/stores/app';
import { useVaultStore } from '../src/stores/vault';
import { useNotificationsStore } from '../src/stores/notifications';
import { useToursStore } from '../src/stores/tours';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const { loadFromStorage } = useBuyerStore();
  const loadAppFromStorage = useAppStore((state) => state.loadFromStorage);
  const loadVaultFromStorage = useVaultStore((state) => state.loadFromStorage);
  const loadNotificationsFromStorage = useNotificationsStore((state) => state.loadFromStorage);
  const loadToursFromStorage = useToursStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    loadAppFromStorage();
    loadVaultFromStorage();
    loadNotificationsFromStorage();
    loadToursFromStorage();
  }, [loadAppFromStorage, loadFromStorage, loadVaultFromStorage, loadNotificationsFromStorage, loadToursFromStorage]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
          <ToastContainer />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
