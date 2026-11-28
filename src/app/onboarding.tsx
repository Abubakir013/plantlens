import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { Bug, Droplet, Leaf, Ruler, Trophy } from 'lucide-react-native';

import { PAYMENTS_ENABLED } from '@/constants/config';
import { useLocale } from '@/hooks/useLocale';
import { getOnboardingT, OStr } from '@/i18n/onboarding-strings';

export const ONBOARDING_KEY = 'plantlens_onboarded';
const PREMIUM_KEY = 'plantlens_is_premium';
const { width: SW } = Dimensions.get('window');
const TOTAL = 29;

// ─── Botanical Luxury Palette ─────────────────────────────────────────────────

const OB = {
  cream:      '#F3F6F1',  // aligned with Colors.lightMintBg
  parchment:  '#EAF0EC',  // aligned with Colors.mintMid area
  forest:     '#1B4332',
  forestMid:  '#2D6A4F',
  sage:       '#52B788',
  sageMid:    '#74C69D',
  sageLight:  '#B7E4C7',
  gold:       '#C9A84C',
  cardBg:     '#FFFFFF',
  border:     '#D8E4DC',
  textDark:   '#0D1F15',  // aligned with Colors.textPrimary
  textMid:    '#3D5247',  // aligned with Colors.textSecondary
  textLight:  '#7A9080',  // aligned with Colors.textMuted
  errorRed:   '#C0392B',
  amber:      '#D97706',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type TFn = ReturnType<typeof getOnboardingT>;

interface OData {
  name:       string;
  experience: string;
  plantCount: string;
  hasPets:    string;
  struggles:  string[];
  plantTypes: string[];
  waterFreq:  string;
  light:      string;
  goal:       string;
  isPremium:  boolean;
}

const DEFAULT: OData = {
  name: '', experience: '', plantCount: '', hasPets: '',
  struggles: [], plantTypes: [], waterFreq: '', light: '', goal: '',
  isPremium: false,
};

const NO_BACK = new Set([0, 10, 11, 12, 13, 14, 15, 16, 17, 28]);

// ─── Shared UI ────────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: SW - 64 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: OB.gold, opacity: 0.3 }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: OB.gold, opacity: 0.5, marginHorizontal: 8 }} />
      <View style={{ flex: 1, height: 1, backgroundColor: OB.gold, opacity: 0.3 }} />
    </View>
  );
}

function BouncyBtn({
  label, onPress, style, outline, disabled,
}: { label: string; onPress: () => void; style?: object; outline?: boolean; disabled?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={disabled ? undefined : onPress}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={animStyle}>
        {outline ? (
          <View style={[ss.btnOutline, style]}>
            <Text style={ss.btnOutlineText}>{label}</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[OB.forestMid, OB.forest]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[ss.btnGrad, style]}
          >
            <Text style={ss.btnText}>{label}</Text>
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
}

function PulseBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const pulseScale = useSharedValue(1);
  const pulseOp = useSharedValue(0.6);
  const btnScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(withSequence(
      withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);
    pulseOp.value = withRepeat(withSequence(
      withTiming(0, { duration: 900 }), withTiming(0.6, { duration: 900 }),
    ), -1, false);
  }, []);
  const ripple = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }], opacity: pulseOp.value }));
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', width: SW - 48, height: 58, borderRadius: 16, backgroundColor: OB.sage },
          ripple,
        ]}
      />
      <Pressable
        onPressIn={() => { btnScale.value = withSpring(0.95); }}
        onPressOut={() => { btnScale.value = withSpring(1); }}
        onPress={onPress}
      >
        <Animated.View style={btnStyle}>
          <LinearGradient
            colors={[OB.forestMid, OB.forest]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[ss.btnGrad, { width: SW - 48 }]}
          >
            <Text style={ss.btnText}>{label}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}

function SelectCard({
  label, selected, onPress, multi,
}: { label: string; selected: boolean; onPress: () => void; multi?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  useEffect(() => {
    if (selected && !multi) scale.value = withSequence(withSpring(0.97), withSpring(1));
  }, [selected]);
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <Animated.View style={[ss.selectCard, selected && ss.selectCardOn, animStyle]}>
        {multi && (
          <View style={[ss.checkbox, selected && ss.checkboxOn]}>
            {selected && <Text style={ss.checkmark}>✓</Text>}
          </View>
        )}
        <Text style={[ss.selectLabel, selected && ss.selectLabelOn]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function QHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ width: '100%', marginBottom: 28 }}>
      <Text style={ss.qTitle}>{title}</Text>
      {sub && <Text style={ss.qSub}>{sub}</Text>}
    </View>
  );
}

// ─── Welcome Hero Photo ────────────────────────────────────────────────────────

function WelcomePhoto() {
  const fadeOp = useSharedValue(0);
  const photoScale = useSharedValue(0.90);
  useEffect(() => {
    fadeOp.value = withTiming(1, { duration: 900 });
    photoScale.value = withSpring(1, { damping: 12, stiffness: 80 });
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeOp.value,
    transform: [{ scale: photoScale.value }],
  }));
  return (
    <Animated.View style={[{ marginBottom: 8 }, animStyle]}>
      <View style={ss.welcomePhotoPanel}>
        <Image
          source={require('../../assets/images/flower-lily-single.png')}
          style={ss.welcomePhotoImg}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

// ─── Analysis Spinner ─────────────────────────────────────────────────────────

function AnalysisRing() {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 1800, easing: Easing.linear }), -1, false);
  }, []);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <Animated.View style={spinStyle}>
      <Svg width={90} height={90} viewBox="0 0 90 90">
        <Circle cx={45} cy={45} r={r} stroke={OB.sageLight} strokeWidth={4} fill="none" />
        <Circle cx={45} cy={45} r={r} stroke={OB.forest} strokeWidth={4} fill="none"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
        <Path d="M45 55 C38 55 32 48 32 40 C32 30 38 24 45 22 C52 24 58 30 58 40 C58 48 52 55 45 55Z" fill={OB.sage} />
        <Path d="M45 55 L45 22" stroke={OB.forest} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function BarChart({ col1, col2, val1, val2, unit }: {
  col1: string; col2: string; val1: string; val2: string; unit: string;
}) {
  const h1 = useSharedValue(0);
  const h2 = useSharedValue(0);
  const BAR_MAX = 140;
  const BAR_W = 70;
  useEffect(() => {
    h1.value = withDelay(300, withTiming(0.285, { duration: 900, easing: Easing.out(Easing.quad) }));
    h2.value = withDelay(700, withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.4)) }));
  }, []);
  const bar1Style = useAnimatedStyle(() => ({
    height: h1.value * BAR_MAX, backgroundColor: OB.amber, width: BAR_W, borderRadius: 8, alignSelf: 'flex-end' as const,
  }));
  const bar2Style = useAnimatedStyle(() => ({
    height: h2.value * BAR_MAX, width: BAR_W, borderRadius: 8, alignSelf: 'flex-end' as const, overflow: 'hidden' as const,
  }));
  return (
    <View style={{ alignItems: 'center', width: SW - 48 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24, height: BAR_MAX + 60, marginBottom: 8 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Animated.View style={bar1Style} />
          <Text style={ss.barLabel}>{col1}</Text>
          <Text style={[ss.barVal, { color: OB.amber }]}>{val1} {unit}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Animated.View style={bar2Style}>
            <LinearGradient colors={[OB.sageMid, OB.forest]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} />
          </Animated.View>
          <Text style={ss.barLabel}>{col2}</Text>
          <Text style={[ss.barVal, { color: OB.forest }]}>{val2} {unit}</Text>
        </View>
      </View>
    </View>
  );
}

function AreaChart({ line1, line2, badge }: { line1: string; line2: string; badge: string }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(200, withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }));
  }, []);
  const W = SW - 48;
  const H = 140;
  const flatY = H - 20;
  const flatPath = `M 0 ${flatY} L ${W} ${flatY}`;
  const flatArea = `M 0 ${flatY} L ${W} ${flatY} L ${W} ${H} L 0 ${H} Z`;
  const curveEnd = 16;
  const curvePath = `M 0 ${H - 20} C ${W * 0.3} ${H - 40} ${W * 0.6} ${H - 90} ${W} ${curveEnd}`;
  const curveArea = `M 0 ${H - 20} C ${W * 0.3} ${H - 40} ${W * 0.6} ${H - 90} ${W} ${curveEnd} L ${W} ${H} L 0 ${H} Z`;
  return (
    <View style={{ width: W, height: H + 32, alignItems: 'center' }}>
      <Svg width={W} height={H} style={{ position: 'absolute' }}>
        <Defs>
          <SvgLinearGradient id="flatFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={OB.amber} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={OB.amber} stopOpacity={0.0} />
          </SvgLinearGradient>
          <SvgLinearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={OB.sage} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={OB.sage} stopOpacity={0.0} />
          </SvgLinearGradient>
        </Defs>
        <Path d={flatArea} fill="url(#flatFill)" />
        <Path d={flatPath} stroke={OB.amber} strokeWidth={2} fill="none" strokeDasharray="6 3" />
        <Path d={curveArea} fill="url(#curveFill)" />
        <Path d={curvePath} stroke={OB.forest} strokeWidth={2.5} fill="none" />
        <Line x1={0} y1={H - 1} x2={W} y2={H - 1} stroke={OB.border} strokeWidth={1} />
      </Svg>
      <View style={[ss.chartBadge, { top: 8, right: 0 }]}>
        <Text style={ss.chartBadgeText}>{badge}</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', gap: 20 }}>
        <View style={ss.legendRow}>
          <View style={[ss.legendDot, { backgroundColor: OB.amber }]} />
          <Text style={ss.legendLabel}>{line1}</Text>
        </View>
        <View style={ss.legendRow}>
          <View style={[ss.legendDot, { backgroundColor: OB.forest }]} />
          <Text style={ss.legendLabel}>{line2}</Text>
        </View>
      </View>
    </View>
  );
}

function MoneyBar({ price, label, sub, highlight, delay = 0 }: {
  price: string; label: string; sub: string; highlight?: boolean; delay?: number;
}) {
  const scale = useSharedValue(0.85);
  const op = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
    op.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: op.value }));
  return (
    <Animated.View style={[ss.moneyCard, highlight && ss.moneyCardHL, animStyle]}>
      <Text style={[ss.moneyPrice, highlight && { color: OB.forest }]}>{price}</Text>
      <Text style={ss.moneyLabel}>{label}</Text>
      <Text style={ss.moneySub}>{sub}</Text>
    </Animated.View>
  );
}

// ─── Risk Bar Sub-component ───────────────────────────────────────────────────

function RiskBarItem({ label, val, color, pct, delay }: {
  label: string; val: string; color: string; pct: number; delay: number;
}) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withDelay(delay, withTiming(pct, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${prog.value * 100}%` as any }));
  return (
    <View style={ss.riskCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={ss.riskLabel}>{label}</Text>
        <Text style={[ss.riskVal, { color }]}>{val}</Text>
      </View>
      <View style={ss.riskTrack}>
        <Animated.View style={[ss.riskBar, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
}

// ─── Award Item Sub-component ─────────────────────────────────────────────────

function AwardItem({ text, delay }: { text: string; delay: number }) {
  const op = useSharedValue(0);
  const ty = useSharedValue(16);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 500 }));
    ty.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View style={[ss.awardCard, animStyle]}>
      <Trophy size={24} color={OB.forest} />
      <Text style={ss.awardText}>{text}</Text>
    </Animated.View>
  );
}

// ─── Reveal Item Sub-component ────────────────────────────────────────────────

function RevealItem({ Icon, title, desc, delay }: {
  Icon: React.ComponentType<{ size?: number; color?: string }>; title: string; desc: string; delay: number;
}) {
  const op = useSharedValue(0);
  const tx = useSharedValue(-20);
  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 500 }));
    tx.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: tx.value }] }));
  return (
    <Animated.View style={[ss.revealCard, animStyle]}>
      <View style={{ marginTop: 2 }}>
        <Icon size={26} color={OB.forestMid} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ss.revealTitle}>{title}</Text>
        <Text style={ss.revealDesc}>{desc}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Timeline Sub-components ──────────────────────────────────────────────────

function TLNodeItem({ day, label, op }: { day: string; label: string; op: SharedValue<number> }) {
  const animStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[ss.tlNode, animStyle]}>
      <View style={ss.tlDot} />
      <Text style={ss.tlDay}>{day}</Text>
      <Text style={ss.tlLabel}>{label}</Text>
    </Animated.View>
  );
}

function TLLineItem({ line }: { line: SharedValue<number> }) {
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: line.value }] }));
  return <Animated.View style={[ss.tlLine, animStyle]} />;
}

// ─── Screens 0–9: Questionnaire ───────────────────────────────────────────────

function Q0_Welcome({ t, onNext }: { t: TFn; onNext: () => void }) {
  const op = useSharedValue(0);
  const ty = useSharedValue(30);
  useEffect(() => {
    op.value = withTiming(1, { duration: 800 });
    ty.value = withSpring(0, { damping: 14 });
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: ty.value }] }));
  return (
    <View style={[ss.center, { backgroundColor: OB.cream }]}>
      <WelcomePhoto />
      <Animated.View style={[{ alignItems: 'center' }, animStyle]}>
        <Text style={ss.brandTitle}>{t('q0_title')}</Text>
        <Text style={ss.heroTagline}>{t('q0_tagline')}</Text>
        <GoldDivider />
        <Text style={ss.heroProse}>{t('q0_sub')}</Text>
        <View style={{ height: 36 }} />
        <BouncyBtn label={t('q0_cta')} onPress={onNext} style={{ width: SW - 64 }} />
      </Animated.View>
    </View>
  );
}

function Q1_Name({ t, data, setData, onNext, step }: {
  t: TFn; data: OData; setData: (d: OData) => void; onNext: () => void; step: number;
}) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, width: '100%' }}>
      <View style={ss.qCenter}>
        <QHeader title={t('q1_title')} sub={t('q1_sub')} />
        <TextInput
          style={ss.textInput}
          placeholder={t('q1_ph')}
          placeholderTextColor={OB.textLight}
          value={data.name}
          onChangeText={(v) => setData({ ...data, name: v })}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={data.name.trim() ? onNext : undefined}
        />
        <View style={{ height: 32 }} />
        <BouncyBtn label={t('continue')} onPress={onNext} disabled={!data.name.trim()} style={{ width: SW - 64 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

function SingleQ({ t, step, title, sub, options, value, onSelect }: {
  t: TFn; step: number; title: string; sub?: string;
  options: Array<{ val: string; label: string }>;
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={ss.qCenter}>
      <QHeader title={title} sub={sub} />
      {options.map((o) => (
        <SelectCard key={o.val} label={o.label} selected={value === o.val} onPress={() => onSelect(o.val)} />
      ))}
    </View>
  );
}

function MultiQ({ t, step, title, sub, options, values, onToggle, onNext }: {
  t: TFn; step: number; title: string; sub?: string;
  options: Array<{ val: string; label: string }>;
  values: string[];
  onToggle: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={ss.qCenter}>
      <QHeader title={title} sub={sub} />
      {options.map((o) => (
        <SelectCard key={o.val} label={o.label} selected={values.includes(o.val)} onPress={() => onToggle(o.val)} multi />
      ))}
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('continue')} onPress={onNext} disabled={values.length === 0} style={{ width: SW - 64 }} />
    </View>
  );
}

// ─── Screens 10–17: Analysis ──────────────────────────────────────────────────

function AnalysisAutoStep({ title, sub, duration }: {
  title: string; sub: string; duration: number;
}) {
  const prog = useSharedValue(0);
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withTiming(1, { duration: 400 });
    prog.value = withTiming(1, { duration: duration - 200, easing: Easing.out(Easing.quad) });
  }, []);
  const barStyle = useAnimatedStyle(() => ({ width: `${prog.value * 100}%` as any }));
  const opStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[ss.analysisWrap, opStyle]}>
      <AnalysisRing />
      <View style={{ height: 28 }} />
      <Text style={ss.analysisTitle}>{title}</Text>
      <Text style={ss.analysisSub}>{sub}</Text>
      <View style={{ height: 32 }} />
      <View style={ss.progressTrack}>
        <Animated.View style={[ss.progressFill, barStyle]} />
      </View>
    </Animated.View>
  );
}

function A7_Complete({ t, data, onNext }: { t: TFn; data: OData; onNext: () => void }) {
  const scale = useSharedValue(0.7);
  const op = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    op.value = withTiming(1, { duration: 600 });
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: op.value }));
  return (
    <View style={ss.center}>
      <Animated.View style={[{ alignItems: 'center', paddingHorizontal: 24 }, animStyle]}>
        <Leaf size={72} color={OB.forestMid} />
        <View style={{ height: 20 }} />
        <Text style={ss.analysisTitle}>{t('a7_title')}</Text>
        <Text style={ss.analysisSub}>{t('a7_sub')}</Text>
        {data.name ? (
          <View style={ss.nameChip}><Text style={ss.nameChipText}>{data.name}</Text></View>
        ) : null}
        <View style={{ height: 36 }} />
        <BouncyBtn label={t('a7_cta')} onPress={onNext} style={{ width: SW - 64 }} />
      </Animated.View>
    </View>
  );
}

// ─── Screens 18–23: Data & Statistics ────────────────────────────────────────

function D0_BarChart({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d0_title')} sub={t('d0_sub')} />
      <BarChart col1={t('d0_col1')} col2={t('d0_col2')} val1={t('d0_val1')} val2={t('d0_val2')} unit={t('d0_unit')} />
      <View style={{ height: 32 }} />
      <BouncyBtn label={t('d0_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function D1_AreaChart({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d1_title')} sub={t('d1_sub')} />
      <AreaChart line1={t('d1_line1')} line2={t('d1_line2')} badge={t('d1_badge')} />
      <View style={{ height: 32 }} />
      <BouncyBtn label={t('d1_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function D2_Money({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d2_title')} sub={t('d2_sub')} />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
        <MoneyBar price={t('d2_item1_price')} label={t('d2_item1')} sub={t('d2_item1_sub')} />
        <View style={ss.vsCircle}><Text style={ss.vsText}>{t('d2_vs')}</Text></View>
        <MoneyBar price={t('d2_item2_price')} label={t('d2_item2')} sub={t('d2_item2_sub')} highlight delay={400} />
      </View>
      <View style={ss.saveBanner}>
        <Text style={ss.saveText}>{t('d2_save')}</Text>
      </View>
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('d2_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function D3_ShockStat({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const [num, setNum] = useState(0);
  const val = useSharedValue(0);
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withDelay(300, withTiming(1, { duration: 600 }));
    val.value = withDelay(400, withTiming(67, { duration: 2000, easing: Easing.out(Easing.quad) }));
    const id = setInterval(() => { setNum(Math.round(val.value)); }, 16);
    return () => clearInterval(id);
  }, []);
  const opStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d3_title')} />
      <Animated.View style={[{ alignItems: 'center' }, opStyle]}>
        <Text style={ss.shockNum}>{num}%</Text>
        <Text style={ss.shockLabel}>{t('d3_stat_label')}</Text>
        <GoldDivider />
        <Text style={ss.qSub}>{t('d3_sub')}</Text>
      </Animated.View>
      <View style={{ height: 32 }} />
      <BouncyBtn label={t('d3_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function D4_Counter({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const [num, setNum] = useState(0);
  const val = useSharedValue(0);
  useEffect(() => {
    val.value = withTiming(14284, { duration: 2400, easing: Easing.out(Easing.quad) });
    const id = setInterval(() => { setNum(Math.round(val.value)); }, 16);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d4_title')} sub={t('d4_sub')} />
      <View style={ss.counterCard}>
        <Text style={ss.counterNum}>{num.toLocaleString()}</Text>
        <Text style={ss.counterLabel}>{t('d4_counter_label')}</Text>
      </View>
      <View style={{ height: 32 }} />
      <BouncyBtn label={t('d4_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function D5_Risk({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const risks = [
    { label: t('d5_r1'), val: t('d5_r1_val'), color: OB.errorRed, pct: 0.80 },
    { label: t('d5_r2'), val: t('d5_r2_val'), color: OB.amber,    pct: 0.55 },
    { label: t('d5_r3'), val: t('d5_r3_val'), color: OB.amber,    pct: 0.50 },
  ];
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('d5_title')} sub={t('d5_sub')} />
      {risks.map((r, i) => (
        <RiskBarItem key={i} label={r.label} val={r.val} color={r.color} pct={r.pct} delay={i * 200 + 300} />
      ))}
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('d5_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

// ─── Screens 24–26: Trust & Social Proof ─────────────────────────────────────

function TR0_Testimonials({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const reviews = [
    { name: t('tr0_r1n'), text: t('tr0_r1t'), stars: t('tr0_r1s') },
    { name: t('tr0_r2n'), text: t('tr0_r2t'), stars: t('tr0_r2s') },
    { name: t('tr0_r3n'), text: t('tr0_r3t'), stars: t('tr0_r3s') },
  ];
  const [idx, setIdx] = useState(0);
  const op = useSharedValue(1);
  const goTo = (next: number) => {
    op.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setIdx)(next);
      op.value = withTiming(1, { duration: 300 });
    });
  };
  useEffect(() => {
    const id = setInterval(() => goTo((idx + 1) % reviews.length), 4000);
    return () => clearInterval(id);
  }, [idx]);
  const cardOp = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('tr0_title')} />
      <Animated.View style={[ss.testimonialCard, cardOp]}>
        <Text style={ss.testimonialStars}>{reviews[idx].stars}</Text>
        <Text style={ss.testimonialText}>{reviews[idx].text}</Text>
        <Text style={ss.testimonialName}>— {reviews[idx].name}</Text>
      </Animated.View>
      <View style={ss.dotRow}>
        {reviews.map((_, i) => (
          <Pressable key={i} onPress={() => goTo(i)}>
            <View style={[ss.dot, i === idx && ss.dotActive]} />
          </Pressable>
        ))}
      </View>
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('tr0_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function TR1_Awards({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const badges = [t('tr1_b1'), t('tr1_b2'), t('tr1_b3')];
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('tr1_title')} sub={t('tr1_sub')} />
      {badges.map((b, i) => (
        <AwardItem key={i} text={b} delay={i * 250} />
      ))}
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('tr1_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

function TR2_Community({ t, onNext, step }: { t: TFn; onNext: () => void; step: number }) {
  const stats = [
    { num: t('tr2_s1'), label: t('tr2_s1l') },
    { num: t('tr2_s2'), label: t('tr2_s2l') },
    { num: t('tr2_s3'), label: t('tr2_s3l') },
  ];
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('tr2_title')} sub={t('tr2_sub')} />
      <View style={ss.communityGrid}>
        {stats.map((s, i) => (
          <View key={i} style={ss.communityStat}>
            <Text style={ss.communityNum}>{s.num}</Text>
            <Text style={ss.communityLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
      <BouncyBtn label={t('tr2_cta')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

// ─── Screen 27: Personalized Reveal ──────────────────────────────────────────

const SOL_MAP: Record<string, { title: keyof OStr; desc: keyof OStr; Icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  yellowing: { title: 'rv_sol_yellowing', desc: 'rv_sol_yellowing_desc', Icon: Leaf },
  pests:     { title: 'rv_sol_pests',     desc: 'rv_sol_pests_desc',     Icon: Bug },
  growth:    { title: 'rv_sol_growth',    desc: 'rv_sol_growth_desc',    Icon: Ruler },
  watering:  { title: 'rv_sol_watering',  desc: 'rv_sol_watering_desc',  Icon: Droplet },
  default:   { title: 'rv_sol_default',   desc: 'rv_sol_default_desc',   Icon: Leaf },
};

function RV_Reveal({ t, data, onNext, step }: { t: TFn; data: OData; onNext: () => void; step: number }) {
  const selected = [...data.struggles.slice(0, 3)];
  while (selected.length < 3) selected.push('default');
  return (
    <View style={ss.qCenter}>
      <QHeader title={t('rv_title', { name: data.name || '…' })} sub={t('rv_sub')} />
      {selected.map((key, i) => {
        const sol = SOL_MAP[key] ?? SOL_MAP.default;
        return (
          <RevealItem
            key={i}
            Icon={sol.Icon}
            title={t(sol.title)}
            desc={t(sol.desc)}
            delay={i * 300 + 200}
          />
        );
      })}
      <View style={{ height: 28 }} />
      <BouncyBtn label={PAYMENTS_ENABLED ? t('rv_cta') : t('continue')} onPress={onNext} style={{ width: SW - 64 }} />
    </View>
  );
}

// ─── Screen 28: Paywall ───────────────────────────────────────────────────────

function TrialTimeline({ t }: { t: TFn }) {
  const op0 = useSharedValue(0);
  const op1 = useSharedValue(0);
  const op2 = useSharedValue(0);
  const line0 = useSharedValue(0);
  const line1 = useSharedValue(0);
  useEffect(() => {
    op0.value   = withDelay(200,  withTiming(1, { duration: 500 }));
    line0.value = withDelay(550,  withTiming(1, { duration: 300 }));
    op1.value   = withDelay(900,  withTiming(1, { duration: 500 }));
    line1.value = withDelay(1250, withTiming(1, { duration: 300 }));
    op2.value   = withDelay(1600, withTiming(1, { duration: 500 }));
  }, []);
  const nodes = [
    { day: t('pw_nd0_day'), label: t('pw_nd0_label'), op: op0 },
    { day: t('pw_nd1_day'), label: t('pw_nd1_label'), op: op1 },
    { day: t('pw_nd2_day'), label: t('pw_nd2_label'), op: op2 },
  ];
  return (
    <View style={ss.timeline}>
      <TLNodeItem day={nodes[0].day} label={nodes[0].label} op={nodes[0].op} />
      <TLLineItem line={line0} />
      <TLNodeItem day={nodes[1].day} label={nodes[1].label} op={nodes[1].op} />
      <TLLineItem line={line1} />
      <TLNodeItem day={nodes[2].day} label={nodes[2].label} op={nodes[2].op} />
    </View>
  );
}

function PW_Paywall({ t, data, setData, onFinish, onSkip }: {
  t: TFn; data: OData; setData: (d: OData) => void; onFinish: () => void; onSkip: () => void;
}) {
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [reviewIdx, setReviewIdx] = useState(0);
  const reviews = [
    { name: t('pw_r1n'), text: t('pw_r1t') },
    { name: t('pw_r2n'), text: t('pw_r2t') },
    { name: t('pw_r3n'), text: t('pw_r3t') },
  ];
  useEffect(() => {
    const id = setInterval(() => setReviewIdx((i) => (i + 1) % reviews.length), 3500);
    return () => clearInterval(id);
  }, []);
  const handleBuy = async () => {
    await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    setData({ ...data, isPremium: true });
    onFinish();
  };
  return (
    <ScrollView contentContainerStyle={ss.pwScroll} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onSkip} style={ss.pwSkip}>
        <Text style={ss.pwSkipText}>{t('pw_skip')}</Text>
      </TouchableOpacity>

      <View style={ss.pwHeroPanel}>
        <Image
          source={require('../../assets/images/flower-lily-white.png')}
          style={ss.pwHeroImg}
          resizeMode="contain"
        />
      </View>
      <Text style={ss.pwTitle}>{t('pw_title')}</Text>
      <Text style={ss.pwSub}>{t('pw_sub')}</Text>

      <View style={ss.pwReview}>
        <Text style={ss.pwReviewStars}>⭐⭐⭐⭐⭐</Text>
        <Text style={ss.pwReviewText}>"{reviews[reviewIdx].text}"</Text>
        <Text style={ss.pwReviewName}>— {reviews[reviewIdx].name}</Text>
      </View>

      <View style={ss.planSwitch}>
        {(['yearly', 'monthly'] as const).map((p) => (
          <TouchableOpacity key={p} onPress={() => setPlan(p)} style={[ss.planTab, plan === p && ss.planTabActive]}>
            {p === 'yearly' && plan === 'yearly' && (
              <View style={ss.bestBadge}><Text style={ss.bestBadgeText}>{t('pw_best_value')}</Text></View>
            )}
            <Text style={[ss.planTabText, plan === p && ss.planTabTextActive]}>
              {p === 'yearly' ? t('pw_yearly') : t('pw_monthly')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={ss.priceRow}>
        <Text style={ss.priceMain}>
          {plan === 'yearly' ? t('pw_yearly_price') : t('pw_monthly_price')}
          <Text style={ss.pricePer}>{t('pw_per_month')}</Text>
        </Text>
        {plan === 'yearly' && <Text style={ss.priceSave}>{t('pw_yearly_billing')}</Text>}
        <Text style={ss.priceTrial}>{t('pw_trial')}</Text>
      </View>

      <TrialTimeline t={t} />

      <PulseBtn label={t('pw_cta')} onPress={handleBuy} />

      <View style={ss.legalRow}>
        <TouchableOpacity onPress={() => {}}><Text style={ss.legalLink}>{t('pw_restore')}</Text></TouchableOpacity>
        <Text style={ss.legalDot}> · </Text>
        <TouchableOpacity onPress={() => {}}><Text style={ss.legalLink}>{t('pw_privacy')}</Text></TouchableOpacity>
        <Text style={ss.legalDot}> · </Text>
        <TouchableOpacity onPress={() => {}}><Text style={ss.legalLink}>{t('pw_terms')}</Text></TouchableOpacity>
      </View>
      <Text style={ss.legalNote}>{plan === 'yearly' ? t('pw_legal_y') : t('pw_legal_m')}</Text>
    </ScrollView>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { locale } = useLocale();
  const t = getOnboardingT(locale);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OData>(DEFAULT);
  const opacity = useSharedValue(1);

  const changeStep = useCallback((next: number) => {
    opacity.value = withTiming(0, { duration: 180 }, () => {
      runOnJS(setStep)(next);
      opacity.value = withTiming(1, { duration: 280 });
    });
  }, []);

  const finish = useCallback(async () => {
    if (!PAYMENTS_ENABLED) {
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  }, []);

  const goNext = useCallback(() => {
    let next = step + 1;
    if (!PAYMENTS_ENABLED) {
      if (next === 20) next = 21; // skip price-comparison screen
      if (next === 28) { finish(); return; } // skip paywall → finish directly
    }
    if (next < TOTAL) changeStep(next);
  }, [step, changeStep, finish]);

  const goBack = useCallback(() => {
    if (step > 0 && !NO_BACK.has(step)) changeStep(step - 1);
  }, [step, changeStep]);

  const toggleStruggle = useCallback((v: string) => {
    setData((d) => ({
      ...d,
      struggles: d.struggles.includes(v) ? d.struggles.filter((x) => x !== v) : [...d.struggles, v],
    }));
  }, []);

  const togglePlantType = useCallback((v: string) => {
    setData((d) => ({
      ...d,
      plantTypes: d.plantTypes.includes(v) ? d.plantTypes.filter((x) => x !== v) : [...d.plantTypes, v],
    }));
  }, []);

  // Auto-advance analysis screens — runs in the parent so it reliably re-fires
  // on every step change rather than relying on child component mount/unmount.
  useEffect(() => {
    if (step < 10 || step > 16) return;
    const durations: Record<number, number> = {
      10: 2000, 11: 2200, 12: 2200, 13: 2200, 14: 2200, 15: 2200, 16: 2200,
    };
    const timer = setTimeout(() => changeStep(step + 1), durations[step]);
    return () => clearTimeout(timer);
  }, [step]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const showBack = step > 0 && !NO_BACK.has(step);

  const renderStep = () => {
    switch (step) {
      case 0:  return <Q0_Welcome t={t} onNext={goNext} />;
      case 1:  return <Q1_Name t={t} data={data} setData={setData} onNext={goNext} step={step} />;
      case 2:  return (
        <SingleQ t={t} step={step} title={t('q2_title')} sub={t('q2_sub')}
          options={[
            { val: 'beginner',     label: t('q2_o1') },
            { val: 'intermediate', label: t('q2_o2') },
            { val: 'expert',       label: t('q2_o3') },
          ]}
          value={data.experience}
          onSelect={(v) => { setData({ ...data, experience: v }); setTimeout(goNext, 300); }}
        />
      );
      case 3:  return (
        <SingleQ t={t} step={step} title={t('q3_title')} sub={t('q3_sub')}
          options={[
            { val: 'none', label: t('q3_o1') },
            { val: 'few',  label: t('q3_o2') },
            { val: 'many', label: t('q3_o3') },
            { val: 'lots', label: t('q3_o4') },
          ]}
          value={data.plantCount}
          onSelect={(v) => { setData({ ...data, plantCount: v }); setTimeout(goNext, 300); }}
        />
      );
      case 4:  return (
        <SingleQ t={t} step={step} title={t('q4_title')} sub={t('q4_sub')}
          options={[
            { val: 'yes', label: t('q4_yes') },
            { val: 'no',  label: t('q4_no') },
          ]}
          value={data.hasPets}
          onSelect={(v) => { setData({ ...data, hasPets: v }); setTimeout(goNext, 300); }}
        />
      );
      case 5:  return (
        <MultiQ t={t} step={step} title={t('q5_title')} sub={t('q5_sub')}
          options={[
            { val: 'yellowing', label: t('q5_o1') },
            { val: 'pests',     label: t('q5_o2') },
            { val: 'growth',    label: t('q5_o3') },
            { val: 'watering',  label: t('q5_o4') },
          ]}
          values={data.struggles}
          onToggle={toggleStruggle}
          onNext={goNext}
        />
      );
      case 6:  return (
        <MultiQ t={t} step={step} title={t('q6_title')} sub={t('q6_sub')}
          options={[
            { val: 'indoor',  label: t('q6_o1') },
            { val: 'outdoor', label: t('q6_o2') },
            { val: 'succs',   label: t('q6_o3') },
            { val: 'edibles', label: t('q6_o4') },
          ]}
          values={data.plantTypes}
          onToggle={togglePlantType}
          onNext={goNext}
        />
      );
      case 7:  return (
        <SingleQ t={t} step={step} title={t('q7_title')} sub={t('q7_sub')}
          options={[
            { val: 'daily',    label: t('q7_o1') },
            { val: 'weekly',   label: t('q7_o2') },
            { val: 'biweekly', label: t('q7_o3') },
            { val: 'forget',   label: t('q7_o4') },
          ]}
          value={data.waterFreq}
          onSelect={(v) => { setData({ ...data, waterFreq: v }); setTimeout(goNext, 300); }}
        />
      );
      case 8:  return (
        <SingleQ t={t} step={step} title={t('q8_title')} sub={t('q8_sub')}
          options={[
            { val: 'bright',  label: t('q8_o1') },
            { val: 'medium',  label: t('q8_o2') },
            { val: 'low',     label: t('q8_o3') },
            { val: 'varied',  label: t('q8_o4') },
          ]}
          value={data.light}
          onSelect={(v) => { setData({ ...data, light: v }); setTimeout(goNext, 300); }}
        />
      );
      case 9:  return (
        <SingleQ t={t} step={step} title={t('q9_title')} sub={t('q9_sub')}
          options={[
            { val: 'save',       label: t('q9_o1') },
            { val: 'build',      label: t('q9_o2') },
            { val: 'learn',      label: t('q9_o3') },
            { val: 'aesthetics', label: t('q9_o4') },
          ]}
          value={data.goal}
          onSelect={(v) => { setData({ ...data, goal: v }); setTimeout(goNext, 300); }}
        />
      );

      // Analysis — auto-advance (timer lives in parent useEffect above)
      case 10: return <AnalysisAutoStep key={10} title={t('a0_title')} sub={t('a0_sub')} duration={2000} />;
      case 11: return <AnalysisAutoStep key={11} title={t('a1_title')} sub={t('a1_sub')} duration={2200} />;
      case 12: return <AnalysisAutoStep key={12} title={t('a2_title')} sub={t('a2_sub')} duration={2200} />;
      case 13: return <AnalysisAutoStep key={13} title={t('a3_title')} sub={t('a3_sub')} duration={2200} />;
      case 14: return <AnalysisAutoStep key={14} title={t('a4_title')} sub={t('a4_sub')} duration={2200} />;
      case 15: return <AnalysisAutoStep key={15} title={t('a5_title')} sub={t('a5_sub')} duration={2200} />;
      case 16: return <AnalysisAutoStep key={16} title={t('a6_title')} sub={t('a6_sub')} duration={2200} />;
      case 17: return <A7_Complete t={t} data={data} onNext={goNext} />;

      // Data / Statistics
      case 18: return <D0_BarChart t={t} onNext={goNext} step={step} />;
      case 19: return <D1_AreaChart t={t} onNext={goNext} step={step} />;
      case 20: return <D2_Money t={t} onNext={goNext} step={step} />;
      case 21: return <D3_ShockStat t={t} onNext={goNext} step={step} />;
      case 22: return <D4_Counter t={t} onNext={goNext} step={step} />;
      case 23: return <D5_Risk t={t} onNext={goNext} step={step} />;

      // Trust & Social Proof
      case 24: return <TR0_Testimonials t={t} onNext={goNext} step={step} />;
      case 25: return <TR1_Awards t={t} onNext={goNext} step={step} />;
      case 26: return <TR2_Community t={t} onNext={goNext} step={step} />;

      // Reveal
      case 27: return <RV_Reveal t={t} data={data} onNext={goNext} step={step} />;

      // Paywall
      case 28: return <PW_Paywall t={t} data={data} setData={setData} onFinish={finish} onSkip={finish} />;

      default: return null;
    }
  };

  return (
    <SafeAreaView style={ss.safe}>
      <View style={ss.header}>
        <View style={ss.headerSlot}>
          {showBack ? (
            <TouchableOpacity onPress={goBack} style={ss.backBtn}>
              <Text style={ss.backArrow}>‹</Text>
            </TouchableOpacity>
          ) : <View style={ss.backBtn} />}
        </View>
        <View style={ss.headerSlot} />
      </View>

      <Animated.View style={[ss.content, containerStyle]}>
        {step === 28 ? (
          renderStep()
        ) : (
          <ScrollView
            contentContainerStyle={ss.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStep()}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: OB.cream },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  headerSlot:       { width: 40 },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow:        { fontSize: 30, color: OB.forest, lineHeight: 34 },
  progressBar:      { flex: 1, height: 4, backgroundColor: OB.sageLight, borderRadius: 2, overflow: 'hidden' },
  progressFillMain: { height: '100%', backgroundColor: OB.forest, borderRadius: 2 },
  content:          { flex: 1 },
  scroll:           { flexGrow: 1, paddingBottom: 48 },

  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 },
  qCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },

  // Typography
  brandTitle:  { fontSize: 42, fontWeight: '700', color: OB.forest, letterSpacing: 2, marginBottom: 8, textAlign: 'center' },
  heroTagline: { fontSize: 24, fontWeight: '700', color: OB.textDark, textAlign: 'center', lineHeight: 34, marginBottom: 4 },
  heroProse:   { fontSize: 15, color: OB.textLight, textAlign: 'center', lineHeight: 23, paddingHorizontal: 8 },
  stepLabel:   { fontSize: 12, color: OB.textLight, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  qTitle:      { fontSize: 24, fontWeight: '700', color: OB.textDark, lineHeight: 32, marginBottom: 8 },
  qSub:        { fontSize: 14, color: OB.textLight, lineHeight: 21 },

  // Buttons
  btnGrad:        { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:        { fontSize: 16, color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.4 },
  btnOutline:     { paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5, borderColor: OB.forest },
  btnOutlineText: { fontSize: 16, color: OB.forest, fontWeight: '600' },

  // Select cards
  selectCard:    { width: SW - 48, flexDirection: 'row', alignItems: 'center', backgroundColor: OB.cardBg, borderRadius: 12, borderWidth: 1.5, borderColor: OB.border, paddingVertical: 15, paddingHorizontal: 16, marginBottom: 10, gap: 12 },
  selectCardOn:  { borderColor: OB.forest, backgroundColor: '#F0F7F2' },
  selectLabel:   { fontSize: 15, color: OB.textMid, flex: 1 },
  selectLabelOn: { color: OB.forest, fontWeight: '600' },
  checkbox:      { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: OB.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:    { backgroundColor: OB.forest, borderColor: OB.forest },
  checkmark:     { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Text input
  textInput: {
    width: SW - 48, backgroundColor: OB.cardBg, borderRadius: 12, borderWidth: 1.5, borderColor: OB.border,
    paddingVertical: 16, paddingHorizontal: 18, fontSize: 17, color: OB.textDark,
  },

  // Analysis
  analysisWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  analysisTitle: { fontSize: 22, fontWeight: '700', color: OB.textDark, textAlign: 'center', lineHeight: 30, marginBottom: 8 },
  analysisSub:   { fontSize: 14, color: OB.textLight, textAlign: 'center', lineHeight: 21 },
  progressTrack: { width: SW - 80, height: 4, backgroundColor: OB.sageLight, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: OB.forest, borderRadius: 2 },
  nameChip:      { marginTop: 16, backgroundColor: OB.sageLight, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  nameChipText:  { fontSize: 15, fontWeight: '600', color: OB.forest },

  // Charts
  barLabel:       { fontSize: 12, color: OB.textLight, textAlign: 'center', lineHeight: 16 },
  barVal:         { fontSize: 16, fontWeight: '700' },
  chartBadge:     { position: 'absolute', backgroundColor: OB.forest, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  chartBadgeText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  legendRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendLabel:    { fontSize: 12, color: OB.textLight },

  // Money comparison
  moneyCard:   { flex: 1, backgroundColor: OB.cardBg, borderRadius: 14, borderWidth: 1.5, borderColor: OB.border, padding: 16, alignItems: 'center' },
  moneyCardHL: { borderColor: OB.forest, backgroundColor: '#F0F7F2' },
  moneyPrice:  { fontSize: 28, fontWeight: '700', color: OB.amber, marginBottom: 4 },
  moneyLabel:  { fontSize: 13, fontWeight: '600', color: OB.textMid, textAlign: 'center', marginBottom: 4 },
  moneySub:    { fontSize: 11, color: OB.textLight, textAlign: 'center' },
  vsCircle:    { width: 32, height: 32, borderRadius: 16, backgroundColor: OB.parchment, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  vsText:      { fontSize: 11, fontWeight: '700', color: OB.textMid },
  saveBanner:  { width: SW - 48, backgroundColor: OB.forest, borderRadius: 10, padding: 12, marginTop: 16, alignItems: 'center' },
  saveText:    { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // Shock stat
  shockNum:   { fontSize: 96, fontWeight: '700', color: OB.forest, lineHeight: 104 },
  shockLabel: { fontSize: 17, fontWeight: '600', color: OB.textDark, textAlign: 'center', lineHeight: 25, marginTop: 4, paddingHorizontal: 20 },

  // Counter
  counterCard:  { width: SW - 48, backgroundColor: OB.forest, borderRadius: 16, padding: 28, alignItems: 'center' },
  counterNum:   { fontSize: 56, fontWeight: '700', color: '#FFF', lineHeight: 64 },
  counterLabel: { fontSize: 14, color: OB.sageMid, textAlign: 'center', marginTop: 6 },

  // Risk
  riskCard:  { width: SW - 48, backgroundColor: OB.cardBg, borderRadius: 12, borderWidth: 1, borderColor: OB.border, padding: 14, marginBottom: 10 },
  riskLabel: { fontSize: 14, fontWeight: '600', color: OB.textMid },
  riskVal:   { fontSize: 13, fontWeight: '700' },
  riskTrack: { height: 6, backgroundColor: OB.sageLight, borderRadius: 3, overflow: 'hidden' },
  riskBar:   { height: '100%', borderRadius: 3 },

  // Testimonials
  testimonialCard:  { width: SW - 48, backgroundColor: OB.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: OB.border, marginBottom: 16 },
  testimonialStars: { fontSize: 14, marginBottom: 10 },
  testimonialText:  { fontSize: 15, color: OB.textDark, lineHeight: 23, fontStyle: 'italic', marginBottom: 12 },
  testimonialName:  { fontSize: 13, fontWeight: '600', color: OB.textLight },
  dotRow:           { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot:              { width: 7, height: 7, borderRadius: 4, backgroundColor: OB.border },
  dotActive:        { backgroundColor: OB.forest, width: 18 },

  // Awards
  awardCard:  { width: SW - 48, flexDirection: 'row', alignItems: 'center', backgroundColor: OB.parchment, borderRadius: 12, padding: 16, marginBottom: 10, gap: 12 },
  awardText:  { fontSize: 14, fontWeight: '600', color: OB.textDark, flex: 1 },

  // Community
  communityGrid:  { width: SW - 48, flexDirection: 'row', gap: 10, marginTop: 4 },
  communityStat:  { flex: 1, backgroundColor: OB.cardBg, borderRadius: 14, borderWidth: 1, borderColor: OB.border, padding: 16, alignItems: 'center' },
  communityNum:   { fontSize: 22, fontWeight: '700', color: OB.forest, marginBottom: 4 },
  communityLabel: { fontSize: 11, color: OB.textLight, textAlign: 'center' },

  // Reveal
  revealCard:  { width: SW - 48, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: OB.cardBg, borderRadius: 14, borderWidth: 1.5, borderColor: OB.border, padding: 16, marginBottom: 10, gap: 12 },
  revealTitle: { fontSize: 15, fontWeight: '700', color: OB.forest, marginBottom: 4 },
  revealDesc:  { fontSize: 13, color: OB.textLight, lineHeight: 19 },

  // Trial Timeline
  timeline: { flexDirection: 'row', alignItems: 'flex-start', width: SW - 48, marginVertical: 24 },
  tlNode:   { alignItems: 'center', flex: 1 },
  tlDot:    { width: 14, height: 14, borderRadius: 7, backgroundColor: OB.forest, marginBottom: 6 },
  tlDay:    { fontSize: 11, fontWeight: '700', color: OB.forest, textAlign: 'center' },
  tlLabel:  { fontSize: 10, color: OB.textLight, textAlign: 'center', marginTop: 2, lineHeight: 14 },
  tlLine:   { height: 2, backgroundColor: OB.sage, alignSelf: 'flex-start', marginTop: 6, width: 36 },

  // Paywall
  pwScroll:        { paddingHorizontal: 24, paddingBottom: 60, alignItems: 'center' },
  pwSkip:          { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 4 },
  pwSkipText:      { fontSize: 13, color: OB.textLight, textDecorationLine: 'underline' },
  pwTitle:         { fontSize: 28, fontWeight: '700', color: OB.textDark, textAlign: 'center', lineHeight: 36, marginBottom: 6 },
  pwSub:           { fontSize: 14, color: OB.textLight, textAlign: 'center', marginBottom: 20 },
  pwReview:        { width: SW - 48, backgroundColor: OB.parchment, borderRadius: 14, padding: 16, marginBottom: 20 },
  pwReviewStars:   { fontSize: 13, marginBottom: 8 },
  pwReviewText:    { fontSize: 14, color: OB.textDark, fontStyle: 'italic', lineHeight: 21, marginBottom: 8 },
  pwReviewName:    { fontSize: 12, fontWeight: '600', color: OB.textLight },
  planSwitch:      { flexDirection: 'row', backgroundColor: OB.sageLight, borderRadius: 12, padding: 4, width: SW - 48, marginBottom: 16 },
  planTab:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9, position: 'relative' },
  planTabActive:   { backgroundColor: OB.cardBg },
  planTabText:     { fontSize: 14, fontWeight: '600', color: OB.textLight },
  planTabTextActive: { color: OB.forest },
  bestBadge:       { position: 'absolute', top: -10, backgroundColor: OB.gold, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  bestBadgeText:   { fontSize: 9, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
  priceRow:        { alignItems: 'center', marginBottom: 4 },
  priceMain:       { fontSize: 40, fontWeight: '700', color: OB.textDark },
  pricePer:        { fontSize: 16, color: OB.textLight, fontWeight: '400' },
  priceSave:       { fontSize: 13, fontWeight: '600', color: OB.forest, marginTop: 2 },
  priceTrial:      { fontSize: 12, color: OB.textLight, marginTop: 4 },
  legalRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' },
  legalLink:       { fontSize: 11, color: OB.textLight, textDecorationLine: 'underline' },
  legalDot:        { fontSize: 11, color: OB.textLight },
  legalNote:       { fontSize: 10, color: OB.textLight, textAlign: 'center', marginTop: 10, lineHeight: 15, paddingHorizontal: 8 },
  welcomePhotoPanel: {
    backgroundColor: '#F3F6F1',
    borderRadius: 28,
    width: 240,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  welcomePhotoImg: {
    width: 240,
    height: 280,
  },
  pwHeroPanel: {
    backgroundColor: '#F3F6F1',
    borderRadius: 20,
    width: SW - 48,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  pwHeroImg: {
    width: SW - 48,
    height: 200,
  },
});
