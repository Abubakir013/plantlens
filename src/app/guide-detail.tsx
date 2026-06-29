import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReAnimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { FloralDivider } from '@/components/FloralDivider';
import { LeafLoader } from '@/components/LeafLoader';
import { Colors } from '@/constants/colors';
import { useLocale } from '@/hooks/useLocale';
import { getCachedGuide, persistGuideForPlant, usePlantGuide } from '@/hooks/usePlantGuide';
import type { PlantGuide } from '@/hooks/usePlantGuide';

type TFn = ReturnType<typeof useLocale>['t'];

const { width: SW } = Dimensions.get('window');
// Shimmer strip is this wide; sweeps from -(STRIP) to +(SW + STRIP)
const STRIP_W = 220;

// ─── Shimmer block (Reanimated left-to-right sweep) ──────────────────────────
function ShimmerBlock({ width = '100%' as number | string, height = 16, radius = 8, style }: {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const tx = useSharedValue(-STRIP_W);
  useEffect(() => {
    tx.value = withRepeat(
      withTiming(SW + STRIP_W, { duration: 1300, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));
  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: Colors.mintMid, overflow: 'hidden' },
        style,
      ]}
    >
      <ReAnimated.View
        style={[
          { position: 'absolute', top: 0, bottom: 0, width: STRIP_W },
          stripStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.62)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </ReAnimated.View>
    </View>
  );
}

// ─── Full skeleton with leaf loader above it ──────────────────────────────────
function LoadingShimmer({ label }: { label: string }) {
  return (
    <View style={styles.shimmerContainer}>
      {/* On-brand leaf indicator */}
      <View style={styles.loaderWrap}>
        <LeafLoader label={label} />
      </View>

      {/* Skeleton blocks */}
      <ShimmerBlock height={24} width="60%" radius={10} style={{ marginBottom: 10 }} />
      <ShimmerBlock height={14} width="85%" radius={7} style={{ marginBottom: 6 }} />
      <ShimmerBlock height={14} width="70%" radius={7} style={{ marginBottom: 22 }} />
      <ShimmerBlock height={14} width="90%" radius={7} style={{ marginBottom: 6 }} />
      <ShimmerBlock height={14} width="75%" radius={7} style={{ marginBottom: 22 }} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22 }}>
        {[80, 100, 70].map((w, i) => (
          <ShimmerBlock key={i} height={30} width={w} radius={15} />
        ))}
      </View>
      <ShimmerBlock height={14} width="95%" radius={7} style={{ marginBottom: 6 }} />
      <ShimmerBlock height={14} width="88%" radius={7} style={{ marginBottom: 6 }} />
      <ShimmerBlock height={14} width="80%" radius={7} style={{ marginBottom: 6 }} />
      <ShimmerBlock height={14} width="92%" radius={7} />
    </View>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12L15 6" stroke={Colors.darkGreen} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconStar() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={Colors.darkGreen} stroke={Colors.darkGreen} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconCheck() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={Colors.darkGreen} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Guide content (fades in when data arrives) ───────────────────────────────
function GuideContent({ guide, t }: { guide: PlantGuide; t: TFn }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
      {!!guide.seasonOrKeyFacts && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconStar />
            <Text style={styles.cardTitle}>{t('guide.keyFacts')}</Text>
          </View>
          <Text style={styles.cardText}>{guide.seasonOrKeyFacts}</Text>
        </View>
      )}

      {guide.benefits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('guide.benefits')}</Text>
          <View style={styles.chipsRow}>
            {guide.benefits.map((b, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <FloralDivider width={340} />

      {!!guide.detailedText && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('guide.detailedGuide')}</Text>
          <View style={styles.card}>
            <Text style={styles.bodyText}>{guide.detailedText}</Text>
          </View>
        </View>
      )}

      {guide.tips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('guide.tips')}</Text>
          <View style={styles.tipsCard}>
            {guide.tips.map((tip, i) => (
              <View key={i} style={[styles.tipRow, i < guide.tips.length - 1 && styles.tipRowBorder]}>
                <View style={styles.tipCheck}><IconCheck /></View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GuideDetailScreen() {
  const params = useLocalSearchParams<{
    latinName: string;
    topicId: string;
    topicTitle: string;
    language: string;
    plantId?: string;
  }>();
  const { t } = useLocale();
  const { fetchGuide, loading, error } = usePlantGuide();

  const { latinName = '', topicId = '', topicTitle = '', language = 'en', plantId } = params;

  const [guide, setGuide] = useState<PlantGuide | null>(() =>
    latinName && topicId ? getCachedGuide(latinName, topicId, language) : null,
  );

  // Shimmer fade-out: keep the skeleton mounted a beat after loading ends
  // so it can cross-fade with the incoming content (GuideContent fades in over 380ms).
  const shimmerFade = useRef(new Animated.Value(0)).current;
  const [shimmerVisible, setShimmerVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      shimmerFade.setValue(1);
      setShimmerVisible(true);
    } else if (shimmerVisible) {
      Animated.timing(shimmerFade, { toValue: 0, duration: 350, useNativeDriver: true }).start(
        ({ finished }) => { if (finished) setShimmerVisible(false); },
      );
    }
  }, [loading]);

  useEffect(() => {
    if (guide) return;
    if (!latinName || !topicId) return;
    fetchGuide(latinName, topicId, topicTitle, language).then((g) => {
      if (!g) return;
      setGuide(g);
      if (plantId) void persistGuideForPlant(plantId, topicId, g, language);
    });
  }, [latinName, topicId, language]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <IconBack />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {guide?.title ?? topicTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces
      >
        <Text style={styles.latinName}>{latinName}</Text>

        {/* Shimmer — fades out when loading finishes, overlaps with content fade-in */}
        {shimmerVisible && (
          <Animated.View style={{ opacity: shimmerFade }}>
            <LoadingShimmer label={t('guide.loading')} />
          </Animated.View>
        )}

        {/* Error — only after shimmer is gone */}
        {!loading && !shimmerVisible && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>{t('guide.errorTitle')}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                fetchGuide(latinName, topicId, topicTitle, language).then((g) => {
                  if (!g) return;
                  setGuide(g);
                  if (plantId) void persistGuideForPlant(plantId, topicId, g, language);
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>{t('guide.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content — starts fading in as soon as guide is ready */}
        {guide && <GuideContent guide={guide} t={t} />}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: Colors.lightMintBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mintMid,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  latinName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  shimmerContainer: { gap: 0, paddingTop: 4 },
  loaderWrap: { alignItems: 'center', paddingVertical: 24 },

  // Guide content
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkGreen,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },
  section:      { gap: 10 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold' },
  chipsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.mintMid,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primaryGreen + '55',
  },
  chipText: { fontSize: 13, color: Colors.darkGreen, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  bodyText:  { fontSize: 14, color: Colors.textPrimary, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tipRow:       { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  tipRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  tipCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19, fontFamily: 'Inter_400Regular' },

  // Error
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#DC2626', fontFamily: 'Inter_700Bold' },
  errorText:  { fontSize: 13, color: '#EF4444', textAlign: 'center', fontFamily: 'Inter_400Regular' },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.darkGreen,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: Colors.white, fontFamily: 'Inter_600SemiBold' },
});
