import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function InfoChip({ label, color = '#16A34A', bgColor, style }: Props) {
  const bg = bgColor ?? color + '22';
  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
