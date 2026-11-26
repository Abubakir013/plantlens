import { Award, Flame, Flower, Microscope, Sprout, Target } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';
import { loadStreak } from '@/hooks/useStreak';

function BotanicalBorder({ width = 340 }: { width?: number }) {
  const cx = width / 2;
  return (
    <Svg width={width} height={36} viewBox={`0 0 ${width} 36`}>
      <Path
        d={`M0 18 L${cx - 36} 18`}
        stroke="#2D6A4F"
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.28}
      />
      <Path
        d={`M${cx + 36} 18 L${width} 18`}
        stroke="#2D6A4F"
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.28}
      />
      <Path
        d={`M${cx - 6} 18 C${cx - 16} 11 ${cx - 30} 12 ${cx - 33} 18 C${cx - 30} 24 ${cx - 16} 25 ${cx - 6} 18 Z`}
        fill="#2D6A4F"
        opacity={0.42}
      />
      <Path
        d={`M${cx + 6} 18 C${cx + 16} 11 ${cx + 30} 12 ${cx + 33} 18 C${cx + 30} 24 ${cx + 16} 25 ${cx + 6} 18 Z`}
        fill="#2D6A4F"
        opacity={0.42}
      />
      <Circle cx={cx} cy={18} r={2} fill="#2D6A4F" opacity={0.52} />
    </Svg>
  );
}

function StatCard({
  Icon,
  value,
  label,
  iconBg,
  iconColor,
  accentColor,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: accentColor }]}>
      <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { plants } = usePlantCollection();
  const { t } = useLocale();
  const router = useRouter();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStreak().then(setStreak);
  }, []);

  const rarest = plants.length > 0 ? plants[plants.length - 1].name : '–';
  const totalConfidence = plants.length > 0
    ? Math.round(plants.reduce((sum, p) => sum + p.confidence, 0) / plants.length)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('tabs.profile')}</Text>
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => router.push('/settings')}
          activeOpacity={0.75}
          accessibilityLabel={t('profile.settings')}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              stroke={Colors.darkGreen}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke={Colors.darkGreen}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero card */}
        <Animated.View entering={FadeInDown.delay(0).duration(560)}>
          <View style={styles.headerCardShadow}>
            <LinearGradient
              colors={['#EDF6F1', '#FFFFFF']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.headerCard}
            >
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Image
                    source={require('../../../assets/images/flower-lily-pink.png')}
                    style={styles.avatarPhoto}
                    resizeMode="cover"
                  />
                </View>
              </View>
              <Text style={styles.userName}>{t('profile.userName')}</Text>
              <Text style={styles.userBio}>{t('profile.userBio')}</Text>
              <View style={styles.dividerContainer}>
                <BotanicalBorder width={300} />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(560)}>
          <Text style={styles.sectionTitle}>{t('profile.yourStats')}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              Icon={Sprout}
              value={plants.length.toString()}
              label={t('profile.plantsFound')}
              iconBg="rgba(82, 183, 136, 0.15)"
              iconColor={Colors.primaryGreen}
              accentColor={Colors.primaryGreen}
            />
            <StatCard
              Icon={Flame}
              value={streak.toString()}
              label={t('profile.dayStreak')}
              iconBg="rgba(217, 119, 6, 0.13)"
              iconColor="#D97706"
              accentColor="#D97706"
            />
            <StatCard
              Icon={Target}
              value={plants.length > 0 ? `${totalConfidence}%` : '–'}
              label={t('profile.avgAccuracy')}
              iconBg="rgba(82, 183, 136, 0.15)"
              iconColor={Colors.primaryGreen}
              accentColor={Colors.primaryGreen}
            />
            <StatCard
              Icon={Flower}
              value={rarest.split(' ')[0]}
              label={t('profile.rarestFind')}
              iconBg="rgba(45, 106, 79, 0.12)"
              iconColor={Colors.forestMid}
              accentColor={Colors.forestMid}
            />
          </View>
        </Animated.View>

        {/* Badge row */}
        <Animated.View entering={FadeInDown.delay(200).duration(560)}>
          <View style={styles.badgeRow}>
            {[
              { Icon: Award,      label: t('profile.firstId'),    unlocked: plants.length >= 1 },
              { Icon: Flower,     label: t('profile.fivePlants'), unlocked: plants.length >= 5 },
              { Icon: Microscope, label: t('profile.botanist'),   unlocked: plants.length >= 10 },
            ].map((b) => (
              <View
                key={b.label}
                style={[styles.badge, !b.unlocked && styles.badgeLocked]}
              >
                <b.Icon
                  size={22}
                  color={b.unlocked ? Colors.primaryGreen : Colors.textMuted}
                />
                <Text style={[styles.badgeLabel, !b.unlocked && styles.badgeLabelLocked]}>
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(300).duration(560)}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>{t('common.appName')}</Text>
            <Text style={styles.aboutVersion}>{t('profile.version')}</Text>
            <Text style={styles.aboutText}>{t('profile.aboutText')}</Text>
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  gearBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Hero card — outer wrapper carries the shadow so gradient clipping doesn't cut it
  headerCardShadow: {
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  headerCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },

  // Avatar with soft green glow
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: Colors.primaryGreen,
    padding: 3,
    marginBottom: 4,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  userBio: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  dividerContainer: {
    marginTop: 8,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  // Stat card — white bg, subtle shadow, 2.5px tinted top border
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11.5,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 15,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    flex: 1,
    backgroundColor: 'rgba(82, 183, 136, 0.09)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    shadowColor: Colors.shadowGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeLocked: {
    opacity: 0.38,
    backgroundColor: Colors.mintMid,
    borderColor: Colors.cardBorder,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: Colors.textMuted,
  },

  aboutCard: {
    backgroundColor: Colors.mintMid,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primaryGreen + '44',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkGreen,
    fontFamily: 'Inter_700Bold',
  },
  aboutVersion: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  aboutText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
});
