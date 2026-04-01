import React, { useRef, useState } from 'react';
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SunriseIcon } from '@/components/icons/SunriseIcon';
import LightSensitivitySlider from '@/components/LightSensitivitySlider';
import { colors } from '@/constants/colors';

const BUTTON_SIZE = 44;
const BUTTON_RADIUS = 8;
const ICON_SIZE = 24;
const DROPDOWN_WIDTH = 264;
const DROPDOWN_GAP = 4;

export default function AccessibilityMenu() {
  const { accentHex } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();

  const handleOpen = () => {
    buttonRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setAnchor({ x: px, y: py, width, height });
      setIsOpen(true);
    });
  };

  const dropdownTop = anchor.y + anchor.height + DROPDOWN_GAP;
  // Right-align dropdown to button's right edge, clamped to screen margin
  const dropdownRight = Math.max(8, screenWidth - anchor.x - anchor.width);

  // 20% opacity suffix for 8-digit hex (#RRGGBBAA)
  const activeBg = `${accentHex}33`;

  return (
    <>
      <View ref={buttonRef} collapsable={false}>
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
        {/* Full-screen backdrop — tap outside to dismiss */}
        <Pressable
          testID="accessibility-menu-backdrop"
          style={StyleSheet.absoluteFill}
          onPress={() => setIsOpen(false)}
        />

        {/* Dropdown panel */}
        <View
          testID="accessibility-menu-dropdown"
          style={{
            position: 'absolute',
            top: dropdownTop,
            right: dropdownRight,
            width: DROPDOWN_WIDTH,
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
