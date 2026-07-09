import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Droplet, Skull, Sparkles, Sun, Thermometer } from 'lucide-react-native';

import { FloralDivider } from '@/components/FloralDivider';
import { GreenButton } from '@/components/GreenButton';
import { InfoChip } from '@/components/InfoChip';
import { PlantInfoSections } from '@/components/PlantInfoSections';
import { Colors } from '@/constants/colors';
import { usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';
import { seedCacheFromSavedPlant } from '@/hooks/usePlantGuide';

function LeafAccent() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M14 3 C10 5 6 9 6 13 C6 17 9 20 13 21 C13 19 11 15 12 12 C14 16 17 19 20 19 C22 17 23 14 23 11 C23 8 21 5 14 3 Z"
        fill="#2D6A4F"
        opacity={0.88}
      />
      <Path
        d="M13 21 C13.5 17 14.5 13 16 10"
        stroke="#1B4332"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}

function InfoCard({
  Icon,
  title,
  value,
  accent,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.infoCard, accent && styles.infoCardAccent]}>
      <View style={styles.infoCardHeader}>
        <Icon size={18} color={Colors.textMuted} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ConfidenceBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? Colors.darkGreen : value >= 50 ? '#B45309' : '#EF4444';
  const bg = value >= 80 ? Colors.mintMid : value >= 50 ? '#FEF3C7' : '#FEE2E2';
  return (
    <View style={[styles.confidenceBadge, { backgroundColor: bg }]}>
      <Svg width={10} height={10} viewBox="0 0 10 10">
        <Circle cx={5} cy={5} r={4} fill={color} />
      </Svg>
      <Text style={[styles.confidenceText, { color }]}>{value}{label}</Text>
    </View>
  );
}

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, loading, deletePlant } = usePlantCollection();
  const { t, locale } = useLocale();

  const plant = plants.find((p) => p.id === id);

  useEffect(() => {
    console.log('[PlantDetail] loaded id:', id, 'found:', !!plant, 'loading:', loading);
  }, [loading]);

  useEffect(() => {
    if (!plant) return;
    seedCacheFromSavedPlant(plant, locale);
  }, [plant?.id, locale]);

  if (loading) {
    return <View style={styles.safeArea} />;
  }

  if (!plant) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('result.noResult')}</Text>
          <GreenButton label={t('result.goBack')} onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      t('collection.removeTitle'),
      t('collection.removeMessage', { name: plant.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            await deletePlant(plant.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('result.shareMessage', {
          name: plant.name,
          scientific: plant.scientificName,
          funFact: plant.funFact ?? '',
        }),
        title: t('result.shareTitle', { name: plant.name }),
      });
    } catch {
      // share dismissed
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: plant.imageUri }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(243,246,241,0.97)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.imageHeaderBtn}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={styles.imageHeaderBtn}
              activeOpacity={0.8}
              accessibilityLabel={t('common.close')}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18" stroke="white" strokeWidth={2.5} strokeLinecap="round" />
                <Path d="M6 6L18 18" stroke="white" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content card */}
        <View style={styles.contentCard}>
          {/* Plant name */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <LeafAccent />
              <Text style={styles.plantName} numberOfLines={2}>
                {plant.name}
              </Text>
            </View>
            <Text style={styles.scientificName}>{plant.scientificName}</Text>
            <View style={styles.badgeRow}>
              <ConfidenceBadge value={plant.confidence} label={t('result.match')} />
              <InfoChip
                label={t('result.aiIdentified')}
                color="#6366F1"
                bgColor="rgba(99,102,241,0.12)"
              />
            </View>
          </View>

          <FloralDivider width={340} />

          {/* Care info grid */}
          <Text style={styles.sectionLabel}>{t('result.careGuide')}</Text>
          <View style={styles.infoGrid}>
            <InfoCard Icon={Droplet}     title={t('result.watering')}    value={plant.watering ?? ''} />
            <InfoCard Icon={Sun}         title={t('result.light')}       value={plant.light ?? ''} />
            <InfoCard Icon={Thermometer} title={t('result.temperature')} value={plant.temperature ?? ''} />
            <InfoCard
              Icon={Skull}
              title={t('result.toxicity')}
              value={plant.toxicity ?? ''}
              accent={(plant.toxicity ?? '').toLowerCase().includes('toxic')}
            />
          </View>

          <FloralDivider width={340} />

          {/* Fun fact */}
          <View style={styles.funFactCard}>
            <View style={styles.funFactHeader}>
              <Sparkles size={20} color={Colors.darkGreen} />
              <Text style={styles.funFactTitle}>{t('result.funFact')}</Text>
            </View>
            <Text style={styles.funFactText}>{plant.funFact ?? ''}</Text>
          </View>

          {/* Rich info sections */}
          {plant.guideTopics?.length ? (
            <>
              <FloralDivider width={340} />
              <PlantInfoSections
                data={{
                  scientificName: plant.scientificName,
                  guideTopics: plant.guideTopics,
                  plantId: plant.id,
                }}
              />
            </>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.removeBtn} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.removeBtnText}>{t('collection.removeTitle')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 12V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V12"
                  stroke={Colors.darkGreen}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M16 6L12 2L8 6"
                  stroke={Colors.darkGreen}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 2V15"
                  stroke={Colors.darkGreen}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.shareBtnText}>{t('common.share')}</Text>
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  imageWrapper: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  imageHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    backgroundColor: Colors.lightMintBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  nameSection: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plantName: {
    flex: 1,
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  scientificName: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.textMuted,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    marginLeft: 36,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginLeft: 36,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    marginBottom: -4,
  },
  infoGrid: {
    gap: 10,
  },
  infoCard: {
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
  infoCardAccent: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  funFactCard: {
    backgroundColor: Colors.mintMid,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primaryGreen + '44',
  },
  funFactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  funFactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkGreen,
    fontFamily: 'Inter_700Bold',
  },
  funFactText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.07)',
  },
  removeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: 'Inter_600SemiBold',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.forestMid,
    backgroundColor: 'rgba(45, 106, 79, 0.06)',
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGreen,
    fontFamily: 'Inter_600SemiBold',
  },
});
