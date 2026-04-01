import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  Headline,
  Subtitle,
  Subheading,
  Body,
  Label,
  BigNumber,
} from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// ─── Section block ───────────────────────────────────────────────────────────

interface SectionProps {
  num: string;
  title: string;
  textPrimary: string;
  textMuted: string;
  children: React.ReactNode;
}

function Section({ num, title, textPrimary, textMuted, children }: SectionProps) {
  return (
    <View style={section.row}>
      <BigNumber style={[section.num, { color: textMuted, width: parseInt(num) > 9 ? 56 : 40 }]}>{num}</BigNumber>
      <View style={section.content}>
        <Subheading style={[section.title, { color: textPrimary }]}>{title}</Subheading>
        {children}
      </View>
    </View>
  );
}

const section = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  num: {
    width: 40,
    lineHeight: 56,
    paddingTop: 16,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 10,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const { textPrimary, textMuted } = useTheme();

  return (
    <View style={styles.root} testID="privacy-policy-screen">
      <SafeAreaView edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="back-button"
          >
            <ChevronLeft size={28} color={textPrimary} />
          </TouchableOpacity>
          <AccessibilityMenu />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Label style={[styles.label, { color: textMuted }]}>LAST UPDATED MARCH 2026</Label>
        <Headline style={[styles.headline, { color: textPrimary }]}>Privacy Policy</Headline>
        <Subtitle style={[styles.subtitle, { color: textPrimary }]}>
          What information Head Rub collects, why we collect it, and how it's used.
          (Almost nothing, and we never sell anything.)
        </Subtitle>

        <View style={styles.divider} />

        <Body style={[styles.bodyText, { color: textPrimary }]}>
          Head Rub is published by Carrie Phillips, based in California. By using Head Rub, you agree
          to the practices described in this policy.
        </Body>

        <View style={styles.sectionGap} />

        {/* ── 1 ── */}
        <Section num="1" title="WHO WE ARE" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub is an independent app published by Carrie Phillips, based in California. "We,"
            "our," and "us" in this document refer to Carrie Phillips.
          </Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Questions or requests can be sent to: hello@headrub.app
          </Body>
        </Section>

        {/* ── 2 ── */}
        <Section num="2" title="WHAT WE COLLECT" textPrimary={textPrimary} textMuted={textMuted}>
          <Subheading style={[styles.inlineSub, { color: textMuted }]}>
            Device ID (anonymous identifier)
          </Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            When you first open Head Rub, the app generates a random ID and stores it on your device
            using AsyncStorage. This ID is not linked to your name, Apple ID, email address, or any
            other personal identifier. It is a randomly generated string that exists solely to allow
            us to understand how the app is being used in aggregate.
          </Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            This device ID is used to log anonymous analytics events (see Section 3). It is never
            shared with advertisers and is never used to identify you as an individual.
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>Analytics Events</Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub logs a small number of anonymous usage events to a private Supabase database:
          </Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Session started (which routine, anonymous device ID, timestamp)</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Session completed (completion percentage)</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Session abandoned (which step, completion percentage)</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Session rated (1–5 stars, routine ID, device ID)</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Accessibility mode toggled (to white or to red)</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Narrator thumb-up tapped</Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            None of these events contain your name, location, email address, Apple ID, health
            history, or any other personal information.
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>Feedback</Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            If you submit feedback through the Give Feedback screen in Settings, your message is
            stored in our database alongside your anonymous device ID and a timestamp. Your name and
            contact details are not attached unless you choose to include them in the message text.
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>What We Do Not Collect</Subheading>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Your name</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Your email address</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Your location</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Your Apple ID or any account credentials</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Your health history, diagnoses, or medical information</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Any data from your contacts, calendar, camera, or microphone</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· Any data from other apps on your device</Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub does not request any device permissions beyond what is required to play audio.
          </Body>
        </Section>

        {/* ── 3 ── */}
        <Section num="3" title="HOW WE USE WHAT WE COLLECT" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            The anonymous analytics data described above is used only to understand how the app is
            being used — which routines are popular, where sessions tend to end. This helps us
            improve the app. It is never used to identify individual users,
            never sold, never shared with advertisers.
          </Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Feedback submissions are read by the developer (Carrie) and may be used to inform
            product decisions. They are never shared publicly without your permission.
          </Body>
        </Section>

        {/* ── 4 ── */}
        <Section num="4" title="THIRD-PARTY SERVICES" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub uses a small number of third-party services to function. Each is described below:
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>Supabase</Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Supabase provides the database that stores anonymous analytics events and feedback
            submissions. Supabase is hosted in the United States. Supabase's privacy policy is
            available at supabase.com/privacy.
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>Apple App Store</Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub is distributed through the Apple App Store. Apple may collect certain
            information as part of the download and installation process. Apple's privacy policy
            governs that collection: apple.com/legal/privacy.
          </Body>

          <Subheading style={[styles.inlineSub, { color: textMuted }]}>headrub.app Website</Subheading>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            The Head Rub website uses basic, anonymous analytics (no advertising trackers, no
            third-party pixels) to understand how many people visit and where they come from. No
            personal information is collected through the website.
          </Body>
        </Section>

        {/* ── 5 ── */}
        <Section num="5" title="DATA STORAGE AND SECURITY" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Anonymous analytics data is stored in a Supabase database with access restricted to the
            developer. Data is stored in the United States. We apply reasonable technical safeguards,
            but no data transmission or storage system can be guaranteed completely secure.
          </Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Your device ID and accessibility preference are stored locally on your device using
            AsyncStorage and never leave your device except as part of the anonymous event logs
            described above.
          </Body>
        </Section>

        {/* ── 6 ── */}
        <Section num="6" title="CHILDREN'S PRIVACY" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Head Rub is intended for users aged 13 and older. We do not knowingly collect any
            information from children under 13. If you believe a child under 13 has used the app,
            please contact us at hello@headrub.app and we will take appropriate steps.
          </Body>
        </Section>

        {/* ── 7 ── */}
        <Section num="7" title="YOUR RIGHTS" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Because we collect no personal information tied to your identity, most data rights
            requests do not apply in the traditional sense — we have no way to identify which data
            belongs to you. However:
          </Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· You can clear your local device ID at any time by deleting and reinstalling the app. A new anonymous ID will be generated.</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· If you submitted feedback and would like it removed, contact us at hello@headrub.app and we will delete it.</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· If you are a California resident, you have rights under the CCPA. Because we do not collect personal information linked to your identity, most CCPA rights do not apply. We do not sell personal information. We do not share personal information with advertisers. For any CCPA inquiry, contact hello@headrub.app.</Body>
          <Body style={[styles.bullet, { color: textPrimary }]}>· If you are in the European Economic Area, UK, or Switzerland, GDPR principles apply. Because we do not collect identifiable personal data, there is minimal GDPR exposure. For any inquiry, contact hello@headrub.app.</Body>
        </Section>

        {/* ── 8 ── */}
        <Section num="8" title="CHANGES TO THIS POLICY" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            If we make material changes to this policy, we will update the date at the top and,
            where appropriate, provide notice within the app. Continued use of Head Rub after a
            policy update constitutes acceptance of the updated terms.
          </Body>
        </Section>

        {/* ── 9 ── */}
        <Section num="9" title="CONTACT" textPrimary={textPrimary} textMuted={textMuted}>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Questions about this Privacy Policy should be directed to:
          </Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>hello@headrub.app</Body>
          <Body style={[styles.bodyText, { color: textPrimary }]}>
            Carrie Phillips is based in California, United States.
          </Body>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  label: {
    marginBottom: 12,
  },
  headline: {
    marginBottom: 14,
  },
  subtitle: {
    marginBottom: 28,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: 32,
  },
  sectionGap: {
    height: 40,
  },
  bodyText: {
    marginBottom: 12,
  },
  inlineSub: {
    marginTop: 16,
    marginBottom: 6,
  },
  bullet: {
    marginBottom: 4,
    paddingLeft: 4,
  },
});
