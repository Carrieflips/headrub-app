import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { colors } from '@/constants/colors';

export type IconProps = {
  color?: string;
  size?: number;
};

/**
 * Returns the theme-aware icon color.
 * White when the accessibility (light sensitivity) toggle is on,
 * primary red when off.
 *
 * Use this hook at the call site to pass color into any icon:
 *   const iconColor = useIconColor();
 *   <MyIcon color={iconColor} />
 */
export function useIconColor(): string {
  const { textPrimary } = useTheme();
  return textPrimary;
}

/**
 * Example icon — replace the Path `d` with the real SVG path data.
 * All app icons follow this pattern: React components that render SVG,
 * not imported image files.
 */
export const ExampleIcon = ({ color = colors.textPrimary, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2L2 22h20L12 2z" fill={color} />
  </Svg>
);
