import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface Props {
  width?: number;
}

function TinyFlower({ x, y }: { x: number; y: number }) {
  const angles = [0, 72, 144, 216, 288];
  return (
    <G>
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <Circle
            key={i}
            cx={x + Math.cos(rad) * 5}
            cy={y + Math.sin(rad) * 5}
            r={3.2}
            fill="#4ADE80"
            opacity={0.8}
          />
        );
      })}
      <Circle cx={x} cy={y} r={2.8} fill="#FDE68A" />
    </G>
  );
}

export function FloralDivider({ width = 300 }: Props) {
  const h = 32;
  const mid = h / 2;
  const w = width;

  return (
    <View style={styles.container}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Wavy vine */}
        <Path
          d={`M16 ${mid} C${w * 0.15} ${mid - 7} ${w * 0.25} ${mid + 7} ${w * 0.35} ${mid} C${w * 0.45} ${mid - 7} ${w * 0.55} ${mid + 7} ${w * 0.65} ${mid} C${w * 0.75} ${mid - 7} ${w * 0.85} ${mid + 7} ${w - 16} ${mid}`}
          stroke="#4ADE80"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.65}
        />
        <TinyFlower x={w * 0.2} y={mid - 3} />
        <TinyFlower x={w * 0.5} y={mid + 3} />
        <TinyFlower x={w * 0.8} y={mid - 3} />
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
