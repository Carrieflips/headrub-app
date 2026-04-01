import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Label } from '@/components/Text';
import { colors } from '@/constants/colors';
import { HeadRubIcon } from '@/components/icons/HeadRubIcon';

export default function SplashEntry() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 }, () => {
      runOnJS(checkOnboarding)();
    });
  }, []);

  async function checkOnboarding() {
    await new Promise<void>(r => setTimeout(r, 400));
    router.replace('/home' as never);
  }

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, animStyle]}>
        <HeadRubIcon size={80} color={colors.textPrimary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 16,
  },
  studio: {
    color: colors.textMuted,
  },
});
