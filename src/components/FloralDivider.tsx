import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  width?: number;
}

export function FloralDivider({ width = 300 }: Props) {
  const h = 24;
  const mid = h / 2;
  const cx = width / 2;
  const gap = 30;

  return (
    <View style={styles.container}>
      <Svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}>
        {/* Left rule */}
        <Path
          d={`M0 ${mid} L${cx - gap} ${mid}`}
          stroke="#2D6A4F"
          strokeWidth={0.75}
          strokeLinecap="round"
          opacity={0.30}
        />
        {/* Right rule */}
        <Path
          d={`M${cx + gap} ${mid} L${width} ${mid}`}
          stroke="#2D6A4F"
          strokeWidth={0.75}
          strokeLinecap="round"
          opacity={0.30}
        />
        {/* Left leaf */}
        <Path
          d={`M${cx - 4} ${mid} C${cx - 12} ${mid - 6} ${cx - 25} ${mid - 4} ${cx - 27} ${mid} C${cx - 25} ${mid + 4} ${cx - 12} ${mid + 6} ${cx - 4} ${mid} Z`}
          fill="#2D6A4F"
          opacity={0.50}
        />
        {/* Right leaf */}
        <Path
          d={`M${cx + 4} ${mid} C${cx + 12} ${mid - 6} ${cx + 25} ${mid - 4} ${cx + 27} ${mid} C${cx + 25} ${mid + 4} ${cx + 12} ${mid + 6} ${cx + 4} ${mid} Z`}
          fill="#2D6A4F"
          opacity={0.50}
        />
        {/* Centre dot */}
        <Circle cx={cx} cy={mid} r={1.8} fill="#2D6A4F" opacity={0.55} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
  },
});
