import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function GreenButton({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}: Props) {
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[styles.secondary, style, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.72}
      >
        <Text style={[styles.secondaryText, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.wrapper, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.80}
    >
      <LinearGradient
        colors={['#2D6A4F', '#143026']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.primaryText, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondary: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2D6A4F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 106, 79, 0.06)',
  },
  secondaryText: {
    color: '#1B4332',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.45,
  },
});
