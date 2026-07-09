/**
 * Licensed botanical photo assets — AI-generated, licensed for use.
 *
 * Current usage:
 *   flower-lily-single.png  → onboarding Q0_Welcome hero (WelcomePhoto)
 *   flower-lily-white.png   → paywall header (PW_Paywall hero panel)
 *   flower-lily-pink.png    → Home screen hero panel
 *   flower-tulip.png        → Collection empty state (TulipPhoto)
 *   flower-orchid.png       → Result card corner accent (cardOrchidWatermark)
 *
 * To add more photos, drop them into assets/images/ and reference with require():
 *   monstera: require('../../assets/images/leaf-monstera.jpg'),
 *
 * Performance note: flower-lily-pink, flower-lily-white, flower-orchid are ~1.2–1.3 MB.
 * Consider downscaling to 600–800 KB with an image editor for better bundle performance.
 */

export const FLOWER_IMAGES = {
  lilyWhite:  require('../../assets/images/flower-lily-white.png'),
  orchid:     require('../../assets/images/flower-orchid.png'),
  lilyPink:   require('../../assets/images/flower-lily-pink.png'),
  lilySingle: require('../../assets/images/flower-lily-single.png'),
  tulip:      require('../../assets/images/flower-tulip.png'),
} as const;
