import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { SunriseIcon } from '@/components/icons/SunriseIcon';
import LightSensitivitySlider from '@/components/LightSensitivitySlider';
import { colors } from '@/constants/colors';

const BUTTON_SIZE = 44;
const BUTTON_RADIUS = 8;
const ICON_SIZE = 24;
const DROPDOWN_WIDTH = 264;
const DROPDOWN_GAP = 4;

/** Matches Home screen header `paddingTop` below safe area (see `home.tsx`). */
const HOME_HEADER_PADDING_TOP = 16;

export type AccessibilityMenuPlacementPreset = 'default' | 'home';

function fallbackAnchor(
  screenWidth: number,
  preset: AccessibilityMenuPlacementPreset,
  topInset: number,
) {
  const y =
    preset === 'home'
      ? topInset + HOME_HEADER_PADDING_TOP
      : 56;
  return {
    x: Math.max(8, screenWidth - BUTTON_SIZE - 24),
    y,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  };
}

export type AccessibilityMenuProps = {
  /**
   * `home` — fallback anchor Y matches Home header (safe area + header padding).
   * Omit or `default` — preserves prior Settings / subpage placement.
   */
  placementPreset?: AccessibilityMenuPlacementPreset;
};

export default function AccessibilityMenu({ placementPreset = 'default' }: AccessibilityMenuProps) {
  const { accentHex } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();

  const getFallback = useCallback(
    () => fallbackAnchor(screenWidth, placementPreset, topInset),
    [screenWidth, placementPreset, topInset],
  );

  const syncAnchorFromWindow = useCallback(() => {
    buttonRef.current?.measureInWindow((winX, winY, width, height) => {
      if (width > 0 && height > 0) {
        setAnchor({ x: winX, y: winY, width, height });
      }
    });
  }, []);

  const handleOpen = () => {
    // Open immediately — do not depend on async layout alone (Fabric can omit measure callbacks).
    if (anchor.width <= 0 || anchor.height <= 0) {
      setAnchor(getFallback());
    }
    setIsOpen(true);
    requestAnimationFrame(() => {
      syncAnchorFromWindow();
    });
  };

  const handleButtonLayout = useCallback(() => {
    syncAnchorFromWindow();
  }, [syncAnchorFromWindow]);

  const effectiveAnchor = useMemo(
    () => (anchor.width > 0 && anchor.height > 0 ? anchor : getFallback()),
    [anchor, getFallback],
  );

  const dropdownTop = effectiveAnchor.y + effectiveAnchor.height + DROPDOWN_GAP;
  const dropdownRight = Math.max(
    8,
    screenWidth - effectiveAnchor.x - effectiveAnchor.width,
  );

  const activeBg = `${accentHex}33`;

  return (
    <>
      <View
        ref={buttonRef}
        collapsable={false}
        onLayout={handleButtonLayout}
      >
        <Pressable
          testID="accessibility-menu-button"
          onPress={handleOpen}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_RADIUS,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isOpen ? activeBg : 'transparent',
          }}
        >
          <SunriseIcon size={ICON_SIZE} color={accentHex} />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          testID="accessibility-menu-backdrop"
          style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
          onPress={() => setIsOpen(false)}
        />

        <View
          testID="accessibility-menu-dropdown"
          style={{
            position: 'absolute',
            top: dropdownTop,
            right: dropdownRight,
            width: DROPDOWN_WIDTH,
            zIndex: 1,
            backgroundColor: colors.surfaceDeep,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LightSensitivitySlider />
        </View>
      </Modal>
    </>
  );
}
