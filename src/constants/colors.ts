const raw = {
  red:   '#E8685D',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const colors = {
  background:    raw.black,
  surface:       'rgba(255, 255, 255, 0.06)',
  surfaceBorder: 'rgba(255, 255, 255, 0.10)',
  surfaceDeep:   '#220F0E',
  textPrimary:   raw.red,
  textMuted:     'rgba(232, 104, 93, 0.55)',
  textOnDark:    raw.black,
  accent:        raw.red,
  accentMuted:   'rgba(232, 104, 93, 0.15)',
  accentSubtle:  'rgba(232, 104, 93, 0.40)',
  overlay:       'rgba(0, 0, 0, 0.75)',
  overlayLight:  'rgba(0, 0, 0, 0.45)',
  white:         raw.white,
  black:         raw.black,
} as const;

export type ColorToken = keyof typeof colors;

export const accentStops = {
  dark_room: '#C9382C',
  dim:       '#E8685D',
  soft:      '#D7948E',
  daylight:  '#D9B9B7',
  bright:    '#FFFFFF',
} as const;

export type AccentStop = keyof typeof accentStops;
