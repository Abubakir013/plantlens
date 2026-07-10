import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

import {
  AlertTriangle,
  BookHeart,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Stethoscope,
  Wrench,
} from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';
import { diagnosisStore } from '@/stores/diagnosisStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RING_SIZE = 140;
const RING_STROKE = 12;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

// ── Color helpers ─────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return '#2D6A4F';
  if (score >= 50) return '#B45309';
  return '#DC2626';
}

function severityBg(severity: string) {
  switch (severity) {
    case 'severe':   return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
    case 'moderate': return { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' };
    case 'mild':     return { bg: '#ECFDF5', text: '#047857', border: '#6EE7B7' };
    default:         return { bg: Colors.mintMid, text: Colors.darkGreen, border: Colors.primaryGreen };
  }
}

// ── Health ring ───────────────────────────────────────────────────────────────
function HealthRing({ score, reduced }: { score: number; reduced: boolean }) {
  const animScore = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  const [ringOffset, setRingOffset] = useState(RING_CIRC);
  const color = scoreColor(score);

  useEffect(() => {
    if (reduced) {
      setDisplay(score);
      setRingOffset(RING_CIRC * (1 - score / 100));
      return;
    }
    const id = animScore.addListener(({ value }) => {
      setDisplay(Math.round(value));
      setRingOffset(RING_CIRC * (1 - value / 100));
    });
    Animated.timing(animScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => {
      animScore.removeListener(id);
      animScore.stopAnimation();
    };
  }, [score, reduced]);

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <G rotation="-90" origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}>
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke={Colors.mintMid}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {/* Progress — updated via JS listener → state, avoids createAnimatedComponent on SVG */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringScore, { color }]}>{display}</Text>
        <Text style={styles.ringLabel}>/100</Text>
      </View>
    </View>
  );
}

// ── Severity badge ─────────────────────────────────────────────────────────────
function SeverityBadge({ severity, label, reduced }: { severity: string; label: string; reduced: boolean }) {
  const scale = useRef(new Animated.Value(reduced ? 1 : 0.5)).current;
  const colors = severityBg(severity);

  useEffect(() => {
    if (reduced) return;
    Animated.spring(scale, {
      toValue: 1,
      tension: 140,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [reduced]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={[styles.severityBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.severityText, { color: colors.text }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

// ── Card with staggered entrance ──────────────────────────────────────────────
function DiagCard({
  icon,
  title,
  children,
  delay,
  reduced,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
}) {
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduced ? 0 : 28)).current;

  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, reduced]);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

// ── Bullet list ───────────────────────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Treatment step (expandable) ───────────────────────────────────────────────
function TreatmentStep({
  step,
  title,
  detail,
  timeframe,
  stepLabel,
}: {
  step: number;
  title: string;
  detail: string;
  timeframe: string;
  stepLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.7 },
    });
    setOpen(v => !v);
  }, []);

  return (
    <TouchableOpacity
      style={styles.stepCard}
      onPress={toggle}
      activeOpacity={0.8}
    >
      <View style={styles.stepHeader}>
        <View style={styles.stepNumWrap}>
          <Text style={styles.stepNum}>{step}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepLabel}>{stepLabel} {step}</Text>
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
        {open ? (
          <ChevronUp size={18} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={Colors.textMuted} />
        )}
      </View>
      {open && (
        <View style={styles.stepBody}>
          <Text style={styles.stepDetail}>{detail}</Text>
          <View style={styles.timeframeChip}>
            <Text style={styles.timeframeText}>{timeframe}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Material chip ─────────────────────────────────────────────────────────────
function MaterialChip({ label }: { label: string }) {
  return (
    <View style={styles.materialChip}>
      <Text style={styles.materialChipText}>{label}</Text>
    </View>
  );
}

// ── Back button ───────────────────────────────────────────────────────────────
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn} activeOpacity={0.8}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </TouchableOpacity>
  );
}

// ── Main result screen ────────────────────────────────────────────────────────
export default function DiagnosisResultScreen() {
  const result = diagnosisStore.getResult();
  const imageUri = diagnosisStore.getImageUri();
  const { savePlant } = usePlantCollection();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  if (!result) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('diagnose.error.title')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn} activeOpacity={0.8}>
            <Text style={styles.retryText}>{t('diagnose.error.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Not a plant ───────────────────────────────────────────────────────────
  if (!result.isPlant) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => router.back()} />
        </View>
        <View style={styles.centered}>
          <View style={[styles.cardIconWrap, { width: 72, height: 72, borderRadius: 36, marginBottom: 16 }]}>
            <Leaf size={32} color={Colors.textMuted} />
          </View>
          <Text style={styles.noPlantTitle}>{t('diagnose.noPlant.title')}</Text>
          <Text style={styles.noPlantText}>{t('diagnose.noPlant.text')}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <LinearGradient colors={['#2D6A4F', '#143026']} style={styles.primaryBtnGrad}>
              <Text style={styles.primaryBtnText}>{t('diagnose.retake')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const severityKey = (result.severity ?? 'none') as 'none' | 'mild' | 'moderate' | 'severe';
  const severityLabel = t(`diagnose.severity.${severityKey}`);

  const diagnosis = result.diagnosis ?? { problemName: '', problemType: 'disease', confidence: 0, visibleSymptoms: [] };
  const cause = result.cause ?? { summary: '', contributingFactors: [] };
  const treatment = result.treatment ?? { urgency: '', steps: [], materialsNeeded: [] };
  const prevention = result.prevention ?? { summary: '', tips: [] };

  const handleSave = () => {
    if (saved || !imageUri) return;
    savePlant({
      id: `diag_${Date.now()}`,
      name: result.plantName || t('diagnose.title'),
      scientificName: diagnosis.problemName,
      confidence: diagnosis.confidence,
      imageUri,
      dateIdentified: new Date().toISOString(),
      watering: '',
      light: '',
      temperature: '',
      toxicity: '',
      funFact: result.expectedRecovery ?? '',
    });
    setSaved(true);
  };

  const CARD_DELAY_BASE = 180;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.screenTitle}>{t('diagnose.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero photo */}
        {imageUri && (
          <View style={styles.heroWrap}>
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(243,246,241,0.85)']}
              style={styles.heroGradient}
            />
            <View style={styles.heroPlantName}>
              <Text style={styles.heroPlantNameText}>{result.plantName}</Text>
            </View>
          </View>
        )}

        {/* Health score + severity */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <HealthRing score={result.healthScore} reduced={reducedMotion} />
            <Text style={styles.scoreLabel}>{t('diagnose.healthScore')}</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.severityLabel}>{t('diagnose.severityLabel')}</Text>
            <SeverityBadge
              severity={result.severity}
              label={severityLabel}
              reduced={reducedMotion}
            />
            {result.isHealthy ? (
              <View style={styles.healthyRow}>
                <ShieldCheck size={16} color={Colors.darkGreen} />
                <Text style={styles.healthyText}>{t('diagnose.healthy.title')}</Text>
              </View>
            ) : (
              treatment.urgency ? (
                <View style={styles.urgencyRow}>
                  <AlertTriangle size={14} color="#B45309" />
                  <Text style={styles.urgencyText}>{treatment.urgency}</Text>
                </View>
              ) : null
            )}
          </View>
        </View>

        {/* Healthy message */}
        {result.isHealthy && (
          <View style={styles.healthyBanner}>
            <ShieldCheck size={20} color={Colors.darkGreen} />
            <Text style={styles.healthyBannerText}>{t('diagnose.healthy.text')}</Text>
          </View>
        )}

        {/* Diagnosis card */}
        {!result.isHealthy && (
          <DiagCard
            icon={<Stethoscope size={20} color={Colors.darkGreen} />}
            title={t('diagnose.diagnosisCard')}
            delay={CARD_DELAY_BASE}
            reduced={reducedMotion}
          >
            <Text style={styles.problemName}>{diagnosis.problemName}</Text>
            <View style={styles.confidenceRow}>
              <Text style={styles.confLabel}>{t('diagnose.confidence')}</Text>
              <Text style={styles.confValue}>{diagnosis.confidence}%</Text>
            </View>
            {diagnosis.visibleSymptoms.length > 0 && (
              <>
                <Text style={styles.subHeader}>{t('diagnose.symptoms')}</Text>
                <BulletList items={diagnosis.visibleSymptoms} />
              </>
            )}
          </DiagCard>
        )}

        {/* Cause card */}
        {!result.isHealthy && (
          <DiagCard
            icon={<FlaskConical size={20} color={Colors.darkGreen} />}
            title={t('diagnose.causeCard')}
            delay={CARD_DELAY_BASE * 2}
            reduced={reducedMotion}
          >
            <Text style={styles.causeSummary}>{cause.summary}</Text>
            {cause.contributingFactors.length > 0 && (
              <>
                <Text style={styles.subHeader}>{t('diagnose.factors')}</Text>
                <BulletList items={cause.contributingFactors} />
              </>
            )}
          </DiagCard>
        )}

        {/* Treatment card */}
        {!result.isHealthy && treatment.steps.length > 0 && (
          <DiagCard
            icon={<Wrench size={20} color={Colors.darkGreen} />}
            title={t('diagnose.treatmentCard')}
            delay={CARD_DELAY_BASE * 3}
            reduced={reducedMotion}
          >
            <View style={{ gap: 10 }}>
              {treatment.steps.map(s => (
                <TreatmentStep
                  key={s.step}
                  step={s.step}
                  title={s.title}
                  detail={s.detail}
                  timeframe={s.timeframe}
                  stepLabel={t('diagnose.step')}
                />
              ))}
            </View>
            {treatment.materialsNeeded.length > 0 && (
              <>
                <Text style={[styles.subHeader, { marginTop: 14 }]}>{t('diagnose.materialsNeeded')}</Text>
                <View style={styles.chipRow}>
                  {treatment.materialsNeeded.map((m, i) => (
                    <MaterialChip key={i} label={m} />
                  ))}
                </View>
              </>
            )}
          </DiagCard>
        )}

        {/* Prevention card */}
        <DiagCard
          icon={<BookHeart size={20} color={Colors.darkGreen} />}
          title={t('diagnose.preventionCard')}
          delay={CARD_DELAY_BASE * 4}
          reduced={reducedMotion}
        >
          {prevention.summary ? (
            <Text style={styles.causeSummary}>{prevention.summary}</Text>
          ) : null}
          {prevention.tips.length > 0 && (
            <BulletList items={prevention.tips} />
          )}
        </DiagCard>

        {/* Expected recovery */}
        {result.expectedRecovery ? (
          <DiagCard
            icon={<ShieldCheck size={20} color={Colors.darkGreen} />}
            title={t('diagnose.recovery')}
            delay={CARD_DELAY_BASE * 5}
            reduced={reducedMotion}
          >
            <Text style={styles.recoveryText}>{result.expectedRecovery}</Text>
          </DiagCard>
        ) : null}

        {/* Save button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSaved]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saved}
          >
            {saved ? (
              <View style={styles.saveBtnGrad}>
                <Text style={[styles.saveBtnText, { color: Colors.darkGreen }]}>{t('diagnose.savedBtn')}</Text>
              </View>
            ) : (
              <LinearGradient colors={['#2D6A4F', '#143026']} style={styles.saveBtnGrad}>
                <Text style={styles.saveBtnText}>{t('diagnose.saveBtn')}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <AlertTriangle size={13} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>{t('diagnose.disclaimer')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightMintBg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  screenTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },

  // Hero
  heroWrap: { borderRadius: 20, overflow: 'hidden', height: 200, marginBottom: 16, backgroundColor: Colors.mintMid },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  heroPlantName: { position: 'absolute', bottom: 12, left: 16 },
  heroPlantNameText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold' },

  // Score + severity
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 12 },
  scoreLeft: { alignItems: 'center', gap: 6 },
  scoreLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  scoreRight: { flex: 1, gap: 10 },
  severityLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  healthyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  healthyText: { fontSize: 13, color: Colors.darkGreen, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyText: { fontSize: 12, color: '#B45309', fontFamily: 'Inter_400Regular', flex: 1 },

  // Ring
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringScore: { fontSize: 28, fontWeight: '800', fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  ringLabel: { fontSize: 11, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },

  // Severity badge
  severityBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  severityText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  // Healthy banner
  healthyBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.mintMid, borderRadius: 14, padding: 14, marginBottom: 12 },
  healthyBannerText: { fontSize: 14, color: Colors.darkGreen, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 20 },

  // Card
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.mintMid, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold' },

  // Diagnosis card
  problemName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  confidenceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  confLabel: { fontSize: 13, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  confValue: { fontSize: 13, fontWeight: '600', color: Colors.darkGreen, fontFamily: 'Inter_600SemiBold' },
  subHeader: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, fontFamily: 'Inter_600SemiBold', marginBottom: 8, marginTop: 4 },

  // Cause card
  causeSummary: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 10 },

  // Bullet list
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryGreen, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 20 },

  // Treatment steps
  stepCard: { backgroundColor: Colors.lightMintBg, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  stepHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  stepNumWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.darkGreen, alignItems: 'center', justifyContent: 'center' },
  stepNum: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  stepLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: 'Inter_400Regular', textTransform: 'uppercase', letterSpacing: 0.5 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
  stepBody: { paddingHorizontal: 14, paddingBottom: 12, gap: 10 },
  stepDetail: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  timeframeChip: { alignSelf: 'flex-start', backgroundColor: Colors.mintMid, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  timeframeText: { fontSize: 12, color: Colors.darkGreen, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },

  // Materials
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  materialChip: { backgroundColor: Colors.mintMid, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  materialChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },

  // Recovery
  recoveryText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 21, fontStyle: 'italic' },

  // Save button
  actionRow: { marginTop: 4, marginBottom: 4 },
  saveBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: Colors.darkGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5 },
  saveBtnSaved: { backgroundColor: Colors.mintMid },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },

  // Disclaimer
  disclaimer: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingTop: 12, paddingHorizontal: 4 },
  disclaimerText: { flex: 1, fontSize: 11, color: Colors.textMuted, fontFamily: 'Inter_400Regular', lineHeight: 17 },

  // Error / No plant states
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.darkGreen, marginTop: 8 },
  retryText: { fontSize: 15, fontWeight: '600', color: Colors.darkGreen, fontFamily: 'Inter_600SemiBold' },
  noPlantTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  noPlantText: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  primaryBtn: { borderRadius: 14, marginTop: 8, shadowColor: Colors.darkGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5 },
  primaryBtnGrad: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
});
