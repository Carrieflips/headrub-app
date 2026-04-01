import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import {
  getCustomerInfo,
  getOfferings,
  restorePurchases as rcRestorePurchases,
} from '@/lib/revenuecatClient';
import { PAYWALL_ENABLED } from '@/constants/flags';

type EntitlementContextValue = {
  isPremium: boolean;
  restorePurchases: () => Promise<void>;
  showPaywall: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementContextValue>({
  isPremium: false,
  restorePurchases: async () => {},
  showPaywall: async () => {},
});

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const refreshEntitlement = useCallback(async () => {
    // PAYWALL_ENABLED = false: skips RevenueCat network call, returns isPremium = false.
    // To restore: set PAYWALL_ENABLED = true in constants/flags.ts
    if (!PAYWALL_ENABLED) {
      setIsPremium(false);
      return;
    }
    const result = await getCustomerInfo();
    if (result.ok) {
      setIsPremium(Boolean(result.data.entitlements.active?.['premium']));
    }
  }, []);

  useEffect(() => {
    refreshEntitlement();
  }, [refreshEntitlement]);

  const restorePurchases = useCallback(async () => {
    const result = await rcRestorePurchases();
    if (result.ok) {
      setIsPremium(Boolean(result.data.entitlements.active?.['premium']));
    }
  }, []);

  const showPaywall = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      const offeringsResult = await getOfferings();
      if (offeringsResult.ok) {
        const offering =
          offeringsResult.data.all?.['default'] ??
          offeringsResult.data.current ??
          undefined;
        await RevenueCatUI.presentPaywall(offering ? { offering } : undefined);
      } else {
        await RevenueCatUI.presentPaywall();
      }
    } catch (e) {
      console.warn('[showPaywall]', e);
    }
    // Always refresh entitlement after the paywall is dismissed
    await refreshEntitlement();
  }, [refreshEntitlement]);

  return (
    <EntitlementContext.Provider value={{ isPremium, restorePurchases, showPaywall }}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  return useContext(EntitlementContext);
}

export { EntitlementContext };
