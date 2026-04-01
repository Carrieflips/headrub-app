import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Label, Body } from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import RevenueCatUI from 'react-native-purchases-ui';
import { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { getCustomerInfo, getOfferings } from '@/lib/revenuecatClient';

function BackHeader() {
  const { textPrimary } = useTheme();
  return (
    <View style={headerStyles.row}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backBtn} hitSlop={8} testID="back-button">
        <ChevronLeft size={28} color={textPrimary} />
      </TouchableOpacity>
      <AccessibilityMenu />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 44, alignItems: 'flex-start' },
});

export default function Plan() {
  const { textPrimary, textMuted } = useTheme();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [activePackage, setActivePackage] = useState<PurchasesPackage | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  async function checkSubscription() {
    const [customerResult, offeringsResult] = await Promise.all([
      getCustomerInfo(),
      getOfferings(),
    ]);

    if (customerResult.ok) {
      setCustomerInfo(customerResult.data);

      // Find the matching package for the active subscription
      if (offeringsResult.ok) {
        const activeProductIds = customerResult.data.activeSubscriptions ?? [];
        const allPackages = offeringsResult.ok
          ? Object.values(offeringsResult.data.all).flatMap(o => o.availablePackages)
          : [];
        const matched = allPackages.find(pkg =>
          activeProductIds.includes(pkg.product.identifier)
        ) ?? null;
        setActivePackage(matched);
      }
    }
    setLoaded(true);
  }

  useEffect(() => {
    checkSubscription();
  }, []);

  const isSubscribed = loaded && customerInfo !== null && Boolean(customerInfo.entitlements.active?.['premium']);

  const formatExpiryDate = (): string => {
    const expiry = customerInfo?.latestExpirationDate;
    if (!expiry) return 'Active';
    const date = new Date(expiry);
    return `Renews ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  const isMonthly = activePackage?.packageType === 'MONTHLY';
  const planName = activePackage?.product?.title ?? activePackage?.packageType ?? null;
  const planPrice = isMonthly ? (activePackage?.product?.priceString ?? null) : null;

  return (
    <View style={styles.root} testID="plan-screen">
      <SafeAreaView edges={['top']}>
        <BackHeader />
      </SafeAreaView>

      <View style={styles.content}>
        {isSubscribed ? (
          <>
            <View style={styles.card} testID="active-plan-card">
              <View style={styles.cardRow}>
                <Label style={[styles.cardTitle, { color: textMuted }]}>ACTIVE PLAN</Label>
                {planPrice ? (
                  <Body style={[styles.planPrice, { color: colors.accent }]}>{planPrice}</Body>
                ) : null}
              </View>
              {planName ? (
                <Body style={[styles.planName, { color: textPrimary }]}>{planName}</Body>
              ) : null}
              <Body style={[styles.cardBody, { color: textMuted }]}>
                {formatExpiryDate()}
              </Body>
            </View>
            <PrimaryButton
              label="Manage Subscription"
              onPress={() => {
                const url = customerInfo?.managementURL ?? 'itms-apps://apps.apple.com/account/subscriptions';
                Linking.openURL(url);
              }}
              testID="manage-subscription-button"
            />
          </>
        ) : (
          <>
            <View style={styles.card} testID="no-plan-card">
              <Label style={[styles.cardTitle, { color: textMuted }]}>NO ACTIVE PLAN</Label>
              <Body style={[styles.cardBody, { color: textPrimary }]}>
                You're on the free tier. Upgrade to unlock all sessions.
              </Body>
            </View>
            <PrimaryButton
              label="View Plans"
              onPress={async () => {
                await RevenueCatUI.presentPaywall();
                await checkSubscription();
              }}
              testID="view-plans-button"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.textPrimary,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: colors.textMuted,
  },
});
