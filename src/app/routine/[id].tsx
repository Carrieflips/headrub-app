import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  Animated as RNAnimated,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import RevenueCatUI from 'react-native-purchases-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Body, BodyMicro, Label, BigNumber, Headline, Subtitle } from '@/components/Text';
import { colors } from '@/constants/colors';
import { useAudioPlaylist } from '@/hooks/useAudioPlaylist';
import { getCustomerInfo } from '@/lib/revenuecatClient';
import { PAYWALL_ENABLED } from '@/constants/flags';
import { logEvent } from '@/lib/analytics';
import { getDeviceId } from '@/lib/deviceId';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { PauseIcon } from '@/components/icons/PauseIcon';
import { NextArrowIcon } from '@/components/icons/NextArrowIcon';
import { PrevArrowIcon } from '@/components/icons/PrevArrowIcon';
import { useIconColor } from '@/components/icons/IconBase';
import { HeadRubIcon } from '@/components/icons/HeadRubIcon';
import { HeadRubTextIcon } from '@/components/icons/HeadRubTextIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';

interface RoutineStep {
  id: string;
  order: number;
  title: string;
  description: string;
  audio_title_url: string;
  audio_description_url: string;
  has_switch_sides: boolean;
  image_url: string;
  region: string;
}

const BG_BLACK = '#000000';
const BG_WARM_BLACK = '#0D0605';
/** Peak opacity of the pulsing layer — kept low for a barely perceptible “living” background. */
const PULSE_OPACITY_PEAK = 0.08;

function RoutineScreenBackground() {
  const pulseOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseOpacity, {
          toValue: PULSE_OPACITY_PEAK,
          duration: 4000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseOpacity, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseOpacity]);

  return (
    <>
      <LinearGradient
        colors={[BG_BLACK, BG_WARM_BLACK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        pointerEvents="none"
      />
      <RNAnimated.View
        style={[
          StyleSheet.absoluteFill,
          { zIndex: 0, opacity: pulseOpacity },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[BG_WARM_BLACK, BG_BLACK]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </RNAnimated.View>
    </>
  );
}

interface Routine {
  id: string;
  title: string;
  audio_intro_url: string;
  audio_close_url: string;
  audio_tone_url: string;
  close_image_url: string;
  background_color: string;
  duration_minutes: number;
  pressure_level: string;
  subtitle: string;
  featured: boolean;
  featured_image_url: string;
  tags: string[];
  intro_text: string | null;
  condition_id: string;
  sort_order: number;
  mode: string;
  is_free: boolean;
  conditions: { intro_image_url: string | null } | null;
}

export default function RoutineScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const routineId = Array.isArray(params.id) ? params.id[0] : params.id;
  const iconColor = useIconColor();
  const { textPrimary, textMuted, accentHex } = useTheme();
  const progressTrackColor = `${accentHex}66`; // accent at 40% opacity

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Countdown state
  const [countdownValue, setCountdownValue] = useState<number>(5);
  const [hasCountdownStarted, setHasCountdownStarted] = useState<boolean>(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Completion screen state
  const [isSubscriber, setIsSubscriber] = useState<boolean | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentStepIndexRef = useRef<number>(-1);
  const trialConsumedRef = useRef<boolean>(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);

  const progressShared = useSharedValue(0);
  const progressBarWidth = useSharedValue(0);
  const bgProgress = useSharedValue(0);
  const imageOpacity = useSharedValue(1);
  const closeUIOpacity = useSharedValue(1);
  const introImageOpacity = useSharedValue(0);
  const [routineBgColor, setRoutineBgColor] = useState<string>(colors.background);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: progressShared.value * progressBarWidth.value,
  }));

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      [colors.background, routineBgColor],
    ),
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const closeUIAnimatedStyle = useAnimatedStyle(() => ({
    opacity: closeUIOpacity.value,
  }));

  const animatedIntroImageStyle = useAnimatedStyle(() => ({
    opacity: introImageOpacity.value,
  }));

  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    if (!routineId) {
      setError(true);
      setLoading(false);
      return;
    }

    async function fetchData() {
      const [routineResult, stepsResult] = await Promise.all([
        supabase.from('routines').select('*, conditions(intro_image_url)').eq('id', routineId).single(),
        supabase
          .from('routine_steps')
          .select('order, steps(*)')
          .eq('routine_id', routineId)
          .order('order'),
      ]);

      if (routineResult.error || !routineResult.data) {
        setError(true);
        setLoading(false);
        return;
      }

      if (stepsResult.error) {
        setError(true);
        setLoading(false);
        return;
      }

      const mappedSteps: RoutineStep[] = (stepsResult.data ?? []).map(
        (row: { order: number; steps: unknown }) => {
          const step = row.steps as Record<string, unknown>;
          return {
            id: step.id as string,
            order: row.order,
            title: step.title as string,
            description: step.description as string,
            audio_title_url: step.audio_title_url as string,
            audio_description_url: step.audio_description_url as string,
            has_switch_sides: step.has_switch_sides as boolean,
            image_url: step.image_url as string,
            region: step.region as string,
          };
        }
      );

      setRoutine(routineResult.data as Routine);
      setSteps(mappedSteps);
      // Kick off background color fade
      const bgColor = (routineResult.data as Routine).background_color || colors.background;
      setRoutineBgColor(bgColor);
      bgProgress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
      setLoading(false);
    }

    fetchData();
  }, [routineId]);

  const { currentStepIndex, currentSegKind, isPlaying, progress, play, pause, next, previous, release } =
    useAudioPlaylist(
      routine ?? { audio_intro_url: '', audio_close_url: '', audio_tone_url: '' },
      steps,
      {
        onStepChange: (index) => {
          const step = steps[index];
          if (step) {
            logEvent('step_viewed', { step_id: step.id, routine_id: routineId });
          }
        },
        onComplete: async () => {
          console.log('[session] onComplete fired');
          setIsComplete(true);
          logEvent('session_completed', { completion_pct: 100 });
          if (sessionIdRef.current) {
            await supabase
              .from('sessions')
              .update({
                completed_at: new Date().toISOString(),
                completion_pct: 100,
              })
              .eq('id', sessionIdRef.current);
          } else {
            console.log('[session] onComplete: sessionId is null, skipping update');
          }
        },
      },
    );

  // Keep currentStepIndexRef in sync so exit handlers always see the latest value
  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  // Auto-play and countdown when data first loads
  useEffect(() => {
    if (routine && steps.length > 0) {
      activateKeepAwakeAsync();
      logEvent('session_started', { routine_id: routineId });
      setHasStarted(true);
      play();
      // Insert session row at start
      (async () => {
        const deviceId = await getDeviceId();
        const sessionId = crypto.randomUUID();
        const insertPayload = {
          id: sessionId,
          device_id: deviceId,
          routine_id: routineId,
          started_at: new Date().toISOString(),
          completion_pct: 0,
        };
        console.log('[session] inserting payload:', JSON.stringify(insertPayload));
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert(insertPayload);
        if (sessionError) {
          console.log('[session] insert error:', sessionError.message, sessionError.code);
          return;
        }
        setSessionId(sessionId);
        sessionIdRef.current = sessionId;
        console.log('[session] inserted, id:', sessionId);
      })();
      // Start 5→0 countdown in parallel with begin-routine audio
      setHasCountdownStarted(true);
      const interval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownIntervalRef.current = interval;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine?.id, steps.length]);

  // Animate progress bar
  useEffect(() => {
    progressShared.value = withTiming(progress, { duration: 100, easing: Easing.linear });
  }, [progress]);

  // Image opacity — fade in on title, hold on desc, fade out over tone duration
  useEffect(() => {
    if (currentSegKind === 'title') {
      imageOpacity.value = 0;
      imageOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
      closeUIOpacity.value = 1;
    } else if (currentSegKind === 'desc') {
      imageOpacity.value = withTiming(1, { duration: 100 });
      closeUIOpacity.value = 1;
    } else if (currentSegKind === 'tone') {
      imageOpacity.value = withTiming(0, { duration: 5000, easing: Easing.linear });
      closeUIOpacity.value = 1;
    } else if (currentSegKind === 'close') {
      // Hide image immediately; fade out step UI over close audio
      imageOpacity.value = 0;
      closeUIOpacity.value = withTiming(0, { duration: 2500, easing: Easing.linear });
    } else {
      // begin, intro — ensure fully visible
      imageOpacity.value = 1;
      closeUIOpacity.value = 1;
    }
  }, [currentSegKind]);

  // Animate intro image: fade in when in intro state, fade out when step 1 begins
  useEffect(() => {
    if (currentStepIndex < 0) {
      introImageOpacity.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) });
    } else if (currentStepIndex === 0) {
      introImageOpacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
    }
  }, [currentStepIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      release();
      deactivateKeepAwake();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consume trial when first step's description clip begins, for non-subscribers only
  useEffect(() => {
    // PAYWALL_ENABLED = false: trial gate disabled. No AsyncStorage write, no analytics event.
    // To restore: set PAYWALL_ENABLED = true in constants/flags.ts
    if (!PAYWALL_ENABLED) return;
    if (currentStepIndex !== 0 || currentSegKind !== 'desc') return;
    if (trialConsumedRef.current) return;
    trialConsumedRef.current = true;

    async function consumeTrial() {
      const result = await getCustomerInfo();
      const active = result.ok && Boolean(result.data.entitlements.active?.['Premium']);
      if (!active) {
        await AsyncStorage.setItem('trial_session_used', 'true');
        logEvent('trial_consumed', { routine_id: routineId });
      }
    }
    consumeTrial();
  }, [currentStepIndex, currentSegKind]);

  // On completion: deactivate wake lock and check subscription status
  useEffect(() => {
    if (!isComplete) return;
    deactivateKeepAwake();

    // PAYWALL_ENABLED = false: always shows subscriber completion view with star rating.
    // To restore: set PAYWALL_ENABLED = true in constants/flags.ts
    if (!PAYWALL_ENABLED) {
      setIsSubscriber(true);
      return;
    }

    async function checkSubscription() {
      const result = await getCustomerInfo();
      if (result.ok) {
        const active = Boolean(result.data.entitlements.active?.['Premium']);
        setIsSubscriber(active);
      } else {
        // RC not configured or error — show subscriber screen as default
        setIsSubscriber(true);
      }
    }
    checkSubscription();
  }, [isComplete]);

  // Non-subscriber: present paywall as a modal overlay; dismissal returns to completion screen
  useEffect(() => {
    if (!isComplete || isSubscriber !== false) return;

    async function presentPaywallModal() {
      try {
        await RevenueCatUI.presentPaywall();
      } catch (_) {
        // presentPaywall not available or dismissed — stay on completion screen
      }
    }
    presentPaywallModal();
  }, [isComplete, isSubscriber]);

  const confirmLeaveRoutine = useCallback(async () => {
    setLeaveConfirmVisible(false);
    const id = sessionIdRef.current;
    const stepIndex = currentStepIndexRef.current;
    const denom = steps.length > 0 ? steps.length : 1;
    const completionPct = Math.round(((stepIndex + 1) / denom) * 100);
    const stepReached = stepIndex + 1;
    if (id) {
      await supabase
        .from('sessions')
        .update({
          completed_at: new Date().toISOString(),
          completion_pct: completionPct,
          step_reached: stepReached,
        })
        .eq('id', id);
    } else {
      console.log('[session] handleExit: sessionId is null, skipping update');
    }
    await logEvent('session_abandoned', {
      step_reached: stepReached,
      completion_pct: completionPct,
    });
    release();
    deactivateKeepAwake();
    router.back();
  }, [steps.length]);

  const handleExit = () => {
    // During countdown / begin-intro phase: exit immediately, no dialog
    if (currentStepIndex === -1) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      async function earlyExit() {
        if (sessionIdRef.current) {
          await supabase
            .from('sessions')
            .update({ completed_at: new Date().toISOString(), completion_pct: 0 })
            .eq('id', sessionIdRef.current);
        } else {
          console.log('[session] handleExit (early): sessionId is null, skipping update');
        }
        await logEvent('session_abandoned', {
          step_reached: 0,
          completion_pct: 0,
        });
        release();
        router.back();
      }
      earlyExit();
      return;
    }
    if (!hasStarted) {
      router.back();
      return;
    }
    setLeaveConfirmVisible(true);
  };

  // Clear countdown interval as soon as we leave the begin segment
  useEffect(() => {
    if (currentSegKind !== 'begin' && countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [currentSegKind]);

  // Wrap play/pause to also freeze/resume the countdown interval
  const handlePause = () => {
    pause();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handlePlay = () => {
    play();
    // Resume countdown if still in the pre-step phase and not yet finished
    if (currentStepIndex === -1 && hasCountdownStarted && countdownValue > 0 && !countdownIntervalRef.current) {
      const interval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownIntervalRef.current = interval;
    }
  };

  if (loading) {
    return (
      <View testID="loading-indicator" style={{ flex: 1 }}>
        <RoutineScreenBackground />
        <View
          style={{
            flex: 1,
            zIndex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <Label style={{ color: colors.textPrimary }}>LOADING</Label>
        </View>
      </View>
    );
  }

  if (error || !routine) {
    return (
      <View testID="error-view" style={{ flex: 1 }}>
        <RoutineScreenBackground />
        <View
          style={{
            flex: 1,
            zIndex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <Label style={{ color: colors.textPrimary }}>SOMETHING WENT WRONG</Label>
        </View>
      </View>
    );
  }

  // ── Unified render (player + completion) ──────────────────────────────────────

  const uniqueRegions = [...new Set(steps.map(s => s.region?.toLowerCase()))].join(' \\ ');

  // -1 = intro (show step 0 content), 0–8 = steps, 9 = close
  const displayIndex = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? currentStepIndex
    : 0;

  const displayStep = steps[displayIndex] ?? null;
  const counterCurrent = currentStepIndex < 0 ? 0 : currentStepIndex + 1;
  const displayImageUri = displayStep?.image_url || '';

  const isCountdownActive = currentSegKind === 'begin' && hasCountdownStarted && countdownValue > 0;
  const introImageUrl = routine.conditions?.intro_image_url ?? null;

  return (
    <View style={{ flex: 1 }}>
      <RoutineScreenBackground />
      <Animated.View style={[{ flex: 1, zIndex: 1 }, animatedBgStyle]}>
    <SafeAreaView testID={isComplete ? 'completion-screen' : 'routine-screen'} style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 16,
          gap: 32,
        }}
      >
        <Pressable onPress={handleExit}>
          <CloseIcon color={iconColor} size={32} />
        </Pressable>
        <View style={{ width: 260, marginLeft: 'auto', gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingTop: 8 }}>
            <Label style={{ color: textPrimary, opacity: 0.8, lineHeight: 18, minWidth: 64 }}>ROUTINE</Label>
            <BodyMicro style={{ color: textPrimary, flex: 1, lineHeight: 18 }}>{routine.title}</BodyMicro>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Label style={{ color: textPrimary, opacity: 0.8, lineHeight: 18, minWidth: 64 }}>REGIONS</Label>
            <BodyMicro style={{ color: textPrimary, flex: 1, lineHeight: 18 }}>{uniqueRegions}</BodyMicro>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Label style={{ color: textPrimary, opacity: 0.8, lineHeight: 18, minWidth: 64 }}>DURATION</Label>
            <BodyMicro style={{ color: textPrimary, flex: 1, lineHeight: 18 }}>{routine.duration_minutes} minutes</BodyMicro>
          </View>
        </View>
      </View>

      {isComplete ? (
        /* ── Completion content ── */
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
          <Label style={{ color: textPrimary }}>ROUTINE COMPLETE</Label>
          <Subtitle style={{ color: textPrimary, textAlign: 'center' }}>How was this routine?</Subtitle>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                testID={`star-${star}`}
                onPress={() => {
                  setSelectedStars(star);
                  logEvent('session_rated', { stars: star, routine_id: routineId });
                }}
                style={{ padding: 4 }}
              >
                <Star
                  size={36}
                  color={star <= selectedStars ? textPrimary : textMuted}
                  fill={star <= selectedStars ? textPrimary : 'transparent'}
                />
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label="Return Home"
            onPress={() => router.replace('/home')}
            testID="return-home-button"
            hideArrow
            style={{ alignSelf: 'stretch', justifyContent: 'center' }}
          />
        </View>
      ) : (
        /* ── Player content ── */
        <>
          {/* Centered content area */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* Image area */}
            <View style={{ position: 'relative' }}>
              <Animated.View style={animatedImageStyle}>
              {isCountdownActive ? (
                <View
                  style={{
                    width: screenWidth,
                    height: screenWidth,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BigNumber style={{ color: textPrimary, fontSize: 100, lineHeight: 110 }}>
                    {countdownValue}
                  </BigNumber>
                </View>
              ) : currentStepIndex < 0 ? (
                introImageUrl ? (
                  <Animated.View style={[{ width: screenWidth, height: screenWidth }, animatedIntroImageStyle]}>
                    <Image
                      source={{ uri: introImageUrl }}
                      style={{ width: screenWidth, height: screenWidth }}
                      contentFit="cover"
                    />
                  </Animated.View>
                ) : (
                  <View style={{ width: screenWidth, height: screenWidth }} />
                )
              ) : displayImageUri ? (
                <Image
                  source={{ uri: displayImageUri }}
                  style={{ width: screenWidth, height: screenWidth }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: screenWidth, height: screenWidth }} />
              )}
              </Animated.View>
              {!isCountdownActive && (
                <Animated.View
                  style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, closeUIAnimatedStyle]}
                  pointerEvents="none"
                >
                  <View style={{ position: 'absolute', bottom: 8, right: 24, paddingTop: 8 }}>
                    <BigNumber style={{ color: textPrimary }}>{counterCurrent}/{steps.length}</BigNumber>
                  </View>
                  <View style={{ position: 'absolute', bottom: 8, left: 24 }}>
                    <Label style={{ color: textPrimary }}>STEP</Label>
                  </View>
                  <View
                    style={{ position: 'absolute', bottom: 0, left: 24, right: 24, height: 2, backgroundColor: progressTrackColor }}
                    onLayout={(e) => { progressBarWidth.value = e.nativeEvent.layout.width; }}
                  >
                    <Animated.View
                      style={[{ height: 2, backgroundColor: textPrimary }, animatedBarStyle]}
                    />
                  </View>
                </Animated.View>
              )}
            </View>

          {/* Step title */}
          <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
            <Headline style={{ color: textPrimary, textAlign: 'center' }}>
              {currentSegKind === 'begin' ? 'Starting...' : currentSegKind === 'intro' ? 'Intro' : currentSegKind === 'close' ? '' : (displayStep?.title ?? '')}
            </Headline>
          </View>
          </View>{/* end centered content area */}

          {/* Transport controls */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 40,
              paddingBottom: 24,
            }}
          >
            <Pressable onPress={previous}>
              <PrevArrowIcon color={iconColor} size={24} />
            </Pressable>
            <Pressable onPress={isPlaying ? handlePause : handlePlay}>
              {isPlaying
                ? <PauseIcon color={iconColor} size={52} />
                : <PlayIcon color={iconColor} size={52} />}
            </Pressable>
            <Pressable onPress={next}>
              <NextArrowIcon color={iconColor} size={24} />
            </Pressable>
          </View>
          {/* Decorative head-rub icon — bottom-left, non-interactive */}
          <View style={{ position: 'absolute', bottom: 40, left: 24, opacity: 0.4 }} pointerEvents="none">
            <HeadRubIcon color={iconColor} size={20} />
          </View>
          {/* Decorative head-rub text icon — bottom-right, vertical, non-interactive */}
          <View style={{ position: 'absolute', bottom: 40, right: 24, opacity: 0.4 }} pointerEvents="none">
            <HeadRubTextIcon color={iconColor} size={7} />
          </View>
        </>
      )}
    </SafeAreaView>
      </Animated.View>

      <Modal
        visible={leaveConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLeaveConfirmVisible(false)}
        statusBarTranslucent
        testID="leave-routine-modal"
      >
        <View style={{ flex: 1 }}>
          <BlurView
            intensity={72}
            tint="dark"
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            experimentalBlurMethod="dimezisBlurView"
          />
          <Pressable
            testID="leave-routine-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={() => setLeaveConfirmVisible(false)}
          />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
            pointerEvents="box-none"
          >
            <View
              style={{
                backgroundColor: colors.surfaceDeep,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
                borderRadius: 14,
                paddingVertical: 24,
                paddingHorizontal: 20,
                gap: 16,
                overflow: 'hidden',
              }}
            >
              <Subtitle style={{ color: textPrimary, textAlign: 'center' }}>
                Leave this routine?
              </Subtitle>
              <View style={{ gap: 14, marginTop: 8 }}>
                <PrimaryButton
                  label="Keep going"
                  onPress={() => setLeaveConfirmVisible(false)}
                  hideArrow
                  testID="leave-routine-keep"
                  style={{ alignSelf: 'stretch', justifyContent: 'center' }}
                />
                <Pressable
                  onPress={() => {
                    void confirmLeaveRoutine();
                  }}
                  testID="leave-routine-confirm"
                  style={{ paddingVertical: 8, alignItems: 'center' }}
                >
                  <Body style={{ color: textPrimary, textDecorationLine: 'underline' }}>
                    Leave
                  </Body>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
