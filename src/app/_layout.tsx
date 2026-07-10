import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInter,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
  useFonts as usePlayfair,
} from '@expo-google-fonts/playfair-display';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { ONBOARDING_KEY } from '@/app/onboarding';

export default function RootLayout() {
  const [interLoaded] = useInter({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!interLoaded || !playfairLoaded) return;
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setNeedsOnboarding(!v);
      setOnboardingChecked(true);
    });
  }, [interLoaded, playfairLoaded]);

  if (!interLoaded || !playfairLoaded || !onboardingChecked) {
    return <View style={{ flex: 1, backgroundColor: '#F0FDF4' }} />;
  }

  return (
    <LocaleProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="identify"
          options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
        />
        <Stack.Screen name="result" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen
          name="language-picker"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen name="plant-detail" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="guide-detail" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="diagnose" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
        <Stack.Screen name="diagnosis-result" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      {needsOnboarding && <Redirect href="/onboarding" />}
    </LocaleProvider>
  );
}
