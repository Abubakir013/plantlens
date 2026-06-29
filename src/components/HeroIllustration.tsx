import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

export function HeroIllustration({ width = 300, height = 230 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 230">
      {/* ── Monstera leaf (large, left-center) ── */}
      <Path
        d="M110 215 C65 205 22 172 28 128 C32 105 50 88 62 72 C82 44 104 20 128 13 C150 7 172 18 182 44 C192 68 187 94 176 115 C164 136 148 150 137 167 C127 182 118 210 110 215 Z"
        fill="#22C55E"
        opacity={0.88}
      />
      {/* Monstera split left-upper */}
      <Path
        d="M82 150 C72 138 57 116 52 94 C49 80 52 66 60 60"
        fill="none"
        stroke="#F0FDF4"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Monstera split left-lower */}
      <Path
        d="M76 128 C67 120 56 104 53 92"
        fill="none"
        stroke="#F0FDF4"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Monstera split right */}
      <Path
        d="M148 138 C158 122 169 100 174 78 C177 65 175 52 168 47"
        fill="none"
        stroke="#F0FDF4"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Primary vein */}
      <Path
        d="M110 212 C118 182 132 155 148 128 C162 103 174 76 180 50"
        fill="none"
        stroke="#16A34A"
        strokeWidth={2.2}
        opacity={0.45}
        strokeLinecap="round"
      />
      {/* Secondary veins */}
      <Path
        d="M110 212 C94 182 76 152 62 122"
        fill="none"
        stroke="#16A34A"
        strokeWidth={1.6}
        opacity={0.35}
        strokeLinecap="round"
      />
      <Path
        d="M120 180 C104 170 85 162 68 155"
        fill="none"
        stroke="#16A34A"
        strokeWidth={1.2}
        opacity={0.3}
        strokeLinecap="round"
      />

      {/* ── Smaller accent monstera (right) ── */}
      <Path
        d="M168 195 C148 186 128 168 133 146 C137 132 148 122 160 114 C174 103 190 95 202 92 C216 87 227 94 229 108 C232 124 222 138 210 147 C198 156 183 165 174 178 C168 187 170 198 168 195 Z"
        fill="#4ADE80"
        opacity={0.72}
      />
      {/* Small monstera split */}
      <Path
        d="M174 165 C182 153 192 136 196 120"
        fill="none"
        stroke="#F0FDF4"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.85}
      />

      {/* ── Daisy ── */}
      {/* Stem */}
      <Path
        d="M238 220 C236 202 233 184 230 166"
        stroke="#16A34A"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Petals (8) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const px = 230 + Math.cos(rad) * 13;
        const py = 156 + Math.sin(rad) * 13;
        return (
          <Ellipse
            key={i}
            cx={px}
            cy={py}
            rx={5}
            ry={9}
            fill="#FFFFFF"
            transform={`rotate(${angle}, ${px}, ${py})`}
            opacity={0.95}
          />
        );
      })}
      {/* Daisy center */}
      <Circle cx={230} cy={156} r={8} fill="#FDE68A" />
      <Circle cx={230} cy={156} r={4.5} fill="#F59E0B" />

      {/* Stem leaf left */}
      <Path
        d="M235 190 C224 182 214 178 212 170 C220 173 228 178 235 190 Z"
        fill="#22C55E"
        opacity={0.82}
      />
      {/* Stem leaf right */}
      <Path
        d="M232 175 C242 167 252 163 254 155 C245 159 238 165 232 175 Z"
        fill="#4ADE80"
        opacity={0.75}
      />

      {/* ── Small decorative leaves near bottom ── */}
      <Path
        d="M42 210 C36 198 30 188 35 180 C40 188 42 198 42 210 Z"
        fill="#4ADE80"
        opacity={0.6}
      />
      <Path
        d="M55 218 C48 206 50 194 58 188 C58 198 57 208 55 218 Z"
        fill="#22C55E"
        opacity={0.5}
      />

      {/* ── Ground suggestion ── */}
      <Path
        d="M30 225 Q165 218 270 225"
        stroke="#16A34A"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.22}
      />
    </Svg>
  );
}
