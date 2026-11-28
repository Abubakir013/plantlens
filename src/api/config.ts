import { Platform } from 'react-native';

// Production: EXPO_PUBLIC_API_URL=https://plantlens-production.up.railway.app (set in .env)
// Local fallback: iOS Simulator → localhost, Android Emulator → 10.0.2.2
const HOST =
  process.env.EXPO_PUBLIC_API_HOST ??
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${HOST}:${PORT}`;
