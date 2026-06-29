import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';

import { PlantCard } from '@/components/PlantCard';
import { Colors } from '@/constants/colors';
import { SavedPlant, usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';

function GrowingFlower() {
  const growAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(growAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 38,
      friction: 7,
      delay: 400,
    }).start();
  }, []);

  const translateY = growAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <Animated.View style={{ transform: [{ scale: growAnim }, { translateY }], alignItems: 'center' }}>
      <Svg width={130} height={160} viewBox="0 0 130 160">
        {/* Stem */}
        <Path
          d="M65 148 C64 130 62 110 65 88"
          stroke="#16A34A"
          strokeWidth={3.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Leaf left */}
        <Path
          d="M65 118 C50 108 38 96 42 84 C52 92 58 104 65 118 Z"
          fill="#22C55E"
          opacity={0.85}
        />
        {/* Leaf right */}
        <Path
          d="M65 118 C80 108 92 96 88 84 C78 92 72 104 65 118 Z"
          fill="#4ADE80"
          opacity={0.78}
        />
        {/* 6 petals */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const px = 65 + Math.cos(rad) * 20;
          const py = 68 + Math.sin(rad) * 20;
          return (
            <Ellipse
              key={i}
              cx={px}
              cy={py}
              rx={8}
              ry={14}
              fill="#4ADE80"
              transform={`rotate(${angle + 90}, ${px}, ${py})`}
              opacity={0.82}
            />
          );
        })}
        {/* Flower center */}
        <Circle cx={65} cy={68} r={14} fill="#FDE68A" />
        <Circle cx={65} cy={68} r={8} fill="#F59E0B" />
        {/* Dot details on center */}
        <Circle cx={62} cy={65} r={1.5} fill="#D97706" opacity={0.7} />
        <Circle cx={68} cy={65} r={1.5} fill="#D97706" opacity={0.7} />
        <Circle cx={65} cy={71} r={1.5} fill="#D97706" opacity={0.7} />
        {/* Ground */}
        <Path
          d="M25 152 Q65 146 105 152"
          stroke="#16A34A"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.38}
        />
        <Path
          d="M15 156 Q65 149 115 156"
          stroke="#16A34A"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.2}
        />
      </Svg>
    </Animated.View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyContainer}>
      <GrowingFlower />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function CollectionScreen() {
  const { plants, loading, deletePlant, reload } = usePlantCollection();
  const { t } = useLocale();
  const router = useRouter();

  // Refresh list every time this tab comes into focus so deletions made on
  // the plant-detail screen (which has its own hook instance) are reflected here.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handleLongPress = (plant: SavedPlant) => {
    Alert.alert(
      t('collection.removeTitle'),
      t('collection.removeMessage', { name: plant.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => deletePlant(plant.id),
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: SavedPlant; index: number }) => (
    <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
      <PlantCard
        name={item.name}
        scientificName={item.scientificName}
        imageUri={item.imageUri}
        confidence={item.confidence}
        dateIdentified={item.dateIdentified}
        onPress={() => {
          console.log('[Collection] tapped plant id:', item.id);
          router.push({ pathname: '/plant-detail', params: { id: item.id } });
        }}
        onLongPress={() => handleLongPress(item)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('collection.title')}</Text>
          <Text style={styles.headerSub}>
            {plants.length === 1
              ? t('collection.plantsCountSingle', { count: plants.length })
              : t('collection.plantsCount', { count: plants.length })}
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{plants.length}</Text>
        </View>
      </View>

      {loading ? null : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              title={t('collection.emptyTitle')}
              subtitle={t('collection.emptySubtitle')}
            />
          }
          contentContainerStyle={plants.length === 0 ? styles.emptyList : styles.listContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={plants.length > 0 ? styles.row : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightMintBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  countBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter_700Bold',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  cardWrapper: {
    width: '48%',
  },
  cardLeft: { marginRight: 4 },
  cardRight: { marginLeft: 4 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
});
