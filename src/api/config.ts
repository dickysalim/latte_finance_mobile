const DEFAULT_API_URL = 'http://localhost:8787';

// EXPO_PUBLIC_* values are bundled into the app and visible to anyone: no secrets here.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
