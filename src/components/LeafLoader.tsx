import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';

interface Props {
  label?: string;
}

export function LeafLoader({ label = '' }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 950, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.65, duration: 950, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrap}>
        {/* Spinning arc ring */}
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <Svg width={64} height={64} viewBox="0 0 64 64">
            {/* Track */}
            <Circle cx={32} cy={32} r={26} stroke="#D8E6DE" strokeWidth={3} fill="none" />
            {/* 270° arc (12 o'clock → 9 o'clock, clockwise) */}
            <Path
              d="M32 6 A26 26 0 1 1 6 32"
              stroke="#1B4332"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
        {/* Centre leaf — pulsing */}
        <Animated.View style={{ opacity: pulseAnim }}>
          <Svg width={22} height={22} viewBox="0 0 22 22">
            <Path
              d="M11 20 C6 17 2 12 3 7 C5 9 7 11 9 13 C10 10 9 6 11 3 C13 6 12 10 13 13 C15 11 17 9 19 7 C20 12 16 17 11 20 Z"
              fill="#2D6A4F"
              opacity={0.88}
            />
          </Svg>
        </Animated.View>
      </View>
      {label ? (
        <Animated.Text style={[styles.label, { opacity: pulseAnim }]}>{label}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  loaderWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.4,
    fontFamily: 'Inter_400Regular',
  },
});
