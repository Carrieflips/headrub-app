import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '../constants/colors';
import { accentStops, AccentStop, DEFAULT_ACCENT_STOP } from '../constants/accentColors';

export type Palette = AccentStop;

interface ThemeContextValue {
  palette: Palette;
  setPalette: (p: Palette) => void;
  textPrimary: string;
  textMuted: string;
  accentHex: string;
}

const defaultHex = accentStops.find(s => s.key === DEFAULT_ACCENT_STOP)!.hex;

const ThemeContext = createContext<ThemeContextValue>({
  palette: DEFAULT_ACCENT_STOP,
  setPalette: () => {},
  textPrimary: defaultHex,
  textMuted: `${defaultHex}8C`,
  accentHex: defaultHex,
});

export const ThemeProvider = ({
  children,
  initialPalette = DEFAULT_ACCENT_STOP,
}: {
  children: ReactNode;
  initialPalette?: Palette;
}) => {
  const [palette, setPalette] = useState<Palette>(initialPalette);

  const hex = accentStops.find(s => s.key === palette)?.hex ?? defaultHex;
  const textPrimary = hex;
  const textMuted = `${hex}8C`; // ~55% opacity in hex (0.55 * 255 ≈ 140 = 0x8C)
  const accentHex = hex;

  return (
    <ThemeContext.Provider value={{ palette, setPalette, textPrimary, textMuted, accentHex }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
