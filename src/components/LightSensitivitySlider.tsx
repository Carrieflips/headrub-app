import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { accentStops, AccentStop } from '../constants/accentColors';
import { useTheme } from '../contexts/ThemeContext';
import { logEvent } from '../lib/analytics';

const TRACK_HEIGHT = 4;
const STOP_SIZE = 14;
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
            left: STOP_SELECTED_SIZE / 2,
            right: STOP_SELECTED_SIZE / 2,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
          }}
        />

        {/* Stop indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {accentStops.map(stop => {
            const selected = stop.key === palette;
            const size = selected ? STOP_SELECTED_SIZE : STOP_SIZE;

            return (
              <Pressable
                key={stop.key}
                testID={`palette-stop-${stop.key}`}
                onPress={() => handleSelect(stop.key as AccentStop)}
                hitSlop={HIT_SLOP}
                style={{ alignItems: 'center', justifyContent: 'center', width: STOP_SELECTED_SIZE, height: STOP_SELECTED_SIZE }}
              >
                {/* Outer ring for selected state */}
                {selected === true && (
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
                )}
                {/* Dot */}
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: stop.hex,
                    borderWidth: selected ? 2 : 1.5,
                    borderColor: selected ? '#000000' : 'rgba(0,0,0,0.3)',
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
