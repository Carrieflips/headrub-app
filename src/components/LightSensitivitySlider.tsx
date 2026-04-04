import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { accentStops, AccentStop } from '../constants/accentColors';
import { colors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { logEvent } from '../lib/analytics';

const TRACK_HEIGHT = 5;
/** Horizontal extension of the gradient past the outer edge of the first/last stop. */
const TRACK_OVERHANG = 2;
const STOP_DOT_UNSELECTED = 3;
const STOP_SELECTED_SIZE = 22;
const HIT_SLOP = { top: 16, bottom: 16, left: 8, right: 8 };

export default function LightSensitivitySlider() {
  const { palette, setPalette } = useTheme();

  const gradientColors = accentStops.map(s => s.hex) as [string, string, ...string[]];

  const handleSelect = async (key: AccentStop) => {
    if (key === palette) return;
    setPalette(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('accessibility_palette', key);
    logEvent('accessibility_toggled', { to: key });
  };

  return (
    <View
      testID="light-sensitivity-slider"
      style={{ paddingVertical: 12 }}
    >
      {/* Track + stops container */}
      <View style={{ position: 'relative', justifyContent: 'center', height: STOP_SELECTED_SIZE }}>
        {/* Gradient track */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            left: -TRACK_OVERHANG,
            right: -TRACK_OVERHANG,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
          }}
        />

        {/* Stop indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {accentStops.map(stop => {
            const selected = stop.key === palette;

            return (
              <Pressable
                key={stop.key}
                testID={`palette-stop-${stop.key}`}
                onPress={() => handleSelect(stop.key as AccentStop)}
                hitSlop={HIT_SLOP}
                style={{ alignItems: 'center', justifyContent: 'center', width: STOP_SELECTED_SIZE, height: STOP_SELECTED_SIZE }}
              >
                {selected ? (
                  <>
                    <View
                      style={{
                        position: 'absolute',
                        width: STOP_SELECTED_SIZE,
                        height: STOP_SELECTED_SIZE,
                        borderRadius: STOP_SELECTED_SIZE / 2,
                        borderWidth: 2,
                        borderColor: stop.hex,
                        opacity: 0.5,
                      }}
                    />
                    <View
                      style={{
                        width: STOP_SELECTED_SIZE,
                        height: STOP_SELECTED_SIZE,
                        borderRadius: STOP_SELECTED_SIZE / 2,
                        backgroundColor: stop.hex,
                        borderWidth: 2,
                        borderColor: '#000000',
                      }}
                    />
                  </>
                ) : (
                  <View
                    style={{
                      width: STOP_DOT_UNSELECTED,
                      height: STOP_DOT_UNSELECTED,
                      borderRadius: STOP_DOT_UNSELECTED / 2,
                      backgroundColor: colors.black,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
