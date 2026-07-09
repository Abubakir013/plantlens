import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { PlantCard } from '@/components/PlantCard';
import { Colors } from '@/constants/colors';
import { SavedPlant, usePlantCollection } from '@/hooks/usePlantCollection';
import { useLocale } from '@/hooks/useLocale';

function TulipPhoto() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 42, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <View style={styles.tulipPanel}>
        <Image
          source={require('../../../assets/images/flower-tulip.png')}
          style={styles.tulipPhoto}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyContainer}>
      <TulipPhoto />
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
  tulipPanel: {
    backgroundColor: '#F3F6F1',
    borderRadius: 22,
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  tulipPhoto: {
    width: 170,
    height: 170,
  },
});
