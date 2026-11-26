import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Globe, Leaf, Zap } from 'lucide-react-native';

import { FloralDivider } from '@/components/FloralDivider';
import { GreenButton } from '@/components/GreenButton';
import { PlantCard } from '@/components/PlantCard';
import { Colors } from '@/constants/colors';
import { usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';
import { pendingImageStore } from '@/stores/pendingImageStore';

function PlantLensLogo() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={16} fill="#1B4332" />
      <Path
        d="M16 7 C13 9 9 13 9 17 C9 21 12 24 16 25 C16 23 14 19 15 16 C17 20 20 23 23 23 C26 21 27 18 27 15 C27 12 23 9 16 7Z"
        fill="white"
        opacity={0.88}
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.93)).current;
  const { plants } = usePlantCollection();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const recentPlants = plants.slice(0, 3);

  // ── Notification panel ──
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifSlide = useRef(new Animated.Value(-400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openNotif = () => {
    setIsNotifOpen(true);
    Animated.parallel([
      Animated.spring(notifSlide, {
        toValue: 0,
        tension: 65,
        friction: 13,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeNotif = () => {
    Animated.parallel([
      Animated.timing(notifSlide, {
        toValue: -400,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setIsNotifOpen(false));
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ]),
    ).start();
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, tension: 48, friction: 11, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUploadPhoto = async () => {
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

    const MAX_API_EDGE = 1568;
    const longest = Math.max(asset.width, asset.height);
    const resized = await ImageManipulator.manipulateAsync(
      asset.uri,
      longest > MAX_API_EDGE
        ? [asset.width >= asset.height ? { resize: { width: MAX_API_EDGE } } : { resize: { height: MAX_API_EDGE } }]
        : [],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!resized.base64) return;

    pendingImageStore.set(asset.uri, resized.base64);
    router.push('/identify');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View
        style={[styles.orbSmall, { transform: [{ scale: pulseAnim }] }]}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <PlantLensLogo />
            <Text style={styles.appName}>PlantLens</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={openNotif} activeOpacity={0.8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.9 16.4 5.4 13.5 4.7V4C13.5 3.2 12.8 2.5 12 2.5C11.2 2.5 10.5 3.2 10.5 4V4.7C7.6 5.4 6 7.9 6 11V16L4 18V19H20V18L18 16Z"
                fill={Colors.darkGreen}
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          <Animated.View style={{ opacity: heroFade, transform: [{ scale: heroScale }] }}>
            <View style={styles.heroPhotoPanel}>
              <Image
                source={require('../../../assets/images/flower-lily-pink.png')}
                style={styles.heroPhotoImg}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
          <Text style={styles.tagline}>
            {t('home.tagline')}{'\n'}
            <Text style={styles.taglineAccent}>{t('home.taglineAccent')}</Text>
          </Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <GreenButton
            label={t('home.identifyWithCamera')}
            onPress={() => router.push('/identify')}
            style={styles.ctaBtn}
          />
          <GreenButton
            label={t('home.uploadFromGallery')}
            onPress={handleUploadPhoto}
            variant="secondary"
            style={styles.ctaBtn}
          />
        </View>

        {/* Stats pills */}
        <View style={styles.statsRow}>
          {[
            { Icon: Leaf,  value: plants.length.toString(), label: t('home.identified') },
            { Icon: Globe, value: '10K+',                  label: t('home.species') },
            { Icon: Zap,   value: '< 5s',                  label: t('home.speed') },
          ].map((s) => (
            <View key={s.label} style={styles.statPill}>
              <s.Icon size={20} color={Colors.darkGreen} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent identifications */}
        {recentPlants.length > 0 && (
          <View style={styles.recentSection}>
            <FloralDivider width={320} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.recentIdentifications')}</Text>
              <TouchableOpacity onPress={() => router.push('/collection')}>
                <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {recentPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                name={plant.name}
                scientificName={plant.scientificName}
                imageUri={plant.imageUri}
                confidence={plant.confidence}
                dateIdentified={plant.dateIdentified}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Notification panel ── */}
      <Modal
        visible={isNotifOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeNotif}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeNotif} activeOpacity={1} />
        </Animated.View>

        {/* Sliding panel */}
        <Animated.View
          style={[
            styles.notifPanel,
            { paddingTop: insets.top + 16, transform: [{ translateY: notifSlide }] },
          ]}
        >
          {/* Panel header */}
          <View style={styles.notifPanelHeader}>
            <Text style={styles.notifPanelTitle}>{t('home.notificationsTitle')}</Text>
            <TouchableOpacity onPress={closeNotif} style={styles.notifCloseBtn} activeOpacity={0.75}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18" stroke={Colors.textMuted} strokeWidth={2.2} strokeLinecap="round" />
                <Path d="M6 6L18 18" stroke={Colors.textMuted} strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.notifDivider} />

          {/* Empty state */}
          <View style={styles.notifEmptyState}>
            <View style={styles.notifIconWrap}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.9 16.4 5.4 13.5 4.7V4C13.5 3.2 12.8 2.5 12 2.5C11.2 2.5 10.5 3.2 10.5 4V4.7C7.6 5.4 6 7.9 6 11V16L4 18V19H20V18L18 16Z"
                  fill={Colors.primaryGreen}
                />
              </Svg>
            </View>
            <Text style={styles.notifEmptyTitle}>{t('home.notificationsEmptyTitle')}</Text>
            <Text style={styles.notifEmptyText}>{t('home.notificationsEmptyText')}</Text>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  orbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(45, 106, 79, 0.07)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  heroPhotoPanel: {
    backgroundColor: '#F3F6F1',
    borderRadius: 26,
    width: 300,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  heroPhotoImg: {
    width: 300,
    height: 220,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
    zIndex: 1,
  },
  taglineAccent: {
    color: Colors.darkGreen,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 16,
  },
  ctaContainer: {
    gap: 12,
    marginTop: 4,
  },
  ctaBtn: {
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  recentSection: {
    marginTop: 8,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  seeAll: {
    fontSize: 13,
    color: Colors.darkGreen,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  // ── Notification modal ──
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  notifPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
  },
  notifPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notifPanelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  notifCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightMintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDivider: {
    height: 1,
    backgroundColor: Colors.lightMintBg,
    marginBottom: 24,
  },
  notifEmptyState: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  notifIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.lightMintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notifEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  notifEmptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 16,
  },
});
