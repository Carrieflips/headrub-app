import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync } from 'expo-audio';
import { ThemeProvider, Palette } from '@/contexts/ThemeContext';
import { EntitlementProvider } from '@/contexts/EntitlementContext';
import { colors } from '@/constants/colors';
import {
  useFonts,
  Faustina_400Regular,
  Faustina_500Medium,
  Faustina_500Medium_Italic,
} from '@expo-google-fonts/faustina';
import {
  Geist_100Thin,
  Geist_500Medium,
  Geist_600SemiBold,
} from '@expo-google-fonts/geist';
import {
  MartianMono_300Light,
  MartianMono_400Regular,
  MartianMono_600SemiBold,
} from '@expo-google-fonts/martian-mono';

Sentry.init({
  dsn: 'https://63e7c69d1b1accff49a32236f9e4fbf6@o4511134709645312.ingest.us.sentry.io/4511134716067840',
  debug: false,
  environment: __DEV__ ? 'development' : 'production',
  enableNative: true,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
      delete event.user.ip_address;
    }
    return event;
  },
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialPalette, setInitialPalette] = useState<Palette>('dim');

  const [fontsLoaded] = useFonts({
    Faustina_400Regular,
    Faustina_500Medium,
    Faustina_500Medium_Italic,
    Geist_100Thin,
    Geist_500Medium,
    Geist_600SemiBold,
    MartianMono_300Light,
    MartianMono_400Regular,
    MartianMono_600SemiBold,
  });

  useEffect(() => {
    async function init() {
      try {
        const palette = await AsyncStorage.getItem('accessibility_palette');
        const validPalettes: Palette[] = ['dark_room', 'dim', 'soft', 'daylight', 'bright'];
        if (palette && validPalettes.includes(palette as Palette)) {
          setInitialPalette(palette as Palette);
        }
        await setAudioModeAsync({
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (e) {
        console.warn('[layout init]', e);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!fontsLoaded || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardProvider>
        <ThemeProvider initialPalette={initialPalette}>
          <EntitlementProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayout}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="home" />
                <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="routine/[id]" />
                <Stack.Screen name="settings/about" />
                <Stack.Screen name="settings/plan" />
                <Stack.Screen name="settings/feedback" />
                <Stack.Screen name="settings/values" />
                <Stack.Screen name="settings/privacy" />
                <Stack.Screen name="settings/terms" />
                <Stack.Screen name="settings/health" />
              </Stack>
            </View>
          </EntitlementProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
})
