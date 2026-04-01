import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, StyleSheet, TouchableOpacity, Pressable, Animated as RNAnimated, useWindowDimensions, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MoreHorizontal } from 'lucide-react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerInfo } from '@/lib/revenuecatClient';
import { PAYWALL_ENABLED } from '@/constants/flags';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { Subheadline, SubtitleBold, Body, Label, LinkText } from '@/components/Text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { HeadRubIcon } from '@/components/icons/HeadRubIcon';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const SHIMMER_BASE = 'rgba(232, 104, 93, 0.04)';
const SHIMMER_HIGHLIGHT = 'rgba(232, 104, 93, 0.08)';

type FilterKey = 'all' | 'daily' | 'most_popular';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'ALL' },
  { key: 'daily',        label: 'DAILY' },
  { key: 'most_popular', label: 'MOST POPULAR' },
];

const SCREEN_H_PAD = 12;
const CARD_GAP = 8;
const CARD_HEIGHT = 160;
const BORDER_STROKE = 1.5;
const BORDER_R = 8;

interface FeaturedRoutine {
  id: string;
  title: string;
  subtitle: string | null;
  intro_text: string | null;
  duration_minutes: number;
  pressure_level: string | null;
  background_color: string | null;
  featured_image_url: string | null;
  image_url: string | null;
}

interface NonFeaturedRoutine {
  id: string;
  title: string;
  duration_minutes: number;
  pressure_level: string | null;
  background_color: string | null;
  image_url: string | null;
  tags: string[] | null;
}

// ── Skeleton Block ────────────────────────────────────────────────────────────

function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const shimmerX = useSharedValue(-300);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(300, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View style={[skeletonStyles.block, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, skeletonStyles.highlight, shimmerStyle]} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  block: {
    backgroundColor: SHIMMER_BASE,
    borderRadius: 4,
    overflow: 'hidden',
  },
  highlight: {
    backgroundColor: SHIMMER_HIGHLIGHT,
    width: 200,
  },
});

// ── Routine Card ──────────────────────────────────────────────────────────────

interface RoutineCardProps {
  item: NonFeaturedRoutine;
  index: number;
  cardWidth: number;
  isLast: boolean;
  textPrimary: string;
  textMuted: string;
  animateOnMount: boolean;
  onPress: () => void;
}

function RoutineCard({ item, index, cardWidth, isLast, textPrimary, textMuted, animateOnMount, onPress }: RoutineCardProps) {
  // Snapshot at mount time so filter-change remounts don't re-animate
  const shouldAnimate = useRef(animateOnMount);
  const translateX = useSharedValue(shouldAnimate.current ? 60 : 0);
  const cardOpacity = useSharedValue(shouldAnimate.current ? 0 : 1);

  useEffect(() => {
    if (shouldAnimate.current) {
      const delay = index * 100;
      translateX.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
      cardOpacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    RNAnimated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scaleAnim, { toValue: 1.0, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`routine-card-${item.id}`}
      >
        <RNAnimated.View
          style={[
            styles.routineCard,
            {
              width: cardWidth,
              backgroundColor: item.background_color ?? colors.surface,
              marginRight: isLast ? SCREEN_H_PAD : CARD_GAP,
            },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.routineCardImage}
              contentFit="cover"
            />
          ) : null}
          <View style={styles.routineCardContent}>
            <SubtitleBold style={{ color: textPrimary }}>
              {item.title}
            </SubtitleBold>
            <Label style={{ color: textMuted }}>
              {item.duration_minutes} MIN
              {item.pressure_level ? ` \\ ${item.pressure_level.toUpperCase()}` : null}
            </Label>
          </View>
        </RNAnimated.View>
      </Pressable>
    </Animated.View>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { textPrimary, textMuted } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [featuredRoutine, setFeaturedRoutine] = useState<FeaturedRoutine | null>(null);
  const [nonFeaturedRoutines, setNonFeaturedRoutines] = useState<NonFeaturedRoutine[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [cardSize, setCardSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dataJustLoaded, setDataJustLoaded] = useState(false);
  const [checksLoaded, setChecksLoaded] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);

  // ── Border animation ──
  const progress = useSharedValue(0);
  const borderOpacity = useSharedValue(0);
  const perimeterSV = useSharedValue(0);

  // ── Featured card entry ──
  const featuredEntryOpacity = useSharedValue(0);
  const featuredImageOpacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false,
    );
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  useEffect(() => {
    perimeterSV.value = 2 * (cardSize.width + cardSize.height);
  }, [cardSize.width, cardSize.height]);

  useEffect(() => {
    if (!isLoading && featuredRoutine) {
      featuredEntryOpacity.value = withTiming(1, { duration: 400 });
      featuredImageOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    }
  }, [isLoading, featuredRoutine]);

  const glowAnimProps = useAnimatedProps(() => ({
    strokeDashoffset: -progress.value * perimeterSV.value,
    strokeOpacity: borderOpacity.value * 0.12,
  }));

  const featuredAnimStyle = useAnimatedStyle(() => ({
    opacity: featuredEntryOpacity.value,
  }));

  const featuredImageAnimStyle = useAnimatedStyle(() => ({
    opacity: featuredImageOpacity.value,
  }));

  useEffect(() => {
    async function fetchFeaturedAndNonFeatured() {
      const [featuredResult, nonFeaturedResult] = await Promise.all([
        supabase
          .from('routines')
          .select('*')
          .eq('is_published', true)
          .eq('featured', true)
          .limit(1)
          .single(),
        supabase
          .from('routines')
          .select('*')
          .eq('is_published', true)
          .eq('featured', false)
          .order('sort_order', { ascending: true }),
      ]);
      if (featuredResult.data) {
        setFeaturedRoutine(featuredResult.data as FeaturedRoutine);
      }
      if (nonFeaturedResult.data) {
        setNonFeaturedRoutines(nonFeaturedResult.data as NonFeaturedRoutine[]);
      }
      setIsLoading(false);
      setDataJustLoaded(true);
      // Reset after entry animations finish (max stagger + duration)
      setTimeout(() => setDataJustLoaded(false), 1000);
    }
    fetchFeaturedAndNonFeatured();
  }, []);

  const filteredRoutines = nonFeaturedRoutines.filter((r) => {
    if (activeFilter === 'all') return true;
    if (!r.tags || r.tags.length === 0) return false;
    return r.tags.includes(activeFilter);
  });

  const CARD_WIDTH = Math.round(windowWidth * 0.70);
  const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function loadAccessState() {
        // PAYWALL_ENABLED = false: always renders State A. No locked routines, no upgrade banner.
        // To restore: set PAYWALL_ENABLED = true in constants/flags.ts
        if (!PAYWALL_ENABLED) {
          setIsSubscriber(true);
          setTrialUsed(false);
          setChecksLoaded(true);
          return;
        }
        // Small delay on focus so the RC SDK has time to settle after a purchase
        await new Promise(resolve => setTimeout(resolve, 500));
        if (cancelled) return;
        const [rcResult, storedTrial] = await Promise.all([
          getCustomerInfo(),
          AsyncStorage.getItem('trial_session_used'),
        ]);
        if (cancelled) return;
        if (rcResult.ok) {
          setIsSubscriber(Boolean(rcResult.data.entitlements.active?.['premium']));
        }
        setTrialUsed(storedTrial === 'true');
        setChecksLoaded(true);
      }
      loadAccessState();
      return () => { cancelled = true; };
    }, [])
  );

  const handleRoutinePress = useCallback((routineId: string) => {
    if (!checksLoaded || isSubscriber || !trialUsed) {
      router.push(`/routine/${routineId}`);
    } else {
      RevenueCatUI.presentPaywall();
    }
  }, [checksLoaded, isSubscriber, trialUsed]);

  const renderRoutineCard = useCallback(({ item, index }: { item: NonFeaturedRoutine; index: number }) => (
    <RoutineCard
      item={item}
      index={index}
      cardWidth={CARD_WIDTH}
      isLast={index === filteredRoutines.length - 1}
      textPrimary={textPrimary}
      textMuted={textMuted}
      animateOnMount={dataJustLoaded}
      onPress={() => handleRoutinePress(item.id)}
    />
  ), [filteredRoutines.length, CARD_WIDTH, textPrimary, textMuted, dataJustLoaded, handleRoutinePress]);

  const perimeter = 2 * (cardSize.width + cardSize.height);
  const rectInset = BORDER_STROKE / 2;
  const rectW = cardSize.width - BORDER_STROKE;
  const rectH = cardSize.height - BORDER_STROKE;

  return (
    <View style={styles.container} testID="home-screen">
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <HeadRubIcon size={36} color={textPrimary} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <AccessibilityMenu />
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              testID="settings-button"
            >
              <MoreHorizontal size={22} color={textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Featured card */}
      <View style={styles.featuredCardWrapper}>
        <Label style={[styles.featuredLabel, { color: textMuted }]}>FEATURED</Label>

        {isLoading ? (
          // Skeleton featured card
          <View style={[styles.featuredCard, { backgroundColor: SHIMMER_BASE }]}>
            <View style={styles.featuredContent}>
              <View style={[styles.featuredTop, { gap: 12 }]}>
                <SkeletonBlock style={{ height: 28, width: '75%' }} />
                <SkeletonBlock style={{ height: 18, width: '60%' }} />
                <SkeletonBlock style={{ height: 12, width: '35%' }} />
              </View>
              <SkeletonBlock style={{ height: 44, width: 110, borderRadius: 8 }} />
            </View>
          </View>
        ) : featuredRoutine ? (
          // Real card with fade-in entry
          <Animated.View
            testID="featured-card"
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setCardSize({ width, height });
            }}
            style={[
              styles.featuredCard,
              { backgroundColor: featuredRoutine.background_color ?? colors.surface },
              featuredAnimStyle,
            ]}
          >
            {(featuredRoutine.featured_image_url ?? featuredRoutine.image_url) ? (
              <Animated.View style={[styles.featuredImage, featuredImageAnimStyle]}>
                <Image
                  source={{ uri: (featuredRoutine.featured_image_url ?? featuredRoutine.image_url)! }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            ) : null}
            <View style={styles.featuredContent}>
              <View style={styles.featuredTop}>
                <Subheadline style={{ color: textPrimary }}>
                  {featuredRoutine.title}
                </Subheadline>
                {featuredRoutine.subtitle ? (
                  <Body style={[styles.featuredSubtitle, { color: textPrimary }]}>
                    {featuredRoutine.subtitle}
                  </Body>
                ) : null}
                <Label style={[styles.featuredMeta, { color: textMuted }]}>
                  {featuredRoutine.duration_minutes} MIN
                  {featuredRoutine.pressure_level
                    ? ` \\ ${featuredRoutine.pressure_level.toUpperCase()}`
                    : null}
                </Label>
              </View>
              <PrimaryButton
                label="BEGIN"
                onPress={() => handleRoutinePress(featuredRoutine.id)}
                testID="featured-begin-button"
              />
            </View>

            {/* Animated border */}
            {cardSize.width > 0 ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width={cardSize.width} height={cardSize.height}>
                  <AnimatedRect
                    x={rectInset}
                    y={rectInset}
                    width={rectW}
                    height={rectH}
                    rx={BORDER_R}
                    ry={BORDER_R}
                    fill="none"
                    stroke="#E8685D"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={`${perimeter * 0.45} ${perimeter * 0.55}`}
                    animatedProps={glowAnimProps}
                  />
                </Svg>
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </View>

      {/* Filter bar — non-interactive during loading */}
      <View
        style={styles.filterBar}
        testID="filter-bar"
        pointerEvents={isLoading ? 'none' : 'auto'}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                setActiveFilter(f.key);
                setDataJustLoaded(true);
                setTimeout(() => setDataJustLoaded(false), 1000);
              }}
              activeOpacity={0.75}
              testID={`filter-pill-${f.key}`}
              style={[
                styles.filterPill,
                { backgroundColor: isActive ? colors.accentMuted : colors.black },
              ]}
            >
              <Label style={{ color: textPrimary }}>{f.label}</Label>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Routine carousel */}
      {isLoading ? (
        // Skeleton carousel — two placeholder cards
        <View style={[styles.routineFlatList, { flexDirection: 'row', paddingLeft: SCREEN_H_PAD }]}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                styles.routineCard,
                {
                  width: CARD_WIDTH,
                  backgroundColor: SHIMMER_BASE,
                  marginRight: CARD_GAP,
                  overflow: 'hidden',
                },
              ]}
            >
              <View style={[styles.routineCardContent, { gap: 8 }]}>
                <SkeletonBlock style={{ height: 18, width: 120 }} />
                <SkeletonBlock style={{ height: 12, width: 80 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredRoutines}
          keyExtractor={(item) => `${activeFilter}-${item.id}`}
          renderItem={renderRoutineCard}
          horizontal
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: SCREEN_H_PAD }}
          style={styles.routineFlatList}
          testID="routine-flatlist"
        />
      )}

      {/* Subscription status strip — always rendered to preserve layout height */}
      <View style={[styles.statusStrip, { paddingBottom: insets.bottom || 16 }]} testID="subscription-status">
        {checksLoaded && !isSubscriber ? (
          trialUsed ? (
            <>
              <Label style={{ color: textMuted }}>UNLOCK ALL ROUTINES</Label>
              <TouchableOpacity
                onPress={() => RevenueCatUI.presentPaywall()}
                testID="upgrade-link"
              >
                <LinkText style={{ color: textPrimary }}>Upgrade</LinkText>
              </TouchableOpacity>
            </>
          ) : (
            <Label style={{ color: textMuted }}>1 FREE SESSION AVAILABLE</Label>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  // Featured card
  featuredCardWrapper: {
    flex: 1,
    paddingHorizontal: SCREEN_H_PAD,
    paddingTop: 16,
    paddingBottom: 0,
  },
  featuredLabel: {
    marginBottom: 8,
  },
  featuredCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232, 104, 93, 0.2)',
  },
  featuredImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 280,
    height: 231,
  },
  featuredContent: {
    flex: 1,
    padding: 28,
    justifyContent: 'space-between',
  },
  featuredTop: {
    gap: 8,
    maxWidth: '80%',
  },
  featuredSubtitle: {
    marginTop: 4,
  },
  featuredMeta: {
    marginTop: 4,
  },
  // Filter bar
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: SCREEN_H_PAD,
    paddingTop: 24,
    paddingBottom: 12,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  // Routine carousel
  routineFlatList: {
    flexGrow: 0,
    height: CARD_HEIGHT,
  },
  routineCard: {
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  routineCardImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '55%',
  },
  routineCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 20,
    gap: 4,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_H_PAD,
    paddingTop: 16,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    marginTop: 16,
  },
});
