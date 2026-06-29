import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/colors';
import { usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';
import { loadStreak } from '@/hooks/useStreak';

function BotanicalBorder({ width = 340 }: { width?: number }) {
  return (
    <Svg width={width} height={48} viewBox={`0 0 ${width} 48`}>
      {/* Horizontal base vine */}
      <Path
        d={`M0 30 C${width * 0.12} 22 ${width * 0.22} 38 ${width * 0.33} 30 C${width * 0.44} 22 ${width * 0.56} 38 ${width * 0.67} 30 C${width * 0.78} 22 ${width * 0.88} 38 ${width} 30`}
        stroke="#4ADE80"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* Top accent vine */}
      <Path
        d={`M20 15 C${width * 0.15} 8 ${width * 0.28} 22 ${width * 0.4} 15 C${width * 0.52} 8 ${width * 0.65} 22 ${width * 0.78} 15 C${width * 0.88} 10 ${width - 20} 15 ${width - 20} 15`}
        stroke="#A3E635"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        opacity={0.4}
      />
      {/* Small leaves along vine */}
      {[0.15, 0.38, 0.62, 0.85].map((frac, i) => {
        const x = width * frac;
        return (
          <G key={i}>
            <Path
              d={`M${x} 30 C${x - 8} 22 ${x - 14} 20 ${x - 12} 14 C${x - 5} 18 ${x - 2} 24 ${x} 30 Z`}
              fill="#22C55E"
              opacity={0.5}
            />
            <Path
              d={`M${x} 30 C${x + 8} 22 ${x + 14} 20 ${x + 12} 14 C${x + 5} 18 ${x + 2} 24 ${x} 30 Z`}
              fill="#4ADE80"
              opacity={0.4}
            />
          </G>
        );
      })}
      {/* Tiny flowers */}
      {[0.25, 0.5, 0.75].map((frac, i) => {
        const x = width * frac;
        const y = 30;
        return (
          <G key={`flower-${i}`}>
            {[0, 72, 144, 216, 288].map((deg, j) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <Circle
                  key={j}
                  cx={x + Math.cos(rad) * 4.5}
                  cy={y + Math.sin(rad) * 4.5}
                  r={2.8}
                  fill="#A3E635"
                  opacity={0.7}
                />
              );
            })}
            <Circle cx={x} cy={y} r={2.5} fill="#FDE68A" />
          </G>
        );
      })}
    </Svg>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
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
      {/* Top bar with gear/settings icon */}
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
        {/* Botanical header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🌿</Text>
            </View>
          </View>
          <Text style={styles.userName}>{t('profile.userName')}</Text>
          <Text style={styles.userBio}>{t('profile.userBio')}</Text>
          <View style={styles.dividerContainer}>
            <BotanicalBorder width={300} />
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>{t('profile.yourStats')}</Text>
        <View style={styles.statsGrid}>
          <StatCard emoji="🌱" value={plants.length.toString()} label={t('profile.plantsFound')} />
          <StatCard emoji="🔥" value={streak.toString()} label={t('profile.dayStreak')} />
          <StatCard
            emoji="🎯"
            value={plants.length > 0 ? `${totalConfidence}%` : '–'}
            label={t('profile.avgAccuracy')}
          />
          <StatCard emoji="🌸" value={rarest.split(' ')[0]} label={t('profile.rarestFind')} />
        </View>

        {/* Badge row */}
        <View style={styles.badgeRow}>
          {[
            { emoji: '🥇', label: t('profile.firstId') },
            { emoji: '🌻', label: t('profile.fivePlants') },
            { emoji: '🔬', label: t('profile.botanist') },
          ].map((b) => (
            <View
              key={b.label}
              style={[styles.badge, plants.length === 0 && styles.badgeLocked]}
            >
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>{t('common.appName')}</Text>
          <Text style={styles.aboutVersion}>{t('profile.version')}</Text>
          <Text style={styles.aboutText}>{t('profile.aboutText')}</Text>
        </View>

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
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
    padding: 3,
    marginBottom: 4,
  },
  avatar: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: Colors.lightMintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36 },
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
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  badgeLocked: {
    opacity: 0.4,
    borderColor: Colors.cardBorder,
  },
  badgeEmoji: { fontSize: 22 },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
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
