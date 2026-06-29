import { Platform } from 'react-native';

// Physical device: set EXPO_PUBLIC_API_URL=http://192.168.x.x:3000 in .env
// iOS Simulator fallback → localhost, Android Emulator fallback → 10.0.2.2
const HOST =
  process.env.EXPO_PUBLIC_API_HOST ??
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${HOST}:${PORT}`;
