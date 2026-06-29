import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';
import { LANGUAGES } from '@/constants/languages';
import { useLocale } from '@/hooks/useLocale';

const REMINDER_ENABLED_KEY = 'plantlens_care_reminder_enabled';
const REMINDER_TIME_KEY = 'plantlens_care_reminder_time';
const STORE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/id000000000'
    : 'https://play.google.com/store/apps/details?id=com.plantlens';

// ── Row icons (react-native-svg, consistent 2px stroke) ──

function IconGlobe() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M2 12h20" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconBell() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconLock() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconStar() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconHelp() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 17h.01" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconMail() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconInfo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 16v-4" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 8h.01" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconShareIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 6L12 2L8 6" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 2v13" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconCrown() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M2 20h20M4 20V10l4 4 4-8 4 8 4-4v10" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconUser() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconShield() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2D6A4F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18L15 12L9 6" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Animated section wrapper ──
function Section({
  title,
  children,
  anim,
}: {
  title: string;
  children: React.ReactNode;
  anim: { op: Animated.Value; y: Animated.Value };
}) {
  return (
    <Animated.View
      style={{ opacity: anim.op, transform: [{ translateY: anim.y }], marginBottom: 24 }}
    >
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </Animated.View>
  );
}

// ── Individual row with scale press feedback ──
function Row({
  icon,
  label,
  subtitle,
  onPress,
  trailing,
  a11y,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  trailing?: React.ReactNode;
  a11y: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, speed: 50, bounciness: 0, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 50, bounciness: 4, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.row}
        activeOpacity={1}
        accessibilityLabel={a11y}
        accessibilityRole="button"
      >
        <View style={styles.rowIconWrap}>{icon}</View>
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
        {trailing !== undefined ? trailing : <ChevronRight />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

// ── Screen ──
export default function SettingsScreen() {
  const { t, locale } = useLocale();
  const currentLang = LANGUAGES.find((l) => l.code === locale);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');

  // Six section animations
  const a0op = useRef(new Animated.Value(0)).current; const a0y = useRef(new Animated.Value(22)).current;
  const a1op = useRef(new Animated.Value(0)).current; const a1y = useRef(new Animated.Value(22)).current;
  const a2op = useRef(new Animated.Value(0)).current; const a2y = useRef(new Animated.Value(22)).current;
  const a3op = useRef(new Animated.Value(0)).current; const a3y = useRef(new Animated.Value(22)).current;
  const a4op = useRef(new Animated.Value(0)).current; const a4y = useRef(new Animated.Value(22)).current;
  const a5op = useRef(new Animated.Value(0)).current; const a5y = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    AsyncStorage.multiGet([REMINDER_ENABLED_KEY, REMINDER_TIME_KEY]).then(
      ([[, enabled], [, time]]) => {
        if (enabled != null) setReminderEnabled(enabled === 'true');
        if (time != null) setReminderTime(time);
      },
    );

    const sections = [
      { op: a0op, y: a0y }, { op: a1op, y: a1y }, { op: a2op, y: a2y },
      { op: a3op, y: a3y }, { op: a4op, y: a4y }, { op: a5op, y: a5y },
    ];
    Animated.stagger(
      70,
      sections.map(({ op, y }) =>
        Animated.parallel([
          Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(y, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]),
      ),
    ).start();
  }, []);

  const toggleReminder = async (val: boolean) => {
    setReminderEnabled(val);
    await AsyncStorage.setItem(REMINDER_ENABLED_KEY, val ? 'true' : 'false');
  };

  const pickReminderTime = () => {
    if (!reminderEnabled) return;
    Alert.alert(
      t('settings.careReminder'),
      t('settings.careReminderPick'),
      [
        ...['06:00', '07:00', '08:00', '09:00', '10:00', '18:00', '19:00', '20:00', '21:00'].map(
          (h) => ({
            text: h,
            onPress: async () => {
              setReminderTime(h);
              await AsyncStorage.setItem(REMINDER_TIME_KEY, h);
            },
          }),
        ),
        { text: t('common.cancel'), style: 'cancel' as const },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBack}
          activeOpacity={0.7}
          accessibilityLabel={t('common.back')}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Small leaf accent */}
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
            <Path d="M12 3C8 5 4 9 4 13c0 4 3 7 7 8-1-3-1-6 0-9 2 4 5 7 8 7 2-2 3-5 3-8S19 5 12 3Z" fill="#4ADE80" opacity={0.85} />
          </Svg>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 1 — Общие настройки */}
        <Section title={t('settings.general')} anim={{ op: a0op, y: a0y }}>
          <Row
            icon={<IconGlobe />}
            label={t('profile.language')}
            onPress={() => router.push('/language-picker')}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.langValue}>
                  {currentLang ? `${currentLang.flag} ${currentLang.nativeName}` : locale.toUpperCase()}
                </Text>
                <ChevronRight />
              </View>
            }
            a11y={t('profile.language')}
          />
          <RowDivider />
          <Row
            icon={<IconBell />}
            label={t('settings.careReminder')}
            subtitle={reminderEnabled ? reminderTime : undefined}
            onPress={pickReminderTime}
            trailing={
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ false: '#D1D5DB', true: Colors.primaryGreen }}
                thumbColor={reminderEnabled ? '#2D6A4F' : '#F3F4F6'}
                ios_backgroundColor="#D1D5DB"
              />
            }
            a11y={t('settings.careReminder')}
          />
          <RowDivider />
          <Row
            icon={<IconLock />}
            label={t('settings.permissions')}
            subtitle={t('settings.permissionsDesc')}
            onPress={() => Linking.openSettings()}
            a11y={t('settings.permissions')}
          />
        </Section>

        {/* 2 — Помощь */}
        <Section title={t('settings.help')} anim={{ op: a1op, y: a1y }}>
          <Row
            icon={<IconStar />}
            label={t('settings.rateUs')}
            onPress={() => Linking.openURL(STORE_URL).catch(() => {})}
            a11y={t('settings.rateUs')}
          />
          <RowDivider />
          <Row
            icon={<IconHelp />}
            label={t('settings.helpCenter')}
            onPress={() => Alert.alert(t('settings.helpCenter'), t('settings.helpText'))}
            a11y={t('settings.helpCenter')}
          />
          <RowDivider />
          <Row
            icon={<IconMail />}
            label={t('settings.contact')}
            subtitle="support@plantlens.app"
            onPress={() => Linking.openURL('mailto:support@plantlens.app').catch(() => {})}
            a11y={t('settings.contact')}
          />
        </Section>

        {/* 3 — О приложении */}
        <Section title={t('settings.about')} anim={{ op: a2op, y: a2y }}>
          <Row
            icon={<IconInfo />}
            label={t('settings.appInfo')}
            subtitle="PlantLens · v1.0.0"
            onPress={() =>
              Alert.alert(t('settings.appVersionTitle'), `${t('settings.appInfoText')}\n\n${t('settings.poweredBy')}`)
            }
            a11y={t('settings.appInfo')}
          />
          <RowDivider />
          <Row
            icon={<IconStar />}
            label={t('settings.rateApp')}
            onPress={() => Linking.openURL(STORE_URL).catch(() => {})}
            a11y={t('settings.rateApp')}
          />
          <RowDivider />
          <Row
            icon={<IconShareIcon />}
            label={t('settings.recommend')}
            onPress={() => Share.share({ message: t('settings.shareText') }).catch(() => {})}
            a11y={t('settings.recommend')}
          />
        </Section>

        {/* 4 — Членство */}
        <Section title={t('settings.membership')} anim={{ op: a3op, y: a3y }}>
          <Row
            icon={<IconCrown />}
            label={t('settings.freePlan')}
            subtitle={t('settings.freePlanDesc')}
            onPress={() => Alert.alert(t('settings.membership'), t('settings.premiumSoon'))}
            a11y={t('settings.membership')}
          />
        </Section>

        {/* 5 — Счёт */}
        <Section title={t('settings.account')} anim={{ op: a4op, y: a4y }}>
          <Row
            icon={<IconUser />}
            label={t('settings.loginRegister')}
            onPress={() => Alert.alert(t('settings.account'), t('settings.accountSoon'))}
            a11y={t('settings.loginRegister')}
          />
        </Section>

        {/* 6 — Легальная информация */}
        <Section title={t('settings.legal')} anim={{ op: a5op, y: a5y }}>
          <Row
            icon={<IconShield />}
            label={t('settings.privacyPolicy')}
            onPress={() => Linking.openURL('https://plantlens.app/privacy').catch(() => {})}
            a11y={t('settings.privacyPolicy')}
          />
          <RowDivider />
          <Row
            icon={<IconShield />}
            label={t('settings.termsOfService')}
            onPress={() => Linking.openURL('https://plantlens.app/terms').catch(() => {})}
            a11y={t('settings.termsOfService')}
          />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.lightMintBg,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D6A4F',
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 56,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(45,106,79,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 64,
  },
  langValue: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
});
