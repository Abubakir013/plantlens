import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';

interface Props {
  label?: string;
}

export function LeafLoader({ label = '' }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={64} height={64} viewBox="0 0 64 64">
          <G transform="translate(32,32)">
            {/* Main leaf body */}
            <Path
              d="M0 -26 C12 -22 22 -12 22 0 C22 14 12 22 0 24 C-12 22 -22 14 -22 0 C-22 -12 -12 -22 0 -26 Z"
              fill="#4ADE80"
            />
            {/* Central vein */}
            <Path
              d="M0 -23 C1 -12 1 0 0 14 C0 20 0 22 0 24"
              stroke="#16A34A"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
            {/* Left veins */}
            <Path d="M0 -6 C-5 -2 -11 2 -16 6" stroke="#16A34A" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
            <Path d="M0 4 C-5 7 -10 10 -14 14" stroke="#16A34A" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
            {/* Right veins */}
            <Path d="M0 -6 C5 -2 11 2 16 6" stroke="#16A34A" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
            <Path d="M0 4 C5 7 10 10 14 14" stroke="#16A34A" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7} />
            {/* Stem nub */}
            <Path d="M0 22 C0 27 2 30 0 32" stroke="#16A34A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </G>
        </Svg>
      </Animated.View>
      <Animated.Text style={[styles.label, { opacity: opacityAnim }]}>{label}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  label: {
    fontSize: 15,
    color: Colors.darkGreen,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
