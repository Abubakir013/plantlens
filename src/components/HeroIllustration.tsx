import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

export function HeroIllustration({ width = 300, height = 230 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 230">
      {/* ── Primary leaf — deep forest, botanical-study style ── */}
      <Path
        d="M105 218 C58 205 18 170 22 124 C26 96 46 76 64 58 C86 36 112 14 138 10 C160 6 180 20 188 48 C196 76 188 104 174 126 C160 148 140 162 128 182 C118 198 112 218 105 218 Z"
        fill="#1B4332"
        opacity={0.93}
      />
      {/* Primary midrib */}
      <Path
        d="M105 215 C116 184 134 156 152 126 C168 98 182 68 186 44"
        fill="none"
        stroke="#F3F6F1"
        strokeWidth={1.6}
        opacity={0.28}
        strokeLinecap="round"
      />
      {/* Secondary veins — left side */}
      <Path d="M113 190 C96 178 76 168 58 162" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.18} strokeLinecap="round" />
      <Path d="M124 168 C108 158 88 150 70 146" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.16} strokeLinecap="round" />
      <Path d="M136 144 C120 136 102 130 82 126" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.16} strokeLinecap="round" />
      <Path d="M146 118 C132 112 114 108 94 106" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.14} strokeLinecap="round" />
      {/* Secondary veins — right side */}
      <Path d="M144 148 C156 136 168 122 174 104" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.16} strokeLinecap="round" />
      <Path d="M158 124 C168 112 176 96 180 78" fill="none" stroke="#F3F6F1" strokeWidth={0.9} opacity={0.14} strokeLinecap="round" />
      {/* Leaf fenestrations / edge cuts */}
      <Path
        d="M78 150 C68 136 50 112 46 86 C44 72 48 58 58 52"
        fill="none"
        stroke="#F3F6F1"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.22}
      />
      <Path
        d="M156 138 C166 122 174 100 176 78"
        fill="none"
        stroke="#F3F6F1"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.20}
      />

      {/* ── Secondary leaf (right, mid-green) ── */}
      <Path
        d="M172 200 C150 190 130 170 136 148 C140 134 152 124 166 116 C182 106 200 98 214 96 C228 92 238 100 240 116 C242 132 232 146 220 156 C208 166 192 176 182 190 C176 198 176 204 172 200 Z"
        fill="#2D6A4F"
        opacity={0.78}
      />
      {/* Secondary leaf midrib */}
      <Path
        d="M172 197 C180 178 192 162 208 148 C220 136 230 118 236 104"
        fill="none"
        stroke="#F3F6F1"
        strokeWidth={1.0}
        opacity={0.18}
        strokeLinecap="round"
      />
      {/* Secondary leaf side veins */}
      <Path d="M182 176 C190 166 200 156 208 148" fill="none" stroke="#F3F6F1" strokeWidth={0.8} opacity={0.14} strokeLinecap="round" />
      <Path d="M192 158 C200 150 210 140 218 132" fill="none" stroke="#F3F6F1" strokeWidth={0.8} opacity={0.12} strokeLinecap="round" />

      {/* ── Stem ── */}
      <Path
        d="M105 218 C108 222 110 226 108 230"
        stroke="#1B4332"
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
      />

      {/* ── Small accent leaves, bottom-left ── */}
      <Path
        d="M36 216 C30 200 28 184 38 176 C40 188 40 204 36 216 Z"
        fill="#2D6A4F"
        opacity={0.52}
      />
      <Path
        d="M52 222 C44 206 44 190 56 182 C58 194 56 210 52 222 Z"
        fill="#1B4332"
        opacity={0.42}
      />

      {/* ── Leaf tip bud — sage highlight ── */}
      <Path
        d="M138 10 C142 4 149 2 151 7 C148 11 142 12 138 10 Z"
        fill="#52B788"
        opacity={0.65}
      />

      {/* ── Ground hint ── */}
      <Path
        d="M25 226 Q165 220 272 226"
        stroke="#1B4332"
        strokeWidth={1.0}
        strokeLinecap="round"
        fill="none"
        opacity={0.16}
      />

      {/* ── Subtle pollen dots (depth detail) ── */}
      <Circle cx={230} cy={108} r={1.5} fill="#52B788" opacity={0.40} />
      <Circle cx={238} cy={118} r={1.0} fill="#52B788" opacity={0.30} />
      <Circle cx={246} cy={112} r={1.2} fill="#52B788" opacity={0.25} />
    </Svg>
  );
}
