import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { fontAssets } from '@/constants/fonts';
import { queryClient } from '@/configuration/query/queryClient';
import RootNavigator from '@/configuration/navigation/RootNavigator';
import LoadingScreen from '@/screens/Loading/LoadingScreen';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { LanguageProvider } from '@/store/LanguageContext';
import { getUserRole, hasSeenOnboarding } from '@/utils/storage';

SplashScreen.preventAutoHideAsync();

// How long the loading screen stays visible on every launch.
const MIN_LOADING_MS = 2200;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Loading screen -> (intro, once) -> the app. It waits for the saved login to be checked,
// so a logged-in person opens straight on Home with their photo.
function Root() {
  const { ready: authReady, role: accountRole } = useAuth();
  const [storageReady, setStorageReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [roleChosen, setRoleChosen] = useState(false); // a visitor already finished the role screen
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([hasSeenOnboarding(), getUserRole(), wait(MIN_LOADING_MS)]).then(([seen, savedRole]) => {
      if (!active) return;
      setHasOnboarded(seen);
      setRoleChosen(savedRole === 'user');
      setStorageReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Latch: after the first start-up the loading screen never comes back (auth `ready` flickers
  // while someone logs in, and that must not unmount the navigator).
  if (!booted && storageReady && authReady) setBooted(true);
  if (!booted) return <LoadingScreen />;

  return (
    <RootNavigator
      hasOnboarded={hasOnboarded}
      startOnHome={roleChosen || Boolean(accountRole)}
      onOnboardingDone={() => setHasOnboarded(true)}
    />
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <Root />
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
