import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_KEY = 'lf_refresh_token';

/**
 * Only the refresh token is stored. The access token lives in memory (15 minutes).
 * Native: Keychain / Keystore through expo-secure-store. Web: localStorage (SecureStore has no web support).
 * TODO before a real web app: localStorage is readable by any script on the page (XSS). The owner accepted it for now; revisit.
 * Every call is wrapped: storage can be blocked (private window), and the app must still work for the session.
 */
export async function loadRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(REFRESH_KEY) ?? null;
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function saveRefreshToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(REFRESH_KEY, token);
    else await SecureStore.setItemAsync(REFRESH_KEY, token);
  } catch {
    // Not persisted: the user stays logged in until the app closes.
  }
}

export async function clearRefreshToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.removeItem(REFRESH_KEY);
    else await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // Nothing to clear.
  }
}
