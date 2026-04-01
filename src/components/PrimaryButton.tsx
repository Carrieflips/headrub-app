import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { ButtonText } from './Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
  hideArrow?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, onPress, style, testID, hideArrow }) => {
  const { textPrimary } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
      style={[styles.button, { backgroundColor: textPrimary }, style]}
    >
      <ButtonText style={styles.label}>{label}</ButtonText>
      {!hideArrow && <ArrowRight size={14} color={colors.black} strokeWidth={2.5} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  label: {
    color: colors.black,
  },
});
