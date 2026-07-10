import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import { Camera, Stethoscope } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { useLocale } from '@/hooks/useLocale';
import { pendingImageStore } from '@/stores/pendingImageStore';

const MAX_API_EDGE = 1568;

export default function DiagnosisTab() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  const handleCamera = () => {
    router.push('/diagnose');
  };

  const handleGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
      base64: false,
    });

    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];

    const longest = Math.max(asset.width, asset.height);
    const resized = await ImageManipulator.manipulateAsync(
      asset.uri,
      longest > MAX_API_EDGE
        ? [asset.width >= asset.height
            ? { resize: { width: MAX_API_EDGE } }
            : { resize: { height: MAX_API_EDGE } }]
        : [],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!resized.base64) return;

    pendingImageStore.set(asset.uri, resized.base64);
    router.push('/diagnose');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Stethoscope size={48} color={Colors.darkGreen} />
          </View>
          <Text style={styles.title}>{t('diagnose.title')}</Text>
        </View>

        {/* Action cards */}
        <View style={styles.actions}>

          {/* Camera */}
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={handleCamera}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#2D6A4F', '#143026']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGrad}
            >
              <View style={styles.cardIconWrap}>
                <Camera size={26} color="#fff" />
              </View>
              <Text style={styles.primaryCardText}>{t('diagnose.buttonLabel')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity
            style={styles.secondaryCard}
            onPress={handleGallery}
            activeOpacity={0.85}
          >
            <View style={styles.galleryIconWrap}>
              <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
                  stroke={Colors.darkGreen}
                  strokeWidth={1.8}
                />
                <Circle cx="8.5" cy="8.5" r="1.5" fill={Colors.darkGreen} />
                <Path
                  d="M21 15L16 10L5 21"
                  stroke={Colors.darkGreen}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={styles.secondaryCardText}>{t('diagnose.uploadLabel')}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'center',
    gap: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  actions: {
    gap: 14,
  },
  primaryCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.darkGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 7,
  },
  cardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 14,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCardText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 24,
    gap: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  galleryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCardText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.darkGreen,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
});
