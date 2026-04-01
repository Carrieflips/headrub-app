import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Body, Label } from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntitlement } from '@/contexts/EntitlementContext';
import { logEvent } from '@/lib/analytics';
import { PAYWALL_ENABLED } from '@/constants/flags';
import LightSensitivitySlider from '@/components/LightSensitivitySlider';

export default function Settings() {
  const { textPrimary, textMuted, accentHex } = useTheme();
  const { isPremium } = useEntitlement();
  const [narratorThanked, setNarratorThanked] = useState(false);

  function handleNarratorThumbsUp() {
    if (narratorThanked) return;
    setNarratorThanked(true);
    logEvent('narrator_thumbed_up');
    setTimeout(() => setNarratorThanked(false), 2000);
  }

  const rowStyle = [styles.row, { borderBottomColor: colors.surfaceBorder }];

  return (
    <View style={styles.container} testID="settings-screen">
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            testID="back-button"
            style={styles.backBtn}
          >
            <ChevronLeft size={28} color={accentHex} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Group 1 — THIS APP */}
        <Label style={[styles.groupLabel, { color: textMuted }]}>
          THIS APP
        </Label>

        <TouchableOpacity
          style={rowStyle}
          onPress={() => router.push('/settings/about')}
          activeOpacity={0.7}
          testID="row-about"
        >
          <Body style={{ color: textPrimary }}>About</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        {/* PAYWALL_ENABLED = false: Plan screen hidden from nav.
            To restore: set PAYWALL_ENABLED = true in constants/flags.ts */}
        {PAYWALL_ENABLED ? (
          <TouchableOpacity
            style={rowStyle}
            onPress={() => router.push('/settings/plan')}
            activeOpacity={0.7}
            testID="row-plan"
          >
            <Body style={{ color: textPrimary }}>Plan</Body>
            <ChevronRight size={16} color={textMuted} />
          </TouchableOpacity>
        ) : null}

        {isPremium === true && (
          <TouchableOpacity
            style={rowStyle}
            onPress={() => Linking.openURL('itms-apps://apps.apple.com/account/subscriptions')}
            activeOpacity={0.7}
            testID="row-manage-subscription"
          >
            <Body style={{ color: textPrimary }}>Manage Subscription</Body>
            <ChevronRight size={16} color={textMuted} />
          </TouchableOpacity>
        )}

        {/* Group 2 — ADJUST ACCENT COLOR */}
        <Label style={[styles.groupLabel, { color: textMuted }]}>
          ADJUST ACCENT COLOR
        </Label>

        <LightSensitivitySlider />

        {/* Group 3 — COMMUNITY */}
        <Label style={[styles.groupLabel, { color: textMuted }]}>
          COMMUNITY
        </Label>

        <TouchableOpacity
          style={rowStyle}
          onPress={() =>
            Share.share({
              message:
                "I've been using Head Rub for guided head massage, and think you should give it a try. https://headrub.app",
            })
          }
          activeOpacity={0.7}
          testID="row-share"
        >
          <Body style={{ color: textPrimary }}>Share</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={rowStyle}
          onPress={() => router.push('/settings/feedback')}
          activeOpacity={0.7}
          testID="row-feedback"
        >
          <Body style={{ color: textPrimary }}>Give Feedback</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={rowStyle}
          onPress={handleNarratorThumbsUp}
          activeOpacity={0.7}
          testID="row-narrator"
        >
          <Body style={{ color: textPrimary }}>
            {narratorThanked ? 'Narrator appreciated ✓' : 'Thumbs Up the Narrator'}
          </Body>
        </TouchableOpacity>

        <TouchableOpacity
          style={rowStyle}
          onPress={() => Linking.openURL('mailto:hello@headrub.app')}
          activeOpacity={0.7}
          testID="row-support"
        >
          <Body style={{ color: textPrimary }}>Contact Support</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        {/* Group 4 — LEGAL */}
        <Label style={[styles.groupLabel, { color: textMuted }]}>
          LEGAL
        </Label>

        <TouchableOpacity
          style={rowStyle}
          onPress={() => router.push('/settings/health')}
          activeOpacity={0.7}
          testID="row-health"
        >
          <Body style={{ color: textPrimary }}>Health &amp; Safety</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={rowStyle}
          onPress={() => router.push('/settings/terms')}
          activeOpacity={0.7}
          testID="row-terms"
        >
          <Body style={{ color: textPrimary }}>Terms of Use</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/settings/privacy')}
          activeOpacity={0.7}
          testID="row-privacy"
        >
          <Body style={{ color: textPrimary }}>Privacy Policy</Body>
          <ChevronRight size={16} color={textMuted} />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    alignItems: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  groupLabel: {
    paddingTop: 32,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  bottomSpacer: {
    height: 48,
  },
});
