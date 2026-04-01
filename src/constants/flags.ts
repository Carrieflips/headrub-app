// constants/flags.ts
//
// PAYWALL_ENABLED
// ---------------
// Controls all payment, subscription, and entitlement features globally.
//
// false = Free MVP mode. All routines accessible. No paywall, no trial gate,
//         no RevenueCat network calls. EntitlementContext returns isPremium = false
//         immediately without hitting the network.
//
// true  = Full monetization mode. Restores all RevenueCat logic, trial session
//         gate, post-session paywall, upgrade banner, Plan screen, and
//         Restore Purchases link on About.
//
// TO RE-ENABLE PAYMENTS: Set PAYWALL_ENABLED = true, then follow the
// re-enable checklist in HeadRub-Paywall-Re-enable-Spec.md

export const PAYWALL_ENABLED = false;
