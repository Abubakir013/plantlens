import { Platform } from 'react-native';

// For physical devices set EXPO_PUBLIC_API_HOST to your machine's LAN IP.
// iOS Simulator → localhost, Android Emulator → 10.0.2.2
const HOST =
  process.env.EXPO_PUBLIC_API_HOST ??
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

export const API_BASE_URL = `http://${HOST}:${PORT}`;
