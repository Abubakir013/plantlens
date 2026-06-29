import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useLocale } from '@/hooks/useLocale';
import { InfoChip } from './InfoChip';

interface Props {
  name: string;
  scientificName?: string;
  imageUri: string;
  confidence?: number;
  dateIdentified?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function PlantCard({
  name,
  scientificName,
  imageUri,
  confidence,
  dateIdentified,
  onPress,
  onLongPress,
}: Props) {
  const { t } = useLocale();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.87}
    >
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {scientificName ? (
          <Text style={styles.scientific} numberOfLines={1}>
            {scientificName}
          </Text>
        ) : null}
        <View style={styles.footer}>
          {confidence !== undefined && (
            <InfoChip label={`${confidence}${t('result.match')}`} color={Colors.darkGreen} />
          )}
          {dateIdentified ? (
            <Text style={styles.date}>{dateIdentified}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.lightMintBg,
  },
  content: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scientific: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
