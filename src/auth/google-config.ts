import { Platform } from 'react-native';

// EXPO_PUBLIC_* values are public client IDs, not secrets. Each is read literally so Expo can inline it.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const googleClientIds = { webClientId, iosClientId, androidClientId };

/** True when the client ID this platform needs is set. Otherwise the Google button is hidden. */
export const googleEnabled: boolean = Platform.select({
  web: !!webClientId,
  ios: !!iosClientId,
  android: !!androidClientId,
  default: false,
});
