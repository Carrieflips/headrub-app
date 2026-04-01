import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import {
  Headline,
  Subtitle,
  Subheading,
  Body,
  Label,
  ButtonText,
  LinkText,
  Disclaimer,
} from '@/components/Text';
import { colors } from '@/constants/colors';
import { logEvent } from '@/lib/analytics';

export default function Paywall() {
  const { trigger = 'launch' } = useLocalSearchParams<{ trigger?: string }>();

  useEffect(() => {
    logEvent('paywall_viewed', { trigger });
  }, [trigger]);

  function handlePurchase() {
    Alert.alert('RevenueCat not configured yet');
  }

  function handleRestore() {
    Alert.alert('RevenueCat not configured yet');
  }

  return (
    <View style={styles.root} testID="paywall-screen">
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.dismissBtn}
            hitSlop={8}
            testID="paywall-dismiss-button"
          >
            <X size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <AccessibilityMenu />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wordmark */}
        <View style={styles.wordmarkBlock}>
          <Headline style={styles.wordmark}>HEAD RUB</Headline>
          <Subtitle style={styles.subtitle}>Unlimited access to every session</Subtitle>
        </View>

        {/* Pricing Cards */}
        <View style={styles.cardsContainer}>
          {/* Annual — Featured */}
          <View style={[styles.card, styles.cardAnnual]} testID="paywall-annual-card">
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Subheading style={styles.badgeText}>BEST VALUE</Subheading>
              </View>
            </View>
            <Headline style={styles.price}>$1.99</Headline>
            <Body style={styles.billingNote}>/month · billed $23.99/year</Body>
          </View>

          {/* Monthly */}
          <View style={[styles.card, styles.cardMonthly]} testID="paywall-monthly-card">
            <Headline style={styles.price}>$4.99</Headline>
            <Body style={styles.billingNote}>/month · billed monthly</Body>
          </View>
        </View>

        {/* Trial label */}
        <Label style={styles.trialLabel}>7-DAY FREE TRIAL — CANCEL ANY TIME</Label>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          activeOpacity={0.85}
          testID="paywall-cta-button"
        >
          <ButtonText style={styles.ctaText}>Start your 7-day free trial</ButtonText>
        </TouchableOpacity>

        <Disclaimer style={styles.disclaimer}>
          After your free trial, you'll be charged the plan rate above. Cancel any time in iOS Settings.
        </Disclaimer>

        <TouchableOpacity
          onPress={handleRestore}
          style={styles.restoreBtn}
          testID="paywall-restore-button"
        >
          <LinkText style={styles.restoreText}>Restore Purchases</LinkText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeTop: {
    alignItems: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  dismissBtn: {
    padding: 16,
    paddingRight: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  wordmarkBlock: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  wordmark: {
    color: colors.textPrimary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  cardAnnual: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  cardMonthly: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.textOnDark,
    fontSize: 10,
  },
  price: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  billingNote: {
    color: colors.textMuted,
  },
  trialLabel: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    color: colors.textOnDark,
  },
  disclaimer: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    color: colors.accent,
  },
});
