export const Colors = {
  // ── Greens (dark → light) ─────────────────────────────────────────────────
  darkGreen:    '#1B4332',   // primary brand — deep forest
  forestMid:    '#2D6A4F',   // secondary green — buttons, links, icons
  primaryGreen: '#52B788',   // sage — chips, rings, accents
  mintMid:      '#E4EDE7',   // muted sage tint — card surfaces, dividers

  // ── Backgrounds ───────────────────────────────────────────────────────────
  lightMintBg:  '#F3F6F1',   // page background — warm botanical white
  white:        '#FFFFFF',   // pure card background
  tabBar:       '#FAFCFB',   // tab bar — slight green warmth

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#0D1F15',  // near-black with green cast — headings
  textSecondary: '#3D5247',  // mid — subtitles, labels
  textMuted:     '#7A9080',  // light muted — captions, hints

  // ── Accent ────────────────────────────────────────────────────────────────
  gold:          '#B8912B',  // refined gold — badges, premium UI
  accentLime:    '#52B788',  // alias kept for back-compat → mapped to sage

  // ── Borders ───────────────────────────────────────────────────────────────
  cardBorder:    '#D8E6DE',
  tabBarBorder:  '#D8E6DE',

  // ── Shadows ───────────────────────────────────────────────────────────────
  cardShadow:  'rgba(27, 67, 50, 0.10)',
  shadowGreen: 'rgba(27, 67, 50, 0.12)',
  shadowDeep:  'rgba(27, 67, 50, 0.22)',
} as const;
