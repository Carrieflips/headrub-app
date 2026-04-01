export const accentStops = [
  { key: 'dark_room', hex: '#C9382C' },
  { key: 'dim',       hex: '#E8685D' },
  { key: 'soft',      hex: '#D7948E' },
  { key: 'daylight',  hex: '#D9B9B7' },
  { key: 'bright',    hex: '#FFFFFF' },
] as const;

export type AccentStop = (typeof accentStops)[number]['key'];

export const DEFAULT_ACCENT_STOP: AccentStop = 'dim';
