import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth, type AuthStatus } from '@/auth/provider';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { fontAssets, palette } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/** Pages anyone may open, signed in or not: the emailed links. */
const PUBLIC_ROUTES = new Set(['verify', 'invite']);
const GUEST_ROUTES = new Set(['login', 'signup', 'check-email']);

function targetFor(status: AuthStatus): { home: Href; allowed: Set<string> } | null {
  switch (status) {
    case 'signedOut':
      return { home: '/login' as Href, allowed: new Set([...GUEST_ROUTES, ...PUBLIC_ROUTES]) };
    case 'profile':
      return { home: '/complete-profile' as Href, allowed: new Set(['complete-profile', ...PUBLIC_ROUTES]) };
    case 'household':
      return { home: '/household' as Href, allowed: new Set(['household', ...PUBLIC_ROUTES]) };
    case 'ready':
      return { home: '/' as Href, allowed: new Set(['', ...PUBLIC_ROUTES]) };
    default:
      return null;
  }
}

/** Sends the user to the screen their auth state needs. */
function useAuthRedirect() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const first = (segments[0] as string | undefined) ?? '';

  useEffect(() => {
    const target = targetFor(status);
    if (!target) return;
    if (!target.allowed.has(first)) router.replace(target.home);
  }, [status, first, router]);
}

function Gate() {
  const { status, retry } = useAuth();
  useAuthRedirect();

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'offline') {
    return (
      <Screen>
        <ThemedText variant="title">Cannot reach the server</ThemedText>
        <ThemedText>You are still logged in. Check your connection, then try again.</ThemedText>
        <Button title="Try again" onPress={() => void retry()} />
      </Screen>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  // A font that fails to load must not block the app: fall back to system fonts.
  if (!loaded && !error) return null;
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
